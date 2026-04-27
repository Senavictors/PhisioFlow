// Screens.jsx — The five product screens.

function KpiCard({ icon, tint, num, label, sub, tag }) {
  const Ico = Icon[icon]
  return (
    <div className="card kpi">
      {tag && (
        <span className="kpi-tag">
          <Icon.TrendingUp /> {tag}
        </span>
      )}
      <div className={`kpi-ico ${tint === 't' ? 't' : ''}`}>
        <Ico size={18} />
      </div>
      <div className="kpi-num">{num}</div>
      <div className="kpi-label">{label}</div>
      <div className="kpi-sub">{sub}</div>
    </div>
  )
}

function Button({ variant = 'primary', icon, children, onClick }) {
  const Ico = icon ? Icon[icon] : null
  return (
    <button className={`btn btn-${variant}`} onClick={onClick}>
      {Ico && <Ico />}
      {children}
    </button>
  )
}

function Chip({ active, onClick, children }) {
  return (
    <button className={`chip ${active ? 'active' : ''}`} onClick={onClick}>
      {children}
    </button>
  )
}

function Badge({ variant, children }) {
  return (
    <span className={`badge badge-${variant}`} style={{ whiteSpace: 'nowrap' }}>
      {children}
    </span>
  )
}

/* ---------- Dashboard ---------- */
function DashboardScreen() {
  return (
    <div className="main">
      <div className="date">quinta-feira, 23 de abril</div>
      <h1 className="greeting">
        Olá, bem-vindo de volta{' '}
        <span className="wave">
          <Icon.Wave />
        </span>
      </h1>

      <div className="grid-3" style={{ marginBottom: 20 }}>
        <KpiCard
          icon="Users"
          tint="s"
          num="1"
          label="Pacientes ativos"
          sub="cadastrados no portal"
        />
        <KpiCard icon="Calendar" tint="s" num="0" label="Atendimentos hoje" sub="0 esta semana" />
        <KpiCard
          icon="AlertCircle"
          tint="t"
          num="1"
          label="Sem retorno"
          sub="há mais de 30 dias"
          tag="Urgente"
        />
      </div>

      <div className="grid-2-1" style={{ marginBottom: 20 }}>
        <div className="card" style={{ paddingBottom: 16 }}>
          <div className="row between">
            <div>
              <h4
                style={{ margin: 0, fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 17 }}
              >
                Evolução semanal
              </h4>
              <p className="kpi-sub" style={{ marginTop: 4 }}>
                Atendimentos realizados nos últimos 7 dias
              </p>
            </div>
            <span className="eyebrow" style={{ margin: 0 }}>
              Últimos 7 dias
            </span>
          </div>
          <div className="chart">
            <div className="grid-line" style={{ top: 20, opacity: 0.5 }}></div>
            <div className="grid-line" style={{ top: 70, opacity: 0.5 }}></div>
            <div className="grid-line" style={{ top: 120, opacity: 0.5 }}></div>
            <div className="baseline"></div>
            <div className="x-labels">
              <span>Ter</span>
              <span>Qua</span>
              <span>Qui</span>
              <span>Sex</span>
              <span>Sáb</span>
              <span>Dom</span>
            </div>
          </div>
        </div>
        <div className="quick-actions">
          <h4>Ações rápidas</h4>
          <p className="qa-sub">Comece um fluxo em segundos.</p>
          <button className="btn btn-ghost-dark">
            <Icon.UserPlus /> Cadastrar paciente
          </button>
          <button className="btn btn-primary" style={{ justifyContent: 'center' }}>
            <Icon.Plus /> Agendar sessão
          </button>
          <div className="qa-footer">
            Ver atendimentos <Icon.ArrowRight />
          </div>
        </div>
      </div>

      <div className="grid-2-1">
        <div className="card">
          <div className="row between" style={{ marginBottom: 6 }}>
            <h4
              style={{ margin: 0, fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 17 }}
            >
              Atendimentos recentes
            </h4>
            <a
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 13,
                color: 'var(--muted-foreground)',
                cursor: 'pointer',
              }}
            >
              Ver todos →
            </a>
          </div>
          <div className="recent-row">
            <div className="row">
              <div className="mini-avatar">G</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>Gervasio · Pilates</div>
                <div style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>18:04 · 20min</div>
              </div>
            </div>
            <Badge variant="realizado">Realizado</Badge>
          </div>
          <div className="recent-row">
            <div className="row">
              <div className="mini-avatar">G</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>
                  Gervasio · Estética{' '}
                  <Badge variant="dom">
                    <Icon.Home /> Domiciliar
                  </Badge>
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>
                  17:45 · 60min · amanhã
                </div>
              </div>
            </div>
            <Badge variant="agendado">Agendado</Badge>
          </div>
        </div>
        <div className="attention">
          <div className="a-ico">
            <Icon.AlertCircle size={20} />
          </div>
          <h4>Atenção</h4>
          <div className="a-num">1</div>
          <p>Pacientes sem atendimento há mais de 30 dias.</p>
        </div>
      </div>
    </div>
  )
}

/* ---------- Pacientes ---------- */
function PacientesScreen() {
  const [tipo, setTipo] = React.useState('Todos')
  const tipos = ['Todos', 'Fisioterapia motora', 'Pilates', 'Estética', 'Atendimento domiciliar']
  return (
    <div className="main">
      <div className="row between" style={{ alignItems: 'flex-start', marginBottom: 24, gap: 24 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 className="page-title" style={{ whiteSpace: 'nowrap' }}>
            Diretório de Pacientes
          </h1>
          <p className="page-subtitle">Acompanhe seus pacientes e a documentação clínica.</p>
        </div>
        <Button icon="UserPlus" variant="primary">
          Cadastrar paciente
        </Button>
      </div>

      <div className="filters-panel" style={{ marginBottom: 20 }}>
        <div className="filters-row">
          <div>
            <div className="field-label">Tipo de atendimento</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {tipos.map((t) => (
                <Chip key={t} active={tipo === t} onClick={() => setTipo(t)}>
                  {t}
                </Chip>
              ))}
            </div>
          </div>
          <div>
            <div className="field-label">Classificação</div>
            <div className="select">
              Todas as classificações <Icon.ChevronDown />
            </div>
          </div>
          <div>
            <div className="field-label">Ordenar por</div>
            <div className="select">
              Cadastro recente <Icon.ChevronDown />
            </div>
          </div>
        </div>
        <div className="input-search">
          <Icon.Search /> Buscar paciente por nome...
        </div>
      </div>

      <div className="card" style={{ padding: 0, marginBottom: 24 }}>
        <table className="table">
          <thead>
            <tr>
              <th>Paciente</th>
              <th style={{ minWidth: 200 }}>Classificação</th>
              <th>Cadastro</th>
              <th>Status</th>
              <th style={{ width: 40 }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div className="patient">
                  <div className="mini-avatar">G</div>
                  <div>
                    <div className="pname">Gervasio</div>
                    <div className="pid">ID: EEC64018</div>
                  </div>
                </div>
              </td>
              <td>
                <Badge variant="debilitado">Paciente debilitado</Badge>
              </td>
              <td style={{ color: 'var(--muted-foreground)' }}>
                <span style={{ marginRight: 6 }}>
                  <Icon.Calendar size={13} />
                </span>
                23/04/2026
              </td>
              <td>
                <span className="status-dot">
                  <span className="dot"></span>Plano ativo
                </span>{' '}
                <Badge variant="dom">
                  <Icon.Home /> Domic.
                </Badge>
              </td>
              <td style={{ color: 'var(--muted-foreground)' }}>
                <Icon.MoreH />
              </td>
            </tr>
          </tbody>
        </table>
        <div
          style={{
            padding: '14px 20px',
            borderTop: '1px solid var(--border)',
            fontFamily: 'var(--font-body)',
            fontSize: 10.5,
            letterSpacing: '.16em',
            textTransform: 'uppercase',
            color: 'var(--muted-foreground)',
            fontWeight: 700,
          }}
        >
          Mostrando 1 de 1 pacientes
        </div>
      </div>

      <div className="grid-2-1">
        <div className="progress-hero">
          <div>
            <h3>Progresso Restaurativo</h3>
            <p>
              Você acompanha 1 pacientes ativos. Mantenha os atendimentos em dia para sustentar a
              evolução clínica.
            </p>
            <button className="btn btn-ghost-dark">Ver atendimentos</button>
          </div>
          <div className="ring">1</div>
        </div>
        <div className="attention">
          <div className="a-ico">
            <Icon.Calendar size={20} />
          </div>
          <h4>Pendentes hoje</h4>
          <div className="a-num">1</div>
          <p>Pacientes aguardando atendimento ou retorno.</p>
        </div>
      </div>
    </div>
  )
}

/* ---------- Atendimentos ---------- */
function AtendimentosScreen() {
  return (
    <div className="main">
      <h2 className="page-title" style={{ fontSize: 30 }}>
        Atendimentos
      </h2>
      <p className="page-subtitle" style={{ marginBottom: 28 }}>
        Histórico cronológico das suas sessões.
      </p>
      <div className="empty">
        Nenhum atendimento registrado ainda. Vá até um paciente para registrar.
      </div>
    </div>
  )
}

/* ---------- Agenda ---------- */
function AgendaScreen() {
  return (
    <div className="main">
      <div className="row between" style={{ alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h2 className="page-title" style={{ fontSize: 30 }}>
            Agenda
          </h2>
          <p className="page-subtitle">Agendamentos e atendimentos domiciliares.</p>
        </div>
        <Button icon="Plus" variant="secondary">
          Novo agendamento
        </Button>
      </div>

      <div className="eyebrow">Próximos</div>
      <div className="agenda-date-label">quarta-feira, 22 de abril</div>
      <div className="agenda-item">
        <div className="agenda-time">
          <div className="hour">17:45</div>
          <div className="dur">60min</div>
        </div>
        <div className="pbody">
          <div>
            <div className="pname">Gervasio</div>
            <div className="ptype">Estética</div>
          </div>
          <Badge variant="dom">
            <Icon.Home /> Domiciliar
          </Badge>
        </div>
        <Badge variant="agendado">Agendado</Badge>
        <button className="icon-btn" style={{ color: 'var(--success)' }}>
          <Icon.Check />
        </button>
        <button className="icon-btn" style={{ color: 'var(--danger)' }}>
          <Icon.X />
        </button>
      </div>

      <div className="agenda-date-label">quinta-feira, 23 de abril</div>
      <div className="agenda-item">
        <div className="agenda-time">
          <div className="hour">18:04</div>
          <div className="dur">20min</div>
        </div>
        <div className="pbody">
          <div>
            <div className="pname">Gervasio</div>
            <div className="ptype">Pilates</div>
          </div>
          <Badge variant="dom">
            <Icon.Home /> Domiciliar
          </Badge>
        </div>
        <Badge variant="realizado">Realizado</Badge>
      </div>
    </div>
  )
}

/* ---------- Documentos ---------- */
function DocTypeCard({ icon, tint, title, body }) {
  const Ico = Icon[icon]
  return (
    <div className="card doctype">
      <div
        className="d-ico"
        style={{
          background: tint === 't' ? 'var(--accent-soft)' : 'var(--primary-soft)',
          color: tint === 't' ? 'var(--accent-soft-fg)' : 'var(--primary-soft-fg)',
        }}
      >
        <Ico size={22} />
      </div>
      <h4>{title}</h4>
      <p>{body}</p>
    </div>
  )
}

function DocumentosScreen() {
  return (
    <div className="main">
      <div className="eyebrow" style={{ marginBottom: 8 }}>
        Portal Restaurativo
      </div>
      <h1 className="page-title">Documentos clínicos</h1>
      <p className="page-subtitle" style={{ marginBottom: 28, maxWidth: 560 }}>
        Gere relatórios, laudos, encaminhamentos e declarações com a identidade visual do
        PhisioFlow.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <DocTypeCard
          icon="Scroll"
          tint="s"
          title="Relatório de evolução"
          body="Resumo clínico do progresso do paciente ao longo das sessões."
        />
        <DocTypeCard
          icon="Stethoscope"
          tint="t"
          title="Laudo fisioterapêutico"
          body="Avaliação técnica detalhada com diagnóstico cinético-funcional."
        />
        <DocTypeCard
          icon="Send"
          tint="t"
          title="Encaminhamento"
          body="Indicação para outro profissional ou especialidade."
        />
        <DocTypeCard
          icon="CheckSquare"
          tint="s"
          title="Declaração de horas"
          body="Comprovante de comparecimento e tempo de atendimento."
        />
      </div>

      <div className="grid-2-1">
        <div className="card">
          <div className="row between" style={{ alignItems: 'flex-start', marginBottom: 14 }}>
            <div>
              <h4
                style={{ margin: 0, fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 17 }}
              >
                Gerar para um paciente
              </h4>
              <p className="kpi-sub" style={{ marginTop: 4 }}>
                Selecione o paciente e o tipo de documento desejado.
              </p>
            </div>
            <div className="select" style={{ width: 180 }}>
              Todos os tipos <Icon.ChevronDown />
            </div>
          </div>
          <div className="input-search" style={{ marginBottom: 16 }}>
            <Icon.Search /> Buscar paciente por nome...
          </div>
          <div className="row between" style={{ padding: '12px 4px' }}>
            <div className="row">
              <div className="mini-avatar">G</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>Gervasio</div>
                <div
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 10.5,
                    fontWeight: 700,
                    letterSpacing: '.16em',
                    textTransform: 'uppercase',
                    color: 'var(--muted-foreground)',
                  }}
                >
                  Pronto para emissão
                </div>
              </div>
            </div>
            <Button variant="ghost" icon="Download">
              Gerar PDF
            </Button>
          </div>
        </div>
        <div className="attention">
          <div className="a-ico">
            <Icon.FileText size={20} />
          </div>
          <div className="eyebrow" style={{ marginBottom: 10, color: 'var(--accent-soft-fg)' }}>
            Em breve
          </div>
          <h4
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 22,
              letterSpacing: '-0.01em',
              textTransform: 'none',
              marginBottom: 10,
            }}
          >
            Geração automática em PDF
          </h4>
          <p>
            Em breve você poderá emitir documentos personalizados com cabeçalho do fisioterapeuta,
            dados do paciente e assinatura digital.
          </p>
          <div className="eyebrow" style={{ marginTop: 14, color: 'var(--accent-soft-fg)' }}>
            <Icon.FileText size={12} /> Próxima entrega
          </div>
        </div>
      </div>
    </div>
  )
}

window.Screens = {
  DashboardScreen,
  PacientesScreen,
  AtendimentosScreen,
  AgendaScreen,
  DocumentosScreen,
}
window.Button = Button
window.Badge = Badge
window.KpiCard = KpiCard
