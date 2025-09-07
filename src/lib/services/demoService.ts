// Minimal mock "API" that still uses Zod for validation, no network required.
import { z } from 'zod';
import { validate } from '@/lib/contracts';

// Define a tiny response contract (re-usable pattern)
export const DemoProfile = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  email: z.string().email(),
});
export type DemoProfile = z.infer<typeof DemoProfile>;

/**
 * fetchDemoProfile
 * Simulates a server call:
 * - returns a mocked object
 * - validates it through Zod
 * - rejects with a standard Error when invalid
 */
export async function fetchDemoProfile(): Promise<DemoProfile> {
  // Toggle this object to test Error/validation flows
  const MOCK = {
    id: '11111111-2222-3333-4444-555555555555',
    name: 'Alex Example',
    email: 'alex@example.com',
  };

  // Validate using our helper; mirrors how we'll do it with real fetch later
  const result = validate(DemoProfile, MOCK);
  if (!result.success) {
    throw new Error('Schema validation failed');
  }
  // Simulate latency so you can see the Loading state
  await new Promise(r => setTimeout(r, 350));
  return result.data;
}