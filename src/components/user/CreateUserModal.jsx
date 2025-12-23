import React from 'react';

const CreateUserModal = ({ closeModal }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full relative">
      <h2 className="text-xl font-medium text-gray-800 mb-4">Create User</h2>
      {/* Form for creating user */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-600">Name</label>
        <input
          type="text"
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-600">Email</label>
        <input
          type="email"
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>
      <button
        onClick={closeModal}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
      >
        Create User
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

export default CreateUserModal;
