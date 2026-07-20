import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, TriangleAlert, Activity, CloudFog, Megaphone, BarChart2, Globe2, Layers, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, LabelList, PieChart, Pie } from 'recharts';

// --- MOCK DATA ---
const forecastData = [
  { time: 'NOW', aqi: 185, label: 'Poor' },
  { time: '+6H', aqi: 201, label: 'Very Poor' },
  { time: '+12H', aqi: 228, label: 'Very Poor' },
  { time: '+24H', aqi: 194, label: 'Poor' },
  { time: '+48H', aqi: 156, label: 'Moderate' },
  { time: '+72H', aqi: 142, label: 'Moderate' }
];

const weeklyTrend = [
  { day: 'Mon', aqi: 142 }, { day: 'Tue', aqi: 156 }, { day: 'Wed', aqi: 214 },
  { day: 'Thu', aqi: 231 }, { day: 'Fri', aqi: 198 }, { day: 'Sat', aqi: 176 }, { day: 'Sun', aqi: 185 }
];

const cities = [
  { name: 'Chiplun (you)', aqi: 185 },
  { name: 'Delhi NCR', aqi: 312 },
  { name: 'Mumbai', aqi: 208 },
  { name: 'Bengaluru', aqi: 118 }
];

// --- HELPER FUNCTIONS ---
const getAqiColor = (aqi) => {
  if (aqi <= 50) return '#34d399'; 
  if (aqi <= 100) return '#a3e635'; 
  if (aqi <= 200) return '#facc15'; 
  if (aqi <= 300) return '#fb923c'; 
  if (aqi <= 400) return '#f87171'; 
  return '#be123c'; 
};

const getAqiTextColor = (aqi) => {
  if (aqi <= 50) return 'text-[#34d399]';
  if (aqi <= 100) return 'text-[#65a30d] dark:text-[#a3e635]';
  if (aqi <= 200) return 'text-[#ca8a04] dark:text-[#facc15]';
  if (aqi <= 300) return 'text-[#ea580c] dark:text-[#fb923c]';
  if (aqi <= 400) return 'text-[#dc2626] dark:text-[#f87171]';
  return 'text-[#9f1239] dark:text-[#be123c]';
};

export default function CitizenDashboard() {
  const navigate = useNavigate();
  const [locationName, setLocationName] = useState('Acquiring Location...');
  
  const [vulnerability, setVulnerability] = useState('General Public');
  const [language, setLanguage] = useState('English');
  const [aiAdvice, setAiAdvice] = useState(null);
  const [isFetchingAdvice, setIsFetchingAdvice] = useState(true);
  
  // Dynamic Donut Chart State
  const [culprits, setCulprits] = useState([
    { name: 'Vehicular emissions', value: 45, color: '#ef4444' },
    { name: 'Construction dust', value: 32, color: '#f97316' },
    { name: 'Biomass / waste burning', value: 14, color: '#facc15' },
    { name: 'Industrial stacks', value: 9, color: '#2dd4bf' }
  ]);
  
  const localAqi = 185; 
  const markerPosition = Math.min((localAqi / 500) * 100, 100);

  // 1. Fetch Location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await res.json();
            const place = data.address.city || data.address.town || data.address.village || "Your Area";
            const state = data.address.state || "";
            setLocationName(state ? `${place}, ${state}` : place);
          } catch (e) {
            setLocationName("Chiplun, Maharashtra");
          }
        },
        () => setLocationName("Chiplun, Maharashtra")
      );
    }
  }, []);

  // 2. Fetch AI Advisory
  useEffect(() => {
    const fetchAdvisory = async () => {
      setIsFetchingAdvice(true);
      try {
        const res = await axios.get(`http://localhost:5000/api/advisories/1`, {
          params: { healthProfile: vulnerability, language, aqi: localAqi, t: Date.now() }
        });
        setAiAdvice(res.data.advisory);
      } catch (error) {
        console.error("Failed to fetch AI advisory:", error);
      } finally {
        setIsFetchingAdvice(false);
      }
    };
    fetchAdvisory();
  }, [vulnerability, language, localAqi]);

  // 3. Fetch Dynamic Culprits
  useEffect(() => {
    const fetchSourceInsights = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/insights/1');
        
        if (res.data && res.data.confidenceBreakdown) {
          const dynamicCulprits = [
            { name: 'Traffic / Vehicular', value: res.data.confidenceBreakdown.traffic || 0, color: '#ef4444' },
            { name: 'Industrial Activity', value: res.data.confidenceBreakdown.industrial || 0, color: '#2dd4bf' },
            { name: 'Construction Dust', value: res.data.confidenceBreakdown.dust || 0, color: '#f97316' }
          ].filter(item => item.value > 0); 
          
          if (dynamicCulprits.length > 0) {
            setCulprits(dynamicCulprits);
          }
        }
      } catch (error) {
        console.error("Failed to fetch live source insights:", error);
      }
    };
  
    fetchSourceInsights();
  }, []);

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-[#0b1120] text-slate-900 dark:text-slate-200 p-4 md:p-8 font-sans selection:bg-teal-500/30 transition-colors duration-300">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* ================= 1. MAIN AQI HERO CARD ================= */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 backdrop-blur-xl shadow-xl dark:shadow-2xl overflow-hidden rounded-2xl transition-colors duration-300">
            <CardContent className="p-6 md:p-8 space-y-8">
              
              <div className="flex justify-between items-start">
                <div className="flex gap-4">
                  <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl h-fit border border-slate-200 dark:border-slate-700 transition-colors duration-300">
                    <MapPin className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight transition-colors duration-300">{locationName}</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2 transition-colors duration-300">
                      <CloudFog className="h-4 w-4" /> Haze · 32°C · Station: CAAQMS-RTN-04 · Updated 6 min ago
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 transition-colors duration-300">Local AQI</div>
                  <div className={`text-6xl font-black leading-none ${getAqiTextColor(localAqi)} transition-colors duration-300`}>{localAqi}</div>
                  <div className={`h-3 w-16 rounded-full ml-auto mt-2 opacity-80`} style={{ backgroundColor: getAqiColor(localAqi) }}></div>
                </div>
              </div>

              {/* Segmented AQI Scale */}
              <div className="space-y-2 pt-4">
                <div className="relative h-4 w-full flex rounded-full overflow-hidden shadow-inner">
                  <div className="h-full flex-1 bg-[#34d399]"></div>
                  <div className="h-full flex-1 bg-[#a3e635]"></div>
                  <div className="h-full flex-1 bg-[#facc15]"></div>
                  <div className="h-full flex-1 bg-[#fb923c]"></div>
                  <div className="h-full flex-1 bg-[#f87171]"></div>
                  <div className="h-full flex-1 bg-[#be123c]"></div>
                  <div 
                    className="absolute top-[-4px] bottom-[-4px] w-1.5 bg-white shadow-md border border-slate-300 transition-all duration-1000 ease-out z-10 rounded-full" 
                    style={{ left: `calc(${markerPosition}% - 3px)` }}
                  />
                </div>
                
                <div className="flex justify-between text-[10px] md:text-xs text-slate-500 dark:text-slate-400 font-medium transition-colors duration-300">
                  <div className="flex-1"><span className="text-slate-900 dark:text-white font-bold block">0–50</span>Good</div>
                  <div className="flex-1"><span className="text-slate-900 dark:text-white font-bold block">51–100</span>Satisfactory</div>
                  <div className="flex-1"><span className="text-slate-900 dark:text-white font-bold block">101–200</span>Moderate</div>
                  <div className="flex-1"><span className="text-slate-900 dark:text-white font-bold block">201–300</span>Poor</div>
                  <div className="flex-1"><span className="text-slate-900 dark:text-white font-bold block">301–400</span>Very Poor</div>
                  <div className="flex-1"><span className="text-slate-900 dark:text-white font-bold block">401–500</span>Severe</div>
                </div>
              </div>

              {/* Forecast Grid */}
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-4 pt-4">
                {forecastData.map((data, idx) => (
                  <div key={idx} className={`p-4 rounded-xl flex flex-col items-center justify-center text-center border transition-colors duration-300 ${idx === 0 ? 'bg-teal-50 dark:bg-slate-800/80 border-teal-200 dark:border-teal-500/50 shadow-[0_0_15px_rgba(20,184,166,0.1)]' : 'bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-700/50'}`}>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">{data.time}</span>
                    <span className={`text-2xl font-black ${getAqiTextColor(data.aqi)} transition-colors duration-300`}>{data.aqi}</span>
                    <span className="text-xs text-slate-600 dark:text-slate-500 mt-1">{data.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ================= 2. 7-DAY TREND CHART ================= */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-2xl transition-colors duration-300">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800/50 transition-colors duration-300">
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 tracking-widest uppercase flex items-center gap-2">
                <BarChart2 className="h-4 w-4 text-slate-400" /> 7-Day Trend
              </h3>
            </div>
            <CardContent className="h-[250px] p-6 pt-8">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyTrend} margin={{ top: 20, right: 0, left: 0, bottom: 0 }} barSize={35}>
                  <Tooltip cursor={{ fill: 'rgba(148,163,184,0.1)' }} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff', borderRadius: '8px' }} />
                  <Bar dataKey="aqi" radius={[4, 4, 4, 4]}>
                    {weeklyTrend.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getAqiColor(entry.aqi)} />
                    ))}
                    <LabelList dataKey="aqi" position="top" fill="#64748b" fontSize={11} fontWeight="bold" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* ================= 3. WARD MAP & SOURCE ATTRIBUTION ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-2xl h-full flex flex-col transition-colors duration-300">
              <div className="p-6 border-b border-slate-200 dark:border-slate-800/50 transition-colors duration-300">
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 tracking-widest uppercase flex items-center gap-2">
                  <Globe2 className="h-4 w-4 text-slate-400" /> Ward Pollution Map
                </h3>
              </div>
              <CardContent className="p-6 flex-1 flex flex-col">
                <div className="w-full h-48 rounded-xl relative overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 transition-colors duration-300">
                  <div className="absolute inset-0 opacity-80" style={{ background: 'radial-gradient(circle at 70% 60%, rgba(250,204,21,0.2) 0%, rgba(0,0,0,0) 60%), radial-gradient(circle at 30% 40%, rgba(248,113,113,0.25) 0%, transparent 70%)' }}></div>
                  <div className="absolute top-[40%] left-[35%] w-3 h-3 bg-teal-500 dark:bg-teal-400 rounded-full shadow-[0_0_15px_rgba(45,212,191,0.8)] ring-4 ring-teal-400/20"></div>
                </div>
                <div className="flex gap-4 mt-4 text-xs text-slate-500 dark:text-slate-400 transition-colors duration-300">
                  <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#f87171]"></div>Very Poor zone</span>
                  <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#facc15]"></div>Moderate zone</span>
                  <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-teal-500"></div>You are here</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-2xl h-full flex flex-col transition-colors duration-300">
              <div className="p-6 border-b border-slate-200 dark:border-slate-800/50 transition-colors duration-300">
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 tracking-widest uppercase flex items-center gap-2">
                  <Layers className="h-4 w-4 text-slate-400" /> Primary Culprits
                </h3>
              </div>
              <CardContent className="p-6 flex-1 flex flex-col">
                <div className="flex items-center h-48">
                  <div className="w-1/2 h-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={culprits} innerRadius={50} outerRadius={70} stroke="none" paddingAngle={2} dataKey="value">
                          {culprits.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      {/* Dynamically display the number of culprits! */}
                      <span className="text-2xl font-bold text-slate-900 dark:text-white leading-none transition-colors duration-300">
                        {culprits.length}
                      </span>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wide">sources</span>
                    </div>
                  </div>
                  <div className="w-1/2 space-y-3 pl-2">
                    {culprits.map((item, i) => (
                      <div key={i} className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                          <span className="text-slate-600 dark:text-slate-300 transition-colors duration-300">{item.name}</span>
                        </div>
                        <span className="font-bold text-slate-900 dark:text-white transition-colors duration-300">{item.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="pt-4 mt-auto border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs transition-colors duration-300">
                  <span className="text-slate-500">Attribution confidence</span>
                  <span className="text-teal-600 dark:text-teal-400 font-bold transition-colors duration-300">87.3%</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* ================= 4. AI AGENT & ACTIONS ================= */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-2xl overflow-hidden transition-colors duration-300">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-800/20 transition-colors duration-300">
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 tracking-widest uppercase flex items-center gap-2">
                <Star className="h-4 w-4 text-slate-400" /> AI Agent Analysis
              </h3>
            </div>
            
            <CardContent className="p-6 md:p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Health Profile</label>
                  <Select value={vulnerability} onValueChange={setVulnerability}>
                    <SelectTrigger className="w-full bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200 h-11 transition-colors duration-300"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200">
                      <SelectItem value="General Public">General Public</SelectItem>
                      <SelectItem value="Asthmatic">Asthmatic</SelectItem>
                      <SelectItem value="Elderly">Elderly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Language</label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="w-full bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200 h-11 transition-colors duration-300"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200">
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Hindi">हिंदी (Hindi)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="rounded-xl p-6 bg-orange-50 dark:bg-[#18181b] border border-orange-200 dark:border-slate-800 border-l-4 border-l-[#ea580c] dark:border-l-[#fb923c] transition-colors duration-300">
                <AnimatePresence mode="wait">
                  {isFetchingAdvice ? (
                    <motion.div key="loading" className="flex items-center gap-3 text-slate-500 dark:text-slate-400 py-4">
                      <Activity className="h-5 w-5 animate-pulse text-[#ea580c] dark:text-[#fb923c]" />
                      <span className="text-sm font-medium">Processing hyper-local parameters...</span>
                    </motion.div>
                  ) : (
                    <motion.div key="resolved" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <TriangleAlert className="h-5 w-5 text-[#ea580c] dark:text-[#fb923c]" />
                        <h4 className="font-bold text-slate-900 dark:text-white">Action Plan</h4>
                      </div>
                      <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 transition-colors duration-300">
                        {aiAdvice || "Current AQI is 185 (Poor). Limit prolonged outdoor exertion, especially near main roads. Keep windows closed during peak traffic hours (8-11am, 6-9pm) and use an N95 mask if you must go outside."}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button 
                onClick={() => navigate('/report')}
                className="w-full flex items-center gap-4 bg-teal-50 hover:bg-teal-100 dark:bg-[#064e3b]/30 dark:hover:bg-[#064e3b]/50 border border-teal-200 dark:border-teal-900/50 p-5 rounded-xl transition-colors text-left group"
              >
                <div className="bg-teal-100 dark:bg-teal-500/10 p-2 rounded-lg group-hover:bg-teal-200 dark:group-hover:bg-teal-500/20 transition-colors">
                  <Megaphone className="h-6 w-6 text-teal-700 dark:text-teal-500" />
                </div>
                <div className="flex-1">
                  <div className="text-teal-800 dark:text-teal-400 font-bold text-base transition-colors duration-300">Spotted pollution?</div>
                  <div className="text-teal-600 dark:text-teal-500/60 text-sm transition-colors duration-300">Transmit geotagged evidence directly to City Admin &rarr;</div>
                </div>
              </button>
            </CardContent>
          </Card>
        </motion.div>

        {/* ================= 5. CITY COMPARISON ================= */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-2xl transition-colors duration-300">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800/50 transition-colors duration-300">
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 tracking-widest uppercase flex items-center gap-2">
                <BarChart2 className="h-4 w-4 text-slate-400" /> City Comparison — This Week
              </h3>
            </div>
            <CardContent className="p-6 space-y-4">
              {cities.map((city, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm border-b border-slate-200 dark:border-slate-800/50 pb-4 last:border-0 last:pb-0 transition-colors duration-300">
                  <span className="text-slate-600 dark:text-slate-300 transition-colors duration-300">{city.name}</span>
                  <span className={`font-bold ${getAqiTextColor(city.aqi)} transition-colors duration-300`}>{city.aqi}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

      </div>
    </div>
  );
}