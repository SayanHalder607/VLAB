import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap } from 'lucide-react';
import { HeaderBranding } from './features/HeaderBranding';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col relative overflow-hidden font-sans">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#FF6B35]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-500/5 blur-[100px] pointer-events-none" />
      
      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between">
        <HeaderBranding />
        
        <div>
          <button 
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 text-sm font-semibold bg-[#FF6B35] hover:bg-[#ff804d] text-slate-900 rounded-xl transition-all shadow-[0_4px_20px_rgba(255,107,53,0.3)] cursor-pointer"
          >
            Open
          </button>
        </div>
      </header>

      {/* Hero & Auth Panel Split */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-6 flex flex-col lg:flex-row items-center justify-between gap-12 py-12 lg:py-20">
        
        {/* Left Side: Tagline and features */}
        <div className="flex-1 space-y-6 lg:max-w-xl text-center lg:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FF6B35]/10 rounded-full border border-[#FF6B35]/20 text-[#FF6B35] text-xs font-semibold uppercase tracking-wider mb-2">
            <Zap className="w-3.5 h-3.5 fill-current" /> Design, Simulate, Innovate
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Create Electronics <br className="hidden sm:inline" />
            Without <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FF6B35] to-orange-400">Limits</span>.
          </h1>
          
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
            Build, simulate, and debug interactive microcontrollers and sensors directly in your web browser. Write real code, visualize signals, and bring your ideas to life.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full sm:w-auto px-8 py-3.5 bg-[#FF6B35] hover:bg-[#ff804d] text-slate-900 font-bold rounded-xl transition-all shadow-[0_4px_20px_rgba(255,107,53,0.3)] text-sm cursor-pointer"
            >
              Open Dashboard
            </button>
          </div>

          {/* Micro Stats */}
          <div className="grid grid-cols-3 gap-6 pt-10 border-t border-slate-300/60 max-w-md mx-auto lg:mx-0">
            <div>
              <div className="text-2xl font-bold text-slate-900">100%</div>
              <div className="text-xs text-slate-500">Virtual Simulation</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">15+</div>
              <div className="text-xs text-slate-500">Pre-built Parts</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">C++/Python</div>
              <div className="text-xs text-slate-500">Dual Programming</div>
            </div>
          </div>
        </div>

        {/* Right Side: Open Box */}
        <div id="auth-section" className="w-full max-w-md bg-white/70 border border-slate-300/80 backdrop-blur-md p-8 rounded-3xl shadow-2xl flex flex-col items-center justify-center transition-all duration-300 min-h-[300px]">
          <h2 className="text-2xl font-bold text-slate-900 mb-4 text-center">Ready to Start?</h2>
          <p className="text-sm text-slate-600 mb-8 text-center">Jump right into the simulator without creating an account.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full py-4 bg-[#FF6B35] hover:bg-[#ff804d] text-slate-900 font-bold rounded-xl text-lg transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            Open Simulator
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 border-t border-slate-300/60 bg-white/20 text-center text-xs text-slate-500 mt-auto">
        &copy; {new Date().getFullYear()} DSULab. Designed for virtual physics and engineering labs.
      </footer>
    </div>
  );
};
