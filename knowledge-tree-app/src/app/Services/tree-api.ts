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
} from '../../../firebase.config';
import { Observable } from 'rxjs';
import { TreeDescription } from '../models/tree-description';
import { TreeDiagram, TreeNode } from '../models/tree-diagram';
import { db } from '../../../firebase.config';
import { ContentService } from './content';

@Injectable({
  providedIn: 'root',
})
export class TreeAPI {
  private collectionName = 'treeDescriptions';
  private diagramCollection = 'treeDiagrams';
  private contentService = inject(ContentService);

  nodeList = signal<TreeNode[]>([]);

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

  createNode(name: string, parent: string, shape: string, color: string) {
    const nodeId = Date.now().toString();
    
    // Create content for this node
    this.contentService.createContent(nodeId).then((contentId) => {
      const node = {
        id: nodeId,
        name: name,
        parent: parent,
        shape: shape,
        color: color,
        contentId: contentId,
      } as TreeNode;
      this.nodeList.update((t) => [...t, node]);
    }).catch((error) => {
      console.error('Error creating node content:', error);
      // Still add node even if content creation fails
      const node = {
        id: nodeId,
        name: name,
        parent: parent,
        shape: shape,
        color: color,
        contentId: null,
      } as TreeNode;
      this.nodeList.update((t) => [...t, node]);
    });
  }

  editNode(node: TreeNode) {
    this.nodeList.update((t) => {
      return t.map((n) => {
        return n.id === node.id ? node : n;
      });
    });
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
          if (n.contentId) {
            this.contentService.deleteNodeContent(n.id).catch((error) => {
              console.error('Error deleting content for node:', n.id, error);
            });
          }
          return false;
        }
        if (n.id === id) {
          // Delete associated content
          if (n.contentId) {
            this.contentService.deleteNodeContent(n.id).catch((error) => {
              console.error('Error deleting content for node:', n.id, error);
            });
          }
          return false;
        }
        return true;
      });
    });
  }

  // Get content for a specific node
  getNodeContent(nodeId: string) {
    return this.contentService.getNodeContent(nodeId);
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
    const ref = collection(db, this.collectionName);
    const ref2 = collection(db, this.diagramCollection);
    //load base tree with one root node
    const defaultDiagram = {
      nodeList: [
        {
          id: '1',
          name: 'BaseNode',
          parent: null,
          color: '#000000',
          shape: 'circle',
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

  // READ (all)
  getAll(): Observable<TreeDescription[]> {
    return new Observable((observer) => {
      const ref = collection(db, this.collectionName);

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
      const ref = collection(db, this.collectionName);
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
      const ref = doc(db, `${this.collectionName}/${id}`);

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
    const ref = doc(db, `${this.collectionName}/${id}`);
    return updateDoc(ref, { ...tree });
  }

  // DELETE
  /*delete(id: string) {
    const ref = doc(db, `${this.collectionName}/${id}`);
    let treeDescription = docData(ref, { idField: 'id' });
    return deleteDoc(ref);
  }*/

  async delete(id: string) {
    const ref = doc(db, `${this.collectionName}/${id}`);
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
