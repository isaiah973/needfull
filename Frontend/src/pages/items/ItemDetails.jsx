import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const ItemDetails = () => {
  const { id } = useParams();

  const [item, setItem] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");

  useEffect(() => {
    fetchItem();
  }, [id]);

  const fetchItem = async () => {
    try {
      const res = await axios.get(`${API_URL}/items/${id}`);

      setItem(res.data.item);

      if (res.data.item.images.length > 0) {
        setSelectedImage(res.data.item.images[0]);
      }
      // Record the view
      const viewKey = `viewed_${id}`;

      const lastViewed = localStorage.getItem(viewKey);

      const DAY = 24 * 60 * 60 * 1000;

      if (!lastViewed || Date.now() - Number(lastViewed) > DAY) {
        await axios.post(`${API_URL}/items/${id}/view`);

        localStorage.setItem(viewKey, Date.now().toString());
      }

      s;
    } catch (err) {
      console.log(err);
    }
  };

  if (!item) {
    return <div className="py-40 text-center text-lg">Loading...</div>;
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="grid gap-12 lg:grid-cols-2">
        {/* LEFT */}

        <div>
          <img
            src={selectedImage || "https://placehold.co/700x600?text=No+Image"}
            alt={item.title}
            className="h-[500px] w-full rounded-3xl object-cover"
          />

          {item.images.length > 1 && (
            <div className="mt-5 flex gap-4 overflow-auto">
              {item.images.map((image) => (
                <img
                  key={image}
                  src={image}
                  alt=""
                  onClick={() => setSelectedImage(image)}
                  className="h-24 w-24 cursor-pointer rounded-xl object-cover border-2 hover:border-teal-600"
                />
              ))}
            </div>
          )}
        </div>

        {/* RIGHT */}

        <div>
          <div className="flex gap-3">
            <span className="rounded-full bg-teal-100 px-4 py-2 text-sm font-semibold text-teal-700">
              {item.category}
            </span>

            <span className="rounded-full bg-gray-200 px-4 py-2 text-sm font-semibold">
              {item.condition}
            </span>
          </div>

          <h1 className="mt-6 text-5xl font-bold">{item.title}</h1>

          <p className="mt-6 leading-8 text-gray-600">{item.description}</p>

          <div className="mt-8 space-y-4">
            <p>
              📍 <strong>Location:</strong> {item.location}
            </p>

            <p>
              👤 <strong>Posted by:</strong> {item.owner.name}
            </p>

            <p>
              👁 <strong>Views:</strong> {item.views}
            </p>

            <p>
              📩 <strong>Requests:</strong> {item.requestCount}
            </p>

            <p>
              📅 <strong>Posted:</strong>{" "}
              {new Date(item.createdAt).toLocaleDateString()}
            </p>
          </div>

          <div className="mt-10 flex gap-4">
            <button className="rounded-xl bg-teal-600 px-8 py-4 font-semibold text-white hover:bg-teal-700">
              Request Item
            </button>

            <button className="rounded-xl border px-8 py-4">Save</button>

            <button className="rounded-xl border px-8 py-4">Share</button>
          </div>

          {/* Owner */}

          <div className="mt-12 rounded-3xl border bg-gray-50 p-6">
            <h3 className="text-xl font-bold">Item Owner</h3>

            <p className="mt-3">{item.owner.name}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetails;
