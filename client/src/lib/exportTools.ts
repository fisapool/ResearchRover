import { getHighlights, getNotes } from './storage';
import { Highlight, Note } from '@shared/schema';

/**
 * Export user research materials (highlights and notes) as a PDF
 * This creates an HTML file that can be printed to PDF by the browser
 */
export const exportAsPDF = async (): Promise<void> => {
  try {
    // Fetch data
    const [highlights, notes] = await Promise.all([
      getHighlights(),
      getNotes(),
    ]);
    
    // Generate HTML content
    const htmlContent = generateHTMLContent(highlights, notes);
    
    // Create a Blob with the HTML content
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    // Open the HTML in a new tab for printing
    const newWindow = window.open(url, '_blank');
    
    if (newWindow) {
      // Once the content is loaded, trigger print dialog
      newWindow.addEventListener('load', () => {
        setTimeout(() => {
          newWindow.print();
        }, 500); // Small delay to ensure content is rendered
      });
    } else {
      alert('Please allow pop-ups to export as PDF. After the HTML opens in a new tab, use your browser\'s print function to save as PDF.');
      
      // Fallback to download if pop-up blocked
      const a = document.createElement('a');
      a.href = url;
      a.download = `research_export_${formatDateForFilename()}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
    
    // Clean up the URL after a delay
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 60000); // Give the user time to save the PDF
    
  } catch (error) {
    console.error('Error exporting as PDF:', error);
    alert('Failed to export as PDF. Please try again.');
    throw error;
  }
};

/**
 * Export user research materials as a plain text file
 */
export const exportAsTXT = async (): Promise<void> => {
  try {
    // Fetch data
    const [highlights, notes] = await Promise.all([
      getHighlights(),
      getNotes(),
    ]);
    
    // Generate plain text content
    const textContent = generateTextContent(highlights, notes);
    
    // Create and download the file
    downloadFile(textContent, `research_export_${formatDateForFilename()}.txt`, 'text/plain');
    
  } catch (error) {
    console.error('Error exporting as TXT:', error);
    alert('Failed to export as text file. Please try again.');
    throw error;
  }
};

/**
 * Export user research materials as HTML file
 */
export const exportAsHTML = async (): Promise<void> => {
  try {
    // Fetch data
    const [highlights, notes] = await Promise.all([
      getHighlights(),
      getNotes(),
    ]);
    
    // Generate HTML content
    const htmlContent = generateHTMLContent(highlights, notes);
    
    // Create and download the file
    downloadFile(htmlContent, `research_export_${formatDateForFilename()}.html`, 'text/html');
    
  } catch (error) {
    console.error('Error exporting as HTML:', error);
    alert('Failed to export as HTML. Please try again.');
    throw error;
  }
};

/**
 * Export user research materials as CSV for spreadsheet import
 */
export const exportAsCSV = async (): Promise<void> => {
  try {
    // Fetch data
    const [highlights, notes] = await Promise.all([
      getHighlights(),
      getNotes(),
    ]);
    
    // Generate CSV content
    const csvContent = generateCSVContent(highlights, notes);
    
    // Create and download the file
    downloadFile(csvContent, `research_export_${formatDateForFilename()}.csv`, 'text/csv');
    
  } catch (error) {
    console.error('Error exporting as CSV:', error);
    alert('Failed to export as CSV. Please try again.');
    throw error;
  }
};

/**
 * Helper function to generate formatted HTML content
 */
function generateHTMLContent(highlights: Highlight[], notes: Note[]): string {
  const currentDate = new Date().toLocaleString();
  
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Research Export - ${currentDate}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    h1, h2 {
      color: #1E88E5;
    }
    .highlight, .note {
      border: 1px solid #ddd;
      padding: 15px;
      margin-bottom: 15px;
      border-radius: 5px;
    }
    .highlight h3, .note h3 {
      margin-top: 0;
      color: #333;
    }
    .meta {
      color: #666;
      font-size: 0.9em;
    }
    .text {
      margin: 10px 0;
    }
    .source {
      font-style: italic;
      color: #666;
    }
    .category {
      display: inline-block;
      background: #f0f0f0;
      padding: 3px 8px;
      border-radius: 12px;
      font-size: 0.8em;
    }
    @media print {
      body {
        font-size: 12pt;
      }
      .no-print {
        display: none;
      }
      .page-break {
        page-break-after: always;
      }
    }
  </style>
</head>
<body>
  <div class="no-print" style="background-color: #f5f5f5; padding: 10px; margin-bottom: 20px; border-radius: 5px;">
    <p><strong>To save as PDF:</strong> Use your browser's print function (Ctrl+P or Cmd+P) and select "Save as PDF" as the destination.</p>
  </div>

  <h1>Research Assistant Export</h1>
  <p>Generated: ${currentDate}</p>

  <h2>Highlights (${highlights.length})</h2>
  ${highlights.length === 0 ? 
    '<p>No highlights saved yet.</p>' :
    highlights.map((highlight, index) => `
      <div class="highlight">
        <h3>${escapeHtml(highlight.title)}</h3>
        <div class="text">${escapeHtml(highlight.text)}</div>
        <div class="source">Source: ${escapeHtml(highlight.source)}</div>
        <div class="meta">Created: ${new Date(highlight.createdAt).toLocaleString()}</div>
      </div>
    `).join('')
  }

  <div class="page-break"></div>

  <h2>Notes (${notes.length})</h2>
  ${notes.length === 0 ?
    '<p>No notes saved yet.</p>' :
    notes.map((note, index) => `
      <div class="note">
        <h3>${escapeHtml(note.title)}</h3>
        <div class="category">${escapeHtml(note.category)}</div>
        <div class="text">${escapeHtml(note.content).replace(/\n/g, '<br>')}</div>
        <div class="meta">Last Updated: ${new Date(note.updatedAt).toLocaleString()}</div>
      </div>
    `).join('')
  }

  <footer style="margin-top: 30px; padding-top: 10px; border-top: 1px solid #ddd; font-size: 0.8em; color: #666;">
    Generated by Research Assistant on ${currentDate}
  </footer>
</body>
</html>`;
}

/**
 * Helper function to generate plain text content
 */
function generateTextContent(highlights: Highlight[], notes: Note[]): string {
  const currentDate = new Date().toLocaleString();
  
  let content = `RESEARCH ASSISTANT EXPORT\n`;
  content += `Generated: ${currentDate}\n\n`;
  
  // Add highlights section
  content += `===== HIGHLIGHTS (${highlights.length}) =====\n\n`;
  
  if (highlights.length === 0) {
    content += 'No highlights saved yet.\n\n';
  } else {
    highlights.forEach((highlight, index) => {
      content += `[${index + 1}] "${highlight.title}"\n`;
      content += `Text: ${highlight.text}\n`;
      content += `Source: ${highlight.source}\n`;
      content += `Created: ${new Date(highlight.createdAt).toLocaleString()}\n\n`;
    });
  }
  
  // Add notes section
  content += `===== NOTES (${notes.length}) =====\n\n`;
  
  if (notes.length === 0) {
    content += 'No notes saved yet.\n\n';
  } else {
    notes.forEach((note, index) => {
      content += `[${index + 1}] "${note.title}" (${note.category})\n`;
      content += `${note.content}\n\n`;
      content += `Last Updated: ${new Date(note.updatedAt).toLocaleString()}\n\n`;
    });
  }
  
  return content;
}

/**
 * Helper function to generate CSV content
 */
function generateCSVContent(highlights: Highlight[], notes: Note[]): string {
  let content = '';
  
  // Helper to escape CSV fields
  const escapeCSV = (field: any): string => {
    if (field === null || field === undefined) return '';
    const str = String(field);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };
  
  // Add highlights to CSV
  if (highlights.length > 0) {
    content += 'Type,ID,Title,Text,Source,Created At\n';
    
    highlights.forEach(highlight => {
      content += [
        escapeCSV('Highlight'),
        escapeCSV(highlight.id),
        escapeCSV(highlight.title),
        escapeCSV(highlight.text),
        escapeCSV(highlight.source),
        escapeCSV(new Date(highlight.createdAt).toLocaleString())
      ].join(',') + '\n';
    });
    
    // Add a blank line between sections
    content += '\n';
  }
  
  // Add notes to CSV
  if (notes.length > 0) {
    content += 'Type,ID,Title,Category,Content,Created At,Updated At\n';
    
    notes.forEach(note => {
      content += [
        escapeCSV('Note'),
        escapeCSV(note.id),
        escapeCSV(note.title),
        escapeCSV(note.category),
        escapeCSV(note.content),
        escapeCSV(new Date(note.createdAt).toLocaleString()),
        escapeCSV(new Date(note.updatedAt).toLocaleString())
      ].join(',') + '\n';
    });
  }
  
  return content;
}

/**
 * Helper function to download a file
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
  // Create a Blob with the content
  const blob = new Blob([content], { type: mimeType });
  
  // Create download URL
  const url = URL.createObjectURL(blob);
  
  // Create download link
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  
  // Trigger download
  document.body.appendChild(a);
  a.click();
  
  // Clean up
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

/**
 * Helper function to format date for filenames
 */
function formatDateForFilename(): string {
  const now = new Date();
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0')
  ].join('-');
}

/**
 * Helper function to escape HTML (prevent XSS in exports)
 */
function escapeHtml(text: string): string {
  if (!text) return '';
  
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
