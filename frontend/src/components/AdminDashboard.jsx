// src/components/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'framer-motion';
// FIX: Changed CheckCircle2 to CheckCircle to prevent Lucide import crashes
import { Zap, Route, CheckCircle } from 'lucide-react'; 
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ZoneSidebar from './ZoneSidebar';

export default function AdminDashboard() {
  const [selectedZone, setSelectedZone] = useState(null);
  const [hotspots, setHotspots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Agent 2 States
  const [actionPlan, setActionPlan] = useState(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

  const center = [23.2599, 77.4126];

  const fetchHotspots = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/alerts');
      
      // FIX: Added .filter() to prevent Leaflet crash on undefined LatLng
      const formattedData = response.data
        .filter(alert => alert.latitude != null && alert.longitude != null) 
        .map(alert => ({
          id: alert.id,
          pos: [alert.latitude, alert.longitude],
          intensity: alert.intensity || 50,
          name: alert.locationName || "Citizen Reported Hotspot",
          status: alert.status || "Pending Verification",
          imageUrl: alert.imageUrl ? `http://localhost:5000${alert.imageUrl}` : null,
        }));
        
      setHotspots(formattedData);
      
      if (selectedZone) {
        const matchingUpdatedZone = formattedData.find(h => h.id === selectedZone.id);
        if (matchingUpdatedZone) setSelectedZone(matchingUpdatedZone);
      }
    } catch (error) {
      console.error("Dashboard sync lost:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchHotspots(); }, []);

  // Trigger Agent 2
  const handleGeneratePlan = async () => {
    setIsGeneratingPlan(true);
    try {
      const res = await axios.get('http://localhost:5000/api/routes/optimize');
      setActionPlan(res.data.actionPlan);
    } catch (error) {
      console.error("Agent 2 failure:", error);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const getColor = (intensity) => {
    if (intensity > 80) return '#ef4444';
    if (intensity > 50) return '#f97316';
    return '#3b82f6';
  };

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto space-y-6">
      
      {/* Header & Agent 2 Trigger */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Admin Command Center</h1>
          <p className="text-sm md:text-base text-muted-foreground">Live geospatial emission mapping and AI enforcement routing.</p>
        </div>
        <Button 
          onClick={handleGeneratePlan} 
          disabled={isGeneratingPlan || hotspots.length === 0}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11"
        >
          {isGeneratingPlan ? (
            <span className="flex items-center gap-2"><Zap className="h-4 w-4 animate-pulse" /> Computing Routes...</span>
          ) : (
            <span className="flex items-center gap-2"><Route className="h-4 w-4" /> Generate AI Action Plan</span>
          )}
        </Button>
      </div>

      {/* Agent 2 Dynamic Action Plan Display */}
      <AnimatePresence>
        {actionPlan && (
          <motion.div 
            initial={{ opacity: 0, height: 0, y: -20 }} 
            animate={{ opacity: 1, height: 'auto', y: 0 }} 
            exit={{ opacity: 0, height: 0 }}
            className="grid gap-4 md:grid-cols-3 mb-6"
          >
            {actionPlan.map((task, idx) => (
              <Card key={idx} className="border-emerald-500/30 bg-emerald-500/5 shadow-md">
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-500 flex items-center gap-1">
                      {/* FIX: Using CheckCircle instead of CheckCircle2 */}
                      <CheckCircle className="h-3.5 w-3.5" /> Priority {task.priority}
                    </span>
                    <span className="text-xs font-mono text-muted-foreground truncate max-w-[120px]">{task.location}</span>
                  </div>
                  <h3 className="font-bold text-sm text-foreground leading-tight">{task.action}</h3>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{task.reasoning}</p>
                </div>
              </Card>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 overflow-hidden border-slate-200 dark:border-slate-800">
          <div className="h-[400px] lg:h-[700px] w-full relative z-0 flex items-center justify-center bg-muted/20">
            {isLoading ? (
              <div className="flex flex-col items-center gap-2 text-muted-foreground animate-pulse">
                <div className="h-5 w-5 border-2 border-primary border-b-transparent rounded-full animate-spin" />
                <p className="text-xs">Accessing target cluster data records...</p>
              </div>
            ) : (
              <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%' }}>
                <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {hotspots.map(spot => (
                  <CircleMarker
                    key={spot.id}
                    center={spot.pos}
                    radius={Math.max(12, spot.intensity / 2.5)} 
                    eventHandlers={{ click: () => setSelectedZone(spot) }}
                    pathOptions={{ fillColor: getColor(spot.intensity), color: getColor(spot.intensity), fillOpacity: 0.5, weight: 2 }}
                  >
                    <Tooltip>
                      <div className="font-semibold text-sm">{spot.name}</div>
                      <div className="text-xs">Index Value: {spot.intensity}</div>
                    </Tooltip>
                  </CircleMarker>
                ))}
              </MapContainer>
            )}
          </div>
        </Card>

        <ZoneSidebar selectedZone={selectedZone} getColor={getColor} onActionLogged={fetchHotspots} />
      </div>
    </div>
  );
}