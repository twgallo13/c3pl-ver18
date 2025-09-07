import { z } from 'zod';
import { Lead, Client, Contact } from './contracts';

// Convert a Lead into a Client record.
// - Carry over id + name
// - If email/phone exist, add a contact
// - Default status Active
export function leadToClient(lead: z.infer<typeof Lead>): z.infer<typeof Client> {
  const contacts: z.infer<typeof Contact>[] = [];
  if (lead.email || lead.phone) {
    const contact: z.infer<typeof Contact> = {
      name: lead.name,
    };
    if (lead.email) contact.email = lead.email;
    if (lead.phone) contact.phone = lead.phone;
    contacts.push(contact);
  }
  return {
    id: lead.id,
    name: lead.name,
    billingAddress: undefined,
    shippingAddress: undefined,
    contacts,
    status: 'Active',
  };
}