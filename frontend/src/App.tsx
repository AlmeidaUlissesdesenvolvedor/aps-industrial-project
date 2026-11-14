import { BrowserRouter, Route, Routes } from 'react-router-dom';

import MainLayout from './layouts/MainLayout';

// Página responsável pelo CRUD das operações industriais
import Operations from './pages/Operations';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Materials from './pages/Materials';
import BOM from './pages/BOM';
import ModulePlaceholder from './pages/ModulePlaceholder';
import Machines from './pages/Machines';

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
        
          <Route
            path="/machines"
            element={<Machines />}
          />

          {/* Tela funcional de operações */}
          <Route
            path="/operations"
            element={<Operations />}
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