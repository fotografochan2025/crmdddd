import React from 'react';
import { motion, useScroll, useSpring } from 'motion/react';

interface NavbarProps {
  onOpenModal: (planName?: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenModal }) => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 200,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <header className="sticky top-0 z-50 w-full bg-[#060908]/85 backdrop-blur-xl border-b border-white/[0.07]">
      <div className="mx-auto max-w-[1240px] flex items-center justify-between gap-8 px-6 py-3.5">
        {/* Zone 1: Brand Title (Single line, single text element) */}
        <a
          href="#topo"
          className="font-display text-lg font-bold tracking-tight text-white hover:text-emerald-400 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-emerald-400"
        >
          CRM MultiAtend
        </a>

        {/* Zone 2: 5 concise single-line text navigation links */}
        <nav aria-label="Navegação principal" className="hidden md:flex items-center gap-7 text-sm font-medium text-neutral-300">
          <a
            href="#painel-ao-vivo"
            className="relative py-1 hover:text-white transition-colors whitespace-nowrap shrink-0 after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[1.5px] after:w-0 after:bg-emerald-400 after:transition-all hover:after:w-full"
          >
            Kanban Ao Vivo
          </a>
          <a
            href="#fluxos"
            className="relative py-1 hover:text-white transition-colors whitespace-nowrap shrink-0 after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[1.5px] after:w-0 after:bg-emerald-400 after:transition-all hover:after:w-full"
          >
            Fluxos Visuais
          </a>
          <a
            href="#automacoes"
            className="relative py-1 hover:text-white transition-colors whitespace-nowrap shrink-0 after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[1.5px] after:w-0 after:bg-emerald-400 after:transition-all hover:after:w-full"
          >
            Voz e Agenda
          </a>
          <a
            href="#canais"
            className="relative py-1 hover:text-white transition-colors whitespace-nowrap shrink-0 after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[1.5px] after:w-0 after:bg-emerald-400 after:transition-all hover:after:w-full"
          >
            Integrações
          </a>
          <a
            href="#planos"
            className="relative py-1 hover:text-white transition-colors whitespace-nowrap shrink-0 after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[1.5px] after:w-0 after:bg-emerald-400 after:transition-all hover:after:w-full"
          >
            Planos
          </a>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center shrink-0">
          <motion.button
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onOpenModal('Profissional')}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-[#04120B] bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
          >
            Começar Agora
          </motion.button>
        </div>
      </div>

      {/* Scrollytelling progress hairline */}
      <motion.div
        aria-hidden="true"
        style={{ scaleX, transformOrigin: '0% 50%' }}
        className="h-[2px] w-full bg-gradient-to-r from-emerald-400 via-emerald-300 to-purple-400"
      />
    </header>
  );
};
