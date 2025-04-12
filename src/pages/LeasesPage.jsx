import React from "react";
import LeaseList from "../components/LeaseList"; // ✅ Import the updated LeaseList

const LeasesPage = () => {
  return (
    <div className="flex h-screen">
      <div className="flex flex-col flex-1">
        {/* Lease Management Section */}
        <div className="p-6 bg-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Lease Management</h1>
          </div>

          {/* ✅ Use the Updated InventoryList Component */}
          <LeaseList />
        </div>
      </div>
    </div>
  );
};

export default LeasesPage;
