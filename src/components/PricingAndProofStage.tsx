import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  X,
  CheckCircle2,
} from 'lucide-react';
import { InteractiveTiltCard } from './InteractiveTiltCard';

interface PlanSpec {
  name: string;
  subtitle: string;
  monthlyPrice: number;
  annualPrice: number;
  popular?: boolean;
  ctaLabel: string;
  features: string[];
}

const PLANS: PlanSpec[] = [
  {
    name: 'Starter',
    subtitle: 'Ideal para iniciar com organização',
    monthlyPrice: 97,
    annualPrice: 77,
    ctaLabel: 'Começar no Starter',
    features: [
      'Até 3 atendentes simultâneos',
      '1 número de WhatsApp + Instagram Direct',
      'Kanban de vendas visual ilimitado',
      'Automações essenciais de boas-vindas',
      'Suporte técnico por chat e e-mail',
    ],
  },
  {
    name: 'Profissional',
    subtitle: 'Para equipes comerciais em aceleração',
    monthlyPrice: 197,
    annualPrice: 157,
    popular: true,
    ctaLabel: 'Começar no Profissional',
    features: [
      'Até 12 atendentes simultâneos',
      'Construtor visual de fluxos completo',
      'Transcrição de áudio e agendamento Meet',
      'Monitoramento de SLA em tempo real',
      'Suporte prioritário com acompanhamento',
    ],
  },
  {
    name: 'Empresarial',
    subtitle: 'Para operações de alto volume',
    monthlyPrice: 497,
    annualPrice: 397,
    ctaLabel: 'Falar com Especialista',
    features: [
      'Atendentes e departamentos ilimitados',
      'Múltiplos números oficiais e API REST',
      'Webhooks dedicados e isolamento total',
      'Relatórios executivos de conversão por fila',
      'Gerente de conta e migração assistida',
    ],
  },
];

interface Testimonial {
  name: string;
  role: string;
  company: string;
  initials: string;
  gradient: string;
  quote: string;
  outcome: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: 'Carlos Mendes',
    role: 'Diretor Comercial',
    company: 'Vértice Energia Solar',
    initials: 'CM',
    gradient: 'from-emerald-400 to-teal-600',
    quote:
      'Antes perdíamos orçamentos no fim do dia porque 9 vendedores dividiam celulares separados. Com o CRM MultiAtend colocamos toda a equipe em um único número e enxergamos cada proposta no Kanban.',
    outcome: '+142% em propostas fechadas em 4 meses · SLA médio caiu de 18 min para 26s',
  },
  {
    name: 'Fernanda Alencar',
    role: 'Sócia-Diretora',
    company: 'Rede Clínica Lumina',
    initials: 'FA',
    gradient: 'from-purple-400 to-indigo-600',
    quote:
      'O construtor de fluxos integrado ao Google Calendar reduziu nossas faltas drasticamente. O paciente escolhe o horário pelo WhatsApp e já recebe a confirmação sem fila na recepção.',
    outcome: '680 agendamentos automáticos/mês · -41% em taxa de não comparecimento',
  },
  {
    name: 'Rodrigo Peixoto',
    role: 'Head de Operações',
    company: 'Veloz Logística B2B',
    initials: 'RP',
    gradient: 'from-teal-300 to-emerald-600',
    quote:
      'Unificamos WhatsApp Oficial, Instagram Direct e nosso ERP via Webhook em uma tarde. Hoje sabemos exatamente quanto cada canal gera de receita líquida por semana.',
    outcome: 'R$ 1,8M gerenciados no pipeline · 22 especialistas ativos na mesma linha',
  },
];

interface PricingAndProofStageProps {
  modalOpen: boolean;
  selectedPlan: string;
  onOpenModal: (planName?: string) => void;
  onCloseModal: () => void;
}

export const PricingAndProofStage: React.FC<PricingAndProofStageProps> = ({
  modalOpen,
  selectedPlan,
  onOpenModal,
  onCloseModal,
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [testimonialIdx, setTestimonialIdx] = useState<number>(0);

  // Validated Lead Capture Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [planInterest, setPlanInterest] = useState(selectedPlan || 'Profissional');
  const [formError, setFormError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  React.useEffect(() => {
    if (selectedPlan) {
      setPlanInterest(selectedPlan);
    }
  }, [selectedPlan]);

  const formatPhoneInput = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (fullName.trim().length < 3) {
      setFormError('Por favor, informe seu nome completo.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setFormError('Informe um e-mail corporativo válido.');
      return;
    }
    if (whatsapp.replace(/\D/g, '').length < 10) {
      setFormError('Informe um número de WhatsApp válido com DDD.');
      return;
    }
    setFormError('');
    setSubmitted(true);
  };

  const currentTestimonial = TESTIMONIALS[testimonialIdx];

  return (
    <>
      {/* PRICING SECTION */}
      <section id="planos" className="py-20 border-t border-white/[0.06]">
        <div className="mx-auto max-w-[1240px] px-6 space-y-12">
          {/* Header + Billing Segmented Switcher */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3 max-w-xl">
              <div className="text-xs font-medium text-emerald-400">
                05. Planos Transparentes e Sem Fidelidade
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white text-balance">
                Escolha o plano ideal para o seu negócio.
              </h2>
              <p className="text-base text-neutral-300">
                Ativação imediata, sem taxa de implantação e com migração assistida pela nossa
                equipe.
              </p>
            </div>

            {/* Interactive Billing Toggle */}
            <div className="inline-flex items-center gap-1 p-1.5 rounded-xl bg-white/[0.04] border border-white/[0.09] self-start">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                  billingCycle === 'monthly'
                    ? 'bg-emerald-400 text-[#04120B]'
                    : 'text-neutral-300 hover:text-white'
                }`}
              >
                Ciclo Mensal
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('annual')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                  billingCycle === 'annual'
                    ? 'bg-emerald-400 text-[#04120B]'
                    : 'text-neutral-300 hover:text-white'
                }`}
              >
                Anual (-20%)
              </button>
            </div>
          </div>

          {/* 3 Interactive Pricing Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            {PLANS.map((plan) => {
              const price = billingCycle === 'annual' ? plan.annualPrice : plan.monthlyPrice;
              return (
                <InteractiveTiltCard
                  key={plan.name}
                  intensity={5}
                  glowColor={
                    plan.popular ? 'rgba(52, 211, 153, 0.18)' : 'rgba(255, 255, 255, 0.08)'
                  }
                  className={`rounded-2xl flex flex-col justify-between transition-all ${
                    plan.popular
                      ? 'bg-[#0D1612] border-2 border-emerald-400 shadow-[0_20px_60px_rgba(16,185,129,0.16)]'
                      : 'bg-[#0B100E] border border-white/[0.1]'
                  }`}
                >
                  <div>
                    {plan.popular && (
                      <div className="w-full py-2 px-6 bg-emerald-400 text-[#04120B] text-xs font-bold text-center tracking-wide">
                        Mais escolhido por equipes comerciais
                      </div>
                    )}

                    <div className="p-6 sm:p-7 space-y-5">
                      <div>
                        <h3 className="font-display text-xl font-bold text-white">{plan.name}</h3>
                        <p className="text-xs text-neutral-400 mt-1">{plan.subtitle}</p>
                      </div>

                      <div className="flex items-baseline gap-1.5 pt-1">
                        <span className="text-sm font-medium text-neutral-400">R$</span>
                        <motion.span
                          key={`${plan.name}-${price}`}
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                          className="font-mono text-4xl sm:text-5xl font-bold text-white tabular-nums"
                        >
                          {price}
                        </motion.span>
                        <span className="text-xs text-neutral-400">/mês</span>
                      </div>

                      <ul className="space-y-3 pt-4 border-t border-white/[0.07]">
                        {plan.features.map((feat) => (
                          <li key={feat} className="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-200">
                            <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="p-6 sm:p-7 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSubmitted(false);
                        onOpenModal(plan.name);
                      }}
                      className={`w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                        plan.popular
                          ? 'bg-emerald-400 hover:bg-emerald-300 text-[#04120B]'
                          : 'bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.12] text-white'
                      }`}
                    >
                      {plan.ctaLabel}
                    </button>
                  </div>
                </InteractiveTiltCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* ATTRIBUTABLE TESTIMONIALS SECTION */}
      <section id="depoimentos" className="py-20 border-t border-white/[0.06]">
        <div className="mx-auto max-w-[1240px] px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-5 space-y-4">
              <div className="text-xs font-medium text-emerald-400">
                06. Resultados Auditáveis de Clientes
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white text-balance">
                Quem usa na operação diária, recomenda.
              </h2>
              <p className="text-base text-neutral-300">
                Histórias reais de gestores que eliminaram gargalos no WhatsApp e multiplicaram a
                taxa de conversão.
              </p>

              {/* Carousel Controls */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  aria-label="Depoimento anterior"
                  onClick={() =>
                    setTestimonialIdx((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)
                  }
                  className="w-10 h-10 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] flex items-center justify-center text-white transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  aria-label="Próximo depoimento"
                  onClick={() => setTestimonialIdx((prev) => (prev + 1) % TESTIMONIALS.length)}
                  className="w-10 h-10 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] flex items-center justify-center text-white transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <span className="font-mono text-xs text-neutral-400 ml-2 tabular-nums">
                  0{testimonialIdx + 1} / 0{TESTIMONIALS.length}
                </span>
              </div>
            </div>

            <div className="lg:col-span-7">
              <InteractiveTiltCard
                intensity={4}
                className="rounded-2xl bg-[#0C1210] border border-white/[0.1] p-6 sm:p-8"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentTestimonial.name}
                    initial={{ opacity: 0, x: 14 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -14 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-6"
                  >
                    <p className="text-base sm:text-lg text-neutral-100 leading-relaxed">
                      “{currentTestimonial.quote}”
                    </p>

                    <div className="pt-4 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <div
                          className={`w-11 h-11 rounded-full bg-gradient-to-br ${currentTestimonial.gradient} flex items-center justify-center font-display font-bold text-sm text-[#04120B] shrink-0`}
                        >
                          {currentTestimonial.initials}
                        </div>
                        <div>
                          <div className="font-display font-bold text-sm text-white">
                            {currentTestimonial.name}
                          </div>
                          <div className="text-xs text-neutral-400">
                            {currentTestimonial.role} · {currentTestimonial.company}
                          </div>
                        </div>
                      </div>

                      <div className="text-xs font-mono text-emerald-300 tabular-nums">
                        {currentTestimonial.outcome}
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </InteractiveTiltCard>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CONVERSION BANNER */}
      <section className="py-16">
        <div className="mx-auto max-w-[1240px] px-6">
          <InteractiveTiltCard
            intensity={3}
            className="rounded-3xl bg-gradient-to-r from-[#0C1713] via-[#0B120F] to-[#130D1C] border border-emerald-400/25 p-8 sm:p-12"
          >
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
              <div className="space-y-2 max-w-xl">
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-white text-balance">
                  Pronto para transformar seu atendimento em uma máquina previsível de vendas?
                </h2>
                <p className="text-sm sm:text-base text-neutral-300">
                  Teste gratuitamente por 7 dias com acompanhamento de implantação ao vivo.
                </p>
              </div>

              <motion.button
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setSubmitted(false);
                  onOpenModal('Profissional');
                }}
                className="inline-flex items-center gap-2.5 px-7 py-4 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-[#04120B] font-semibold text-sm sm:text-base shadow-[0_0_32px_rgba(52,211,153,0.3)] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>Criar Conta de Teste Agora</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          </InteractiveTiltCard>
        </div>
      </section>

      {/* QUIET FOOTER */}
      <footer className="border-t border-white/[0.07] py-12 bg-[#050807]">
        <div className="mx-auto max-w-[1240px] px-6 space-y-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <a
              href="#topo"
              className="font-display text-lg font-bold tracking-tight text-white whitespace-nowrap"
            >
              CRM MultiAtend
            </a>

            <div className="flex flex-wrap items-center gap-6 text-xs sm:text-sm text-neutral-400">
              <a href="#painel-ao-vivo" className="hover:text-white transition-colors">
                Kanban Ao Vivo
              </a>
              <a href="#fluxos" className="hover:text-white transition-colors">
                Fluxos Visuais
              </a>
              <a href="#automacoes" className="hover:text-white transition-colors">
                Voz e Agenda
              </a>
              <a href="#canais" className="hover:text-white transition-colors">
                Integrações
              </a>
              <a href="#planos" className="hover:text-white transition-colors">
                Planos
              </a>
            </div>
          </div>

          <div className="pt-6 border-t border-white/[0.05] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-neutral-500">
            <p>© 2026 CRM MultiAtend Tecnologia Ltda. Todos os direitos reservados.</p>
            <p>Operação no Brasil · Conformidade LGPD · API Oficial Homologada</p>
          </div>
        </div>
      </footer>

      {/* INTERACTIVE ONBOARDING & DEMO MODAL */}
      <AnimatePresence>
        {modalOpen && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-onboarding-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-md rounded-2xl bg-[#0C1310] border border-white/[0.14] p-6 sm:p-7 shadow-2xl"
            >
              <button
                type="button"
                aria-label="Fechar janela"
                onClick={onCloseModal}
                className="absolute right-4 top-4 w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              {!submitted ? (
                <form onSubmit={handleSubmitForm} className="space-y-4" noValidate>
                  <div>
                    <div className="text-xs font-medium text-emerald-400">
                      Teste Grátis por 7 Dias
                    </div>
                    <h3
                      id="modal-onboarding-title"
                      className="font-display text-xl font-bold text-white mt-1"
                    >
                      Ativar ambiente CRM MultiAtend
                    </h3>
                    <p className="text-xs text-neutral-400 mt-1">
                      Configure seu número e convide sua equipe em menos de 5 minutos.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                      Nome completo
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ex.: Mariana Silva"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-emerald-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                      E-mail corporativo
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="mariana@suaempresa.com.br"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-emerald-400"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                        WhatsApp com DDD
                      </label>
                      <input
                        type="tel"
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(formatPhoneInput(e.target.value))}
                        placeholder="(11) 99999-9999"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-sm text-white font-mono placeholder:font-sans placeholder:text-neutral-500 focus:outline-none focus:border-emerald-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                        Plano selecionado
                      </label>
                      <select
                        value={planInterest}
                        onChange={(e) => setPlanInterest(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-[#101915] border border-white/[0.1] text-sm text-white focus:outline-none focus:border-emerald-400"
                      >
                        <option value="Starter">Starter</option>
                        <option value="Profissional">Profissional</option>
                        <option value="Empresarial">Empresarial</option>
                      </select>
                    </div>
                  </div>

                  {formError && (
                    <p className="text-xs text-rose-400 font-medium">{formError}</p>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 px-4 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-[#04120B] font-semibold text-sm transition-colors cursor-pointer"
                  >
                    Liberar Acesso Imediato
                  </button>
                </form>
              ) : (
                <div className="py-4 text-center space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="font-display text-xl font-bold text-white">
                      Ambiente {planInterest} reservado!
                    </h3>
                    <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                      Enviamos suas credenciais de acesso e o link de conexão do QR Code Oficial
                      para <strong className="text-white">{email}</strong> e para o WhatsApp{' '}
                      <strong className="text-emerald-300 font-mono">{whatsapp}</strong>.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onCloseModal}
                    className="w-full py-2.5 px-4 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Voltar para a página
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
