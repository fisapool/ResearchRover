import React, { useState } from 'react';

interface AIAnalysisProps {
  text: string;
  onAnalysisComplete: (analysis: AnalysisResult) => void;
}

interface AnalysisResult {
  summary: string;
  topics: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  bias: BiasAnalysis;
  keyPoints: string[];
}

interface BiasAnalysis {
  score: number; // 0-1, where 0 is completely unbiased and 1 is highly biased
  factors: string[];
  recommendations: string[];
}

export const AIAnalysis: React.FC<AIAnalysisProps> = ({ text, onAnalysisComplete }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisType, setAnalysisType] = useState<'summary' | 'topics' | 'sentiment' | 'bias'>('summary');

  const analyzeText = async () => {
    setIsAnalyzing(true);
    try {
      // This is a placeholder for the actual API call
      // You would need to implement the actual API integration
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          analysisType,
        }),
      });

      const result = await response.json();
      onAnalysisComplete(result);
    } catch (error) {
      console.error('Error analyzing text:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-lg">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">AI Analysis</h3>
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setAnalysisType('summary')}
            className={`px-4 py-2 rounded ${
              analysisType === 'summary'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Summary
          </button>
          <button
            onClick={() => setAnalysisType('topics')}
            className={`px-4 py-2 rounded ${
              analysisType === 'topics'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Topics
          </button>
          <button
            onClick={() => setAnalysisType('sentiment')}
            className={`px-4 py-2 rounded ${
              analysisType === 'sentiment'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Sentiment
          </button>
          <button
            onClick={() => setAnalysisType('bias')}
            className={`px-4 py-2 rounded ${
              analysisType === 'bias'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Bias
          </button>
        </div>
        <button
          onClick={analyzeText}
          disabled={isAnalyzing}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
        >
          {isAnalyzing ? 'Analyzing...' : 'Analyze Text'}
        </button>
      </div>

      <div className="text-sm text-gray-600">
        <p>
          {analysisType === 'summary' &&
            'Generate a concise summary of the selected text.'}
          {analysisType === 'topics' &&
            'Identify main topics and themes in the text.'}
          {analysisType === 'sentiment' &&
            'Analyze the emotional tone and sentiment of the text.'}
          {analysisType === 'bias' &&
            'Identify potential biases and provide recommendations for balanced analysis.'}
        </p>
      </div>
    </div>
  );
}; 