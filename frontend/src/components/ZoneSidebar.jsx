import { Activity, Star, Megaphone, Building2, AlertTriangle, MapPin, CameraOff } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function ZoneSidebar({ selectedZone, hotspots, onSelectZone }) {
  
  const citizenReports = hotspots.filter(h => h.type === 'citizen');

  const correlationData = [
    { permit: 'BPL-CON-2291', site: 'Arora Village Metro Extension', status: 'ACTIVE — NO DUST NET', statusColor: 'text-[#f87171] bg-[#f87171]/10 border-[#f87171]/20' },
    { permit: 'BPL-CON-1187', site: 'Chhatrasal Nagar Residential Tower', status: 'FLAGGED — EXPIRED PERMIT', statusColor: 'text-[#facc15] bg-[#facc15]/10 border-[#facc15]/20' },
    { permit: 'BPL-CON-3040', site: 'NH46 Road Widening', status: 'ACTIVE — COMPLIANT', statusColor: 'text-[#f87171] bg-[#f87171]/10 border-[#f87171]/20' },
  ];

  return (
    <div className="flex flex-col gap-6 lg:col-span-1">
      
      {/* ================= TOP PANEL: SELECTED LOCATION ================= */}
      {/* FIX: Removed flex-1 so it naturally conforms to its content height on mobile */}
      <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-md rounded-2xl flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-800/50 bg-slate-800/20">
          <h3 className="text-xs font-bold text-slate-300 tracking-widest uppercase flex items-center gap-2">
            <Star className="h-4 w-4 text-slate-400" /> Selected Location
          </h3>
        </div>
        
        {!selectedZone ? (
          <CardContent className="flex flex-col items-center justify-center p-8 text-center min-h-[250px]">
            <Activity className="h-10 w-10 text-slate-600 mb-4 opacity-50" />
            <h4 className="text-lg font-bold text-slate-300 mb-2">No location selected</h4>
            <p className="text-sm text-slate-500 leading-relaxed">
              Click a marker on the map to view details.
            </p>
          </CardContent>
        ) : selectedZone.type === 'citizen' ? (
          <CardContent className="p-6 flex flex-col gap-4">
            <div className="w-full h-48 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex items-center justify-center relative">
              {selectedZone.imageUrl ? (
                <img 
                  src={selectedZone.imageUrl} 
                  alt="Citizen uploaded evidence" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className={`flex flex-col items-center justify-center text-slate-600 ${selectedZone.imageUrl ? 'hidden' : 'flex'}`}>
                <CameraOff className="h-8 w-8 mb-2" />
                <span className="text-xs font-bold uppercase tracking-widest">No Image</span>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-white text-lg leading-tight">{selectedZone.name}</h4>
              <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {selectedZone.pos[0].toFixed(4)}, {selectedZone.pos[1].toFixed(4)}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-sm mt-2">
              <div className="bg-slate-800/30 p-3 rounded-lg border border-slate-700/50 text-center">
                <span className="text-slate-500 text-[10px] block mb-1 uppercase tracking-widest font-bold">Severity</span>
                <span className="text-[#f87171] font-black">{selectedZone.intensity} / 100</span>
              </div>
              <div className="bg-slate-800/30 p-3 rounded-lg border border-slate-700/50 text-center">
                <span className="text-slate-500 text-[10px] block mb-1 uppercase tracking-widest font-bold">Status</span>
                <span className="text-[#facc15] font-black text-[10px] uppercase tracking-wider">{selectedZone.status}</span>
              </div>
            </div>
          </CardContent>
        ) : (
          <CardContent className="p-6 flex flex-col gap-6">
            <div className="w-full h-24 bg-slate-800/50 border border-slate-700/50 rounded-xl flex flex-col items-center justify-center text-teal-400">
               <Activity className="h-6 w-6 mb-2 animate-pulse" />
               <span className="text-[10px] font-bold uppercase tracking-widest">CAAQMS Live Feed</span>
            </div>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center border-b border-slate-800/50 pb-3">
                <span className="text-slate-500">Station</span>
                <span className="font-bold text-white text-right break-words max-w-[60%]">{selectedZone.name}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-800/50 pb-3">
                <span className="text-slate-500">Live AQI</span>
                <span className="font-black text-[#f87171] text-lg">{selectedZone.intensity}</span>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* ================= MIDDLE PANEL: CITIZEN REPORTS QUEUE ================= */}
      <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-md rounded-2xl flex flex-col overflow-hidden max-h-[300px]">
        <div className="p-4 border-b border-slate-800/50 flex justify-between items-center sticky top-0 bg-slate-900/90 z-10">
          <h3 className="text-xs font-bold text-slate-300 tracking-widest uppercase flex items-center gap-2">
            <Megaphone className="h-4 w-4 text-slate-400" /> Report Queue
          </h3>
          <span className="text-[10px] text-slate-500 font-bold">{citizenReports.length} TOTAL</span>
        </div>
        
        <CardContent className="p-0 overflow-y-auto">
          {citizenReports.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-sm">No recent citizen reports.</div>
          ) : (
            citizenReports.map((spot, idx) => (
              <div 
                key={spot.id || idx} 
                onClick={() => onSelectZone(spot)} 
                className={`p-4 border-b border-slate-800/50 flex gap-4 cursor-pointer transition-colors ${selectedZone?.id === spot.id ? 'bg-slate-800/80 border-l-4 border-l-[#f87171]' : 'hover:bg-slate-800/30 border-l-4 border-l-transparent'}`}
              >
                 <div className="w-10 h-10 rounded-lg bg-[#f87171]/10 border border-[#f87171]/20 flex items-center justify-center shrink-0">
                   <AlertTriangle className="h-4 w-4 text-[#f87171]" />
                 </div>
                 <div className="flex-1 min-w-0">
                   <div className="flex justify-between items-start mb-1">
                     <h4 className="font-bold text-sm text-slate-200 truncate">{spot.name}</h4>
                   </div>
                   <p className="text-xs text-slate-500 truncate">Intensity: {spot.intensity}</p>
                 </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* ================= BOTTOM PANEL: CONSTRUCTION CORRELATION ================= */}
      <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-md rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-800/50 bg-slate-800/20">
          <h3 className="text-xs font-bold text-slate-300 tracking-widest uppercase flex items-center gap-2">
            <Building2 className="h-4 w-4 text-slate-400" /> Correlation
          </h3>
        </div>
        
        {/* FIX: Added overflow-x-auto so the table can scroll horizontally on small phones */}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-400 whitespace-nowrap">
            <thead className="text-[10px] uppercase tracking-widest text-slate-500 bg-slate-900/40">
              <tr>
                <th className="px-4 py-3 font-medium">Permit</th>
                <th className="px-4 py-3 font-medium">Site</th>
                <th className="px-4 py-3 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {correlationData.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-800/20 transition-colors">
                  <td className="px-4 py-4 font-mono text-xs text-teal-400">{row.permit}</td>
                  <td className="px-4 py-4 text-slate-300 max-w-[150px] truncate">{row.site}</td>
                  <td className="px-4 py-4 text-right">
                    <span className={`inline-block px-2 py-1 text-[9px] font-bold uppercase tracking-wider rounded border ${row.statusColor}`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  );
}