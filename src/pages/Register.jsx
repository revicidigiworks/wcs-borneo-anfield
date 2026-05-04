import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../services/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  Timestamp,
  getDocs,
} from "firebase/firestore";
import { Trash2, Plus, ShieldCheck, Users } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

export default function Register() {
  const navigate = useNavigate();

  const registrationOpen = new Date("2026-05-04T00:00:00");
  const registrationClose = new Date("2026-06-01T23:59:59");
  const editLockDate = new Date("2026-06-08T23:59:59");

  const now = new Date();

  const registrationNotOpenYet = now < registrationOpen;
  const registrationClosed = now > registrationClose;

  const [team, setTeam] = useState({
    name: "",
    manager: "",
    official1: "",
    official2: "",
    official3: "", // 🔥 tambahan
    phone: "",
    address: "",
  });

  const [players, setPlayers] = useState([
    { id: Date.now(), name: "", pob: "", dob: "", age: "" },
  ]);

  const [loading, setLoading] = useState(false);

  const calcAge = (dob) => {
    if (!dob) return "";
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const sanitizeText = (text) => text.replace(/\s+/g, " ").trim();

  const handleChange = (e) => {
    setTeam({ ...team, [e.target.name]: e.target.value });
  };

  const handlePlayerChange = (index, field, value) => {
    const updated = [...players];
    updated[index][field] = value;

    if (field === "dob") {
      updated[index].age = calcAge(value);
    }

    setPlayers(updated);
  };

  const addPlayer = () => {
    if (players.length >= 16) return alert("Maksimal hanya 16 pemain");
    setPlayers([
      ...players,
      { id: Date.now() + Math.random(), name: "", pob: "", dob: "", age: "" },
    ]);
  };

  const removePlayer = (index) => {
    if (players.length === 1) return alert("Minimal harus ada 1 pemain");
    setPlayers(players.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    if (registrationNotOpenYet)
      return alert("Pendaftaran belum dibuka"), false;

    if (registrationClosed)
      return alert("Pendaftaran telah ditutup pada 01 Juni 2026"), false;

    if (sanitizeText(team.name).length < 3)
      return alert("Nama tim minimal 3 karakter"), false;

    if (sanitizeText(team.manager).length < 3)
      return alert("Nama Manager / PIC wajib diisi"), false;

    if (sanitizeText(team.official1).length < 3)
      return alert("Official 1 wajib diisi"), false;

    if (sanitizeText(team.official2).length < 3)
      return alert("Official 2 wajib diisi"), false;

    if (sanitizeText(team.official3).length < 3)
      return alert("Official 3 wajib diisi"), false;

    if (!/^08[0-9]{8,13}$/.test(team.phone.trim()))
      return alert("Nomor Whatsapp harus valid"), false;

    if (sanitizeText(team.address).length < 8)
      return alert("Alamat tim terlalu pendek"), false;

    if (players.length !== 16)
      return alert("Jumlah pemain harus tepat 16 orang"), false;

    for (let i = 0; i < players.length; i++) {
      const p = players[i];

      if (sanitizeText(p.name).length < 3)
        return alert(`Nama pemain ke-${i + 1} tidak valid`), false;

      if (sanitizeText(p.pob).length < 3)
        return alert(`Tempat lahir pemain ke-${i + 1} tidak valid`), false;

      if (!p.dob)
        return alert(`Tanggal lahir pemain ke-${i + 1} wajib diisi`), false;

      const age = calcAge(p.dob);
      if (age < 17 || age > 50)
        return alert(`Usia pemain ke-${i + 1} harus 17 - 50 tahun`), false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);

      // 🔒 LIMIT 32 TIM
      const snapshot = await getDocs(collection(db, "teams"));
      if (snapshot.size >= 32) {
        alert("Slot sudah penuh (32 tim)");
        return;
      }

      const cleanPlayers = players.map((p) => ({
        id: p.id,
        name: sanitizeText(p.name),
        pob: sanitizeText(p.pob),
        dob: p.dob,
        age: calcAge(p.dob),
      }));

      // 🔐 TOKEN EDIT
      const editToken = uuidv4();

      await addDoc(collection(db, "teams"), {
        name: sanitizeText(team.name),
        manager: sanitizeText(team.manager),
        official1: sanitizeText(team.official1),
        official2: sanitizeText(team.official2),
        official3: sanitizeText(team.official3),

        phone: team.phone.trim(),
        address: sanitizeText(team.address),

        players: cleanPlayers,

        editToken,
        editExpiry: Timestamp.fromDate(editLockDate),
        isLocked: false,

        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      alert("Tim berhasil didaftarkan ✅");

      // 🔥 redirect aman
      navigate(`/edit/${editToken}`);

    } catch (error) {
      console.error(error);
      alert("Gagal menyimpan data ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] px-3 py-4 md:py-10">
      <div className="max-w-5xl mx-auto bg-white rounded-xl overflow-hidden shadow-2xl border border-gray-200">
        <div className="bg-[#111111] text-white px-5 py-6 md:px-8 border-b-4 border-[#c8102e]">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[3px] text-white/70">
            <ShieldCheck size={16} /> Secure Team Registration
          </div>
          <h1 className="text-2xl md:text-4xl font-bold mt-2">
            PENDAFTARAN TIM
          </h1>
          <p className="text-white/70 text-sm mt-1">
            Pendaftaran dibuka 05 Mei 2026 • Ditutup 01 Juni 2026
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-4 md:p-8 space-y-8">

          {/* DATA TIM */}
          <div>
            <h2 className="font-bold text-lg mb-4">Data Tim</h2>
            <div className="grid md:grid-cols-2 gap-3">
              <input name="name" value={team.name} onChange={handleChange} placeholder="Nama Tim" className="border rounded-md px-4 h-12 text-sm" />
              <input name="manager" value={team.manager} onChange={handleChange} placeholder="Manager / PIC" className="border rounded-md px-4 h-12 text-sm" />
              <input name="phone" value={team.phone} onChange={handleChange} placeholder="No. Whatsapp Aktif" className="border rounded-md px-4 h-12 text-sm" />
              <input name="address" value={team.address} onChange={handleChange} placeholder="Alamat Lengkap Tim" className="border rounded-md px-4 h-12 text-sm" />
              <input name="official1" value={team.official1} onChange={handleChange} placeholder="Nama Official 1" className="border rounded-md px-4 h-12 text-sm" />
              <input name="official2" value={team.official2} onChange={handleChange} placeholder="Nama Official 2" className="border rounded-md px-4 h-12 text-sm" />
              <input name="official3" value={team.official3} onChange={handleChange} placeholder="Nama Official 3" className="border rounded-md px-4 h-12 text-sm" />
            </div>
          </div>

          {/* PLAYERS */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <Users size={18} /> Daftar Pemain
              </h2>
              <button type="button" onClick={addPlayer} className="text-[#c8102e] text-sm font-semibold flex items-center gap-1">
                <Plus size={15} /> Tambah Pemain
              </button>
            </div>

            <div className="space-y-4">
              {players.map((p, i) => (
                <div key={p.id} className="border rounded-lg p-3 bg-[#fafafa] space-y-3">
                  <div className="font-semibold text-sm text-gray-500">
                    Pemain #{i + 1}
                  </div>

                  <input value={p.name} onChange={(e) => handlePlayerChange(i, "name", e.target.value)} placeholder="Nama Lengkap Pemain (sesuai KTP)" className="border rounded-md px-4 h-11 text-sm w-full" />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input value={p.pob} onChange={(e) => handlePlayerChange(i, "pob", e.target.value)} placeholder="Tempat Lahir" className="border rounded-md px-4 h-11 text-sm" />
                    <input type="date" value={p.dob} onChange={(e) => handlePlayerChange(i, "dob", e.target.value)} className="border rounded-md px-4 h-11 text-sm" />
                    <input value={p.age} readOnly placeholder="Usia Otomatis" className="border rounded-md px-4 h-11 text-sm bg-gray-100" />
                  </div>

                  <button type="button" onClick={() => removePlayer(i)} className="text-red-600 flex items-center gap-1 text-sm">
                    <Trash2 size={15} /> Hapus Pemain
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#fff8f8] border border-[#ffd6dc] rounded-lg p-4 text-sm text-gray-700 leading-6">
            <p>• Pendaftaran peserta dibuka mulai 05 Mei 2026 dan ditutup pada 01 Juni 2026.</p>
            <p>• Setelah submit akan dapat link edit privat.</p>
            <p>• Edit maksimal sampai 08 Juni 2026 (H-5).</p>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-[#c8102e] hover:bg-[#a70d26] text-white h-12 rounded-md font-bold uppercase tracking-wide disabled:opacity-50">
            {loading ? "Menyimpan Data..." : "Simpan & Dapatkan Link Edit"}
          </button>
        </form>
      </div>
    </div>
  );
}