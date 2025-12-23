import React, { useState } from "react";
import { FaChevronLeft, FaChevronRight, FaEye, FaUser, FaFileAlt } from "react-icons/fa";

const Reports = () => {
  // Combine reported users and posts into one array with a "type" field
  const [reports, setReports] = useState([
    // User reports
    {
      id: 1,
      type: "User",
      name: "John Doe",
      reporter: "Alice Smith",
      email: "john@example.com",
      reason: "Inappropriate language",
      reportDate: "Oct 3, 2025",
      status: "Pending",
    },
    {
      id: 2,
      type: "User",
      name: "Jane Roe",
      reporter: "Bob Johnson",
      email: "jane@example.com",
      reason: "Harassment",
      reportDate: "Oct 5, 2025",
      status: "Reviewed",
    },
    // Post reports
    {
      id: 101,
      type: "Post",
      name: "Offensive Post Title",
      reporter: "Charlie Brown",
      owner: "Sarah Lee",
      reason: "Hate speech",
      reportDate: "Oct 6, 2025",
      status: "Pending",
    },
    {
      id: 102,
      type: "Post",
      name: "Spam Post",
      reporter: "David Wilson",
      owner: "John Smith",
      reason: "Spam / Advertising",
      reportDate: "Oct 4, 2025",
      status: "Reviewed",
    },
  ]);

  return (
    <div className="p-6 min-h-screen pt-2 text-white">
      <div className="background-gradients relative p-6 rounded-xl shadow-md border border-gray-700 overflow-hidden mt-4">
        {/* Accent Bar */}
        <div className="absolute top-0 left-0 w-full h-1 button-bg rounded-t-3xl" />

        {/* Title */}
        <div className="flex items-center justify-between">
          <h1 className="text-[32px] md:text-[36px] font-bold">Reports Management</h1>
        </div>
      </div>

      <section className="mt-8 background-gradients border border-gray-700 p-6 rounded-xl">
        <h2 className="text-2xl font-semibold mb-6">Reported Content</h2>

        <div className="w-full rounded-xl overflow-x-auto space-y-4">
          {/* Table Header */}
          <div className="grid grid-cols-8 gap-4 text-left text-sm font-semibold text-gray-300 border-b border-gray-600 pb-4">
            <div className="px-4">#</div>
            <div>Type</div>
            <div>Name / Title</div>
            <div>Reporter</div>
            {/* <div>Content</div> */}
            <div>Contact</div>
            <div>Reason</div>
            <div>Report Date</div>
            <div>Status</div>
          </div>

          {/* Table Rows */}
          {reports.length === 0 ? (
            <p className="text-center text-gray-400 py-8">No reports found.</p>
          ) : (
            reports.map((report, idx) => (
              <div
                key={report.id}
                className="grid grid-cols-8 gap-4 items-center text-sm text-gray-200 bg-gray-800 bg-opacity-40 p-4 rounded-lg hover:bg-opacity-60 transition"
              >
                <div className="font-medium text-gray-300">{idx + 1}</div>

                <div className="flex items-center space-x-1 font-semibold">
                  {report.type === "User" ? (
                    <FaUser className="text-[#DAB462]" title="User Report" />
                  ) : (
                    <FaFileAlt className="text-[#DAB462]" title="Post Report" />
                  )}
                  <span>{report.type}</span>
                </div>

                <div className="font-semibold truncate" title={report.name}>
                  {report.name}
                </div>

                <div>{report.reporter}</div>

                <div className="truncate">
                  {report.type === "User" ? report.email : report.owner}
                </div>

                {/* <div className="truncate opacity-80">
                  {report.type === "User" ? report.email : report.owner}
                </div> */}

                <div>{report.reason}</div>

                <div>{report.reportDate}</div>

                <div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs ${
                      report.status === "Pending"
                        ? "text-yellow-400 bg-yellow-900 bg-opacity-30"
                        : "text-green-400 bg-green-900 bg-opacity-30"
                    }`}
                  >
                    {report.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Pagination */}
      <div className="flex items-center justify-end mt-8 space-x-2">
        <button
          className="p-2 rounded-full border border-gray-700 text-gray-300 hover:bg-[#BE8B36] hover:text-white transition"
          aria-label="Previous Page"
        >
          <FaChevronLeft className="w-4 h-4" />
        </button>

        {[1, 2, 3, 4, 5].map((page, index) => (
          <button
            key={index}
            className={`px-4 py-2 rounded-xl border border-gray-700 text-sm transition ${
              page === 1
                ? "bg-[#BE8B36] text-white"
                : "text-gray-300 hover:bg-gray-700"
            }`}
          >
            {page}
          </button>
        ))}

        <button
          className="p-2 rounded-full border border-gray-700 text-gray-300 hover:bg-[#BE8B36] hover:text-white transition"
          aria-label="Next Page"
        >
          <FaChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Reports;
