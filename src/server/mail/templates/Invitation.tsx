import { Body, Button, Container, Head, Heading, Hr, Html, Link, Preview, Section, Text } from 'react-email';

export interface InvitationProps {
  orgName: string;
  roleName: string;
  email: string;
  acceptUrl: string;
  appUrl: string;
  expiresInDays: number;
}

export function Invitation({ orgName, roleName, email, acceptUrl, appUrl, expiresInDays }: InvitationProps) {
  return (
    <Html lang="ar" dir="rtl">
      <Head />
      <Preview>
        دعوة للانضمام إلى {orgName} — ZatcaWeb
      </Preview>
      <Body style={{ backgroundColor: '#f5f5f5', fontFamily: 'Segoe UI, Tahoma, sans-serif' }}>
        <Container
          style={{ margin: '40px auto', maxWidth: '560px', backgroundColor: '#ffffff', borderRadius: '8px', padding: '40px' }}
        >
          <Heading style={{ fontSize: '20px', marginBottom: '16px' }}>دعوة للانضمام إلى {orgName}</Heading>
          <Text style={{ fontSize: '16px', lineHeight: '24px', marginBottom: '8px' }}>مرحبًا،</Text>
          <Text style={{ fontSize: '16px', lineHeight: '24px', marginBottom: '24px' }}>
            تمت دعوة {email} للانضمام إلى مؤسسة {orgName} بدور {roleName}. الدعوة صالحة لمدة {expiresInDays}{' '}
            أيام.
          </Text>
          <Section style={{ textAlign: 'center', marginBottom: '24px' }}>
            <Button
              href={acceptUrl}
              style={{
                backgroundColor: '#2563eb',
                color: '#ffffff',
                padding: '12px 24px',
                borderRadius: '6px',
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              قبول الدعوة
            </Button>
          </Section>
          <Text style={{ fontSize: '14px', color: '#475569', marginBottom: '16px' }}>
            إذا لم تكن تتوقع هذه الدعوة، يمكنك تجاهل هذه الرسالة.
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

export default Invitation;
