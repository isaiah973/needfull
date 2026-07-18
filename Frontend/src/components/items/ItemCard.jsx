import {
  ArrowUpRight,
  Clock3,
  Eye,
  ImageOff,
  MapPin,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

const formatPostedAgo = (createdAt) => {
  const created = new Date(createdAt);

  if (Number.isNaN(created.getTime())) return "Recently";

  const seconds = Math.max(
    0,
    Math.floor((Date.now() - created.getTime()) / 1000),
  );

  if (seconds < 60) return "Just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;

  return `${Math.floor(months / 12)}y ago`;
};

const conditionStyles = {
  new: "bg-blue-50 text-blue-700 ring-blue-200",
  excellent: "bg-primary-50 text-primary-700 ring-primary-200",
  good: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  fair: "bg-slate-100 text-slate-700 ring-slate-200",
  poor: "bg-red-50 text-red-700 ring-red-200",
};

const ItemCard = ({ item }) => {
  const image = item.images?.[0];
  const ownerName = item.owner?.name || "Community member";
  const ownerAvatar = item.owner?.avatar;
  const condition = item.condition?.toLowerCase() || "good";
  const isAvailable = item.status === "available";

  return (
    <Link
      to={`/items/${item._id}`}
      aria-label={`View ${item.title || "item"}`}
      className="group relative flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_6px_20px_rgba(15,23,42,0.07)] transition duration-300 hover:-translate-y-1 hover:border-primary-300 hover:shadow-[0_18px_40px_rgba(10,186,181,0.14)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-600/20 sm:rounded-[22px]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        {image ? (
          <img
            src={image}
            alt={item.title || "Shared item"}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 bg-slate-100 text-slate-400">
            <ImageOff size={26} strokeWidth={1.6} />
            <span className="text-[10px] font-semibold sm:text-xs">
              No image available
            </span>
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/65 to-transparent" />

        <div className="absolute inset-x-2.5 top-2.5 flex items-start justify-between gap-1.5 sm:inset-x-4 sm:top-4 sm:gap-2">
          <span className="inline-flex max-w-[54%] items-center rounded-full border border-white/50 bg-white/95 px-2 py-1 text-[9px] font-bold text-slate-800 shadow-md backdrop-blur sm:px-3 sm:py-1.5 sm:text-[11px]">
            <span className="truncate">{item.category || "Other"}</span>
          </span>
          <span
            className={`max-w-[44%] truncate rounded-full px-2 py-1 text-[9px] font-bold capitalize shadow-md ring-1 sm:px-3 sm:py-1.5 sm:text-[11px] ${
              conditionStyles[condition] || conditionStyles.good
            }`}
          >
            {condition}
          </span>
        </div>

        <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 text-[10px] font-bold text-white sm:bottom-4 sm:left-4 sm:gap-2 sm:text-xs">
          <span
            className={`h-2 w-2 rounded-full ring-[3px] ring-white/20 sm:h-2.5 sm:w-2.5 sm:ring-4 ${
              isAvailable ? "bg-primary-400" : "bg-red-400"
            }`}
          />
          <span className="capitalize">{item.status || "available"}</span>
        </div>

        <div className="absolute bottom-2 right-2.5 flex items-center gap-1 rounded-full bg-slate-950/45 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur sm:bottom-3.5 sm:right-4 sm:gap-1.5 sm:px-2.5 sm:py-1.5 sm:text-xs">
          <Eye size={12} className="sm:h-3.5 sm:w-3.5" />
          {item.views ?? 0}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-3 sm:p-5">
        <div className="flex items-start justify-between gap-2 sm:gap-3">
          <h3 className="line-clamp-2 min-h-10 text-sm font-bold leading-5 text-slate-900 transition-colors group-hover:text-primary-700 sm:min-h-0 sm:text-lg sm:leading-snug">
            {item.title || "Untitled item"}
          </h3>
          <span className="hidden h-9 w-9 shrink-0 place-items-center rounded-full bg-primary-50 text-primary-700 transition duration-300 group-hover:rotate-6 group-hover:bg-primary-600 group-hover:text-white sm:grid">
            <ArrowUpRight size={17} />
          </span>
        </div>

        <p className="mt-2 hidden line-clamp-2 min-h-12 text-sm leading-6 text-slate-500 sm:block">
          {item.description || "A useful item looking for a new home."}
        </p>

        <div className="mt-2.5 flex min-w-0 items-center gap-1.5 rounded-lg bg-slate-50 px-2 py-1.5 sm:mt-4 sm:gap-2 sm:bg-transparent sm:p-0">
          <span className="flex min-w-0 items-center gap-1 text-[10px] font-semibold text-slate-600 sm:gap-1.5 sm:text-xs">
            <MapPin
              size={12}
              className="shrink-0 text-red-500 sm:h-3.5 sm:w-3.5"
            />
            <span className="truncate">
              {item.location || "Location unavailable"}
            </span>
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between gap-1.5 border-t border-slate-100 pt-3 sm:mt-5 sm:gap-3 sm:pt-4">
          <div className="flex min-w-0 items-center gap-1.5 sm:gap-2.5">
            <div className="grid h-7 w-7 shrink-0 place-items-center overflow-hidden rounded-full bg-primary-100 text-[10px] font-bold text-primary-800 ring-2 ring-white shadow-sm sm:h-9 sm:w-9 sm:text-xs">
              {ownerAvatar ? (
                <img
                  src={ownerAvatar}
                  alt={ownerName}
                  className="h-full w-full object-cover"
                />
              ) : (
                ownerName.charAt(0).toUpperCase()
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-[10px] font-bold text-slate-700 sm:text-xs">
                {ownerName}
              </p>
              <p className="mt-0.5 flex items-center gap-0.5 whitespace-nowrap text-[9px] font-medium text-slate-400 sm:gap-1 sm:text-[11px]">
                <Clock3 size={9} className="text-blue-500 sm:h-[11px] sm:w-[11px]" />
                {formatPostedAgo(item.createdAt)}
              </p>
            </div>
          </div>

          <div
            className="flex shrink-0 items-center gap-1 rounded-full bg-blue-50 px-2 py-1.5 text-[9px] font-bold text-blue-700 ring-1 ring-blue-100 sm:gap-1.5 sm:px-2.5 sm:text-[11px]"
            title={`${item.requestCount ?? 0} interested`}
          >
            <Users size={12} className="sm:h-3.5 sm:w-3.5" />
            <span>{item.requestCount ?? 0}</span>
            <span className="hidden sm:inline">interested</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ItemCard;
