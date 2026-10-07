import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Button, EmptyState } from '@/components/zw';

export default async function NotFound() {
  const t = await getTranslations('errors');
  return (
    <main id="main" className="grid min-h-dvh place-items-center p-6">
      <EmptyState
        art="search"
        title={t('notFoundTitle')}
        description={t('notFoundBody')}
        action={
          <Button asChild>
            <Link href="/">{t('goHome')}</Link>
          </Button>
        }
      />
    </main>
  );
}
