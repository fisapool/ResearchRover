import { pdfjs } from 'react-pdf';

// Set the worker source for PDF.js using a CDN URL
// This is more reliable than trying to use a local file in a Vite environment
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

// Export for convenience
export default pdfjs.GlobalWorkerOptions;