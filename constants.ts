
import { SectorId, StrategicAction, SectorConfig } from './types';

export const SECTORS: SectorConfig[] = [
  {
    id: SectorId.STIF,
    name: "Superintendência de Tecnologia e Inovação Fazendária",
    shortName: "GAB/STIF",
    color: "bg-blue-900",
    subDepartments: ["Gabinete"]
  },
  {
    id: SectorId.DGGT,
    name: "Diretoria Geral de Gestão Tecnológica",
    shortName: "DGGT",
    color: "bg-blue-700",
    subDepartments: ["Gerência de Segurança Digital", "Gerência de Suporte e Operações"]
  },
  {
    id: SectorId.DISCO,
    name: "Diretoria de Sistemas Corporativos",
    shortName: "DISCO",
    color: "bg-blue-600",
    subDepartments: ["Gerência de Sistemas Tributários", "Gerência de Sistemas Financeiros", "Gerência de Testes e Homologação"]
  },
  {
    id: SectorId.DINFRA,
    name: "Diretoria de Infraestrutura",
    shortName: "DINFRA",
    color: "bg-blue-600",
    subDepartments: ["Gerência de Banco de Dados", "Gerência de Redes e Comunicação", "Gerência de Servidores e Data Center"]
  },
  {
    id: SectorId.DINOV,
    name: "Diretoria de Inovação",
    shortName: "DINOV",
    color: "bg-yellow-600",
    subDepartments: ["Assessoria de Integração e Pesquisa"]
  }
];

// Extracted from Image 1 - Cleaned Action Titles (Removed "X - " prefixes)
export const STRATEGIC_ACTIONS: StrategicAction[] = [
  {
    id: "1",
    action: "Modernizar os sistemas e automações (WS)",
    description: "Implementar um plano de ação para convergir as plataformas atuais para a plataforma adotada.",
    startDate: "Jan/2023",
    endDate: "Dez/2025",
    responsible: "SID/STIF"
  },
  {
    id: "2",
    action: "Aquisição de Parque Tecnológico",
    description: "A Secretaria da Fazenda criou a Superintendência de Integração e Desenvolvimento... visando a reformulação de processos, recursos humanos, infraestrutura e serviços de TIC.",
    startDate: "Jan/2023",
    endDate: "Dez/2025",
    responsible: "SID/STIF"
  },
  {
    id: "3",
    action: "Elaborar e implementar um plano de sustentabilidade de TIC da SEFAZ",
    description: "Assegurar a operação ininterrupta dos sistemas com alta disponibilidade, ampliando os serviços à população... equipe dedicada... ambiente hiperconvergente.",
    startDate: "Jan/2023",
    endDate: "Dez/2025",
    responsible: "SID/STIF"
  },
  {
    id: "4",
    action: "Definir padrões e normatização dos sistemas de informações",
    description: "Implementar padrões e normativos com base nos diagnósticos.",
    startDate: "Jan/2023",
    endDate: "Dez/2025",
    responsible: "SID/STIF"
  },
  {
    id: "5",
    action: "Elaborar e implementar o plano diretor da TI da SEFAZ",
    description: "Implementar um plano de ações voltadas para as áreas de pessoal, infraestrutura, processos, normas e gestão de recursos na TIC.",
    startDate: "Fev/2023",
    endDate: "Dez/2025",
    responsible: "SID/STIF"
  },
  {
    id: "6",
    action: "Melhoria dos redesenhos e automatização os processos da SEFAZ",
    description: "Atualizar e melhorar o redesenho de processos existentes e automatizando para homologação e produção.",
    startDate: "Jan/2023",
    endDate: "Dez/2025",
    responsible: "SID/STIF"
  }
];