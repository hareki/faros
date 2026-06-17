import { type BoardApplication } from '../types';

// Temporary sketch data for the static board layout. Deleted once the board read query
// is wired (apps grouped by stage for the active hunt). Vocabulary mirrors the dev seed.
export const MOCK_BOARD_APPLICATIONS: BoardApplication[] = [
  {
    id: 'mock-applied-1',
    company: 'Acme',
    role: 'Senior FE Engineer',
    stage: 'applied',
    subStage: null,
    tags: [
      { id: 'tag-frontend', name: 'frontend', color: '#89b4fa' },
      { id: 'tag-remote', name: 'remote', color: '#a6e3a1' },
    ],
    source: 'linkedin',
  },
  {
    id: 'mock-applied-2',
    company: 'Stripe',
    role: 'Frontend Engineer',
    stage: 'applied',
    subStage: null,
    tags: [{ id: 'tag-frontend', name: 'frontend', color: '#89b4fa' }],
    source: 'direct',
  },
  {
    id: 'mock-applied-3',
    company: 'Vercel',
    role: 'Product Engineer',
    stage: 'applied',
    subStage: null,
    tags: [{ id: 'tag-startup', name: 'startup', color: '#f9e2af' }],
    source: 'referral',
  },
  {
    id: 'mock-active-1',
    company: 'Globex',
    role: 'Frontend Engineer',
    stage: 'active',
    subStage: { id: 'sub-tech-screen', name: 'Tech Screen' },
    tags: [{ id: 'tag-frontend', name: 'frontend', color: '#89b4fa' }],
    source: 'referral',
  },
  {
    id: 'mock-active-2',
    company: 'Linear',
    role: 'UI Engineer',
    stage: 'active',
    subStage: { id: 'sub-hr-screen', name: 'HR Screen' },
    tags: [{ id: 'tag-startup', name: 'startup', color: '#f9e2af' }],
    source: 'recruiter',
  },
  {
    id: 'mock-final-1',
    company: 'Initech',
    role: 'UI Engineer',
    stage: 'final_stages',
    subStage: { id: 'sub-onsite', name: 'Onsite' },
    tags: [{ id: 'tag-startup', name: 'startup', color: '#f9e2af' }],
    source: 'direct',
  },
];
