import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Button, Card } from '@/components/zw';

export default async function AuthErrorPage() {
  const t = await getTranslations();
  return (
    <Card title={t('common.retry')} description={t('auth.somethingWentWrong')}>
      <Link href="/auth/login">
        <Button fullWidth>{t('auth.backToSignIn')}</Button>
      </Link>
    </Card>
  );
}
