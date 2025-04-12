import React, { useState, useEffect } from "react";
import {
  Calendar,
  DollarSign,
  Check,
  X,
  PlusCircle,
  Edit,
  Trash2,
  Filter,
} from "lucide-react";

const API_BASE_URL = "https://tomlin-backend.onrender.com";

// Main component for the Lease Payment Tracker application
const LeaseList = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [filterPaid, setFilterPaid] = useState("all"); // 'all', 'paid', 'unpaid'
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "due_date",
    direction: "asc",
  });

  // Form state
  const [formData, setFormData] = useState({
    restaurant_name: "",
    amount_due: "",
    due_date: "",
    is_paid: false,
  });

  // Fetch all lease payments from the API
  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/leases/`);
      if (!response.ok) {
        throw new Error("Failed to fetch payments");
      }
      const data = await response.json();
      setPayments(data);
      setError(null);
    } catch (err) {
      setError("Failed to load lease payments. Please try again later.");
      console.error("Error fetching payments:", err);
    } finally {
      setLoading(false);
    }
  };

  // Load payments on component mount
  useEffect(() => {
    fetchPayments();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Reset form to default values
  const resetForm = () => {
    setFormData({
      restaurant_name: "",
      amount_due: "",
      due_date: "",
      is_paid: false,
    });
    setEditingPayment(null);
  };

  // Open form for editing a payment
  const handleEdit = (payment) => {
    setFormData({
      restaurant_name: payment.restaurant_name,
      amount_due: payment.amount_due,
      due_date: payment.due_date,
      is_paid: payment.is_paid,
    });
    setEditingPayment(payment.id);
    setShowForm(true);
  };

  // Submit form to create or update a payment
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let url = "https://tomlin-backend.onrender.com/api/api/leases/";
      let method = "POST";

      // If editing, use PUT method and include ID in URL
      if (editingPayment) {
        url = `https://tomlin-backend.onrender.com/api/api/leases/${editingPayment}/`;
        method = "PUT";
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to ${editingPayment ? "update" : "create"} payment`
        );
      }

      // Refresh the payment list
      fetchPayments();

      // Reset form and hide it
      resetForm();
      setShowForm(false);
    } catch (err) {
      setError(`Failed to save payment: ${err.message}`);
      console.error("Error saving payment:", err);
    }
  };

  // Delete a payment
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this payment?")) {
      return;
    }

    try {
      const response = await fetch(
        `https://tomlin-backend.onrender.com/api/api/leases/${id}/`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete payment");
      }

      // Refresh the payment list
      fetchPayments();
    } catch (err) {
      setError("Failed to delete payment");
      console.error("Error deleting payment:", err);
    }
  };

  // Toggle payment status
  const togglePaymentStatus = async (payment) => {
    try {
      const response = await fetch(
        `https://tomlin-backend.onrender.com/api/api/leases/${payment.id}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ is_paid: !payment.is_paid }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update payment status");
      }

      // Refresh the payment list
      fetchPayments();
    } catch (err) {
      setError("Failed to update payment status");
      console.error("Error updating payment status:", err);
    }
  };

  // Sort payments
  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Apply sorting, filtering and searching to payments
  const getSortedAndFilteredPayments = () => {
    let filteredPayments = [...payments];

    // Apply search filter
    if (searchTerm) {
      filteredPayments = filteredPayments.filter((payment) =>
        payment.restaurant_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply paid/unpaid filter
    if (filterPaid === "paid") {
      filteredPayments = filteredPayments.filter((payment) => payment.is_paid);
    } else if (filterPaid === "unpaid") {
      filteredPayments = filteredPayments.filter((payment) => !payment.is_paid);
    }

    // Apply sorting
    filteredPayments.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });

    return filteredPayments;
  };

  // Format currency for display
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Check if a payment is overdue
  const isOverdue = (payment) => {
    if (payment.is_paid) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(payment.due_date);
    return dueDate < today;
  };

  // Calculate days overdue
  const getDaysOverdue = (dueDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    const diffTime = today - due;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const displayedPayments = getSortedAndFilteredPayments();

  return (
    <div className="min-h-screen bg-gray-50 h-screen max-h-screen overflow-y-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Lease Payment Tracker
          </h1>
          <button
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
            className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors duration-300"
          >
            <PlusCircle size={18} className="mr-1" />
            {showForm ? "Cancel" : "Add Payment"}
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
            <p>{error}</p>
          </div>
        )}

        {/* Payment Form */}
        {showForm && (
          <div className="bg-white shadow-md rounded-lg p-6 mb-6">
            <h2 className="text-lg font-medium mb-4">
              {editingPayment ? "Edit Payment" : "Add New Payment"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="restaurant_name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Restaurant Name
                  </label>
                  <input
                    type="text"
                    id="restaurant_name"
                    name="restaurant_name"
                    value={formData.restaurant_name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="amount_due"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Amount Due ($)
                  </label>
                  <input
                    type="number"
                    id="amount_due"
                    name="amount_due"
                    value={formData.amount_due}
                    onChange={handleInputChange}
                    required
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="due_date"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Due Date
                  </label>
                  <input
                    type="date"
                    id="due_date"
                    name="due_date"
                    value={formData.due_date}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_paid"
                    name="is_paid"
                    checked={formData.is_paid}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="is_paid"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    Payment Received
                  </label>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowForm(false);
                  }}
                  className="mr-3 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {editingPayment ? "Update Payment" : "Add Payment"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white shadow-md rounded-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center">
              <label
                htmlFor="filter"
                className="mr-2 text-sm font-medium text-gray-700"
              >
                <Filter size={18} className="inline mr-1" />
                Filter:
              </label>
              <select
                id="filter"
                value={filterPaid}
                onChange={(e) => setFilterPaid(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="all">All Payments</option>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
              </select>
            </div>

            <div className="flex-1 md:max-w-xs">
              <input
                type="text"
                placeholder="Search by restaurant name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-3 text-gray-600">Loading payments...</p>
            </div>
          ) : displayedPayments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                No payments found. {searchTerm && "Try adjusting your search."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => requestSort("restaurant_name")}
                    >
                      Restaurant Name
                      {sortConfig.key === "restaurant_name" && (
                        <span className="ml-1">
                          {sortConfig.direction === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => requestSort("amount_due")}
                    >
                      Amount Due
                      {sortConfig.key === "amount_due" && (
                        <span className="ml-1">
                          {sortConfig.direction === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => requestSort("due_date")}
                    >
                      Due Date
                      {sortConfig.key === "due_date" && (
                        <span className="ml-1">
                          {sortConfig.direction === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => requestSort("is_paid")}
                    >
                      Status
                      {sortConfig.key === "is_paid" && (
                        <span className="ml-1">
                          {sortConfig.direction === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {displayedPayments.map((payment) => (
                    <tr
                      key={payment.id}
                      className={isOverdue(payment) ? "bg-red-50" : ""}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {payment.restaurant_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="flex items-center">
                          <DollarSign
                            size={16}
                            className="mr-1 text-gray-400"
                          />
                          {formatCurrency(payment.amount_due)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="flex items-center">
                          <Calendar size={16} className="mr-1 text-gray-400" />
                          {formatDate(payment.due_date)}
                          {isOverdue(payment) && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              {getDaysOverdue(payment.due_date)} days overdue
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => togglePaymentStatus(payment)}
                          className={`inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded ${
                            payment.is_paid
                              ? "bg-green-100 text-green-800 hover:bg-green-200"
                              : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                          }`}
                        >
                          {payment.is_paid ? (
                            <>
                              <Check size={14} className="mr-1" />
                              Paid
                            </>
                          ) : (
                            <>
                              <X size={14} className="mr-1" />
                              Unpaid
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(payment)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(payment.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        {!loading && displayedPayments.length > 0 && (
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="bg-white overflow-hidden shadow-md rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Amount Due
                      </dt>
                      <dd className="text-lg font-semibold text-gray-900">
                        {formatCurrency(
                          displayedPayments.reduce(
                            (sum, payment) =>
                              sum + parseFloat(payment.amount_due),
                            0
                          )
                        )}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow-md rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                    <Check className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Paid Amount
                      </dt>
                      <dd className="text-lg font-semibold text-gray-900">
                        {formatCurrency(
                          displayedPayments
                            .filter((payment) => payment.is_paid)
                            .reduce(
                              (sum, payment) =>
                                sum + parseFloat(payment.amount_due),
                              0
                            )
                        )}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow-md rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                    <X className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Outstanding Amount
                      </dt>
                      <dd className="text-lg font-semibold text-gray-900">
                        {formatCurrency(
                          displayedPayments
                            .filter((payment) => !payment.is_paid)
                            .reduce(
                              (sum, payment) =>
                                sum + parseFloat(payment.amount_due),
                              0
                            )
                        )}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaseList;