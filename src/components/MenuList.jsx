import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Modal, Input, Select, message, Switch } from "antd";
import { ShoppingCartOutlined, DollarOutlined } from "@ant-design/icons";

const MenuList = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterCategory, setFilterCategory] = useState("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [orderData, setOrderData] = useState([]);
  const [orderLoading, setOrderLoading] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  // Currency state
  const [currency, setCurrency] = useState("USD"); // Default to USD
  const [exchangeRate, setExchangeRate] = useState(56.5); // Default PHP to USD rate (1 USD = 56.5 PHP)

  // Consolidated Cart State
  const [cart, setCart] = useState([]);
  const [isCartModalVisible, setIsCartModalVisible] = useState(false);

  // Cart Modal State for Order Details
  const [customerDetails, setCustomerDetails] = useState({
    customer_id: "",
    customer_name: "",
    order_date: new Date().toISOString().split("T")[0],
    total_amount: 0,
    status: "pending",
    currency: "USD", // Default currency
  });

  const [newItem, setNewItem] = useState({
    name: "",
    description: "",
    price: "",
    category: "FOOD",
    is_available: true,
    currency: "USD", // Default currency for new items
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Define category options based on your backend model
  const categoryOptions = [
    { value: "FOOD", label: "Food" },
    { value: "DRINKS", label: "Drinks" },
    { value: "DESSERT", label: "Dessert" },
  ];

  // Backend API URL
  const API_BASE_URL = "https://tomlin-backend.onrender.com/api/menu/";
  const ORDERS_API_URL = "https://tomlin-backend.onrender.com/api/orders/";

  useEffect(() => {
    fetchMenuItems();
    fetchOrders();
    fetchExchangeRate();
  }, []);

  const fetchExchangeRate = async () => {
    try {
      // In a production app, you would fetch the exchange rate from an API
      // For this example, we'll use a hardcoded value
      // Example API call would be:
      // const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');
      // setExchangeRate(response.data.rates.PHP);

      // Using fixed exchange rate for demonstration
      setExchangeRate(56.5); // 1 USD = 56.5 PHP
    } catch (err) {
      console.error("Error fetching exchange rate:", err);
    }
  };

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_BASE_URL);
      setMenuItems(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch menu items");
      setLoading(false);
      console.error("Error fetching menu items:", err);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get(ORDERS_API_URL);
      setOrderData(response.data);
    } catch (err) {
      console.error("Error fetching orders:", err);
      // Don't set error state here to avoid affecting the main UI
    }
  };

  // Convert price between currencies
  const convertPrice = (price, fromCurrency, toCurrency) => {
    if (fromCurrency === toCurrency) return parseFloat(price);

    if (fromCurrency === "USD" && toCurrency === "PHP") {
      return parseFloat(price) * exchangeRate;
    } else if (fromCurrency === "PHP" && toCurrency === "USD") {
      return parseFloat(price) / exchangeRate;
    }

    return parseFloat(price);
  };

  const formatCurrency = (amount, currencyCode = currency) => {
    const currencyConfig = {
      USD: { currency: "USD", locale: "en-US" },
      PHP: { currency: "PHP", locale: "en-PH" },
    };

    const config = currencyConfig[currencyCode];

    return new Intl.NumberFormat(config.locale, {
      style: "currency",
      currency: config.currency,
    }).format(amount);
  };

  // Toggle currency
  const toggleCurrency = () => {
    setCurrency((prev) => (prev === "USD" ? "PHP" : "USD"));
    // Update customer details currency
    setCustomerDetails((prev) => ({
      ...prev,
      currency: prev.currency === "USD" ? "PHP" : "USD",
    }));
  };

  const addToCart = (item) => {
    const existingItem = cart.find((cartItem) => cartItem.id === item.id);

    // Store the original currency and price for accurate calculations
    const itemWithCurrency = {
      ...item,
      original_currency: item.currency || "USD", // Default to USD if not specified
      original_price: item.price,
    };

    if (existingItem) {
      setCart(
        cart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      );
    } else {
      setCart([...cart, { ...itemWithCurrency, quantity: 1 }]);
    }
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(itemId);
    } else {
      setCart(
        cart.map((item) =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter((item) => item.id !== itemId));
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      // Convert the item price from its original currency to the currently selected currency
      const priceInCurrentCurrency = convertPrice(
        item.original_price,
        item.original_currency || "USD",
        currency
      );
      return total + priceInCurrentCurrency * item.quantity;
    }, 0);
  };

  const handleCustomerDetailsChange = (e) => {
    const { name, value } = e.target;
    setCustomerDetails((prev) => ({
      ...prev,
      [name]: value,
      total_amount: calculateTotal(),
    }));
  };

  const validateOrderData = () => {
    if (!customerDetails.customer_id) {
      message.error("Please provide a customer ID");
      return false;
    }
    if (!customerDetails.customer_name) {
      message.error("Please provide a customer name");
      return false;
    }
    if (cart.length === 0) {
      message.error("Your cart is empty");
      return false;
    }
    return true;
  };

  const placeOrder = async () => {
    // Validate customer details
    if (!validateOrderData()) {
      return;
    }

    try {
      setOrderLoading(true);
      const orderData = {
        customer_id: customerDetails.customer_id,
        customer_name: customerDetails.customer_name,
        date: customerDetails.order_date,
        status: customerDetails.status,
        currency: currency, // Add the selected currency
        total_amount: calculateTotal(), // Send the total in the current currency
        order_items: cart.map((item) => ({
          menu_item: item.id,
          quantity: item.quantity,
          unit_price: convertPrice(
            item.original_price,
            item.original_currency || "USD",
            currency
          ),
          item_currency: currency,
        })),
      };

      console.log("Sending order data:", JSON.stringify(orderData, null, 2));

      await axios.post(
        "https://tomlin-backend.onrender.com/api/orders/",
        orderData
      );

      // Reset cart and customer details after successful order
      setCart([]);
      setIsCartModalVisible(false);
      setCustomerDetails({
        customer_id: "",
        customer_name: "",
        order_date: new Date().toISOString().split("T")[0],
        total_amount: 0,
        status: "pending",
        currency: currency,
      });

      message.success("Order placed successfully!");
      fetchOrders(); // Refresh orders list
    } catch (err) {
      console.error("Error placing order:", err);
      if (err.response) {
        console.error("Error response:", err.response.data);
        console.error("Status code:", err.response.status);
        message.error(
          `Failed to place order: ${JSON.stringify(err.response.data)}`
        );
      } else {
        message.error("Failed to place order. Please try again.");
      }
    } finally {
      setOrderLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewItem({
      ...newItem,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleCurrencyChange = (value) => {
    setNewItem({
      ...newItem,
      currency: value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  // Add these new handler functions inside the component:

  const handleEdit = (item) => {
    // Pre-fill the form with the item's data
    setEditingItem({ ...item });
    setIsEditModalVisible(true);
  };

  const handleEditInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditingItem({
      ...editingItem,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleEditCurrencyChange = (value) => {
    setEditingItem({
      ...editingItem,
      currency: value,
    });
  };

  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Store the file
      setEditingItem({
        ...editingItem,
        imageFile: file,
      });

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingItem({
          ...editingItem,
          imagePreview: reader.result,
        });
      };
      reader.readAsDataURL(file);
    } else {
      setEditingItem({
        ...editingItem,
        imageFile: null,
        imagePreview: null,
      });
    }
  };

  const handleUpdateItem = async (e) => {
    e.preventDefault();

    try {
      // Create FormData object to handle file upload
      const formData = new FormData();
      formData.append("name", editingItem.name);
      formData.append("description", editingItem.description);
      formData.append("price", editingItem.price);
      formData.append("category", editingItem.category);
      formData.append("is_available", editingItem.is_available);
      formData.append("currency", editingItem.currency);

      if (editingItem.imageFile) {
        formData.append("image", editingItem.imageFile);
      }

      // Send the form data to the API
      const response = await axios.put(
        `${API_BASE_URL}${editingItem.id}/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("API response:", response.data);

      // Close modal and reset form
      setIsEditModalVisible(false);
      setEditingItem(null);

      // Refresh the menu items
      fetchMenuItems();
      message.success("Menu item updated successfully!");
    } catch (err) {
      const errorMessage = err.response?.data
        ? JSON.stringify(err.response.data)
        : "Failed to update menu item";
      setError(errorMessage);
      console.error("Error updating menu item:", err.response?.data || err);
      message.error("Failed to update menu item");
    }
  };

  const handleDelete = async (id) => {
    try {
      if (window.confirm("Are you sure you want to delete this item?")) {
        await axios.delete(`${API_BASE_URL}${id}/`);
        // Refresh the menu items
        fetchMenuItems();
        message.success("Menu item deleted successfully!");
      }
    } catch (err) {
      setError("Failed to delete menu item");
      console.error("Error deleting menu item:", err);
      message.error("Failed to delete menu item");
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();

    try {
      // Create FormData object to handle file upload
      const formData = new FormData();
      formData.append("name", newItem.name);
      formData.append("description", newItem.description);
      formData.append("price", newItem.price);
      formData.append("category", newItem.category);
      formData.append("is_available", newItem.is_available);
      formData.append("currency", newItem.currency); // Add currency field

      if (imageFile) {
        formData.append("image", imageFile);
      }

      // Send the form data to the API
      const response = await axios.post(API_BASE_URL, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("API response:", response.data);

      // Reset form
      setNewItem({
        name: "",
        description: "",
        price: "",
        category: "FOOD",
        is_available: true,
        currency: "USD", // Reset to default currency
      });
      setImageFile(null);
      setImagePreview(null);
      setShowAddForm(false);

      // Refresh the menu items
      fetchMenuItems();
      message.success("Menu item added successfully!");
    } catch (err) {
      const errorMessage = err.response?.data
        ? JSON.stringify(err.response.data)
        : "Failed to add menu item";
      setError(errorMessage);
      console.error("Error adding menu item:", err.response?.data || err);
      message.error("Failed to add menu item");
    }
  };

  // Helper function to get display name for category
  const getCategoryDisplay = (categoryValue) => {
    const category = categoryOptions.find((opt) => opt.value === categoryValue);
    return category ? category.label : categoryValue;
  };

  const getCategoryItems = () => {
    if (filterCategory === "all") {
      return menuItems;
    }
    return menuItems.filter((item) => item.category === filterCategory);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Get the display price for an item in the current currency
  const getDisplayPrice = (item) => {
    const itemCurrency = item.currency || "USD"; // Default to USD if not specified
    const convertedPrice = convertPrice(item.price, itemCurrency, currency);
    return formatCurrency(convertedPrice);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 h-screen max-h-screen overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition duration-200"
        >
          {showAddForm ? "Cancel" : "Add New Item"}
        </button>

        {/* Currency Toggle */}
        <div className="flex items-center space-x-2">
          <span className={currency === "USD" ? "font-semibold" : ""}>USD</span>
          <Switch
            checked={currency === "PHP"}
            onChange={toggleCurrency}
            className="bg-gray-300"
          />
          <span className={currency === "PHP" ? "font-semibold" : ""}>PHP</span>
        </div>
      </div>

      {/* Cart Icon with Count */}
      <div className="flex justify-end mb-4">
        <Button
          icon={<ShoppingCartOutlined />}
          onClick={() => setIsCartModalVisible(true)}
          className="relative"
        >
          Cart
          {cart.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
              {cart.length}
            </span>
          )}
        </Button>
      </div>

      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
          <button
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            onClick={() => setError(null)}
          >
            <span className="text-xl">&times;</span>
          </button>
        </div>
      )}

      {/* Cart Modal */}
      <Modal
        title={`Your Cart (${currency})`}
        open={isCartModalVisible}
        onCancel={() => setIsCartModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsCartModalVisible(false)}>
            Cancel
          </Button>,
          <Button
            key="order"
            type="primary"
            onClick={placeOrder}
            loading={orderLoading}
            disabled={cart.length === 0}
          >
            Place Order
          </Button>,
        ]}
      >
        {cart.length === 0 ? (
          <p className="text-center text-gray-500">Your cart is empty</p>
        ) : (
          <div>
            {/* Cart Items */}
            <div className="mb-4">
              {cart.map((item) => {
                // Convert item price from its original currency to current display currency
                const priceInCurrentCurrency = convertPrice(
                  item.original_price,
                  item.original_currency || "USD",
                  currency
                );

                return (
                  <div
                    key={item.id}
                    className="flex justify-between items-center border-b py-2"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-gray-600">
                        {formatCurrency(priceInCurrentCurrency)} each
                        {item.original_currency !== currency && (
                          <span className="text-xs ml-1 text-gray-500">
                            (original:{" "}
                            {formatCurrency(
                              item.original_price,
                              item.original_currency
                            )}
                            )
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        size="small"
                      >
                        -
                      </Button>
                      <span>{item.quantity}</span>
                      <Button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        size="small"
                      >
                        +
                      </Button>
                    </div>

                    {/* Item Total */}
                    <div className="mx-4 text-right font-semibold">
                      {formatCurrency(priceInCurrentCurrency * item.quantity)}
                    </div>

                    {/* Remove Item */}
                    <Button
                      onClick={() => removeFromCart(item.id)}
                      type="text"
                      danger
                      size="small"
                    >
                      Remove
                    </Button>
                  </div>
                );
              })}
            </div>

            {/* Total */}
            <div className="text-right font-bold mb-4">
              Total: {formatCurrency(calculateTotal())}
            </div>

            {/* Customer Details Form */}
            <div className="space-y-3">
              <Input
                placeholder="Customer ID"
                name="customer_id"
                value={customerDetails.customer_id}
                onChange={handleCustomerDetailsChange}
                required
              />
              <Input
                placeholder="Customer Name"
                name="customer_name"
                value={customerDetails.customer_name}
                onChange={handleCustomerDetailsChange}
                required
              />
              <Input
                type="date"
                name="order_date"
                value={customerDetails.order_date}
                onChange={handleCustomerDetailsChange}
              />
              <div className="flex justify-between items-center">
                <Select
                  style={{ width: "48%" }}
                  value={customerDetails.status}
                  onChange={(value) =>
                    setCustomerDetails((prev) => ({ ...prev, status: value }))
                  }
                >
                  <Select.Option value="pending">Pending</Select.Option>
                  <Select.Option value="completed">Completed</Select.Option>
                </Select>
                <div className="text-sm">
                  Currency: <span className="font-bold">{currency}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {showAddForm && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Add New Menu Item</h2>
          <form onSubmit={handleAddItem}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="name"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={newItem.name}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <div>
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="price"
                >
                  Price
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    step="0.01"
                    id="price"
                    name="price"
                    value={newItem.price}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                  <Select
                    style={{ width: "100px" }}
                    value={newItem.currency}
                    onChange={handleCurrencyChange}
                  >
                    <Select.Option value="USD">USD</Select.Option>
                    <Select.Option value="PHP">PHP</Select.Option>
                  </Select>
                </div>
              </div>
              <div className="md:col-span-2">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="description"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={newItem.description}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  rows="3"
                />
              </div>
              <div>
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="category"
                >
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={newItem.category}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                >
                  {categoryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="image"
                >
                  Image
                </label>
                <input
                  type="file"
                  id="image"
                  name="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
                {imagePreview && (
                  <div className="mt-2">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded border"
                    />
                  </div>
                )}
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_available"
                  name="is_available"
                  checked={newItem.is_available}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  className="ml-2 block text-gray-700 text-sm font-bold"
                  htmlFor="is_available"
                >
                  Is Available
                </label>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded transition duration-200"
              >
                Add Item
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="mb-6">
        <div className="flex space-x-2">
          <button
            onClick={() => setFilterCategory("all")}
            className={`px-4 py-2 rounded-md ${
              filterCategory === "all"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            All
          </button>
          {categoryOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setFilterCategory(option.value)}
              className={`px-4 py-2 rounded-md ${
                filterCategory === option.value
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {menuItems.length === 0 ? (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                No menu items found. Add your first menu item by clicking the
                "Add New Item" button.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {getCategoryItems().map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="h-48 bg-gray-300 relative">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-gray-200">
                    <span className="text-gray-500">No image</span>
                  </div>
                )}
                {!item.is_available && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                    Not Available
                  </div>
                )}
                <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded">
                  {getCategoryDisplay(item.category)}
                </div>
                {/* Show original currency if different */}
                {item.currency && item.currency !== currency && (
                  <div className="absolute bottom-2 right-2 bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded">
                    Originally in {item.currency}
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold text-gray-800">
                    {item.name}
                  </h3>
                  <span className="font-bold text-green-600">
                    {getDisplayPrice(item)}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {item.description}
                </p>
                <div className="text-xs text-gray-500 mt-4">
                  <p>Created: {formatDate(item.created_at)}</p>
                  <p>Updated: {formatDate(item.updated_at)}</p>
                </div>
                <div className="mt-4 flex justify-between items-center">
                  {item.is_available && (
                    <button
                      onClick={() => addToCart(item)}
                      className="bg-green-500 hover:bg-green-600 text-white text-sm py-1 px-3 rounded transition duration-200 flex items-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                      </svg>
                      Add to Cart
                    </button>
                  )}
                  <div className="space-y-2">
                    <div
                      key={item.id}
                      className="flex justify-between items-center py-2 px-4 bg-white border rounded shadow-sm"
                    >

                      {/* Action buttons: Edit and Delete */}
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="bg-red-500 hover:bg-red-600 text-white text-sm py-1 px-3 rounded transition duration-200"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MenuList;