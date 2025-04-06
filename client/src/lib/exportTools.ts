import { getHighlights } from './storage';
import { getNotes } from './storage';
import { Highlight, Note } from '@shared/schema';

// Function to export research materials as PDF
export const exportAsPDF = async (): Promise<void> => {
  try {
    // In a real implementation, this would use html2pdf.js or a similar library
    // For demo purposes, we'll simulate PDF generation
    
    const [highlights, notes] = await Promise.all([
      getHighlights(),
      getNotes(),
    ]);
    
    const content = generateExportContent(highlights, notes);
    
    // In a real implementation, this would generate and download a PDF
    // For now, we'll log the content that would be in the PDF
    console.log('PDF Content:', content);
    
    // Simulate PDF download
    simulateDownload('research_materials.pdf', 'application/pdf');
    
    return Promise.resolve();
  } catch (error) {
    console.error('Error exporting as PDF:', error);
    throw error;
  }
};

// Function to export research materials as TXT
export const exportAsTXT = async (): Promise<void> => {
  try {
    const [highlights, notes] = await Promise.all([
      getHighlights(),
      getNotes(),
    ]);
    
    const content = generateExportContent(highlights, notes);
    
    // Create a Blob with the content
    const blob = new Blob([content], { type: 'text/plain' });
    
    // Create a download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'research_materials.txt';
    
    // Trigger download
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
    
    return Promise.resolve();
  } catch (error) {
    console.error('Error exporting as TXT:', error);
    throw error;
  }
};

// Helper function to generate export content
const generateExportContent = (highlights: Highlight[], notes: Note[]): string => {
  const date = new Date().toLocaleDateString();
  
  let content = `Research Materials - Exported on ${date}\n\n`;
  
  // Add highlights
  content += `======== HIGHLIGHTS (${highlights.length}) ========\n\n`;
  
  if (highlights.length === 0) {
    content += 'No highlights saved.\n\n';
  } else {
    highlights.forEach((highlight, index) => {
      content += `[${index + 1}] "${highlight.title}"\n`;
      content += `Text: ${highlight.text}\n`;
      content += `Source: ${highlight.source}\n`;
      content += `Date: ${new Date(highlight.createdAt).toLocaleDateString()}\n\n`;
    });
  }
  
  // Add notes
  content += `======== NOTES (${notes.length}) ========\n\n`;
  
  if (notes.length === 0) {
    content += 'No notes saved.\n\n';
  } else {
    notes.forEach((note, index) => {
      content += `[${index + 1}] "${note.title}" (${note.category})\n`;
      content += `${note.content}\n`;
      content += `Last edited: ${new Date(note.updatedAt).toLocaleDateString()}\n\n`;
    });
  }
  
  return content;
};

// Helper function to simulate file download for demo purposes
const simulateDownload = (filename: string, mimeType: string): void => {
  // Create a placeholder element
  const a = document.createElement('a');
  a.href = '#';
  a.download = filename;
  
  // Show alert instead of actual download since we can't generate real files
  alert(`In a real extension, this would download a ${mimeType.split('/')[1].toUpperCase()} file named "${filename}"`);
  
  // Simulate click
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};
