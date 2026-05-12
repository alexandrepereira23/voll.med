import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function PageHeader({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: PageHeaderProps) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="mt-1 rounded-lg bg-primary/10 p-2">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        )}
        <div>
          <h1 className="text-3xl font-bold text-foreground">{title}</h1>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="whitespace-nowrap">
          + {actionLabel}
        </Button>
      )}
    </div>
  );
}
