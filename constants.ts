import { ProjectType, Task, Project, Priority, Note, LinkEntry } from './types';

export const PROJECT_CONFIG: Record<ProjectType, Project> = {
  [ProjectType.GALA]: { name: ProjectType.GALA, color: '#EAB308' }, 
  [ProjectType.MAKERS_MOVERS]: { name: ProjectType.MAKERS_MOVERS, color: '#7E22CE' }, 
  [ProjectType.ALCOTT_GLOBAL]: { name: ProjectType.ALCOTT_GLOBAL, color: '#14B8A6' }, 
  [ProjectType.SOURCE_TO_SOLD]: { name: ProjectType.SOURCE_TO_SOLD, color: '#F97316' }, 
  [ProjectType.SUPPLIFY]: { name: ProjectType.SUPPLIFY, color: '#3B82F6' }, 
  [ProjectType.EXECUTIVE_SEARCH]: { name: ProjectType.EXECUTIVE_SEARCH, color: '#22C55E' }, 
};

export const STATUS_CONFIG = {
  'todo': { label: 'To Do', color: 'bg-slate-600', text: 'text-white' },
  'in-progress': { label: 'In Progress', color: 'bg-blue-600', text: 'text-white' },
  'on-hold': { label: 'On Hold', color: 'bg-amber-600', text: 'text-white' },
  'under-review': { label: 'Under Review', color: 'bg-fuchsia-600', text: 'text-white' },
  'follow-up': { label: 'Follow Up', color: 'bg-violet-600', text: 'text-white' },
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
    updates: [
      {
        id: 'm-1',
        sender: 'user',
        text: 'Initial deployment successful on staging.',
        timestamp: new Date(new Date().setDate(new Date().getDate() - 1)),
        isUpdate: true
      }
    ]
  }
];

export const INITIAL_NOTES: Note[] = [
  {
    id: 'n-1',
    title: 'Project Brainstorming',
    content: '# Idea for Q4\n- Launch AI features\n- Improve mobile layout\n- User feedback session',
    lastModified: new Date(),
    tags: ['work', 'ideas']
  },
  {
    id: 'n-2',
    title: 'Shopping List',
    content: '- Coffee beans\n- Milk\n- High-end mechanical keyboard (budget approved)',
    lastModified: new Date(Date.now() - 86400000),
    tags: ['personal']
  }
];

export const INITIAL_LINKS: LinkEntry[] = [
  {
    id: 'l-1',
    title: 'ClickUp Dashboard',
    url: 'https://app.clickup.com',
    category: 'Tools',
    dateAdded: new Date()
  },
  {
    id: 'l-2',
    title: 'Makers & Movers Awards',
    url: 'https://makersmovers.com',
    category: 'Awards',
    dateAdded: new Date()
  },
  {
    id: 'l-3',
    title: 'Alcott Global Main Site',
    url: 'https://alcottglobal.com',
    category: 'Alcott Global',
    dateAdded: new Date()
  }
];