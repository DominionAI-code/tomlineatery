import React from "react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-100 text-gray-700 text-sm text-center py-4 border-t">
      <div className="w-full flex justify-center">
        <div className="w-full md:w-2/3 px-4 space-y-1">
          <p className="font-semibold text-base">Tomlin Eatery</p>
          <p>Erlinda G. Miguel - Prop</p>
          <p>Non-VAT Reg Tin: 275-775-517-00000</p>
          <p>Purok 1, Sumacab Este 3100</p>
          <p>City of Cabanatuan, Nueva Ecija, Phils.</p>
          <hr className="my-2 border-gray-300" />
          <p className="text-xs text-gray-500">
            © {currentYear} Dominion AI. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
