import { Body, Button, Container, Head, Heading, Hr, Html, Link, Preview, Section, Text } from 'react-email';

export interface InvoiceEmailProps {
  customerName: string;
  number: string;
  total: string;
  currency: string;
  viewUrl: string;
  appUrl: string;
}

export function InvoiceEmail({ customerName, number, total, currency, viewUrl, appUrl }: InvoiceEmailProps) {
  return (
    <Html lang="ar" dir="rtl">
      <Head />
      <Preview>
        فاتورة جديدة {number} — ZatcaWeb
      </Preview>
      <Body style={{ backgroundColor: '#f5f5f5', fontFamily: 'Segoe UI, Tahoma, sans-serif' }}>
        <Container style={{ margin: '40px auto', maxWidth: '560px', backgroundColor: '#ffffff', borderRadius: '8px', padding: '40px' }}>
          <Heading style={{ fontSize: '20px', marginBottom: '16px' }}>مرحبًا {customerName}،</Heading>
          <Text style={{ fontSize: '16px', lineHeight: '24px', marginBottom: '8px' }}>
            تم إصدار فاتورة جديدة برقم {number} بمبلغ {total} {currency}.
          </Text>
          <Text style={{ fontSize: '16px', lineHeight: '24px', marginBottom: '24px' }}>
            يمكنك عرض الفاتورة كاملة عبر الرابط التالي:
          </Text>
          <Section style={{ textAlign: 'center', marginBottom: '24px' }}>
            <Button
              href={viewUrl}
              style={{ backgroundColor: '#2563eb', color: '#ffffff', padding: '12px 24px', borderRadius: '6px', textDecoration: 'none', display: 'inline-block' }}
            >
              عرض الفاتورة
            </Button>
          </Section>
          <Hr style={{ margin: '24px 0' }} />
          <Text style={{ fontSize: '12px', color: '#64748b' }}>
            ZatcaWeb — <Link href={appUrl}>{appUrl}</Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default InvoiceEmail;
