import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind, ShieldCheck, Users, ArrowRight, Loader2, AlertCircle, MapPin, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// ---- Fonts: Space Grotesk (display) / Inter (body) / JetBrains Mono (data) ----
// Matches the visual system used across the citizen and admin dashboards.
const FontStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap');
    .font-display { font-family: 'Space Grotesk', sans-serif; }
    .font-body { font-family: 'Inter', sans-serif; }
    .font-mono { font-family: 'JetBrains Mono', monospace; }

    @keyframes drift-up {
      0%   { transform: translateY(0) translateX(0); opacity: 0; }
      10%  { opacity: 0.5; }
      90%  { opacity: 0.35; }
      100% { transform: translateY(-140px) translateX(6px); opacity: 0; }
    }
    @keyframes horizon-pan {
      0% { background-position: 0% 50%; }
      100% { background-position: 200% 50%; }
    }
    @keyframes shake {
      10%, 90% { transform: translateX(-1px); }
      20%, 80% { transform: translateX(2px); }
      30%, 50%, 70% { transform: translateX(-3px); }
      40%, 60% { transform: translateX(3px); }
    }
    .animate-shake { animation: shake 0.5s; }

    @media (prefers-reduced-motion: reduce) {
      .mote, .horizon-glow { animation: none !important; }
    }
  `}</style>
);

// Mock live-city ticker data — reinforces "this product is about real, moving readings"
const CITY_FEED = [
  { city: 'Delhi NCR', aqi: 312, cat: 'Severe', color: '#B32D5C' },
  { city: 'Mumbai', aqi: 208, cat: 'Poor', color: '#F79A45' },
  { city: 'Chiplun', aqi: 185, cat: 'Moderate', color: '#F4C948' },
  { city: 'Bengaluru', aqi: 118, cat: 'Moderate', color: '#F4C948' },
  { city: 'Kochi', aqi: 64, cat: 'Satisfactory', color: '#A6D93D' },
];

function LiveTicker() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % CITY_FEED.length), 2800);
    return () => clearInterval(t);
  }, []);
  const c = CITY_FEED[i];
  return (
    <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 backdrop-blur-md">
      <Radio className="h-3 w-3 text-teal-400" />
      <AnimatePresence mode="wait">
        <motion.span
          key={c.city}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.3 }}
          className="font-mono text-[11px] tracking-wide text-slate-300"
        >
          {c.city} <span style={{ color: c.color }} className="font-semibold">{c.aqi}</span>{' '}
          <span style={{ color: c.color }}>{c.cat}</span>
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

// The "AQI Horizon" — a slow-panning gradient across the real CPCB scale.
// This is the page's signature element: air quality itself, rendered as a skyline.
function AQIHorizon() {
  return (
    <div className="w-full max-w-xl mx-auto mt-10">
      <div
        className="horizon-glow h-2.5 rounded-full"
        style={{
          backgroundImage:
            'linear-gradient(90deg, #3DDC97, #A6D93D, #F4C948, #F79A45, #F0563D, #B32D5C, #3DDC97, #A6D93D, #F4C948)',
          backgroundSize: '200% 100%',
          animation: 'horizon-pan 14s linear infinite',
          boxShadow: '0 0 24px rgba(61,220,199,0.15)',
        }}
      />
      <div className="mt-2 flex justify-between font-mono text-[9.5px] uppercase tracking-widest text-slate-500">
        <span>Good</span>
        <span>Satisfactory</span>
        <span>Moderate</span>
        <span>Poor</span>
        <span>Very Poor</span>
        <span>Severe</span>
      </div>
    </div>
  );
}

// Floating particulate motes drifting up through the hero — a quiet nod to PM2.5.
function ParticulateField() {
  const motes = useRef(
    Array.from({ length: 16 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 10,
      duration: 8 + Math.random() * 8,
      size: 2 + Math.random() * 3,
    }))
  ).current;
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {motes.map((m) => (
        <span
          key={m.id}
          className="mote absolute rounded-full bg-teal-300/40"
          style={{
            left: `${m.left}%`,
            bottom: '10%',
            width: m.size,
            height: m.size,
            animation: `drift-up ${m.duration}s ease-in infinite`,
            animationDelay: `${m.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function LandingPage({ setAuthRole, setAdminCity }) {
  const [selectedPath, setSelectedPath] = useState(null);
  const [isLogin, setIsLogin] = useState(true);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [healthProfile, setHealthProfile] = useState('General Public');
  const [adminCityState, setAdminCityState] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      const endpoint = isLogin ? 'https://aero-traceai.onrender.com/api/auth/login' : 'https://aero-traceai.onrender.com/api/auth/register';

      const payload = isLogin
        ? { email, password, role: selectedPath }
        : selectedPath === 'admin'
          ? { name, email, password, role: selectedPath, city: adminCityState }
          : { name, email, password, role: selectedPath, healthProfile };

      const response = await axios.post(endpoint, payload);

      if (response.status === 200 || response.status === 201) {
        localStorage.setItem('authRole', selectedPath);

        let finalCity = null;
        if (response.data?.user?.city) {
          finalCity = response.data.user.city;
        } else if (!isLogin && selectedPath === 'admin') {
          finalCity = adminCityState;
        }

        if (finalCity) {
          localStorage.setItem('adminCity', finalCity);
          if (setAdminCity) setAdminCity(finalCity);
        }

        setAuthRole(selectedPath);
      }
    } catch (error) {
      console.error('Auth Error:', error);
      setErrorMsg(error.response?.data?.error || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetSelection = () => {
    setSelectedPath(null);
    setIsLogin(true);
    setErrorMsg('');
  };

  const isAdmin = selectedPath === 'admin';
  const accent = isAdmin ? 'violet' : 'teal';

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#05070C] font-body text-slate-50">
      <FontStyles />

      {/* Ambient background: night-sky vignette, not stock blob-glows */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 900px 500px at 12% -8%, rgba(139,124,246,0.14), transparent 60%),' +
            'radial-gradient(ellipse 800px 600px at 100% 10%, rgba(61,220,199,0.10), transparent 55%),' +
            'radial-gradient(ellipse 700px 500px at 50% 120%, rgba(240,86,61,0.08), transparent 60%)',
        }}
      />
      <ParticulateField />

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-6 pt-6 md:px-10">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-400 to-violet-400">
            <Wind className="h-4 w-4 text-[#05070C]" />
          </div>
          <span className="font-display text-[15px] font-semibold tracking-tight">Aero TraceAI</span>
        </div>
        <LiveTicker />
      </div>

      <div className="relative z-10 flex flex-col items-center px-4 pb-20 pt-10 md:pt-14">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="flex w-full max-w-3xl flex-col items-center text-center"
        >
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate-500">
            Urban Air Intelligence · Built for India&rsquo;s cities
          </span>

          <h1 className="font-display mt-4 text-5xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(90deg, #3DDCC7, #A6D93D 35%, #F4C948 55%, #F79A45 75%, #F0563D)' }}
            >
              Every breath,
            </span>
            <br />
            <span className="text-slate-100">traced to its source.</span>
          </h1>

          <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-slate-400">
            From ward-level pollution attribution to citizen-reported hotspots — one platform
            for the people breathing the air, and the officials who can act on it.
          </p>

          <AQIHorizon />
        </motion.div>

        {/* Portal selection / auth panel */}
        <div className="mt-14 w-full max-w-2xl">
          <AnimatePresence mode="wait">
            {!selectedPath ? (
              <motion.div
                key="paths"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35 }}
                className="grid gap-5 md:grid-cols-2"
              >
                {/* Citizen */}
                <motion.button
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedPath('citizen')}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-7 text-left transition-colors hover:border-teal-400/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/60"
                >
                  <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-teal-400/10 blur-2xl transition-opacity group-hover:opacity-100 opacity-60" />
                  <Users className="h-8 w-8 text-teal-400" />
                  <h3 className="font-display mt-4 text-lg font-semibold">Public Portal</h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-slate-400">
                    Check your ward&rsquo;s AQI, get health advisories in your language, and report pollution you see.
                  </p>
                  <div className="mt-5 flex items-center gap-2 font-mono text-[11px] text-slate-500">
                    <MapPin className="h-3 w-3" /> Chiplun, MH · AQI <span className="text-amber-400 font-semibold">185</span>
                  </div>
                  <div className="mt-4 flex items-center gap-1.5 text-[13px] font-medium text-teal-400 opacity-0 transition-opacity group-hover:opacity-100">
                    Continue <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </motion.button>

                {/* Admin */}
                <motion.button
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedPath('admin')}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-7 text-left transition-colors hover:border-violet-400/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60"
                >
                  <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-violet-400/10 blur-2xl transition-opacity group-hover:opacity-100 opacity-60" />
                  <ShieldCheck className="h-8 w-8 text-violet-400" />
                  <h3 className="font-display mt-4 text-lg font-semibold">Command Center</h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-slate-400">
                    Monitor your jurisdiction, review citizen reports on the map, and dispatch enforcement.
                  </p>
                  <div className="mt-5 flex items-center gap-2 font-mono text-[11px] text-slate-500">
                    <ShieldCheck className="h-3 w-3" /> 8 enforcement actions pending
                  </div>
                  <div className="mt-4 flex items-center gap-1.5 text-[13px] font-medium text-violet-400 opacity-0 transition-opacity group-hover:opacity-100">
                    Continue <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, scale: 0.96, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -8 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="mx-auto w-full max-w-md rounded-2xl border border-white/10 bg-[#0B0F1A]/90 p-8 shadow-2xl backdrop-blur-xl"
                style={{ boxShadow: `0 0 0 1px rgba(255,255,255,0.03), 0 20px 60px -20px ${isAdmin ? 'rgba(139,124,246,0.25)' : 'rgba(61,220,199,0.25)'}` }}
              >
                <div className="mb-7 flex items-center justify-between">
                  <h2 className="font-display flex items-center gap-2 text-xl font-semibold">
                    {isAdmin ? <ShieldCheck className="h-5 w-5 text-violet-400" /> : <Users className="h-5 w-5 text-teal-400" />}
                    {isLogin ? 'Sign in' : 'Create account'}
                  </h2>
                  <button onClick={resetSelection} className="text-[13px] text-slate-500 transition-colors hover:text-white">
                    Back
                  </button>
                </div>

                <AnimatePresence>
                  {errorMsg && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="animate-shake mb-4 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-[13px] text-red-400"
                    >
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      {errorMsg}
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <AnimatePresence mode="wait">
                    {!isLogin && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="space-y-4 overflow-hidden"
                      >
                        <div className="space-y-1.5 text-left">
                          <label className="font-mono text-[10.5px] uppercase tracking-wide text-slate-500">Full name</label>
                          <Input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="border-white/10 bg-[#05070C] text-white focus-visible:ring-teal-400/50"
                          />
                        </div>

                        {selectedPath === 'citizen' && (
                          <div className="space-y-1.5 text-left">
                            <label className="font-mono text-[10.5px] uppercase tracking-wide text-slate-500">Health profile</label>
                            <Select value={healthProfile} onValueChange={setHealthProfile}>
                              <SelectTrigger className="w-full border-white/10 bg-[#05070C] text-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="General Public">General Public</SelectItem>
                                <SelectItem value="Asthmatic">Asthmatic</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        {selectedPath === 'admin' && (
                          <div className="space-y-1.5 text-left">
                            <label className="font-mono text-[10.5px] uppercase tracking-wide text-slate-500">Assigned jurisdiction</label>
                            <Input
                              type="text"
                              required
                              placeholder="Enter city name or pincode"
                              value={adminCityState}
                              onChange={(e) => setAdminCityState(e.target.value)}
                              className="border-white/10 bg-[#05070C] text-white placeholder:text-slate-600 focus-visible:ring-violet-400/50"
                            />
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="space-y-1.5 text-left">
                    <label className="font-mono text-[10.5px] uppercase tracking-wide text-slate-500">Email</label>
                    <Input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="border-white/10 bg-[#05070C] text-white focus-visible:ring-teal-400/50"
                    />
                  </div>
                  <div className="space-y-1.5 text-left">
                    <label className="font-mono text-[10.5px] uppercase tracking-wide text-slate-500">Password</label>
                    <Input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="border-white/10 bg-[#05070C] text-white focus-visible:ring-teal-400/50"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className={`mt-2 h-12 w-full font-display font-semibold transition-all ${
                      isAdmin ? 'bg-violet-500 hover:bg-violet-600' : 'bg-teal-400 hover:bg-teal-500 text-[#05070C]'
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing
                      </>
                    ) : (
                      <>
                        {isLogin ? 'Sign in' : 'Create account'} <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>

                <div className="mt-6 text-center text-[13px]">
                  <button onClick={() => setIsLogin(!isLogin)} className="text-slate-500 underline-offset-4 transition-colors hover:text-white hover:underline">
                    {isLogin ? "Need an account? Sign up" : 'Already have an account? Log in'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="relative z-10 mt-16 font-mono text-[10.5px] tracking-wide text-slate-600">
          Built for India&rsquo;s 4,000+ urban local bodies
        </p>
      </div>
    </div>
  );
}