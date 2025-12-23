import React, { useState, useEffect } from "react";
import { FaUserFriends } from "react-icons/fa";
import axios from "../../axios";

const Collections = () => {
  const [collections, setCollections] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeCollection, setActiveCollection] = useState(null);

  // Fetch collections with pagination using axios
  const fetchCollections = async (page = 1) => {
    try {
      const response = await axios.get(`/collections?page=${page}&limit=6`);
      const data = response.data;

      if (data.success) {
        setCollections(data.data);
        setTotalPages(data.pagination.totalPages);
      } else {
        console.error("Failed to fetch collections", data.message);
      }
    } catch (error) {
      console.error("Error fetching collections:", error);
    }
  };

  // Fetch collections when component mounts or page changes
  useEffect(() => {
    fetchCollections(currentPage);
  }, [currentPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleViewDetails = (collection) => {
    setActiveCollection(collection);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="relative p-6 rounded-2xl bg-white shadow-xl border border-[#E56F41]/40">
        <h1 className="text-3xl font-bold text-[#DE4B12]">Collections</h1>
      </div>

      {/* Collections Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
        {collections.length === 0 ? (
          <div className="col-span-full text-center text-lg font-semibold text-gray-500">
            No collections available
          </div>
        ) : (
          collections.map((collection) => (
            <div
              key={collection._id}
              className="bg-white rounded-xl shadow-lg p-4 hover:shadow-xl transition-all relative"
            >
              {/* Collection Image */}
              <img
                src={collection.image}
                alt={collection.name}
                className="w-full h-40 object-cover rounded-lg mb-4"
              />

              {/* Collection Info */}
              <h2 className="text-lg font-semibold mb-2 text-gray-800">{collection.name}</h2>
              <p className="text-gray-600 text-sm mb-2">
                Created: {new Date(collection.createdAt).toLocaleDateString()}
              </p>

              {/* Pages */}
              {collection.pages.slice(0, 2).map((page) => ( // Only display 2 pages to keep it compact
                <div
                  key={page._id}
                  className="border border-gray-200 rounded-lg p-3 mb-4 bg-gray-50"
                >
                  <div className="flex items-center mb-2">
                    <img
                      src={page.image || 'https://via.placeholder.com/48'}
                      alt={page.name}
                      className="w-10 h-10 rounded-full object-cover mr-3"
                    />
                    <div>
                      <p className="font-semibold text-gray-700">{page.name}</p>
                      <p className="text-gray-500 text-sm">{page.topic}</p>
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm mb-2">{page.about}</p>
                  <div className="flex items-center text-gray-500 text-sm">
                    <FaUserFriends className="mr-1" /> {page.followersCount} followers
                  </div>
                </div>
              ))}
              
              {/* View Details Button */}
              <button
                onClick={() => handleViewDetails(collection)}
                className="absolute bottom-4 right-4  bg-[#DE4B12] text-white py-2 px-4 rounded-lg shadow-md hover:bg-[#bf3e0a]"
              >
                View Details
              </button>
            </div>
          ))
        )}
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center mt-8">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 mx-2 text-sm bg-gray-300 rounded-lg disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-sm">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 mx-2 text-sm bg-gray-300 rounded-lg disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {/* Show active collection details in a modal */}
      {activeCollection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full">
            <h2 className="text-2xl font-bold text-gray-800">{activeCollection.name}</h2>
            <p className="text-gray-600 text-sm mb-2">
              Created: {new Date(activeCollection.createdAt).toLocaleDateString()}
            </p>
            {activeCollection.pages.map((page) => (
              <div key={page._id} className="border border-gray-200 rounded-lg p-3 mb-4 bg-gray-50">
                <div className="flex items-center mb-2">
                  <img
                    src={page.image || 'https://via.placeholder.com/48'}
                    alt={page.name}
                    className="w-10 h-10 rounded-full object-cover mr-3"
                  />
                  <div>
                    <p className="font-semibold text-gray-700">{page.name}</p>
                    <p className="text-gray-500 text-sm">{page.topic}</p>
                  </div>
                </div>
                <p className="text-gray-700 text-sm mb-2">{page.about}</p>
                <div className="flex items-center text-gray-500 text-sm">
                  <FaUserFriends className="mr-1" /> {page.followersCount} followers
                </div>
              </div>
            ))}
            <button
              onClick={() => setActiveCollection(null)}
              className="mt-4 bg-[#DE4B12] text-white py-2 px-4 rounded-lg hover:bg-[#bf3e0a]"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Collections;
