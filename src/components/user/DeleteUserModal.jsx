import React from 'react';

const DeleteUserModal = ({ currentUser, handleDeleteUser, closeModal }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full relative">
      <h2 className="text-xl font-medium text-gray-800 mb-4">Delete User</h2>
      <p className="mb-4">Are you sure you want to delete {currentUser.name}?</p>
      <div className="flex gap-4">
        <button
          onClick={handleDeleteUser}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-200"
        >
          Delete
        </button>
        <button
          onClick={closeModal}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition duration-200"
        >
          Cancel
        </button>
      </div>
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

export default DeleteUserModal;
