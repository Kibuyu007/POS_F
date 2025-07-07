import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const RADIAN = Math.PI / 180;

const COLORS = ["#455A64", "#388E3C", "#FBC02D"];

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.75;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="#555"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={12}
      fontWeight="bold"
    >
      {(percent * 100).toFixed(0)}%
    </text>
  );
};

const Charts = ({ salesPercent, paidPercent, billPercent, composedData }) => {
  const data = [
    { name: "Sales", value: parseFloat(salesPercent) },
    { name: "Paid", value: parseFloat(paidPercent) },
    { name: "Bills", value: parseFloat(billPercent) },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      {/* Composed Chart */}
      <div className="bg-white p-4 rounded-xl shadow-md">
        <h2 className="text-xl font-semibold text-center mb-2 text-gray-700">
          Sales Breakdown (Daily)
        </h2>
        <ResponsiveContainer width="100%" height={270}>
          <ComposedChart
            data={composedData}
            margin={{ top: 20, right: 20, bottom: 20, left: 0 }}
          >
            <CartesianGrid stroke="#f0f0f0" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip
              formatter={(value) => `${value.toLocaleString()} TSh`}
              contentStyle={{
                backgroundColor: "#ffffff",
                borderColor: "#ccc",
                borderRadius: 6,
              }}
            />
            <Legend />
            <Bar dataKey="sales" name="Sales" barSize={25} fill="#212121" />
            <Line
              type="monotone"
              dataKey="paid"
              name="Paid"
              stroke="#4caf50"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="bills"
              name="Bills"
              stroke="#ffd740"
              strokeWidth={2}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Pie Chart */}
      <div className="bg-white p-4 rounded-xl shadow-md">
        <h2 className="text-xl font-semibold text-center mb-3 text-gray-700">
          Revenue Breakdown
        </h2>
        <ResponsiveContainer width="100%" height={320}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={100}
              innerRadius={60}
              dataKey="value"
              labelLine={false}
              label={({ name, percent }) =>
                `${name}: ${(percent * 100).toFixed(0)}%`
              }
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>

            <Tooltip
              formatter={(value) => `${value.toLocaleString()} TSh`}
              contentStyle={{
                backgroundColor: "#f9fafb",
                borderRadius: "8px",
                borderColor: "#e5e7eb",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              }}
              itemStyle={{ color: "#374151" }}
            />

            <Legend
              verticalAlign="bottom"
              iconType="circle"
              wrapperStyle={{
                fontSize: "13px",
                color: "#6b7280",
                marginTop: "8px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Charts;
