# Import Button Component

A modern, reusable import button component for Payload CMS that allows users to import data from JSON, CSV, and Excel files.

## Features

- 🎨 **Modern UI**: Beautiful gradient design with hover effects and animations
- 📁 **Multiple Formats**: Supports JSON, CSV, and Excel (.xlsx, .xls) files
- 🔒 **Authentication**: Secure file uploads with user authentication
- 📊 **Progress Tracking**: Visual progress bar during import process
- 🎯 **Collection-Specific**: Can target specific collections or let users choose
- 📱 **Responsive**: Works great on desktop and mobile devices
- 🌙 **Dark Mode**: Automatic dark mode support
- ⚡ **TypeScript**: Fully typed for better development experience

## Installation

The import button is already set up in your project! Here's what was created:

### Files Created:
- `src/components/ImportButton.tsx` - Main component
- `src/components/ImportButton.css` - Styling
- `src/app/api/import/route.ts` - API endpoint for file uploads
- `src/app/(frontend)/import-demo/page.tsx` - Demo page

## Usage

### Basic Usage

```tsx
import ImportButton from '@/components/ImportButton'
import '@/components/ImportButton.css'

function MyComponent() {
  const handleSuccess = (result) => {
    console.log('Import successful:', result)
  }

  const handleError = (error) => {
    console.error('Import failed:', error)
  }

  return (
    <ImportButton
      onSuccess={handleSuccess}
      onError={handleError}
    />
  )
}
```

### Collection-Specific Import

```tsx
<ImportButton
  collection="videos"
  onSuccess={handleSuccess}
  onError={handleError}
>
  <span>📹 Import Videos</span>
</ImportButton>
```

### Custom Styling

```tsx
<ImportButton
  className="my-custom-import-button"
  collection="categories"
  onSuccess={handleSuccess}
  onError={handleError}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `collection` | `string` | `undefined` | Target collection slug (e.g., "videos", "categories") |
| `className` | `string` | `""` | Additional CSS classes |
| `children` | `ReactNode` | `"Import Data"` | Custom button content |
| `onSuccess` | `(result: any) => void` | `undefined` | Success callback |
| `onError` | `(error: Error) => void` | `undefined` | Error callback |

## Supported File Formats

### JSON
```json
[
  {
    "title": "Sample Video",
    "description": "This is a sample video",
    "mp4url": "https://example.com/video.mp4",
    "iframeurl": "https://example.com/embed/video",
    "thumbnailurl": "https://example.com/thumb.jpg"
  }
]
```

### CSV
```csv
title,description,mp4url,iframeurl,thumbnailurl
Sample Video,This is a sample video,https://example.com/video.mp4,https://example.com/embed/video,https://example.com/thumb.jpg
```

### Excel (.xlsx, .xls)
Spreadsheet with headers matching your collection field names.

## Demo Page

Visit `/import-demo` to see the import button in action with different configurations and examples.

## File Format Requirements

- **JSON**: Array of objects with field names matching your collection schema
- **CSV**: Comma-separated values with headers matching field names
- **Excel**: Spreadsheet with headers matching field names

## Security

- Files are validated for type and size
- User authentication is required
- Files are temporarily stored and cleaned up
- CORS headers are properly configured

## Styling

The component comes with modern, responsive styling that includes:
- Gradient backgrounds
- Hover animations
- Progress bars
- Success/error states
- Dark mode support
- Mobile responsiveness

## Customization

You can customize the appearance by:
1. Modifying `src/components/ImportButton.css`
2. Adding custom CSS classes via the `className` prop
3. Overriding CSS variables for colors and spacing

## Troubleshooting

### Common Issues

1. **"Authentication required" error**
   - Make sure you're logged in to the admin panel
   - Check that cookies are enabled

2. **"Unsupported file type" error**
   - Ensure your file has a `.json`, `.csv`, `.xlsx`, or `.xls` extension
   - Check that the file isn't corrupted

3. **Import fails silently**
   - Check the browser console for error details
   - Verify your file format matches the expected schema
   - Ensure field names in your file match your collection schema

### Getting Help

If you encounter issues:
1. Check the browser console for error messages
2. Verify your file format and structure
3. Ensure you have the required permissions in Payload CMS
4. Check that the import-export plugin is properly configured

## Dependencies

This component requires:
- Payload CMS with import-export plugin
- Next.js 13+ with App Router
- React 18+
- TypeScript (recommended)

The import-export plugin should already be configured in your `payload.config.ts` file. 