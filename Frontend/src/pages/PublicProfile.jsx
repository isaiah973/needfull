import {
  ArrowLeft,
  CalendarDays,
  LoaderCircle,
  MapPin,
  Package,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import ItemCard from "../components/items/ItemCard";
import api from "../services/axios";

const DEFAULT_PROFILE_AVATAR = "/images/default-profile-avatar.png";

const PublicProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    api
      .get(`/users/public/${id}`)
      .then(({ data }) => {
        if (ignore) return;

        setProfile(data.user);
        setItems(data.items || []);
      })
      .catch((requestError) => {
        if (!ignore) {
          setError(
            requestError.response?.data?.message ||
              "We could not load this profile.",
          );
        }
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [id]);

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

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="mx-auto max-w-lg px-6 py-24 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-slate-100 text-slate-400">
            <UserRound size={28} />
          </div>
          <h1 className="mt-5 text-2xl font-bold text-slate-900">
            Profile unavailable
          </h1>
          <p className="mt-2 text-sm text-slate-500">{error}</p>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mt-6 rounded-xl bg-primary-700 px-6 py-3 text-sm font-bold text-white hover:bg-primary-800"
          >
            Go back
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main>
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 transition hover:text-primary-700"
            >
              <ArrowLeft size={17} />
              Back
            </button>

            <div className="mt-7 flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-3xl bg-primary-100 text-3xl font-bold text-primary-800 ring-4 ring-primary-50 sm:h-28 sm:w-28">
                <img
                  src={profile.avatar || DEFAULT_PROFILE_AVATAR}
                  alt={profile.name}
                  className="h-full w-full object-cover"
                />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-3xl font-bold text-slate-900">
                    {profile.name}
                  </h1>
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2.5 py-1 text-[11px] font-bold text-primary-700">
                    <ShieldCheck size={14} />
                    Needful member
                  </span>
                </div>
                <p className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                  <CalendarDays size={16} className="text-charcoal-500" />
                  Member since{" "}
                  {new Date(profile.createdAt).toLocaleDateString("en-NG", {
                    month: "long",
                    year: "numeric",
                  })}
                </p>
                {profile.state && (
                  <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-charcoal-700">
                    <MapPin size={16} className="text-primary-600" />
                    {profile.state}, Nigeria
                  </p>
                )}
                <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-600">
                  <Package size={16} className="text-primary-600" />
                  {items.length} {items.length === 1 ? "item" : "items"} shared
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-3 py-10 sm:px-6 lg:px-8 lg:py-14">
          <div className="mb-7">
            <h2 className="text-2xl font-bold text-slate-900">Shared items</h2>
            <p className="mt-1 text-sm text-slate-500">
              Public items posted by {profile.name.split(" ")[0]}.
            </p>
          </div>

          {items.length === 0 ? (
            <div className="flex min-h-72 flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white px-6 text-center">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400">
                <Package size={25} />
              </div>
              <h3 className="mt-5 font-bold text-slate-800">
                No public items yet
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                This member has not shared any active items.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
              {items.map((item) => (
                <ItemCard key={item._id} item={item} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default PublicProfile;
