// src/components/SummaryCard.jsx
import React from "react";

const SummaryCard = ({ title, amount }) => {
  return (
    <div className="bg-white shadow-md rounded-2xl p-4 hover:shadow-xl transition duration-300">
      <h3 className="text-sm text-gray-500">{title}</h3>
      <p className="text-2xl font-semibold text-green-600">
        ${parseFloat(amount || 0).toFixed(2)}
      </p>
    </div>
  );
};

export default SummaryCard;
