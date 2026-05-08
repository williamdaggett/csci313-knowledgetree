import { Component, input } from '@angular/core';
import {
  NodeContentItem,
  TextContent,
  VideoContent,
  ImageContent,
} from '../../models/node-content';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-node-content-viewer',
  standalone: true,
  templateUrl: './node-content-viewer.html',
  styleUrl: './node-content-viewer.css',
})
export class NodeContentViewerComponent {
  item = input.required<any>();

  constructor(private sanitizer: DomSanitizer) {}

  isVideo(item: NodeContentItem): item is VideoContent {
    return item.type === 'video';
  }

  isImage(item: NodeContentItem): item is ImageContent {
    return item.type === 'image';
  }

  isText(item: NodeContentItem): item is TextContent {
    return item.type === 'text';
  }

  getVideoEmbedUrl(url: string): SafeResourceUrl {
    let embedUrl = '';

    // YouTube
    const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);

    if (youtubeMatch?.[1]) {
      embedUrl = `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }

    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);

    if (vimeoMatch?.[1]) {
      embedUrl = `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }

    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }
}
