import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 to-green-800 text-white flex flex-col items-center justify-center text-center px-6">

      <h1 className="text-5xl font-bold mb-6">
        ProtonCode Solutions
      </h1>

      <p className="text-xl mb-8">
        Smart Medical Store Management System
      </p>

      <div className="space-x-4">
        <Link
          href="/register"
          className="bg-white text-green-700 px-6 py-3 rounded-lg font-semibold"
        >
          Get Started
        </Link>

        <Link
          href="/login"
          className="border border-white px-6 py-3 rounded-lg"
        >
          Login
        </Link>
      </div>
    </div>
  );
}