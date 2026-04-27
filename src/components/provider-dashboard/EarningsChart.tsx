import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IndianRupee } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

const earningsData = [
  { day: "Mon", earnings: 3200 },
  { day: "Tue", earnings: 4100 },
  { day: "Wed", earnings: 2800 },
  { day: "Thu", earnings: 5200 },
  { day: "Fri", earnings: 4800 },
  { day: "Sat", earnings: 6100 },
  { day: "Sun", earnings: 3500 },
];

const chartConfig: ChartConfig = {
  earnings: {
    label: "Earnings ₹",
    color: "hsl(var(--primary))",
  },
};

const EarningsChart = () => {
  return (
    <Card className="glass-card border-border/30 shadow-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
          <div className="w-7 h-7 rounded-lg gradient-amber flex items-center justify-center">
            <IndianRupee className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
          Weekly Earnings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <BarChart data={earningsData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} />
            <YAxis tickLine={false} axisLine={false} fontSize={12} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="earnings" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default EarningsChart;
