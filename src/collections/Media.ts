import type { CollectionConfig } from 'payload'
import { canReadWithApiKeyOrAdmin } from '@/utils/canReadWithApiKeyOrAdmin'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: canReadWithApiKeyOrAdmin,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
  upload: true,
}
