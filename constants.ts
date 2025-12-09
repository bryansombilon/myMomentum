import { ProjectType, Task, Project } from './types';

export const PROJECT_CONFIG: Record<ProjectType, Project> = {
  [ProjectType.GALA]: { name: ProjectType.GALA, color: '#3b82f6' }, // Blue
  [ProjectType.MAKERS_MOVERS]: { name: ProjectType.MAKERS_MOVERS, color: '#ec4899' }, // Pink
  [ProjectType.ALCOTT_GLOBAL]: { name: ProjectType.ALCOTT_GLOBAL, color: '#f59e0b' }, // Amber
  [ProjectType.SOURCE_TO_SOLD]: { name: ProjectType.SOURCE_TO_SOLD, color: '#10b981' }, // Emerald
  [ProjectType.SUPPLIFY]: { name: ProjectType.SUPPLIFY, color: '#8b5cf6' }, // Violet
  [ProjectType.EXECUTIVE_SEARCH]: { name: ProjectType.EXECUTIVE_SEARCH, color: '#ef4444' }, // Red
};

export const STATUS_CONFIG = {
  'todo': { label: 'To Do', color: 'bg-slate-600', text: 'text-white' },
  'in-progress': { label: 'In Progress', color: 'bg-blue-600', text: 'text-white' },
  'on-hold': { label: 'On Hold', color: 'bg-amber-600', text: 'text-white' },
  'done': { label: 'Done', color: 'bg-emerald-600', text: 'text-white' }
};

export const INITIAL_TASKS: Task[] = [
  {
    id: 't-1',
    title: 'GALA Website Launch',
    description: 'Finalize the homepage assets and deploy to production.',
    deadline: new Date(new Date().setDate(new Date().getDate() + 2)), // 2 days from now
    clickupLink: 'https://clickup.com/t/12345',
    project: ProjectType.GALA,
    status: 'in-progress',
    updates: [
      {
        id: 'm-1',
        sender: 'user',
        text: 'Initial deployment successful on staging. Waiting for final QA sign-off.',
        timestamp: new Date(new Date().setDate(new Date().getDate() - 1)),
        isUpdate: true
      }
    ]
  },
  {
    id: 't-2',
    title: 'Podcast Guest Outreach',
    description: 'Contact potential guests for the Makers & Movers Q3 season.',
    deadline: new Date(new Date().setDate(new Date().getDate() + 5)),
    clickupLink: 'https://clickup.com/t/67890',
    project: ProjectType.MAKERS_MOVERS,
    status: 'todo',
    updates: []
  },
  {
    id: 't-3',
    title: 'Alcott Global Rebrand Assets',
    description: 'Create new logo variations and social media kit.',
    deadline: new Date(new Date().setDate(new Date().getDate() + 1)),
    clickupLink: 'https://clickup.com/t/54321',
    project: ProjectType.ALCOTT_GLOBAL,
    status: 'todo',
    updates: []
  },
  {
    id: 't-4',
    title: 'Source to Sold Book Launch',
    description: 'Coordinate with publishers for the book release event.',
    deadline: new Date(new Date().setDate(new Date().getDate() + 3)),
    clickupLink: 'https://clickup.com/t/98765',
    project: ProjectType.SOURCE_TO_SOLD,
    status: 'in-progress',
    updates: []
  },
  {
    id: 't-5',
    title: 'Executive Talent Pipeline',
    description: 'Review top candidates for the VP of Operations role.',
    deadline: new Date(new Date().setDate(new Date().getDate() + 4)),
    clickupLink: 'https://clickup.com/t/11223',
    project: ProjectType.EXECUTIVE_SEARCH,
    status: 'todo',
    updates: []
  },
  {
    id: 't-6',
    title: 'Supplify Platform Beta',
    description: 'Gather feedback from the first cohort of beta testers.',
    deadline: new Date(new Date().setDate(new Date().getDate() + 6)),
    clickupLink: 'https://clickup.com/t/44556',
    project: ProjectType.SUPPLIFY,
    status: 'in-progress',
    updates: []
  }
];