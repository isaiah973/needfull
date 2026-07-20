import {
  Bell,
  CheckCheck,
  ChevronDown,
  ChevronRight,
  CircleUserRound,
  Grid2X2,
  Home,
  Inbox,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  Package,
  Plus,
  Search,
  Settings,
  User,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { categories } from "../data/categories";
import { useAuth } from "../context/AuthContext";
import api from "../services/axios";

const timeAgo = (createdAt) => {
  const elapsed = Math.max(0, Date.now() - new Date(createdAt).getTime());
  const minutes = Math.floor(elapsed / 60000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return days < 7
    ? `${days}d ago`
    : new Date(createdAt).toLocaleDateString("en-NG", {
        day: "numeric",
        month: "short",
      });
};

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user, logout, isAuthenticated } = useAuth();
  const navRef = useRef(null);
  const searchInputRef = useRef(null);
  const [openPanel, setOpenPanel] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] =
    useState(isAuthenticated);

  const currentUserId = user?._id || user?.id;
  const unreadCount = notifications.filter(
    (notification) => !notification.isRead,
  ).length;
  const isHome = location.pathname === "/";

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setOpenPanel("");
        setMobileOpen(false);
        setMobileSearchOpen(false);
      }
    };

    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setOpenPanel("");
        setMobileOpen(false);
        setMobileSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    let ignore = false;

    api
      .get("/notifications")
      .then(({ data }) => {
        if (!ignore) setNotifications(data.notifications || []);
      })
      .catch(() => {})
      .finally(() => {
        if (!ignore) setNotificationsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [isAuthenticated]);

  const togglePanel = (panel) => {
    setOpenPanel((current) => (current === panel ? "" : panel));
  };

  const toggleNotifications = () => {
    setOpenPanel((current) =>
      current === "notifications" ? "" : "notifications",
    );
    setMobileOpen(false);
    setMobileSearchOpen(false);
  };

  const goTo = (path) => {
    setOpenPanel("");
    setMobileOpen(false);
    navigate(path);
  };

  const handleSearch = (event) => {
    event.preventDefault();
    const query = search.trim();
    const params = new URLSearchParams();

    if (query) params.set("search", query);

    navigate(params.size ? `/?${params.toString()}` : "/");
    setMobileSearchOpen(false);
  };

  const chooseCategory = (category = "") => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);

    navigate(params.size ? `/?${params.toString()}` : "/");
    setOpenPanel("");
    setMobileOpen(false);
  };

  const openDashboardTab = (tab) => {
    if (currentUserId) {
      sessionStorage.setItem(`needful_dashboard_${currentUserId}_tab`, tab);
    }
    goTo("/profile");
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      api.patch(`/notifications/${notification._id}/read`).catch(() => {});
      setNotifications((current) =>
        current.map((entry) =>
          entry._id === notification._id ? { ...entry, isRead: true } : entry,
        ),
      );
    }

    const requestId =
      typeof notification.request === "object"
        ? notification.request?._id
        : notification.request;

    if (notification.type === "new_request" && requestId) {
      if (currentUserId) {
        sessionStorage.setItem(
          `needful_dashboard_${currentUserId}_tab`,
          "received",
        );
      }
      goTo(`/profile?tab=received&request=${requestId}`);
    } else if (notification.item?._id) {
      goTo(`/items/${notification.item._id}`);
    } else {
      openDashboardTab("received");
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch("/notifications/read-all");
      setNotifications((current) =>
        current.map((notification) => ({ ...notification, isRead: true })),
      );
    } catch {
      // Keep the existing state when the server action fails.
    }
  };

  const handleLogout = async () => {
    setOpenPanel("");
    setMobileOpen(false);
    await logout();
    navigate("/");
  };

  return (
    <nav
      ref={navRef}
      className="sticky top-0 z-50 w-full max-w-full border-b border-slate-200/90 bg-white/95 shadow-[0_1px_12px_rgba(15,23,42,0.04)] backdrop-blur-xl"
    >
      <div className="mx-auto flex h-[72px] max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => goTo("/")}
          className="flex shrink-0 items-center gap-2.5 rounded-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-100"
          aria-label="Needful home"
        >
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-700 text-lg font-black text-white shadow-lg shadow-primary-700/20">
            N
          </span>
          <span className="hidden text-xl font-extrabold tracking-tight text-charcoal-900 sm:block">
            Needful
          </span>
        </button>

        <div className="ml-2 hidden items-center gap-1 lg:flex">
          <button
            type="button"
            onClick={() => goTo("/")}
            className={`rounded-xl px-3.5 py-2.5 text-sm font-bold transition ${
              isHome && !searchParams.get("category")
                ? "bg-primary-50 text-primary-800"
                : "text-charcoal-600 hover:bg-charcoal-50 hover:text-charcoal-900"
            }`}
          >
            Home
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => togglePanel("categories")}
              aria-expanded={openPanel === "categories"}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2.5 text-sm font-bold transition ${
                openPanel === "categories" || searchParams.get("category")
                  ? "bg-primary-50 text-primary-800"
                  : "text-charcoal-600 hover:bg-charcoal-50 hover:text-charcoal-900"
              }`}
            >
              Categories
              <ChevronDown
                size={15}
                className={`transition ${
                  openPanel === "categories" ? "rotate-180" : ""
                }`}
              />
            </button>

            {openPanel === "categories" && (
              <div className="nav-dropdown-enter absolute left-0 top-[calc(100%+14px)] w-[620px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_22px_60px_rgba(15,23,42,0.16)]">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                  <div>
                    <p className="font-bold text-charcoal-900">
                      Browse categories
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Find useful items by type
                    </p>
                  </div>
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary-50 text-primary-700">
                    <Grid2X2 size={18} />
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1 p-3">
                  {categories.map((category) => (
                    <button
                      type="button"
                      key={category}
                      onClick={() => chooseCategory(category)}
                      className="rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-charcoal-600 transition hover:bg-primary-50 hover:text-primary-800"
                    >
                      {category}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => chooseCategory()}
                  className="flex w-full items-center justify-center gap-2 border-t border-slate-100 px-5 py-3.5 text-sm font-bold text-primary-700 transition hover:bg-primary-50"
                >
                  View all items
                  <ChevronRight size={15} />
                </button>
              </div>
            )}
          </div>
        </div>

        <form
          onSubmit={handleSearch}
          className="mx-auto hidden w-full max-w-md items-center rounded-xl border border-slate-200 bg-slate-50 px-3 transition focus-within:border-primary-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-primary-100 md:flex"
        >
          <Search size={17} className="shrink-0 text-slate-400" />
          <input
            ref={searchInputRef}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search free items..."
            aria-label="Search items"
            className="min-w-0 flex-1 bg-transparent px-2.5 py-3 text-sm text-charcoal-800 outline-none placeholder:text-slate-400"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 hover:bg-slate-200 hover:text-charcoal-700"
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </form>

        <div className="ml-auto flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              setMobileSearchOpen((current) => !current);
              setMobileOpen(false);
              setOpenPanel("");
            }}
            className="grid h-10 w-10 place-items-center rounded-xl text-charcoal-600 transition hover:bg-charcoal-50 md:hidden"
            aria-label="Search"
            aria-expanded={mobileSearchOpen}
          >
            <Search size={19} />
          </button>

          <button
            type="button"
            onClick={() =>
              goTo(isAuthenticated ? "/create-item" : "/login")
            }
            className="hidden items-center gap-2 rounded-xl bg-primary-700 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-primary-700/20 transition hover:bg-primary-800 sm:flex"
          >
            <Plus size={17} />
            <span className="hidden xl:inline">Post item</span>
            <span className="xl:hidden">Post</span>
          </button>

          {isAuthenticated && (
            <div className="relative block">
              <button
                type="button"
                onClick={toggleNotifications}
                aria-label="Notifications"
                aria-expanded={openPanel === "notifications"}
                className={`relative grid h-10 w-10 place-items-center rounded-xl transition ${
                  openPanel === "notifications"
                    ? "bg-primary-50 text-primary-800"
                    : "text-charcoal-600 hover:bg-charcoal-50"
                }`}
              >
                <Bell size={19} />
                {unreadCount > 0 && (
                  <span className="absolute right-1.5 top-1.5 min-w-4 rounded-full bg-primary-600 px-1 text-center text-[9px] font-black leading-4 text-white ring-2 ring-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {openPanel === "notifications" && (
                <div className="nav-dropdown-enter absolute right-0 top-[calc(100%+14px)] w-[min(360px,calc(100vw-24px))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_22px_60px_rgba(15,23,42,0.16)]">
                  <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-5">
                    <div>
                      <p className="font-bold text-charcoal-900">
                        Notifications
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {unreadCount
                          ? `${unreadCount} unread update${unreadCount === 1 ? "" : "s"}`
                          : "You are all caught up"}
                      </p>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={markAllAsRead}
                        aria-label="Mark all notifications as read"
                        className="flex items-center gap-1.5 text-xs font-bold text-primary-700 hover:text-primary-900"
                      >
                        <CheckCheck size={15} />
                        <span className="hidden min-[380px]:inline">
                          Mark all read
                        </span>
                      </button>
                    )}
                  </div>

                  <div className="max-h-[380px] overflow-y-auto">
                    {notificationsLoading ? (
                      <div className="space-y-3 p-4">
                        {[1, 2, 3].map((entry) => (
                          <div
                            key={entry}
                            className="h-16 animate-pulse rounded-xl bg-slate-100"
                          />
                        ))}
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="px-6 py-12 text-center">
                        <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-charcoal-50 text-charcoal-400">
                          <Bell size={21} />
                        </span>
                        <p className="mt-4 text-sm font-bold text-charcoal-800">
                          No notifications yet
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Requests and account updates will appear here.
                        </p>
                      </div>
                    ) : (
                      notifications.slice(0, 12).map((notification) => (
                        <button
                          type="button"
                          key={notification._id}
                          onClick={() =>
                            handleNotificationClick(notification)
                          }
                          className={`flex w-full gap-3 border-b border-slate-100 px-4 py-3.5 text-left transition last:border-b-0 hover:bg-charcoal-50 ${
                            notification.isRead ? "bg-white" : "bg-primary-50/60"
                          }`}
                        >
                          <span
                            className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                              notification.isRead
                                ? "bg-charcoal-200"
                                : "bg-primary-500"
                            }`}
                          />
                          <span className="min-w-0 flex-1">
                            <span className="line-clamp-2 text-xs font-semibold leading-5 text-charcoal-700">
                              {notification.message}
                            </span>
                            <span className="mt-1 block text-[10px] font-medium text-slate-400">
                              {timeAgo(notification.createdAt)}
                            </span>
                          </span>
                          <ChevronRight
                            size={15}
                            className="mt-1 shrink-0 text-slate-300"
                          />
                        </button>
                      ))
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => openDashboardTab("received")}
                    className="flex w-full items-center justify-center gap-2 border-t border-slate-100 px-5 py-3.5 text-sm font-bold text-primary-700 hover:bg-primary-50"
                  >
                    Open requests to review
                    <ChevronRight size={15} />
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="relative hidden sm:block">
            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => togglePanel("profile")}
                aria-expanded={openPanel === "profile"}
                className={`flex items-center gap-2 rounded-xl p-1.5 pr-2 transition ${
                  openPanel === "profile"
                    ? "bg-primary-50"
                    : "hover:bg-charcoal-50"
                }`}
              >
                <span className="grid h-8 w-8 place-items-center overflow-hidden rounded-lg bg-primary-100 text-xs font-bold text-primary-800">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    user?.name?.charAt(0)?.toUpperCase() || <User size={16} />
                  )}
                </span>
                <ChevronDown
                  size={14}
                  className={`text-charcoal-500 transition ${
                    openPanel === "profile" ? "rotate-180" : ""
                  }`}
                />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => goTo("/login")}
                className="flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-charcoal-700 transition hover:border-primary-300 hover:bg-primary-50 hover:text-primary-800"
              >
                <LogIn size={17} />
                Sign in
              </button>
            )}

            {isAuthenticated && openPanel === "profile" && (
              <div className="nav-dropdown-enter absolute right-0 top-[calc(100%+14px)] w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_22px_60px_rgba(15,23,42,0.16)]">
                <div className="flex items-center gap-3 border-b border-slate-100 bg-charcoal-50/70 px-4 py-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-primary-100 font-bold text-primary-800">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      user?.name?.charAt(0)?.toUpperCase()
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold text-charcoal-900">
                      {user?.name}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-slate-500">
                      {user?.email}
                    </span>
                  </span>
                </div>

                <div className="p-2">
                  <button
                    type="button"
                    onClick={() => openDashboardTab("profile")}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-charcoal-700 transition hover:bg-primary-50 hover:text-primary-800"
                  >
                    <CircleUserRound size={17} />
                    Profile settings
                  </button>
                  <button
                    type="button"
                    onClick={() => openDashboardTab("items")}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-charcoal-700 transition hover:bg-primary-50 hover:text-primary-800"
                  >
                    <Package size={17} />
                    My items
                  </button>
                  <button
                    type="button"
                    onClick={() => openDashboardTab("received")}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-charcoal-700 transition hover:bg-primary-50 hover:text-primary-800"
                  >
                    <Inbox size={17} />
                    Requests to review
                    {unreadCount > 0 && (
                      <span className="ml-auto rounded-full bg-primary-100 px-2 py-0.5 text-[10px] font-bold text-primary-800">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => openDashboardTab("requested")}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-charcoal-700 transition hover:bg-primary-50 hover:text-primary-800"
                  >
                    <LayoutDashboard size={17} />
                    My requests
                  </button>
                </div>

                <div className="border-t border-slate-100 p-2">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-charcoal-700 transition hover:bg-charcoal-100 hover:text-charcoal-950"
                  >
                    <LogOut size={17} />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              setMobileOpen((current) => !current);
              setMobileSearchOpen(false);
              setOpenPanel("");
            }}
            className={`grid h-10 w-10 place-items-center rounded-xl transition sm:hidden ${
              mobileOpen
                ? "bg-charcoal-900 text-white"
                : "text-charcoal-700 hover:bg-charcoal-50"
            }`}
            aria-label="Open navigation menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={21} />}
          </button>
        </div>
      </div>

      {mobileSearchOpen && (
        <form
          onSubmit={handleSearch}
          className="nav-mobile-enter border-t border-slate-100 bg-white px-4 py-3 md:hidden"
        >
          <div className="flex items-center rounded-xl border border-primary-300 bg-white px-3 ring-4 ring-primary-50">
            <Search size={17} className="text-primary-700" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              autoFocus
              placeholder="Search free items..."
              className="min-w-0 flex-1 bg-transparent px-2.5 py-3 text-sm outline-none"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="text-slate-400"
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </form>
      )}

      {mobileOpen && (
        <div className="nav-mobile-enter border-t border-slate-100 bg-white shadow-xl sm:hidden">
          <div className="max-h-[calc(100vh-72px)] overflow-y-auto px-4 py-4">
            {isAuthenticated && (
              <div className="mb-4 flex items-center gap-3 rounded-2xl bg-charcoal-50 p-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-primary-100 font-bold text-primary-800">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    user?.name?.charAt(0)?.toUpperCase()
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-bold text-charcoal-900">
                    {user?.name}
                  </span>
                  <span className="block truncate text-xs text-slate-500">
                    {user?.email}
                  </span>
                </span>
              </div>
            )}

            <div className="space-y-1">
              <button
                type="button"
                onClick={() => goTo("/")}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-charcoal-700 hover:bg-primary-50 hover:text-primary-800"
              >
                <Home size={18} />
                Home
              </button>
              <button
                type="button"
                onClick={() =>
                  setMobileCategoriesOpen((current) => !current)
                }
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-charcoal-700 hover:bg-primary-50 hover:text-primary-800"
              >
                <Grid2X2 size={18} />
                Categories
                <ChevronDown
                  size={16}
                  className={`ml-auto transition ${
                    mobileCategoriesOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {mobileCategoriesOpen && (
                <div className="nav-mobile-enter grid grid-cols-2 gap-1 rounded-xl bg-charcoal-50 p-2">
                  {categories.map((category) => (
                    <button
                      type="button"
                      key={category}
                      onClick={() => chooseCategory(category)}
                      className="rounded-lg px-2.5 py-2 text-left text-[11px] font-semibold text-charcoal-600 hover:bg-white hover:text-primary-800"
                    >
                      {category}
                    </button>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={() =>
                  goTo(isAuthenticated ? "/create-item" : "/login")
                }
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-charcoal-700 hover:bg-primary-50 hover:text-primary-800"
              >
                <Plus size={18} />
                Post an item
              </button>

              {isAuthenticated ? (
                <>
                  <button
                    type="button"
                    onClick={() => openDashboardTab("profile")}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-charcoal-700 hover:bg-primary-50 hover:text-primary-800"
                  >
                    <Settings size={18} />
                    Profile settings
                  </button>
                  <button
                    type="button"
                    onClick={() => openDashboardTab("items")}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-charcoal-700 hover:bg-primary-50 hover:text-primary-800"
                  >
                    <Package size={18} />
                    My items
                  </button>
                  <button
                    type="button"
                    onClick={() => openDashboardTab("received")}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-charcoal-700 hover:bg-primary-50 hover:text-primary-800"
                  >
                    <Inbox size={18} />
                    Requests to review
                    {unreadCount > 0 && (
                      <span className="ml-auto rounded-full bg-primary-100 px-2 py-0.5 text-[10px] font-bold text-primary-800">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-2 flex w-full items-center gap-3 rounded-xl border-t border-slate-100 px-3 py-3 text-sm font-bold text-charcoal-700 hover:bg-charcoal-100"
                  >
                    <LogOut size={18} />
                    Sign out
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => goTo("/login")}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-primary-700 px-4 py-3 text-sm font-bold text-white"
                >
                  <LogIn size={18} />
                  Sign in to Needful
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
