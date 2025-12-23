import React, { useState } from 'react';

const EditUserModal = ({ currentUser, closeModal }) => {
  const [userDetails, setUserDetails] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserDetails((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full relative">
      <h2 className="text-xl font-medium text-gray-800 mb-4">Edit User</h2>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-600">Name</label>
        <input
          type="text"
          name="name"
          value={userDetails.name}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-600">Email</label>
        <input
          type="email"
          name="email"
          value={userDetails.email}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>
      <button
        onClick={() => { /* Save Changes Logic */; closeModal(); }}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
      >
        Save Changes
      </button>
      <button
        onClick={closeModal}
        className="absolute top-2 right-4 text-gray-600 text-3xl hover:text-gray-800"
        aria-label="Close Modal"
      >
        &times;
      </button>
    </div>
  );
};

export default EditUserModal;
