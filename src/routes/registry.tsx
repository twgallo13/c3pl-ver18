// Healthz route component
import { APP_VERSION } from '../version';

const Healthz: React.FC = () => {
  const appVersion = APP_VERSION;
  const commit = typeof __COMMIT_SHA__ !== 'undefined' ? __COMMIT_SHA__ : 'dev';
  const ts = new Date().toISOString();
  return (
    <pre style={{ padding: 16, fontSize: 16 }}>
      {JSON.stringify({ appVersion, commit, ts }, null, 2)}
    </pre>
  );
};
// src/routes/registry.tsx

// NOTE: Component imports are placeholders for the actual pages.
// import { FinanceDashboard } from '@/pages/finance/FinanceDashboard';

import React from 'react';
import DemoForm from '../pages/demo/DemoForm';
import DemoClient from '../pages/demo/DemoClient';
import LeadCreate from '../pages/leads/LeadCreate';
import ClientList from '@/pages/clients/ClientList';
import ClientCreate from '@/pages/clients/ClientCreate';
import ClientDetails from '@/pages/clients/ClientDetails';
import ClientEdit from '@/pages/clients/ClientEdit';
import InventoryList from '../pages/inventory/InventoryList';
import InventoryCreate from '../pages/inventory/InventoryCreate';
import InventoryDetails from '../pages/inventory/InventoryDetails';
import InventoryEdit from '../pages/inventory/InventoryEdit';
import Meta from './meta';
import POList from '../pages/po/POList';
import POCreate from '../pages/po/POCreate';
import PODetails from '../pages/po/PODetails';
import POEdit from '../pages/po/POEdit';
import ShipmentList from '../pages/shipments/ShipmentList';
import ShipmentCreate from '../pages/shipments/ShipmentCreate';
import ShipmentDetails from '../pages/shipments/ShipmentDetails';
import ShipmentEdit from '../pages/shipments/ShipmentEdit';

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
    path: '/healthz',
    component: Healthz,
    label: 'Healthz',
    parent: null,
    roles: [],
  },
  {
    path: '/meta',
    component: Meta,
    label: 'Meta',
    parent: null,
    roles: [],
  },
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
    parent: null,
    roles: ['Admin', 'Manager'],
  },
  {
    path: '/clients/new',
    component: ClientCreate,
    label: 'New Client',
    parent: '/clients',
    roles: ['Admin', 'Manager'],
  },
  {
    path: '/clients/:id',
    component: ClientDetails,
    label: 'Client Details',
    parent: '/clients',
    roles: ['Admin', 'Manager'],
  },
  {
    path: '/clients/:id/edit',
    component: ClientEdit,
    label: 'Edit Client',
    parent: '/clients',
    roles: ['Admin', 'Manager'],
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
    path: '/inventory/:id',
    component: InventoryDetails,
    label: 'Inventory Details',
    parent: '/inventory',
    roles: ['Admin', 'Ops', 'WarehouseManager', 'WarehouseStaff'],
  },
  {
    path: '/inventory/:id/edit',
    component: InventoryEdit,
    label: 'Edit Inventory Item',
    parent: '/inventory',
    roles: ['Admin', 'Ops', 'WarehouseManager'],
  },
  {
    path: '/po',
    component: POList,
    label: 'Inbound',
    icon: '🧾',
    parent: null,
    roles: ['Admin', 'Finance', 'Ops'],
  },
  {
    path: '/po/new',
    component: POCreate,
    label: 'New Inbound',
    icon: '➕',
    parent: '/po',
    roles: ['Admin', 'Finance', 'Ops'],
  },
  {
    path: '/po/:id',
    component: PODetails,
    label: 'Inbound Details',
    parent: '/po',
    roles: ['Admin', 'Finance', 'Ops'],
  },
  {
    path: '/po/:id/edit',
    component: POEdit,
    label: 'Edit Inbound',
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
  {
    path: '/shipments/:id',
    component: ShipmentDetails,
    label: 'Shipment Details',
    parent: '/shipments',
    roles: ['Admin', 'Ops', 'WarehouseManager', 'WarehouseStaff', 'CS'],
  },
  {
    path: '/shipments/:id/edit',
    component: ShipmentEdit,
    label: 'Edit Shipment',
    parent: '/shipments',
    roles: ['Admin', 'Ops', 'WarehouseManager'],
  },
];

export default routeRegistry;