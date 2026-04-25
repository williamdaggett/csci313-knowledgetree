import { Injectable } from '@angular/core';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';

import { AppUser } from '../models/user';

import { auth, db } from '../../../firebase.config';
import { doc, getDoc, setDoc } from 'firebase/firestore';

import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userSubject = new BehaviorSubject<AppUser | null>(null);
  user$ = this.userSubject.asObservable();

  constructor() {
    onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        this.userSubject.next(null);
        return;
      }

      const profile = await this.getUserProfile(firebaseUser.uid);

      this.userSubject.next({
        uid: firebaseUser.uid,
        email: firebaseUser.email ?? '',
        emailVerified: firebaseUser.emailVerified,
        name: profile?.name ?? '',
        providers: firebaseUser.providerData.map((p) => ({
          provider: p.providerId.includes('google') ? 'google' : 'local',
          providerId: p.providerId,
        })),
      });
    });
  }

  // 🔐 LOGIN
  login(email: string, password: string) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  // 🆕 REGISTER + PROFILE CREATION
  async register(email: string, password: string, displayName: string) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);

    await setDoc(doc(db, 'users', cred.user.uid), {
      uid: cred.user.uid,
      email,
      emailVerified: cred.user.emailVerified,
      name,
      providers: cred.user.providerData ?? [],
    });

    return cred;
  }

  // 🚪 LOGOUT
  logout() {
    return signOut(auth);
  }

  // 👤 GET PROFILE
  async getUserProfile(uid: string) {
    const ref = doc(db, 'users', uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) return null;

    return snap.data() as AppUser;
  }
}
