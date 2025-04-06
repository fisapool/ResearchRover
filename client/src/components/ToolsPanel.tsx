import React, { useState } from 'react';
import { validateDOI, formatCitation } from '../lib/doiValidator';
import { analyzeText } from '../lib/textAnalysis';
import { exportAsPDF, exportAsTXT } from '../lib/exportTools';

const ToolsPanel: React.FC = () => {
  const [doi, setDoi] = useState('');
  const [citationStyle, setCitationStyle] = useState('APA');
  const [citation, setCitation] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  const handleDoiValidation = async () => {
    if (!doi.trim()) {
      alert('Please enter a DOI');
      return;
    }

    setIsValidating(true);
    try {
      const isValid = await validateDOI(doi);
      if (isValid) {
        const formattedCitation = await formatCitation(doi, citationStyle);
        setCitation(formattedCitation);
      } else {
        setCitation('');
        alert('Invalid DOI. Please check and try again.');
      }
    } catch (error) {
      console.error('Error validating DOI:', error);
      alert('An error occurred while validating the DOI. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (!citation) {
      alert('No citation to copy');
      return;
    }

    navigator.clipboard.writeText(citation)
      .then(() => alert('Citation copied to clipboard'))
      .catch(err => {
        console.error('Failed to copy:', err);
        alert('Failed to copy citation');
      });
  };

  const handleTextAnalysis = (analysisType: string) => {
    // Send message to content script to get selected text
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(
          tabs[0].id,
          { action: "getSelection" },
          async (response) => {
            if (chrome.runtime.lastError) {
              console.error(chrome.runtime.lastError);
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
      }
    });
  };

  const handleExport = async (format: 'pdf' | 'txt') => {
    try {
      if (format === 'pdf') {
        await exportAsPDF();
        alert('Research materials exported as PDF');
      } else {
        await exportAsTXT();
        alert('Research materials exported as TXT');
      }
    } catch (error) {
      console.error(`Error exporting as ${format.toUpperCase()}:`, error);
      alert(`Failed to export as ${format.toUpperCase()}`);
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
            No text currently selected on the page
          </div>
        </div>

        {/* Export Tools */}
        <div className="bg-white border border-borderColor rounded-md p-3">
          <h3 className="font-inter font-medium text-sm mb-2 flex items-center gap-1">
            <span className="material-icons text-primary text-base">cloud_download</span>
            <span>Export Research Materials</span>
          </h3>
          <div className="text-xs text-accent mb-3">
            Export your research collections in various formats
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button 
              className="text-sm px-3 py-2 rounded font-medium text-primary flex items-center justify-center gap-1 border border-primary/50 bg-primary/5 hover:bg-primary/10"
              onClick={() => handleExport('pdf')}
            >
              <span className="material-icons text-sm">picture_as_pdf</span>
              <span>Export as PDF</span>
            </button>
            <button 
              className="text-sm px-3 py-2 rounded font-medium text-primary flex items-center justify-center gap-1 border border-primary/50 bg-primary/5 hover:bg-primary/10"
              onClick={() => handleExport('txt')}
            >
              <span className="material-icons text-sm">description</span>
              <span>Export as TXT</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToolsPanel;
