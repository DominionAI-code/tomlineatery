import React from "react";
import InventoryList from "../components/InventoryList"; // ✅ Import the updated InventoryList

const InventoryPage = () => {
  return (
    <div className="flex h-screen">
      <div className="flex flex-col flex-1">
        {/* Menu Management Section */}
        <div className="p-6 bg-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Inventory Management</h1>
          </div>

          {/* ✅ Use the Updated InventoryList Component */}
          <InventoryList />
        </div>
      </div>
    </div>
  );
};

export default InventoryPage;
