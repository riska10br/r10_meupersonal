import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, GoogleAuthProvider, signOut, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from './firestoreErrorHandler';

export type Role = 'admin' | 'adm_academia' | 'personal' | 'aluno';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  personalId?: string;
  academiaId?: string | null;
  senhaAcesso?: string;
  isArchived?: boolean;
  photoUrl?: string;
  description?: string;
  weight?: number;
  height?: number;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  switchRole: (role: Role) => void;
  updateUserContext: (data: Partial<User>) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      setLoading(true);
      if (fbUser) {
        try {
          const docRef = doc(db, 'users', fbUser.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const userData = docSnap.data();
            if (userData.isArchived) {
              await signOut(auth);
              setUser(null);
            } else {
              setUser({ id: docSnap.id, ...userData } as User);
            }
          } else {
            // User profile not found in Firestore. Possibly during bootstrap.
            let role: Role = 'aluno';
            let name = fbUser.displayName || 'Demo User';
            if (fbUser.email?.startsWith('admin')) { role = 'admin'; name = 'Admin Global'; }
            else if (fbUser.email?.startsWith('gestor')) { role = 'adm_academia'; name = 'Gestor Demo'; }
            else if (fbUser.email?.startsWith('personal')) { role = 'personal'; name = 'Personal Demo'; }
            else if (fbUser.email?.startsWith('aluno')) { role = 'aluno'; name = 'Aluno Demo'; }

            setUser({ id: fbUser.uid, name, email: fbUser.email || '', role });
            
            if (fbUser.email === 'admin@admin.com') {
              const { setDoc, serverTimestamp } = await import('firebase/firestore');
              try {
                await setDoc(docRef, {
                  role: 'admin',
                  name: 'Admin Global',
                  email: fbUser.email,
                  createdAt: serverTimestamp()
                });
              } catch (e) {
                console.error("Failed to bootstrap admin: ", e);
              }
            }
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${fbUser.uid}`);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    try {
      const cleanEmail = email.trim();
      let cleanPass = pass.trim();
      
      // Override for the default admin account to convert '1234' to '123456'
      if (cleanEmail === 'admin@admin.com' && cleanPass === '1234') {
        cleanPass = '123456';
      }

      // Firebase requires at least 6 characters. Pad if necessary.
      const fbPass = cleanPass.length < 6 ? cleanPass.padEnd(6, '0') : cleanPass;
      
      try {
        const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, fbPass);
        const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.isArchived) {
            await signOut(auth);
            throw new Error("account-archived");
          }
          
          const role = userData.role; // Capturing real role from Firestore
          setUser({ id: userDoc.id, ...userData, role } as User);
        } else {
          // Document does not exist but user signed in successfully.
          if (['admin@admin.com', 'admin@gympro.com', 'gestor@gympro.com', 'personal@gympro.com', 'alunodemo@gympro.com'].includes(cleanEmail)) {
            // Seed role appropriately
            let role: Role = 'aluno';
            if (cleanEmail.startsWith('admin')) role = 'admin';
            if (cleanEmail.startsWith('gestor')) role = 'adm_academia';
            if (cleanEmail.startsWith('personal')) role = 'personal';

            const { setDoc, doc, serverTimestamp } = await import('firebase/firestore');
            await setDoc(doc(db, 'users', userCredential.user.uid), {
              role,
              name: 'Usuário de Teste',
              email: cleanEmail,
              senhaAcesso: pass, // Add the unpadded original pass for display/reference
              createdAt: serverTimestamp()
            });
            setUser({ id: userCredential.user.uid, name: 'Usuário de Teste', email: cleanEmail, role });
          } else {
            throw new Error("auth/user-not-found");
          }
        }
      } catch (signInErr: any) {
        if (signInErr.code === 'auth/user-not-found' || signInErr.code === 'auth/invalid-credential') {
          // Attempt to bootstrap user if it's a demo account
          if (['admin@admin.com', 'admin@gympro.com', 'gestor@gympro.com', 'personal@gympro.com', 'alunodemo@gympro.com'].includes(cleanEmail)) {
            const { createUserWithEmailAndPassword } = await import('firebase/auth');
            try {
              const res = await createUserWithEmailAndPassword(auth, cleanEmail, fbPass);
              
              // Seed role appropriately
              let role = 'aluno';
              if (cleanEmail.startsWith('admin')) role = 'admin';
              if (cleanEmail.startsWith('gestor')) role = 'adm_academia';
              if (cleanEmail.startsWith('personal')) role = 'personal';

              const { setDoc, doc, serverTimestamp } = await import('firebase/firestore');
              await setDoc(doc(db, 'users', res.user.uid), {
                role,
                name: 'Usuário de Teste',
                email: cleanEmail,
                senhaAcesso: pass, // Add the unpadded original pass for display/reference
                createdAt: serverTimestamp()
              });

              return;
            } catch (createErr: any) {
              if (createErr.code === 'auth/email-already-in-use') {
                 throw signInErr; // throw original invalid credential since the account actually exists
              }
              throw createErr;
            }
          }
        }
        throw signInErr;
      }
    } catch (e: any) {
      throw e;
    }
  };

  const switchRole = (role: Role) => {
    if (user) {
      // Mock switch for demo purposes within the UI context
      setUser({ ...user, role });
    }
  };

  const updateUserContext = (data: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...data });
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  if (loading) {
    return <div className="h-screen w-full flex items-center justify-center bg-[#0a0f1c] text-white">Carregando...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, switchRole, updateUserContext, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};


