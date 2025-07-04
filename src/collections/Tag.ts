import type { CollectionConfig } from 'payload'
import { canReadWithApiKeyOrAdmin } from '@/utils/canReadWithApiKeyOrAdmin'

export const Tag: CollectionConfig = {
  slug: 'tags',
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
  ],
}
