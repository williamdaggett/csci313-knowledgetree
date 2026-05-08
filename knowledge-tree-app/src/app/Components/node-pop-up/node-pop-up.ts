import { Component, effect, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TreeAPI } from '../../Services/tree-api';
import { BrowserModule } from '@angular/platform-browser';
import { ColorSketchModule } from 'ngx-color/sketch';
import { TreeNode } from '../../models/tree-diagram';
import { FormsModule } from '@angular/forms';
import { ContentType, NodeContent, NodeContentItem } from '../../models/node-content';
import { ContentService } from '../../Services/content';

//handle tree edit operations in diagram edit
@Component({
  selector: 'app-node-pop-up',
  imports: [ColorSketchModule, FormsModule],
  templateUrl: './node-pop-up.html',
  styleUrl: './node-pop-up.css',
})
export class NodePopUp {
  constructor(private dialogRef: MatDialogRef<NodePopUp>) {
    effect(() => {
      this.loadNodeContent();
    });
    effect(() => {
      const size = this.size();
      const shape = this.shape();
      const color = this.color();
      const name = this.name();
      let node = {
        id: this.data.id,
        name: this.name(),
        parent: this.data.parent,
        color: color,
        shape: shape,
        size: size,
      } as TreeNode;
      //handle when it initially opens
      if (this.hasInit) {
        this.treeAPI.editNode(node);
      } else {
        this.hasInit = true;
      }
    });
  }

  treeAPI = inject(TreeAPI);
  contentService = inject(ContentService);
  data = inject(MAT_DIALOG_DATA) as any;

  hasInit = false;

  nodeContent = signal<NodeContent | null>(null);
  loading = signal<boolean>(false);
  // Form for adding content
  contentType = signal<ContentType>('text');
  videoUrl = signal<string>('');
  videoTitle = signal<string>('');
  videoDescription = signal<string>('');
  textContent = signal<string>('');
  textTitle = signal<string>('');
  imageUrl = signal<string>('');
  imageTitle = signal<string>('');
  imageDescription = signal<string>('');
  // UI state
  showAddForm = signal<boolean>(false);
  editingIndex = signal<number | null>(null);

  sizes = ['Big', 'Medium', 'Small'];
  size = signal<string>(this.data.size);

  shapes = ['Ellipse', 'Rectangle', 'Triangle'];
  shape = signal<string>(this.data.shape);

  color = signal<string>(this.data.color);

  name = signal<string>(this.data.name);

  ngOnInit(): void {
    this.loadNodeContent();
  }

  async addContent(): Promise<void> {
    this.loading.set(true);
    try {
      let item: NodeContentItem | null = null;

      switch (this.contentType()) {
        case 'video':
          if (!this.videoUrl()) {
            alert('Please enter a video URL');
            this.loading.set(false);
            return;
          }

          if (!this.contentService.isValidVideoUrl(this.videoUrl())) {
            alert('Please enter a valid YouTube or Vimeo URL');
            this.loading.set(false);
            return;
          }

          const videoId = this.contentService.extractYouTubeId(this.videoUrl());
          item = {
            id: crypto.randomUUID(),
            type: 'video',
            url: this.videoUrl(),
            title: this.videoTitle() || 'Untitled Video',
            description: this.videoDescription(),
            thumbnail: videoId ? this.contentService.getYouTubeThumbnail(videoId) : undefined,
          };
          break;

        case 'image':
          if (!this.imageUrl()) {
            alert('Please enter an image URL');
            this.loading.set(false);
            return;
          }

          if (!this.contentService.isValidImageUrl(this.imageUrl())) {
            alert('Please enter a valid image URL');
            this.loading.set(false);
            return;
          }

          item = {
            id: crypto.randomUUID(),
            type: 'image',
            url: this.imageUrl(),
            title: this.imageTitle() || 'Untitled Image',
            description: this.imageDescription(),
          };
          break;

        case 'text':
          if (!this.textContent()) {
            alert('Please enter text content');
            this.loading.set(false);
            return;
          }

          item = {
            id: crypto.randomUUID(),
            type: 'text',
            content: this.textContent(),
            title: this.textTitle(),
          };
          break;
      }

      if (item) {
        // If editing, update. Otherwise, add new.
        if (this.editingIndex() !== null && this.nodeContent()) {
          await this.contentService.updateContentItem(this.data.id, this.editingIndex()!, item);
        } else {
          await this.contentService.addContentItem(this.data.id, item);
        }

        // Reset form
        this.resetForm();
        await this.loadNodeContent();
      }
    } catch (error) {
      console.error('Error adding content:', error);
      alert('Error adding content');
    } finally {
      this.loading.set(false);
    }
  }

  async deleteContent(index: number): Promise<void> {
    if (!confirm('Are you sure you want to delete this content?')) {
      return;
    }

    this.loading.set(true);
    try {
      await this.contentService.removeContentItem(this.data.id, index);
      await this.loadNodeContent();
    } catch (error) {
      console.error('Error deleting content:', error);
      alert('Error deleting content');
    } finally {
      this.loading.set(false);
    }
  }

  editContent(index: number): void {
    const content = this.nodeContent()?.items[index];
    if (!content) return;

    this.editingIndex.set(index);
    this.contentType.set(content.type);

    switch (content.type) {
      case 'video':
        this.videoUrl.set(content.url);
        this.videoTitle.set(content.title);
        this.videoDescription.set(content.description || '');
        break;
      case 'image':
        this.imageUrl.set(content.url);
        this.imageTitle.set(content.title);
        this.imageDescription.set(content.description || '');
        break;
      case 'text':
        this.textContent.set(content.content);
        this.textTitle.set(content.title || '');
        break;
    }

    this.showAddForm.set(true);
  }

  resetForm(): void {
    this.videoUrl.set('');
    this.videoTitle.set('');
    this.videoDescription.set('');
    this.textContent.set('');
    this.textTitle.set('');
    this.imageUrl.set('');
    this.imageTitle.set('');
    this.imageDescription.set('');
    this.contentType.set('text');
    this.editingIndex.set(null);
    this.showAddForm.set(false);
  }

  addChild() {
    this.treeAPI.createNode('Default', this.data.id, 'Ellipse', 'black', 'Medium');
    console.log(this.treeAPI.nodeList());
  }

  deleteNode() {
    this.treeAPI.deleteNode(this.data.id);
    this.closeDialog();
  }

  closeDialog() {
    this.dialogRef.close();
  }

  async loadNodeContent(): Promise<void> {
    this.loading.set(true);
    try {
      let content = await this.treeAPI.getNodeContent(this.data.id);
      if (content) {
        this.nodeContent.set(content);
      }
    } catch (error) {
      console.error('Error loading node content:', error);
    } finally {
      this.loading.set(false);
    }
  }

  getYouTubeEmbedUrl(url: string): string {
    const videoId = this.contentService.extractYouTubeId(url);
    return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
  }
}
