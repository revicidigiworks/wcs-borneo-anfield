import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import { Eye, EyeOff } from "lucide-react";
import { auth } from "../../services/firebase";
import logoBAS from "../../assets/img/logo-bas.webp";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Clear old session
  useEffect(() => {
    signOut(auth).catch(() => {});
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

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
      console.error(err);

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
          setError("Login gagal.");
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-red-100 px-6">
      
      <form
        onSubmit={handleLogin}
        className="w-full max-w-sm bg-white border border-red-100 rounded-3xl p-7 space-y-6 shadow-2xl shadow-red-100"
      >
        
        {/* Header */}
        <div className="space-y-2 text-center">
          
          <div className="flex justify-center">
  <img
    src={logoBAS}
    alt="BAS Logo"
    className="w-24 object-contain drop-shadow-lg"
  />
</div>

        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-2xl px-4 py-3">
            {error}
          </div>
        )}

        {/* Email */}
        <div className="space-y-2">
          
          <label
            htmlFor="admin-email"
            className="text-sm font-semibold text-gray-700"
          >
            Email
          </label>

          <input
            type="email"
            id="admin-email"
            name="email"
            autoComplete="email"
            placeholder="admin@email.com"
            className="w-full h-12 rounded-2xl bg-gray-50 border border-gray-200 px-4 text-gray-900 outline-none focus:border-red-500 focus:ring-4 focus:ring-red-100 transition-all"
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
            className="text-sm font-semibold text-gray-700"
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
              className="w-full h-12 rounded-2xl bg-gray-50 border border-gray-200 px-4 pr-12 text-gray-900 outline-none focus:border-red-500 focus:ring-4 focus:ring-red-100 transition-all"
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
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-600 transition-colors"
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
          className="w-full h-12 rounded-2xl bg-red-600 hover:bg-red-700 transition-all text-white font-bold shadow-lg shadow-red-200 disabled:opacity-50"
        >
          {loading ? "Loading..." : "Login"}
        </button>

      </form>

    </div>
  );
}