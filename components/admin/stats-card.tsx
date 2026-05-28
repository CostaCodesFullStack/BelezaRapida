"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Package,
  type LucideIcon,
} from "lucide-react";

type IconName = "dollar" | "cart" | "trend" | "box";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  iconName?: IconName;
  trend?: {
    value: number;
    label: string;
    positive: boolean;
  };
}

const icons: Record<IconName, LucideIcon> = {
  dollar: DollarSign,
  cart: ShoppingCart,
  trend: TrendingUp,
  box: Package,
};

export function StatsCard({
  title,
  value,
  description,
  iconName,
  trend,
}: StatsCardProps) {
  const Icon = iconName ? icons[iconName] : null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {trend && (
          <p
            className={`mt-2 text-xs font-medium ${
              trend.positive ? "text-green-600" : "text-red-600"
            }`}
          >
            {trend.positive ? "↑" : "↓"} {trend.value}% {trend.label}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
