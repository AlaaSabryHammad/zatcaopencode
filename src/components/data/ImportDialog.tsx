'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Alert, Button, Dialog } from '@/components/zw';
import { importCustomers } from '@/server/actions/customer.actions';
import { importProducts } from '@/server/actions/product.actions';

export function ImportDialog({
  open,
  kind,
  onClose,
}: {
  open: boolean;
  kind: 'customers' | 'products';
  onClose: (imported: boolean) => void;
}) {
  const t = useTranslations();
  const ns = kind === 'customers' ? 'customers.importer' : 'products.importer';
  const [text, setText] = React.useState<string | null>(null);
  const [fileName, setFileName] = React.useState('');
  const [pending, setPending] = React.useState(false);
  const [result, setResult] = React.useState<{ imported: number; errors: Array<{ row: number; message: string }> } | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setText(null);
      setFileName('');
      setResult(null);
      setError(null);
    }
  }, [open ]);

  async function onFile(f: File | undefined) {
    if (!f) return;
    setFileName(f.name);
    setText(await f.text());
  }

  async function run() {
    if (!text) return;
    setPending(true);
    setError(null);
    setResult(null);
    const res = kind === 'customers' ? await importCustomers({ csv: text }) : await importProducts({ csv: text });
    setPending(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setResult(res.data ?? { imported: 0, errors: [] });
  }

  return (
    <Dialog
      open={open}
      onClose={() => onClose(!!result && result.imported > 0)}
      title={t(`${ns}.title` as 'customers.importer.title')}
      description={t(`${ns}.desc` as 'customers.importer.desc')}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => onClose(!!result && result.imported > 0)}>
            {t('zw.close')}
          </Button>
          <Button loading={pending} disabled={!text} onClick={run}>
            {t(`${ns}.review` as 'customers.importer.review')}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        {error ? <Alert tone="danger">{t(error as 'validation.required')}</Alert> : null}
        <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed border-border-control p-6 text-center">
          <span className="text-sm font-medium">{t(`${ns}.file` as 'customers.importer.file')}</span>
          <span className="text-sm text-fg-muted" dir="ltr">
            {fileName || '.csv'}
          </span>
          <input type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
        </label>
        {result ? (
          <div className="flex flex-col gap-2">
            <Alert tone={result.imported > 0 ? 'success' : 'info'}>
              {t(`${ns}.imported` as 'customers.importer.imported', { n: result.imported })}
            </Alert>
            {result.errors.length > 0 ? (
              <div className="flex max-h-48 flex-col gap-1 overflow-auto text-sm">
                <span className="font-medium">{t(`${ns}.errors` as 'customers.importer.errors', { n: result.errors.length })}</span>
                {result.errors.slice(0, 20).map((e, i) => (
                  <span key={i} className="text-fg-muted" dir="ltr">
                    {t(`${ns}.row` as 'customers.importer.row')} {e.row}: {e.message.startsWith('validation.') ? t(e.message as 'validation.required') : e.message}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </Dialog>
  );
}
