import {
  Construction,
  ArrowRight,
} from 'lucide-react';

interface ModulePlaceholderProps {
  title: string;
  description: string;
  nextStep: string;
}

const ModulePlaceholder = ({
  title,
  description,
  nextStep,
}: ModulePlaceholderProps) => {
  return (
    <div className="products-page">

      <div className="page-heading">
        <div>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
      </div>

      <section className="data-panel">

        <div className="empty-state">

          <div className="empty-state-icon warning">
            <Construction size={30} />
          </div>

          <h3>Módulo em desenvolvimento</h3>

          <p>
            Este módulo faz parte da segunda etapa
            de implementação do APS Industrial.
          </p>

          <div
            style={{
              marginTop: 20,
              padding: 16,
              maxWidth: 500,
              width: '100%',
              border: '1px solid #e3e9f0',
              borderRadius: 8,
              background: '#f8fafc',
              textAlign: 'left',
            }}
          >
            <strong
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                color: '#26374c',
                fontSize: 12,
              }}
            >
              <ArrowRight size={16} />
              Próxima etapa
            </strong>

            <p
              style={{
                marginTop: 8,
                marginBottom: 0,
              }}
            >
              {nextStep}
            </p>
          </div>

        </div>

      </section>

    </div>
  );
};

export default ModulePlaceholder;