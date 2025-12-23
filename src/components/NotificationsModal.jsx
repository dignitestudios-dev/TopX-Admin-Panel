import React, { useState } from "react";

const NotificationsModal = ({ isOpen, onClose }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  if (!isOpen) return null;

  const handleCreate = () => {
    // Handle create logic here
    console.log({ title, description });
    onClose();
  };

  return (
    <div className="fixed -inset-16 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm ">
      <div className="bg-white text-gray-900 rounded-2xl shadow-lg max-w-md w-full p-6 relative border border-[#DE4B12]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-[#DE4B12] transition text-2xl font-bold"
          aria-label="Close modal"
        >
          &times;
        </button>

        {/* Modal Title */}
        <h2 className="text-2xl font-semibold text-[#DE4B12] mb-6">Create New Notification</h2>

        {/* Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCreate();
          }}
          className="space-y-6"
        >
          {/* Title Field */}
          <div>
            <label className="block text-sm mb-2 text-gray-700 font-medium">Title</label>
            <input
              type="text"
              placeholder="Enter notification title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-transparent border border-[#DE4B12] rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#DE4B12]"
              required
            />
          </div>

          {/* Description Field */}
          <div>
            <label className="block text-sm mb-2 text-gray-700 font-medium">Description</label>
            <textarea
              placeholder="Enter notification description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 bg-transparent border border-[#DE4B12] rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#DE4B12]"
              rows="4"
              required
            />
          </div>

          {/* Buttons */}
          <div className="mt-6 flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-lg border border-[#DE4B12] text-[#DE4B12] font-semibold hover:bg-[#F7F7F7] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-lg bg-[#DE4B12] text-white font-semibold hover:bg-[#D67D2A] transition"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NotificationsModal;
