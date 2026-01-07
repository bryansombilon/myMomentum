
import { ProjectType, Task, Project, Priority, Note, LinkEntry } from './types';

export const PROJECT_CONFIG: Record<ProjectType, Project> = {
  [ProjectType.AWARDS]: { name: ProjectType.AWARDS, color: '#EAB308' }, 
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

// Added PRIORITY_CONFIG to fix missing export errors in TaskList and TaskDetail
export const PRIORITY_CONFIG = {
  'urgent': { label: 'Urgent' },
  'not-urgent': { label: 'Not Urgent' }
};

export const INITIAL_TASKS: Task[] = [
  {
    id: 't-1',
    title: 'GALA Website Launch',
    description: 'Finalize the homepage assets and deploy to production.',
    deadline: new Date(new Date().setDate(new Date().getDate() + 2)), 
    clickupLink: 'https://clickup.com/t/12345',
    project: ProjectType.AWARDS,
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
  }
];

export const INITIAL_LINKS: LinkEntry[] = [
  {
    id: 'l-1',
    title: 'Project Roadmap',
    url: 'https://docs.google.com/spreadsheets/d/1example-sheet',
    project: ProjectType.AWARDS,
    dateAdded: new Date()
  },
  {
    id: 'l-2',
    title: 'Strategy Document',
    url: 'https://docs.google.com/document/d/1example-doc',
    project: ProjectType.MAKERS_MOVERS,
    dateAdded: new Date()
  }
];
