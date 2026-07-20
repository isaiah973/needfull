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

const ItemCard = ({ item }) => {
  const image = item.images?.[0];
  const ownerName = item.owner?.name || "Community member";
  const ownerAvatar = item.owner?.avatar;
  const condition = item.condition?.toLowerCase() || "good";
  const isAvailable = item.status === "available";
  const description =
    item.description?.replace(/\s+/g, " ").trim() ||
    "A useful item looking for a new home.";

  return (
    <Link
      to={`/items/${item._id}`}
      aria-label={`View ${item.title || "item"}`}
      className="group relative flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-charcoal-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary-300 hover:shadow-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-100 sm:rounded-3xl"
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

        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-charcoal-950/65 to-transparent" />

        <div className="absolute inset-x-2.5 top-2.5 flex items-start justify-between gap-1.5 sm:inset-x-4 sm:top-4 sm:gap-2">
          <span className="inline-flex max-w-[54%] items-center rounded-full border border-white/60 bg-white/95 px-2 py-1 text-[9px] font-bold text-charcoal-800 backdrop-blur sm:px-3 sm:py-1.5 sm:text-[11px]">
            <span className="truncate">{item.category || "Other"}</span>
          </span>
          <span className="max-w-[44%] truncate rounded-full bg-charcoal-900/90 px-2 py-1 text-[9px] font-bold capitalize text-white backdrop-blur sm:px-3 sm:py-1.5 sm:text-[11px]">
            {condition}
          </span>
        </div>

        <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 rounded-full bg-white/95 px-2 py-1 text-[9px] font-bold text-charcoal-800 backdrop-blur sm:bottom-3.5 sm:left-4 sm:gap-2 sm:px-3 sm:py-1.5 sm:text-[11px]">
          <span
            className={`h-2 w-2 rounded-full ${
              isAvailable ? "bg-primary-500" : "bg-charcoal-400"
            }`}
          />
          <span className="capitalize">{item.status || "available"}</span>
        </div>

        <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 rounded-full bg-charcoal-950/70 px-2 py-1 text-[9px] font-semibold text-white backdrop-blur sm:bottom-3.5 sm:right-4 sm:gap-1.5 sm:px-2.5 sm:py-1.5 sm:text-[11px]">
          <Eye size={12} className="sm:h-3.5 sm:w-3.5" />
          {item.views ?? 0}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-2.5 sm:p-3.5">
        <div className="flex items-start justify-between gap-2 sm:gap-3">
          <h3 className="line-clamp-1 text-sm font-bold leading-5 text-charcoal-950 transition-colors group-hover:text-primary-800 sm:text-base">
            {item.title || "Untitled item"}
          </h3>
          <span className="hidden h-7 w-7 shrink-0 place-items-center rounded-full bg-charcoal-50 text-charcoal-700 transition duration-300 group-hover:bg-primary-600 group-hover:text-white sm:grid">
            <ArrowUpRight size={15} />
          </span>
        </div>

        <p className="mt-1 line-clamp-1 text-[10px] leading-4 text-charcoal-500 sm:text-xs">
          {description}
        </p>

        <div className="mt-1.5 flex min-w-0 items-center gap-1.5 rounded-lg bg-charcoal-50 px-2 py-1 sm:gap-2">
          <span className="flex min-w-0 items-center gap-1 text-[10px] font-semibold text-charcoal-600 sm:gap-1.5 sm:text-xs">
            <MapPin
              size={12}
              className="shrink-0 text-primary-700 sm:h-3.5 sm:w-3.5"
            />
            <span className="truncate">
              {item.location || "Location unavailable"}
            </span>
          </span>
        </div>

        <div className="mt-2 flex items-center justify-between gap-1.5 border-t border-charcoal-100 pt-2 sm:gap-2">
          <div className="flex min-w-0 items-center gap-1.5 sm:gap-2.5">
            <div className="grid h-6 w-6 shrink-0 place-items-center overflow-hidden rounded-full bg-charcoal-100 text-[9px] font-bold text-charcoal-800 ring-2 ring-white sm:h-7 sm:w-7 sm:text-[10px]">
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
              <p className="truncate text-[9px] font-bold text-charcoal-700 sm:text-[11px]">
                {ownerName}
              </p>
              <p className="hidden items-center gap-1 whitespace-nowrap text-[9px] font-medium text-charcoal-400 sm:flex">
                <Clock3 size={9} className="text-primary-600 sm:h-[11px] sm:w-[11px]" />
                {formatPostedAgo(item.createdAt)}
              </p>
            </div>
          </div>

          <div
            className="flex shrink-0 items-center gap-1 rounded-full bg-primary-50 px-1.5 py-1 text-[9px] font-bold text-primary-800 ring-1 ring-primary-100 sm:px-2"
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
