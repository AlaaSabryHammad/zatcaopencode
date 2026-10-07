/**
 * Canonical permission keys (synchronized with `permission` table).
 * Grouping matches the Users/Roles design for readability and seeding.
 */
export const PERMISSIONS = {
  // Organization & settings
  'org.manage': { group: 'organization', description: 'Manage organization settings and branding' },
  'org.switch': { group: 'organization', description: 'Switch between organizations' },
  'billing.manage': { group: 'billing', description: 'Manage subscription and billing' },

  // Users & roles
  'user.view': { group: 'users', description: 'View users and memberships' },
  'user.create': { group: 'users', description: 'Invite or create users' },
  'user.update': { group: 'users', description: 'Update user roles and status' },
  'user.delete': { group: 'users', description: 'Deactivate or remove users' },
  'role.manage': { group: 'roles', description: 'Create and manage custom roles' },
  'invitation.manage': { group: 'users', description: 'Manage invitations' },

  // Products, inventory, branches
  'product.view': { group: 'catalog', description: 'View products and categories' },
  'product.manage': { group: 'catalog', description: 'Create and manage products' },
  'branch.view': { group: 'branches', description: 'View branches' },
  'branch.manage': { group: 'branches', description: 'Manage branches' },
  'warehouse.manage': { group: 'inventory', description: 'Manage warehouses' },

  // Sales & POS
  'sale.view': { group: 'sales', description: 'View sales' },
  'sale.create': { group: 'sales', description: 'Create sales and quotations' },
  'sale.manage': { group: 'sales', description: 'Manage sales (void/refund)' },
  'pos.access': { group: 'pos', description: 'Access POS' },
  'pos.close': { group: 'pos', description: 'Close cash register' },

  // Purchases & suppliers
  'purchase.view': { group: 'purchases', description: 'View purchases' },
  'purchase.manage': { group: 'purchases', description: 'Manage purchases' },
  'supplier.manage': { group: 'suppliers', description: 'Manage suppliers' },

  // Accounting & VAT
  'account.view': { group: 'accounting', description: 'View chart of accounts' },
  'account.manage': { group: 'accounting', description: 'Manage chart of accounts' },
  'journal.manage': { group: 'accounting', description: 'Post journal entries' },
  'tax.view': { group: 'tax', description: 'View VAT/ZATCA reports' },
  'tax.manage': { group: 'tax', description: 'Manage ZATCA compliance settings' },

  // Invoices (e-invoicing)
  'invoice.view': { group: 'invoices', description: 'View invoices' },
  'invoice.issue': { group: 'invoices', description: 'Issue invoices (B2B/B2C)' },
  'invoice.cancel': { group: 'invoices', description: 'Cancel invoices' },
  'invoice.creditnote': { group: 'invoices', description: 'Issue credit/debit notes' },
  'zatca.submit': { group: 'zatca', description: 'Submit to ZATCA (clearance/reporting)' },

  // Payments & receipts
  'payment.view': { group: 'payments', description: 'View payments' },
  'payment.manage': { group: 'payments', description: 'Record payments and receipts' },

  // Reports & exports
  'report.view': { group: 'reports', description: 'View reports' },
  'report.export': { group: 'reports', description: 'Export reports (PDF/Excel)' },
  'audit.view': { group: 'audit', description: 'View audit log' },

  // Integration & settings
  'integration.manage': { group: 'integrations', description: 'Manage API keys and integrations' },
} as const;

export type PermissionKey = keyof typeof PERMISSIONS;
