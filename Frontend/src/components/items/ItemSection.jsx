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
    <section className="bg-slate-50 py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-10">
          <h2 className="text-4xl font-bold">Browse Free Items</h2>

          <p className="mt-2 text-slate-500">
            Find useful items shared by people around you.
          </p>
        </div>

        <div className="grid gap-8 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <ItemCard key={item._id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ItemsSection;
