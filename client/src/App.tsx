import { useState, useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import Header from "./components/Header";
import TabNavigation from "./components/TabNavigation";
import HighlightsPanel from "./components/HighlightsPanel";
import NotesPanel from "./components/NotesPanel";
import ToolsPanel from "./components/ToolsPanel";
import { PDFAnnotator } from "./components/PDFAnnotator";
import { DataVisualization } from "./components/DataVisualization";
import { Collaboration } from "./components/Collaboration";
import QuickActionButton from "./components/QuickActionButton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "./lib/queryClient";

// Tab types for the extension
export type TabType = "highlights" | "notes" | "tools" | "pdf" | "visualize" | "collaborate";

function App() {
  const [activeTab, setActiveTab] = useState<TabType>("highlights");
  const [highlights, setHighlights] = useState([]);
  const [notes, setNotes] = useState([]);
  const { toast } = useToast();

  // Fetch highlights and notes data for visualization and collaboration features
  useEffect(() => {
    const fetchData = async () => {
      try {
        const highlightsData = await fetch('/api/highlights').then(res => res.json());
        const notesData = await fetch('/api/notes').then(res => res.json());
        
        setHighlights(highlightsData || []);
        setNotes(notesData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error fetching data',
          description: 'Could not load your highlights and notes.',
          variant: 'destructive',
        });
      }
    };

    fetchData();
  }, [toast]);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-col h-full bg-background">
        <Header />
        <TabNavigation 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          // Extended tabs
          tabs={[
            { id: "highlights", label: "Highlights" },
            { id: "notes", label: "Notes" },
            { id: "tools", label: "Tools" },
            { id: "pdf", label: "PDF" },
            { id: "visualize", label: "Visualize" },
            { id: "collaborate", label: "Collaborate" }
          ]}
        />
        
        {activeTab === "highlights" && <HighlightsPanel />}
        {activeTab === "notes" && <NotesPanel />}
        {activeTab === "tools" && <ToolsPanel />}
        {activeTab === "pdf" && <PDFAnnotator />}
        {activeTab === "visualize" && <DataVisualization notes={notes} highlights={highlights} />}
        {activeTab === "collaborate" && <Collaboration notes={notes} highlights={highlights} />}
        
        <QuickActionButton />
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
