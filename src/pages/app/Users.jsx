import { useState, useEffect, useCallback, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Search,
  X,
  UserX,
  UserCheck,
  AlertTriangle,
  Loader2,
  Users as UsersIcon,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router";
import { getAdminUsers, setAdminUserSuspension } from "../../services/adminUserService";
import { SuccessToast, ErrorToast } from "../../components/global/Toaster";
import UserAvatar from "../../components/common/UserAvatar";

const Users = () => {
  const navigate = useNavigate();

  // State
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    totalPages: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Filters & Search
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Suspension confirmation modal state
  const [suspensionModal, setSuspensionModal] = useState({
    isOpen: false,
    user: null,
    isSuspendedTarget: false,
    loading: false,
  });

  // Debounce search input (350ms)
  const searchTimeoutRef = useRef(null);
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchInput(val);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(val);
      setPagination((prev) => ({ ...prev, currentPage: 1 }));
    }, 350);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setDebouncedSearch("");
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  // Fetch Users
  const fetchUsers = useCallback(
    async (page = 1) => {
      try {
        setIsLoading(true);
        setFetchError(null);

        const res = await getAdminUsers({
          page,
          limit: 10,
          search: debouncedSearch,
          status: statusFilter,
        });

        if (res && res.success) {
          setUsers(res.data || []);
          setPagination(
            res.pagination || {
              currentPage: page,
              itemsPerPage: 10,
              totalItems: (res.data || []).length,
              totalPages: 1,
            }
          );
        } else {
          setFetchError(res?.message || "Failed to load users");
        }
      } catch (err) {
        console.error("Error fetching users:", err);
        const safeMessage =
          err?.response?.data?.message ||
          err?.message ||
          "Unable to load users. Please check your connection and try again.";
        setFetchError(safeMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [debouncedSearch, statusFilter]
  );

  // Trigger fetch on filter/search or page change
  useEffect(() => {
    fetchUsers(pagination.currentPage);
  }, [fetchUsers, pagination.currentPage]);

  // Handle status filter tab click
  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  // Suspend/Restore User Action
  const openSuspensionConfirm = (user, e) => {
    if (e) e.stopPropagation();
    setSuspensionModal({
      isOpen: true,
      user,
      isSuspendedTarget: !user.isSuspended,
      loading: false,
    });
  };

  const closeSuspensionModal = () => {
    if (suspensionModal.loading) return;
    setSuspensionModal({
      isOpen: false,
      user: null,
      isSuspendedTarget: false,
      loading: false,
    });
  };

  const handleConfirmSuspension = async () => {
    const { user, isSuspendedTarget } = suspensionModal;
    if (!user) return;

    try {
      setSuspensionModal((prev) => ({ ...prev, loading: true }));
      const res = await setAdminUserSuspension(user._id, isSuspendedTarget);

      if (res && res.success) {
        SuccessToast(
          res.message ||
            (isSuspendedTarget
              ? "User suspended successfully"
              : "User restored successfully")
        );

        // Update user status locally in the list
        setUsers((prev) =>
          prev.map((u) =>
            u._id === user._id
              ? {
                  ...u,
                  isSuspended: isSuspendedTarget,
                  isDeactivatedByAdmin: isSuspendedTarget,
                }
              : u
          )
        );

        // Refetch to ensure all stats & filters align
        fetchUsers(pagination.currentPage);
      } else {
        ErrorToast(res?.message || "Action failed");
      }
    } catch (err) {
      console.error("Suspension error:", err);
      const safeMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update user suspension state";
      ErrorToast(safeMessage);
    } finally {
      closeSuspensionModal();
    }
  };

  const handleRowClick = (userId) => {
    navigate(`/app/user-details/${userId}`);
  };

  // Skeleton Card Loader
  const SkeletonCard = () => (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm animate-pulse flex flex-col justify-between h-[280px]">
      <div>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gray-200 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-5 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
        <div className="mt-6 flex justify-between items-center pt-4 border-t border-gray-100">
          <div className="h-6 bg-gray-200 rounded-full w-20"></div>
          <div className="h-4 bg-gray-200 rounded w-28"></div>
        </div>
      </div>
      <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
        <div className="h-9 bg-gray-200 rounded-lg flex-1"></div>
        <div className="h-9 bg-gray-200 rounded-lg w-24"></div>
      </div>
    </div>
  );

  return (
    <div className="p-6 min-h-screen bg-gray-50/50 font-sans pb-16">
      {/* Page Header */}
      <div className="p-6 md:p-8 rounded-2xl bg-white shadow-sm border border-orange-200/60 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-100 text-[#DE4B12] rounded-xl">
              <UsersIcon className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                User Management
              </h1>
              <p className="text-gray-500 text-sm mt-0.5">
                Inspect user profiles, manage accounts, and view owned content.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stat Pill */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-orange-50 border border-orange-200 rounded-xl text-center">
            <span className="text-xs text-orange-600 font-medium block">
              Total Users
            </span>
            <span className="text-lg font-bold text-[#DE4B12]">
              {pagination.totalItems || 0}
            </span>
          </div>
          <button
            onClick={() => fetchUsers(pagination.currentPage)}
            disabled={isLoading}
            className="p-2.5 rounded-xl border border-gray-200 text-gray-600 hover:text-[#DE4B12] hover:border-orange-200 hover:bg-orange-50 transition shadow-sm"
            title="Refresh Users"
          >
            <RefreshCw
              className={`w-5 h-5 ${isLoading ? "animate-spin text-[#DE4B12]" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Controls Bar: Search & Status Filters */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl w-full md:w-auto">
          {[
            { key: "all", label: "All Users" },
            { key: "active", label: "Active" },
            { key: "suspended", label: "Suspended" },
          ].map((tab) => {
            const isActive = statusFilter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => handleStatusFilterChange(tab.key)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all flex-1 md:flex-none text-center ${
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

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchInput}
            onChange={handleSearchChange}
            placeholder="Search name, username, email..."
            className="w-full h-10 pl-10 pr-9 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-[#DE4B12] transition"
          />
          {searchInput && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded-full"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Error State */}
      {fetchError && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-red-500" />
            <span className="text-sm font-medium">{fetchError}</span>
          </div>
          <button
            onClick={() => fetchUsers(pagination.currentPage)}
            className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition"
          >
            Retry
          </button>
        </div>
      )}

      {/* Content Area: Loading / Empty / Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array(8)
            .fill(0)
            .map((_, idx) => (
              <SkeletonCard key={idx} />
            ))}
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center my-6">
          <div className="w-16 h-16 bg-orange-100 text-[#DE4B12] rounded-full flex items-center justify-center mx-auto mb-4">
            <UsersIcon className="w-8 h-8 opacity-75" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">
            No users found
          </h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto mt-1 mb-5">
            {searchInput || statusFilter !== "all"
              ? "We couldn't find any users matching your current filters. Try changing or clearing your search."
              : "There are currently no user accounts registered in the system."}
          </p>
          {(searchInput || statusFilter !== "all") && (
            <button
              onClick={() => {
                handleClearSearch();
                setStatusFilter("all");
              }}
              className="px-4 py-2 bg-orange-50 text-[#DE4B12] border border-orange-200 rounded-xl text-sm font-medium hover:bg-orange-100 transition"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {users.map((user) => {
            const isSuspended = Boolean(user.isSuspended);
            const joinedDate = user.createdAt
              ? new Date(user.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : "N/A";

            return (
              <div
                key={user._id}
                onClick={() => handleRowClick(user._id)}
                className="group bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md hover:border-orange-300 transition-all duration-200 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Top: Avatar & Name */}
                  <div className="flex items-start gap-4">
                    <UserAvatar
                      src={user.profilePicture}
                      name={user.name || "User"}
                      size="lg"
                      className="border-2 border-orange-100 group-hover:border-orange-300 transition"
                    />
                    <div className="flex-1 min-w-0">
                      <h3
                        className="font-semibold text-gray-900 truncate group-hover:text-[#DE4B12] transition"
                        title={user.name}
                      >
                        {user.name || "Unnamed User"}
                      </h3>
                      {user.username && (
                        <p className="text-xs text-orange-600 font-medium truncate">
                          @{user.username}
                        </p>
                      )}
                      <p
                        className="text-xs text-gray-500 truncate mt-0.5"
                        title={user.email}
                      >
                        {user.email || "No email"}
                      </p>
                    </div>
                  </div>

                  {/* Badges & Joined info */}
                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full font-semibold border ${
                        isSuspended
                          ? "bg-red-50 text-red-700 border-red-200"
                          : "bg-emerald-50 text-emerald-700 border-emerald-200"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                          isSuspended ? "bg-red-500" : "bg-emerald-500"
                        }`}
                      ></span>
                      {isSuspended ? "Suspended" : "Active"}
                    </span>

                    <span className="text-gray-400">Joined {joinedDate}</span>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRowClick(user._id);
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-gray-50 hover:bg-orange-50 text-gray-700 hover:text-[#DE4B12] border border-gray-200 hover:border-orange-200 text-xs font-semibold rounded-xl transition"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Profile</span>
                  </button>

                  <button
                    onClick={(e) => openSuspensionConfirm(user, e)}
                    className={`py-2 px-3 border text-xs font-semibold rounded-xl transition inline-flex items-center gap-1 ${
                      isSuspended
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                        : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                    }`}
                    title={isSuspended ? "Restore user" : "Suspend user"}
                  >
                    {isSuspended ? (
                      <>
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Restore</span>
                      </>
                    ) : (
                      <>
                        <UserX className="w-3.5 h-3.5" />
                        <span>Suspend</span>
                      </>
                    )}
                  </button>
                </div>
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
            ({pagination.totalItems} total users)
          </div>

          <div className="flex items-center gap-1.5">
            {/* Prev Button */}
            <button
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  currentPage: Math.max(1, prev.currentPage - 1),
                }))
              }
              disabled={pagination.currentPage <= 1}
              className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-orange-50 hover:text-[#DE4B12] hover:border-orange-200 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-gray-600 transition shadow-sm"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Page Numbers */}
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter((page) => {
                // Show pages close to current page or first/last
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
                          : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      {page}
                    </button>
                  </div>
                );
              })}

            {/* Next Button */}
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
              className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-orange-50 hover:text-[#DE4B12] hover:border-orange-200 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-gray-600 transition shadow-sm"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Suspension / Restore */}
      {suspensionModal.isOpen && suspensionModal.user && (
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
                    Target: {suspensionModal.user.name} ({suspensionModal.user.email})
                  </p>
                </div>
              </div>

              <div className="mt-4 text-sm text-gray-600 space-y-2 bg-gray-50 p-4 rounded-xl border border-gray-200/80">
                {suspensionModal.isSuspendedTarget ? (
                  <>
                    <p className="font-medium text-gray-800">
                      When you suspend this user:
                    </p>
                    <ul className="list-disc list-inside text-xs space-y-1 text-gray-600">
                      <li>All active login and device sessions will be revoked.</li>
                      <li>They will not be able to log in or access their account.</li>
                      <li>
                        Their posts and knowledge items will be hidden from feeds.
                      </li>
                      <li>Their data will remain saved for admin inspection.</li>
                    </ul>
                  </>
                ) : (
                  <p>
                    Restoring this user will re-enable their account. Their posts
                    and knowledge entries will become visible again, and they will
                    be able to log in.
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeSuspensionModal}
                  disabled={suspensionModal.loading}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSuspension}
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
    </div>
  );
};

export default Users;
