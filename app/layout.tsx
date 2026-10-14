import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'MiniDSP | PII Scanner',
  description: 'Corporate-grade synthetic PII detection',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="light">
      <head>
        <style>{`
          body {
            background-color: #f8fafc;
            color: #0f172a;
            margin: 0;
            padding: 0;
          }
          .lp-card {
            background: white;
            border: 1px solid #e2e8f0;
            box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
            border-radius: 0.75rem;
          }
        `}</style>
      </head>
      <body className={`${inter.className} bg-slate-50 text-slate-900 min-h-screen flex flex-col`}>
        <nav className="border-b bg-white px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-md flex items-center justify-center text-white font-bold">M</div>
            <span className="font-bold text-lg tracking-tight">MiniDSP <span className="text-indigo-600 font-medium text-sm">Copilot</span></span>
          </div>
          <div className="flex gap-4 items-center">
            <a href="/dashboard" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Dashboard</a>
            <a href="/scan" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">New Scan</a>
          </div>
        </nav>
        <main className="flex-1 container mx-auto px-6 py-8">
          {children}
        </main>
        <footer className="border-t bg-white px-6 py-4 text-center text-xs text-slate-400">
          © 2026 MiniDSP Training-only SaaS. All rights reserved.
        </footer>
      </body>
    </html>
  );
}
