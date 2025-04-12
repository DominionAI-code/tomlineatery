import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaTachometerAlt,
  FaUtensils,
  FaBoxes,
  FaUsers,
  FaChartBar,
  FaFileContract,
  FaAngleLeft,
  FaAngleRight,
} from "react-icons/fa";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div
      className={`bg-blue-800 text-white h-screen p-4 transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Toggle Button */}
      <div className="flex justify-between items-center">
        {!isCollapsed && <h2 className="text-xl font-bold">TomlinEatery</h2>}
        <button onClick={() => setIsCollapsed(!isCollapsed)} className="text-white">
          {isCollapsed ? <FaAngleRight size={20} /> : <FaAngleLeft size={20} />}
        </button>
      </div>

      {/* Menu Items */}
      <ul className="mt-6 space-y-4">
        {/* <SidebarItem to="/dashboard" icon={<FaTachometerAlt />} text="Dashboard" isCollapsed={isCollapsed} /> */}
        <SidebarItem to="/menu" icon={<FaUtensils />} text="Menu" isCollapsed={isCollapsed} />
        <SidebarItem to="/inventory" icon={<FaBoxes />} text="Inventory" isCollapsed={isCollapsed} />
        <SidebarItem to="/employees" icon={<FaUsers />} text="Employees" isCollapsed={isCollapsed} />
        <SidebarItem to="/leases" icon={<FaFileContract />} text="Leases" isCollapsed={isCollapsed} />
        <SidebarItem to="/reports" icon={<FaChartBar />} text="Reports" isCollapsed={isCollapsed} />
      </ul>
    </div>
  );
};

// Sidebar Item Component
const SidebarItem = ({ to, icon, text, isCollapsed }) => {
  return (
    <li>
      <Link
        to={to}
        className="flex items-center space-x-2 p-2 rounded-md hover:bg-blue-600 transition-colors"
      >
        {icon}
        {!isCollapsed && <span>{text}</span>}
      </Link>
    </li>
  );
};

export default Sidebar;
