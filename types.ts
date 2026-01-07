
export enum ProjectType {
  GALA = 'GALA',
  MAKERS_MOVERS = 'Makers & Movers',
  ALCOTT_GLOBAL = 'Alcott Global',
  SOURCE_TO_SOLD = 'Source to Sold',
  SUPPLIFY = 'Supplify',
  EXECUTIVE_SEARCH = 'Executive Search',
  PODCAST = 'Podcast'
}

export interface Project {
  name: ProjectType;
  color: string;
}

export interface Message {
  id: string;
  sender: 'user' | 'ai' | 'system';
  text: string;
  timestamp: Date;
  isUpdate?: boolean; 
}

export type Priority = 'urgent' | 'not-urgent';

export interface Task {
  id: string;
  title: string;
  description: string;
  deadline: Date;
  clickupLink: string;
  project: ProjectType;
  updates: Message[];
  status: 'todo' | 'in-progress' | 'on-hold' | 'under-review' | 'follow-up' | 'watcher' | 'done';
  priority: Priority;
}

// New Types for multi-app system
export type AppView = 'home' | 'tasks' | 'notes' | 'links';

export interface Note {
  id: string;
  title: string;
  content: string;
  lastModified: Date;
  tags: string[];
  isPinned?: boolean;
}

export interface LinkEntry {
  id: string;
  title: string;
  url: string;
  category: 'Awards' | 'Makers & Movers' | 'Alcott Global' | 'Source to Sold' | 'Supplify' | 'Executive Search' | 'Podcast' | 'Tools';
  dateAdded: Date;
}
