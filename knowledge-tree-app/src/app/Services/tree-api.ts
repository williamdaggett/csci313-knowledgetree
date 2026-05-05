import { Injectable, signal } from '@angular/core';
import {
  collection,
  query,
  where,
  collectionData,
  getDoc,
  getDocs,
  doc,
  docData,
  addDoc,
  updateDoc,
  deleteDoc,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { TreeDescription } from '../models/tree-description';
import { TreeDiagram, TreeNode } from '../models/tree-diagram';
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
  getDiagram(id: string) {
    if (!id) {
      return;
    }
    const ref = doc(db, `${this.diagramCollection}/${id}`);
    return docData(ref, { idField: 'id' }) as Observable<TreeDiagram>;
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
