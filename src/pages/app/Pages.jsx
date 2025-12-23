import React, { useEffect, useState } from "react";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";
import axios from "../../axios"
import { ChevronLeft, ChevronRight } from "lucide-react";

const Pages = () => {
  const [pages, setPages] = useState([]);
  const [filteredPages, setFilteredPages] = useState([]);
  const [pagination, setPagination] = useState(null);

  const [modal, setModal] = useState({ type: null, pageId: null });
  const [filter, setFilter] = useState("all");

  const [loading, setLoading] = useState(true);

  // ------------------------------------------
  // FETCH PAGES API
  // ------------------------------------------
  const fetchPages = async (page = 1) => {
    try {
      setLoading(true);

      const res = await axios.get(`/pages?page=${page}`);

      if (res.data.success) {
        setPages(res.data.data);
        setPagination(res.data.pagination);
        setFilteredPages(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching pages:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  // ------------------------------------------
  // FILTER BY TYPE (all / knowledge / posts)
  // Matches API `contentType`
  // ------------------------------------------
  const applyFilter = (selected) => {
    setFilter(selected);

    if (selected === "all") {
      setFilteredPages(pages);
    } else {
      setFilteredPages(
        pages.filter((p) =>
          selected === "posts"
            ? p.contentType === "post"
            : p.contentType === "knowledge"
        )
      );
    }
  };

  // ------------------------------------------
  // Modal controls
  // ------------------------------------------
  const openModal = (type, id) => {
    setModal({ type, pageId: id });
  };

  const closeModal = () => {
    setModal({ type: null, pageId: null });
  };

  const currentPage = pages.find((p) => p._id === modal.pageId);

  const handleDelete = () => {
    setPages(pages.filter((p) => p._id !== modal.pageId));
    applyFilter(filter); // Reapply filter after deletion
    closeModal();
  };

  // ------------------------------------------
  // Skeleton Loader
  // ------------------------------------------
  const SkeletonCard = () => (
    <div className="bg-white border border-gray-200 shadow-sm rounded-2xl px-5 py-5 animate-pulse h-[260px]">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
        <div className="space-y-2 w-full">
          <div className="h-4 bg-gray-300 w-3/4 rounded"></div>
          <div className="h-3 bg-gray-200 w-1/2 rounded"></div>
        </div>
      </div>

      <div className="h-4 bg-gray-300 mt-4 rounded w-full"></div>
      <div className="h-4 bg-gray-300 mt-2 rounded w-5/6"></div>

      <div className="flex gap-2 mt-3">
        <div className="w-10 h-4 bg-gray-200 rounded"></div>
        <div className="w-10 h-4 bg-gray-200 rounded"></div>
      </div>

      <div className="w-full h-10 bg-gray-300 rounded-lg mt-6"></div>
    </div>
  );

  return (
    <div className="p-6 pt-0 text-black min-h-screen ">

      {/* HEADER WITH FILTER */}
     <div className="relative rounded-xl p-8 bg-white shadow-xl border border-[#DE4B12] mt-6 
    flex flex-col md:flex-row md:items-center md:justify-between gap-6">

  {/* Left: Title */}
  <h1 className="text-2xl md:text-3xl font-bold text-[#DE4B12]">
    Page Management
  </h1>

  {/* Right: Filter Buttons */}
  {/* <div className="flex items-center justify-end">
    {["all", "knowledge", "posts"].map((type, index) => {
      const isActive = filter === type;
      const isFirst = index === 0;
      const isLast = index === 2;

      return (
        <button
          key={type}
          onClick={() => applyFilter(type)}
          className={`
            px-4 py-2 font-medium transition shadow-sm border-2
            ${isFirst ? "rounded-l-lg" : ""}
            ${isLast ? "rounded-r-lg" : ""}
            ${!isFirst && !isLast ? "border-l-0 border-r-0" : ""}
            ${index > 0 ? "-ml-[1px]" : ""}
            ${
              isActive
                ? "bg-[#DE4B12] text-white border-[#DE4B12]"
                : "bg-white border-[#DE4B12] text-[#DE4B12] hover:bg-[#DE4B12]/10"
            }
          `}
        >
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </button>
      );
    })}
  </div> */}
</div>


      {/* PAGES GRID */}
   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
  {loading
    ? Array(6)
        .fill(0)
        .map((_, i) => <SkeletonCard key={i} />)
    : filteredPages.map((page) => (
        <div
          key={page._id}
          className="bg-white border border-[#DE4B12] shadow-lg rounded-xl p-5 hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          {/* Card Header */}
          <div className="flex items-center gap-4 mb-5">
            <img
              src={
                page.image ||
                "https://placehold.co/600x400?text=No+Image"
              }
              alt="page icon"
              className="w-16 h-16 rounded-lg object-contain border border-gray-400 shadow-md"
            />
            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-[#DE4B12]">{page.name}</h2>
              <p className="text-sm text-gray-500">
                By {page.user?.name || "Unknown"}
              </p>
            </div>
          </div>

          {/* Card Body (Description) */}
          <p className="text-lg text-gray-700 mt-3 line-clamp-3">
            {page.about}
          </p>

          {/* Tags Section */}
          <div className="flex flex-wrap gap-3 mt-4">
            {page.keywords?.map((tag, i) => (
              <span
                key={i}
                className="bg-[#FFFAF2] text-[#DE4B12] py-1 px-3 rounded-full text-sm font-medium"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Card Footer (Followers + View Button) */}
          <div className="flex justify-between items-center mt-5">
            {/* Followers Count */}
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-[#DE4B12]">{page.followersCount}</span>
              <span className="text-sm text-gray-500">Followers</span>
            </div>

            {/* View Button */}
            <button
              onClick={() => openModal("view", page._id)}
              className="px-4 py-2 bg-[#DE4B12] text-white rounded-full text-sm font-medium hover:bg-[#FFA500] transition"
            >
              View Details
            </button>
          </div>
        </div>
      ))}
</div>


      {/* PAGINATION */}
      {!loading && pagination && (
        <div className="flex justify-end mt-10 gap-2">
          {/* Prev */}
          <button
            onClick={() =>
              pagination.currentPage > 1 &&
              fetchPages(pagination.currentPage - 1)
            }
            className="p-2 rounded-full border border-gray-300 text-gray-600 hover:bg-orange-400 hover:text-white transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Pages */}
          {Array.from({ length: pagination.totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => fetchPages(i + 1)}
              className={`px-3 py-1.5 rounded-xl border text-sm transition ${
                pagination.currentPage === i + 1
                  ? "bg-orange-400 text-white shadow-md border-orange-400"
                    : "text-gray-600 border-gray-300 hover:bg-gray-100"
                }`}
            >
              {i + 1}
            </button>
          ))}

          {/* Next */}
          <button
            onClick={() =>
              pagination.currentPage < pagination.totalPages &&
              fetchPages(pagination.currentPage + 1)
            }
            className="p-2 rounded-full border border-gray-300 text-gray-600 hover:bg-orange-400 hover:text-white transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* MODAL */}
      {modal.type && currentPage && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-6">
          <div className="bg-white border border-orange-400 rounded-xl max-w-md w-full p-6 relative">
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-2xl font-bold"
            >
              ×
            </button>

            {/* View Modal */}
          {modal.type === "view" && (
  <>
    <h2 className="text-2xl font-bold text-orange-500 mb-4">
      Page Details  
    </h2>

    {/* PAGE IMAGE */}
    <img
      src={
        currentPage.image ||
        "https://placehold.co/600x400?text=No+Image"
      }
      alt="Page"
      className="w-full h-48 object-contain rounded-xl border mb-4 shadow-md"
    />

   

    {/* PAGE NAME + ABOUT */}
    <p className="font-bold text-lg">{currentPage.name}</p>
    <p className="text-sm text-gray-600">{currentPage.about}</p>
     {/* USER */}
    <div className="flex items-center mb-4 mt-2">
      <img
        src={
          currentPage.user?.profilePicture ||
          "https://placehold.co/200x200?text=User"
        }
        className="w-12 h-12 rounded-full object-cover mr-3"
      />
      <p className="font-semibold">{currentPage.user?.name}</p>
    </div>

    {/* TOPIC */}
    <p className="mt-4 text-orange-500">
      Topic: {currentPage.topic}
    </p>

    {/* KEYWORDS */}
    <div className="flex flex-wrap gap-2 mt-3">
      {currentPage.keywords?.map((tag, i) => (
        <span key={i} className="bg-gray-200 px-2 py-1 rounded-lg text-xs">
          {tag}
        </span>
      ))}
    </div>
     <div className="flex items-center gap-2 mt-2">
              <span className="text-xl font-bold text-[#DE4B12]">{currentPage.followersCount}</span>
              <span className="text-sm text-gray-500">Followers</span>
            </div>

    {/* DELETE BUTTON */}
    {/* <div className="flex justify-end mt-6">
      <button
        onClick={() => openModal("delete", currentPage._id)}
        className="px-4 py-2 bg-red-500 text-white rounded-xl"
      >
        Delete
      </button>
    </div> */}
  </>
)}


            {/* Delete Modal */}
            {modal.type === "delete" && (
              <>
                <h2 className="text-2xl font-bold text-red-500 mb-3">
                  Delete Page
                </h2>
                <p>Are you sure you want to delete this page?</p>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 border rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-500 text-white rounded-xl"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Pages;
