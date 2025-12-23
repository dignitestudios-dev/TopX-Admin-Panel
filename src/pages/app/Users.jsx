import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { useNavigate } from "react-router";
import axios from "../../axios"

const Users = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
const [isModalOpen, setIsModalOpen] = useState(false);


  const placeholderProfilePic =
    "https://placehold.co/600x400/1f2937/ffffff?text=No+Image";

  // ----------------------------------------
  // FETCH USERS API
  // ----------------------------------------
  const fetchUsers = async (page = 1) => {
    try {
      setIsLoading(true); 

      const res = await axios.get(`/users/all?page=${page}`);

      if (res.data.success) {
        setUsers(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ----------------------------------------
  // VIEW PROFILE HANDLER
  // ----------------------------------------
 const handleViewClick = (user) => {
  navigate(`/app/user-details/${user._id}`, {
    state: { user }, // <-- pass entire user object
  });
};

  // ----------------------------------------
  // SKELETON LOADER COMPONENT
  // ----------------------------------------
  const SkeletonCard = () => (
    <div className="bg-[#E56F41] p-0 rounded-xl shadow-2xl overflow-hidden animate-pulse border border-[#E56F41] h-[320px] space-y-4">
      <div className="h-40 w-full bg-white rounded-t-xl"></div>
      <div className="p-6 space-y-4">
        <div className="h-6 bg-white rounded w-3/4 mx-auto"></div>
        <div className="h-4 bg-white rounded w-1/2 mx-auto"></div>
        <div className="flex justify-center divide-x divide-gray-700 pt-2">
          <div className="px-4 w-1/3">
            <div className="h-5 bg-white rounded w-1/2 mx-auto"></div>
          </div>
          <div className="px-4 w-1/3">
            <div className="h-5 bg-white rounded w-1/2 mx-auto"></div>
          </div>
          <div className="px-4 w-1/3">
            <div className="h-5 bg-white rounded w-1/2 mx-auto"></div>
          </div>
        </div>
        <div className="h-12 bg-gray-700 rounded-xl mt-4"></div>
      </div>
    </div>
  );

  return (
    <div className="p-6 min-h-screen pt-2 bg-gray-50 font-sans">
      {/* Header Section */}
     <div className="relative p-8 rounded-2xl bg-white shadow-xl border border-[#E56F41]/40">
        <h1 className="text-4xl font-bold text-[#DE4B12]">Users Management</h1>
        {/* <p className="text-gray-500 mt-1 text-sm">Manage users</p> */}
      </div>

      {/* Users Grid */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading
          ? Array(8)
              .fill(0)
              .map((_, idx) => <SkeletonCard key={idx} />)
          : users.map((user) => (
              <div
                key={user._id}
                className="relative bg-white text-black rounded-xl shadow-lg overflow-hidden border border-orange-400 hover:shadow-orange-500/40 transition-all duration-300"
              >
                {/* Profile Picture */}
                <div className="flex justify-center mt-4">
                  <img
                    src={user.profilePicture || placeholderProfilePic}
                    onError={(e) => (e.target.src = placeholderProfilePic)}
                    alt={user.name}
                    className="w-24 h-24 rounded-full border-4 border-white shadow-md object-cover"
                  />
                </div>

                {/* Body */}
                <div className="pt-4 pb-4 px-4 text-center">
                  <h3 className="text-lg font-semibold">{user.name}</h3>
                  <p className="text-xs text-gray-500">{user.email}</p>

                  <p className="text-xs text-gray-400 mt-1 italic">
                    Member since {new Date(user.createdAt).toLocaleDateString()}
                  </p>

                  {/* Stats */}
                  <div className="flex justify-center gap-8 mt-4 border-t border-b py-3 border-gray-200">
                    <div className="text-center">
                      <p className="text-orange-500 font-bold text-lg">
                        {user.postsCount}
                      </p>
                      <p className="text-[10px] uppercase tracking-wider text-gray-500">
                        Posts
                      </p>
                    </div>

                    <div className="text-center">
                      <p className="text-orange-500 font-bold text-lg">
                        {user.followersCount}
                      </p>
                      <p className="text-[10px] uppercase tracking-wider text-gray-500">
                        Followers
                      </p>
                    </div>

                    <div className="text-center">
                      <p className="text-orange-500 font-bold text-lg">
                        {user.followingCount}
                      </p>
                      <p className="text-[10px] uppercase tracking-wider text-gray-500">
                        Following
                      </p>
                    </div>
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
              </div>
            ))}
      </div>

      {/* Pagination */}
      {!isLoading && pagination && (
        <div className="flex items-center justify-end mt-8 space-x-2">
          {/* Previous */}
          <button
            onClick={() =>
              pagination.currentPage > 1 &&
              fetchUsers(pagination.currentPage - 1)
            }
            className="p-2 rounded-full border border-gray-300 text-gray-600 hover:bg-orange-400 hover:text-white transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Page numbers */}
          {Array.from({ length: pagination.totalPages }, (_, i) => {
            const page = i + 1;
            return (
              <button
                key={page}
                onClick={() => fetchUsers(page)}
                className={`px-3 py-1.5 rounded-xl border text-sm transition ${
                  page === pagination.currentPage
                    ? "bg-orange-400 text-white shadow-md border-orange-400"
                    : "text-gray-600 border-gray-300 hover:bg-gray-100"
                }`}
              >
                {page}
              </button>
            );
          })}

          {/* Next */}
          <button
            onClick={() =>
              pagination.currentPage < pagination.totalPages &&
              fetchUsers(pagination.currentPage + 1)
            }
            className="p-2 rounded-full border border-gray-300 text-gray-600 hover:bg-orange-400 hover:text-white transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}


      {isModalOpen && selectedUser && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
    
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

export default Users;
