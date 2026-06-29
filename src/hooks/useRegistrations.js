import { useState, useEffect, useCallback } from 'react';
import { SidanusDB } from '../db/sidanusDB';

export function useRegistrations(nimFilter = null) {
  const [registrations, setRegistrations] = useState([]);

  const refresh = useCallback(() => {
    let regs = SidanusDB.getRegistrations();
    if (nimFilter) regs = regs.filter(r => r.nim === nimFilter);
    setRegistrations(regs);
  }, [nimFilter]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addRegistration = (registration) => {
    const newReg = SidanusDB.addRegistration(registration);
    refresh();
    return newReg;
  };

  const updateRegistration = (id, updates) => {
    const success = SidanusDB.updateRegistration(id, updates);
    if (success) refresh();
    return success;
  };

  return { registrations, refresh, addRegistration, updateRegistration };
}
