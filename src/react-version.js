// src/react-version.js
import React from "react";
console.log("React version:", React.version);

// Force React to be properly initialized
window.__REACT_VERSION__ = React.version;
