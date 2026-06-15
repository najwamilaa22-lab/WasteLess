'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, Bell, Camera, LogOut, LogIn, User, Menu, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Initial session fetch
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };
    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const navItems = [
    { name: 'Home', href: '/dashboard' },
    { name: 'My Kitchen', href: '/inventory' },
    { name: 'Nutrition', href: '/nutrition' },
    { name: 'Budget', href: '/budget' },
    { name: 'Learn', href: '/learn' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-brand-bg/90 backdrop-blur-md pt-4 pb-4">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 lg:px-8">
        
        {/* Brand Logo & Navigation */}
        <div className="flex items-center gap-10">
          <Link href="/dashboard" className="flex items-center gap-1.5">
            <span className="font-heading text-2xl font-bold tracking-tight text-brand-dark">
              Waste<span className="text-brand">Less</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`text-sm font-medium transition-colors relative pb-1 ${
                    isActive
                      ? 'text-brand-dark font-bold'
                      : 'text-stone-500 hover:text-stone-900'
                  }`}
                >
                  {item.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand rounded-full"></span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right side interactions */}
        <div className="flex items-center gap-4">
          
          {/* Search Bar */}
          <div className="hidden lg:flex items-center bg-white border border-stone-200 rounded-full px-4 py-2 shadow-sm min-w-[280px]">
            <Search className="h-4 w-4 text-stone-400 mr-2" />
            <input 
              type="text" 
              placeholder="Cari stok, resep, atau tips..." 
              className="bg-transparent text-sm w-full focus:outline-none text-stone-700"
            />
          </div>

          <Link
            href="/inventory?scan=true"
            className="flex items-center gap-1.5 rounded-full bg-brand-dark px-4 py-2 text-sm font-semibold text-white hover:bg-brand transition-colors"
          >
            <Camera className="h-4 w-4" />
            <span className="hidden sm:inline">Scan Struk AI</span>
          </Link>

          {/* Notification icon */}
          <button className="relative hidden sm:block p-2 text-stone-500 hover:bg-white rounded-full transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute right-2 top-2 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-accent"></span>
            </span>
          </button>

          {/* User profile avatar */}
          <div className="relative flex items-center gap-2 pl-2 border-l border-stone-200">
            {user ? (
              <>
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center gap-2 hover:bg-white rounded-full p-1 pr-3 transition-colors focus:outline-none"
                >
                  <div className="h-8 w-8 overflow-hidden rounded-full bg-brand-light flex items-center justify-center text-brand-dark">
                    {user?.user_metadata?.avatar_url ? (
                      <img src={user.user_metadata.avatar_url} alt="User avatar" className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                  </div>
                  <span className="hidden lg:flex items-center gap-1 text-sm font-medium text-stone-700">
                    {user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'User'}
                    <svg className="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </span>
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-stone-100 py-2 overflow-hidden z-50">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-brand-accent hover:bg-stone-50 transition-colors text-left"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                )}
              </>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
              >
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Masuk</span>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Hamburger Button */}
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 text-stone-600 focus:outline-none"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-stone-200 shadow-lg pb-4 pt-2 px-6 flex flex-col gap-4">
          <nav className="flex flex-col gap-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-base font-medium transition-colors ${
                    isActive ? 'text-brand-dark font-bold' : 'text-stone-500 hover:text-stone-900'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>
          
          <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
            <Link
              href="/inventory?scan=true"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-1.5 rounded-full bg-brand-dark px-4 py-2 text-sm font-semibold text-white hover:bg-brand transition-colors"
            >
              <Camera className="h-4 w-4" />
              <span>Scan Struk AI</span>
            </Link>
            
            {!user && (
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
              >
                <LogIn className="h-4 w-4" />
                <span>Masuk</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
