import { Component, Input, inject, signal, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TreeAPI } from '../../Services/tree-api';
import { NodeContent } from '../../models/node-content';

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

  // Content list
  contentList = signal<NodeContent[]>([]);
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

  loadContent(): void {
    this.treeAPI
      .watchNodeContent(this.nodeId)
      .subscribe((content) => {
        this.contentList.set(content);
      });
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
      nodeId: this.nodeId,
      type: this.contentType(),
      title: this.contentTitle(),
      description: this.contentDescription(),
      textContent: this.textContent() || undefined,
      url: this.contentUrl() || undefined,
    };

    this.treeAPI
      .addContentToNode(this.nodeId, newContent)
      .then(() => {
        this.resetForm();
        this.loading.set(false);
      })
      .catch((err) => {
        console.error('Error adding content:', err);
        this.loading.set(false);
      });
  }

  deleteContent(contentId: string): void {
    if (!confirm('Are you sure you want to delete this content?')) return;

    this.treeAPI
      .deleteContent(contentId)
      .then(() => {
        this.contentList.update((list) => list.filter((c) => c.id !== contentId));
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

  getYoutubeEmbedUrl(content: NodeContent): string {
    if (content.youtubeId) {
      return `https://www.youtube.com/embed/${content.youtubeId}`;
    }
    return '';
  }
}
