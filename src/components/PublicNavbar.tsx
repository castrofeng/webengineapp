'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Flame, Phone, Clock, FileText, LogIn, User, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  // 👇 verifica login
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    router.push('/');
  };

  return (
    <nav className="fixed w-full z-50 top-0 left-0 shadow-md font-sans antialiased">

      {/* TOP BAR */}
      <div className="bg-slate-900 text-white text-xs border-b border-slate-800 py-2.5">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">

          <div className="flex gap-4 text-slate-200">
            <div className="flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-orange-400" />
              <span>+49 3376 9849 497</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-orange-400" />
              <span>Seg-Sex: 8:30 - 16:30</span>
            </div>
          </div>

          <Link
            href="/loja"
            className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 px-3 py-1.5 rounded font-bold text-[11px]"
          >
            <FileText className="h-3.5 w-3.5" />
            Cotação
          </Link>

        </div>
      </div>

      {/* MAIN NAV */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">

            {/* LOGO */}
            <Link href="/" className="flex items-center gap-2 font-black text-xl">
              <Flame className="h-6 w-6 text-orange-500" />
              MOTORES
            </Link>

            {/* LINKS */}
            <div className="hidden md:flex gap-6 text-sm font-bold text-slate-700">
              <Link href="/">Página Inicial</Link>
              <Link href="/loja">Loja</Link>
              <Link href="/sobre">Sobre nós</Link>
              <Link href="/servicos">Serviços</Link>
              <Link href="/faq">FAQ</Link>
            </div>

            {/* AUTH AREA */}
            <div className="hidden md:flex items-center gap-3">

              {!user ? (
                <Link
                  href="/login"
                  className="flex items-center gap-2 bg-slate-950 text-white px-4 py-2 rounded-lg text-xs font-bold"
                >
                  Entrar
                  <LogIn className="h-4 w-4" />
                </Link>
              ) : (
                <div className="flex items-center gap-3">

                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <User className="h-4 w-4" />
                    {user.nome || user.funcao}
                  </div>

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-xs font-bold"
                  >
                    <LogOut className="h-4 w-4" />
                    Sair
                  </button>

                </div>
              )}
            </div>

            {/* MOBILE MENU */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2"
            >
              {isOpen ? <X /> : <Menu />}
            </button>

          </div>
        </div>
      </div>

      {/* MOBILE MENU */}
      {isOpen && (
        <div className="md:hidden bg-white border-t px-4 py-4 space-y-2">

          <Link href="/">Página Inicial</Link>
          <Link href="/loja">Loja</Link>
          <Link href="/sobre">Sobre nós</Link>
          <Link href="/servicos">Serviços</Link>
          <Link href="/faq">FAQ</Link>

          <div className="pt-4 border-t">

            {!user ? (
              <Link href="/login" className="block bg-slate-900 text-white text-center py-2 rounded-lg">
                Entrar
              </Link>
            ) : (
              <>
                <div className="text-sm mb-2">
                  Logado como: <strong>{user.funcao}</strong>
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full bg-red-500 text-white py-2 rounded-lg"
                >
                  Sair
                </button>
              </>
            )}

          </div>
        </div>
      )}
    </nav>
  );
}