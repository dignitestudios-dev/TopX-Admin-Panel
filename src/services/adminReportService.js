import axios from "../axios";

/**
 * Admin Report Review API Service
 * Interacts with TopX backend report review endpoints
 */

/**
 * Get paginated list of reports
 * @param {Object} params - { page, limit, search, status, contentType }
 */
export const getAdminReports = async ({
  page = 1,
  limit = 10,
  search = "",
  status = "all",
  contentType = "all",
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

  if (contentType && contentType !== "all") {
    queryParams.append("contentType", contentType);
  } else {
    queryParams.append("contentType", "all");
  }

  const response = await axios.get(`/admin/reports?${queryParams.toString()}`);
  return response.data;
};

/**
 * Get single report for detailed review
 * @param {string} reportId - Mongo ObjectId of report
 */
export const getAdminReport = async (reportId) => {
  if (!reportId) {
    throw new Error("reportId is required");
  }
  const response = await axios.get(`/admin/reports/${encodeURIComponent(reportId)}`);
  return response.data;
};

/**
 * Update report status (mark resolved or rejected)
 * @param {string} reportId
 * @param {Object} data - { status: 'resolved' | 'rejected', resolutionNote?: string }
 */
export const updateAdminReportStatus = async (
  reportId,
  { status, resolutionNote = "" } = {}
) => {
  if (!reportId) {
    throw new Error("reportId is required");
  }
  if (!status || !["resolved", "rejected"].includes(status)) {
    throw new Error("status must be 'resolved' or 'rejected'");
  }

  const payload = {
    status,
  };

  if (resolutionNote !== undefined && resolutionNote !== null) {
    payload.resolutionNote = resolutionNote.trim().slice(0, 1000);
  }

  const response = await axios.patch(
    `/admin/reports/${encodeURIComponent(reportId)}/status`,
    payload
  );
  return response.data;
};
