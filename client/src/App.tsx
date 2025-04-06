import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import Header from "./components/Header";
import TabNavigation from "./components/TabNavigation";
import HighlightsPanel from "./components/HighlightsPanel";
import NotesPanel from "./components/NotesPanel";
import ToolsPanel from "./components/ToolsPanel";
import QuickActionButton from "./components/QuickActionButton";

// Tab types for the extension
export type TabType = "highlights" | "notes" | "tools";

function App() {
  const [activeTab, setActiveTab] = useState<TabType>("highlights");

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-col h-full bg-background">
        <Header />
        <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
        
        {activeTab === "highlights" && <HighlightsPanel />}
        {activeTab === "notes" && <NotesPanel />}
        {activeTab === "tools" && <ToolsPanel />}
        
        <QuickActionButton />
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
