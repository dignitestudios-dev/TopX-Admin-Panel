import { useState, useEffect } from "react";
import { FaUsers, FaBuilding, FaClipboardList } from "react-icons/fa";
import { useNavigate } from "react-router";
import axios from "../../axios";
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

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // Handle default analytics if data is not available yet
  const analyticsData = analytics
    ? [
      {
        title: "Active Users",
        value: analytics.activeUsers,
        icon: <FaUsers className="text-4xl text-[#DE4B12]" />,
        link: "/app/users",
      },
      {
        title: "Topic Pages",
        value: analytics.topicPages,
        icon: <FaClipboardList className="text-4xl text-[#DE4B12]" />,
        link: "/app/pages",
      },
      {
        title: "Knowledge Pages",
        value: analytics.knowledgePages,
        icon: <FaBuilding className="text-4xl text-[#DE4B12]" />,
        link: "/app/pages",
      },
      // {
      //   title: "Active Posts",
      //   value: analytics.activePosts,
      //   icon: <FaClipboardList className="text-4xl text-[#DE4B12]" />,
      //   link: "/app/posts",
      // },
      {
        title: "Reports",
        value: analytics.reports,
        icon: <FaClipboardList className="text-4xl text-[#DE4B12]" />,
        link: "/app/reports",
      },
    ]
    : [];

  const chartData = analytics
    ? [
      { name: "May", value: analytics.activeUsers },
      { name: "June", value: analytics.topicPages },
      { name: "July", value: analytics.knowledgePages },
      { name: "August", value: analytics.activePosts },
      { name: "September", value: analytics.reports },
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
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4">
        {analyticsData.map((item, idx) => (
          <div
            key={idx}
            onClick={() => item.link && navigate(item.link)}
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
          <h3 className="text-lg font-semibold mb-6 text-[#DE4B12]">User Growth Over Time</h3>
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


    </div>
  );
};

export default DummyHome;
