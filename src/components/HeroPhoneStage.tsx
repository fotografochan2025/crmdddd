import React, { useState, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'motion/react';
import {
  MessageSquare,
  Instagram,
  PhoneCall,
  ArrowRight,
  Zap,
  Sparkles,
} from 'lucide-react';
import { ChannelType } from '../types/crm';
import { Phone3DExplodedScene } from './Phone3DExplodedScene';

interface HeroPhoneStageProps {
  onSimulateLead: () => void;
  onOpenModal: (planName?: string) => void;
  simulatedCount: number;
}

export const HeroPhoneStage: React.FC<HeroPhoneStageProps> = ({
  onSimulateLead,
  onOpenModal,
  simulatedCount,
}) => {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeChannel, setActiveChannel] = useState<ChannelType>('whatsapp');
  const [burstKey, setBurstKey] = useState<number>(0);
  const [selectedLayerInfo, setSelectedLayerInfo] = useState<{ name: string; desc: string } | null>(null);

  // Scrollytelling scroll tracking: phone explodes & elements move at differential parallax speeds
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  const smoothScroll = useSpring(scrollYProgress, { stiffness: 140, damping: 25 });
  const [scrollExplosionVal, setScrollExplosionVal] = useState(0);

  // Differential Parallax Channels for Spatial Depth (Compositor-only translateY transforms)
  const bgAuraEmeraldY = useTransform(smoothScroll, [0, 1], [0, 120]);
  const bgAuraPurpleY = useTransform(smoothScroll, [0, 1], [0, -95]);
  const copyColumnY = useTransform(smoothScroll, [0, 1], [0, -38]);
  const statsStripY = useTransform(smoothScroll, [0, 1], [0, -65]);
  const phoneContainerY = useTransform(smoothScroll, [0, 1], [0, 46]);
  const floatingBadgeLeftY = useTransform(smoothScroll, [0, 1], [0, -85]);
  const floatingBadgeRightY = useTransform(smoothScroll, [0, 1], [0, -115]);

  React.useEffect(() => {
    return smoothScroll.on('change', (v) => {
      // Map scroll progress [0.06, 0.72] -> [0, 1]
      const clamped = Math.max(0, Math.min(1, (v - 0.06) / 0.66));
      setScrollExplosionVal(clamped);
    });
  }, [smoothScroll]);

  const handleTriggerBurst = () => {
    setBurstKey((prev) => prev + 1);
    onSimulateLead();
  };

  return (
    <section
      id="topo"
      ref={sectionRef}
      className="relative pt-10 pb-4 md:pt-16 md:pb-6 overflow-visible"
    >
      {/* Parallax Layer 0: Ambient Glowing Radial Light Fields */}
      <motion.div
        style={{ y: bgAuraEmeraldY }}
        aria-hidden="true"
        className="pointer-events-none absolute -top-20 right-0 w-[640px] h-[640px] rounded-full bg-emerald-500/[0.08] blur-[140px]"
      />
      <motion.div
        style={{ y: bgAuraPurpleY }}
        aria-hidden="true"
        className="pointer-events-none absolute top-48 right-24 w-[420px] h-[420px] rounded-full bg-purple-500/[0.09] blur-[120px]"
      />

      <div className="mx-auto max-w-[1240px] px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Parallax Layer 1: Proposition & Action Column (moves at -38px) */}
          <motion.div
            style={{ y: copyColumnY }}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 space-y-6"
          >
            {/* Clean unboxed metadata line (Zero-Pill Discipline) */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium tracking-wide text-emerald-400">
              <span>Scrollytelling 3D</span>
              <span aria-hidden="true" className="text-neutral-600">·</span>
              <span>Desintegração Anatômica no Scroll</span>
              <span aria-hidden="true" className="text-neutral-600">·</span>
              <span>API Oficial Meta</span>
            </div>

            <h1
              style={{ fontSize: 'clamp(2.35rem, 4.3vw, 3.85rem)' }}
              className="font-display font-extrabold leading-[1.08] tracking-tight text-white text-balance max-w-2xl"
            >
              Multiatendimento inteligente que se{' '}
              <span className="bg-gradient-to-r from-emerald-400 via-emerald-300 to-purple-300 bg-clip-text text-transparent">
                desdobra em escala.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-neutral-300 leading-relaxed max-w-[56ch]">
              Role a página para ver a desintegração e anatomia em camadas do nosso hardware virtual:
              desde a entrada da mensagem no WhatsApp até a rotação neural no Kanban em menos de 30 segundos.
            </p>

            {/* Interactive Channel Switcher (Directly re-renders the 3D phone screen!) */}
            <div className="space-y-2 pt-1">
              <span className="text-xs font-mono text-neutral-400">
                Canal ativo no display 3D:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveChannel('whatsapp')}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    activeChannel === 'whatsapp'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 shadow-[0_0_20px_rgba(52,211,153,0.2)]'
                      : 'bg-white/[0.04] hover:bg-white/[0.08] text-neutral-300 border border-white/[0.08]'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp API</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveChannel('instagram')}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    activeChannel === 'instagram'
                      ? 'bg-purple-500/20 text-purple-200 border border-purple-400/40 shadow-[0_0_20px_rgba(168,85,247,0.2)]'
                      : 'bg-white/[0.04] hover:bg-white/[0.08] text-neutral-300 border border-white/[0.08]'
                  }`}
                >
                  <Instagram className="w-3.5 h-3.5" />
                  <span>Instagram Direct</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveChannel('audio')}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    activeChannel === 'audio'
                      ? 'bg-teal-500/20 text-teal-200 border border-teal-400/40 shadow-[0_0_20px_rgba(45,212,191,0.2)]'
                      : 'bg-white/[0.04] hover:bg-white/[0.08] text-neutral-300 border border-white/[0.08]'
                  }`}
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Voz & Áudio IA</span>
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <motion.button
                type="button"
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onOpenModal('Profissional')}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-[#04120B] font-semibold text-sm sm:text-base shadow-[0_0_32px_rgba(52,211,153,0.28)] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>Começar Agora</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>

              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleTriggerBurst}
                className="inline-flex items-center gap-2.5 px-5 py-3.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.12] text-neutral-100 font-medium text-sm sm:text-base transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Zap className="w-4 h-4 text-emerald-400" />
                <span>Disparar Lead Ao Vivo ({simulatedCount})</span>
              </motion.button>
            </div>

            {/* Parallax Layer 2: Proof Metrics Strip (moves at -65px) */}
            <motion.div
              style={{ y: statsStripY }}
              className="pt-6 border-t border-white/[0.08] grid grid-cols-3 gap-6 max-w-xl"
            >
              <div>
                <div className="font-mono font-semibold text-xl sm:text-2xl text-white tabular-nums">
                  +10.4k
                </div>
                <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">Empresas ativas</p>
              </div>
              <div>
                <div className="font-mono font-semibold text-xl sm:text-2xl text-emerald-400 tabular-nums">
                  99,98%
                </div>
                <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">Disponibilidade</p>
              </div>
              <div>
                <div className="font-mono font-semibold text-xl sm:text-2xl text-white tabular-nums">
                  &lt; 28s
                </div>
                <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">Resposta média</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Parallax Layer 3: 3D Exploded Smartphone Stage (moves at +46px) with Floating Callout Parallaxes */}
          <motion.div
            style={{ y: phoneContainerY }}
            className="lg:col-span-6 relative flex flex-col items-center"
          >
            {/* High-speed floating background accent badge */}
            <motion.div
              style={{ y: floatingBadgeLeftY }}
              className="hidden xl:flex absolute -left-6 top-10 z-20 items-center gap-2 px-3 py-1.5 rounded-xl bg-[#091410]/95 border border-emerald-400/40 backdrop-blur-md shadow-xl text-[11px] font-mono text-emerald-300 pointer-events-none"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Layer Parallax: Z-Depth</span>
            </motion.div>

            <motion.div
              style={{ y: floatingBadgeRightY }}
              className="hidden xl:flex absolute -right-6 bottom-24 z-20 items-center gap-2 px-3 py-1.5 rounded-xl bg-[#140C1D]/95 border border-purple-400/40 backdrop-blur-md shadow-xl text-[11px] font-mono text-purple-300 pointer-events-none"
            >
              <span>Meta API Oficial · 12ms</span>
            </motion.div>

            <div className="w-full rounded-3xl bg-gradient-to-b from-white/[0.03] to-transparent p-1 sm:p-2 border border-white/[0.07] shadow-[0_32px_90px_rgba(0,0,0,0.7)]">
              <Phone3DExplodedScene
                scrollExplosion={scrollExplosionVal}
                activeChannel={activeChannel}
                triggerBurst={burstKey}
                onLayerSelect={(name, desc) => setSelectedLayerInfo({ name, desc })}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
