import type { Metadata } from 'next';
import Link from 'next/link';
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
        <header className="header">
          <div className="container">
            <h1>Grocery Tool</h1>
            <nav>
              <ul>
                <li><Link href="/">Home</Link></li>
                <li><Link href="/import">Import</Link></li>
                <li><Link href="/lists">Lists</Link></li>
                <li><Link href="/login">Login</Link></li>
              </ul>
            </nav>
          </div>
        </header>
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
