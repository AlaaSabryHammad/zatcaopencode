'use client';

/* Demos mirror design/design-system/previews/<Name>.html one-to-one (same props, same fixtures). */

import * as React from 'react';
import {
  Accordion,
  Alert,
  Amount,
  AppShell,
  Avatar,
  AvatarGroup,
  Badge,
  Breadcrumb,
  Button,
  Card,
  Checkbox,
  Combobox,
  CommandMenu,
  ComplianceStatus,
  CurrencyInput,
  DataGrid,
  DatePicker,
  Dialog,
  Drawer,
  DropdownMenu,
  EmptyState,
  FileUpload,
  FilterChip,
  Icon,
  IconButton,
  Input,
  Insight,
  InvoiceStatus,
  Logo,
  OrgSwitcher,
  PageHeader,
  Pagination,
  PhoneInput,
  QrPanel,
  QuoteStatus,
  SegmentedControl,
  Select,
  Sidebar,
  Skeleton,
  StatCard,
  Stepper,
  Switch,
  Table,
  Tabs,
  Timeline,
  ToastStack,
  Tooltip,
  Topbar,
  UsageMeter,
  VatInput,
  tlvBase64,
  useLang,
  useToast,
  type ComplianceStatusKey,
  type InvoiceStatusKey,
  type TableColumn,
} from '@/components/zw';
import { Ar, En, useS } from './scope';
import { CUSTOMERS, ICON_SAMPLE, INVOICES, ORGS, QUICK, navFor, type InvoiceRow } from './samples';

const row = 'flex flex-wrap items-center gap-3';
const col = 'flex flex-col gap-3';
const grid2 = 'grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]';
const grid3 = 'grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]';
const panel = 'rounded-lg border border-border bg-surface p-4';
const stage = 'relative overflow-hidden rounded-lg border border-border bg-canvas';
const lbl = 'mb-2 text-overline uppercase text-fg-muted';

function useQuick() {
  const lang = useLang();
  return QUICK.map((q) => ({ ...q, label: q.label[lang] }));
}

function useInvoiceColumns(): TableColumn<InvoiceRow>[] {
  const s = useS();
  const lang = useLang();
  return [
    {
      key: 'id',
      header: s('Invoice', 'الفاتورة'),
      sortable: true,
      render: (r) => (
        <span className="zw-mono font-medium text-fg" dir="ltr">
          {r.id}
        </span>
      ),
    },
    {
      key: 'customer',
      header: s('Customer', 'العميل'),
      sortable: true,
      render: (r) => (
        <span className="inline-flex items-center gap-2.5">
          <Avatar name={r.customer} size="sm" square />
          <span className="zw-cell-primary">
            <b>
              <bdi>{r.customer}</bdi>
            </b>
            <small>{r.branch[lang]}</small>
          </span>
        </span>
      ),
    },
    { key: 'issued', header: s('Issued', 'تاريخ الإصدار'), render: (r) => <span dir="ltr">{r.issued}</span> },
    { key: 'due', header: s('Due', 'الاستحقاق'), render: (r) => <span dir="ltr">{r.due}</span> },
    {
      key: 'zatca',
      header: s('E-invoice', 'الفوترة الإلكترونية'),
      render: (r) => <ComplianceStatus status={r.zatca} size="sm" />,
    },
    {
      key: 'status',
      header: s('Status', 'الحالة'),
      render: (r) => <InvoiceStatus status={r.status} size="sm" />,
    },
    {
      key: 'total',
      header: s('Total', 'الإجمالي'),
      align: 'end',
      sortable: true,
      numeric: true,
      render: (r) => <Amount value={r.total} />,
    },
  ];
}

/* ───────────────────────────── demos ───────────────────────────── */

function AccordionDemo() {
  const s = useS();
  return (
    <Accordion
      defaultOpen={['qr']}
      items={[
        {
          id: 'qr',
          icon: 'qr-code',
          title: s('What does the QR code on an invoice contain?', 'ماذا يحتوي رمز QR في الفاتورة؟'),
          content: s(
            'For simplified tax invoices, the QR carries the seller name, VAT number, timestamp, invoice total and VAT total, plus cryptographic fields once your device is onboarded. ZatcaWeb only shows the QR after the invoice is issued and validated.',
            'في الفواتير الضريبية المبسطة يحمل الرمز اسم البائع والرقم الضريبي ووقت الإصدار وإجمالي الفاتورة وإجمالي الضريبة، إضافة إلى الحقول التشفيرية بعد ربط جهازك. لا يعرض زاتكا ويب الرمز إلا بعد إصدار الفاتورة والتحقق منها.',
          ),
        },
        {
          id: 'multi',
          icon: 'building-2',
          title: s('Can I manage several establishments?', 'هل يمكنني إدارة أكثر من منشأة؟'),
          subtitle: s('Organizations & workspaces', 'المنشآت ومساحات العمل'),
          content: s(
            'Yes — each organization gets an isolated workspace. Switch between them from the organization switcher.',
            'نعم، لكل منشأة مساحة عمل مستقلة. بدّل بينها من قائمة المنشآت.',
          ),
        },
        {
          id: 'export',
          icon: 'download',
          title: s('How do I export my data?', 'كيف أصدّر بياناتي؟'),
          content: s(
            'Settings → Data & Privacy → Export. Choose Excel, CSV or PDF.',
            'الإعدادات ← البيانات والخصوصية ← تصدير. اختر Excel أو CSV أو PDF.',
          ),
        },
      ]}
    />
  );
}

function AlertDemo() {
  const s = useS();
  return (
    <div className={col}>
      <Alert
        tone="warning"
        title={s('Certificate expires in 12 days', 'تنتهي صلاحية الشهادة خلال 12 يومًا')}
        action={
          <Button size="sm" variant="secondary">
            {s('Renew', 'تجديد')}
          </Button>
        }
      >
        {s(
          'Renew the Riyadh device certificate to keep reporting invoices without interruption.',
          'جدّد شهادة جهاز الرياض لمواصلة الإبلاغ عن الفواتير دون انقطاع.',
        )}
      </Alert>
      <Alert
        tone="danger"
        title={s('2 invoices were rejected', 'تم رفض فاتورتين')}
        action={
          <Button size="sm" variant="secondary">
            {s('Review errors', 'مراجعة الأخطاء')}
          </Button>
        }
      >
        {s(
          'Fix the listed errors and resubmit. Rejected invoices are not valid until accepted.',
          'صحّح الأخطاء المذكورة وأعد الإرسال. الفواتير المرفوضة غير صالحة حتى يتم قبولها.',
        )}
      </Alert>
      <Alert
        tone="success"
        title={s('VAT return for Q3 2026 is ready', 'إقرار ضريبة القيمة المضافة للربع الثالث 2026 جاهز')}
        onClose={() => {}}
      />
      <Ar>
        <Alert tone="info" title="تمت مزامنة ١٢٤ فاتورة">
          آخر مزامنة قبل دقيقتين.
        </Alert>
      </Ar>
    </div>
  );
}

function AmountDemo() {
  return (
    <div className={col}>
      <div className="flex flex-wrap items-baseline gap-7">
        <Amount value={248930.5} size="hero" />
        <Amount value={13200} size="kpi" />
        <Amount value={1980} size="lg" />
        <Amount value={450.75} />
        <Amount value={-3200} tone="danger" />
        <Amount value={1250000} compact size="lg" />
      </div>
      <Ar>
        <div className="flex flex-wrap items-baseline gap-7">
          <Amount value={248930.5} size="kpi" />
          <Amount value={13200} size="lg" currencyDisplay="both" />
        </div>
      </Ar>
    </div>
  );
}

function AppShellDemo() {
  const s = useS();
  const lang = useLang();
  const quick = useQuick();
  return (
    <div className={stage} style={{ height: 680 }}>
      <AppShell
        height="100%"
        sidebar={
          <Sidebar
            sections={navFor(lang)}
            active="dash"
            plan={{
              name: s('Business plan', 'باقة الأعمال'),
              badge: s('Renews 1 Jan', 'تتجدد 1 يناير'),
              used: 412,
              limit: 1000,
              meter: s('412 / 1,000 invoices this month', '412 / 1,000 فاتورة هذا الشهر'),
            }}
            orgs={ORGS}
            currentOrg="o1"
          />
        }
        topbar={
          <Topbar
            title={s('Dashboard', 'لوحة التحكم')}
            quickCreate={quick}
            notifications={3}
            user={{ name: s('Faisal Al-Otaibi', 'فيصل العتيبي') }}
          />
        }
      >
        <PageHeader
          kicker={s('Wednesday, 7 October 2026', 'الأربعاء، 7 أكتوبر 2026')}
          title={s('Good morning, Faisal', 'صباح الخير، فيصل')}
          description={s(
            'Here is how شركة آفاق التقنية is performing this month.',
            'هذا أداء شركة آفاق التقنية هذا الشهر.',
          )}
          actions={
            <SegmentedControl
              size="sm"
              defaultValue="m"
              options={[
                { value: 'w', label: s('Week', 'أسبوع') },
                { value: 'm', label: s('Month', 'شهر') },
                { value: 'q', label: s('Quarter', 'ربع') },
                { value: 'y', label: s('Year', 'سنة') },
              ]}
            />
          }
        />
        <div className={grid3}>
          <StatCard
            emphasis
            label={s('Total sales', 'إجمالي المبيعات')}
            icon="chart-column"
            value={248930.5}
            delta={12.4}
          />
          <StatCard
            label={s('VAT collected', 'الضريبة المحصّلة')}
            icon="percent"
            tone="accent"
            value={37339.58}
            delta={9.8}
          />
          <StatCard
            label={s('Outstanding', 'المستحقات')}
            icon="clock"
            tone="warning"
            value={95450}
            delta={18}
            invert
          />
        </div>
        <div className="h-4" />
        <Card title={s('Revenue vs expenses', 'الإيرادات مقابل المصروفات')}>
          <ChartPlaceholder />
        </Card>
      </AppShell>
    </div>
  );
}

function AvatarDemo() {
  return (
    <div className={`${row} gap-5`}>
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((sz) => (
        <Avatar key={sz} name="Faisal Al-Otaibi" size={sz} status={sz === 'lg' ? 'online' : undefined} />
      ))}
      <Avatar name="شركة آفاق التقنية" size="lg" square />
      <Avatar name="نورة القحطاني" size="lg" />
      <AvatarGroup
        names={['Faisal Al-Otaibi', 'Noura Alqahtani', 'Ahmed Saleh', 'Reem Hassan', 'Omar Zahrani', 'Lama']}
        size="md"
      />
    </div>
  );
}

function BadgeDemo() {
  const s = useS();
  const tones = [
    ['neutral', s('Neutral', 'محايد')],
    ['brand', s('Brand', 'العلامة')],
    ['success', s('Success', 'نجاح')],
    ['warning', s('Warning', 'تحذير')],
    ['danger', s('Danger', 'خطر')],
    ['info', s('Info', 'معلومة')],
    ['accent', s('Accent', 'مميّز')],
  ] as const;
  return (
    <div className={col}>
      <div className={row}>
        {tones.map(([tone, label]) => (
          <Badge key={tone} tone={tone} dot>
            {label}
          </Badge>
        ))}
      </div>
      <div className={row}>
        <Badge tone="accent" icon="sparkles">
          {s('New', 'جديد')}
        </Badge>
        <Badge tone="brand" size="sm">
          {s('VAT 15%', 'ضريبة 15%')}
        </Badge>
        <Badge tone="neutral" size="sm">
          {s('Zero-rated', 'صفرية')}
        </Badge>
        <Badge tone="info" size="sm" icon="building-2">
          {s('Riyadh branch', 'فرع الرياض')}
        </Badge>
      </div>
    </div>
  );
}

function BreadcrumbDemo() {
  return (
    <div className={col}>
      <En>
        <Breadcrumb
          items={[{ label: 'Sales', icon: 'receipt' }, { label: 'Invoices' }, { label: 'INV-2026-00124' }]}
        />
      </En>
      <Ar>
        <Breadcrumb items={[{ label: 'المبيعات' }, { label: 'الفواتير' }, { label: 'INV-2026-00124' }]} />
      </Ar>
    </div>
  );
}

function ButtonDemo() {
  const s = useS();
  return (
    <div className={col}>
      <div className={row}>
        <Button iconStart="plus" kbd="N">
          {s('New invoice', 'فاتورة جديدة')}
        </Button>
        <Button variant="secondary" iconStart="download">
          {s('Export', 'تصدير')}
        </Button>
        <Button variant="ghost">{s('Cancel', 'إلغاء')}</Button>
        <Button variant="danger" iconStart="trash-2">
          {s('Delete draft', 'حذف المسودة')}
        </Button>
        <Button variant="accent" iconStart="sparkles">
          {s('Upgrade', 'ترقية')}
        </Button>
        <Button variant="link">{s('View all', 'عرض الكل')}</Button>
      </div>
      <div className={row}>
        <Button size="lg">{s('Start free', 'ابدأ مجانًا')}</Button>
        <Button size="sm" variant="secondary" iconStart="list-filter">
          {s('Filters', 'عوامل التصفية')}
        </Button>
        <Button loading>{s('Issuing…', 'جارٍ الإصدار…')}</Button>
        <Button disabled>{s('Disabled', 'معطّل')}</Button>
        <IconButton icon="printer" label={s('Print', 'طباعة')} variant="secondary" />
        <IconButton icon="ellipsis" label={s('More', 'المزيد')} />
        <IconButton icon="bell" label={s('Notifications', 'الإشعارات')} badge={3} />
      </div>
      <Ar>
        <div className={row}>
          <Button iconStart="plus">فاتورة جديدة</Button>
          <Button variant="secondary" iconEnd="arrow-right">
            التالي
          </Button>
          <Button variant="ghost">إلغاء</Button>
        </div>
      </Ar>
    </div>
  );
}

function CardDemo() {
  const s = useS();
  return (
    <div className={grid2}>
      <Card
        title={s('Outstanding invoices', 'الفواتير المستحقة')}
        description={s('7 invoices awaiting payment', '7 فواتير بانتظار الدفع')}
        actions={
          <Button size="sm" variant="ghost" iconEnd="arrow-right">
            {s('View all', 'عرض الكل')}
          </Button>
        }
        footer={
          <Button size="sm" variant="secondary" iconStart="send">
            {s('Send reminders', 'إرسال تذكيرات')}
          </Button>
        }
      >
        <Amount value={86450} size="kpi" />
      </Card>
      <Card
        tone="brand"
        title={s('E-invoicing is set up', 'الفوترة الإلكترونية مُعدّة')}
        description={s(
          'Your devices are onboarded. Every issued invoice is validated before reporting.',
          'تم ربط أجهزتك. يتم التحقق من كل فاتورة صادرة قبل الإبلاغ عنها.',
        )}
      >
        <Button variant="accent" size="sm" iconStart="shield-check">
          {s('Open Compliance Center', 'افتح مركز الامتثال')}
        </Button>
      </Card>
    </div>
  );
}

function ChartPlaceholder() {
  const s = useS();
  return (
    <EmptyState
      compact
      icon="chart-column"
      title={s('Chart arrives in Phase 4', 'الرسم البياني في المرحلة 4')}
      description={s(
        'Built on Recharts with the chart tokens, RTL-aware — see docs/DECISIONS.md.',
        'مبني على Recharts برموز الرسوم البيانية ويدعم الاتجاه من اليمين لليسار — راجع docs/DECISIONS.md.',
      )}
    />
  );
}

function CheckboxDemo() {
  const s = useS();
  return (
    <div className="flex flex-wrap items-start gap-7">
      <Checkbox label={s('Send invoice by email', 'إرسال الفاتورة بالبريد')} defaultChecked />
      <Checkbox
        label={s('Apply bulk discount', 'تطبيق خصم جماعي')}
        description={s('Applies to every line item.', 'يُطبّق على كل البنود.')}
      />
      <Checkbox label={s('Select all', 'تحديد الكل')} indeterminate />
      <Checkbox label={s('Locked', 'مقفل')} disabled defaultChecked />
      <Ar>
        <Checkbox label="إرسال عبر واتساب" defaultChecked />
      </Ar>
    </div>
  );
}

function ComboboxDemo() {
  const s = useS();
  return (
    <div className="max-w-[440px] pb-72">
      <Combobox
        label={s('Customer', 'العميل')}
        required
        options={CUSTOMERS}
        defaultValue="c1"
        defaultOpen
        placeholder={s('Search customers by name or VAT…', 'ابحث عن العملاء بالاسم أو الرقم الضريبي…')}
        onCreate={() => {}}
      />
    </div>
  );
}

function CommandMenuDemo() {
  const s = useS();
  return (
    <div className={stage} style={{ height: 520 }}>
      <CommandMenu
        open
        contained
        onClose={() => {}}
        groups={[
          {
            heading: s('Actions', 'الإجراءات'),
            items: [
              { label: s('Create invoice', 'إنشاء فاتورة'), icon: 'receipt', shortcut: 'N' },
              { label: s('Add expense', 'إضافة مصروف'), icon: 'banknote', shortcut: 'E' },
              { label: s('Record payment', 'تسجيل دفعة'), icon: 'wallet' },
            ],
          },
          {
            heading: s('Invoices', 'الفواتير'),
            items: [
              {
                label: 'INV-2026-00124',
                description: 'شركة البناء الحديث · SAR 48,300.00',
                icon: 'file-text',
                badge: <InvoiceStatus status="paid" size="sm" />,
              },
              {
                label: 'INV-2026-00123',
                description: 'Al Waha Hospitality · SAR 3,105.00',
                icon: 'file-text',
                badge: <InvoiceStatus status="overdue" size="sm" />,
              },
            ],
          },
          {
            heading: s('Go to', 'انتقل إلى'),
            items: [
              { label: s('Customers', 'العملاء'), icon: 'users', shortcut: 'G C' },
              { label: s('VAT report · Q3 2026', 'تقرير الضريبة · الربع الثالث 2026'), icon: 'percent' },
              { label: s('Switch organization', 'تبديل المنشأة'), icon: 'building-2' },
              { label: s('Change theme', 'تغيير المظهر'), icon: 'moon' },
            ],
          },
        ]}
      />
    </div>
  );
}

const ALL_COMPLIANCE: ComplianceStatusKey[] = [
  'not_validated',
  'passed',
  'warning',
  'submission_pending',
  'accepted',
  'rejected',
  'requires_action',
];

function ComplianceStatusDemo() {
  const s = useS();
  return (
    <div className={col}>
      <En>
        <div className={row}>
          {ALL_COMPLIANCE.map((k) => (
            <ComplianceStatus key={k} status={k} />
          ))}
        </div>
      </En>
      <Ar>
        <div className={row}>
          {ALL_COMPLIANCE.map((k) => (
            <ComplianceStatus key={k} status={k} />
          ))}
        </div>
      </Ar>
      <div className={grid2}>
        <ComplianceStatus
          variant="detailed"
          status="accepted"
          detail={s(
            'INV-2026-00124 was reported and accepted by the e-invoicing platform.',
            'تم الإبلاغ عن الفاتورة INV-2026-00124 وقبولها من منصة الفوترة الإلكترونية.',
          )}
          meta="09:42"
        />
        <ComplianceStatus
          variant="detailed"
          status="rejected"
          detail={s(
            'BR-KSA-37: Seller address building number must be 4 digits.',
            'BR-KSA-37: يجب أن يتكوّن رقم مبنى البائع من 4 أرقام.',
          )}
          meta="09:40"
        />
      </div>
    </div>
  );
}

function CurrencyInputDemo() {
  const s = useS();
  return (
    <div className={grid3}>
      <CurrencyInput label={s('Unit price', 'سعر الوحدة')} defaultValue={12500} />
      <CurrencyInput
        label={s('Credit limit', 'الحد الائتماني')}
        defaultValue={250000}
        decimals={0}
        hint={s('Applies across all branches.', 'يُطبّق على كل الفروع.')}
      />
      <Ar>
        <CurrencyInput label="المبلغ المدفوع" defaultValue={3200.5} />
      </Ar>
    </div>
  );
}

function DataGridDemo() {
  const s = useS();
  const cols = useInvoiceColumns().filter((c) => c.key !== 'due');
  const { toast } = useToast();
  return (
    <DataGrid<InvoiceRow>
      columns={cols}
      rows={INVOICES}
      pageSize={6}
      searchPlaceholder={s('Search invoice # or customer…', 'ابحث برقم الفاتورة أو العميل…')}
      searchKeys={['id', 'customer']}
      filters={
        <>
          <FilterChip
            label={s('Status', 'الحالة')}
            value={s('Unpaid', 'غير مدفوعة')}
            active
            onRemove={() => {}}
          />
          <FilterChip label={s('Branch', 'الفرع')} icon="building-2" />
          <FilterChip label={s('Date', 'التاريخ')} icon="calendar" />
        </>
      }
      actions={
        <>
          <Button size="sm" variant="secondary" iconStart="download">
            {s('Export', 'تصدير')}
          </Button>
          <Button size="sm" iconStart="plus">
            {s('New invoice', 'فاتورة جديدة')}
          </Button>
        </>
      }
      bulkActions={[
        {
          label: s('Send reminders', 'إرسال تذكيرات'),
          icon: 'send',
          onClick: (ids) =>
            toast({
              tone: 'success',
              title: s(
                `Reminders queued for ${ids.length} invoices`,
                `تمت جدولة تذكيرات لـ ${ids.length} فواتير`,
              ),
            }),
        },
        { label: s('Download PDFs', 'تنزيل ملفات PDF'), icon: 'download' },
        { label: s('Cancel', 'إلغاء'), icon: 'x', danger: true },
      ]}
    />
  );
}

function DatePickerDemo() {
  return (
    <div className="flex flex-wrap items-start gap-6 pb-80">
      <En className="w-[300px]">
        <DatePicker
          label="Issue date"
          defaultValue="2026-10-07"
          today="2026-10-07"
          defaultOpen
          showHijri
          presets={[{ label: '+30 days', value: '2026-11-06' }]}
        />
      </En>
      <Ar className="w-[260px]">
        <DatePicker label="تاريخ الاستحقاق" defaultValue="2026-11-06" today="2026-10-07" showHijri />
      </Ar>
    </div>
  );
}

function DialogDemo() {
  const s = useS();
  const [open, setOpen] = React.useState(true);
  return (
    <div className={stage} style={{ height: 360 }}>
      {!open ? (
        <div className="grid h-full place-items-center">
          <Button variant="danger-ghost" iconStart="x" onClick={() => setOpen(true)}>
            {s('Cancel invoice…', 'إلغاء الفاتورة…')}
          </Button>
        </div>
      ) : null}
      <Dialog
        open={open}
        contained
        tone="danger"
        title={s('Cancel invoice INV-2026-00126?', 'إلغاء الفاتورة INV-2026-00126؟')}
        description={s(
          'Issued tax invoices can’t be deleted. Cancelling creates a credit note for SAR 13,200.00 and reports it. This action is logged in the audit trail.',
          'لا يمكن حذف الفواتير الضريبية الصادرة. سيُنشئ الإلغاء إشعارًا دائنًا بمبلغ 13,200.00 ر.س ويبلغ عنه. يُسجَّل هذا الإجراء في سجل التدقيق.',
        )}
        onClose={() => setOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              {s('Keep invoice', 'الإبقاء على الفاتورة')}
            </Button>
            <Button variant="danger" iconStart="file-minus">
              {s('Create credit note', 'إنشاء إشعار دائن')}
            </Button>
          </>
        }
      >
        <Input
          label={s('Reason', 'السبب')}
          placeholder={s('e.g. Wrong quantity on line 2', 'مثال: كمية خاطئة في البند 2')}
          required
        />
      </Dialog>
    </div>
  );
}

function DrawerDemo() {
  const s = useS();
  const [open, setOpen] = React.useState(true);
  return (
    <div className={stage} style={{ height: 480 }}>
      {!open ? (
        <div className="grid h-full place-items-center">
          <Button iconStart="wallet" onClick={() => setOpen(true)}>
            {s('Record payment', 'تسجيل دفعة')}
          </Button>
        </div>
      ) : null}
      <Drawer
        open={open}
        contained
        width={420}
        title={s('Record payment', 'تسجيل دفعة')}
        description="INV-2026-00125 · مؤسسة النور التجارية"
        onClose={() => setOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              {s('Cancel', 'إلغاء')}
            </Button>
            <Button iconStart="check">{s('Record payment', 'تسجيل الدفعة')}</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Alert tone="neutral" title={s('Balance due: SAR 5,425.00', 'الرصيد المستحق: 5,425.00 ر.س')} />
          <CurrencyInput label={s('Amount received', 'المبلغ المستلم')} defaultValue={5425} required />
          <Select
            label={s('Method', 'طريقة الدفع')}
            defaultValue="mada"
            options={[
              { value: 'cash', label: s('Cash', 'نقدًا') },
              { value: 'bank', label: s('Bank transfer', 'تحويل بنكي') },
              { value: 'mada', label: s('Mada', 'مدى') },
              { value: 'apple', label: 'Apple Pay' },
              { value: 'cheque', label: s('Cheque', 'شيك') },
            ]}
          />
          <DatePicker label={s('Payment date', 'تاريخ الدفع')} defaultValue="2026-10-07" today="2026-10-07" />
        </div>
      </Drawer>
    </div>
  );
}

function DropdownMenuDemo() {
  const s = useS();
  const quick = useQuick();
  return (
    <div className="flex flex-wrap items-start gap-[260px] pb-80">
      <DropdownMenu
        inline
        defaultOpen
        width={240}
        trigger={<Button iconStart="plus">{s('Create', 'إنشاء')}</Button>}
        items={[{ heading: s('Quick create', 'إنشاء سريع') }, ...quick]}
      />
      <DropdownMenu
        inline
        defaultOpen
        align="start"
        width={220}
        trigger={
          <IconButton icon="ellipsis" label={s('Invoice actions', 'إجراءات الفاتورة')} variant="secondary" />
        }
        items={[
          { label: s('Download PDF', 'تنزيل PDF'), icon: 'download' },
          { label: s('Print', 'طباعة'), icon: 'printer' },
          { label: s('Send email', 'إرسال بالبريد'), icon: 'mail' },
          { label: s('Send WhatsApp', 'إرسال عبر واتساب'), icon: 'message-circle' },
          { label: s('Duplicate', 'تكرار'), icon: 'copy' },
          { divider: true },
          { label: s('Create credit note', 'إنشاء إشعار دائن'), icon: 'file-minus' },
          { label: s('Cancel invoice', 'إلغاء الفاتورة'), icon: 'x', danger: true },
        ]}
      />
    </div>
  );
}

function EmptyStateDemo() {
  return (
    <div className={grid2}>
      <En className={panel}>
        <EmptyState
          art="invoice"
          title="No invoices yet"
          description="Create your first invoice and start tracking your sales."
          action={<Button iconStart="plus">Create invoice</Button>}
          secondaryAction={
            <Button variant="secondary" iconStart="upload">
              Import
            </Button>
          }
        />
      </En>
      <Ar className={panel}>
        <EmptyState
          art="customers"
          title="لا يوجد عملاء بعد"
          description="أضف عميلك الأول لتبدأ بإصدار الفواتير ومتابعة المدفوعات."
          action={<Button iconStart="user-plus">إضافة عميل</Button>}
        />
      </Ar>
    </div>
  );
}

function FileUploadDemo() {
  const s = useS();
  return (
    <div className={grid2}>
      <FileUpload
        label={s('Receipt', 'الإيصال')}
        hint={s(
          'PDF, JPG or PNG up to 10 MB — OCR extraction coming soon',
          'PDF أو JPG أو PNG حتى 10 ميجابايت — الاستخراج التلقائي قريبًا',
        )}
        icon="scan-line"
        files={[
          { name: 'receipt-stc-sept.pdf', size: 248000, status: 'done' },
          { name: 'fuel-aramco-0921.jpg', size: 1840000, status: 'uploading', progress: 64 },
        ]}
      />
      <FileUpload
        label={s('Import customers', 'استيراد العملاء')}
        hint={s('Excel (.xlsx) or CSV', 'Excel (.xlsx) أو CSV')}
        compact
        files={[
          {
            name: 'customers-2026.xlsx',
            size: 88000,
            status: 'error',
            error: s(
              'Row 14: VAT number must be 15 digits',
              'الصف 14: يجب أن يتكون الرقم الضريبي من 15 رقمًا',
            ),
          },
        ]}
      />
    </div>
  );
}

function IconDemo() {
  return (
    <div className={col}>
      <div
        className={`${panel} grid gap-2 text-fg-secondary [grid-template-columns:repeat(auto-fill,minmax(44px,1fr))]`}
      >
        {ICON_SAMPLE.map((n) => (
          <span key={n} title={n} className="grid h-10 place-items-center rounded-md">
            <Icon name={n} size={20} />
          </span>
        ))}
      </div>
      <div className={row}>
        <En className={row}>
          <Icon name="arrow-right" />
          <Icon name="chevron-right" />
          <span className="text-caption text-fg-muted">LTR</span>
        </En>
        <Ar className={row}>
          <Icon name="arrow-right" />
          <Icon name="chevron-right" />
          <span className="text-caption text-fg-muted">RTL — directional icons mirror</span>
        </Ar>
      </div>
    </div>
  );
}

function InputDemo() {
  return (
    <div className={grid2}>
      <En className={col}>
        <Input label="Customer name" required defaultValue="شركة البناء الحديث" />
        <Input
          label="Email"
          iconStart="mail"
          placeholder="billing@company.sa"
          hint="Invoices are sent to this address."
          type="email"
        />
        <Input
          label="Commercial Registration (CR)"
          mono
          defaultValue="20501"
          error="CR number must be 10 digits."
          dir="ltr"
        />
      </En>
      <Ar className={col}>
        <Input label="اسم العميل" required defaultValue="مؤسسة النور التجارية" />
        <Input
          label="البريد الإلكتروني"
          iconStart="mail"
          placeholder="billing@company.sa"
          dir="ltr"
          type="email"
        />
        <Input label="رقم الطلب" optional prefix="PO-" defaultValue="4471" />
      </Ar>
    </div>
  );
}

function InsightDemo() {
  return (
    <div className={grid2}>
      <En>
        <Insight
          kicker="Smart insight"
          action={
            <Button size="sm" variant="secondary" iconStart="send">
              Remind 4 customers
            </Button>
          }
        >
          Your outstanding invoices increased by <strong>18%</strong> compared with last month. Most of it is{' '}
          <strong>شركة البناء الحديث</strong>.
        </Insight>
      </En>
      <Ar>
        <Insight kicker="توصية ذكية">
          ارتفعت المبيعات في فرع الدمام بنسبة <strong>٢٢٪</strong> هذا الشهر. فكّر في زيادة المخزون من
          المنتجات الأكثر مبيعًا.
        </Insight>
      </Ar>
    </div>
  );
}

const ALL_INVOICE: InvoiceStatusKey[] = [
  'draft',
  'pending',
  'issued',
  'sent',
  'viewed',
  'partially_paid',
  'paid',
  'overdue',
  'cancelled',
  'credited',
];

function InvoiceStatusDemo() {
  return (
    <div className={col}>
      <En className={row}>
        {ALL_INVOICE.map((k) => (
          <InvoiceStatus key={k} status={k} />
        ))}
      </En>
      <Ar className={row}>
        {ALL_INVOICE.map((k) => (
          <InvoiceStatus key={k} status={k} />
        ))}
      </Ar>
    </div>
  );
}

function LogoDemo() {
  return (
    <div className={grid2}>
      <div className={`${panel} ${col} items-start gap-5`}>
        <p className={lbl}>Primary lockup</p>
        <Logo size={36} />
        <Logo variant="arabic" size={36} />
      </div>
      <div className={`${panel} ${col} items-start gap-5`}>
        <p className={lbl}>Mark · 48 / 32 / 24 / 16</p>
        <div className={`${row} gap-5`}>
          <Logo variant="mark" size={48} />
          <Logo variant="mark" size={32} />
          <Logo variant="mark" size={24} />
          <Logo variant="mark" size={16} />
        </div>
      </div>
    </div>
  );
}

function OrgSwitcherDemo() {
  return (
    <div className="w-[300px] pt-[230px]">
      <OrgSwitcher orgs={ORGS} current="o1" defaultOpen />
    </div>
  );
}

function PageHeaderDemo() {
  return (
    <div className="flex flex-col">
      <En>
        <PageHeader
          kicker={<Breadcrumb items={[{ label: 'Sales' }, { label: 'Invoices' }]} />}
          title="Invoices"
          description="126 invoices · SAR 1.24M issued this year"
          actions={
            <>
              <Button variant="secondary" iconStart="upload">
                Import
              </Button>
              <Button iconStart="plus" kbd="N">
                New invoice
              </Button>
            </>
          }
        />
      </En>
      <Ar>
        <PageHeader
          title="مركز ضريبة القيمة المضافة"
          description="الربع الثالث ٢٠٢٦ · يستحق الإقرار في ٣١ أكتوبر"
          actions={<Button iconStart="download">تصدير الإقرار</Button>}
        />
      </Ar>
    </div>
  );
}

function PaginationDemo() {
  const [a, setA] = React.useState(4);
  const [b, setB] = React.useState(1);
  return (
    <div className={col}>
      <En>
        <Pagination page={a} pageCount={13} total={126} pageSize={10} onChange={setA} />
      </En>
      <Ar>
        <Pagination page={b} pageCount={3} total={24} pageSize={10} onChange={setB} />
      </Ar>
    </div>
  );
}

function PhoneInputDemo() {
  return (
    <div className={grid3}>
      <En>
        <PhoneInput label="Mobile number" required defaultValue="551234567" />
      </En>
      <Ar>
        <PhoneInput label="رقم الجوال" defaultValue="" />
      </Ar>
    </div>
  );
}

function QrPanelDemo() {
  const payload = React.useMemo(
    () =>
      tlvBase64({
        seller: 'شركة آفاق التقنية المحدودة',
        vat: '310123456700003',
        timestamp: '2026-10-07T09:31:00Z',
        total: '13200.00',
        vatTotal: '1721.74',
      }),
    [],
  );
  return (
    <div className={grid2}>
      <En>
        <QrPanel
          payload={payload}
          steps={{ generated: 'passed', validated: 'passed', compliance: 'accepted', reporting: 'accepted' }}
          footnote="Sample TLV payload (tags 1–5) for SAR 13,200.00 incl. VAT."
        />
      </En>
      <Ar>
        <QrPanel
          steps={{
            generated: 'not_validated',
            validated: 'requires_action',
            compliance: 'not_validated',
            reporting: 'submission_pending',
          }}
          footnote="لا يُعرض رمز QR قبل إصدار الفاتورة والتحقق منها."
        />
      </Ar>
    </div>
  );
}

function QuoteStatusDemo() {
  return (
    <div className={row}>
      {(['draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired'] as const).map((k) => (
        <QuoteStatus key={k} status={k} />
      ))}
    </div>
  );
}

function SegmentedControlDemo() {
  const s = useS();
  return (
    <div className={`${row} gap-5`}>
      <SegmentedControl
        label={s('Period', 'الفترة')}
        defaultValue="month"
        options={[
          { value: 'today', label: s('Today', 'اليوم') },
          { value: 'week', label: s('This week', 'هذا الأسبوع') },
          { value: 'month', label: s('This month', 'هذا الشهر') },
          { value: 'q', label: s('Quarter', 'ربع سنوي') },
          { value: 'y', label: s('Year', 'سنة') },
          { value: 'c', label: s('Custom', 'مخصص'), icon: 'calendar' },
        ]}
      />
      <Ar>
        <SegmentedControl
          size="sm"
          options={[
            { value: 'ar', label: 'عربي' },
            { value: 'en', label: 'English' },
            { value: 'bi', label: 'ثنائي اللغة' },
          ]}
        />
      </Ar>
    </div>
  );
}

function SelectDemo() {
  const s = useS();
  return (
    <div className={grid3}>
      <Select
        label={s('Payment terms', 'شروط الدفع')}
        defaultValue="net30"
        options={[
          { value: 'due', label: s('Due on receipt', 'عند الاستلام') },
          { value: 'net15', label: s('Net 15', 'خلال 15 يومًا') },
          { value: 'net30', label: s('Net 30', 'خلال 30 يومًا') },
          { value: 'net60', label: s('Net 60', 'خلال 60 يومًا') },
        ]}
      />
      <Select
        label={s('Branch', 'الفرع')}
        iconStart="building-2"
        defaultValue="riy"
        options={[
          { value: 'hq', label: s('Head Office', 'المكتب الرئيسي') },
          { value: 'riy', label: s('Riyadh', 'الرياض') },
          { value: 'dmm', label: s('Dammam', 'الدمام') },
          { value: 'jed', label: s('Jeddah', 'جدة') },
        ]}
      />
      <Ar>
        <Select
          label="نسبة الضريبة"
          defaultValue="15"
          options={[
            { value: '15', label: '١٥٪ — قياسية' },
            { value: '0', label: '٠٪ — صفرية' },
            { value: 'ex', label: 'معفاة' },
          ]}
        />
      </Ar>
    </div>
  );
}

function SidebarDemo() {
  const s = useS();
  const lang = useLang();
  const [collapsed, setCollapsed] = React.useState(false);
  const [active, setActive] = React.useState('invoices');
  return (
    <div className="flex items-stretch gap-4" style={{ height: 720 }}>
      <div className={stage} style={{ height: '100%' }}>
        <Sidebar
          sections={navFor(lang)}
          active={active}
          onNavigate={setActive}
          collapsed={collapsed}
          onToggle={() => setCollapsed((c) => !c)}
          favorites={[
            { id: 'f1', label: s('VAT return · Q3', 'إقرار الضريبة · الربع الثالث') },
            { id: 'f2', label: 'شركة البناء الحديث' },
          ]}
          plan={{
            name: s('Business plan', 'باقة الأعمال'),
            badge: s('Renews 1 Jan', 'تتجدد 1 يناير'),
            used: 412,
            limit: 1000,
            meter: s('412 / 1,000 invoices this month', '412 / 1,000 فاتورة هذا الشهر'),
          }}
          orgs={ORGS}
          currentOrg="o1"
        />
      </div>
      <div className={stage} style={{ height: '100%' }}>
        <Sidebar sections={navFor(lang)} active="einv" collapsed orgs={ORGS} currentOrg="o1" />
      </div>
    </div>
  );
}

function SkeletonDemo() {
  const s = useS();
  return (
    <div className={grid2}>
      <div className={`${panel} ${col}`}>
        <div className={row}>
          <Skeleton circle width={36} height={36} />
          <div className="flex-1">
            <Skeleton lines={2} />
          </div>
        </div>
        <Skeleton height={28} width={160} />
        <Skeleton height={80} />
      </div>
      <div className={`${panel} overflow-hidden !p-0`}>
        <Table
          loading
          loadingRows={3}
          columns={[
            { key: 'a', header: s('Invoice', 'الفاتورة') },
            { key: 'b', header: s('Customer', 'العميل') },
            { key: 'c', header: s('Total', 'الإجمالي'), align: 'end' },
          ]}
          rows={[]}
        />
      </div>
    </div>
  );
}

function StatCardDemo() {
  const s = useS();
  return (
    <div className={grid3}>
      <StatCard
        emphasis
        icon="chart-column"
        label={s('Total sales · October', 'إجمالي المبيعات · أكتوبر')}
        value={248930.5}
        delta={12.4}
        trend={[120, 132, 128, 150, 162, 158, 181, 197]}
      />
      <StatCard
        icon="percent"
        tone="accent"
        label={s('VAT collected', 'الضريبة المحصّلة')}
        value={37339.58}
        delta={9.8}
        trend={[18, 20, 19, 23, 25, 24, 27, 30]}
        trendTone="accent"
      />
      <StatCard
        icon="circle-alert"
        tone="danger"
        label={s('Overdue invoices', 'الفواتير المتأخرة')}
        value={31200}
        delta={18}
        invert
        footnote={s('4 invoices · vs last month', '4 فواتير · مقارنة بالشهر الماضي')}
        trend={[10, 12, 11, 15, 14, 18, 21, 24]}
      />
      <StatCard
        icon="users"
        tone="info"
        label={s('Active customers', 'العملاء النشطون')}
        value="248"
        currency={false}
        loading
      />
    </div>
  );
}

function StepperDemo() {
  const steps = [
    { label: 'Account', description: 'Verify email & mobile' },
    { label: 'Business', description: 'CR & VAT' },
    { label: 'Address', description: 'National Address' },
    { label: 'Branding', description: 'Logo & stamp' },
    { label: 'Tax', description: 'VAT & numbering' },
    { label: 'Workspace' },
  ];
  return (
    <div className="flex flex-col gap-6">
      <En className={panel}>
        <Stepper steps={steps.map((x) => ({ label: x.label }))} current={2} />
      </En>
      <div className={grid2}>
        <En className={panel}>
          <Stepper orientation="vertical" steps={steps.slice(0, 3)} current={1} />
        </En>
        <Ar className={panel}>
          <Stepper
            orientation="vertical"
            steps={[
              { label: 'الحساب', description: 'التحقق من البريد والجوال' },
              { label: 'المنشأة', description: 'السجل التجاري والرقم الضريبي' },
              { label: 'العنوان الوطني' },
            ]}
            current={2}
          />
        </Ar>
      </div>
    </div>
  );
}

function SwitchDemo() {
  const s = useS();
  return (
    <div className="flex flex-wrap items-start gap-7">
      <Switch label={s('Auto-send recurring invoices', 'إرسال الفواتير المتكررة تلقائيًا')} defaultChecked />
      <Switch
        label={s('Two-factor authentication', 'المصادقة الثنائية')}
        description={s('Required for Owner and Accountant roles.', 'إلزامية لدوري المالك والمحاسب.')}
      />
      <Ar>
        <Switch label="تذكير بالدفع" defaultChecked />
      </Ar>
    </div>
  );
}

function TableDemo() {
  const cols = useInvoiceColumns();
  const [sel, setSel] = React.useState<Array<string | number>>(['INV-2026-00125']);
  return (
    <div className={`${panel} overflow-hidden !p-0`}>
      <Table<InvoiceRow>
        columns={cols}
        rows={INVOICES.slice(0, 5)}
        selected={sel}
        onSelectedChange={setSel}
        defaultSort={{ key: 'id', dir: 'desc' }}
      />
    </div>
  );
}

function TabsDemo() {
  const s = useS();
  return (
    <div className="flex flex-col gap-5">
      <Tabs
        tabs={[
          { id: 'all', label: s('All', 'الكل'), count: 126 },
          { id: 'draft', label: s('Drafts', 'المسودات'), count: 4 },
          { id: 'unpaid', label: s('Unpaid', 'غير مدفوعة'), count: 18 },
          { id: 'overdue', label: s('Overdue', 'متأخرة'), count: 4 },
          { id: 'paid', label: s('Paid', 'مدفوعة') },
        ]}
        defaultValue="unpaid"
      />
      <div className={`${row} justify-between`}>
        <En>
          <Tabs
            variant="pill"
            tabs={[
              { id: 'ov', label: 'Overview', icon: 'layout-dashboard' },
              { id: 'inv', label: 'Invoices' },
              { id: 'pay', label: 'Payments' },
              { id: 'doc', label: 'Documents' },
            ]}
          />
        </En>
        <Ar>
          <Tabs
            variant="pill"
            tabs={[
              { id: 'a', label: 'نظرة عامة' },
              { id: 'b', label: 'الفواتير' },
              { id: 'c', label: 'المدفوعات' },
            ]}
          />
        </Ar>
      </div>
    </div>
  );
}

function TimelineDemo() {
  const s = useS();
  return (
    <div className={grid2}>
      <div className={panel}>
        <p className={lbl}>
          {s('E-invoice lifecycle · INV-2026-00124', 'دورة الفاتورة الإلكترونية · INV-2026-00124')}
        </p>
        <Timeline
          compact
          items={[
            {
              title: s('Invoice created', 'تم إنشاء الفاتورة'),
              time: '09:31',
              icon: 'file-plus',
              tone: 'brand',
              description: s('by Faisal Al-Otaibi', 'بواسطة فيصل العتيبي'),
            },
            {
              title: s('Validated', 'تم التحقق'),
              time: '09:31',
              icon: 'circle-check',
              tone: 'success',
              description: s('Schema and business rules passed', 'اجتازت قواعد المخطط والأعمال'),
            },
            { title: s('Signed', 'تم التوقيع'), time: '09:32', icon: 'key-round', tone: 'success' },
            { title: s('QR generated', 'تم إنشاء رمز QR'), time: '09:32', icon: 'qr-code', tone: 'success' },
            {
              title: s('Reported — Accepted', 'تم الإبلاغ — مقبولة'),
              time: '09:42',
              icon: 'shield-check',
              tone: 'success',
              description: s('1 warning: BR-KSA-08 buyer address', 'تحذير واحد: BR-KSA-08 عنوان المشتري'),
            },
          ]}
        />
      </div>
      <div className={panel}>
        <p className={lbl}>{s('Customer activity', 'نشاط العميل')}</p>
        <Timeline
          compact
          items={[
            {
              title: s('Payment received · SAR 25,000', 'تم استلام دفعة · 25,000 ر.س'),
              time: s('Today', 'اليوم'),
              icon: 'banknote',
              tone: 'success',
              description: s(
                'Bank transfer · Al Rajhi · INV-2026-00125',
                'تحويل بنكي · الراجحي · INV-2026-00125',
              ),
            },
            {
              title: s('Invoice viewed', 'تمت مشاهدة الفاتورة'),
              time: s('Yesterday', 'أمس'),
              icon: 'eye',
              tone: 'info',
              description: s('Opened from WhatsApp link', 'فُتحت من رابط واتساب'),
            },
            {
              title: s('Reminder sent', 'تم إرسال تذكير'),
              time: s('2 Oct', '2 أكتوبر'),
              icon: 'send',
              tone: 'neutral',
            },
            {
              title: s('Credit note CN-2026-0009', 'إشعار دائن CN-2026-0009'),
              time: s('28 Sep', '28 سبتمبر'),
              icon: 'file-minus',
              tone: 'accent',
            },
            {
              title: s('Payment due', 'موعد الاستحقاق'),
              time: s('6 Nov', '6 نوفمبر'),
              state: 'pending',
              icon: 'clock',
            },
          ]}
        />
      </div>
    </div>
  );
}

function ToastDemo() {
  const s = useS();
  const { toast } = useToast();
  return (
    <div className={col}>
      <div className={grid2}>
        <En>
          <div className="relative min-h-[260px]">
            <ToastStack
              contained
              toasts={[
                {
                  tone: 'success',
                  title: 'Invoice INV-2026-00126 issued',
                  description: 'Validated and reported · QR generated',
                  action: { label: 'View' },
                  onClose: () => {},
                },
                { tone: 'loading', title: 'Submitting 3 invoices…' },
                {
                  tone: 'danger',
                  title: 'Payment couldn’t be recorded',
                  description: 'Amount exceeds balance due.',
                  action: { label: 'Retry' },
                  onClose: () => {},
                },
              ]}
            />
          </div>
        </En>
        <Ar>
          <div className="relative min-h-[260px]">
            <ToastStack
              contained
              toasts={[
                {
                  tone: 'success',
                  title: 'تم حفظ العميل',
                  description: 'شركة الخليج للخدمات',
                  onClose: () => {},
                },
                { tone: 'info', title: 'تم إرسال الفاتورة عبر واتساب' },
              ]}
            />
          </div>
        </Ar>
      </div>
      <div>
        <Button
          variant="secondary"
          iconStart="bell"
          onClick={() =>
            toast({
              tone: 'success',
              title: s(
                'Invoice INV-2026-00126 issued — validated and reported.',
                'تم إصدار الفاتورة INV-2026-00126 — تم التحقق والإبلاغ.',
              ),
            })
          }
        >
          {s('Fire a live toast', 'إظهار إشعار فعلي')}
        </Button>
      </div>
    </div>
  );
}

function TooltipDemo() {
  const s = useS();
  return (
    <div className={`${row} gap-12 pt-10`}>
      <Tooltip content={s('Print invoice', 'طباعة الفاتورة')} shortcut="P">
        <IconButton icon="printer" label={s('Print', 'طباعة')} variant="secondary" />
      </Tooltip>
      <Tooltip content={s('Taxable amount × 15%', 'المبلغ الخاضع للضريبة × 15%')}>
        <Badge tone="brand">{s('VAT 15%', 'ضريبة 15%')}</Badge>
      </Tooltip>
      <span className="text-caption text-fg-muted">
        {s('Hover or focus to open', 'مرّر المؤشر أو ركّز للفتح')}
      </span>
    </div>
  );
}

function TopbarDemo() {
  const quickEn = QUICK.map((q) => ({ ...q, label: q.label.en }));
  const quickAr = QUICK.map((q) => ({ ...q, label: q.label.ar }));
  return (
    <div className={col}>
      <En className={stage}>
        <Topbar
          breadcrumbs={[{ label: 'Sales' }, { label: 'Invoices' }]}
          quickCreate={quickEn}
          notifications={3}
          user={{ name: 'Faisal Al-Otaibi' }}
        />
      </En>
      <Ar className={stage}>
        <Topbar
          breadcrumbs={[{ label: 'المبيعات' }, { label: 'الفواتير' }]}
          quickCreate={quickAr}
          notifications={3}
          user={{ name: 'فيصل العتيبي' }}
        />
      </Ar>
    </div>
  );
}

function UsageMeterDemo() {
  const s = useS();
  return (
    <div className={`${panel} ${grid2} gap-6`}>
      <UsageMeter
        label={s('Invoices this month', 'الفواتير هذا الشهر')}
        icon="receipt"
        used={412}
        limit={1000}
      />
      <UsageMeter
        label={s('Team members', 'أعضاء الفريق')}
        icon="users"
        used={9}
        limit={10}
        note={s(
          '1 seat left — upgrade to Business for 25',
          'تبقّى مقعد واحد — رقِّ إلى باقة الأعمال للحصول على 25',
        )}
      />
      <UsageMeter label={s('Storage', 'التخزين')} icon="folder" used={5.1} limit={5} unit="GB" />
      <UsageMeter label={s('Branches', 'الفروع')} icon="building-2" used={4} limit={null} />
    </div>
  );
}

function VatInputDemo() {
  return (
    <div className={grid3}>
      <En>
        <VatInput label="VAT registration number" defaultValue="310123456700003" />
      </En>
      <En>
        <VatInput label="Customer VAT number" defaultValue="30045678" />
      </En>
      <Ar>
        <VatInput label="الرقم الضريبي" defaultValue="210123456700004" />
      </Ar>
    </div>
  );
}

export const DEMOS: Array<{ id: string; Demo: React.ComponentType; note?: string }> = [
  { id: 'Accordion', Demo: AccordionDemo },
  { id: 'Alert', Demo: AlertDemo },
  { id: 'Amount', Demo: AmountDemo },
  { id: 'AppShell', Demo: AppShellDemo },
  { id: 'Avatar', Demo: AvatarDemo },
  { id: 'Badge', Demo: BadgeDemo },
  { id: 'Breadcrumb', Demo: BreadcrumbDemo },
  { id: 'Button', Demo: ButtonDemo },
  { id: 'Card', Demo: CardDemo },
  { id: 'Chart', Demo: ChartPlaceholder, note: 'Phase 4' },
  { id: 'Checkbox', Demo: CheckboxDemo },
  { id: 'Combobox', Demo: ComboboxDemo },
  { id: 'CommandMenu', Demo: CommandMenuDemo },
  { id: 'ComplianceStatus', Demo: ComplianceStatusDemo },
  { id: 'CurrencyInput', Demo: CurrencyInputDemo },
  { id: 'DataGrid', Demo: DataGridDemo },
  { id: 'DatePicker', Demo: DatePickerDemo },
  { id: 'Dialog', Demo: DialogDemo },
  { id: 'Drawer', Demo: DrawerDemo },
  { id: 'DropdownMenu', Demo: DropdownMenuDemo },
  { id: 'EmptyState', Demo: EmptyStateDemo },
  { id: 'FileUpload', Demo: FileUploadDemo },
  { id: 'Icon', Demo: IconDemo },
  { id: 'Input', Demo: InputDemo },
  { id: 'Insight', Demo: InsightDemo },
  { id: 'InvoiceStatus', Demo: InvoiceStatusDemo },
  { id: 'Logo', Demo: LogoDemo },
  { id: 'OrgSwitcher', Demo: OrgSwitcherDemo },
  { id: 'PageHeader', Demo: PageHeaderDemo },
  { id: 'Pagination', Demo: PaginationDemo },
  { id: 'PhoneInput', Demo: PhoneInputDemo },
  { id: 'QrPanel', Demo: QrPanelDemo },
  { id: 'QuoteStatus', Demo: QuoteStatusDemo },
  { id: 'SegmentedControl', Demo: SegmentedControlDemo },
  { id: 'Select', Demo: SelectDemo },
  { id: 'Sidebar', Demo: SidebarDemo },
  { id: 'Skeleton', Demo: SkeletonDemo },
  { id: 'StatCard', Demo: StatCardDemo },
  { id: 'Stepper', Demo: StepperDemo },
  { id: 'Switch', Demo: SwitchDemo },
  { id: 'Table', Demo: TableDemo },
  { id: 'Tabs', Demo: TabsDemo },
  { id: 'Timeline', Demo: TimelineDemo },
  { id: 'Toast', Demo: ToastDemo },
  { id: 'Tooltip', Demo: TooltipDemo },
  { id: 'Topbar', Demo: TopbarDemo },
  { id: 'UsageMeter', Demo: UsageMeterDemo },
  { id: 'VatInput', Demo: VatInputDemo },
];
