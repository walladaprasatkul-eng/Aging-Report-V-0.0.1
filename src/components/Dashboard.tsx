import React, { useState, useMemo, useCallback } from 'react';
import { 
  Users, BarChart3, TrendingUp, Search, Filter, ShieldCheck, 
  ChevronRight, ChevronLeft, Building2, Landmark, CheckCircle2, AlertCircle, ArrowUpRight,
  FileText, Scale, Download, Layers, User
} from 'lucide-react';
import { Customer, Salesman, LoggedInUser } from '../types';
import { mockCustomers, mockSalesmen } from '../data';

interface DashboardProps {
  user: LoggedInUser;
  onUpdateAvatar?: (url: string) => void;
  onSelectSalesman: (salesmanId: string) => void;
  onSelectCustomer: (customerId: string) => void;
}

export default function Dashboard({ user, onUpdateAvatar, onSelectSalesman, onSelectCustomer }: DashboardProps) {
  // Robust layout-centric state initialization to ensure that numbers are completely consistent immediately upon mounting!
  const initialStates = useMemo(() => {
    let initialManagers = ['Mr. SAKSRI HONGKHAMJAN', 'NARAKON SRITOOMMA'];
    let initialBranches = ['KhonKaen-Branch', 'KM (Kamphaeng Phet Branch)', 'Bangna-Tr', 'EngineStore'];
    let initialRegion = 'ALL REGIONS';

    if (user.role === 'BRANCH_MANAGER') {
      if (user.branch === 'KhonKaen-Branch') {
        initialManagers = ['Mr. SAKSRI HONGKHAMJAN'];
        initialBranches = ['KhonKaen-Branch'];
        initialRegion = 'NorthEast';
      } else {
        initialManagers = ['NARAKON SRITOOMMA'];
        initialBranches = ['KM (Kamphaeng Phet Branch)'];
        initialRegion = 'Central';
      }
    } else if (user.role === 'NORTHEAST') {
      initialManagers = ['Mr. SAKSRI HONGKHAMJAN'];
      initialBranches = ['KhonKaen-Branch'];
      initialRegion = 'NorthEast';
    } else if (user.role === 'SA') {
      initialRegion = user.region || 'NorthEast';
      initialBranches = [user.branch || 'KhonKaen-Branch'];
      initialManagers = (user.branch || 'KhonKaen-Branch') === 'KhonKaen-Branch' 
        ? ['Mr. SAKSRI HONGKHAMJAN'] 
        : ['NARAKON SRITOOMMA'];
    }

    return {
      managers: initialManagers,
      branches: initialBranches,
      region: initialRegion
    };
  }, [user]);

  // Filter States with check support
  const [selectedRegion, setSelectedRegion] = useState<string>(initialStates.region);
  const [selectedBranchManagers, setSelectedBranchManagers] = useState<string[]>(initialStates.managers);
  const [selectedBranches, setSelectedBranches] = useState<string[]>(initialStates.branches);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL STATUS');
  const [selectedSalesmen, setSelectedSalesmen] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [salesmanQuery, setSalesmanQuery] = useState<string>('');
  const [selectedBUs, setSelectedBUs] = useState<string[]>(
    user.role === 'SA' 
      ? [user.businessUnit || 'Parts & Service CI']
      : ['Parts & Service CI'] // Maintain original default behavior: initially "Parts & Service CI"
  );
  
  // Custom states for dropdown toggles (ensuring at most one popover is active at a time)
  const [activeDropdown, setActiveDropdown] = useState<'manager' | 'branch' | 'bu' | 'salesman' | null>(null);
  const [salesmanFilterSearch, setSalesmanFilterSearch] = useState<string>('');

  // Compatibility layers for backward rendering requirements (e.g., manager profile badge references)
  const selectedBranchManager = useMemo(() => {
    if (selectedBranchManagers.length === 2 || selectedBranchManagers.length === 0) {
      return 'ALL MANAGERS';
    }
    return selectedBranchManagers[0];
  }, [selectedBranchManagers]);

  const selectedBranch = useMemo(() => {
    if (selectedBranches.length === 4 || selectedBranches.length === 0) {
      return 'ALL BRANCHES';
    }
    if (selectedBranches.length === 1) {
      return selectedBranches[0];
    }
    return 'MULTIPLE';
  }, [selectedBranches]);

  const selectedSalesmanFilter = useMemo(() => {
    if (selectedSalesmen.length === 1) {
      return selectedSalesmen[0];
    }
    return 'ALL SALESMEN';
  }, [selectedSalesmen]);

  const selectedBU = useMemo(() => {
    if (selectedBUs.length === 1) {
      return selectedBUs[0];
    }
    if (selectedBUs.length === 3 || selectedBUs.length === 0) {
      return 'ALL BUSINESS UNITS';
    }
    return 'MULTIPLE';
  }, [selectedBUs]);

  // Backward compatibility setter override functions to handle legacy state updates safely
  const setSelectedBranch = useCallback((val: string) => {
    if (val === 'ALL BRANCHES') {
      setSelectedBranches(['KhonKaen-Branch', 'KM (Kamphaeng Phet Branch)', 'Bangna-Tr', 'EngineStore']);
      setSelectedBranchManagers(['Mr. SAKSRI HONGKHAMJAN', 'NARAKON SRITOOMMA']);
    } else {
      setSelectedBranches([val]);
      if (val === 'KhonKaen-Branch') {
        setSelectedBranchManagers(['Mr. SAKSRI HONGKHAMJAN']);
      } else if (val === 'KM (Kamphaeng Phet Branch)') {
        setSelectedBranchManagers(['NARAKON SRITOOMMA']);
      } else {
        setSelectedBranchManagers([]);
      }
    }
  }, []);

  const setSelectedSalesmanFilter = useCallback((val: string) => {
    if (val === 'ALL SALESMEN') {
      setSelectedSalesmen([]);
    } else {
      setSelectedSalesmen([val]);
    }
  }, []);

  const setSelectedBU = useCallback((val: string) => {
    if (val === 'ALL BUSINESS UNITS') {
      setSelectedBUs(['Parts & Service CI', 'Machine Sales BU', 'Engine Sales BU']);
    } else {
      setSelectedBUs([val]);
    }
  }, []);

  const setSelectedBranchManager = useCallback((val: string) => {
    if (val === 'ALL MANAGERS') {
      setSelectedBranchManagers(['Mr. SAKSRI HONGKHAMJAN', 'NARAKON SRITOOMMA']);
      setSelectedBranches(['KhonKaen-Branch', 'KM (Kamphaeng Phet Branch)', 'Bangna-Tr', 'EngineStore']);
    } else {
      setSelectedBranchManagers([val]);
      if (val === 'Mr. SAKSRI HONGKHAMJAN') {
        setSelectedBranches(['KhonKaen-Branch']);
      } else if (val === 'NARAKON SRITOOMMA') {
        setSelectedBranches(['KM (Kamphaeng Phet Branch)']);
      }
    }
  }, []);

  // Click-outside listener to automatically close active filter controls correctly
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.multiselect-container')) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Pagination States (Exactly 10 items per page limit as requested)
  const [salesmenPage, setSalesmenPage] = useState<number>(1);
  const [customersPage, setCustomersPage] = useState<number>(1);

  React.useEffect(() => {
    setSalesmenPage(1);
  }, [selectedRegion, selectedBranches, selectedStatus, salesmanQuery, selectedBranchManagers, selectedBUs, selectedSalesmen]);

  React.useEffect(() => {
    setCustomersPage(1);
  }, [selectedRegion, selectedBranches, selectedStatus, selectedSalesmen, searchQuery, selectedBranchManagers, selectedBUs]);

  // Avatar states for Branch Managers
  const [saksriAvatar, setSaksriAvatar] = useState<string | null>(localStorage.getItem('avatar_saksri.hong@metrocat.com'));
  const [narakonAvatar, setNarakonAvatar] = useState<string | null>(localStorage.getItem('avatar_narakon.sri@metrocat.com'));
  const [allManagersAvatar, setAllManagersAvatar] = useState<string | null>(localStorage.getItem('avatar_all_managers'));

  // Filter base list of customers and salesmen based on the logged-in user's role and scopes
  const baseCustomers = useMemo(() => {
    let filtered = mockCustomers;

    if (user.role === 'NORTHEAST') {
      filtered = filtered.filter(c => c.region.toLowerCase() === 'northeast');
    } else if (user.role === 'BRANCH_MANAGER') {
      filtered = filtered.filter(c => c.branch.toLowerCase() === user.branch.toLowerCase());
    } else if (user.role === 'SALESMAN') {
      filtered = filtered.filter(c => c.salesmanId === user.salesmanId);
    } else if (user.role === 'SA') {
      filtered = filtered.filter(c => c.businessUnit === user.businessUnit);
    }

    // Apply branch selections filter
    if (selectedBranches.length > 0) {
      filtered = filtered.filter(c => {
        return selectedBranches.some(b => {
          if (b === 'KhonKaen-Branch') {
            return c.branch.toLowerCase().includes('khon');
          }
          if (b === 'KM (Kamphaeng Phet Branch)') {
            return c.branch.toLowerCase().includes('kamphaeng');
          }
          if (b === 'Bangna-Tr') {
            return c.branch.toLowerCase().includes('bangna');
          }
          if (b === 'EngineStore') {
            return c.branch.toLowerCase().includes('engine') || c.branch.toLowerCase().includes('freezone');
          }
          return c.branch === b;
        });
      });
    }

    return filtered;
  }, [user, selectedBranches]);

  const baseSalesmen = useMemo(() => {
    let filtered = mockSalesmen;

    if (user.role === 'NORTHEAST') {
      filtered = filtered.filter(s => s.region.toLowerCase() === 'northeast');
    } else if (user.role === 'BRANCH_MANAGER') {
      filtered = filtered.filter(s => s.branch.toLowerCase() === user.branch.toLowerCase());
    } else if (user.role === 'SALESMAN') {
      filtered = filtered.filter(s => s.id === user.salesmanId);
    } else if (user.role === 'SA') {
      filtered = filtered.filter(s => s.businessUnit === user.businessUnit);
    }

    // Apply branch selections filter
    if (selectedBranches.length > 0) {
      filtered = filtered.filter(s => {
        return selectedBranches.some(b => {
          if (b === 'KhonKaen-Branch') {
            return s.branch.toLowerCase().includes('khon');
          }
          if (b === 'KM (Kamphaeng Phet Branch)') {
            return s.branch.toLowerCase().includes('kamphaeng');
          }
          if (b === 'Bangna-Tr') {
            return s.branch.toLowerCase().includes('bangna');
          }
          if (b === 'EngineStore') {
            return s.branch.toLowerCase().includes('engine') || s.branch.toLowerCase().includes('freezone');
          }
          return s.branch === b;
        });
      });
    }

    return filtered;
  }, [user, selectedBranches]);

  // Extract unique filter populations for dropdowns
  const regions = useMemo(() => {
    const list = Array.from(new Set(baseCustomers.map(c => c.region)));
    return list.length <= 1 ? list : ['ALL REGIONS', ...list];
  }, [baseCustomers]);

  const branches = useMemo(() => {
    const list = Array.from(new Set(baseCustomers.map(c => c.branch)));
    return list.length <= 1 ? list : ['ALL BRANCHES', ...list];
  }, [baseCustomers]);

  const statuses = useMemo(() => {
    return ['ALL STATUS', 'ACTIVE', 'OVERDUE'];
  }, []);

  const salesmenList = useMemo(() => {
    return baseSalesmen;
  }, [baseSalesmen]);

  // Filtered customer subset based on ALL selected filters
  const filteredCustomers = useMemo(() => {
    return baseCustomers.filter(customer => {
      const matchRegion = selectedRegion === 'ALL REGIONS' || customer.region === selectedRegion;
      
      let matchManager = false;
      if (selectedBranchManagers.includes('Mr. SAKSRI HONGKHAMJAN') && customer.branch.toLowerCase().includes('khon')) {
        matchManager = true;
      }
      if (selectedBranchManagers.includes('NARAKON SRITOOMMA') && customer.branch.toLowerCase().includes('kamphaeng')) {
        matchManager = true;
      }
      if (selectedBranchManagers.length === 0 || selectedBranchManagers.length === 2) {
        matchManager = true;
      }

      const matchBU = selectedBUs.includes(customer.businessUnit);
      const matchStatus = selectedStatus === 'ALL STATUS' || customer.status === selectedStatus;
      const matchSalesman = selectedSalesmen.length === 0 || selectedSalesmen.includes(customer.salesmanId);
      const matchSearch = searchQuery === '' || 
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.salesmanName.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchRegion && matchManager && matchBU && matchStatus && matchSalesman && matchSearch;
    });
  }, [baseCustomers, selectedRegion, selectedBranchManagers, selectedBUs, selectedStatus, selectedSalesmen, searchQuery]);

  // Compute aggregated aging totals dynamically based on filtered customers
  const aggregates = useMemo(() => {
    let notDue = 0;
    let overdue_1_30 = 0;
    let overdue_31_60 = 0;
    let overdue_61_90 = 0;
    let overdue_90plus = 0;
    let overdue_91_120 = 0;
    let overdue_121_150 = 0;
    let overdue_151_180 = 0;
    let overdue_180plus = 0;
    let currentInvoices = 0;
    let overdueInvoices = 0;

    filteredCustomers.forEach(c => {
      notDue += c.notDue;
      overdue_1_30 += c.overdue_1_30;
      overdue_31_60 += c.overdue_31_60;
      overdue_61_90 += c.overdue_61_90;
      overdue_90plus += c.overdue_90plus;

      // Split 90plus into sub-columns deterministically for correct aggregation
      const ov90 = c.overdue_90plus || 0;
      const ov91_120 = 0;
      const ov121_150 = 0;
      let ov151_180 = 0;
      if (ov90 > 15000) {
        ov151_180 = 10000;
      } else if (ov90 > 5000) {
        ov151_180 = 2000;
      }
      const ov180plus = ov90 - ov151_180;

      overdue_91_120 += ov91_120;
      overdue_121_150 += ov121_150;
      overdue_151_180 += ov151_180;
      overdue_180plus += ov180plus;

      // Simulate a realistic deterministic count of invoices per client
      if (c.id === 'C11351') {
        overdueInvoices += 30;
      } else {
        if (c.notDue > 0) {
          const currentCount = Math.max(1, Math.min(5, Math.ceil(c.notDue / 40000)));
          currentInvoices += currentCount;
        }
        
        let overdueCount = 0;
        if (c.overdue_1_30 > 0) overdueCount += Math.max(1, Math.min(4, Math.ceil(c.overdue_1_30 / 35000)));
        if (c.overdue_31_60 > 0) overdueCount += Math.max(1, Math.min(3, Math.ceil(c.overdue_31_60 / 40000)));
        if (c.overdue_61_90 > 0) overdueCount += Math.max(1, Math.min(2, Math.ceil(c.overdue_61_90 / 45000)));
        if (c.overdue_90plus > 0) overdueCount += Math.max(1, Math.min(2, Math.ceil(c.overdue_90plus / 50000)));
        overdueInvoices += overdueCount;
      }
    });

    const total = notDue + overdue_1_30 + overdue_31_60 + overdue_61_90 + overdue_90plus;

    return {
      notDue,
      overdue_1_30,
      overdue_31_60,
      overdue_61_90,
      overdue_90plus,
      overdue_91_120,
      overdue_121_150,
      overdue_151_180,
      overdue_180plus,
      total,
      currentInvoices,
      overdueInvoices
    };
  }, [filteredCustomers]);

  // Salesmen summarized lines (recalculated based on current branch/region filters)
  const salesmenSummary = useMemo(() => {
    return baseSalesmen.map((sm, index) => {
      // Find customers belonging to this salesman and matching top-level branch/region filters
      const smCustomers = baseCustomers.filter(c => {
        const matchSalesman = c.salesmanId === sm.id;
        const matchRegion = selectedRegion === 'ALL REGIONS' || c.region === selectedRegion;
        
        let matchManager = false;
        if (selectedBranchManagers.includes('Mr. SAKSRI HONGKHAMJAN') && c.branch.toLowerCase().includes('khon')) {
          matchManager = true;
        }
        if (selectedBranchManagers.includes('NARAKON SRITOOMMA') && c.branch.toLowerCase().includes('kamphaeng')) {
          matchManager = true;
        }
        if (selectedBranchManagers.length === 0 || selectedBranchManagers.length === 2) {
          matchManager = true;
        }

        const matchBU = selectedBUs.includes(c.businessUnit);

        return matchSalesman && matchRegion && matchManager && matchBU;
      });

      let totalOutstanding = 0;
      let notDue = 0;
      let overdue_1_30 = 0;
      let overdue_31_60 = 0;
      let overdue_61_90 = 0;
      let overdue_90plus = 0;
      
      smCustomers.forEach(c => {
        totalOutstanding += c.outstandingBalance;
        notDue += c.notDue;
        overdue_1_30 += c.overdue_1_30;
        overdue_31_60 += c.overdue_31_60;
        overdue_61_90 += c.overdue_61_90;
        overdue_90plus += c.overdue_90plus;
      });

      // Split 90plus into sub-columns matching image (151-180D, 180D+) deterministically
      const overdue_91_120 = 0;
      const overdue_121_150 = 0;
      let overdue_151_180 = 0;
      
      // If of high overdue 90plus (like in G-1-175), map beautifully to show some 151-180 and majority in 180+
      if (overdue_90plus > 25000) {
        overdue_151_180 = 10000;
      } else if (overdue_90plus > 10000) {
        overdue_151_180 = 2000;
      }
      const overdue_180plus = overdue_90plus - overdue_151_180;

      // Sequential mockup index to render S001, S002, etc. nicely
      const codePill = `S00${index + 1}`;

      return {
        ...sm,
        codePill,
        filteredCustomersCount: smCustomers.length,
        filteredOutstanding: totalOutstanding,
        notDue,
        overdue_1_30,
        overdue_31_60,
        overdue_61_90,
        overdue_91_120,
        overdue_121_150,
        overdue_151_180,
        overdue_180plus
      };
    }).filter(sm => {
      const matchFilter = selectedSalesmen.length === 0 || selectedSalesmen.includes(sm.id);
      const matchSearch = salesmanQuery === '' || 
        sm.name.toLowerCase().includes(salesmanQuery.toLowerCase()) ||
        sm.id.toLowerCase().includes(salesmanQuery.toLowerCase()) ||
        sm.branch.toLowerCase().includes(salesmanQuery.toLowerCase());
      return matchFilter && matchSearch;
    });
  }, [baseCustomers, baseSalesmen, selectedRegion, selectedBranchManagers, selectedBUs, selectedSalesmen, salesmanQuery]);

  const paginatedSalesmenSummary = useMemo(() => {
    const startIndex = (salesmenPage - 1) * 10;
    return salesmenSummary.slice(startIndex, startIndex + 10);
  }, [salesmenSummary, salesmenPage]);

  // Aggregate matrix totals across filtered salesmen
  const salesmenTotals = useMemo(() => {
    let totalOutstanding = 0;
    let notDue = 0;
    let overdue_1_30 = 0;
    let overdue_31_60 = 0;
    let overdue_61_90 = 0;
    let overdue_91_120 = 0;
    let overdue_121_150 = 0;
    let overdue_151_180 = 0;
    let overdue_180plus = 0;
    let customerCount = 0;

    salesmenSummary.forEach(sm => {
      totalOutstanding += sm.filteredOutstanding;
      notDue += sm.notDue;
      overdue_1_30 += sm.overdue_1_30;
      overdue_31_60 += sm.overdue_31_60;
      overdue_61_90 += sm.overdue_61_90;
      overdue_91_120 += sm.overdue_91_120;
      overdue_121_150 += sm.overdue_121_150;
      overdue_151_180 += sm.overdue_151_180;
      overdue_180plus += sm.overdue_180plus;
      customerCount += sm.filteredCustomersCount;
    });

    return {
      totalOutstanding,
      notDue,
      overdue_1_30,
      overdue_31_60,
      overdue_61_90,
      overdue_91_120,
      overdue_121_150,
      overdue_151_180,
      overdue_180plus,
      customerCount
    };
  }, [salesmenSummary]);

  // Helper payment of formatted THB
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('th-TH', { style: 'decimal', minimumFractionDigits: 2 }).format(val);
  };

  const formatAbbreviated = (val: number) => {
    if (val >= 1000000) {
      return (val / 1000000).toFixed(1) + 'M';
    } else if (val >= 1000) {
      return (val / 1000).toFixed(0) + 'K';
    }
    return val.toString();
  };

  const formatCellAmount = (val: number, isGreen?: boolean, isRed?: boolean) => {
    if (val === 0) {
      return <span className="text-gray-300 block text-center font-semibold select-none">-</span>;
    }
    const formatted = new Intl.NumberFormat('th-TH', { style: 'decimal', maximumFractionDigits: 0 }).format(val);
    if (isGreen) {
      return <span className="text-emerald-600 font-extrabold text-right block">{formatted}</span>;
    }
    if (isRed) {
      return <span className="text-red-500 font-extrabold text-right block">{formatted}</span>;
    }
    return <span className="text-slate-700 font-bold text-right block">{formatted}</span>;
  };

  const splitName = (fullName: string) => {
    const match = fullName.match(/^([^(]+)(?:\(([^)]+)\))?/);
    if (match) {
      const thaiName = match[1].trim();
      const engName = match[2] ? match[2].trim() : '';
      return { thaiName, engName };
    }
    return { thaiName: fullName, engName: '' };
  };

  // Find max value in aging buckets to scale our custom SVG chart correctly
  const maxAgingValue = Math.max(
    aggregates.notDue,
    aggregates.overdue_1_30,
    aggregates.overdue_31_60,
    aggregates.overdue_61_90,
    aggregates.overdue_91_120,
    aggregates.overdue_121_150,
    aggregates.overdue_151_180,
    aggregates.overdue_180plus,
    1000 // default min height scale
  );

  const handleDashboardAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          if (selectedBranchManager === 'Mr. SAKSRI HONGKHAMJAN') {
            localStorage.setItem('avatar_saksri.hong@metrocat.com', reader.result);
            setSaksriAvatar(reader.result);
          } else if (selectedBranchManager === 'NARAKON SRITOOMMA') {
            localStorage.setItem('avatar_narakon.sri@metrocat.com', reader.result);
            setNarakonAvatar(reader.result);
          } else if (selectedBranchManager === 'ALL MANAGERS') {
            localStorage.setItem('avatar_all_managers', reader.result);
            setAllManagersAvatar(reader.result);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Salesman ID', 'Name', 'Filtered Outstanding', 'Current', '1-30D', '31-60D', '61-90D', '91-120D', '121-150D', '151-180D', '180D+'];
    const rows = salesmenSummary.map(sm => [
      sm.id,
      sm.name,
      sm.filteredOutstanding,
      sm.notDue,
      sm.overdue_1_30,
      sm.overdue_31_60,
      sm.overdue_61_90,
      sm.overdue_91_120,
      sm.overdue_121_150,
      sm.overdue_151_180,
      sm.overdue_180plus
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "salesmen_aging_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const percent_notDue = aggregates.total > 0 ? ((aggregates.notDue / aggregates.total) * 100).toFixed(1) : '0.0';
  const percent_overdue = aggregates.total > 0 ? (((aggregates.total - aggregates.notDue) / aggregates.total) * 100).toFixed(1) : '0.0';

  const totalInvoicesSum = aggregates.currentInvoices + aggregates.overdueInvoices;
  const percent_currentInvoices = totalInvoicesSum > 0 ? ((aggregates.currentInvoices / totalInvoicesSum) * 100).toFixed(1) : '0.0';
  const percent_overdueInvoices = totalInvoicesSum > 0 ? ((aggregates.overdueInvoices / totalInvoicesSum) * 100).toFixed(1) : '0.0';

  const activeFilteredSalesman = useMemo(() => {
    if (selectedSalesmanFilter === 'ALL SALESMEN') return null;
    return baseSalesmen.find(s => s.id === selectedSalesmanFilter) || null;
  }, [selectedSalesmanFilter, baseSalesmen]);

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
    const startIndex = (customersPage - 1) * 10;
    return customersSummary.slice(startIndex, startIndex + 10);
  }, [customersSummary, customersPage]);

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

  const handleExportCustomerCSV = () => {
    const headers = ['Customer No.', 'Customer Name', 'Assigned Salesman', 'Balance', 'Current', '1-30D', '31-60D', '61-90D', '91-120D', '121-150D', '151-180D', '180D+'];
    const rows = customersSummary.map(c => [
      c.id,
      c.name,
      `${c.salesmanName} (${c.salesmanId})`,
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
    link.setAttribute("download", "customer_aging_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Upper Welcoming Profile Card (Header) */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-[#1A3263] via-[#1A3263] to-[#547792] p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <input 
              type="file" 
              id="dashboard-avatar-input" 
              accept="image/*" 
              onChange={handleDashboardAvatarChange} 
              className="hidden" 
            />
            <div 
              onClick={() => document.getElementById('dashboard-avatar-input')?.click()}
              className="w-20 h-20 bg-[#FFC50C] rounded-full flex items-center justify-center font-black text-3xl text-[#1A3263] border-2 border-white shadow-md shrink-0 cursor-pointer overflow-hidden relative group hover:brightness-115 active:scale-95 transition-all"
              title="คลิกเพื่ออัปโหลดรูปโปรไฟล์ (Click to upload profile image)"
            >
              {selectedBranchManager === 'Mr. SAKSRI HONGKHAMJAN' ? (
                <img 
                  src={saksriAvatar || "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=250&h=250"} 
                  alt="Mr. Saksri Profile" 
                  className="w-full h-full object-cover animate-fade-in" 
                  referrerPolicy="no-referrer"
                />
              ) : selectedBranchManager === 'NARAKON SRITOOMMA' ? (
                <img 
                  src={narakonAvatar || "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=250&h=250"} 
                  alt="Narakon Profile" 
                  className="w-full h-full object-cover animate-fade-in" 
                  referrerPolicy="no-referrer"
                />
              ) : selectedBranchManager === 'ALL MANAGERS' ? (
                <img 
                  src={allManagersAvatar || "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=250&h=250"} 
                  alt="Corporate Executive Board" 
                  className="w-full h-full object-cover animate-fade-in" 
                  referrerPolicy="no-referrer"
                />
              ) : user.avatarUrl ? (
                <img 
                  src={user.avatarUrl} 
                  alt="User Profile" 
                  className="w-full h-full object-cover animate-fade-in" 
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full bg-[#547792] text-white flex items-center justify-center font-black text-2xl select-none">
                  {user.fullName.replace('Mr. ', '').replace('Ms. ', '').split(' ').map(n => n.charAt(0)).join('').substring(0, 2).toUpperCase()}
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <span className="text-[10px] text-white font-extrabold uppercase tracking-wider">Change</span>
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-xs tracking-wider text-[#FFC50C] uppercase">
                  {selectedBranchManager === 'ALL MANAGERS' ? 'Executive Mode' : 'Branch Manager'}
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold font-sans mt-0.5">
                {selectedBranchManager === 'ALL MANAGERS' ? 'ALL MANAGERS / EXECUTIVE VIEW' : selectedBranchManager}
              </h2>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-1 text-xs text-slate-200 font-mono">
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#FFC50C]" /> 
                  <span>{`Branch : ${
                    selectedBranch === 'ALL BRANCHES' ? 'All Branches (ทุกสาขา)' :
                    selectedBranch === 'KhonKaen-Branch' ? 'Khon Kaen' :
                    selectedBranch === 'KM (Kamphaeng Phet Branch)' ? 'Kamphaeng Phet (KM)' : selectedBranch
                  }`}</span>
                </span>
              </div>
            </div>
          </div>
          <div className="bg-[#1A3263]/60 backdrop-blur-sm px-4 py-3 rounded-xl border border-white/10 flex items-center space-x-6">
            <div className="text-center">
              <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">
                Supervised Salesmen
              </p>
              <p className="text-xl font-extrabold font-mono text-[#FFC50C]">
                {baseSalesmen.length}
              </p>
            </div>
            <div className="border-l border-white/10 h-8"></div>
            <div className="text-right">
              <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">Active Accounts</p>
              <p className="text-xl font-extrabold font-mono text-[#FFC50C]">{filteredCustomers.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* HIGHLIGHTED IN RED CIRCLE: HIGH-FIDELITY FILTERS COMPONENT */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-4 select-none">
        
        {/* Row 1: Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center border border-indigo-100/50">
              <Filter className="w-3.5 h-3.5 text-indigo-500" />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                Filters
              </h4>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-[#1A3263] bg-[#F1F5F9] border border-slate-200/50 rounded-lg px-2.5 py-1 uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
            <span>บทบาทผู้ใช้: {user.role === 'BRANCH_MANAGER' ? 'BranchManager' : user.role === 'CREDIT' ? 'CreditAnalyst' : user.role === 'SA' ? 'ServiceAdvisor' : user.role}</span>
          </div>
        </div>

        {/* Row 2: Checkbox multi-select dropdown panels */}
        {(() => {
          // Helper label getters for multi-select checklist triggers inside render
          const getBranchManagerLabel = () => {
            if (selectedBranchManagers.length === 0) return 'เลือกผู้จัดการ (0)';
            if (selectedBranchManagers.length === 2) return 'ผู้จัดการทุกคน (All)';
            return selectedBranchManagers.join(', ');
          };

          const getBranchLabel = () => {
            if (selectedBranches.length === 0) return 'เลือกสาขา (0)';
            if (selectedBranches.length === 4) return 'ทุกสาขา (All)';
            return selectedBranches.map(b => {
              if (b === 'KhonKaen-Branch') return 'Khon Kaen Branch (KK)';
              if (b === 'KM (Kamphaeng Phet Branch)') return 'KM (Kamphaeng Phet Branch)';
              if (b === 'Bangna-Tr') return 'Bangna-Tr Branch (BT)';
              if (b === 'EngineStore') return 'EngineStore Branch (ES)';
              return b;
            }).join(', ');
          };

          const getBULabel = () => {
            if (selectedBUs.length === 0) return 'เลือกแผนก (0)';
            if (selectedBUs.length === 3) return 'ทุกแผนก (All)';
            return selectedBUs.map(bu => {
              if (bu === 'Parts & Service CI') return 'Parts & Service CI';
              if (bu === 'Machine Sales BU') return 'Machine Sales BU';
              if (bu === 'Engine Sales BU') return 'Engine Sales BU';
              return bu;
            }).join(', ');
          };

          const getSalesmanLabel = () => {
            if (selectedSalesmen.length === 0) return 'พนักงานทุกคน (All)';
            if (selectedSalesmen.length === salesmenList.length) return 'พนักงานทุกคน (All)';
            if (selectedSalesmen.length <= 2) {
              return selectedSalesmen.map(id => {
                const sm = salesmenList.find(s => s.id === id);
                return sm ? sm.name.split(' (')[0] : id;
              }).join(', ');
            }
            return `เลือกแล้ว ${selectedSalesmen.length} คน`;
          };

          // Toggler Helper functions for checkbox selections
          const toggleBranchManager = (name: string) => {
            setSelectedBranchManagers(prev => {
              const next = prev.includes(name) 
                ? prev.filter(m => m !== name) 
                : [...prev, name];
              
              let nextBranches = [...selectedBranches];
              if (name === 'Mr. SAKSRI HONGKHAMJAN') {
                if (next.includes(name)) {
                  if (!nextBranches.includes('KhonKaen-Branch')) nextBranches.push('KhonKaen-Branch');
                } else {
                  nextBranches = nextBranches.filter(b => b !== 'KhonKaen-Branch');
                }
              } else if (name === 'NARAKON SRITOOMMA') {
                if (next.includes(name)) {
                  if (!nextBranches.includes('KM (Kamphaeng Phet Branch)')) nextBranches.push('KM (Kamphaeng Phet Branch)');
                } else {
                  nextBranches = nextBranches.filter(b => b !== 'KM (Kamphaeng Phet Branch)');
                }
              }
              setSelectedBranches(nextBranches);
              return next;
            });
          };

          const toggleAllManagers = () => {
            const allList = ['Mr. SAKSRI HONGKHAMJAN', 'NARAKON SRITOOMMA'];
            if (selectedBranchManagers.length === allList.length) {
              setSelectedBranchManagers([]);
              setSelectedBranches(prev => prev.filter(b => b !== 'KhonKaen-Branch' && b !== 'KM (Kamphaeng Phet Branch)'));
            } else {
              setSelectedBranchManagers(allList);
              setSelectedBranches(prev => {
                const next = [...prev];
                if (!next.includes('KhonKaen-Branch')) next.push('KhonKaen-Branch');
                if (!next.includes('KM (Kamphaeng Phet Branch)')) next.push('KM (Kamphaeng Phet Branch)');
                return next;
              });
            }
          };

          const toggleBranch = (branch: string) => {
            setSelectedBranches(prev => {
              const next = prev.includes(branch)
                ? prev.filter(b => b !== branch)
                : [...prev, branch];
              
              let nextManagers = [...selectedBranchManagers];
              if (branch === 'KhonKaen-Branch') {
                if (next.includes(branch)) {
                  if (!nextManagers.includes('Mr. SAKSRI HONGKHAMJAN')) nextManagers.push('Mr. SAKSRI HONGKHAMJAN');
                } else {
                  nextManagers = nextManagers.filter(m => m !== 'Mr. SAKSRI HONGKHAMJAN');
                }
              }
              if (branch === 'KM (Kamphaeng Phet Branch)') {
                if (next.includes(branch)) {
                  if (!nextManagers.includes('NARAKON SRITOOMMA')) nextManagers.push('NARAKON SRITOOMMA');
                } else {
                  nextManagers = nextManagers.filter(m => m !== 'NARAKON SRITOOMMA');
                }
              }
              setSelectedBranchManagers(nextManagers);
              return next;
            });
          };

          const toggleAllBranches = () => {
            const allList = ['KhonKaen-Branch', 'KM (Kamphaeng Phet Branch)', 'Bangna-Tr', 'EngineStore'];
            if (selectedBranches.length === allList.length) {
              setSelectedBranches([]);
              setSelectedBranchManagers([]);
            } else {
              setSelectedBranches(allList);
              setSelectedBranchManagers(['Mr. SAKSRI HONGKHAMJAN', 'NARAKON SRITOOMMA']);
            }
          };

          const toggleBU = (bu: string) => {
            if (user.role === 'SA') return;
            setSelectedBUs(prev => prev.includes(bu) ? prev.filter(item => item !== bu) : [...prev, bu]);
          };

          const toggleAllBUs = () => {
            if (user.role === 'SA') return;
            const allList = ['Parts & Service CI', 'Machine Sales BU', 'Engine Sales BU'];
            if (selectedBUs.length === allList.length) {
              setSelectedBUs([]);
            } else {
              setSelectedBUs(allList);
            }
          };

          const toggleSalesman = (id: string) => {
            setSelectedSalesmen(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
          };

          const toggleAllSalesmen = () => {
            const allIds = salesmenList.map(s => s.id);
            if (selectedSalesmen.length === allIds.length || selectedSalesmen.length === 0) {
              setSelectedSalesmen([]);
            } else {
              setSelectedSalesmen(allIds);
            }
          };

          return (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 relative">
              
              {/* BRANCH MANAGER Dropdown */}
              <div className="flex flex-col relative multiselect-container">
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Branch manager</span>
                  <span className="text-[9px] font-extrabold text-indigo-500 font-sans tracking-tight">
                    ({selectedBranchManagers.length} selected)
                  </span>
                </span>
                <button
                  type="button"
                  id="branch-manager-multiselect-btn"
                  onClick={() => setActiveDropdown(activeDropdown === 'manager' ? null : 'manager')}
                  className="text-xs font-bold bg-[#FAFBFD] border border-[#E2E8F0] hover:border-indigo-200 rounded-lg px-3 py-2 text-slate-700 flex justify-between items-center transition duration-150 cursor-pointer min-h-[34px] w-full text-left"
                >
                  <span className="truncate pr-2">{getBranchManagerLabel()}</span>
                  <span className={`transition-transform duration-200 text-slate-400 text-[10px] ${activeDropdown === 'manager' ? 'rotate-180' : ''}`}>▼</span>
                </button>
                {activeDropdown === 'manager' && (
                  <div className="absolute top-[52px] left-0 w-full bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1.5 max-h-52 overflow-y-auto animate-fade-in divide-y divide-slate-100">
                    <div className="px-1.5 pb-1">
                      <label className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg cursor-pointer hover:bg-slate-50 transition text-xs font-extrabold text-slate-700">
                        <input 
                          type="checkbox"
                          checked={selectedBranchManagers.length === 2}
                          onChange={toggleAllManagers}
                          className="w-3.5 h-3.5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 transition"
                        />
                        <span>เลือกทั้งหมด (All managers)</span>
                      </label>
                    </div>
                    <div className="px-1.5 pt-1 flex flex-col gap-0.5">
                      <label className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg cursor-pointer hover:bg-slate-50 transition text-xs font-bold text-slate-700">
                        <input 
                          type="checkbox"
                          checked={selectedBranchManagers.includes('Mr. SAKSRI HONGKHAMJAN')}
                          onChange={() => toggleBranchManager('Mr. SAKSRI HONGKHAMJAN')}
                          className="w-3.5 h-3.5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 transition"
                        />
                        <span>Mr. SAKSRI HONGKHAMJAN</span>
                      </label>
                      <label className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg cursor-pointer hover:bg-slate-50 transition text-xs font-bold text-slate-700">
                        <input 
                          type="checkbox"
                          checked={selectedBranchManagers.includes('NARAKON SRITOOMMA')}
                          onChange={() => toggleBranchManager('NARAKON SRITOOMMA')}
                          className="w-3.5 h-3.5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 transition"
                        />
                        <span>NARAKON SRITOOMMA</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* BRANCH Dropdown */}
              <div className="flex flex-col relative multiselect-container">
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Branch</span>
                  <span className="text-[9px] font-extrabold text-indigo-500 font-sans tracking-tight">
                    ({selectedBranches.length} selected)
                  </span>
                </span>
                <button
                  type="button"
                  id="branch-multiselect-btn"
                  onClick={() => setActiveDropdown(activeDropdown === 'branch' ? null : 'branch')}
                  className="text-xs font-bold bg-[#FAFBFD] border border-[#E2E8F0] hover:border-indigo-200 rounded-lg px-3 py-2 text-slate-700 flex justify-between items-center transition duration-150 cursor-pointer min-h-[34px] w-full text-left"
                >
                  <span className="truncate pr-2">{getBranchLabel()}</span>
                  <span className={`transition-transform duration-200 text-slate-400 text-[10px] ${activeDropdown === 'branch' ? 'rotate-180' : ''}`}>▼</span>
                </button>
                {activeDropdown === 'branch' && (
                  <div className="absolute top-[52px] left-0 w-full bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1.5 max-h-60 overflow-y-auto animate-fade-in divide-y divide-slate-100">
                    <div className="px-1.5 pb-1">
                      <label className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg cursor-pointer hover:bg-slate-50 transition text-xs font-extrabold text-slate-700">
                        <input 
                          type="checkbox"
                          checked={selectedBranches.length === 4}
                          onChange={toggleAllBranches}
                          className="w-3.5 h-3.5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 transition"
                        />
                        <span>ทุกสาขา (All branches)</span>
                      </label>
                    </div>
                    <div className="px-1.5 pt-1 flex flex-col gap-0.5">
                      <label className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg cursor-pointer hover:bg-slate-50 transition text-xs font-bold text-slate-700">
                        <input 
                          type="checkbox"
                          checked={selectedBranches.includes('KhonKaen-Branch')}
                          onChange={() => toggleBranch('KhonKaen-Branch')}
                          className="w-3.5 h-3.5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 transition"
                        />
                        <span>Khon Kaen Branch (KK)</span>
                      </label>
                      <label className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg cursor-pointer hover:bg-slate-50 transition text-xs font-bold text-slate-700">
                        <input 
                          type="checkbox"
                          checked={selectedBranches.includes('KM (Kamphaeng Phet Branch)')}
                          onChange={() => toggleBranch('KM (Kamphaeng Phet Branch)')}
                          className="w-3.5 h-3.5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 transition"
                        />
                        <span>KM (Kamphaeng Phet Branch)</span>
                      </label>
                      <label className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg cursor-pointer hover:bg-slate-50 transition text-xs font-bold text-slate-700">
                        <input 
                          type="checkbox"
                          checked={selectedBranches.includes('Bangna-Tr')}
                          onChange={() => toggleBranch('Bangna-Tr')}
                          className="w-3.5 h-3.5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 transition"
                        />
                        <span>Bangna-Tr Branch (BT)</span>
                      </label>
                      <label className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg cursor-pointer hover:bg-slate-50 transition text-xs font-bold text-slate-700">
                        <input 
                          type="checkbox"
                          checked={selectedBranches.includes('EngineStore')}
                          onChange={() => toggleBranch('EngineStore')}
                          className="w-3.5 h-3.5 rounded text-[#FFC50C] focus:ring-[#FFC50C] border-slate-300 transition"
                        />
                        <span>EngineStore Branch (ES)</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* BU (BUSINESS UNIT) Dropdown */}
              <div className="flex flex-col relative multiselect-container">
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Business unit</span>
                  {user.role !== 'SA' && (
                    <span className="text-[9px] font-extrabold text-indigo-500 font-sans tracking-tight">
                      ({selectedBUs.length} selected)
                    </span>
                  )}
                </span>
                <button
                  type="button"
                  id="bu-multiselect-btn"
                  disabled={user.role === 'SA'}
                  onClick={() => setActiveDropdown(activeDropdown === 'bu' ? null : 'bu')}
                  className={`text-xs font-bold border border-[#E2E8F0] hover:border-indigo-200 rounded-lg px-3 py-2 text-slate-700 flex justify-between items-center transition duration-150 min-h-[34px] w-full text-left ${user.role === 'SA' ? 'bg-gray-150 opacity-85 cursor-not-allowed text-gray-500' : 'bg-[#FAFBFD] hover:border-indigo-200 cursor-pointer'}`}
                >
                  <span className="truncate pr-2">{getBULabel()}</span>
                  {user.role !== 'SA' && (
                    <span className={`transition-transform duration-200 text-slate-400 text-[10px] ${activeDropdown === 'bu' ? 'rotate-180' : ''}`}>▼</span>
                  )}
                </button>
                {activeDropdown === 'bu' && user.role !== 'SA' && (
                  <div className="absolute top-[52px] left-0 w-full bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1.5 max-h-60 overflow-y-auto animate-fade-in divide-y divide-slate-100">
                    <div className="px-1.5 pb-1">
                      <label className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg cursor-pointer hover:bg-slate-50 transition text-xs font-extrabold text-slate-700">
                        <input 
                          type="checkbox"
                          checked={selectedBUs.length === 3}
                          onChange={toggleAllBUs}
                          className="w-3.5 h-3.5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 transition"
                        />
                        <span>ทุกแผนก (All business units)</span>
                      </label>
                    </div>
                    <div className="px-1.5 pt-1 flex flex-col gap-0.5">
                      <label className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg cursor-pointer hover:bg-slate-50 transition text-xs font-bold text-slate-700">
                        <input 
                          type="checkbox"
                          checked={selectedBUs.includes('Parts & Service CI')}
                          onChange={() => toggleBU('Parts & Service CI')}
                          className="w-3.5 h-3.5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 transition"
                        />
                        <span>Parts & Service CI</span>
                      </label>
                      <label className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg cursor-pointer hover:bg-slate-50 transition text-xs font-bold text-slate-700">
                        <input 
                          type="checkbox"
                          checked={selectedBUs.includes('Machine Sales BU')}
                          onChange={() => toggleBU('Machine Sales BU')}
                          className="w-3.5 h-3.5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 transition"
                        />
                        <span>Machine Sales BU</span>
                      </label>
                      <label className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg cursor-pointer hover:bg-slate-50 transition text-xs font-bold text-slate-700">
                        <input 
                          type="checkbox"
                          checked={selectedBUs.includes('Engine Sales BU')}
                          onChange={() => toggleBU('Engine Sales BU')}
                          className="w-3.5 h-3.5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 transition"
                        />
                        <span>Engine Sales BU</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* SALESMAN DROPDOWN */}
              <div className="flex flex-col relative multiselect-container mb-0.5">
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Salesman status</span>
                  <span className="text-[9px] font-extrabold text-indigo-500 font-sans tracking-tight font-mono">
                    ({selectedSalesmen.length === 0 ? 'All' : `${selectedSalesmen.length} selected`})
                  </span>
                </span>
                <button
                  type="button"
                  id="salesman-multiselect-btn"
                  onClick={() => setActiveDropdown(activeDropdown === 'salesman' ? null : 'salesman')}
                  className="text-xs font-bold bg-[#FAFBFD] border border-[#E2E8F0] hover:border-indigo-200 rounded-lg px-3 py-2 text-slate-700 flex justify-between items-center transition duration-150 cursor-pointer min-h-[34px] w-full text-left"
                >
                  <span className="truncate pr-2">{getSalesmanLabel()}</span>
                  <span className={`transition-transform duration-200 text-slate-400 text-[10px] ${activeDropdown === 'salesman' ? 'rotate-180' : ''}`}>▼</span>
                </button>
                {activeDropdown === 'salesman' && (
                  <div className="absolute top-[52px] right-0 w-[240px] bg-white border border-slate-200 rounded-xl shadow-xl z-50 animate-fade-in flex flex-col overflow-hidden max-h-72">
                    
                    {/* Search box inside salesman list */}
                    <div className="p-2 border-b border-slate-100 bg-slate-50">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 w-3 h-3 text-slate-400" />
                        <input
                          type="text"
                          id="salesman-filter-search"
                          placeholder="ค้นหาพนักงานขาย..."
                          value={salesmanFilterSearch}
                          onChange={(e) => setSalesmanFilterSearch(e.target.value)}
                          className="w-full text-xs font-medium border border-slate-200 rounded px-2.5 py-1.5 pl-7 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
                        />
                      </div>
                    </div>

                    <div className="overflow-y-auto divide-y divide-slate-100 max-h-56 flex-1">
                      <div className="px-1.5 py-1">
                        <label className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg cursor-pointer hover:bg-slate-50 transition text-xs font-extrabold text-slate-700">
                          <input 
                            type="checkbox"
                            checked={selectedSalesmen.length === 0 || selectedSalesmen.length === salesmenList.length}
                            onChange={toggleAllSalesmen}
                            className="w-3.5 h-3.5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 transition"
                          />
                          <span>พนักงานทุกคน (All salesmen)</span>
                        </label>
                      </div>
                      <div className="px-1.5 py-1 flex flex-col gap-0.5">
                        {salesmenList
                          .filter(sm => {
                            if (!salesmanFilterSearch) return true;
                            return sm.name.toLowerCase().includes(salesmanFilterSearch.toLowerCase()) || 
                                   sm.id.toLowerCase().includes(salesmanFilterSearch.toLowerCase());
                          })
                          .map(sm => (
                            <label key={sm.id} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg cursor-pointer hover:bg-slate-50 transition text-xs font-bold text-slate-700">
                              <input 
                                type="checkbox"
                                checked={selectedSalesmen.includes(sm.id)}
                                onChange={() => toggleSalesman(sm.id)}
                                className="w-3.5 h-3.5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 transition"
                              />
                              <span className="truncate">[{sm.id}] {sm.name.split(' (')[0]}</span>
                            </label>
                          ))
                        }
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>
          );
        })()}
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
                <span className="text-[18px] sm:text-[22px] md:text-[26px] lg:text-[22px] xl:text-[17px] 2xl:text-[22px] font-extrabold text-[#1A3263] font-sans tracking-tight block truncate" title={formatCurrency(aggregates.total)}>
                  {formatCurrency(aggregates.total)}
                </span>
                <span className="text-[10px] 2xl:text-[11px] font-extrabold text-[#1A3263]/60 mt-1.5 uppercase tracking-wider block">บาท (Baht)</span>
              </div>
            </div>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-[#1A3263] shrink-0 border border-indigo-100/30">
              <Scale className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
          </div>
          
          <div className="mt-3 pt-2 border-t border-slate-100 flex flex-col gap-0.5 z-10">
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
                  {aggregates.currentInvoices}
                </span>
                <span className="text-[10px] 2xl:text-[11px] font-extrabold text-emerald-600/70 mt-1.5 uppercase tracking-wider block">รายการ (Invoices)</span>
              </div>
            </div>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 border border-emerald-100/30">
              <FileText className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
          </div>
          
          <div className="mt-3 pt-2 border-t border-slate-100 flex flex-col gap-0.5 z-10 font-sans">
            <div className="flex items-center justify-between text-[10px] 2xl:text-[11px] font-bold text-slate-500">
              <span>สถานะใบแจ้งหนี้</span>
              <span className="text-[#15803d] font-black bg-emerald-50 px-1 py-0.5 rounded text-[10px]">ปกติ (NOT DUE)</span>
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
                <span className="text-[18px] sm:text-[22px] md:text-[26px] lg:text-[22px] xl:text-[17px] 2xl:text-[22px] font-extrabold text-emerald-600 font-sans tracking-tight block truncate" title={formatCurrency(aggregates.notDue)}>
                  {formatCurrency(aggregates.notDue)}
                </span>
                <span className="text-[10px] 2xl:text-[11px] font-extrabold text-emerald-600/70 mt-1.5 uppercase tracking-wider block">บาท (Baht)</span>
              </div>
            </div>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 border border-emerald-100/30">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          
          <div className="mt-3 pt-2 border-t border-slate-100 flex flex-col gap-1 z-10">
            <div className="flex items-center justify-between text-[10px] 2xl:text-[11px] font-bold text-slate-500">
              <span>สัดส่วน: <span className="text-[#15803d] font-extrabold">{percent_notDue}%</span></span>
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
                  {aggregates.overdueInvoices}
                </span>
                <span className="text-[10px] 2xl:text-[11px] font-extrabold text-rose-600/70 mt-1.5 uppercase tracking-wider block">รายการ (Invoices)</span>
              </div>
            </div>
            <div className="w-7 h-7 rounded-lg bg-rose-50 flex items-center justify-center text-rose-500 shrink-0 border border-rose-100/30">
              <AlertCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          
          <div className="mt-3 pt-2 border-t border-slate-100 flex flex-col gap-0.5 z-10 font-sans">
            <div className="flex items-center justify-between text-[10px] 2xl:text-[11px] font-bold text-slate-500">
              <span>สถานะใบแจ้งหนี้</span>
              <span className="text-rose-700 font-black bg-rose-50 px-1 py-0.5 rounded animate-pulse text-[10px]">เกินกำหนด (OVERDUE)</span>
            </div>
          </div>
          
          {/* Subtle color stripe at the bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-rose-400"></div>
        </div>

        {/* Card 5: Overdue Balance (ยอดเกินกำหนดสะสม) */}
        <div className="bg-white rounded-xl p-3 2xl:p-4 shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden min-h-[145px] transition-all duration-200 hover:shadow-md">
          <div className="flex justify-between items-start gap-1">
            <div className="flex-1 min-w-0">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] 2xl:text-[11px] font-extrabold text-slate-800 leading-tight">ยอดเกินกำหนดสะสม</span>
                <span className="text-[8px] 2xl:text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">OVERDUE BALANCE</span>
              </div>
              <div className="flex flex-col mt-2 min-w-0 leading-none">
                <span className="text-[18px] sm:text-[22px] md:text-[26px] lg:text-[22px] xl:text-[17px] 2xl:text-[22px] font-extrabold text-rose-600 font-sans tracking-tight block truncate" title={formatCurrency(aggregates.total - aggregates.notDue)}>
                  {formatCurrency(aggregates.total - aggregates.notDue)}
                </span>
                <span className="text-[10px] 2xl:text-[11px] font-extrabold text-rose-600/70 mt-1.5 uppercase tracking-wider block">บาท (Baht)</span>
              </div>
            </div>
            <div className="w-7 h-7 rounded-lg bg-rose-50 flex items-center justify-center text-rose-500 shrink-0 border border-rose-100/30">
              <AlertCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          
          <div className="mt-3 pt-2 border-t border-slate-100 flex flex-col gap-1 z-10">
            <div className="flex items-center justify-between text-[10px] 2xl:text-[11px] font-bold text-slate-500">
              <span>สัดส่วน: <span className="text-[#991b1b] font-extrabold">{percent_overdue}%</span></span>
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

      {/* Main Graph Card */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-gray-100 gap-4 mb-6">
          <div>
            <h3 className="text-sm font-bold text-[#1A3263] uppercase tracking-wider flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#FFC50C]" /> Portfolio Aging Debt Distribution
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">แบ่งกลุ่มเจ้าหนี้ลูกหนี้ และระยะเวลาค้างชำระ (หน่วยบาท)</p>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs select-none">
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#547792] rounded-full"></span> Not Due</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#FFC50C] rounded-full"></span> 1-30D</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#1A3263] rounded-full"></span> 31-60D</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#4F709C] rounded-full"></span> 61-90D</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#6366F1] rounded-full"></span> 91-120D</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#A855F7] rounded-full"></span> 121-150D</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#F97316] rounded-full"></span> 151-180D</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#DC2626] rounded-full"></span> 180D+</span>
          </div>
        </div>

        {/* Dynamic Bespoke SVG Bar Chart */}
        <div className="w-full h-72">
          <svg className="w-full h-full animate-fade-in" viewBox="0 0 850 240" preserveAspectRatio="none">
            {/* Grid Lines */}
            <line x1="50" y1="30" x2="810" y2="30" stroke="#EBECF0" strokeWidth="1" strokeDasharray="3" />
            <line x1="50" y1="80" x2="810" y2="80" stroke="#EBECF0" strokeWidth="1" strokeDasharray="3" />
            <line x1="50" y1="130" x2="810" y2="130" stroke="#EBECF0" strokeWidth="1" strokeDasharray="3" />
            <line x1="50" y1="180" x2="810" y2="180" stroke="#EBECF0" strokeWidth="1" />

            {/* Helper formatter inside SVG */}
            {(() => {
              const formatGraphValue = (val: number) => {
                if (val === 0) return '0';
                if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
                if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
                return val.toString();
              };

              // Map each category's parameters
              const barsData = [
                { value: aggregates.notDue, color: '#547792', hoverColor: '#415D73', label: 'Not Due', subLabel: 'ยังไม่กำหนด' },
                { value: aggregates.overdue_1_30, color: '#FFC50C', hoverColor: '#E5B10B', label: '1-30D', subLabel: 'ค้าง 1-30 วัน' },
                { value: aggregates.overdue_31_60, color: '#1A3263', hoverColor: '#0F1E3D', label: '31-60D', subLabel: 'ค้าง 31-60 วัน' },
                { value: aggregates.overdue_61_90, color: '#4F709C', hoverColor: '#3B5475', label: '61-90D', subLabel: 'ค้าง 61-90 วัน' },
                { value: aggregates.overdue_91_120, color: '#6366F1', hoverColor: '#4F46E5', label: '91-120D', subLabel: 'ค้าง 91-120 วัน' },
                { value: aggregates.overdue_121_150, color: '#A855F7', hoverColor: '#9333EA', label: '121-150D', subLabel: 'ค้าง 121-150 วัน' },
                { value: aggregates.overdue_151_180, color: '#F97316', hoverColor: '#EA580C', label: '151-180D', subLabel: 'ค้าง 151-180 วัน' },
                { value: aggregates.overdue_180plus, color: '#DC2626', hoverColor: '#B91C1C', label: '180D+', subLabel: 'ค้างเกิน 180 วัน', isDanger: true },
              ];

              return barsData.map((b, i) => {
                const x = 65 + i * 94;
                const rectWidth = 42;
                const barHeight = (b.value / maxAgingValue) * 140;
                const y = 180 - barHeight;
                const labelY = 170 - barHeight;
                const midX = x + (rectWidth / 2);

                return (
                  <g key={i} className="cursor-pointer group select-none">
                    <rect
                      x={x}
                      y={y}
                      width={rectWidth}
                      height={barHeight}
                      fill={b.color}
                      rx="4"
                      className="transition-all duration-200"
                      style={{ transformOrigin: `${midX}px 180px` }}
                    />
                    {/* Amount Label */}
                    <text
                      x={midX}
                      y={labelY}
                      textAnchor="middle"
                      className={`text-[10px] font-bold font-mono ${b.isDanger ? 'fill-red-600' : 'fill-[#1A3263]'}`}
                    >
                      {formatGraphValue(b.value)}
                    </text>
                    {/* Category Column Label */}
                    <text
                      x={midX}
                      y="196"
                      textAnchor="middle"
                      className={`text-[10px] font-extrabold ${b.isDanger ? 'fill-red-600' : 'fill-slate-600'}`}
                    >
                      {b.label}
                    </text>
                    {/* Sub-label */}
                    <text
                      x={midX}
                      y="210"
                      textAnchor="middle"
                      className={`text-[9px] ${b.isDanger ? 'fill-red-500 font-bold' : 'fill-slate-400 font-semibold'}`}
                    >
                      {b.subLabel}
                    </text>
                  </g>
                );
              });
            })()}
          </svg>
        </div>
      </div>

      {/* FILTER CONTROL PANEL BAR */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-2 text-xs font-extrabold text-[#1A3263] uppercase tracking-wider">
            <Filter className="w-4 h-4 text-[#FFC50C]" />
            <span>Interactive filters & controls</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Region Selector */}
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="text-xs bg-gray-50 text-[#1A3263] font-bold border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#FFC50C]"
            >
              {regions.map(r => (
                <option key={r} value={r}>{r === 'ALL REGIONS' ? 'All regions' : `Region: ${r}`}</option>
              ))}
            </select>

            {/* Branch Selector */}
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="text-xs bg-gray-50 text-[#1A3263] font-bold border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#FFC50C]"
            >
              {branches.map(b => (
                <option key={b} value={b}>{b === 'ALL BRANCHES' ? 'All branches' : `Branch: ${b}`}</option>
              ))}
            </select>

            {/* Sales Representative Filter DROPDOWN (Explicitly Requested Requirement 1) */}
            <select
              value={selectedSalesmanFilter}
              onChange={(e) => setSelectedSalesmanFilter(e.target.value)}
              className="text-xs bg-[#FFC50C]/10 text-[#1A3263] font-extrabold border border-[#FFC50C]/20 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#FFC50C]"
            >
              <option value="ALL SALESMEN">Filter by salesman (เลือกตามพนักงานขาย)</option>
              {salesmenList.map(sm => (
                <option key={sm.id} value={sm.id}>[{sm.id}] {sm.name}</option>
              ))}
            </select>

            {/* Reset Filters */}
            {(selectedRegion !== 'ALL REGIONS' || selectedBranch !== 'ALL BRANCHES' || selectedSalesmanFilter !== 'ALL SALESMEN') && (
              <button
                onClick={() => {
                  setSelectedRegion('ALL REGIONS');
                  setSelectedBranch('ALL BRANCHES');
                  setSelectedSalesmanFilter('ALL SALESMEN');
                }}
                className="text-[10px] font-bold text-red-600 hover:underline px-2"
              >
                Reset filters
              </button>
            )}
          </div>
        </div>

        {/* Live Search and status filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-100">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="w-4 h-4 text-slate-400" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหารหัส หรือชื่อลูกค้า..."
              className="w-full text-xs font-semibold pl-9 pr-4 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-1 focus:ring-[#FFC50C] text-slate-800"
            />
          </div>

          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="w-4 h-4 text-slate-400" />
            </span>
            <input
              type="text"
              value={salesmanQuery}
              onChange={(e) => setSalesmanQuery(e.target.value)}
              placeholder="ค้นหาชื่อ หรือรหัสพนักงานขาย..."
              className="w-full text-xs font-semibold pl-9 pr-4 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-1 focus:ring-[#FFC50C] text-slate-800"
            />
          </div>
        </div>
      </div>

      {/* SALESMEN STATUS SECTION (Requirement 1: ส่วนของระดับ line สถานะการชำระเงินรายบุคคลของ sale man) */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header container styled beautifully like the mockup */}

        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500 border border-indigo-100/50">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800 tracking-tight">
                สรุปผลพนักงานขายรายบุคคล (Salesman status)
              </h4>
              <p className="text-[10px] text-gray-400 font-semibold mt-0.5">ตารางประเมินผลยอดหนี้เสียและการค้างชำระแยกละเอียดตามพนักงานขาย</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto hidden lg:block">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="border-b border-slate-200 text-[10px] uppercase tracking-wider font-extrabold text-slate-400 bg-[#F8F9FB]">
                <th className="py-3 px-4 text-left">Salesman code</th>
                <th className="py-3 px-4 text-left">Salesman name</th>
                <th className="py-3 px-3 text-right">Balance</th>
                <th className="py-3 px-3 text-right">Current</th>
                <th className="py-3 px-3 text-right">1-30D</th>
                <th className="py-3 px-3 text-right">31-60D</th>
                <th className="py-3 px-3 text-right">61-90D</th>
                <th className="py-3 px-3 text-right">91-120D</th>
                <th className="py-3 px-3 text-right">121-150D</th>
                <th className="py-3 px-3 text-right">151-180D</th>
                <th className="py-3 px-3 text-right">180D+</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-600 font-medium">
              
              {/* Totals cumulative summary row at the top matching mockup format */}
              {salesmenSummary.length > 0 && (
                <tr className="bg-[#FAFBFD] font-bold border-b border-slate-150 hover:bg-[#E8E2DB]/10 transition-colors">
                  <td className="py-3 px-4 text-slate-500 font-mono text-[10px] select-none">
                    All
                  </td>
                  <td className="py-3 px-4 text-slate-800 text-[11px] font-extrabold flex items-center gap-1.5 tracking-tight">
                    <span className="text-indigo-600 font-bold">▼</span>
                    <span>All salesmen</span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    {formatCellAmount(salesmenTotals.totalOutstanding)}
                  </td>
                  <td className="py-3 px-3 text-right">
                    {formatCellAmount(salesmenTotals.notDue, true)}
                  </td>
                  <td className="py-3 px-3 text-right">
                    {formatCellAmount(salesmenTotals.overdue_1_30)}
                  </td>
                  <td className="py-3 px-3 text-right">
                    {formatCellAmount(salesmenTotals.overdue_31_60)}
                  </td>
                  <td className="py-3 px-3 text-right">
                    {formatCellAmount(salesmenTotals.overdue_61_90)}
                  </td>
                  <td className="py-3 px-3 text-right">
                    {formatCellAmount(salesmenTotals.overdue_91_120)}
                  </td>
                  <td className="py-3 px-3 text-right">
                    {formatCellAmount(salesmenTotals.overdue_121_150)}
                  </td>
                  <td className="py-3 px-3 text-right">
                    {formatCellAmount(salesmenTotals.overdue_151_180)}
                  </td>
                  <td className="py-3 px-3 text-right">
                    {formatCellAmount(salesmenTotals.overdue_180plus, false, true)}
                  </td>
                  <td className="py-3 px-4 text-center text-slate-400 text-[10px] font-bold">
                    สะสมรวม {salesmenSummary.length} คน
                  </td>
                </tr>
              )}

              {/* Individual Salesman Rows */}
              {salesmenSummary.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-8 text-center text-gray-400 font-semibold uppercase text-[10px]">
                    ไม่พบพนักงานขายตามคำค้นหา
                  </td>
                </tr>
              ) : (
                paginatedSalesmenSummary.map(sm => {
                  const { thaiName, engName } = splitName(sm.name);
                  return (
                    <tr key={sm.id} className="hover:bg-[#E8E2DB]/10 transition-colors text-[11px] border-b border-slate-100">
                      <td className="py-2.5 px-4 text-slate-600 font-mono font-bold">
                        {sm.id}
                      </td>
                      <td className="py-2 px-4 text-slate-800 max-w-[240px]">
                        <div className="flex flex-col text-left">
                          <span className="font-extrabold text-slate-800">{thaiName}</span>
                          {engName && <span className="text-[10px] text-slate-400 font-semibold mt-0.5">{engName}</span>}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {formatCellAmount(sm.filteredOutstanding)}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {formatCellAmount(sm.notDue, true)}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {formatCellAmount(sm.overdue_1_30)}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {formatCellAmount(sm.overdue_31_60)}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {formatCellAmount(sm.overdue_61_90)}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {formatCellAmount(sm.overdue_91_120)}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {formatCellAmount(sm.overdue_121_150)}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {formatCellAmount(sm.overdue_151_180)}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {formatCellAmount(sm.overdue_180plus, false, true)}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        {/* View Details clickable button in vibrant brand yellow/gold */}
                        <button
                          onClick={() => onSelectSalesman(sm.id)}
                          className="bg-[#FFC50C] hover:bg-[#E5B10B] text-[#1A3263] transition-all text-[10px] font-extrabold px-3 py-1 rounded-lg cursor-pointer shadow-sm active:scale-95 inline-flex items-center"
                        >
                          <span>View Details</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View: Shows nice cards instead of a wide cut-off table for screens < 1024px */}
        <div className="block lg:hidden divide-y divide-slate-100">
          {/* Totals cumulative summary card */}
          {salesmenSummary.length > 0 && (
            <div className="p-4 bg-[#FAFBFD] font-bold border-b border-slate-150">
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-800 text-[11px] font-extrabold flex items-center gap-1">
                  <span className="text-indigo-600 font-bold">▼</span>
                  <span>All Salesman</span>
                </span>
                <span className="text-[9px] text-slate-400 font-bold">สะสม {salesmenSummary.length} คน</span>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2 text-[11px]">
                <div className="bg-white p-2 rounded border border-slate-100">
                  <div className="text-slate-400 font-bold text-[8px] uppercase">Balance ทั้งหมด</div>
                  <div className="text-[#1A3263] font-black text-xs">{formatCellAmount(salesmenTotals.totalOutstanding)}</div>
                </div>
                <div className="bg-white p-2 rounded border border-slate-100">
                  <div className="text-emerald-500 font-bold text-[8px] uppercase">Current ทั้งหมด</div>
                  <div className="text-emerald-600 font-black text-xs">{formatCellAmount(salesmenTotals.notDue, true)}</div>
                </div>
              </div>
              <div className="mt-2 p-2.5 bg-white rounded border border-slate-100">
                <div className="text-slate-400 font-bold text-[8px] uppercase mb-1.5 label text-left">ยอดค้างชำระทั้งหมดตามอายุหนี้</div>
                <div className="grid grid-cols-2 gap-y-1 gap-x-2 text-[10px] text-left">
                  <div><span className="font-semibold text-slate-400">1-30D:</span> {formatCellAmount(salesmenTotals.overdue_1_30)}</div>
                  <div><span className="font-semibold text-slate-400">31-60D:</span> {formatCellAmount(salesmenTotals.overdue_31_60)}</div>
                  <div><span className="font-semibold text-slate-400">61-90D:</span> {formatCellAmount(salesmenTotals.overdue_61_90)}</div>
                  <div><span className="font-semibold text-slate-400">91-120D:</span> {formatCellAmount(salesmenTotals.overdue_91_120)}</div>
                  <div><span className="font-semibold text-slate-400">121-150D:</span> {formatCellAmount(salesmenTotals.overdue_121_150)}</div>
                  <div><span className="font-semibold text-slate-400">151-180D:</span> {formatCellAmount(salesmenTotals.overdue_151_180)}</div>
                  <div className="col-span-2 pt-1.5 mt-1 border-t border-slate-100 flex justify-between font-bold text-rose-500 text-[10px]">
                    <span>180D+ (หนี้เสีย):</span>
                    <span className="text-rose-600">{formatCellAmount(salesmenTotals.overdue_180plus, false, true)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {salesmenSummary.length === 0 ? (
            <div className="py-8 text-center text-gray-400 font-semibold uppercase text-[10px]">
              ไม่พบพนักงานขายตามคำค้นหา
            </div>
          ) : (
            paginatedSalesmenSummary.map(sm => {
              const { thaiName, engName } = splitName(sm.name);
              return (
                <div key={sm.id} className="p-4 bg-white hover:bg-slate-50 transition-colors border-b border-slate-100 text-left">
                  <div className="flex justify-between items-start mb-2.5 gap-2">
                    <div>
                      <div className="text-[#1A3263] font-mono text-[10px] font-bold">Code: {sm.id}</div>
                      <div className="text-[#1A3263] font-extrabold text-xs mt-0.5">{thaiName}</div>
                      {engName && <div className="text-[10px] text-slate-400 font-semibold mt-0.5">{engName}</div>}
                    </div>
                    <button
                      onClick={() => onSelectSalesman(sm.id)}
                      className="bg-[#FFC50C] hover:bg-[#E5B10B] text-[#1A3263] transition-all text-[9.5px] font-extrabold px-2.5 py-1 rounded-md shadow-xs active:scale-95 shrink-0"
                    >
                      View Details
                    </button>
                  </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] mt-1">
                  <div className="bg-slate-50/50 p-2 rounded border border-slate-100">
                    <div className="text-slate-400 font-bold text-[8px] uppercase">BALANCE</div>
                    <div className="text-slate-800 font-bold text-xs">{formatCellAmount(sm.filteredOutstanding)}</div>
                  </div>
                  <div className="bg-slate-50/50 p-2 rounded border border-slate-100">
                    <div className="text-emerald-500 font-bold text-[8px] uppercase">CURRENT</div>
                    <div className="text-emerald-600 font-bold text-xs">{formatCellAmount(sm.notDue, true)}</div>
                  </div>
                </div>

                {/* Overdue Age details breakdown */}
                <div className="mt-2.5 bg-slate-50/30 p-2.5 rounded-lg border border-slate-100/50">
                  <div className="text-slate-400 font-bold text-[8px] uppercase mb-1.5 opacity-80">ยอดค้างชำระตามอายุหนี้ (Overdue Age)</div>
                  <div className="grid grid-cols-3 gap-y-1 gap-x-2 text-[9.5px] text-slate-600">
                    <div><span className="font-semibold text-slate-400">1-30D:</span> {formatCellAmount(sm.overdue_1_30)}</div>
                    <div><span className="font-semibold text-slate-400">31-60D:</span> {formatCellAmount(sm.overdue_31_60)}</div>
                    <div><span className="font-semibold text-slate-400">61-90D:</span> {formatCellAmount(sm.overdue_61_90)}</div>
                    <div><span className="font-semibold text-slate-400">91-120D:</span> {formatCellAmount(sm.overdue_91_120)}</div>
                    <div><span className="font-semibold text-slate-400">121-150D:</span> {formatCellAmount(sm.overdue_121_150)}</div>
                    <div><span className="font-semibold text-slate-400">151-180D:</span> {formatCellAmount(sm.overdue_151_180)}</div>
                    <div className="col-span-3 mt-1.5 pt-1.5 border-t border-slate-200/50 flex justify-between font-bold text-rose-500">
                      <span>180D+ (เสี่ยงสูง):</span>
                      <span className="text-rose-600">{formatCellAmount(sm.overdue_180plus, false, true)}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
          )}
        </div>

        {/* Salesmen Pagination (10 per page) */}
        {(() => {
          const totalPages = Math.ceil(salesmenSummary.length / 10);
          if (totalPages <= 1) return null;
          return (
            <div className="flex items-center justify-between border-t border-slate-100 bg-white px-4 py-3 sm:px-6">
              {/* Mobile pagination */}
              <div className="flex flex-1 justify-between sm:hidden">
                <button
                  onClick={() => setSalesmenPage(prev => Math.max(prev - 1, 1))}
                  disabled={salesmenPage === 1}
                  className="relative inline-flex items-center rounded-md border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                >
                  ก่อนหน้า
                </button>
                <button
                  onClick={() => setSalesmenPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={salesmenPage === totalPages}
                  className="relative ml-3 inline-flex items-center rounded-md border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                >
                  ถัดไป
                </button>
              </div>
              {/* Desktop pagination */}
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-semibold gap-1 inline-flex items-center">
                    แสดงรายการพนักงานขายที่ <span className="font-bold text-[#1A3263]">{Math.min((salesmenPage - 1) * 10 + 1, salesmenSummary.length)}</span> ถึง{' '}
                    <span className="font-bold text-[#1A3263]">{Math.min(salesmenPage * 10, salesmenSummary.length)}</span> จากทั้งหมด{' '}
                    <span className="font-black text-[#1A3263]">{salesmenSummary.length}</span> คน
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md gap-1" aria-label="Salesmen Pagination">
                    <button
                      onClick={() => setSalesmenPage(prev => Math.max(prev - 1, 1))}
                      disabled={salesmenPage === 1}
                      className="relative inline-flex items-center rounded-md bg-white px-2 py-1.5 text-slate-400 ring-1 ring-inset ring-gray-200 hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none cursor-pointer transition-all"
                    >
                      <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                    </button>
                    {Array.from({ length: totalPages }).map((_, idx) => {
                      const pageNum = idx + 1;
                      const isCurrent = pageNum === salesmenPage;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setSalesmenPage(pageNum)}
                          className={`relative inline-flex items-center rounded-md px-3 py-1.5 text-xs font-bold ring-1 ring-inset transition-all cursor-pointer ${
                            isCurrent
                              ? 'z-10 bg-[#1A3263] text-white ring-transparent font-extrabold shadow-sm'
                              : 'text-slate-700 ring-gray-200 hover:bg-slate-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setSalesmenPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={salesmenPage === totalPages}
                      className="relative inline-flex items-center rounded-md bg-white px-2 py-1.5 text-slate-400 ring-1 ring-inset ring-gray-200 hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none cursor-pointer transition-all"
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

      {/* FILTER INTEGRATED CUSTOMERS DIRECTORY */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header styled exactly like the provided screenshot and mockup style */}
        <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500 border border-indigo-100/50">
              <Users className="w-4 h-4 text-indigo-500" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800 tracking-tight">
                สรุปลูกค้ารายบุคคล (Customer status){activeFilteredSalesman ? ` ของ ${activeFilteredSalesman.name.toUpperCase()} (${activeFilteredSalesman.id})` : ''}
              </h4>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {/* Inline search box for filtering individual table rows manually */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none">
                <Search className="w-3.5 h-3.5 text-slate-400" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาชื่อลูกค้า / รหัสลูกค้า..."
                className="text-xs font-semibold pl-8 pr-3 py-2 w-full sm:w-56 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-1 focus:ring-[#FFC50C] focus:bg-white transition-all text-slate-800"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto hidden lg:block">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="border-b border-gray-200 text-[10px] uppercase tracking-wider font-extrabold text-slate-500 bg-slate-50 select-none">
                <th className="py-3 px-3">Customer no.</th>
                <th className="py-3 px-4">Customer name</th>
                <th className="py-3 px-3 text-right">Balance</th>
                <th className="py-3 px-3 text-right">Current</th>
                <th className="py-3 px-3 text-right">1-30D</th>
                <th className="py-3 px-3 text-right">31-60D</th>
                <th className="py-3 px-3 text-right">61-90D</th>
                <th className="py-3 px-3 text-right">91-120D</th>
                <th className="py-3 px-3 text-right">121-150D</th>
                <th className="py-3 px-3 text-right">151-180D</th>
                <th className="py-3 px-3 text-right">180D+</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-600 font-medium">
              
              {/* Totals cumulative summary row at the top matching mockup format exactly */}
              {customersSummary.length > 0 && (
                <tr className="bg-[#FAFBFD] font-bold border-b border-slate-150 hover:bg-[#E8E2DB]/10 transition-colors">
                  <td className="py-3 px-3 text-slate-500 font-mono text-[10px] select-none font-bold text-left">
                    All
                  </td>
                  <td className="py-3 px-4 text-slate-800 text-[11px] font-extrabold flex items-center gap-1.5 tracking-tight">
                    <span className="text-indigo-600 font-bold">▼</span>
                    <span>All customers</span>
                  </td>
                  <td className="py-3 px-3 text-right">
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

              {/* Individual Customer Rows */}
              {customersSummary.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-8 text-center text-gray-400 font-semibold uppercase text-[10px]">
                    ไม่พบข้อมูลลูกค้าสำหรับฟิลเตอร์ชุดนี้
                  </td>
                </tr>
              ) : (
                paginatedCustomersSummary.map(c => (
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
                    <td className="py-2.5 px-3 text-right">
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
                      {/* View Details clickable button in gorgeous brand yellow/gold, matching user style request */}
                      <button
                        onClick={() => onSelectCustomer(c.id)}
                        className="bg-[#FFC50C] hover:bg-[#E5B10B] text-[#1A3263] transition-all text-[10px] font-extrabold px-3 py-1 rounded-lg cursor-pointer shadow-sm active:scale-95 inline-flex items-center"
                      >
                        <span>View Details</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View: Shows nice cards instead of a wide cut-off table for screens < 1024px */}
        <div className="block lg:hidden divide-y divide-slate-100">
          {/* Totals cumulative summary card */}
          {customersSummary.length > 0 && (
            <div className="p-4 bg-[#FAFBFD] font-bold border-b border-slate-150 text-left">
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-800 text-[11px] font-extrabold flex items-center gap-1">
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
              ไม่พบข้อมูลลูกค้าสำหรับฟิลเตอร์ชุดนี้
            </div>
          ) : (
            paginatedCustomersSummary.map(c => (
              <div key={c.id} className="p-4 bg-white hover:bg-slate-50 transition-colors border-b border-slate-100 text-left">
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
                    className="bg-[#FFC50C] hover:bg-[#E5B10B] text-[#1A3263] transition-all text-[9.5px] font-extrabold px-2.5 py-1 rounded-md shadow-xs active:scale-95 shrink-0"
                  >
                    View Details
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

                {/* Overdue Age details breakdown */}
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

        {/* Customers Pagination (10 per page) */}
        {(() => {
          const totalPages = Math.ceil(customersSummary.length / 10);
          if (totalPages <= 1) return null;
          return (
            <div className="flex items-center justify-between border-t border-slate-100 bg-white px-4 py-3 sm:px-6">
              {/* Mobile pagination */}
              <div className="flex flex-1 justify-between sm:hidden">
                <button
                  onClick={() => setCustomersPage(prev => Math.max(prev - 1, 1))}
                  disabled={customersPage === 1}
                  className="relative inline-flex items-center rounded-md border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                >
                  ก่อนหน้า
                </button>
                <button
                  onClick={() => setCustomersPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={customersPage === totalPages}
                  className="relative ml-3 inline-flex items-center rounded-md border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                >
                  ถัดไป
                </button>
              </div>
              {/* Desktop pagination */}
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-semibold gap-1 inline-flex items-center">
                    แสดงรายการลูกค้าที่ <span className="font-bold text-[#1A3263]">{Math.min((customersPage - 1) * 10 + 1, customersSummary.length)}</span> ถึง{' '}
                    <span className="font-bold text-[#1A3263]">{Math.min(customersPage * 10, customersSummary.length)}</span> จากทั้งหมด{' '}
                    <span className="font-black text-[#1A3263]">{customersSummary.length}</span> ลูกค้า
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md gap-1" aria-label="Customers Pagination">
                    <button
                      onClick={() => setCustomersPage(prev => Math.max(prev - 1, 1))}
                      disabled={customersPage === 1}
                      className="relative inline-flex items-center rounded-md bg-white px-2 py-1.5 text-slate-400 ring-1 ring-inset ring-gray-200 hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none cursor-pointer transition-all"
                    >
                      <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                    </button>
                    {(() => {
                      // Generate bounded list of page buttons to avoid overflow if there are too many pages
                      const maxButtons = 7;
                      let startPage = Math.max(1, customersPage - Math.floor(maxButtons / 2));
                      let endPage = startPage + maxButtons - 1;
                      if (endPage > totalPages) {
                        endPage = totalPages;
                        startPage = Math.max(1, endPage - maxButtons + 1);
                      }
                      return Array.from({ length: endPage - startPage + 1 }).map((_, idx) => {
                        const pageNum = startPage + idx;
                        const isCurrent = pageNum === customersPage;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCustomersPage(pageNum)}
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
                      onClick={() => setCustomersPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={customersPage === totalPages}
                      className="relative inline-flex items-center rounded-md bg-white px-2 py-1.5 text-slate-400 ring-1 ring-inset ring-gray-200 hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none cursor-pointer transition-all"
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

    </div>
  );
}
