import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Coins } from "lucide-react";
import { FaEye, FaPlusCircle, FaChevronRight, FaChevronLeft } from "react-icons/fa";
import axios from "../../axios";

// API Function to Fetch Rewards using Axios with Pagination
const fetchRewards = async (page = 1, limit = 10) => {
  try {
    const response = await axios.get('/affiliate', {
      params: { page, limit },
    });
    if (response.data.success) {
      return {
        rewards: response.data.data.rewards,
        totalItems: response.data.pagination.totalItems,
        totalPages: response.data.pagination.totalPages,
      };
    } else {
      throw new Error("Failed to fetch rewards");
    }
  } catch (error) {
    console.error("Error fetching rewards:", error);
    return { rewards: [], totalItems: 0, totalPages: 0 };
  }
};

// API Function to Create a Reward
const createReward = async (formData) => {
  try {
    const response = await axios.post('/affiliate', formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error("Failed to create reward");
    }
  } catch (error) {
    console.error("Error creating reward:", error);
    return null;
  }
};

// API Function to Delete Reward
const deleteReward = async (id) => {
  try {
    const res = await axios.delete(`/affiliate/${id}`);
    return res.data.success;
  } catch (error) {
    console.error("Delete failed:", error);
    return false;
  }
};

const Rewards = () => {
  const navigate = useNavigate();

  const [rewards, setRewards] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [rewardName, setRewardName] = useState("");
  const [rewardCoins, setRewardCoins] = useState("");
  const [rewardImage, setRewardImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [icon, setIcon] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
const [isCreatingLoading, setIsCreatingLoading] = useState(false);


  // Delete states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [rewardToDelete, setRewardToDelete] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const { rewards: fetchedRewards, totalItems, totalPages } = await fetchRewards(currentPage);
      setRewards(fetchedRewards);
      setTotalPages(totalPages);
      setLoading(false);
    };

    fetchData();
  }, [currentPage]);

  const handleCreateReward = async () => {
    if (!rewardName || !rewardCoins) {
      alert("Please provide all details");
      return;
    }

    const formData = new FormData();
    formData.append("name", rewardName);
    formData.append("coins", rewardCoins);

    if (icon) {
      formData.append("image", icon);
    }

    const createdReward = await createReward(formData);

    if (createdReward) {
      setRewards([...rewards, createdReward]);
      setRewardName("");
      setRewardCoins("");
      setRewardImage("");
      setIcon("");
      setIsCreating(false);
    } else {
      alert("Failed to create the reward. Please try again.");
    }
  };

  const handlePageChange = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  // Skeleton Loader
  const SkeletonLoader = () => (
    <div className="relative p-6 pt-8 mt-20 border rounded-xl border-[#DE4B12]/40 animate-pulse">
      <div className="pt-12 text-center">
        <div className="w-32 h-4 bg-gray-300 rounded-md mb-2" />
        <div className="w-24 h-4 bg-gray-300 rounded-md mx-auto" />
      </div>
    </div>
  );

  if (loading) {
    return <SkeletonLoader />;
  }

  return (
    <div className="p-4 pt-2 space-y-8 min-h-screen text-black">
      {/* Header */}
      <div className="relative p-8 rounded-2xl bg-white shadow-xl border border-[#E56F41]/40">
        <h1 className="text-4xl font-bold text-[#DE4B12]">Rewards Management</h1>
        <p className="text-gray-500 mt-1 text-sm">Manage and create new rewards.</p>
      </div>

      {/* Rewards List */}
      <div className="bg-white p-8 rounded-2xl shadow border border-[#DE4B12]/30">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-xl font-semibold text-[#DE4B12]">Rewards List</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-14 p-6 pt-8 border rounded-xl gap-3">
          {rewards.length === 0 ? (
            <div className="col-span-full text-center text-lg font-semibold text-gray-500">
              No rewards available
            </div>
          ) : (
            rewards.map((reward) => (
              <div
                key={reward._id}
                className="relative p-6 pt-8 border rounded-xl border-[#DE4B12]/40 hover:bg-[#FFF4EB] hover:shadow-xl transition cursor-pointer"
              >
                {/* DELETE BUTTON */}
                <button
                  className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-md text-xs hover:bg-red-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    setRewardToDelete(reward._id);
                    setIsDeleteModalOpen(true);
                  }}
                >
       Delete
                </button>

                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                  <img
                    src={reward.icon}
                    alt={reward.name}
                    className="w-24 h-24 rounded-lg transform scale-110 z-10"
                  />
                </div>

                <div className="pt-12 text-center">
                  <p className="font-bold text-lg">{reward.name}</p>
                  <p className="text-sm text-gray-600 mt-2 flex justify-center items-center gap-2">
                    <Coins className="w-5 h-5 text-[#DE4B12]" /> {reward.coins} Coins
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center mt-4 gap-3">
          <button
            className="p-2 rounded-full border border-[#DE4B12] hover:bg-[#DE4B12] hover:text-white transition"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <FaChevronLeft />
          </button>

          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              className={`px-3 py-1 rounded-lg border border-[#DE4B12] text-sm transition ${
                index + 1 === currentPage
                  ? "bg-[#DE4B12] text-white"
                  : "text-[#DE4B12] hover:bg-[#FEF1E1]"
              }`}
              onClick={() => handlePageChange(index + 1)}
            >
              {index + 1}
            </button>
          ))}

          <button
            className="p-2 rounded-full border border-[#DE4B12] hover:bg-[#DE4B12] hover:text-white transition"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <FaChevronRight />
          </button>
        </div>
      </div>

      {/* Create Reward Button */}
      <button
        onClick={() => setIsCreating(true)}
        className="fixed bottom-8 right-8 p-4 rounded-full bg-[#DE4B12] text-white hover:bg-[#FFA500] transition"
      >
        <FaPlusCircle size={24} />
      </button>

      {/* Create Reward Modal */}
      {isCreating && (
        <div className="fixed -inset-14 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-96">
            <h3 className="text-lg font-semibold mb-4 text-[#DE4B12]">Create New Reward</h3>

            <input
              type="text"
              placeholder="Reward Name"
              value={rewardName}
              onChange={(e) => setRewardName(e.target.value)}
              className="p-3 border w-full border-[#DE4B12]/50 rounded-xl focus:outline-none"
            />

            <input
              type="number"
              placeholder="Coins Required"
              value={rewardCoins}
              onChange={(e) => setRewardCoins(e.target.value)}
              className="p-3 border w-full mt-2 border-[#DE4B12]/50 rounded-xl focus:outline-none"
            />

            <div className="flex flex-col items-center space-y-3 mb-4 mt-2">
              <label className="text-sm font-medium text-[#DE4B12]">Reward Image</label>

              <div className="w-32 h-32 bg-gray-100 rounded-xl border border-[#DE4B12]/30 flex items-center justify-center overflow-hidden">
                {rewardImage ? (
                  <img src={rewardImage} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-gray-400 text-sm">No image</span>
                )}
              </div>

              <label className="cursor-pointer bg-[#DE4B12] text-white py-2 px-4 rounded-xl hover:bg-[#FFA500] transition">
                Choose Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    setRewardImage(URL.createObjectURL(e.target.files[0]));
                    setIcon(e.target.files[0]);
                  }}
                  className="hidden"
                />
              </label>
            </div>

           <button
  onClick={async () => {
    setIsCreatingLoading(true);
    await handleCreateReward();
    setIsCreatingLoading(false);
  }}
  disabled={isCreatingLoading}
  className={`w-full bg-[#DE4B12] text-white font-semibold py-2 rounded-xl transition 
    ${isCreatingLoading ? "opacity-60 cursor-not-allowed" : "hover:bg-[#FFA500]"}`}
>
  {isCreatingLoading ? (
    <span className="flex justify-center items-center gap-2">
      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      Creating...
    </span>
  ) : (
    <>
      <FaPlusCircle className="inline-block mr-2 mb-1" /> Create Reward
    </>
  )}
</button>


            <button
              onClick={() => setIsCreating(false)}
              className="mt-4 w-full text-center text-[#DE4B12] hover:text-[#FFA500] transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && (
        <div className="fixed -inset-14 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl w-80 text-center shadow-xl">
            <h3 className="text-lg font-semibold text-red-600 mb-3">
              Delete Reward?
            </h3>
            <p className="text-gray-600 mb-5">This action cannot be undone.</p>

           <button
  className={`w-full bg-red-600 text-white py-2 rounded-xl mb-3 transition 
    ${isDeleting ? "opacity-60 cursor-not-allowed" : "hover:bg-red-700"}`}
  disabled={isDeleting}
  onClick={async () => {
    setIsDeleting(true);

    const success = await deleteReward(rewardToDelete);

    if (success) {
      setRewards(rewards.filter((r) => r._id !== rewardToDelete));
      setIsDeleteModalOpen(false);
    } else {
      alert("Failed to delete reward.");
    }

    setIsDeleting(false);
  }}
>
  {isDeleting ? (
    <span className="flex justify-center items-center gap-2">
      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      Deleting...
    </span>
  ) : (
    "Confirm Delete"
  )}
</button>


            <button
              className="w-full text-gray-600 hover:text-black transition"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rewards;
