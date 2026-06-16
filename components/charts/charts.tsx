"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CHART_COLORS } from "@/config/theme";
import { cn } from "@/lib/utils";

const axisStyle = { fontSize: 12, fill: "#65726b" };
const gridStroke = "#e6e2d8";

const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid #e6e2d8",
  fontSize: 13,
  boxShadow: "0 8px 24px rgba(6,44,27,0.10)",
};

/** Carte conteneur pour graphiques. */
export function ChartCard({
  id,
  title,
  description,
  action,
  children,
  height = 300,
}: {
  id?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  height?: number;
}) {
  return (
    <Card id={id} className={cn("ew-fade-in", id && "scroll-mt-24")}>
      <CardHeader className="flex-row items-start justify-between gap-2 space-y-0">
        <div>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription className="mt-1">{description}</CardDescription>}
        </div>
        {action}
      </CardHeader>
      <CardContent>
        <div style={{ width: "100%", height }}>
          <ResponsiveContainer width="100%" height="100%">
            {children as React.ReactElement}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

interface SeriesDef {
  key: string;
  label: string;
  color?: string;
}

export function AreaTrend({ data, xKey, series }: { data: Record<string, unknown>[]; xKey: string; series: SeriesDef[] }) {
  return (
    <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
      <defs>
        {series.map((s, i) => (
          <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={s.color ?? CHART_COLORS[i]} stopOpacity={0.35} />
            <stop offset="95%" stopColor={s.color ?? CHART_COLORS[i]} stopOpacity={0.02} />
          </linearGradient>
        ))}
      </defs>
      <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
      <XAxis dataKey={xKey} tick={axisStyle} axisLine={false} tickLine={false} />
      <YAxis tick={axisStyle} axisLine={false} tickLine={false} width={44} />
      <Tooltip contentStyle={tooltipStyle} />
      <Legend wrapperStyle={{ fontSize: 12 }} />
      {series.map((s, i) => (
        <Area
          key={s.key}
          type="monotone"
          dataKey={s.key}
          name={s.label}
          stroke={s.color ?? CHART_COLORS[i]}
          fill={`url(#grad-${s.key})`}
          strokeWidth={2.5}
        />
      ))}
    </AreaChart>
  );
}

export function LineTrend({ data, xKey, series }: { data: Record<string, unknown>[]; xKey: string; series: SeriesDef[] }) {
  return (
    <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
      <XAxis dataKey={xKey} tick={axisStyle} axisLine={false} tickLine={false} />
      <YAxis tick={axisStyle} axisLine={false} tickLine={false} width={44} />
      <Tooltip contentStyle={tooltipStyle} />
      <Legend wrapperStyle={{ fontSize: 12 }} />
      {series.map((s, i) => (
        <Line
          key={s.key}
          type="monotone"
          dataKey={s.key}
          name={s.label}
          stroke={s.color ?? CHART_COLORS[i]}
          strokeWidth={2.5}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
        />
      ))}
    </LineChart>
  );
}

export function BarsChart({
  data,
  xKey,
  series,
  stacked = false,
}: {
  data: Record<string, unknown>[];
  xKey: string;
  series: SeriesDef[];
  stacked?: boolean;
}) {
  return (
    <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
      <XAxis dataKey={xKey} tick={axisStyle} axisLine={false} tickLine={false} />
      <YAxis tick={axisStyle} axisLine={false} tickLine={false} width={44} />
      <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(23,107,69,0.06)" }} />
      <Legend wrapperStyle={{ fontSize: 12 }} />
      {series.map((s, i) => (
        <Bar
          key={s.key}
          dataKey={s.key}
          name={s.label}
          fill={s.color ?? CHART_COLORS[i]}
          radius={[6, 6, 0, 0]}
          stackId={stacked ? "a" : undefined}
          maxBarSize={48}
        />
      ))}
    </BarChart>
  );
}

export function DonutChart({ data }: { data: { name: string; value: number }[] }) {
  return (
    <PieChart>
      <Pie data={data} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="80%" paddingAngle={3}>
        {data.map((_, i) => (
          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
        ))}
      </Pie>
      <Tooltip contentStyle={tooltipStyle} />
      <Legend wrapperStyle={{ fontSize: 12 }} />
    </PieChart>
  );
}

export function RadarScore({ data, dataKey = "valeur", angleKey = "axe", max = 20 }: { data: Record<string, unknown>[]; dataKey?: string; angleKey?: string; max?: number }) {
  return (
    <RadarChart data={data} cx="50%" cy="50%" outerRadius="72%">
      <PolarGrid stroke={gridStroke} />
      <PolarAngleAxis dataKey={angleKey} tick={axisStyle} />
      <PolarRadiusAxis domain={[0, max]} tick={{ fontSize: 10, fill: "#9aa39c" }} />
      <Radar dataKey={dataKey} stroke={CHART_COLORS[0]} fill={CHART_COLORS[0]} fillOpacity={0.4} strokeWidth={2} />
      <Tooltip contentStyle={tooltipStyle} />
    </RadarChart>
  );
}
