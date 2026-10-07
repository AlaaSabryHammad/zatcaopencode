import { Body, Container, Head, Heading, Html, Link, Preview, Section, Text } from 'react-email';

export interface OtpCodeProps {
  name: string;
  code: string;
  appUrl: string;
  expiresInMinutes: number;
}

export function OtpCode({ name, code, appUrl, expiresInMinutes }: OtpCodeProps) {
  return (
    <Html lang="ar" dir="rtl">
      <Head />
      <Preview>رمز التحقق — ZatcaWeb</Preview>
      <Body style={{ backgroundColor: '#f5f5f5', fontFamily: 'Segoe UI, Tahoma, sans-serif' }}>
        <Container
          style={{
            margin: '40px auto',
            maxWidth: '560px',
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            padding: '40px',
            textAlign: 'center',
          }}
        >
          <Heading style={{ fontSize: '20px', marginBottom: '16px' }}>رمز التحقق</Heading>
          <Text style={{ fontSize: '16px', lineHeight: '24px', marginBottom: '8px' }}>مرحبًا {name}،</Text>
          <Text style={{ fontSize: '16px', lineHeight: '24px', marginBottom: '24px' }}>
            استخدم الرمز التالي لتسجيل الدخول. صالح لمدة {expiresInMinutes} دقائق.
          </Text>
          <Section style={{ marginBottom: '24px' }}>
            <div
              style={{
                display: 'inline-block',
                letterSpacing: '8px',
                fontSize: '40px',
                fontWeight: 700,
                padding: '16px 24px',
                backgroundColor: '#f1f5f9',
                borderRadius: '8px',
              }}
            >
              {code}
            </div>
          </Section>
          <Text style={{ fontSize: '14px', color: '#475569', marginBottom: '16px' }}>
            إذا لم تطلب هذا الرمز، يمكنك تجاهل هذه الرسالة.
          </Text>
          <Link href={appUrl} style={{ fontSize: '12px', color: '#64748b' }}>
            {appUrl}
          </Link>
        </Container>
      </Body>
    </Html>
  );
}

export default OtpCode;
