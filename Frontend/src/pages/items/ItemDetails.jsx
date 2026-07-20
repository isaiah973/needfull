import {
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Eye,
  Flag,
  Heart,
  ImageOff,
  LoaderCircle,
  MapPin,
  MessageCircle,
  PackageCheck,
  Pencil,
  Share2,
  ShieldCheck,
  Send,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/axios";

const formatDate = (date) => {
  if (!date) return "Recently";

  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
};

const ItemDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [item, setItem] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [requesting, setRequesting] = useState(false);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");
  const [messageError, setMessageError] = useState("");
  const [hasRequested, setHasRequested] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [reportError, setReportError] = useState("");
  const [reporting, setReporting] = useState(false);
  const [hasReported, setHasReported] = useState(false);
  const [expandedDescriptionId, setExpandedDescriptionId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const ownerId =
    typeof item?.owner === "object" ? item.owner?._id : item?.owner;
  const currentUserId = user?._id || user?.id;
  const isOwner = Boolean(
    ownerId && currentUserId && String(ownerId) === String(currentUserId),
  );
  const descriptionExpanded = expandedDescriptionId === id;

  useEffect(() => {
    let ignore = false;

    api
      .get(`/items/${id}`)
      .then(({ data }) => {
        if (ignore) return;

        const nextItem = data.item;
        setItem(nextItem);
        setSelectedImage(nextItem.images?.[0] || "");

        const viewKey = `viewed_${id}_guest`;
        const lastViewed = Number(localStorage.getItem(viewKey));
        const oneDay = 24 * 60 * 60 * 1000;
        const shouldRecordView =
          Boolean(currentUserId) ||
          !lastViewed ||
          Date.now() - lastViewed > oneDay;

        if (shouldRecordView) {
          api
            .post(`/items/${id}/view`)
            .then(({ data: viewData }) => {
              if (!ignore) {
                setItem((current) => ({
                  ...current,
                  views: viewData.views,
                }));
              }
            })
            .catch(() => {});

          if (!currentUserId) {
            localStorage.setItem(viewKey, Date.now().toString());
          }
        }
      })
      .catch((err) => {
        if (ignore) return;

        setError(
          err.response?.data?.message ||
            "We could not load this item. Please try again.",
        );
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [currentUserId, id]);

  useEffect(() => {
    if (!isAuthenticated) return;

    let ignore = false;

    api
      .get(`/items/${id}/request-status`)
      .then(({ data }) => {
        if (!ignore) setHasRequested(Boolean(data.hasRequested));
      })
      .catch(() => {});

    return () => {
      ignore = true;
    };
  }, [id, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || isOwner) return;

    let ignore = false;

    api
      .get(`/reports/item/${id}/status`)
      .then(({ data }) => {
        if (!ignore) setHasReported(Boolean(data.hasReported));
      })
      .catch(() => {});

    return () => {
      ignore = true;
    };
  }, [id, isAuthenticated, isOwner]);

  const requireAccount = () => {
    if (isAuthenticated) return true;

    toast.error("Please log in to continue");
    navigate("/login");
    return false;
  };

  const openRequestDialog = () => {
    if (!requireAccount()) return;

    if (isOwner) {
      toast.error("You cannot request your own item");
      return;
    }

    if (hasRequested) {
      toast.error("You have already requested this item");
      return;
    }

    setMessageError("");
    setRequestDialogOpen(true);
  };

  const handleRequest = async (event) => {
    event.preventDefault();

    const message = requestMessage.trim();

    if (!message) {
      setMessageError("Please write a message to the owner.");
      return;
    }

    try {
      setRequesting(true);
      setMessageError("");

      const { data } = await api.post(`/items/${id}/request`, { message });

      toast.success(data.message || "Request sent to the owner");
      setRequestDialogOpen(false);
      setRequestMessage("");
      setHasRequested(true);
      setItem((current) => ({
        ...current,
        requestCount: (current.requestCount ?? 0) + 1,
      }));
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not send your request");
    } finally {
      setRequesting(false);
    }
  };

  const handleSave = async () => {
    if (!requireAccount()) return;

    try {
      setSaving(true);
      const method = saved ? "delete" : "post";
      const { data } = await api[method](`/items/${id}/save`);

      setSaved((current) => !current);
      toast.success(data.message || (saved ? "Item removed" : "Item saved"));
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update saved items");
    } finally {
      setSaving(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: item.title,
      text: `Have a look at "${item.title}" on Needful.`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard");
      }
    } catch (err) {
      if (err.name !== "AbortError") toast.error("Could not share this item");
    }
  };

  const openReportDialog = () => {
    if (!requireAccount()) return;
    if (isOwner) return;

    if (hasReported) {
      toast("Your report is already being reviewed");
      return;
    }

    setReportError("");
    setReportDialogOpen(true);
  };

  const handleReport = async (event) => {
    event.preventDefault();

    if (!reportReason) {
      setReportError("Please select a reason for reporting this item.");
      return;
    }

    try {
      setReporting(true);
      setReportError("");

      const { data } = await api.post(`/reports/${id}`, {
        reason: reportReason,
        description: reportDescription.trim(),
      });

      setHasReported(true);
      setReportDialogOpen(false);
      setReportReason("");
      setReportDescription("");
      toast.success(data.message || "Report submitted for review");
    } catch (err) {
      const message =
        err.response?.data?.message || "Could not submit your report";

      if (message.toLowerCase().includes("already reported")) {
        setHasReported(true);
        setReportDialogOpen(false);
      }

      toast.error(message);
    } finally {
      setReporting(false);
    }
  };

  const handleDeleteItem = async () => {
    try {
      setDeleting(true);
      const { data } = await api.delete(`/items/${id}`);

      if (currentUserId) {
        sessionStorage.setItem(
          `needful_dashboard_${currentUserId}_tab`,
          "items",
        );
        sessionStorage.removeItem(
          `needful_dashboard_${currentUserId}_cache`,
        );
      }

      toast.success(data.message || "Item deleted");
      navigate("/profile", { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not delete this item");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-50">
        <Navbar />
        <main className="mx-auto max-w-7xl animate-pulse px-5 py-10 sm:px-8">
          <div className="mb-8 h-5 w-40 rounded-full bg-slate-200" />
          <div className="grid gap-10 lg:grid-cols-[1.08fr_0.92fr]">
            <div className="aspect-[4/3] rounded-3xl bg-slate-200" />
            <div className="space-y-5 pt-4">
              <div className="h-7 w-40 rounded-full bg-slate-200" />
              <div className="h-14 w-4/5 rounded-2xl bg-slate-200" />
              <div className="h-28 rounded-2xl bg-slate-200" />
              <div className="h-32 rounded-2xl bg-slate-200" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-50">
        <Navbar />
        <main className="mx-auto flex max-w-xl flex-col items-center px-6 py-28 text-center">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-charcoal-100 text-charcoal-700">
            <ImageOff size={28} />
          </div>
          <h1 className="mt-6 text-2xl font-bold text-slate-900">
            Item unavailable
          </h1>
          <p className="mt-2 text-slate-500">{error}</p>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="mt-7 rounded-xl bg-primary-700 px-6 py-3 font-semibold text-white hover:bg-primary-800"
          >
            Browse other items
          </button>
        </main>
      </div>
    );
  }

  const images = item.images || [];
  const ownerName = item.owner?.name || "Community member";
  const isAvailable = item.status === "available";

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:py-10">
        <div className="mb-7 flex items-center gap-2 overflow-hidden text-sm text-slate-500">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mr-2 inline-flex shrink-0 items-center gap-2 font-semibold text-slate-700 transition hover:text-primary-700"
          >
            <ArrowLeft size={17} />
            Back
          </button>
          <ChevronRight size={14} className="shrink-0 text-slate-300" />
          <span className="shrink-0">{item.category || "Items"}</span>
          <ChevronRight size={14} className="shrink-0 text-slate-300" />
          <span className="truncate font-medium text-slate-800">{item.title}</span>
        </div>

        <div className="grid min-w-0 items-start gap-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:gap-12">
          <section className="min-w-0">
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-white shadow-[0_18px_50px_rgba(15,23,42,0.1)] ring-1 ring-slate-200">
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt={item.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-slate-400">
                  <ImageOff size={42} strokeWidth={1.5} />
                  <span className="text-sm font-medium">No image available</span>
                </div>
              )}

              <span
                className={`absolute left-5 top-5 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold shadow-lg backdrop-blur ${
                  isAvailable
                    ? "bg-primary-600/95 text-white"
                    : "bg-slate-900/85 text-white"
                }`}
              >
                <span className="h-2 w-2 rounded-full bg-primary-300" />
                {item.status || "available"}
              </span>
            </div>

            {images.length > 1 && (
              <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                {images.map((image, index) => (
                  <button
                    type="button"
                    key={`${image}-${index}`}
                    onClick={() => setSelectedImage(image)}
                    aria-label={`View image ${index + 1}`}
                    className={`h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 bg-white p-1 transition sm:h-24 sm:w-24 ${
                      selectedImage === image
                        ? "border-primary-600 shadow-md"
                        : "border-transparent hover:border-primary-200"
                    }`}
                  >
                    <img
                      src={image}
                      alt=""
                      className="h-full w-full rounded-xl object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="min-w-0 rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_14px_40px_rgba(15,23,42,0.06)] sm:p-8">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-primary-50 px-3.5 py-2 text-xs font-bold text-primary-700 ring-1 ring-primary-100">
                {item.category || "Other"}
              </span>
              <span className="rounded-full bg-charcoal-100 px-3.5 py-2 text-xs font-bold capitalize text-charcoal-800 ring-1 ring-charcoal-200">
                {item.condition || "Good"} condition
              </span>
            </div>

            <h1 className="mt-5 text-3xl font-bold leading-tight text-slate-900 [overflow-wrap:anywhere] sm:text-4xl">
              {item.title}
            </h1>

            <div className="mt-5">
              <p
                className={`whitespace-pre-line text-[15px] leading-7 text-slate-600 ${
                  descriptionExpanded ? "" : "line-clamp-4"
                }`}
              >
                {item.description}
              </p>
              {item.description?.length > 160 && (
                <button
                  type="button"
                  onClick={() =>
                    setExpandedDescriptionId((current) =>
                      current === id ? null : id,
                    )
                  }
                  className="mt-2 inline-flex items-center gap-1.5 text-sm font-bold text-primary-700 transition hover:text-primary-900"
                  aria-expanded={descriptionExpanded}
                >
                  {descriptionExpanded ? (
                    <>
                      Show less <ChevronUp size={16} />
                    </>
                  ) : (
                    <>
                      Read full description <ChevronDown size={16} />
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="mt-7 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-charcoal-50 p-4">
                <MapPin size={19} className="text-charcoal-600" />
                <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Location
                </p>
                <p className="mt-0.5 truncate text-sm font-bold text-slate-800">
                  {item.location}
                </p>
              </div>
              <div className="rounded-2xl bg-primary-50 p-4">
                <Eye size={19} className="text-primary-600" />
                <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Views
                </p>
                <p className="mt-0.5 text-sm font-bold text-slate-800">
                  {item.views ?? 0} views
                </p>
              </div>
              <div className="rounded-2xl bg-charcoal-100 p-4">
                <CalendarDays size={19} className="text-charcoal-700" />
                <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Posted
                </p>
                <p className="mt-0.5 truncate text-sm font-bold text-slate-800">
                  {formatDate(item.createdAt)}
                </p>
              </div>
              <div className="rounded-2xl bg-primary-50 p-4">
                <MessageCircle size={19} className="text-primary-600" />
                <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Requests
                </p>
                <p className="mt-0.5 text-sm font-bold text-slate-800">
                  {item.requestCount ?? 0} interested
                </p>
              </div>
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              {isOwner ? (
                <div className="flex flex-1 gap-3">
                  <Link
                    to={`/items/${id}/edit`}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary-700 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary-700/20 transition hover:bg-primary-800"
                  >
                    <Pencil size={17} />
                    Edit item
                  </Link>
                  <button
                    type="button"
                    onClick={() => setDeleteDialogOpen(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-charcoal-300 px-4 py-3.5 text-sm font-bold text-charcoal-800 transition hover:bg-charcoal-900 hover:text-white"
                  >
                    <Trash2 size={17} />
                    <span className="hidden sm:inline">Delete</span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={openRequestDialog}
                  disabled={!isAvailable || hasRequested}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary-700 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary-700/20 transition hover:bg-primary-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                >
                  <PackageCheck size={18} />
                  {hasRequested
                    ? "Request already sent"
                    : isAvailable
                      ? "Request this item"
                      : "Item unavailable"}
                </button>
              )}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  aria-label="Save item"
                  className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-3.5 text-sm font-bold transition sm:flex-none ${
                    saved
                      ? "border-charcoal-300 bg-charcoal-100 text-charcoal-900"
                      : "border-slate-200 text-slate-700 hover:border-charcoal-300 hover:bg-charcoal-50 hover:text-charcoal-900"
                  }`}
                >
                  {saved ? <Check size={18} /> : <Heart size={18} />}
                  {saved ? "Saved" : "Save"}
                </button>
                <button
                  type="button"
                  onClick={handleShare}
                  aria-label="Share item"
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3.5 text-sm font-bold text-slate-700 transition hover:border-charcoal-300 hover:bg-charcoal-50 hover:text-charcoal-900 sm:flex-none"
                >
                  <Share2 size={18} />
                  Share
                </button>
              </div>
            </div>

            <Link
              to={isOwner ? "/profile" : `/users/${ownerId}`}
              className="group/owner mt-7 flex min-w-0 items-center gap-4 border-t border-slate-100 pt-6 outline-none"
              aria-label={`View ${ownerName}'s profile`}
            >
              <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full bg-charcoal-800 font-bold text-white ring-4 ring-charcoal-100">
                {item.owner?.avatar ? (
                  <img
                    src={item.owner.avatar}
                    alt={ownerName}
                    className="h-full w-full object-cover"
                  />
                ) : ownerName ? (
                  ownerName.charAt(0).toUpperCase()
                ) : (
                  <UserRound size={20} />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-slate-400">Shared by</p>
                <p className="truncate font-bold text-slate-800 transition group-hover/owner:text-primary-700 group-focus-visible/owner:text-primary-700">
                  {ownerName}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-700 transition group-hover/owner:bg-primary-100">
                <ShieldCheck size={15} />
                View profile
              </div>
            </Link>

            {!isOwner && (
              <div className="mt-6 border-t border-slate-100 pt-5 text-center">
                <button
                  type="button"
                  onClick={openReportDialog}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-charcoal-900"
                >
                  <Flag size={16} />
                  {hasReported ? "Report submitted" : "Report this item"}
                </button>
                <p className="mt-1.5 text-xs text-slate-400">
                  Help keep the Needful community safe.
                </p>
              </div>
            )}
          </section>
        </div>
      </main>

      {requestDialogOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/55 p-0 backdrop-blur-sm sm:items-center sm:p-5"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !requesting) {
              setRequestDialogOpen(false);
            }
          }}
        >
          <form
            onSubmit={handleRequest}
            role="dialog"
            aria-modal="true"
            aria-labelledby="request-dialog-title"
            className="w-full rounded-t-3xl bg-white p-6 shadow-2xl sm:max-w-lg sm:rounded-3xl sm:p-7"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary-600">
                  Message the owner
                </p>
                <h2
                  id="request-dialog-title"
                  className="mt-1 text-2xl font-bold text-slate-900"
                >
                  Request this item
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setRequestDialogOpen(false)}
                disabled={requesting}
                aria-label="Close request dialog"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-800"
              >
                <X size={19} />
              </button>
            </div>

            <div className="mt-5 flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
              {item.images?.[0] ? (
                <img
                  src={item.images[0]}
                  alt=""
                  className="h-14 w-14 rounded-xl object-cover"
                />
              ) : (
                <div className="grid h-14 w-14 place-items-center rounded-xl bg-slate-200 text-slate-400">
                  <ImageOff size={20} />
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate font-bold text-slate-800">{item.title}</p>
                <p className="mt-0.5 truncate text-xs text-slate-500">
                  To {ownerName}
                </p>
              </div>
            </div>

            <label
              htmlFor="request-message"
              className="mt-5 block text-sm font-bold text-slate-800"
            >
              Why do you need this item?{" "}
              <span className="text-charcoal-700">*</span>
            </label>
            <textarea
              id="request-message"
              value={requestMessage}
              onChange={(event) => {
                setRequestMessage(event.target.value);
                if (messageError) setMessageError("");
              }}
              maxLength={500}
              rows={5}
              autoFocus
              required
              placeholder="Introduce yourself and explain briefly why this item would be helpful to you..."
              aria-invalid={Boolean(messageError)}
              aria-describedby={messageError ? "request-message-error" : undefined}
              className={`mt-2 w-full resize-none rounded-2xl border bg-white px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-4 ${
                messageError
                  ? "border-charcoal-500 focus:border-charcoal-700 focus:ring-charcoal-100"
                  : "border-slate-200 focus:border-primary-500 focus:ring-primary-100"
              }`}
            />

            <div className="mt-1.5 flex min-h-5 items-center justify-between gap-3">
              <p
                id="request-message-error"
                className="text-xs font-medium text-charcoal-700"
              >
                {messageError}
              </p>
              <span className="shrink-0 text-xs text-slate-400">
                {requestMessage.length}/500
              </span>
            </div>

            <button
              type="submit"
              disabled={requesting || !requestMessage.trim()}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary-700 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary-700/20 transition hover:bg-primary-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
            >
              <Send size={18} />
              {requesting ? "Sending request..." : "Send request"}
            </button>

            <p className="mt-3 text-center text-xs leading-5 text-slate-400">
              Your message will be shared privately with the item owner.
            </p>
          </form>
        </div>
      )}

      {reportDialogOpen && !isOwner && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/55 p-0 backdrop-blur-sm sm:items-center sm:p-5"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !reporting) {
              setReportDialogOpen(false);
            }
          }}
        >
          <form
            onSubmit={handleReport}
            role="dialog"
            aria-modal="true"
            aria-labelledby="report-dialog-title"
            className="w-full rounded-t-3xl bg-white p-6 shadow-2xl sm:max-w-lg sm:rounded-3xl sm:p-7"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-charcoal-600">
                  Community safety
                </p>
                <h2
                  id="report-dialog-title"
                  className="mt-1 text-2xl font-bold text-slate-900"
                >
                  Report this item
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Tell us what seems wrong. Your report is private and will be
                  reviewed by the Needful team.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReportDialogOpen(false)}
                disabled={reporting}
                aria-label="Close report dialog"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-800"
              >
                <X size={19} />
              </button>
            </div>

            <label
              htmlFor="report-reason"
              className="mt-6 block text-sm font-bold text-slate-800"
            >
              Reason <span className="text-charcoal-700">*</span>
            </label>
            <select
              id="report-reason"
              value={reportReason}
              onChange={(event) => {
                setReportReason(event.target.value);
                if (reportError) setReportError("");
              }}
              required
              autoFocus
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
            >
              <option value="">Select a reason</option>
              <option value="scam">Possible scam</option>
              <option value="fake">Fake or misleading item</option>
              <option value="spam">Spam</option>
              <option value="offensive">Offensive content</option>
              <option value="harassment">Harassment</option>
              <option value="duplicate">Duplicate listing</option>
              <option value="wrong-category">Wrong category</option>
              <option value="other">Something else</option>
            </select>

            <label
              htmlFor="report-description"
              className="mt-5 block text-sm font-bold text-slate-800"
            >
              Additional details{" "}
              <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <textarea
              id="report-description"
              value={reportDescription}
              onChange={(event) => setReportDescription(event.target.value)}
              maxLength={500}
              rows={4}
              placeholder="Add any useful context for the review team..."
              className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
            />

            <div className="mt-1.5 flex min-h-5 items-center justify-between gap-3">
              <p className="text-xs font-medium text-charcoal-700">
                {reportError}
              </p>
              <span className="shrink-0 text-xs text-slate-400">
                {reportDescription.length}/500
              </span>
            </div>

            <button
              type="submit"
              disabled={reporting || !reportReason}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-charcoal-900 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-charcoal-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              <Flag size={17} />
              {reporting ? "Submitting report..." : "Submit report"}
            </button>
          </form>
        </div>
      )}

      {deleteDialogOpen && isOwner && (
        <div
          className="fixed inset-0 z-[110] flex items-end justify-center bg-slate-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-5"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !deleting) {
              setDeleteDialogOpen(false);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-item-title"
            className="w-full rounded-t-3xl bg-white p-6 shadow-2xl sm:max-w-md sm:rounded-3xl sm:p-7"
          >
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-charcoal-100 text-charcoal-800">
              <Trash2 size={22} />
            </div>
            <h2
              id="delete-item-title"
              className="mt-5 text-2xl font-bold text-charcoal-950"
            >
              Delete this item?
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              This permanently removes “{item.title}” and all requests,
              notifications, and reports connected to it.
            </p>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setDeleteDialogOpen(false)}
                disabled={deleting}
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-charcoal-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Keep item
              </button>
              <button
                type="button"
                onClick={handleDeleteItem}
                disabled={deleting}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-charcoal-900 px-5 py-3 text-sm font-bold text-white hover:bg-charcoal-800 disabled:opacity-50"
              >
                {deleting ? (
                  <LoaderCircle size={17} className="animate-spin" />
                ) : (
                  <Trash2 size={17} />
                )}
                {deleting ? "Deleting…" : "Delete permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemDetails;
