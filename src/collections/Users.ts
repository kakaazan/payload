// src/collections/Users.ts

import type { CollectionConfig } from 'payload';
import { canReadWithApiKeyOrAdmin } from '@/utils/canReadWithApiKeyOrAdmin';

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  access: {
    read: canReadWithApiKeyOrAdmin,
  },
  admin: {
    useAsTitle: 'email',
  },
  fields: [
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'user',
      options: [
        { label: 'User', value: 'user' },
        { label: 'Admin', value: 'admin' },
      ],
      hooks: {
        beforeChange: [
          ({ data, originalDoc, req }) => {
            const isCreating = !originalDoc;
            const oldRole = originalDoc?.role;
            const newRole = data?.role;

            const isChangingFromAdmin = oldRole === 'admin' && newRole !== 'admin';
            // Allow admin creation
            // if (isCreatingAdmin) {
            //   throw new Error('You cannot manually create an admin user.');
            // }

            if (isChangingFromAdmin) {
              throw new Error('You cannot change the role of an admin user.');
            }

            return data;
          },
        ],
      },
    },
  ],
};
