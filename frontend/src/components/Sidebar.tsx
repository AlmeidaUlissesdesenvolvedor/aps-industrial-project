import { NavLink } from 'react-router-dom';
import {
  Boxes,
  CalendarDays,
  ClipboardList,
  Factory,
  Gauge,
  GitBranch,
  Layers3,
  Package,
  Route,
  Settings,
  Wrench,
} from 'lucide-react';

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">
          <Factory size={24} />
        </div>

        <div>
          <strong>APS Industrial</strong>
          <span>Produção inteligente</span>
        </div>
      </div>

      <nav className="sidebar-navigation">
        <span className="sidebar-section-title">VISÃO GERAL</span>

        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `sidebar-link ${isActive ? 'active' : ''}`
          }
        >
          <Gauge size={19} />
          Dashboard
        </NavLink>

        <span className="sidebar-section-title">PLANEJAMENTO</span>

        <NavLink
          to="/planning"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? 'active' : ''}`
          }
        >
          <Route size={19} />
          Planejamento
        </NavLink>

        <NavLink
          to="/schedules"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? 'active' : ''}`
          }
        >
          <CalendarDays size={19} />
          Programação
        </NavLink>

        <span className="sidebar-section-title">PRODUÇÃO</span>

        <NavLink
          to="/products"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? 'active' : ''}`
          }
        >
          <Package size={19} />
          Produtos
        </NavLink>

        <NavLink
          to="/materials"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? 'active' : ''}`
          }
        >
          <Boxes size={19} />
          Materiais
        </NavLink>

        <NavLink
          to="/machines"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? 'active' : ''}`
          }
        >
          <Settings size={19} />
          Máquinas
        </NavLink>

        <NavLink
          to="/operations"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? 'active' : ''}`
          }
        >
          <Wrench size={19} />
          Operações
        </NavLink>

        <NavLink
          to="/production-orders"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? 'active' : ''}`
          }
        >
          <ClipboardList size={19} />
          Ordens de Produção
        </NavLink>

        <span className="sidebar-section-title">ESTRUTURA</span>

        <NavLink
          to="/bom"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? 'active' : ''}`
          }
        >
          <Layers3 size={19} />
          Estrutura BOM
        </NavLink>

        <NavLink
          to="/connections"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? 'active' : ''}`
          }
        >
          <GitBranch size={19} />
          Conexões
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        APS Industrial
        <span>v1.0</span>
      </div>
    </aside>
  );
};

export default Sidebar;

