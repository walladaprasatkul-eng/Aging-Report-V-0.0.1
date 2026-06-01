import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, Search, Clock, ShieldAlert, CheckCircle2, UserCheck, 
  Phone, Mail, Calendar, CreditCard, ChevronRight, ChevronLeft, Calculator, FileText,
  Scale, TrendingUp, AlertCircle, Camera, Upload, Trash2, User
} from 'lucide-react';
import { Customer, Salesman } from '../types';
import { mockCustomers, mockSalesmen } from '../data';

interface SalesmanViewProps {
  salesmanId: string;
  onBackToDashboard: () => void;
  onSelectCustomer: (customerId: string) => void;
}

export default function SalesmanView({ salesmanId, onBackToDashboard, onSelectCustomer }: SalesmanViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [currentPage, setCurrentPage] = useState<number>(1);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, salesmanId]);
  const [avatarImgUrl, setAvatarImgUrl] = useState<string>(() => {
    return localStorage.getItem(`salesman_avatar_${salesmanId}`) || '';
  });
  const [dragOver, setDragOver] = useState(false);

  React.useEffect(() => {
    setAvatarImgUrl(localStorage.getItem(`salesman_avatar_${salesmanId}`) || '');
  }, [salesmanId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          localStorage.setItem(`salesman_avatar_${salesmanId}`, reader.result);
          setAvatarImgUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          localStorage.setItem(`salesman_avatar_${salesmanId}`, reader.result);
          setAvatarImgUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    localStorage.removeItem(`salesman_avatar_${salesmanId}`);
    setAvatarImgUrl('');
  };

  // Find the selected salesman info
  const salesmanInfo = useMemo(() => {
    return mockSalesmen.find(sm => sm.id === salesmanId) || {
      id: salesmanId,
      name: "พนักงานขายทดสอบ (Sales Demo)",
      branch: "Bangna-Tr",
      region: "Central",
      email: "sales.demo@metrocat.com",
      phone: "081-000-0000",
      totalCustomers: 0,
      totalOutstanding: 0,
      agingSummary: { notDue: 0, overdue_1_30: 0, overdue_31_60: 0, overdue_61_90: 0, overdue_90plus: 0 }
    };
  }, [salesmanId]);

  // Filter customers assigned strictly to this salesman
  const assignedCustomers = useMemo(() => {
    return mockCustomers.filter(c => c.salesmanId === salesmanId);
  }, [salesmanId]);

  // Compute calculated metrics for this salesman
  const salesmanMetrics = useMemo(() => {
    let totalOutstanding = 0;
    let notDue = 0;
    let overdue_1_30 = 0;
    let overdue_31_60 = 0;
    let overdue_61_90 = 0;
    let overdue_90plus = 0;
    let overdueCount = 0;
    let currentInvoices = 0;
    let overdueInvoices = 0;

    assignedCustomers.forEach(c => {
      totalOutstanding += c.outstandingBalance;
      notDue += c.notDue;
      overdue_1_30 += c.overdue_1_30;
      overdue_31_60 += c.overdue_31_60;
      overdue_61_90 += c.overdue_61_90;
      overdue_90plus += c.overdue_90plus;
      if (c.status === 'OVERDUE' || (c.overdue_1_30 + c.overdue_31_60 + c.overdue_61_90 + c.overdue_90plus) > 0) {
        overdueCount++;
      }

      // Simulate a realistic deterministic count of invoices per client
      if (c.id === 'C11351') {
        overdueInvoices += 30;
      } else {
        if (c.notDue > 0) {
          const currentCount = Math.max(1, Math.min(5, Math.ceil(c.notDue / 40000)));
          currentInvoices += currentCount;
        }
        
        let clientOverdueCount = 0;
        if (c.overdue_1_30 > 0) clientOverdueCount += Math.max(1, Math.min(4, Math.ceil(c.overdue_1_30 / 35000)));
        if (c.overdue_31_60 > 0) clientOverdueCount += Math.max(1, Math.min(3, Math.ceil(c.overdue_31_60 / 40000)));
        if (c.overdue_61_90 > 0) clientOverdueCount += Math.max(1, Math.min(2, Math.ceil(c.overdue_61_90 / 45000)));
        if (c.overdue_90plus > 0) clientOverdueCount += Math.max(1, Math.min(2, Math.ceil(c.overdue_90plus / 50000)));
        overdueInvoices += clientOverdueCount;
      }
    });

    const overdueTotal = overdue_1_30 + overdue_31_60 + overdue_61_90 + overdue_90plus;

    return {
      totalOutstanding,
      notDue,
      overdue_1_30,
      overdue_31_60,
      overdue_61_90,
      overdue_90plus,
      overdueTotal,
      overdueCount,
      overduePercentage: (overdueTotal / (totalOutstanding || 1)) * 100,
      currentInvoices,
      overdueInvoices
    };
  }, [assignedCustomers]);

  const percent_notDue = salesmanMetrics.totalOutstanding > 0 
    ? ((salesmanMetrics.notDue / salesmanMetrics.totalOutstanding) * 100).toFixed(1) 
    : "0.0";
  const percent_overdue = salesmanMetrics.totalOutstanding > 0 
    ? ((salesmanMetrics.overdueTotal / salesmanMetrics.totalOutstanding) * 100).toFixed(1) 
    : "0.0";

  // Active search terms on customer list
  const filteredCustomers = useMemo(() => {
    return assignedCustomers.filter(c => {
      return searchQuery === '' || 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.id.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [assignedCustomers, searchQuery]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('th-TH', { style: 'decimal', minimumFractionDigits: 2 }).format(val);
  };

  // Format detailed customer aging values for table
  const customersSummary = useMemo(() => {
    return filteredCustomers.map(c => {
      const overdue_90plus = c.overdue_90plus || 0;
      const overdue_91_120 = 0;
      const overdue_121_150 = 0;
      let overdue_151_180 = 0;
      if (overdue_90plus > 15000) {
        overdue_151_180 = 10000;
      } else if (overdue_90plus > 5000) {
        overdue_151_180 = 2000;
      }
      const overdue_180plus = overdue_90plus - overdue_151_180;

      return {
        ...c,
        overdue_91_120,
        overdue_121_150,
        overdue_151_180,
        overdue_180plus
      };
    });
  }, [filteredCustomers]);

  const paginatedCustomersSummary = useMemo(() => {
    const startIndex = (currentPage - 1) * 10;
    return customersSummary.slice(startIndex, startIndex + 10);
  }, [customersSummary, currentPage]);

  const customersTotals = useMemo(() => {
    let outstandingBalance = 0;
    let notDue = 0;
    let overdue_1_30 = 0;
    let overdue_31_60 = 0;
    let overdue_61_90 = 0;
    let overdue_91_120 = 0;
    let overdue_121_150 = 0;
    let overdue_151_180 = 0;
    let overdue_180plus = 0;

    customersSummary.forEach(c => {
      outstandingBalance += c.outstandingBalance;
      notDue += c.notDue;
      overdue_1_30 += c.overdue_1_30;
      overdue_31_60 += c.overdue_31_60;
      overdue_61_90 += c.overdue_61_90;
      overdue_91_120 += c.overdue_91_120;
      overdue_121_150 += c.overdue_121_150;
      overdue_151_180 += c.overdue_151_180;
      overdue_180plus += c.overdue_180plus;
    });

    return {
      outstandingBalance,
      notDue,
      overdue_1_30,
      overdue_31_60,
      overdue_61_90,
      overdue_91_120,
      overdue_121_150,
      overdue_151_180,
      overdue_180plus
    };
  }, [customersSummary]);

  const formatCellAmount = (val: number, isNotDue = false, is90Plus = false) => {
    if (val === 0) return "-";
    const formatted = new Intl.NumberFormat('th-TH', { style: 'decimal', maximumFractionDigits: 0 }).format(val);
    if (isNotDue) return <span className="text-emerald-600 font-bold">{formatted}</span>;
    if (is90Plus && val > 0) return <span className="text-red-500 font-black">{formatted}</span>;
    if (val > 0) return <span className="text-slate-600 font-semibold">{formatted}</span>;
    return formatted;
  };

  const handleExportCustomerCSV = () => {
    const headers = ['Customer No.', 'Customer Name', 'Balance', 'Current', '1-30D', '31-60D', '61-90D', '91-120D', '121-150D', '151-180D', '180D+'];
    const rows = customersSummary.map(c => [
      c.id,
      `"${c.name.replace(/"/g, '""')}"`,
      c.outstandingBalance,
      c.notDue,
      c.overdue_1_30,
      c.overdue_31_60,
      c.overdue_61_90,
      c.overdue_91_120,
      c.overdue_121_150,
      c.overdue_151_180,
      c.overdue_180plus
    ]);
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `customer_portfolio_${salesmanId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Info */}
      <div className="flex items-center justify-end">
        <span className="text-xs text-slate-400 font-bold font-mono">SALES TRACKING DESK</span>
      </div>

      {/* SALESMAN HEALTH & BRIEF PROFILE (Header ของเซลส์) */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 bg-slate-50 border-b border-gray-100 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
          <div className="md:col-span-6 flex items-center space-x-4">
            {/* Custom High-Contrast Salesman Avatar */}
            <div className="relative shrink-0">
              <div 
                className="w-[60px] h-[60px] rounded-full flex items-center justify-center text-white font-extrabold text-[15px] shadow-md select-none overflow-hidden border-2 border-[#FFC50C] bg-gradient-to-tr from-[#1A3263] to-[#2E5090]"
              >
                {avatarImgUrl ? (
                  <img src={avatarImgUrl} alt={salesmanInfo.name} className="w-full h-full object-cover" />
                ) : (
                  <span>
                    {salesmanInfo.name.includes("ชัยชต") ? "ชฟ" : 
                     salesmanInfo.name.includes("ธนัญญา") ? "ธพ" : 
                     salesmanInfo.name.includes("วิทวัส") ? "วส" : 
                     salesmanInfo.name.includes("วสันต์") ? "วศ" : "SL"}
                  </span>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-green-500 w-4.5 h-4.5 rounded-full border-2 border-white ring-1 ring-slate-100 flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="inline-flex items-center space-x-1.5 bg-[#1A3263] text-[#FFC50C] text-[10px] uppercase px-2 py-0.5 rounded font-black tracking-widest font-mono">
                <UserCheck className="w-3.5 h-3.5 text-[#FFC50C]" />
                <span>SALESMAN PROFILE NO: {salesmanInfo.id}</span>
              </div>
              <h2 className="text-xl font-extrabold text-[#1A3263]">{salesmanInfo.name}</h2>
            </div>
          </div>

          <div className="md:col-span-6 flex flex-col md:items-end justify-center space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs font-semibold text-gray-500 w-full md:max-w-md">
              <div className="flex items-center gap-1.5 md:justify-end">
                <Phone className="w-3.5 h-3.5 text-[#547792]" />
                <span className="font-mono">{salesmanInfo.phone}</span>
              </div>
              <div className="flex items-center gap-1.5 md:justify-end">
                <Mail className="w-3.5 h-3.5 text-[#547792]" />
                <span>{salesmanInfo.email}</span>
              </div>
              <div className="flex items-center gap-1.5 md:justify-end">
                <Calendar className="w-3.5 h-3.5 text-[#547792]" />
                <span>Branch: {salesmanInfo.branch}</span>
              </div>
              <div className="flex items-center gap-1.5 md:justify-end">
                <CreditCard className="w-3.5 h-3.5 text-[#547792]" />
                <span>Region: {salesmanInfo.region}</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Dynamic Summary Cards to match standard business layout (Flexible 5 Columns Power BI Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 lg:gap-4 font-sans">
        
        {/* Card 1: Balance ทั้งหมด ยอดเต็ม (TOTAL BALANCE) */}
        <div className="bg-white rounded-xl p-3 2xl:p-4 shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden min-h-[145px] transition-all duration-200 hover:shadow-md">
          <div className="flex justify-between items-start gap-1">
            <div className="flex-1 min-w-0">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] 2xl:text-[11px] font-extrabold text-slate-800 leading-tight">ยอดคงค้างทั้งหมด</span>
                <span className="text-[8px] 2xl:text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">TOTAL BALANCE</span>
              </div>
              <div className="flex flex-col mt-2 min-w-0 leading-none">
                <span className="text-[18px] sm:text-[22px] md:text-[26px] lg:text-[22px] xl:text-[17px] 2xl:text-[22px] font-extrabold text-[#1A3263] font-sans tracking-tight block truncate" title={formatCurrency(salesmanMetrics.totalOutstanding)}>
                  {formatCurrency(salesmanMetrics.totalOutstanding)}
                </span>
                <span className="text-[10px] 2xl:text-[11px] font-extrabold text-[#1A3263]/60 mt-1.5 uppercase tracking-wider block">บาท (Baht)</span>
              </div>
            </div>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-[#1A3263] shrink-0 border border-indigo-100/30">
              <Scale className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
          </div>
          
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-col gap-0.5 z-10 font-sans">
            <div className="flex items-center justify-between text-[10px] 2xl:text-[11px] font-bold text-slate-500 font-mono">
              <span>ยอดรวมหักหนี้</span>
            </div>
          </div>
          
          {/* Subtle color stripe at the bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#1A3263]"></div>
        </div>

        {/* Card 2: Current Invoices (จำนวนใบแจ้งหนี้ปกติ) */}
        <div className="bg-white rounded-xl p-3 2xl:p-4 shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden min-h-[145px] transition-all duration-200 hover:shadow-md">
          <div className="flex justify-between items-start gap-1">
            <div className="flex-1 min-w-0">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] 2xl:text-[11px] font-extrabold text-slate-800 leading-tight">ใบแจ้งหนี้ปกติ</span>
                <span className="text-[8px] 2xl:text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">CURRENT INVOICES</span>
              </div>
              <div className="flex flex-col mt-2 min-w-0 leading-none">
                <span className="text-[18px] sm:text-[22px] md:text-[26px] lg:text-[22px] xl:text-[17px] 2xl:text-[22px] font-extrabold text-emerald-600 font-sans tracking-tight block truncate">
                  {salesmanMetrics.currentInvoices}
                </span>
                <span className="text-[10px] 2xl:text-[11px] font-extrabold text-emerald-600/70 mt-1.5 uppercase tracking-wider block">รายการ (Invoices)</span>
              </div>
            </div>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 border border-emerald-100/30">
              <FileText className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
          </div>
          
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-col gap-0.5 z-10 font-sans">
            <div className="flex items-center justify-between text-[10px] 2xl:text-[11px] font-bold text-slate-500">
              <span>สถานะใบแจ้งหนี้</span>
              <span className="text-[#15803d] font-black bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">ปกติ (NOT DUE)</span>
            </div>
          </div>
          
          {/* Subtle color stripe at the bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-400"></div>
        </div>

        {/* Card 3: Current Balance (ยอดหนี้ปกติกี่บาท / กี่เปอร์เซ็นต์) */}
        <div className="bg-white rounded-xl p-3 2xl:p-4 shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden min-h-[145px] transition-all duration-200 hover:shadow-md">
          <div className="flex justify-between items-start gap-1">
            <div className="flex-1 min-w-0">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] 2xl:text-[11px] font-extrabold text-slate-800 leading-tight">ยอดหนี้ปกติ</span>
                <span className="text-[8px] 2xl:text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">CURRENT BALANCE</span>
              </div>
              <div className="flex flex-col mt-2 min-w-0 leading-none">
                <span className="text-[18px] sm:text-[22px] md:text-[26px] lg:text-[22px] xl:text-[17px] 2xl:text-[22px] font-extrabold text-emerald-600 font-sans tracking-tight block truncate" title={formatCurrency(salesmanMetrics.notDue)}>
                  {formatCurrency(salesmanMetrics.notDue)}
                </span>
                <span className="text-[10px] 2xl:text-[11px] font-extrabold text-emerald-600/70 mt-1.5 uppercase tracking-wider block">บาท (Baht)</span>
              </div>
            </div>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 border border-emerald-100/30">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-col gap-1 z-10 font-sans">
            <div className="flex items-center justify-between text-[10px] 2xl:text-[11px] font-bold text-slate-500">
              <span>สัดส่วน: <span className="text-[#15803d] font-black">{percent_notDue}%</span></span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1 overflow-hidden">
              <div 
                className="bg-emerald-500 h-1 rounded-full transition-all duration-500" 
                style={{ width: `${percent_notDue}%` }}
              ></div>
            </div>
          </div>
          
          {/* Subtle color stripe at the bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500"></div>
        </div>

        {/* Card 4: Overdue Invoices (จำนวนใบแจ้งหนี้เกินกำหนด) */}
        <div className="bg-white rounded-xl p-3 2xl:p-4 shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden min-h-[145px] transition-all duration-200 hover:shadow-md">
          <div className="flex justify-between items-start gap-1">
            <div className="flex-1 min-w-0">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] 2xl:text-[11px] font-extrabold text-slate-800 leading-tight">ใบแจ้งหนี้เกินกำหนด</span>
                <span className="text-[8px] 2xl:text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">OVERDUE INVOICES</span>
              </div>
              <div className="flex flex-col mt-2 min-w-0 leading-none">
                <span className="text-[18px] sm:text-[22px] md:text-[26px] lg:text-[22px] xl:text-[17px] 2xl:text-[22px] font-extrabold text-rose-600 font-sans tracking-tight block truncate">
                  {salesmanMetrics.overdueInvoices}
                </span>
                <span className="text-[10px] 2xl:text-[11px] font-extrabold text-rose-600/70 mt-1.5 uppercase tracking-wider block">รายการ (Invoices)</span>
              </div>
            </div>
            <div className="w-7 h-7 rounded-lg bg-rose-50 flex items-center justify-center text-rose-500 shrink-0 border border-rose-100/30">
              <AlertCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-col gap-0.5 z-10 font-sans">
            <div className="flex items-center justify-between text-[10px] 2xl:text-[11px] font-bold text-slate-500">
              <span>สถานะใบแจ้งหนี้</span>
              <span className="text-rose-700 font-black bg-rose-50 px-1.5 py-0.5 rounded animate-pulse text-[10px]">เกินกำหนด (OVERDUE)</span>
            </div>
          </div>
          
          {/* Subtle color stripe at the bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-rose-400"></div>
        </div>

        {/* Card 5: Overdue Balance (ยอดเกินกำหนดกี่บาท / กี่เปอร์เซ็นต์) */}
        <div className="bg-white rounded-xl p-3 2xl:p-4 shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden min-h-[145px] transition-all duration-200 hover:shadow-md">
          <div className="flex justify-between items-start gap-1">
            <div className="flex-1 min-w-0">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] 2xl:text-[11px] font-extrabold text-slate-800 leading-tight">ยอดเกินกำหนดสะสม</span>
                <span className="text-[8px] 2xl:text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">OVERDUE BALANCE</span>
              </div>
              <div className="flex flex-col mt-2 min-w-0 leading-none">
                <span className="text-[18px] sm:text-[22px] md:text-[26px] lg:text-[22px] xl:text-[17px] 2xl:text-[22px] font-extrabold text-rose-600 font-sans tracking-tight block truncate" title={formatCurrency(salesmanMetrics.overdueTotal)}>
                  {formatCurrency(salesmanMetrics.overdueTotal)}
                </span>
                <span className="text-[10px] 2xl:text-[11px] font-extrabold text-rose-600/70 mt-1.5 uppercase tracking-wider block">บาท (Baht)</span>
              </div>
            </div>
            <div className="w-7 h-7 rounded-lg bg-rose-50 flex items-center justify-center text-rose-500 shrink-0 border border-rose-100/30">
              <AlertCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-col gap-1 z-10 font-sans">
            <div className="flex items-center justify-between text-[10px] 2xl:text-[11px] font-bold text-slate-500">
              <span>สัดส่วน: <span className="text-[#991b1b] font-black">{percent_overdue}%</span></span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1 overflow-hidden">
              <div 
                className="bg-rose-500 h-1 rounded-full transition-all duration-500"  
                style={{ width: `${percent_overdue}%` }}
              ></div>
            </div>
          </div>
          
          {/* Subtle color stripe at the bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-rose-500"></div>
        </div>

      </div>

      {/* FILTER SEARCH AND CARD HEADERS FOR ASSIGNED PORTFOLIO */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xs font-bold text-[#1A3263] uppercase tracking-widest">
            ลูกค้ารายบุคคลในความดูแล ({assignedCustomers.length} ราย)
          </h3>
          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">วิเคราะห์อายุหนี้ และพอร์ตโฟลิโอลูกค้าภาพรวมรายบุคคลเพื่อติดตามหนี้ครบกำหนดและเกินกำหนด</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* View Mode Switcher */}
          <div className="bg-slate-100 p-0.5 rounded-lg flex items-center border border-slate-200">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-extrabold uppercase transition-all whitespace-nowrap cursor-pointer ${
                viewMode === 'table' 
                  ? 'bg-white text-[#1A3263] shadow-xs' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>ตารางภาพรวม (Table)</span>
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-extrabold uppercase transition-all whitespace-nowrap cursor-pointer ${
                viewMode === 'cards' 
                  ? 'bg-white text-[#1A3263] shadow-xs' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>การ์ดวิเคราะห์ (Cards)</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="w-4 h-4 text-slate-400" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="พิมพ์รหัสลูกค้า หรือชื่อลูกค้าเพื่อค้นหา..."
              className="w-full text-xs font-semibold pl-9 pr-4 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-1 focus:ring-[#FFC50C]"
            />
          </div>
        </div>
      </div>

      {/* DETAILED REPRESENTATION OF INDIVIDUAL CLIENT AGING */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          
          <div className="p-4 border-b border-gray-150 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-6 bg-[#FFC50C] rounded-full"></span>
              <h3 className="text-xs font-bold text-[#1A3263] uppercase tracking-widest font-sans">
                ตารางสรุปวิเคราะห์อายุหนี้ (Credit Portfolio Overview Table)
              </h3>
            </div>
          </div>

          <div className="overflow-x-auto hidden lg:block">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="border-b border-gray-200 text-[10px] uppercase tracking-wider font-extrabold text-slate-500 bg-slate-50 select-none">
                  <th className="py-3 px-3">CUSTOMER NO.</th>
                  <th className="py-3 px-4">CUSTOMER NAME</th>
                  <th className="py-3 px-3 text-right">BALANCE</th>
                  <th className="py-3 px-3 text-right">CURRENT</th>
                  <th className="py-3 px-3 text-right">1-30D</th>
                  <th className="py-3 px-3 text-right">31-60D</th>
                  <th className="py-3 px-3 text-right">61-90D</th>
                  <th className="py-3 px-3 text-right">91-120D</th>
                  <th className="py-3 px-3 text-right">121-150D</th>
                  <th className="py-3 px-3 text-right">151-180D</th>
                  <th className="py-3 px-3 text-right">180D+</th>
                  <th className="py-3 px-4 text-center">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 text-xs text-slate-600 font-medium">
                
                {/* Sum Total Header Row */}
                {customersSummary.length > 0 && (
                  <tr className="bg-[#FAFBFD] font-bold border-b border-slate-150 hover:bg-[#E8E2DB]/10 transition-colors">
                    <td className="py-3 px-3 text-slate-500 font-mono text-[10px] select-none font-bold text-left">
                      ALL
                    </td>
                    <td className="py-3 px-4 text-slate-800 text-[11px] font-extrabold flex items-center gap-1.5 tracking-tight">
                      <span className="text-[#1A3263] font-bold">▼</span>
                      <span>All Customers</span>
                    </td>
                    <td className="py-3 px-3 text-right text-slate-900 font-black">
                      {formatCellAmount(customersTotals.outstandingBalance)}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {formatCellAmount(customersTotals.notDue, true)}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {formatCellAmount(customersTotals.overdue_1_30)}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {formatCellAmount(customersTotals.overdue_31_60)}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {formatCellAmount(customersTotals.overdue_61_90)}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {formatCellAmount(customersTotals.overdue_91_120)}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {formatCellAmount(customersTotals.overdue_121_150)}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {formatCellAmount(customersTotals.overdue_151_180)}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {formatCellAmount(customersTotals.overdue_180plus, false, true)}
                    </td>
                    <td className="py-3 px-4 text-center text-slate-400 text-[10px] font-bold">
                      ยอดสุทธิ {customersSummary.length} ลูกค้า
                    </td>
                  </tr>
                )}

                {/* Main Client Rows */}
                {customersSummary.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="py-8 text-center text-gray-400 font-semibold uppercase text-[10px]">
                      ไม่พบข้อมูลลูกค้าสำหรับพนักงานขายคนนี้
                    </td>
                  </tr>
                ) : (
                  paginatedCustomersSummary.map(c => {
                    return (
                      <tr key={c.id} className="hover:bg-[#E8E2DB]/10 transition-colors text-[11px] border-b border-slate-100">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-500 uppercase select-all text-left">
                          {c.id}
                        </td>
                        <td className="py-2.5 px-4 font-extrabold text-[#1A3263] truncate max-w-[200px]" title={c.name}>
                          <div className="flex flex-col">
                            <span className="truncate">{c.name}</span>
                            <span className="text-[9px] text-[#547792] font-semibold">Assigned Sale: {c.salesmanName} ({c.salesmanId})</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-800 font-extrabold">
                          {formatCellAmount(c.outstandingBalance)}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          {formatCellAmount(c.notDue, true)}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          {formatCellAmount(c.overdue_1_30)}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          {formatCellAmount(c.overdue_31_60)}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          {formatCellAmount(c.overdue_61_90)}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          {formatCellAmount(c.overdue_91_120)}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          {formatCellAmount(c.overdue_121_150)}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          {formatCellAmount(c.overdue_151_180)}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          {formatCellAmount(c.overdue_180plus, false, true)}
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          <button
                            onClick={() => onSelectCustomer(c.id)}
                            className="bg-[#1A3263] hover:bg-[#FFC50C] hover:text-[#1A3263] text-white transition-all text-[10px] font-extrabold px-3 py-1.5 rounded-lg border border-transparent shadow-xs cursor-pointer active:scale-95 inline-flex items-center"
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards rendering: Shows nice cards instead of a wide cut-off table for screens < 1024px */}
          <div className="block lg:hidden divide-y divide-slate-100">
            {/* Totals cumulative summary card */}
            {customersSummary.length > 0 && (
              <div className="p-4 bg-[#FAFBFD] font-bold border-b border-slate-150 text-left">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[#1A3263] text-[11px] font-extrabold flex items-center gap-1">
                    <span className="text-indigo-600 font-bold">▼</span>
                    <span>All Customers</span>
                  </span>
                  <span className="text-[9px] text-slate-400 font-bold">สะสม {customersSummary.length} ราย</span>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2 text-[11px]">
                  <div className="bg-white p-2 rounded border border-slate-100">
                    <div className="text-slate-400 font-bold text-[8px] uppercase">Balance ทั้งหมด</div>
                    <div className="text-[#1A3263] font-black text-xs">{formatCellAmount(customersTotals.outstandingBalance)}</div>
                  </div>
                  <div className="bg-white p-2 rounded border border-slate-100">
                    <div className="text-emerald-500 font-bold text-[8px] uppercase">Current ทั้งหมด</div>
                    <div className="text-emerald-600 font-black text-xs">{formatCellAmount(customersTotals.notDue, true)}</div>
                  </div>
                </div>
                <div className="mt-2 p-2.5 bg-white rounded border border-slate-100">
                  <div className="text-slate-400 font-bold text-[8px] uppercase mb-1.5 label text-left">ยอดค้างชำระลูกค้าทั้งหมด</div>
                  <div className="grid grid-cols-2 gap-y-1 gap-x-2 text-[10px] text-left">
                    <div><span className="font-semibold text-slate-400">1-30D:</span> {formatCellAmount(customersTotals.overdue_1_30)}</div>
                    <div><span className="font-semibold text-slate-400">31-60D:</span> {formatCellAmount(customersTotals.overdue_31_60)}</div>
                    <div><span className="font-semibold text-slate-400">61-90D:</span> {formatCellAmount(customersTotals.overdue_61_90)}</div>
                    <div><span className="font-semibold text-slate-400">91-120D:</span> {formatCellAmount(customersTotals.overdue_91_120)}</div>
                    <div><span className="font-semibold text-slate-400">121-150D:</span> {formatCellAmount(customersTotals.overdue_121_150)}</div>
                    <div><span className="font-semibold text-slate-400">151-180D:</span> {formatCellAmount(customersTotals.overdue_151_180)}</div>
                    <div className="col-span-2 pt-1.5 mt-1 border-t border-slate-100 flex justify-between font-bold text-rose-500 text-[10px]">
                      <span>180D+ (หนี้เสีย):</span>
                      <span className="text-rose-600">{formatCellAmount(customersTotals.overdue_180plus, false, true)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {customersSummary.length === 0 ? (
              <div className="py-8 text-center text-gray-400 font-semibold uppercase text-[10px]">
                ไม่พบข้อมูลลูกค้าสำหรับพนักงานขายคนนี้
              </div>
            ) : (
              paginatedCustomersSummary.map(c => (
                <div key={c.id} className="p-4 bg-white hover:bg-slate-50 transition-colors border-b border-slate-100 text-left animate-fade-in">
                  <div className="flex justify-between items-start mb-2.5 gap-2">
                    <div>
                      <div className="text-[#1A3263] font-extrabold text-xs flex items-center gap-1.5 label text-left">
                        <span>{c.name}</span>
                        <span className="text-[9px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded leading-none">
                          {c.id}
                        </span>
                      </div>
                      <div className="text-[9px] text-[#547792] font-semibold mt-1">
                        Assigned: {c.salesmanName} ({c.salesmanId})
                      </div>
                    </div>
                    <button
                      onClick={() => onSelectCustomer(c.id)}
                      className="bg-[#1A3263] hover:bg-[#FFC50C] text-white hover:text-[#1A3263] transition-all text-[9.5px] font-extrabold px-3 py-1 rounded-md shadow-xs active:scale-95 shrink-0"
                    >
                      Details
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] mt-1">
                    <div className="bg-slate-50/50 p-2 rounded border border-slate-100">
                      <div className="text-slate-400 font-bold text-[8px] uppercase">BALANCE</div>
                      <div className="text-slate-800 font-bold text-xs">{formatCellAmount(c.outstandingBalance)}</div>
                    </div>
                    <div className="bg-slate-50/50 p-2 rounded border border-slate-100">
                      <div className="text-emerald-500 font-bold text-[8px] uppercase">CURRENT</div>
                      <div className="text-emerald-600 font-bold text-xs">{formatCellAmount(c.notDue, true)}</div>
                    </div>
                  </div>

                  {/* Overdue breakdown details */}
                  <div className="mt-2.5 bg-slate-50/30 p-2.5 rounded-lg border border-slate-100/50">
                    <div className="text-slate-400 font-bold text-[8px] uppercase mb-1.5 opacity-80">ยอดค้างชำระตามอายุหนี้ (Overdue Age)</div>
                    <div className="grid grid-cols-3 gap-y-1 gap-x-2 text-[9.5px] text-slate-600">
                      <div><span className="font-semibold text-slate-400">1-30D:</span> {formatCellAmount(c.overdue_1_30)}</div>
                      <div><span className="font-semibold text-slate-400">31-60D:</span> {formatCellAmount(c.overdue_31_60)}</div>
                      <div><span className="font-semibold text-slate-400">61-90D:</span> {formatCellAmount(c.overdue_61_90)}</div>
                      <div><span className="font-semibold text-slate-400">91-120D:</span> {formatCellAmount(c.overdue_91_120)}</div>
                      <div><span className="font-semibold text-slate-400">121-150D:</span> {formatCellAmount(c.overdue_121_150)}</div>
                      <div><span className="font-semibold text-slate-400">151-180D:</span> {formatCellAmount(c.overdue_151_180)}</div>
                      <div className="col-span-3 mt-1.5 pt-1.5 border-t border-slate-200/50 flex justify-between font-bold text-rose-500">
                        <span>180D+ (เสี่ยงสูง):</span>
                        <span className="text-rose-600">{formatCellAmount(c.overdue_180plus, false, true)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {customersSummary.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl text-center border text-gray-400 uppercase text-xs font-semibold">
              ไม่มีข้อมูลลูกค้ารายการขายนี้
            </div>
          ) : (
            paginatedCustomersSummary.map(customer => {
              const hasOverdue = (customer.overdue_1_30 + customer.overdue_31_60 + customer.overdue_61_90 + customer.overdue_90plus) > 0;
              return (
                <div 
                  key={customer.id} 
                  className="bg-white rounded-2xl shadow-xs border border-gray-150 hover:border-[#FFC50C]/60 hover:shadow-md transition-all p-5"
                >
                  
                  {/* Upper block */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-black text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {customer.id}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                          hasOverdue ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                        }`}>
                          {hasOverdue ? 'OVERDUE' : 'ACTIVE'}
                        </span>
                      </div>
                      <h4 className="text-sm font-black text-[#1A3263]">{customer.name}</h4>
                      <p className="text-[10px] text-gray-400 font-semibold uppercase">{customer.branch} Branch • {customer.region} Region</p>
                    </div>

                    <div className="text-left sm:text-right">
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Total Outstanding Debt</p>
                      <p className="text-lg font-black text-[#1A3263] font-mono">฿{formatCurrency(customer.outstandingBalance)}</p>
                      <p className="text-[10px] text-gray-500 font-medium">Credit Limit: ฿{formatCurrency(customer.creditLimit)}</p>
                    </div>
                  </div>

                  {/* Lower Brackets breakdown (AGING BLOCKS) */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-4 text-center">
                    
                    {/* Category 1: Not due */}
                    <div className="bg-slate-50/55 p-2 rounded-xl border border-gray-100">
                      <p className="text-[9px] font-bold text-gray-500 uppercase tracking-tight">Not Due</p>
                      <p className="text-xs font-extrabold text-green-600 font-mono mt-0.5">
                        ฿{formatCurrency(customer.notDue)}
                      </p>
                      <div className="w-full bg-gray-100 h-1 rounded-full mt-1.5 overflow-hidden">
                        <div className="bg-green-500 h-full" style={{ width: `${(customer.notDue / (customer.outstandingBalance || 1)) * 100}%` }}></div>
                      </div>
                    </div>

                    {/* Category 2: 1-30 */}
                    <div className="bg-slate-50/55 p-2 rounded-xl border border-gray-100">
                      <p className="text-[9px] font-bold text-gray-500 uppercase tracking-tight">1-30 Days</p>
                      <p className={`text-xs font-extrabold font-mono mt-0.5 ${customer.overdue_1_30 > 0 ? 'text-amber-500' : 'text-slate-400'}`}>
                        ฿{formatCurrency(customer.overdue_1_30)}
                      </p>
                      <div className="w-full bg-gray-100 h-1 rounded-full mt-1.5 overflow-hidden">
                        <div className="bg-amber-400 h-full" style={{ width: `${(customer.overdue_1_30 / (customer.outstandingBalance || 1)) * 100}%` }}></div>
                      </div>
                    </div>

                    {/* Category 3: 31-60 */}
                    <div className="bg-slate-50/55 p-2 rounded-xl border border-gray-100">
                      <p className="text-[9px] font-bold text-gray-500 uppercase tracking-tight">31-60 Days</p>
                      <p className={`text-xs font-extrabold font-mono mt-0.5 ${customer.overdue_31_60 > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                        ฿{formatCurrency(customer.overdue_31_60)}
                      </p>
                      <div className="w-full bg-gray-100 h-1 rounded-full mt-1.5 overflow-hidden">
                        <div className="bg-amber-600 h-full" style={{ width: `${(customer.overdue_31_60 / (customer.outstandingBalance || 1)) * 100}%` }}></div>
                      </div>
                    </div>

                    {/* Category 4: 61-90 */}
                    <div className="bg-slate-50/55 p-2 rounded-xl border border-gray-100">
                      <p className="text-[9px] font-bold text-gray-500 uppercase tracking-tight">61-90 Days</p>
                      <p className={`text-xs font-extrabold font-mono mt-0.5 ${customer.overdue_61_90 > 0 ? 'text-amber-700' : 'text-slate-400'}`}>
                        ฿{formatCurrency(customer.overdue_61_90)}
                      </p>
                      <div className="w-full bg-gray-100 h-1 rounded-full mt-1.5 overflow-hidden">
                        <div className="bg-amber-800 h-full" style={{ width: `${(customer.overdue_61_90 / (customer.outstandingBalance || 1)) * 100}%` }}></div>
                      </div>
                    </div>

                    {/* Category 5: >90 */}
                    <div className="bg-red-50/20 p-2 rounded-xl border border-red-100/50 col-span-2 md:col-span-1">
                      <p className="text-[9px] font-bold text-red-500 uppercase tracking-tight">90+ Days</p>
                      <p className={`text-xs font-extrabold font-mono mt-0.5 ${customer.overdue_90plus > 0 ? 'text-red-600' : 'text-slate-400'}`}>
                        ฿{formatCurrency(customer.overdue_90plus)}
                      </p>
                      <div className="w-full bg-gray-100 h-1 rounded-full mt-1.5 overflow-hidden">
                        <div className="bg-red-500 h-full" style={{ width: `${(customer.overdue_90plus / (customer.outstandingBalance || 1)) * 100}%` }}></div>
                      </div>
                    </div>

                  </div>

                  {/* Customer management tools */}
                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-[11px] font-semibold text-[#547792]">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Credit Term: {customer.creditTerm} Days</span>
                      <span className="text-gray-300">|</span>
                      <span>Equipment: {customer.machinePop.split('(')[0]}</span>
                    </div>

                    <button
                      onClick={() => onSelectCustomer(customer.id)}
                      className="bg-[#1A3263] text-white hover:bg-[#FFC50C] hover:text-[#1A3263] font-black text-[10px] tracking-widest px-4 py-2 rounded-lg inline-flex items-center space-x-1.5 uppercase transition-all duration-150 cursor-pointer shadow-xs"
                    >
                      <span>View Customer profile</span>
                      <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                  </div>

                </div>
              );
            })
          )}
        </div>
      )}

      {/* Pagination Controls */}
      {(() => {
        const totalPages = Math.ceil(customersSummary.length / 10);
        if (totalPages <= 1) return null;
        return (
          <div className="flex items-center justify-between border-t border-slate-100 bg-white px-4 py-3.5 sm:px-6 rounded-b-2xl mt-4">
            <div className="flex flex-1 justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                ก่อนหน้า
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="relative ml-3 inline-flex items-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                ถัดไป
              </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-xs text-slate-500 font-semibold gap-1 inline-flex items-center">
                  แสดงรายการลูกค้าที่ <span className="font-bold text-[#1A3263]">{Math.min((currentPage - 1) * 10 + 1, customersSummary.length)}</span> ถึง{' '}
                  <span className="font-bold text-[#1A3263]">{Math.min(currentPage * 10, customersSummary.length)}</span> จากทั้งหมด{' '}
                  <span className="font-black text-[#1A3263]">{customersSummary.length}</span> ลูกค้า
                </p>
              </div>
              <div>
                <nav className="isolate inline-flex -space-x-px rounded-lg gap-1" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center rounded-lg bg-white px-2.5 py-1.5 text-slate-400 ring-1 ring-inset ring-gray-200 hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none cursor-pointer transition-all"
                  >
                    <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                  </button>
                  {(() => {
                    const maxButtons = 7;
                    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
                    let endPage = startPage + maxButtons - 1;
                    if (endPage > totalPages) {
                      endPage = totalPages;
                      startPage = Math.max(1, endPage - maxButtons + 1);
                    }
                    return Array.from({ length: endPage - startPage + 1 }).map((_, idx) => {
                      const pageNum = startPage + idx;
                      const isCurrent = pageNum === currentPage;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`relative inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-bold ring-1 ring-inset transition-all cursor-pointer ${
                            isCurrent
                              ? 'z-10 bg-[#1A3263] text-white ring-transparent font-extrabold shadow-sm'
                              : 'text-slate-700 ring-gray-200 hover:bg-slate-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    });
                  })()}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center rounded-lg bg-white px-2.5 py-1.5 text-slate-400 ring-1 ring-inset ring-gray-200 hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none cursor-pointer transition-all"
                  >
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
}
