import { Injectable } from '@angular/core';
import {
  collection,
  query,
  where,
  collectionData,
  getDocs,
  doc,
  docData,
  addDoc,
  updateDoc,
  deleteDoc,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { TreeDescription } from '../models/tree-description';
import { db } from '../../../firebase.config';

@Injectable({
  providedIn: 'root',
})
export class TreeAPI {
  private collectionName = 'treeDescriptions';

  // CREATE
  async create(tree: Omit<TreeDescription, 'id'>) {
    const ref = collection(db, this.collectionName);
    try {
      return (await addDoc(ref, tree)).id;
    } finally {
    }
  }

  // READ (all)
  getAll(): Observable<TreeDescription[]> {
    const ref = collection(db, this.collectionName);
    return collectionData(ref, { idField: 'id' }) as Observable<TreeDescription[]>;
  }

  getByAuther(userId: string): Observable<TreeDescription[]> {
    const ref = collection(db, this.collectionName);
    const q = query(ref, where('authorId', '==', userId));
    return collectionData(q, { idField: 'id' }) as Observable<TreeDescription[]>;
  }

  // READ (single)
  getById(id: string): Observable<TreeDescription> {
    const ref = doc(db, `${this.collectionName}/${id}`);
    return docData(ref, { idField: 'id' }) as Observable<TreeDescription>;
  }

  // UPDATE
  update(id: string, tree: Partial<TreeDescription>) {
    const ref = doc(db, `${this.collectionName}/${id}`);
    return updateDoc(ref, { ...tree });
  }

  // DELETE
  delete(id: string) {
    const ref = doc(db, `${this.collectionName}/${id}`);
    return deleteDoc(ref);
  }
}
