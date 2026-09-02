'use client';

import { useState, useEffect } from 'react';
import { auth, db, doc, getDoc } from '@meybeauty/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

interface AdminUser {
    id: string;
    email: string | null;
    role: 'admin';
    firstName?: string;
    lastName?: string;
}

export function useAdminAuth() {
    const [user, setUser] = useState<AdminUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
            if (!firebaseUser) {
                setUser(null);
                setLoading(false);
                return;
            }

            try {
                const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    if (data.role === 'admin') {
                        setUser({
                            id: firebaseUser.uid,
                            email: firebaseUser.email,
                            role: 'admin',
                            firstName: data.firstName || data.prenom,
                            lastName: data.lastName || data.nom,
                        });
                    } else {
                        console.warn('User is authenticated but does not have the admin role.');
                        setUser(null);
                    }
                } else {
                    console.error('User profile not found in Firestore.');
                    setUser(null);
                }
            } catch (error) {
                console.error('Error fetching user profile:', error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        });

        return () => unsub();
    }, []);

    return { user, loading };
}
