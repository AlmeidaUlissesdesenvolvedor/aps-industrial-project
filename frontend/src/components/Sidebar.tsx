import { NavLink } from 'react-router-dom';

import {
  Boxes,
  CalendarDays,
  ClipboardList,
  Factory,
  Gauge,
  GitBranch,
  Layers3,
  Link2,
  Package,
  Route,
  Settings,
  Wrench,
} from 'lucide-react';

/*
 * Sidebar principal do APS Industrial.
 *
 * Responsável pela navegação entre os módulos do sistema.
 *
 * Cada NavLink aponta para uma rota cadastrada no App.tsx.
 *
 * O React Router informa automaticamente se a rota está ativa,
 * permitindo destacar visualmente o item selecionado.
 */
const Sidebar = () => {
  return (
    <aside className="sidebar">

      {/* =====================================================
          IDENTIFICAÇÃO DO SISTEMA
         ===================================================== */}
      <div className="sidebar-brand">

        <div className="brand-icon">
          <Factory size={24} />
        </div>

        <div>
          <strong>APS Industrial</strong>
          <span>Produção inteligente</span>
        </div>

      </div>

      {/* =====================================================
          NAVEGAÇÃO PRINCIPAL
         ===================================================== */}
      <nav className="sidebar-navigation">

        {/* =====================================================
            VISÃO GERAL
           ===================================================== */}

        <span className="sidebar-section-title">
          VISÃO GERAL
        </span>

        {/* Dashboard principal */}
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

        {/* =====================================================
            PLANEJAMENTO
           ===================================================== */}

        <span className="sidebar-section-title">
          PLANEJAMENTO
        </span>

        {/* Planejamento da produção */}
        <NavLink
          to="/planning"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? 'active' : ''}`
          }
        >
          <Route size={19} />
          Planejamento
        </NavLink>

        {/* Programação das operações e máquinas */}
        <NavLink
          to="/schedules"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? 'active' : ''}`
          }
        >
          <CalendarDays size={19} />
          Programação
        </NavLink>

        {/* =====================================================
            PRODUÇÃO
           ===================================================== */}

        <span className="sidebar-section-title">
          PRODUÇÃO
        </span>

        {/* Cadastro dos produtos fabricados */}
        <NavLink
          to="/products"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? 'active' : ''}`
          }
        >
          <Package size={19} />
          Produtos
        </NavLink>

        {/* Cadastro das matérias-primas e componentes */}
        <NavLink
          to="/materials"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? 'active' : ''}`
          }
        >
          <Boxes size={19} />
          Materiais
        </NavLink>

        {/* Cadastro das máquinas da fábrica */}
        <NavLink
          to="/machines"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? 'active' : ''}`
          }
        >
          <Settings size={19} />
          Máquinas
        </NavLink>

        {/* Cadastro das operações produtivas */}
        <NavLink
          to="/operations"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? 'active' : ''}`
          }
        >
          <Wrench size={19} />
          Operações
        </NavLink>

        {/*
          Relacionamento Máquina x Operação.

          Define quais máquinas são capazes
          de executar determinada operação.

          Esse relacionamento será usado posteriormente
          pelo módulo de planejamento da produção.
        */}
        <NavLink
          to="/machine-operations"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? 'active' : ''}`
          }
        >
          <Link2 size={19} />
          Máquinas × Operações
        </NavLink>

        {/* Ordens geradas pelo planejamento industrial */}
        <NavLink
          to="/production-orders"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? 'active' : ''}`
          }
        >
          <ClipboardList size={19} />
          Ordens de Produção
        </NavLink>

        {/* =====================================================
            ESTRUTURA
           ===================================================== */}

        <span className="sidebar-section-title">
          ESTRUTURA
        </span>

        {/*
          BOM - Bill of Materials.

          Representa a estrutura hierárquica do produto
          utilizando a estrutura de dados Árvore.
        */}
        <NavLink
          to="/bom"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? 'active' : ''}`
          }
        >
          <Layers3 size={19} />
          Estrutura BOM
        </NavLink>

        {/*
          Conexões entre máquinas.

          Essas conexões serão utilizadas para construir
          o Grafo da fábrica.
        */}
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

      {/* =====================================================
          RODAPÉ
         ===================================================== */}

      <div className="sidebar-footer">
        APS Industrial
        <span>v1.0</span>
      </div>

    </aside>
  );
};

export default Sidebar;