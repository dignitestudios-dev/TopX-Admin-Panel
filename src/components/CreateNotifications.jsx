import React, { useState } from 'react';

const CreateNotifications = ({ closeModal }) => {
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'Info', // Default type
    date: new Date().toISOString().slice(0, 19), // Default to current date
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewNotification((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("New Notification Created:", newNotification);
    closeModal(); // Close modal after submission
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Notification Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={newNotification.title}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
          <textarea
            id="message"
            name="message"
            value={newNotification.message}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">Notification Type</label>
          <select
            id="type"
            name="type"
            value={newNotification.type}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Info">Info</option>
            <option value="Success">Success</option>
            <option value="Warning">Warning</option>
          </select>
        </div>

        <div>
          <button
            type="submit"
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none transition duration-300"
          >
            Create Notification
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateNotifications;
