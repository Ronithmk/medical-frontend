"use client";

import Sidebar from "../components/Sidebar";
import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import { useRouter } from "next/navigation";

export default function POS() {
  const router = useRouter();
  const API_BASE = "http://127.0.0.1:8000";

  const [medicines, setMedicines] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [loading, setLoading] = useState(true);

  // 🔁 Fetch medicines safely
  const fetchMedicines = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Unauthorized");

      const data = await res.json();

      const formatted = data.map((item: any) => ({
        id: item.id,
        name: item.name,
        stock: item.quantity,
        price: item.sell_price,
      }));

      setMedicines(formatted);
    } catch (err) {
      console.error("POS fetch error:", err);
      localStorage.removeItem("token");
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  // ➕ Add to cart
  const addToCart = (medicine: any) => {
    if (medicine.stock <= 0) {
      alert("Out of stock!");
      return;
    }

    const exists = cart.find((item) => item.id === medicine.id);

    if (exists) {
      if (exists.qty >= medicine.stock) {
        alert("Cannot exceed available stock");
        return;
      }

      setCart(
        cart.map((item) =>
          item.id === medicine.id
            ? { ...item, qty: item.qty + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { ...medicine, qty: 1 }]);
    }
  };

  // ✏ Update quantity
  const updateQty = (id: number, qty: number) => {
    if (qty < 1) return;

    const product = medicines.find((m) => m.id === id);
    if (product && qty > product.stock) {
      alert("Quantity exceeds stock");
      return;
    }

    setCart(
      cart.map((item) =>
        item.id === id ? { ...item, qty } : item
      )
    );
  };

  // ❌ Remove from cart (NEW)
  const removeFromCart = (id: number) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  const gstRate = 0.18;
  const gstAmount = subtotal * gstRate;
  const total = subtotal + gstAmount;

  // 🧾 Professional Invoice
  const generatePDF = () => {
    const doc = new jsPDF();
    const invoiceNo = `INV-${Date.now()}`;
    const date = new Date().toLocaleString();

    doc.setFontSize(18);
    doc.text("ProtonCode Medical Store", 14, 20);

    doc.setFontSize(11);
    doc.text(`Invoice No: ${invoiceNo}`, 14, 30);
    doc.text(`Date: ${date}`, 14, 36);
    doc.text(`Customer: ${customerName}`, 14, 42);
    doc.text(`Phone: ${customerPhone}`, 14, 48);

    let y = 60;

    doc.text("Item", 14, y);
    doc.text("Qty", 90, y);
    doc.text("Price", 110, y);
    doc.text("Total", 150, y);

    y += 4;
    doc.line(14, y, 195, y);
    y += 8;

    cart.forEach((item) => {
      doc.text(item.name, 14, y);
      doc.text(String(item.qty), 92, y);
      doc.text(`₹${item.price}`, 110, y);
      doc.text(`₹${item.qty * item.price}`, 150, y);
      y += 8;
    });

    y += 4;
    doc.line(14, y, 195, y);
    y += 10;

    doc.text(`Subtotal: ₹${subtotal.toFixed(2)}`, 130, y);
    y += 8;
    doc.text(`GST (18%): ₹${gstAmount.toFixed(2)}`, 130, y);
    y += 8;

    doc.setFontSize(14);
    doc.text(`Grand Total: ₹${total.toFixed(2)}`, 130, y);

    doc.save(`${invoiceNo}.pdf`);
  };

  // 💰 Checkout
  const checkout = async () => {
    if (cart.length === 0) {
      alert("Cart is empty!");
      return;
    }

    if (!customerName || !customerPhone) {
      alert("Enter customer details!");
      return;
    }

    const token = localStorage.getItem("token");

    try {
      for (const item of cart) {
        const res = await fetch(`${API_BASE}/sales`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            product_id: item.id,
            quantity: item.qty,
            customer_name: customerName,
            customer_phone: customerPhone,
          }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.detail || "Sale failed");
        }
      }

      generatePDF();

      alert("Sale completed successfully!");

      setCart([]);
      setCustomerName("");
      setCustomerPhone("");

      await fetchMedicines();
    } catch (error: any) {
      alert(error.message || "Sale failed!");
    }
  };

  const filtered = medicines.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading POS...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 p-6 md:p-10">
        <h1 className="text-3xl font-bold mb-6">
          Billing / POS System
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Medicine List */}
          <div>
            <input
              placeholder="Search medicine..."
              className="border p-3 rounded-lg w-full mb-6"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <div className="space-y-4">
              {filtered.map((med) => (
                <div
                  key={med.id}
                  className="bg-white p-4 rounded-xl shadow flex justify-between items-center"
                >
                  <div>
                    <p className="font-semibold">{med.name}</p>
                    <p className="text-sm text-gray-500">
                      ₹{med.price} | Stock: {med.stock}
                    </p>
                  </div>

                  <button
                    onClick={() => addToCart(med)}
                    className="bg-green-600 text-white px-4 py-2 rounded"
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Cart Section */}
          <div className="bg-white p-6 rounded-2xl shadow">
            <h2 className="text-xl font-bold mb-4">Cart</h2>

            <input
              placeholder="Customer Name"
              className="border p-2 w-full mb-3 rounded"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />

            <input
              placeholder="Customer Phone"
              className="border p-2 w-full mb-6 rounded"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
            />

            {cart.length === 0 && (
              <p className="text-gray-500">No items added</p>
            )}

            {cart.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center mb-4"
              >
                <div>
                  <p>{item.name}</p>
                  <input
                    type="number"
                    value={item.qty}
                    min="1"
                    className="border w-16 p-1 mt-1"
                    onChange={(e) =>
                      updateQty(item.id, Number(e.target.value))
                    }
                  />
                </div>

                <div className="flex items-center gap-3">
                  <p>₹{(item.price * item.qty).toFixed(2)}</p>

                  {/* 🔥 Remove Button */}
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-600 text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}

            <hr className="my-4" />

            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span>GST (18%):</span>
                <span>₹{gstAmount.toFixed(2)}</span>
              </div>

              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={checkout}
              className="mt-6 w-full bg-green-600 text-white py-3 rounded-lg"
            >
              Complete Sale & Generate Invoice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}