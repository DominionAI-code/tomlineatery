import axios from 'axios';

const API_BASE_URL = "https://tomlin-backend.onrender.com/api"; // Replace with your actual API base URL

export const fetchMenu = () => axios.get(`${API_BASE_URL}/menu/`);
export const fetchInventory = () => axios.get(`${API_BASE_URL}/inventory/`);
export const fetchEmployees = () => axios.get(`${API_BASE_URL}/employees/`);
export const fetchReports = () => axios.get(`${API_BASE_URL}/reports/`);
export const fetchLeases = () => axios.get(`${API_BASE_URL}/leases/`);