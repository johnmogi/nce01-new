import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NCE // Admin Console',
  description: 'Nexus Central Engine deterministic gameplay admin console'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
