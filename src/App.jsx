import React, { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";

// Lazy-load the pages
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const MenuPage = React.lazy(() => import("./pages/MenuPage"));
const InventoryPage = React.lazy(() => import("./pages/InventoryPage"));
const EmployeesPage = React.lazy(() => import("./pages/EmployeesPage"));
const LeasesPage = React.lazy(() => import("./pages/LeasesPage"));
const Reports = React.lazy(() => import("./pages/Reports"));

const App = () => {
  return (
    <Router>
      <div className="flex h-screen">
        {/* Sidebar (Always Visible) */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex flex-col flex-1">
          {/* Navbar (Always Visible) */}
          <Navbar />

          {/* Page Content */}
          <div className="p-6 bg-gray-100 flex-1">
            <Routes>
              {/* Lazy-loaded Dashboard */}
              <Route
                path="/"
                element={
                  <Suspense fallback={<div>Loading...</div>}>
                    <Dashboard />
                  </Suspense>
                }
              />
              {/* Lazy-loaded other pages */}
              <Route
                path="/menu"
                element={
                  <Suspense fallback={<div>Loading...</div>}>
                    <MenuPage />
                  </Suspense>
                }
              />
              <Route
                path="/inventory"
                element={
                  <Suspense fallback={<div>Loading...</div>}>
                    <InventoryPage />
                  </Suspense>
                }
              />
              <Route
                path="/employees"
                element={
                  <Suspense fallback={<div>Loading...</div>}>
                    <EmployeesPage />
                  </Suspense>
                }
              />
              <Route
                path="/leases"
                element={
                  <Suspense fallback={<div>Loading...</div>}>
                    <LeasesPage />
                  </Suspense>
                }
              />
              <Route
                path="/reports"
                element={
                  <Suspense fallback={<div>Loading...</div>}>
                    <Reports />
                  </Suspense>
                }
              />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
};

export default App;
