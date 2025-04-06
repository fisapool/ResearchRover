import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Download, PieChart as PieChartIcon, BarChart2, LineChart as LineChartIcon } from 'lucide-react';
import { Note, Highlight } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

interface DataVisualizationProps {
  notes: Note[];
  highlights: Highlight[];
}

// Chart color palette
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

// Simple export function
const exportData = (data: any[], format: string, filename: string) => {
  let content = '';
  let mimeType = '';
  let extension = '';

  if (format === 'csv') {
    // Create CSV content
    if (data.length > 0) {
      const headers = Object.keys(data[0]).join(',');
      const rows = data.map(item => Object.values(item).join(',')).join('\n');
      content = `${headers}\n${rows}`;
    }
    mimeType = 'text/csv';
    extension = 'csv';
  } else if (format === 'json') {
    // Create JSON content
    content = JSON.stringify(data, null, 2);
    mimeType = 'application/json';
    extension = 'json';
  }

  // Create and trigger download
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.${extension}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const DataVisualization: React.FC<DataVisualizationProps> = ({ notes, highlights }) => {
  const [activeChart, setActiveChart] = useState<'bar' | 'pie' | 'line'>('bar');
  const [activeDataType, setActiveDataType] = useState<'categories' | 'timeline' | 'wordCount' | 'sources'>('categories');
  const { toast } = useToast();

  // Prepare data for charts
  const getCategoryData = () => {
    const categories: Record<string, number> = {};
    
    notes.forEach(note => {
      const category = note.category || 'Uncategorized';
      categories[category] = (categories[category] || 0) + 1;
    });
    
    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  };

  const getTimelineData = () => {
    const months: Record<string, { notes: number, highlights: number }> = {};
    
    // Process notes
    notes.forEach(note => {
      const date = new Date(note.createdAt);
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
      
      if (!months[monthYear]) {
        months[monthYear] = { notes: 0, highlights: 0 };
      }
      
      months[monthYear].notes += 1;
    });
    
    // Process highlights
    highlights.forEach(highlight => {
      const date = new Date(highlight.createdAt);
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
      
      if (!months[monthYear]) {
        months[monthYear] = { notes: 0, highlights: 0 };
      }
      
      months[monthYear].highlights += 1;
    });
    
    // Convert to array and sort by date
    return Object.entries(months)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => {
        const [aMonth, aYear] = a.name.split('/').map(Number);
        const [bMonth, bYear] = b.name.split('/').map(Number);
        return (aYear * 12 + aMonth) - (bYear * 12 + bMonth);
      });
  };

  const getWordCountData = () => {
    // Create ranges for word counts
    const ranges = [
      { min: 0, max: 50, label: '0-50' },
      { min: 51, max: 100, label: '51-100' },
      { min: 101, max: 200, label: '101-200' },
      { min: 201, max: 500, label: '201-500' },
      { min: 501, max: Infinity, label: '500+' }
    ];
    
    const countByRange: Record<string, number> = {};
    ranges.forEach(range => {
      countByRange[range.label] = 0;
    });
    
    // Count notes in each range
    notes.forEach(note => {
      const wordCount = note.content.split(/\s+/).filter(Boolean).length;
      const range = ranges.find(r => wordCount >= r.min && wordCount <= r.max);
      if (range) {
        countByRange[range.label]++;
      }
    });
    
    return Object.entries(countByRange).map(([name, value]) => ({ name, value }));
  };

  const getSourceData = () => {
    const sources: Record<string, number> = {};
    
    highlights.forEach(highlight => {
      const source = highlight.source || 'Unknown';
      sources[source] = (sources[source] || 0) + 1;
    });
    
    return Object.entries(sources)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value) // Sort by count descending
      .slice(0, 10); // Top 10 sources
  };

  // Get the appropriate data based on activeDataType
  const getChartData = () => {
    switch (activeDataType) {
      case 'categories':
        return getCategoryData();
      case 'timeline':
        return getTimelineData();
      case 'wordCount':
        return getWordCountData();
      case 'sources':
        return getSourceData();
      default:
        return [];
    }
  };

  const handleExport = (format: 'csv' | 'json') => {
    const data = getChartData();
    const filename = `research_data_${activeDataType}_${new Date().toISOString().slice(0, 10)}`;
    exportData(data, format, filename);
    
    toast({
      title: "Data exported",
      description: `Successfully exported ${activeDataType} data as ${format.toUpperCase()}`
    });
  };

  // Get chart title
  const getChartTitle = () => {
    switch (activeDataType) {
      case 'categories':
        return 'Notes by Category';
      case 'timeline':
        return 'Research Activity Timeline';
      case 'wordCount':
        return 'Notes by Word Count';
      case 'sources':
        return 'Top Highlight Sources';
      default:
        return '';
    }
  };

  // Render the appropriate chart based on activeChart
  const renderChart = () => {
    const data = getChartData();
    
    if (data.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 text-gray-500">
          No data available for visualization
        </div>
      );
    }

    switch (activeChart) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              {activeDataType === 'timeline' ? (
                <>
                  <Bar dataKey="notes" fill="#0088FE" name="Notes" />
                  <Bar dataKey="highlights" fill="#00C49F" name="Highlights" />
                </>
              ) : (
                <Bar dataKey="value" fill="#0088FE" name="Count" />
              )}
            </BarChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={true}
                outerRadius={150}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name, props) => [value, props.payload.name]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'line':
        if (activeDataType === 'timeline') {
          return (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="notes" stroke="#0088FE" name="Notes" />
                <Line type="monotone" dataKey="highlights" stroke="#00C49F" name="Highlights" />
              </LineChart>
            </ResponsiveContainer>
          );
        } else {
          return (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#0088FE" name="Count" />
              </LineChart>
            </ResponsiveContainer>
          );
        }

      default:
        return null;
    }
  };

  // Chart switcher component
  const ChartTypeSwitcher = () => (
    <div className="flex space-x-2">
      <Button
        variant={activeChart === 'bar' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setActiveChart('bar')}
      >
        <BarChart2 className="h-4 w-4 mr-2" />
        Bar
      </Button>
      <Button
        variant={activeChart === 'pie' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setActiveChart('pie')}
      >
        <PieChartIcon className="h-4 w-4 mr-2" />
        Pie
      </Button>
      <Button
        variant={activeChart === 'line' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setActiveChart('line')}
      >
        <LineChartIcon className="h-4 w-4 mr-2" />
        Line
      </Button>
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Research Data Visualization</h2>
        
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleExport('csv')}>
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('json')}>
                Export as JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <ChartTypeSwitcher />
        </div>
      </div>
      
      <Tabs defaultValue="categories" onValueChange={(v) => setActiveDataType(v as any)}>
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="wordCount">Word Count</TabsTrigger>
          <TabsTrigger value="sources">Sources</TabsTrigger>
        </TabsList>
        
        <TabsContent value="categories">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-4">{getChartTitle()}</h3>
              {renderChart()}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="timeline">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-4">{getChartTitle()}</h3>
              {renderChart()}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="wordCount">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-4">{getChartTitle()}</h3>
              {renderChart()}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sources">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-4">{getChartTitle()}</h3>
              {renderChart()}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="text-sm text-gray-500 mt-2">
        Visualize your research data to identify patterns and track progress over time.
      </div>
    </div>
  );
};

export default DataVisualization;