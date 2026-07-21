import {
  ArrowLeft,
  FileText,
  ImageOff,
  ImagePlus,
  LoaderCircle,
  MapPin,
  Package,
  Save,
  Tag,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { categories } from "../data/categories";
import api from "../services/axios";

const conditions = ["new", "excellent", "good", "fair", "poor"];
const MAX_TITLE_LENGTH = 70;
const MAX_LOCATION_LENGTH = 80;
const MAX_DESCRIPTION_WORDS = 150;
const MAX_DESCRIPTION_CHARACTERS = 1000;
const MAX_IMAGES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const countWords = (value = "") =>
  value.trim() ? value.trim().split(/\s+/).length : 0;

const EditItem = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const previewUrlsRef = useRef([]);
  const [form, setForm] = useState(null);
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [contentLocked, setContentLocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    api
      .get(`/items/${id}`)
      .then(({ data }) => {
        if (ignore) return;

        const nextItem = data.item;
        const ownerId =
          typeof nextItem.owner === "object"
            ? nextItem.owner?._id
            : nextItem.owner;
        const userId = user?._id || user?.id;

        if (!ownerId || String(ownerId) !== String(userId)) {
          setError("Only the item owner can edit this listing.");
          return;
        }

        setExistingImages(nextItem.images || []);
        setContentLocked(
          Boolean(nextItem.contentLockedAt || nextItem.requestCount > 0),
        );
        setForm({
          title: nextItem.title || "",
          category: nextItem.category || "",
          condition: nextItem.condition || "good",
          location: nextItem.location || "",
          description: nextItem.description || "",
          status: nextItem.status || "available",
        });
      })
      .catch((requestError) => {
        if (!ignore) {
          setError(
            requestError.response?.data?.message ||
              "This item could not be loaded.",
          );
        }
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [id, user]);

  useEffect(() => {
    return () => {
      previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setError("");
  };

  const addImages = (event) => {
    if (contentLocked) return;

    const selectedFiles = Array.from(event.target.files || []);
    event.target.value = "";

    if (selectedFiles.length === 0) return;

    const validFiles = selectedFiles.filter(
      (file) =>
        ["image/jpeg", "image/png", "image/webp"].includes(file.type) &&
        file.size <= MAX_FILE_SIZE,
    );

    if (validFiles.length !== selectedFiles.length) {
      toast.error("Use JPG, PNG, or WebP images no larger than 5MB.");
    }

    const availableSlots =
      MAX_IMAGES - existingImages.length - newImages.length;

    if (availableSlots <= 0) {
      toast.error(`An item can have a maximum of ${MAX_IMAGES} images.`);
      return;
    }

    const additions = validFiles.slice(0, availableSlots).map((file) => {
      const preview = URL.createObjectURL(file);
      previewUrlsRef.current.push(preview);

      return {
        id: `${file.name}-${file.lastModified}-${Math.random()}`,
        file,
        preview,
      };
    });

    if (validFiles.length > availableSlots) {
      toast.error(`Only ${MAX_IMAGES} images can be attached to an item.`);
    }

    setNewImages((current) => [...current, ...additions]);
  };

  const removeNewImage = (imageId) => {
    setNewImages((current) => {
      const selected = current.find((image) => image.id === imageId);

      if (selected) {
        URL.revokeObjectURL(selected.preview);
        previewUrlsRef.current = previewUrlsRef.current.filter(
          (url) => url !== selected.preview,
        );
      }

      return current.filter((image) => image.id !== imageId);
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const wordCount = countWords(form.description);

    if (!form.location.trim()) {
      setError("Pickup location is required.");
      return;
    }
    if (
      !contentLocked &&
      (!form.title.trim() || !form.description.trim())
    ) {
      setError("Title and description are required.");
      return;
    }
    if (!contentLocked && wordCount > MAX_DESCRIPTION_WORDS) {
      setError(`Description cannot exceed ${MAX_DESCRIPTION_WORDS} words.`);
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = new FormData();

      if (contentLocked) {
        payload.append("location", form.location.trim());
        payload.append("status", form.status);
      } else {
        Object.entries({
          ...form,
          title: form.title.trim(),
          location: form.location.trim(),
          description: form.description.trim(),
        }).forEach(([key, value]) => payload.append(key, value));
        payload.append("existingImages", JSON.stringify(existingImages));
        newImages.forEach((image) => payload.append("images", image.file));
      }

      const { data } = await api.put(`/items/${id}`, payload);

      toast.success(data.message || "Item updated successfully");
      navigate(`/items/${id}`, { replace: true });
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "The item could not be updated.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="grid min-h-[70vh] place-items-center">
          <LoaderCircle size={34} className="animate-spin text-primary-700" />
        </div>
      </div>
    );
  }

  if (error && !form) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="mx-auto max-w-lg px-6 py-24 text-center">
          <h1 className="text-2xl font-bold text-charcoal-900">
            Item unavailable
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">{error}</p>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mt-6 rounded-xl bg-charcoal-900 px-6 py-3 text-sm font-bold text-white"
          >
            Go back
          </button>
        </main>
      </div>
    );
  }

  const descriptionWords = countWords(form.description);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:py-12">
        <button
          type="button"
          onClick={() => navigate(`/items/${id}`)}
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-primary-700"
        >
          <ArrowLeft size={17} />
          Back to item
        </button>

        <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-6 sm:px-8">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary-700">
              Owner controls
            </p>
            <h1 className="mt-2 text-2xl font-bold text-charcoal-950 sm:text-3xl">
              Edit item
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Update the information people see on this listing.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid gap-8 p-5 sm:p-8 lg:grid-cols-[minmax(0,1fr)_280px]"
          >
            <div className="space-y-5">
              {error && (
                <p className="border-l-4 border-red-600 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
                  {error}
                </p>
              )}
              {contentLocked && (
                <div className="rounded-2xl border border-primary-200 bg-primary-50 px-4 py-3">
                  <p className="text-sm font-bold text-primary-900">
                    Core details are locked
                  </p>
                  <p className="mt-1 text-xs leading-5 text-primary-800">
                    Someone has requested this item. To protect interested
                    users, its pictures, title, category, condition, and
                    description can no longer be changed. You may still update
                    the pickup location or listing status.
                  </p>
                </div>
              )}

              <label className="block">
                <span className="flex items-center gap-2 text-sm font-bold text-charcoal-800">
                  <Package size={17} className="text-primary-700" />
                  Item title
                </span>
                <input
                  name="title"
                  value={form.title}
                  onChange={updateField}
                  maxLength={MAX_TITLE_LENGTH}
                  disabled={contentLocked}
                  required
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3.5 text-sm outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
                />
                <span className="mt-1.5 block text-right text-xs text-slate-400">
                  {form.title.length}/{MAX_TITLE_LENGTH}
                </span>
              </label>

              <div className="grid gap-5 sm:grid-cols-2">
                <label>
                  <span className="flex items-center gap-2 text-sm font-bold text-charcoal-800">
                    <Tag size={17} className="text-primary-700" />
                    Category
                  </span>
                  <select
                    name="category"
                    value={form.category}
                    onChange={updateField}
                    disabled={contentLocked}
                    required
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span className="text-sm font-bold text-charcoal-800">
                    Condition
                  </span>
                  <select
                    name="condition"
                    value={form.condition}
                    onChange={updateField}
                    disabled={contentLocked}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm capitalize outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
                  >
                    {conditions.map((condition) => (
                      <option key={condition} value={condition}>
                        {condition}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="block">
                <span className="flex items-center gap-2 text-sm font-bold text-charcoal-800">
                  <MapPin size={17} className="text-primary-700" />
                  Pickup location
                </span>
                <input
                  name="location"
                  value={form.location}
                  onChange={updateField}
                  maxLength={MAX_LOCATION_LENGTH}
                  required
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3.5 text-sm outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
                />
                <span className="mt-1.5 block text-right text-xs text-slate-400">
                  {form.location.length}/{MAX_LOCATION_LENGTH}
                </span>
              </label>

              <label className="block">
                <span className="flex items-center gap-2 text-sm font-bold text-charcoal-800">
                  <FileText size={17} className="text-primary-700" />
                  Description
                </span>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={updateField}
                  maxLength={MAX_DESCRIPTION_CHARACTERS}
                  rows={6}
                  disabled={contentLocked}
                  required
                  className="mt-2 w-full resize-none rounded-xl border border-slate-200 px-4 py-3.5 text-sm leading-6 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
                />
                <span className="mt-1.5 flex justify-between text-xs text-slate-400">
                  <span>
                    {descriptionWords}/{MAX_DESCRIPTION_WORDS} words
                  </span>
                  <span>
                    {form.description.length}/{MAX_DESCRIPTION_CHARACTERS}
                  </span>
                </span>
              </label>

              <label className="block">
                <span className="text-sm font-bold text-charcoal-800">
                  Listing status
                </span>
                <select
                  name="status"
                  value={form.status}
                  onChange={updateField}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm capitalize outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
                >
                  <option value="available">Available</option>
                  <option value="reserved">Reserved</option>
                  <option value="given">Given</option>
                </select>
              </label>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => navigate(`/items/${id}`)}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-charcoal-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    saving ||
                    (!contentLocked &&
                      descriptionWords > MAX_DESCRIPTION_WORDS)
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-700 px-6 py-3 text-sm font-bold text-white hover:bg-primary-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {saving ? (
                    <LoaderCircle size={17} className="animate-spin" />
                  ) : (
                    <Save size={17} />
                  )}
                  {saving ? "Saving changes…" : "Save changes"}
                </button>
              </div>
            </div>

            <aside>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-charcoal-800">
                    Item photos
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {existingImages.length + newImages.length}/{MAX_IMAGES} used
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={
                    contentLocked ||
                    existingImages.length + newImages.length >= MAX_IMAGES
                  }
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary-50 px-3 py-2 text-xs font-bold text-primary-700 hover:bg-primary-100 disabled:cursor-not-allowed disabled:text-slate-400"
                >
                  <ImagePlus size={15} />
                  Add
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={addImages}
                  className="hidden"
                />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {existingImages.map((image, index) => (
                  <div
                    key={image}
                    className="group/photo relative overflow-hidden rounded-xl"
                  >
                    <img
                      src={image}
                      alt=""
                      className="aspect-square w-full object-cover"
                    />
                    {!contentLocked && (
                      <button
                        type="button"
                        onClick={() =>
                          setExistingImages((current) =>
                            current.filter((entry) => entry !== image),
                          )
                        }
                        aria-label={`Remove existing image ${index + 1}`}
                        className="absolute right-1.5 top-1.5 grid h-7 w-7 place-items-center rounded-full bg-charcoal-950/80 text-white backdrop-blur hover:bg-charcoal-950"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
                {newImages.map((image, index) => (
                  <div
                    key={image.id}
                    className="relative overflow-hidden rounded-xl ring-2 ring-primary-200"
                  >
                    <img
                      src={image.preview}
                      alt=""
                      className="aspect-square w-full object-cover"
                    />
                    <span className="absolute bottom-1.5 left-1.5 rounded-full bg-primary-700 px-2 py-1 text-[9px] font-bold text-white">
                      New
                    </span>
                    <button
                      type="button"
                      onClick={() => removeNewImage(image.id)}
                      aria-label={`Remove new image ${index + 1}`}
                      className="absolute right-1.5 top-1.5 grid h-7 w-7 place-items-center rounded-full bg-charcoal-950/80 text-white backdrop-blur hover:bg-charcoal-950"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                {existingImages.length === 0 && newImages.length === 0 && (
                  <div className="col-span-2 grid aspect-[4/3] place-items-center rounded-xl bg-slate-100 text-slate-400">
                    <ImageOff size={24} />
                  </div>
                )}
              </div>
              <p className="mt-3 text-xs leading-5 text-slate-500">
                {contentLocked
                  ? "Pictures are locked because this item has received a request."
                  : "Remove old pictures or add JPG, PNG, and WebP files up to 5MB."}
              </p>
            </aside>
          </form>
        </div>
      </main>
    </div>
  );
};

export default EditItem;
