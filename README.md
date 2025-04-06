# ResearchRover

A powerful research and note-taking application designed to enhance academic and research workflows with advanced features for organization, collaboration, and analysis.

## Features

### Advanced Note Organization
- Hierarchical folder structure for organizing notes
- Tag-based categorization
- Mind map visualization of note connections
- Rich text editing with formatting options
- Note linking and cross-referencing

### PDF Annotation
- PDF viewing and navigation
- Text highlighting with multiple colors
- Page-specific annotations
- Export highlights to notes
- Search within PDFs

### AI-Powered Analysis
- Text summarization
- Topic extraction
- Sentiment analysis
- Bias detection
- Research question generation

### Data Visualization
- Interactive charts and graphs
- Table data visualization
- Multiple chart types (line, bar)
- Export data in various formats (CSV, JSON, Excel)
- Customizable visualization options

### Enhanced Search
- Semantic search capabilities
- Advanced filtering options
- Date range filtering
- Tag-based filtering
- Related paper suggestions

### Cross-Platform Synchronization
- Real-time data synchronization
- Automatic sync scheduling
- Conflict resolution
- Progress tracking
- Error handling

### Collaboration Features
- Real-time collaborative editing
- Session management
- Note sharing
- Participant tracking
- Version history

## Technical Stack

- Frontend: React, TypeScript, Tailwind CSS
- Backend: Node.js, Express
- Database: PostgreSQL with Drizzle ORM
- Authentication: Passport.js
- Real-time: WebSocket
- PDF Processing: PDF.js
- Data Visualization: Chart.js
- AI Integration: Custom API endpoints

## Project Structure

```
├── client/                  # Frontend application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── lib/           # Utility functions and types
│   │   └── hooks/         # Custom React hooks
├── server/                 # Backend server
│   ├── routes/            # API routes
│   ├── models/            # Database models
│   └── services/          # Business logic
└── shared/                # Shared code and types
```

## Development Setup

### Prerequisites

- Node.js (v20 or newer)
- PostgreSQL
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/researchrover.git
cd researchrover
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Initialize the database
```bash
npm run db:push
```

5. Start the development server
```bash
npm run dev
```

## Usage Guide

1. **Note Management**
   - Create and organize notes in folders
   - Use tags for categorization
   - Create links between related notes
   - Visualize connections in the mind map

2. **PDF Handling**
   - Upload and view PDFs
   - Create highlights and annotations
   - Export highlights to notes
   - Search within PDF content

3. **AI Analysis**
   - Select text for analysis
   - Choose analysis type (summary, topics, sentiment)
   - View AI-generated insights
   - Apply suggestions to notes

4. **Data Visualization**
   - Import data for visualization
   - Choose visualization type
   - Customize chart appearance
   - Export visualizations

5. **Search and Filter**
   - Use semantic search for natural language queries
   - Apply filters by date, tags, or folders
   - View related papers and suggestions
   - Save search results

6. **Collaboration**
   - Create collaboration sessions
   - Invite participants
   - Share notes and highlights
   - Track changes in real-time

## API Documentation

The application exposes several RESTful endpoints:

- `/api/notes` - Note management
- `/api/folders` - Folder organization
- `/api/highlights` - PDF highlights
- `/api/analysis` - AI analysis
- `/api/search` - Enhanced search
- `/api/sync` - Data synchronization
- `/api/collaboration` - Collaboration features

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License

## Contact

For questions, feedback, or support, please open an issue on the GitHub repository.

## Chrome Extension Installation

### Building the Extension

1. Build the extension package
```bash
npm run build:extension
```

2. The build process will create a `dist` directory containing the extension files.

### Loading the Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" by toggling the switch in the top-right corner
3. Click "Load unpacked" and select the `dist` directory from your project
4. The ResearchRover extension should now be installed and visible in your browser toolbar

### Extension Features

The Chrome extension provides quick access to:
- Note creation and editing
- PDF annotation
- Text highlighting
- AI analysis
- Search functionality
- Data visualization

### Extension Settings

1. Click the ResearchRover icon in your browser toolbar
2. Access settings through the gear icon
3. Configure:
   - Auto-sync preferences
   - Default visualization types
   - AI analysis settings
   - Collaboration preferences

### Troubleshooting

If you encounter issues with the extension:
1. Check the Chrome console for error messages
2. Verify that all required permissions are granted
3. Try reloading the extension
4. Clear browser cache and reload
5. Reinstall the extension if problems persist
