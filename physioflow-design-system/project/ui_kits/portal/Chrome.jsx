// Chrome.jsx — Sidebar + Topbar + Avatar

function Sidebar({ current, onNav }) {
  const items = [
    { id: 'dashboard',    label: 'Dashboard',    icon: 'Dashboard' },
    { id: 'pacientes',    label: 'Pacientes',    icon: 'Users' },
    { id: 'atendimentos', label: 'Atendimentos', icon: 'Clipboard' },
    { id: 'agenda',       label: 'Agenda',       icon: 'Calendar' },
    { id: 'documentos',   label: 'Documentos',   icon: 'FileText' },
  ];
  const foot = [
    { id: 'config',  label: 'Configurações', icon: 'Settings' },
    { id: 'suporte', label: 'Suporte',       icon: 'Help' },
  ];
  const Item = ({it}) => {
    const Ico = Icon[it.icon];
    return (
      <button className={`sb-item ${current===it.id?'active':''}`} onClick={()=>onNav(it.id)}>
        <span className="sb-ico"><Ico /></span>
        <span>{it.label}</span>
      </button>
    );
  };
  return (
    <aside className="sidebar">
      <div className="sb-logo">
        <div className="sb-mark"><Icon.Pulse size={22} /></div>
        <div>
          <div className="sb-wm">PhisioFlow</div>
          <div className="sb-sub">Portal<br/>Restaurativo</div>
        </div>
      </div>
      {items.map(it => <Item key={it.id} it={it} />)}
      <div className="sb-spacer" />
      <div className="sb-foot">
        {foot.map(it => <Item key={it.id} it={it} />)}
      </div>
    </aside>
  );
}

function Topbar({ title }) {
  return (
    <header className="topbar">
      <div className="topbar-title">{title}</div>
      <div className="topbar-right">
        <label className="search">
          <Icon.Search />
          <input placeholder="Buscar pacientes..." />
        </label>
        <button className="icon-btn"><Icon.Bell /></button>
        <button className="icon-btn"><Icon.Help /></button>
        <div className="avatar">F</div>
      </div>
    </header>
  );
}

window.Sidebar = Sidebar;
window.Topbar = Topbar;
