import React, { useState, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'motion/react';
import { Calculator, TrendingUp, Clock, Users, ArrowRight } from 'lucide-react';
import { InteractiveTiltCard } from './InteractiveTiltCard';

export const RoiCalculatorStage: React.FC<{ onOpenModal: (plan?: string) => void }> = ({
  onOpenModal,
}) => {
  const sectionRef = useRef<HTMLElement>(null);
  const [agents, setAgents] = useState<number>(8);
  const [conversationsPerDay, setConversationsPerDay] = useState<number>(350);
  const [avgTicket, setAvgTicket] = useState<number>(450);

  // Parallax tracking for ROI section
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const smoothScroll = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });

  // Differentiated parallax channels
  const headerParallaxY = useTransform(smoothScroll, [0, 1], [-26, 26]);
  const leftCardParallaxY = useTransform(smoothScroll, [0, 1], [34, -34]);
  const rightCardParallaxY = useTransform(smoothScroll, [0, 1], [-40, 40]);
  const bgGlowParallaxY = useTransform(smoothScroll, [0, 1], [-75, 75]);

  // Real-world mathematical model for CRM MultiAtend efficiency lift
  const conversionLiftRate = 0.042; // +4.2% absolute conversion improvement
  const extraDealsMonth = Math.round(conversationsPerDay * 24 * conversionLiftRate);
  const extraRevenueMonth = extraDealsMonth * avgTicket;
  const hoursSavedPerAgentWeek = Math.min(22, Math.round(12 + (conversationsPerDay / 100) * 1.5));
  const estimatedSlaDrop = Math.max(18, Math.round(35 - (agents / 10) * 4));

  const formatBRL = (val: number) =>
    val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

  return (
    <section ref={sectionRef} className="py-20 border-t border-white/[0.06] relative overflow-visible">
      {/* Background Floating Parallax Light Field */}
      <motion.div
        style={{ y: bgGlowParallaxY }}
        aria-hidden="true"
        className="pointer-events-none absolute top-1/4 right-1/3 w-[520px] h-[520px] rounded-full bg-emerald-500/[0.06] blur-[150px]"
      />

      <div className="mx-auto max-w-[1240px] px-6 space-y-12">
        {/* Parallax Header */}
        <motion.div
          style={{ y: headerParallaxY }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div className="space-y-3 max-w-xl">
            <div className="text-xs font-medium text-emerald-400">
              Simulador Financeiro de Conversão
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white text-balance">
              Calcule o impacto do CRM MultiAtend no seu caixa.
            </h2>
            <p className="text-base text-neutral-300">
              Ajuste o tamanho da sua equipe e volume diário para estimar o ganho real de faturamento
              e horas salvas.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
            <Calculator className="w-4 h-4" />
            <span>Modelo baseado em +10.000 operações ativas</span>
          </div>
        </motion.div>

        {/* Interactive Calculator Grid with Opposing Parallaxes */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Sliders Controls Column (moves at +34px -> -34px) */}
          <motion.div style={{ y: leftCardParallaxY }} className="lg:col-span-6 h-full">
            <InteractiveTiltCard
              intensity={4}
              className="h-full rounded-2xl bg-[#0B110E] border border-white/[0.1] p-6 sm:p-8 space-y-6 flex flex-col justify-between"
            >
              <div className="space-y-6">
                {/* Slider 1: Agents */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="font-semibold text-white flex items-center gap-2">
                      <Users className="w-4 h-4 text-emerald-400" />
                      <span>Número de Atendentes / Vendedores</span>
                    </span>
                    <span className="font-mono text-base font-bold text-emerald-400 tabular-nums">
                      {agents} {agents === 1 ? 'atendente' : 'atendentes'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="45"
                    step="1"
                    value={agents}
                    onChange={(e) => setAgents(parseInt(e.target.value, 10))}
                    aria-label="Número de atendentes"
                    className="w-full accent-emerald-400 cursor-pointer h-2 bg-neutral-800 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-neutral-500">
                    <span>1 pessoa</span>
                    <span>20 pessoas</span>
                    <span>45+ pessoas</span>
                  </div>
                </div>

                {/* Slider 2: Conversations per day */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="font-semibold text-white flex items-center gap-2">
                      <Clock className="w-4 h-4 text-purple-400" />
                      <span>Novas Mensagens & Leads por Dia</span>
                    </span>
                    <span className="font-mono text-base font-bold text-purple-300 tabular-nums">
                      {conversationsPerDay} msgs/dia
                    </span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="2000"
                    step="50"
                    value={conversationsPerDay}
                    onChange={(e) => setConversationsPerDay(parseInt(e.target.value, 10))}
                    aria-label="Mensagens e leads por dia"
                    className="w-full accent-purple-400 cursor-pointer h-2 bg-neutral-800 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-neutral-500">
                    <span>50 chats</span>
                    <span>1.000 chats</span>
                    <span>2.000+ chats</span>
                  </div>
                </div>

                {/* Slider 3: Average Ticket */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="font-semibold text-white flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-teal-400" />
                      <span>Ticket Médio por Venda</span>
                    </span>
                    <span className="font-mono text-base font-bold text-teal-300 tabular-nums">
                      {formatBRL(avgTicket)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="3500"
                    step="50"
                    value={avgTicket}
                    onChange={(e) => setAvgTicket(parseInt(e.target.value, 10))}
                    aria-label="Ticket médio por venda"
                    className="w-full accent-teal-400 cursor-pointer h-2 bg-neutral-800 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-neutral-500">
                    <span>R$ 50</span>
                    <span>R$ 1.500</span>
                    <span>R$ 3.500+</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-neutral-400 pt-4 border-t border-white/[0.06]">
                Resultados calculados com base na média histórica de redução de abandono e distribuição
                automática de chats em menos de 28 segundos.
              </p>
            </InteractiveTiltCard>
          </motion.div>

          {/* Computed Results Column (moves at counter-parallax -40px -> +40px) */}
          <motion.div style={{ y: rightCardParallaxY }} className="lg:col-span-6 h-full">
            <InteractiveTiltCard
              intensity={4}
              glowColor="rgba(52, 211, 153, 0.2)"
              className="h-full rounded-2xl bg-gradient-to-br from-[#0F1C16] via-[#0B1310] to-[#150F22] border border-emerald-400/40 p-6 sm:p-8 flex flex-col justify-between shadow-[0_20px_60px_rgba(16,185,129,0.18)]"
            >
              <div className="space-y-6">
                <div>
                  <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider">
                    Ganho Estimado em Faturamento Líquido
                  </span>
                  <motion.div
                    key={extraRevenueMonth}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.25 }}
                    className="font-mono text-4xl sm:text-5xl font-extrabold text-white mt-1 tabular-nums"
                  >
                    {formatBRL(extraRevenueMonth)}
                    <span className="text-lg font-sans font-medium text-emerald-400/90 ml-2">
                      /mês
                    </span>
                  </motion.div>
                  <p className="text-xs text-neutral-300 mt-1">
                    Aproximadamente <strong className="text-white">+{extraDealsMonth} vendas extras</strong> todo
                    mês resgatadas do gargalo de resposta.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/[0.08]">
                  <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <div className="font-mono text-2xl font-bold text-emerald-400 tabular-nums">
                      {hoursSavedPerAgentWeek}h
                    </div>
                    <div className="text-xs text-neutral-300 mt-0.5">
                      Economizadas por atendente / semana
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <div className="font-mono text-2xl font-bold text-purple-300 tabular-nums">
                      &lt; {estimatedSlaDrop}s
                    </div>
                    <div className="text-xs text-neutral-300 mt-0.5">
                      Tempo médio de primeira resposta
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-4">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onOpenModal('Profissional')}
                  className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-[#04120B] font-semibold text-sm sm:text-base shadow-[0_0_24px_rgba(52,211,153,0.3)] transition-colors cursor-pointer"
                >
                  <span>Ativar este ganho na minha equipe</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            </InteractiveTiltCard>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
