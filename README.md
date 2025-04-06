# ResearchAssist - Chrome Extension

A Chrome browser extension designed to enhance research workflows by providing quick access to essential research tools directly within the browser interface.

## Current Features

### Text Highlighting and Note Management
- Powerful text highlighting on any webpage with categorization and tagging
- Comprehensive note management system with categories and search
- Full database integration with PostgreSQL for data persistence

### Research Tools
- DOI validation and citation formatting (supports APA, MLA, Chicago, Harvard, IEEE)
- Text analysis with summarization and key points extraction
- Export in multiple formats (PDF, TXT, HTML, CSV)

### PDF Annotation (NEW)
- Upload and view PDF documents directly in the browser
- Add highlights, notes, and annotations to PDF documents
- Real-time collaboration via WebSockets with automatic synchronization
- Color-coded annotation system for visual organization

### WebSocket Implementation (NEW)
- Real-time collaboration features with separate WebSocket servers:
  - PDF annotation sharing (/pdf-ws)
  - General collaboration features (/ws)
- Robust connection handling with automatic reconnection
- Error recovery and status indicators for connection state

## Technical Implementation
- Modern stack: React, TypeScript, Tailwind CSS, PostgreSQL
- Chrome Extension Manifest V3 compatible
- Custom WebSocket hooks for real-time communication
- API endpoints for all data operations

## Project Structure
Organized codebase with clear separation between client and server components, featuring
specialized components for PDF annotation, highlights management, and WebSocket communication.

## Future Development
- Enhanced data visualization capabilities
- User authentication and multi-device synchronization
- Advanced search with semantic capabilities
- AI-powered text analysis features
- Integration with reference management software

MIT License
