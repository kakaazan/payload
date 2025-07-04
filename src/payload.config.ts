import { postgresAdapter } from '@payloadcms/db-postgres'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Video } from './collections/Video'
import { Category } from './collections/Category'
import { Tag } from './collections/Tag'

import { searchPlugin } from '@payloadcms/plugin-search'
import { importExportPlugin } from '@payloadcms/plugin-import-export'

import type { LexicalContent, LexicalNode } from './types/interfaces'
import { isLexicalContent } from './types/interfaces'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const extractPlainText = (content: LexicalContent | string | null | undefined): string => {
  if (!content || typeof content !== 'object') return ''
  if (isLexicalContent(content) && Array.isArray(content.root.children)) {
    const extractTextFromNode = (node: LexicalNode): string => {
      if (!node || typeof node !== 'object') return ''
      if (node.type === 'text' && typeof node.text === 'string') return node.text
      if (Array.isArray(node.children)) {
        return node.children.map(extractTextFromNode).join(' ')
      }
      return ''
    }
    return content.root.children.map(extractTextFromNode).join(' ').replace(/\s+/g, ' ').trim()
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
      collections: ['videos'],
      defaultPriorities: {
        videos: 10,
      },
      searchOverrides: {
        fields: ({ defaultFields }) => [
          ...defaultFields,
          { name: 'searchContent', type: 'text', admin: { readOnly: true } }, 
          { name: 'excerpt', type: 'text', admin: { readOnly: true } },
          { name: 'originalDocID', type: 'text', admin: { readOnly: true } },
          { name: 'thumbnailURL', type: 'text', admin: { readOnly: true } },
          { name: 'categoryNames', type: 'json', admin: { readOnly: true } },
          { name: 'tagNames', type: 'json', admin: { readOnly: true } },
        ],
      },
      beforeSync: ({ originalDoc, searchDoc }) => {
        const newSearchDoc = { ...searchDoc }

        newSearchDoc.originalDocID = String(originalDoc?.id || '')
        newSearchDoc.title = (originalDoc as any)?.title || ''

        const rawDescription = (originalDoc as any)?.description
        if (isLexicalContent(rawDescription)) {
          newSearchDoc.description = extractPlainText(rawDescription)
        } else if (typeof rawDescription === 'string') {
          newSearchDoc.description = rawDescription
        } else {
          newSearchDoc.description = ''
        }

        newSearchDoc.excerpt = newSearchDoc.description
          ? newSearchDoc.description.slice(0, 150) + (newSearchDoc.description.length > 150 ? '...' : '')
          : ''

        const videoThumbnailUrl = (originalDoc as any)?.thumbnailurl
        newSearchDoc.thumbnailURL = typeof videoThumbnailUrl === 'string' ? videoThumbnailUrl : null

        // Handle categories - check if they are populated objects or just IDs
        const categoryNames: string[] = []
        const categories = (originalDoc as any)?.categories
        if (Array.isArray(categories)) {
          categories.forEach((cat: any) => {
            if (cat && typeof cat === 'object') {
              // If it's a populated object, use the name
              if (cat.name) {
                categoryNames.push(cat.name)
              }
              // If it's just an ID, we can't get the name here
              // The search plugin should populate relationships before calling beforeSync
            }
          })
        }

        // Handle tags - check if they are populated objects or just IDs
        const tagNames: string[] = []
        const tags = (originalDoc as any)?.tags
        if (Array.isArray(tags)) {
          tags.forEach((tag: any) => {
            if (tag && typeof tag === 'object') {
              // If it's a populated object, use the label or name
              const label = tag.label || tag.name
              if (label) {
                tagNames.push(label)
              }
            }
          })
        }

        newSearchDoc.categoryNames = categoryNames
        newSearchDoc.tagNames = tagNames

        // Build search content including all searchable text
        const searchableContent = [
          newSearchDoc.title,
          newSearchDoc.description,
          ...categoryNames,
          ...tagNames,
        ]
          .filter(Boolean)
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim()

        newSearchDoc.searchContent = searchableContent

        return newSearchDoc
      },
    }),

    payloadCloudPlugin(),
    importExportPlugin({}),
  ],
})
