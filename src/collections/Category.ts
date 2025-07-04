import type { CollectionConfig } from 'payload'
import { canReadWithApiKeyOrAdmin } from '@/utils/canReadWithApiKeyOrAdmin'

export const Category: CollectionConfig = {
  slug: 'categories',
  access: {
    read: canReadWithApiKeyOrAdmin,
  },
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
    },
  ],
}
