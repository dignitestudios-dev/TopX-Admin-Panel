import React, { useState, useEffect } from 'react';
import { FaRegEye } from 'react-icons/fa';
import { useNavigate } from 'react-router';
import { Plus, StickyNote } from 'lucide-react';
import CreateUserModal from './user/CreateUserModal';
import EditUserModal from './user/EditUserModal';
import DeleteUserModal from './user/DeleteUserModal';
import { AiOutlineDelete } from "react-icons/ai";
import axios from "../axios"

const DashboardUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async (page = 1, limit = 10) => {
      setLoading(true);
      try {
        const response = await axios.get(`/user?page=${page}&limit=${limit}`);
        const { data } = response;
        setUsers(data.data.users);
        setTotalUsers(data.data.total);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers(currentPage);
  }, [currentPage]);

  const openCreateModal = () => setIsCreateModalOpen(true);
  const closeCreateModal = () => setIsCreateModalOpen(false);

  const openEditModal = (user) => {
    setCurrentUser(user);
    setIsEditModalOpen(true);
  };
  const closeEditModal = () => setIsEditModalOpen(false);

  const openDeleteModal = (user) => {
    setCurrentUser(user);
    setIsDeleteModalOpen(true);
  };
  const closeDeleteModal = () => setIsDeleteModalOpen(false);

  const handleDeleteUser = () => {
    alert(`User ${currentUser.name} deleted.`);
    setIsDeleteModalOpen(false);
  };

const handleViewUser = (user) => navigate(`/app/user-details`, { state: { user } });

  const totalPages = Math.ceil(totalUsers / 10);

  return (
    <div className="col-span-3  pt-0">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-medium text-gray-800">Users</h2>
        </div>
        {/* <div>
          <p className="text-sm font-medium text-blue-500">See All</p>
        </div> */}
        {/* <div className="flex gap-4">
          <button className="px-4 py-2 flex gap-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200">
            <StickyNote className="text-xs" /> Export CSV
          </button>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 flex gap-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
          >
            <Plus className="text-xs" /> Create User
          </button>
        </div> */}
      </div>

      {/* Render Users Table */}
      {loading ? (
        <div>
  <tbody>
  {Array.from({ length: 5 }).map((_, index) => (
    <tr key={index} className="border-b w-full animate-pulse">
      <td className="w-full py-4 px-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gray-300 rounded-full" />
          <div className="h-4 bg-gray-300 rounded w-24" />
        </div>
      </td>
      <td className="py-4 px-4">
        <div className="h-4 bg-gray-300 rounded w-40" />
      </td>
      <td className="py-4 px-4">
        <div className="h-4 bg-gray-300 rounded w-32" />
      </td>
      <td className="py-4 px-4">
        <div className="h-4 bg-gray-300 rounded w-28" />
      </td>
      <td className="py-4 px-4">
        <div className="h-4 bg-gray-300 rounded w-20" />
      </td>
      <td className="py-4 px-4">
        <div className="flex gap-3">
          <div className="h-8 w-8 bg-gray-300 rounded-md" />
          <div className="h-8 w-8 bg-gray-300 rounded-md" />
        </div>
      </td>
    </tr>
  ))}
</tbody>


</div>
      ) : (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="w-full text-left table-auto">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="py-6 px-4 text-sm font-semibold text-gray-600">Profile</th>
                <th className="py-6 px-4 text-sm font-semibold text-gray-600">Email</th>
                <th className="py-6 px-4 text-sm font-semibold text-gray-600">Address</th>
                <th className="py-6 px-4 text-sm font-semibold text-gray-600">Supervisor</th>
                <th className="py-6 px-4 text-sm font-semibold text-gray-600">Membership Number</th>
                <th className="py-6 px-4 text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
               {users.map((user) => (
                <tr key={user._id} className="border-b hover:bg-gray-50 transition-all">
                 <td className="py-4 px-4 text-sm text-gray-800 flex items-center gap-3">
  {user.profilePicture ? (
    <img
      src={user.profilePicture}
      alt={user.name}
      className="w-12 h-12 rounded-full object-cover"
    />
  ) : (
    <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm">
      {user.name
        .split(' ')
        .map((word) => word[0])
        .slice(0, 2) // Get the initials (first 2 letters)
        .join('')
        .toUpperCase()}
    </div>
  )}
  <span>{user.name}</span>
                  </td>
                  <td className="py-2 px-4 text-sm text-gray-800">{user.email}</td>
                  <td className="py-2 px-4 text-sm text-gray-800">{user.address || 'Not Available'}</td>
                  <td className="py-2 px-4 text-sm text-gray-800">{user.supervisor}</td>
                  <td className="py-2 px-4 text-sm text-gray-800">{user.membershipNumber}</td>
                  <td className="py-2 px-4 text-sm text-gray-800">
                    <div className="flex gap-3">
                      {/* <button
                        onClick={() => openEditModal(user)}
                        className="px-3 py-1 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white border rounded-md"
                      >
                        Edit
                      </button> */}

                     <button
  onClick={() => handleViewUser(user)}
  className="px-3 py-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white border rounded-md"
>
  <FaRegEye />
</button>

                      {/* <button
                        onClick={() => openDeleteModal(user)}
                        className="px-3 py-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white border rounded-md"
                      >
                        <AiOutlineDelete className='text-md' />

                      </button> */}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
    {/* <div className="flex justify-end items-center mt-6 space-x-4">
  <button
    disabled={currentPage <= 1}
    onClick={() => setCurrentPage(currentPage - 1)}
    className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-300"
  >
    <span className="mr-2">Prev</span>
  </button>

  <span className="text-sm text-gray-600">
    Page {currentPage} of {totalPages}
  </span>

  <button
    disabled={currentPage >= totalPages}
    onClick={() => setCurrentPage(currentPage + 1)}
    className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-300"
  >
    <span className="ml-2">Next</span>
  </button>
</div> */}


      {/* Modals */}
      {isCreateModalOpen && <CreateUserModal closeModal={closeCreateModal} />}
      {isEditModalOpen && currentUser && <EditUserModal currentUser={currentUser} closeModal={closeEditModal} />}
      {isDeleteModalOpen && currentUser && <DeleteUserModal currentUser={currentUser} handleDeleteUser={handleDeleteUser} closeModal={closeDeleteModal} />}
    </div>
  );
};

export default DashboardUsers;
