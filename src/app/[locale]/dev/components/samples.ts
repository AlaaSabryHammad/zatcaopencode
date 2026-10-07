/**
 * Fixture data for the dev component gallery — copied from design/design-system/previews/*.html
 * so the gallery can be compared side by side with the reference. Not UI copy; never imported by app routes.
 */
import type { ComplianceStatusKey, InvoiceStatusKey, NavItem, Org } from '@/components/zw';

type Bi = { en: string; ar: string };
const bi = (en: string, ar: string): Bi => ({ en, ar });

export const NAV: Array<{
  heading?: Bi;
  items: Array<
    Omit<NavItem, 'label' | 'children'> & {
      label: Bi;
      children?: Array<{ id: string; label: Bi; badge?: number }>;
    }
  >;
}> = [
  { items: [{ id: 'dash', label: bi('Dashboard', 'لوحة التحكم'), icon: 'layout-dashboard' }] },
  {
    heading: bi('Sales', 'المبيعات'),
    items: [
      {
        id: 'sales',
        label: bi('Sales', 'المبيعات'),
        icon: 'receipt',
        children: [
          { id: 'invoices', label: bi('Invoices', 'الفواتير'), badge: 18 },
          { id: 'quotes', label: bi('Quotations', 'عروض الأسعار') },
          { id: 'credit', label: bi('Credit & debit notes', 'الإشعارات الدائنة والمدينة') },
          { id: 'recurring', label: bi('Recurring', 'الفواتير المتكررة') },
        ],
      },
      { id: 'customers', label: bi('Customers', 'العملاء'), icon: 'users' },
      { id: 'payments', label: bi('Payments', 'المدفوعات'), icon: 'wallet' },
    ],
  },
  {
    heading: bi('Purchases', 'المشتريات'),
    items: [
      { id: 'purchases', label: bi('Purchases', 'المشتريات'), icon: 'shopping-cart' },
      { id: 'expenses', label: bi('Expenses', 'المصروفات'), icon: 'banknote' },
      { id: 'suppliers', label: bi('Suppliers', 'الموردون'), icon: 'truck' },
      { id: 'products', label: bi('Products & services', 'المنتجات والخدمات'), icon: 'package' },
      { id: 'inventory', label: bi('Inventory', 'المخزون'), icon: 'warehouse' },
    ],
  },
  {
    heading: bi('Finance', 'المالية'),
    items: [
      { id: 'reports', label: bi('Reports', 'التقارير'), icon: 'chart-column' },
      { id: 'accounting', label: bi('Accounting', 'المحاسبة'), icon: 'calculator' },
      { id: 'vat', label: bi('VAT Center', 'مركز ضريبة القيمة المضافة'), icon: 'percent' },
      {
        id: 'einv',
        label: bi('E-Invoicing', 'الفوترة الإلكترونية'),
        icon: 'shield-check',
        badge: 2,
        badgeTone: 'danger',
      },
    ],
  },
  {
    heading: bi('Workspace', 'مساحة العمل'),
    items: [
      { id: 'branches', label: bi('Branches', 'الفروع'), icon: 'building-2' },
      { id: 'users', label: bi('Users & roles', 'المستخدمون والأدوار'), icon: 'user-cog' },
      { id: 'integrations', label: bi('Integrations', 'التكاملات'), icon: 'plug' },
      { id: 'settings', label: bi('Settings', 'الإعدادات'), icon: 'settings' },
      { id: 'help', label: bi('Help & support', 'المساعدة والدعم'), icon: 'life-buoy' },
    ],
  },
];

export function navFor(lang: 'ar' | 'en'): Array<{ heading?: string; items: NavItem[] }> {
  return NAV.map((s) => ({
    heading: s.heading?.[lang],
    items: s.items.map((it) => ({
      ...it,
      label: it.label[lang],
      children: it.children?.map((c) => ({ ...c, label: c.label[lang] })),
    })),
  }));
}

export const ORGS: Org[] = [
  { id: 'o1', name: 'شركة آفاق التقنية المحدودة', vat: '310123456700003', role: 'Owner', plan: 'Business' },
  { id: 'o2', name: 'Afaq Trading Est.', vat: '311987654300003', role: 'Accountant', plan: 'Starter' },
  { id: 'o3', name: 'مؤسسة إبراهيم للمقاولات', vat: '300555666700003', role: 'Viewer', plan: 'Professional' },
];

export const QUICK = [
  { label: bi('New invoice', 'فاتورة جديدة'), icon: 'receipt', shortcut: 'N' },
  { label: bi('New quotation', 'عرض سعر جديد'), icon: 'file-text', shortcut: 'Q' },
  { label: bi('New customer', 'عميل جديد'), icon: 'user-plus', shortcut: 'C' },
  { label: bi('New product', 'منتج جديد'), icon: 'package', shortcut: 'P' },
  { label: bi('New expense', 'مصروف جديد'), icon: 'banknote', shortcut: 'E' },
  { label: bi('New supplier', 'مورد جديد'), icon: 'truck' },
  { label: bi('Record payment', 'تسجيل دفعة'), icon: 'wallet', shortcut: 'R' },
];

export interface InvoiceRow {
  id: string;
  customer: string;
  branch: Bi;
  issued: string;
  due: string;
  total: number;
  status: InvoiceStatusKey;
  zatca: ComplianceStatusKey;
}

export const INVOICES: InvoiceRow[] = [
  {
    id: 'INV-2026-00126',
    customer: 'شركة الخليج للخدمات',
    branch: bi('Jeddah', 'جدة'),
    issued: '07 Oct 2026',
    due: '06 Nov 2026',
    total: 13200,
    status: 'sent',
    zatca: 'accepted',
  },
  {
    id: 'INV-2026-00125',
    customer: 'مؤسسة النور التجارية',
    branch: bi('Dammam', 'الدمام'),
    issued: '05 Oct 2026',
    due: '04 Nov 2026',
    total: 8625,
    status: 'partially_paid',
    zatca: 'accepted',
  },
  {
    id: 'INV-2026-00124',
    customer: 'شركة البناء الحديث',
    branch: bi('Riyadh', 'الرياض'),
    issued: '01 Oct 2026',
    due: '31 Oct 2026',
    total: 48300,
    status: 'paid',
    zatca: 'accepted',
  },
  {
    id: 'INV-2026-00123',
    customer: 'Al Waha Hospitality Co.',
    branch: bi('Head Office', 'المكتب الرئيسي'),
    issued: '22 Sep 2026',
    due: '06 Oct 2026',
    total: 3105,
    status: 'overdue',
    zatca: 'warning',
  },
  {
    id: 'INV-2026-00122',
    customer: 'شركة البناء الحديث',
    branch: bi('Riyadh', 'الرياض'),
    issued: '18 Sep 2026',
    due: '18 Oct 2026',
    total: 21850,
    status: 'viewed',
    zatca: 'accepted',
  },
  {
    id: 'INV-2026-00121',
    customer: 'مؤسسة الريان للتوريدات',
    branch: bi('Dammam', 'الدمام'),
    issued: '15 Sep 2026',
    due: '—',
    total: 5750,
    status: 'draft',
    zatca: 'not_validated',
  },
  {
    id: 'INV-2026-00120',
    customer: 'شركة الخليج للخدمات',
    branch: bi('Jeddah', 'جدة'),
    issued: '11 Sep 2026',
    due: '11 Oct 2026',
    total: 17940,
    status: 'paid',
    zatca: 'accepted',
  },
  {
    id: 'INV-2026-00119',
    customer: 'Najd Logistics LLC',
    branch: bi('Riyadh', 'الرياض'),
    issued: '09 Sep 2026',
    due: '09 Oct 2026',
    total: 9890,
    status: 'credited',
    zatca: 'accepted',
  },
  {
    id: 'INV-2026-00118',
    customer: 'مؤسسة النور التجارية',
    branch: bi('Dammam', 'الدمام'),
    issued: '02 Sep 2026',
    due: '02 Oct 2026',
    total: 4320,
    status: 'paid',
    zatca: 'rejected',
  },
];

export const CUSTOMERS = [
  {
    value: 'c1',
    label: 'شركة البناء الحديث',
    description: 'VAT 300456789100003 · Riyadh',
    meta: 'SAR 48,200 due',
    avatar: true,
    square: true,
  },
  {
    value: 'c2',
    label: 'مؤسسة النور التجارية',
    description: 'VAT 310987654300003 · Dammam',
    meta: 'SAR 12,750 due',
    avatar: true,
    square: true,
  },
  {
    value: 'c3',
    label: 'شركة الخليج للخدمات',
    description: 'VAT 302233445500003 · Jeddah',
    meta: 'Paid up',
    avatar: true,
    square: true,
  },
  {
    value: 'c4',
    label: 'Al Waha Hospitality Co.',
    description: 'VAT 311122233300003 · Khobar',
    meta: 'SAR 3,100 due',
    avatar: true,
    square: true,
  },
];

export const ICON_SAMPLE = [
  'layout-dashboard',
  'receipt',
  'file-text',
  'users',
  'truck',
  'package',
  'wallet',
  'credit-card',
  'landmark',
  'chart-column',
  'calculator',
  'shield-check',
  'building-2',
  'qr-code',
  'scan-line',
  'sparkles',
  'bell',
  'settings',
  'search',
  'plus',
  'send',
  'printer',
  'download',
  'share-2',
  'message-circle',
  'calendar',
  'clock',
  'circle-check',
  'circle-alert',
  'triangle-alert',
  'languages',
  'command',
  'workflow',
  'banknote',
  'percent',
  'store',
];
