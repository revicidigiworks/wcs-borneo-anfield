import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import { Eye, EyeOff } from "lucide-react";
import { auth } from "../../services/firebase";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Clear broken old session
  useEffect(() => {
    signOut(auth).catch(() => {});
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    console.log("LOGIN CLICKED");

    setError("");

    try {
      setLoading(true);

      const cleanEmail = email.trim().toLowerCase();

      console.log("EMAIL:", cleanEmail);
      console.log("START LOGIN");

      const userCredential =
        await signInWithEmailAndPassword(
          auth,
          cleanEmail,
          password
        );

      console.log("SUCCESS LOGIN");
      console.log(userCredential);

      navigate("/admin/dashboard");
    } catch (err) {
      console.log("MASUK CATCH");
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
          setError(err.message || "Login gagal.");
      }
    } finally {
      console.log("FINALLY");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-6">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-sm bg-[#111] border border-white/10 rounded-2xl p-6 space-y-5 shadow-2xl"
      >
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-white">
            Admin Login
          </h1>

          <p className="text-sm text-gray-400">
            Masuk ke dashboard admin
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        {/* Email */}
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

        {/* Password */}
        <div className="space-y-2">
          <label
            htmlFor="admin-password"
            className="text-sm text-gray-300"
          >
            Password
          </label>

          <div className="relative">
            <input
              type={
                showPassword ? "text" : "password"
              }
              id="admin-password"
              name="password"
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full h-11 rounded-lg bg-[#1a1a1a] border border-white/10 px-4 pr-12 text-white outline-none focus:border-red-500"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword(!showPassword)
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {showPassword ? (
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}
            </button>
          </div>
        </div>

        {/* Submit */}
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