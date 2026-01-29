
import { ProjectType, Task, Project, Priority, Note, LinkEntry, LeaveEntry, EventActivity, Reminder } from './types';

export const PROJECT_CONFIG: Record<ProjectType, Project> = {
  [ProjectType.GALA]: { name: ProjectType.GALA, color: '#EAB308' }, 
  [ProjectType.MAKERS_MOVERS]: { name: ProjectType.MAKERS_MOVERS, color: '#7E22CE' }, 
  [ProjectType.ALCOTT_GLOBAL]: { name: ProjectType.ALCOTT_GLOBAL, color: '#14B8A6' }, 
  [ProjectType.SOURCE_TO_SOLD]: { name: ProjectType.SOURCE_TO_SOLD, color: '#F97316' }, 
  [ProjectType.SUPPLIFY]: { name: ProjectType.SUPPLIFY, color: '#3B82F6' }, 
  [ProjectType.EXECUTIVE_SEARCH]: { name: ProjectType.EXECUTIVE_SEARCH, color: '#22C55E' }, 
  [ProjectType.PODCAST]: { name: ProjectType.PODCAST, color: '#F43F5E' }, 
};

export const STATUS_CONFIG = {
  'todo': { label: 'To Do', color: 'bg-slate-600', text: 'text-white' },
  'in-progress': { label: 'In Progress', color: 'bg-blue-600', text: 'text-white' },
  'on-hold': { label: 'On Hold', color: 'bg-amber-600', text: 'text-white' },
  'under-review': { label: 'Under Review', color: 'bg-fuchsia-600', text: 'text-white' },
  'follow-up': { label: 'Follow Up', color: 'bg-violet-600', text: 'text-white' },
  'watcher': { label: 'Watcher', color: 'bg-rose-600', text: 'text-white' },
  'done': { label: 'Done', color: 'bg-emerald-600', text: 'text-white' }
};

export const PRIORITY_CONFIG: Record<Priority, { label: string, color: string, text: string, border: string }> = {
  'urgent': { 
    label: 'URGENT', 
    color: 'bg-red-500/10', 
    text: 'text-red-600 dark:text-red-400', 
    border: 'border-red-500/30 dark:border-red-500/50' 
  },
  'not-urgent': { 
    label: 'NOT URGENT', 
    color: 'bg-slate-200 dark:bg-slate-800/50', 
    text: 'text-slate-600 dark:text-slate-500', 
    border: 'border-slate-300 dark:border-slate-700' 
  }
};

export const INITIAL_TASKS: Task[] = [
  {
    id: 't-1',
    title: 'GALA Website Launch',
    description: 'Finalize the homepage assets and deploy to production.',
    deadline: new Date(new Date().setDate(new Date().getDate() + 2)), 
    clickupLink: 'https://clickup.com/t/12345',
    project: ProjectType.GALA,
    status: 'in-progress',
    priority: 'urgent',
    updates: []
  }
];

export const INITIAL_NOTES: Note[] = [
  {
    id: 'n-1',
    title: 'Project Brainstorming',
    content: '<div>Start writing...</div>',
    lastModified: new Date(),
    tags: ['work', 'ideas']
  }
];

export const INITIAL_LINKS: LinkEntry[] = [
  {
    id: 'l-1',
    title: 'ClickUp Dashboard',
    url: 'https://app.clickup.com',
    category: 'Tools',
    dateAdded: new Date()
  }
];

export const INITIAL_REMINDERS: Reminder[] = [
  {
    id: 'r-1',
    time: '09:30',
    label: 'Morning Engagement',
    description: 'Support the Alcott Global team on LinkedIn.',
    actionType: 'link',
    actionUrl: 'https://www.linkedin.com/company/alcottglobal/posts/?feedView=all&viewAsMember=true',
    enabled: true,
    frequency: 'daily'
  },
  {
    id: 'r-2',
    time: '14:00',
    label: 'Mid-Day Check-in',
    description: 'React to the latest industry updates.',
    actionType: 'link',
    actionUrl: 'https://www.linkedin.com/company/alcottglobal/posts/?feedView=all&viewAsMember=true',
    enabled: true,
    frequency: 'daily'
  },
  {
    id: 'r-3',
    time: '16:00',
    label: 'Evening Wrap-up',
    description: 'Final round of social engagement.',
    actionType: 'link',
    actionUrl: 'https://www.linkedin.com/company/alcottglobal/posts/?feedView=all&viewAsMember=true',
    enabled: true,
    frequency: 'daily'
  }
];

export const LEAVE_LIMITS = { Vacation: 14, Sick: 5 };
export const INITIAL_LEAVES: LeaveEntry[] = [];
export const INITIAL_EVENT_ACTIVITIES: EventActivity[] = [];
