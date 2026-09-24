import axios from "../axios";

/**
 * Admin User Management API Service
 * Interacts with TopX backend admin user endpoints
 */

/**
 * Admin login
 * @param {Object} credentials - { email, password }
 */
export const adminLogin = async ({ email, password }) => {
  const response = await axios.post("/auth/signIn", {
    email: email.trim(),
    password,
    role: "admin",
  });
  return response.data;
};

/**
 * Get paginated list of users
 * @param {Object} params - { page, limit, search, status }
 */
export const getAdminUsers = async ({
  page = 1,
  limit = 10,
  search = "",
  status = "all",
} = {}) => {
  const queryParams = new URLSearchParams();
  queryParams.append("page", Math.max(1, parseInt(page, 10) || 1));
  queryParams.append("limit", Math.min(100, Math.max(1, parseInt(limit, 10) || 10)));

  if (search && search.trim()) {
    queryParams.append("search", search.trim());
  }

  if (status && status !== "all") {
    queryParams.append("status", status);
  } else {
    queryParams.append("status", "all");
  }

  const response = await axios.get(`/admin/users?${queryParams.toString()}`);
  return response.data;
};

/**
 * Get individual user profile with summary counts
 * @param {string} userId - Mongo ObjectId of user
 */
export const getAdminUserProfile = async (userId) => {
  if (!userId) {
    throw new Error("userId is required");
  }
  const response = await axios.get(`/admin/users/${encodeURIComponent(userId)}`);
  return response.data;
};

/**
 * Get pages owned by a user
 * @param {string} userId
 * @param {Object} params - { page, limit, search, contentType }
 */
export const getAdminUserPages = async (
  userId,
  { page = 1, limit = 10, search = "", contentType = "" } = {}
) => {
  if (!userId) {
    throw new Error("userId is required");
  }
  const queryParams = new URLSearchParams();
  queryParams.append("page", Math.max(1, parseInt(page, 10) || 1));
  queryParams.append("limit", Math.min(100, Math.max(1, parseInt(limit, 10) || 10)));

  if (search && search.trim()) {
    queryParams.append("search", search.trim());
  }

  if (contentType && (contentType === "post" || contentType === "knowledge")) {
    queryParams.append("contentType", contentType);
  }

  const response = await axios.get(
    `/admin/users/${encodeURIComponent(userId)}/pages?${queryParams.toString()}`
  );
  return response.data;
};

/**
 * Get user's posts within an owned page
 * @param {string} userId
 * @param {string} pageId
 * @param {Object} params - { page, limit, search }
 */
export const getAdminUserPagePosts = async (
  userId,
  pageId,
  { page = 1, limit = 10, search = "" } = {}
) => {
  if (!userId || !pageId) {
    throw new Error("userId and pageId are required");
  }
  const queryParams = new URLSearchParams();
  queryParams.append("page", Math.max(1, parseInt(page, 10) || 1));
  queryParams.append("limit", Math.min(100, Math.max(1, parseInt(limit, 10) || 10)));

  if (search && search.trim()) {
    queryParams.append("search", search.trim());
  }

  const response = await axios.get(
    `/admin/users/${encodeURIComponent(userId)}/pages/${encodeURIComponent(
      pageId
    )}/posts?${queryParams.toString()}`
  );
  return response.data;
};

/**
 * Get active subscriptions (owned non-empty page collections)
 * @param {string} userId
 * @param {Object} params - { page, limit, search }
 */
export const getAdminUserSubscriptions = async (
  userId,
  { page = 1, limit = 10, search = "" } = {}
) => {
  if (!userId) {
    throw new Error("userId is required");
  }
  const queryParams = new URLSearchParams();
  queryParams.append("page", Math.max(1, parseInt(page, 10) || 1));
  queryParams.append("limit", Math.min(100, Math.max(1, parseInt(limit, 10) || 10)));

  if (search && search.trim()) {
    queryParams.append("search", search.trim());
  }

  const response = await axios.get(
    `/admin/users/${encodeURIComponent(userId)}/subscriptions?${queryParams.toString()}`
  );
  return response.data;
};

/**
 * Get saved subscriptions (collections saved by this user)
 * @param {string} userId
 * @param {Object} params - { page, limit, search }
 */
export const getAdminUserSavedSubscriptions = async (
  userId,
  { page = 1, limit = 10, search = "" } = {}
) => {
  if (!userId) {
    throw new Error("userId is required");
  }
  const queryParams = new URLSearchParams();
  queryParams.append("page", Math.max(1, parseInt(page, 10) || 1));
  queryParams.append("limit", Math.min(100, Math.max(1, parseInt(limit, 10) || 10)));

  if (search && search.trim()) {
    queryParams.append("search", search.trim());
  }

  const response = await axios.get(
    `/admin/users/${encodeURIComponent(
      userId
    )}/saved-subscriptions?${queryParams.toString()}`
  );
  return response.data;
};

/**
 * Suspend or restore user
 * @param {string} userId
 * @param {boolean} isSuspended
 */
export const setAdminUserSuspension = async (userId, isSuspended) => {
  if (!userId) {
    throw new Error("userId is required");
  }
  const response = await axios.patch(
    `/admin/users/${encodeURIComponent(userId)}/suspension`,
    {
      isSuspended: Boolean(isSuspended),
    }
  );
  return response.data;
};
