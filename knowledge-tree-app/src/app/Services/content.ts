import { Injectable, signal } from '@angular/core';
import { NodeContent, NodeContentItem } from '../models/node-content';
import { db } from '../../../firebase.config';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  onSnapshot,
} from 'firebase/firestore';
import { Firestore } from 'firebase/firestore';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({ providedIn: 'root' })
export class ContentService {
  private collectionName = 'nodeContent';
  contentCache = signal<{ [nodeId: string]: NodeContent }>({});
  contentChange = signal<boolean>(false);

  // Get all content for a specific node
  async getNodeContent(ContentId: string): Promise<NodeContent | null> {
    try {
      const ref = collection(db, this.collectionName);
      const snapshot = await getDocs(ref);

      // Find content by contentId
      for (const doc of snapshot.docs) {
        const data = doc.data() as NodeContent;
        if (data.id === ContentId) {
          return { ...data, id: doc.id };
        }
      }

      return null;
    } catch (error) {
      console.error('Error fetching node content:', error);
      return null;
    }
  }

  // Create new content for a node
  async createContent(items: NodeContentItem[] = [], nodeId: string): Promise<string> {
    try {
      const ref = collection(db, this.collectionName);
      const newContent: Omit<NodeContent, 'id'> = {
        nodeId: nodeId,
        items,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await addDoc(ref, newContent);
      return result.id;
    } catch (error) {
      console.error('Error creating content:', error);
      throw error;
    }
  }

  // Add item to node content
  addContentItem(nodeId: string, item: NodeContentItem): void {
    this.contentCache.update((cache) => {
      cache[nodeId] = {
        ...cache[nodeId],
        items: [...(cache[nodeId]?.items || []), item],
        updatedAt: new Date(),
      };
      return cache;
    });
    this.contentChange.set(true);
    // Trying memory implementation for now
    /*try {
      let content = await this.getNodeContent(contentId);

      if (!content) {
        return;
      }

      // Update existing content
      content.items.push(item);
      content.updatedAt = new Date();

      const ref = doc(db, `${this.collectionName}/${content.id}`);
      await updateDoc(ref, {
        items: content.items,
        updatedAt: content.updatedAt,
      });
    } catch (error) {
      console.error('Error adding content item:', error);
      throw error;
    }
      */
  }

  // Remove item from node content
  removeContentItem(nodeId: string, itemId: number): void {
    this.contentCache.update((cache) => {
      let content = cache[nodeId];
      if (!content) {
        return cache;
      }
      content.items.splice(itemId, 1);
      content.updatedAt = new Date();
      cache[nodeId] = content;
      return cache;
    });
    this.contentChange.set(true);
    /*try {
      const content = await this.getNodeContent(nodeId);

      if (!content) {
        console.error('Content not found for node:', nodeId);
        return;
      }

      // Remove item
      content.items.splice(itemIndex, 1);
      content.updatedAt = new Date();

      const ref = doc(db, `${this.collectionName}/${content.id}`);
      await updateDoc(ref, {
        items: content.items,
        updatedAt: content.updatedAt,
      });
    } catch (error) {
      console.error('Error removing content item:', error);
      throw error;
    }*/
  }

  // Update item in node content
  async updateContentItem(
    nodeId: string,
    itemIndex: number,
    updatedItem: NodeContentItem,
  ): Promise<void> {
    /*
    try {
      const content = await this.getNodeContent(nodeId);

      if (!content) {
        console.error('Content not found for node:', nodeId);
        return;
      }

      // Update item
      content.items[itemIndex] = updatedItem;
      content.updatedAt = new Date();

      const ref = doc(db, `${this.collectionName}/${content.id}`);
      await updateDoc(ref, {
        items: content.items,
        updatedAt: content.updatedAt,
      });
    } catch (error) {
      console.error('Error updating content item:', error);
      throw error;
    }
      */
    this.contentCache.update((cache) => {
      let content = cache[nodeId];
      if (!content) {
        return cache;
      }
      content.items[itemIndex] = updatedItem;
      content.updatedAt = new Date();
      cache[nodeId] = content;
      return cache;
    });
    this.contentChange.set(true);
  }

  // Delete all content for a node
  async deleteNodeContent(nodeId: string): Promise<void> {
    /*
    try {
      const content = await this.getNodeContent(nodeId);

      if (!content) {
        return;
      }

      const ref = doc(db, `${this.collectionName}/${content.id}`);
      await deleteDoc(ref);
    } catch (error) {
      console.error('Error deleting node content:', error);
      throw error;
    }
      */
    this.contentCache.update((cache) => {
      delete cache[nodeId];
      return cache;
    });
    this.contentChange.set(true);
  }

  getTreeContent(id: string): Observable<{ [nodeId: string]: NodeContent }> {
    const ref = doc(db, `${this.collectionName}/${id}`);
    getDoc(ref);
    return new Observable((observer) => {
      if (!id) return;

      const ref = doc(db, `${this.collectionName}/${id}`);

      const unsub = onSnapshot(ref, (snap: any) => {
        if (snap.exists()) {
          observer.next({
            id: snap.id,
            ...snap.data(),
          } as { [nodeId: string]: NodeContent });
        }
      });

      return () => unsub();
    });
  }

  SaveTreeContent(cache: { [nodeId: string]: NodeContent }, id: string) {
    //save all content together in one document in the database
    const ref = doc(db, `${this.collectionName}/${id}`);
    return updateDoc(ref, { ...cache });
  }

  createTreeContent() {
    const ref = collection(db, this.collectionName);
    const newContent: { [nodeId: string]: NodeContent } = {};
    return addDoc(ref, newContent);
  }

  deleteTreeContent(id: string) {
    const ref = doc(db, `${this.collectionName}/${id}`);
    return deleteDoc(ref);
  }

  // Extract YouTube video ID from URL
  extractYouTubeId(url: string): string | null {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }

  // Get YouTube thumbnail
  getYouTubeThumbnail(videoId: string): string {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  }

  // Validate image URL
  isValidImageUrl(url: string): boolean {
    try {
      new URL(url);
      return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);
    } catch {
      return false;
    }
  }

  // Validate video URL
  isValidVideoUrl(url: string): boolean {
    return url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com');
  }
}
