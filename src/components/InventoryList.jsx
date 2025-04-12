import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE_URL = "https://tomlin-backend.onrender.com"; // Replace with your actual API base URL

const InventoryList = () => {
  const [inventory, setInventory] = useState([]);
  const [orders, setOrders] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [isLoading, setIsLoading] = useState({
    inventory: false,
    orders: false,
    expenses: false,
  });
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });

  const [newItem, setNewItem] = useState({
    item_name: "",
    quantity: "",
    purchase_price: "",
    sale_price: "",
    menu_item: "",
  });

  const [newExpense, setNewExpense] = useState({
    description: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    category: "Utilities",
  });

  useEffect(() => {
    fetchInventory();
    fetchOrders();
    fetchExpenses();
  }, []);

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(
      () => setNotification({ show: false, message: "", type: "" }),
      3000
    );
  };

  const fetchInventory = async () => {
    setIsLoading((prev) => ({ ...prev, inventory: true }));
    try {
      const response = await axios.get(`${API_BASE_URL}/api/inventory/`);
      setInventory(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching inventory:", error);
      showNotification("Failed to fetch inventory", "error");
      setInventory([]);
    } finally {
      setIsLoading((prev) => ({ ...prev, inventory: false }));
    }
  };

  const fetchOrders = async () => {
    setIsLoading((prev) => ({ ...prev, orders: true }));
    try {
      const response = await axios.get(`${API_BASE_URL}/api/orders/`);
      const ordersData = Array.isArray(response.data) ? response.data : [];
      // Sort orders by date (assuming there's a created_at field)
      const sortedOrders = [...ordersData].sort(
        (a, b) =>
          new Date(b.created_at || b.date || 0) -
          new Date(a.created_at || a.date || 0)
      );
      setOrders(sortedOrders);

      // Calculate total revenue from orders
      const revenue = ordersData.reduce(
        (acc, order) => acc + (parseFloat(order.amount) || 0),
        0
      );
      setTotalRevenue(revenue);
    } catch (error) {
      console.error("Error fetching orders:", error);
      showNotification("Failed to fetch orders", "error");
      setOrders([]);
    } finally {
      setIsLoading((prev) => ({ ...prev, orders: false }));
    }
  };

  const fetchExpenses = async () => {
    setIsLoading((prev) => ({ ...prev, expenses: true }));
    try {
      const response = await axios.get(`${API_BASE_URL}/api/reports/expenses/`);
      const expensesData = Array.isArray(response.data) ? response.data : [];
      // Sort expenses by date (newest first)
      const sortedExpenses = [...expensesData].sort(
        (a, b) => new Date(b.date || 0) - new Date(a.date || 0)
      );
      setExpenses(sortedExpenses);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      showNotification("Failed to fetch expenses", "error");
      setExpenses([]);
    } finally {
      setIsLoading((prev) => ({ ...prev, expenses: false }));
    }
  };

  const handleAddInventory = async (e) => {
    e.preventDefault();
    setIsLoading((prev) => ({ ...prev, inventory: true }));
    try {
      await axios.post(`${API_BASE_URL}/api/inventory/`, newItem);
      fetchInventory();
      showNotification("Inventory item added successfully");
      // Reset form
      setNewItem({
        item_name: "",
        quantity: "",
        purchase_price: "",
        sale_price: "",
        menu_item: "",
      });
    } catch (error) {
      console.error("Error adding inventory:", error);
      showNotification("Failed to add inventory item", "error");
    } finally {
      setIsLoading((prev) => ({ ...prev, inventory: false }));
    }
  };

  const handleDeleteInventory = async (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      setIsLoading((prev) => ({ ...prev, inventory: true }));
      try {
        await axios.delete(`${API_BASE_URL}/api/inventory/${id}/`);
        showNotification("Item deleted successfully");
        fetchInventory();
      } catch (error) {
        console.error("Error deleting inventory:", error);
        showNotification("Failed to delete item", "error");
      } finally {
        setIsLoading((prev) => ({ ...prev, inventory: false }));
      }
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    setIsLoading((prev) => ({ ...prev, expenses: true }));
    try {
      await axios.post(`${API_BASE_URL}/api/reports/expenses/`, newExpense);
      fetchExpenses();
      showNotification("Expense added successfully");
      // Reset form
      setNewExpense({
        description: "",
        amount: "",
        date: new Date().toISOString().split("T")[0],
        category: "Utilities",
      });
    } catch (error) {
      console.error("Error adding expense:", error);
      showNotification("Failed to add expense", "error");
    } finally {
      setIsLoading((prev) => ({ ...prev, expenses: false }));
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Calculate total inventory value
  const totalInventoryValue = inventory.reduce(
    (total, item) => total + item.quantity * item.purchase_price,
    0
  );

  // Calculate total expenses
  const totalExpenses = expenses.reduce(
    (total, expense) =>
      total + parseFloat(expense.total_expenses || expense.amount || 0),
    0
  );

  // Calculate profit
  const profit = totalRevenue - totalExpenses;

  const expenseCategories = [
    "Utilities",
    "Rent",
    "Salaries",
    "Supplies",
    "Maintenance",
    "Marketing",
    "Insurance",
    "Other",
  ];

  return (
    <div className="p-6 bg-gray-50 h-screen max-h-screen overflow-y-auto">
      {/* Notification */}
      {notification.show && (
        <div
          className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg ${
            notification.type === "error" ? "bg-red-500" : "bg-green-500"
          } text-white`}
        >
          {notification.message}
        </div>
      )}

      {/* Dashboard Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <h3 className="text-gray-500 text-sm font-medium mb-1">
            Total Inventory Value
          </h3>
          <p className="text-2xl font-bold">
            {formatCurrency(totalInventoryValue)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <h3 className="text-gray-500 text-sm font-medium mb-1">
            Total Revenue
          </h3>
          <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <h3 className="text-gray-500 text-sm font-medium mb-1">Net Profit</h3>
          <p
            className={`text-2xl font-bold ${
              profit >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {formatCurrency(profit)}
          </p>
        </div>
      </div>

      {/* Stock Inventory */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Stock Inventory</h2>
          {isLoading.inventory && (
            <div className="text-blue-500">Loading...</div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-3 border-b font-semibold text-sm text-gray-700">
                  Item Name
                </th>
                <th className="px-4 py-3 border-b font-semibold text-sm text-gray-700">
                  Quantity
                </th>
                <th className="px-4 py-3 border-b font-semibold text-sm text-gray-700">
                  Purchase Price
                </th>
                <th className="px-4 py-3 border-b font-semibold text-sm text-gray-700">
                  Sale Price
                </th>
                <th className="px-4 py-3 border-b font-semibold text-sm text-gray-700">
                  Total Value
                </th>
                <th className="px-4 py-3 border-b font-semibold text-sm text-gray-700">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {inventory.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-4 py-4 text-center text-gray-500"
                  >
                    No inventory items found
                  </td>
                </tr>
              ) : (
                inventory.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 border-b">{item.item_name}</td>
                    <td className="px-4 py-3 border-b">{item.quantity}</td>
                    <td className="px-4 py-3 border-b">
                      {formatCurrency(item.purchase_price)}
                    </td>
                    <td className="px-4 py-3 border-b">
                      {formatCurrency(item.sale_price)}
                    </td>
                    <td className="px-4 py-3 border-b">
                      {formatCurrency(item.quantity * item.purchase_price)}
                    </td>
                    <td className="px-4 py-3 border-b">
                      <button
                        onClick={() => handleDeleteInventory(item.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <form
          onSubmit={handleAddInventory}
          className="mt-6 bg-gray-50 p-4 rounded-lg"
        >
          <h3 className="text-lg font-medium mb-3">Add New Item</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <input
              type="text"
              placeholder="Item Name"
              value={newItem.item_name}
              onChange={(e) =>
                setNewItem({ ...newItem, item_name: e.target.value })
              }
              className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="number"
              placeholder="Quantity"
              value={newItem.quantity}
              onChange={(e) =>
                setNewItem({ ...newItem, quantity: e.target.value })
              }
              className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              min="0"
            />
            <input
              type="number"
              placeholder="Purchase Price"
              value={newItem.purchase_price}
              onChange={(e) =>
                setNewItem({ ...newItem, purchase_price: e.target.value })
              }
              className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              min="0"
              step="0.01"
            />
            <input
              type="number"
              placeholder="Sale Price"
              value={newItem.sale_price}
              onChange={(e) =>
                setNewItem({ ...newItem, sale_price: e.target.value })
              }
              className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              min="0"
              step="0.01"
            />
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
              disabled={isLoading.inventory}
            >
              {isLoading.inventory ? "Adding..." : "Add Item"}
            </button>
          </div>
        </form>
      </div>

      {/* Expenses */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Expenses</h2>
          {isLoading.expenses && (
            <div className="text-blue-500">Loading...</div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-3 border-b font-semibold text-sm text-gray-700">
                  Date
                </th>
                <th className="px-4 py-3 border-b font-semibold text-sm text-gray-700">
                  Description
                </th>
                <th className="px-4 py-3 border-b font-semibold text-sm text-gray-700">
                  Category
                </th>
                <th className="px-4 py-3 border-b font-semibold text-sm text-gray-700">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {expenses.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="px-4 py-4 text-center text-gray-500"
                  >
                    No expenses found
                  </td>
                </tr>
              ) : (
                expenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 border-b">
                      {formatDate(expense.date)}
                    </td>
                    <td className="px-4 py-3 border-b">
                      {expense.description}
                    </td>
                    <td className="px-4 py-3 border-b">
                      {expense.category || "Uncategorized"}
                    </td>
                    <td className="px-4 py-3 border-b text-red-600">
                      {formatCurrency(expense.total_expenses || expense.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <form
          onSubmit={handleAddExpense}
          className="mt-6 bg-gray-50 p-4 rounded-lg"
        >
          <h3 className="text-lg font-medium mb-3">Add New Expense</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="date"
              value={newExpense.date}
              onChange={(e) =>
                setNewExpense({ ...newExpense, date: e.target.value })
              }
              className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="text"
              placeholder="Description"
              value={newExpense.description}
              onChange={(e) =>
                setNewExpense({ ...newExpense, description: e.target.value })
              }
              className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <select
              value={newExpense.category}
              onChange={(e) =>
                setNewExpense({ ...newExpense, category: e.target.value })
              }
              className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              {expenseCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <div className="flex">
              <input
                type="number"
                placeholder="Amount"
                value={newExpense.amount}
                onChange={(e) =>
                  setNewExpense({ ...newExpense, amount: e.target.value })
                }
                className="p-2 border border-gray-300 rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500 flex-grow"
                required
                min="0"
                step="0.01"
              />
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-r transition-colors"
                disabled={isLoading.expenses}
              >
                {isLoading.expenses ? "Adding..." : "Add"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Recent Transactions</h2>
          {isLoading.orders && <div className="text-blue-500">Loading...</div>}
        </div>

        {orders.length === 0 ? (
          <p className="text-center text-gray-500 py-4">
            No transactions found
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-3 border-b font-semibold text-sm text-gray-700">
                    Order ID
                  </th>
                  <th className="px-4 py-3 border-b font-semibold text-sm text-gray-700">
                    Date
                  </th>
                  <th className="px-4 py-3 border-b font-semibold text-sm text-gray-700">
                    Customer
                  </th>
                  <th className="px-4 py-3 border-b font-semibold text-sm text-gray-700">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 20).map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 border-b">{order.id}</td>
                    <td className="px-4 py-3 border-b">
                      {formatDate(order.created_at || order.date)}
                    </td>
                    <td className="px-4 py-3 border-b">
                      {order.customer_name}
                    </td>
                    <td className="px-4 py-3 border-b font-medium text-green-600">
                      {formatCurrency(order.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryList;
