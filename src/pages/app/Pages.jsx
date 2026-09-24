/* eslint-disable react/prop-types */
import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  AlertTriangle,
  Loader2,
  BookOpen,
  FileText,
  RefreshCw,
  Eye,
  MessageSquare,
  Heart,
  Share2,
  Users as UsersIcon,
  ArrowLeft,
  Globe,
  Lock,
  Tag,
  ExternalLink,
  ChevronDown,
  Image as ImageIcon,
  Trash2,
  RotateCcw,
} from "lucide-react";
import {
  getAdminPages,
  getAdminPagePosts,
  getAdminPagePost,
  getAdminPagePostComments,
} from "../../services/adminPageService";
import {
  deleteAdminPost,
  recoverAdminPost,
} from "../../services/adminPostService";
import { SuccessToast, ErrorToast } from "../../components/global/Toaster";
import UserAvatar from "../../components/common/UserAvatar";

const PageAvatar = ({ src, name, size = "w-12 h-12 text-lg" }) => {
  const [error, setError] = useState(false);

  if (src && !error) {
    return (
      <img
        src={src}
        alt={name || "Page"}
        onError={() => setError(true)}
        className={`${size} rounded-full object-cover border border-gray-200 flex-shrink-0 shadow-sm`}
      />
    );
  }

  return (
    <div
      className={`${size} rounded-full bg-orange-100 text-[#DE4B12] flex items-center justify-center flex-shrink-0 font-bold border border-orange-200 shadow-sm`}
    >
      {name ? name.charAt(0).toUpperCase() : "P"}
    </div>
  );
};

const Pages = () => {
  const navigate = useNavigate();

  // Pages List State
  const [pages, setPages] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    totalPages: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Filters & Search
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [contentTypeFilter, setContentTypeFilter] = useState("all");
  const [pageTypeFilter, setPageTypeFilter] = useState("all");

  // Selected Page Detail / Posts View
  const [selectedPage, setSelectedPage] = useState(null);
  const [pagePosts, setPagePosts] = useState([]);
  const [postsPagination, setPostsPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    totalPages: 0,
  });
  const [isPostsLoading, setIsPostsLoading] = useState(false);
  const [postsSearch, setPostsSearch] = useState("");
  const [debouncedPostsSearch, setDebouncedPostsSearch] = useState("");
  const [expandedComments, setExpandedComments] = useState({});

  const toggleComments = (postId) => {
    setExpandedComments((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  // Post Delete / Recover Action Modal
  const [postActionModal, setPostActionModal] = useState({
    isOpen: false,
    post: null,
    action: "delete", // "delete" | "recover"
    loading: false,
  });

  const handleOpenPostAction = (post, action) => {
    setPostActionModal({
      isOpen: true,
      post,
      action,
      loading: false,
    });
  };

  const handleConfirmPostAction = async () => {
    if (!postActionModal.post) return;
    const { post, action } = postActionModal;
    try {
      setPostActionModal((prev) => ({ ...prev, loading: true }));
      if (action === "delete") {
        const res = await deleteAdminPost(post._id);
        if (res && res.success) {
          SuccessToast(res.message || "Post deleted successfully");
          setPagePosts((prev) =>
            prev.map((p) =>
              p._id === post._id ? { ...p, isDeleted: true } : p
            )
          );
          if (activePostModal && activePostModal._id === post._id) {
            setActivePostModal((prev) => ({ ...prev, isDeleted: true }));
          }
        } else {
          ErrorToast(res?.message || "Failed to delete post");
        }
      } else {
        const res = await recoverAdminPost(post._id);
        if (res && res.success) {
          SuccessToast(res.message || "Post restored successfully");
          setPagePosts((prev) =>
            prev.map((p) =>
              p._id === post._id ? { ...p, isDeleted: false } : p
            )
          );
          if (activePostModal && activePostModal._id === post._id) {
            setActivePostModal((prev) => ({ ...prev, isDeleted: false }));
          }
        } else {
          ErrorToast(res?.message || "Failed to recover post");
        }
      }
      setPostActionModal({
        isOpen: false,
        post: null,
        action: "delete",
        loading: false,
      });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        `Failed to ${action} post`;
      ErrorToast(msg);
      setPostActionModal((prev) => ({ ...prev, loading: false }));
    }
  };

  // Post Detail & Comments Modal
  const [activePostModal, setActivePostModal] = useState(null);
  const [isPostDetailLoading, setIsPostDetailLoading] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentsPagination, setCommentsPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    totalPages: 0,
  });
  const [isCommentsLoading, setIsCommentsLoading] = useState(false);
  const [commentsSearch, setCommentsSearch] = useState("");
  const [debouncedCommentsSearch, setDebouncedCommentsSearch] = useState("");

  // Debounced search for pages
  const searchTimeoutRef = useRef(null);
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchInput(val);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(val);
      setPagination((prev) => ({ ...prev, currentPage: 1 }));
    }, 350);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setDebouncedSearch("");
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  // Fetch Pages List
  const fetchPages = useCallback(
    async (page = 1) => {
      try {
        setIsLoading(true);
        setFetchError(null);

        const res = await getAdminPages({
          page,
          limit: 10,
          search: debouncedSearch,
          contentType: contentTypeFilter,
          pageType: pageTypeFilter,
        });

        if (res && res.success) {
          setPages(res.data || []);
          setPagination(
            res.pagination || {
              currentPage: page,
              itemsPerPage: 10,
              totalItems: (res.data || []).length,
              totalPages: 1,
            }
          );
        } else {
          setFetchError(res?.message || "Failed to load pages");
        }
      } catch (err) {
        console.error("Error fetching pages:", err);
        const safeMessage =
          err?.response?.data?.message ||
          err?.message ||
          "Unable to load pages. Please check your connection.";
        setFetchError(safeMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [debouncedSearch, contentTypeFilter, pageTypeFilter]
  );

  useEffect(() => {
    if (!selectedPage) {
      fetchPages(pagination.currentPage);
    }
  }, [fetchPages, selectedPage, pagination.currentPage]);

  // Fetch Posts for Selected Page
  const postsSearchTimeoutRef = useRef(null);
  const handlePostsSearchChange = (e) => {
    const val = e.target.value;
    setPostsSearch(val);
    if (postsSearchTimeoutRef.current) clearTimeout(postsSearchTimeoutRef.current);
    postsSearchTimeoutRef.current = setTimeout(() => {
      setDebouncedPostsSearch(val);
      setPostsPagination((prev) => ({ ...prev, currentPage: 1 }));
    }, 350);
  };

  const fetchPagePosts = useCallback(
    async (page = 1) => {
      if (!selectedPage?._id) return;
      try {
        setIsPostsLoading(true);
        const res = await getAdminPagePosts(selectedPage._id, {
          page,
          limit: 10,
          search: debouncedPostsSearch,
        });

        if (res && res.success) {
          setPagePosts(res.data || []);
          setPostsPagination(
            res.pagination || {
              currentPage: page,
              itemsPerPage: 10,
              totalItems: (res.data || []).length,
              totalPages: 1,
            }
          );
        }
      } catch (err) {
        console.error("Error fetching page posts:", err);
      } finally {
        setIsPostsLoading(false);
      }
    },
    [selectedPage, debouncedPostsSearch]
  );

  useEffect(() => {
    if (selectedPage) {
      fetchPagePosts(postsPagination.currentPage);
    }
  }, [fetchPagePosts, selectedPage, postsPagination.currentPage]);

  const handleOpenPage = (pageItem) => {
    setSelectedPage(pageItem);
    setPostsSearch("");
    setDebouncedPostsSearch("");
    setPostsPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handleBackToPagesList = () => {
    setSelectedPage(null);
    setPagePosts([]);
  };

  // Fetch Post Detail and Comments Thread
  const commentsSearchTimeoutRef = useRef(null);
  const handleCommentsSearchChange = (e) => {
    const val = e.target.value;
    setCommentsSearch(val);
    if (commentsSearchTimeoutRef.current)
      clearTimeout(commentsSearchTimeoutRef.current);
    commentsSearchTimeoutRef.current = setTimeout(() => {
      setDebouncedCommentsSearch(val);
      setCommentsPagination((prev) => ({ ...prev, currentPage: 1 }));
    }, 350);
  };

  const fetchComments = useCallback(
    async (page = 1) => {
      if (!selectedPage?._id || !activePostModal?._id) return;
      try {
        setIsCommentsLoading(true);
        const res = await getAdminPagePostComments(
          selectedPage._id,
          activePostModal._id,
          {
            page,
            limit: 10,
            search: debouncedCommentsSearch,
          }
        );
        if (res && res.success) {
          setComments(res.data || []);
          setCommentsPagination(
            res.pagination || {
              currentPage: page,
              itemsPerPage: 10,
              totalItems: (res.data || []).length,
              totalPages: 1,
            }
          );
        }
      } catch (err) {
        console.error("Error fetching comments:", err);
      } finally {
        setIsCommentsLoading(false);
      }
    },
    [selectedPage, activePostModal, debouncedCommentsSearch]
  );

  useEffect(() => {
    if (activePostModal) {
      fetchComments(commentsPagination.currentPage);
    }
  }, [fetchComments, activePostModal, commentsPagination.currentPage]);

  const handleOpenPostModal = async (post) => {
    setActivePostModal(post);
    setCommentsSearch("");
    setDebouncedCommentsSearch("");
    setCommentsPagination((prev) => ({ ...prev, currentPage: 1 }));

    // Fetch full post details
    try {
      setIsPostDetailLoading(true);
      const res = await getAdminPagePost(selectedPage._id, post._id);
      if (res && res.success && res.data) {
        setActivePostModal(res.data);
      }
    } catch (err) {
      console.warn("Could not fetch full post detail:", err);
    } finally {
      setIsPostDetailLoading(false);
    }
  };

  const handleClosePostModal = () => {
    setActivePostModal(null);
    setComments([]);
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50/50 font-sans pb-20">
      {/* ========================================================================= */}
      {/* VIEW 1: ALL PAGES LIST VIEW                                              */}
      {/* ========================================================================= */}
      {!selectedPage ? (
        <div>
          {/* Header */}
          <div className="p-6 md:p-8 rounded-2xl bg-white shadow-sm border border-orange-200/60 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 bg-orange-100 text-[#DE4B12] rounded-xl">
                <BookOpen className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                  Page Management
                </h1>
                <p className="text-gray-500 text-sm mt-0.5">
                  Manage standard and knowledge pages, inspect published content, and review comments.
                </p>
              </div>
            </div>

            {/* Quick Stat Pill */}
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-orange-50 border border-orange-200 rounded-xl text-center">
                <span className="text-xs text-orange-600 font-medium block">
                  Total Pages
                </span>
                <span className="text-lg font-bold text-[#DE4B12]">
                  {pagination.totalItems || 0}
                </span>
              </div>

              <button
                onClick={() => fetchPages(pagination.currentPage)}
                disabled={isLoading}
                className="p-2.5 rounded-xl border border-gray-200 text-gray-600 hover:text-[#DE4B12] hover:border-orange-200 hover:bg-orange-50 transition shadow-sm"
                title="Refresh Pages"
              >
                <RefreshCw
                  className={`w-5 h-5 ${isLoading ? "animate-spin text-[#DE4B12]" : ""}`}
                />
              </button>
            </div>
          </div>

          {/* Controls Bar: Filters and Search */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm mb-6 flex flex-col lg:flex-row items-center justify-between gap-4">
            {/* Content Type Filters */}
            <div className="flex flex-wrap items-center gap-2 bg-gray-100 p-1 rounded-xl w-full lg:w-auto">
              {[
                { key: "all", label: "All Pages" },
                { key: "post", label: "Post Pages" },
                { key: "knowledge", label: "Knowledge Pages" },
              ].map((tab) => {
                const isActive = contentTypeFilter === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => {
                      setContentTypeFilter(tab.key);
                      setPagination((prev) => ({ ...prev, currentPage: 1 }));
                    }}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all text-center ${
                      isActive
                        ? "bg-[#DE4B12] text-white shadow-sm"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/60"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Privacy and Search */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
              {/* Privacy Select */}
              <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl w-full sm:w-auto">
                {[
                  { key: "all", label: "All Privacy" },
                  { key: "public", label: "Public" },
                  { key: "private", label: "Private" },
                ].map((typeTab) => {
                  const isSelected = pageTypeFilter === typeTab.key;
                  return (
                    <button
                      key={typeTab.key}
                      onClick={() => {
                        setPageTypeFilter(typeTab.key);
                        setPagination((prev) => ({ ...prev, currentPage: 1 }));
                      }}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                        isSelected
                          ? "bg-white text-gray-900 shadow-sm font-semibold"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      {typeTab.label}
                    </button>
                  );
                })}
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={handleSearchChange}
                  placeholder="Search name, topic, keywords..."
                  className="w-full h-9 pl-9 pr-8 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-[#DE4B12] transition"
                />
                {searchInput && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded-full"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Error Banner */}
          {fetchError && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 text-red-500" />
                <span className="text-sm font-medium">{fetchError}</span>
              </div>
              <button
                onClick={() => fetchPages(pagination.currentPage)}
                className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition"
              >
                Retry
              </button>
            </div>
          )}

          {/* Content: Loading / Empty / Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(6)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className="bg-white p-5 rounded-2xl border border-gray-200 animate-pulse space-y-3 h-[260px]"
                  >
                    <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                    <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="h-10 bg-gray-200 rounded-xl mt-6"></div>
                  </div>
                ))}
            </div>
          ) : pages.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-16 text-center">
              <div className="w-16 h-16 bg-orange-100 text-[#DE4B12] rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 opacity-75" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">
                No pages found
              </h3>
              <p className="text-sm text-gray-500 max-w-sm mx-auto mt-1 mb-5">
                {searchInput || contentTypeFilter !== "all" || pageTypeFilter !== "all"
                  ? "No pages match your current filter or search criteria."
                  : "There are currently no pages registered in the system."}
              </p>
              {(searchInput || contentTypeFilter !== "all" || pageTypeFilter !== "all") && (
                <button
                  onClick={() => {
                    handleClearSearch();
                    setContentTypeFilter("all");
                    setPageTypeFilter("all");
                  }}
                  className="px-4 py-2 bg-orange-50 text-[#DE4B12] border border-orange-200 rounded-xl text-sm font-medium hover:bg-orange-100 transition"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pages.map((pg) => {
                const owner = pg.owner || pg.user;

                return (
                  <div
                    key={pg._id}
                    className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md hover:border-orange-300 transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Top: Image and Page Header */}
                      <div className="flex items-start gap-3.5">
                        <PageAvatar
                          src={pg.image}
                          name={pg.name}
                          size="w-12 h-12 text-lg"
                        />
                        <div className="min-w-0 flex-1">
                          <h3
                            className="font-bold text-gray-900 truncate text-base hover:text-[#DE4B12] transition"
                            title={pg.name}
                          >
                            {pg.name}
                          </h3>
                          <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                            {pg.about || "No description provided"}
                          </p>
                        </div>
                      </div>

                      {/* Owner Info */}
                      {owner && (
                        <div className="mt-3.5 p-2 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            <UserAvatar
                              src={owner.profilePicture}
                              name={owner.name || "Owner"}
                              size="sm"
                            />
                            <div className="min-w-0">
                              <span className="text-xs font-semibold text-gray-900 truncate block">
                                {owner.name}
                              </span>
                              {owner.username && (
                                <span className="text-[11px] text-orange-600 font-medium truncate block">
                                  @{owner.username}
                                </span>
                              )}
                            </div>
                          </div>

                          <button
                            onClick={() => navigate(`/app/user-details/${owner._id}`)}
                            className="text-gray-400 hover:text-[#DE4B12] p-1 transition"
                            title="Inspect User Profile"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      {/* Badges */}
                      <div className="mt-3.5 flex flex-wrap gap-1.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-gray-100 text-gray-700 capitalize">
                          {pg.pageType === "private" ? (
                            <Lock className="w-3 h-3 text-gray-500" />
                          ) : (
                            <Globe className="w-3 h-3 text-gray-500" />
                          )}
                          {pg.pageType || "public"}
                        </span>

                        {pg.topic && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-gray-100 text-gray-700">
                            <Tag className="w-3 h-3 text-gray-400" />
                            {pg.topic}
                          </span>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <UsersIcon className="w-3.5 h-3.5 text-gray-400" />
                          <span>
                            Followers:{" "}
                            <strong className="text-gray-800">
                              {pg.followersCount ?? 0}
                            </strong>
                          </span>
                        </span>

                        <span className="flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5 text-orange-500" />
                          <span>
                            Posts:{" "}
                            <strong className="text-[#DE4B12]">
                              {pg.postCount ?? 0}
                            </strong>
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* View Page Action */}
                    <button
                      onClick={() => handleOpenPage(pg)}
                      className="mt-4 w-full py-2.5 px-3 bg-orange-50 hover:bg-[#DE4B12] text-[#DE4B12] hover:text-white border border-orange-200 hover:border-transparent text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Posts & Details ({pg.postCount ?? 0})</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination Controls */}
          {!isLoading && pagination.totalPages > 1 && (
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
              <div className="text-xs text-gray-500 font-medium">
                Showing Page{" "}
                <span className="font-semibold text-gray-800">
                  {pagination.currentPage}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-gray-800">
                  {pagination.totalPages}
                </span>{" "}
                ({pagination.totalItems} total pages)
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      currentPage: Math.max(1, prev.currentPage - 1),
                    }))
                  }
                  disabled={pagination.currentPage <= 1}
                  className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-orange-50 hover:text-[#DE4B12] hover:border-orange-200 disabled:opacity-40 transition shadow-sm"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    const curr = pagination.currentPage;
                    return (
                      page === 1 ||
                      page === pagination.totalPages ||
                      Math.abs(page - curr) <= 1
                    );
                  })
                  .map((page, idx, arr) => {
                    const prevPage = arr[idx - 1];
                    const showEllipsis = prevPage && page - prevPage > 1;

                    return (
                      <div key={page} className="flex items-center">
                        {showEllipsis && (
                          <span className="px-2 text-gray-400 text-xs">...</span>
                        )}
                        <button
                          onClick={() =>
                            setPagination((prev) => ({
                              ...prev,
                              currentPage: page,
                            }))
                          }
                          className={`min-w-[36px] h-9 px-3 rounded-xl text-xs font-semibold transition shadow-sm ${
                            page === pagination.currentPage
                              ? "bg-[#DE4B12] text-white border border-[#DE4B12]"
                              : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          {page}
                        </button>
                      </div>
                    );
                  })}

                <button
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      currentPage: Math.min(
                        pagination.totalPages,
                        prev.currentPage + 1
                      ),
                    }))
                  }
                  disabled={pagination.currentPage >= pagination.totalPages}
                  className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-orange-50 hover:text-[#DE4B12] hover:border-orange-200 disabled:opacity-40 transition shadow-sm"
                  title="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ========================================================================= */
        /* VIEW 2: SELECTED PAGE POSTS VIEW                                         */
        /* ========================================================================= */
        <div>
          {/* Breadcrumb Back Button */}
          <div className="mb-5 flex items-center justify-between">
            <button
              onClick={handleBackToPagesList}
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-[#DE4B12] px-3 py-1.5 rounded-xl hover:bg-white border border-transparent hover:border-gray-200 transition"
            >
              <ArrowLeft className="w-4 h-4" /> Back to All Pages
            </button>
          </div>

          {/* Page Details Overview Header */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 md:p-8 shadow-sm mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-start md:items-center gap-5">
                <PageAvatar
                  src={selectedPage.image}
                  name={selectedPage.name}
                  size="w-20 h-20 text-2xl"
                />

                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h1 className="text-2xl font-bold text-gray-900">
                      {selectedPage.name}
                    </h1>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 capitalize">
                      {selectedPage.pageType || "public"}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mt-1 max-w-2xl">
                    {selectedPage.about || "No description provided"}
                  </p>

                  {/* Owner & Meta info */}
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                    {selectedPage.owner && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-400">Owner:</span>
                        <button
                          onClick={() =>
                            navigate(`/app/user-details/${selectedPage.owner._id}`)
                          }
                          className="font-semibold text-gray-800 hover:text-[#DE4B12] hover:underline"
                        >
                          {selectedPage.owner.name}
                        </button>
                      </div>
                    )}

                    {selectedPage.topic && (
                      <>
                        <span>•</span>
                        <span>
                          Topic: <strong>{selectedPage.topic}</strong>
                        </span>
                      </>
                    )}

                    {selectedPage.createdAt && (
                      <>
                        <span>•</span>
                        <span>
                          Created on{" "}
                          {new Date(selectedPage.createdAt).toLocaleDateString()}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Stat Counters */}
              <div className="flex items-center gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100">
                <div className="px-4 py-3 bg-gray-50 rounded-2xl border border-gray-200 text-center min-w-[100px]">
                  <span className="text-xs text-gray-500 font-medium block">
                    Followers
                  </span>
                  <span className="text-xl font-bold text-gray-900">
                    {selectedPage.followersCount ?? 0}
                  </span>
                </div>

                <div className="px-4 py-3 bg-orange-50 rounded-2xl border border-orange-200 text-center min-w-[100px]">
                  <span className="text-xs text-orange-600 font-medium block">
                    Posts
                  </span>
                  <span className="text-xl font-bold text-[#DE4B12]">
                    {selectedPage.postCount ?? 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Posts Search Header */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#DE4B12]" />
              <h2 className="text-base font-bold text-gray-900">
                Published Posts in this Page ({postsPagination.totalItems})
              </h2>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={postsSearch}
                onChange={handlePostsSearchChange}
                placeholder="Search posts..."
                className="w-full h-9 pl-9 pr-8 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-[#DE4B12]"
              />
              {postsSearch && (
                <button
                  onClick={() => {
                    setPostsSearch("");
                    setDebouncedPostsSearch("");
                    setPostsPagination((prev) => ({ ...prev, currentPage: 1 }));
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Posts List */}
          {isPostsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 items-start">
              {Array(3)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className="bg-white p-5 rounded-2xl border border-gray-200 animate-pulse space-y-3"
                  >
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-5 bg-gray-200 rounded w-full"></div>
                    <div className="h-24 bg-gray-200 rounded-xl"></div>
                  </div>
                ))}
            </div>
          ) : pagePosts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-gray-800">
                No posts found in this page
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {postsSearch
                  ? "No posts matched your search query."
                  : "No published posts exist in this page."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 items-start">
              {pagePosts.map((post) => {
                const isKnowledge = post.contentType === "knowledge";
                const createdDate = post.createdAt
                  ? new Date(post.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "N/A";

                return (
                  <div
                    key={post._id}
                    className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden min-w-0"
                  >
                    {/* Post Top Header */}
                    <div className="flex items-center justify-between pb-3.5 border-b border-gray-100">
                      <div className="flex items-center gap-3 min-w-0">
                        <UserAvatar
                          src={post.author?.profilePicture}
                          name={post.author?.name || "Author"}
                          size="md"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="text-sm font-semibold text-gray-900 truncate">
                              {post.author?.name || "Author"}
                            </span>
                            {post.author?.username && (
                              <span className="text-xs text-orange-600 font-medium truncate">
                                @{post.author.username}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-gray-400">
                            {createdDate}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {post.isDeleted && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-100 text-red-700 border border-red-200">
                            Deleted
                          </span>
                        )}

                        {post.isDeleted ? (
                          <button
                            onClick={() => handleOpenPostAction(post, "recover")}
                            className="px-2.5 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 hover:border-transparent font-semibold text-xs transition inline-flex items-center gap-1 shadow-xs"
                            title="Restore post"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Restore</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleOpenPostAction(post, "delete")}
                            className="px-2.5 py-1 rounded-xl bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200 hover:border-transparent font-semibold text-xs transition inline-flex items-center gap-1 shadow-xs"
                            title="Delete post"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Content Body */}
                    <div className="py-3.5 flex-1 flex flex-col justify-between min-w-0">
                      {isKnowledge ? (
                        /* Knowledge Post Typography */
                        <div
                          className="p-4 rounded-xl border border-amber-200/80 bg-amber-50/30"
                          style={{
                            fontFamily: post.fontFamily || "inherit",
                            textAlign: post.textAlignment || "left",
                          }}
                        >
                          {post.subTopic && (
                            <span className="inline-block px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-xs font-semibold mb-2">
                              Topic: {post.subTopic}
                            </span>
                          )}
                          <p
                            className={`text-gray-800 whitespace-pre-wrap break-all [overflow-wrap:anywhere] leading-relaxed ${
                              post.isBold ? "font-bold" : ""
                            } ${post.isItalic ? "italic" : ""} ${
                              post.isUnderline ? "underline" : ""
                            }`}
                            style={{ fontSize: post.fontSize || "14px" }}
                          >
                            {post.text || "No content"}
                          </p>
                        </div>
                      ) : (
                        /* Standard Post */
                        <div className="min-w-0">
                          {post.bodyText ? (
                            <p
                              className="text-sm text-gray-800 break-all [overflow-wrap:anywhere] leading-relaxed mb-3 line-clamp-4"
                              title={post.bodyText}
                            >
                              {post.bodyText}
                            </p>
                          ) : !Array.isArray(post.media) || post.media.length === 0 ? (
                            <p className="text-xs text-gray-400 italic mb-2">
                              No text provided
                            </p>
                          ) : null}

                          {/* Media Preview Gallery or Placeholder */}
                          {Array.isArray(post.media) && post.media.length > 0 ? (
                            <div
                              className={`gap-2 mb-3 ${
                                post.media.length === 1
                                  ? "grid grid-cols-1"
                                  : "grid grid-cols-2"
                              }`}
                            >
                              {post.media.map((item, idx) => (
                                <div
                                  key={item._id || idx}
                                  className="relative rounded-xl overflow-hidden border border-gray-200 bg-black/5 aspect-video"
                                >
                                  {item.fileUrl ? (
                                    <img
                                      src={item.fileUrl}
                                      alt="Post media"
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="flex items-center justify-center h-full text-xs text-gray-400">
                                      No URL
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            /* Placeholder when post has no media */
                            <div className="w-full aspect-video rounded-xl bg-gradient-to-br from-gray-50 to-gray-100/70 border border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 gap-1.5 mb-3">
                              <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-xs border border-gray-100 text-gray-400">
                                <ImageIcon className="w-4 h-4 text-gray-400" />
                              </div>
                              <span className="text-[11px] font-medium text-gray-400">
                                No media attached
                              </span>
                            </div>
                          )}

                          {/* Keywords */}
                          {Array.isArray(post.keywords) &&
                            post.keywords.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mb-2">
                                {post.keywords.map((kw, idx) => (
                                  <span
                                    key={idx}
                                    className="text-xs text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-full font-medium"
                                  >
                                    #{kw}
                                  </span>
                                ))}
                              </div>
                            )}
                        </div>
                      )}
                    </div>

                    {/* Engagement Counts Bar */}
                    {(() => {
                      const totalComments =
                        post.commentsCount ?? (post.comments?.length || 0);
                      const hasComments =
                        totalComments > 0 ||
                        (Array.isArray(post.comments) &&
                          post.comments.length > 0);
                      const isCommentsOpen = !!expandedComments[post._id];

                      return (
                        <>
                          <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center gap-4 sm:gap-5">
                              <span className="flex items-center gap-1.5">
                                <Heart className="w-4 h-4 text-rose-500" />
                                <span>{post.likesCount ?? 0} Likes</span>
                              </span>

                              <button
                                type="button"
                                onClick={() =>
                                  hasComments && toggleComments(post._id)
                                }
                                disabled={!hasComments}
                                className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-xs font-medium transition ${
                                  isCommentsOpen
                                    ? "bg-orange-50 text-[#DE4B12] font-semibold"
                                    : hasComments
                                    ? "hover:bg-gray-100 text-gray-600 hover:text-[#DE4B12] cursor-pointer"
                                    : "text-gray-400 cursor-default"
                                }`}
                              >
                                <MessageSquare
                                  className={`w-4 h-4 ${
                                    isCommentsOpen
                                      ? "text-[#DE4B12]"
                                      : "text-blue-500"
                                  }`}
                                />
                                <span>{totalComments} Comments</span>
                                {hasComments && (
                                  <ChevronDown
                                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                                      isCommentsOpen
                                        ? "rotate-180 text-[#DE4B12]"
                                        : "text-gray-400"
                                    }`}
                                  />
                                )}
                              </button>

                              <span className="flex items-center gap-1.5">
                                <Share2 className="w-4 h-4 text-green-500" />
                                <span>{post.sharesCount ?? 0} Shares</span>
                              </span>
                            </div>

                            {post.reportsCount > 0 && (
                              <span className="text-red-500 font-semibold text-xs">
                                {post.reportsCount} Reports
                              </span>
                            )}
                          </div>

                          {/* Collapsible Comments Section with Scrollable Max Height */}
                          {isCommentsOpen &&
                            Array.isArray(post.comments) &&
                            post.comments.length > 0 && (
                              <div className="mt-3.5 pt-3 border-t border-gray-100">
                                <div className="flex items-center justify-between mb-2.5">
                                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                                    <MessageSquare className="w-3.5 h-3.5 text-[#DE4B12]" />
                                    Comments ({post.comments.length})
                                  </span>
                                  <div className="flex items-center gap-2">
                                    {(post.hasMoreComments ||
                                      (post.commentsCount ?? 0) >
                                        post.comments.length) && (
                                      <button
                                        onClick={() =>
                                          handleOpenPostModal(post)
                                        }
                                        className="text-xs font-semibold text-[#DE4B12] hover:underline"
                                      >
                                        View all {post.commentsCount} comments →
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => toggleComments(post._id)}
                                      className="text-[11px] font-medium text-gray-400 hover:text-gray-600 hover:underline"
                                    >
                                      Hide
                                    </button>
                                  </div>
                                </div>

                                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                                  {post.comments.map((comment) => (
                                    <div
                                      key={comment._id}
                                      className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex items-start gap-2.5 text-xs hover:bg-gray-100/70 transition"
                                    >
                                      <UserAvatar
                                        src={comment.user?.profilePicture}
                                        name={comment.user?.name || "Commenter"}
                                        size="sm"
                                      />
                                      <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-1.5 truncate">
                                            <span className="font-semibold text-gray-900 truncate">
                                              {comment.user?.name || "User"}
                                            </span>
                                            {comment.user?.username && (
                                              <span className="text-[11px] text-orange-600 font-medium truncate">
                                                @{comment.user.username}
                                              </span>
                                            )}
                                          </div>
                                          {comment.createdAt && (
                                            <span className="text-[10px] text-gray-400 whitespace-nowrap">
                                              {new Date(
                                                comment.createdAt
                                              ).toLocaleDateString()}
                                            </span>
                                          )}
                                        </div>
                                        <p className="text-gray-700 mt-1 leading-relaxed text-xs whitespace-pre-wrap">
                                          {comment.text}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                        </>
                      );
                    })()}
                  </div>
                );
              })}
            </div>
          )}

          {/* Posts Pagination */}
          {!isPostsLoading && postsPagination.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-200">
              <span className="text-xs text-gray-500">
                Page {postsPagination.currentPage} of{" "}
                {postsPagination.totalPages} ({postsPagination.totalItems} posts)
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setPostsPagination((prev) => ({
                      ...prev,
                      currentPage: Math.max(1, prev.currentPage - 1),
                    }))
                  }
                  disabled={postsPagination.currentPage <= 1}
                  className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-orange-50 hover:text-[#DE4B12] disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() =>
                    setPostsPagination((prev) => ({
                      ...prev,
                      currentPage: Math.min(
                        postsPagination.totalPages,
                        prev.currentPage + 1
                      ),
                    }))
                  }
                  disabled={
                    postsPagination.currentPage >= postsPagination.totalPages
                  }
                  className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-orange-50 hover:text-[#DE4B12] disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* POST DETAIL & ALL COMMENTS MODAL                                          */}
      {/* ========================================================================= */}
      {activePostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 animate-scaleIn flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 text-[#DE4B12] rounded-xl">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Post & Comments Inspection
                  </h2>
                  <p className="text-xs text-gray-400">
                    {activePostModal.contentType === "knowledge"
                      ? "Knowledge Post"
                      : "Standard Post"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {activePostModal.isDeleted ? (
                  <button
                    onClick={() => handleOpenPostAction(activePostModal, "recover")}
                    className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 hover:border-transparent font-semibold text-xs transition inline-flex items-center gap-1 shadow-xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restore Post</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleOpenPostAction(activePostModal, "delete")}
                    className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200 hover:border-transparent font-semibold text-xs transition inline-flex items-center gap-1 shadow-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Post</span>
                  </button>
                )}

                <button
                  onClick={handleClosePostModal}
                  className="p-2 text-gray-400 hover:text-gray-700 rounded-xl hover:bg-gray-100 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {isPostDetailLoading && (
                <div className="flex items-center justify-center py-2 text-xs text-orange-600 gap-2 font-medium">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading fresh post detail...
                </div>
              )}

              {/* Complete Post Content Card */}
              <div className="p-5 rounded-2xl border border-gray-200 bg-gray-50/50">
                {activePostModal.contentType === "knowledge" ? (
                  <div
                    className="p-4 rounded-xl border border-amber-200 bg-amber-50/40"
                    style={{
                      fontFamily: activePostModal.fontFamily || "inherit",
                      textAlign: activePostModal.textAlignment || "left",
                    }}
                  >
                    {activePostModal.subTopic && (
                      <span className="inline-block px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-900 text-xs font-semibold mb-2">
                        Topic: {activePostModal.subTopic}
                      </span>
                    )}
                    <p
                      className={`text-gray-800 whitespace-pre-wrap leading-relaxed ${
                        activePostModal.isBold ? "font-bold" : ""
                      } ${activePostModal.isItalic ? "italic" : ""} ${
                        activePostModal.isUnderline ? "underline" : ""
                      }`}
                      style={{ fontSize: activePostModal.fontSize || "15px" }}
                    >
                      {activePostModal.text}
                    </p>
                  </div>
                ) : (
                  <div>
                    {activePostModal.bodyText && (
                      <p className="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed mb-4">
                        {activePostModal.bodyText}
                      </p>
                    )}

                    {Array.isArray(activePostModal.media) &&
                      activePostModal.media.length > 0 && (
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          {activePostModal.media.map((item, idx) => (
                            <div
                              key={item._id || idx}
                              className="rounded-xl overflow-hidden border border-gray-200 aspect-video bg-black/5"
                            >
                              {item.fileUrl && (
                                <img
                                  src={item.fileUrl}
                                  alt="Post media"
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                  </div>
                )}

                {/* Counts bar */}
                <div className="mt-4 pt-3 border-t border-gray-200 flex items-center gap-6 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 text-rose-500" />
                    {activePostModal.likesCount ?? 0} Likes
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
                    {activePostModal.commentsCount ?? 0} Comments
                  </span>
                  <span className="flex items-center gap-1">
                    <Share2 className="w-3.5 h-3.5 text-green-500" />
                    {activePostModal.sharesCount ?? 0} Shares
                  </span>
                </div>
              </div>

              {/* Complete Paginated Comments Thread */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                    Full Comments Thread ({commentsPagination.totalItems})
                  </h3>

                  {/* Search inside comments */}
                  <div className="relative w-48">
                    <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={commentsSearch}
                      onChange={handleCommentsSearchChange}
                      placeholder="Search comments..."
                      className="w-full h-7 pl-8 pr-6 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-orange-400"
                    />
                    {commentsSearch && (
                      <button
                        onClick={() => {
                          setCommentsSearch("");
                          setDebouncedCommentsSearch("");
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                {isCommentsLoading ? (
                  <div className="py-8 text-center text-xs text-gray-400">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-orange-500" />
                    Loading comments...
                  </div>
                ) : comments.length === 0 ? (
                  <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-xs text-gray-500">
                      {commentsSearch
                        ? "No comments matched your search."
                        : "No comments on this post yet."}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {comments.map((comment) => (
                      <div
                        key={comment._id}
                        className="p-3 rounded-2xl bg-gray-50 border border-gray-200/80 flex items-start gap-3"
                      >
                        <UserAvatar
                          src={comment.user?.profilePicture}
                          name={comment.user?.name || "Commenter"}
                          size="sm"
                        />
                        <div className="min-w-0 flex-1 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-gray-900">
                              {comment.user?.name || "User"}
                            </span>
                            {comment.createdAt && (
                              <span className="text-[10px] text-gray-400">
                                {new Date(comment.createdAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          <p className="text-gray-700 mt-1 leading-relaxed">
                            {comment.text}
                          </p>
                          {comment.likesCount > 0 && (
                            <span className="inline-flex items-center gap-1 text-[11px] text-gray-400 mt-1.5">
                              <Heart className="w-3 h-3 text-rose-400" />
                              {comment.likesCount}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Comments Pagination */}
                {!isCommentsLoading && commentsPagination.totalPages > 1 && (
                  <div className="mt-4 flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                    <span className="text-gray-400 text-[11px]">
                      Page {commentsPagination.currentPage} of{" "}
                      {commentsPagination.totalPages}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() =>
                          setCommentsPagination((prev) => ({
                            ...prev,
                            currentPage: Math.max(1, prev.currentPage - 1),
                          }))
                        }
                        disabled={commentsPagination.currentPage <= 1}
                        className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-40"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() =>
                          setCommentsPagination((prev) => ({
                            ...prev,
                            currentPage: Math.min(
                              commentsPagination.totalPages,
                              prev.currentPage + 1
                            ),
                          }))
                        }
                        disabled={
                          commentsPagination.currentPage >=
                          commentsPagination.totalPages
                        }
                        className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-40"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50/50 rounded-b-3xl flex justify-end sticky bottom-0">
              <button
                onClick={handleClosePostModal}
                className="px-5 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-semibold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Post Action Confirmation Modal (Delete / Recover) */}
      {postActionModal.isOpen && postActionModal.post && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
            <div className="flex items-center gap-3.5 mb-4">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                  postActionModal.action === "delete"
                    ? "bg-red-50 text-red-600 border border-red-100"
                    : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                }`}
              >
                {postActionModal.action === "delete" ? (
                  <Trash2 className="w-6 h-6" />
                ) : (
                  <RotateCcw className="w-6 h-6" />
                )}
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  {postActionModal.action === "delete"
                    ? "Delete Post"
                    : "Recover Post"}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {postActionModal.action === "delete"
                    ? "Are you sure you want to soft-delete this post? It can be restored later."
                    : "Are you sure you want to restore and make this post active again?"}
                </p>
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 mb-5 text-xs text-gray-700">
              <span className="font-semibold text-gray-900 block mb-0.5">
                Author: {postActionModal.post.author?.name || "Author"}
              </span>
              <p className="line-clamp-2 text-gray-600">
                {postActionModal.post.bodyText ||
                  postActionModal.post.text ||
                  "No text provided"}
              </p>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={postActionModal.loading}
                onClick={() =>
                  setPostActionModal({
                    isOpen: false,
                    post: null,
                    action: "delete",
                    loading: false,
                  })
                }
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 border border-gray-200 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={postActionModal.loading}
                onClick={handleConfirmPostAction}
                className={`px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-sm transition inline-flex items-center gap-1.5 disabled:opacity-50 ${
                  postActionModal.action === "delete"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                {postActionModal.loading && (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                )}
                <span>
                  {postActionModal.action === "delete"
                    ? "Yes, Delete Post"
                    : "Yes, Recover Post"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pages;
