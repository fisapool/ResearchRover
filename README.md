# ResearchAssist - Chrome Extension

A Chrome browser extension designed to enhance research workflows by providing quick access to essential research tools directly within the browser interface.

## Current Features

### Text Highlighting
- Highlight text directly from any web page with visual highlighting
- Quick save option for capturing text without visual styling
- View and manage saved text highlights
- Search through your highlight collection
- Delete highlights you no longer need
- Offline support with synchronization when online

### Note Management
- Create and edit notes with title, content, and category
- Categorize notes (Important, Research, To Review, Citation, Ideas, Questions, General)
- View note details including creation and update dates
- Word count tracking for better content management
- Full-text search capabilities for finding specific notes

### Database Integration
- PostgreSQL database for persistent storage
- RESTful API endpoints for data access and management
- Secure data storage and retrieval
- Offline functionality with local storage backup

### Research Tools
- Tab-based interface for easy navigation
- DOI validation and citation formatting
  - Supports multiple citation styles (APA, MLA, Chicago, Harvard, IEEE)
  - Validates DOIs against CrossRef API
  - Copy formatted citations to clipboard
- Text analysis capabilities:
  - Text summarization
  - Key points extraction
  - Research question generation
  - Citation pattern detection
- Export functionality in multiple formats:
  - PDF (via HTML printing)
  - Plain text (.txt)
  - HTML
  - CSV (for spreadsheet import)

## Technical Implementation

- Built using modern web technologies (React, TypeScript, Tailwind CSS)
- Uses Chrome Extension Manifest V3
- PostgreSQL database for persistent storage of research materials
- REST API endpoints for data access and management
- Local storage for offline access to research materials
- Content scripts for interaction with webpage content

## Project Structure

```
├── client/                  # Extension frontend code
│   ├── public/              # Static assets and extension manifest
│   └── src/                 # Source code
│       ├── components/      # React components
│       ├── lib/             # Utility functions
│       └── hooks/           # Custom React hooks
├── server/                  # Backend server
│   ├── index.ts             # Express server setup
│   ├── routes.ts            # API endpoints
│   ├── storage.ts           # Database storage interface
│   └── db.ts                # Database connection
├── shared/                  # Shared code/schemas
│   └── schema.ts            # Database schemas and types
└── drizzle.config.ts        # Database configuration
```

## Development Setup

### Prerequisites

- Node.js (v20 or newer)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up the PostgreSQL database:
   - Create a PostgreSQL database
   - Set the `DATABASE_URL` environment variable to your database connection string
   - Run the database migration:
     ```
     npm run db:push
     ```
4. Start the development server:
   ```
   npm run dev
   ```

### Loading the Extension in Chrome

1. Build the extension
2. Open Chrome and navigate to chrome://extensions/
3. Enable "Developer mode" (toggle in the top-right corner)
4. Click "Load unpacked" and select the dist directory from your project
5. The extension should now be installed and visible in your browser toolbar

## Usage Guide

1. Click the ResearchAssist icon in your browser toolbar to open the extension popup
2. Use the tabs to navigate between Highlights, Notes, and Tools
3. To view saved highlights:
   - Navigate to the Highlights tab
   - Use the search box to filter highlights
4. To view saved notes:
   - Navigate to the Notes tab
   - Notes are organized by category
5. To use research tools:
   - Navigate to the Tools tab
   - Choose the tool you need:
     - DOI validation and citation formatting
     - Text analysis (summarize, extract key points, generate research questions, find citations)
     - Export (PDF, TXT, HTML, CSV)

## Privacy & Data Storage

Your research data (highlights, notes) can be stored both locally in your browser using Chrome storage API and remotely in a PostgreSQL database for persistence across devices. The application uses a secure database connection to ensure your research data is protected. External API connections are only made when using features like DOI validation (via CrossRef API) or text analysis.

## Database Migration & API

### Database Schema

The application now uses a PostgreSQL database with the following schema:

- **users**: User account information
- **highlights**: Saved text highlights with source URLs
- **notes**: Research notes with categories

### API Endpoints

The application provides RESTful API endpoints for data access:

- **GET /api/highlights**: Retrieve all highlights
- **GET /api/highlights/:id**: Retrieve a specific highlight
- **POST /api/highlights**: Create a new highlight
- **PATCH /api/highlights/:id**: Update an existing highlight
- **DELETE /api/highlights/:id**: Delete a highlight

- **GET /api/notes**: Retrieve all notes
- **GET /api/notes/:id**: Retrieve a specific note
- **POST /api/notes**: Create a new note
- **PATCH /api/notes/:id**: Update an existing note
- **DELETE /api/notes/:id**: Delete a note

## Future Enhancements

- User authentication and multi-device synchronization
- Additional citation styles
- Enhanced text analysis capabilities
- Collaborative research features
- Integration with reference management software

## License

MIT License

## Contact

For questions, feedback, or support, please open an issue on the GitHub repository.