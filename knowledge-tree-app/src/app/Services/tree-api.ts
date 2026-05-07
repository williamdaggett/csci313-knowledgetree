import { Injectable, signal } from '@angular/core';
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
import { NodeContent } from '../models/node-content';
import { db } from '../../../firebase.config';

@Injectable({
  providedIn: 'root',
})
export class TreeAPI {
  private collectionName = 'treeDescriptions';
  private diagramCollection = 'treeDiagrams';

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
    const node = {
      id: Date.now().toString(),
      name: name,
      parent: parent,
      shape: shape,
      color: color,
      contentId: null,
    } as TreeNode;
    this.nodeList.update((t) => [...t, node]);
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
          n.contentId; //TODO remove the content from this id
          return false;
        }
        if (n.id === id) {
          n.contentId; //TODO remove the content from this id
          return false;
        }
        return true;
      });
    });
  }

  //READ diagram
  getDiagram(id: string): Observable<TreeDiagram> {
    return new Observable((observer) => {
      if (!id) return;

      const ref = doc(db, `${this.diagramCollection}/${id}`);

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

      const unsubscribe = onSnapshot(ref, (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
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
  getById(id: string): Observable<TreeDescription> {
    return new Observable((observer) => {
      const ref = doc(db, `${this.collectionName}/${id}`);

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

  // ====== CONTENT MANAGEMENT ======
  private contentCollection = 'nodeContent';

  // Extract YouTube ID from various YouTube URL formats
  private extractYoutubeId(url: string): string | null {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  }

  // ADD content to node
  async addContentToNode(nodeId: string, content: Omit<NodeContent, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const ref = collection(db, this.contentCollection);
    
    // Extract YouTube ID if it's a video
    let youtubeId: string | null = null;
    if (content.type === 'video' && content.url) {
      youtubeId = this.extractYoutubeId(content.url);
    }

    const newContent = {
      ...content,
      youtubeId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await addDoc(ref, newContent);
    return docRef.id;
  }

  // GET all content for a node
  async getNodeContent(nodeId: string): Promise<NodeContent[]> {
    const ref = collection(db, this.contentCollection);
    const q = query(ref, where('nodeId', '==', nodeId));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    }));
  }

  // UPDATE content
  async updateContent(contentId: string, updates: Partial<NodeContent>): Promise<void> {
    const ref = doc(db, `${this.contentCollection}/${contentId}`);
    
    // Update YouTube ID if URL changed
    if (updates.url && updates.type === 'video') {
      updates.youtubeId = this.extractYoutubeId(updates.url) || undefined;
    }
    
    updates.updatedAt = new Date();
    
    await updateDoc(ref, updates);
  }

  // DELETE content
  async deleteContent(contentId: string): Promise<void> {
    const ref = doc(db, `${this.contentCollection}/${contentId}`);
    await deleteDoc(ref);
  }

  // Watch content for a node in real-time
  watchNodeContent(nodeId: string): Observable<NodeContent[]> {
    return new Observable((observer) => {
      const ref = collection(db, this.contentCollection);
      const q = query(ref, where('nodeId', '==', nodeId));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const content = snapshot.docs.map((doc: any) => ({
          id: doc.id,
          ...doc.data(),
        }));
        observer.next(content);
      });

      return () => unsubscribe();
    });
  }
}
