import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { categories } from "../data/categories";

import {
  ArrowLeft,
  FileText,
  ImagePlus,
  Lightbulb,
  Loader2,
  MapPin,
  Package,
  ShieldCheck,
  Star,
  Tag,
  UploadCloud,
  X,
} from "lucide-react";

import toast from "react-hot-toast";
import { createItem } from "../services/itemService";

const conditions = ["new", "excellent", "good", "fair", "poor"];

const MAX_IMAGES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_TITLE_LENGTH = 70;
const MAX_LOCATION_LENGTH = 80;
const MAX_DESCRIPTION_WORDS = 150;
const MAX_DESCRIPTION_CHARACTERS = 1000;
const countWords = (value = "") =>
  value.trim() ? value.trim().split(/\s+/).length : 0;

const CreateItem = () => {
  const navigate = useNavigate();

  const previewUrlsRef = useRef([]);

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    condition: "good",
    location: "",
    description: "",
  });

  const [images, setImages] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const descriptionWordCount = countWords(formData.description);

  useEffect(() => {
    return () => {
      previewUrlsRef.current.forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  const selectCondition = (condition) => {
    setFormData((previous) => ({
      ...previous,
      condition,
    }));

    setError("");
  };

  const addImages = (fileList) => {
    setError("");

    const selectedFiles = Array.from(fileList);

    if (selectedFiles.length === 0) {
      return;
    }

    const validFiles = selectedFiles.filter((file) => {
      const validType = ["image/jpeg", "image/png", "image/webp"].includes(
        file.type,
      );

      const validSize = file.size <= MAX_FILE_SIZE;

      return validType && validSize;
    });

    if (validFiles.length !== selectedFiles.length) {
      setError(
        "Some images were rejected. Use JPG, PNG or WEBP files smaller than 5MB.",
      );
    }

    const remainingSlots = MAX_IMAGES - images.length;

    if (remainingSlots <= 0) {
      setError(`You can upload a maximum of ${MAX_IMAGES} images.`);
      return;
    }

    const filesToAdd = validFiles.slice(0, remainingSlots).map((file) => {
      const preview = URL.createObjectURL(file);

      previewUrlsRef.current.push(preview);

      return {
        id: `${file.name}-${file.lastModified}-${Math.random()}`,
        file,
        preview,
      };
    });

    setImages((previous) => [...previous, ...filesToAdd]);
  };

  const removeImage = (imageId) => {
    setImages((previous) => {
      const selectedImage = previous.find((image) => image.id === imageId);

      if (selectedImage) {
        URL.revokeObjectURL(selectedImage.preview);

        previewUrlsRef.current = previewUrlsRef.current.filter(
          (url) => url !== selectedImage.preview,
        );
      }

      return previous.filter((image) => image.id !== imageId);
    });
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      return "Enter a title for the item.";
    }

    if (formData.title.trim().length > MAX_TITLE_LENGTH) {
      return `Keep the item title within ${MAX_TITLE_LENGTH} characters.`;
    }

    if (!formData.category) {
      return "Select an item category.";
    }

    if (!formData.location.trim()) {
      return "Enter the pickup location.";
    }

    if (formData.location.trim().length > MAX_LOCATION_LENGTH) {
      return `Keep the pickup location within ${MAX_LOCATION_LENGTH} characters.`;
    }

    if (!formData.description.trim()) {
      return "Enter a description for the item.";
    }

    if (descriptionWordCount > MAX_DESCRIPTION_WORDS) {
      return `Keep the description within ${MAX_DESCRIPTION_WORDS} words.`;
    }

    if (images.length === 0) {
      return "Upload at least one item image.";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const response = await createItem({
        itemData: formData,
        images,
      });

      toast.success(response.message || "Item posted successfully.");

      const createdItemId = response.item?._id;

      if (createdItemId) {
        navigate(`/items/${createdItemId}`);
      } else {
        navigate("/");
      }
    } catch (requestError) {
      const message =
        requestError.response?.data?.message ||
        "The item could not be posted. Please try again.";

      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-charcoal-50 px-4 py-8 sm:px-6 lg:py-12">
      <div className="mx-auto max-w-7xl">
        {/* Page heading */}

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-primary-700"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <header className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary-700">
            Share something useful
          </p>

          <h1 className="mt-2 text-3xl font-semibold text-slate-900 sm:text-4xl">
            Post an item
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
            Add clear information and photos so people know exactly what you are
            giving away.
          </p>
        </header>

        <form onSubmit={handleSubmit}>
          {/* Main split layout */}

          <div className="grid overflow-hidden rounded-t-3xl border border-slate-200 bg-white shadow-sm lg:grid-cols-5">
            {/* Left panel */}

            <section className="p-6 sm:p-9 lg:col-span-3 lg:p-12">
              <div className="mb-9">
                <h2 className="text-2xl font-semibold text-slate-900">
                  Item information
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Provide honest and useful information about the item.
                </p>
              </div>

              <div className="space-y-8">
                {/* Title */}

                <div>
                  <label
                    htmlFor="title"
                    className="mb-3 flex items-center gap-3 text-sm font-semibold text-slate-700"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-charcoal-100">
                      <Package size={20} className="text-charcoal-700" />
                    </span>
                    Item title
                  </label>

                  <input
                    id="title"
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    maxLength={MAX_TITLE_LENGTH}
                    placeholder="For example: Wooden study table"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-100"
                  />

                  <p className="mt-2 text-right text-xs text-slate-400">
                    {formData.title.length}/{MAX_TITLE_LENGTH}
                  </p>
                </div>

                {/* Category */}

                <div>
                  <label
                    htmlFor="category"
                    className="mb-3 flex items-center gap-3 text-sm font-semibold text-slate-700"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-charcoal-100">
                      <Tag size={20} className="text-charcoal-700" />
                    </span>
                    Category
                  </label>

                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-700 outline-none transition-colors focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-100"
                  >
                    <option value="">Choose a category</option>

                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Condition */}

                <fieldset>
                  <legend className="mb-4 flex items-center gap-3 text-sm font-semibold text-slate-700">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-charcoal-100">
                      <Star size={20} className="text-charcoal-700" />
                    </span>
                    Condition
                  </legend>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
                    {conditions.map((condition) => {
                      const selected = formData.condition === condition;

                      return (
                        <button
                          key={condition}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => selectCondition(condition)}
                          className={`rounded-xl border px-3 py-3 text-sm font-medium capitalize transition-colors ${
                            selected
                              ? "border-primary-700 bg-primary-700 text-white"
                              : "border-slate-200 bg-slate-50 text-slate-600 hover:border-primary-400 hover:bg-primary-50"
                          }`}
                        >
                          {condition}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>

                {/* Location */}

                <div>
                  <label
                    htmlFor="location"
                    className="mb-3 flex items-center gap-3 text-sm font-semibold text-slate-700"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-charcoal-100">
                      <MapPin size={20} className="text-charcoal-700" />
                    </span>
                    Pickup location
                  </label>

                  <input
                    id="location"
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    maxLength={MAX_LOCATION_LENGTH}
                    placeholder="For example: Ibadan, Oyo"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-100"
                  />
                  <p className="mt-2 text-right text-xs text-slate-400">
                    {formData.location.length}/{MAX_LOCATION_LENGTH}
                  </p>
                </div>

                {/* Description */}

                <div>
                  <label
                    htmlFor="description"
                    className="mb-3 flex items-center gap-3 text-sm font-semibold text-slate-700"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-charcoal-100">
                      <FileText size={20} className="text-primary-700" />
                    </span>
                    Description
                  </label>

                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={6}
                    maxLength={MAX_DESCRIPTION_CHARACTERS}
                    placeholder="Mention its size, colour, defects, missing parts and anything else the recipient should know."
                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-100"
                  />

                  <div className="mt-2 flex items-center justify-between gap-3 text-xs">
                    <p
                      className={
                        descriptionWordCount > MAX_DESCRIPTION_WORDS
                          ? "font-semibold text-charcoal-800"
                          : "text-slate-400"
                      }
                    >
                      {descriptionWordCount}/{MAX_DESCRIPTION_WORDS} words
                    </p>
                    <p className="text-slate-400">
                      {formData.description.length}/
                      {MAX_DESCRIPTION_CHARACTERS} characters
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Right panel */}

            <section className="border-t border-slate-200 bg-charcoal-50 p-6 text-charcoal-900 sm:p-9 lg:col-span-2 lg:border-l lg:border-t-0 lg:p-12">
              <div className="mb-8">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100">
                  <ImagePlus size={25} className="text-primary-700" />
                </span>

                <h2 className="mt-5 text-2xl font-semibold">Upload photos</h2>

                <p className="mt-3 text-sm leading-7 text-charcoal-500">
                  Add clear photos from different angles. The first photo will
                  be used as the cover image.
                </p>
              </div>

              {/* Upload area */}

              <label
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(event) => {
                  event.preventDefault();
                  setDragging(false);
                  addImages(event.dataTransfer.files);
                }}
                className={`flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-white px-6 text-center transition-colors ${
                  dragging
                    ? "border-primary-500 bg-primary-50"
                    : "border-charcoal-300 hover:border-primary-400 hover:bg-primary-50/50"
                }`}
              >
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(event) => {
                    addImages(event.target.files);
                    event.target.value = "";
                  }}
                />

                <UploadCloud size={46} className="text-primary-600" />

                <h3 className="mt-5 text-lg font-semibold">
                  Drag and drop photos
                </h3>

                <p className="mt-2 text-sm text-charcoal-500">
                  or click to browse your device
                </p>

                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  <span className="rounded-full bg-charcoal-100 px-3 py-1 text-xs font-semibold text-charcoal-700">
                    JPG
                  </span>

                  <span className="rounded-full bg-charcoal-100 px-3 py-1 text-xs font-semibold text-charcoal-700">
                    PNG
                  </span>

                  <span className="rounded-full bg-charcoal-100 px-3 py-1 text-xs font-semibold text-charcoal-700">
                    WEBP
                  </span>
                </div>

                <p className="mt-5 text-xs text-charcoal-400">
                  Maximum {MAX_IMAGES} photos · 5MB each
                </p>
              </label>

              {/* Selected images */}

              {images.length > 0 && (
                <div className="mt-8">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-sm font-semibold">Selected photos</h3>

                    <span className="rounded-full bg-charcoal-100 px-3 py-1 text-xs text-charcoal-700">
                      {images.length}/{MAX_IMAGES}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {images.map((image, index) => (
                      <div
                        key={image.id}
                        className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white"
                      >
                        <img
                          src={image.preview}
                          alt={`Selected item ${index + 1}`}
                          className="h-32 w-full object-cover"
                        />

                        {index === 0 && (
                          <span className="absolute bottom-2 left-2 rounded-lg bg-primary-600 px-2 py-1 text-[10px] font-semibold text-white">
                            Cover
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => removeImage(image.id)}
                          aria-label={`Remove image ${index + 1}`}
                          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg bg-charcoal-900 text-white transition-colors hover:bg-charcoal-700"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload advice */}

              <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-start gap-3">
                  <Lightbulb
                    size={20}
                    className="mt-0.5 shrink-0 text-primary-600"
                  />

                  <p className="text-sm leading-6 text-charcoal-600">
                    Use good lighting and show the complete item.
                  </p>
                </div>

                <div className="mt-4 flex items-start gap-3">
                  <ShieldCheck
                    size={20}
                    className="mt-0.5 shrink-0 text-charcoal-500"
                  />

                  <p className="text-sm leading-6 text-charcoal-600">
                    Avoid including addresses, documents or private information
                    in the photos.
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* Error message */}

          {error && (
            <div
              role="alert"
              className="border-x border-b border-red-200 bg-red-50 px-6 py-4 text-sm font-medium text-red-800 sm:px-9"
            >
              {error}
            </div>
          )}

          {/* Actions remain below both panels */}

          <div className="flex flex-col-reverse gap-3 rounded-b-3xl border border-t-0 border-slate-200 bg-white px-6 py-6 shadow-sm sm:flex-row sm:justify-end sm:px-9">
            <button
              type="button"
              onClick={() => navigate(-1)}
              disabled={submitting}
              className="rounded-xl border border-slate-300 bg-white px-8 py-3.5 text-sm font-semibold text-slate-700 transition-colors hover:border-charcoal-500 hover:bg-charcoal-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="flex min-w-40 items-center justify-center rounded-xl bg-primary-700 px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-primary-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                "Post item"
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};

export default CreateItem;
