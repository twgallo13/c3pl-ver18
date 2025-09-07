// src/routes/registry.tsx

// NOTE: Component imports are placeholders for the actual pages.
// import { FinanceDashboard } from '@/pages/finance/FinanceDashboard';

import React from 'react';
import DemoForm from '@/pages/demo/DemoForm';
import DemoClient from '@/pages/demo/DemoClient';
import LeadCreate from '@/pages/leads/LeadCreate';

const FinanceDashboard: React.FC = () => <div>Finance Dashboard Placeholder</div>;

export interface AppRoute {
  path: string;
  component: React.ComponentType;
  label: string;
  icon?: string; // placeholder for an icon component identifier
  parent: string | null; // e.g., '/finance' to nest items
  roles: string[]; // allowed roles for this route
}

/**
 * Single source of truth for all routes in V18.
 * All navigation UIs (sidebars, breadcrumbs) will be generated from this registry.
 * RBAC filtering will be applied by the App Shell/Router based on current user.role.
 */
export const routeRegistry: AppRoute[] = [
  {
    path: '/finance',
    component: DemoClient,
    label: 'Finance',
    icon: '💰',
    parent: null,
    roles: ['Admin', 'Finance'],
  },
  {
    path: '/products',
    component: DemoForm,
    label: 'Products',
    icon: '📦',
    parent: null,
    roles: ['Admin', 'Finance', 'Ops', 'CS'],
  },
  {
    path: '/leads',
    component: LeadCreate,
    label: 'Leads',
    icon: '🧲',
    parent: null,
    roles: ['Admin', 'Finance', 'Ops', 'CS', 'AccountManager'],
  },
];

export default routeRegistry;