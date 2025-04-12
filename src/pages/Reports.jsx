import React, { useEffect, useState } from "react";
import SummaryCard from "../components/SummaryCard";
import SalesChart from "../components/SalesChart";
import axios from "axios";
import dayjs from "dayjs"; 

const Reports = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("https://tomlin-backend.onrender.com/api/reports/expenses/")
      .then((res) => {
        setReportData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching reports:", err);
        setLoading(false);
      });
  }, []);

  if (loading || !reportData) {
    return (
      <div className="text-center p-8 text-gray-600">
        {loading ? "Loading reports..." : "Failed to load reports."}
      </div>
    );
  }

  const {
    summary = {},
    daily_sales = [],
    weekly_sales = [],
    monthly_sales = [],
    yearly_sales = [],
  } = reportData;

  // 🔍 Utility function to find total for a specific date format
  const getTotalForDate = (list, key, targetDate) => {
    const found = list.find((entry) => entry[key] === targetDate);
    return found ? found.total : 0;
  };

  // 📅 Prepare Dates
  const today = dayjs().format("YYYY-MM-DD");
  const yesterday = dayjs().subtract(1, "day").format("YYYY-MM-DD");
  const thisWeek = dayjs().startOf("week").format("YYYY-MM-DD");
  const thisMonth = dayjs().startOf("month").format("YYYY-MM-DD");
  const thisYear = dayjs().startOf("year").format("YYYY-MM-DD");

  // 💰 Get totals
  const today_total = getTotalForDate(daily_sales, "day", today);
  const yesterday_total = getTotalForDate(daily_sales, "day", yesterday);
  const week_total = getTotalForDate(weekly_sales, "week", thisWeek);
  const month_total = getTotalForDate(monthly_sales, "month", thisMonth);
  const year_total = getTotalForDate(yearly_sales, "year", thisYear);

  return (
    <div className="space-y-6 p-4 h-screen max-h-screen overflow-y-auto">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <SummaryCard title="Today" amount={today_total} />
        <SummaryCard title="Yesterday" amount={yesterday_total} />
        <SummaryCard title="This Week" amount={week_total} />
        <SummaryCard title="This Month" amount={month_total} />
        <SummaryCard title="This Year" amount={year_total} />
      </div>

      {/* 🚀 Financial Summary Section */}
      {summary && (
        <div className="bg-white shadow rounded-lg p-6 mt-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800">
            📊 Financial Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-4 rounded shadow">
              <p className="text-blue-700 font-semibold">Total Sales</p>
              <p className="text-2xl font-bold text-blue-900">
                $
                {typeof summary.total_sales === "number" &&
                !isNaN(summary.total_sales)
                  ? summary.total_sales.toFixed(2)
                  : "0.00"}
              </p>
            </div>
            <div className="bg-yellow-50 p-4 rounded shadow">
              <p className="text-yellow-700 font-semibold">Inventory Expense</p>
              <p className="text-2xl font-bold text-blue-900">
                $
                {typeof summary.total_sales === "number" &&
                !isNaN(summary.total_sales)
                  ? summary.total_sales.toFixed(2)
                  : "0.00"}
              </p>
            </div>
            <div className="bg-red-50 p-4 rounded shadow">
              <p className="text-red-700 font-semibold">Lease Expense</p>
              <p className="text-2xl font-bold text-blue-900">
                $
                {typeof summary.total_sales === "number" &&
                !isNaN(summary.total_sales)
                  ? summary.total_sales.toFixed(2)
                  : "0.00"}
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded shadow">
              <p className="text-purple-700 font-semibold">Total Expense</p>
              <p className="text-2xl font-bold text-blue-900">
                $
                {typeof summary.total_sales === "number" &&
                !isNaN(summary.total_sales)
                  ? summary.total_sales.toFixed(2)
                  : "0.00"}
              </p>
            </div>
            <div
              className={`p-4 rounded shadow ${
                summary.profit >= 0 ? "bg-green-50" : "bg-red-100"
              }`}
            >
              <p
                className={`font-semibold ${
                  summary.profit >= 0 ? "text-green-700" : "text-red-700"
                }`}
              >
                Profit
              </p>
              <p
                className={`text-2xl font-bold ${
                  summary.profit >= 0 ? "text-green-900" : "text-red-900"
                }`}
              >
                $
                {typeof summary.total_sales === "number" &&
                !isNaN(summary.total_sales)
                  ? summary.total_sales.toFixed(2)
                  : "0.00"}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SalesChart
          title="📈 Daily Sales"
          data={daily_sales}
          dataKey="total"
          labelKey="day"
        />
        <SalesChart
          title="📊 Weekly Sales"
          data={weekly_sales}
          dataKey="total"
          labelKey="week"
        />
        <SalesChart
          title="📆 Monthly Sales"
          data={monthly_sales}
          dataKey="total"
          labelKey="month"
        />
        <SalesChart
          title="📅 Yearly Sales"
          data={yearly_sales}
          dataKey="total"
          labelKey="year"
        />
      </div>
    </div>
  );
};

export default Reports;

