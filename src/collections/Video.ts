import type { CollectionConfig } from 'payload'

export const Video: CollectionConfig = {
  slug: 'videos',
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'mp4url',
      type: 'text',
      required: false,
    },
    {
      name: 'iframeurl',
      type: 'text',
      required: false,
    },
    {
      name: 'thumbnailurl',
      type: 'text',
      required: false,
    },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
    },
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'tags',
      hasMany: true,
    },
  ],
}
