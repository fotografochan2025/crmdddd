import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageSquare,
  Instagram,
  Share2,
  Send,
  Globe,
  Smartphone,
  ArrowUpRight,
} from 'lucide-react';
import { InteractiveTiltCard } from './InteractiveTiltCard';

interface ChannelSpec {
  id: string;
  name: string;
  metric: string;
  sla: string;
  conversionLift: string;
  description: string;
  accentHex: string;
  icon: React.ReactNode;
}

const CHANNELS: ChannelSpec[] = [
  {
    id: 'whatsapp',
    name: 'WhatsApp API Oficial',
    metric: '18.420 msgs/dia',
    sla: '19s resposta média',
    conversionLift: '+310% em fechamentos',
    description:
      'Múltiplos atendentes no mesmo número com disparo de templates aprovados, catálogos e botões interativos.',
    accentHex: '#10B981',
    icon: <MessageSquare className="w-5 h-5" />,
  },
  {
    id: 'instagram',
    name: 'Instagram Direct & Stories',
    metric: '6.890 interações/dia',
    sla: '24s resposta média',
    conversionLift: '+240% via Stories',
    description:
      'Transforme menções em Stories, comentários em Reels e mensagens no Direct em oportunidades no Kanban.',
    accentHex: '#A855F7',
    icon: <Instagram className="w-5 h-5" />,
  },
  {
    id: 'tiktok',
    name: 'TikTok Lead Messaging',
    metric: '3.150 leads/semana',
    sla: '21s resposta média',
    conversionLift: '+185% aproveitamento',
    description:
      'Receba leads de campanhas TikTok Ads em tempo real e acione boas-vindas antes que o interesse esfrie.',
    accentHex: '#2DD4BF',
    icon: <Smartphone className="w-5 h-5" />,
  },
  {
    id: 'messenger',
    name: 'Facebook Messenger',
    metric: '4.120 conversas/mês',
    sla: '26s resposta média',
    conversionLift: '+160% qualificação',
    description:
      'Unifique o atendimento da sua página comercial e anúncios Click-to-Messenger no mesmo painel.',
    accentHex: '#38BDF8',
    icon: <Share2 className="w-5 h-5" />,
  },
  {
    id: 'telegram',
    name: 'Telegram Corporativo',
    metric: '2.740 mensagens/dia',
    sla: '15s resposta média',
    conversionLift: '+195% retenção VIP',
    description:
      'Gerencie comunidades, grupos de clientes recorrentes e suporte técnico com histórico centralizado.',
    accentHex: '#60A5FA',
    icon: <Send className="w-5 h-5" />,
  },
  {
    id: 'webhooks',
    name: 'Webhooks & ERP REST',
    metric: 'Sincronização < 90ms',
    sla: '99,98% entrega',
    conversionLift: 'Zero retrabalho manual',
    description:
      'Integre RD Station, Asaas, Hotmart, Shopify e seu ERP próprio por eventos em tempo real.',
    accentHex: '#34D399',
    icon: <Globe className="w-5 h-5" />,
  },
];

const KPI_CARDS = [
  {
    value: '+300%',
    label: 'Conversão comercial',
    context: 'Média apurada em equipes de 5 a 40 vendedores nos primeiros 90 dias',
  },
  {
    value: '< 28s',
    label: 'Primeira resposta',
    context: 'Triagem imediata 24h com distribuição equilibrada por especialista',
  },
  {
    value: '100+',
    label: 'Atendentes em 1 linha',
    context: 'Escala departamental completa usando um único número oficial',
  },
  {
    value: '99,98%',
    label: 'Disponibilidade anual',
    context: 'Infraestrutura isolada por empresa com backup contínuo em nuvem',
  },
];

export const OmnichannelAndMetricsStage: React.FC = () => {
  const [selectedChannelId, setSelectedChannelId] = useState<string>('whatsapp');
  const activeChannel = CHANNELS.find((c) => c.id === selectedChannelId) || CHANNELS[0];

  return (
    <section id="canais" className="py-20 border-t border-white/[0.06]">
      <div className="mx-auto max-w-[1240px] px-6 space-y-20">
        {/* Omnichannel Interactive Router */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5 space-y-4">
            <div className="text-xs font-medium text-emerald-400">
              03. Ecossistema Omnichannel
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white text-balance">
              Conecte seus canais favoritos em um só lugar.
            </h2>
            <p className="text-base text-neutral-300 leading-relaxed">
              Selecione um canal ao lado para inspecionar o fluxo de entrada, o SLA médio e o
              impacto direto no funil de vendas da sua operação.
            </p>
          </div>

          <div className="lg:col-span-7 space-y-4">
            {/* 6 Interactive Channel Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {CHANNELS.map((ch) => {
                const isSelected = ch.id === selectedChannelId;
                return (
                  <motion.button
                    key={ch.id}
                    type="button"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedChannelId(ch.id)}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                      isSelected
                        ? 'bg-white/[0.08] border-emerald-400/50 text-white shadow-[0_0_28px_rgba(16,185,129,0.14)]'
                        : 'bg-[#0B100E] hover:bg-white/[0.04] border-white/[0.08] text-neutral-300'
                    }`}
                  >
                    <div
                      style={{ color: ch.accentHex }}
                      className="w-9 h-9 rounded-lg bg-white/[0.05] flex items-center justify-center shrink-0"
                    >
                      {ch.icon}
                    </div>
                    <span className="text-xs font-semibold leading-snug">{ch.name}</span>
                  </motion.button>
                );
              })}
            </div>

            {/* Live Channel Telemetry Inspector Card */}
            <InteractiveTiltCard
              intensity={4}
              className="rounded-2xl bg-[#0C1310] border border-white/[0.1] p-5 sm:p-6"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeChannel.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span style={{ color: activeChannel.accentHex }}>{activeChannel.icon}</span>
                      <h3 className="font-display text-lg font-bold text-white">
                        {activeChannel.name}
                      </h3>
                    </div>
                    <span className="font-mono text-xs text-emerald-300 tabular-nums">
                      {activeChannel.conversionLift}
                    </span>
                  </div>

                  <p className="text-sm text-neutral-300 leading-relaxed">
                    {activeChannel.description}
                  </p>

                  <div className="pt-3 border-t border-white/[0.07] flex flex-wrap items-center gap-6 text-xs font-mono text-neutral-400 tabular-nums">
                    <span>Volume: {activeChannel.metric}</span>
                    <span>·</span>
                    <span>Desempenho: {activeChannel.sla}</span>
                    <span className="ml-auto inline-flex items-center gap-1 text-emerald-400 font-sans font-medium">
                      <span>Sincronizado ao Kanban</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </motion.div>
              </AnimatePresence>
            </InteractiveTiltCard>
          </div>
        </div>

        {/* Glassmorphic Quantitative KPI Row */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="text-xs font-medium text-emerald-400">
                04. Impacto Mensurável em Vendas
              </div>
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-white mt-1">
                Indicadores reais de operações em escala
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-neutral-400">
              Dados consolidados de empresas ativas na infraestrutura MultiAtend
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {KPI_CARDS.map((kpi, idx) => (
              <motion.div
                key={kpi.label}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.45, delay: idx * 0.07 }}
              >
                <InteractiveTiltCard
                  intensity={7}
                  className="h-full rounded-2xl bg-gradient-to-b from-white/[0.05] to-white/[0.02] border border-white/[0.1] p-6 flex flex-col justify-between"
                >
                  <div>
                    <div className="font-mono text-3xl sm:text-4xl font-bold text-emerald-400 tabular-nums tracking-tight">
                      {kpi.value}
                    </div>
                    <div className="font-display text-base font-semibold text-white mt-2">
                      {kpi.label}
                    </div>
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed mt-3">{kpi.context}</p>
                </InteractiveTiltCard>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
