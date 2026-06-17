import { Mail, MapPin, Shield, Phone, ArrowUpRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-900 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          
          {/* Coluna 1: Sobre */}
          <div className="space-y-3">
            <h3 className="text-white font-black text-xl tracking-wider">MOTORES</h3>
            <p className="text-sm leading-relaxed">
              Alta performance e confiabilidade em soluções de propulsão industrial e automotiva. Líder no gerenciamento tecnológico de frotas e motores.
            </p>
          </div>
          
          {/* Coluna 2: Links Rápidos */}
          <div className="space-y-3">
            <h3 className="text-white font-bold text-base uppercase tracking-wider border-l-4 border-orange-500 pl-2">Links Úteis</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="/motores" className="flex items-center gap-1 hover:text-orange-500 transition-colors group">
                  Catálogo Avançado <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </li>
              <li>
                <a href="/termos" className="flex items-center gap-1 hover:text-orange-500 transition-colors group">
                  Termos e Garantias <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </li>
              <li>
                <a href="/suporte" className="flex items-center gap-1 hover:text-orange-500 transition-colors group">
                  Suporte Especializado <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </li>
            </ul>
          </div>

          {/* Coluna 3: Contacto */}
          <div className="space-y-3">
            <h3 className="text-white font-bold text-base uppercase tracking-wider border-l-4 border-orange-500 pl-2">Contacto</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-orange-500" />
                <span>suporte@motoresapp.com</span>
              </li>
              <li className="flex items-center gap-2.5">
                <MapPin className="h-4 w-4 text-orange-500" />
                <span>Maputo, Moçambique</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Shield className="h-4 w-4 text-orange-500" />
                <span>Certificação Oficial de Qualidade</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-900 mt-10 pt-6 text-center text-xs tracking-wide">
          <p>&copy; {new Date().getFullYear()} MOTORES. Soluções Industriais Integradas.</p>
        </div>
      </div>
    </footer>
  );
}