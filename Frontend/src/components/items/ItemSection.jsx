import {
  ArrowDownUp,
  PackageSearch,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { categories } from "../../data/categories";
import { getItems } from "../../services/itemService";
import ItemCard from "./ItemCard";

const conditions = ["new", "excellent", "good", "fair", "poor"];

const ItemSkeleton = () => (
  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white sm:rounded-3xl">
    <div className="aspect-[4/3] animate-pulse bg-slate-200" />
    <div className="space-y-3 p-3 sm:p-5">
      <div className="h-5 w-4/5 animate-pulse rounded bg-slate-200" />
      <div className="h-8 animate-pulse rounded bg-slate-100" />
      <div className="h-8 animate-pulse rounded bg-slate-100" />
    </div>
  </div>
);

const ItemsSection = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const location = searchParams.get("location") || "";
  const condition = searchParams.get("condition") || "";
  const sort = searchParams.get("sort") || "newest";
  const filterKey = searchParams.toString();
  const activeFilterCount = [category, location, condition].filter(
    Boolean,
  ).length;

  useEffect(() => {
    let ignore = false;

    const fetchItems = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getItems({
          ...(search && { search }),
          ...(category && { category }),
          ...(location && { location }),
          ...(condition && { condition }),
          sort,
        });

        if (!ignore) setItems(data);
      } catch (err) {
        if (!ignore) {
          setError(
            err.response?.data?.message ||
              "We could not load the items. Please try again.",
          );
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchItems();

    return () => {
      ignore = true;
    };
  }, [category, condition, location, search, sort]);

  const applyFilters = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const nextParams = new URLSearchParams();

    ["search", "category", "location", "condition", "sort"].forEach((key) => {
      const value = formData.get(key)?.trim();
      if (value && !(key === "sort" && value === "newest")) {
        nextParams.set(key, value);
      }
    });

    setSearchParams(nextParams);
    setFiltersOpen(false);
  };

  const clearFilters = () => {
    setSearchParams({});
    setFiltersOpen(false);
  };

  const removeFilter = (key) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete(key);
    setSearchParams(nextParams);
  };

  const resultLabel = `${items.length} ${
    items.length === 1 ? "item" : "items"
  }`;

  return (
    <section id="items" className="bg-slate-50 py-10 sm:py-16">
      <div className="mx-auto max-w-7xl px-3 sm:px-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            {/* <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-700">
              Community marketplace
            </p> */}
            <h2 className="mt-2 text-3xl font-bold text-charcoal-950 sm:text-4xl">
              {search ? `Results for “${search}”` : "Find something useful"}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              Browse free items shared by people in the Needful community.
            </p>
          </div>

          <div className="flex items-center justify-between gap-3 sm:justify-end">
            <p
              className="text-sm font-semibold text-charcoal-600"
              aria-live="polite"
            >
              {loading ? "Finding items…" : resultLabel}
            </p>
            <button
              type="button"
              onClick={() => setFiltersOpen((current) => !current)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-charcoal-800 shadow-sm transition hover:border-primary-300 hover:text-primary-800 lg:hidden"
              aria-expanded={filtersOpen}
              aria-controls="item-filters"
            >
              <SlidersHorizontal size={17} />
              Filters
              {activeFilterCount > 0 && (
                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-primary-700 px-1 text-[10px] text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        <form
          id="item-filters"
          key={filterKey}
          onSubmit={applyFilters}
          className={`mt-7 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:block ${
            filtersOpen ? "block" : "hidden"
          }`}
        >
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_0.8fr_0.9fr_auto]">
            <label className="relative block">
              <span className="sr-only">Search items</span>
              <Search
                size={17}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="search"
                name="search"
                defaultValue={search}
                placeholder="Search items"
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm text-charcoal-900 outline-none transition placeholder:text-slate-400 focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-100"
              />
            </label>

            <label>
              <span className="sr-only">Category</span>
              <select
                name="category"
                defaultValue={category}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-charcoal-800 outline-none transition focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-100"
              >
                <option value="">All categories</option>
                {categories.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className="sr-only">Pickup location</span>
              <input
                type="text"
                name="location"
                defaultValue={location}
                placeholder="City or state"
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-charcoal-900 outline-none transition placeholder:text-slate-400 focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-100"
              />
            </label>

            <label>
              <span className="sr-only">Condition</span>
              <select
                name="condition"
                defaultValue={condition}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm capitalize text-charcoal-800 outline-none transition focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-100"
              >
                <option value="">Any condition</option>
                {conditions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="relative">
              <span className="sr-only">Sort items</span>
              <ArrowDownUp
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <select
                name="sort"
                defaultValue={sort}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-charcoal-800 outline-none transition focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-100"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="popular">Most viewed</option>
                <option value="requested">Most requested</option>
              </select>
            </label>

            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary-700 px-5 text-sm font-bold text-white transition hover:bg-primary-800"
            >
              <SlidersHorizontal size={16} />
              Apply
            </button>
          </div>

          {(search || activeFilterCount > 0 || sort !== "newest") && (
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
              <span className="mr-1 text-xs font-bold uppercase tracking-wide text-slate-400">
                Active
              </span>
              {[
                ["search", search, `Search: ${search}`],
                ["category", category, category],
                ["location", location, location],
                ["condition", condition, condition],
                [
                  "sort",
                  sort !== "newest" ? sort : "",
                  `Sort: ${sort.replace("popular", "most viewed").replace("requested", "most requested")}`,
                ],
              ].map(
                ([key, value, label]) =>
                  value && (
                    <button
                      type="button"
                      key={key}
                      onClick={() => removeFilter(key)}
                      className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1.5 text-xs font-bold capitalize text-primary-800 ring-1 ring-primary-100"
                    >
                      {label}
                      <X size={13} />
                    </button>
                  ),
              )}
              <button
                type="button"
                onClick={clearFilters}
                className="ml-auto inline-flex items-center gap-1.5 px-2 py-1.5 text-xs font-bold text-slate-500 transition hover:text-charcoal-900"
              >
                <RotateCcw size={13} />
                Clear all
              </button>
            </div>
          )}
        </form>

        <div className="mt-7 sm:mt-9">
          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <ItemSkeleton key={index} />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-charcoal-200 bg-white px-6 py-14 text-center">
              <PackageSearch size={30} className="mx-auto text-charcoal-400" />
              <p className="mt-4 font-bold text-charcoal-800">
                Items could not be loaded
              </p>
              <p className="mt-2 text-sm text-slate-500">{error}</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-5 rounded-xl bg-charcoal-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-charcoal-800"
              >
                Try again
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
              <PackageSearch size={34} className="mx-auto text-charcoal-400" />
              <p className="mt-4 font-bold text-charcoal-800">
                No matching items
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Try a broader search or clear some filters.
              </p>
              <button
                type="button"
                onClick={clearFilters}
                className="mt-5 inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-charcoal-800 hover:border-primary-300 hover:text-primary-800"
              >
                <RotateCcw size={15} />
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
              {items.map((item) => (
                <ItemCard key={item._id} item={item} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ItemsSection;
