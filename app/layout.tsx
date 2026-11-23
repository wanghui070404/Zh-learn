import './globals.css';
import type { Metadata } from 'next';
import { Inter, Noto_Sans_SC } from 'next/font/google';
import Nav from '@/components/Nav';

const inter = Inter({ subsets: ['latin', 'vietnamese'], variable: '--font-inter' });
const noto = Noto_Sans_SC({ weight: ['400', '700'], subsets: ['latin'], variable: '--font-noto' });

export const metadata: Metadata = {
  title: 'Học tiếng Trung | Zen Chinese',
  description: 'Nền tảng tự học tiếng Trung hiện đại',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${inter.variable} ${noto.variable}`}>
      <body className="bg-slate-50 text-slate-800 min-h-screen relative overflow-x-hidden font-sans">
        {/* Background Effects (Blobs) */}
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-blue-200/50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
          <div className="absolute top-[20%] right-[-10%] w-[35vw] h-[35vw] bg-purple-200/50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-[-20%] left-[20%] w-[45vw] h-[45vw] bg-pink-200/50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <Nav />
        <main className="max-w-5xl mx-auto p-4 pb-24 relative z-10">{children}</main>
      </body>
    </html>
  );
}
