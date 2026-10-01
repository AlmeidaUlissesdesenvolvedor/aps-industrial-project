import { BrowserRouter, Route, Routes } from 'react-router-dom';

import MainLayout from './layouts/MainLayout';

import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Materials from './pages/Materials';
import BOM from './pages/BOM';
import ModulePlaceholder from './pages/ModulePlaceholder';

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Todas as páginas abaixo usam o layout principal */}
        <Route element={<MainLayout />}>

          {/* VISÃO GERAL */}
          <Route
            path="/"
            element={<Dashboard />}
          />

          {/* PRODUÇÃO */}
          <Route
            path="/products"
            element={<Products />}
          />

          <Route
            path="/materials"
            element={<Materials />}
          />

          {/* ESTRUTURA BOM */}
          <Route
            path="/bom"
            element={<BOM />}
          />

          {/* PLANEJAMENTO */}
          <Route
            path="/planning"
            element={
              <ModulePlaceholder
                title="Planejamento"
                description="Planejamento da produção industrial."
                nextStep="Integrar BOM, operações, máquinas, grafo e geração de ordens de produção."
              />
            }
          />

          {/* PROGRAMAÇÃO */}
          <Route
            path="/schedules"
            element={
              <ModulePlaceholder
                title="Programação"
                description="Programação das atividades produtivas."
                nextStep="Organizar operações por máquina, horário de início e horário de término."
              />
            }
          />

          {/* MÁQUINAS */}
          <Route
            path="/machines"
            element={
              <ModulePlaceholder
                title="Máquinas"
                description="Cadastro e gerenciamento dos recursos industriais."
                nextStep="Integrar cadastro de máquinas, capacidade, status e operações executáveis."
              />
            }
          />

          {/* OPERAÇÕES */}
          <Route
            path="/operations"
            element={
              <ModulePlaceholder
                title="Operações"
                description="Operações necessárias para fabricação dos produtos."
                nextStep="Associar operações aos produtos e às máquinas disponíveis."
              />
            }
          />

          {/* ORDENS DE PRODUÇÃO */}
          <Route
            path="/production-orders"
            element={
              <ModulePlaceholder
                title="Ordens de Produção"
                description="Gerenciamento das ordens planejadas."
                nextStep="Integrar as ordens geradas pelo módulo de planejamento."
              />
            }
          />

          {/* CONEXÕES / GRAFO */}
          <Route
            path="/connections"
            element={
              <ModulePlaceholder
                title="Conexões"
                description="Rede de conexões entre máquinas."
                nextStep="Visualizar o grafo e integrar BFS, DFS e Dijkstra ao planejamento."
              />
            }
          />

        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;