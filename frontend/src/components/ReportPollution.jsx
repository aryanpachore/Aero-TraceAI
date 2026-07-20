// src/components/ReportPollution.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, MapPin, Activity, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ReportPollution() {
  const navigate = useNavigate();
  const [location, setLocation] = useState({ lat: null, lng: null, name: 'Acquiring GPS...' });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setLocation(prev => ({ ...prev, lat, lng }));
          
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await res.json();
            const place = data.address.city || data.address.town || data.address.suburb || "Local Area";
            setLocation({ lat, lng, name: place });
          } catch (e) {
            setLocation({ lat, lng, name: `Locked: ${lat.toFixed(4)}, ${lng.toFixed(4)}` });
          }
        },
        (error) => console.error("Location access denied", error)
      );
    }
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmitAlert = async () => {
    if (!image || !location.lat) return;
    
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('image', image);
    formData.append('latitude', location.lat);
    formData.append('longitude', location.lng);
    formData.append('locationName', location.name);

    try {
      await axios.post('https://aero-traceai.onrender.com/api/alerts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      alert("Alert successfully transmitted to the Command Center!");
      navigate('/citizen'); // Send them back to dashboard on success
    } catch (error) {
      console.error("Failed to submit alert", error);
      alert("Failed to submit alert. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 md:p-6 mt-4 space-y-6">
      <button 
        onClick={() => navigate('/citizen')}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.1)] bg-card/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-emerald-500">Report Source</CardTitle>
            <CardDescription>Transmit visual evidence of heavy emissions directly to city administrators.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            <div className="flex items-center space-x-2 text-sm font-medium bg-secondary/50 p-3 rounded-lg border border-border/50">
              <MapPin className="h-4 w-4 shrink-0 text-emerald-500" />
              <span className="truncate">{location.name}</span>
            </div>

            <div className="space-y-4">
              <AnimatePresence mode="wait">
                {preview ? (
                  <motion.div 
                    key="preview"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="relative rounded-xl overflow-hidden border-2 border-emerald-500/50 shadow-lg group"
                  >
                    <img src={preview} alt="Preview" className="w-full h-56 object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button variant="secondary" onClick={() => { setImage(null); setPreview(null); }}>
                        Retake Photo
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="upload"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Input type="file" accept="image/*" capture="environment" className="hidden" id="camera-input" onChange={handleImageChange} />
                    <label 
                      htmlFor="camera-input" 
                      className="flex flex-col items-center justify-center w-full h-56 border-2 border-dashed border-emerald-500/50 rounded-xl cursor-pointer bg-emerald-500/5 hover:bg-emerald-500/10 transition-all"
                    >
                      <Camera className="h-10 w-10 text-emerald-500 mb-3" />
                      <span className="text-sm font-bold text-emerald-500">Tap to Open Camera</span>
                    </label>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <Button 
              className="w-full h-12 text-md font-bold shadow-lg bg-emerald-600 hover:bg-emerald-700" 
              disabled={!image || !location.lat || isSubmitting}
              onClick={handleSubmitAlert}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2"><Activity className="h-5 w-5 animate-spin" /> Transmitting...</span>
              ) : "Transmit to Command Center"}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}