import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  description: string;
  icon: LucideIcon;
  variant?: 'blue' | 'green' | 'orange' | 'purple';
}

const StatCard = ({
  title,
  value,
  description,
  icon: Icon,
  variant = 'blue',
}: StatCardProps) => {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${variant}`}>
        <Icon size={23} />
      </div>

      <div className="stat-content">
        <span>{title}</span>
        <strong>{value}</strong>
        <small>{description}</small>
      </div>
    </div>
  );
};

export default StatCard;