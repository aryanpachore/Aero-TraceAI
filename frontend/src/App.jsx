import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { ThemeProvider } from '@/components/ThemeProvider';
import { ThemeToggle } from '@/components/ThemeToggle';
import CitizenDashboard from '@/components/CitizenDashboard';
import AdminDashboard from '@/components/AdminDashboard';
import LandingPage from '@/components/LandingPage';

function App() {
  // Global Auth State: null | 'citizen' | 'admin'
  const [authRole, setAuthRole] = useState(null);

  const handleLogout = () => {
    setAuthRole(null);
  };

  return (
    <Router>
      <div className="min-h-screen bg-background text-foreground flex flex-col antialiased">
        
        {/* Only render the top Nav Bar if a user is successfully logged in */}
        {authRole && (
          <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between mx-auto px-4 md:px-6">
              
              <div className="flex items-center gap-4">
                <div className="font-bold tracking-tight text-xl bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-50 dark:to-slate-400 bg-clip-text text-transparent">
                  Aero TraceAI
                </div>
                {/* Visual indicator of current role */}
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${authRole === 'admin' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'}`}>
                  {authRole} Portal
                </span>
              </div>
              
              <div className="flex items-center gap-4">
                <ThemeToggle />
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-destructive transition-colors"
                >
                  <LogOut className="h-4 w-4" /> Exit
                </button>
              </div>
            </div>
          </header>
        )}

        <main className="flex-1 flex flex-col">
          <Routes>
            {/* The Entry Gateway */}
            <Route 
              path="/" 
              element={
                !authRole ? <LandingPage setAuthRole={setAuthRole} /> : 
                authRole === 'admin' ? <Navigate to="/admin" replace /> : 
                <Navigate to="/citizen" replace />
              } 
            />

            {/* Locked Citizen Route */}
            <Route 
              path="/citizen" 
              element={
                authRole === 'citizen' ? <CitizenDashboard /> : <Navigate to="/" replace />
              } 
            />

            {/* Locked Admin Route */}
            <Route 
              path="/admin" 
              element={
                authRole === 'admin' ? <AdminDashboard /> : <Navigate to="/" replace />
              } 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;