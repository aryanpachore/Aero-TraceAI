import { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind, ShieldCheck, Users, ArrowRight, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function LandingPage({ setAuthRole }) {
  const [selectedPath, setSelectedPath] = useState(null); 
  const [isLogin, setIsLogin] = useState(true); 
  
  // REAL FORM STATE
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [healthProfile, setHealthProfile] = useState('General Public');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      const endpoint = isLogin ? 'http://localhost:5000/api/auth/login' : 'http://localhost:5000/api/auth/register';
      
      const payload = isLogin 
        ? { email, password, role: selectedPath }
        : { name, email, password, role: selectedPath, healthProfile };

      const response = await axios.post(endpoint, payload);
      
      // If the backend approves, set the role to allow entry
      if (response.status === 200 || response.status === 201) {
        setAuthRole(selectedPath); 
      }
    } catch (error) {
      console.error("Auth Error:", error);
      setErrorMsg(error.response?.data?.error || "Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetSelection = () => {
    setSelectedPath(null);
    setIsLogin(true); 
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-50 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-blue-500/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-emerald-500/10 rounded-full blur-[120px] mix-blend-screen animate-pulse delay-1000" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="z-10 flex flex-col items-center max-w-3xl text-center px-4 w-full">
        <div className="p-4 bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-800 mb-6 shadow-2xl">
          <Wind className="h-12 w-12 text-blue-400" />
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-br from-white via-slate-200 to-slate-500 bg-clip-text text-transparent">
          Aero TraceAI
        </h1>

        {!selectedPath ? (
          <div className="grid md:grid-cols-2 gap-6 w-full max-w-2xl mt-12">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setSelectedPath('citizen')} className="cursor-pointer group relative p-1 rounded-2xl bg-gradient-to-b from-slate-800 to-slate-900 hover:from-blue-500/50 transition-all">
              <div className="h-full bg-slate-950 p-8 rounded-xl flex flex-col items-center justify-center gap-4 border border-slate-800/50">
                <Users className="h-10 w-10 text-slate-400 group-hover:text-blue-400 transition-colors" />
                <h3 className="text-xl font-bold">Public Portal</h3>
              </div>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setSelectedPath('admin')} className="cursor-pointer group relative p-1 rounded-2xl bg-gradient-to-b from-slate-800 to-slate-900 hover:from-emerald-500/50 transition-all">
              <div className="h-full bg-slate-950 p-8 rounded-xl flex flex-col items-center justify-center gap-4 border border-slate-800/50">
                <ShieldCheck className="h-10 w-10 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                <h3 className="text-xl font-bold">Command Center</h3>
              </div>
            </motion.div>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl p-8 rounded-2xl border border-slate-800 shadow-2xl mt-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                {selectedPath === 'admin' ? <ShieldCheck className="h-6 w-6 text-emerald-400"/> : <Users className="h-6 w-6 text-blue-400"/>}
                {isLogin ? 'Login' : 'Sign Up'}
              </h2>
              <button onClick={resetSelection} className="text-sm text-slate-500 hover:text-white">Back</button>
            </div>
            
            {errorMsg && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 text-red-500 text-sm rounded">{errorMsg}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-4 overflow-hidden">
                    <div className="space-y-2 text-left">
                      <label className="text-xs text-slate-400 uppercase">Full Name</label>
                      <Input type="text" required value={name} onChange={e => setName(e.target.value)} className="bg-slate-950 text-white" />
                    </div>
                    {selectedPath === 'citizen' && (
                      <div className="space-y-2 text-left">
                        <label className="text-xs text-slate-400 uppercase">Health Profile</label>
                        <Select value={healthProfile} onValueChange={setHealthProfile}>
                          <SelectTrigger className="w-full bg-slate-950 text-white"><SelectValue/></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="General Public">General Public</SelectItem>
                            <SelectItem value="Asthmatic">Asthmatic</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div className="space-y-2 text-left">
                <label className="text-xs text-slate-400 uppercase">Email</label>
                <Input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="bg-slate-950 text-white" />
              </div>
              <div className="space-y-2 text-left">
                <label className="text-xs text-slate-400 uppercase">Password</label>
                <Input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="bg-slate-950 text-white" />
              </div>
              
              <Button type="submit" disabled={isLoading} className={`w-full mt-4 h-12 font-bold ${selectedPath === 'admin' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
                {isLoading ? "Processing..." : (isLogin ? 'Sign In' : 'Create Account')} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <button onClick={() => setIsLogin(!isLogin)} className="text-slate-400 hover:text-white underline">
                {isLogin ? "Need an account? Sign up" : "Already have an account? Log in"}
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}