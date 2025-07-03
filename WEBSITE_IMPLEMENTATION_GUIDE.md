# Website Implementation Guide

## 🏗️ Architecture Overview

Your website is a **Payload CMS** application built with **Next.js** that provides a complete content management system with video hosting capabilities.

### Tech Stack
- **Backend**: Payload CMS v3.44.0
- **Database**: PostgreSQL with `@payloadcms/db-postgres`
- **Frontend**: Next.js 15.3.0 with React 19
- **Admin Panel**: Payload's built-in admin interface
- **Search**: Payload Search plugin with custom indexing
- **Import/Export**: Payload Import-Export plugin
- **Rich Text**: Lexical editor for content management
- **Image Processing**: Sharp for image optimization

## 📊 Data Collections

### 1. Users Collection
- **Purpose**: Authentication and user management
- **Fields**: Email, password, role (user/admin), sessions
- **Access**: Admin-only management

### 2. Media Collection
- **Purpose**: File uploads and media management
- **Fields**: Alt text, URL, thumbnail, filename, mime type, dimensions
- **Features**: Automatic image processing with Sharp

### 3. Videos Collection
- **Purpose**: Video content management
- **Fields**:
  - `title` (required): Video title
  - `description`: Video description (supports rich text)
  - `mp4url`: Direct MP4 file URL
  - `iframeurl`: Embedded iframe URL
  - `thumbnailurl`: Video thumbnail image
  - `categories`: Multiple category relationships
  - `tags`: Multiple tag relationships
- **Relationships**: Many-to-many with Categories and Tags

### 4. Categories Collection
- **Purpose**: Video categorization
- **Fields**:
  - `name` (required): Category name
  - `description`: Category description (supports rich text)
  - `slug`: URL-friendly identifier

### 5. Tags Collection
- **Purpose**: Video tagging system
- **Fields**:
  - `name` (required): Tag name
  - `label`: Alternative display name
  - `description`: Tag description (supports rich text)

### 6. Search Collection
- **Purpose**: Auto-generated search index
- **Fields**: Title, excerpt, thumbnail, category names, search content
- **Features**: Automatic indexing of Videos, Categories, and Tags

## 🔍 Key Features

### Search Functionality
- **Plugin**: `@payloadcms/plugin-search`
- **Collections**: Videos, Categories, Tags
- **Custom Indexing**: 
  - Extracts plain text from Lexical rich text
  - Populates thumbnail URLs
  - Indexes category names
  - Creates search excerpts
- **Priorities**: Videos (10), Categories (20), Tags (30)

### Import/Export System
- **Plugin**: `@payloadcms/plugin-import-export`
- **Supported Formats**: JSON, CSV, Excel
- **Features**:
  - Bulk data import
  - Error handling and reporting
  - Progress tracking
  - Authentication required

### Rich Text Editing
- **Editor**: Lexical editor
- **Features**:
  - WYSIWYG editing
  - Plain text extraction for search
  - Structured content storage

### File Management
- **Image Processing**: Sharp for optimization
- **Storage**: Configurable (local/cloud)
- **Features**: Automatic thumbnails, dimension detection

## 🎨 Frontend Structure

### App Router Layout
```
src/app/
├── (frontend)/          # Public-facing pages
│   ├── page.tsx        # Homepage
│   ├── layout.tsx      # Frontend layout
│   ├── styles.css      # Frontend styles
│   ├── components/     # Frontend components
│   └── search/         # Search functionality
├── (payload)/          # Payload CMS routes
│   ├── admin/          # Admin panel
│   ├── api/            # API endpoints
│   └── layout.tsx      # Payload layout
└── api/                # Custom API routes
    └── import/         # Import functionality
```

### Key Components
- **ImportButton**: Reusable import component with progress tracking
- **Admin Interface**: Payload's built-in admin panel
- **Search Interface**: Custom search implementation

## 🔧 TypeScript Interfaces

### New Type Definitions (`src/types/interfaces.ts`)

#### Lexical Editor Types
```typescript
interface LexicalNode {
  type: string
  text?: string
  children?: LexicalNode[]
  [key: string]: unknown
}

interface LexicalContent {
  root: {
    children: LexicalNode[]
  }
}
```

#### Document Types
```typescript
interface BaseDocument {
  id: number
  updatedAt: string
  createdAt: string
}

interface VideoDocument extends BaseDocument {
  title: string
  description?: string | LexicalContent | null
  mp4url?: string | null
  iframeurl?: string | null
  thumbnailurl?: string | null
  categories?: (number | CategoryDocument)[] | null
  tags?: (number | TagDocument)[] | null
}

interface CategoryDocument extends BaseDocument {
  name: string
  description?: string | LexicalContent | null
  slug?: string | null
}

interface TagDocument extends BaseDocument {
  name: string
  label?: string
  description?: string | LexicalContent | null
}
```

#### Search Types
```typescript
interface SearchDocument extends BaseDocument {
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
```

#### Import/Export Types
```typescript
interface ImportResult {
  success: boolean
  message: string
  results: ImportItemResult[]
}

interface ImportItemResult {
  index: number
  status: 'success' | 'error'
  id?: number
  error?: string
}
```

#### Component Types
```typescript
interface ImportButtonProps {
  collection?: string
  className?: string
  children?: React.ReactNode
  onSuccess?: (result: ImportResult) => void
  onError?: (error: Error) => void
}
```

### Type Guards
```typescript
function isLexicalContent(content: unknown): content is LexicalContent
function isVideoDocument(doc: unknown): doc is VideoDocument
function isCategoryDocument(doc: unknown): doc is CategoryDocument
function isTagDocument(doc: unknown): doc is TagDocument
```

## 🚀 Development Workflow

### Environment Setup
1. **Database**: PostgreSQL connection via `DATABASE_URI`
2. **Authentication**: Payload secret via `PAYLOAD_SECRET`
3. **Development**: `pnpm dev` for local development

### Key Scripts
- `pnpm dev`: Start development server
- `pnpm build`: Build for production
- `pnpm generate:types`: Generate TypeScript types
- `pnpm lint`: Run ESLint

### Data Management
- **Admin Panel**: `/admin` for content management
- **Import**: Use ImportButton component or admin interface
- **Export**: Available in admin panel
- **Search**: Automatic indexing on content changes

## 🔒 Security & Access Control

### Authentication
- **User Management**: Built-in Payload authentication
- **Roles**: User and Admin roles
- **Sessions**: Secure session management

### Access Control
- **Public Read**: Videos, Categories, Tags
- **Admin Only**: User management, imports
- **Authenticated**: Import functionality

## 📈 Performance Optimizations

### Search Indexing
- **Automatic**: Updates on content changes
- **Efficient**: Indexed fields for fast queries
- **Flexible**: Custom search content generation

### Image Processing
- **Sharp**: Optimized image processing
- **Thumbnails**: Automatic generation
- **Dimensions**: Automatic detection

### Database
- **PostgreSQL**: Reliable and scalable
- **Indexing**: Optimized for search queries
- **Relationships**: Efficient foreign key relationships

## 🛠️ Customization Points

### Search Customization
- Modify `beforeSync` function in `payload.config.ts`
- Add custom fields to search index
- Adjust search priorities

### Import/Export Customization
- Extend import validation in `/api/import/route.ts`
- Add custom export formats
- Implement custom import logic

### UI Customization
- Modify frontend components in `src/app/(frontend)/`
- Customize admin interface styling
- Add custom admin components

## 🔍 Troubleshooting

### Common Issues
1. **TypeScript Errors**: Run `pnpm generate:types` after schema changes
2. **Search Not Working**: Check search plugin configuration
3. **Import Failures**: Verify JSON format and collection names
4. **Image Upload Issues**: Check Sharp installation and permissions

### Debug Tools
- **GraphQL Playground**: `/api/graphql-playground`
- **Admin Panel**: `/admin` for content inspection
- **TypeScript**: Full type safety with generated types

## 📚 Next Steps

### Potential Enhancements
1. **Video Player**: Custom video player component
2. **Advanced Search**: Filters, sorting, pagination
3. **User Comments**: Comment system for videos
4. **Analytics**: View tracking and analytics
5. **API Documentation**: OpenAPI/Swagger documentation
6. **Testing**: Unit and integration tests
7. **CI/CD**: Automated deployment pipeline

### Scalability Considerations
- **CDN**: For video and image delivery
- **Caching**: Redis for search results
- **Load Balancing**: Multiple server instances
- **Database**: Read replicas for search queries

This implementation provides a solid foundation for a video content management system with modern web technologies and best practices. 