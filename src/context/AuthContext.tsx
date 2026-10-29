import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, Patient, Doctor } from '../types';
import { storage } from '../services/storage';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  patientProfile?: Patient;
  doctorProfile?: Doctor;
  isAuthenticated: boolean;
  login: (email: string, role?: UserRole) => boolean;
  register: (name: string, email: string, role: UserRole, extra?: any) => boolean;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  updateUserProfile: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CURRENT_USER_KEY = 'carepulse_active_user_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(CURRENT_USER_KEY);
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {
        // Fallback to default patient
        setDefaultPatient();
      }
    } else {
      // Default to Sarah Jenkins (Patient) for an instant rich experience
      setDefaultPatient();
    }
  }, []);

  const setDefaultPatient = () => {
    const users = storage.getUsers();
    const patUser = users.find((u) => u.role === 'patient') || users[0];
    if (patUser) {
      setUser(patUser);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(patUser));
    }
  };

  const login = (email: string, preferredRole?: UserRole): boolean => {
    const users = storage.getUsers();
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      setUser(found);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(found));
      storage.recordAudit({
        actorId: found.id,
        actorName: found.name,
        actorRole: found.role,
        action: 'USER_LOGIN',
        resourceType: 'User',
        resourceId: found.id,
        description: `User ${found.name} (${found.role}) logged in successfully.`,
        severity: 'info',
      });
      return true;
    }

    // If not found but role specified, create demo user
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: email.split('@')[0].replace(/[._]/g, ' '),
      email,
      role: preferredRole || 'patient',
      createdAt: new Date().toISOString(),
    };
    setUser(newUser);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
    return true;
  };

  const register = (name: string, email: string, role: UserRole, extra?: any): boolean => {
    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      role,
      phone: extra?.phone,
      createdAt: new Date().toISOString(),
    };

    if (role === 'patient') {
      const newPatient: Patient = {
        id: `pat-${Date.now()}`,
        userId: newUser.id,
        name,
        email,
        phone: extra?.phone || '',
        dob: extra?.dob || '1995-01-01',
        gender: extra?.gender || 'other',
        bloodGroup: extra?.bloodGroup || 'O+',
        address: extra?.address || '123 Health Ave',
        emergencyContact: {
          name: extra?.emergencyName || 'Emergency Contact',
          relationship: extra?.emergencyRel || 'Relative',
          phone: extra?.emergencyPhone || '',
        },
        allergies: extra?.allergies ? extra.allergies.split(',').map((s: string) => s.trim()) : [],
        medicalHistory: extra?.medicalHistory ? [extra.medicalHistory] : [],
        createdAt: new Date().toISOString(),
      };
      storage.savePatient(newPatient);
    }

    setUser(newUser);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));

    storage.recordAudit({
      actorId: newUser.id,
      actorName: newUser.name,
      actorRole: newUser.role,
      action: 'USER_REGISTER',
      resourceType: 'User',
      resourceId: newUser.id,
      description: `New ${role} registration completed for ${name} (${email}).`,
      severity: 'info',
    });

    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);
  };

  const switchRole = (newRole: UserRole) => {
    const users = storage.getUsers();
    let target = users.find((u) => u.role === newRole);
    if (!target) {
      if (newRole === 'patient') {
        target = {
          id: 'user-pat-1',
          name: 'Sarah Jenkins',
          email: 'sarah.jenkins@example.com',
          role: 'patient',
          createdAt: new Date().toISOString(),
        };
      } else if (newRole === 'doctor') {
        target = {
          id: 'user-doc-1',
          name: 'Dr. Marcus Vance',
          email: 'marcus.vance@carepulse.hospital',
          role: 'doctor',
          createdAt: new Date().toISOString(),
        };
      } else {
        target = {
          id: 'user-admin-1',
          name: 'Alexander Cross',
          email: 'admin@carepulse.hospital',
          role: 'admin',
          createdAt: new Date().toISOString(),
        };
      }
    }
    setUser(target);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(target));
  };

  const updateUserProfile = (updates: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updated));
  };

  const currentRole: UserRole = user ? user.role : 'patient';

  // Derived profiles
  const patientProfile = user ? storage.getPatients().find((p) => p.userId === user.id || p.email === user.email) : undefined;
  const doctorProfile = user ? storage.getDoctors().find((d) => d.userId === user.id || d.email === user.email) : undefined;

  return (
    <AuthContext.Provider
      value={{
        user,
        role: currentRole,
        patientProfile,
        doctorProfile,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        switchRole,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
