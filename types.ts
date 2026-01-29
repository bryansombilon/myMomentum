
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

export type AppView = 'home' | 'tasks' | 'notes' | 'links' | 'leaves' | 'event-timeline' | 'engagement';

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

export type LeaveType = 'Vacation' | 'Sick';
export type LeaveDuration = 'Full' | 'Half';
export type HalfDayPeriod = 'AM' | 'PM';

export interface LeaveEntry {
  id: string;
  type: LeaveType;
  duration: LeaveDuration;
  halfDayPeriod?: HalfDayPeriod; 
  date: Date;
  reason: string;
}

export interface EventActivity {
  id: string;
  title: string;
  details: string;
  startDate: Date;
  endDate: Date;
  project: ProjectType;
  status: 'planned' | 'in-progress' | 'completed';
}

export interface Reminder {
  id: string;
  times: string[]; // Supported multiple times
  label: string;
  description: string;
  actionType: 'link' | 'dismiss';
  actionUrl?: string;
  enabled: boolean;
  frequency: 'daily' | 'weekdays' | 'weekends' | 'custom';
  customDays?: number[]; // 0 for Sunday, 1 for Monday, etc.
}
