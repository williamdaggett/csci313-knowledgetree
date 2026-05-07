import { Injectable, signal } from '@angular/core';
import { NodeContent, NodeContentItem } from '../models/node-content';
import { 
  db, 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs 
} from '../../../firebase.config';

@Injectable({ providedIn: 'root' })
export class ContentService {
  private collectionName = 'nodeContent';
  private contentCache = signal<{ [nodeId: string]: NodeContent }>({});

  // Get all content for a specific node
  async getNodeContent(nodeId: string): Promise<NodeContent | null> {
    try {
      const ref = collection(db, this.collectionName);
      const snapshot = await getDocs(ref);
      
      // Find content by nodeId
      for (const doc of snapshot.docs) {
        const data = doc.data() as NodeContent;
        if (data.nodeId === nodeId) {
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
  async createContent(nodeId: string, items: NodeContentItem[] = []): Promise<string> {
    try {
      const ref = collection(db, this.collectionName);
      const newContent: Omit<NodeContent, 'id'> = {
        nodeId,
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
  async addContentItem(nodeId: string, item: NodeContentItem): Promise<void> {
    try {
      let content = await this.getNodeContent(nodeId);

      if (!content) {
        // Create new content if doesn't exist
        const id = await this.createContent(nodeId, [item]);
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
  }

  // Remove item from node content
  async removeContentItem(nodeId: string, itemIndex: number): Promise<void> {
    try {
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
    }
  }

  // Update item in node content
  async updateContentItem(
    nodeId: string,
    itemIndex: number,
    updatedItem: NodeContentItem
  ): Promise<void> {
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
  }

  // Delete all content for a node
  async deleteNodeContent(nodeId: string): Promise<void> {
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
  }

  // Extract YouTube video ID from URL
  extractYouTubeId(url: string): string | null {
    const regex =
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
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
    return (
      url.includes('youtube.com') ||
      url.includes('youtu.be') ||
      url.includes('vimeo.com')
    );
  }
}
