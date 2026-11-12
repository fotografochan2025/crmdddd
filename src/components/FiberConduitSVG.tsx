import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'motion/react';
import { ArrowDown, Cpu, Network, CheckCircle2 } from 'lucide-react';

interface FiberConduitSVGProps {
  pulseBurstKey: number;
}

const FIBER_PATHS = [
  { d: 'M 940 8 C 890 120, 320 110, 210 252', color: '#10B981', speed: 'animate-fiber-stream' },
  { d: 'M 955 8 C 900 128, 390 115, 290 252', color: '#34D399', speed: 'animate-fiber-stream-fast' },
  { d: 'M 970 8 C 915 135, 460 122, 370 252', color: '#10B981', speed: 'animate-fiber-stream-slow' },
  { d: 'M 985 8 C 930 142, 535 128, 455 252', color: '#22C55E', speed: 'animate-fiber-stream' },
  { d: 'M 1000 8 C 945 148, 610 132, 540 252', color: '#6EE7B7', speed: 'animate-fiber-stream-fast' },
  { d: 'M 1015 8 C 960 152, 685 138, 625 252', color: '#34D399', speed: 'animate-fiber-stream-slow' },
  { d: 'M 1030 8 C 975 156, 755 142, 710 252', color: '#8B5CF6', speed: 'animate-fiber-stream' },
  { d: 'M 1045 8 C 995 160, 825 146, 795 252', color: '#A855F7', speed: 'animate-fiber-stream-fast' },
  { d: 'M 1060 8 C 1015 165, 895 150, 880 252', color: '#C084FC', speed: 'animate-fiber-stream-slow' },
  { d: 'M 1075 8 C 1040 168, 965 155, 965 252', color: '#A855F7', speed: 'animate-fiber-stream' },
  { d: 'M 1090 8 C 1065 170, 1025 160, 1045 252', color: '#8B5CF6', speed: 'animate-fiber-stream-fast' },
];

export const FiberConduitSVG: React.FC<FiberConduitSVGProps> = ({ pulseBurstKey }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 85%', 'end 30%'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
  });

  const glowOpacity = useTransform(smoothProgress, [0, 0.4, 1], [0.35, 0.95, 1]);
  const containerScale = useTransform(smoothProgress, [0, 0.6, 1], [0.97, 1, 1]);

  return (
    <div
      ref={containerRef}
      className="relative mx-auto max-w-[1240px] pt-4 pb-2 px-6 overflow-visible"
    >
      {/* Scrollytelling Bridge Indicator */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-2 border-t border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Network className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-semibold text-white">
              Feixe Óptico de Desintegração & Reconstrução
            </span>
            <p className="text-[11px] text-neutral-400">
              Os dados e mensagens desintegrados do celular alimentam o Kanban em tempo real
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-neutral-400">
          <span className="text-emerald-400 tabular-nums">Latência: 12ms</span>
          <span>·</span>
          <span className="text-purple-300">Conexão TLS 1.3 Criptografada</span>
        </div>
      </div>

      {/* SVG Multi-strand Conduit */}
      <div
        aria-hidden="true"
        className="relative h-28 sm:h-44 md:h-52 pointer-events-none select-none overflow-visible"
      >
        {/* Ambient emerald and violet convergence glow */}
        <motion.div
          style={{ opacity: glowOpacity }}
          className="absolute inset-x-12 bottom-0 h-28 bg-gradient-to-r from-emerald-500/20 via-emerald-400/15 to-purple-500/20 blur-3xl"
        />

        <motion.svg
          style={{ scale: containerScale }}
          viewBox="0 0 1240 260"
          fill="none"
          preserveAspectRatio="none"
          className="w-full h-full overflow-visible"
        >
          <defs>
            <linearGradient id="conduitBaseEmerald" x1="1020" y1="0" x2="350" y2="260" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#34D399" stopOpacity="0.65" />
              <stop offset="55%" stopColor="#10B981" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.7" />
            </linearGradient>
            <linearGradient id="conduitBaseViolet" x1="1060" y1="0" x2="920" y2="260" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#34D399" stopOpacity="0.55" />
              <stop offset="50%" stopColor="#A855F7" stopOpacity="0.38" />
              <stop offset="100%" stopColor="#C084FC" stopOpacity="0.72" />
            </linearGradient>
            <filter id="fiberGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {FIBER_PATHS.map((fiber, idx) => {
            const isViolet = idx >= 6;
            return (
              <g key={idx}>
                {/* Scroll-drawn base fiber cable */}
                <motion.path
                  d={fiber.d}
                  stroke={isViolet ? 'url(#conduitBaseViolet)' : 'url(#conduitBaseEmerald)'}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  style={{ pathLength: smoothProgress }}
                />

                {/* Continuous animated energy packet */}
                <path
                  d={fiber.d}
                  stroke={fiber.color}
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  filter="url(#fiberGlow)"
                  className={fiber.speed}
                  opacity="0.85"
                />
              </g>
            );
          })}

          {/* Interactive burst wave triggered when user clicks 'Simular Novo Lead' */}
          {pulseBurstKey > 0 &&
            FIBER_PATHS.filter((_, i) => i % 2 === 0).map((fiber, idx) => (
              <motion.path
                key={`${pulseBurstKey}-${idx}`}
                d={fiber.d}
                stroke="#6EE7B7"
                strokeWidth="4"
                strokeLinecap="round"
                filter="url(#fiberGlow)"
                initial={{ pathLength: 0.18, pathOffset: 0, opacity: 1 }}
                animate={{ pathOffset: 1, opacity: [1, 1, 0] }}
                transition={{ duration: 0.95, delay: idx * 0.05, ease: 'easeOut' }}
              />
            ))}

          {/* Connection terminal nodes along the top of the Kanban frame */}
          {FIBER_PATHS.map((fiber, idx) => {
            const endX = [210, 290, 370, 455, 540, 625, 710, 795, 880, 965, 1045][idx];
            return (
              <motion.circle
                key={`node-${idx}`}
                cx={endX}
                cy={252}
                r="3.2"
                fill={fiber.color}
                style={{ opacity: smoothProgress }}
              />
            );
          })}
        </motion.svg>
      </div>
    </div>
  );
};
