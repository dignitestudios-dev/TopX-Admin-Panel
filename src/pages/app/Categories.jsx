import { Trash2 } from "lucide-react";
import React, { useState, useEffect } from "react";
import { ErrorToast, SuccessToast } from "../../components/global/Toaster";
import axios from "../../axios";

const Categories = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Added loading state

  // Modal Form States
  const [categoryType, setCategoryType] = useState("main");
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [parentCategoryId, setParentCategoryId] = useState("");

  // 🔥 Fetch categories on page load
  const fetchCategories = async () => {
    try {
      const res = await axios.get("/categories");
      if (res.data.success) {
        setCategories(res.data.data);
      }
    } catch (err) {
      ErrorToast("Failed to load categories");
    } finally {
      setIsLoading(false); // Set loading to false after data is fetched
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // 🔥 Create Category API
  const handleCreateCategory = async () => {
    if (!categoryName.trim()) {
      return ErrorToast("Please enter category name");
    }

    try {
      const payload = {
        name: categoryName,
        ...(categoryType === "sub" && parentCategoryId && {
          parentCategory: parentCategoryId,
        }),
      };

      const res = await axios.post("/categories", payload);

      if (res.data.status === "success") {
        SuccessToast("Category created successfully");

        fetchCategories();
        setIsModalOpen(false);

        // Reset fields
        setCategoryName("");
        setCategoryDescription(""); // will not be sent to backend but harmless to reset
        setParentCategoryId("");
        setCategoryType("main");
      }
    } catch (err) {
      ErrorToast("Could not create category");
    }
  };

  // 🔥 Delete category API
  const handleDeleteCategory = async (id) => {
    try {
      const res = await axios.delete(`/categories/${id}`);
      if (res.data.success) {
        SuccessToast("Category deleted");
        fetchCategories();
      }
    } catch (err) {
      ErrorToast("Failed to delete category");
    }
  };

  // Extract Main Categories  
  const mainCategories = categories.filter((cat) => cat.parentCategory === null);

  // Skeleton Loader Component
  const SkeletonLoader = () => (
    <div className="border border-gray-200 rounded-xl shadow-sm p-5 bg-white animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="w-2/3 h-5 bg-gray-300 rounded"></div>
        <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
      </div>

      <div className="mt-4">
        <p className="text-sm text-gray-500 mb-2 bg-gray-300 h-4 w-1/2 rounded"></p>
        <div className="flex flex-wrap gap-2">
          <div className="bg-gray-200 h-4 w-24 rounded"></div>
          <div className="bg-gray-200 h-4 w-24 rounded"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 pt-2 min-h-screen bg-white text-gray-900 space-y-6">
      {/* Header */}
      <div className="relative rounded-xl p-8 bg-white shadow-xl border border-[#DE4B12] flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-[#DE4B12]">Categories</h1>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#DE4B12] text-white rounded-lg shadow hover:bg-orange-600 transition"
        >
          <span className="text-lg font-bold">+</span>
          <span className="font-medium">Create Category</span>
        </button>
      </div>

      {/* Categories Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading
          ? Array(6)
              .fill(0)
              .map((_, idx) => <SkeletonLoader key={idx} />) // Show skeletons while loading
          : mainCategories.map((category) => (
              <div
                key={category._id}
                className="border border-gray-200 rounded-xl shadow-sm p-5 bg-white hover:shadow-md transition"
              >
                {/* Category Header */}
                <div className="flex justify-between items-start">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {category.name}
                  </h2>

                  {/* Delete main category */}
                  {/* <button
                    onClick={() => handleDeleteCategory(category._id)}
                    className="text-red-500 hover:text-red-400"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button> */}
                </div>

                {/* Subcategories */}
                <div className="mt-4">
                  <p className="text-sm text-gray-500 mb-2">Subcategories</p>

                  {category.subcategories?.length === 0 ? (
                    <span className="text-gray-400 text-sm">No subcategories</span>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {category.subcategories.map((sub) => (
                        <div
                          key={sub._id}
                          className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full text-sm"
                        >
                          <span className="text-gray-700">{sub.name}</span>
                          <button
                            onClick={() => handleDeleteCategory(sub._id)}
                            className="text-red-500 hover:text-red-400"
                          >
                            {/* <Trash2 className="w-4 h-4" /> */}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
      </section>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed -inset-10 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl">
            {/* Header */}
            <div className="bg-[#DE4B12] text-white px-6 py-4 flex justify-between items-center rounded-t-xl">
              <h2 className="text-xl font-semibold">Create New Category</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white text-xl hover:opacity-80"
              >
                ×
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4 rounded-xl">
              {/* Type */}
              <div>
                <label className="block mb-1 font-medium text-gray-700">
                  Category Type
                </label>
                <select
                  value={categoryType}
                  onChange={(e) => setCategoryType(e.target.value)}
                  className="w-full p-2.5 border rounded-lg"
                >
                  <option value="main">Main Category</option>
                  <option value="sub">Subcategory</option>
                </select>
              </div>

              {categoryType === "sub" && (
                <div>
                  <label className="block mb-1 font-medium">Parent Category</label>
                  <select
                    value={parentCategoryId}
                    onChange={(e) => setParentCategoryId(e.target.value)}
                    className="w-full p-2.5 border rounded-lg"
                  >
                    <option value="">Select Parent</option>
                    {mainCategories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block mb-1 font-medium">Name</label>
                <input
                  className="w-full p-2.5 border rounded-lg"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 rounded-xl">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded-lg">
                Cancel
              </button>
              <button onClick={handleCreateCategory} className="px-4 py-2 bg-[#DE4B12] text-white rounded-lg">
                Create
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Categories;
