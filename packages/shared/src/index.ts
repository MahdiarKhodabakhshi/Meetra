import { z } from 'zod';

export const ProfileSchema = z.object({
  fullName: z.string().min(1),
  skills: z.array(z.string()).default([]),
});

export type Profile = z.infer<typeof ProfileSchema>;
