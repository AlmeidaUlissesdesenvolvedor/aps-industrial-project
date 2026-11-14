import { BrowserRouter, Route, Routes } from 'react-router-dom';

import MainLayout from './layouts/MainLayout';


import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Materials from './pages/Materials';
import BOM from './pages/BOM';
import ModulePlaceholder from './pages/ModulePlaceholder';
import Machines from './pages/Machines';
// Página responsável pelo CRUD das operações industriais
import Operations from './pages/Operations';
// Página responsável por associar máquinas às operações produtivas
import MachineOperations from './pages/MachineOperations';
// Página responsável pelas conexões entre máquinas.
// Essas conexões formarão as arestas do Grafo da fábrica.
import Connections from './pages/Connections';
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

          
          {/*  Associação Máquina x Operação.
            Essa tela define quais máquinas são capazes
            de executar determinada operação produtiva.
          */}
          <Route
            path="/machine-operations"
            element={<MachineOperations />}
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

          {/*
            Conexões entre máquinas.

            Cada máquina será um vértice do Grafo
            e cada conexão cadastrada será uma aresta.
          */}
          <Route
            path="/connections"
            element={<Connections />}
          />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;