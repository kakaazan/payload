// utils/canReadWithApiKeyOrAdmin.ts
import type { AccessArgs } from 'payload';

export const canReadWithApiKeyOrAdmin = ({ req }: AccessArgs): boolean => {
  const authHeader = req?.headers?.get?.('authorization') ?? '';
  const isApiKeyValid = authHeader === `Bearer ${process.env.PAYLOAD_API_KEY}`;
  const isAdmin = req?.user?.role === 'admin';
  return Boolean(isApiKeyValid || isAdmin); // always returns true or false
};
