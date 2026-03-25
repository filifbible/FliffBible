import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Filif Bible+',
  description: 'Sua bíblia interativa para toda a família',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
      </body>
    </html>
  );
}
