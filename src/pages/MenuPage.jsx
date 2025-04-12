import React from "react";
import MenuList from "../components/MenuList"; // ✅ Import the updated MenuList

const MenuPage = () => {
  return (
    <div className="flex h-screen">
      <div className="flex flex-col flex-1">
        {/* Menu Management Section */}
        <div className="p-6 bg-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Menu Management</h1>
          </div>

          {/* ✅ Use the Updated MenuList Component */}
          <MenuList />
        </div>
      </div>
    </div>
  );
};

export default MenuPage;
