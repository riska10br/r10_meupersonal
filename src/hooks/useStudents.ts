import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../auth/firebase';
import { Student } from '../types';
import { useAuth } from '../auth/AuthContext';
import { handleFirestoreError, OperationType } from '../auth/firestoreErrorHandler';

export const useStudents = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setStudents([]);
      setLoading(false);
      return;
    }

    let q;
    if (user.role === 'admin' || user.role === 'adm_academia') {
        q = query(collection(db, 'students'));
    } else {
        q = query(collection(db, 'students'), where('personalId', '==', user.id));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dbStudents: Student[] = [];
      snapshot.forEach((doc) => {
        dbStudents.push({ id: doc.id, ...doc.data() } as Student);
      });
      setStudents(dbStudents);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'students');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const addStudent = async (student: Student) => {
    try {
      const studentData = { ...student };
      if (user?.role === 'personal') {
          studentData.personalId = user.id;
      }
      await setDoc(doc(db, 'students', student.id), studentData);
    } catch (error) {
       handleFirestoreError(error, OperationType.CREATE, `students/${student.id}`);
    }
  };

  const updateStudent = async (student: Student) => {
    try {
      const studentData = { ...student };
      if (user?.role === 'personal') {
          studentData.personalId = user.id;
      }
      await setDoc(doc(db, 'students', student.id), studentData, { merge: true });
    } catch (error) {
       handleFirestoreError(error, OperationType.UPDATE, `students/${student.id}`);
    }
  };

  const removeStudent = async (studentId: string) => {
    try {
      await deleteDoc(doc(db, 'students', studentId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `students/${studentId}`);
    }
  };

  return { students, loading, addStudent, updateStudent, removeStudent };
};
