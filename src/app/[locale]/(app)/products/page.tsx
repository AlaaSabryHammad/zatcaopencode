import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { requireOrgContext } from '@/server/auth/current-user';
import { hasPermission } from '@/server/rbac/guard';
import { withRls } from '@/server/db';
import { listProducts, productCategories, productStats } from '@/server/modules/products/queries';
import { Button } from '@/components/zw';
import { ProductsTable } from '@/components/products/ProductsTable';
import { ProductDialogs } from '@/components/products/ProductDialogs';

export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  const t = await getTranslations();
  const ctx = await requireOrgContext().catch((): never => redirect(`/${locale}/auth/login`));
  if (!ctx.activeMembership) redirect(`/${locale}/onboarding`);
  const orgId = ctx.activeMembership.organizationId;
  const rls = { orgId, userId: ctx.user.id, userEmail: ctx.user.email };

  const filters = {
    q: sp.q,
    type: (['product', 'service', 'bundle', 'variant'] as const).includes(sp.tab as never) ? (sp.tab as 'product' | 'service' | 'bundle' | 'variant') : undefined,
    categoryId: sp.category || undefined,
    vat: (['STANDARD', 'ZERO', 'EXEMPT', 'OUT_OF_SCOPE'] as const).includes(sp.vat as never)
      ? (sp.vat as 'STANDARD' | 'ZERO' | 'EXEMPT' | 'OUT_OF_SCOPE')
      : undefined,
    lowStock: sp.low ? true : undefined,
    sortKey: (sp.sort as 'name' | 'price' | 'stock' | undefined) ?? 'name',
    sortDir: (sp.dir as 'asc' | 'desc' | undefined) ?? 'asc',
    page: Math.max(1, Number(sp.page ?? 1) || 1),
    pageSize: 10,
  };
  const [list, stats, categories, canManage] = await withRls(rls, async (tx) => {
    const [l, s, c] = await Promise.all([
      listProducts(tx, orgId, filters),
      productStats(tx, orgId),
      productCategories(tx, orgId),
    ]);
    return [l, s, c] as const;
  }).then(async ([l, s, c]) => [l, s, c, await hasPermission('product.manage')] as const);

  return (
    <div className="mx-auto flex w-full max-w-content flex-col gap-4 px-4 py-6 sm:px-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-h1">{t('products.title')}</h1>
          <p className="text-sm text-fg-muted">
            {t('products.subtitle', { n: stats.total, low: stats.lowCount, amount: stats.stockValue.toFixed(2) })}
          </p>
        </div>
        {canManage ? (
          <div className="flex gap-2">
            <Link href="/products?import=1">
              <Button variant="secondary" iconStart="upload">
                {t('products.import')}
              </Button>
            </Link>
            <Link href="/products?new=1">
              <Button iconStart="plus" kbd="P">
                {t('products.new')}
              </Button>
            </Link>
          </div>
        ) : null}
      </div>

      <div className="flex flex-col gap-4">
        <div className="min-w-0 flex-1">
          <ProductsTable rows={list.rows} total={list.total} counts={list.counts} categories={categories} />
        </div>
      </div>
      <ProductDialogs canManage={canManage} categories={categories} />
    </div>
  );
}
