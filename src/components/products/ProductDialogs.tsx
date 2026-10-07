'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import * as React from 'react';
import { ProductDrawer, type ProductEditData } from '@/components/products/ProductDrawer';
import { ImportDialog } from '@/components/data/ImportDialog';
import { getProduct } from '@/server/actions/product.actions';
import type { CategoryOpt } from '@/components/products/ProductsTable';

/** URL-driven dialogs: ?new=1 (create), ?edit=<id> (edit), ?import=1 (CSV import). */
export function ProductDialogs({ canManage, categories }: { canManage: boolean; categories: CategoryOpt[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const editId = sp.get('edit');
  const isNew = sp.get('new') !== null;
  const isImport = sp.get('import') !== null;
  const open = canManage && (isNew || editId !== null);
  const [initial, setInitial] = React.useState<ProductEditData | null>(null);

  React.useEffect(() => {
    if (!open) {
      setInitial(null);
      return;
    }
    if (!editId) {
      setInitial(null);
      return;
    }
    let live = true;
    getProduct({ id: editId }).then((res) => {
      if (!live) return;
      if (res.ok && res.data) setInitial({ ...res.data });
    });
    return () => {
      live = false;
    };
  }, [open, editId]);

  function close(saved: boolean) {
    const q = new URLSearchParams(sp.toString());
    q.delete('new');
    q.delete('edit');
    q.delete('import');
    const qs = q.toString();
    router.replace(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false });
    if (saved) router.refresh();
  }

  return (
    <>
      <ProductDrawer open={open && (!editId || initial?.id === editId)} initial={initial} categories={categories} onClose={close} />
      <ImportDialog open={canManage && isImport} kind="products" onClose={(done) => {
        const q = new URLSearchParams(sp.toString());
        q.delete('import');
        const qs = q.toString();
        router.replace(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false });
        if (done) router.refresh();
      }} />
    </>
  );
}
