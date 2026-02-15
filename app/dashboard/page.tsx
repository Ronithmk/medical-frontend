"use client";

import Sidebar from "../components/Sidebar";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Dashboard() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const res = await fetch("http://127.0.0.1:8000/dashboard", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Unauthorized");

        const data = await res.json();
        setDashboard(data);
      } catch (error) {
        console.error("Dashboard error:", error);
        localStorage.removeItem("token");
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [router]);

  const salesData =
    dashboard && dashboard.weekly_revenue
      ? dashboard.weekly_revenue.map((item: any) => ({
          name: new Date(item.date).toLocaleDateString("en-IN", {
            weekday: "short",
          }),
          sales: item.revenue,
        }))
      : [];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg">Loading Dashboard...</p>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg text-red-500">
          Unable to load dashboard data.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 p-6 md:p-10">

        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome back
          </h1>
          <p className="text-gray-500 mt-2">
            Here's what’s happening with your store today.
          </p>
        </div>

        {/* ---------------- NEW KPI SECTION ADDED ---------------- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">

          {/* Total Revenue */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border">
            <p className="text-gray-500 text-sm">Total Revenue</p>
            <h2 className="text-2xl font-bold text-green-600 mt-2">
              ₹{dashboard.total_revenue}
            </h2>
          </div>

          {/* Total Profit */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border">
            <p className="text-gray-500 text-sm">Total Profit</p>
            <h2 className="text-2xl font-bold text-emerald-600 mt-2">
              ₹{dashboard.total_profit}
            </h2>
            <p className="text-xs mt-1 text-gray-500">
              Margin: {dashboard.profit_margin_percent}%
            </p>
          </div>

          {/* Today's Revenue */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border">
            <p className="text-gray-500 text-sm">Today's Revenue</p>
            <h2 className="text-2xl font-bold text-blue-600 mt-2">
              ₹{dashboard.today_revenue}
            </h2>
            <p className="text-xs mt-1 text-gray-500">
              {dashboard.today_sales_count} sales today
            </p>
          </div>

          {/* Today's Profit + Weekly Growth */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border">
            <p className="text-gray-500 text-sm">Today's Profit</p>
            <h2 className="text-2xl font-bold text-purple-600 mt-2">
              ₹{dashboard.today_profit}
            </h2>
            <p
              className={`text-xs mt-1 ${
                dashboard.weekly_growth_percent >= 0
                  ? "text-green-600"
                  : "text-red-500"
              }`}
            >
              Weekly Growth: {dashboard.weekly_growth_percent}%
            </p>
          </div>

        </div>
        {/* ---------------- END KPI SECTION ---------------- */}

        {/* Chart Section */}
        <div className="mt-10 bg-white p-6 rounded-2xl shadow-sm border">
          <h3 className="text-lg font-semibold mb-6">
            Weekly Revenue Overview
          </h3>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="#16a34a"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Extra Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-10">

          {/* Top Products */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">
              Top Selling Products
            </h3>

            {dashboard.top_products?.length === 0 ? (
              <p className="text-gray-500 text-sm">No sales data yet.</p>
            ) : (
              dashboard.top_products.map((item: any, index: number) => (
                <div
                  key={index}
                  className="flex justify-between border-b py-2 text-sm"
                >
                  <span>{item.name}</span>
                  <span className="font-semibold">
                    {item.total_sold} sold
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Expiring Soon */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border">
            <h3 className="text-lg font-semibold mb-4 text-orange-500">
              Expiring Soon (30 Days)
            </h3>

            {dashboard.expiring_soon?.length === 0 ? (
              <p className="text-gray-500 text-sm">
                No products expiring soon 🎉
              </p>
            ) : (
              dashboard.expiring_soon.map((item: any) => (
                <div
                  key={item.id}
                  className="flex justify-between border-b py-2 text-sm"
                >
                  <span>{item.name}</span>
                  <span className="text-orange-600">
                    {item.expiry_date}
                  </span>
                </div>
              ))
            )}
          </div>

        </div>

      </div>
    </div>
  );
}