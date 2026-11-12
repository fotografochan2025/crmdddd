import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'motion/react';
import {
  UserPlus,
  MessageSquare,
  CheckCircle2,
  Play,
  Mic,
  Volume2,
  Calendar,
  Video,
  GitBranch,
  ShieldCheck,
  Workflow,
  BarChart3,
  Sparkles,
} from 'lucide-react';
import { InteractiveTiltCard } from './InteractiveTiltCard';

interface VoiceScenario {
  id: string;
  label: string;
  clientAudio: string;
  agentResponse: string;
}

const VOICE_SCENARIOS: VoiceScenario[] = [
  {
    id: 'orcamento',
    label: 'Cotação Comercial',
    clientAudio: '“Olá! Gostaria de saber valores para 12 atendentes no WhatsApp Oficial e tempo de ativação.”',
    agentResponse: '“Olá! Nosso plano Profissional atende até 12 especialistas por R$ 197/mês com ativação imediata e sem fidelidade. Deseja liberar o teste de 7 dias agora?”',
  },
  {
    id: 'agenda',
    label: 'Agendamento B2B',
    clientAudio: '“Preciso agendar uma demonstração técnica com o especialista hoje à tarde.”',
    agentResponse: '“Perfeito! Temos horários disponíveis hoje às 14h00 ou às 16h30 com sala criada no Google Meet. Qual prefere?”',
  },
  {
    id: 'migracao',
    label: 'Migração de Base',
    clientAudio: '“Temos 12 mil contatos com etiquetas para importar do CRM antigo sem perder histórico.”',
    agentResponse: '“Com certeza! Nossa equipe faz a migração assistida com mapeamento completo de histórico sem taxa de implantação.”',
  },
];

interface CalendarSlot {
  id: string;
  day: string;
  time: string;
  client: string;
  booked: boolean;
}

const INITIAL_SLOTS: CalendarSlot[] = [
  { id: 's1', day: 'Ter', time: '09:00', client: 'Vértice Solar', booked: true },
  { id: 's2', day: 'Ter', time: '14:00', client: 'Disponível', booked: false },
  { id: 's3', day: 'Qua', time: '11:30', client: 'Clínica Lumina', booked: true },
  { id: 's4', day: 'Qua', time: '16:30', client: 'Disponível', booked: false },
  { id: 's5', day: 'Qui', time: '10:00', client: 'Disponível', booked: false },
  { id: 's6', day: 'Sex', time: '15:00', client: 'Grupo Horizonte', booked: true },
];

export const FlowAndAutomationStage: React.FC<{ onOpenModal: (plan?: string) => void }> = ({
  onOpenModal,
}) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start 85%', 'end 20%'],
  });
  const smoothScroll = useSpring(scrollYProgress, { stiffness: 110, damping: 24 });
  const spineHeight = useTransform(smoothScroll, [0, 1], ['12%', '100%']);

  // Interactive Flow Builder State
  const [branchChoice, setBranchChoice] = useState<'sim' | 'nao'>('sim');
  const [activeStep, setActiveStep] = useState<number>(3);
  const [isRunningFlow, setIsRunningFlow] = useState<boolean>(false);

  // Voice Agent Simulator State
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('orcamento');
  const [isPlayingVoice, setIsPlayingVoice] = useState<boolean>(false);
  const [currentResponseStage, setCurrentResponseStage] = useState<'client' | 'agent'>('client');

  // Smart Booking State
  const [slots, setSlots] = useState<CalendarSlot[]>(INITIAL_SLOTS);
  const [lastBookedSlot, setLastBookedSlot] = useState<string>('Qua · 11:30 (Clínica Lumina)');

  const currentScenario =
    VOICE_SCENARIOS.find((s) => s.id === selectedScenarioId) || VOICE_SCENARIOS[0];

  const runFlowSimulation = (targetBranch: 'sim' | 'nao' = branchChoice) => {
    setBranchChoice(targetBranch);
    if (isRunningFlow) return;
    setIsRunningFlow(true);
    setActiveStep(0);

    window.setTimeout(() => setActiveStep(1), 420);
    window.setTimeout(() => setActiveStep(2), 880);
    window.setTimeout(() => {
      setActiveStep(3);
      setIsRunningFlow(false);
    }, 1350);
  };

  useEffect(() => {
    if (!isPlayingVoice) return;
    setCurrentResponseStage('client');
    const timer1 = window.setTimeout(() => {
      setCurrentResponseStage('agent');
    }, 1800);

    const timer2 = window.setTimeout(() => {
      setIsPlayingVoice(false);
    }, 4200);

    return () => {
      window.clearTimeout(timer1);
      window.clearTimeout(timer2);
    };
  }, [isPlayingVoice]);

  const handleVoiceToggle = () => {
    setIsPlayingVoice((prev) => !prev);
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx && !isPlayingVoice) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(587.33, ctx.currentTime + 0.16);
        gain.gain.setValueAtTime(0.035, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.24);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      }
    } catch {
      // Ignore audio context restrictions
    }
  };

  const handleToggleSlot = (id: string) => {
    setSlots((prev) =>
      prev.map((slot) => {
        if (slot.id !== id) return slot;
        const nextBooked = !slot.booked;
        setLastBookedSlot(
          nextBooked
            ? `${slot.day} · ${slot.time} (Reserva Confirmada via Meet)`
            : `${slot.day} · ${slot.time} liberado novamente`
        );
        return {
          ...slot,
          booked: nextBooked,
          client: nextBooked ? 'Sua Demonstração' : 'Disponível',
        };
      })
    );
  };

  return (
    <div ref={sectionRef} className="relative py-20 space-y-28">
      {/* Continuous Scrollytelling Spine on Desktop */}
      <div
        aria-hidden="true"
        className="hidden xl:block absolute left-8 top-16 bottom-16 w-[2px] bg-white/[0.05]"
      >
        <motion.div
          style={{ height: spineHeight }}
          className="w-full bg-gradient-to-b from-emerald-400 via-emerald-300 to-purple-400"
        />
      </div>

      {/* PART 1: Asymmetric Capabilities + Interactive Visual Flow Builder */}
      <section id="fluxos" className="mx-auto max-w-[1240px] px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Interactive Visual Flow Canvas (7 cols) */}
          <div className="lg:col-span-7 order-2 lg:order-1">
            <InteractiveTiltCard
              intensity={5}
              className="rounded-2xl bg-[#0B100E] border border-white/[0.1] p-5 sm:p-6 shadow-[0_24px_70px_rgba(0,0,0,0.65)]"
            >
              {/* Canvas Top Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-5 border-b border-white/[0.07]">
                <div className="text-xs font-medium text-neutral-300">
                  Construtor Visual de Fluxos · Simulação Interativa
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 p-1 rounded-lg bg-white/[0.04] border border-white/[0.07]">
                    <button
                      type="button"
                      onClick={() => runFlowSimulation('sim')}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                        branchChoice === 'sim'
                          ? 'bg-emerald-400 text-[#04120B] font-semibold'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      Ramo: Sim
                    </button>
                    <button
                      type="button"
                      onClick={() => runFlowSimulation('nao')}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                        branchChoice === 'nao'
                          ? 'bg-purple-400 text-[#090414] font-semibold'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      Ramo: Não
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => runFlowSimulation(branchChoice)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/30 text-emerald-300 text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer"
                  >
                    <Play className="w-3 h-3" />
                    <span>Testar Fluxo</span>
                  </button>
                </div>
              </div>

              {/* Interactive Node Graph with Live SVG Signal Connectors */}
              <div className="relative bg-dot-matrix rounded-xl p-4 sm:p-6 border border-white/[0.05]">
                {/* Node 0: Novo Contato */}
                <div className="flex justify-center">
                  <motion.div
                    animate={{
                      scale: activeStep === 0 ? 1.04 : 1,
                      borderColor:
                        activeStep >= 0 ? 'rgba(52,211,153,0.5)' : 'rgba(255,255,255,0.1)',
                    }}
                    className="w-64 rounded-xl bg-[#111916] border px-4 py-3 flex items-center justify-between shadow-lg"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <UserPlus className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-semibold text-white">Novo contato</span>
                    </div>
                    <span className="font-mono text-[10px] text-emerald-400 tabular-nums">12ms</span>
                  </motion.div>
                </div>

                {/* Vertical Connector 0 -> 1 */}
                <div className="flex justify-center h-8">
                  <svg width="24" height="32" viewBox="0 0 24 32" fill="none">
                    <path d="M12 0 V32" stroke="rgba(255,255,255,0.16)" strokeWidth="2" />
                    <path
                      d="M12 0 V32"
                      stroke="#34D399"
                      strokeWidth="2.5"
                      className="animate-fiber-stream-fast"
                    />
                  </svg>
                </div>

                {/* Node 1: Enviar Mensagem */}
                <div className="flex justify-center">
                  <motion.div
                    animate={{
                      scale: activeStep === 1 ? 1.04 : 1,
                      borderColor:
                        activeStep >= 1 ? 'rgba(52,211,153,0.5)' : 'rgba(255,255,255,0.1)',
                    }}
                    className="w-72 rounded-xl bg-[#111916] border px-4 py-3 flex items-center justify-between shadow-lg"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <MessageSquare className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white">Enviar mensagem</div>
                        <div className="text-[10px] text-neutral-400">
                          Saudação + pergunta de qualificação
                        </div>
                      </div>
                    </div>
                    <span className="font-mono text-[10px] text-emerald-400 tabular-nums">85ms</span>
                  </motion.div>
                </div>

                {/* Split Bezier Connectors to Sim / Não */}
                <div className="w-full max-w-md mx-auto h-14">
                  <svg viewBox="0 0 400 56" fill="none" className="w-full h-full">
                    {/* Left Branch (Sim) */}
                    <path
                      d="M 200 0 C 200 28, 95 20, 95 56"
                      stroke={branchChoice === 'sim' ? 'rgba(52,211,153,0.65)' : 'rgba(255,255,255,0.13)'}
                      strokeWidth="2"
                    />
                    {branchChoice === 'sim' && (
                      <path
                        d="M 200 0 C 200 28, 95 20, 95 56"
                        stroke="#34D399"
                        strokeWidth="3"
                        className="animate-fiber-stream-fast"
                      />
                    )}

                    {/* Right Branch (Não) */}
                    <path
                      d="M 200 0 C 200 28, 305 20, 305 56"
                      stroke={branchChoice === 'nao' ? 'rgba(192,132,252,0.65)' : 'rgba(255,255,255,0.13)'}
                      strokeWidth="2"
                    />
                    {branchChoice === 'nao' && (
                      <path
                        d="M 200 0 C 200 28, 305 20, 305 56"
                        stroke="#C084FC"
                        strokeWidth="3"
                        className="animate-fiber-stream-fast"
                      />
                    )}
                  </svg>
                </div>

                {/* Branch Decision Nodes & Final Outcomes */}
                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                  {/* Left Branch: SIM */}
                  <button
                    type="button"
                    onClick={() => runFlowSimulation('sim')}
                    className={`rounded-xl p-3.5 text-left border transition-all cursor-pointer ${
                      branchChoice === 'sim'
                        ? 'bg-emerald-500/15 border-emerald-400/50 shadow-[0_0_25px_rgba(16,185,129,0.15)]'
                        : 'bg-[#101614] border-white/[0.08] opacity-65 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-300">Sim · Respondeu</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <p className="text-[11px] text-neutral-300 mt-1.5">
                      Move para Kanban + envia agenda do especialista
                    </p>
                  </button>

                  {/* Right Branch: NÃO */}
                  <button
                    type="button"
                    onClick={() => runFlowSimulation('nao')}
                    className={`rounded-xl p-3.5 text-left border transition-all cursor-pointer ${
                      branchChoice === 'nao'
                        ? 'bg-purple-500/15 border-purple-400/50 shadow-[0_0_25px_rgba(168,85,247,0.15)]'
                        : 'bg-[#101614] border-white/[0.08] opacity-65 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-300">Não · Ausente</span>
                      <GitBranch className="w-3.5 h-3.5 text-purple-300" />
                    </div>
                    <p className="text-[11px] text-neutral-300 mt-1.5">
                      Aguarda 15 min e dispara follow-up contextual
                    </p>
                  </button>
                </div>
              </div>
            </InteractiveTiltCard>
          </div>

          {/* Right Narrative Column (5 cols) */}
          <div className="lg:col-span-5 order-1 lg:order-2 space-y-6">
            <div className="text-xs font-medium text-emerald-400">
              01. Automação Visual Sem Código
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white text-balance">
              Crie fluxos poderosos com poucos cliques.
            </h2>
            <p className="text-base text-neutral-300 leading-relaxed">
              Desenhe árvores de decisão visuais que qualificam leads, distribuem conversas por
              setor e recuperam clientes inativos sem depender de código.
            </p>

            {/* Clean editorial capability list */}
            <div className="space-y-4 pt-2 border-t border-white/[0.08]">
              <div className="flex items-start gap-3.5">
                <Workflow className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    Roteamento Inteligente por Fila
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
                    Direcione vendas, financeiro e suporte para a equipe certa automaticamente.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <BarChart3 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    Gatilhos de Conversão no Kanban
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
                    Atualize etapas do funil e etiquetas assim que o cliente interagir.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    Isolamento Total e Segurança Oficial
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
                    Conexão homologada para escalar volume com proteção contra bloqueios.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PART 2: Autonomous Voice Waveform & Smart Calendar Booking */}
      <section id="automacoes" className="mx-auto max-w-[1240px] px-6 space-y-10">
        <div className="max-w-2xl space-y-3">
          <div className="text-xs font-medium text-emerald-400">
            02. Atendimento Natural e Agenda Sincronizada
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white text-balance">
            Voz humanizada e agendamento direto na conversa.
          </h2>
          <p className="text-base text-neutral-300">
            Compreenda áudios longos em segundos e feche reuniões sincronizadas ao Google Calendar
            sem sair do chat.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Card 1: Autonomous Voice & Audio Visualizer (6 cols) */}
          <InteractiveTiltCard
            intensity={6}
            glowColor="rgba(168, 85, 247, 0.14)"
            className="lg:col-span-6 rounded-2xl bg-[#0C1210] border border-white/[0.1] p-6 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <button
                    type="button"
                    onClick={handleVoiceToggle}
                    aria-label="Ativar simulação de voz"
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all cursor-pointer shrink-0 ${
                      isPlayingVoice
                        ? 'bg-emerald-400 text-[#04120B] border-emerald-300 shadow-[0_0_24px_rgba(52,211,153,0.45)]'
                        : 'bg-white/[0.05] text-emerald-400 border-white/[0.12] hover:bg-white/[0.1]'
                    }`}
                  >
                    {isPlayingVoice ? <Volume2 className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>
                  <div>
                    <h3 className="font-display text-lg font-bold text-white">
                      Compreensão e Resposta em Áudio
                    </h3>
                    <p className="text-xs text-neutral-400">
                      Transcrição instantânea e resposta com cadência natural
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleVoiceToggle}
                  className="px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-xs font-semibold text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {isPlayingVoice ? 'Processando Áudio...' : 'Simular Áudio'}
                </button>
              </div>

              {/* Scenario Selector Pills */}
              <div className="flex items-center gap-2 pt-1">
                {VOICE_SCENARIOS.map((sc) => (
                  <button
                    key={sc.id}
                    type="button"
                    onClick={() => {
                      setSelectedScenarioId(sc.id);
                      setIsPlayingVoice(true);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer truncate ${
                      selectedScenarioId === sc.id
                        ? 'bg-emerald-400 text-[#04120B] font-bold'
                        : 'bg-white/[0.04] text-neutral-300 hover:bg-white/[0.08]'
                    }`}
                  >
                    {sc.label}
                  </button>
                ))}
              </div>

              {/* Live Transcript Box */}
              <div className="rounded-xl bg-black/35 border border-white/[0.06] p-4 min-h-[92px] flex flex-col justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${selectedScenarioId}-${currentResponseStage}-${isPlayingVoice}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-emerald-400 font-semibold">
                        {currentResponseStage === 'client' ? 'Áudio do Cliente' : 'Resposta da IA MultiAtend'}
                      </span>
                      <span className="text-neutral-500 tabular-nums">
                        {currentResponseStage === 'client' ? '0:12' : 'SLA: 0.8s'}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed italic">
                      {currentResponseStage === 'client'
                        ? currentScenario.clientAudio
                        : currentScenario.agentResponse}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* 32-Bar Harmonic Waveform Visualizer */}
            <div className="pt-6 mt-4">
              <div className="h-20 flex items-center justify-between gap-1 px-2">
                {Array.from({ length: 32 }).map((_, idx) => {
                  const ratio = idx / 31;
                  const baseScale = 0.25 + Math.sin(idx * 0.55) * 0.2 + 0.15;
                  const activePeak = 0.35 + ((idx * 17) % 65) / 100;
                  const barColor =
                    ratio < 0.45
                      ? 'bg-emerald-400'
                      : ratio < 0.72
                      ? 'bg-teal-300'
                      : 'bg-purple-400';

                  return (
                    <motion.div
                      key={idx}
                      animate={{
                        scaleY: isPlayingVoice
                          ? [baseScale, activePeak, 0.22, activePeak * 0.85, baseScale]
                          : [baseScale, baseScale * 1.35, baseScale],
                      }}
                      transition={{
                        duration: isPlayingVoice ? 0.65 + (idx % 5) * 0.08 : 2.2 + (idx % 4) * 0.25,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                      style={{ originY: 0.5 }}
                      className={`w-1.5 h-16 rounded-full ${barColor} opacity-85`}
                    />
                  );
                })}
              </div>
            </div>
          </InteractiveTiltCard>

          {/* Card 2: Smart Calendar Booking (6 cols) */}
          <InteractiveTiltCard
            intensity={6}
            className="lg:col-span-6 rounded-2xl bg-[#0C1210] border border-white/[0.1] p-6 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-display text-lg font-bold text-white">
                    Smart Booking Integrado
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Clique em qualquer horário abaixo para reservar ou liberar na agenda
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs text-emerald-300 font-medium shrink-0">
                  <Calendar className="w-4 h-4" />
                  <span>Google Calendar</span>
                </div>
              </div>

              {/* Interactive Slot Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                {slots.map((slot) => (
                  <motion.button
                    key={slot.id}
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleToggleSlot(slot.id)}
                    className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                      slot.booked
                        ? 'bg-emerald-500/15 border-emerald-400/45 text-white'
                        : 'bg-white/[0.03] hover:bg-white/[0.07] border-white/[0.08] text-neutral-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-mono tabular-nums">
                      <span className="font-semibold">
                        {slot.day} · {slot.time}
                      </span>
                      {slot.booked && <Video className="w-3.5 h-3.5 text-emerald-400" />}
                    </div>
                    <div
                      className={`text-[11px] mt-1 truncate ${
                        slot.booked ? 'text-emerald-300 font-medium' : 'text-neutral-500'
                      }`}
                    >
                      {slot.client}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Synced Confirmation Footer */}
            <div className="mt-6 pt-4 border-t border-white/[0.07] flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-neutral-300">
                Última sincronização: <strong className="text-emerald-300">{lastBookedSlot}</strong>
              </div>
              <button
                type="button"
                onClick={() => onOpenModal('Profissional')}
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors whitespace-nowrap cursor-pointer"
              >
                Conectar minha agenda →
              </button>
            </div>
          </InteractiveTiltCard>
        </div>
      </section>
    </div>
  );
};
