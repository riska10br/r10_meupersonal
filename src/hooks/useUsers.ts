import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, setDoc, deleteDoc, serverTimestamp, updateDoc, getDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signOut, updatePassword, signInWithEmailAndPassword } from 'firebase/auth';
import { db, auth, secondaryAuth } from '../auth/firebase';
import { User, Role } from '../auth/AuthContext';
import { useAuth } from '../auth/AuthContext';
import { handleFirestoreError, OperationType } from '../auth/firestoreErrorHandler';

export const useUsers = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setUsers([]);
      setLoading(false);
      return;
    }

    let q;
    
    if (currentUser.role === 'admin') {
      // Admin global sees everyone
      q = query(collection(db, 'users'));
    } else if (currentUser.role === 'adm_academia') {
      // Adm Academia sees people (Personals and Alunos) linked to their gym, and unlinked students
      q = query(collection(db, 'users'), where('academiaId', 'in', [currentUser.id, null]));
    } else if (currentUser.role === 'personal') {
      // Personal sees their own students
      q = query(collection(db, 'users'), where('personalId', '==', currentUser.id));
    } else {
      // Aluno sees no other users, or just their personal (for chat maybe?)
      // Let's just give them nothing or just themselves
      q = query(collection(db, 'users'), where('id', '==', currentUser.id));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dbUsers: User[] = [];
      snapshot.forEach((doc) => {
        dbUsers.push({ id: doc.id, ...doc.data() } as User);
      });
      setUsers(dbUsers);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'users');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const createUser = async (userData: Partial<User>, passwordToSet: string) => {
    if (!userData.email || !passwordToSet) throw new Error("Email e senha são obrigatórios");
    if (!userData.role) throw new Error("O perfil (role) do usuário é obrigatório ('admin', 'adm_academia', 'personal' ou 'aluno').");
    
    try {
      const email = userData.email.trim();
      // 1. Create auth user with secondary auth to avoid signing out current user
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, passwordToSet);
      await signOut(secondaryAuth); // Immediately sign it out

      const uid = userCredential.user.uid;

      // 2. Add to firestore
      const newUser = {
        ...userData,
        email: email, // update it trimmed
        role: userData.role, // explicitly set role
        senhaAcesso: passwordToSet, // Storing for admin visibility as requested
        createdAt: serverTimestamp(),
      };
      
      await setDoc(doc(db, 'users', uid), newUser);
      return uid;
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
         throw new Error("Este email já está em uso.");
      }
      handleFirestoreError(error, OperationType.CREATE, `users`);
      throw error;
    }
  };

  const updateUserProfile = async (uid: string, data: Partial<User>) => {
    try {
      await setDoc(doc(db, 'users', uid), data, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
    }
  };

  const updateUserPasswordAsAdmin = async (uid: string, email: string, oldPassword: string, newPassword: string, dataToMerge: Partial<User>) => {
    try {
      const cleanEmail = email.trim();
      const cleanOld = oldPassword ? oldPassword.trim() : '';
      const cleanNew = newPassword.trim();
      
      const pOld = cleanOld.length < 6 ? cleanOld.padEnd(6, '0') : cleanOld;
      const pNew = cleanNew.length < 6 ? cleanNew.padEnd(6, '0') : cleanNew;

      let authCreated = false;
      let newAuthUid = uid;

      try {
        // Sign in the target user on secondary auth instance
        const credentials = await signInWithEmailAndPassword(secondaryAuth, cleanEmail, pOld);
        if (credentials.user) {
           await updatePassword(credentials.user, pNew);
           await signOut(secondaryAuth);
        }
      } catch (authErr: any) {
        if (authErr.code === 'auth/invalid-credential' || authErr.code === 'auth/user-not-found') {
          // Fallback: If they were never in Auth or password was lost out of sync, try to recreate them in Auth
          try {
             const cred = await createUserWithEmailAndPassword(secondaryAuth, cleanEmail, pNew);
             newAuthUid = cred.user.uid;
             authCreated = true;
             await signOut(secondaryAuth);
          } catch (createErr: any) {
             if (createErr.code === 'auth/email-already-in-use') {
                 throw new Error("O usuário já existe no sistema Auth com uma senha diferente. Peça para o usuário recuperar a senha na tela de login.");
             }
             throw createErr;
          }
        } else {
          throw authErr;
        }
      }
      
      if (authCreated && newAuthUid !== uid) {
         // Migrate Firestore data to new UID
         const docSnap = await getDoc(doc(db, 'users', uid));
         if (docSnap.exists()) {
             await setDoc(doc(db, 'users', newAuthUid), { ...docSnap.data(), ...dataToMerge, senhaAcesso: pNew }, { merge: true });
             await deleteDoc(doc(db, 'users', uid));
         }

         // Also migrate student profile if it exists
         const studentSnap = await getDoc(doc(db, 'students', uid));
         if (studentSnap.exists()) {
             await setDoc(doc(db, 'students', newAuthUid), studentSnap.data());
             await deleteDoc(doc(db, 'students', uid));
         }
      } else {
         await setDoc(doc(db, 'users', uid), { ...dataToMerge, senhaAcesso: pNew }, { merge: true });
      }

    } catch (error: any) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
      throw error;
    }
  };

  const archiveUserRecord = async (uid: string) => {
    try {
      await updateDoc(doc(db, 'users', uid), { isArchived: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
    }
  };

  const restoreUserRecord = async (uid: string) => {
    try {
      await updateDoc(doc(db, 'users', uid), { isArchived: false });
    } catch (error) {
       handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
    }
  };

  const deleteUserRecord = async (uid: string) => {
    try {
      await deleteDoc(doc(db, 'users', uid));
      // Try to delete their student profile too if it exists
      try { await deleteDoc(doc(db, 'students', uid)); } catch (e) { /* ignore if not exist */ }
    } catch (error) {
       handleFirestoreError(error, OperationType.DELETE, `users/${uid}`);
    }
  };

  return { users, loading, createUser, updateUserProfile, updateUserPasswordAsAdmin, deleteUserRecord, archiveUserRecord, restoreUserRecord };
};
