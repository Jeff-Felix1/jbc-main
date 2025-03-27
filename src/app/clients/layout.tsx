// src/app/clients/layout.tsx
import ProtectedLayout from '../../protected-layout';

export default function ClientsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedLayout>{children}</ProtectedLayout>;
}