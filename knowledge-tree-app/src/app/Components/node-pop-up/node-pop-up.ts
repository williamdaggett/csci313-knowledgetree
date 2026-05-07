import { Component, inject, signal, effect, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TreeAPI } from '../../Services/tree-api';
import { ContentService } from '../../Services/content';
import { NodeContent, NodeContentItem, ContentType } from '../../models/node-content';

//handle tree edit operations in diagram edit
@Component({
  selector: 'app-node-pop-up',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './node-pop-up.html',
  styleUrl: './node-pop-up.css',
})
export class NodePopUp implements OnInit {
  treeAPI = inject(TreeAPI);
  contentService = inject(ContentService);
  dialogRef = inject(MatDialogRef);
  data = inject(MAT_DIALOG_DATA) as any;

  // Content display
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

  constructor() {
    effect(() => {
      this.loadNodeContent();
    });
  }

  ngOnInit(): void {
    this.loadNodeContent();
  }

  async loadNodeContent(): Promise<void> {
    this.loading.set(true);
    try {
      const content = await this.treeAPI.getNodeContent(this.data.id);
      this.nodeContent.set(content);
    } catch (error) {
      console.error('Error loading node content:', error);
    } finally {
      this.loading.set(false);
    }
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

  addChild(): void {
    this.treeAPI.createNode('Default', this.data.id, 'circle', 'black');
    console.log(this.treeAPI.nodeList());
  }

  deleteNode(): void {
    this.treeAPI.deleteNode(this.data.id);
    this.dialogRef.close();
  }

  getYouTubeEmbedUrl(url: string): string {
    const videoId = this.contentService.extractYouTubeId(url);
    return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
  }

}

