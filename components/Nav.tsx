'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, PenTool, LayoutGrid, Library, RefreshCw, FileText } from 'lucide-react';

const links = [
  { href: '/', label: 'Tổng quan', icon: LayoutGrid },
  { href: '/review', label: 'Ôn tập', icon: RefreshCw },
  { href: '/writing', label: 'Luyện viết', icon: PenTool },
  { href: '/vocabulary', label: 'Từ vựng', icon: Library },
  { href: '/radicals', label: 'Bộ thủ', icon: BookOpen },
  { href: '/grammar', label: 'Ngữ pháp', icon: FileText },
];

export default function Nav() {
  const path = usePathname();
  return (
    <nav className="sticky top-4 z-50 max-w-5xl mx-auto px-4 mb-8">
      <div className="bg-white/70 backdrop-blur-lg border border-white/40 shadow-sm rounded-2xl flex flex-wrap gap-1 p-2 justify-center md:justify-start">
        {links.map((l) => {
          const Icon = l.icon;
          const isActive = path === l.href;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                isActive ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400'} />
              <span className="hidden sm:inline">{l.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
