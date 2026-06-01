import { Customer, Salesman, CollectionNote } from './types';
import { rawCustomerRows } from './rawCustomers';

// Naming dictionary for dynamic consistent Thai Salesmen names selection
const thaiFirstNames = ["วิชัย", "ประเสริฐ", "มนัส", "สิทธิ์", "ธวัช", "เกรียงไกร", "นพดล", "ณรงค์", "อภิชาติ", "วีระ", "ธีรพล", "จตุรนต์", "อรุณ", "ยศรัญ", "กฤษณะ", "ธนพล", "พงศกร", "สุรเดช", "สกล", "ทวีศักดิ์", "ไพโรจน์", "นพคุณ", "ปกรณ์", "พัชร", "เอกชัย"];
const thaiLastNames = ["เกียรติวงศ์", "สุขเกษม", "รัตนเดช", "ดีเลิศ", "ศรีวิจัย", "มงคลทิพย์", "จงเจริญ", "พูนเจริญ", "ตั้งมั่น", "มั่นคง", "อำนวยกิจ", "เจริญรุ่งเรือง", "เลิศวิจิตร", "จินดามณี", "พงศ์ปิยะ", "ธนทรัพย์", "ชลประเสริย์", "สุนทรวิภาต", "เดชาอนันต์"];

// Helper function to resolve salesman name consistently based on ID
function resolveSalesmanName(id: string): string {
  if (id === "G-1-175") return "วสันต์ ศิริพัธนพงศ์ (Wasan S.)";
  if (id === "S-4-121") return "ชัยชต ฟองทอง (Chaichot F.)";
  if (id === "S-4-122") return "ธนัญญา พรหมสมุทร (Thananya P.)";
  if (id === "S-4-118") return "วิทวัส แสงทอง (Wittawat S.)";
  if (id === "" || id === "G-DIRECT") return "ฝ่ายงานตรงภาพรวม (Direct-Desk)";

  const charSum = Array.from(id).reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  const firstName = thaiFirstNames[charSum % thaiFirstNames.length];
  const lastName = thaiLastNames[(charSum * 3) % thaiLastNames.length];
  // Format neat initials
  const rawClean = id.replace(/[^a-zA-Z0-0]/g, '');
  const suffix = rawClean.length > 2 ? rawClean.slice(-2).toUpperCase() : "M";
  return `${firstName} ${lastName} (${firstName[0]}${suffix})`;
}

// 1. Generate core list of typed Customers
export const mockCustomers: Customer[] = rawCustomerRows.map((row, index) => {
  const [region, branch, salesmanIdRaw, id, name, notDue, overdue_1_30, overdue_31_60, overdue_61_90, ov90plus, creditMemo, totalOv, bu] = row;
  
  // Assign exactly 10 customers to each of the key salesmen to simulate realistic 10-client portfolios
  let salesmanId = salesmanIdRaw || "G-DIRECT";
  if (index >= 0 && index < 10) {
    salesmanId = "S-4-121"; // Chaichot Fongtong
  } else if (index >= 10 && index < 20) {
    salesmanId = "S-4-122"; // Thananya Promsamut
  } else if (index >= 20 && index < 30) {
    salesmanId = "S-4-118"; // Wittawat Saengtong
  } else if (index >= 30 && index < 40) {
    salesmanId = "G-1-175"; // Wasan Siriphatthanaphong
  }
  
  const salesmanName = resolveSalesmanName(salesmanId).split(' (')[0];
  
  // Calculate total outstanding factoring credit memo which is negative
  const actualOverdue_90plus = ov90plus + (creditMemo || 0);
  const outstandingBalance = notDue + overdue_1_30 + overdue_31_60 + overdue_61_90 + actualOverdue_90plus;
  
  const status = (overdue_1_30 + overdue_31_60 + overdue_61_90 + actualOverdue_90plus) > 0 ? 'OVERDUE' : 'ACTIVE';
  
  return {
    id,
    name,
    region,
    branch,
    salesmanId,
    salesmanName,
    outstandingBalance,
    notDue,
    overdue_1_30,
    overdue_31_60,
    overdue_61_90,
    overdue_90plus: actualOverdue_90plus,
    status,
    creditTerm: bu === "Service CI" ? 45 : 30,
    creditLimit: outstandingBalance > 5000000 ? 10000000 : 2000000,
    registerDate: "12/03/2024",
    address: `${branch} Area, Region ${region}, Thailand`,
    machinePop: bu === "Service CI" ? "CAT 320 GC Excavator" : "CAT Parts & Core Equipment",
    phone: "081-345-XXXX",
    contactPerson: "ฝ่ายบัญชีและการเงิน",
    businessUnit: bu === "Service CI" || bu === "Parts Sales" ? "Parts & Service CI" : (bu || "Parts & Service CI")
  };
});

// 2. Dynamically collect all unique salesman records and pre-aggregate operational statistics
const uniqueSalesmanIds = Array.from(new Set(mockCustomers.map(c => c.salesmanId)));

export const mockSalesmen: Salesman[] = uniqueSalesmanIds.map(id => {
  const name = resolveSalesmanName(id);
  const assigned = mockCustomers.filter(c => c.salesmanId === id);
  
  let notDue = 0;
  let overdue_1_30 = 0;
  let overdue_31_60 = 0;
  let overdue_61_90 = 0;
  let overdue_90plus = 0;

  assigned.forEach(c => {
    notDue += c.notDue;
    overdue_1_30 += c.overdue_1_30;
    overdue_31_60 += c.overdue_31_60;
    overdue_61_90 += c.overdue_61_90;
    overdue_90plus += c.overdue_90plus;
  });

  const totalOutstanding = notDue + overdue_1_30 + overdue_31_60 + overdue_61_90 + overdue_90plus;
  
  // Find typical region/branch from first assigned customer
  let region = "Central";
  let branch = "Bangna-Tr";
  let businessUnit = "Parts & Service CI";
  if (assigned.length > 0) {
    region = assigned[0].region;
    branch = assigned[0].branch;
    businessUnit = assigned[0].businessUnit || "Parts & Service CI";
  }

  // Customize standard ones for login compatibility
  let email = `sales.${id.toLowerCase()}@metrocat.com`;
  let phone = "081-999-1234";
  if (id === "G-1-175") {
    branch = "Bangna-Tr";
    region = "Central";
    phone = "081-345-6789";
  } else if (id === "S-4-121") {
    branch = "KhonKaen-Branch";
    region = "NorthEast";
    phone = "081-444-2323";
  } else if (id === "S-4-122") {
    branch = "KhonKaen-Branch";
    region = "NorthEast";
    phone = "089-555-6767";
  } else if (id === "S-4-118") {
    branch = "KhonKaen-Branch";
    region = "NorthEast";
    phone = "086-111-2299";
  }

  return {
    id,
    name,
    branch,
    region,
    email,
    phone,
    totalCustomers: assigned.length,
    totalOutstanding,
    businessUnit,
    agingSummary: {
      notDue,
      overdue_1_30,
      overdue_31_60,
      overdue_61_90,
      overdue_90plus
    }
  };
});

// Collection notes remaining fully functional
export const mockCollectionNotes: CollectionNote[] = [
  {
    id: "N001",
    customerId: "C29704",
    date: "15/05/2026",
    author: "วสันต์ ศิริพัธนพงศ์",
    note: "สอบถามถึงยอดชำระค้างเกินกำหนด 6,573.13 บาท ทางจัดซื้อแจ้งว่าติดปัญหาเรื่องเอกสารเซ็นรับรองเครื่องจักรล่าช้า คาดว่าจะเคลียร์ยอดได้ทั้งหมดในสัปดาห์หน้า",
    followUpDate: "22/05/2026",
    status: "Pending"
  },
  {
    id: "N002",
    customerId: "C29704",
    date: "22/05/2026",
    author: "วสันต์ ศิริพัธนพงศ์",
    note: "ฝ่ายบัญชีลูกค้าซีพีเอฟแจ้งคอนเฟิร์มการโอนชำระเงิน ยอดคงเหลือค้างชำระทั้งหมด รอระบบรับรู้ยอดวันทำการถัดไป",
    followUpDate: "28/05/2026",
    status: "Committed"
  },
  {
    id: "N003",
    customerId: "C99301B",
    date: "10/05/2026",
    author: "ชัยชต ฟองทอง",
    note: "เข้าพบลูกค้าเพื่อทวงถามยอด overdue_1_30 และ 31_60 วัน ยอดรวมกว่า 2.2 แสนบาท ลูกค้าขอแบ่งชำระเป็น 2 งวด หักชำระสิ้นเดือนนี้ 1 แสน และสิ้นหน้าอีก 1.2 แสน",
    followUpDate: "30/05/2026",
    status: "Pending"
  }
];

export const mockUsers = [
  {
    username: "wallada.pras@metrocat.com",
    fullName: "Ms. WALLADA PRASATKUL",
    role: "CREDIT" as const,
    title: "Business Analyst",
    branch: "ALL",
    region: "ALL"
  },
  {
    username: "rattikarn.saen@metrocat.com",
    fullName: "Ms. RATTIKAN SAENGSOETSET",
    role: "CREDIT" as const,
    title: "Strategic Administration Officer",
    branch: "ALL",
    region: "ALL"
  },
  {
    username: "sathaporn.mulp@metrocat.com",
    fullName: "Mr. SATHAPORN MULPRUEK",
    role: "NORTHEAST" as const,
    title: "Regional Manager",
    branch: "ALL",
    region: "NorthEast"
  },
  {
    username: "saksri.hong@metrocat.com",
    fullName: "Mr. SAKSRI HONGKHAMJAN",
    role: "BRANCH_MANAGER" as const,
    title: "Branch Manager (Khon Kaen)",
    branch: "KhonKaen-Branch",
    region: "NorthEast"
  },
  {
    username: "chaichot.fong@metrocat.com",
    fullName: "Mr. CHAICHOT FONGTONG",
    role: "SALESMAN" as const,
    title: "Parts and Service Sales Representative",
    branch: "KhonKaen-Branch",
    region: "NorthEast",
    salesmanId: "S-4-121"
  },
  {
    username: "thananya.prom@metrocat.com",
    fullName: "Ms. THANANYA PROMSAMUT",
    role: "SALESMAN" as const,
    title: "Parts Sales Support Officer",
    branch: "KhonKaen-Branch",
    region: "NorthEast",
    salesmanId: "S-4-122"
  },
  {
    username: "sa.parts@metrocat.com",
    fullName: "Mr. SOMCHAI PARTSERVICE",
    role: "SA" as const,
    title: "Service Advisor / Assistant (SA)",
    branch: "KhonKaen-Branch",
    region: "NorthEast",
    businessUnit: "Parts & Service CI"
  }
];
