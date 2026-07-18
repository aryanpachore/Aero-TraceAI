import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, MapPin, TriangleAlert, Activity } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Staggered animation containers
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function CitizenDashboard() {
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  
  const [vulnerability, setVulnerability] = useState('General Public');
  const [language, setLanguage] = useState('English');
  const [aiAdvice, setAiAdvice] = useState(null);
  const [isFetchingAdvice, setIsFetchingAdvice] = useState(true);
  
  // NEW: Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);

  const localAqi = 185; 

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => setLocation({ lat: position.coords.latitude, lng: position.coords.longitude }),
        (error) => console.error("Location access denied", error)
      );
    }
  }, []);

  useEffect(() => {
    const fetchAdvisory = async () => {
      setIsFetchingAdvice(true);
      try {
        const res = await axios.get(`http://localhost:5000/api/advisories/1`, {
          params: { vulnerability, language }
        });
        setAiAdvice(res.data.advisory);
      } catch (error) {
        console.error("Failed to fetch AI advisory:", error);
      } finally {
        setIsFetchingAdvice(false);
      }
    };

    fetchAdvisory();
  }, [vulnerability, language]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // NEW: Alert Submission Handler
  const handleSubmitAlert = async () => {
    if (!image || !location.lat) return;
    
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('image', image);
    formData.append('latitude', location.lat);
    formData.append('longitude', location.lng);
    formData.append('vulnerability', vulnerability);

    try {
      await axios.post('http://localhost:5000/api/alerts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Reset the form on success
      setImage(null);
      setPreview(null);
      alert("Alert successfully transmitted to the Command Center!");
    } catch (error) {
      console.error("Failed to submit alert", error);
      alert("Failed to submit alert. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="w-full max-w-md mx-auto p-4 md:p-6 mt-4 md:mt-8 space-y-6"
    >
      
      {/* Profile & Language Configuration */}
      <motion.div variants={itemVariants} className="flex gap-4">
        <div className="flex-1 space-y-1">
          <label className="text-xs font-semibold text-muted-foreground uppercase">Health Profile</label>
          <Select value={vulnerability} onValueChange={setVulnerability}>
            <SelectTrigger className="w-full bg-background transition-shadow hover:ring-2 hover:ring-primary/20">
              <SelectValue placeholder="Select profile" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="General Public">General Public</SelectItem>
              <SelectItem value="Asthmatic">Asthmatic</SelectItem>
              <SelectItem value="Elderly">Elderly</SelectItem>
              <SelectItem value="Outdoor Worker">Outdoor Worker</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex-1 space-y-1">
          <label className="text-xs font-semibold text-muted-foreground uppercase">Language</label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-full bg-background transition-shadow hover:ring-2 hover:ring-primary/20">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="English">English</SelectItem>
              <SelectItem value="Hindi">हिंदी (Hindi)</SelectItem>
              <SelectItem value="Marathi">मराठी (Marathi)</SelectItem>
              <SelectItem value="Tamil">தமிழ் (Tamil)</SelectItem>
              <SelectItem value="Kannada">ಕನ್ನಡ (Kannada)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* AI Dynamic Advisory Banner */}
      <motion.div variants={itemVariants}>
        <Alert className={`overflow-hidden transition-colors duration-500 ${localAqi > 150 ? 'bg-red-500/10 text-red-600 border-red-500/30' : 'bg-blue-500/10'}`}>
          <AnimatePresence mode="wait">
            {isFetchingAdvice ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex flex-col items-center justify-center p-4 space-y-2 text-muted-foreground"
              >
                <Activity className="h-6 w-6 animate-pulse" />
                <span className="text-sm font-medium">Gemini is translating local guidelines...</span>
              </motion.div>
            ) : (
              <motion.div
                key="resolved"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              >
                <TriangleAlert className="h-5 w-5 mt-0.5" color="currentColor" />
                <AlertTitle className="text-lg font-bold flex items-center gap-2 mb-2">
                  AQI: {localAqi} ({aiAdvice?.aqiCategory || "Evaluating"})
                </AlertTitle>
                <AlertDescription className="space-y-3 font-medium text-sm leading-relaxed text-foreground/90">
                  <motion.p 
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
                    className="bg-background/50 p-3 rounded-lg border border-border/50 shadow-sm"
                  >
                    <span className="font-bold text-red-600 dark:text-red-400 block mb-1">Alert:</span> 
                    {aiAdvice?.healthWarning}
                  </motion.p>
                  <motion.p 
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                    className="bg-background/50 p-3 rounded-lg border border-border/50 shadow-sm"
                  >
                    <span className="font-bold text-blue-600 dark:text-blue-400 block mb-1">Action Required:</span> 
                    {aiAdvice?.recommendedAction}
                  </motion.p>
                </AlertDescription>
              </motion.div>
            )}
          </AnimatePresence>
        </Alert>
      </motion.div>

      {/* Source Reporting Engine */}
      <motion.div variants={itemVariants}>
        <Card className="border-slate-200 dark:border-slate-800 shadow-xl bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl md:text-2xl">Report Emission Source</CardTitle>
            <CardDescription className="text-sm">Capture localized pollution sources for AI verification.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="flex items-center space-x-2 text-xs md:text-sm text-muted-foreground bg-secondary/50 p-3 rounded-md border border-border/50"
            >
              <MapPin className="h-4 w-4 shrink-0 text-emerald-500" />
              <span className="truncate">{location.lat ? `GPS Locked: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : 'Acquiring GPS...'}</span>
            </motion.div>

            <div className="space-y-4">
              <AnimatePresence mode="wait">
                {preview ? (
                  <motion.div 
                    key="preview"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="relative rounded-xl overflow-hidden border-2 border-primary/50 shadow-lg group"
                  >
                    <img src={preview} alt="Preview" className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <Button variant="secondary" onClick={() => { setImage(null); setPreview(null); }}>
                        Retake Photo
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="upload"
                    whileHover={{ scale: 1.02, borderColor: "var(--primary)" }}
                    whileTap={{ scale: 0.98 }}
                    className="relative group"
                  >
                    <Input type="file" accept="image/*" capture="environment" className="hidden" id="camera-input" onChange={handleImageChange} />
                    <label 
                      htmlFor="camera-input" 
                      className="flex flex-col items-center justify-center w-full h-56 border-2 border-dashed border-border rounded-xl cursor-pointer bg-secondary/20 hover:bg-secondary/40 transition-all"
                    >
                      <motion.div 
                        animate={{ y: [0, -5, 0] }} 
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <Camera className="h-10 w-10 text-muted-foreground mb-3 group-hover:text-primary transition-colors" />
                      </motion.div>
                      <span className="text-sm font-medium group-hover:text-primary transition-colors">Tap to open camera</span>
                    </label>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* UPDATED SUBMIT BUTTON */}
            <motion.div 
              whileHover={{ scale: location.lat && image && !isSubmitting ? 1.02 : 1 }} 
              whileTap={{ scale: location.lat && image && !isSubmitting ? 0.98 : 1 }}
            >
              <Button 
                className="w-full h-12 text-md font-bold shadow-lg" 
                disabled={!image || !location.lat || isSubmitting}
                onClick={handleSubmitAlert}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Activity className="h-5 w-5 animate-spin" /> Transmitting...
                  </span>
                ) : (
                  "Submit Alert to Command Center"
                )}
              </Button>
            </motion.div>
            
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}