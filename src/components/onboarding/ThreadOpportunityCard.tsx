import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

interface ThreadOpportunityItem {
  type: 'linear' | 'github' | 'figma' | 'slack';
  title: string;
  icon: string;
}

interface ThreadOpportunityCardProps {
  title: string;
  items: ThreadOpportunityItem[];
  confidence: 'High match' | 'Strong connection' | 'Good match';
  onClick: () => void;
}

const integrationColors = {
  linear: 'bg-purple-500/10 border-purple-500/30',
  github: 'bg-blue-500/10 border-blue-500/30',
  figma: 'bg-pink-500/10 border-pink-500/30',
  slack: 'bg-orange-500/10 border-orange-500/30',
};

const integrationIcons = {
  linear: '📋',
  github: '💻',
  figma: '🎨',
  slack: '💬',
};

export function ThreadOpportunityCard({
  title,
  items,
  confidence,
  onClick,
}: ThreadOpportunityCardProps) {
  return (
    <Card
      hover
      className="transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/10 border-gray-700 bg-gradient-to-br from-gray-900/80 to-gray-900/50"
    >
      <CardContent className="pt-5 pb-5">
        {/* Header with badge and title */}
        <div className="mb-4">
          <div className="flex items-start justify-between mb-2">
            <Badge variant="success" size="sm" className="mb-2">
              {confidence}
            </Badge>
          </div>
          <h3 className="text-lg font-semibold text-white">
            {title}
          </h3>
        </div>

        {/* Preview items that would be connected */}
        <div className="space-y-2 mb-4">
          {items.map((item, index) => (
            <div
              key={index}
              className={`flex items-center gap-3 p-2.5 rounded-lg border ${integrationColors[item.type]} transition-colors`}
            >
              <span className="text-xl flex-shrink-0">
                {integrationIcons[item.type]}
              </span>
              <span className="text-sm text-gray-300 truncate flex-1">
                {item.title}
              </span>
            </div>
          ))}
        </div>

        {/* Action button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onClick}
          fullWidth
          className="hover:bg-primary/10 hover:border-primary hover:text-primary"
          rightIcon={<ArrowRightIcon className="h-4 w-4" />}
        >
          Create this thread
        </Button>
      </CardContent>
    </Card>
  );
}
