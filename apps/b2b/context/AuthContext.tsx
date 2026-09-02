'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth, db, login as firebaseLogin, logout as firebaseLogout, signupB2B, doc, getDoc } from '@meybeauty/firebase';

import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

interface User {
  id: string;
  email: string | null;
  nom: string | null;
  prenom: string | null;
  societe: string | null;
  siret: string | null;
  validated: boolean;
  remise: number;
  role: 'b2b';
}

interface RegisterData {
  email: string;
  password: string;
  societe?: string;
  company?: string;
  siret?: string;
  nom?: string;
  prenom?: string;
  phone?: string;
  address?: string;
  zip_code?: string;
  postalCode?: string;
  city?: string;
  activity_type?: string;
  activityType?: string;
  kbisUrl?: string;
  idUrl?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mapUser = async (firebaseUser: FirebaseUser): Promise<User | null> => {
  const snap = await getDoc(doc(db, 'users', firebaseUser.uid));
  if (!snap.exists()) return null;
  const data = snap.data();
  const role = (data?.role as string | undefined)?.toLowerCase();
  if (role !== 'b2b') return null;

  const prenom = (data.prenom as string | undefined) ?? (data.firstName as string | undefined) ?? null;
  const nom = (data.nom as string | undefined) ?? (data.lastName as string | undefined) ?? null;
  const societe = (data.societe as string | undefined) ?? (data.company as string | undefined) ?? null;

  return {
    id: firebaseUser.uid,
    email: firebaseUser.email,
    nom,
    prenom,
    societe,
    siret: (data.siret as string | undefined) ?? null,
    validated: Boolean(data.validated),
    remise: (data.remise as number | undefined) ?? 0,
    role: 'b2b',
  };
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setIsLoading(false);
        return;
      }
      try {
        const mapped = await mapUser(firebaseUser);
        setUser(mapped);
      } catch (e) {
        console.error('AuthContext: error while mapping user', e);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    });
    return () => unsub();
  }, []);

  const login = async (email: string, password: string) => {
    const fbUser = await firebaseLogin(email, password);
    const mapped = await mapUser(fbUser);
    if (!mapped) {
      // utilisateur non-b2b : on se déconnecte pour éviter des états incohérents
      await firebaseLogout();
      throw new Error('User is not B2B or missing profile data');
    }
    setUser(mapped);
    return mapped;
  };

  const logout = async () => {
    await firebaseLogout();
    setUser(null);
  };

  const register = async (data: RegisterData) => {
    const fbUser = await signupB2B({
      email: data.email,
      password: data.password,
      company: data.societe ?? data.company,
      siret: data.siret,
      contactName: data.nom && data.prenom ? `${data.prenom} ${data.nom}` : data.nom ?? undefined,
      phone: data.phone,
      firstName: data.prenom,
      lastName: data.nom,
      address: data.address,
      postalCode: data.zip_code ?? data.postalCode,
      city: data.city,
      activityType: data.activity_type ?? data.activityType,
      kbisUrl: data.kbisUrl,
      idUrl: data.idUrl,
    });

    const mapped = await mapUser(fbUser);
    setUser(mapped);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}