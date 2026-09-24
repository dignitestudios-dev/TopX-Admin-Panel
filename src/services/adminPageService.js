import axios from "../axios";

/**
 * Admin Page Management API Service
 * Interacts with TopX backend admin page management endpoints (/admin/pages)
 */

/**
 * List all standard and knowledge pages
 * @param {Object} params - { page, limit, search, contentType, pageType }
 */
export const getAdminPages = async ({
  page = 1,
  limit = 10,
  search = "",
  contentType = "all",
  pageType = "all",
} = {}) => {
  const queryParams = new URLSearchParams();
  queryParams.append("page", Math.max(1, parseInt(page, 10) || 1));
  queryParams.append("limit", Math.min(100, Math.max(1, parseInt(limit, 10) || 10)));

  if (search && search.trim()) {
    queryParams.append("search", search.trim());
  }

  if (contentType && contentType !== "all") {
    queryParams.append("contentType", contentType);
  } else {
    queryParams.append("contentType", "all");
  }

  if (pageType && pageType !== "all") {
    queryParams.append("pageType", pageType);
  } else {
    queryParams.append("pageType", "all");
  }

  const response = await axios.get(`/admin/pages?${queryParams.toString()}`);
  return response.data;
};

/**
 * Get details for a single page
 * @param {string} pageId
 */
export const getAdminPage = async (pageId) => {
  if (!pageId) {
    throw new Error("pageId is required");
  }
  const response = await axios.get(`/admin/pages/${encodeURIComponent(pageId)}`);
  return response.data;
};

/**
 * List published posts within a page
 * @param {string} pageId
 * @param {Object} params - { page, limit, search }
 */
export const getAdminPagePosts = async (
  pageId,
  { page = 1, limit = 10, search = "" } = {}
) => {
  if (!pageId) {
    throw new Error("pageId is required");
  }
  const queryParams = new URLSearchParams();
  queryParams.append("page", Math.max(1, parseInt(page, 10) || 1));
  queryParams.append("limit", Math.min(100, Math.max(1, parseInt(limit, 10) || 10)));

  if (search && search.trim()) {
    queryParams.append("search", search.trim());
  }

  const response = await axios.get(
    `/admin/pages/${encodeURIComponent(pageId)}/posts?${queryParams.toString()}`
  );
  return response.data;
};

/**
 * Get one post detail from a page
 * @param {string} pageId
 * @param {string} postId
 */
export const getAdminPagePost = async (pageId, postId) => {
  if (!pageId || !postId) {
    throw new Error("pageId and postId are required");
  }
  const response = await axios.get(
    `/admin/pages/${encodeURIComponent(pageId)}/posts/${encodeURIComponent(postId)}`
  );
  return response.data;
};

/**
 * Get paginated comments for a post
 * @param {string} pageId
 * @param {string} postId
 * @param {Object} params - { page, limit, search }
 */
export const getAdminPagePostComments = async (
  pageId,
  postId,
  { page = 1, limit = 10, search = "" } = {}
) => {
  if (!pageId || !postId) {
    throw new Error("pageId and postId are required");
  }
  const queryParams = new URLSearchParams();
  queryParams.append("page", Math.max(1, parseInt(page, 10) || 1));
  queryParams.append("limit", Math.min(100, Math.max(1, parseInt(limit, 10) || 10)));

  if (search && search.trim()) {
    queryParams.append("search", search.trim());
  }

  const response = await axios.get(
    `/admin/pages/${encodeURIComponent(pageId)}/posts/${encodeURIComponent(
      postId
    )}/comments?${queryParams.toString()}`
  );
  return response.data;
};
