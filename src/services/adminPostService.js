import axios from "../axios";

/**
 * Admin Post Management API Service
 */

/**
 * Soft-delete a post
 * @param {string} postId
 */
export const deleteAdminPost = async (postId) => {
  if (!postId) {
    throw new Error("postId is required");
  }
  const response = await axios.delete(`/admin/posts/${encodeURIComponent(postId)}`);
  return response.data;
};

/**
 * Recover a soft-deleted post
 * @param {string} postId
 */
export const recoverAdminPost = async (postId) => {
  if (!postId) {
    throw new Error("postId is required");
  }
  const response = await axios.patch(`/admin/posts/${encodeURIComponent(postId)}/recover`);
  return response.data;
};
