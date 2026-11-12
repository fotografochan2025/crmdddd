import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'motion/react';
import {
  MessageSquare,
  Instagram,
  PhoneCall,
  ArrowRight,
  Clock,
  CheckCircle2,
  Plus,
  Search,
  Sparkles,
} from 'lucide-react';
import { LeadItem, KanbanStage, ChannelType } from '../types/crm';

interface LiveKanbanWorkspaceProps {
  leads: LeadItem[];
  onAdvanceLead: (id: string) => void;
  onAddQuickLead: () => void;
  onResetSla: (id: string) => void;
}

const STAGE_META: { key: KanbanStage; title: string; accentText: string; barColor: string }[] = [
  {
    key: 'atendimento',
    title: 'Em Atendimento',
    accentText: 'text-emerald-400',
    barColor: 'bg-emerald-400',
  },
  {
    key: 'aguardando',
    title: 'Aguardando Retorno',
    accentText: 'text-amber-300',
    barColor: 'bg-amber-400',
  },
  {
    key: 'finalizado',
    title: 'Venda Concluída',
    accentText: 'text-purple-300',
    barColor: 'bg-purple-400',
  },
];

const formatCurrency = (val: number) =>
  val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

const ChannelIcon: React.FC<{ channel: ChannelType }> = ({ channel }) => {
  if (channel === 'instagram') return <Instagram className="w-3.5 h-3.5 text-purple-400 shrink-0" />;
  if (channel === 'audio') return <PhoneCall className="w-3.5 h-3.5 text-teal-300 shrink-0" />;
  return <MessageSquare className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
};

export const LiveKanbanWorkspace: React.FC<LiveKanbanWorkspaceProps> = ({
  leads,
  onAdvanceLead,
  onAddQuickLead,
  onResetSla,
}) => {
  const containerRef = useRef<HTMLElement>(null);
  const [selectedLeadId, setSelectedLeadId] = useState<string>(leads[0]?.id ?? '');
  const [channelFilter, setChannelFilter] = useState<'all' | ChannelType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [globalClockSeconds, setGlobalClockSeconds] = useState(3 * 3600 + 6 * 60 + 18);
  const [activeTick, setActiveTick] = useState(39);
  const [replyFlash, setReplyFlash] = useState(false);

  // Scrollytelling 3D perspective unfolding + Differential Section Parallaxes
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });
  const smoothScroll = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });
  const rotateX = useTransform(smoothScroll, [0.1, 0.45], [11, 0]);
  const scale = useTransform(smoothScroll, [0.1, 0.45], [0.95, 1]);
  const opacity = useTransform(smoothScroll, [0.08, 0.35], [0.65, 1]);

  // Differential parallax channels across Kanban sub-elements
  const bgAuraY = useTransform(smoothScroll, [0, 1], [-60, 60]);
  const sidebarY = useTransform(smoothScroll, [0, 1], [18, -18]);
  const colAtendimentoY = useTransform(smoothScroll, [0, 1], [26, -26]);
  const colAguardandoY = useTransform(smoothScroll, [0, 1], [-18, 18]); // counter-drift
  const colFinalizadoY = useTransform(smoothScroll, [0, 1], [34, -34]);
  const slaInspectorY = useTransform(smoothScroll, [0, 1], [-25, 25]);

  // Live ticking SLA countdown clock
  useEffect(() => {
    const timer = window.setInterval(() => {
      setGlobalClockSeconds((prev) => (prev > 60 ? prev - 1 : 3 * 3600 + 6 * 60 + 18));
      setActiveTick((prev) => (prev > 4 ? prev - 1 : 45));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const selectedLead = leads.find((l) => l.id === selectedLeadId) || leads[0];

  const filteredLeads = leads.filter((lead) => {
    const matchesChannel = channelFilter === 'all' || lead.channel === channelFilter;
    const matchesQuery =
      searchQuery.trim() === '' ||
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesChannel && matchesQuery;
  });

  const closedRevenue = leads
    .filter((l) => l.stage === 'finalizado')
    .reduce((acc, item) => acc + item.value, 0);

  const formatGlobalClock = (totalSec: number) => {
    const hrs = String(Math.floor(totalSec / 3600)).padStart(2, '0');
    const mins = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
    const secs = String(totalSec % 60).padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  };

  const handleQuickReply = () => {
    if (!selectedLead) return;
    setActiveTick(59);
    onResetSla(selectedLead.id);
    setReplyFlash(true);
    window.setTimeout(() => setReplyFlash(false), 1400);
  };

  return (
    <section id="painel-ao-vivo" ref={containerRef} className="relative pb-24 pt-2 overflow-visible">
      {/* Parallax Background Aura */}
      <motion.div
        style={{ y: bgAuraY }}
        aria-hidden="true"
        className="pointer-events-none absolute top-1/3 left-1/4 w-[540px] h-[540px] rounded-full bg-emerald-500/[0.05] blur-[150px]"
      />

      <div className="mx-auto max-w-[1240px] px-6">
        {/* Interactive Workspace Shell with 3D entry transform */}
        <motion.div
          style={{
            rotateX,
            scale,
            opacity,
            transformPerspective: 1400,
          }}
          className="relative rounded-2xl bg-[#0B100E] border border-white/[0.1] shadow-[0_32px_90px_rgba(0,0,0,0.8),0_0_70px_rgba(16,185,129,0.1)] overflow-hidden"
        >
          {/* Top Workspace Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-3.5 bg-[#0E1512] border-b border-white/[0.08]">
            <div className="flex items-center gap-4">
              <span className="font-display font-semibold text-sm text-white">
                Central de Atendimento e Kanban Ao Vivo
              </span>
              <span aria-hidden="true" className="hidden sm:inline text-neutral-600">·</span>
              <span className="hidden sm:inline text-xs text-neutral-400 font-mono tabular-nums">
                Receita Concluída Hoje: <strong className="text-emerald-400">{formatCurrency(closedRevenue)}</strong>
              </span>
            </div>

            {/* Interactive Channel Filter Segmented Control */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 p-1 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                {(
                  [
                    { id: 'all', label: 'Todos' },
                    { id: 'whatsapp', label: 'WhatsApp' },
                    { id: 'instagram', label: 'Instagram' },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setChannelFilter(tab.id)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                      channelFilter === tab.id
                        ? 'bg-emerald-400 text-[#04120B] font-semibold'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={onAddQuickLead}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/30 text-emerald-300 text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Novo Atendimento</span>
              </button>
            </div>
          </div>

          {/* Main 3-Zone CRM Grid: Conversations List | Kanban Board | SLA Countdown Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[510px]">
            {/* Zone A: Live Customer Conversations with Parallax Channel (3 cols) */}
            <motion.div
              style={{ y: sidebarY }}
              className="lg:col-span-3 border-b lg:border-b-0 lg:border-r border-white/[0.07] bg-[#090E0C] flex flex-col"
            >
              <div className="p-3.5 border-b border-white/[0.06]">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar cliente ou empresa..."
                    aria-label="Buscar cliente ou empresa"
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.07] text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-emerald-400/50"
                  />
                </div>
              </div>

              <div className="divide-y divide-white/[0.05] overflow-y-auto max-h-[450px]">
                {filteredLeads.map((lead) => {
                  const isSelected = selectedLead?.id === lead.id;
                  return (
                    <button
                      key={lead.id}
                      type="button"
                      onClick={() => setSelectedLeadId(lead.id)}
                      className={`w-full text-left px-3.5 py-3 transition-colors flex items-start gap-3 cursor-pointer ${
                        isSelected ? 'bg-emerald-500/[0.11]' : 'hover:bg-white/[0.03]'
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-full ${lead.avatarBg} flex items-center justify-center text-xs font-display font-bold text-white shrink-0`}
                      >
                        {lead.initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-white truncate">
                            {lead.name}
                          </span>
                          <span className="font-mono text-[10px] text-neutral-400 tabular-nums shrink-0">
                            {lead.time}
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                          {lead.lastMessage}
                        </p>
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="text-[10px] text-neutral-500 truncate">
                            {lead.company}
                          </span>
                          <ChannelIcon channel={lead.channel} />
                        </div>
                      </div>
                    </button>
                  );
                })}
                {filteredLeads.length === 0 && (
                  <div className="p-6 text-center text-xs text-neutral-500">
                    Nenhum atendimento encontrado para este filtro.
                  </div>
                )}
              </div>
            </motion.div>

            {/* Zone B: Interactive 3-Column Kanban Pipeline with Staggered Differential Parallax (6 cols) */}
            <div className="lg:col-span-6 p-4 bg-[#0B100E] grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {STAGE_META.map((column, idx) => {
                const columnLeads = filteredLeads.filter((l) => l.stage === column.key);
                const colParallax =
                  idx === 0
                    ? colAtendimentoY
                    : idx === 1
                    ? colAguardandoY
                    : colFinalizadoY;

                return (
                  <motion.div
                    key={column.key}
                    style={{ y: colParallax }}
                    className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-3 flex flex-col"
                  >
                    {/* Column Header */}
                    <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-white/[0.06]">
                      <span className={`text-xs font-semibold ${column.accentText}`}>
                        {column.title}
                      </span>
                      <span className="font-mono text-xs text-neutral-400 tabular-nums">
                        {columnLeads.length}
                      </span>
                    </div>

                    {/* Animated Kanban Cards */}
                    <div className="space-y-2.5 flex-1">
                      <AnimatePresence mode="popLayout">
                        {columnLeads.map((item) => {
                          const isCurrent = selectedLead?.id === item.id;
                          return (
                            <motion.div
                              key={item.id}
                              layout
                              initial={{ opacity: 0, scale: 0.94 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.92 }}
                              transition={{ duration: 0.22 }}
                              onClick={() => setSelectedLeadId(item.id)}
                              className={`rounded-xl p-3 border transition-colors cursor-pointer ${
                                isCurrent
                                  ? 'bg-white/[0.07] border-emerald-400/45'
                                  : 'bg-[#101714] hover:bg-white/[0.05] border-white/[0.07]'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-semibold text-white truncate">
                                  {item.name}
                                </span>
                                <ChannelIcon channel={item.channel} />
                              </div>

                              <div className="text-[11px] text-neutral-400 truncate mt-0.5">
                                {item.company} · {item.agent}
                              </div>

                              <div className="mt-2.5 pt-2 border-t border-white/[0.06] flex items-center justify-between gap-2">
                                <span className="font-mono text-xs font-semibold text-emerald-300 tabular-nums">
                                  {formatCurrency(item.value)}
                                </span>

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onAdvanceLead(item.id);
                                  }}
                                  className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-300 hover:text-emerald-300 transition-colors whitespace-nowrap cursor-pointer"
                                >
                                  <span>
                                    {item.stage === 'finalizado' ? 'Reabrir' : 'Avançar'}
                                  </span>
                                  <ArrowRight className="w-3 h-3" />
                                </button>
                              </div>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Zone C: Real-Time SLA Countdown & Inspector with Parallax (3 cols) */}
            <motion.div
              style={{ y: slaInspectorY }}
              className="lg:col-span-3 border-t lg:border-t-0 lg:border-l border-white/[0.07] bg-gradient-to-b from-[#101815] to-[#0B100E] p-4 flex flex-col justify-between gap-4"
            >
              <div className="space-y-4">
                <div>
                  <div className="text-xs font-medium text-neutral-400 flex items-center justify-between">
                    <span>Monitor de SLA em Tempo Real</span>
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  {selectedLead && (
                    <p className="text-xs text-neutral-300 mt-1 truncate">
                      Foco: <strong className="text-white">{selectedLead.name}</strong> ({selectedLead.company})
                    </p>
                  )}
                </div>

                {/* Dual SLA Timer Glass Box */}
                <div className="rounded-xl p-4 bg-white/[0.04] border border-white/[0.1] backdrop-blur-md">
                  <div className="text-[11px] text-neutral-400 mb-2">SLA Countdown Individual</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="font-mono text-2xl font-bold text-emerald-400 tabular-nums">
                        0:{String(activeTick).padStart(2, '0')}
                      </div>
                      <div className="text-[11px] text-neutral-400 mt-0.5">Atendimento</div>
                    </div>
                    <div>
                      <div
                        className={`font-mono text-2xl font-bold tabular-nums ${
                          activeTick < 15 ? 'text-rose-400' : 'text-purple-300'
                        }`}
                      >
                        0:{String(Math.max(activeTick - 4, 1)).padStart(2, '0')}
                      </div>
                      <div className="text-[11px] text-neutral-400 mt-0.5">Resposta</div>
                    </div>
                  </div>
                </div>

                {/* Global Daily SLA Window */}
                <div className="rounded-xl p-4 bg-white/[0.03] border border-white/[0.08]">
                  <div className="text-[11px] text-neutral-400 mb-1">
                    Janela Operacional do Turno
                  </div>
                  <div className="font-mono text-2xl font-semibold text-white tracking-wider tabular-nums">
                    {formatGlobalClock(globalClockSeconds)}
                  </div>
                  <div className="mt-2 text-[11px] text-neutral-400">
                    98,4% dos chats respondidos abaixo de 45s
                  </div>
                </div>
              </div>

              {/* Interactive One-Click Smart Reply Action */}
              <div className="space-y-2.5">
                <AnimatePresence>
                  {replyFlash && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2 text-xs text-emerald-300 bg-emerald-500/15 border border-emerald-400/30 rounded-lg px-3 py-2"
                    >
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>Resposta enviada! SLA renovado.</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleQuickReply}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-[#04120B] font-semibold text-xs transition-colors whitespace-nowrap cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Responder Cliente Agora</span>
                </motion.button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
