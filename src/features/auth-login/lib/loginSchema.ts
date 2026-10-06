import { z } from 'zod';

export const loginSchema = z.object({
  identifier: z.string().min(1, { error: 'Enter your dealer code or email.' }),
  password: z.string().min(1, { error: 'Enter your password.' }),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
