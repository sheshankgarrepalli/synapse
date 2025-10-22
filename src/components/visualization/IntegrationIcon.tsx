/**
 * IntegrationIcon Component
 * Consistent integration icons across all visualizations
 */

type IntegrationType = 'figma' | 'linear' | 'github' | 'slack';

interface IntegrationIconProps {
  type: IntegrationType;
  size?: number;
  className?: string;
}

export function IntegrationIcon({ type, size = 20, className = '' }: IntegrationIconProps) {
  const icons = {
    figma: '🎨',
    linear: '📋',
    github: '💻',
    slack: '💬',
  };

  const colors = {
    figma: 'text-purple-500',
    linear: 'text-blue-500',
    github: 'text-gray-800 dark:text-gray-200',
    slack: 'text-green-500',
  };

  return (
    <span
      className={`inline-flex items-center justify-center ${colors[type]} ${className}`}
      style={{ fontSize: `${size}px` }}
      aria-label={`${type} integration`}
    >
      {icons[type]}
    </span>
  );
}
