import React, { useState } from "react";
import CommandHeader from "./CommandHeader";
import EmergencyMap from "./EmergencyMap";
import DispatchPanel from "./DispatchPanel";
import EmergencyMetrics from "./EmergencyMetrics";
import CommunicationHub from "./CommunicationHub";
import AnalyticsDashboard from "./AnalyticsDashboard";

interface HomeProps {
  isDarkMode?: boolean;
  onThemeToggle?: () => void;
}

const Home = ({ isDarkMode = true, onThemeToggle = () => {} }: HomeProps) => {
  const [selectedIncident, setSelectedIncident] = useState(null);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <CommandHeader isDarkMode={isDarkMode} onThemeToggle={onThemeToggle} />

      <main className="container mx-auto p-4 space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <AnalyticsDashboard />
          <EmergencyMetrics />
        </div>

        <div className="flex gap-4 flex-wrap lg:flex-nowrap justify-center lg:justify-between">
          <EmergencyMap />

          <div className="space-y-4">
            <DispatchPanel />
            <CommunicationHub />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
