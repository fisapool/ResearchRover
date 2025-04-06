# ResearchAssist - Chrome Extension

A Chrome browser extension designed to enhance research workflows by providing quick access to essential research tools directly within the browser interface.

## Features

### Text Highlighting and Note Management
- Powerful text highlighting on any webpage with categorization and tagging
- Comprehensive note management system with categories and search
- Full database integration with PostgreSQL for data persistence

### Research Tools
- DOI validation and citation formatting (supports APA, MLA, Chicago, Harvard, IEEE)
- Text analysis with summarization and key points extraction
- Export in multiple formats (PDF, TXT, HTML, CSV)

### PDF Annotation
- Upload and view PDF documents directly in the browser
- Add highlights, notes, and annotations to PDF documents
- Real-time collaboration via WebSockets with automatic synchronization
- Color-coded annotation system for visual organization

### WebSocket Implementation
- Real-time collaboration features with separate WebSocket servers:
  - PDF annotation sharing (/pdf-ws)
  - General collaboration features (/ws)
- Robust connection handling with automatic reconnection
- Error recovery and status indicators for connection state

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/researchassist.git
cd researchassist
```

2. Install dependencies:
```bash
npm install
```

3. Set up the database:
```bash
npm run setup-db
```

4. Build the extension:
```bash
npm run build
```

5. Load the extension in Chrome:
- Open Chrome and navigate to `chrome://extensions/`
- Enable "Developer mode"
- Click "Load unpacked" and select the `dist` directory

## Technical Stack
- Frontend: React, TypeScript, Tailwind CSS
- Backend: Node.js, Express
- Database: PostgreSQL
- Real-time: WebSocket
- Build Tools: Vite, Chrome Extension Manifest V3

## Project Structure
```
researchassist/
├── src/
│   ├── components/     # React components
│   ├── hooks/         # Custom React hooks
│   ├── services/      # API and WebSocket services
│   ├── utils/         # Utility functions
│   └── types/         # TypeScript type definitions
├── server/            # Backend server code
├── public/            # Static assets
└── dist/              # Built extension
```

## Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Future Development
- Enhanced data visualization capabilities
- User authentication and multi-device synchronization
- Advanced search with semantic capabilities
- AI-powered text analysis features
- Integration with reference management software

## License
MIT License - see LICENSE file for details
