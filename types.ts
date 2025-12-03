
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
  sectorId: SectorId | string;
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
  id: string; // Changed from SectorId enum to string to allow dynamic IDs
  name: string;
  shortName: string;
  color: string;
  subDepartments?: string[];
  isActive?: boolean; // New field for soft delete/hiding
}

export interface AppConfig {
  institutionName: string; // e.g. "Governo do Estado do Tocantins"
  departmentName: string; // e.g. "Secretaria da Fazenda"
  subDepartmentName: string; // e.g. "Superintendência de Tecnologia..."
  logoUrl?: string; // Base64 or URL
}
