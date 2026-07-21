import {
  ArrowUpRight,
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  Clock3,
  Edit3,
  Eye,
  EyeOff,
  Inbox,
  KeyRound,
  LoaderCircle,
  Mail,
  MapPin,
  Package,
  PackageCheck,
  Phone,
  Plus,
  Save,
  Send,
  ShieldCheck,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import api from "../services/axios";

const DEFAULT_PROFILE_AVATAR = "/images/default-profile-avatar.png";
const MAX_NAME_LENGTH = 60;
const MAX_EMAIL_LENGTH = 254;
const MAX_PHONE_LENGTH = 20;
import { nigerianStates } from "../data/nigerianStates";

const tabs = [
  { id: "profile", label: "My profile", icon: CircleUserRound },
  { id: "items", label: "My items", icon: Package },
  { id: "received", label: "Requests to review", icon: Inbox },
  { id: "requested", label: "My requests", icon: Send },
];

const dashboardStorageKey = (userId, type) =>
  `needful_dashboard_${userId}_${type}`;

const readDashboardCache = (userId) => {
  if (!userId) return null;

  try {
    return (
      JSON.parse(
        sessionStorage.getItem(dashboardStorageKey(userId, "cache")),
      ) || null
    );
  } catch {
    return null;
  }
};

const statusStyles = {
  available: "bg-primary-50 text-primary-700 ring-primary-100",
  reserved: "bg-charcoal-100 text-charcoal-800 ring-charcoal-200",
  given: "bg-slate-100 text-slate-700 ring-slate-200",
  pending: "bg-charcoal-50 text-charcoal-700 ring-charcoal-200",
  approved: "bg-primary-50 text-primary-700 ring-primary-100",
  rejected: "bg-charcoal-200 text-charcoal-900 ring-charcoal-300",
  completed: "bg-primary-100 text-primary-800 ring-primary-200",
};

const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex px-2.5 py-1 text-[11px] font-bold capitalize ring-1 ${
      statusStyles[status] || statusStyles.pending
    }`}
  >
    {status}
  </span>
);

const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex min-h-72 flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50/70 px-6 py-12 text-center">
    <div className="grid h-14 w-14 place-items-center bg-primary-50 text-primary-700">
      <Icon size={25} />
    </div>
    <h3 className="mt-5 text-lg font-bold text-slate-800">{title}</h3>
    <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
      {description}
    </p>
    {action}
  </div>
);

const Profile = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { updateUser, user, logout } = useAuth();
  const currentUserId = user?._id || user?.id;
  const cacheKey = dashboardStorageKey(currentUserId, "cache");
  const tabKey = dashboardStorageKey(currentUserId, "tab");
  const scrollKey = dashboardStorageKey(currentUserId, "scroll");
  const fileInputRef = useRef(null);
  const [cachedDashboard] = useState(() =>
    readDashboardCache(currentUserId),
  );
  const [activeTab, setActiveTab] = useState(
    () => sessionStorage.getItem(tabKey) || "profile",
  );
  const linkedTab = searchParams.get("tab");
  const focusedRequestId = searchParams.get("request");
  const effectiveActiveTab = tabs.some(({ id }) => id === linkedTab)
    ? linkedTab
    : activeTab;
  const [profile, setProfile] = useState(cachedDashboard?.profile || null);
  const [items, setItems] = useState(cachedDashboard?.items || []);
  const [receivedRequests, setReceivedRequests] = useState(
    cachedDashboard?.receivedRequests || [],
  );
  const [receivedPage, setReceivedPage] = useState(1);
  const [receivedStatus, setReceivedStatus] = useState("pending");
  const [receivedLoading, setReceivedLoading] = useState(true);
  const [receivedRefresh, setReceivedRefresh] = useState(0);
  const [receivedCounts, setReceivedCounts] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    completed: 0,
  });
  const [receivedPagination, setReceivedPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });
  const [myRequests, setMyRequests] = useState(
    cachedDashboard?.myRequests || [],
  );
  const [form, setForm] = useState(
    cachedDashboard?.profile
      ? {
          name: cachedDashboard.profile.name || "",
          phone: cachedDashboard.profile.phone || "",
          state: cachedDashboard.profile.state || "",
        }
      : { name: "", phone: "", state: "" },
  );
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(
    cachedDashboard?.profile?.avatar || "",
  );
  const [loading, setLoading] = useState(!cachedDashboard);
  const [savingProfile, setSavingProfile] = useState(false);
  const [actingOn, setActingOn] = useState("");
  const [loadError, setLoadError] = useState("");
  const [emailForm, setEmailForm] = useState({
    newEmail: "",
    currentPassword: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [securityAction, setSecurityAction] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteForm, setDeleteForm] = useState({
    currentPassword: "",
    confirmation: "",
  });

  useEffect(() => {
    let ignore = false;

    Promise.all([
      api.get("/users/profile"),
      api.get("/items/my-items"),
      api.get("/requests/my-requests"),
    ])
      .then(([profileRes, itemsRes, requestedRes]) => {
        if (ignore) return;

        const nextProfile = profileRes.data.user;
        setProfile(nextProfile);
        setForm({
          name: nextProfile.name || "",
          phone: nextProfile.phone || "",
          state: nextProfile.state || "",
        });
        setAvatarPreview(nextProfile.avatar || "");
        setItems(itemsRes.data.items || []);
        setMyRequests(requestedRes.data.requests || []);
      })
      .catch((error) => {
        if (!ignore) {
          setLoadError(
            error.response?.data?.message ||
              "We could not load your dashboard. Please refresh and try again.",
          );
        }
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;
    const directRequest = focusedRequestId || "";

    api
      .get("/requests/received", {
        params: {
          page: directRequest ? 1 : receivedPage,
          limit: 20,
          ...(!directRequest &&
            receivedStatus !== "all" && { status: receivedStatus }),
          ...(directRequest && { requestId: directRequest }),
        },
      })
      .then(({ data }) => {
        if (ignore) return;
        setReceivedRequests(data.requests || []);
        setReceivedCounts(
          data.counts || {
            pending: 0,
            approved: 0,
            rejected: 0,
            completed: 0,
          },
        );
        setReceivedPagination(
          data.pagination || {
            page: 1,
            limit: 20,
            total: 0,
            totalPages: 1,
          },
        );
      })
      .catch(() => {
        if (!ignore) setReceivedRequests([]);
      })
      .finally(() => {
        if (!ignore) setReceivedLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [
    focusedRequestId,
    receivedPage,
    receivedRefresh,
    receivedStatus,
  ]);

  useEffect(() => {
    sessionStorage.setItem(tabKey, effectiveActiveTab);
  }, [effectiveActiveTab, tabKey]);

  useEffect(() => {
    if (
      loading ||
      receivedLoading ||
      effectiveActiveTab !== "received" ||
      !focusedRequestId
    ) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      const requestCard = document.getElementById(
        `received-request-${focusedRequestId}`,
      );

      requestCard?.scrollIntoView({ behavior: "smooth", block: "center" });
      requestCard?.focus({ preventScroll: true });
    });

    return () => cancelAnimationFrame(frame);
  }, [
    effectiveActiveTab,
    focusedRequestId,
    loading,
    receivedLoading,
  ]);

  useEffect(() => {
    if (!profile) return;

    sessionStorage.setItem(
      cacheKey,
      JSON.stringify({ profile, items, receivedRequests, myRequests }),
    );
  }, [cacheKey, profile, items, receivedRequests, myRequests]);

  useLayoutEffect(() => {
    const savedScroll = Number(sessionStorage.getItem(scrollKey));

    if (!savedScroll) return;

    const frame = requestAnimationFrame(() => {
      window.scrollTo({ top: savedScroll, behavior: "instant" });
      sessionStorage.removeItem(scrollKey);
    });

    return () => cancelAnimationFrame(frame);
  }, [scrollKey]);

  const rememberDashboardPosition = () => {
    sessionStorage.setItem(scrollKey, String(window.scrollY));
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Profile photo must be 5MB or smaller");
      return;
    }

    setAvatarFile(file);

    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (form.name.trim().length > MAX_NAME_LENGTH) {
      toast.error(`Name cannot exceed ${MAX_NAME_LENGTH} characters`);
      return;
    }
    if (form.phone.trim().length > MAX_PHONE_LENGTH) {
      toast.error(`Phone number cannot exceed ${MAX_PHONE_LENGTH} characters`);
      return;
    }
    if (!form.state) {
      toast.error("Select your state of residence");
      return;
    }

    try {
      setSavingProfile(true);

      const payload = new FormData();
      payload.append("name", form.name.trim());
      payload.append("phone", form.phone.trim());
      payload.append("state", form.state);
      if (avatarFile) payload.append("avatar", avatarFile);

      const { data } = await api.put("/users/profile", payload);

      setProfile(data.user);
      setForm({
        name: data.user.name,
        phone: data.user.phone || "",
        state: data.user.state || "",
      });
      setAvatarPreview(data.user.avatar || "");
      setAvatarFile(null);
      updateUser(data.user);
      toast.success(data.message || "Profile updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleRequestAction = async (request, action) => {
    try {
      setActingOn(`${request._id}-${action}`);
      const { data } = await api.patch(
        `/requests/${request._id}/${action}`,
      );

      setReceivedRequests((current) =>
        current.map((entry) => {
          if (entry._id === request._id) {
            return {
              ...entry,
              status: action === "approve" ? "approved" : action === "reject" ? "rejected" : "completed",
            };
          }

          if (
            action === "approve" &&
            entry.item?._id === request.item?._id &&
            entry.status === "pending"
          ) {
            return { ...entry, status: "rejected" };
          }

          return entry;
        }),
      );

      toast.success(data.message || "Request updated");
      setReceivedLoading(true);
      setReceivedRefresh((current) => current + 1);
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not update request");
    } finally {
      setActingOn("");
    }
  };

  const handleEmailChange = async (event) => {
    event.preventDefault();

    try {
      setSecurityAction("email");
      const { data } = await api.put("/users/account/email", emailForm);
      const nextProfile = { ...profile, email: data.email };

      setProfile(nextProfile);
      updateUser({ ...user, email: data.email });
      setEmailForm({ newEmail: "", currentPassword: "" });
      toast.success(data.message || "Email updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not update email");
    } finally {
      setSecurityAction("");
    }
  };

  const handlePasswordChange = async (event) => {
    event.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    try {
      setSecurityAction("password");
      const { data } = await api.put("/users/account/password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      toast.success(data.message || "Password changed");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not change password");
    } finally {
      setSecurityAction("");
    }
  };

  const handleDeleteAccount = async (event) => {
    event.preventDefault();

    if (deleteForm.confirmation !== "DELETE") {
      toast.error('Type "DELETE" to confirm');
      return;
    }

    try {
      setSecurityAction("delete");
      const { data } = await api.delete("/users/delete-account", {
        data: { currentPassword: deleteForm.currentPassword },
      });

      sessionStorage.removeItem(cacheKey);
      sessionStorage.removeItem(tabKey);
      sessionStorage.removeItem(scrollKey);
      await logout();
      toast.success(data.message || "Account deleted");
      navigate("/", { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not delete account");
      setSecurityAction("");
    }
  };

  const pendingReceived = receivedCounts.pending;
  const activeOutgoing = myRequests.filter((request) =>
    ["pending", "approved"].includes(request.status),
  ).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex min-h-[70vh] items-center justify-center">
          <LoaderCircle className="animate-spin text-primary-600" size={34} />
        </div>
      </div>
    );
  }

  if (loadError || !profile) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="mx-auto max-w-lg px-6 py-24 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center bg-charcoal-100 text-charcoal-700">
            <X size={27} />
          </div>
          <h1 className="mt-5 text-2xl font-bold text-slate-900">
            Dashboard unavailable
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">{loadError}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 bg-primary-700 px-6 py-3 font-bold text-white hover:bg-primary-800"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-dashboard min-h-screen bg-slate-50">
      <Navbar />

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden bg-primary-100 text-xl font-bold text-primary-800 sm:h-20 sm:w-20">
                <img
                  src={profile.avatar || DEFAULT_PROFILE_AVATAR}
                  alt={profile.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary-600">
                  Your Needful space
                </p>
                <h1 className="mt-1 truncate text-2xl font-bold text-slate-900 sm:text-3xl">
                  Welcome, {profile.name.split(" ")[0]}
                </h1>
                <p className="mt-1 truncate text-sm text-slate-500">
                  Manage your profile, items, and requests.
                </p>
              </div>
            </div>
            <Link
              to="/create-item"
              className="inline-flex items-center justify-center gap-2 bg-primary-700 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-primary-700/20 transition hover:bg-primary-800"
            >
              <Plus size={18} />
              Post a new item
            </Link>
          </div>

          <div className="mt-7 grid grid-cols-3 gap-3">
            <div className="rounded-2xl bg-primary-50 p-4">
              <p className="text-2xl font-bold text-primary-800">{items.length}</p>
              <p className="mt-1 text-xs font-semibold text-slate-500">Your items</p>
            </div>
            <div className="rounded-2xl bg-charcoal-50 p-4">
              <p className="text-2xl font-bold text-charcoal-800">{pendingReceived}</p>
              <p className="mt-1 text-xs font-semibold text-slate-500">
                Requests to review
              </p>
            </div>
            <div className="rounded-2xl bg-charcoal-100 p-4">
              <p className="text-2xl font-bold text-charcoal-900">{activeOutgoing}</p>
              <p className="mt-1 text-xs font-semibold text-slate-500">
                My active requests
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-7 sm:px-6 lg:grid-cols-[250px_minmax(0,1fr)] lg:px-8 lg:py-10">
        <aside className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-sm lg:sticky lg:top-24 lg:h-fit">
          <nav className="flex min-w-max gap-1 lg:min-w-0 lg:flex-col">
            {tabs.map(({ id, label, icon: Icon }) => {
              const count =
                id === "received"
                  ? pendingReceived
                  : id === "requested"
                    ? activeOutgoing
                    : id === "items"
                      ? items.length
                      : null;

              return (
                <button
                  type="button"
                  key={id}
                  onClick={() => {
                    setActiveTab(id);
                    setSearchParams({});
                  }}
                  className={`flex items-center gap-3 px-4 py-3 text-left text-sm font-bold transition ${
                    effectiveActiveTab === id
                      ? "bg-primary-700 text-white shadow-md"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                  {count !== null && (
                    <span
                      className={`ml-auto px-2 py-0.5 text-[10px] ${
                        effectiveActiveTab === id
                          ? "bg-white/20 text-white"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        <section className="min-w-0">
          {effectiveActiveTab === "profile" && (
            <>
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-5 sm:px-8">
                <h2 className="text-xl font-bold text-slate-900">Profile settings</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Keep your contact details and profile photo up to date.
                </p>
              </div>

              <form onSubmit={handleProfileSubmit} className="p-5 sm:p-8">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                  <div className="relative h-28 w-28 shrink-0">
                    <div className="grid h-full w-full place-items-center overflow-hidden bg-primary-100 text-3xl font-bold text-primary-800 ring-4 ring-primary-50">
                      <img
                        src={avatarPreview || DEFAULT_PROFILE_AVATAR}
                        alt="Profile preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-2 -right-2 grid h-10 w-10 place-items-center bg-primary-700 text-white shadow-lg transition hover:bg-primary-800"
                      aria-label="Change profile photo"
                    >
                      <Camera size={18} />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">Profile photo</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Choose a clear JPG, PNG, or WebP image up to 5MB.
                    </p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-primary-700 hover:text-primary-800"
                    >
                      <Edit3 size={15} />
                      Choose new photo
                    </button>
                  </div>
                </div>

                <div className="mt-8 grid gap-5 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-bold text-slate-700">
                      Full name
                    </span>
                    <div className="mt-2 flex items-center gap-3 border border-slate-200 px-4 focus-within:border-primary-500 focus-within:ring-4 focus-within:ring-primary-100">
                      <UserRound size={17} className="text-slate-400" />
                      <input
                        value={form.name}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            name: event.target.value,
                          }))
                        }
                        maxLength={MAX_NAME_LENGTH}
                        required
                        className="w-full bg-transparent py-3.5 text-sm outline-none"
                      />
                    </div>
                    <span className="mt-1.5 block text-right text-[11px] text-slate-400">
                      {form.name.length}/{MAX_NAME_LENGTH}
                    </span>
                  </label>
                  <label className="block">
                    <span className="text-sm font-bold text-slate-700">
                      Phone number
                    </span>
                    <div className="mt-2 flex items-center gap-3 border border-slate-200 px-4 focus-within:border-primary-500 focus-within:ring-4 focus-within:ring-primary-100">
                      <Phone size={17} className="text-slate-400" />
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            phone: event.target.value,
                          }))
                        }
                        maxLength={MAX_PHONE_LENGTH}
                        placeholder="+234..."
                        className="w-full bg-transparent py-3.5 text-sm outline-none"
                      />
                    </div>
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="text-sm font-bold text-slate-700">
                      State of residence
                    </span>
                    <div className="mt-2 flex items-center gap-3 border border-slate-200 px-4 focus-within:border-primary-500 focus-within:ring-4 focus-within:ring-primary-100">
                      <MapPin size={17} className="text-slate-400" />
                      <select
                        value={form.state}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            state: event.target.value,
                          }))
                        }
                        required
                        className="w-full appearance-none bg-transparent py-3.5 text-sm text-slate-800 outline-none"
                      >
                        <option value="">Select your state</option>
                        {nigerianStates.map((state) => (
                          <option key={state} value={state}>
                            {state}
                          </option>
                        ))}
                      </select>
                    </div>
                    <p className="mt-1.5 text-[11px] text-slate-400">
                      Your state is public; your exact address remains private.
                    </p>
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="text-sm font-bold text-slate-700">
                      Email address
                    </span>
                    <div className="mt-2 flex items-center gap-3 border border-slate-200 bg-slate-50 px-4">
                      <Mail size={17} className="text-slate-400" />
                      <input
                        value={profile.email}
                        disabled
                        className="w-full bg-transparent py-3.5 text-sm text-slate-500 outline-none"
                      />
                      <span className="flex items-center gap-1 text-xs font-bold text-primary-700">
                        <Check size={14} />
                        Verified
                      </span>
                    </div>
                  </label>
                </div>

                <div className="mt-7 flex justify-end border-t border-slate-100 pt-6">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="inline-flex w-full items-center justify-center gap-2 bg-primary-700 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-primary-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                  >
                    {savingProfile ? (
                      <LoaderCircle size={18} className="animate-spin" />
                    ) : (
                      <Save size={18} />
                    )}
                    {savingProfile ? "Saving..." : "Save changes"}
                  </button>
                </div>
              </form>
            </div>

            <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-start gap-3 border-b border-slate-100 px-5 py-5 sm:px-8">
                <span className="grid h-10 w-10 shrink-0 place-items-center bg-charcoal-100 text-charcoal-800">
                  <ShieldCheck size={20} />
                </span>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Account security
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Manage your sign-in email, password, and account access.
                  </p>
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                <form
                  onSubmit={handleEmailChange}
                  className="grid gap-5 p-5 sm:p-8 lg:grid-cols-[220px_minmax(0,1fr)]"
                >
                  <div>
                    <div className="flex items-center gap-2 font-bold text-charcoal-900">
                      <Mail size={17} className="text-primary-700" />
                      Change email
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Current email:{" "}
                      <span className="font-semibold text-charcoal-700">
                        {profile.email}
                      </span>
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="text-xs font-bold text-slate-600">
                        New email address
                      </span>
                      <input
                        type="email"
                        value={emailForm.newEmail}
                        maxLength={MAX_EMAIL_LENGTH}
                        onChange={(event) =>
                          setEmailForm((current) => ({
                            ...current,
                            newEmail: event.target.value,
                          }))
                        }
                        required
                        autoComplete="email"
                        placeholder="new@email.com"
                        className="mt-2 w-full border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-bold text-slate-600">
                        Current password
                      </span>
                      <div className="relative mt-2">
                        <input
                          type={showPasswords ? "text" : "password"}
                          value={emailForm.currentPassword}
                          onChange={(event) =>
                            setEmailForm((current) => ({
                              ...current,
                              currentPassword: event.target.value,
                            }))
                          }
                          required
                          autoComplete="current-password"
                          className="w-full border border-slate-200 px-4 py-3 pr-11 text-sm outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords((current) => !current)}
                          className="absolute inset-y-0 right-0 grid w-11 place-items-center text-slate-400 hover:text-charcoal-700"
                          aria-label={
                            showPasswords ? "Hide passwords" : "Show passwords"
                          }
                        >
                          {showPasswords ? (
                            <EyeOff size={17} />
                          ) : (
                            <Eye size={17} />
                          )}
                        </button>
                      </div>
                    </label>
                    <div className="sm:col-span-2 sm:text-right">
                      <button
                        type="submit"
                        disabled={securityAction === "email"}
                        className="inline-flex w-full items-center justify-center gap-2 bg-charcoal-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-charcoal-800 disabled:opacity-50 sm:w-auto"
                      >
                        {securityAction === "email" ? (
                          <LoaderCircle size={17} className="animate-spin" />
                        ) : (
                          <Save size={17} />
                        )}
                        Update email
                      </button>
                    </div>
                  </div>
                </form>

                <form
                  onSubmit={handlePasswordChange}
                  className="grid gap-5 p-5 sm:p-8 lg:grid-cols-[220px_minmax(0,1fr)]"
                >
                  <div>
                    <div className="flex items-center gap-2 font-bold text-charcoal-900">
                      <KeyRound size={17} className="text-primary-700" />
                      Change password
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Use at least 8 characters with uppercase, lowercase,
                      number, and special character.
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block sm:col-span-2">
                      <span className="text-xs font-bold text-slate-600">
                        Current password
                      </span>
                      <input
                        type={showPasswords ? "text" : "password"}
                        value={passwordForm.currentPassword}
                        onChange={(event) =>
                          setPasswordForm((current) => ({
                            ...current,
                            currentPassword: event.target.value,
                          }))
                        }
                        required
                        autoComplete="current-password"
                        className="mt-2 w-full border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-bold text-slate-600">
                        New password
                      </span>
                      <input
                        type={showPasswords ? "text" : "password"}
                        value={passwordForm.newPassword}
                        onChange={(event) =>
                          setPasswordForm((current) => ({
                            ...current,
                            newPassword: event.target.value,
                          }))
                        }
                        required
                        minLength={8}
                        autoComplete="new-password"
                        className="mt-2 w-full border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-bold text-slate-600">
                        Confirm new password
                      </span>
                      <input
                        type={showPasswords ? "text" : "password"}
                        value={passwordForm.confirmPassword}
                        onChange={(event) =>
                          setPasswordForm((current) => ({
                            ...current,
                            confirmPassword: event.target.value,
                          }))
                        }
                        required
                        minLength={8}
                        autoComplete="new-password"
                        className="mt-2 w-full border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
                      />
                    </label>
                    <div className="flex items-center justify-between gap-3 sm:col-span-2">
                      <button
                        type="button"
                        onClick={() => setShowPasswords((current) => !current)}
                        className="inline-flex items-center gap-2 text-xs font-bold text-charcoal-600 hover:text-charcoal-900"
                      >
                        {showPasswords ? (
                          <EyeOff size={15} />
                        ) : (
                          <Eye size={15} />
                        )}
                        {showPasswords ? "Hide passwords" : "Show passwords"}
                      </button>
                      <button
                        type="submit"
                        disabled={securityAction === "password"}
                        className="inline-flex items-center justify-center gap-2 bg-charcoal-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-charcoal-800 disabled:opacity-50"
                      >
                        {securityAction === "password" ? (
                          <LoaderCircle size={17} className="animate-spin" />
                        ) : (
                          <KeyRound size={17} />
                        )}
                        Change password
                      </button>
                    </div>
                  </div>
                </form>

                <div className="grid gap-5 bg-charcoal-50/70 p-5 sm:p-8 lg:grid-cols-[220px_minmax(0,1fr)]">
                  <div>
                    <div className="flex items-center gap-2 font-bold text-red-800">
                      <Trash2 size={17} className="text-red-600" />
                      Delete account
                    </div>
                  </div>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="max-w-xl text-sm leading-6 text-slate-600">
                      Permanently disable your account and hide all items you
                      have posted. This action cannot be undone.
                    </p>
                    <button
                      type="button"
                      onClick={() => setDeleteDialogOpen(true)}
                      className="shrink-0 border border-red-300 bg-red-50 px-5 py-3 text-sm font-bold text-red-700 transition hover:border-red-700 hover:bg-red-700 hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-100"
                    >
                      Delete account
                    </button>
                  </div>
                </div>
              </div>
            </div>
            </>
          )}

          {effectiveActiveTab === "items" && (
            <div>
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Your items</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Everything you have shared with the community.
                  </p>
                </div>
                <Link
                  to="/create-item"
                  className="grid h-11 w-11 place-items-center bg-primary-700 text-white sm:hidden"
                  aria-label="Post an item"
                >
                  <Plus size={19} />
                </Link>
              </div>

              {items.length === 0 ? (
                <EmptyState
                  icon={Package}
                  title="You have not posted an item yet"
                  description="Share something useful with a person in your community."
                  action={
                    <Link
                      to="/create-item"
                      className="mt-5 inline-flex items-center gap-2 bg-primary-700 px-5 py-3 text-sm font-bold text-white"
                    >
                      <Plus size={17} />
                      Post your first item
                    </Link>
                  }
                />
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {items.map((item) => (
                    <Link
                      key={item._id}
                      to={`/items/${item._id}`}
                      onClick={rememberDashboardPosition}
                      className="group flex gap-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition hover:border-primary-200 hover:shadow-md"
                    >
                      <div className="h-24 w-24 shrink-0 overflow-hidden bg-slate-100">
                        {item.images?.[0] ? (
                          <img
                            src={item.images[0]}
                            alt={item.title}
                            className="h-full w-full object-cover transition group-hover:scale-105"
                          />
                        ) : (
                          <div className="grid h-full place-items-center text-slate-300">
                            <Package size={25} />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1 py-1">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="line-clamp-2 text-sm font-bold text-slate-800">
                            {item.title}
                          </h3>
                          <ArrowUpRight
                            size={16}
                            className="shrink-0 text-slate-400 group-hover:text-primary-600"
                          />
                        </div>
                        <div className="mt-2">
                          <StatusBadge status={item.status} />
                        </div>
                        <div className="mt-2 flex items-center gap-3 text-[11px] font-semibold text-slate-400">
                          <span className="flex items-center gap-1">
                            <Eye size={12} />
                            {item.views ?? 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <Inbox size={12} />
                            {item.requestCount ?? 0}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {effectiveActiveTab === "received" && (
            <div>
              <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Requests to review
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {receivedCounts.pending.toLocaleString()} pending ·{" "}
                    {receivedPagination.total.toLocaleString()} shown by the
                    current filter
                  </p>
                </div>
                {!focusedRequestId && (
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-500">
                    Status
                    <select
                      value={receivedStatus}
                      onChange={(event) => {
                        setReceivedLoading(true);
                        setReceivedStatus(event.target.value);
                        setReceivedPage(1);
                      }}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-charcoal-800 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Declined</option>
                      <option value="completed">Completed</option>
                      <option value="all">All requests</option>
                    </select>
                  </label>
                )}
              </div>

              {receivedLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-white"
                    />
                  ))}
                </div>
              ) : receivedRequests.length === 0 ? (
                <EmptyState
                  icon={Inbox}
                  title={
                    focusedRequestId
                      ? "This request is no longer available"
                      : `No ${receivedStatus === "all" ? "" : receivedStatus} requests`
                  }
                  description="Requests matching this view will appear here."
                />
              ) : (
                <>
                  <div className="space-y-2.5">
                    {receivedRequests.map((request) => (
                    <article
                      key={request._id}
                      id={`received-request-${request._id}`}
                      tabIndex={-1}
                      className={`rounded-2xl border bg-white p-3.5 shadow-sm outline-none transition sm:p-4 ${
                        focusedRequestId === request._id
                          ? "border-primary-500 ring-4 ring-primary-100"
                          : "border-slate-200"
                      }`}
                    >
                      <div className="flex gap-3">
                        <Link
                          to={`/items/${request.item?._id}`}
                          onClick={rememberDashboardPosition}
                          className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-16 sm:w-16"
                        >
                          {request.item?.images?.[0] ? (
                            <img
                              src={request.item.images[0]}
                              alt={request.item.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="grid h-full place-items-center text-slate-300">
                              <Package size={22} />
                            </div>
                          )}
                        </Link>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                              <p className="text-xs font-semibold text-slate-400">
                                Request for
                              </p>
                              <h3 className="line-clamp-1 text-sm font-bold text-slate-800">
                                {request.item?.title || "Unavailable item"}
                              </h3>
                            </div>
                            <StatusBadge status={request.status} />
                          </div>

                          <Link
                            to={`/users/${request.requester?._id}`}
                            className="mt-2 flex w-fit max-w-full items-center gap-2 transition hover:bg-charcoal-50"
                            title={`View ${request.requester?.name || "user"}'s profile`}
                          >
                            <div className="grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-full bg-charcoal-100 text-xs font-bold text-charcoal-800">
                              <img
                                src={
                                  request.requester?.avatar ||
                                  DEFAULT_PROFILE_AVATAR
                                }
                                alt={
                                  request.requester?.name || "Needful member"
                                }
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-xs font-bold text-slate-800">
                                {request.requester?.name || "Needful member"}
                              </p>
                              <p className="truncate text-[10px] text-slate-500">
                                {request.requester?.email}
                              </p>
                            </div>
                          </Link>

                          <blockquote className="mt-2 line-clamp-2 rounded-lg bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-600">
                            “{request.message}”
                          </blockquote>

                          {request.status === "pending" && (
                            <div className="mt-2.5 flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  handleRequestAction(request, "approve")
                                }
                                disabled={Boolean(actingOn)}
                                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary-700 px-3 py-2 text-[11px] font-bold text-white hover:bg-primary-800 disabled:opacity-50"
                              >
                                {actingOn === `${request._id}-approve` ? (
                                  <LoaderCircle size={15} className="animate-spin" />
                                ) : (
                                  <Check size={15} />
                                )}
                                Approve request
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleRequestAction(request, "reject")
                                }
                                disabled={Boolean(actingOn)}
                                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-charcoal-300 px-3 py-2 text-[11px] font-bold text-charcoal-700 hover:bg-charcoal-50 disabled:opacity-50"
                              >
                                <X size={15} />
                                Decline
                              </button>
                            </div>
                          )}

                          {request.status === "approved" && (
                            <button
                              type="button"
                              onClick={() =>
                                handleRequestAction(request, "complete")
                              }
                              disabled={Boolean(actingOn)}
                              className="mt-2.5 inline-flex items-center justify-center gap-1.5 rounded-lg bg-charcoal-900 px-3 py-2 text-[11px] font-bold text-white hover:bg-charcoal-800 disabled:opacity-50"
                            >
                              <PackageCheck size={15} />
                              Mark item as given
                            </button>
                          )}
                        </div>
                      </div>
                    </article>
                    ))}
                  </div>

                  {!focusedRequestId &&
                    receivedPagination.totalPages > 1 && (
                      <div className="mt-5 flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3">
                        <p className="text-xs font-semibold text-slate-500">
                          Page {receivedPagination.page.toLocaleString()} of{" "}
                          {receivedPagination.totalPages.toLocaleString()}
                        </p>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setReceivedLoading(true);
                              setReceivedPage((page) =>
                                Math.max(1, page - 1),
                              );
                            }}
                            disabled={receivedPagination.page <= 1}
                            className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-charcoal-700 hover:border-primary-300 disabled:cursor-not-allowed disabled:opacity-40"
                            aria-label="Previous requests page"
                          >
                            <ChevronLeft size={17} />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setReceivedLoading(true);
                              setReceivedPage((page) =>
                                Math.min(
                                  receivedPagination.totalPages,
                                  page + 1,
                                ),
                              );
                            }}
                            disabled={
                              receivedPagination.page >=
                              receivedPagination.totalPages
                            }
                            className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-charcoal-700 hover:border-primary-300 disabled:cursor-not-allowed disabled:opacity-40"
                            aria-label="Next requests page"
                          >
                            <ChevronRight size={17} />
                          </button>
                        </div>
                      </div>
                    )}
                </>
              )}
            </div>
          )}

          {effectiveActiveTab === "requested" && (
            <div>
              <div className="mb-5">
                <h2 className="text-xl font-bold text-slate-900">
                  Items you requested
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Follow the progress of every request you have sent.
                </p>
              </div>

              {myRequests.length === 0 ? (
                <EmptyState
                  icon={Send}
                  title="You have not requested an item"
                  description="Browse available items and send a thoughtful message to an owner."
                  action={
                    <Link
                      to="/"
                      className="mt-5 inline-flex items-center gap-2 bg-primary-700 px-5 py-3 text-sm font-bold text-white"
                    >
                      Browse free items
                      <ArrowUpRight size={17} />
                    </Link>
                  }
                />
              ) : (
                <div className="space-y-4">
                  {myRequests.map((request) => (
                    <Link
                      key={request._id}
                      to={request.item?._id ? `/items/${request.item._id}` : "#"}
                      onClick={rememberDashboardPosition}
                      className="group block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-primary-200 hover:shadow-md"
                    >
                      <div className="flex gap-4">
                        <div className="h-20 w-20 shrink-0 overflow-hidden bg-slate-100">
                          {request.item?.images?.[0] ? (
                            <img
                              src={request.item.images[0]}
                              alt={request.item.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="grid h-full place-items-center text-slate-300">
                              <Package size={22} />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h3 className="truncate font-bold text-slate-800 group-hover:text-primary-700">
                                {request.item?.title || "Item unavailable"}
                              </h3>
                              <p className="mt-1 flex items-center gap-1 truncate text-xs text-slate-500">
                                <MapPin size={12} className="text-charcoal-500" />
                                {request.item?.location || "Location unavailable"}
                              </p>
                            </div>
                            <StatusBadge status={request.status} />
                          </div>
                          <p className="mt-3 line-clamp-2 text-xs leading-5 text-slate-500">
                            Your message: “{request.message}”
                          </p>
                          <p className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                            <Clock3 size={11} />
                            Sent {new Date(request.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      {deleteDialogOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-charcoal-950/65 p-0 backdrop-blur-sm sm:items-center sm:p-5"
          role="presentation"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              securityAction !== "delete"
            ) {
              setDeleteDialogOpen(false);
            }
          }}
        >
          <form
            onSubmit={handleDeleteAccount}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-account-title"
            className="w-full rounded-t-3xl bg-white p-6 shadow-2xl sm:max-w-md sm:rounded-3xl sm:p-7"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="grid h-12 w-12 place-items-center bg-red-50 text-red-700">
                <Trash2 size={22} />
              </div>
              <button
                type="button"
                onClick={() => setDeleteDialogOpen(false)}
                disabled={securityAction === "delete"}
                className="grid h-10 w-10 place-items-center bg-slate-100 text-slate-500 hover:bg-slate-200"
                aria-label="Close delete account dialog"
              >
                <X size={18} />
              </button>
            </div>

            <h2
              id="delete-account-title"
              className="mt-5 text-2xl font-bold text-charcoal-950"
            >
              Delete your account?
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Your profile will be disabled and all your posted items will be
              hidden. This cannot be undone.
            </p>

            <label className="mt-6 block">
              <span className="text-xs font-bold text-slate-700">
                Current password
              </span>
              <input
                type="password"
                value={deleteForm.currentPassword}
                onChange={(event) =>
                  setDeleteForm((current) => ({
                    ...current,
                    currentPassword: event.target.value,
                  }))
                }
                required
                autoComplete="current-password"
                className="mt-2 w-full border border-slate-200 px-4 py-3 text-sm outline-none focus:border-red-500 focus:ring-4 focus:ring-red-100"
              />
            </label>

            <label className="mt-4 block">
              <span className="text-xs font-bold text-slate-700">
                Type <strong>DELETE</strong> to confirm
              </span>
              <input
                value={deleteForm.confirmation}
                onChange={(event) =>
                  setDeleteForm((current) => ({
                    ...current,
                    confirmation: event.target.value,
                  }))
                }
                required
                autoComplete="off"
                placeholder="DELETE"
                className="mt-2 w-full border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-red-500 focus:ring-4 focus:ring-red-100"
              />
            </label>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setDeleteDialogOpen(false)}
                disabled={securityAction === "delete"}
                className="flex-1 border border-slate-200 px-4 py-3 text-sm font-bold text-charcoal-700 hover:bg-slate-50"
              >
                Keep my account
              </button>
              <button
                type="submit"
                disabled={
                  securityAction === "delete" ||
                  deleteForm.confirmation !== "DELETE" ||
                  !deleteForm.currentPassword
                }
                className="inline-flex flex-1 items-center justify-center gap-2 bg-red-700 px-4 py-3 text-sm font-bold text-white hover:bg-red-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-100 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {securityAction === "delete" ? (
                  <LoaderCircle size={17} className="animate-spin" />
                ) : (
                  <Trash2 size={17} />
                )}
                Delete permanently
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Profile;
