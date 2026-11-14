import { BrowserRouter, Route, Routes } from 'react-router-dom';

import MainLayout from './layouts/MainLayout';

import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Materials from './pages/Materials';
import Planning from './pages/Planning';
import BOM from './pages/BOM';
import ModulePlaceholder from './pages/ModulePlaceholder';
import Machines from './pages/Machines';

// Página responsável pelo CRUD das operações industriais.
import Operations from './pages/Operations';

// Página responsável por associar máquinas às operações produtivas.
import MachineOperations from './pages/MachineOperations';

// Página responsável pelas conexões entre máquinas.
// Essas conexões formarão as arestas do Grafo da fábrica.
import Connections from './pages/Connections';

// Página responsável pela visualização do Grafo
// e execução dos algoritmos BFS, DFS e Dijkstra.
import Graph from './pages/Graph';

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/*
          Todas as páginas abaixo utilizam o MainLayout.

          Isso mantém Sidebar, conteúdo principal
          e estrutura visual iguais em todo o sistema.
        */}
        <Route element={<MainLayout />}>

          {/* ==============================
              VISÃO GERAL
              ============================== */}
          <Route
            path="/"
            element={<Dashboard />}
          />

          {/* ==============================
              PRODUTOS
              ============================== */}
          <Route
            path="/products"
            element={<Products />}
          />

          {/* ==============================
              MATERIAIS
              ============================== */}
          <Route
            path="/materials"
            element={<Materials />}
          />

          {/* ==============================
              BOM
              ============================== */}
          <Route
            path="/bom"
            element={<BOM />}
          />

          {/* ==============================
              PLANEJAMENTO
              ============================== */}
          {/* Planejamento integrado da produção */}
          <Route
            path="/planning"
            element={<Planning />}
          />
            
          {/* ==============================
              PROGRAMAÇÃO
              ============================== */}
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

          {/* ==============================
              MÁQUINAS
              ============================== */}
          <Route
            path="/machines"
            element={<Machines />}
          />

          {/* ==============================
              OPERAÇÕES
              ============================== */}
          <Route
            path="/operations"
            element={<Operations />}
          />

          {/* ==============================
              MÁQUINAS X OPERAÇÕES
              ============================== */}
          <Route
            path="/machine-operations"
            element={<MachineOperations />}
          />

          {/* ==============================
              ORDENS DE PRODUÇÃO
              ============================== */}
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

          {/* ==============================
              CONEXÕES ENTRE MÁQUINAS
              ============================== */}
          <Route
            path="/connections"
            element={<Connections />}
          />

          {/* ==============================
              GRAFO INDUSTRIAL
              ============================== */}
          <Route
            path="/graph"
            element={<Graph />}
          />

        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;