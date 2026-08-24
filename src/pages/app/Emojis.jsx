import React, { useState, useEffect, useRef } from "react";
import {
  Smile,
  UploadCloud,
  Trash2,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  Sparkles,
  Image as ImageIcon,
} from "lucide-react";
import axios from "../../axios";
import { ErrorToast, SuccessToast } from "../../components/global/Toaster";

const Emojis = () => {
  const [emojis, setEmojis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 12;

  // Upload modal states
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [emojiName, setEmojiName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Delete modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [emojiToDelete, setEmojiToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Preview / Inspect modal states
  const [viewingEmoji, setViewingEmoji] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Fetch Emojis with pagination
  const fetchEmojis = async (page = 1) => {
    setLoading(true);
    try {
      const res = await axios.get("/emojis", {
        params: { page, limit },
      });

      if (res.data?.success || res.data?.status === "success") {
        setEmojis(res.data?.data || []);
        if (res.data?.pagination) {
          setTotalPages(res.data.pagination.totalPages || 1);
          setTotalItems(res.data.pagination.totalItems || 0);
          setCurrentPage(res.data.pagination.currentPage || page);
        }
      } else {
        ErrorToast(res.data?.message || "Failed to fetch emojis");
      }
    } catch (err) {
      console.error("Error fetching emojis:", err);
      ErrorToast(err.response?.data?.message || "Failed to load emojis");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmojis(currentPage);
  }, [currentPage]);

  // Handle File selection
  const handleFileSelect = (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      ErrorToast("Please select a valid image file (PNG, JPG, SVG, GIF, WEBP)");
      return;
    }

    setSelectedFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // Handle Drag & Drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  // Create / Upload Emoji API
  const handleUploadEmoji = async () => {
    if (!emojiName.trim()) {
      ErrorToast("Please enter emoji name");
      return;
    }

    if (!selectedFile) {
      ErrorToast("Please select an emoji image to upload");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("name", emojiName.trim());
      formData.append("image", selectedFile);

      const res = await axios.post("/emojis", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data?.status === "success" || res.data?.success) {
        SuccessToast(res.data?.message || "Emoji created successfully");
        setIsUploadModalOpen(false);
        setEmojiName("");
        setSelectedFile(null);
        setImagePreview(null);
        // Refresh list
        fetchEmojis(1);
        setCurrentPage(1);
      } else {
        ErrorToast(res.data?.message || "Failed to create emoji");
      }
    } catch (err) {
      console.error("Error uploading emoji:", err);
      ErrorToast(err.response?.data?.message || "Failed to upload emoji");
    } finally {
      setIsUploading(false);
    }
  };

  // Delete Emoji API
  const handleDeleteEmoji = async () => {
    if (!emojiToDelete?._id) return;

    setIsDeleting(true);
    try {
      const res = await axios.delete(`/emojis/${emojiToDelete._id}`);
      if (res.data?.status === "success" || res.data?.success) {
        SuccessToast(res.data?.message || "Emoji deleted successfully");
        setIsDeleteModalOpen(false);
        setEmojiToDelete(null);

        // If last item on current page and not on first page, go back 1 page
        if (emojis.length === 1 && currentPage > 1) {
          setCurrentPage((prev) => prev - 1);
        } else {
          fetchEmojis(currentPage);
        }
      } else {
        ErrorToast(res.data?.message || "Failed to delete emoji");
      }
    } catch (err) {
      console.error("Error deleting emoji:", err);
      ErrorToast(err.response?.data?.message || "Failed to delete emoji");
    } finally {
      setIsDeleting(false);
    }
  };

  // Copy URL to clipboard
  const handleCopyUrl = (url, id) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    SuccessToast("Emoji URL copied to clipboard!");
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  // Page change
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  // Skeleton Loader for Grid
  const SkeletonCard = () => (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm animate-pulse flex flex-col items-center">
      <div className="w-24 h-24 bg-gray-200 rounded-2xl mb-4"></div>
      <div className="w-3/4 h-4 bg-gray-200 rounded mb-2"></div>
      <div className="w-1/2 h-3 bg-gray-200 rounded mb-4"></div>
      <div className="w-full flex gap-2 pt-2 border-t border-gray-100">
        <div className="flex-1 h-8 bg-gray-200 rounded-lg"></div>
        <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
      </div>
    </div>
  );

  return (
    <div className="p-6 pt-2 space-y-6 min-h-screen text-gray-900">
      {/* Header Banner */}
      <div className="relative rounded-2xl p-8 bg-white shadow-xl border border-[#DE4B12] flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-orange-100 text-[#DE4B12]">
              <Smile className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#DE4B12] flex items-center gap-3">
                Emoji Management
                {totalItems > 0 && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-100 text-[#DE4B12] border border-[#DE4B12]/30">
                    {totalItems} total
                  </span>
                )}
              </h1>
              <p className="text-gray-500 text-sm mt-0.5">
                Upload, manage, and delete custom platform emojis
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            setSelectedFile(null);
            setImagePreview(null);
            setIsUploadModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#E56F41] to-[#DE4B12] text-white font-medium rounded-xl shadow-lg hover:shadow-orange-200 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
        >
          <UploadCloud className="w-5 h-5" />
          <span>Upload Emoji</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-[#DE4B12]/20">
        {/* Content Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#DE4B12]" /> Available Emojis
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Click on an emoji to inspect or use actions to copy URL / delete.
            </p>
          </div>

          <div className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg">
            Showing Page {currentPage} of {totalPages || 1}
          </div>
        </div>

        {/* Emojis Grid */}
        <div className="mt-6">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
              {Array.from({ length: 12 }).map((_, idx) => (
                <SkeletonCard key={idx} />
              ))}
            </div>
          ) : emojis.length === 0 ? (
            <div className="py-16 text-center flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center text-[#DE4B12] mb-4">
                <Smile className="w-10 h-10" />
              </div>
              <h3 className="text-lg font-bold text-gray-700">No Emojis Found</h3>
              <p className="text-sm text-gray-400 max-w-sm mt-1 mb-5">
                No custom emojis have been uploaded yet. Click the button below to upload your first emoji.
              </p>
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="px-4 py-2 bg-[#DE4B12] text-white rounded-lg font-medium text-sm hover:bg-orange-600 transition shadow"
              >
                + Upload Emoji
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
              {emojis.map((emoji) => (
                <div
                  key={emoji._id}
                  className="group relative bg-white border border-gray-200 hover:border-[#DE4B12] rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col items-center"
                >
                  {/* Delete Button (Quick Action Top-Right) */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEmojiToDelete(emoji);
                      setIsDeleteModalOpen(true);
                    }}
                    title="Delete emoji"
                    className="absolute top-2 right-2 p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 opacity-80 group-hover:opacity-100 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  {/* Emoji Preview Card */}
                  <div
                    onClick={() => setViewingEmoji(emoji)}
                    className="w-24 h-24 mt-2 rounded-xl bg-gradient-to-br from-gray-50 to-orange-50/30 border border-gray-100 flex items-center justify-center p-3 cursor-pointer group-hover:scale-105 transition-transform duration-200 overflow-hidden"
                  >
                    <img
                      src={emoji.url}
                      alt="Emoji"
                      className="max-w-full max-h-full object-contain filter drop-shadow-sm"
                      loading="lazy"
                    />
                  </div>

                  {/* Metadata */}
                  <div className="mt-3 w-full text-center">
                    <p className="text-sm font-semibold text-gray-800 truncate px-1" title={emoji.name || "Emoji"}>
                      {emoji.name || "Emoji"}
                    </p>
                    
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      {formatDate(emoji.createdAt)}
                    </p>
                  </div>

                  {/* Action Bar */}
                  <div className="w-full mt-3 pt-3 border-t border-gray-100 flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleCopyUrl(emoji.url, emoji._id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium bg-gray-50 hover:bg-orange-50 text-gray-700 hover:text-[#DE4B12] border border-gray-200 transition"
                      title="Copy URL"
                    >
                      {copiedId === emoji._id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-green-600" />
                          <span className="text-green-600 text-[11px]">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span className="text-[11px]">Copy URL</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => setViewingEmoji(emoji)}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-[#DE4B12] hover:bg-orange-50 border border-gray-200 transition"
                      title="View Details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-500">
              Page {currentPage} of {totalPages} ({totalItems} total emojis)
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:border-[#DE4B12] hover:text-[#DE4B12] disabled:opacity-40 disabled:hover:border-gray-300 disabled:hover:text-gray-600 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (page) =>
                    page === 1 ||
                    page === totalPages ||
                    Math.abs(page - currentPage) <= 1
                )
                .map((page, index, array) => {
                  const showEllipsis =
                    index > 0 && page - array[index - 1] > 1;
                  return (
                    <React.Fragment key={page}>
                      {showEllipsis && (
                        <span className="px-1 text-gray-400 text-sm">...</span>
                      )}
                      <button
                        onClick={() => handlePageChange(page)}
                        className={`min-w-[34px] h-[34px] rounded-lg text-xs font-semibold transition ${
                          currentPage === page
                            ? "bg-[#DE4B12] text-white shadow"
                            : "border border-gray-200 text-gray-700 hover:bg-orange-50 hover:border-[#DE4B12] hover:text-[#DE4B12]"
                        }`}
                      >
                        {page}
                      </button>
                    </React.Fragment>
                  );
                })}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:border-[#DE4B12] hover:text-[#DE4B12] disabled:opacity-40 disabled:hover:border-gray-300 disabled:hover:text-gray-600 disabled:cursor-not-allowed transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 🌟 UPLOAD EMOJI MODAL */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#E56F41] to-[#DE4B12] text-white px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Smile className="w-5 h-5" />
                <h3 className="font-semibold text-lg">Upload New Emoji</h3>
              </div>
              <button
                onClick={() => {
                  if (!isUploading) {
                    setIsUploadModalOpen(false);
                    setSelectedFile(null);
                    setImagePreview(null);
                  }
                }}
                disabled={isUploading}
                className="text-white/80 hover:text-white transition p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              {/* Emoji Name Input */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Emoji Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Fire, Heart, Thumbs Up"
                  value={emojiName}
                  onChange={(e) => setEmojiName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:border-[#DE4B12] focus:ring-1 focus:ring-[#DE4B12] focus:outline-none transition"
                />
              </div>

              {/* Dropzone */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Emoji Image <span className="text-red-500">*</span>
                </label>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center ${
                    isDragging
                      ? "border-[#DE4B12] bg-orange-50/50 scale-[1.01]"
                      : imagePreview
                      ? "border-green-300 bg-green-50/20"
                      : "border-gray-300 hover:border-[#DE4B12] hover:bg-orange-50/30"
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/png,image/jpeg,image/svg+xml,image/gif,image/webp"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileSelect(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />

                  {imagePreview ? (
                    <div className="flex flex-col items-center space-y-3">
                      <div className="w-28 h-28 p-2 bg-white rounded-xl border border-gray-200 shadow-inner flex items-center justify-center overflow-hidden">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-semibold text-gray-800 truncate max-w-[240px]">
                          {selectedFile?.name}
                        </p>
                        <p className="text-[11px] text-gray-400">
                          {(selectedFile?.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(null);
                          setImagePreview(null);
                        }}
                        className="text-xs text-red-500 hover:text-red-700 font-medium underline"
                      >
                        Change image
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="w-14 h-14 mx-auto rounded-full bg-orange-100 text-[#DE4B12] flex items-center justify-center">
                        <UploadCloud className="w-7 h-7" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-700">
                          Click or drag emoji image here
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Supports PNG, SVG, JPG, WEBP, GIF (Recommended: Transparent PNG, max 2MB)
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsUploadModalOpen(false);
                  setEmojiName("");
                  setSelectedFile(null);
                  setImagePreview(null);
                }}
                disabled={isUploading}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleUploadEmoji}
                disabled={!emojiName.trim() || !selectedFile || isUploading}
                className={`px-5 py-2 text-sm font-medium text-white rounded-xl transition flex items-center gap-2 ${
                  !emojiName.trim() || !selectedFile || isUploading
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-[#DE4B12] hover:bg-orange-600 shadow"
                }`}
              >
                {isUploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4" />
                    <span>Upload Emoji</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🗑️ DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="w-14 h-14 mx-auto rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-3">
              <Trash2 className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-bold text-gray-800">Delete Emoji?</h3>
            <p className="text-xs text-gray-500 mt-1 mb-4">
              Are you sure you want to permanently delete this emoji? This action cannot be undone.
            </p>

            {emojiToDelete?.url && (
              <div className="w-20 h-20 mx-auto mb-5 p-2 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center">
                <img
                  src={emojiToDelete.url}
                  alt="Delete preview"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setEmojiToDelete(null);
                }}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-100 transition"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteEmoji}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium shadow transition flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔍 PREVIEW / DETAILS MODAL */}
      {viewingEmoji && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-[#DE4B12]" />
                <h3 className="font-semibold text-gray-800">Emoji Details</h3>
              </div>
              <button
                onClick={() => setViewingEmoji(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Centered Large Preview */}
              <div className="w-full h-44 bg-gradient-to-br from-gray-50 to-orange-50/20 border border-gray-200 rounded-2xl flex items-center justify-center p-6">
                <img
                  src={viewingEmoji.url}
                  alt="Emoji Large Preview"
                  className="max-w-full max-h-full object-contain filter drop-shadow-md"
                />
              </div>

              {/* Details table / rows */}
              <div className="space-y-2.5 text-xs">
                {viewingEmoji.name && (
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex justify-between items-center">
                    <span className="font-medium text-gray-500">Emoji Name</span>
                    <span className="font-semibold text-gray-800">{viewingEmoji.name}</span>
                  </div>
                )}

              

                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex justify-between items-center">
                  <span className="font-medium text-gray-500">Created At</span>
                  <span className="text-gray-800">{formatDate(viewingEmoji.createdAt)}</span>
                </div>

            
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between">
              <button
                onClick={() => {
                  setEmojiToDelete(viewingEmoji);
                  setViewingEmoji(null);
                  setIsDeleteModalOpen(true);
                }}
                className="px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition border border-red-200"
              >
                Delete Emoji
              </button>

              <button
                onClick={() => setViewingEmoji(null)}
                className="px-5 py-2 text-xs font-semibold text-white bg-[#DE4B12] hover:bg-orange-600 rounded-xl transition shadow"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Emojis;
