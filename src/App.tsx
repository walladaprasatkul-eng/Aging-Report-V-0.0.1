import React, { useState } from 'react';
import { 
  BarChart3, Users, Building, LogOut, ArrowLeft, ShieldAlert, 
  Menu, HelpCircle, Laptop, ChevronLeft, ChevronRight
} from 'lucide-react';
import { LoggedInUser, Customer } from './types';
import { mockCustomers } from './data';
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/Dashboard';
import SalesmanView from './components/SalesmanView';
import CustomerDetailView from './components/CustomerDetailView';

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<LoggedInUser | null>(null);

  // View States
  // For Manager: 'dashboard', 'salesman-detail', 'customer-detail'
  // For Salesman: 'salesman-portfolio', 'customer-detail'
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [selectedSalesmanId, setSelectedSalesmanId] = useState<string | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  // Left sidebar collapse state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Avatar update callback
  const handleUpdateAvatar = (url: string) => {
    if (currentUser) {
      const updated = { ...currentUser, avatarUrl: url };
      setCurrentUser(updated);
      localStorage.setItem(`avatar_${currentUser.username}`, url);
    }
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && currentUser) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          handleUpdateAvatar(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Authentication callbacks
  const handleLogin = (user: LoggedInUser) => {
    const savedAvatar = localStorage.getItem(`avatar_${user.username}`);
    const userWithAvatar = savedAvatar ? { ...user, avatarUrl: savedAvatar } : user;
    setCurrentUser(userWithAvatar);
    if (userWithAvatar.role === 'SALESMAN') {
      setCurrentView('salesman-portfolio');
      setSelectedSalesmanId(userWithAvatar.salesmanId || null);
    } else {
      setCurrentView('dashboard');
      setSelectedSalesmanId(null);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('dashboard');
    setSelectedSalesmanId(null);
    setSelectedCustomerId(null);
  };

  // Safe fetch of selected customer data
  const activeCustomer = mockCustomers.find(c => c.id === selectedCustomerId) || mockCustomers[0];

  // If not logged in, render the login page
  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#E8E2DB] text-[#1a3263] flex font-sans">
      
      {/* 1. LEFT SIDEBAR (Meticulously mimicking the screenshot with dark blue #1A3263 & yellow items) */}
      <aside 
        className={`bg-[#1A3263] text-white flex flex-col shrink-0 transition-all duration-300 min-h-screen border-r border-[#547792]/20 select-none ${
          sidebarCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {/* Sidebar Header Brand (Metro Cat logo style) */}
        <div className={`h-16 flex items-stretch border-b border-[#14264d]/60 overflow-hidden shrink-0 select-none transition-colors duration-300 ${
          sidebarCollapsed ? 'bg-[#1A3263]' : 'bg-[#16274d]/30'
        }`}>
          <div className="flex-1 flex items-stretch h-full cursor-pointer hover:opacity-95 transition-opacity" onClick={() => setCurrentView('dashboard')}>
            {sidebarCollapsed ? (
              <div className="w-full h-full bg-[#1A3263]" />
            ) : (
              <img 
                src="/metro.png" 
                alt="METRO CAT" 
                className="w-full h-full select-none object-fill"
                referrerPolicy="no-referrer"
              />
            )}
          </div>
        </div>

        {/* Sidebar Active Logged User Block */}
        {sidebarCollapsed ? (
          <div className="p-3 border-b border-[#14264d]/40 bg-[#162a54]/45 flex justify-center shrink-0 select-none">
            <button 
              onClick={() => setSidebarCollapsed(false)}
              className="text-slate-300 hover:text-[#FFC50C] p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer select-none border border-white/10 shadow-sm"
              title="ขยายเมนู (Expand Sidebar)"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="p-4 border-b border-[#14264d]/40 bg-[#162a54]/45 flex flex-col shrink-0 select-none">
            <input 
              type="file" 
              id="sidebar-avatar-input" 
              accept="image/*" 
              onChange={handleAvatarFileChange} 
              className="hidden" 
            />
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-3 overflow-hidden">
                <div 
                  onClick={() => document.getElementById('sidebar-avatar-input')?.click()}
                  className="w-12 h-12 bg-[#FFC50C] rounded-xl flex items-center justify-center shrink-0 cursor-pointer hover:brightness-110 active:scale-95 transition-all overflow-hidden relative group shadow-md border border-white/10"
                  title="คลิกเพื่ออัปโหลดรูปโปรไฟล์ (Click to upload profile image)"
                >
                  {currentUser.avatarUrl ? (
                    <img src={currentUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-7 h-7 text-[#1A3263]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="text-[7px] text-white font-extrabold uppercase tracking-wide">Upload</span>
                  </div>
                </div>
                
                <div className="overflow-hidden">
                  <p className="text-xs font-black text-white uppercase tracking-wider truncate">
                    {currentUser.fullName ? (
                      currentUser.fullName.replace('Mr. ', '').replace('Ms. ', '').split(' ').map((lbl, idx) => {
                        if (idx === 0) return lbl; // keep first name
                        return lbl.charAt(0) + '.'; // abbreviate last name
                      }).join(' ')
                    ) : 'User'}
                  </p>
                  <p className="text-[9px] text-[#7a9cb5] font-extrabold tracking-widest uppercase truncate mt-0.5">
                    {currentUser.role === 'CREDIT' ? 'ADMINISTRATOR' : 
                     currentUser.role === 'NORTHEAST' ? 'REGIONAL MGR' :
                     currentUser.role === 'BRANCH_MANAGER' ? 'BRANCH MGR' :
                     currentUser.role === 'SA' ? 'SERVICE ADVISOR' : 'SALES FORCE'}
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setSidebarCollapsed(true)}
                className="text-slate-300 hover:text-[#FFC50C] p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer shrink-0"
                title="ย่อเมนู (Collapse Sidebar)"
              >
                <Menu className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* SIDEBAR NAVIGATION ITEMS */}
        <nav className={`flex-1 mt-4 transition-all duration-300 ${sidebarCollapsed ? 'px-2 space-y-3' : 'p-3 space-y-1.5'}`}>
          
          {/* Item 1: Dashboard (Enabled for Credit, Northeast regional, and Branch Manager) */}
          {currentUser.role !== 'SALESMAN' && (
            <button
              onClick={() => {
                setCurrentView('dashboard');
                setSelectedSalesmanId(null);
                setSelectedCustomerId(null);
              }}
              className={`w-full flex items-center transition-all cursor-pointer relative group ${
                sidebarCollapsed 
                  ? 'h-11 w-11 justify-center rounded-xl mx-auto shadow-sm' 
                  : 'space-x-3 px-3 py-2.5 rounded-lg text-xs font-bold'
              } ${
                currentView === 'dashboard' && !selectedCustomerId
                  ? 'bg-[#FFC50C] text-[#1A3263] font-black shadow-md'
                  : 'text-slate-200 hover:bg-white/5 hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4 shrink-0" />
              {!sidebarCollapsed && <span>Dashboard</span>}
              
              {/* Floating Tooltip in collapsed state */}
              {sidebarCollapsed && (
                <div className="absolute left-14 bg-slate-900 border border-slate-700 text-white text-[10px] uppercase font-black tracking-wider px-2.5 py-1.5 rounded-md shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                  Dashboard
                </div>
              )}
            </button>
          )}

          {/* Item 2: Salesman Portfolio Tracker */}
          <button
            onClick={() => {
              if (currentUser.role === 'SALESMAN') {
                setCurrentView('salesman-portfolio');
                setSelectedSalesmanId(currentUser.salesmanId || null);
              } else {
                setCurrentView('salesman-portfolio');
                setSelectedSalesmanId(selectedSalesmanId || 'S-4-121');
              }
              setSelectedCustomerId(null);
            }}
            className={`w-full flex items-center transition-all cursor-pointer relative group ${
              sidebarCollapsed 
                ? 'h-11 w-11 justify-center rounded-xl mx-auto shadow-sm' 
                : 'space-x-3 px-3 py-2.5 rounded-lg text-xs font-bold'
            } ${
              currentView === 'salesman-portfolio' && !selectedCustomerId
                ? 'bg-[#FFC50C] text-[#1A3263] font-black shadow-md'
                : 'text-slate-200 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4 shrink-0" />
            {!sidebarCollapsed && (
              <span>
                {currentUser.role === 'SALESMAN' 
                  ? 'My Customer Portfolio' 
                  : `Salesman View (${selectedSalesmanId || 'Select One'})`
                }
              </span>
            )}

            {/* Floating Tooltip in collapsed state */}
            {sidebarCollapsed && (
              <div className="absolute left-14 bg-slate-900 border border-slate-700 text-white text-[10px] uppercase font-black tracking-wider px-2.5 py-1.5 rounded-md shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                {currentUser.role === 'SALESMAN' 
                  ? 'My Customer Portfolio' 
                  : `Salesman View (${selectedSalesmanId || 'Select One'})`
                }
              </div>
            )}
          </button>

          {/* Item 3: Customer Profiles Master File */}
          <button
            onClick={() => {
              setCurrentView('customer-detail');
              setSelectedCustomerId(selectedCustomerId || 'C29704');
            }}
            className={`w-full flex items-center transition-all cursor-pointer relative group ${
              sidebarCollapsed 
                ? 'h-11 w-11 justify-center rounded-xl mx-auto shadow-sm' 
                : 'space-x-3 px-3 py-2.5 rounded-lg text-xs font-bold'
            } ${
              currentView === 'customer-detail' || selectedCustomerId
                ? 'bg-[#FFC50C] text-[#1A3263] font-black shadow-md'
                : 'text-slate-200 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Building className="w-4 h-4 shrink-0" />
            {!sidebarCollapsed && <span>Customer Master</span>}

            {/* Floating Tooltip in collapsed state */}
            {sidebarCollapsed && (
              <div className="absolute left-14 bg-slate-900 border border-slate-700 text-white text-[10px] uppercase font-black tracking-wider px-2.5 py-1.5 rounded-md shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                Customer Master
              </div>
            )}
          </button>
        </nav>

        {/* Sidebar Footer */}
        <div className={`border-t border-[#14264d] bg-[#14264d]/30 ${sidebarCollapsed ? 'p-2' : 'p-3'}`}>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center transition-colors rounded-lg font-bold text-red-300 hover:bg-red-950/30 hover:text-red-200 cursor-pointer relative group ${
              sidebarCollapsed 
                ? 'h-11 w-11 justify-center mx-auto' 
                : 'space-x-3 px-3 py-2.5 text-xs'
            }`}
          >
            <LogOut className="w-4 h-4 shrink-0 text-red-400/90 group-hover:text-red-300" />
            {!sidebarCollapsed && <span>LOGOUT SIGN OUT</span>}

            {/* Floating Tooltip in collapsed state */}
            {sidebarCollapsed && (
              <div className="absolute left-14 bg-red-950 border border-red-800 text-red-200 text-[10px] uppercase font-black tracking-wider px-2.5 py-1.5 rounded-md shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                LOGOUT SIGN OUT
              </div>
            )}
          </button>
        </div>

      </aside>

      {/* 2. PRIMARY CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-150 flex items-stretch justify-between px-6 shrink-0 relative z-30 select-none">
          <div className="flex items-stretch">
            {/* Dynamic visual tab matching screenshot */}
            <div className="relative flex flex-col justify-end pb-3.5">
              <span className="text-base sm:text-lg font-black tracking-widest text-slate-950 uppercase select-none">
                {currentView === 'dashboard' ? 'DASHBOARD' : 
                 currentView === 'salesman-portfolio' ? 'SALES REPRESENTATIVE' : 'CUSTOMER'}
              </span>
              {/* Yellow brand underline indicator */}
              <span className="h-[4px] w-14 bg-[#FFC50C] absolute bottom-0 left-0 rounded-t-sm"></span>
            </div>
          </div>

          {/* User Status / Logout block identical to screenshot top right */}
          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-[11px] font-black text-[#1A3263] tracking-wide uppercase">{currentUser.fullName}</p>
              <p className="text-[10px] text-[#FFC50C] bg-[#1a3263] px-2.5 py-0.5 rounded font-semibold tracking-wide mt-0.5 font-mono">
                {currentUser.username}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 active:scale-95 text-white text-[10px] font-black tracking-widest uppercase px-4 py-2 rounded-lg transition-all shadow-sm cursor-pointer"
            >
              LOGOUT
            </button>
          </div>
        </header>

        {/* Inner Adaptive Screen viewport with full width and unified master panel frame background */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 w-full max-w-full">
          <div className="bg-[#FAF9F6] rounded-2xl border border-slate-300/60 p-4 sm:p-6 md:p-8 shadow-sm w-full min-h-full">
            
            {/* Dynamic perspective routing */}
            {currentView === 'dashboard' && !selectedCustomerId && (
              <Dashboard 
                user={currentUser} 
                onUpdateAvatar={handleUpdateAvatar}
                onSelectSalesman={(id) => {
                  setSelectedSalesmanId(id);
                  setCurrentView('salesman-portfolio');
                }}
                onSelectCustomer={(id) => {
                  setSelectedCustomerId(id);
                  setCurrentView('customer-detail');
                }}
              />
            )}

            {currentView === 'salesman-portfolio' && !selectedCustomerId && (
              <SalesmanView 
                salesmanId={selectedSalesmanId || 'G-1-175'} 
                onBackToDashboard={() => {
                  setCurrentView('dashboard');
                  setSelectedSalesmanId(null);
                }}
                onSelectCustomer={(id) => {
                  setSelectedCustomerId(id);
                  setCurrentView('customer-detail');
                }}
              />
            )}

            {(currentView === 'customer-detail' || selectedCustomerId) && (
              <CustomerDetailView 
                customerId={selectedCustomerId || 'C29704'} 
                customerData={activeCustomer}
                currentUser={currentUser}
                onBack={() => {
                  if (currentUser.role === 'SALESMAN') {
                    setCurrentView('salesman-portfolio');
                    setSelectedCustomerId(null);
                  } else if (selectedSalesmanId) {
                    setCurrentView('salesman-portfolio');
                    setSelectedCustomerId(null);
                  } else {
                    setCurrentView('dashboard');
                    setSelectedCustomerId(null);
                  }
                }}
              />
            )}

          </div>
        </main>
      </div>

    </div>
  );
}
