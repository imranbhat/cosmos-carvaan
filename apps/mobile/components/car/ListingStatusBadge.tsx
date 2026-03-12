import { Badge } from '@/components/ui/Badge';

const STATUS_MAP: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'accent' | 'muted' }> = {
  draft: { label: 'Draft', variant: 'muted' },
  pending: { label: 'Pending Review', variant: 'warning' },
  active: { label: 'Active', variant: 'success' },
  sold: { label: 'Sold', variant: 'accent' },
  expired: { label: 'Expired', variant: 'muted' },
};

interface ListingStatusBadgeProps {
  status: string;
}

export function ListingStatusBadge({ status }: ListingStatusBadgeProps) {
  const config = STATUS_MAP[status] ?? { label: status, variant: 'muted' as const };
  return <Badge label={config.label} variant={config.variant} />;
}
