import React, { useState, useEffect } from 'react';
import { motion, useScroll } from 'motion/react';
import { Navbar } from './components/Navbar';
import { HeroPhoneStage } from './components/HeroPhoneStage';
import { FiberConduitSVG } from './components/FiberConduitSVG';
import { LiveKanbanWorkspace } from './components/LiveKanbanWorkspace';
import { RoiCalculatorStage } from './components/RoiCalculatorStage';
import { FlowAndAutomationStage } from './components/FlowAndAutomationStage';
import { OmnichannelAndMetricsStage } from './components/OmnichannelAndMetricsStage';
import { PricingAndProofStage } from './components/PricingAndProofStage';
import { LeadItem, KanbanStage } from './types/crm';

const INITIAL_LEADS: LeadItem[] = [
  {
    id: 'lead-1',
    name: 'Ana Beatriz',
    company: 'OdontoPrime SP',
    initials: 'AB',
    avatarBg: 'bg-emerald-600',
    channel: 'whatsapp',
    lastMessage: 'Quero migrar 8 atendentes ainda hoje.',
    time: '14:14',
    value: 6800,
    agent: 'Lucas',
    stage: 'atendimento',
    slaSeconds: 39,
  },
  {
    id: 'lead-2',
    name: 'Francisco Oliveira',
    company: 'Construtora Horizonte',
    initials: 'FO',
    avatarBg: 'bg-purple-600',
    channel: 'instagram',
    lastMessage: 'Enviou resposta ao Story de lançamento.',
    time: '14:11',
    value: 14500,
    agent: 'Helena',
    stage: 'atendimento',
    slaSeconds: 32,
  },
  {
    id: 'lead-3',
    name: 'Camila Rocha',
    company: 'Studio Forma',
    initials: 'CR',
    avatarBg: 'bg-teal-600',
    channel: 'whatsapp',
    lastMessage: 'Aguardando aprovação da diretoria.',
    time: '13:58',
    value: 4900,
    agent: 'Lucas',
    stage: 'aguardando',
    slaSeconds: 45,
  },
  {
    id: 'lead-4',
    name: 'André Vasconcelos',
    company: 'Grupo Atlas',
    initials: 'AV',
    avatarBg: 'bg-indigo-600',
    channel: 'audio',
    lastMessage: 'Áudio transcrito: pediu link anual.',
    time: '13:49',
    value: 9200,
    agent: 'Mateus',
    stage: 'aguardando',
    slaSeconds: 41,
  },
  {
    id: 'lead-5',
    name: 'Sofia Alencar',
    company: 'Vértice Solar',
    initials: 'SA',
    avatarBg: 'bg-emerald-700',
    channel: 'whatsapp',
    lastMessage: 'Contrato assinado e PIX confirmado!',
    time: '13:30',
    value: 18400,
    agent: 'Helena',
    stage: 'finalizado',
    slaSeconds: 59,
  },
  {
    id: 'lead-6',
    name: 'Rafael Nogueira',
    company: 'Veloz Logística',
    initials: 'RN',
    avatarBg: 'bg-purple-700',
    channel: 'instagram',
    lastMessage: 'Plano Empresarial ativado com 15 licenças.',
    time: '13:12',
    value: 11900,
    agent: 'Mateus',
    stage: 'finalizado',
    slaSeconds: 59,
  },
];

const SIMULATED_PROSPECTS = [
  { name: 'Bruno Tavares', company: 'TechSul Sistemas', initials: 'BT', value: 8400, channel: 'whatsapp' as const },
  { name: 'Juliana Prado', company: 'Estética Viva', initials: 'JP', value: 5600, channel: 'instagram' as const },
  { name: 'Eduardo Ferraz', company: 'Ferraz Engenharia', initials: 'EF', value: 16200, channel: 'whatsapp' as const },
  { name: 'Patrícia Lima', company: 'EducaMais Digital', initials: 'PL', value: 7900, channel: 'audio' as const },
];

const CHAPTERS = [
  { id: 'topo', label: 'Início · 3D' },
  { id: 'painel-ao-vivo', label: 'Kanban Ao Vivo' },
  { id: 'roi-calculator', label: 'Simulador ROI' },
  { id: 'fluxos', label: 'Fluxos Visuais' },
  { id: 'automacoes', label: 'Voz e Agenda' },
  { id: 'canais', label: 'Ecossistema' },
  { id: 'planos', label: 'Planos' },
];

export default function App() {
  const [leads, setLeads] = useState<LeadItem[]>(INITIAL_LEADS);
  const [pulseBurstKey, setPulseBurstKey] = useState<number>(0);
  const [simulatedCount, setSimulatedCount] = useState<number>(0);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('Profissional');
  const [activeChapterIdx, setActiveChapterIdx] = useState<number>(0);

  const { scrollYProgress } = useScroll();

  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (val) => {
      const idx = Math.min(CHAPTERS.length - 1, Math.floor(val * CHAPTERS.length));
      setActiveChapterIdx(idx);
    });
    return () => unsubscribe();
  }, [scrollYProgress]);

  const handleSimulateNewLead = () => {
    const nextIdx = simulatedCount % SIMULATED_PROSPECTS.length;
    const prospect = SIMULATED_PROSPECTS[nextIdx];
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;

    const createdLead: LeadItem = {
      id: `sim-lead-${Date.now()}`,
      name: prospect.name,
      company: prospect.company,
      initials: prospect.initials,
      avatarBg: nextIdx % 2 === 0 ? 'bg-emerald-600' : 'bg-purple-600',
      channel: prospect.channel,
      lastMessage: 'Acabou de entrar via campanha omnichannel!',
      time: timeStr,
      value: prospect.value,
      agent: 'Fila Automática',
      stage: 'atendimento',
      slaSeconds: 59,
    };

    setLeads((prev) => [createdLead, ...prev.slice(0, 8)]);
    setPulseBurstKey((prev) => prev + 1);
    setSimulatedCount((prev) => prev + 1);
  };

  const handleAdvanceLead = (id: string) => {
    const nextStageMap: Record<KanbanStage, KanbanStage> = {
      atendimento: 'aguardando',
      aguardando: 'finalizado',
      finalizado: 'atendimento',
    };

    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === id ? { ...lead, stage: nextStageMap[lead.stage] } : lead
      )
    );
  };

  const handleResetSla = (id: string) => {
    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === id
          ? { ...lead, lastMessage: 'Respondido agora pela equipe!', slaSeconds: 59 }
          : lead
      )
    );
  };

  const handleOpenModal = (planName?: string) => {
    if (planName) setSelectedPlan(planName);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#060908] bg-architectural-grid text-[#F1F5F3] relative">
      {/* Top 3-Zone Navigation with Scroll Progress Hairline */}
      <Navbar onOpenModal={handleOpenModal} />

      {/* Desktop Scrollytelling Chapter Navigator */}
      <aside
        aria-label="Capítulos da página"
        className="hidden xl:flex fixed right-6 top-1/2 -translate-y-1/2 z-40 flex-col gap-3"
      >
        {CHAPTERS.map((chap, idx) => {
          const isActive = idx === activeChapterIdx;
          return (
            <a
              key={chap.id}
              href={`#${chap.id}`}
              className="group flex items-center justify-end gap-2.5"
            >
              <span
                className={`text-[11px] font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'opacity-100 text-emerald-300 translate-x-0'
                    : 'opacity-0 group-hover:opacity-100 text-neutral-400 translate-x-1 group-hover:translate-x-0'
                }`}
              >
                {chap.label}
              </span>
              <motion.span
                animate={{
                  scaleY: isActive ? 1.8 : 1,
                  backgroundColor: isActive ? '#34D399' : 'rgba(255,255,255,0.22)',
                }}
                className="w-1.5 h-3 rounded-full block transition-colors"
              />
            </a>
          );
        })}
      </aside>

      {/* Main Scrollytelling Flow */}
      <main>
        {/* Stage 1: Hero Proposition + 3D Exploded View Smartphone */}
        <HeroPhoneStage
          onSimulateLead={handleSimulateNewLead}
          onOpenModal={handleOpenModal}
          simulatedCount={simulatedCount}
        />

        {/* Scrollytelling Energy Bridge: 11-Strand Glowing Fiber-Optic Conduit */}
        <FiberConduitSVG pulseBurstKey={pulseBurstKey} />

        {/* Stage 2: Interactive Live Chat + Kanban + Real-time SLA Countdown */}
        <LiveKanbanWorkspace
          leads={leads}
          onAdvanceLead={handleAdvanceLead}
          onAddQuickLead={handleSimulateNewLead}
          onResetSla={handleResetSla}
        />

        {/* Stage 3: Interactive ROI & Revenue Simulator */}
        <div id="roi-calculator">
          <RoiCalculatorStage onOpenModal={handleOpenModal} />
        </div>

        {/* Stage 4 & 5: Visual Flow Builder + Voice Waveform + Smart Booking */}
        <FlowAndAutomationStage onOpenModal={handleOpenModal} />

        {/* Stage 6: Interactive Omnichannel Router + Glassmorphic KPI Metrics */}
        <OmnichannelAndMetricsStage />

        {/* Stage 7: Pricing, Attributable Testimonials, CTA & Validated Modal */}
        <PricingAndProofStage
          modalOpen={modalOpen}
          selectedPlan={selectedPlan}
          onOpenModal={handleOpenModal}
          onCloseModal={() => setModalOpen(false)}
        />
      </main>
    </div>
  );
}
