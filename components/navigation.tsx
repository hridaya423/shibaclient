'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Gamepad2, BarChart3, Users, Play } from 'lucide-react';

export function Navigation() {
  const pathname = usePathname();

  const navItems = [
    {
      name: 'Dashboard',
      href: '/',
      icon: BarChart3,
      active: pathname === '/',
    },
    {
      name: 'Games',
      href: '/games',
      icon: Gamepad2,
      active: pathname.startsWith('/games'),
    },
    {
      name: 'Playtests',
      href: '/playtests',
      icon: Play,
      active: pathname === '/playtests',
    },
    {
      name: 'Community',
      href: '/feed',
      icon: Users,
      active: pathname === '/feed',
    },
  ];

  return (
    <nav className="bg-white/60 backdrop-blur-sm border-b border-white/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          <Link href="/" className="text-xl font-bold text-slate-800 hover:text-slate-900 transition-colors">
            Shiba Client
          </Link>

          
          <div className="flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    item.active
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}