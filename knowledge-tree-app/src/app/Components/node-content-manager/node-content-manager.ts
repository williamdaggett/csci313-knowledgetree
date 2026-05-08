import { Component, Input, inject, signal, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TreeAPI } from '../../Services/tree-api';
import { NodeContent, NodeContentItem } from '../../models/node-content';
import { ContentService } from '../../Services/content';

@Component({
  selector: 'app-node-content-manager',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './node-content-manager.html',
  styleUrl: './node-content-manager.css',
})
export class NodeContentManager {
  @Input() nodeId!: string;

  treeAPI = inject(TreeAPI);
  contentService = inject(ContentService);

  // Content list
  content = signal<NodeContent | null>(null);
  loading = signal(false);

  // Form state
  showForm = signal(false);
  contentType = signal<'text' | 'image' | 'video'>('text');
  contentTitle = signal('');
  contentDescription = signal('');
  textContent = signal('');
  contentUrl = signal('');

  constructor() {
    effect(() => {
      const nodeId = this.nodeId;
      if (nodeId) {
        this.loadContent();
      }
    });
  }

  async loadContent() {
    const content = (await this.treeAPI.getNodeContent(this.nodeId)) as NodeContent;
    this.content.set(content);
  }

  addContent(): void {
    if (!this.contentTitle()) {
      alert('Please enter a title');
      return;
    }

    if (this.contentType() === 'text' && !this.textContent()) {
      alert('Please enter text content');
      return;
    }

    if ((this.contentType() === 'image' || this.contentType() === 'video') && !this.contentUrl()) {
      alert('Please enter a URL');
      return;
    }

    this.loading.set(true);

    const newContent = {
      id: crypto.randomUUID(),
      type: this.contentType(),
      title: this.contentTitle(),
      description: this.contentDescription(),
      textContent: this.textContent() || undefined,
      url: this.contentUrl() || undefined,
    } as NodeContentItem;

    this.contentService.addContentItem(this.nodeId, newContent);
    this.resetForm();
    this.loading.set(false);
  }

  deleteContent(contentItemId: string): void {
    if (!confirm('Are you sure you want to delete this content?')) return;

    this.contentService
      .deleteNodeContent(contentItemId)
      .then(() => {
        this.content.update((list) => {
          if (!list) return list;
          list.items = list?.items.filter((c) => c.id !== contentItemId);
          return list;
        });
      })
      .catch((err) => console.error('Error deleting content:', err));
  }

  resetForm(): void {
    this.contentType.set('text');
    this.contentTitle.set('');
    this.contentDescription.set('');
    this.textContent.set('');
    this.contentUrl.set('');
    this.showForm.set(false);
  }

  toggleForm(): void {
    this.showForm.update((v) => !v);
  }

  getYoutubeEmbedUrl(content: NodeContentItem): string {
    if (content.type === 'video' && content.url) {
      return `https://www.youtube.com/embed/${this.contentService.extractYouTubeId(content.url)}`;
    }
    return '';
  }
}
