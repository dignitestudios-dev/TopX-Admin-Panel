import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import {
  ChevronLeft,
  ChevronRight,
  UserX,
  UserCheck,
  AlertTriangle,
  Loader2,
  BookOpen,
  FileText,
  Bookmark,
  Calendar,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Heart,
  MessageSquare,
  Share2,
  CheckCircle2,
  XCircle,
  Search,
  X,
  ArrowLeft,
  Layers,
  Sparkles,
  ChevronDown,
  Image as ImageIcon,
  Trash2,
  RotateCcw,
} from "lucide-react";
import {
  getAdminUserProfile,
  getAdminUserPages,
  getAdminUserPagePosts,
  getAdminUserSubscriptions,
  getAdminUserSavedSubscriptions,
  setAdminUserSuspension,
} from "../../services/adminUserService";
import {
  deleteAdminPost,
  recoverAdminPost,
} from "../../services/adminPostService";
import { SuccessToast, ErrorToast } from "../../components/global/Toaster";
import UserAvatar from "../../components/common/UserAvatar";

const UserDetails = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  // Profile Data State
  const [user, setUser] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState(null);

  // Active Tab: "pages" | "activeSubscriptions" | "savedSubscriptions"
  const [activeTab, setActiveTab] = useState("pages");

  // Suspension confirmation modal state
  const [suspensionModal, setSuspensionModal] = useState({
    isOpen: false,
    loading: false,
    isSuspendedTarget: false,
  });

  // ----------------------------------------------------
  // 1. Fetch User Profile
  // ----------------------------------------------------
  const fetchProfile = useCallback(async () => {
    if (!userId) return;
    try {
      setProfileLoading(true);
      setProfileError(null);
      const res = await getAdminUserProfile(userId);
      if (res && res.success) {
        setUser(res.data);
      } else {
        setProfileError(res?.message || "Failed to load user profile");
      }
    } catch (err) {
      console.error("Error loading user profile:", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "User profile could not be loaded.";
      setProfileError(msg);
    } finally {
      setProfileLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // ----------------------------------------------------
  // Suspend / Restore Handler
  // ----------------------------------------------------
  const handleToggleSuspension = async () => {
    if (!user) return;
    const targetSuspended = !user.isSuspended;

    try {
      setSuspensionModal((prev) => ({ ...prev, loading: true }));
      const res = await setAdminUserSuspension(user._id, targetSuspended);

      if (res && res.success) {
        SuccessToast(
          res.message ||
            (targetSuspended
              ? "User suspended successfully"
              : "User restored successfully")
        );
        // Update local user state
        setUser((prev) => ({
          ...prev,
          isSuspended: targetSuspended,
          isDeactivatedByAdmin: targetSuspended,
        }));
      } else {
        ErrorToast(res?.message || "Failed to update suspension status");
      }
    } catch (err) {
      console.error("Error updating suspension:", err);
      const safeMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update suspension state";
      ErrorToast(safeMsg);
    } finally {
      setSuspensionModal({
        isOpen: false,
        loading: false,
        isSuspendedTarget: false,
      });
    }
  };

  // ----------------------------------------------------
  // 2. Tab: Pages State
  // ----------------------------------------------------
  const [pages, setPages] = useState([]);
  const [pagesPagination, setPagesPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    totalPages: 0,
  });
  const [pagesLoading, setPagesLoading] = useState(false);
  const [pagesContentType, setPagesContentType] = useState(""); // "" (all), "post", "knowledge"
  const [pagesSearch, setPagesSearch] = useState("");
  const [debouncedPagesSearch, setDebouncedPagesSearch] = useState("");

  const pagesSearchTimeoutRef = useRef(null);
  const handlePagesSearchChange = (e) => {
    const val = e.target.value;
    setPagesSearch(val);
    if (pagesSearchTimeoutRef.current) clearTimeout(pagesSearchTimeoutRef.current);
    pagesSearchTimeoutRef.current = setTimeout(() => {
      setDebouncedPagesSearch(val);
      setPagesPagination((prev) => ({ ...prev, currentPage: 1 }));
    }, 350);
  };

  const fetchPages = useCallback(
    async (page = 1) => {
      if (!userId) return;
      try {
        setPagesLoading(true);
        const res = await getAdminUserPages(userId, {
          page,
          limit: 10,
          search: debouncedPagesSearch,
          contentType: pagesContentType,
        });
        if (res && res.success) {
          setPages(res.data || []);
          setPagesPagination(
            res.pagination || {
              currentPage: page,
              itemsPerPage: 10,
              totalItems: (res.data || []).length,
              totalPages: 1,
            }
          );
        }
      } catch (err) {
        console.error("Error fetching user pages:", err);
      } finally {
        setPagesLoading(false);
      }
    },
    [userId, debouncedPagesSearch, pagesContentType]
  );

  useEffect(() => {
    if (activeTab === "pages") {
      fetchPages(pagesPagination.currentPage);
    }
  }, [fetchPages, activeTab, pagesPagination.currentPage]);

  // ----------------------------------------------------
  // 3. Tab: Posts within a Selected Page
  // ----------------------------------------------------
  const [selectedPage, setSelectedPage] = useState(null);
  const [pagePosts, setPagePosts] = useState([]);
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
  const [postsPagination, setPostsPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    totalPages: 0,
  });
  const [postsLoading, setPostsLoading] = useState(false);
  const [postsSearch, setPostsSearch] = useState("");
  const [debouncedPostsSearch, setDebouncedPostsSearch] = useState("");

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

  const fetchPostsForPage = useCallback(
    async (page = 1) => {
      if (!userId || !selectedPage?._id) return;
      try {
        setPostsLoading(true);
        const res = await getAdminUserPagePosts(userId, selectedPage._id, {
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
        setPostsLoading(false);
      }
    },
    [userId, selectedPage, debouncedPostsSearch]
  );

  useEffect(() => {
    if (selectedPage) {
      fetchPostsForPage(postsPagination.currentPage);
    }
  }, [fetchPostsForPage, selectedPage, postsPagination.currentPage]);

  const handleSelectPage = (pg) => {
    setSelectedPage(pg);
    setPostsSearch("");
    setDebouncedPostsSearch("");
    setPostsPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handleBackToPages = () => {
    setSelectedPage(null);
    setPagePosts([]);
  };

  // ----------------------------------------------------
  // 4. Tab: Active Subscriptions State
  // ----------------------------------------------------
  const [subscriptions, setSubscriptions] = useState([]);
  const [subPagination, setSubPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    totalPages: 0,
  });
  const [subLoading, setSubLoading] = useState(false);
  const [subSearch, setSubSearch] = useState("");
  const [debouncedSubSearch, setDebouncedSubSearch] = useState("");

  const subSearchTimeoutRef = useRef(null);
  const handleSubSearchChange = (e) => {
    const val = e.target.value;
    setSubSearch(val);
    if (subSearchTimeoutRef.current) clearTimeout(subSearchTimeoutRef.current);
    subSearchTimeoutRef.current = setTimeout(() => {
      setDebouncedSubSearch(val);
      setSubPagination((prev) => ({ ...prev, currentPage: 1 }));
    }, 350);
  };

  const fetchSubscriptions = useCallback(
    async (page = 1) => {
      if (!userId) return;
      try {
        setSubLoading(true);
        const res = await getAdminUserSubscriptions(userId, {
          page,
          limit: 10,
          search: debouncedSubSearch,
        });
        if (res && res.success) {
          setSubscriptions(res.data || []);
          setSubPagination(
            res.pagination || {
              currentPage: page,
              itemsPerPage: 10,
              totalItems: (res.data || []).length,
              totalPages: 1,
            }
          );
        }
      } catch (err) {
        console.error("Error fetching subscriptions:", err);
      } finally {
        setSubLoading(false);
      }
    },
    [userId, debouncedSubSearch]
  );

  useEffect(() => {
    if (activeTab === "activeSubscriptions") {
      fetchSubscriptions(subPagination.currentPage);
    }
  }, [fetchSubscriptions, activeTab, subPagination.currentPage]);

  // ----------------------------------------------------
  // 5. Tab: Saved Subscriptions State
  // ----------------------------------------------------
  const [savedSubs, setSavedSubs] = useState([]);
  const [savedSubPagination, setSavedSubPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    totalPages: 0,
  });
  const [savedSubLoading, setSavedSubLoading] = useState(false);
  const [savedSubSearch, setSavedSubSearch] = useState("");
  const [debouncedSavedSubSearch, setDebouncedSavedSubSearch] = useState("");

  const savedSubSearchTimeoutRef = useRef(null);
  const handleSavedSubSearchChange = (e) => {
    const val = e.target.value;
    setSavedSubSearch(val);
    if (savedSubSearchTimeoutRef.current)
      clearTimeout(savedSubSearchTimeoutRef.current);
    savedSubSearchTimeoutRef.current = setTimeout(() => {
      setDebouncedSavedSubSearch(val);
      setSavedSubPagination((prev) => ({ ...prev, currentPage: 1 }));
    }, 350);
  };

  const fetchSavedSubscriptions = useCallback(
    async (page = 1) => {
      if (!userId) return;
      try {
        setSavedSubLoading(true);
        const res = await getAdminUserSavedSubscriptions(userId, {
          page,
          limit: 10,
          search: debouncedSavedSubSearch,
        });
        if (res && res.success) {
          setSavedSubs(res.data || []);
          setSavedSubPagination(
            res.pagination || {
              currentPage: page,
              itemsPerPage: 10,
              totalItems: (res.data || []).length,
              totalPages: 1,
            }
          );
        }
      } catch (err) {
        console.error("Error fetching saved subscriptions:", err);
      } finally {
        setSavedSubLoading(false);
      }
    },
    [userId, debouncedSavedSubSearch]
  );

  useEffect(() => {
    if (activeTab === "savedSubscriptions") {
      fetchSavedSubscriptions(savedSubPagination.currentPage);
    }
  }, [fetchSavedSubscriptions, activeTab, savedSubPagination.currentPage]);

  // ----------------------------------------------------
  // Render: Loading & Error States
  // ----------------------------------------------------
  if (profileLoading) {
    return (
      <div className="p-6 min-h-screen bg-gray-50/50 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#DE4B12] animate-spin mb-4" />
        <p className="text-gray-500 font-medium text-sm">
          Loading user profile details...
        </p>
      </div>
    );
  }

  if (profileError || !user) {
    return (
      <div className="p-6 min-h-screen bg-gray-50/50 font-sans">
        <button
          onClick={() => navigate("/app/users")}
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-[#DE4B12] mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Users
        </button>
        <div className="bg-white rounded-2xl border border-red-200 p-8 text-center max-w-lg mx-auto shadow-sm">
          <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            User Not Available
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            {profileError || "The requested user could not be found or has an invalid ID."}
          </p>
          <button
            onClick={() => navigate("/app/users")}
            className="px-5 py-2.5 bg-[#DE4B12] text-white font-semibold rounded-xl hover:bg-[#c34410] transition shadow-sm text-sm"
          >
            Return to User List
          </button>
        </div>
      </div>
    );
  }

  const isSuspended = Boolean(user.isSuspended);
  const summary = user.summary || {};

  return (
    <div className="p-6 min-h-screen bg-gray-50/50 font-sans pb-20">
      {/* Top Breadcrumb Navigation */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => navigate("/app/users")}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-[#DE4B12] px-3 py-1.5 rounded-xl hover:bg-white border border-transparent hover:border-gray-200 transition"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Users
        </button>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 md:p-8 shadow-sm mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Avatar and Primary Identity */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <UserAvatar
              src={user.profilePicture}
              name={user.name || "User"}
              size="2xl"
              className="border-4 border-white shadow-lg ring-2 ring-orange-200"
            />
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  {user.name || "Unnamed User"}
                </h1>
                {/* Status Badge */}
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                    isSuspended
                      ? "bg-red-50 text-red-700 border-red-200"
                      : "bg-emerald-50 text-emerald-700 border-emerald-200"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full mr-2 ${
                      isSuspended ? "bg-red-500" : "bg-emerald-500"
                    }`}
                  ></span>
                  {isSuspended ? "Account Suspended" : "Account Active"}
                </span>
              </div>

              {/* Username & Email */}
              <div className="mt-1 flex flex-wrap items-center gap-3 text-sm">
                {user.username && (
                  <span className="text-orange-600 font-semibold">
                    @{user.username}
                  </span>
                )}
                <span className="text-gray-400">•</span>
                <span className="text-gray-600 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  {user.email}
                </span>
                {user.phone && (
                  <>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-600 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      {user.phone}
                    </span>
                  </>
                )}
              </div>

              {/* Bio & Details */}
              {user.bio && (
                <p className="mt-3 text-sm text-gray-700 max-w-2xl italic bg-orange-50/50 p-2.5 rounded-xl border border-orange-100">
                  &ldquo;{user.bio}&rdquo;
                </p>
              )}

              {/* Verification & Metadata Pills */}
              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                {/* Email Verification */}
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium border ${
                    user.isEmailVerified
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-gray-100 text-gray-600 border-gray-200"
                  }`}
                >
                  {user.isEmailVerified ? (
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <XCircle className="w-3 h-3 text-gray-400" />
                  )}
                  Email {user.isEmailVerified ? "Verified" : "Unverified"}
                </span>

                {/* Phone Verification */}
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium border ${
                    user.isPhoneVerified
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-gray-100 text-gray-600 border-gray-200"
                  }`}
                >
                  {user.isPhoneVerified ? (
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <XCircle className="w-3 h-3 text-gray-400" />
                  )}
                  Phone {user.isPhoneVerified ? "Verified" : "Unverified"}
                </span>

                {/* Location */}
                {(user.city || user.state || user.country) && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg border border-gray-200">
                    <MapPin className="w-3 h-3 text-gray-500" />
                    {[user.city, user.state, user.country]
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                )}

                {/* School */}
                {user.school && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg border border-gray-200">
                    <GraduationCap className="w-3 h-3 text-gray-500" />
                    {user.school}
                  </span>
                )}

                {/* Join Date */}
                {user.createdAt && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg border border-gray-200">
                    <Calendar className="w-3 h-3 text-gray-500" />
                    Joined{" "}
                    {new Date(user.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                )}
              </div>

              {/* Interests */}
              {Array.isArray(user.interests) && user.interests.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-semibold text-gray-500 mr-1">
                    Interests:
                  </span>
                  {user.interests.map((interest, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-0.5 rounded-full text-[11px] bg-orange-100/70 text-orange-800 font-medium"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Suspend / Restore Action Button */}
          <div className="flex-shrink-0 flex items-center lg:flex-col justify-end gap-3 pt-4 lg:pt-0 border-t lg:border-t-0 border-gray-100">
            <button
              onClick={() =>
                setSuspensionModal({
                  isOpen: true,
                  loading: false,
                  isSuspendedTarget: !isSuspended,
                })
              }
              className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm flex items-center gap-2 ${
                isSuspended
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20"
                  : "bg-red-600 hover:bg-red-700 text-white shadow-red-600/20"
              }`}
            >
              {isSuspended ? (
                <>
                  <UserCheck className="w-4 h-4" />
                  <span>Restore User</span>
                </>
              ) : (
                <>
                  <UserX className="w-4 h-4" />
                  <span>Suspend User</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards Grid (from data.summary) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">
              Pages
            </span>
            <BookOpen className="w-4 h-4 text-[#DE4B12]" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {summary.pagesCount ?? 0}
          </div>
          <p className="text-[11px] text-gray-400 mt-0.5">Owned pages</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">
              Posts
            </span>
            <FileText className="w-4 h-4 text-[#DE4B12]" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {summary.postsCount ?? user.postsCount ?? 0}
          </div>
          <p className="text-[11px] text-gray-400 mt-0.5">Standard posts</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">
              Knowledge
            </span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {summary.knowledgePostsCount ?? 0}
          </div>
          <p className="text-[11px] text-gray-400 mt-0.5">Knowledge posts</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">
              Subscriptions
            </span>
            <Layers className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {summary.activeSubscriptionsCount ?? 0}
          </div>
          <p className="text-[11px] text-gray-400 mt-0.5">Active collections</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">
              Saved
            </span>
            <Bookmark className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {summary.savedSubscriptionsCount ?? 0}
          </div>
          <p className="text-[11px] text-gray-400 mt-0.5">Saved collections</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">
              Followers
            </span>
            <Heart className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {user.followersCount ?? 0}
          </div>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Following: {user.followingCount ?? 0}
          </p>
        </div>
      </div>

      {/* Tabs Navigation Header */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-3 mb-6 overflow-x-auto">
        <button
          onClick={() => {
            setActiveTab("pages");
            handleBackToPages();
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap ${
            activeTab === "pages"
              ? "bg-[#DE4B12] text-white shadow-sm"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Pages & Posts</span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              activeTab === "pages"
                ? "bg-white/20 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {summary.pagesCount ?? 0}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab("activeSubscriptions");
            handleBackToPages();
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap ${
            activeTab === "activeSubscriptions"
              ? "bg-[#DE4B12] text-white shadow-sm"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Active Subscriptions</span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              activeTab === "activeSubscriptions"
                ? "bg-white/20 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {summary.activeSubscriptionsCount ?? 0}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab("savedSubscriptions");
            handleBackToPages();
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap ${
            activeTab === "savedSubscriptions"
              ? "bg-[#DE4B12] text-white shadow-sm"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Saved Subscriptions</span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              activeTab === "savedSubscriptions"
                ? "bg-white/20 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {summary.savedSubscriptionsCount ?? 0}
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: PAGES & POSTS VIEW                                                 */}
      {/* ========================================================================= */}
      {activeTab === "pages" && (
        <div>
          {/* Sub-view: Posts within a Selected Page */}
          {selectedPage ? (
            <div>
              {/* Back Banner for Selected Page */}
              <div className="bg-white p-5 rounded-2xl border border-orange-200 shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleBackToPages}
                    className="p-2 rounded-xl bg-orange-50 text-[#DE4B12] hover:bg-orange-100 transition"
                    title="Back to Pages"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-gray-900">
                        {selectedPage.name}
                      </h2>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {selectedPage.about || "Posts authored by this user on this page"}
                    </p>
                  </div>
                </div>

                {/* Posts Search Bar */}
                <div className="relative w-full md:w-72">
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
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Posts List */}
              {postsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 items-start">
                  {Array(3)
                    .fill(0)
                    .map((_, i) => (
                      <div
                        key={i}
                        className="bg-white p-5 rounded-2xl border border-gray-200 animate-pulse space-y-3"
                      >
                        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-6 bg-gray-200 rounded w-full"></div>
                        <div className="h-28 bg-gray-200 rounded-xl"></div>
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
                      ? "No posts matched your search criteria."
                      : "The user has not authored any posts in this page."}
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
                        className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                      >
                        {/* Post Header */}
                        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                          <div className="flex items-center gap-3">
                            <UserAvatar
                              src={post.author?.profilePicture}
                              name={post.author?.name || user.name}
                              size="md"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-gray-900">
                                  {post.author?.name || user.name}
                                </span>
                                {post.author?.username && (
                                  <span className="text-xs text-orange-600 font-medium">
                                    @{post.author.username}
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-gray-400">
                                {createdDate}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {post.isDeleted && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-100 text-red-700 border border-red-200">
                                Deleted
                              </span>
                            )}

                            {post.isDeleted ? (
                              <button
                                onClick={() =>
                                  handleOpenPostAction(post, "recover")
                                }
                                className="px-2.5 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 hover:border-transparent font-semibold text-xs transition inline-flex items-center gap-1 shadow-xs"
                                title="Restore post"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Restore</span>
                              </button>
                            ) : (
                              <button
                                onClick={() =>
                                  handleOpenPostAction(post, "delete")
                                }
                                className="px-2.5 py-1 rounded-xl bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200 hover:border-transparent font-semibold text-xs transition inline-flex items-center gap-1 shadow-xs"
                                title="Delete post"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Post Content */}
                        <div className="py-3.5 flex-1 flex flex-col justify-between">
                          {isKnowledge ? (
                            /* Knowledge Post Rendering Rule */
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
                                className={`text-gray-800 whitespace-pre-wrap leading-relaxed ${
                                  post.isBold ? "font-bold" : ""
                                } ${post.isItalic ? "italic" : ""} ${
                                  post.isUnderline ? "underline" : ""
                                }`}
                                style={{ fontSize: post.fontSize || "14px" }}
                              >
                                {post.text || "No content"}
                              </p>
                              {post.backgroundCode && (
                                <div className="mt-2.5 text-[11px] text-gray-400">
                                  Background: {post.backgroundCode}
                                </div>
                              )}
                            </div>
                          ) : (
                            /* Standard Post Rendering Rule */
                            <div>
                              {post.bodyText ? (
                                <p className="text-sm text-gray-800 whitespace-pre-wrap mb-3 leading-relaxed">
                                  {post.bodyText}
                                </p>
                              ) : !Array.isArray(post.media) || post.media.length === 0 ? (
                                <p className="text-xs text-gray-400 italic mb-2">
                                  No text provided
                                </p>
                              ) : null}

                              {/* Media Gallery or Placeholder */}
                              {Array.isArray(post.media) &&
                              post.media.length > 0 ? (
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
                                          alt={item.title || "Media"}
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <div className="flex items-center justify-center h-full text-xs text-gray-400">
                                          No URL
                                        </div>
                                      )}
                                      {item.type && (
                                        <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/70 text-white text-[10px] uppercase font-semibold">
                                          {item.type}
                                        </span>
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
                                  <div className="flex flex-wrap gap-1.5 mt-2">
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

                        {/* Post Footer Metrics */}
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
                              <div className="pt-3 border-t border-gray-100 flex items-center gap-4 sm:gap-6 text-xs text-gray-500">
                                <span className="flex items-center gap-1.5 hover:text-red-500 transition">
                                  <Heart className="w-4 h-4 text-red-400" />
                                  <span>{post.likesCount ?? 0} Likes</span>
                                </span>

                                <button
                                  type="button"
                                  onClick={() =>
                                    hasComments && toggleComments(post._id)
                                  }
                                  disabled={!hasComments}
                                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition ${
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
                                        : "text-blue-400"
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

                                <span className="flex items-center gap-1.5 hover:text-green-500 transition">
                                  <Share2 className="w-4 h-4 text-green-400" />
                                  <span>{post.sharesCount ?? 0} Shares</span>
                                </span>
                              </div>

                              {/* Collapsible Comments Section with Fixed Scrollable Height */}
                              {isCommentsOpen &&
                                Array.isArray(post.comments) &&
                                post.comments.length > 0 && (
                                  <div className="mt-3.5 pt-3 border-t border-gray-100">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                                        <MessageSquare className="w-3.5 h-3.5 text-[#DE4B12]" />
                                        Comments ({post.comments.length})
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => toggleComments(post._id)}
                                        className="text-[11px] font-medium text-gray-400 hover:text-gray-600 hover:underline"
                                      >
                                        Hide
                                      </button>
                                    </div>

                                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                                      {post.comments.map((comment) => (
                                        <div
                                          key={comment._id}
                                          className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex items-start gap-2.5 text-xs hover:bg-gray-100/70 transition"
                                        >
                                          <UserAvatar
                                            src={comment.user?.profilePicture}
                                            name={comment.user?.name || "User"}
                                            size="sm"
                                          />
                                          <div className="min-w-0 flex-1">
                                            <div className="flex items-center justify-between gap-2">
                                              <div className="flex items-center gap-1.5 truncate">
                                                <span className="font-semibold text-gray-900 truncate">
                                                  {comment.user?.name ||
                                                    "Anonymous User"}
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
                                                  ).toLocaleDateString("en-US", {
                                                    month: "short",
                                                    day: "numeric",
                                                    year: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                  })}
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
              {!postsLoading && postsPagination.totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between bg-white p-3 rounded-xl border border-gray-200">
                  <span className="text-xs text-gray-500">
                    Page {postsPagination.currentPage} of{" "}
                    {postsPagination.totalPages}
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
                      className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
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
                      className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Sub-view: Pages List */
            <div>
              {/* Filter and Search Bar for Pages */}
              <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
                {/* Content Type Filter */}
                <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl w-full md:w-auto">
                  {[
                    { key: "", label: "All Pages" },
                    { key: "post", label: "Topic Pages" },
                    { key: "knowledge", label: "Knowledge Pages" },
                  ].map((filter) => {
                    const isSelected = pagesContentType === filter.key;
                    return (
                      <button
                        key={filter.key}
                        onClick={() => {
                          setPagesContentType(filter.key);
                          setPagesPagination((prev) => ({ ...prev, currentPage: 1 }));
                        }}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                          isSelected
                            ? "bg-[#DE4B12] text-white shadow-sm"
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/50"
                        }`}
                      >
                        {filter.label}
                      </button>
                    );
                  })}
                </div>

                {/* Pages Search */}
                <div className="relative w-full md:w-72">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={pagesSearch}
                    onChange={handlePagesSearchChange}
                    placeholder="Search pages by name, topic..."
                    className="w-full h-9 pl-9 pr-8 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-[#DE4B12]"
                  />
                  {pagesSearch && (
                    <button
                      onClick={() => {
                        setPagesSearch("");
                        setDebouncedPagesSearch("");
                        setPagesPagination((prev) => ({ ...prev, currentPage: 1 }));
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Pages Grid */}
              {pagesLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array(6)
                    .fill(0)
                    .map((_, i) => (
                      <div
                        key={i}
                        className="bg-white p-5 rounded-2xl border border-gray-200 animate-pulse space-y-3 h-[240px]"
                      >
                        <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                        <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-full"></div>
                        <div className="h-8 bg-gray-200 rounded-xl mt-6"></div>
                      </div>
                    ))}
                </div>
              ) : pages.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
                  <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-base font-semibold text-gray-800">
                    No pages found
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {pagesSearch || pagesContentType
                      ? "No pages matched your filter or search query."
                      : "This user does not own any pages yet."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pages.map((pg) => {
                    return (
                      <div
                        key={pg._id}
                        className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md hover:border-orange-300 transition-all flex flex-col justify-between"
                      >
                        <div>
                          {/* Page Image & Header */}
                          <div className="flex items-start gap-3">
                            {pg.image ? (
                              <img
                                src={pg.image}
                                alt={pg.name}
                                className="w-12 h-12 rounded-full object-cover border border-gray-200 flex-shrink-0"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-orange-100 text-[#DE4B12] flex items-center justify-center flex-shrink-0 font-bold text-base border border-orange-200 shadow-sm">
                                {pg.name ? pg.name.charAt(0).toUpperCase() : "P"}
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <h3
                                className="font-semibold text-gray-900 truncate"
                                title={pg.name}
                              >
                                {pg.name}
                              </h3>
                              <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                                {pg.about || "No description available"}
                              </p>
                            </div>
                          </div>

                          {/* Page Badges */}
                          <div className="mt-4 flex flex-wrap gap-1.5">
                          

                            {pg.topic && (
                              <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-gray-100 text-gray-700">
                                {pg.topic}
                              </span>
                            )}

                            {pg.pageType && (
                              <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-gray-100 text-gray-700 capitalize">
                                {pg.pageType}
                              </span>
                            )}
                          </div>

                          {/* Stats */}
                          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                            <span>
                              Followers:{" "}
                              <strong className="text-gray-800">
                                {pg.followersCount ?? 0}
                              </strong>
                            </span>
                            <span>
                              User Posts:{" "}
                              <strong className="text-[#DE4B12]">
                                {pg.postCount ?? pg.userPostsCount ?? 0}
                              </strong>
                            </span>
                          </div>
                        </div>

                        {/* View Posts Button */}
                        <button
                          onClick={() => handleSelectPage(pg)}
                          className="mt-4 w-full py-2 px-3 bg-orange-50 hover:bg-[#DE4B12] text-[#DE4B12] hover:text-white border border-orange-200 hover:border-transparent text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>
                            View Posts ({pg.postCount ?? pg.userPostsCount ?? 0})
                          </span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Pages Pagination */}
              {!pagesLoading && pagesPagination.totalPages > 1 && (
                <div className="mt-8 flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-200">
                  <span className="text-xs text-gray-500">
                    Page {pagesPagination.currentPage} of{" "}
                    {pagesPagination.totalPages} ({pagesPagination.totalItems} pages)
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setPagesPagination((prev) => ({
                          ...prev,
                          currentPage: Math.max(1, prev.currentPage - 1),
                        }))
                      }
                      disabled={pagesPagination.currentPage <= 1}
                      className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-orange-50 hover:text-[#DE4B12] disabled:opacity-40"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() =>
                        setPagesPagination((prev) => ({
                          ...prev,
                          currentPage: Math.min(
                            pagesPagination.totalPages,
                            prev.currentPage + 1
                          ),
                        }))
                      }
                      disabled={
                        pagesPagination.currentPage >=
                        pagesPagination.totalPages
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
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ACTIVE SUBSCRIPTIONS                                               */}
      {/* ========================================================================= */}
      {activeTab === "activeSubscriptions" && (
        <div>
          {/* Subscriptions Search */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#DE4B12]" />
              <h2 className="text-base font-bold text-gray-900">
                Active Page Collections ({subPagination.totalItems})
              </h2>
            </div>

            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={subSearch}
                onChange={handleSubSearchChange}
                placeholder="Search collections..."
                className="w-full h-9 pl-9 pr-8 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-[#DE4B12]"
              />
              {subSearch && (
                <button
                  onClick={() => {
                    setSubSearch("");
                    setDebouncedSubSearch("");
                    setSubPagination((prev) => ({ ...prev, currentPage: 1 }));
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Subscriptions Grid */}
          {subLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array(4)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className="bg-white p-5 rounded-2xl border border-gray-200 animate-pulse space-y-3 h-[200px]"
                  >
                    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-16 bg-gray-200 rounded-xl"></div>
                  </div>
                ))}
            </div>
          ) : subscriptions.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
              <Layers className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-gray-800">
                No active subscriptions found
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {subSearch
                  ? "No collections matching your search query."
                  : "This user does not have any active page collections."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {subscriptions.map((collection) => (
                <div
                  key={collection._id}
                  className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between pb-3 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      {collection.image ? (
                        <img
                          src={collection.image}
                          alt={collection.name}
                          className="w-12 h-12 rounded-xl object-cover border border-gray-200 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-orange-100 text-[#DE4B12] flex items-center justify-center font-bold text-base flex-shrink-0">
                          {collection.name
                            ? collection.name.charAt(0).toUpperCase()
                            : "C"}
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {collection.name}
                        </h3>
                        <p className="text-xs text-gray-400">
                          Created{" "}
                          {new Date(collection.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-50 text-[#DE4B12] border border-orange-200">
                      {collection.pagesCount ?? collection.pages?.length ?? 0}{" "}
                      Pages
                    </span>
                  </div>

                  {/* Included Pages list */}
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Included Pages:
                    </p>
                    {Array.isArray(collection.pages) &&
                    collection.pages.length > 0 ? (
                      <div className="space-y-2">
                        {collection.pages.map((p) => (
                          <div
                            key={p._id}
                            className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-xs"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <BookOpen className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
                              <span className="font-medium text-gray-800 truncate">
                                {p.name}
                              </span>
                              {p.topic && (
                                <span className="text-[10px] text-gray-400">
                                  ({p.topic})
                                </span>
                              )}
                            </div>
                            <span className="text-gray-500 flex-shrink-0">
                              {p.followersCount ?? 0} followers
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic">
                        No pages listed in this collection.
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Subscriptions Pagination */}
          {!subLoading && subPagination.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-200">
              <span className="text-xs text-gray-500">
                Page {subPagination.currentPage} of {subPagination.totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setSubPagination((prev) => ({
                      ...prev,
                      currentPage: Math.max(1, prev.currentPage - 1),
                    }))
                  }
                  disabled={subPagination.currentPage <= 1}
                  className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-orange-50 hover:text-[#DE4B12] disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() =>
                    setSubPagination((prev) => ({
                      ...prev,
                      currentPage: Math.min(
                        subPagination.totalPages,
                        prev.currentPage + 1
                      ),
                    }))
                  }
                  disabled={
                    subPagination.currentPage >= subPagination.totalPages
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
      {/* TAB 3: SAVED SUBSCRIPTIONS                                                */}
      {/* ========================================================================= */}
      {activeTab === "savedSubscriptions" && (
        <div>
          {/* Saved Subscriptions Search */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-bold text-gray-900">
                Saved Subscription Collections ({savedSubPagination.totalItems})
              </h2>
            </div>

            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={savedSubSearch}
                onChange={handleSavedSubSearchChange}
                placeholder="Search saved collections..."
                className="w-full h-9 pl-9 pr-8 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-[#DE4B12]"
              />
              {savedSubSearch && (
                <button
                  onClick={() => {
                    setSavedSubSearch("");
                    setDebouncedSavedSubSearch("");
                    setSavedSubPagination((prev) => ({ ...prev, currentPage: 1 }));
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Saved Subscriptions Grid */}
          {savedSubLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array(4)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className="bg-white p-5 rounded-2xl border border-gray-200 animate-pulse space-y-3 h-[200px]"
                  >
                    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-16 bg-gray-200 rounded-xl"></div>
                  </div>
                ))}
            </div>
          ) : savedSubs.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
              <Bookmark className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-gray-800">
                No saved subscriptions
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {savedSubSearch
                  ? "No collections matching your search query."
                  : "This user has not saved any subscriptions yet."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {savedSubs.map((collection) => (
                <div
                  key={collection._id}
                  className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between pb-3 border-b border-gray-100">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {collection.name}
                      </h3>
                      {collection.user && typeof collection.user === "object" && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          Owner:{" "}
                          <span className="font-medium text-gray-800">
                            {collection.user.name}
                          </span>
                          {collection.user.username && (
                            <span className="text-orange-600 ml-1">
                              (@{collection.user.username})
                            </span>
                          )}
                        </p>
                      )}
                      {collection.savedAt && (
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          Saved on{" "}
                          {new Date(collection.savedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {collection.pagesCount ?? collection.pages?.length ?? 0}{" "}
                      Pages
                    </span>
                  </div>

                  {/* Included Pages list */}
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Pages in this Collection:
                    </p>
                    {Array.isArray(collection.pages) &&
                    collection.pages.length > 0 ? (
                      <div className="space-y-2">
                        {collection.pages.map((p) => (
                          <div
                            key={p._id}
                            className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-xs"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <BookOpen className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                              <span className="font-medium text-gray-800 truncate">
                                {p.name}
                              </span>
                              {p.topic && (
                                <span className="text-[10px] text-gray-400">
                                  ({p.topic})
                                </span>
                              )}
                            </div>
                            <span className="text-gray-500 flex-shrink-0">
                              {p.followersCount ?? 0} followers
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic">
                        No pages in this collection.
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Saved Subscriptions Pagination */}
          {!savedSubLoading && savedSubPagination.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-200">
              <span className="text-xs text-gray-500">
                Page {savedSubPagination.currentPage} of{" "}
                {savedSubPagination.totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setSavedSubPagination((prev) => ({
                      ...prev,
                      currentPage: Math.max(1, prev.currentPage - 1),
                    }))
                  }
                  disabled={savedSubPagination.currentPage <= 1}
                  className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-orange-50 hover:text-[#DE4B12] disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() =>
                    setSavedSubPagination((prev) => ({
                      ...prev,
                      currentPage: Math.min(
                        savedSubPagination.totalPages,
                        prev.currentPage + 1
                      ),
                    }))
                  }
                  disabled={
                    savedSubPagination.currentPage >=
                    savedSubPagination.totalPages
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

      {/* Confirmation Modal for Suspension */}
      {suspensionModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-gray-200 overflow-hidden animate-scaleIn">
            <div className="p-6">
              <div className="flex items-center gap-3">
                <div
                  className={`p-3 rounded-2xl ${
                    suspensionModal.isSuspendedTarget
                      ? "bg-red-100 text-red-600"
                      : "bg-emerald-100 text-emerald-600"
                  }`}
                >
                  {suspensionModal.isSuspendedTarget ? (
                    <AlertTriangle className="w-6 h-6" />
                  ) : (
                    <UserCheck className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {suspensionModal.isSuspendedTarget
                      ? "Suspend User Account"
                      : "Restore User Account"}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {user.name} ({user.email})
                  </p>
                </div>
              </div>

              <div className="mt-4 text-sm text-gray-600 space-y-2 bg-gray-50 p-4 rounded-xl border border-gray-200/80">
                {suspensionModal.isSuspendedTarget ? (
                  <>
                    <p className="font-medium text-gray-800">
                      Are you sure you want to suspend this user?
                    </p>
                    <ul className="list-disc list-inside text-xs space-y-1 text-gray-600">
                      <li>All active login and device sessions will be revoked.</li>
                      <li>Login via password, social, and OTP will be rejected.</li>
                      <li>
                        All standard and knowledge posts will be hidden from feeds.
                      </li>
                      <li>
                        Admin endpoints will still be able to inspect their data.
                      </li>
                    </ul>
                  </>
                ) : (
                  <p>
                    Restoring this account will allow the user to log in again and
                    unhide all of their existing posts and knowledge items in user feeds.
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setSuspensionModal({
                      isOpen: false,
                      loading: false,
                      isSuspendedTarget: false,
                    })
                  }
                  disabled={suspensionModal.loading}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleToggleSuspension}
                  disabled={suspensionModal.loading}
                  className={`px-5 py-2 rounded-xl text-sm font-semibold text-white shadow-md inline-flex items-center gap-2 transition ${
                    suspensionModal.isSuspendedTarget
                      ? "bg-red-600 hover:bg-red-700 disabled:bg-red-400"
                      : "bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400"
                  }`}
                >
                  {suspensionModal.loading && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                  <span>
                    {suspensionModal.isSuspendedTarget
                      ? "Confirm Suspension"
                      : "Confirm Restore"}
                  </span>
                </button>
              </div>
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
                Author: {postActionModal.post.author?.name || user?.name || "Author"}
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

export default UserDetails;
