import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface SkillData {
  skill: string;
  candidate: number;
  required: number;
}

interface SkillChartProps {
  data: SkillData[];
  title?: string;
}

const SkillChart = ({ data, title = "Skill Overlap Analysis" }: SkillChartProps) => {
  return (
    <div className="w-full">
      {title && (
        <h3 className="text-base font-heading font-semibold text-foreground mb-4">
          {title}
        </h3>
      )}
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              vertical={false}
            />
            <XAxis
              dataKey="skill"
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              axisLine={{ stroke: "hsl(var(--border))" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
              domain={[0, 100]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                boxShadow: "var(--shadow-md)",
                fontSize: "13px",
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: "13px", paddingTop: "8px" }}
            />
            <Bar
              dataKey="candidate"
              name="Your Skills"
              fill="hsl(var(--accent))"
              radius={[4, 4, 0, 0]}
              barSize={24}
            />
            <Bar
              dataKey="required"
              name="Required"
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
              barSize={24}
              opacity={0.6}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SkillChart;
