import React, { useState, useEffect } from 'react';
import { LogIn, User, Lock, AlertCircle, Hourglass, Clock, TrendingUp, Calendar, AlertTriangle, BarChart3 } from 'lucide-react';
import { LoggedInUser } from '../types';
import { mockUsers } from '../data';

interface LoginScreenProps {
  onLogin: (user: LoggedInUser) => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [username, setUsername] = useState('wallada.pras@metrocat.com');
  const [password, setPassword] = useState('1234');
  const [error, setError] = useState<string | null>(null);

  // Generate random floating dots for high-fidelity animations
  const [dots, setDots] = useState<Array<{ id: number; left: string; size: string; delay: string; duration: string }>>([]);

  useEffect(() => {
    // Deterministic random arrays to avoid server mismatch, generated on client mount.
    const newDots = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      left: `${(i * 7) % 100}%`,
      size: `${3 + (i % 5)}px`,
      delay: `${(i * 0.4).toFixed(1)}s`,
      duration: `${10 + (i % 8)}s`,
    }));
    setDots(newDots);
  }, []);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedUsername = username.trim().toLowerCase();
    
    // Support matching both exact email and the username prefix
    const matchedUser = mockUsers.find(user => {
      const fullMatch = user.username.toLowerCase() === trimmedUsername;
      const prefixMatch = user.username.split('@')[0].toLowerCase() === trimmedUsername;
      return fullMatch || prefixMatch;
    });

    if (!matchedUser) {
      setError('ไม่พบชื่อผู้ใช้งานในระบบ (อ้างอิงอีเมลหรือ Username ที่กำหนด)');
      return;
    }

    if (password !== '1234') {
      setError('รหัสผ่านไม่ถูกต้อง (กรุณาใช้รหัสผ่านทดสอบ: 1234)');
      return;
    }

    onLogin({
      username: matchedUser.username,
      fullName: matchedUser.fullName,
      role: matchedUser.role,
      title: matchedUser.title,
      branch: matchedUser.branch,
      region: matchedUser.region,
      salesmanId: matchedUser.salesmanId,
      businessUnit: (matchedUser as any).businessUnit,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#E8E2DB] font-sans px-4 py-8 relative overflow-hidden select-none">
      
      {/* Self-contained CSS Animations specific to the modern Credit Ledger / Aging Report trend theme */}
      <style>{`
        @keyframes ledgerScroll {
          0% { transform: translateY(0); }
          100% { transform: translateY(-40px); }
        }
        @keyframes floatUpwardCurve {
          0% { stroke-dashoffset: 1000; opacity: 0; }
          20% { opacity: 0.85; }
          90% { opacity: 0.85; }
          100% { stroke-dashoffset: 0; opacity: 0.1; }
        }
        @keyframes pulseNode {
          0%, 100% { transform: scale(1); opacity: 0.4; filter: drop-shadow(0 0 2px rgba(26, 50, 99, 0.2)); }
          50% { transform: scale(1.3); opacity: 0.95; filter: drop-shadow(0 0 8px rgba(26, 50, 99, 0.5)); }
        }
        @keyframes pulseNodeGold {
          0%, 100% { transform: scale(1); opacity: 0.5; filter: drop-shadow(0 0 2px rgba(255, 197, 12, 0.3)); }
          50% { transform: scale(1.35); opacity: 0.95; filter: drop-shadow(0 0 10px rgba(255, 197, 12, 0.7)); }
        }
        @keyframes pulseNodeGreen {
          0%, 100% { transform: scale(1); opacity: 0.5; filter: drop-shadow(0 0 2px rgba(16, 185, 129, 0.3)); }
          50% { transform: scale(1.35); opacity: 0.95; filter: drop-shadow(0 0 10px rgba(16, 185, 129, 0.7)); }
        }
        @keyframes microDotFloat {
          0% { transform: translateY(110vh) translateX(0); opacity: 0; }
          15% { opacity: 0.5; }
          85% { opacity: 0.5; }
          100% { transform: translateY(-10vh) translateX(30px); opacity: 0; }
        }
        @keyframes waveShift {
          0% { transform: translateX(0) scaleY(1); }
          50% { transform: translateX(-2%) scaleY(1.05); }
          100% { transform: translateX(0) scaleY(1); }
        }
        .scrolling-ledger-grid {
          background-size: 50px 50px;
          background-image: 
            linear-gradient(to right, rgba(26, 50, 99, 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(26, 50, 99, 0.03) 1px, transparent 1px);
          animation: ledgerScroll 25s linear infinite;
        }
        .path-curve-animated-1 {
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
          animation: floatUpwardCurve 12s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        .path-curve-animated-2 {
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
          animation: floatUpwardCurve 16s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          animation-delay: 3s;
        }
        .path-curve-animated-3 {
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
          animation: floatUpwardCurve 20s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          animation-delay: 6s;
        }
      `}</style>

      {/* BACKGROUND GRAPHICS: Modern Trending Upward Sales Charts & Credit Recovery Flow */}
      
      {/* 1. Moving Tech Grid Lines for Credit Balance Matrix */}
      <div className="absolute inset-0 scrolling-ledger-grid pointer-events-none opacity-80 z-0" />
      
      {/* 2. Radial backdrop gradient lighting to enhance `#E8E2DB` elegance */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-gradient-to-tr from-[#1A3263]/12 via-[#FFC50C]/6 to-transparent rounded-full blur-3xl pointer-events-none z-0" />

      {/* 3. Dynamic Upward Sales/Credit Trend Line Curves */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
        <svg className="w-full h-full opacity-65" xmlns="http://www.w3.org/2000/svg">
          {/* Defined gradients for the chart lines to match Navy #1A3263 and Gold #FFC50C and Emerald */}
          <defs>
            <linearGradient id="gradientNavy" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1A3263" stopOpacity="0.05" />
              <stop offset="50%" stopColor="#1A3263" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#1A3263" stopOpacity="0.85" />
            </linearGradient>
            <linearGradient id="gradientGold" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FFC50C" stopOpacity="0.0" />
              <stop offset="50%" stopColor="#FFC50C" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#FFC50C" stopOpacity="0.9" />
            </linearGradient>
            <linearGradient id="gradientGreen" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.0" />
              <stop offset="50%" stopColor="#10B981" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.8" />
            </linearGradient>
            
            <linearGradient id="areaNavy" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1A3263" stopOpacity="0.0" />
              <stop offset="100%" stopColor="#1A3263" stopOpacity="0.04" />
            </linearGradient>
          </defs>

          {/* Solid subtle reference lines in background with labeled aging buckets */}
          <line x1="0" y1="80%" x2="100%" y2="80%" stroke="#1A3263" strokeOpacity="0.07" strokeWidth="1" strokeDasharray="5,5" />
          <line x1="0" y1="55%" x2="100%" y2="55%" stroke="#1A3263" strokeOpacity="0.07" strokeWidth="1" strokeDasharray="5,5" />
          <line x1="0" y1="30%" x2="100%" y2="30%" stroke="#1A3263" strokeOpacity="0.07" strokeWidth="1" strokeDasharray="5,5" />

          {/* Area under the main navy recovery curve */}
          <path 
            d="M 0,1000 Q 250,850 500,600 T 1000,150 L 1000,1000 Z" 
            fill="url(#areaNavy)" 
            className="origin-bottom-left"
            style={{ animation: 'waveShift 15s ease-in-out infinite' }}
          />

          {/* Curve 1: The Major Recovered Invoices Line (Navy Blue) */}
          <path 
            d="M -50,900 C 150,850 350,600 550,450 S 800,200 1200,80" 
            fill="none" 
            stroke="url(#gradientNavy)" 
            strokeWidth="3.5" 
            strokeLinecap="round"
            className="path-curve-animated-1" 
          />

          {/* Curve 2: The Fast-Moving Sales Velocity curve (Gold) */}
          <path 
            d="M -50,750 C 200,720 300,450 600,380 S 900,120 1250,-20" 
            fill="none" 
            stroke="url(#gradientGold)" 
            strokeWidth="2.5" 
            strokeLinecap="round"
            className="path-curve-animated-2" 
          />

          {/* Curve 3: Positive Cash flow index (Emerald Green) */}
          <path 
            d="M -50,980 Q 250,750 650,490 T 1200,150" 
            fill="none" 
            stroke="url(#gradientGreen)" 
            strokeWidth="2" 
            strokeLinecap="round"
            className="path-curve-animated-3" 
          />

          {/* Interactive Graph Data Intersection Nodes - pulsating along the graph trajectory */}
          <g>
            {/* Node 1 on Navy line */}
            <circle cx="550" cy="450" r="5" fill="#1A3263" className="origin-center" style={{ animation: 'pulseNode 3s infinite ease-in-out' }} />
            <circle cx="550" cy="450" r="10" fill="none" stroke="#1A3263" strokeWidth="1" className="origin-center" style={{ animation: 'pulseNode 3s infinite ease-in-out' }} />
            
            {/* Node 2 on Gold Line */}
            <circle cx="600" cy="380" r="4.5" fill="#FFC50C" className="origin-center" style={{ animation: 'pulseNodeGold 2.5s infinite ease-in-out' }} />
            <circle cx="600" cy="380" r="9.5" fill="none" stroke="#FFC50C" strokeWidth="1" className="origin-center" style={{ animation: 'pulseNodeGold 2.5s infinite ease-in-out' }} />

            {/* Node 3 on Green line */}
            <circle cx="750" cy="320" r="4" fill="#10B981" className="origin-center" style={{ animation: 'pulseNodeGreen 3.5s infinite ease-in-out' }} />
            <circle cx="750" cy="320" r="8" fill="none" stroke="#10B981" strokeWidth="1" className="origin-center" style={{ animation: 'pulseNodeGreen 3.5s infinite ease-in-out' }} />
          </g>
        </svg>
      </div>

      {/* 4. Tiny Floating Ledger Data Packets ascending slowly */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {dots.map((dot) => (
          <div
            key={dot.id}
            className="absolute rounded-full bg-[#1A3263]"
            style={{
              left: dot.left,
              width: dot.size,
              height: dot.size,
              animation: `microDotFloat ${dot.duration} linear infinite`,
              animationDelay: dot.delay,
              bottom: '-20px',
            }}
          />
        ))}
      </div>

      {/* 5. Minimalist floating neon accent rings to convey structured timelines */}
      <div className="absolute top-20 left-12 w-96 h-96 border border-[#1A3263]/5 rounded-full pointer-events-none flex items-center justify-center animate-[spin_60s_linear_infinite] z-0">
        <div className="w-80 h-80 border border-dashed border-[#1A3263]/5 rounded-full" />
      </div>

      {/* LOGIN CARD */}
      <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_25px_60px_-15px_rgba(26,50,99,0.15)] overflow-hidden p-8 border border-white z-10 relative">
        
        {/* Decorative corner tag signifying credit control metrics */}
        <div className="absolute top-0 right-0 h-16 w-16 overflow-hidden rounded-tr-2xl pointer-events-none">
          <div className="absolute transform rotate-45 bg-[#E2ECFF]/70 text-[#1A3263] text-[7px] font-black text-center py-1 right-[-32px] top-[14px] w-28 uppercase tracking-widest border-b border-white">
            SECURE
          </div>
        </div>

        {/* App Logo & Brand Icon */}
        <div className="flex flex-col items-center mb-5">
          <div className="relative w-16 h-16 mb-2">
            {/* Outer decorative revolving dashed timer constraint */}
            <div className="absolute inset-0 rounded-2xl border-2 border-dashed border-[#FFC50C]/65 animate-[spin_30s_linear_infinite]" />
            {/* Main icon badge */}
            <div className="absolute inset-1 bg-[#1A3263] rounded-xl flex items-center justify-center shadow-md border-2 border-[#FFC50C] transform transition-transform duration-300 hover:scale-105">
              <div className="relative flex items-center justify-center">
                <BarChart3 className="w-7 h-7 text-[#FFC50C]/10 absolute" />
                <TrendingUp className="w-6 h-6 text-[#FFC50C] relative z-10" />
              </div>
            </div>
            {/* Aging alert beacon */}
            <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FFC50C]"></span>
            </span>
          </div>
          <h1 className="text-[#1A3263] text-2xl font-black mt-2 tracking-wider">LOGIN</h1>
          <p className="text-[#FFC50C] font-semibold text-xs tracking-widest mt-0.5">AGING REPORT</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSignIn} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-700 text-xs p-3 rounded-xl border border-red-100 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Username */}
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
              EMAIL / USERNAME
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-4 w-4 text-[#547792]" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-xs bg-[#F7F6F4] text-[#1A3263] font-semibold focus:outline-none focus:ring-2 focus:ring-[#FFC50C] focus:border-transparent transition-all"
                placeholder="username@metrocat.com"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
              PASSWORD
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-[#547792]" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-xs bg-[#F7F6F4] text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#FFC50C] focus:border-transparent transition-all"
                placeholder="••••"
              />
            </div>
          </div>

          <div className="flex items-center text-[11px] text-[#547792] font-semibold">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded border-gray-300 text-[#FFC50C] focus:ring-[#FFC50C]" />
              <span>Remember me</span>
            </label>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            className="w-full bg-[#FFC50C] text-[#1A3263] hover:bg-[#ffcf33] font-extrabold text-xs py-3 px-4 rounded-xl flex items-center justify-center space-x-2 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 cursor-pointer uppercase tracking-widest"
          >
            <span>SIGN IN</span>
            <LogIn className="h-4 w-4 stroke-[2.5]" />
          </button>
        </form>

        {/* Footer Brand Info */}
        <div className="mt-8 pt-6 border-t border-gray-100 text-center flex flex-col items-center">
          <img 
            src="/metro.png" 
            alt="METRO CAT" 
            className="h-5 object-contain select-none opacity-80 hover:opacity-100 transition-opacity"
            referrerPolicy="no-referrer"
          />
          <p className="text-[10px] text-[#547792] mt-1.5 font-medium">© 2026 METRO CAT. Information Technology Solutions</p>
        </div>

      </div>

      {/* Floating Identity Switcher Component (at bottom-right corner as requested) */}
      <div className="absolute bottom-4 right-4 w-64 bg-white/95 backdrop-blur-md rounded-xl p-2.5 shadow-lg border border-gray-200/80 z-50 transform hover:scale-[1.01] transition-transform duration-200">
        <div className="flex items-center space-x-1.5 mb-1.5">
          <span className="flex h-1.5 w-1.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FFC50C] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#FFC50C]"></span>
          </span>
          <label className="block text-[9px] font-black text-[#1A3263] uppercase tracking-wider">
            Mock User Accounts (สลับผู้ใช้)
          </label>
        </div>
        <div className="space-y-1 max-h-[220px] overflow-y-auto pr-0.5">
          {mockUsers.map((u) => {
            const isCurrent = username.toLowerCase() === u.username.toLowerCase() || username.toLowerCase() === u.username.split('@')[0].toLowerCase();
            return (
              <button
                key={u.username}
                type="button"
                onClick={() => {
                  setUsername(u.username);
                  setPassword('1234');
                  setError(null);
                }}
                className={`w-full py-1 px-2 rounded-lg text-[9.5px] font-bold text-left transition-all duration-150 flex flex-col justify-center border ${
                  isCurrent
                    ? 'bg-[#1A3263] text-white border-transparent'
                    : 'bg-gray-50 text-[#1A3263] border-gray-150 hover:bg-gray-100'
                }`}
              >
                <div className="flex justify-between items-center w-full">
                  <span className={`text-[9.5px] truncate max-w-[130px] ${isCurrent ? 'text-white' : 'text-[#1A3263]'}`}>{u.fullName}</span>
                  <span className={`text-[7px] font-black px-1.5 py-0.5 rounded uppercase ${
                    u.role === 'CREDIT' ? 'bg-indigo-100 text-indigo-700' :
                    u.role === 'NORTHEAST' ? 'bg-orange-100 text-orange-700' :
                    u.role === 'BRANCH_MANAGER' ? 'bg-green-100 text-green-700' :
                    u.role === 'SA' ? 'bg-purple-100 text-purple-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {u.role === 'SA' ? 'SA' : u.role.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex justify-between items-center w-full mt-0.5 text-[8px]">
                  <span className={`truncate max-w-[140px] ${isCurrent ? 'text-slate-300 font-normal' : 'text-[#547792] font-medium'}`}>{u.title}</span>
                  <span className={`font-mono ${isCurrent ? 'text-[#FFC50C] font-semibold' : 'text-gray-400'}`}>
                    pass: 1234
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
