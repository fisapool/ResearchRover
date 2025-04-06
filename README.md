# ResearchAssist - Chrome Extension

A Chrome browser extension designed to enhance research workflows by providing quick access to essential research tools directly within the browser interface.

## Features

### Text Highlighting

- Highlight important text on any webpage with a single click
- Save and organize your highlights for later reference
- Quickly access all saved highlights in the extension popup

### Note-Taking

- Create and manage research notes within the browser
- Organize notes by category
- Link notes to specific web pages or research materials

### Research Tools

#### DOI Validation & Citation

- Validate Digital Object Identifiers (DOIs) using the CrossRef API
- Generate properly formatted citations in multiple styles (APA, MLA, Chicago, Harvard)
- Copy citations to clipboard with a single click

#### Text Analysis

- Analyze selected text on webpages for:
  - Summarization: Get concise summaries of lengthy texts
  - Key Points: Extract the most important points
  - Research Questions: Generate potential research questions based on the text
  - Citations: Identify potential citations within the text

#### Export

- Export your research materials (highlights and notes) in multiple formats:
  - PDF format for formal documentation
  - Plain text format for maximum compatibility

## User Interface

### Highlights Panel
View, search, and manage all your saved text highlights from across the web.

### Notes Panel
Create, organize, and access all your research notes in one place.

### Tools Panel
Access research tools including DOI validation, citation generation, text analysis, and more.

## Technical Implementation

- Built using modern web technologies (React, TypeScript, Tailwind CSS)
- Uses Chrome Extension Manifest V3
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
├── server/                  # Backend server (for development)
└── shared/                  # Shared code/schemas
```
## Development Setup

### Prerequisites

- Node.js (v20 or newer)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies
3. Start the development server

### Loading the Extension in Chrome

1. Build the extension
2. Open Chrome and navigate to chrome://extensions/
3. Enable "Developer mode" (toggle in the top-right corner)
4. Click "Load unpacked" and select the dist directory from your project
5. The extension should now be installed and visible in your browser toolbar

## Usage Guide

1. Click the ResearchAssist icon in your browser toolbar to open the extension popup
2. Use the tabs to navigate between Highlights, Notes, and Tools
3. To highlight text on a webpage:
   - Select text on any webpage
   - Click the green floating button or use the "Highlight current selection" button
4. To create a note:
   - Navigate to the Notes tab
   - Click "New Note" and fill in the details
5. To use research tools:
   - Navigate to the Tools tab
   - Choose the tool you need (DOI validation, text analysis, etc.)

## Privacy & Data Storage

All your research data (highlights, notes) is stored locally in your browser using Chrome storage API. No data is sent to external servers except when using the DOI validation feature, which queries the CrossRef API.

## Future Enhancements

- Cloud synchronization for research materials
- Additional citation styles
- Enhanced text analysis capabilities
- Collaborative research features
- Integration with reference management software

## License

MIT License

## Contact

For questions, feedback, or support, please open an issue on the GitHub repository.
