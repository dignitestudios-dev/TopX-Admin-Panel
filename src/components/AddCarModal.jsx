import React, { useEffect, useState } from 'react';
import { IoMdCloudUpload } from "react-icons/io";

const AddCarModal = ({
  isOpen,
  onClose,
  newCar,
  handleInputChange,
  handleFileChange,
  handleAddCar,
  loading,
}) => {
  const [imageUploaded, setImageUploaded] = useState(false);
  const [passengerError, setPassengerError] = useState("");


  // Add this useEffect here
  useEffect(() => {
    if (!isOpen) {
      setImageUploaded(false);  // reset when modal closes
    } else {
      setImageUploaded(newCar.images.length > 0); // update when modal opens
    }
  }, [isOpen, newCar.images]);

  if (!isOpen) return null;

  

  const handleImageChange = (event) => {
    handleFileChange(event);
    setImageUploaded(event.target.files.length > 0);
  };

  const handlePassengersChange = (e) => {
    const { value } = e.target;
    if (value < 2) {
      setPassengerError("Seats must be at least 2");
    } else {
      setPassengerError("");
    }
    handleInputChange(e);
  };

  return (
    <div className="fixed inset-0 bg-gray-700 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">Add New Car</h2>
        
        <form className="space-y-4">

          {/* Car Name and Type (optional row) */}
          <div className="flex flex-col">
            <label htmlFor="name" className="text-sm font-medium text-gray-700 mb-1">Car Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={newCar.name}
              onChange={handleInputChange}
              placeholder="Enter car name"
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Make and Model in one row */}
          <div className="flex flex-col md:flex-row gap-2">
            <div className="flex flex-col w-full md:w-1/2">
              <label htmlFor="make" className="text-sm font-medium text-gray-700 mb-1">Make</label>
              <input
                type="text"
                id="make"
                name="make"
                value={newCar.make}
                onChange={handleInputChange}
                placeholder="e.g., Toyota"
                className="p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-col w-full md:w-1/2">
              <label htmlFor="model" className="text-sm font-medium text-gray-700 mb-1">Model</label>
              <input
                type="text"
                id="model"
                name="model"
                value={newCar.model}
                onChange={handleInputChange}
                placeholder="e.g., Corolla"
                className="p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Car Type */}
          <div className="flex flex-col">
            <label htmlFor="type" className="text-sm font-medium text-gray-700 mb-1">Car Type</label>
            <select
              id="type"
              name="type"
              value={newCar.type}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a car type</option>
              <option value="Coupe">Coupe</option>
              <option value="Sedan">Sedan</option>
              <option value="SUV">SUV</option>
              <option value="MPV">MPV</option>
              <option value="Minivan">Minivan</option>
            </select>
          </div>

          {/* Number of Passengers */}
          <div className="flex flex-col">
            <label htmlFor="passengers" className="text-sm font-medium text-gray-700 mb-1">Number of Passengers</label>
            <input
              type="number"
              id="passengers"
              name="passengers"
              value={newCar.passengers}
              onChange={handlePassengersChange}
              placeholder="Enter number of passengers"
              min="2"
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {passengerError && (
              <p className="text-sm text-red-500 mt-1">{passengerError}</p>
            )}
          </div>

          {/* Image Upload */}
          <div className="flex flex-col">
            <label htmlFor="image-upload" className="text-sm font-medium text-gray-700">Upload Image</label>
            <div className="mt-2">
              <label
                htmlFor="image-upload"
                className={`cursor-pointer w-full py-3 border rounded-lg flex items-center justify-center gap-2 
                  ${imageUploaded ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-blue-500 border-blue-500'}`}
              >
                <IoMdCloudUpload className={`text-4xl ${imageUploaded ? 'text-white' : 'text-blue-500'}`} />
                <span className="text-sm">{imageUploaded ? "Image Uploaded" : "Click to upload an image"}</span>
              </label>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 mt-4">
            <button
              type="button"
              onClick={handleAddCar}
              disabled={!!passengerError}
              className="w-1/2 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {loading ? "Adding..." : "Add Car"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 bg-gray-400 text-white py-3 rounded-lg hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Cancel
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AddCarModal;
