import { useEffect, useState } from 'react';
import {
  Boxes,
  ClipboardList,
  Package,
  Settings,
  TriangleAlert,
} from 'lucide-react';
import api from '../services/api';
import StatCard from '../components/StatCard';

interface DashboardStats {
  products: number;
  machines: number;
  orders: number;
  materials: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    products: 0,
    machines: 0,
    orders: 0,
    materials: 0,
  });

  const [apiOnline, setApiOnline] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [products, machines, orders, materials] = await Promise.all([
          api.get('/products'),
          api.get('/machines'),
          api.get('/productionorders'),
          api.get('/materials'),
        ]);

        setStats({
          products: products.data.length,
          machines: machines.data.length,
          orders: orders.data.length,
          materials: materials.data.length,
        });

        setApiOnline(true);
      } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
        setApiOnline(false);
      }
    };

    loadDashboard();
  }, []);

  return (
    <div className="dashboard-page">
      <div className="page-heading">
        <div>
          <h1>Dashboard</h1>
          <p>Visão geral do planejamento e da produção industrial.</p>
        </div>

        <div className={`api-status ${apiOnline ? 'online' : 'offline'}`}>
          <span />
          {apiOnline ? 'API conectada' : 'API desconectada'}
        </div>
      </div>

      <section className="stats-grid">
        <StatCard
          title="Produtos"
          value={stats.products}
          description="produtos cadastrados"
          icon={Package}
          variant="blue"
        />

        <StatCard
          title="Máquinas"
          value={stats.machines}
          description="máquinas cadastradas"
          icon={Settings}
          variant="green"
        />

        <StatCard
          title="Ordens de Produção"
          value={stats.orders}
          description="ordens cadastradas"
          icon={ClipboardList}
          variant="orange"
        />

        <StatCard
          title="Materiais"
          value={stats.materials}
          description="materiais cadastrados"
          icon={Boxes}
          variant="purple"
        />
      </section>

      <section className="dashboard-grid">
        <div className="dashboard-panel production-panel">
          <div className="panel-header">
            <div>
              <h2>Visão da Produção</h2>
              <p>Resumo dos recursos cadastrados no APS.</p>
            </div>
          </div>

          <div className="production-summary">
            <div>
              <span>Produtos</span>
              <strong>{stats.products}</strong>
            </div>

            <div>
              <span>Máquinas</span>
              <strong>{stats.machines}</strong>
            </div>

            <div>
              <span>Ordens</span>
              <strong>{stats.orders}</strong>
            </div>

            <div>
              <span>Materiais</span>
              <strong>{stats.materials}</strong>
            </div>
          </div>
        </div>

        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h2>Status do Sistema</h2>
              <p>Informações gerais do ambiente.</p>
            </div>
          </div>

          {!apiOnline ? (
            <div className="system-warning">
              <TriangleAlert size={22} />
              <div>
                <strong>Backend não conectado</strong>
                <span>
                  Inicie a API .NET para visualizar os dados reais.
                </span>
              </div>
            </div>
          ) : (
            <div className="system-success">
              <span className="success-dot" />
              <div>
                <strong>Sistema operacional</strong>
                <span>Comunicação com a API realizada com sucesso.</span>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="dashboard-panel dashboard-welcome">
        <div>
          <span className="eyebrow">APS INDUSTRIAL</span>
          <h2>Planejamento e Programação da Produção</h2>
          <p>
            Centralize produtos, materiais, máquinas, operações e ordens de
            produção em um único ambiente.
          </p>
        </div>

        <div className="welcome-decoration">
          <Package size={38} />
        </div>
      </section>
    </div>
  );
};

export default Dashboard;