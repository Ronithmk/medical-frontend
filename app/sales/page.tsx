"use client";

import Sidebar from "../components/Sidebar";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Sales() {
  const router = useRouter();
  const API_BASE = "http://127.0.0.1:8000";

  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSales = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/sales`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch sales");
      }

      const data = await res.json();

      const formatted = data.map((sale: any) => ({
        id: sale.id,
        product_name: sale.product_name || "Unknown Product",
        quantity: sale.quantity || 0,
        customer_name: sale.customer_name || "Walk-in Customer",
        customer_phone: sale.customer_phone || "-",
        sold_at: sale.sold_at,
        total_price: sale.total_price || 0,
      }));

      setSales(formatted);
    } catch (error) {
      console.error("Sales fetch error:", error);
      localStorage.removeItem("token");
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg">Loading Sales...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 p-6 md:p-10">

        <h1 className="text-3xl font-bold mb-6">Sales History</h1>

        {sales.length === 0 && (
          <p className="text-gray-500">No sales recorded yet.</p>
        )}

        <div className="space-y-6">
          {sales.map((sale) => (
            <div
              key={sale.id}
              className="bg-white p-6 rounded-2xl shadow border"
            >
              <p><strong>Product:</strong> {sale.product_name}</p>
              <p><strong>Quantity:</strong> {sale.quantity}</p>

              <p><strong>Customer:</strong> {sale.customer_name}</p>
              <p><strong>Phone:</strong> {sale.customer_phone}</p>

              <p>
                <strong>Date:</strong>{" "}
                {sale.sold_at
                  ? new Date(sale.sold_at).toLocaleString()
                  : "-"}
              </p>

              <p className="mt-2 font-bold text-green-600">
                Total: ₹{Number(sale.total_price).toFixed(2)}
              </p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}