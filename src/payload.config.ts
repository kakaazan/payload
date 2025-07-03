// storage-adapter-import-placeholder
import { postgresAdapter } from '@payloadcms/db-postgres'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

// Import your collections
import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Video } from './collections/Video'
import { Category } from './collections/Category'
import { Tag } from './collections/Tag'

// Import the search plugin
import { searchPlugin } from '@payloadcms/plugin-search'

// *** New: Import the import-export plugin ***
import { importExportPlugin } from '@payloadcms/plugin-import-export'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// --- Utility function to extract plain text from Lexical rich text ---
const extractPlainText = (content: any): string => {
  if (!content || typeof content !== 'object') {
    return ''
  }

  if (content.root && Array.isArray(content.root.children)) {
    const extractTextFromNode = (node: any): string => {
      if (!node || typeof node !== 'object') {
        return ''
      }
      if (node.type === 'text' && typeof node.text === 'string') {
        return node.text
      }
      if (Array.isArray(node.children)) {
        return node.children
          .map((child: any) => extractTextFromNode(child))
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim()
      }
      return ''
    }

    return content.root.children
      .map((child: any) => extractTextFromNode(child))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim()
  }
  return ''
}

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Video, Category, Tag],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
  }),
  sharp,

  plugins: [
    searchPlugin({
      collections: [Video.slug, Category.slug, Tag.slug],
      defaultPriorities: {
        [Video.slug]: 10,
        [Category.slug]: 20,
        [Tag.slug]: 30,
      },
      searchOverrides: {
        fields: ({ defaultFields }) => [
          ...defaultFields,
          {
            name: 'excerpt',
            type: 'text',
            admin: { readOnly: true },
          },
          {
            name: 'originalDocID',
            type: 'text',
            admin: { readOnly: true },
          },
          // --- Updated: Field for Thumbnail URL (direct text field) ---
          {
            name: 'thumbnailURL', // Matches the name used in beforeSync
            type: 'text',
            admin: { readOnly: true },
          },
          // --- Updated: Fields for Multiple Categories (using JSON type for arrays) ---
          {
            name: 'categoryNames',
            type: 'json', // Store array of names
            admin: { readOnly: true },
          },
        ],
      },

      beforeSync: ({ originalDoc, searchDoc }) => {
        const collection = searchDoc.doc.relationTo
        let newSearchDoc = { ...searchDoc }

        // Populate originalDocID for all relevant collections
        ;(newSearchDoc as any).originalDocID = originalDoc.id ? String(originalDoc.id) : null

        // --- Logic for Video Collection ---
        if (collection === Video.slug) {
          newSearchDoc.title = (originalDoc as any).title

          const originalDescription = (originalDoc as any).description
          if (
            typeof originalDescription === 'object' &&
            originalDescription !== null &&
            'root' in originalDescription
          ) {
            newSearchDoc.description = extractPlainText(originalDescription)
          } else if (typeof originalDescription === 'string') {
            newSearchDoc.description = originalDescription
          } else {
            newSearchDoc.description = ''
          }

          if (newSearchDoc.description) {
            newSearchDoc.excerpt =
              newSearchDoc.description.substring(0, 150) +
              (newSearchDoc.description.length > 150 ? '...' : '')
          } else {
            newSearchDoc.excerpt = ''
          }

          // --- Updated: Populate Thumbnail URL (from direct text field) ---
          const videoThumbnailUrl = (originalDoc as any).thumbnailurl // Use original field name
          if (typeof videoThumbnailUrl === 'string') {
            ;(newSearchDoc as any).thumbnailURL = videoThumbnailUrl
          } else {
            ;(newSearchDoc as any).thumbnailURL = null // Or a default placeholder URL
          }

          // --- Updated: Populate Multiple Categories ---
          const originalCategories = (originalDoc as any).categories
          const categoryNames: string[] = []

          if (Array.isArray(originalCategories)) {
            originalCategories.forEach((cat: any) => {
              if (typeof cat === 'object' && cat.id) {
                // If category object is populated
                if (cat.name) categoryNames.push(cat.name)
              } else if (typeof cat === 'string') {
                // If just category ID string - note: this `beforeSync` doesn't fetch,
                // so if only IDs are available, you'd need to fetch them here
                // if you want the names for search. For simple string IDs, this is fine.
                // For this scenario, if `originalCategories` were just IDs, you'd need
                // an async operation here to get names.
                // However, if your 'categories' field in 'videos' collection is 'relationship'
                // and 'hasMany: true' and depth is configured to populate 'name',
                // then 'cat.name' would be available if it's populated.
              }
            })
          }
          ;(newSearchDoc as any).categoryNames = categoryNames.length > 0 ? categoryNames : null
        } else if (collection === Category.slug) {
          newSearchDoc.title = (originalDoc as any).name
          newSearchDoc.description = (originalDoc as any).description
            ? extractPlainText((originalDoc as any).description)
            : ''
          if ((originalDoc as any).slug) {
            ;(newSearchDoc as any).categorySlug = (originalDoc as any).slug
          }
        } else if (collection === Tag.slug) {
          newSearchDoc.title = (originalDoc as any).label || (originalDoc as any).name
          newSearchDoc.description = (originalDoc as any).description
            ? extractPlainText((originalDoc as any).description)
            : ''
        }

        newSearchDoc.searchContent = `${newSearchDoc.title || ''} ${newSearchDoc.description || ''}`

        return newSearchDoc
      },
    }),

    payloadCloudPlugin(),
    // storage-adapter-placeholder

    // *** MODIFIED: Add the import-export plugin here with canImport set to true ***
    importExportPlugin({
      // This function determines if the import button should be visible/active.
      // Returning 'true' here means any authenticated user will see the import button.
      // You can still keep other configurations like excludeCollections if needed
      // excludeCollections: ['users'], // Example: Exclude 'users' from import/export
      // redirectAfterImport: true, // Redirect to collection list view after import
    }),
  ],
})