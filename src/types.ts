export interface Customer {
  id: string; // c.g. "C29704"
  name: string;
  region: string;
  branch: string;
  salesmanId: string;
  salesmanName: string;
  outstandingBalance: number;
  notDue: number;
  overdue_1_30: number;
  overdue_31_60: number;
  overdue_61_90: number;
  overdue_90plus: number;
  status: 'ACTIVE' | 'INACTIVE' | 'OVERDUE';
  creditTerm: number; // in days
  creditLimit: number; // in THB
  registerDate: string; // "DD/MM/YYYY"
  address: string;
  machinePop: string; // Machine model e.g. "CAT 320 GC", "CAT 313"
  phone: string;
  contactPerson: string;
  businessUnit?: string;
}

export interface Salesman {
  id: string; // e.g. "G-1-175"
  name: string;
  branch: string;
  region: string;
  email: string;
  phone: string;
  totalCustomers: number;
  totalOutstanding: number;
  businessUnit?: string;
  agingSummary: {
    notDue: number;
    overdue_1_30: number;
    overdue_31_60: number;
    overdue_61_90: number;
    overdue_90plus: number;
  };
}

export interface CollectionNote {
  id: string;
  customerId: string;
  date: string;
  author: string;
  note: string;
  followUpDate?: string;
  status: 'Pending' | 'Committed' | 'Resolved';
}

export interface LoggedInUser {
  username: string;
  fullName: string;
  role: 'CREDIT' | 'NORTHEAST' | 'BRANCH_MANAGER' | 'SALESMAN' | 'SA';
  title?: string;
  salesmanId?: string; // If role is SALESMAN, link to their ID
  branch: string;
  region?: string;
  avatarUrl?: string;
  businessUnit?: string;
}
