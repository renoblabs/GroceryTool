import type { Metadata } from 'next';
import DemoBanner from '@/components/DemoBanner';
import Header from '@/components/Header';
import './globals.css';

export const metadata: Metadata = {
  title: 'Grocery Tool',
  description: 'Find the best prices for your grocery items across multiple stores',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <DemoBanner />
        <Header />
        <main className="container">
          {children}
        </main>
        <footer className="footer">
          <div className="container">
            <p>© {new Date().getFullYear()} Grocery Tool</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
