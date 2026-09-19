import { useState, useEffect } from "react";
import {
  Plus,
  X,
  Upload,
  Send,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface Ad {
  id: number;
  title: string;
  description: string;
  image: string;
  company?: string;
}

export default function Advertisement() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);

  const [current, setCurrent] = useState(0);
  const [open, setOpen] = useState(false);
  const [previewAd, setPreviewAd] = useState<Ad | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(""); // base64 data URL
  const [posting, setPosting] = useState(false);

  const cardsPerView = 3;

  // Load ads from the backend on mount so they survive a refresh
  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      const res = await fetch("/api/advertisement");
      const data = await res.json();

      if (data.success) {
        setAds(data.ads);
      } else {
        console.error("Failed to load ads:", data.message);
      }
    } catch (err) {
      console.error("Error fetching ads:", err);
    } finally {
      setLoading(false);
    }
  };

  const nextAds = () => {
    if (current + cardsPerView < ads.length) setCurrent(current + 1);
  };

  const prevAds = () => {
    if (current > 0) setCurrent(current - 1);
  };

  // Converts the uploaded file to base64 so it can actually be persisted in
  // the DB and survive refresh — createObjectURL only lives in this tab.
  const uploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
    };
    reader.onerror = () => {
      console.error("Failed to read image file");
      alert("Could not read that image file, please try another.");
    };
    reader.readAsDataURL(file);
  };

  const postAd = async () => {
    if (!title.trim() || !description.trim() || !image) {
      alert("Please fill all fields and upload an image.");
      return;
    }

    setPosting(true);

    try {
      const res = await fetch("/api/advertisement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // send session cookie
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          image,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        console.error("Post ad failed:", data.message);
        alert(data.message || "Failed to post advertisement");
        return;
      }

      // Prepend the newly created ad (backend returns the saved row)
      setAds((prev) => [data.ad, ...prev]);

      setTitle("");
      setDescription("");
      setImage("");
      setOpen(false);
      setCurrent(0);
    } catch (err) {
      console.error("Error posting ad:", err);
      alert("Something went wrong while posting the advertisement.");
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-8 py-8 pb-28">
      {/* Header */}
      <div className="flex items-center gap-3 mb-10">
        <Send className="text-blue-600 rotate-[-20deg]" size={28} />
        <h1 className="text-3xl font-bold text-blue-700">
          Advertisement
        </h1>
      </div>

      {/* Advertisement Slider */}
      {loading ? (
        <p className="text-center text-gray-500">Loading advertisements...</p>
      ) : ads.length === 0 ? (
        <p className="text-center text-gray-500">No advertisements yet.</p>
      ) : (
        <div className="relative flex items-center justify-center">

          <button
            onClick={prevAds}
            disabled={current === 0}
            className="absolute left-2 z-20 bg-white p-3 rounded-full shadow-lg hover:bg-blue-50 disabled:opacity-40"
          >
            <ChevronLeft size={28} />
          </button>

          <div className="w-[960px] overflow-hidden">
            <div className="flex gap-6 justify-center">
              {ads.slice(current, current + cardsPerView).map((ad) => (
                <div
                  key={ad.id}
                  onClick={() => setPreviewAd(ad)}
                  className="w-72 bg-white rounded-3xl overflow-hidden shadow-lg border border-blue-100 hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer"
                >
                  <img
                    src={ad.image}
                    alt={ad.title}
                    className="w-full h-52 object-cover"
                  />

                  <div className="p-5">
                    <h2 className="text-lg font-bold text-blue-700">
                      {ad.title}
                    </h2>

                    {ad.company && (
                      <p className="text-xs text-blue-400 mt-1 font-medium">
                        {ad.company}
                      </p>
                    )}

                    <p className="text-gray-600 mt-2 text-sm">
                      {ad.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={nextAds}
            disabled={current + cardsPerView >= ads.length}
            className="absolute right-2 z-20 bg-white p-3 rounded-full shadow-lg hover:bg-blue-50 disabled:opacity-40"
          >
            <ChevronRight size={28} />
          </button>
        </div>
      )}

      {/* Bottom Center Add Button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-blue-600 hover:bg-blue-700 text-white w-16 h-16 rounded-full shadow-2xl flex items-center justify-center z-40"
      >
        <Plus size={34} />
      </button>

      {/* Add Advertisement Dialog */}
      {open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden">

            <div className="flex justify-between items-center px-6 py-5 border-b">
              <h2 className="text-2xl font-bold text-blue-700">
                New Advertisement
              </h2>

              <button onClick={() => setOpen(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-5">

              <input
                type="text"
                placeholder="Advertisement Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border rounded-xl p-4 focus:ring-2 focus:ring-blue-500 outline-none"
              />

              <textarea
                rows={4}
                placeholder="Write your advertisement..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border rounded-xl p-4 focus:ring-2 focus:ring-blue-500 outline-none"
              />

              <label className="border-2 border-dashed border-blue-300 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-blue-50 transition">

                <Upload size={40} className="text-blue-600" />

                <p className="text-blue-700 font-semibold">
                  Upload Advertisement Image
                </p>

                <p className="text-sm text-gray-500">
                  JPG, PNG or JPEG
                </p>

                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={uploadImage}
                />
              </label>

              {image && (
                <img
                  src={image}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-xl"
                />
              )}

              <button
                onClick={postAd}
                disabled={posting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-semibold text-lg transition disabled:opacity-60"
              >
                {posting ? "Posting..." : "Post Advertisement"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Advertisement Preview Dialog */}
      {previewAd && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl overflow-hidden max-w-xl w-full shadow-2xl">

            <img
              src={previewAd.image}
              alt={previewAd.title}
              className="w-full h-72 object-cover"
            />

            <div className="p-6">
              <h2 className="text-2xl font-bold text-blue-700">
                {previewAd.title}
              </h2>

              {previewAd.company && (
                <p className="text-sm text-blue-400 mt-1 font-medium">
                  {previewAd.company}
                </p>
              )}

              <p className="text-gray-600 mt-3 leading-relaxed">
                {previewAd.description}
              </p>

              <button
                onClick={() => setPreviewAd(null)}
                className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}