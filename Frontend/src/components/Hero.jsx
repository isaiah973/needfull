import {
  ArrowRight,
  Armchair,
  BookOpen,
  Heart,
  MapPin,
  PackagePlus,
  Search,
  Shirt,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const communityItems = [
  {
    label: "Books",
    note: "Learn something new",
    icon: BookOpen,
    className: "bg-primary-100 text-primary-900",
  },
  {
    label: "Clothing",
    note: "Pass good pieces on",
    icon: Shirt,
    className: "bg-white text-charcoal-900",
  },
  {
    label: "Home",
    note: "Useful everyday items",
    icon: Armchair,
    className: "bg-charcoal-800 text-white",
  },
];

const Hero = () => {
  const navigate = useNavigate();

  const browseItems = () => {
    document.getElementById("items")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="overflow-hidden border-b border-charcoal-200 bg-[#f6f8f7]">
      <div className="mx-auto grid max-w-7xl lg:min-h-[570px] lg:grid-cols-[1.03fr_0.97fr]">
        <div className="flex items-center px-5 py-14 sm:px-8 sm:py-16 lg:px-10 lg:py-20 xl:px-12">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-primary-800">
              <Sparkles size={14} />
              Useful things deserve a next home
            </div>

            <h1 className="mt-6 max-w-xl text-[2.65rem] font-extrabold leading-[1.02] tracking-[-0.045em] text-charcoal-950 sm:text-6xl lg:text-[4rem]">
              What you no longer need could mean{" "}
              <span className="text-primary-700">everything</span> to someone.
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-charcoal-600 sm:text-lg sm:leading-8">
              Give useful items freely or find something you genuinely need.
              Needful brings generous people and nearby communities together.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => navigate("/create-item")}
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-primary-700 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-primary-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-200"
              >
                <PackagePlus size={18} />
                Give an item
                <ArrowRight
                  size={17}
                  className="transition-transform group-hover:translate-x-1"
                />
              </button>
              <button
                type="button"
                onClick={browseItems}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-charcoal-300 bg-white px-6 py-3.5 text-sm font-bold text-charcoal-800 transition hover:border-charcoal-500 hover:bg-charcoal-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-charcoal-200"
              >
                <Search size={18} />
                Browse available items
              </button>
            </div>

            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-charcoal-200 pt-5 text-sm text-charcoal-500">
              <span className="inline-flex items-center gap-2">
                <Heart size={16} className="text-primary-700" />
                No selling. Just giving.
              </span>
              <span className="inline-flex items-center gap-2">
                <MapPin size={16} className="text-primary-700" />
                Made for communities across Nigeria
              </span>
            </div>
          </div>
        </div>

        <div className="relative flex min-h-[480px] items-center overflow-hidden bg-charcoal-950 px-5 py-12 sm:px-10 lg:min-h-full lg:px-12">
          <div className="absolute -right-28 -top-28 h-72 w-72 rounded-full border-[52px] border-primary-700/20" />
          <div className="absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-primary-700/10 blur-3xl" />

          <div className="relative mx-auto w-full max-w-lg">
            <div className="mb-6 flex items-end justify-between gap-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-300">
                  The community shelf
                </p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  Make room. Make an impact.
                </h2>
              </div>
              <span className="hidden rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold text-charcoal-300 sm:block">
                Give freely
              </span>
            </div>

            <div className="space-y-3">
              {communityItems.map((item, index) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => navigate(`/?category=${item.label}`)}
                    className={`group flex w-full items-center gap-4 rounded-2xl p-4 text-left transition hover:translate-x-1 sm:p-5 ${item.className} ${
                      index === 1 ? "sm:ml-8 sm:w-[calc(100%-2rem)]" : ""
                    }`}
                  >
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-current/10 ring-1 ring-current/10">
                      <Icon size={23} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-base font-extrabold">
                        {item.label}
                      </span>
                      <span className="mt-0.5 block text-sm opacity-65">
                        {item.note}
                      </span>
                    </span>
                    <ArrowRight
                      size={18}
                      className="shrink-0 opacity-50 transition group-hover:translate-x-1 group-hover:opacity-100"
                    />
                  </button>
                );
              })}
            </div>

            <div className="mt-5 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm text-charcoal-300 backdrop-blur-sm">
              <span>Have something different?</span>
              <button
                type="button"
                onClick={() => navigate("/create-item")}
                className="font-bold text-primary-300 transition hover:text-primary-200"
              >
                List it now
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
