// TypeScript interfaces for the Payload CMS application

// ============================================================================
// LEXICAL EDITOR INTERFACES
// ============================================================================

export interface LexicalNode {
  type: string
  text?: string
  children?: LexicalNode[]
  [key: string]: unknown
}

export interface LexicalContent {
  root: {
    children: LexicalNode[]
  }
}

// ============================================================================
// COLLECTION DOCUMENT INTERFACES
// ============================================================================

export interface BaseDocument {
  id: number
  updatedAt: string
  createdAt: string
}

export interface VideoDocument extends BaseDocument {
  title: string
  description?: string | LexicalContent | null
  mp4url?: string | null
  iframeurl?: string | null
  thumbnailurl?: string | null
  categories?: (number | CategoryDocument)[] | null
  tags?: (number | TagDocument)[] | null
}

export interface CategoryDocument extends BaseDocument {
  name: string
  description?: string | LexicalContent | null
  slug?: string | null
}

export interface TagDocument extends BaseDocument {
  name: string
  label?: string
  description?: string | LexicalContent | null
}

// ============================================================================
// SEARCH INTERFACES
// ============================================================================

export interface SearchDocument extends BaseDocument {
  title?: string | null
  priority?: number | null
  doc: {
    relationTo: 'videos' | 'categories' | 'tags'
    value: number | VideoDocument | CategoryDocument | TagDocument
  }
  excerpt?: string | null
  originalDocID?: string | null
  thumbnailURL?: string | null
  categoryNames?: string[] | null
  categorySlug?: string | null
  searchContent?: string
  description?: string | null
}

export interface SearchSyncParams {
  originalDoc: VideoDocument | CategoryDocument | TagDocument
  searchDoc: SearchDocument
}

// ============================================================================
// IMPORT/EXPORT INTERFACES
// ============================================================================

export interface ImportResult {
  success: boolean
  message: string
  results: ImportItemResult[]
}

export interface ImportItemResult {
  index: number
  status: 'success' | 'error'
  id?: number
  error?: string
}

export interface ImportRequest {
  file: File
  collection: string
}

export interface ImportResponse {
  success: boolean
  message?: string
  error?: string
  details?: string
  results?: ImportItemResult[]
}

// ============================================================================
// COMPONENT INTERFACES
// ============================================================================

export interface ImportButtonProps {
  collection?: string
  className?: string
  children?: React.ReactNode
  onSuccess?: (result: ImportResult) => void
  onError?: (error: Error) => void
}

// ============================================================================
// API INTERFACES
// ============================================================================

export interface ApiError {
  error: string
  details?: string
  status?: number
}

export interface CollectionData {
  [key: string]: unknown
}

// ============================================================================
// UTILITY TYPE GUARDS
// ============================================================================

export function isLexicalContent(content: unknown): content is LexicalContent {
  return (
    typeof content === 'object' &&
    content !== null &&
    'root' in content &&
    typeof (content as LexicalContent).root === 'object' &&
    (content as LexicalContent).root !== null &&
    'children' in (content as LexicalContent).root &&
    Array.isArray((content as LexicalContent).root.children)
  )
}

export function isVideoDocument(doc: unknown): doc is VideoDocument {
  return (
    typeof doc === 'object' &&
    doc !== null &&
    'title' in doc &&
    typeof (doc as VideoDocument).title === 'string'
  )
}

export function isCategoryDocument(doc: unknown): doc is CategoryDocument {
  return (
    typeof doc === 'object' &&
    doc !== null &&
    'name' in doc &&
    typeof (doc as CategoryDocument).name === 'string'
  )
}

export function isTagDocument(doc: unknown): doc is TagDocument {
  return (
    typeof doc === 'object' &&
    doc !== null &&
    'name' in doc &&
    typeof (doc as TagDocument).name === 'string'
  )
}

// ============================================================================
// COLLECTION SLUGS
// ============================================================================

export const COLLECTION_SLUGS = {
  VIDEOS: 'videos',
  CATEGORIES: 'categories',
  TAGS: 'tags',
  USERS: 'users',
  MEDIA: 'media',
  SEARCH: 'search',
} as const

export type CollectionSlug = typeof COLLECTION_SLUGS[keyof typeof COLLECTION_SLUGS] 