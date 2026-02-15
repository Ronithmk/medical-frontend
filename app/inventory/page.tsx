"use client";

import Sidebar from "../components/Sidebar";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Inventory() {
  const router = useRouter();

  const [medicines, setMedicines] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filterExpiry, setFilterExpiry] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(true);

  const [newMedicine, setNewMedicine] = useState({
    name: "",
    stock: "",
    price: "",
    expiry: "",
  });

  const API_BASE = "http://127.0.0.1:8000";

  // 🔁 Fetch products
  const fetchProducts = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/products`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Unauthorized");

      const data = await res.json();

      const formatted = data.map((item: any) => ({
        id: item.id,
        name: item.name,
        stock: item.quantity,
        price: item.sell_price,
        expiry: item.expiry_date,
        batch_number: item.batch_number,
        buy_price: item.buy_price,
        supplier: item.supplier,
      }));

      setMedicines(formatted);
    } catch (error) {
      console.error("Inventory fetch error:", error);
      localStorage.removeItem("token");
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ➕ Add medicine
  const addMedicine = async () => {
    if (!newMedicine.name || !newMedicine.stock) return;

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${API_BASE}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newMedicine.name,
          batch_number: "AUTO",
          expiry_date: newMedicine.expiry,
          buy_price: Number(newMedicine.price),
          sell_price: Number(newMedicine.price),
          quantity: Number(newMedicine.stock),
          supplier: "Default Supplier",
        }),
      });

      if (!res.ok) throw new Error();

      await fetchProducts();

      setShowAdd(false);
      setNewMedicine({ name: "", stock: "", price: "", expiry: "" });
    } catch {
      alert("Failed to add medicine");
    }
  };

  // 🔥 UPDATE MEDICINE
  const updateMedicine = async () => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${API_BASE}/products/${editing.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editing.name,
          batch_number: editing.batch_number || "AUTO",
          expiry_date: editing.expiry,
          buy_price: Number(editing.price),
          sell_price: Number(editing.price),
          quantity: Number(editing.stock),
          supplier: editing.supplier || "Default Supplier",
        }),
      });

      if (!res.ok) throw new Error();

      setEditing(null);
      await fetchProducts(); // 🔥 Refresh after update
    } catch {
      alert("Update failed");
    }
  };

  // ❌ Delete
  const deleteMedicine = async (id: number) => {
    const token = localStorage.getItem("token");

    try {
      await fetch(`${API_BASE}/products/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      await fetchProducts();
    } catch {
      alert("Delete failed");
    }
  };

  const filtered = medicines
    .filter((m) =>
      m.name.toLowerCase().includes(search.toLowerCase())
    )
    .filter((m) =>
      filterExpiry ? new Date(m.expiry) < new Date() : true
    );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading Inventory...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 p-6 md:p-10">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Inventory</h1>

          <button
            onClick={() => setShowAdd(true)}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
          >
            + Add Medicine
          </button>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <input
            placeholder="Search medicine..."
            className="border p-3 rounded-lg w-full md:w-96"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={filterExpiry}
              onChange={() => setFilterExpiry(!filterExpiry)}
            />
            Show Expired Only
          </label>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow border overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4 text-left">Name</th>
                <th className="p-4 text-left">Stock</th>
                <th className="p-4 text-left">Price</th>
                <th className="p-4 text-left">Expiry</th>
                <th className="p-4 text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((m) => (
                <tr key={m.id} className="border-t">
                  <td className="p-4">{m.name}</td>
                  <td className="p-4">{m.stock}</td>
                  <td className="p-4">₹{m.price}</td>
                  <td className="p-4">{m.expiry}</td>
                  <td className="p-4 flex gap-3">
                    <button
                      onClick={() => setEditing(m)}
                      className="text-blue-600 text-sm"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => deleteMedicine(m.id)}
                      className="text-red-600 text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ADD MODAL */}
        {showAdd && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <div className="bg-white p-8 rounded-2xl w-full max-w-md">
              <h2 className="font-bold text-lg mb-4">Add Medicine</h2>

              <input
                placeholder="Name"
                className="border p-3 w-full rounded mb-4"
                value={newMedicine.name}
                onChange={(e) =>
                  setNewMedicine({ ...newMedicine, name: e.target.value })
                }
              />

              <input
                type="number"
                placeholder="Stock"
                className="border p-3 w-full rounded mb-4"
                value={newMedicine.stock}
                onChange={(e) =>
                  setNewMedicine({ ...newMedicine, stock: e.target.value })
                }
              />

              <input
                type="number"
                placeholder="Price"
                className="border p-3 w-full rounded mb-4"
                value={newMedicine.price}
                onChange={(e) =>
                  setNewMedicine({ ...newMedicine, price: e.target.value })
                }
              />

              <input
                type="date"
                className="border p-3 w-full rounded mb-4"
                value={newMedicine.expiry}
                onChange={(e) =>
                  setNewMedicine({ ...newMedicine, expiry: e.target.value })
                }
              />

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowAdd(false)}
                  className="bg-gray-200 px-4 py-2 rounded"
                >
                  Cancel
                </button>

                <button
                  onClick={addMedicine}
                  className="bg-green-600 text-white px-4 py-2 rounded"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 🔥 EDIT MODAL */}
        {editing && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <div className="bg-white p-8 rounded-2xl w-full max-w-md">
              <h2 className="font-bold text-lg mb-4">Edit Medicine</h2>

              <input
                className="border p-3 w-full rounded mb-4"
                value={editing.name}
                onChange={(e) =>
                  setEditing({ ...editing, name: e.target.value })
                }
              />

              <input
                type="number"
                className="border p-3 w-full rounded mb-4"
                value={editing.stock}
                onChange={(e) =>
                  setEditing({ ...editing, stock: e.target.value })
                }
              />

              <input
                type="number"
                className="border p-3 w-full rounded mb-4"
                value={editing.price}
                onChange={(e) =>
                  setEditing({ ...editing, price: e.target.value })
                }
              />

              <input
                type="date"
                className="border p-3 w-full rounded mb-4"
                value={editing.expiry}
                onChange={(e) =>
                  setEditing({ ...editing, expiry: e.target.value })
                }
              />

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setEditing(null)}
                  className="bg-gray-200 px-4 py-2 rounded"
                >
                  Cancel
                </button>

                <button
                  onClick={updateMedicine}
                  className="bg-green-600 text-white px-4 py-2 rounded"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}