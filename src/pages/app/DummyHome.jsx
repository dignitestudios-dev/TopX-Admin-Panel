import React, { useState, useEffect } from "react";
import { FaUsers, FaBuilding, FaClipboardList, FaEye, FaChevronRight, FaChevronLeft } from "react-icons/fa";
import { useNavigate } from "react-router";
import axios from "../../axios"
import { Eye } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const DummyHome = () => {
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
const [selectedUser, setSelectedUser] = useState(null);
const [isModalOpen, setIsModalOpen] = useState(false);

 const placeholderProfilePic =
    "https://placehold.co/600x400/1f2937/ffffff?text=No+Image";

  const handleViewAll = () => navigate("/app/users");

  
const handleViewClick = (user) => {
  navigate(`/app/user-details/${user._id}`, {
    state: { user }, // <-- pass entire user object
  });
};

  // Fetch Analytics Data
  const fetchAnalytics = async () => {
    try {
      const response = await axios.get("/dashboard/analytics");
      if (response.data.success) {
        setAnalytics(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching analytics data", error);
    }
  };

  // Fetch Users Data
  const fetchUsers = async () => {
    try {
      const response = await axios.get("/users/all");
      if (response.data.success) {
        setUsers(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching users data", error);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    fetchUsers();
  }, []);

  // Handle default analytics if data is not available yet
  const analyticsData = analytics ? [
    {
      title: "Active Users",
      value: analytics.activeUsers,
      icon: <FaUsers className="text-4xl text-[#DE4B12]" />,
    },
    {
      title: "Topic Pages",
      value: analytics.topicPages,
      icon: <FaClipboardList className="text-4xl text-[#DE4B12]" />,
    },
    {
      title: "Knowledge Pages",
      value: analytics.knowledgePages,
      icon: <FaBuilding className="text-4xl text-[#DE4B12]" />,
    },
    {
      title: "Active Posts",
      value: analytics.activePosts,
      icon: <FaClipboardList className="text-4xl text-[#DE4B12]" />,
    },
    {
      title: "Reports",
      value: analytics.reports,
      icon: <FaClipboardList className="text-4xl text-[#DE4B12]" />,
    },
  ] : [];

  const chartData = analytics
  ? [
      { name: "Users", value: analytics.activeUsers },
      { name: "Topics", value: analytics.topicPages },
      { name: "Knowledge", value: analytics.knowledgePages },
      { name: "Posts", value: analytics.activePosts },
      { name: "Reports", value: analytics.reports },
    ]
  : [];

  return (
    <div className="p-4 pt-2 space-y-8 min-h-screen text-black">

      {/* Header */}
      <div className="relative p-8 rounded-2xl bg-white shadow-xl border border-[#E56F41]/40">
        <h1 className="text-4xl font-bold text-[#DE4B12]">Dashboard Overview</h1>
        <p className="text-gray-500 mt-1 text-sm">Welcome back! Here is today’s performance summary.</p>
      </div>

      {/* ANALYTICS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5">
        {analyticsData.map((item, idx) => (
          <div
            key={idx}
            className="bg-white p-6 shadow border border-[#DE4B12]/30 hover:shadow-lg hover:scale-[1.02] transition cursor-pointer first:rounded-l-2xl last:rounded-r-2xl"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">{item.title}</p>
                <p className="text-3xl font-extrabold text-[#DE4B12] mt-2">{item.value}</p>
              </div>
              <div className="bg-[#FEF1E1] p-3 rounded-xl">{item.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* CHART ROW */}
      <div className="grid grid-cols-1 gap-6">
        {/* Area Chart */}
        <div className="bg-white p-6 rounded-2xl shadow border border-[#DE4B12]/30">
          <h3 className="text-lg font-semibold mb-6 text-[#DE4B12]">Revenue by Users</h3>
         <ResponsiveContainer width="100%" height={280}>
  <BarChart data={chartData}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="name" />
    <YAxis />
    <Tooltip />
    <Bar dataKey="value" fill="#DE4B12" radius={[8, 8, 0, 0]} />
  </BarChart>
</ResponsiveContainer>

        </div>
      </div>

      {/* USER CARDS */}
      <div className="bg-white max-w-[1200px] p-8 rounded-2xl shadow border border-[#DE4B12]/30">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-xl font-semibold text-[#DE4B12]">Users Management</h3>
          <button
            onClick={handleViewAll}
            className="text-[#DE4B12] hover:text-[#FFA500] transition font-semibold text-sm"
          >
            View All
          </button>
        </div>

        {/* Horizontal Scroll Cards */}
        <div className="flex gap-2 overflow-x-auto pb-4">
          {users.map((user, idx) => (
            <div
              key={user._id}
              className="min-w-[250px] bg-white border border-[#DE4B12]/40 rounded-2xl p-4 shadow hover:bg-[#FFF4EB] hover:shadow-lg transition cursor-pointer"
            >
              {/* Profile Image */}
              <div className="flex justify-center">
                <img
                  src={user?.profilePicture || "https://placehold.co/600x400?text=No+Image"}
                  alt="profile"
                  className="w-20 h-20 rounded-full border-4 border-[#FEF1E1] shadow-md object-cover"
                />
              </div>

              <div className="text-center mt-3">
                <p className="font-bold text-lg">{user.name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>

              <p className="text-xs mt-3 text-gray-500 text-center">Joined: {new Date(user.createdAt).toLocaleDateString()}</p>

              <div className="flex justify-center mt-3">
                <span className="text-green-600 bg-green-100 px-3 py-1 rounded-full text-xs font-medium">
                  Active
                </span>
              </div>

             <button
onClick={() => {
  setSelectedUser(user);
  setIsModalOpen(true);
}}
  className="w-full mt-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-lg transition flex items-center justify-center gap-2 text-sm shadow-md"
>
  <Eye className="w-4 h-4" /> View Profile
</button>

            </div>
          ))}
        </div>

        {/* Pagination */}
        {/* If you have pagination in your API response, you can display it here */}
        {/* <div className="flex items-center justify-end mt-4 gap-3">
          <button className="p-2 rounded-full border border-[#DE4B12] hover:bg-[#DE4B12] hover:text-white transition">
            <FaChevronLeft />
          </button>
          {[1, 2, 3].map((page) => (
            <button
              key={page}
              className={`px-3 py-1 rounded-lg border border-[#DE4B12] text-sm transition ${
                page === 1
                  ? "bg-[#DE4B12] text-white"
                  : "text-[#DE4B12] hover:bg-[#FEF1E1]"
              }`}
            >
              {page}
            </button>
          ))}
          <button className="p-2 rounded-full border border-[#DE4B12] hover:bg-[#DE4B12] hover:text-white transition">
            <FaChevronRight />
          </button>
        </div> */}
      </div>


{isModalOpen && selectedUser && (
  <div className="fixed -inset-20 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
    
    {/* Modal Box */}
    <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-orange-400 relative p-6 animate-scaleIn">

      {/* Close Button */}
      <button
        onClick={() => setIsModalOpen(false)}
        className="absolute top-3 right-3 text-gray-400 hover:text-orange-500 text-xl"
      >
        ✕
      </button>

      {/* Profile */}
      <div className="flex flex-col items-center text-center">
        <img
          src={selectedUser.profilePicture || placeholderProfilePic}
          className="w-28 h-28 rounded-full border-4 border-orange-400 shadow-md object-cover"
          alt={selectedUser.name}
        />

        <h2 className="mt-4 text-2xl font-bold text-gray-800">
          {selectedUser.name}
        </h2>

        <p className="text-sm text-gray-500">{selectedUser.email}</p>

        <p className="text-xs text-gray-400 mt-1">
          Joined {new Date(selectedUser.createdAt).toLocaleDateString()}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 text-center mt-6 border-t pt-4">
        <div>
          <p className="text-orange-500 font-bold text-xl">
            {selectedUser.postsCount}
          </p>
          <p className="text-xs uppercase text-gray-500">Posts</p>
        </div>

        <div>
          <p className="text-orange-500 font-bold text-xl">
            {selectedUser.followersCount}
          </p>
          <p className="text-xs uppercase text-gray-500">Followers</p>
        </div>

        <div>
          <p className="text-orange-500 font-bold text-xl">
            {selectedUser.followingCount}
          </p>
          <p className="text-xs uppercase text-gray-500">Following</p>
        </div>
      </div>

      {/* Status / Actions */}
      <div className="mt-6 flex justify-center">
        <span className="px-4 py-1.5 rounded-full bg-green-100 text-green-700 text-sm font-semibold">
          Active User
        </span>
      </div>

    </div>
  </div>
)}

    </div>
  );
};

export default DummyHome;
