import { useEffect, useState } from "react";
import { getItems } from "../../services/itemService";
import ItemCard from "./ItemCard";

const ItemsSection = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const data = await getItems();

        setItems(data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  if (loading) {
    return <section className="py-20 text-center">Loading items...</section>;
  }

  return (
    <section className="bg-slate-50 py-10 sm:py-16">
      <div className="mx-auto max-w-7xl px-3 sm:px-6">
        <div className="mb-7 sm:mb-10">
          <h2 className="text-3xl font-bold sm:text-4xl">Browse Free Items</h2>

          <p className="mt-2 text-slate-500">
            Find useful items shared by people around you.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <ItemCard key={item._id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ItemsSection;
