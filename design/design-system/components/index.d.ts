import type * as React from 'react';

type Tone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'info' | 'accent';
type Size = 'sm' | 'md' | 'lg';
type ColorToken = string; // a tokens.json color name, e.g. 'chart-3', 'danger-fill'
export type InvoiceStatusKey = 'draft' | 'pending' | 'issued' | 'sent' | 'viewed' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled' | 'credited';
export type ComplianceStatusKey = 'not_validated' | 'passed' | 'warning' | 'submission_pending' | 'accepted' | 'rejected' | 'requires_action';
export type QuoteStatusKey = 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired';

export interface LocaleProviderProps { lang: 'ar' | 'en'; children?: React.ReactNode; className?: string }
export interface LogoProps { variant?: 'full' | 'arabic' | 'mark'; size?: number; className?: string }
export interface IconProps { name: string; size?: number; strokeWidth?: number; label?: string; mirror?: boolean; className?: string; style?: React.CSSProperties }
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'danger-ghost' | 'accent' | 'link'; size?: Size; iconStart?: string; iconEnd?: string; loading?: boolean; kbd?: string; fullWidth?: boolean }
export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { icon: string; label: string; variant?: ButtonProps['variant']; size?: Size; badge?: React.ReactNode }
export interface BadgeProps { tone?: Tone; icon?: string; dot?: boolean; size?: 'sm' | 'md'; children?: React.ReactNode; className?: string }
export interface InvoiceStatusProps { status: InvoiceStatusKey; size?: 'sm' | 'md'; label?: string }
export interface QuoteStatusProps { status: QuoteStatusKey; size?: 'sm' | 'md'; label?: string }
export interface ComplianceStatusProps { status: ComplianceStatusKey; variant?: 'badge' | 'detailed'; detail?: React.ReactNode; meta?: React.ReactNode; size?: 'sm' | 'md'; label?: string }

interface FieldProps { label?: React.ReactNode; hint?: React.ReactNode; error?: React.ReactNode; required?: boolean; optional?: boolean; labelAside?: React.ReactNode; className?: string }
export interface InputProps extends FieldProps, Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'> { prefix?: React.ReactNode; suffix?: React.ReactNode; iconStart?: string; iconEnd?: string; size?: Size; mono?: boolean; align?: 'start' | 'end'; trailing?: React.ReactNode }
export interface TextareaProps extends FieldProps, React.TextareaHTMLAttributes<HTMLTextAreaElement> {}
export interface SelectOption { value: string; label: string; disabled?: boolean }
export interface SelectProps extends FieldProps, Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> { options: Array<SelectOption | string>; placeholder?: string; size?: Size; iconStart?: string }
export interface ComboboxOption { value: string; label: string; description?: string; meta?: React.ReactNode; avatar?: boolean; square?: boolean; icon?: string; keywords?: string }
export interface ComboboxProps extends FieldProps { options: ComboboxOption[]; value?: string | null; defaultValue?: string; onChange?: (value: string, option: ComboboxOption) => void; onCreate?: (query: string) => void; placeholder?: string; icon?: string; size?: Size; defaultOpen?: boolean; id?: string }
export interface DatePickerProps extends FieldProps { value?: string | null; defaultValue?: string; onChange?: (iso: string) => void; showHijri?: boolean; presets?: Array<{ label: string; value: string }>; today?: string; placeholder?: string; size?: Size; defaultOpen?: boolean }
export interface CurrencyInputProps extends Omit<InputProps, 'value' | 'defaultValue' | 'onChange'> { value?: number | null; defaultValue?: number; onChange?: (value: number | null) => void; decimals?: number; currencyDisplay?: 'auto' | 'both' }
export interface VatInputProps extends Omit<InputProps, 'value' | 'defaultValue' | 'onChange'> { value?: string; defaultValue?: string; onChange?: (digits: string) => void }
export interface PhoneInputProps extends Omit<InputProps, 'value' | 'defaultValue' | 'onChange'> { value?: string; defaultValue?: string; onChange?: (digits: string) => void }
export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> { label?: React.ReactNode; description?: React.ReactNode; indeterminate?: boolean }
export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> { label?: React.ReactNode; description?: React.ReactNode }
export interface UploadFile { name: string; size?: number; status?: 'uploading' | 'done' | 'error'; progress?: number; error?: string }
export interface FileUploadProps { label?: React.ReactNode; hint?: React.ReactNode; accept?: string; multiple?: boolean; icon?: string; compact?: boolean; files?: UploadFile[]; onFiles?: (files: FileList) => void }

export interface CardProps { title?: React.ReactNode; description?: React.ReactNode; actions?: React.ReactNode; footer?: React.ReactNode; padding?: 'sm' | 'md' | 'none'; tone?: 'brand' | 'sunken'; interactive?: boolean; as?: string; children?: React.ReactNode; className?: string; style?: React.CSSProperties }
export interface AmountProps { value: number; size?: 'sm' | 'md' | 'lg' | 'kpi' | 'hero'; tone?: 'success' | 'danger' | 'muted'; currency?: boolean; currencyDisplay?: 'auto' | 'both'; decimals?: number; compact?: boolean; showSign?: boolean }
export interface StatCardProps { label: React.ReactNode; value: number | string; currency?: boolean; size?: 'kpi' | 'hero'; icon?: string; tone?: 'brand' | 'accent' | 'info' | 'danger' | 'warning' | 'neutral'; delta?: number; invert?: boolean; footnote?: React.ReactNode; trend?: number[]; trendTone?: 'brand' | 'danger' | 'accent'; emphasis?: boolean; info?: React.ReactNode; loading?: boolean }
export interface TableColumn<R = any> { key: string; header: React.ReactNode; align?: 'start' | 'end' | 'center'; width?: number | string; sortable?: boolean; sortValue?: (row: R) => number | string; numeric?: boolean; mono?: boolean; render?: (row: R) => React.ReactNode }
export interface TableProps<R = any> { columns: TableColumn<R>[]; rows: R[]; rowKey?: string; selected?: Array<string | number>; onSelectedChange?: (ids: Array<string | number>) => void; onRowClick?: (row: R) => void; density?: 'default' | 'compact'; stickyHeader?: boolean; loading?: boolean; loadingRows?: number; empty?: React.ReactNode; defaultSort?: { key: string; dir: 'asc' | 'desc' }; footer?: React.ReactNode; caption?: string; maxHeight?: number | string }
export interface DataGridProps<R = any> extends Omit<TableProps<R>, 'selected' | 'onSelectedChange'> { searchKeys?: string[]; searchPlaceholder?: string; filters?: React.ReactNode; actions?: React.ReactNode; bulkActions?: Array<{ label: string; icon?: string; danger?: boolean; onClick?: (ids: Array<string | number>) => void }>; pageSize?: number; selectable?: boolean }
export interface FilterChipProps { label: React.ReactNode; value?: React.ReactNode; icon?: string; active?: boolean; onClick?: () => void; onRemove?: () => void }
export interface ChartSeries { key: string; label: string; color?: ColorToken; dashed?: boolean }
export interface ChartProps { type?: 'bar' | 'stacked' | 'line' | 'area' | 'donut'; data: any[]; xKey?: string; series?: ChartSeries[]; format?: 'currency' | 'number' | 'percent'; height?: number; title?: React.ReactNode; subtitle?: React.ReactNode; legend?: boolean; tableToggle?: boolean; centerLabel?: string; centerValue?: React.ReactNode; mirror?: boolean; xLabel?: string }
export interface TimelineItem { id?: string; title: React.ReactNode; description?: React.ReactNode; time?: React.ReactNode; icon?: string; tone?: Tone; state?: 'pending'; meta?: React.ReactNode }
export interface TimelineProps { items: TimelineItem[]; compact?: boolean }
export interface AvatarProps { name: string; src?: string; size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'; square?: boolean; status?: 'online' | 'away' }
export interface UsageMeterProps { label: React.ReactNode; icon?: string; used: number; limit: number | null; unit?: string; note?: React.ReactNode }
export interface AlertProps { tone?: 'info' | 'success' | 'warning' | 'danger' | 'neutral' | 'accent'; title?: React.ReactNode; icon?: string; action?: React.ReactNode; onClose?: () => void; children?: React.ReactNode }
export interface InsightProps { kicker?: React.ReactNode; action?: React.ReactNode; children?: React.ReactNode }
export interface EmptyStateProps { title: React.ReactNode; description?: React.ReactNode; action?: React.ReactNode; secondaryAction?: React.ReactNode; art?: 'invoice' | 'customers' | 'search'; icon?: string; compact?: boolean }
export interface SkeletonProps { width?: number | string; height?: number | string; circle?: boolean; lines?: number }
export interface QrPanelProps { payload?: string; steps?: Partial<Record<'generated' | 'validated' | 'compliance' | 'reporting', ComplianceStatusKey>>; size?: number; footnote?: React.ReactNode }
export interface QrCodeProps { value: string; size?: number; level?: 'L' | 'M' | 'Q' | 'H'; label?: string }

export interface TabsProps { tabs: Array<{ id: string; label: React.ReactNode; icon?: string; count?: number }>; value?: string; defaultValue?: string; onChange?: (id: string) => void; variant?: 'line' | 'pill'; children?: React.ReactNode | ((active: string) => React.ReactNode) }
export interface SegmentedControlProps { options: Array<{ value: string; label: React.ReactNode; icon?: string }>; value?: string; defaultValue?: string; onChange?: (value: string) => void; size?: 'sm' | 'md'; label?: string }
export interface BreadcrumbProps { items: Array<{ label: React.ReactNode; href?: string; icon?: string; onClick?: () => void }> }
export interface PaginationProps { page: number; pageCount: number; total?: number; pageSize?: number; onChange?: (page: number) => void }
export interface StepperProps { steps: Array<{ label: React.ReactNode; description?: React.ReactNode }>; current: number; orientation?: 'horizontal' | 'vertical' }
export interface AccordionProps { items: Array<{ id: string; title: React.ReactNode; subtitle?: React.ReactNode; icon?: string; content: React.ReactNode }>; defaultOpen?: string[]; multiple?: boolean }
export interface NavItem { id: string; label: React.ReactNode; icon?: string; href?: string; badge?: React.ReactNode; badgeTone?: 'danger' | 'accent'; defaultOpen?: boolean; children?: Array<{ id: string; label: React.ReactNode; href?: string; badge?: React.ReactNode }> }
export interface Org { id: string; name: string; vat?: string; role?: string; plan?: string }
export interface SidebarProps { sections: Array<{ heading?: React.ReactNode; items: NavItem[] }>; active?: string; onNavigate?: (id: string) => void; collapsed?: boolean; onToggle?: () => void; favorites?: Array<{ id: string; label: React.ReactNode }>; plan?: { name: string; badge?: string; tone?: Tone; used?: number; limit?: number; meter?: string }; orgs?: Org[]; currentOrg?: string; onSwitchOrg?: (id: string) => void }
export interface MenuItem { label?: React.ReactNode; icon?: string; shortcut?: string; description?: React.ReactNode; danger?: boolean; disabled?: boolean; onSelect?: () => void; divider?: boolean; heading?: React.ReactNode }
export interface TopbarProps { breadcrumbs?: BreadcrumbProps['items']; title?: React.ReactNode; onSearch?: () => void; quickCreate?: MenuItem[]; notifications?: number; onNotifications?: () => void; onToggleLang?: () => void; theme?: 'light' | 'dark'; onToggleTheme?: () => void; user?: { name: string; src?: string }; onMenu?: () => void }
export interface OrgSwitcherProps { orgs: Org[]; current?: string; onSwitch?: (id: string) => void; onCreate?: () => void; collapsed?: boolean; placement?: 'up' | 'start' | 'end'; defaultOpen?: boolean }
export interface AppShellProps { sidebar: React.ReactNode; topbar: React.ReactNode; children?: React.ReactNode; height?: number | string; assistant?: boolean; onAssistant?: () => void; collapsed?: boolean }
export interface PageHeaderProps { title: React.ReactNode; kicker?: React.ReactNode; description?: React.ReactNode; actions?: React.ReactNode }

export interface DialogProps { open: boolean; onClose?: () => void; title: React.ReactNode; description?: React.ReactNode; footer?: React.ReactNode; tone?: 'danger' | 'info' | 'warning' | 'success'; icon?: string; size?: 'sm' | 'md' | 'lg'; dismissable?: boolean; contained?: boolean; children?: React.ReactNode }
export interface DrawerProps { open: boolean; onClose?: () => void; title: React.ReactNode; description?: React.ReactNode; footer?: React.ReactNode; width?: number; side?: 'end'; contained?: boolean; children?: React.ReactNode }
export interface DropdownMenuProps { trigger: React.ReactElement; items: MenuItem[]; align?: 'start' | 'end'; width?: number; header?: React.ReactNode; defaultOpen?: boolean }
export interface TooltipProps { content: React.ReactNode; shortcut?: string; side?: 'top' | 'bottom'; defaultOpen?: boolean; children: React.ReactNode }
export interface ToastProps { tone?: 'success' | 'danger' | 'warning' | 'info' | 'neutral' | 'loading'; title: React.ReactNode; description?: React.ReactNode; action?: { label: string; onClick?: () => void }; onClose?: () => void }
export interface CommandItem { id?: string; label: string; description?: string; icon?: string; shortcut?: string; badge?: React.ReactNode; keywords?: string; onSelect?: () => void }
export interface CommandMenuProps { open: boolean; onClose?: () => void; groups: Array<{ heading: string; items: CommandItem[] }>; placeholder?: string; defaultQuery?: string; aiHint?: React.ReactNode; contained?: boolean }

type C<P> = (props: P) => React.ReactElement | null;
export declare const Logo: C<LogoProps>; export declare const Icon: C<IconProps>; export declare const Button: C<ButtonProps>; export declare const IconButton: C<IconButtonProps>;
export declare const Badge: C<BadgeProps>; export declare const InvoiceStatus: C<InvoiceStatusProps>; export declare const QuoteStatus: C<QuoteStatusProps>; export declare const ComplianceStatus: C<ComplianceStatusProps>;
export declare const Input: C<InputProps>; export declare const Textarea: C<TextareaProps>; export declare const Select: C<SelectProps>; export declare const Combobox: C<ComboboxProps>; export declare const DatePicker: C<DatePickerProps>;
export declare const CurrencyInput: C<CurrencyInputProps>; export declare const VatInput: C<VatInputProps>; export declare const PhoneInput: C<PhoneInputProps>; export declare const Checkbox: C<CheckboxProps>; export declare const Switch: C<SwitchProps>; export declare const FileUpload: C<FileUploadProps>;
export declare const Card: C<CardProps>; export declare const StatCard: C<StatCardProps>; export declare const Amount: C<AmountProps>; export declare const Table: C<TableProps>; export declare const DataGrid: C<DataGridProps>; export declare const FilterChip: C<FilterChipProps>;
export declare const Chart: C<ChartProps>; export declare const Timeline: C<TimelineProps>; export declare const Avatar: C<AvatarProps>; export declare const AvatarGroup: C<{ names: string[]; max?: number; size?: AvatarProps['size'] }>;
export declare const UsageMeter: C<UsageMeterProps>; export declare const Alert: C<AlertProps>; export declare const Insight: C<InsightProps>; export declare const EmptyState: C<EmptyStateProps>; export declare const Skeleton: C<SkeletonProps>;
export declare const QrPanel: C<QrPanelProps>; export declare const QrCode: C<QrCodeProps>; export declare const Tabs: C<TabsProps>; export declare const SegmentedControl: C<SegmentedControlProps>; export declare const Breadcrumb: C<BreadcrumbProps>;
export declare const Pagination: C<PaginationProps>; export declare const Stepper: C<StepperProps>; export declare const Accordion: C<AccordionProps>; export declare const Sidebar: C<SidebarProps>; export declare const Topbar: C<TopbarProps>;
export declare const OrgSwitcher: C<OrgSwitcherProps>; export declare const AppShell: C<AppShellProps>; export declare const PageHeader: C<PageHeaderProps>; export declare const Dialog: C<DialogProps>; export declare const Drawer: C<DrawerProps>;
export declare const DropdownMenu: C<DropdownMenuProps>; export declare const Tooltip: C<TooltipProps>; export declare const Toast: C<ToastProps>; export declare const ToastStack: C<{ toasts: ToastProps[]; contained?: boolean }>; export declare const CommandMenu: C<CommandMenuProps>;
export declare const LocaleProvider: C<LocaleProviderProps>;
/** Base64 TLV (tags 1–5) for sample/demo QR payloads only; production payloads come from the signing backend. */
export declare function tlvBase64(fields: { seller: string; vat: string; timestamp: string; total: string; vatTotal: string }): string;
export declare function fmtNumber(value: number, decimals?: number): string;
/** Format check only: 15 digits starting and ending with 3. */
export declare function isVatFormat(value: string): boolean;
export declare const ICON_NAMES: string[];

declare global { interface Window { ZatcaWeb: typeof import('./index') } }
