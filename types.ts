
export enum SectorId {
  STIF = 'STIF',
  DGGT = 'DGGT',
  DISCO = 'DISCO', // Diretoria de Sistemas Corporativos
  DINFRA = 'DINFRA',
  DINOV = 'DINOV'
}

export interface StrategicAction {
  id: string;
  action: string;
  description: string;
  startDate: string;
  endDate: string;
  responsible: string; // Originally "SID", mapped to sectors
}

export interface DeliveryItem {
  id: string;
  title: string; // Ex: "Implantação do Prédio Sede"
  date: string; // Ex: "Março/2025"
  description: string;
  results: string;
  attachments: AttachedFile[];
}

export interface ReportEntry {
  actionId: string;
  sectorId: SectorId;
  deliveries: DeliveryItem[];
  hasActivities: boolean; // Controla se houve ou não atividade no ano
  lastUpdated: number;
}

export interface AttachedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  previewUrl?: string;
}

export interface SectorConfig {
  id: SectorId;
  name: string;
  shortName: string;
  color: string;
  subDepartments?: string[];
}
