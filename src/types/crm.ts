export type ChannelType = 'whatsapp' | 'instagram' | 'audio';

export type KanbanStage = 'atendimento' | 'aguardando' | 'finalizado';

export interface LeadItem {
  id: string;
  name: string;
  company: string;
  initials: string;
  avatarBg: string;
  channel: ChannelType;
  lastMessage: string;
  time: string;
  value: number;
  agent: string;
  stage: KanbanStage;
  slaSeconds: number;
}
