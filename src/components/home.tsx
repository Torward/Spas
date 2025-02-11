import React, { useState } from "react";
import CommandHeader from "./CommandHeader";
import MapView from "./MapView";
import DispatchPanel from "./DispatchPanel";
import StatusDashboard from "./StatusDashboard";
import CommunicationHub from "./CommunicationHub";

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
        <StatusDashboard />

        <div className="flex gap-4 flex-wrap lg:flex-nowrap justify-center lg:justify-between">
          <MapView
            onMarkerClick={(location) => {
              setSelectedIncident(location);
            }}
          />

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
