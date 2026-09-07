'use server';

import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@meybeauty/firebase/admin';

// Route temporaire — à supprimer après usage.
// Renomme un utilisateur Firebase Auth (email + mot de passe)
// + synchronise l'email dans Firestore (collection users).
// Si le newEmail existe déjà (ex: créé par erreur par le seed), le supprime d'abord.

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const oldEmail = body?.oldEmail;
    const newEmail = body?.newEmail;
    const newPassword = body?.newPassword;

    if (!oldEmail || !newEmail || !newPassword) {
      return NextResponse.json(
        { ok: false, error: 'oldEmail, newEmail et newPassword sont requis' },
        { status: 400 }
      );
    }

    if (!adminAuth || !adminDb) {
      return NextResponse.json(
        { ok: false, error: 'Admin SDK non configuré (FIREBASE_ADMIN manquant)' },
        { status: 500 }
      );
    }

    // 1. Vérifier si newEmail existe déjà (ex: compte admin créé par erreur par le seed)
    let deletedConflicting = false;
    try {
      const existingUser = await adminAuth.getUserByEmail(newEmail);
      // Vérifier son rôle dans Firestore
      const existingDoc = await adminDb.collection('users').doc(existingUser.uid).get();
      const existingRole = existingDoc.exists ? existingDoc.data()?.role : undefined;

      if (existingUser.email !== oldEmail) {
        // C'est un compte différent qui occupe déjà cet email → on le supprime
        await adminAuth.deleteUser(existingUser.uid);
        if (existingDoc.exists) {
          await adminDb.collection('users').doc(existingUser.uid).delete();
        }
        deletedConflicting = true;
        console.log(`Compte conflit supprimé : ${newEmail} (rôle: ${existingRole})`);
      }
    } catch {
      // newEmail n'existe pas → parfait, on continue
    }

    // 2. Trouver l'utilisateur à renommer par son ancien email
    let userRecord;
    try {
      userRecord = await adminAuth.getUserByEmail(oldEmail);
    } catch {
      return NextResponse.json(
        { ok: false, error: `Aucun utilisateur trouvé avec l'email ${oldEmail}` },
        { status: 404 }
      );
    }

    // 3. Mettre à jour l'email et le mot de passe dans Firebase Auth
    await adminAuth.updateUser(userRecord.uid, {
      email: newEmail,
      password: newPassword,
    });

    // 4. Synchroniser l'email dans Firestore (collection users) — préserver le rôle existant
    const userRef = adminDb.collection('users').doc(userRecord.uid);
    const userDoc = await userRef.get();
    if (userDoc.exists) {
      await userRef.set({ email: newEmail }, { merge: true });
    }

    return NextResponse.json({
      ok: true,
      message: `Utilisateur mis à jour : ${oldEmail} → ${newEmail}`,
      uid: userRecord.uid,
      deletedConflicting,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
