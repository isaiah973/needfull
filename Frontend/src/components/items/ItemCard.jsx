import { Link } from "react-router-dom";

const ItemCard = ({ item }) => {
  const image =
    item.images?.length > 0
      ? item.images[0]
      : "https://placehold.co/600x400?text=No+Image";

  const postedAgo = () => {
    const created = new Date(item.createdAt);
    const now = new Date();

    const seconds = Math.floor((now - created) / 1000);

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;

    const months = Math.floor(days / 30);
    return `${months}mo ago`;
  };

  return (
    <Link
      to={`/items/${item._id}`}
      className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-teal-300 hover:shadow-2xl"
    >
      {/* IMAGE */}

      <div className="relative h-56 overflow-hidden">
        <img
          src={image}
          alt={item.title}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
        />

        {/* Gradient Overlay */}

        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent"></div>

        {/* Badges */}

        <div className="absolute left-4 top-4 flex gap-2">
          <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-800 backdrop-blur">
            {item.category}
          </span>

          <span className="rounded-full bg-teal-600 px-3 py-1 text-xs font-semibold text-white shadow">
            {item.condition}
          </span>
        </div>
      </div>

      {/* CONTENT */}

      <div className="p-5">
        <h3 className="line-clamp-1 text-xl font-bold text-slate-900">
          {item.title}
        </h3>

        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
          {item.description}
        </p>
      </div>

      {/* FOOTER */}

      <div className="border-t border-slate-200 bg-slate-50 px-5 py-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-slate-700">📍 {item.location}</span>

          <span className="text-slate-500">👁 {item.views}</span>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-800">
              {item.owner?.name}
            </p>

            <p className="text-xs text-slate-500">Posted {postedAgo()}</p>
          </div>

          <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700 transition group-hover:bg-teal-600 group-hover:text-white">
            View →
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ItemCard;
