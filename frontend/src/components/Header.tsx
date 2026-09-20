import { Bell, Search } from 'lucide-react';

const Header = () => {
  return (
    <header className="topbar">
      <div className="topbar-search">
        <Search size={18} />
        <input
          type="text"
          placeholder="Buscar no sistema..."
          aria-label="Buscar no sistema"
        />
      </div>

      <div className="topbar-actions">
        <button className="notification-button" type="button">
          <Bell size={20} />
          <span className="notification-dot" />
        </button>

        <div className="user-area">
          <div className="user-avatar">UA</div>

          <div className="user-info">
            <strong>Usuário APS</strong>
            <span>Operador</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;