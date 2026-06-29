import { useState, useEffect, useCallback } from 'react';
import { SidanusDB } from '../db/sidanusDB';

export function useStudents() {
  const [students, setStudents] = useState([]);

  const refresh = useCallback(() => {
    setStudents(SidanusDB.getStudents());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const updateStudent = async (nim, updates) => {
    const success = SidanusDB.updateStudent(nim, updates);
    if (success) refresh();
    return success;
  };

  const getStudent = (nim) => SidanusDB.getStudent(nim);

  return { students, refresh, updateStudent, getStudent };
}
