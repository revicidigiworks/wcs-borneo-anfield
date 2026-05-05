import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebase";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      await signInWithEmailAndPassword(auth, email, password);

      // 🔥 ini sekarang REAL LOGIN
      navigate("/admin/dashboard");
    } catch (err) {
      console.error(err);
      alert("Login gagal ❌");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center text-white">
      <form onSubmit={handleLogin} className="bg-[#111] p-6 rounded-lg w-full max-w-sm space-y-4">
        <h1 className="text-xl font-bold">Admin Login</h1>

        <input
          type="email"
          placeholder="Email admin"
          className="w-full h-10 px-3 text-white"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full h-10 px-3 text-white"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="w-full bg-red-600 h-10 rounded">
          Login
        </button>
      </form>
    </div>
  );
}