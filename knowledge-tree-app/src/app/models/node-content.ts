// Node content types
export type ContentType = 'video' | 'text' | 'image';

export interface VideoContent {
  id: string;
  type: 'video';
  url: string; // YouTube or other video URL
  title: string;
  description?: string;
  thumbnail?: string;
}

export interface TextContent {
  id: string;
  type: 'text';
  content: string;
  title?: string;
}

export interface ImageContent {
  id: string;
  type: 'image';
  url: string;
  title: string;
  description?: string;
}

export type NodeContentItem = VideoContent | TextContent | ImageContent;

export interface NodeContent {
  id: string;
  nodeId: string;
  items: NodeContentItem[];
  createdAt: Date;
  updatedAt: Date;
}
