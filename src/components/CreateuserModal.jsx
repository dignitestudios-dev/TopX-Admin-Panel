import React, { useState } from 'react';

const CreateuserModal = ({ closeModal }) => {
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'User'
  });

  // Handle form field changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle adding a new user
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email || !newUser.password) {
      alert("Please fill out all fields.");
      return;
    }

    // Example of successful user creation
    console.log('New User Created:', newUser);

    // Reset form
    setNewUser({
      name: '',
      email: '',
      password: '',
      role: 'User'
    });

    alert("User Created Successfully!");
    closeModal(); // Close the modal after creation
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg max-w-lg w-full relative">
        {/* Modal Title */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-start">Create User</h2>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={newUser.name}
              onChange={handleInputChange}
              placeholder="Enter full name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={newUser.email}
              onChange={handleInputChange}
              placeholder="Enter email address"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={newUser.password}
              onChange={handleInputChange}
              placeholder="Enter password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              required
            />
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none transition duration-300 ease-in-out"
            >
              Create User
            </button>
          </div>
        </form>

        {/* Close Button */}
        <button
          onClick={closeModal}
          className="absolute top-1 right-4 text-gray-600 text-3xl hover:text-gray-800 focus:outline-none z-10"
        >
          &times;
        </button>
      </div>
    </div>
  );
};

export default CreateuserModal;
