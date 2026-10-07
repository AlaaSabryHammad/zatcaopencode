import { Logo } from '@/components/zw';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-4 py-10">
      <Logo variant="full" size={30} />
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
