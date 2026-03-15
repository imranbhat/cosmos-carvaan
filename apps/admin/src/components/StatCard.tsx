import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  icon: LucideIcon;
}

export default function StatCard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
}: StatCardProps) {
  return (
    <div className="rounded-xl border border-admin-border bg-surface p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-admin-text-secondary">
            {title}
          </p>
          <p className="mt-1 text-2xl font-bold text-admin-text">{value}</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-1.5">
        {changeType === "positive" ? (
          <TrendingUp className="h-4 w-4 text-success" />
        ) : changeType === "negative" ? (
          <TrendingDown className="h-4 w-4 text-error" />
        ) : null}
        <span
          className={`text-sm font-medium ${
            changeType === "positive"
              ? "text-success"
              : changeType === "negative"
                ? "text-error"
                : "text-admin-text-tertiary"
          }`}
        >
          {change}
        </span>
        <span className="text-sm text-admin-text-tertiary">vs last month</span>
      </div>
    </div>
  );
}
