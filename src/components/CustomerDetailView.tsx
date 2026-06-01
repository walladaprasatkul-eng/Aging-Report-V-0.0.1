import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, FileText, Plus, User, MessageCircle, Calendar, 
  MapPin, CheckCircle, ShieldAlert, Award, PhoneCall, Save, Sparkles,
  Filter, Search, RotateCcw, ChevronLeft, ChevronRight
} from 'lucide-react';
import { Customer, CollectionNote, LoggedInUser } from '../types';
import { mockCollectionNotes } from '../data';

interface CustomDatePickerProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

function CustomDatePicker({ value, onChange, placeholder = "เลือกวันที่ (วัน/เดือน/ปี)..." }: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Parse the current value to set starting month and year
  const parsedDate = useMemo(() => {
    if (!value) return new Date();
    if (value.includes('-')) {
      const [y, m, d] = value.split('-').map(Number);
      return new Date(y, m - 1, d);
    }
    if (value.includes('/')) {
      const [d, m, y] = value.split('/').map(Number);
      return new Date(y, m - 1, d);
    }
    return new Date();
  }, [value]);

  const [currentMonth, setCurrentMonth] = useState(parsedDate.getMonth());
  const [currentYear, setCurrentYear] = useState(parsedDate.getFullYear());

  React.useEffect(() => {
    if (value) {
      setCurrentMonth(parsedDate.getMonth());
      setCurrentYear(parsedDate.getFullYear());
    }
  }, [value, parsedDate]);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const monthNames = [
    "มกราคม (Jan)", "กุมภาพันธ์ (Feb)", "มีนาคม (Mar)", "เมษายน (Apr)", 
    "พฤษภาคม (May)", "มิถุนายน (Jun)", "กรกฎาคม (Jul)", "สิงหาคม (Aug)", 
    "กันยายน (Sep)", "ตุลาคม (Oct)", "พฤศจิกายน (Nov)", "ธันวาคม (Dec)"
  ];

  const daysOfWeek = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

  const getDaysInMonth = (m: number, y: number) => {
    return new Date(y, m + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (m: number, y: number) => {
    return new Date(y, m, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDayIndex = getFirstDayOfMonth(currentMonth, currentYear);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const selectDate = (day: number) => {
    const formattedDay = day.toString().padStart(2, '0');
    const formattedMonth = (currentMonth + 1).toString().padStart(2, '0');
    const formattedDate = `${formattedDay}/${formattedMonth}/${currentYear}`;
    onChange(formattedDate);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setIsOpen(false);
  };

  const isSelected = (day: number) => {
    if (!value) return false;
    const sameDay = parsedDate.getDate() === day;
    const sameMonth = parsedDate.getMonth() === currentMonth;
    const sameYear = parsedDate.getFullYear() === currentYear;
    return sameDay && sameMonth && sameYear;
  };

  const isToday = (day: number) => {
    const today = new Date();
    return today.getDate() === day && today.getMonth() === currentMonth && today.getFullYear() === currentYear;
  };

  const blankDays = Array(firstDayIndex).fill(null);
  const monthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const totalCells = [...blankDays, ...monthDays];

  const displayValue = useMemo(() => {
    if (!value) return '';
    if (value.includes('-')) {
      const [y, m, d] = value.split('-');
      return `${d}/${m}/${y}`;
    }
    return value;
  }, [value]);

  return (
    <div className="relative w-full" ref={containerRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full bg-slate-50 hover:bg-slate-50/50 focus-within:bg-white text-xs font-bold text-slate-700 p-2 border border-slate-200 rounded-lg focus-within:border-[#FFC50C] focus-within:ring-2 focus-within:ring-[#FFC50C]/20 cursor-pointer transition-all min-h-[38px]"
      >
        <span className={displayValue ? "text-slate-800 font-mono font-bold" : "text-gray-400 font-semibold"}>
          {displayValue || placeholder}
        </span>
        <div className="flex items-center space-x-1">
          {displayValue && (
            <button
              onClick={handleClear}
              type="button"
              className="text-red-500 hover:text-red-700 text-[10px] font-bold px-1 py-0.5 rounded transition-colors mr-1 cursor-pointer bg-slate-100 hover:bg-slate-200"
            >
              ล้าง
            </button>
          )}
          <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
        </div>
      </div>

      {isOpen && (
        <div className="absolute right-0 left-0 md:left-auto md:w-[280px] mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 p-3 select-none">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex flex-col items-center">
              <span className="text-xs font-extrabold text-[#1A3263]">
                {monthNames[currentMonth]}
              </span>
              <span className="text-[10px] font-bold text-[#FFC50C] font-mono">
                {currentYear} (พ.ศ. {currentYear + 543})
              </span>
            </div>
            <button
              type="button"
              onClick={nextMonth}
              className="p-1 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {daysOfWeek.map((day, idx) => (
              <span 
                key={day} 
                className={`text-[9.5px] font-black uppercase ${
                  idx === 0 ? "text-rose-500" : idx === 6 ? "text-indigo-500" : "text-slate-400"
                }`}
              >
                {day}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {totalCells.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} className="h-6" />;
              }

              const selected = isSelected(day);
              const today = isToday(day);

              return (
                <button
                  key={`day-${day}`}
                  type="button"
                  onClick={() => selectDate(day)}
                  className={`h-6 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center cursor-pointer ${
                    selected 
                      ? "bg-[#1A3263] text-white font-extrabold scale-105 shadow-2xs" 
                      : today
                        ? "bg-[#FFC50C]/20 text-[#1A3263] font-black border border-[#FFC50C]/50"
                        : "hover:bg-slate-100 text-slate-700"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          <div className="mt-3 pt-2 border-t border-slate-150 flex items-center justify-between text-[10px]">
            <button
              type="button"
              onClick={() => {
                const today = new Date();
                const d = today.getDate().toString().padStart(2, '0');
                const m = (today.getMonth() + 1).toString().padStart(2, '0');
                onChange(`${d}/${m}/${today.getFullYear()}`);
                setIsOpen(false);
              }}
              className="text-[#1A3263] font-extrabold hover:underline cursor-pointer"
            >
              วันนี้ (Today)
            </button>
            <span className="text-[9px] text-slate-400 font-medium">รูปแบบ: วัน/เดือน/ปี</span>
          </div>
        </div>
      )}
    </div>
  );
}

interface CustomerDetailViewProps {
  customerId: string;
  onBack: () => void;
  customerData: Customer;
  currentUser?: LoggedInUser | null;
}

export default function CustomerDetailView({ customerId, onBack, customerData, currentUser }: CustomerDetailViewProps) {
  // Collection Interaction States
  const [collectionNotes, setCollectionNotes] = useState<CollectionNote[]>(() => {
    return mockCollectionNotes.filter(n => n.customerId === customerId);
  });
  
  const [newNoteText, setNewNoteText] = useState('');
  const [newNoteStatus, setNewNoteStatus] = useState<'Pending' | 'Committed' | 'Resolved'>('Pending');
  const [newFollowUpDate, setNewFollowUpDate] = useState('01/06/2026');

  // Customer state copy for direct profile edit simulation!
  const [editedCustomer, setEditedCustomer] = useState<Customer>(customerData);
  const [isSaved, setIsSaved] = useState(false);

  // Invoice Filter States
  const [filterCustomerName, setFilterCustomerName] = useState('');
  const [filterCustomerNo, setFilterCustomerNo] = useState('');
  const [filterAging, setFilterAging] = useState('');
  const [filterDocNo, setFilterDocNo] = useState('');
  const [filterDocDate, setFilterDocDate] = useState('');
  const [filterDueDate, setFilterDueDate] = useState('');
  const [filterMinAmount, setFilterMinAmount] = useState('');
  const [filterMaxAmount, setFilterMaxAmount] = useState('');
  const [invoicePage, setInvoicePage] = useState<number>(1);

  React.useEffect(() => {
    setInvoicePage(1);
  }, [
    filterCustomerName,
    filterCustomerNo,
    filterAging,
    filterDocNo,
    filterDocDate,
    filterDueDate,
    filterMinAmount,
    filterMaxAmount,
    customerId
  ]);

  const handleClearInvoiceFilters = () => {
    setFilterCustomerName('');
    setFilterCustomerNo('');
    setFilterAging('');
    setFilterDocNo('');
    setFilterDocDate('');
    setFilterDueDate('');
    setFilterMinAmount('');
    setFilterMaxAmount('');
  };

  // Formatted numeric limits
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('th-TH', { style: 'decimal', minimumFractionDigits: 2 }).format(val);
  };

  // Dynamic invoice record definition and calculation reflecting user's screenshot
  interface InvoiceRecord {
    customerName: string;
    customerNo: string;
    aging: string;
    docNo: string;
    docDate: string;
    dueDate: string;
    amount: number;
  }

  const invoiceRecords = useMemo<InvoiceRecord[]>(() => {
    const list: InvoiceRecord[] = [];
    let invoiceCounter = 1;
    
    const generateDocNo = () => {
      return `DKM${String(invoiceCounter++).padStart(8, '0')}`;
    };

    if (customerData.id === 'C11351') {
      // Generate exactly 30 invoices: 29 invoices for the positive balance (total 4,003,942.67) and 1 for the Credit Memo of -7,362.67
      const totalPositive = 4003942.67;
      const creditMemoAmount = -7362.67;
      const basePositiveAmount = 138000;
      
      // Let's create varying dates from oct to nov 2025 to make it ultra-realistic
      for (let i = 0; i < 28; i++) {
        const day = 1 + (i % 28);
        list.push({
          customerName: customerData.name,
          customerNo: customerData.id,
          aging: 'OV >180',
          docNo: generateDocNo(),
          docDate: `${String(day).padStart(2, '0')}/10/2025`,
          dueDate: `${String(day).padStart(2, '0')}/11/2025`,
          amount: basePositiveAmount
        });
      }
      
      // 29th invoice covers the exact positive remainder
      const positiveRemainder = Number((totalPositive - (28 * basePositiveAmount)).toFixed(2));
      list.push({
        customerName: customerData.name,
        customerNo: customerData.id,
        aging: 'OV >180',
        docNo: generateDocNo(),
        docDate: '29/10/2025',
        dueDate: '29/11/2025',
        amount: positiveRemainder
      });

      // 30th invoice is the Credit Memo
      list.push({
        customerName: customerData.name,
        customerNo: customerData.id,
        aging: 'OV >180',
        docNo: generateDocNo(),
        docDate: '30/10/2025',
        dueDate: '30/11/2025',
        amount: creditMemoAmount
      });
    } else {
      // Helper to add mock records split beautifully like in the reference image
      const addRecords = (agingLabel: string, baseAmount: number) => {
        if (baseAmount <= 0) return;
        if (baseAmount > 15000) {
          // Split 60% / 40% to make multiple sequential items
          const part1 = Math.round(baseAmount * 0.6);
          const part2 = baseAmount - part1;
          list.push({
            customerName: customerData.name,
            customerNo: customerData.id,
            aging: agingLabel,
            docNo: generateDocNo(),
            docDate: 'xx/xx/xxxx',
            dueDate: 'xx/xx/xxxx',
            amount: part1
          });
          list.push({
            customerName: customerData.name,
            customerNo: customerData.id,
            aging: agingLabel,
            docNo: generateDocNo(),
            docDate: 'xx/xx/xxxx',
            dueDate: 'xx/xx/xxxx',
            amount: part2
          });
        } else {
          list.push({
            customerName: customerData.name,
            customerNo: customerData.id,
            aging: agingLabel,
            docNo: generateDocNo(),
            docDate: 'xx/xx/xxxx',
            dueDate: 'xx/xx/xxxx',
            amount: baseAmount
          });
        }
      };

      addRecords('Current', customerData.notDue);
      addRecords('OV 1 - 30', customerData.overdue_1_30);
      addRecords('OV 31 - 60', customerData.overdue_31_60);
      addRecords('OV 61 - 90', customerData.overdue_61_90);
      addRecords('OV >180', customerData.overdue_90plus);

      // Default row if customer balance is 0
      if (list.length === 0) {
        list.push({
          customerName: customerData.name,
          customerNo: customerData.id,
          aging: 'Current',
          docNo: generateDocNo(),
          docDate: 'xx/xx/xxxx',
          dueDate: 'xx/xx/xxxx',
          amount: 0
        });
      }
    }

    return list;
  }, [customerData]);

  const filteredInvoiceRecords = useMemo(() => {
    return invoiceRecords.filter(rec => {
      if (filterCustomerName && !rec.customerName.toLowerCase().includes(filterCustomerName.toLowerCase())) {
        return false;
      }
      if (filterCustomerNo && !rec.customerNo.toLowerCase().includes(filterCustomerNo.toLowerCase())) {
        return false;
      }
      if (filterAging && filterAging !== 'ALL' && rec.aging !== filterAging) {
        return false;
      }
      if (filterDocNo && !rec.docNo.toLowerCase().includes(filterDocNo.toLowerCase())) {
        return false;
      }
      if (filterDocDate) {
        const parts = filterDocDate.split('-');
        if (parts.length === 3) {
          const formattedFilter = `${parts[2]}/${parts[1]}/${parts[0]}`;
          if (!rec.docDate.includes(formattedFilter)) {
            return false;
          }
        } else {
          if (!rec.docDate.toLowerCase().includes(filterDocDate.toLowerCase())) {
            return false;
          }
        }
      }
      if (filterDueDate) {
        const parts = filterDueDate.split('-');
        if (parts.length === 3) {
          const formattedFilter = `${parts[2]}/${parts[1]}/${parts[0]}`;
          if (!rec.dueDate.includes(formattedFilter)) {
            return false;
          }
        } else {
          if (!rec.dueDate.toLowerCase().includes(filterDueDate.toLowerCase())) {
            return false;
          }
        }
      }
      if (filterMinAmount) {
        const val = parseFloat(filterMinAmount);
        if (!isNaN(val) && rec.amount < val) return false;
      }
      if (filterMaxAmount) {
        const val = parseFloat(filterMaxAmount);
        if (!isNaN(val) && rec.amount > val) return false;
      }
      return true;
    });
  }, [
    invoiceRecords,
    filterCustomerName,
    filterCustomerNo,
    filterAging,
    filterDocNo,
    filterDocDate,
    filterDueDate,
    filterMinAmount,
    filterMaxAmount
  ]);

  const paginatedInvoiceRecords = useMemo(() => {
    const startIndex = (invoicePage - 1) * 10;
    return filteredInvoiceRecords.slice(startIndex, startIndex + 10);
  }, [filteredInvoiceRecords, invoicePage]);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    const newNote: CollectionNote = {
      id: `N-NEW-${Date.now()}`,
      customerId: customerId,
      date: new Date().toLocaleDateString('th-TH'),
      author: currentUser?.fullName || customerData.salesmanName,
      note: newNoteText,
      followUpDate: newFollowUpDate || undefined,
      status: newNoteStatus
    };

    setCollectionNotes([newNote, ...collectionNotes]);
    setNewNoteText('');
  };

  const handleUpdateProfile = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      


      {/* SALESMAN INFO BANNER (Header ประวัติเซลส์ - Requirement 3: Customer ดูข้อมูลลูกค้า Header ประวัติเซล lineเป็นข้อมูลลูกค้าต่อ1ราย) */}
      <div className="bg-[#1A3263] text-white p-5 rounded-2xl border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 bg-[#FFC50C] rounded-full flex items-center justify-center border-2 border-white shadow-sm shrink-0">
            <User className="w-7 h-7 text-[#1A3263] stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center space-x-2 text-[10px] font-extrabold text-[#FFC50C] tracking-widest">
              <span>Sales representative in charge (ผู้รับผิดชอบดูแลบัญชี)</span>
            </div>
            <h3 className="text-base font-bold font-sans mt-0.5">{customerData.salesmanName}</h3>
            <p className="text-[11px] text-slate-200 font-mono mt-0.5">Code ID: {customerData.salesmanId} • Metro Cat Financial Services</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs bg-[#1A3263]/80 border border-white/10 px-4 py-2.5 rounded-xl">
          <div className="text-left">
            <p className="text-[9px] text-slate-300 font-bold">Customer region</p>
            <p className="font-bold text-[#FFC50C] uppercase font-mono">{customerData.region}</p>
          </div>
          <div className="border-l border-white/15 h-6"></div>
          <div className="text-left">
            <p className="text-[9px] text-slate-300 font-bold">Assigned branch</p>
            <p className="font-bold text-[#FFC50C] uppercase font-mono">{customerData.branch}</p>
          </div>
        </div>
      </div>

      {/* CUSTOMER PROFILE CARD (Main Image 3 Layout) */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-150 overflow-hidden">
        
        {/* Header of Profile Card */}
        <div className="bg-[#1A3263] text-white px-6 py-4 flex items-center justify-between">
          <h4 className="text-xs font-bold tracking-widest flex items-center gap-2">
            <User className="w-4 h-4 text-[#FFC50C]" /> Profile of: {editedCustomer.name}
          </h4>
          <span className="text-[10px] font-bold font-mono bg-white/10 px-2 py-0.5 rounded">
            ID: {customerData.id}
          </span>
        </div>

        {/* Form Fields corresponding directly to screenshot 3 input layout */}
        <div className="p-6 space-y-4">

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            
            {/* CODE */}
            <div className="md:col-span-3">
              <label className="block text-[10px] font-bold text-gray-400 tracking-wider mb-1">
                Code
              </label>
              <input
                type="text"
                disabled
                value={editedCustomer.id}
                className="w-full bg-slate-50 text-slate-500 font-mono font-bold text-xs p-2.5 border border-gray-200 rounded-lg focus:outline-none"
              />
            </div>

            {/* NAME */}
            <div className="md:col-span-6">
              <label className="block text-[10px] font-bold text-gray-400 tracking-wider mb-1">
                Name
              </label>
              <input
                type="text"
                value={editedCustomer.name}
                onChange={(e) => setEditedCustomer({ ...editedCustomer, name: e.target.value })}
                className="w-full text-xs font-bold text-[#1A3263] p-2.5 border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#FFC50C]"
              />
            </div>

            {/* REGION */}
            <div className="md:col-span-3">
              <label className="block text-[10px] font-bold text-gray-400 tracking-wider mb-1">
                Region
              </label>
              <input
                type="text"
                value={editedCustomer.region}
                onChange={(e) => setEditedCustomer({ ...editedCustomer, region: e.target.value })}
                className="w-full text-xs font-bold text-[#1A3263] p-2.5 border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#FFC50C]"
              />
            </div>

            {/* ADDRESS */}
            <div className="md:col-span-12">
              <label className="block text-[10px] font-bold text-gray-400 tracking-wider mb-1">
                Address
              </label>
              <input
                type="text"
                value={editedCustomer.address}
                onChange={(e) => setEditedCustomer({ ...editedCustomer, address: e.target.value })}
                className="w-full text-xs font-bold text-[#1A3263] p-2.5 border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#FFC50C]"
              />
            </div>

            {/* BRANCH */}
            <div className="md:col-span-4">
              <label className="block text-[10px] font-bold text-gray-400 tracking-wider mb-1">
                Branch
              </label>
              <input
                type="text"
                value={editedCustomer.branch}
                onChange={(e) => setEditedCustomer({ ...editedCustomer, branch: e.target.value })}
                className="w-full text-xs font-bold text-[#1A3263] p-2.5 border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#FFC50C]"
              />
            </div>

            {/* SALESMAN ID LOGS */}
            <div className="md:col-span-4">
              <label className="block text-[10px] font-bold text-gray-400 tracking-wider mb-1">
                Salesman codes
              </label>
              <input
                type="text"
                disabled
                value={editedCustomer.salesmanId}
                className="w-full bg-slate-50 text-slate-500 font-mono font-bold text-xs p-2.5 border border-gray-200 rounded-lg focus:outline-none"
              />
            </div>

            {/* STATUS */}
            <div className="md:col-span-4">
              <label className="block text-[10px] font-bold text-gray-400 tracking-wider mb-1">
                Status
              </label>
              <select
                value={editedCustomer.status}
                onChange={(e) => setEditedCustomer({ ...editedCustomer, status: e.target.value as any })}
                className="w-full text-xs font-extrabold text-[#1A3263] p-2.5 border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#FFC50C]"
              >
                <option value="ACTIVE">Active</option>
                <option value="OVERDUE">Overdue</option>
              </select>
            </div>



          </div>

          {/* LOWER CREDIT AND PAYMENTS ACTIONS (Like Image 3: credit term, days pills and credit limit button) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-6 border-t border-gray-100">
            
            {/* Pill 1: Credit Term */}
            <div className="bg-[#E8E2DB]/50 border border-[#547792]/15 rounded-xl p-4 flex items-center justify-between">
              <span className="text-xs font-black text-[#1A3263] tracking-wider">Credit term</span>
              <div className="flex items-center space-x-1">
                <span className="bg-[#1A3263] text-white font-mono text-xs font-extrabold px-3 py-1.5 rounded-lg">
                  {editedCustomer.creditTerm}
                </span>
                <span className="text-[#1A3263] font-bold text-[11px]">Days</span>
              </div>
            </div>

            {/* Pill 2: Credit Limit */}
            <div className="bg-[#E8E2DB]/50 border border-[#547792]/15 rounded-xl p-4 flex items-center justify-between col-span-1 md:col-span-2">
              <span className="text-xs font-black text-[#1A3263] tracking-wider">Credit limit</span>
              <span className="bg-white text-[#1A3263] border border-gray-200 text-sm font-black font-mono px-4 py-1.5 rounded-lg shadow-2xs">
                ฿{formatCurrency(editedCustomer.creditLimit)}
              </span>
            </div>

          </div>

          {/* Simulate Save profile button removed as requested */}

        </div>

      </div>

      {/* INVOICE DETAILS CARD (Requirement: Table with Yellow Header exactly like user's reference image) */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-150 p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-[#000000] text-xl font-bold font-sans">Invoice details</h3>
            <p className="text-[10px] text-gray-400 font-semibold mt-0.5">รายละเอียดวงเงินคงค้างตามใบแจ้งหนี้รายฉบับ (Invoice Details Breakdown)</p>
          </div>
        </div>

        {/* INTERACTIVE FILTERS PANEL - Grouped for Superior Usability & Aesthetics */}
        <div className="bg-[#E8E2DB]/20 rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <span className="text-sm font-black text-[#1A3263] uppercase tracking-wider flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#FFC50C]" /> Filters
            </span>
            <button
              onClick={handleClearInvoiceFilters}
              disabled={!(filterCustomerName || filterCustomerNo || filterAging || filterDocNo || filterDocDate || filterDueDate || filterMinAmount || filterMaxAmount)}
              className={`text-xs font-black uppercase flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all duration-200 border cursor-pointer ${
                (filterCustomerName || filterCustomerNo || filterAging || filterDocNo || filterDocDate || filterDueDate || filterMinAmount || filterMaxAmount)
                  ? "bg-red-600 hover:bg-red-700 text-white border-red-700 shadow-sm active:scale-95"
                  : "bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed opacity-60"
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" /> รีเซ็ตตัวกรองทั้งหมด (Reset Filters)
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Group 1: Customer Details */}
            <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-100 shadow-2xs">
              <span className="text-[10px] font-black text-[#1A3263]/70 uppercase tracking-wider block border-b border-slate-100 pb-1.5 font-sans">
                👤 ข้อมูลลูกค้า (Customer)
              </span>
              <div className="space-y-2.5">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-500 tracking-wider mb-1">
                    Customer no.
                  </span>
                  <input
                    type="text"
                    placeholder="ค้นรหัสลูกค้า..."
                    value={filterCustomerNo}
                    onChange={(e) => setFilterCustomerNo(e.target.value)}
                    className="w-full bg-slate-50 hover:bg-slate-50/50 focus:bg-white text-xs font-bold text-slate-700 p-2 border border-slate-200 rounded-lg focus:border-[#FFC50C] focus:ring-2 focus:ring-[#FFC50C]/20 focus:outline-none placeholder:text-gray-300 font-mono transition-all"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-500 tracking-wider mb-1">
                    Customer name
                  </span>
                  <input
                    type="text"
                    placeholder="ค้นชื่อลูกค้า..."
                    value={filterCustomerName}
                    onChange={(e) => setFilterCustomerName(e.target.value)}
                    className="w-full bg-slate-50 hover:bg-slate-50/50 focus:bg-white text-xs font-bold text-slate-700 p-2 border border-slate-200 rounded-lg focus:border-[#FFC50C] focus:ring-2 focus:ring-[#FFC50C]/20 focus:outline-none placeholder:text-gray-300 font-sans transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Group 2: Document Info */}
            <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-100 shadow-2xs">
              <span className="text-[10px] font-black text-[#1A3263]/70 uppercase tracking-wider block border-b border-slate-100 pb-1.5 font-sans">
                📄 ข้อมูลเอกสาร (Invoice Info)
              </span>
              <div className="space-y-2.5">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-500 tracking-wider mb-1">
                    Aging range
                  </span>
                  <select
                    value={filterAging}
                    onChange={(e) => setFilterAging(e.target.value)}
                    className="w-full bg-slate-50 text-xs font-bold text-slate-700 p-2 border border-slate-200 rounded-lg focus:border-[#FFC50C] focus:ring-2 focus:ring-[#FFC50C]/20 focus:outline-none cursor-pointer transition-all"
                  >
                    <option value="">ทั้งหมด (All)</option>
                    <option value="Current">Current</option>
                    <option value="OV 1 - 30">OV 1 - 30</option>
                    <option value="OV 31 - 60">OV 31 - 60</option>
                    <option value="OV 61 - 90">OV 61 - 90</option>
                    <option value="OV >180">OV &gt;180</option>
                  </select>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-500 tracking-wider mb-1">
                    Doc no.
                  </span>
                  <input
                    type="text"
                    placeholder="ค้นเลขที่เอกสาร..."
                    value={filterDocNo}
                    onChange={(e) => setFilterDocNo(e.target.value)}
                    className="w-full bg-slate-50 hover:bg-slate-50/50 focus:bg-white text-xs font-bold text-slate-700 p-2 border border-slate-200 rounded-lg focus:border-[#FFC50C] focus:ring-2 focus:ring-[#FFC50C]/20 focus:outline-none placeholder:text-gray-300 font-mono transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Group 3: Dates */}
            <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-100 shadow-2xs">
              <span className="text-[10px] font-black text-[#1A3263]/70 uppercase tracking-wider block border-b border-slate-100 pb-1.5 font-sans flex items-center justify-between">
                <span>📅 ช่วงเวลา (Dates)</span>
              </span>
              <div className="space-y-3">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-500 tracking-wider mb-1">
                    Doc date (วันออกใบแจ้งหนี้)
                  </span>
                  <CustomDatePicker
                    value={filterDocDate}
                    onChange={setFilterDocDate}
                    placeholder="วัน/เดือน/ปี"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-500 tracking-wider mb-1">
                    Due date (วันครบกำหนดชำระ)
                  </span>
                  <CustomDatePicker
                    value={filterDueDate}
                    onChange={setFilterDueDate}
                    placeholder="วัน/เดือน/ปี"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-150 hidden lg:block">
          <table className="w-full text-left border-collapse min-w-[750px] whitespace-nowrap">
            <thead>
              <tr className="bg-[#FFC50C]">
                <th className="py-3 px-4 text-xs font-bold text-gray-950 border-b border-gray-200">Customer no.</th>
                <th className="py-3 px-4 text-xs font-bold text-gray-950 border-b border-gray-200">Customer name</th>
                <th className="py-3 px-4 text-xs font-bold text-gray-950 border-b border-gray-200">Aging</th>
                <th className="py-3 px-4 text-xs font-bold text-gray-950 border-b border-gray-200">Doc no</th>
                <th className="py-3 px-4 text-xs font-bold text-gray-950 border-b border-gray-200 text-center">Doc date</th>
                <th className="py-3 px-4 text-xs font-bold text-gray-950 border-b border-gray-200 text-center">Due date</th>
                <th className="py-3 px-4 text-xs font-bold text-gray-950 border-b border-gray-200 text-right pr-6">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredInvoiceRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs font-bold text-gray-400 uppercase tracking-wider bg-slate-50/30">
                    ไม่พบข้อมูลใบแจ้งหนี้ตามตัวกรองที่เลือก (No Matching Invoice Records)
                  </td>
                </tr>
              ) : (
                paginatedInvoiceRecords.map((rec, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 text-xs font-bold text-gray-800 font-mono">{rec.customerNo}</td>
                    <td className="py-3.5 px-4 text-xs font-bold text-gray-800">{rec.customerName}</td>
                    <td className="py-3.5 px-4 text-xs font-bold text-gray-950">{rec.aging}</td>
                    <td className="py-3.5 px-4 text-xs font-bold text-gray-800 font-mono">{rec.docNo}</td>
                    <td className="py-3.5 px-4 text-xs font-semibold text-gray-500 font-mono text-center">{rec.docDate}</td>
                    <td className="py-3.5 px-4 text-xs font-semibold text-gray-500 font-mono text-center">{rec.dueDate}</td>
                    <td className="py-3.5 px-4 text-xs font-extrabold text-gray-900 text-right font-mono pr-6">
                      {rec.amount === 0 ? "0.00" : formatCurrency(rec.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards rendering: Shows nice cards instead of a wide table for screens < 1024px */}
        <div className="block lg:hidden border border-gray-150 rounded-xl divide-y divide-slate-100 bg-white overflow-hidden">
          {filteredInvoiceRecords.length === 0 ? (
            <div className="py-8 text-center text-xs font-bold text-gray-400 uppercase tracking-wider bg-slate-50/30">
              ไม่พบข้อมูลใบแจ้งหนี้ตามตัวกรองที่เลือก (No Matching Invoice Records)
            </div>
          ) : (
            paginatedInvoiceRecords.map((rec, i) => {
              const overdueDays = parseInt(rec.aging) || 0;
              const isOverdue = rec.aging !== 'CURRENT' && rec.aging !== 'Not Due' && rec.aging !== '-';
              return (
                <div key={i} className="p-4 hover:bg-slate-50 transition-colors text-left">
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <div>
                      <h5 className="text-xs font-extrabold text-[#1A3263] leading-snug">{rec.customerName}</h5>
                      <p className="text-[10px] font-mono font-bold text-slate-400 mt-0.5">Code: {rec.customerNo}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[8.5px] font-black uppercase inline-block select-none ${
                      isOverdue ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                    }`}>
                      {rec.aging}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-x-2 gap-y-2 mt-2 pt-2 border-t border-slate-100/50 text-[10px] text-slate-600">
                    <div>
                      <span className="font-semibold text-slate-400">Doc no:</span> <span className="font-mono font-bold text-slate-700">{rec.docNo}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-slate-400">Amount:</span> <span className="font-mono font-black text-slate-900 text-xs">฿{rec.amount === 0 ? "0.00" : formatCurrency(rec.amount)}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-400">Doc date:</span> <span className="font-mono text-slate-700">{rec.docDate}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-slate-400">Due date:</span> <span className="font-mono text-slate-700">{rec.dueDate}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination Controls for invoices (exactly 10 items max page cut) */}
        {(() => {
          const totalPages = Math.ceil(filteredInvoiceRecords.length / 10);
          if (totalPages <= 1) return null;
          return (
            <div className="flex items-center justify-between border-t border-slate-100 bg-white pt-4">
              {/* Mobile view */}
              <div className="flex flex-1 justify-between sm:hidden">
                <button
                  onClick={() => setInvoicePage(prev => Math.max(prev - 1, 1))}
                  disabled={invoicePage === 1}
                  className="relative inline-flex items-center rounded-md border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                >
                  ก่อนหน้า
                </button>
                <button
                  onClick={() => setInvoicePage(prev => Math.min(prev + 1, totalPages))}
                  disabled={invoicePage === totalPages}
                  className="relative ml-3 inline-flex items-center rounded-md border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                >
                  ถัดไป
                </button>
              </div>
              {/* Desktop view */}
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-semibold gap-1 inline-flex items-center">
                    แสดงรายการใบแจ้งหนี้ที่ <span className="font-bold text-[#1A3263]">{Math.min((invoicePage - 1) * 10 + 1, filteredInvoiceRecords.length)}</span> ถึง{' '}
                    <span className="font-bold text-[#1A3263]">{Math.min(invoicePage * 10, filteredInvoiceRecords.length)}</span> จากทั้งหมด{' '}
                    <span className="font-black text-[#1A3263]">{filteredInvoiceRecords.length}</span> รายการ
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md gap-1" aria-label="Invoice Pagination">
                    <button
                      onClick={() => setInvoicePage(prev => Math.max(prev - 1, 1))}
                      disabled={invoicePage === 1}
                      className="relative inline-flex items-center rounded-md bg-white px-2 py-1.5 text-slate-400 ring-1 ring-inset ring-gray-200 hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none cursor-pointer transition-all font-bold"
                    >
                      <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                    </button>
                    {(() => {
                      const maxButtons = 7;
                      let startPage = Math.max(1, invoicePage - Math.floor(maxButtons / 2));
                      let endPage = startPage + maxButtons - 1;
                      if (endPage > totalPages) {
                        endPage = totalPages;
                        startPage = Math.max(1, endPage - maxButtons + 1);
                      }
                      return Array.from({ length: endPage - startPage + 1 }).map((_, idx) => {
                        const pageNum = startPage + idx;
                        const isCurrent = pageNum === invoicePage;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setInvoicePage(pageNum)}
                            className={`relative inline-flex items-center rounded-md px-3 py-1.5 text-xs font-bold ring-1 ring-inset transition-all cursor-pointer ${
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
                      onClick={() => setInvoicePage(prev => Math.min(prev + 1, totalPages))}
                      disabled={invoicePage === totalPages}
                      className="relative inline-flex items-center rounded-md bg-white px-2 py-1.5 text-slate-400 ring-1 ring-inset ring-gray-200 hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none cursor-pointer transition-all font-bold"
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

      {/* COLLECTION ACTION LOGS & NEW ENTRIES PANEL (ประวัติการติดตามชำระเงินและการโทรทวงถาม) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: List historical follow-up logs */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-150 shadow-sm p-5 space-y-4">
          <div>
            <h4 className="text-xs font-black text-[#1A3263] tracking-widest flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-[#FFC50C]" /> Collection interaction history
            </h4>
            <p className="text-[10px] text-gray-400 font-semibold mt-0.5">ประวัติการเข้าทวงถาม ติดต่อประสานงาน และคำมั่นสัญญาการชำระเงินจากลูกหนี้</p>
          </div>

          <div className="space-y-3.5 max-h-96 overflow-y-auto pr-1">
            {collectionNotes.length === 0 ? (
              <div className="text-center py-10 border border-dashed rounded-xl text-gray-400 text-[11px] font-semibold uppercase">
                ไม่มีประวัติการบันทึกสำหรับลูกค้ารายนี้
              </div>
            ) : (
              collectionNotes.map((note) => (
                <div key={note.id} className="bg-[#E8E2DB]/20 border border-gray-150 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[11px] text-[#1A3263]">{note.author}</span>
                    <span className="text-[10px] text-gray-400 font-bold font-mono">{note.date}</span>
                  </div>
                  
                  <p className="text-xs text-gray-700 bg-white/70 p-2.5 rounded-lg border border-gray-100 font-medium">
                    {note.note}
                  </p>

                  <div className="flex items-center justify-between text-[10px] pt-1 font-bold">
                    <span className={`inline-flex px-2 py-0.5 rounded ${
                      note.status === 'Resolved' ? 'bg-green-50 text-green-700' :
                      note.status === 'Committed' ? 'bg-[#FFC50C]/15 text-[#1A3263]' :
                      'bg-red-50 text-red-600'
                    }`}>
                      Status: {note.status}
                    </span>
                    {note.followUpDate && (
                      <span className="text-slate-500">
                        Follow-up date: {note.followUpDate}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Log a new call/follow-up interaction */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-150 shadow-sm p-5 space-y-4">
          <div>
            <h4 className="text-xs font-black text-[#1A3263] tracking-widest flex items-center gap-1.5">
              <PhoneCall className="w-4 h-4 text-[#FFC50C]" /> Record outstanding interaction
            </h4>
            <p className="text-[10px] text-gray-400 font-semibold mt-0.5">บันทึกความคืบหน้าเมื่อเข้าคุยโทรศัพท์ หรือได้รับเอกสารแจ้งนัดโอนเงิน</p>
          </div>

          <form onSubmit={handleAddNote} className="space-y-4">
            
            {/* Author display */}
            <div>
              <label className="block text-[9px] font-bold text-gray-400 mb-1">Author / Salesman</label>
              <input
                type="text"
                disabled
                value={currentUser?.fullName || customerData.salesmanName}
                className="w-full bg-slate-50 font-bold text-xs p-2 rounded-lg border border-gray-100 text-[#547792]"
              />
            </div>

            {/* Note text content */}
            <div>
              <label className="block text-[9px] font-bold text-gray-400 mb-1">Observation / interaction notes</label>
              <textarea
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                required
                rows={3}
                placeholder="ระบุวัตถุประสงค์ หรือปัญหาที่ลูกค้าติดขัด เช่น จัดซื้อยังไม่เซ็นอนุมัติเช็ค หรือขอนัดเคลียร์งวดใหม่วันไหน..."
                className="w-full text-xs font-semibold p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FFC50C]"
              />
            </div>

            {/* Status categorization */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[9px] font-bold text-gray-400 mb-1">Action status</label>
                <select
                  value={newNoteStatus}
                  onChange={(e) => setNewNoteStatus(e.target.value as any)}
                  className="w-full text-xs font-bold text-[#1A3263] p-2 border border-gray-200 rounded-lg focus:outline-none"
                >
                  <option value="Pending">Pending (อยู่ระหว่างประสาน)</option>
                  <option value="Committed">Committed (สัญญาโอนเงิน)</option>
                  <option value="Resolved">Resolved (ชำระเสร็จสิ้น)</option>
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-gray-400 mb-1">Next follow-up date (วันนัดคุยความคืบหน้า)</label>
                <CustomDatePicker
                  value={newFollowUpDate}
                  onChange={setNewFollowUpDate}
                  placeholder="วัน/เดือน/ปี"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#1A3263] text-white hover:bg-[#FFC50C] hover:text-[#1A3263] font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center space-x-1.5 shadow-sm transition-all duration-150 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>บันทึกความคืบหน้า (Log interaction)</span>
            </button>

          </form>

        </div>

      </div>

    </div>
  );
}
