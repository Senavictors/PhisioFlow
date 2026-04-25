Fisioterapia — Áreas, Especialidades e Tipos de Atendimento
Conceito

Na fisioterapia, o termo mais adequado não é “modalidades”, mas sim:

Áreas de atuação
Especialidades
Tipos de atendimento

Esses três níveis são importantes para modelagem de sistema (ex: CRM, agenda, filtros, relatórios).

1. Áreas de atuação (macro)
1.1 Fisioterapia Ortopédica / Traumatológica
Pós-operatório (joelho, ombro, coluna)
Lesões musculares
Tendinites
Hérnia de disco
1.2 Fisioterapia Neurológica
AVC
Parkinson
Paralisia cerebral
Lesão medular

Foco: reabilitação de funções motoras e neurológicas.

1.3 Fisioterapia Cardiorrespiratória
Asma
DPOC
Pós-COVID
Reabilitação cardíaca

Muito comum em ambiente hospitalar e domiciliar.

1.4 Fisioterapia Dermatofuncional (Estética)
Drenagem linfática
Tratamento de celulite
Gordura localizada
Pós-operatório de cirurgia plástica
1.5 Fisioterapia Esportiva
Atletas
Prevenção de lesões
Reabilitação esportiva
Melhoria de performance
1.6 Fisioterapia Pélvica
Incontinência urinária
Pós-parto
Disfunções sexuais
Fortalecimento do assoalho pélvico
1.7 Fisioterapia Pediátrica
Bebês e crianças
Atraso no desenvolvimento motor
Condições congênitas
1.8 Fisioterapia Geriátrica
Idosos
Equilíbrio
Prevenção de quedas
Mobilidade funcional
1.9 Fisioterapia Preventiva / Qualidade de Vida
Postura
Ergonomia
Alongamento
Correção de hábitos

Muito usada em empresas (fisioterapia corporativa).

2. Especialidades e técnicas
2.1 Pilates
Reabilitação
Fortalecimento
Postura
Controle corporal
2.2 RPG (Reeducação Postural Global)
Correção postural profunda
Tratamento de desvios da coluna
2.3 Acupuntura
Controle da dor
Relaxamento muscular
Equilíbrio energético
2.4 Liberação Miofascial
Redução de tensão muscular
Melhora da mobilidade
2.5 Ventosaterapia
Estímulo circulatório
Relaxamento muscular
2.6 Dry Needling
Tratamento de pontos gatilho
Dor muscular
2.7 Terapias Manuais
Mobilização articular
Manipulação
Técnicas de alongamento
3. Tipos de atendimento (formato)
3.1 Clínica
Atendimento em consultório ou clínica
Estrutura física equipada
3.2 Domiciliar (Home Care)
Atendimento na casa do paciente
Comum para:
Idosos
Acamados
Pós-operatório
3.3 Hospitalar
Internação
UTI
Pós-cirúrgico imediato
3.4 Corporativo
Empresas
Ergonomia
Prevenção de lesões ocupacionais
3.5 Online / Teleatendimento
Orientações
Exercícios guiados
Acompanhamento remoto
4. Estrutura conceitual (mapa geral)
Fisioterapia
│
├── Áreas de atuação
│   ├── Ortopédica
│   ├── Neurológica
│   ├── Cardiorrespiratória
│   ├── Dermatofuncional
│   ├── Esportiva
│   ├── Pélvica
│   ├── Pediátrica
│   ├── Geriátrica
│   └── Preventiva
│
├── Especialidades / Técnicas
│   ├── Pilates
│   ├── RPG
│   ├── Acupuntura
│   ├── Liberação Miofascial
│   ├── Ventosaterapia
│   ├── Dry Needling
│   └── Terapias Manuais
│
└── Tipos de atendimento
    ├── Clínica
    ├── Domiciliar
    ├── Hospitalar
    ├── Corporativo
    └── Online
5. Sugestão de modelagem para sistema
5.1 Área (obrigatório)
area: enum

Exemplo:

ORTOPEDICA
NEUROLOGICA
CARDIORESPIRATORIA
ESTETICA
ESPORTIVA
PELVICA
PEDIATRICA
GERIATRICA
PREVENTIVA
5.2 Tipo de atendimento
attendance_type: enum

Exemplo:

CLINIC
HOME_CARE
HOSPITAL
CORPORATE
ONLINE
5.3 Especialidades (multi-select)
specialties: string[]

Exemplo:

PILATES
RPG
ACUPUNTURA
LIBERACAO_MIOFASCIAL
DRY_NEEDLING
5.4 Observação importante
Área define o contexto clínico
Especialidade define a técnica aplicada
Tipo de atendimento define o formato operacional