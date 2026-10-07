'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { CustomerDrawer } from '@/components/customers/CustomerDrawer';
import { ImportDialog } from '@/components/data/ImportDialog';

/** URL-driven dialogs: ?new=1 (create), ?edit=<id> (edit), ?import=1 (CSV import). */
export function CustomerDialogs({ canManage }: { canManage: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const editId = sp.get('edit');
  const isNew = sp.get('new') !== null;
  const isImport = sp.get('import') !== null;
  const open = canManage && (isNew || editId !== null);

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
      <CustomerDrawer open={open} customerId={editId} onClose={close} />
      <ImportDialog open={canManage && isImport} kind="customers" onClose={(done) => {
        const q = new URLSearchParams(sp.toString());
        q.delete('import');
        const qs = q.toString();
        router.replace(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false });
        if (done) router.refresh();
      }} />
    </>
  );
}
