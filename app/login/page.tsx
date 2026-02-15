"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.detail || "Login failed");
        return;
      }

      // Store JWT token
      localStorage.setItem("token", data.access_token);

      // Remember user if checkbox selected
      if (remember) {
        localStorage.setItem("rememberUser", email);
      }

      router.push("/dashboard");
    } catch (error) {
      console.error(error);
      alert("Server error. Make sure backend is running.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-100 to-green-200 px-4">
      
      <div className="bg-white shadow-2xl rounded-2xl p-10 w-full max-w-md">

        <h2 className="text-3xl font-bold text-center text-green-700 mb-8">
          Welcome Back
        </h2>

        <div className="space-y-5">

          <input
            type="email"
            placeholder="Email"
            className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-green-500"
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-green-500"
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-sm text-gray-500"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={remember}
                onChange={() => setRemember(!remember)}
              />
              Remember Me
            </label>

            <span className="text-green-600 cursor-pointer">
              Forgot Password?
            </span>
          </div>

          <button
            onClick={handleLogin}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
          >
            Login
          </button>

        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          New here?{" "}
          <Link href="/register" className="text-green-600 font-semibold">
            Create account
          </Link>
        </p>

      </div>

    </div>
  );
}
