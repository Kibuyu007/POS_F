import React from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  FiTrendingUp,
  FiTrendingDown,
  FiDollarSign,
  FiCalendar,
} from "react-icons/fi";

const Charts = ({ composedData }) => {
  // If no data, show empty state
  if (!composedData || composedData.length === 0) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 mt-4 sm:mt-6">
        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 lg:p-6 border-2 border-dashed border-gray-300">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 truncate">
                Sales Trends
              </h2>
              <p className="text-xs sm:text-sm text-gray-500">
                Current filtered period
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-gradient-to-br from-emerald-500 to-teal-400 rounded-xl flex-shrink-0">
              <FiTrendingUp className="text-white text-base sm:text-lg" />
            </div>
          </div>
          <div className="h-48 sm:h-56 md:h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-xl">
            <div className="text-center px-4">
              <FiCalendar className="text-gray-400 text-3xl sm:text-4xl mx-auto mb-2 sm:mb-3" />
              <p className="text-gray-500 text-sm sm:text-base">
                No data available for selected period
              </p>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">
                Try adjusting your date filter
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 lg:p-6 border-2 border-dashed border-gray-300">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 truncate">
                Revenue Breakdown
              </h2>
              <p className="text-xs sm:text-sm text-gray-500">
                Distribution by status
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex-shrink-0">
              <FiDollarSign className="text-white text-base sm:text-lg" />
            </div>
          </div>
          <div className="h-48 sm:h-56 md:h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-xl">
            <div className="text-center px-4">
              <FiTrendingDown className="text-gray-400 text-3xl sm:text-4xl mx-auto mb-2 sm:mb-3" />
              <p className="text-gray-500 text-sm sm:text-base">
                No revenue data available
              </p>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">
                Select a date range with transactions
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate summary statistics
  const totalSales = composedData.reduce(
    (sum, item) => sum + (item.sales || 0),
    0,
  );
  const totalPaid = composedData.reduce(
    (sum, item) => sum + (item.paid || 0),
    0,
  );
  const totalBills = composedData.reduce(
    (sum, item) => sum + (item.bills || 0),
    0,
  );

  const paidPercentage =
    totalSales > 0 ? ((totalPaid / totalSales) * 100).toFixed(1) : 0;
  const billsPercentage =
    totalSales > 0 ? ((totalBills / totalSales) * 100).toFixed(1) : 0;

  const chartData = composedData.map((item) => ({
    ...item,
    date: item.name || item.date,
    total: (item.sales || 0) + (item.paid || 0) + (item.bills || 0),
  }));

  const areaChartData = composedData.map((item) => ({
    date: item.name || item.date,
    Paid: item.paid || 0,
    Bills: item.bills || 0,
    Sales: item.sales || 0,
  }));

  const colors = {
    sales: "#10b981",
    paid: "#3b82f6",
    bills: "#f59e0b",
    total: "#8b5cf6",
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 sm:p-3 md:p-4 border-2 border-gray-300 rounded-xl shadow-lg max-w-[200px] sm:max-w-none">
          <p className="text-xs sm:text-sm font-semibold text-gray-800 mb-1 sm:mb-2">
            {label}
          </p>
          {payload.map((entry, index) => (
            <div
              key={index}
              className="flex items-center justify-between mb-0.5 sm:mb-1"
            >
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div
                  className="w-2 h-2 sm:w-3 sm:h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-xs text-gray-600">{entry.dataKey}:</span>
              </div>
              <span className="text-xs font-bold text-gray-800 ml-2">
                {entry.value.toLocaleString()} TSh
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 mt-4 sm:mt-6">
      {/* Left Chart - Composed Bar & Line Chart */}
      <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 lg:p-6 border-2 border-dashed border-gray-300">
        {/* Chart Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-2 sm:gap-0">
          <div className="mb-2 sm:mb-0 min-w-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 sm:p-3 bg-gradient-to-br from-emerald-500 to-teal-400 rounded-xl flex-shrink-0">
                <FiTrendingUp className="text-white text-base sm:text-lg" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 truncate">
                  Sales Performance
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 truncate">
                  Daily trends with comparison
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="text-right">
              <p className="text-xs text-gray-600">Total Sales</p>
              <p className="text-sm sm:text-base md:text-lg font-bold text-gray-900 truncate">
                {totalSales.toLocaleString()} TSh
              </p>
            </div>
          </div>
        </div>

        {/* Chart Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-dashed border-emerald-300 rounded-xl p-2 sm:p-3">
            <div className="flex items-center justify-between gap-1">
              <div className="min-w-0">
                <p className="text-xs text-gray-600 truncate">Paid Amount</p>
                <p className="text-sm sm:text-base md:text-lg font-bold text-gray-900 truncate">
                  {totalPaid.toLocaleString()} TSh
                </p>
              </div>
              <div
                className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg text-xs font-bold flex-shrink-0 ${
                  Number(paidPercentage) >= 50
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {paidPercentage}%
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-dashed border-amber-300 rounded-xl p-2 sm:p-3">
            <div className="flex items-center justify-between gap-1">
              <div className="min-w-0">
                <p className="text-xs text-gray-600 truncate">Billed Amount</p>
                <p className="text-sm sm:text-base md:text-lg font-bold text-gray-900 truncate">
                  {totalBills.toLocaleString()} TSh
                </p>
              </div>
              <div className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-amber-100 text-amber-800 rounded-lg text-xs font-bold flex-shrink-0">
                {billsPercentage}%
              </div>
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-dashed border-blue-300 rounded-xl p-2 sm:p-3">
            <div className="text-center">
              <p className="text-xs text-gray-600">Transaction Days</p>
              <p className="text-sm sm:text-base md:text-lg font-bold text-gray-900">
                {composedData.length} days
              </p>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-56 sm:h-64 md:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 5, left: -15, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e5e7eb"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6b7280", fontSize: 10 }}
                interval="preserveStartEnd"
                angle={window.innerWidth < 640 ? -45 : 0}
                textAnchor={window.innerWidth < 640 ? "end" : "middle"}
                height={window.innerWidth < 640 ? 50 : 30}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6b7280", fontSize: 10 }}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                width={45}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                height={30}
                iconType="circle"
                wrapperStyle={{ fontSize: "11px", paddingBottom: "8px" }}
                iconSize={8}
              />
              <Bar
                dataKey="sales"
                name="Total Sales"
                fill={colors.sales}
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
              <Line
                type="monotone"
                dataKey="paid"
                name="Paid"
                stroke={colors.paid}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="bills"
                name="Bills"
                stroke={colors.bills}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
                strokeDasharray="5 5"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Right Chart - Stacked Area Chart */}
      <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 lg:p-6 border-2 border-dashed border-gray-300">
        {/* Chart Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-2 sm:gap-0">
          <div className="mb-2 sm:mb-0 min-w-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex-shrink-0">
                <FiTrendingUp className="text-white text-base sm:text-lg" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 truncate">
                  Revenue Distribution
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 truncate">
                  Stacked by transaction type
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-500"></div>
              <span className="text-xs text-gray-600">Sales</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-blue-500"></div>
              <span className="text-xs text-gray-600">Paid</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-amber-500"></div>
              <span className="text-xs text-gray-600">Bills</span>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mb-4 sm:mb-6 p-2 sm:p-3 md:p-4 bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-xl">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
            <div className="text-center">
              <div className="text-xs sm:text-sm text-gray-500">Sales Rate</div>
              <div className="text-base sm:text-lg md:text-xl font-bold text-emerald-600">
                {paidPercentage}%
              </div>
              <div className="text-xs text-gray-400">of total paid</div>
            </div>
            <div className="text-center">
              <div className="text-xs sm:text-sm text-gray-500">Bill Rate</div>
              <div className="text-base sm:text-lg md:text-xl font-bold text-amber-600">
                {billsPercentage}%
              </div>
              <div className="text-xs text-gray-400">of total billed</div>
            </div>
            <div className="text-center">
              <div className="text-xs sm:text-sm text-gray-500">Conversion</div>
              <div className="text-base sm:text-lg md:text-xl font-bold text-blue-600">
                {totalSales > 0
                  ? ((totalPaid / totalSales) * 100).toFixed(1)
                  : 0}
                %
              </div>
              <div className="text-xs text-gray-400">sales to paid</div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-56 sm:h-64 md:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={areaChartData}
              margin={{ top: 5, right: 5, left: -15, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorPaid" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors.paid} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={colors.paid} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorBills" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={colors.bills}
                    stopOpacity={0.8}
                  />
                  <stop offset="95%" stopColor={colors.bills} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={colors.sales}
                    stopOpacity={0.8}
                  />
                  <stop offset="95%" stopColor={colors.sales} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e5e7eb"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6b7280", fontSize: 10 }}
                interval="preserveStartEnd"
                angle={window.innerWidth < 640 ? -45 : 0}
                textAnchor={window.innerWidth < 640 ? "end" : "middle"}
                height={window.innerWidth < 640 ? 50 : 30}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6b7280", fontSize: 10 }}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                width={45}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                height={30}
                iconType="circle"
                wrapperStyle={{ fontSize: "11px", paddingBottom: "8px" }}
                iconSize={8}
              />
              <Area
                type="monotone"
                dataKey="Sales"
                stackId="1"
                stroke={colors.sales}
                fillOpacity={1}
                fill="url(#colorSales)"
              />
              <Area
                type="monotone"
                dataKey="Paid"
                stackId="1"
                stroke={colors.paid}
                fillOpacity={1}
                fill="url(#colorPaid)"
              />
              <Area
                type="monotone"
                dataKey="Bills"
                stackId="1"
                stroke={colors.bills}
                fillOpacity={1}
                fill="url(#colorBills)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Chart Footer */}
        <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t-2 border-dashed border-gray-300">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
            <div className="text-xs sm:text-sm text-gray-500">
              Showing data for{" "}
              <span className="font-semibold text-gray-700">
                {composedData.length}
              </span>{" "}
              days
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="text-right">
                <div className="text-xs text-gray-500">Avg. Daily Sales</div>
                <div className="text-xs sm:text-sm font-semibold text-gray-800">
                  {totalSales > 0
                    ? (totalSales / composedData.length).toLocaleString(
                        "en-US",
                        { maximumFractionDigits: 0 },
                      )
                    : 0}{" "}
                  TSh
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Charts;
