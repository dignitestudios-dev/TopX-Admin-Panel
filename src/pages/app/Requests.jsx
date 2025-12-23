import React, { useState, useEffect } from "react";
import { FaComment, FaImage, FaUserCircle } from "react-icons/fa";

const Requests = () => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    // Replace with actual API call
    const fetchedRequests = [
      {
        _id: "69256b141c30c298ae1f5dae",
        author: {
          _id: "6915a9c83d6e6493842bfabf",
          name: "hope",
          profilePicture:
            "https://topx-uploads.s3.us-east-1.amazonaws.com/documents/1763027440866-1000000533.png_compressed.jpg",
          username: "hopex788",
        },
        post: {},
        createdAt: "2025-11-25T08:38:44.698Z",
      },
      {
        _id: "6925655b1c30c298ae1f5693",
        author: {
          _id: "6915a9c83d6e6493842bfabf",
          name: "hope",
          profilePicture:
            "https://topx-uploads.s3.us-east-1.amazonaws.com/documents/1763027440866-1000000533.png_compressed.jpg",
          username: "hopex788",
        },
        post: {
          bodyText: "test ",
          media: [
            {
              fileUrl:
                "https://topx-uploads.s3.us-east-1.amazonaws.com/documents/1764058459607-scaled_Screenshot_20251110_142638.jpg",
              type: "image",
            },
          ],
          commentsCount: 5,
        },
        createdAt: "2025-11-25T08:14:19.961Z",
      },
      // Add remaining requests...
    ];
    setRequests(fetchedRequests);
  }, []);

  return (
    <div className="min-h-screen bg-white text-black p-6">
      <h1 className="text-3xl font-bold mb-6">Requests</h1>

      <div className="space-y-4">
        {requests.map((req) => (
          <div
            key={req._id}
            className="border border-gray-200 rounded-xl shadow-sm p-4 hover:shadow-lg transition"
          >
            {/* Author Info */}
            <div className="flex items-center mb-3">
              <img
                src={req.author.profilePicture || "https://cdn-icons-png.flaticon.com/512/219/219969.png"}
                alt={req.author.name}
                className="w-10 h-10 rounded-full object-cover mr-3"
              />
              <div>
                <p className="font-semibold">{req.author.name}</p>
                <p className="text-sm text-gray-500">@{req.author.username}</p>
              </div>
            </div>

            {/* Post Content */}
            {req.post.bodyText && (
              <p className="mb-2 text-gray-700">{req.post.bodyText}</p>
            )}

            {req.post.media && req.post.media.length > 0 && (
              <div className="mb-2">
                {req.post.media.map((media, idx) => (
                  media.type === "image" && (
                    <img
                      key={idx}
                      src={media.fileUrl}
                      alt="post media"
                      className="w-full max-h-64 object-cover rounded-lg mb-2"
                    />
                  )
                ))}
              </div>
            )}

            {/* Metadata */}
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <FaComment />
                <span>{req.post.commentsCount || 0} comments</span>
              </div>
              <span>Created: {new Date(req.createdAt).toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Requests;
