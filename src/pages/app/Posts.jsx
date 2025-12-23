import React, { useState, useEffect } from "react";
import axios from "../../axios";
import { FaHeart, FaComment } from "react-icons/fa";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);

  // New Filters
  const [type, setType] = useState("post"); // "post" | "knowledge"
  const [search, setSearch] = useState("");

  const [menuOpenId, setMenuOpenId] = useState(null);
  const [modal, setModal] = useState({ type: null, postId: null });

  // ------------------------------------------------------------------
  // FETCH POSTS BASED ON TYPE + SEARCH
  // ------------------------------------------------------------------
  const fetchPosts = async (page = 1) => {
    try {
      setLoading(true);

      const res = await axios.get(
        `/pages/all?type=${type}&page=${page}&limit=10&search=${search}`
      );

      if (res.data.success) {
        setPosts(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch on type or search change
  useEffect(() => {
    fetchPosts(1);
  }, [type, search]);

  // initial load
  useEffect(() => {
    fetchPosts(1);
  }, []);

  // ------------------------------------------------------------------
  // CLOSE MENU ON OUTSIDE CLICK
  // ------------------------------------------------------------------
  useEffect(() => {
    function handleClickOutside(event) {
      if (!event.target.closest("[data-menu-toggle]")) {
        setMenuOpenId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const openModal = (type, postId) => {
    setModal({ type, postId });
  };

  const closeModal = () => {
    setModal({ type: null, postId: null });
  };

  const currentPost = posts.find((post) => post._id === modal.postId);

  // ------------------------------------------------------------------
  // CAROUSEL
  // ------------------------------------------------------------------
  const Carousel = ({ media }) => {
    const [index, setIndex] = useState(0);

    if (!media || media.length === 0) return null;

    const next = (e) => {
      e.stopPropagation();
      setIndex((prev) => (prev + 1) % media.length);
    };

    const prev = (e) => {
      e.stopPropagation();
      setIndex((prev) => (prev - 1 + media.length) % media.length);
    };

    return (
      <div className="relative w-full h-60 overflow-hidden rounded-xl bg-gray-50">
        <img
          src={media[index].fileUrl}
          className="w-full h-full object-contain transition-all duration-300"
        />

        {media.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full"
            >
              ‹
            </button>

            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full"
            >
              ›
            </button>

            <div className="absolute bottom-2 w-full flex justify-center gap-1">
              {media.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    i === index ? "bg-white" : "bg-white/40"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  // ------------------------------------------------------------------
  // SKELETON
  // ------------------------------------------------------------------
  const SkeletonCard = () => (
    <div className="bg-white rounded-2xl shadow border border-gray-200 p-4 animate-pulse">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
        <div>
          <div className="h-3 w-32 bg-gray-300 rounded mb-2"></div>
          <div className="h-3 w-20 bg-gray-200 rounded"></div>
        </div>
      </div>

      <div className="w-full h-56 bg-gray-300 rounded-lg mb-4"></div>
      <div className="h-3 w-full bg-gray-300 rounded mb-2"></div>
      <div className="h-3 w-3/4 bg-gray-300 rounded mb-4"></div>

      <div className="flex justify-between">
        <div className="h-3 w-16 bg-gray-300 rounded"></div>
        <div className="h-3 w-16 bg-gray-300 rounded"></div>
      </div>
    </div>
  );

  // ------------------------------------------------------------------
  // UI
  // ------------------------------------------------------------------
  return (
    <div className="p-6 pt-0 text-black min-h-screen bg-white">
     <div className="flex items-center justify-between p-8 rounded-2xl bg-white shadow-xl border border-[#E56F41]/40">
  
  {/* LEFT: Title */}
  <h1 className="text-4xl font-bold text-[#DE4B12]">
    Posts Management
  </h1>

  {/* RIGHT: Filters */}
 <div className="flex">
  {/* LEFT BUTTON */}
  <button
    className={`px-5 py-2 font-medium border border-gray-300 
      ${type === "post" ? "bg-[#DE4B12] text-white" : "bg-gray-200 text-gray-700"} 
      rounded-l-xl rounded-r-none
    `}
    onClick={() => setType("post")}
  >
    Regular Posts
  </button>

  {/* RIGHT BUTTON */}
  <button
    className={`px-5 py-2 font-medium border border-gray-300 
      ${type === "knowledge" ? "bg-[#DE4B12] text-white" : "bg-gray-200 text-gray-700"} 
      rounded-r-xl rounded-l-none
    `}
    onClick={() => setType("knowledge")}
  >
    Knowledge Pages
  </button>
</div>

</div>



      {/* SEARCH */}
  <div className="mt-6 w-full flex justify-end">
  <div className="w-full max-w-md relative">
    {/* Lucide Search Icon */}
    <Search
      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
      size={20}
    />

    <input
      type="text"
      placeholder="Search posts..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="
        w-full pl-12 pr-4 py-3
        bg-white border border-gray-300 
        rounded-xl shadow-sm
        text-gray-700 placeholder-gray-400
        focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400
        transition-all
      "
    />
  </div>
</div>


      {/* POSTS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {loading
          ? Array(6)
              .fill(0)
              .map((_, i) => <SkeletonCard key={i} />)
          : posts.map((post) => (
              <div
                key={post._id}
                className="bg-white cursor-pointer rounded-2xl border border-gray-200 p-3 hover:bg-gray-50 transition"
                onClick={() => openModal("view", post._id)}
              >
                {/* USER */}
                <div className="flex items-center space-x-3 mb-3">
                  <img
                    src={
                      post.user?.profilePicture ||
                      "https://placehold.co/600x400?text=No+Image"
                    }
                    alt={post.user?.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />

                  <p className="font-semibold">{post.user?.name}</p>
                </div>

                {/* MEDIA */}
                {post.image ? (
                  <img
                    src={post.image}
                    className="w-full h-60 object-contain rounded-xl border"
                    alt="post"
                  />
                ) : (
                  <img
                    src="https://placehold.co/600x400?text=No+Image"
                    className="w-full h-60 object-contain rounded-xl border"
                  />
                )}

                {/* TEXT */}
{/* ABOUT / CAPTION */}
<p className="text-sm text-gray-700 mt-3">
  {post.about || "No description."}
</p>

{/* TOPIC */}
{post.topic && (
  <p className="text-xs text-gray-500 mt-2">
    <span className="font-semibold text-gray-700">Topic:</span> {post.topic}
  </p>
)}

{/* SUBTOPICS */}
{post.subTopic?.length > 0 && (
  <p className="text-xs text-gray-500">
    <span className="font-semibold text-gray-700">Subtopics:</span>{" "}
    {post.subTopic.join(", ")}
  </p>
)}

{/* KEYWORDS (hashtags) */}
{post.keywords?.length > 0 && (
  <div className="flex flex-wrap gap-1 mt-2">
    {post.keywords.map((tag, index) => (
      <span
        key={index}
        className="text-xs font-medium bg-orange-100 text-orange-600 px-2 py-1 rounded-lg"
      >
        {tag}
      </span>
    ))}
  </div>
)}

{/* CREATED AT */}
<p className="text-xs text-gray-400 mt-2">
  Created: {new Date(post.createdAt).toLocaleDateString()}
</p>


                {/* STATS */}
                <div className="flex justify-between items-center text-sm text-gray-400">
                  <div className="flex items-center space-x-2">
                    <FaHeart className="text-red-500" />
                    <span>{post.followersCount}</span>
                  </div>
                </div>
              </div>
            ))}
      </div>

      {/* PAGINATION */}
      {!loading && pagination && (
  <div className="flex justify-end mt-8 gap-2 items-center">
    
    {/* PREVIOUS BUTTON */}
    <button
      onClick={() => fetchPosts(pagination.currentPage - 1)}
      disabled={pagination.currentPage === 1}
      className={`p-2 rounded-full border border-gray-300 text-gray-600 hover:bg-orange-400 hover:text-white transition
        ${
          pagination.currentPage === 1
            ? "text-gray-300 border-gray-300 cursor-not-allowed"
            : "text-orange-400 border-orange-400 hover:bg-orange-100"
        }`}
    >
            <ChevronLeft className="w-4 h-4" />
    </button>

    {/* PAGE NUMBERS */}
    {Array.from({ length: pagination.totalPages }, (_, i) => {
      const page = i + 1;
      return (
        <button
          key={page}
          onClick={() => fetchPosts(page)}
          className={`px-3 py-1.5 rounded-xl border text-sm transition
            ${
              page === pagination.currentPage
                ? "bg-orange-400 text-white shadow-md border-orange-400"
                    : "text-gray-600 border-gray-300 hover:bg-gray-100"
                }`}
        >
          {page}
        </button>
      );
    })}

    {/* NEXT BUTTON */}
    <button
      onClick={() => fetchPosts(pagination.currentPage + 1)}
      disabled={pagination.currentPage === pagination.totalPages}
      className={`p-2 rounded-full border border-gray-300 text-gray-600 hover:bg-orange-400 hover:text-white transition
        ${
          pagination.currentPage === pagination.totalPages
            ? "text-gray-300 border-gray-300 cursor-not-allowed"
            : "text-orange-400 border-orange-400 hover:bg-orange-100"
        }`}
    >
            <ChevronRight className="w-4 h-4" />
    </button>

  </div>
)}


      {/* VIEW MODAL */}
      {modal.type === "view" && currentPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="bg-white border border-orange-400 rounded-xl max-w-md w-full p-6 text-black relative">
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-gray-400 hover:text-black text-xl font-bold"
            >
              ×
            </button>

            <h2 className="text-2xl font-semibold mb-4 text-orange-400">
              Page Details
            </h2>

            <img
              src={currentPost.image}
              className="w-full h-60 object-contain rounded-xl border mb-4"
            />

            <p className="text-xl font-bold">{currentPost.name}</p>

  {/* ABOUT */}
  <p className="text-sm text-gray-600 mt-2 mb-2">
    {currentPost.about || "No description available."}
  </p>

  {/* TOPIC */}
  {currentPost.topic && (
    <p className="text-sm text-gray-700">
      <span className="font-semibold">Topic:</span> {currentPost.topic}
    </p>
  )}

  {/* SUBTOPICS */}
  {currentPost.subTopic?.length > 0 && (
    <p className="text-sm text-gray-700">
      <span className="font-semibold">Subtopics:</span>{" "}
      {currentPost.subTopic.join(", ")}
    </p>
  )}

  {/* KEYWORDS */}
  {currentPost.keywords?.length > 0 && (
    <div className="flex flex-wrap gap-2 mt-3">
      {currentPost.keywords.map((tag, i) => (
        <span
          key={i}
          className="bg-orange-100 text-orange-600 px-2 py-1 rounded-md text-xs font-medium"
        >
          {tag}
        </span>
      ))}
    </div>
  )}

  {/* CREATED AT */}
  <p className="text-sm text-gray-500 mt-3">
    <span className="font-semibold text-gray-700">Created:</span>{" "}
    {new Date(currentPost.createdAt).toLocaleString()}
  </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Posts;
