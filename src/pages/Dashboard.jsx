import React, { useEffect, useState } from "react";
import {
  FaDollarSign,
  FaChartLine,
  FaUsers,
  FaBox,
  FaSync,
} from "react-icons/fa";
import { Bar, Line } from "react-chartjs-2";
import "chart.js/auto";
import axios from "axios";
import Footer from "../components/Footer";

// Define API base URL
const API_BASE_URL = "https://tomlin-backend.onrender.com";

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalInventory: 0,
    salesData: [],
    revenueData: [],
  });

  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30))
      .toISOString()
      .split("T")[0], // Default to last 30 days
    endDate: new Date().toISOString().split("T")[0],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(60000); // 1 minute default
  const [isLoading, setIsLoading] = useState({
    orders: false,
  });
  const [totalRevenue, setTotalRevenue] = useState(0);

  // Function to show notifications
  const showNotification = (message, type) => {
    console.log(`${type}: ${message}`);
    // Implement proper notification if you have a notification system
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        start_date: dateRange.startDate,
        end_date: dateRange.endDate,
      }).toString();

      // Using axios for consistent API calls
      const token = localStorage.getItem("token");
      const headers = token
        ? {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          }
        : {
            "Content-Type": "application/json",
          };

      // Fetch orders data
      const ordersResponse = await axios.get(
        `${API_BASE_URL}/api/orders/?${queryParams}`,
        { headers }
      );

      // Fetch inventory data
      const inventoryResponse = await axios.get(
        `${API_BASE_URL}/api/inventory/`,
        { headers }
      );

      // Fetch revenue data (assuming endpoint exists)
      let revenueData = [];
      try {
        const revenueResponse = await axios.get(
          `${API_BASE_URL}/api/orders/?${queryParams}`,
          { headers }
        );
        revenueData = revenueResponse.data.revenue_data || [];
      } catch (err) {
        console.warn("Could not fetch revenue data:", err);
      }

      // Calculate sales data from orders if not provided directly
      const salesData =
        ordersResponse.data.sales_data ||
        (Array.isArray(ordersResponse.data)
          ? ordersResponse.data
              .map((order) => ({
                date: new Date(order.created_at).toLocaleDateString(),
                count: 1,
              }))
              .reduce((acc, curr) => {
                const existingDate = acc.find(
                  (item) => item.date === curr.date
                );
                if (existingDate) {
                  existingDate.count += curr.count;
                } else {
                  acc.push(curr);
                }
                return acc;
              }, [])
          : []);

      // Calculate total revenue if not provided directly
      const totalRevenue =
        ordersResponse.data.total_revenue ||
        (Array.isArray(ordersResponse.data)
          ? ordersResponse.data.reduce(
              (sum, order) => sum + (parseFloat(order.amount) || 0),
              0
            )
          : 0);

      // Get unique customers from orders data (by customer_name)
      const uniqueCustomers = Array.isArray(ordersResponse.data)
        ? [
            ...new Set(
              ordersResponse.data
                .filter((order) => order.customer_name)
                .map((order) => order.customer_name)
            ),
          ]
        : [];

      setDashboardData({
        totalRevenue: totalRevenue,
        totalOrders:
          ordersResponse.data.total_orders ||
          (Array.isArray(ordersResponse.data) ? ordersResponse.data.length : 0),
        totalCustomers: uniqueCustomers.length,
        totalInventory:
          inventoryResponse.data.total_inventory ||
          (Array.isArray(inventoryResponse.data)
            ? inventoryResponse.data.length
            : 0),
        salesData: salesData,
        revenueData: revenueData,
      });

      // Update totalRevenue state
      setTotalRevenue(totalRevenue);

      setError(null);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(
        "Failed to load data. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Initial data load and refresh setup
  useEffect(() => {
    fetchDashboardData();

    const intervalId = setInterval(fetchDashboardData, refreshInterval);

    return () => clearInterval(intervalId);
  }, [dateRange, refreshInterval]);

  // Handle date range change
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  // Chart Data
  const salesChartData = {
    labels: dashboardData.salesData.map((item) => item.date),
    datasets: [
      {
        label: "Orders",
        data: dashboardData.salesData.map((item) => item.count),
        backgroundColor: "#3b82f6",
        borderRadius: 6,
      },
    ],
  };

  const revenueChartData = {
    labels: dashboardData.revenueData.map((item) => item.date),
    datasets: [
      {
        label: "Revenue",
        data: dashboardData.revenueData.map((item) => item.amount),
        borderColor: "#10b981",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // Chart Options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        intersect: false,
        mode: "index",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header Section */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>

          <div className="flex space-x-4 items-center">
            <div className="flex space-x-2">
              <input
                type="date"
                name="startDate"
                value={dateRange.startDate}
                onChange={handleDateChange}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
              <span className="self-center">to</span>
              <input
                type="date"
                name="endDate"
                value={dateRange.endDate}
                onChange={handleDateChange}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>

            <button
              onClick={fetchDashboardData}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700 transition-colors"
            >
              <FaSync className="mr-2" size={14} />
              Refresh
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 flex-grow">
        {loading && (
          <div className="flex justify-center my-8">
            <p className="text-gray-500">Loading dashboard data...</p>
          </div>
        )}
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-md my-4">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Revenue Card */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-green-100 rounded-md">
                    <FaDollarSign className="text-green-600 text-xl" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Total Revenue
                    </p>
                    <h2 className="text-2xl font-bold text-gray-800">
                      {formatCurrency(dashboardData.totalRevenue)}
                    </h2>
                  </div>
                </div>
              </div>

              {/* Orders Card */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-100 rounded-md">
                    <FaChartLine className="text-blue-600 text-xl" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Total Orders
                    </p>
                    <h2 className="text-2xl font-bold text-gray-800">
                      {dashboardData.totalOrders.toLocaleString()}
                    </h2>
                  </div>
                </div>
              </div>

              {/* Customers Card */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-purple-100 rounded-md">
                    <FaUsers className="text-purple-600 text-xl" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Total Customers
                    </p>
                    <h2 className="text-2xl font-bold text-gray-800">
                      {dashboardData.totalCustomers.toLocaleString()}
                    </h2>
                  </div>
                </div>
              </div>

              {/* Inventory Card */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-amber-100 rounded-md">
                    <FaBox className="text-amber-600 text-xl" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Total Inventory
                    </p>
                    <h2 className="text-2xl font-bold text-gray-800">
                      {dashboardData.totalInventory.toLocaleString()}
                    </h2>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Sales Chart */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold mb-4 text-gray-800">
                  Sales Trend
                </h2>
                <div className="h-64">
                  <Bar data={salesChartData} options={chartOptions} />
                </div>
              </div>

              {/* Revenue Chart */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold mb-4 text-gray-800">
                  Revenue Growth
                </h2>
                <div className="h-64">
                  <Line data={revenueChartData} options={chartOptions} />
                </div>
              </div>
            </div>
          </>
        )}
        <Footer />
      </main>
    </div>
  );
};

export default Dashboard;
