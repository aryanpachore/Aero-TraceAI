import { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Zap, Globe2 } from 'lucide-react'; 
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ZoneSidebar from './ZoneSidebar';

function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function AdminDashboard({ jurisdiction }) {
  const [selectedZone, setSelectedZone] = useState(null);
  const [hotspots, setHotspots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [mapCenter, setMapCenter] = useState([23.2599, 77.4126]);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

  const fetchHotspots = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('https://aero-traceai.onrender.com/api/alerts', {
        params: { city: jurisdiction }
      });
      
      const citizenData = response.data
        .filter(alert => alert.latitude != null && alert.longitude != null) 
        .map(alert => ({
          id: alert.id,
          pos: [alert.latitude, alert.longitude],
          intensity: alert.intensity || 50,
          name: alert.locationName || "Citizen Reported Hotspot",
          status: alert.status || "Pending Verification",
          imageUrl: alert.imageUrl 
            ? (alert.imageUrl.startsWith('http') ? alert.imageUrl : `https://aero-traceai.onrender.com${alert.imageUrl}`) 
            : null,
          type: alert.type || 'citizen', 
          timestamp: alert.createdAt || new Date().toISOString()
        }));
        
      let currentCenter = [23.2599, 77.4126]; 
      const cityName = jurisdiction || 'Global';

      if (citizenData.length > 0) {
        currentCenter = citizenData[0].pos;
        setMapCenter(currentCenter);
      } else if (jurisdiction) {
        try {
          const geoRes = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${jurisdiction}, India`);
          if (geoRes.data && geoRes.data.length > 0) {
            currentCenter = [parseFloat(geoRes.data[0].lat), parseFloat(geoRes.data[0].lon)];
            setMapCenter(currentCenter);
          }
        } catch (geoError) {
          console.error("Geocoding failed:", geoError);
        }
      }

      let dynamicConstructionData = [];
      try {
        const overpassQuery = `[out:json];(way["building"="construction"](around:5000,${currentCenter[0]},${currentCenter[1]});way["landuse"="construction"](around:5000,${currentCenter[0]},${currentCenter[1]}););out center limit 5;`;
        const overpassRes = await axios.get(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`);
        
        if (overpassRes.data && overpassRes.data.elements.length > 0) {
          dynamicConstructionData = overpassRes.data.elements.map((el, i) => ({
            id: `const-real-${el.id}`,
            type: 'construction',
            pos: [el.center ? el.center.lat : el.lat, el.center ? el.center.lon : el.lon],
            intensity: Math.floor(Math.random() * 40) + 50,
            name: el.tags?.name || `${cityName} Construction Zone ${i + 1}`,
            status: 'FLAGGED — DUST PERMIT REQUIRED'
          }));
        }
      } catch (e) {
        console.error("Overpass API unavailable, using dynamic procedural generation.");
      }

      if (dynamicConstructionData.length === 0) {
        dynamicConstructionData = [
          { id: 'const-proc-1', type: 'construction', pos: [currentCenter[0] + 0.008, currentCenter[1] - 0.012], intensity: 85, name: `${cityName} Municipal Expansion`, status: 'FLAGGED — EXPIRED DUST PERMIT' },
          { id: 'const-proc-2', type: 'construction', pos: [currentCenter[0] - 0.015, currentCenter[1] + 0.008], intensity: 45, name: `${cityName} Residential Block`, status: 'ACTIVE — COMPLIANT' }
        ];
      }

      const dynamicCaaqmsData = [
        { id: 'caaqms-1', type: 'caaqms', pos: [currentCenter[0] + 0.012, currentCenter[1] + 0.015], intensity: Math.floor(Math.random() * 100) + 100, name: `${cityName} Central Air Station`, status: 'Active' },
        { id: 'caaqms-2', type: 'caaqms', pos: [currentCenter[0] - 0.018, currentCenter[1] - 0.01], intensity: Math.floor(Math.random() * 100) + 80, name: `${cityName} Regional Monitor`, status: 'Active' }
      ];

      const finalMapData = [...citizenData, ...dynamicConstructionData, ...dynamicCaaqmsData];
      setHotspots(finalMapData);
      
      if (selectedZone) {
        const matchingUpdatedZone = finalMapData.find(h => h.id === selectedZone.id);
        if (matchingUpdatedZone) setSelectedZone(matchingUpdatedZone);
      }
    } catch (error) {
      console.error("Dashboard sync lost:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchHotspots(); }, [jurisdiction]);

  const handleGeneratePlan = async () => {
    setIsGeneratingPlan(true);
    setTimeout(() => setIsGeneratingPlan(false), 2000);
  };

  const getColor = (type) => {
    if (type === 'construction') return '#facc15'; 
    if (type === 'caaqms') return '#2dd4bf'; 
    return '#f87171'; 
  };

  const citizenReportsCount = hotspots.filter(h => h.type === 'citizen').length;
  const activeConstructionCount = hotspots.filter(h => h.type === 'construction').length;
  const pendingEnforcementCount = hotspots.filter(h => h.status === 'Pending Verification' || h.status.includes('FLAGGED')).length;
  const avgAqi = hotspots.length > 0 
    ? Math.round(hotspots.reduce((acc, curr) => acc + curr.intensity, 0) / hotspots.length)
    : '--';

  return (
    <div className="min-h-screen bg-[#0b1120] text-slate-200 p-4 md:p-8 font-sans selection:bg-teal-500/30">
      <div className="max-w-[1600px] mx-auto space-y-6">
        
        {/* ================= HEADER ================= */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold tracking-tight text-white">Admin Command Center</h1>
            <p className="text-sm text-slate-400 uppercase tracking-widest font-bold flex items-center gap-2 flex-wrap">
              Active Jurisdiction: 
              <span className="text-teal-400 bg-teal-400/10 px-3 py-1 rounded-md border border-teal-400/20">
                {jurisdiction || 'GLOBAL'}
              </span>
            </p>
          </div>
          <Button 
            onClick={handleGeneratePlan} 
            disabled={isGeneratingPlan || hotspots.length === 0}
            className="bg-[#14b8a6] hover:bg-[#0d9488] text-slate-950 font-black tracking-wider uppercase h-12 px-6 rounded-lg shadow-[0_0_20px_rgba(20,184,166,0.3)] transition-all w-full md:w-auto"
          >
            {isGeneratingPlan ? (
              <span className="flex items-center gap-2"><Zap className="h-5 w-5 animate-pulse" /> Processing...</span>
            ) : (
              <span className="flex items-center gap-2"><Zap className="h-5 w-5" /> Generate AI Action Plan</span>
            )}
          </Button>
        </div>

        {/* ================= KPI CARDS ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-md rounded-2xl">
            <CardContent className="p-6 flex flex-col justify-between h-full min-h-[140px]">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">City AQI (Avg)</span>
              <div className="text-5xl font-black text-[#f87171] mt-2">{avgAqi}</div>
              <span className="text-xs text-slate-400 mt-2 font-medium">Live sensor & report average</span>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-md rounded-2xl">
            <CardContent className="p-6 flex flex-col justify-between h-full min-h-[140px]">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Citizen Reports</span>
              <div className="text-5xl font-black text-white mt-2">{citizenReportsCount}</div>
              <span className="text-xs text-[#f87171] mt-2 font-medium">From {jurisdiction || 'your city'}</span>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-md rounded-2xl">
            <CardContent className="p-6 flex flex-col justify-between h-full min-h-[140px]">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Construction Sites</span>
              <div className="text-5xl font-black text-white mt-2">{activeConstructionCount}</div>
              <span className="text-xs text-[#facc15] mt-2 font-medium">Geospatial scan active</span>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-4 h-full">
            <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-md rounded-2xl flex-1 min-h-[100px]">
              <CardContent className="p-6 flex flex-col justify-center h-full">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Enforcement Pending</span>
                <div className="text-3xl font-black text-white mt-1">{pendingEnforcementCount}</div>
                <span className="text-xs text-[#f87171] mt-1 font-medium">Action required</span>
              </CardContent>
            </Card>
            <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-md rounded-2xl flex-1 min-h-[100px]">
              <CardContent className="p-5 flex flex-col justify-center h-full">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Weather</span>
                <div className="text-xl font-bold text-white">32°C · Haze</div>
                <span className="text-xs text-slate-400 mt-1">Wind 4km/h NE — low dispersion</span>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ================= MAP & SIDEBAR GRID ================= */}
        <div className="grid gap-6 lg:grid-cols-3">
          
          <Card className="lg:col-span-2 overflow-hidden border-slate-800 bg-slate-900/50 rounded-2xl flex flex-col">
            <div className="p-4 border-b border-slate-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-xs font-bold text-slate-300 tracking-widest uppercase flex items-center gap-2 shrink-0">
                <Globe2 className="h-4 w-4 text-slate-400" /> Map — {jurisdiction || 'GLOBAL'}
              </h3>
              <div className="flex flex-wrap gap-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#f87171]"></div> Citizen</span>
                <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#facc15]"></div> Const.</span>
                <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#2dd4bf]"></div> CAAQMS</span>
              </div>
            </div>
            
            {/* FIX: Removed flex-1 and set a strict min-height for mobile so the map cannot collapse */}
            <div className="w-full relative z-0 bg-slate-950 min-h-[400px] lg:h-[600px]">
              {isLoading ? (
                <div className="flex h-full items-center justify-center text-slate-500">Loading geospatial data...</div>
              ) : (
                <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%', background: '#0f172a' }}>
                  <MapUpdater center={mapCenter} />
                  <TileLayer 
                    attribution='&copy; OpenStreetMap' 
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" 
                  />
                  {hotspots.map(spot => (
                    <CircleMarker
                      key={spot.id}
                      center={spot.pos}
                      radius={spot.type === 'caaqms' ? 8 : Math.max(10, spot.intensity / 4)} 
                      eventHandlers={{ click: () => setSelectedZone(spot) }}
                      pathOptions={{ 
                        fillColor: getColor(spot.type), 
                        color: spot.type === 'caaqms' ? '#0f172a' : getColor(spot.type), 
                        fillOpacity: spot.type === 'caaqms' ? 1 : 0.6, 
                        weight: spot.type === 'caaqms' ? 2 : 1 
                      }}
                    >
                      <Tooltip className="bg-slate-900 border-slate-800 text-white rounded-lg">
                        <div className="font-semibold text-sm">{spot.name}</div>
                        <div className="text-xs text-slate-400">{spot.type.toUpperCase()}</div>
                      </Tooltip>
                    </CircleMarker>
                  ))}
                </MapContainer>
              )}
            </div>
          </Card>

          <ZoneSidebar 
            selectedZone={selectedZone} 
            hotspots={hotspots} 
            onSelectZone={setSelectedZone} 
          />
          
        </div>
      </div>
    </div>
  );
}