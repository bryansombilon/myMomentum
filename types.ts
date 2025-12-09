export enum ProjectType {
  GALA = 'GALA',
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
  isUpdate?: boolean; // If true, it's a formal task update
}

export interface Task {
  id: string;
  title: string;
  description: string;
  deadline: Date;
  clickupLink: string;
  project: ProjectType;
  updates: Message[];
  status: 'todo' | 'in-progress' | 'done';
}