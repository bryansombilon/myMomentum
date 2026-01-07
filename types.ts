
export enum ProjectType {
  AWARDS = 'Awards',
  MAKERS_MOVERS = 'Makers & Movers',
  ALCOTT_GLOBAL = 'Alcott Global',
  SOURCE_TO_SOLD = 'Source to Sold',
  SUPPLIFY = 'Supplify',
  EXECUTIVE_SEARCH = 'Executive Search'
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
  status: 'todo' | 'in-progress' | 'on-hold' | 'under-review' | 'follow-up' | 'done';
  priority: Priority;
}

export type AppView = 'home' | 'tasks' | 'notes' | 'links';

export interface Note {
  id: string;
  title: string;
  content: string;
  lastModified: Date;
  tags: string[];
}

export interface LinkEntry {
  id: string;
  title: string;
  url: string;
  project: ProjectType;
  dateAdded: Date;
  description?: string;
}
