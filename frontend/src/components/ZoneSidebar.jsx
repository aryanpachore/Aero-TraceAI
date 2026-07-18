// src/components/ZoneSidebar.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, FileText, Factory, Car, ShieldAlert, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Define Framer Motion variants for staggered animations
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function ZoneSidebar({ selectedZone, getColor, onActionLogged }) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionInput, setActionInput] = useState('');
  const [pastLogs, setPastLogs] = useState([]);

  useEffect(() => {
    if (!selectedZone) return;

    const fetchZoneIntelligence = async () => {
      setLoading(true);
      try {
        const insightRes = await axios.get(`http://localhost:5000/api/insights/${selectedZone.id}`);
        setInsights(insightRes.data);

        const logsRes = await axios.get(`http://localhost:5000/api/interventions/${selectedZone.id}`);
        setPastLogs(logsRes.data);
      } catch (err) {
        console.error("Failed to gather intelligence profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchZoneIntelligence();
  }, [selectedZone]);

  const handleLogAction = async (e) => {
    e.preventDefault();
    if (!actionInput.trim()) return;

    try {
      const res = await axios.post('http://localhost:5000/api/interventions', {
        zoneId: selectedZone.id,
        actionTaken: actionInput,
        notes: `Manual dispatch log execution targeting localized pollutants.`
      });
      setPastLogs([res.data, ...pastLogs]);
      setActionInput('');
      if (onActionLogged) onActionLogged();
    } catch (err) {
      console.error("Audit log creation failure:", err);
    }
  };

  if (!selectedZone) {
    return (
      <Card className="h-auto lg:h-[700px] flex flex-col items-center justify-center text-muted-foreground p-6 text-center border-slate-200 dark:border-slate-800">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
        >
          <Activity className="h-12 w-12 opacity-20 mb-4" />
        </motion.div>
        <h3 className="text-lg font-medium">No Monitoring Area Highlighted</h3>
        <p className="text-sm text-muted-foreground/80 mt-1 max-w-xs">Select a dynamic map vector component node to extract active Groq metrics matrix.</p>
      </Card>
    );
  }

  const confidence = insights?.confidenceBreakdown || { traffic: 33, industrial: 33, dust: 34 };

  return (
    <Card className="h-auto lg:h-[700px] flex flex-col border-slate-200 dark:border-slate-800 overflow-hidden">
      <CardHeader className="border-b bg-muted/20 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg md:text-xl font-bold truncate">{selectedZone.name}</CardTitle>
          <span className="text-xs px-2 py-1 rounded bg-slate-200 dark:bg-slate-800 font-mono">ID: {selectedZone.id}</span>
        </div>
        <CardDescription>Live Cloud Core Ingestion Real-time Feed Mapping Matrix</CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-48 flex flex-col items-center justify-center space-y-2"
            >
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-xs text-muted-foreground">Running Groq Fingerprinting Engine...</p>
            </motion.div>
          ) : (
            <motion.div 
              key="content"
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="space-y-6"
            >
              {/* Primary Analysis Module */}
              <motion.div variants={itemVariants} className="flex items-center justify-between bg-secondary/30 p-4 rounded-xl border">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Reported Primary Culprit</p>
                  <h4 className="text-lg font-bold mt-1 text-primary capitalize">{insights?.primaryCulprit || "Calculating..."}</h4>
                </div>
                <motion.div 
                  initial={{ rotate: -20, scale: 0.8 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  <ShieldAlert className="h-8 w-8 text-orange-500 opacity-80" />
                </motion.div>
              </motion.div>

              {/* Source Percentage Bars */}
              <motion.div variants={itemVariants} className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <Activity className="h-3.5 w-3.5" /> Groq Confidence Matrix
                </h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs font-medium mb-1">
                      <span className="flex items-center gap-1"><Car className="h-3 w-3"/> Vehicular Fleets</span>
                      <span>{confidence.traffic}%</span>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${confidence.traffic}%` }}
                        transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                        className="h-full bg-orange-500"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-medium mb-1">
                      <span className="flex items-center gap-1"><Factory className="h-3 w-3"/> Point-Source Exhaust</span>
                      <span>{confidence.industrial}%</span>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${confidence.industrial}%` }}
                        transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
                        className="h-full bg-red-500" 
                      />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* VISUAL EVIDENCE BLOCK */}
              {selectedZone.imageUrl && (
                <motion.div variants={itemVariants} className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                    <span>Field Evidence</span>
                    <span className="text-[10px] bg-orange-500/20 text-orange-500 px-2 py-0.5 rounded uppercase">{selectedZone.status}</span>
                  </h4>
                  <div className="relative rounded-lg overflow-hidden border-2 border-border shadow-sm group">
                    <img 
                      src={selectedZone.imageUrl} 
                      alt="Citizen Evidence" 
                      className="w-full h-40 object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => { e.target.style.display = 'none' }} // Hides gracefully if image is missing
                    />
                    <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-2">
                      <p className="text-[10px] text-white/90 font-mono">Citizen Uploaded Payload</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Descriptive AI Insight Text Block */}
              <motion.div variants={itemVariants} className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">AI Intelligence Narrative</h4>
                <p className="text-xs leading-relaxed bg-slate-50 dark:bg-slate-900 p-3.5 rounded-lg border border-dashed">
                  {insights?.aiSummary || "System parsing input plume patterns context array..."}
                </p>
              </motion.div>

              {/* Inline Intervention Insertion Input */}
              <motion.div variants={itemVariants} className="space-y-3 pt-2 border-t">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Log Immediate Mitigation</h4>
                <form onSubmit={handleLogAction} className="flex gap-2">
                  <Input 
                    value={actionInput}
                    onChange={(e) => setActionInput(e.target.value)}
                    placeholder="e.g., Deploy water trucks..." 
                    className="text-xs h-9"
                  />
                  <Button type="submit" size="sm" className="h-9 px-3 shrink-0"><Plus className="h-4 w-4 mr-1"/> Log</Button>
                </form>
              </motion.div>

              {/* Historical Verification Feed */}
              <motion.div variants={itemVariants} className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5" /> Audit Trail ({pastLogs.length})
                </h4>
                <div className="max-h-40 overflow-y-auto space-y-2 rounded-lg border bg-muted/10 p-2">
                  {pastLogs.length === 0 ? (
                    <p className="text-[11px] text-muted-foreground text-center py-4">No logged mitigation data registered for this node boundary.</p>
                  ) : (
                    <AnimatePresence>
                      {pastLogs.map((log) => (
                        <motion.div 
                          key={log.id} 
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="text-[11px] bg-background border p-2 rounded flex flex-col gap-0.5 shadow-2xs"
                        >
                          <span className="font-semibold text-foreground/90">{log.actionTaken}</span>
                          <span className="text-muted-foreground/70 font-mono text-[9px]">
                            {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {log.loggedBy}
                          </span>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}