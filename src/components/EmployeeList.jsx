import React, { useState, useEffect } from "react";
import axios from "axios";

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    position: "",
    salary: "",
    hire_date: "",
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(
        "https://tomlin-backend.onrender.com/api/employees/"
      );
      setEmployees(response.data);
    } catch (error) {
      console.error("Error fetching employees", error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, user: null }; // Add user: null to bypass requirement
      if (editingEmployee) {
        await axios.put(
          `https://tomlin-backend.onrender.com/api/employees/${editingEmployee.id}/`,
          payload
        );
      } else {
        await axios.post(
          "https://tomlin-backend.onrender.com/api/employees/",
          payload
        );
      }
      fetchEmployees();
      closeForm();
    } catch (error) {
      console.error("Error submitting employee data:", error);
      alert(
        "Error: " +
          (error.response?.data
            ? JSON.stringify(error.response.data)
            : error.message)
      );
    }
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setFormData(employee);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this employee?"))
      return;
    try {
      await axios.delete(
        `https://tomlin-backend.onrender.com/api/employees/${id}/`
      );
      fetchEmployees();
    } catch (error) {
      console.error("Error deleting employee", error);
      alert("Failed to delete employee");
    }
  };

  const closeForm = () => {
    setModalOpen(false);
    setEditingEmployee(null);
    setFormData({
      first_name: "",
      last_name: "",
      email: "",
      position: "",
      salary: "",
      hire_date: "",
    });
  };

  return (
    <div className="container mx-auto p-4 h-screen max-h-screen overflow-y-auto">
      <button
        onClick={() => setModalOpen(true)}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Add Employee
      </button>
      <table className="min-w-full mt-4 border border-gray-300">
        <thead>
          <tr>
            <th className="border px-4 py-2">Name</th>
            <th className="border px-4 py-2">Email</th>
            <th className="border px-4 py-2">Position</th>
            <th className="border px-4 py-2">Salary</th>
            <th className="border px-4 py-2">Hire Date</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => (
            <tr key={employee.id}>
              <td className="border px-4 py-2">
                {employee.first_name} {employee.last_name}
              </td>
              <td className="border px-4 py-2">{employee.email}</td>
              <td className="border px-4 py-2">{employee.position}</td>
              <td className="border px-4 py-2">{employee.salary}</td>
              <td className="border px-4 py-2">{employee.hire_date}</td>
              <td className="border px-4 py-2">
                <button
                  onClick={() => handleEdit(employee)}
                  className="px-3 py-1 bg-yellow-500 text-white rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(employee.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded ml-2"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">
              {editingEmployee ? "Edit Employee" : "Add Employee"}
            </h2>
            <form onSubmit={handleSubmit}>
              {Object.keys(formData).map((field) => (
                <div className="mb-4" key={field}>
                  <label className="block mb-1 capitalize">
                    {field.replace("_", " ")}
                  </label>
                  <input
                    type={
                      field === "hire_date"
                        ? "date"
                        : field === "salary"
                        ? "number"
                        : "text"
                    }
                    name={field}
                    value={formData[field]}
                    onChange={handleInputChange}
                    className="border w-full p-2 rounded"
                    required
                  />
                </div>
              ))}
              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-4 py-2 bg-gray-500 text-white rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 text-white rounded"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeList;