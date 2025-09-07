// src/routes/registry.tsx

// NOTE: Component imports are placeholders for the actual pages.
// import { FinanceDashboard } from '@/pages/finance/FinanceDashboard';

import React from 'react';
import DemoForm from '../pages/demo/DemoForm';
import DemoClient from '../pages/demo/DemoClient';
import LeadCreate from '../pages/leads/LeadCreate';
import ClientList from '../pages/clients/ClientList';
import ClientDetails from '../pages/clients/ClientDetails';
import ClientEdit from '../pages/clients/ClientEdit';
import ClientCreate from '../pages/clients/ClientCreate';
import InventoryList from '../pages/inventory/InventoryList';
import InventoryCreate from '../pages/inventory/InventoryCreate';
import POList from '../pages/po/POList';
import POCreate from '../pages/po/POCreate';
import ShipmentList from '../pages/shipments/ShipmentList';
import ShipmentCreate from '../pages/shipments/ShipmentCreate';

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
  {
    path: '/clients',
    component: ClientList,
    label: 'Clients',
    icon: '👥',
    parent: null,
    roles: ['Admin', 'Finance', 'AccountManager', 'CS'],
  },
  {
    path: '/clients/new',
    component: ClientCreate,
    label: 'New Client',
    icon: '➕',
    parent: '/clients',
    roles: ['Admin', 'Finance', 'AccountManager', 'CS'],
  },
  {
    path: '/clients/:id',
    component: ClientDetails,
    label: 'Client Details',
    icon: '👤',
    parent: '/clients',
    roles: ['Admin', 'Finance', 'AccountManager', 'CS'],
  },
  {
    path: '/clients/:id/edit',
    component: ClientEdit,
    label: 'Edit Client',
    icon: '✏️',
    parent: '/clients',
    roles: ['Admin', 'AccountManager', 'CS', 'Finance'],
  },
  {
    path: '/inventory',
    component: InventoryList,
    label: 'Inventory',
    icon: '📦',
    parent: null,
    roles: ['Admin', 'Ops', 'WarehouseManager', 'WarehouseStaff'],
  },
  {
    path: '/inventory/new',
    component: InventoryCreate,
    label: 'New Inventory Item',
    icon: '➕',
    parent: '/inventory',
    roles: ['Admin', 'Ops', 'WarehouseManager'],
  },
  {
    path: '/po',
    component: POList,
    label: 'Purchase Orders',
    icon: '🧾',
    parent: null,
    roles: ['Admin', 'Finance', 'Ops'],
  },
  {
    path: '/po/new',
    component: POCreate,
    label: 'New Purchase Order',
    icon: '➕',
    parent: '/po',
    roles: ['Admin', 'Finance', 'Ops'],
  },
  {
    path: '/shipments',
    component: ShipmentList,
    label: 'Shipments',
    icon: '🚚',
    parent: null,
    roles: ['Admin', 'Ops', 'WarehouseManager', 'WarehouseStaff', 'CS'],
  },
  {
    path: '/shipments/new',
    component: ShipmentCreate,
    label: 'New Shipment',
    icon: '➕',
    parent: '/shipments',
    roles: ['Admin', 'Ops', 'WarehouseManager'],
  },
];

export default routeRegistry;