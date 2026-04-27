import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";

const ratingData = [
  { week: "W1", rating: 4.5 },
  { week: "W2", rating: 4.6 },
  { week: "W3", rating: 4.4 },
  { week: "W4", rating: 4.8 },
  { week: "W5", rating: 4.7 },
  { week: "W6", rating: 4.9 },
];

const chartConfig: ChartConfig = {
  rating: {
    label: "Rating",
    color: "hsl(var(--chart-5))",
  },
};

const RatingsChart = () => {
  return (
    <Card className="glass-card border-border/30 shadow-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
          <div className="w-7 h-7 rounded-lg gradient-violet flex items-center justify-center">
            <Star className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
          Rating Trend
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <LineChart data={ratingData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="week" tickLine={false} axisLine={false} fontSize={12} />
            <YAxis domain={[4, 5]} tickLine={false} axisLine={false} fontSize={12} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line type="monotone" dataKey="rating" stroke="hsl(var(--chart-5))" strokeWidth={2.5} dot={{ fill: "hsl(var(--chart-5))", r: 4 }} />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default RatingsChart;
