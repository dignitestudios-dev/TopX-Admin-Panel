import { Trash2 } from "lucide-react"; 
import React, { useState } from "react";
import NotificationsModal from "../../components/NotificationsModal";

const Notifications = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const notifications = [
    {
      id: 1,
      title: "Notification 1",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do tempor...",
      date: "22 Sep, 2025",
      time: "08:00 PM",
    },
    {
      id: 2,
      title: "Notification 2",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do tempor...",
      date: "23 Sep, 2025",
      time: "10:00 AM",
    },
  ];

  return (
    <div className="p-6 pt-2 min-h-screen bg-white text-gray-900 space-y-6 ">
      
      {/* Header */}
      <div className="relative rounded-xl  p-8 bg-white shadow-xl border border-[#E56F41]/4  border-[#DE4B12] flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        {/* Accent bar */}
        {/* <div className="absolute top-0 left-0 w-full h-1 bg-[#DE4B12] rounded-t-2xl" /> */}

        <h1 className="text-2xl md:text-3xl font-bold text-[#DE4B12]">Notifications</h1>
        

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#DE4B12] text-white rounded-lg shadow hover:bg-orange-600 transition"
        >
          <span className="text-lg font-bold">+</span>
          <span className="font-medium">Create</span>
        </button>
      </div>

      {/* Notifications List */}
      <section className="space-y-4">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 md:p-6 border border-[#DE4B12] rounded-2xl shadow hover:shadow-lg transition bg-white cursor-pointer"
          >
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-[#DE4B12]">{notification.title}</h3>
              <p className="text-sm text-gray-700 mt-1">{notification.description}</p>
              <span className="text-xs text-gray-500 mt-1 block">{notification.time}</span>
            </div>
            <div className="flex items-center gap-3 mt-3 md:mt-0">
              <span className="text-sm text-gray-500">{notification.date}</span>
              <button
                className="text-red-500 hover:text-red-400 transition"
                onClick={() => alert(`Delete Notification ${notification.id}`)}
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </section>

      {/* Modal */}
      <NotificationsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default Notifications;
