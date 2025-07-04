import type { CollectionConfig } from 'payload'

export const Video: CollectionConfig = {
  slug: 'videos',
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: 'title',
  },
  hooks: {
    afterRead: [
      async ({ doc, req }) => {
        // Ensure categories and tags are populated for search plugin
        if (doc.categories && Array.isArray(doc.categories)) {
          try {
            const populatedCategories = await req.payload.find({
              collection: 'categories',
              where: {
                id: {
                  in: doc.categories.map((cat: any) => typeof cat === 'object' ? cat.id : cat)
                }
              }
            })
            doc.categories = populatedCategories.docs
          } catch (error) {
            console.error('Error populating categories:', error)
          }
        }
        
        if (doc.tags && Array.isArray(doc.tags)) {
          try {
            const populatedTags = await req.payload.find({
              collection: 'tags',
              where: {
                id: {
                  in: doc.tags.map((tag: any) => typeof tag === 'object' ? tag.id : tag)
                }
              }
            })
            doc.tags = populatedTags.docs
          } catch (error) {
            console.error('Error populating tags:', error)
          }
        }
        
        return doc
      }
    ]
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
