import React, { useState, useEffect } from 'react';
import { validateDOI, formatCitation } from '../lib/doiValidator';
import { analyzeText } from '../lib/textAnalysis';
import { exportAsPDF, exportAsTXT, exportAsHTML, exportAsCSV } from '../lib/exportTools';
import { getHighlights, getNotes } from '../lib/storage';
import { Highlight, Note } from '@shared/schema';

// Interface for export configuration
interface ExportConfig {
  format: 'pdf' | 'txt' | 'html' | 'csv';
  includeHighlights: boolean;
  includeNotes: boolean;
}

const ToolsPanel: React.FC = () => {
  // State for DOI validator
  const [doi, setDoi] = useState('');
  const [citationStyle, setCitationStyle] = useState('APA');
  const [citation, setCitation] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  
  // State for exports
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportConfig, setExportConfig] = useState<ExportConfig>({
    format: 'pdf',
    includeHighlights: true,
    includeNotes: true
  });

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [highlightsData, notesData] = await Promise.all([
          getHighlights(),
          getNotes()
        ]);
        setHighlights(highlightsData);
        setNotes(notesData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Handle DOI validation
  const handleDoiValidation = async () => {
    if (!doi.trim()) {
      alert('Please enter a DOI');
      return;
    }

    setIsValidating(true);
    setCitation('');
    
    try {
      const isValid = await validateDOI(doi);
      if (isValid) {
        const formattedCitation = await formatCitation(doi, citationStyle);
        setCitation(formattedCitation);
      } else {
        alert('Invalid DOI. Please check and try again.');
      }
    } catch (error) {
      console.error('Error validating DOI:', error);
      alert('An error occurred while validating the DOI. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  // Copy citation to clipboard
  const handleCopyToClipboard = () => {
    if (!citation) {
      alert('No citation to copy');
      return;
    }

    // Strip HTML tags for clipboard
    const stripHtml = (html: string) => {
      const temp = document.createElement('div');
      temp.innerHTML = html;
      return temp.textContent || temp.innerText || '';
    };

    navigator.clipboard.writeText(stripHtml(citation))
      .then(() => alert('Citation copied to clipboard'))
      .catch(err => {
        console.error('Failed to copy:', err);
        alert('Failed to copy citation');
      });
  };

  // Handle text analysis
  const handleTextAnalysis = (analysisType: string) => {
    // Send message to content script to get selected text
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(
            tabs[0].id,
            { action: "getSelection" },
            async (response) => {
              if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError);
                alert('Unable to access page content. Make sure you are on a webpage and try again.');
                return;
              }
              
              if (response && response.selectedText) {
                try {
                  const result = await analyzeText(response.selectedText, analysisType);
                  // In a real implementation, this would show the result in a panel
                  alert(result);
                } catch (error) {
                  console.error('Error analyzing text:', error);
                  alert('An error occurred during text analysis');
                }
              } else {
                alert('No text selected. Please select text on the page first.');
              }
            }
          );
        } else {
          alert('No active tab found. Please make sure you have a page open.');
        }
      });
    } else {
      // Fallback for when running in development environment
      alert('This feature requires the Chrome extension environment.');
    }
  };

  // Handle research material export
  const handleExport = async () => {
    if (!exportConfig.includeHighlights && !exportConfig.includeNotes) {
      alert('Please select at least one content type to export (highlights or notes)');
      return;
    }
    
    setIsExporting(true);
    
    try {
      switch (exportConfig.format) {
        case 'pdf':
          await exportAsPDF();
          break;
        case 'txt':
          await exportAsTXT();
          break;
        case 'html':
          await exportAsHTML();
          break;
        case 'csv':
          await exportAsCSV();
          break;
      }
    } catch (error) {
      console.error(`Error exporting as ${exportConfig.format.toUpperCase()}:`, error);
      alert(`Failed to export as ${exportConfig.format.toUpperCase()}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div id="panel-tools" className="tab-panel flex flex-col flex-1 overflow-y-auto" role="tabpanel">
      <div className="p-4">
        <h2 className="font-inter font-semibold text-base mb-4">Research Tools</h2>

        {/* DOI Validator */}
        <div className="bg-white border border-borderColor rounded-md p-3 mb-4">
          <h3 className="font-inter font-medium text-sm mb-2 flex items-center gap-1">
            <span className="material-icons text-primary text-base">verified</span>
            <span>DOI Validator & Citation</span>
          </h3>
          <div className="mb-3">
            <label htmlFor="doi-input" className="text-xs text-accent block mb-1">Enter DOI (e.g., 10.1000/xyz123)</label>
            <div className="flex gap-2">
              <input 
                id="doi-input" 
                type="text" 
                className="flex-1 border border-borderColor rounded px-3 py-2 text-sm focus-visible" 
                placeholder="10.1000/xyz123"
                value={doi}
                onChange={(e) => setDoi(e.target.value)}
              />
              <button 
                className="bg-primary hover:bg-primary/90 text-white py-1 px-3 rounded font-inter font-medium text-sm"
                onClick={handleDoiValidation}
                disabled={isValidating}
              >
                {isValidating ? 'Validating...' : 'Validate'}
              </button>
            </div>
          </div>
          
          {citation && (
            <div className="bg-lightGray p-3 rounded text-sm mb-3">
              <p className="font-medium mb-1">Citation Preview ({citationStyle}):</p>
              <p className="text-text" dangerouslySetInnerHTML={{ __html: citation }}></p>
            </div>
          )}
          
          <div className="flex justify-end">
            <div className="flex gap-2">
              <select 
                className="text-sm border border-borderColor rounded px-2 py-1"
                value={citationStyle}
                onChange={(e) => setCitationStyle(e.target.value)}
              >
                <option>APA</option>
                <option>MLA</option>
                <option>Chicago</option>
                <option>Harvard</option>
                <option>IEEE</option>
              </select>
              <button 
                className="text-primary hover:text-primary/80 border border-primary/50 bg-primary/5 hover:bg-primary/10 py-1 px-3 rounded font-inter font-medium text-sm flex items-center gap-1"
                onClick={handleCopyToClipboard}
                disabled={!citation}
              >
                <span className="material-icons text-sm">content_copy</span>
                <span>Copy</span>
              </button>
            </div>
          </div>
        </div>

        {/* Text Analysis */}
        <div className="bg-white border border-borderColor rounded-md p-3 mb-4">
          <h3 className="font-inter font-medium text-sm mb-2 flex items-center gap-1">
            <span className="material-icons text-primary text-base">psychology</span>
            <span>Text Analysis</span>
          </h3>
          <div className="text-xs text-accent mb-2">
            Highlight text on any webpage and analyze it using one of these options:
          </div>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <button 
              className="text-sm bg-lightGray hover:bg-lightGray/80 px-3 py-2 rounded font-medium text-text flex items-center justify-center gap-1 border border-borderColor"
              onClick={() => handleTextAnalysis('summarize')}
            >
              <span className="material-icons text-sm">summarize</span>
              <span>Summarize</span>
            </button>
            <button 
              className="text-sm bg-lightGray hover:bg-lightGray/80 px-3 py-2 rounded font-medium text-text flex items-center justify-center gap-1 border border-borderColor"
              onClick={() => handleTextAnalysis('keypoints')}
            >
              <span className="material-icons text-sm">list</span>
              <span>Key Points</span>
            </button>
            <button 
              className="text-sm bg-lightGray hover:bg-lightGray/80 px-3 py-2 rounded font-medium text-text flex items-center justify-center gap-1 border border-borderColor"
              onClick={() => handleTextAnalysis('questions')}
            >
              <span className="material-icons text-sm">help_outline</span>
              <span>Research Questions</span>
            </button>
            <button 
              className="text-sm bg-lightGray hover:bg-lightGray/80 px-3 py-2 rounded font-medium text-text flex items-center justify-center gap-1 border border-borderColor"
              onClick={() => handleTextAnalysis('citations')}
            >
              <span className="material-icons text-sm">format_quote</span>
              <span>Find Citations</span>
            </button>
          </div>
          <div className="text-xs text-accent text-center">
            Select text on a webpage before using these tools
          </div>
        </div>

        {/* Export Tools */}
        <div className="bg-white border border-borderColor rounded-md p-3">
          <h3 className="font-inter font-medium text-sm mb-2 flex items-center gap-1">
            <span className="material-icons text-primary text-base">cloud_download</span>
            <span>Export Research Materials</span>
          </h3>
          <div className="text-xs text-accent mb-3">
            Export your research materials in various formats
          </div>
          
          <div className="mb-3">
            <div className="flex flex-col mb-3">
              <label className="text-sm mb-2">Content to Export:</label>
              <div className="flex flex-col gap-2">
                <label className="flex items-center text-sm">
                  <input 
                    type="checkbox" 
                    className="mr-2" 
                    checked={exportConfig.includeHighlights}
                    onChange={(e) => setExportConfig({...exportConfig, includeHighlights: e.target.checked})}
                  />
                  Include Highlights ({highlights.length})
                </label>
                <label className="flex items-center text-sm">
                  <input 
                    type="checkbox" 
                    className="mr-2" 
                    checked={exportConfig.includeNotes}
                    onChange={(e) => setExportConfig({...exportConfig, includeNotes: e.target.checked})}
                  />
                  Include Notes ({notes.length})
                </label>
              </div>
            </div>
            
            <div className="mb-3">
              <label className="text-sm mb-2">Export Format:</label>
              <div className="grid grid-cols-2 gap-2">
                <label className={`flex items-center justify-center text-sm p-2 rounded border ${exportConfig.format === 'pdf' ? 'border-primary bg-primary/10' : 'border-borderColor'} cursor-pointer`}>
                  <input 
                    type="radio" 
                    className="hidden" 
                    checked={exportConfig.format === 'pdf'}
                    onChange={() => setExportConfig({...exportConfig, format: 'pdf'})}
                  />
                  <span className="material-icons text-sm mr-1">picture_as_pdf</span>
                  PDF
                </label>
                <label className={`flex items-center justify-center text-sm p-2 rounded border ${exportConfig.format === 'txt' ? 'border-primary bg-primary/10' : 'border-borderColor'} cursor-pointer`}>
                  <input 
                    type="radio" 
                    className="hidden" 
                    checked={exportConfig.format === 'txt'}
                    onChange={() => setExportConfig({...exportConfig, format: 'txt'})}
                  />
                  <span className="material-icons text-sm mr-1">description</span>
                  TXT
                </label>
                <label className={`flex items-center justify-center text-sm p-2 rounded border ${exportConfig.format === 'html' ? 'border-primary bg-primary/10' : 'border-borderColor'} cursor-pointer`}>
                  <input 
                    type="radio" 
                    className="hidden" 
                    checked={exportConfig.format === 'html'}
                    onChange={() => setExportConfig({...exportConfig, format: 'html'})}
                  />
                  <span className="material-icons text-sm mr-1">code</span>
                  HTML
                </label>
                <label className={`flex items-center justify-center text-sm p-2 rounded border ${exportConfig.format === 'csv' ? 'border-primary bg-primary/10' : 'border-borderColor'} cursor-pointer`}>
                  <input 
                    type="radio" 
                    className="hidden" 
                    checked={exportConfig.format === 'csv'}
                    onChange={() => setExportConfig({...exportConfig, format: 'csv'})}
                  />
                  <span className="material-icons text-sm mr-1">table_chart</span>
                  CSV
                </label>
              </div>
            </div>
          </div>
          
          <button 
            className="w-full text-sm py-2 rounded font-medium text-white bg-primary hover:bg-primary/90 flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleExport}
            disabled={isExporting || (!exportConfig.includeHighlights && !exportConfig.includeNotes)}
          >
            {isExporting ? (
              <>
                <span className="material-icons animate-spin text-sm">refresh</span>
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <span className="material-icons text-sm">file_download</span>
                <span>Export Data</span>
              </>
            )}
          </button>
          
          {(!exportConfig.includeHighlights && !exportConfig.includeNotes) && (
            <p className="text-xs text-red-500 mt-2 text-center">
              Please select at least one content type to export
            </p>
          )}
          
          {exportConfig.format === 'pdf' && (
            <p className="text-xs text-accent mt-2 text-center">
              PDF export will open in a new tab. Use your browser's print function to save as PDF.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ToolsPanel;
