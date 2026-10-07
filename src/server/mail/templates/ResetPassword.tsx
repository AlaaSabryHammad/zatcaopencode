import { Body, Button, Container, Head, Heading, Hr, Html, Link, Preview, Section, Text } from 'react-email';

export interface ResetPasswordProps {
  name: string;
  resetUrl: string;
  appUrl: string;
  expiresInHours: number;
}

export function ResetPassword({ name, resetUrl, appUrl, expiresInHours }: ResetPasswordProps) {
  return (
    <Html lang="ar" dir="rtl">
      <Head />
      <Preview>إعادة تعيين كلمة المرور — ZatcaWeb</Preview>
      <Body style={{ backgroundColor: '#f5f5f5', fontFamily: 'Segoe UI, Tahoma, sans-serif' }}>
        <Container
          style={{
            margin: '40px auto',
            maxWidth: '560px',
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            padding: '40px',
          }}
        >
          <Heading style={{ fontSize: '20px', marginBottom: '16px' }}>مرحبًا {name}،</Heading>
          <Text style={{ fontSize: '16px', lineHeight: '24px', marginBottom: '24px' }}>
            لقد طلبت إعادة تعيين كلمة المرور لحسابك. الرابط صالح لمدة {expiresInHours} ساعة.
          </Text>
          <Section style={{ textAlign: 'center', marginBottom: '24px' }}>
            <Button
              href={resetUrl}
              style={{
                backgroundColor: '#2563eb',
                color: '#ffffff',
                padding: '12px 24px',
                borderRadius: '6px',
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              إعادة تعيين كلمة المرور
            </Button>
          </Section>
          <Text style={{ fontSize: '14px', color: '#475569', marginBottom: '16px' }}>
            إذا لم تقم بهذا الطلب، يمكنك تجاهل هذه الرسالة.
          </Text>
          <Hr style={{ margin: '24px 0' }} />
          <Text style={{ fontSize: '12px', color: '#64748b' }}>
            ZatcaWeb — <Link href={appUrl}>{appUrl}</Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default ResetPassword;
