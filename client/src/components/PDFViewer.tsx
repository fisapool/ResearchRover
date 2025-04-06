import React, { useState, useRef, useEffect } from 'react';
import { Highlight } from '../lib/types';
import { v4 as uuidv4 } from 'uuid';

interface PDFViewerProps {
  pdfUrl: string;
  highlights: Highlight[];
  onHighlightCreate: (highlight: Highlight) => void;
  onHighlightDelete: (highlightId: string) => void;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({
  pdfUrl,
  highlights,
  onHighlightCreate,
  onHighlightDelete,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.0);
  const [selection, setSelection] = useState<{ text: string; rect: DOMRect } | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pdfDocRef = useRef<any>(null);

  useEffect(() => {
    // Load PDF using pdf.js
    const loadPDF = async () => {
      const pdfjsLib = window['pdfjs-dist/build/pdf'];
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

      try {
        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        pdfDocRef.current = await loadingTask.promise;
        setTotalPages(pdfDocRef.current.numPages);
        renderPage(currentPage);
      } catch (error) {
        console.error('Error loading PDF:', error);
      }
    };

    loadPDF();
  }, [pdfUrl]);

  const renderPage = async (pageNumber: number) => {
    if (!pdfDocRef.current) return;

    const page = await pdfDocRef.current.getPage(pageNumber);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const viewport = page.getViewport({ scale });
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: canvas.getContext('2d'),
      viewport: viewport,
    };

    await page.render(renderContext).promise;
    renderHighlights();
  };

  const renderHighlights = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    highlights.forEach((highlight) => {
      if (highlight.pageNumber === currentPage) {
        ctx.fillStyle = highlight.color;
        ctx.globalAlpha = 0.3;
        // Convert highlight coordinates to canvas coordinates
        // This is a simplified version - you'll need to implement proper coordinate conversion
        ctx.fillRect(highlight.x, highlight.y, highlight.width, highlight.height);
      }
    });
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsSelecting(true);
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsSelecting(false);
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const canvas = canvasRef.current;
      if (canvas) {
        const canvasRect = canvas.getBoundingClientRect();
        setSelection({
          text: selection.toString(),
          rect: new DOMRect(
            rect.left - canvasRect.left,
            rect.top - canvasRect.top,
            rect.width,
            rect.height
          ),
        });
      }
    }
  };

  const handleHighlightCreate = (color: string) => {
    if (selection) {
      const highlight: Highlight = {
        id: uuidv4(),
        text: selection.text,
        sourceUrl: pdfUrl,
        pageNumber: currentPage,
        color,
        x: selection.rect.x,
        y: selection.rect.y,
        width: selection.rect.width,
        height: selection.rect.height,
        noteId: '', // This should be set when creating a note from the highlight
        createdAt: new Date(),
      };
      onHighlightCreate(highlight);
      setSelection(null);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 flex items-center gap-4">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          Next
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setScale((prev) => Math.max(0.5, prev - 0.1))}
            className="px-4 py-2 bg-gray-200 rounded"
          >
            -
          </button>
          <span>{Math.round(scale * 100)}%</span>
          <button
            onClick={() => setScale((prev) => Math.min(2, prev + 0.1))}
            className="px-4 py-2 bg-gray-200 rounded"
          >
            +
          </button>
        </div>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          className="border border-gray-300"
        />
        {selection && (
          <div className="absolute top-0 right-0 bg-white p-2 rounded shadow-lg">
            <div className="flex gap-2">
              <button
                onClick={() => handleHighlightCreate('#ffeb3b')}
                className="w-6 h-6 bg-yellow-300 rounded"
              />
              <button
                onClick={() => handleHighlightCreate('#a5d6a7')}
                className="w-6 h-6 bg-green-300 rounded"
              />
              <button
                onClick={() => handleHighlightCreate('#90caf9')}
                className="w-6 h-6 bg-blue-300 rounded"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 