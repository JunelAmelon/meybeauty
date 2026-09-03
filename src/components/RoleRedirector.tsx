"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db, doc, getDoc } from '@meybeauty/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function RoleRedirector() {
  const router = useRouter();
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const snap = await getDoc(doc(db, 'users', user.uid));
          const role = snap.exists() ? (snap.data().role as string | undefined) : undefined;
          const path = window.location.pathname;
          if (role === 'admin' && !path.startsWith('/admin')) {
            router.replace('/admin');
          }
          if (role === 'b2b' && !path.startsWith('/pro')) {
            router.replace('/pro');
          }
          if (role !== 'admin' && path.startsWith('/admin')) {
            router.replace('/');
          }
          if (role !== 'b2b' && path.startsWith('/pro')) {
            router.replace('/');
          }
        } catch {}
      }
    });
    return () => unsub();
  }, [router]);
  return null;
}
