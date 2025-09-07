// Collab3PL V18 — Data Contracts (starter)
// Single source of truth for shapes used across UI, API clients, and forms.

import { z } from "zod";

/** ---------- Common primitives ---------- */
export const UUID = z.string().uuid();
export const ISODate = z.string().datetime({ offset: true }); // e.g., 2025-09-07T12:34:56Z

export const Email = z.string().email();
export const Phone = z
  .string()
  .min(7)
  .max(20)
  .regex(/[0-9+()\-\s]+/, "Invalid phone format");

export const NonEmptyString = z.string().min(1);
export const PositiveInt = z.number().int().positive();
export const NonNegativeInt = z.number().int().nonnegative();

export const Money = z.object({
  currency: z.string().length(3).toUpperCase(),
  amount: z.number(), // cents or decimal depending on downstream; we'll normalize later
});

export const Pagination = z.object({
  page: NonNegativeInt.default(0),
  pageSize: PositiveInt.default(25),
});

/** ---------- RBAC / Roles ---------- */
export const Role = z.enum([
  "Admin",
  "Finance",
  "Ops",
  "CS",
  "AccountManager",
  "WarehouseManager",
  "WarehouseStaff",
  "Vendor",
  "Investor",
]);

/** ---------- Routing contracts (aligns with registry.tsx) ---------- */
export const AppRouteSchema = z.object({
  path: NonEmptyString,                       // "/finance"
  label: NonEmptyString,                      // "Finance"
  icon: z.string().optional(),                // "💰" (identifier only, no components here)
  parent: z.string().nullable(),              // null or "/some/parent"
  roles: z.array(Role).min(1),                // allowed roles
  // We don't validate React components here; runtime provides those.
});
export type AppRouteContract = z.infer<typeof AppRouteSchema>;

/** ---------- Party / Address ---------- */
export const Address = z.object({
  line1: NonEmptyString,
  line2: z.string().optional(),
  city: NonEmptyString,
  state: z.string().min(2).max(2),            // US state code for now
  postalCode: z.string().min(3).max(10),
  country: z.string().min(2).max(2).default("US"),
});

export const Contact = z.object({
  name: NonEmptyString,
  email: Email.optional(),
  phone: Phone.optional(),
});

export const Client = z.object({
  id: UUID,
  name: NonEmptyString,
  billingAddress: Address.optional(),
  shippingAddress: Address.optional(),
  contacts: z.array(Contact).default([]),
  status: z.enum(["Active", "Suspended", "Prospect"]).default("Active"),
});

export const Vendor = z.object({
  id: UUID,
  name: NonEmptyString,
  contact: Contact.optional(),
});

/** ---------- Inventory & Orders ---------- */
export const InventoryItem = z.object({
  id: UUID,
  sku: NonEmptyString,
  upc: z.string().optional(),
  name: NonEmptyString,
  qtyOnHand: NonNegativeInt.default(0),
  qtyAllocated: NonNegativeInt.default(0),
  location: z.string().optional(),            // bin / aisle / warehouse
});

export const PurchaseOrderLine = z.object({
  id: UUID,
  itemId: UUID,
  qtyOrdered: PositiveInt,
  unitCost: Money,
});

export const PurchaseOrder = z.object({
  id: UUID,
  clientId: UUID,
  vendorId: UUID,
  createdAt: ISODate,
  expectedAt: ISODate.optional(),
  lines: z.array(PurchaseOrderLine).min(1),
  status: z.enum(["Draft", "Submitted", "Received", "Closed", "Canceled"]).default("Draft"),
});

export const Shipment = z.object({
  id: UUID,
  clientId: UUID,
  createdAt: ISODate,
  shippedAt: ISODate.optional(),
  carrier: z.enum(["UPS", "FedEx", "USPS", "DHL", "Other"]).default("Other"),
  tracking: z.string().optional(),
  lines: z.array(
    z.object({
      id: UUID,
      itemId: UUID,
      qty: PositiveInt,
    })
  ).min(1),
  status: z.enum(["Pending", "Packed", "Shipped", "Delivered", "Exception"]).default("Pending"),
});

export const RMA = z.object({
  id: UUID,
  clientId: UUID,
  createdAt: ISODate,
  reason: NonEmptyString,
  lines: z.array(
    z.object({
      id: UUID,
      itemId: UUID,
      qty: PositiveInt,
      condition: z.enum(["New", "Opened", "Damaged", "Defective"]).default("Opened"),
    })
  ).min(1),
  status: z.enum(["Requested", "Approved", "InTransit", "Received", "Resolved", "Rejected"]).default("Requested"),
});

/** ---------- Helpers ---------- */
export function validate<T extends z.ZodTypeAny>(schema: T, data: unknown) {
  return schema.safeParse(data); // returns { success, data|error }
}

/** ---------- Types ---------- */
export type Role = z.infer<typeof Role>;
export type UUID = z.infer<typeof UUID>;
export type ISODate = z.infer<typeof ISODate>;
export type Email = z.infer<typeof Email>;
export type Phone = z.infer<typeof Phone>;
export type Client = z.infer<typeof Client>;
export type Vendor = z.infer<typeof Vendor>;
export type InventoryItem = z.infer<typeof InventoryItem>;
export type PurchaseOrder = z.infer<typeof PurchaseOrder>;
export type Shipment = z.infer<typeof Shipment>;
export type RMA = z.infer<typeof RMA>;