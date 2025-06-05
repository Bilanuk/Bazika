export interface IContentItem {
  title: string;
  description?: string;
  url: string;
  guid: string;
  publishedAt: Date;
}

export interface IRSSItem {
  title?: string;
  link?: string;
  pubDate?: string;
  description?: string;
  guid?: string;
  content?: string;
  contentSnippet?: string;
  isoDate?: string;
}
