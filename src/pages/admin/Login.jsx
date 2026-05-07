import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import { auth } from "../../services/firebase";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Clear old broken sessions
  useEffect(() => {
    signOut(auth).catch(() => {});
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    // Basic validation
    if (!email || !password) {
      return setError("Email dan password wajib diisi.");
    }

    try {
      setLoading(true);

      const cleanEmail = email.trim().toLowerCase();

      await signInWithEmailAndPassword(
        auth,
        cleanEmail,
        password
      );

      navigate("/admin/dashboard");
    } catch (err) {
      console.error("LOGIN ERROR:", err);

      switch (err.code) {
        case "auth/invalid-email":
          setError("Format email tidak valid.");
          break;

        case "auth/user-not-found":
          setError("Akun admin tidak ditemukan.");
          break;

        case "auth/wrong-password":
        case "auth/invalid-credential":
          setError("Password salah.");
          break;

        case "auth/too-many-requests":
          setError(
            "Terlalu banyak percobaan login. Coba lagi nanti."
          );
          break;

        case "auth/network-request-failed":
          setError("Koneksi internet bermasalah.");
          break;

        default:
          setError("Login gagal. Silakan coba lagi.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-6">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-sm bg-[#111] border border-white/10 rounded-2xl p-6 space-y-4 shadow-2xl"
      >
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-white">
            Admin Login
          </h1>

          <p className="text-sm text-gray-400">
            Masuk ke dashboard admin
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label
            htmlFor="admin-email"
            className="text-sm text-gray-300"
          >
            Email
          </label>

          <input
            type="email"
            id="admin-email"
            name="email"
            autoComplete="email"
            placeholder="admin@email.com"
            className="w-full h-11 rounded-lg bg-[#1a1a1a] border border-white/10 px-4 text-white outline-none focus:border-red-500"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            required
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="admin-password"
            className="text-sm text-gray-300"
          >
            Password
          </label>

          <input
            type="password"
            id="admin-password"
            name="password"
            autoComplete="current-password"
            placeholder="••••••••"
            className="w-full h-11 rounded-lg bg-[#1a1a1a] border border-white/10 px-4 text-white outline-none focus:border-red-500"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 rounded-lg bg-red-600 hover:bg-red-700 transition text-white font-semibold disabled:opacity-50"
        >
          {loading ? "Loading..." : "Login"}
        </button>
      </form>
    </div>
  );
}