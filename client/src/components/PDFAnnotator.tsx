import React, { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Highlight } from '@shared/schema';
import { ArrowLeft, ArrowRight, Download, Plus, Save, Trash } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

// Import the PDF worker configuration
import '@/lib/pdfWorker';
import useWebSocket, { ReadyState } from '@/lib/useWebSocket';

interface PDFAnnotatorProps {
  onSaveHighlight?: (highlight: Omit<Highlight, 'id' | 'createdAt'>) => Promise<void>;
}

type Annotation = {
  id: string;
  pageNumber: number;
  content: string;
  position: { x: number; y: number; width: number; height: number };
  color: string;
  text?: string;
};

export const PDFAnnotator: React.FC<PDFAnnotatorProps> = ({ onSaveHighlight }) => {
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [selectedAnnotation, setSelectedAnnotation] = useState<Annotation | null>(null);
  const [isSelecting, setIsSelecting] = useState<boolean>(false);
  const [selectionRect, setSelectionRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [selectedText, setSelectedText] = useState<string>('');
  const [currentColor, setCurrentColor] = useState<string>('#ffeb3b'); // Yellow default
  
  const documentRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // WebSocket connection for real-time PDF annotations
  const { lastMessage, readyState, sendMessage } = useWebSocket('/pdf-ws');
  
  // Handle WebSocket messages
  useEffect(() => {
    if (lastMessage) {
      try {
        const data = JSON.parse(lastMessage.data);
        console.log('Received WebSocket message:', data);
        
        // Handle different message types
        switch (data.type) {
          case 'annotations:init':
            if (data.annotations && Array.isArray(data.annotations)) {
              setAnnotations(data.annotations);
            }
            break;
          
          case 'annotation:created':
            if (data.annotation) {
              setAnnotations(prev => [...prev, data.annotation]);
            }
            break;
            
          case 'annotation:updated':
            if (data.annotation) {
              setAnnotations(prev => 
                prev.map(a => a.id === data.annotation.id ? data.annotation : a)
              );
            }
            break;
            
          case 'annotation:deleted':
            if (data.annotationId) {
              setAnnotations(prev => prev.filter(a => a.id !== data.annotationId));
            }
            break;
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    }
  }, [lastMessage]);

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const selectedFile = files[0];
      setFile(selectedFile);
      setFileUrl(URL.createObjectURL(selectedFile));
    }
  };

  // Navigation
  const goToPrevPage = () => pageNumber > 1 && setPageNumber(pageNumber - 1);
  const goToNextPage = () => pageNumber < (numPages || 1) && setPageNumber(pageNumber + 1);

  // Document loaded handler
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
    
    // Initialize WebSocket connection for this PDF
    if (readyState === ReadyState.OPEN && fileUrl) {
      sendMessage(JSON.stringify({
        type: 'init',
        pdfUrl: fileUrl
      }));
    }
    
    toast({
      title: "PDF loaded successfully",
      description: `Document has ${numPages} pages`,
    });
  };

  // Handle selection events
  useEffect(() => {
    const handleMouseUp = (e: MouseEvent) => {
      if (!isSelecting || !documentRef.current) return;

      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        setSelectionRect(null);
        setSelectedText('');
        return;
      }

      const range = selection.getRangeAt(0);
      const selectedContent = selection.toString().trim();
      
      if (selectedContent) {
        setSelectedText(selectedContent);
        
        const rect = range.getBoundingClientRect();
        const containerRect = documentRef.current.getBoundingClientRect();
        
        // Get position relative to the container
        const relativeRect = {
          x: rect.left - containerRect.left,
          y: rect.top - containerRect.top,
          width: rect.width,
          height: rect.height
        };
        
        setSelectionRect(relativeRect);
      }
    };
    
    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, [isSelecting]);

  // Create annotation from selection
  const createAnnotation = () => {
    if (!selectionRect || !selectedText) {
      toast({
        title: "No text selected",
        description: "Please select text to annotate",
        variant: "destructive"
      });
      return;
    }

    const newAnnotation: Annotation = {
      id: `annotation-${Date.now()}`,
      pageNumber: pageNumber,
      content: '',
      position: selectionRect,
      color: currentColor,
      text: selectedText
    };

    // Update local state
    setAnnotations([...annotations, newAnnotation]);
    setSelectedAnnotation(newAnnotation);
    
    // Clear selection
    window.getSelection()?.removeAllRanges();
    setSelectionRect(null);
    setSelectedText('');
    
    // Send via WebSocket if connection is open
    if (readyState === ReadyState.OPEN && fileUrl) {
      sendMessage(JSON.stringify({
        type: 'annotation:create',
        annotation: newAnnotation,
        pdfUrl: fileUrl
      }));
    }

    toast({
      title: "Annotation created",
      description: "Add notes to your annotation"
    });
  };

  // Update annotation content
  const updateAnnotationContent = (content: string) => {
    if (!selectedAnnotation) return;
    
    const updatedAnnotation = { ...selectedAnnotation, content };
    const updatedAnnotations = annotations.map(a => 
      a.id === selectedAnnotation.id ? updatedAnnotation : a
    );
    
    // Update local state
    setSelectedAnnotation(updatedAnnotation);
    setAnnotations(updatedAnnotations);
    
    // Send update via WebSocket if connection is open
    if (readyState === ReadyState.OPEN && fileUrl) {
      sendMessage(JSON.stringify({
        type: 'annotation:update',
        annotation: updatedAnnotation,
        pdfUrl: fileUrl
      }));
    }
  };

  // Delete annotation
  const deleteAnnotation = (id: string) => {
    // Update local state
    setAnnotations(annotations.filter(a => a.id !== id));
    if (selectedAnnotation?.id === id) {
      setSelectedAnnotation(null);
    }
    
    // Send delete request via WebSocket if connection is open
    if (readyState === ReadyState.OPEN && fileUrl) {
      sendMessage(JSON.stringify({
        type: 'annotation:delete',
        annotationId: id,
        pdfUrl: fileUrl
      }));
    }
    
    toast({
      title: "Annotation deleted",
    });
  };

  // Save highlighted text
  const saveHighlight = async () => {
    if (!selectedAnnotation?.text) return;
    
    try {
      const fileName = file?.name || 'Unknown PDF';
      
      // Save highlight to the server
      if (onSaveHighlight) {
        await onSaveHighlight({
          title: `Highlight from ${fileName}`,
          text: selectedAnnotation.text,
          source: fileName,
          userId: null // Ensure userId field is included with null value
        });
      } else {
        // Add the color to the schema on the server if needed
        await fetch('/api/highlights', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: `Highlight from ${fileName}`,
            text: selectedAnnotation.text,
            source: fileName,
            userId: null
          })
        });
      }
      
      toast({
        title: "Highlight saved",
        description: "Your highlight has been saved successfully"
      });
    } catch (error) {
      toast({
        title: "Failed to save highlight",
        description: "There was an error saving your highlight",
        variant: "destructive"
      });
    }
  };

  // Render annotations for current page
  const renderAnnotations = () => {
    const currentAnnotations = annotations.filter(a => a.pageNumber === pageNumber);
    
    return currentAnnotations.map(annotation => (
      <div
        key={annotation.id}
        className="absolute cursor-pointer"
        style={{
          left: `${annotation.position.x}px`,
          top: `${annotation.position.y}px`,
          width: `${annotation.position.width}px`,
          height: `${annotation.position.height}px`,
          backgroundColor: `${annotation.color}80`, // Add transparency
          border: selectedAnnotation?.id === annotation.id ? '2px solid black' : 'none',
        }}
        onClick={() => setSelectedAnnotation(annotation)}
      />
    ));
  };

  return (
    <div className="flex flex-col h-full w-full gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold">PDF Annotator</h2>
          <div 
            className={`h-2 w-2 rounded-full ${
              readyState === ReadyState.OPEN 
                ? 'bg-green-500' 
                : readyState === ReadyState.CONNECTING 
                  ? 'bg-yellow-500' 
                  : 'bg-red-500'
            }`} 
            title={
              readyState === ReadyState.OPEN 
                ? 'Connected' 
                : readyState === ReadyState.CONNECTING 
                  ? 'Connecting' 
                  : 'Disconnected'
            }
          />
        </div>
        <div className="flex gap-2">
          <Input 
            type="file" 
            accept=".pdf" 
            onChange={handleFileChange} 
            className="max-w-xs"
          />
          <Button
            variant="outline"
            onClick={() => setIsSelecting(!isSelecting)}
            className={isSelecting ? 'bg-blue-200' : ''}
          >
            {isSelecting ? 'Cancel Selection' : 'Start Selection'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
        <div className="md:col-span-2 border rounded-md p-2 h-[700px] overflow-auto relative">
          {fileUrl ? (
            <div ref={documentRef} className="relative">
              <Document
                file={fileUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                error={<p>Failed to load PDF document.</p>}
                loading={<p>Loading PDF...</p>}
              >
                <Page 
                  pageNumber={pageNumber} 
                  scale={scale}
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                />
                {renderAnnotations()}
              </Document>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Upload a PDF to begin</p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          {fileUrl && (
            <>
              <Card>
                <CardContent className="pt-4">
                  <h3 className="font-medium mb-2">Document Controls</h3>
                  <div className="flex items-center justify-between mb-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={goToPrevPage} 
                      disabled={pageNumber <= 1}
                    >
                      <ArrowLeft className="h-4 w-4 mr-1" /> Prev
                    </Button>
                    <span>
                      Page {pageNumber} of {numPages || '?'}
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={goToNextPage} 
                      disabled={pageNumber >= (numPages || 1)}
                    >
                      Next <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Zoom: {Math.round(scale * 100)}%</span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setScale(s => Math.max(0.5, s - 0.1))}>-</Button>
                      <Button size="sm" variant="outline" onClick={() => setScale(1.0)}>Reset</Button>
                      <Button size="sm" variant="outline" onClick={() => setScale(s => Math.min(2.0, s + 0.1))}>+</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <h3 className="font-medium mb-2">Annotation Tools</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {['#ffeb3b', '#4caf50', '#2196f3', '#f44336', '#9c27b0'].map(color => (
                      <div
                        key={color}
                        className={`w-6 h-6 rounded-full cursor-pointer ${currentColor === color ? 'ring-2 ring-black' : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => setCurrentColor(color)}
                      />
                    ))}
                  </div>
                  
                  {selectionRect && (
                    <Button 
                      className="w-full mb-2" 
                      onClick={createAnnotation}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Annotation
                    </Button>
                  )}
                </CardContent>
              </Card>

              {selectedAnnotation && (
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium">Annotation Details</h3>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={saveHighlight}
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => deleteAnnotation(selectedAnnotation.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <Separator className="my-2" />
                    
                    <div className="mb-4">
                      <p className="text-sm text-gray-500 mb-1">Selected Text:</p>
                      <div 
                        className="text-sm p-2 border rounded-md" 
                        style={{ backgroundColor: `${selectedAnnotation.color}40` }}
                      >
                        {selectedAnnotation.text || "No text selected"}
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Notes:</p>
                      <textarea
                        value={selectedAnnotation.content}
                        onChange={(e) => updateAnnotationContent(e.target.value)}
                        placeholder="Add notes about this annotation..."
                        className="w-full p-2 border rounded-md text-sm h-24"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PDFAnnotator;