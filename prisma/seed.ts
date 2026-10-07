import { PrismaClient, type Prisma } from '@prisma/client';
import { createHmac, randomBytes } from 'node:crypto';
import { addDays } from 'date-fns';
import { hash } from '@node-rs/argon2';
import { PERMISSIONS, type PermissionKey } from '../src/server/rbac/permissions';
import { SYSTEM_ROLES } from '../src/server/rbac/system-roles';

/** Local copies (seed cannot import server-only modules). Must match src/server/crypto.ts. */
const hmac = (value: string, purpose: string): string => {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error('AUTH_SECRET is required to seed');
  return createHmac('sha256', secret).update(`${purpose}:${value}`).digest('hex');
};
const randomToken = (bytes = 32): string => randomBytes(bytes).toString('base64url');
/** Must match password.service.ts ARGON_OPTS. */
const hashPassword = (password: string): Promise<string> =>
  hash(password, { memoryCost: 65536, timeCost: 2, parallelism: 1 });

const prisma = new PrismaClient();

/** Round to 2dp (halala-exact for whole-riyal inputs). */
const r2 = (n: number) => Math.round(n * 100) / 100;
/** Split a grand total (15% VAT, no discount) into exact {sub, vat}. */
const split15 = (grand: number) => {
  const sub = r2(grand / 1.15);
  return { sub, vat: r2(grand - sub) };
};
const d = (day: string) => new Date(`${day}T00:00:00Z`);

async function seedSystemInfo() {
  const entries: Array<Prisma.SystemInfoCreateInput> = [
    { key: 'seed.phase', value: '4' },
    { key: 'schema.version', value: '4.0.0' },
    { key: 'roles.syncedAt', value: new Date().toISOString() },
    { key: 'permissions.syncedAt', value: new Date().toISOString() },
  ];
  for (const e of entries) {
    await prisma.systemInfo.upsert({ where: { key: e.key }, create: e, update: { value: e.value } });
  }
}

async function seedPermissions() {
  const keys = Object.keys(PERMISSIONS) as PermissionKey[];
  for (const key of keys) {
    const p = PERMISSIONS[key];
    await prisma.permission.upsert({
      where: { key },
      create: { key, group: p.group, description: p.description },
      update: { group: p.group, description: p.description },
    });
  }
}

async function seedSystemRoles() {
  for (const r of SYSTEM_ROLES) {
    const existing = await prisma.role.findFirst({ where: { organizationId: null, key: r.key } });
    const role = existing
      ? await prisma.role.update({
          where: { id: existing.id },
          data: { nameAr: r.nameAr, nameEn: r.nameEn, isSystem: true },
        })
      : await prisma.role.create({
          data: { organizationId: null, key: r.key, nameAr: r.nameAr, nameEn: r.nameEn, isSystem: true },
        });
    await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });
    await prisma.rolePermission.createMany({
      data: r.permissions.map((pk) => ({ roleId: role.id, permissionKey: pk })),
      skipDuplicates: true,
    });
  }
}

async function systemRoleId(key: string): Promise<string> {
  const r = await prisma.role.findFirst({ where: { organizationId: null, key } });
  if (!r) throw new Error(`system role missing: ${key}`);
  return r.id;
}

// ───────────────────────── Demo workspace (§8) ─────────────────────────
// Deterministic, idempotent (wipes and rebuilds the demo org). Dates anchored
// to 2026-10-07 (the design's "today") so aging/overdue match.
//
// Targets (all exact by construction):
//   Oct TAX/SIMPLIFIED issued (excl. drafts/cancelled/notes): sub Σ 248,930.50, vat Σ 37,339.58
//   Oct credit notes sub Σ −7,320 → net revenue 241,610.50
//   Oct approved expenses Σ 126,480 (recoverable VAT 18,972) → profit 115,130.50
//   Buckets: paid-in-Oct 182,400/82 · open-unpaid 64,250/14 · overdue 31,200/4 · drafts 9,800/3
//   Branch October subtotals: HO 112,400 · Dammam 78,930.50 · Jeddah 57,600
//   October receipts by method: bank 104,600 · mada 41,300 · cash 18,200 · apple_pay 11,900 · cheque 6,400
//   Q3 (Jul–Sep) output VAT − recoverable input VAT = 49,125.00
//
// Known design deviations (documented, §8 silent on them): aging bands, top-N
// rankings, activity feed and weekly cashflow are computed really from the data
// and may differ from the .webp renders.

const DEMO_SLUG = 'afaq-tech';
const DEMO_PASSWORD = 'Demo@12345';

type BranchCode = 'HO' | 'DMM' | 'JED';
type PayMethod = 'cash' | 'bank' | 'mada' | 'card' | 'apple_pay' | 'cheque' | 'transfer';

async function seedDemo() {
  const passwordHash = await hashPassword(DEMO_PASSWORD);

  const old = await prisma.organization.findUnique({ where: { slug: DEMO_SLUG } });
  if (old) {
    // Org first (cascades invitations/memberships/docs), then the demo users.
    await prisma.organization.delete({ where: { id: old.id } });
    for (const email of [
      'demo@zatcaweb.sa',
      'faisal@afaq-tech.sa',
      'noura@afaq-tech.sa',
      'ahmed@afaq-tech.sa',
      'reem@afaq-tech.sa',
      'omar@external-audit.sa',
      'majed@afaq-tech.sa',
    ]) {
      await prisma.user.deleteMany({ where: { email } });
    }
  }

  // ── users ──
  const mkUser = (name: string, email: string, phone: string | null, locale = 'ar') =>
    prisma.user.create({
      data: { name, email, phone, passwordHash, emailVerifiedAt: new Date(), phoneVerifiedAt: phone ? new Date() : null, locale, theme: 'system' },
    });
  const demo = await mkUser('Demo User', 'demo@zatcaweb.sa', '+966500000001', 'en');
  const faisal = await mkUser('Faisal Al-Otaibi', 'faisal@afaq-tech.sa', '+966551234567');
  const noura = await mkUser('Noura Al-Qahtani', 'noura@afaq-tech.sa', '+966552345678');
  const ahmed = await mkUser('Ahmed Saleh', 'ahmed@afaq-tech.sa', '+966553456789');
  const reem = await mkUser('Reem Hassan', 'reem@afaq-tech.sa', '+966554567890');
  const omar = await mkUser('Omar Al-Zahrani', 'omar@external-audit.sa', null, 'en');
  const majed = await mkUser('Majed Al-Dossary', 'majed@afaq-tech.sa', '+966555678901');

  // ── org + address + branches ──
  const org = await prisma.organization.create({
    data: {
      slug: DEMO_SLUG,
      nameAr: 'شركة آفاق التقنية المحدودة',
      nameEn: 'Afaq Technology Co. Ltd.',
      legalName: 'شركة آفاق التقنية المحدودة — شركة ذات مسؤولية محدودة',
      crNumber: '1010654321',
      vatNumber: '310123456700003',
      tin: '3101234567',
      businessType: 'llc',
      industry: 'it',
      employeesRange: 'm',
      invoiceVolume: 'b',
      defaultLocale: 'ar',
      currency: 'SAR',
      fiscalYearStartMonth: 1,
      vatStatus: 'reg',
      invoiceTemplate: 'Modern',
      status: 'active',
      onboardingStep: 6,
      onboardingCompletedAt: new Date(),
      createdById: faisal.id,
      address: {
        create: {
          buildingNo: '7421',
          street: 'King Fahd Road · طريق الملك فهد',
          district: 'Al Olaya · العليا',
          city: 'Riyadh',
          postalCode: '12214',
          additionalNo: '3359',
          country: 'SA',
        },
      },
    },
  });
  const ho = await prisma.branch.create({
    data: { organizationId: org.id, code: 'HO', nameAr: 'المقر الرئيسي', nameEn: 'Head Office', city: 'Riyadh', isHeadOffice: true },
  });
  const dmm = await prisma.branch.create({
    data: { organizationId: org.id, code: 'DMM', nameAr: 'فرع الدمام', nameEn: 'Dammam', city: 'Dammam' },
  });
  const jed = await prisma.branch.create({
    data: { organizationId: org.id, code: 'JED', nameAr: 'فرع جدة', nameEn: 'Jeddah', city: 'Jeddah' },
  });
  const branches = { HO: ho, DMM: dmm, JED: jed };

  // ── memberships + pending invite (lama, viewer) ──
  const roleOf = async (key: string) => systemRoleId(key);
  await prisma.membership.createMany({
    data: [
      { userId: demo.id, organizationId: org.id, roleId: await roleOf('org.owner'), status: 'active' },
      { userId: faisal.id, organizationId: org.id, roleId: await roleOf('org.owner'), status: 'active' },
      { userId: noura.id, organizationId: org.id, roleId: await roleOf('accountant'), status: 'active' },
      { userId: ahmed.id, organizationId: org.id, roleId: await roleOf('sales.manager'), status: 'active' },
      { userId: reem.id, organizationId: org.id, roleId: await roleOf('cashier'), status: 'active' },
      { userId: omar.id, organizationId: org.id, roleId: await roleOf('auditor'), status: 'active' },
      { userId: majed.id, organizationId: org.id, roleId: await roleOf('salesperson'), status: 'active' },
    ],
  });
  await prisma.invitation.create({
    data: {
      organizationId: org.id,
      email: 'lama@afaq-tech.sa',
      roleId: await roleOf('viewer'),
      branchIds: [ho.id],
      tokenHash: hmac(randomToken(32), 'token:INVITE'),
      invitedById: faisal.id,
      expiresAt: addDays(new Date(), 5),
    },
  });

  // ── catalog ──
  const cat = (key: string, nameAr: string, nameEn: string) =>
    prisma.category.create({ data: { organizationId: org.id, key, nameAr, nameEn } });
  const cHard = await cat('hardware', 'الأجهزة', 'Hardware');
  const cNet = await cat('networking', 'الشبكات', 'Networking');
  const cSvc = await cat('services', 'الخدمات', 'Services');
  const cLic = await cat('licences', 'التراخيص', 'Licences');
  const cBnd = await cat('bundles', 'الباقات', 'Bundles');
  const cPow = await cat('power', 'الطاقة', 'Power');

  const prod = (p: Omit<Prisma.ProductCreateManyInput, 'organizationId'>) => prisma.product.create({ data: { ...p, organizationId: org.id } });
  const pDell = await prod({ type: 'product', sku: 'HW-DELL-5540', barcode: '5397184672310', nameAr: 'حاسب محمول ديل لاتيتيود 5540', nameEn: 'Dell Latitude 5540 laptop', description: 'Intel Core i7-1365U, 16GB, 512GB SSD, 15.6" FHD, 3-yr warranty', categoryId: cHard.id, unit: 'pcs', purchasePrice: 3480, sellingPrice: 4250, vatCategory: 'STANDARD', vatRate: 15, minStock: 5 });
  const pCisco = await prod({ type: 'product', sku: 'HW-CSC-9200', nameAr: 'محوّل سيسكو ٢٤ منفذ', nameEn: 'Cisco Catalyst 9200 switch, 24-port', categoryId: cNet.id, unit: 'pcs', purchasePrice: 2610, sellingPrice: 3300, vatCategory: 'STANDARD', vatRate: 15, minStock: 4 });
  const pUbq = await prod({ type: 'variant', sku: 'HW-UBQ-U6P', nameAr: 'نقطة وصول يوبيكيتي', nameEn: 'Ubiquiti U6 Pro access point', categoryId: cNet.id, unit: 'pcs', purchasePrice: 640, sellingPrice: 890, vatCategory: 'STANDARD', vatRate: 15, minStock: 10 });
  const pNetSvc = await prod({ type: 'service', sku: 'SRV-NET-INSTALL', nameAr: 'خدمة تركيب شبكة', nameEn: 'Network installation service', categoryId: cSvc.id, unit: 'job', sellingPrice: 18500, vatCategory: 'STANDARD', vatRate: 15, trackStock: false });
  const pSup = await prod({ type: 'service', sku: 'SRV-SUP-ANNUAL', nameAr: 'عقد دعم سنوي', nameEn: 'Annual support contract', categoryId: cSvc.id, unit: 'year', sellingPrice: 9600, vatCategory: 'STANDARD', vatRate: 15, trackStock: false });
  const pM365 = await prod({ type: 'service', sku: 'LIC-M365-BP', nameAr: 'ترخيص مايكروسوفت ٣٦٥', nameEn: 'Microsoft 365 Business Premium', categoryId: cLic.id, unit: 'seat', purchasePrice: 196, sellingPrice: 240, vatCategory: 'STANDARD', vatRate: 15, trackStock: false });
  const pBnd = await prod({ type: 'bundle', sku: 'BND-OFFICE-10', nameAr: 'باقة المكتب الصغير', nameEn: 'Small office starter bundle', categoryId: cBnd.id, unit: 'bundle', purchasePrice: 19850, sellingPrice: 24900, vatCategory: 'STANDARD', vatRate: 15, minStock: 2 });
  const pHp = await prod({ type: 'product', sku: 'HW-HP-M404', nameAr: 'طابعة إتش بي ليزر', nameEn: 'HP LaserJet Pro M404dn', categoryId: cHard.id, unit: 'pcs', purchasePrice: 905, sellingPrice: 1180, vatCategory: 'STANDARD', vatRate: 15, minStock: 3 });
  const pTrn = await prod({ type: 'service', sku: 'SRV-TRAIN-EXP', nameAr: 'تدريب تقني (تصدير)', nameEn: 'Staff IT training (export)', categoryId: cSvc.id, unit: 'course', sellingPrice: 6500, vatCategory: 'ZERO', vatRate: 0, trackStock: false });
  const pApc = await prod({ type: 'product', sku: 'HW-APC-1500', nameAr: 'مزوّد طاقة احتياطي', nameEn: 'APC Smart-UPS 1500VA', categoryId: cPow.id, unit: 'pcs', purchasePrice: 2140, sellingPrice: 2750, vatCategory: 'STANDARD', vatRate: 15, minStock: 2 });
  void pUbq;
  void pSup;
  void pM365;
  void pBnd;
  void pTrn;
  const stock = (productId: string, qty: number, branchId: string | null) =>
    prisma.stockLevel.create({ data: { organizationId: org.id, productId, branchId, quantity: qty } });
  await stock(pDell.id, 3, ho.id); // below min 5 → low-stock alert
  await stock(pHp.id, 2, ho.id); // below min 3
  await stock(pApc.id, 1, ho.id); // below min 2
  await stock(pCisco.id, 14, ho.id);
  await stock(pUbq.id, 42, ho.id);
  await stock(pBnd.id, 4, ho.id);

  // ── customers ──
  const cust = (c: Omit<Prisma.CustomerCreateManyInput, 'organizationId'>) => prisma.customer.create({ data: { ...c, organizationId: org.id } });
  const cuBrill = await cust({ type: 'company', nameAr: 'شركة البناء الحديث', nameEn: 'Modern Construction Co.', vatNumber: '300456789100003', crNumber: '1010223344', email: 'accounts@modern-build.sa', phone: '+966504121180', city: 'Riyadh', address: 'Building 2218, Prince Turki St, Al Malqa, Riyadh 13521', creditLimit: 150000, paymentTermsDays: 30 });
  const cuGulf = await cust({ type: 'company', nameAr: 'شركة الخليج للخدمات', nameEn: 'Gulf Services Co.', vatNumber: '302233445500003', city: 'Jeddah', address: 'Al Rawdah, Jeddah 23435', paymentTermsDays: 30 });
  const cuNoor = await cust({ type: 'company', nameAr: 'مؤسسة النور التجارية', nameEn: 'Al Noor Trading Est.', vatNumber: '310987654300003', city: 'Dammam', paymentTermsDays: 30 });
  const cuWaha = await cust({ type: 'company', nameAr: 'شركة الواحة للضيافة', nameEn: 'Al Waha Hospitality Co.', vatNumber: '311122233300003', city: 'Al Khobar', paymentTermsDays: 30 });
  const cuNajd = await cust({ type: 'company', nameAr: 'نجد للخدمات اللوجستية', nameEn: 'Najd Logistics LLC', vatNumber: '300998877600003', city: 'Riyadh', paymentTermsDays: 30 });
  const cuRayan = await cust({ type: 'company', nameAr: 'مؤسسة الريان للتوريدات', nameEn: 'Al Rayan Supplies Est.', vatNumber: '301122334400003', city: 'Dammam', paymentTermsDays: 30 });
  const cuWalk = await cust({ type: 'individual', nameAr: 'عبدالله محمد الشهري', city: 'Riyadh', paymentTermsDays: 0 });
  const cuRed = await cust({ type: 'company', nameAr: 'عيادات البحر الأحمر', nameEn: 'Red Sea Clinics Co.', vatNumber: '302445566700003', city: 'Jeddah', paymentTermsDays: 15 });
  const cuGold = await cust({ type: 'company', nameAr: 'شركة المراعي الذهبية للأغذية', nameEn: 'Golden Fields Food Co.', vatNumber: '300112233400003', city: 'Riyadh', paymentTermsDays: 30 });
  const cuTam = await cust({ type: 'company', nameAr: 'تميمي للاستشارات', nameEn: 'Tamimi Consulting', vatNumber: '310556677800003', city: 'Riyadh', paymentTermsDays: 30 });

  // ── invoice helpers ──
  interface NamedLine { productId?: string; description: string; descriptionAr?: string; qty: number; unit?: string; unitPrice: number; discountPct?: number; vatRate?: number }
  interface InvSpec {
    number?: string; type?: 'TAX' | 'SIMPLIFIED' | 'CREDIT_NOTE' | 'DEBIT_NOTE';
    status?: 'draft' | 'issued' | 'viewed' | 'sent' | 'partially_paid' | 'paid' | 'pending' | 'cancelled' | 'credited';
    customerId?: string; branchCode?: BranchCode;
    issueDate: string; dueDate?: string; notes?: string; issuedById?: string; paid?: number;
    lines: NamedLine[];
  }
  const addInvoice = async (o: InvSpec) => {
    let sub = 0;
    let vat = 0;
    const rows = o.lines.map((l, i) => {
      const net = r2(l.qty * l.unitPrice * (1 - (l.discountPct ?? 0) / 100));
      const vr = l.vatRate ?? 15;
      const va = r2((net * vr) / 100);
      sub = r2(sub + net);
      vat = r2(vat + va);
      return {
        organizationId: org.id, position: i, productId: l.productId, description: l.description,
        descriptionAr: l.descriptionAr, qty: l.qty, unit: l.unit ?? 'pcs', unitPrice: l.unitPrice,
        discountPct: l.discountPct ?? 0, vatRate: vr, netAmount: net, vatAmount: va, lineTotal: r2(net + va),
      };
    });
    const grand = r2(sub + vat);
    const paid = o.paid ?? (o.status === 'paid' || o.status === 'credited' ? grand : 0);
    const inv = await prisma.invoice.create({
      data: {
        organizationId: org.id, number: o.number, type: o.type ?? 'TAX', status: o.status ?? 'issued',
        customerId: o.customerId, branchId: o.branchCode ? branches[o.branchCode].id : null,
        issueDate: d(o.issueDate), dueDate: o.dueDate ? d(o.dueDate) : null, currency: 'SAR',
        subtotal: sub, vatTotal: vat, grandTotal: grand, amountPaid: paid, balanceDue: r2(grand - paid),
        notes: o.notes, issuedAt: o.status && o.status !== 'draft' ? d(o.issueDate) : null, issuedById: o.issuedById,
        lines: { create: rows },
      },
    });
    return { inv, sub, vat, grand };
  };
  const pay = (o: { invoiceId: string; customerId?: string; amount: number; method: PayMethod; date: string; reference?: string; by?: string }) =>
    prisma.payment.create({
      data: { organizationId: org.id, invoiceId: o.invoiceId, customerId: o.customerId, amount: o.amount, method: o.method, date: d(o.date), reference: o.reference, createdById: o.by },
    });

  // Fit single-line amounts so sub/vat hit the grand exactly (15%, no discount).
  const fit = (specs: Array<InvSpec & { grand: number }>) => {
    for (const n of specs) {
      const { sub } = split15(n.grand);
      const per = r2(sub / n.lines.length);
      let acc = 0;
      n.lines.forEach((l, i) => {
        l.unitPrice = i === n.lines.length - 1 ? r2((sub - acc) / l.qty) : r2(per / l.qty);
        acc = r2(acc + l.unitPrice * l.qty);
      });
    }
  };

  // Named October invoices
  const octNamed: Array<InvSpec & { grand: number }> = [
    { number: 'INV-2026-00126', status: 'sent', customerId: cuGulf.id, branchCode: 'JED', issueDate: '2026-10-07', dueDate: '2026-11-06', issuedById: ahmed.id, grand: 13200, lines: [{ description: 'IT services — October', qty: 1, unitPrice: 0, vatRate: 15 }] },
    { number: 'INV-2026-00125', status: 'partially_paid', customerId: cuNoor.id, branchCode: 'DMM', issueDate: '2026-10-05', dueDate: '2026-11-04', paid: 3200, grand: 8625, lines: [{ description: 'Retail supplies', qty: 1, unitPrice: 0, vatRate: 15 }] },
    { number: 'SIM-2026-04411', type: 'SIMPLIFIED', status: 'paid', customerId: cuWalk.id, branchCode: 'HO', issueDate: '2026-10-05', grand: 862.5, lines: [{ description: 'POS sale', qty: 1, unitPrice: 0, vatRate: 15 }] },
    { number: 'INV-2026-00124', status: 'paid', customerId: cuBrill.id, branchCode: 'HO', issueDate: '2026-10-01', dueDate: '2026-10-31', issuedById: faisal.id, grand: 48300, lines: [
      { productId: pCisco.id, description: 'Cisco Catalyst 9200 switch, 24-port', descriptionAr: 'محوّل شبكة سيسكو ٢٤ منفذ', qty: 4, unitPrice: 3300, vatRate: 15 },
      { productId: pNetSvc.id, description: 'Network installation service', descriptionAr: 'خدمة تركيب شبكة', qty: 1, unit: 'job', unitPrice: 18500, vatRate: 15 },
      { description: 'Network maintenance — Q4 2026', descriptionAr: 'صيانة الشبكة — الربع الرابع', qty: 1, unit: 'job', unitPrice: 10300, vatRate: 15 },
    ] },
    { number: 'INV-2026-00120', status: 'paid', customerId: cuGulf.id, branchCode: 'JED', issueDate: '2026-09-11', dueDate: '2026-10-11', grand: 17940, lines: [{ description: 'Facilities services — September', qty: 1, unitPrice: 0, vatRate: 15 }] },
    { number: 'INV-2026-00119', status: 'issued', customerId: cuNajd.id, branchCode: 'HO', issueDate: '2026-09-09', dueDate: '2026-10-09', grand: 9890, lines: [{ description: 'Logistics services — September', qty: 1, unitPrice: 0, vatRate: 15 }] },
    { number: 'INV-2026-00118', status: 'pending', customerId: cuNoor.id, branchCode: 'DMM', issueDate: '2026-09-02', dueDate: '2026-10-02', grand: 4320, lines: [{ description: 'Retail supplies — August', qty: 1, unitPrice: 0, vatRate: 15 }] },
  ];
  fit(octNamed);
  const invByNumber: Record<string, string> = {};
  const namedOctBranchSub: Record<BranchCode, number> = { HO: 0, DMM: 0, JED: 0 };
  let namedOctSub = 0;
  let namedOctVat = 0;
  for (const n of octNamed) {
    const { inv, sub, vat } = await addInvoice(n);
    // 00118/00119/00120 are September-issued: buckets only, outside the October KPI scope.
    if (n.issueDate >= '2026-10-01') {
      namedOctSub = r2(namedOctSub + sub);
      namedOctVat = r2(namedOctVat + vat);
      const bc = n.branchCode ?? 'HO';
      namedOctBranchSub[bc] = r2(namedOctBranchSub[bc]! + sub);
    }
    if (n.number) invByNumber[n.number] = inv.id;
  }

  // Named older/open/void/credit docs
  const older: Array<InvSpec & { grand: number }> = [
    { number: 'INV-2026-00123', status: 'issued', customerId: cuWaha.id, branchCode: 'HO', issueDate: '2026-09-22', dueDate: '2026-10-06', grand: 3105, lines: [{ description: 'Hospitality services', qty: 1, unitPrice: 0, vatRate: 15 }] },
    { number: 'INV-2026-00122', status: 'viewed', customerId: cuBrill.id, branchCode: 'HO', issueDate: '2026-09-18', dueDate: '2026-10-18', grand: 21850, lines: [{ description: 'Construction services — September', qty: 1, unitPrice: 0, vatRate: 15 }] },
    { number: 'INV-2026-00121', status: 'draft', customerId: cuRayan.id, branchCode: 'DMM', issueDate: '2026-09-15', grand: 5750, lines: [{ description: 'Supplies (draft)', qty: 1, unitPrice: 0, vatRate: 15 }] },
    { number: 'CN-2026-0009', type: 'CREDIT_NOTE', status: 'credited', customerId: cuNajd.id, branchCode: 'HO', issueDate: '2026-09-28', grand: -2300, lines: [{ description: 'Credit — September', qty: 1, unitPrice: 0, vatRate: 15 }] },
    { number: 'INV-2026-00117', status: 'issued', customerId: cuBrill.id, branchCode: 'HO', issueDate: '2026-08-28', dueDate: '2026-09-27', grand: 19800, lines: [{ description: 'Construction services — August', qty: 1, unitPrice: 0, vatRate: 15 }] },
    { number: 'INV-2026-00116', status: 'cancelled', customerId: cuWaha.id, branchCode: 'HO', issueDate: '2026-08-25', grand: 1150, lines: [{ description: 'Cancelled booking', qty: 1, unitPrice: 0, vatRate: 15 }] },
    { number: 'CN-2026-0004', type: 'CREDIT_NOTE', status: 'credited', customerId: cuBrill.id, branchCode: 'HO', issueDate: '2026-08-03', grand: -1150, lines: [{ description: 'Credit — August', qty: 1, unitPrice: 0, vatRate: 15 }] },
    { number: 'CN-2026-0010', type: 'CREDIT_NOTE', status: 'credited', customerId: cuNajd.id, branchCode: 'HO', issueDate: '2026-10-04', grand: -5020, lines: [{ description: 'Credit — October', qty: 1, unitPrice: 0, vatRate: 15 }] },
    { number: 'CN-2026-0011', type: 'CREDIT_NOTE', status: 'credited', customerId: cuBrill.id, branchCode: 'HO', issueDate: '2026-10-06', grand: -2300, lines: [{ description: 'Credit — October', qty: 1, unitPrice: 0, vatRate: 15 }] },
  ];
  fit(older);
  for (const n of older) {
    const { inv } = await addInvoice(n);
    if (n.number) invByNumber[n.number] = inv.id;
  }

  // Named payments. 00125's partial arrived Sep 30 (outside the October receipts widget).
  await pay({ invoiceId: invByNumber['INV-2026-00124']!, customerId: cuBrill.id, amount: 25000, method: 'bank', date: '2026-10-03', reference: 'TRX-87990', by: noura.id });
  await pay({ invoiceId: invByNumber['INV-2026-00124']!, customerId: cuBrill.id, amount: 23300, method: 'bank', date: '2026-10-06', reference: 'TRX-88412', by: noura.id });
  await pay({ invoiceId: invByNumber['INV-2026-00125']!, customerId: cuNoor.id, amount: 3200, method: 'mada', date: '2026-09-30', by: reem.id });
  await pay({ invoiceId: invByNumber['INV-2026-00120']!, customerId: cuGulf.id, amount: 17940, method: 'bank', date: '2026-10-02', by: noura.id });
  await pay({ invoiceId: invByNumber['SIM-2026-04411']!, customerId: cuWalk.id, amount: 862.5, method: 'cash', date: '2026-10-05', by: reem.id });

  // ── targets ──
  const T = {
    salesSub: 248930.5, vat: 37339.58, creditSub: 7320,
    expensesOct: 126480, inputVatQ4: 18972,
    paidOctGrand: 182400, paidOctCount: 82,
    unpaid: 64250, unpaidCount: 14, overdue: 31200, overdueCount: 4, draft: 9800, draftCount: 3,
    branch: { HO: 112400, DMM: 78930.5, JED: 57600 } as Record<BranchCode, number>,
    methods: { bank: 104600, mada: 41300, cash: 18200, apple_pay: 11900, cheque: 6400 } as Record<string, number>,
    months: [
      { m: '2026-04', rev: 142000, exp: 98000 }, { m: '2026-05', rev: 158000, exp: 104000 },
      { m: '2026-06', rev: 151000, exp: 112000 }, { m: '2026-07', rev: 176000, exp: 109000 },
      { m: '2026-08', rev: 169000, exp: 121000 }, { m: '2026-09', rev: 192000, exp: 118000 },
    ],
    q3VatIn: { '2026-07': 14016.43, '2026-08': 14016.43, '2026-09': 14016.43 } as Record<string, number>,
  };
  const namedPaidOctGrand = 48300 + 17940 + 862.5; // 00124 + 00120 + SIM
  const namedOctPayCash = 862.5;

  // ── monthly fillers Apr–Sep (10 paid invoices each, paid in-month) ──
  const custCycle = [cuBrill, cuGulf, cuNoor, cuWaha, cuNajd, cuRed, cuGold, cuTam];
  for (const { m, rev } of T.months) {
    const per = Math.floor(rev / 10);
    for (let i = 0; i < 10; i++) {
      const sub = i === 9 ? rev - per * 9 : per;
      const vat = r2((sub * 15) / 100);
      const grand = r2(sub + vat);
      const c = custCycle[(i + m.length) % custCycle.length]!;
      const inv = await prisma.invoice.create({
        data: {
          organizationId: org.id, number: `INV-${m.replace('-', '')}-${String(100 + i)}`, type: 'TAX', status: 'paid',
          customerId: c.id, branchId: ho.id, issueDate: d(`${m}-15`), dueDate: d(`${m}-28`), currency: 'SAR',
          subtotal: sub, vatTotal: vat, grandTotal: grand, amountPaid: grand, balanceDue: 0,
          issuedAt: d(`${m}-15`), issuedById: ahmed.id,
          lines: { create: [{ organizationId: org.id, position: 0, description: 'Services', qty: 1, unit: 'job', unitPrice: sub, discountPct: 0, vatRate: 15, netAmount: sub, vatAmount: vat, lineTotal: grand }] },
        },
      });
      await pay({ invoiceId: inv.id, customerId: c.id, amount: grand, method: 'bank', date: `${m}-20`, by: noura.id });
    }
  }

  // ── expenses: categories + monthly rows (Q3 recoverable tuned → q3VatIn) ──
  const expCat = (key: string, nameAr: string, nameEn: string) =>
    prisma.expenseCategory.create({ data: { organizationId: org.id, key, nameAr, nameEn } });
  const _catRent = await expCat('rent', 'إيجار', 'Rent');
  const catOps = await expCat('operations', 'تشغيل', 'Operations');
  const _catMkt = await expCat('marketing', 'تسويق', 'Marketing');
  const catSal = await expCat('salaries', 'رواتب', 'Salaries');
  const addExpense = (o: { categoryId?: string; description: string; date: string; incl: number; vat: number; branchId?: string; status?: 'approved' | 'paid' | 'draft' | 'pending' }) =>
    prisma.expense.create({
      data: { organizationId: org.id, categoryId: o.categoryId, description: o.description, date: d(o.date), amountInclVat: o.incl, vatAmount: o.vat, recoverable: o.vat > 0, branchId: o.branchId, status: o.status ?? 'approved' },
    });
  for (const { m, exp } of T.months) {
    const isQ3 = m >= '2026-07';
    const vatIn = isQ3 ? T.q3VatIn[m]! : r2((exp * 0.6 * 15) / 115);
    const e1 = r2(exp * 0.5);
    await addExpense({ categoryId: catSal.id, description: 'Salaries', date: `${m}-18`, incl: e1, vat: 0, branchId: ho.id });
    await addExpense({ categoryId: catOps.id, description: 'Operations', date: `${m}-18`, incl: r2(exp - e1), vat: vatIn, branchId: ho.id });
  }

  // ── October open/draft fillers ──
  // Unpaid Oct-dated fillers feed the October sales pool; Sept-dated ones only fill buckets.
  // unpaid: 10 × {5×1000, 5×1137} = 10,685 (named unpaid Σ 53,565 → 64,250)
  const unpaidGrands = [...Array<number>(5).fill(1000), ...Array<number>(5).fill(1137)];
  const octPoolBranchSub: Record<BranchCode, number> = { HO: 0, DMM: 0, JED: 0 };
  let octPoolSub = 0;
  let octPoolVat = 0;
  const trackOct = (bc: BranchCode, sub: number, vat: number) => {
    octPoolSub = r2(octPoolSub + sub);
    octPoolVat = r2(octPoolVat + vat);
    octPoolBranchSub[bc] = r2(octPoolBranchSub[bc]! + sub);
  };
  for (let i = 0; i < 10; i++) {
    const grand = unpaidGrands[i]!;
    const { sub, vat } = split15(grand);
    const c = custCycle[i % custCycle.length]!;
    const octDated = i < 6;
    await prisma.invoice.create({
      data: {
        organizationId: org.id, number: `INV-2026-09${String(60 + i)}`, type: 'TAX', status: i % 3 === 0 ? 'sent' : 'issued',
        customerId: c.id, branchId: ho.id, issueDate: d(octDated ? '2026-10-02' : '2026-09-20'), dueDate: d(octDated ? '2026-11-02' : '2026-10-20'),
        currency: 'SAR', subtotal: sub, vatTotal: vat, grandTotal: grand, amountPaid: 0, balanceDue: grand,
        issuedAt: d(octDated ? '2026-10-02' : '2026-09-20'), issuedById: ahmed.id,
        lines: { create: [{ organizationId: org.id, position: 0, description: 'Services', qty: 1, unit: 'job', unitPrice: sub, discountPct: 0, vatRate: 15, netAmount: sub, vatAmount: vat, lineTotal: grand }] },
      },
    });
    if (octDated) trackOct('HO', sub, vat);
  }
  // overdue filler: 3,975 Oct-dated (named overdue Σ 27,225 → 31,200)
  {
    const { sub, vat } = split15(3975);
    await prisma.invoice.create({
      data: {
        organizationId: org.id, number: 'INV-2026-0959', type: 'TAX', status: 'issued',
        customerId: cuGold.id, branchId: jed.id, issueDate: d('2026-10-01'), dueDate: d('2026-09-25'),
        currency: 'SAR', subtotal: sub, vatTotal: vat, grandTotal: 3975, amountPaid: 0, balanceDue: 3975,
        issuedAt: d('2026-10-01'), issuedById: ahmed.id,
        lines: { create: [{ organizationId: org.id, position: 0, description: 'Food supplies', qty: 1, unit: 'job', unitPrice: sub, discountPct: 0, vatRate: 15, netAmount: sub, vatAmount: vat, lineTotal: 3975 }] },
      },
    });
    trackOct('JED', sub, vat);
  }
  // drafts: 2 × 2,025 Sept (named 5,750 → 9,800)
  for (let i = 0; i < 2; i++) {
    const { sub, vat } = split15(2025);
    await prisma.invoice.create({
      data: {
        organizationId: org.id, type: 'TAX', status: 'draft', customerId: cuTam.id, branchId: dmm.id,
        issueDate: d('2026-09-28'), currency: 'SAR', subtotal: sub, vatTotal: vat, grandTotal: 2025,
        amountPaid: 0, balanceDue: 2025,
        lines: { create: [{ organizationId: org.id, position: 0, description: 'Draft services', qty: 1, unit: 'job', unitPrice: sub, discountPct: 0, vatRate: 15, netAmount: sub, vatAmount: vat, lineTotal: 2025 }] },
      },
    });
  }

  // ── Advance-paid fillers: 30 Oct-issued invoices prepaid in September ──
  // They count toward October sales but NOT toward paid-in-October (payment-date bucket).
  // 29 × 2,800 + plug 8,673.08 = 89,873.08.
  const advGrands = [...Array<number>(29).fill(2800), 8673.08];
  const advBranches: BranchCode[] = [...Array<BranchCode>(13).fill('HO'), ...Array<BranchCode>(9).fill('DMM'), ...Array<BranchCode>(8).fill('JED')];
  let advSub = 0;
  let advVat = 0;
  for (let i = 0; i < advGrands.length; i++) {
    const grand = advGrands[i]!;
    const { sub, vat } = split15(grand);
    const c = custCycle[(i + 3) % custCycle.length]!;
    const bc = advBranches[i]!;
    const inv = await prisma.invoice.create({
      data: {
        organizationId: org.id, number: `INV-2026-${String(300 + i)}`, type: 'TAX', status: 'paid',
        customerId: c.id, branchId: branches[bc].id, issueDate: d(`2026-10-0${1 + (i % 5)}`), dueDate: d('2026-11-01'),
        currency: 'SAR', subtotal: sub, vatTotal: vat, grandTotal: grand, amountPaid: grand, balanceDue: 0,
        issuedAt: d('2026-10-03'), issuedById: ahmed.id,
        lines: { create: [{ organizationId: org.id, position: 0, description: 'Services — October (prepaid)', qty: 1, unit: 'job', unitPrice: sub, discountPct: 0, vatRate: 15, netAmount: sub, vatAmount: vat, lineTotal: grand }] },
      },
    });
    await pay({ invoiceId: inv.id, customerId: c.id, amount: grand, method: 'bank', date: `2026-09-${String(25 + (i % 5)).padStart(2, '0')}`, by: noura.id });
    advSub = r2(advSub + sub);
    advVat = r2(advVat + vat);
    trackOct(bc, sub, vat);
  }

  // ── October paid fillers: 79 invoices, paid in October ──
  // Pool remainders after named + Oct-dated open fillers + advance fillers:
  const needSub = r2(T.salesSub - namedOctSub - octPoolSub);
  const needVat = r2(T.vat - namedOctVat - octPoolVat);
  const needGrandPaid = r2(T.paidOctGrand - namedPaidOctGrand); // 115,297.50
  const gap: Record<BranchCode, number> = {
    HO: r2(T.branch.HO - namedOctBranchSub.HO - octPoolBranchSub.HO),
    DMM: r2(T.branch.DMM - namedOctBranchSub.DMM - octPoolBranchSub.DMM),
    JED: r2(T.branch.JED - namedOctBranchSub.JED - octPoolBranchSub.JED),
  };
  const counts: Record<BranchCode, number> = { HO: 30, DMM: 25, JED: 24 };
  interface Filler { sub: number; vat: number; branch: BranchCode }
  const fillers: Filler[] = [];
  const planBranch = (bc: BranchCode, n: number, subTotal: number, wholeVat: boolean, vatTotal?: number) => {
    // n−1 whole-riyal rows + 1 plug
    let acc = 0;
    let accVat = 0;
    const avg = subTotal / n;
    for (let i = 0; i < n - 1; i++) {
      const s = Math.max(100, Math.floor(avg * (0.6 + ((i * 37) % 40) / 100)));
      const v = r2((s * 15) / 100);
      fillers.push({ sub: s, vat: v, branch: bc });
      acc = r2(acc + s);
      accVat = r2(accVat + v);
    }
    const pSub = r2(subTotal - acc);
    const pVat = wholeVat ? r2((pSub * 15) / 100) : r2((vatTotal ?? 0) - accVat);
    if (pSub <= 0) throw new Error(`plug sub non-positive for ${bc}: ${pSub}`);
    fillers.push({ sub: pSub, vat: pVat, branch: bc });
  };
  // HO + DMM plugs take exact-15% vat; JED plug absorbs the global vat remainder
  planBranch('HO', counts.HO, gap.HO, true);
  planBranch('DMM', counts.DMM, gap.DMM, true);
  const accVatSoFar = r2(fillers.reduce((a, f) => a + f.vat, 0));
  planBranch('JED', counts.JED, gap.JED, false, r2(needVat - accVatSoFar));
  if (fillers.length !== 79) throw new Error(`filler count ${fillers.length} != 79`);
  // verify pool
  const fSub = r2(fillers.reduce((a, f) => a + f.sub, 0));
  const fVat = r2(fillers.reduce((a, f) => a + f.vat, 0));
  if (Math.abs(fSub - needSub) > 0.005 || Math.abs(fVat - needVat) > 0.005) {
    throw new Error(`pool mismatch: sub ${fSub}/${needSub}, vat ${fVat}/${needVat}`);
  }
  const fillerGrands = fillers.map((f) => r2(f.sub + f.vat));
  const fGrand = r2(fillerGrands.reduce((a, b) => a + b, 0));
  if (Math.abs(fGrand - needGrandPaid) > 0.005) throw new Error(`paid grand mismatch ${fGrand}/${needGrandPaid}`);

  const created: Array<{ id: string; customerId: string; grand: number; day: string }> = [];
  for (let i = 0; i < fillers.length; i++) {
    const f = fillers[i]!;
    const grand = fillerGrands[i]!;
    const c = custCycle[i % custCycle.length]!;
    const day = String(1 + (i % 7)).padStart(2, '0');
    const inv = await prisma.invoice.create({
      data: {
        organizationId: org.id, number: `INV-2026-${String(200 + i)}`, type: 'TAX', status: 'paid',
        customerId: c.id, branchId: branches[f.branch].id, issueDate: d(`2026-10-${day}`), dueDate: d(`2026-11-${day}`),
        currency: 'SAR', subtotal: f.sub, vatTotal: f.vat, grandTotal: grand, amountPaid: grand, balanceDue: 0,
        issuedAt: d(`2026-10-${day}`), issuedById: ahmed.id,
        lines: { create: [{ organizationId: org.id, position: 0, description: 'Services — October', qty: 1, unit: 'job', unitPrice: f.sub, discountPct: 0, vatRate: 15, netAmount: f.sub, vatAmount: f.vat, lineTotal: grand }] },
      },
    });
    created.push({ id: inv.id, customerId: c.id, grand, day });
  }

  // ── October receipts by method (exact splits; one invoice's payment may split across methods) ──
  // Invariant Σneeds = Σgrands ⇒ greedy take-min allocates every invoice fully and closes all needs.
  const methodNeed: Record<string, number> = {
    bank: r2(T.methods.bank! - (25000 + 23300 + 17940)),
    mada: r2(T.methods.mada! - 0),
    cash: r2(T.methods.cash! - namedOctPayCash),
    apple_pay: T.methods.apple_pay!,
    cheque: T.methods.cheque!,
  };
  const methodOrder = ['bank', 'mada', 'cash', 'apple_pay', 'cheque'];
  for (const f of created) {
    let rest = f.grand;
    for (const mk of methodOrder) {
      if (rest <= 0) break;
      const take = Math.min(methodNeed[mk]!, rest);
      if (take <= 0) continue;
      await pay({ invoiceId: f.id, customerId: f.customerId, amount: r2(take), method: mk as PayMethod, date: `2026-10-${f.day}`, by: reem.id });
      rest = r2(rest - take);
      methodNeed[mk] = r2(methodNeed[mk]! - take);
    }
    if (rest > 0) throw new Error(`payment allocation shortfall on ${f.id}: ${rest}`);
  }
  for (const mk of methodOrder) {
    if (Math.abs(methodNeed[mk]!) > 0.005) throw new Error(`method ${mk} remainder ${methodNeed[mk]}`);
  }

  // ── October expenses Σ 126,480 incl, recoverable VAT Σ 18,972 ──
  const octExp: Array<[string, string, number, number, BranchCode]> = [
    ['salaries', 'October salaries', 52000, 0, 'HO'],
    ['rent', 'Office rent — Riyadh HQ', 23000, 3450, 'HO'],
    ['rent', 'Office rent — Dammam', 4850, 0, 'DMM'],
    ['operations', 'Utilities & telecom', 6100, 915, 'HO'],
    ['operations', 'Maintenance & cleaning', 8300, 1245, 'HO'],
    ['marketing', 'Marketing campaign', 12000, 1800, 'HO'],
    ['operations', 'Logistics & delivery', 9730, 1459.5, 'DMM'],
    ['operations', 'Office supplies', 4200, 630, 'JED'],
    ['marketing', 'Events & sponsorship', 6300, 945, 'JED'],
    ['operations', 'Professional services', 5000, 750, 'HO'],
  ];
  let expSum = 0;
  let vatSum = 0;
  for (const [ck, desc, incl, vat, bc] of octExp) {
    const catRow = await prisma.expenseCategory.findFirst({ where: { organizationId: org.id, key: ck } });
    await prisma.expense.create({
      data: { organizationId: org.id, categoryId: catRow?.id, description: desc, date: d('2026-10-05'), amountInclVat: incl, vatAmount: vat, recoverable: vat > 0, branchId: branches[bc].id, status: 'approved' },
    });
    expSum = r2(expSum + incl);
    vatSum = r2(vatSum + vat);
  }
  {
    const catRow = await prisma.expenseCategory.findFirst({ where: { organizationId: org.id, key: 'operations' } });
    await prisma.expense.create({
      data: { organizationId: org.id, categoryId: catRow?.id, description: 'Miscellaneous operations', date: d('2026-10-06'), amountInclVat: r2(T.expensesOct - expSum), vatAmount: r2(T.inputVatQ4 - vatSum), recoverable: true, branchId: ho.id, status: 'approved' },
    });
  }

  // ── verification (§8 numbers) ──
  const sum = async (model: 'invoice' | 'payment' | 'expense', where: object, field: string) => {
    // @ts-expect-error dynamic delegate
    const rows = await prisma[model].findMany({ where, select: { [field]: true } });
    return r2(rows.reduce((a: number, r: Record<string, { toNumber(): number }>) => a + r[field]!.toNumber(), 0));
  };
  const octIssued = { organizationId: org.id, type: { in: ['TAX', 'SIMPLIFIED'] }, status: { notIn: ['draft', 'cancelled'] }, issueDate: { gte: d('2026-10-01'), lt: d('2026-11-01') } };
  const sales = await sum('invoice', octIssued, 'subtotal');
  const vatOut = await sum('invoice', octIssued, 'vatTotal');
  const credits = await sum('invoice', { organizationId: org.id, type: 'CREDIT_NOTE', status: 'credited', issueDate: { gte: d('2026-10-01'), lt: d('2026-11-01') } }, 'grandTotal');
  const expenses = await sum('expense', { organizationId: org.id, status: { in: ['approved', 'paid'] }, date: { gte: d('2026-10-01'), lt: d('2026-11-01') } }, 'amountInclVat');
  const inputVat = await sum('expense', { organizationId: org.id, status: { in: ['approved', 'paid'] }, recoverable: true, date: { gte: d('2026-10-01'), lt: d('2026-11-01') } }, 'vatAmount');
  const paidInOct = { organizationId: org.id, status: 'paid' as const, payments: { some: { date: { gte: d('2026-10-01'), lt: d('2026-11-01') } } } };
  const paidSum = await sum('invoice', paidInOct, 'grandTotal');
  const openDocs = await prisma.invoice.findMany({ where: { organizationId: org.id, status: { in: ['issued', 'viewed', 'sent', 'partially_paid', 'pending'] }, balanceDue: { gt: 0 } }, select: { grandTotal: true, dueDate: true } });
  const today = d('2026-10-07');
  let unpaid = 0;
  let overdue = 0;
  for (const r of openDocs) {
    if (r.dueDate && r.dueDate < today) overdue = r2(overdue + r.grandTotal!.toNumber());
    else unpaid = r2(unpaid + r.grandTotal!.toNumber());
  }
  const report: Array<[string, number, number]> = [
    ['sales', sales, T.salesSub],
    ['vat', vatOut, T.vat],
    ['net', r2(sales + credits), r2(T.salesSub - T.creditSub)],
    ['expenses', expenses, T.expensesOct],
    ['profit', r2(r2(sales + credits) - expenses), 115130.5],
    ['inputVat', inputVat, T.inputVatQ4],
    ['netVat', r2(vatOut - inputVat), 18367.58],
    ['paidOct', paidSum, T.paidOctGrand],
    ['unpaid', unpaid, T.unpaid],
    ['overdue', overdue, T.overdue],
    ['outstanding', r2(unpaid + overdue), 95450],
  ];
  let failed = false;
  for (const [k, got, want] of report) {
    const ok = Math.abs(got - want) < 0.005;
    if (!ok) failed = true;
    console.log(`  seed check ${k}: got ${got}, want ${want} ${ok ? 'OK' : 'MISMATCH'}`);
  }
  const paidCount = await prisma.invoice.count({ where: paidInOct });
  console.log(`  seed check paidOctCount: got ${paidCount}, want 82 ${paidCount === 82 ? 'OK' : 'MISMATCH'}`);
  if (paidCount !== 82) failed = true;
  const q3out = await sum('invoice', { organizationId: org.id, type: { in: ['TAX', 'SIMPLIFIED'] }, status: { notIn: ['draft', 'cancelled'] }, issueDate: { gte: d('2026-07-01'), lt: d('2026-10-01') } }, 'vatTotal');
  const q3in = await sum('expense', { organizationId: org.id, status: { in: ['approved', 'paid'] }, recoverable: true, date: { gte: d('2026-07-01'), lt: d('2026-10-01') } }, 'vatAmount');
  const q3net = r2(q3out - q3in);
  console.log(`  seed check q3net: got ${q3net}, want 49125 ${Math.abs(q3net - 49125) < 0.005 ? 'OK' : 'MISMATCH'}`);
  if (Math.abs(q3net - 49125) >= 0.005) failed = true;
  if (failed) throw new Error('Seed verification failed (see MISMATCH lines above)');
  console.log('Seed complete (phase 4: demo workspace). Login: demo@zatcaweb.sa / Demo@12345');
}

async function main() {
  if (process.env.NODE_ENV === 'production') {
    console.log('Skipping demo seed in production.');
  } else {
    await seedSystemInfo();
    await seedPermissions();
    await seedSystemRoles();
    await seedDemo();
  }
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
