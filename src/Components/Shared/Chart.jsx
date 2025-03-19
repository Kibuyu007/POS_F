
import {
  ComposedChart, Line, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { PieChart, Pie, Cell } from 'recharts';

// Data for Composed Chart
const composedData = [
  { name: 'Page A', uv: 590, pv: 800, amt: 1400 },
  { name: 'Page B', uv: 868, pv: 967, amt: 1506 },
  { name: 'Page C', uv: 1397, pv: 1098, amt: 989 },
  { name: 'Page D', uv: 1480, pv: 1200, amt: 1228 },
  { name: 'Page E', uv: 1520, pv: 1108, amt: 1100 },
  { name: 'Page F', uv: 1400, pv: 680, amt: 1700 }
];

// Data for Pie Chart
const pieData = [
  { name: 'Group A', value: 400 },
  { name: 'Group B', value: 300 },
  { name: 'Group C', value: 300 },
  { name: 'Group D', value: 200 }
];


const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, index }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={14} fontWeight="bold">
      {`${pieData[index].value}`} 
    </text>
  );
};

const COLORS = ['#00000', '#00C49F', '#4caf50', '#c8e6c9'];

const Charts = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 ">
      {/* Composed Chart */}
      <div className="bg-greyBackg p-4 rounded-xl  shadow-[0_3px_10px_rgb(0,0,0,0.2)]">
        <h2 className="text-xl font-semibold text-center mb-2">Multi-Metric Analysis</h2>
        <ResponsiveContainer width="100%" height={270}>
          <ComposedChart data={composedData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid stroke="#f5f5f5" />
            <XAxis dataKey="name" label={{ value: 'Pages', position: 'insideBottomRight', offset: 0 }} scale="band" />
            <YAxis label={{ value: 'Index', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="amt" fill="#c8e6c9" stroke="#000000" />
            <Bar dataKey="pv" barSize={30} fill="#00000" />
            <Line type="monotone" dataKey="uv" stroke="#00c853" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Pie Chart */}
      <div className="bg-greyBackg p-4 rounded-xl shadow-[0_3px_10px_rgb(0,0,0,0.2)]">
        <h2 className="text-xl font-semibold text-center mb-3">Revenue Breakdown</h2>
        <ResponsiveContainer width="100%" height={270}>
        <PieChart>
          <Pie 
            data={pieData} 
            cx="50%" 
            cy="50%" 
            labelLine={false} 
            label={renderCustomizedLabel} 
            outerRadius={80} 
            fill="#8884d8" 
            dataKey="value"
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Charts;