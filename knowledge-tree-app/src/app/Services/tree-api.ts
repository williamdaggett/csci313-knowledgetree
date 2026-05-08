import { Injectable, inject, signal } from '@angular/core';
import {
  collection,
  query,
  where,
  getDoc,
  getDocs,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import { Observable } from 'rxjs';
import { TreeDescription } from '../models/tree-description';
import { TreeDiagram, TreeNode } from '../models/tree-diagram';
import { db } from '../../../firebase.config';
import { ContentService } from './content';

@Injectable({
  providedIn: 'root',
})
export class TreeAPI {
  private DescriptionCollection = 'treeDescriptions';
  private diagramCollection = 'treeDiagrams';
  private progressDiagramCollection = 'treeDiagramProgress';
  private progressDescriptionCollection = 'treeDescriptionProgress';
  private contentService = inject(ContentService);

  nodeList = signal<TreeNode[]>([]);
  nodeChange = signal<boolean>(false);

  /*loadDefaultNodeList() {
    const node = {
      id: 'root',
      name: 'BaseNode',
      parent: null,
      color: '#000000',
      shape: 'circle',
      contentId: null,
    } as TreeNode;

    this.nodeList.set([node]);
  }*/

  async createProgressTree(Description: TreeDescription, UserId: string) {
    const ref = collection(db, this.progressDescriptionCollection);
    const ref2 = collection(db, this.progressDiagramCollection);
    const ref3 = doc(db, `${this.diagramCollection}/${Description.tree_id}`);
    //create progress tree content

    let progDescription: Omit<TreeDescription, 'id'> = {
      tree_id: Description.tree_id,
      name: Description.name,
      description: Description.description,
      date_created: Description.date_created,
      authorId: Description.authorId,
      learnerId: Description.learnerId,
      published: null,
    };
    let nodeList: TreeNode[] = [];

    let snapshot = await getDoc(ref3);
    if (!snapshot.exists()) {
      return;
    }
    const data = snapshot.data();
    for (const n of data['nodeList']) {
      if (n.id != '1') {
        n.completed = false;
      }
      nodeList.push(n);
    }
    let progDiagram: Omit<TreeDiagram, 'id'> = {
      nodeList: nodeList,
      contentId: data['contentId'],
    };
    try {
      let diagramId = (await addDoc(ref2, progDiagram)).id;
      progDescription.learnerId = UserId;
      progDescription.tree_id = diagramId;
      return (await addDoc(ref, progDescription)).id;
    } finally {
    }
  }

  getProgressTreesByUser(userId: string): Observable<TreeDescription[]> {
    return new Observable((observer) => {
      const ref = collection(db, this.progressDescriptionCollection);
      const q = query(ref, where('learnerId', '==', userId));
      const unsub = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as TreeDescription[];

        observer.next(data);
      });

      return () => unsub();
    });
  }

  // READ (single)
  getProgressDescriptionById(id: string): Observable<TreeDescription> {
    return new Observable((observer) => {
      const ref = doc(db, `${this.progressDescriptionCollection}/${id}`);

      const unsubscribe = onSnapshot(ref, (docSnap) => {
        if (docSnap.exists()) {
          observer.next({
            id: docSnap.id,
            ...docSnap.data(),
          } as TreeDescription);
        }
      });

      return () => unsubscribe();
    });
  }

  //READ diagram
  getProgressDiagram(id: string): Observable<TreeDiagram> {
    return new Observable((observer) => {
      if (!id) return;

      const ref = doc(db, `${this.progressDiagramCollection}/${id}`);

      const unsub = onSnapshot(ref, (snap) => {
        if (snap.exists()) {
          observer.next({
            id: snap.id,
            ...snap.data(),
          } as TreeDiagram);
        }
      });

      return () => unsub();
    });
  }

  saveProgressDiagram(id: string, diagram: Partial<TreeDiagram>) {
    const ref = doc(db, `${this.progressDiagramCollection}/${id}`);
    return updateDoc(ref, { ...diagram });
  }

  async deleteProgressTree(id: string) {
    const ref = doc(db, `${this.progressDescriptionCollection}/${id}`);
    const snapshot = await getDoc(ref);

    if (!snapshot.exists()) return;

    const data = snapshot.data();

    // assuming you store the related implementation ID like this
    const treeId = data['tree_id'];

    if (treeId) {
      const treeRef = doc(db, `${this.progressDiagramCollection}/${treeId}`);
      await deleteDoc(treeRef);
    }

    await deleteDoc(ref);
  }

  createNode(
    name: string,
    parent: string,
    shape: string,
    color: string,
    size: 'Big' | 'Medium' | 'Small',
  ) {
    const nodeId = Date.now().toString();

    this.contentService.contentCache.update((cache) => {
      cache[nodeId] = {
        id: '',
        nodeId: nodeId,
        items: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      return cache;
    });

    const node = {
      id: nodeId,
      name: name,
      parent: parent,
      shape: shape,
      color: color,
      size: size,
      contentId: null,
    } as TreeNode;
    this.nodeList.update((t) => [...t, node]);
    this.nodeChange.set(true);
  }

  editNode(node: TreeNode) {
    this.nodeList.update((t) => {
      return t.map((n) => {
        return n.id === node.id ? node : n;
      });
    });
    this.nodeChange.set(true);
  }

  deleteNode(id: string) {
    //assumes child nodes will be after parent nodes.
    //deletes children with no parent.
    const idList = [id];
    this.nodeList.update((t) => {
      return t.filter((n) => {
        if (n.parent && n.parent in idList) {
          idList.push(n.id);
          // Delete associated content
          this.contentService.contentCache.update((cache) => {
            delete cache[n.id];
            return cache;
          });
          return false;
        }
        if (n.id === id) {
          // Delete associated content
          this.contentService.contentCache.update((cache) => {
            delete cache[n.id];
            return cache;
          });
          return false;
        }
        return true;
      });
    });
    this.nodeChange.set(true);
  }

  // Get content for a specific node
  getNodeContent(nodeId: string) {
    return this.contentService.contentCache()[nodeId] || null;
  }

  //READ diagram
  getDiagram(id: string): Observable<TreeDiagram> {
    return new Observable((observer) => {
      if (!id) return;

      const ref = doc(db, `${this.diagramCollection}/${id}`);

      const unsub = onSnapshot(ref, (snap: any) => {
        if (snap.exists()) {
          observer.next({
            id: snap.id,
            ...snap.data(),
          } as TreeDiagram);
        }
      });

      return () => unsub();
    });
  }

  //UPDATE diagram
  saveDiagram(id: string, diagram: Partial<TreeDiagram>) {
    const ref = doc(db, `${this.diagramCollection}/${id}`);
    return updateDoc(ref, { ...diagram });
  }

  // CREATE
  async create(tree: Omit<TreeDescription, 'id'>) {
    const ref = collection(db, this.DescriptionCollection);
    const ref2 = collection(db, this.diagramCollection);

    const content = await this.contentService.createTreeContent();
    //load base tree with one root node
    const defaultDiagram = {
      contentId: content.id,
      nodeList: [
        {
          id: '1',
          name: 'BaseNode',
          parent: null,
          color: '#000000',
          shape: 'Ellipse',
          size: 'Medium',
          contentId: 'Unknown',
        },
      ],
    } as Omit<TreeDiagram, 'id'>;
    try {
      let diagramId = (await addDoc(ref2, defaultDiagram)).id;
      tree.tree_id = diagramId;
      return (await addDoc(ref, tree)).id;
    } finally {
    }
  }

  getPublished(): Observable<TreeDescription[]> {
    return new Observable((observer) => {
      const ref = collection(db, this.DescriptionCollection);

      // Query only documents where published == true
      const q = query(ref, where('published', '==', true));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as TreeDescription[];

        observer.next(data);
      });

      return () => unsubscribe();
    });
  }

  // READ (all)
  getAll(): Observable<TreeDescription[]> {
    return new Observable((observer) => {
      const ref = collection(db, this.DescriptionCollection);

      const unsubscribe = onSnapshot(ref, (snapshot: any) => {
        const data = snapshot.docs.map((doc: any) => ({
          id: doc.id,
          ...doc.data(),
        })) as TreeDescription[];

        observer.next(data);
      });

      return () => unsubscribe();
    });
  }

  getByAuther(userId: string): Observable<TreeDescription[]> {
    return new Observable((observer) => {
      const ref = collection(db, this.DescriptionCollection);
      const q = query(ref, where('authorId', '==', userId));

      const unsub = onSnapshot(q, (snapshot: any) => {
        const data = snapshot.docs.map((doc: any) => ({
          id: doc.id,
          ...doc.data(),
        })) as TreeDescription[];

        observer.next(data);
      });

      return () => unsub();
    });
  }

  // READ (single)
  getById(id: string): Observable<TreeDescription> {
    return new Observable((observer) => {
      const ref = doc(db, `${this.DescriptionCollection}/${id}`);

      const unsubscribe = onSnapshot(ref, (docSnap: any) => {
        if (docSnap.exists()) {
          observer.next({
            id: docSnap.id,
            ...docSnap.data(),
          } as TreeDescription);
        }
      });

      return () => unsubscribe();
    });
  }
  // UPDATE
  update(id: string, tree: Partial<TreeDescription>) {
    const ref = doc(db, `${this.DescriptionCollection}/${id}`);
    return updateDoc(ref, { ...tree });
  }

  // DELETE
  /*delete(id: string) {
    const ref = doc(db, `${this.DescriptionCollection}/${id}`);
    let treeDescription = docData(ref, { idField: 'id' });
    return deleteDoc(ref);
  }*/

  async delete(id: string) {
    const ref = doc(db, `${this.DescriptionCollection}/${id}`);
    const snapshot = await getDoc(ref);

    if (!snapshot.exists()) return;

    const data = snapshot.data();

    // assuming you store the related implementation ID like this
    const treeId = data['tree_id'];

    if (treeId) {
      const treeRef = doc(db, `${this.diagramCollection}/${treeId}`);
      await deleteDoc(treeRef);
    }

    await deleteDoc(ref);
  }
}
