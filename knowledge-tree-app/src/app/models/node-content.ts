export type ContentType = 'text' | 'image' | 'video';

export interface NodeContent {
  id: string;
  nodeId: string; // The parent node this content belongs to
  type: ContentType;
  title: string;
  description?: string;
  // For text content
  textContent?: string;
  // For image/video URLs
  url?: string;
  // YouTube video ID (extracted from URL)
  youtubeId?: string;
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}
