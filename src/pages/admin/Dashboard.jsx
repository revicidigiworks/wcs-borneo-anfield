import { useEffect, useState } from "react";
import { db } from "../../services/firebase";
import { collection, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { exportTeamsPDF } from "../../utils/exportPDF";
import {
  Search,
  Users,
  Lock,
  Unlock,
  Trash2,
  Save,
  Plus,
  ChevronLeft,
  Download,
  LogOut,
  FileText // Ikon baru untuk export individu
} from "lucide-react";

export default function Dashboard() {
  const [teams, setTeams] = useState([]);
  const [active, setActive] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("list");

  const fetchTeams = async () => {
    setLoading(true);
    const snap = await getDocs(collection(db, "teams"));
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setTeams(data);
    setLoading(false);
  };

  useEffect(() => { fetchTeams(); }, []);

  const filtered = teams.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectTeam = (team) => {
    setActive(team);
    if (window.innerWidth < 768) setView("detail");
  };

  const updateField = (field, value) => setActive({ ...active, [field]: value });

  const updatePlayer = (i, field, value) => {
    const updated = [...active.players];
    updated[i][field] = value;
    setActive({ ...active, players: updated });
  };

  const addPlayer = () => {
    const newPlayer = {
      id: Date.now(),
      name: "",
      pob: "",
      dob: "",
      position: "",
      photo: "",   // 🔥 WAJIB
      ktp: ""      // optional
    };
    setActive({ ...active, players: [...(active.players || []), newPlayer] });
  };

  const removePlayer = (index) => {
    const updated = active.players.filter((_, i) => i !== index);
    setActive({ ...active, players: updated });
  };

  const handleSave = async () => {
    try {
      await updateDoc(doc(db, "teams", active.id), { ...active });
      alert("Data berhasil diperbarui!");
      fetchTeams();
    } catch (err) {
      alert("Gagal memperbarui data.");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Hapus tim ini secara permanen?")) {
      await deleteDoc(doc(db, "teams", id));
      setActive(null);
      if (window.innerWidth < 768) setView("list");
      fetchTeams();
    }
  };

  const logout = () => {
    localStorage.removeItem("admin");
    window.location.href = "/admin";
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-4 bg-white">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      <p className="text-gray-500 font-medium">Memuat Data...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900 flex flex-col md:flex-row">

      {/* SIDEBAR */}
      <div className={`${view === 'detail' ? 'hidden' : 'flex'} md:flex md:w-80 lg:w-96 flex-col bg-white border-r border-gray-200 h-screen sticky top-0`}>
        <div className="p-5 border-b border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold tracking-tight">Admin Console</h1>
            <button onClick={logout} className="p-2 text-gray-400 hover:text-red-600 transition-colors">
              <LogOut size={20} />
            </button>
          </div>

          <button
            onClick={() => exportTeamsPDF(
              teams.map(t => ({
                ...t,
                players: (t.players || []).filter(p => p.photo) // 🔥 hanya yg ada foto
              }))
            )}
            className="w-full bg-slate-900 text-white py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 mb-4 hover:bg-slate-800 transition-all"
          >
            <Download size={14} /> Export Semua Tim (.PDF)
          </button>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              placeholder="Cari nama tim..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-100 border-none rounded-xl pl-10 pr-4 h-11 text-sm focus:ring-2 focus:ring-red-500 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filtered.map((t) => (
            <div
              key={t.id}
              onClick={() => handleSelectTeam(t)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${active?.id === t.id
                ? "bg-red-50 border-red-200 ring-1 ring-red-200"
                : "bg-white border-transparent hover:border-gray-200 shadow-sm"
                }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm">{t.name}</h3>
                  <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold flex items-center gap-1">
                    <Users size={10} /> {t.players?.length || 0} Players
                  </span>
                </div>
                {t.isLocked && <Lock size={14} className="text-amber-500" />}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className={`${view === 'list' ? 'hidden' : 'flex'} md:flex flex-1 flex-col h-screen overflow-y-auto bg-white md:bg-gray-50`}>
        {active ? (
          <div className="max-w-4xl w-full mx-auto pb-24 md:p-8">

            {/* MOBILE HEADER */}
            <div className="md:hidden flex items-center p-4 bg-white sticky top-0 z-10 border-b">
              <button onClick={() => setView("list")} className="p-2 -ml-2">
                <ChevronLeft />
              </button>
              <h2 className="flex-1 font-bold text-center truncate px-2">{active.name}</h2>
              {/* Tombol Export Per Tim Mobile */}
              <button
                onClick={() => exportTeamsPDF({
                  ...active,
                  players: (active.players || []).filter(p => p.photo)
                })}
                className="p-2 text-blue-600 active:bg-blue-50 rounded-full"
              >
                <FileText size={20} />
              </button>
            </div>

            <div className="p-6 space-y-8">
              {/* 🔥 LINK EDIT TIM */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-xs">
                <p className="font-bold mb-1">Link Edit Tim</p>

                <div className="flex gap-2">
                  <input
                    value={`${window.location.origin}/edit/${active.editToken}`}
                    readOnly
                    className="flex-1 border rounded px-2 py-1 text-xs"
                  />

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `${window.location.origin}/edit/${active.editToken}`
                      );
                      alert("Link disalin");
                    }}
                    className="bg-green-600 text-white px-3 rounded text-xs"
                  >
                    Copy
                  </button>
                </div>
              </div>
              {/* DESKTOP HEADER */}
              <div className="hidden md:flex justify-between items-end border-b pb-6">
                <div>
                  <span className="text-red-600 font-bold text-xs uppercase tracking-[0.2em]">Team Profile</span>
                  <h2 className="text-3xl font-black text-slate-800">{active.name}</h2>
                </div>
                <div className="flex gap-2">
                  {/* Tombol Export Per Tim Desktop */}
                  <button
                    onClick={() => exportTeamsPDF(active)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-bold text-xs hover:bg-blue-100 transition-colors border border-blue-100"
                  >
                    <Download size={14} /> EXPORT TIM INI
                  </button>
                  <button
                    onClick={() => handleDelete(active.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>


              {/* FORM SECTION */}
              <section className="space-y-4">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <div className="w-1 h-6 bg-red-600 rounded-full"></div> Detail Informasi
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {["name", "manager", "phone", "address"].map((field) => (
                    <div key={field} className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">{field}</label>
                      <input
                        value={active[field] || ""}
                        onChange={(e) => updateField(field, e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 h-12 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all"
                        placeholder={`Masukkan ${field}...`}
                      />
                    </div>
                  ))}
                </div>
              </section>

              {/* PLAYER SECTION */}
              <section className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <div className="w-1 h-6 bg-red-600 rounded-full"></div> Daftar Pemain
                  </h3>
                  <button
                    onClick={addPlayer}
                    className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-xs font-bold hover:bg-red-100 flex items-center gap-1"
                  >
                    <Plus size={14} /> TAMBAH
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {active.players?.map((p, i) => (
                    <div key={p.id} className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm space-y-4 relative group">
                      <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                        <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded">PEMAIN #{i + 1}</span>
                        <button onClick={() => removePlayer(i)} className="text-gray-300 hover:text-red-500">
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="space-y-3">
                        
                        <input
                          placeholder="Nama Lengkap"
                          value={p.name}
                          onChange={(e) => updatePlayer(i, "name", e.target.value)}
                          className="w-full border-b border-gray-100 focus:border-red-500 outline-none py-1 text-sm font-medium"
                        />

                        <div className="grid grid-cols-2 gap-2">
                          <input
                            placeholder="Tempat Lahir"
                            value={p.pob}
                            onChange={(e) => updatePlayer(i, "pob", e.target.value)}
                            className="w-full border-b border-gray-100 focus:border-red-500 outline-none py-1 text-xs"
                          />
                          <input
                            type="date"
                            value={p.dob}
                            onChange={(e) => updatePlayer(i, "dob", e.target.value)}
                            className="w-full border-b border-gray-100 focus:border-red-500 outline-none py-1 text-xs"
                          />
                        </div>

                        {/* 🔥 POSISI */}
                        <select
                          value={p.position || ""}
                          onChange={(e) => updatePlayer(i, "position", e.target.value)}
                          className="w-full border-b border-gray-100 focus:border-red-500 outline-none py-1 text-xs"
                        >
                          <option value="">Pilih Posisi</option>
                          <option value="Kiper">Kiper</option>
                          <option value="Belakang">Belakang</option>
                          <option value="Tengah">Tengah</option>
                          <option value="Depan">Depan</option>
                        </select>

                        <div className="flex gap-3">

                          {p.photo && (
                            <img
                              src={p.photo}
                              alt="Foto"
                              onClick={() => window.open(p.photo)}
                              className="w-24 h-32 object-cover rounded-md border cursor-pointer"
                            />
                          )}

                          {p.ktp && (
                            <img
                              src={p.ktp}
                              alt="KTP"
                              onClick={() => window.open(p.ktp)}
                              className="w-32 h-20 object-cover rounded-md border cursor-pointer"
                            />
                          )}

                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* FLOATING ACTION BAR */}
            <div className="fixed bottom-0 left-0 right-0 md:left-auto md:right-8 md:bottom-8 p-4 bg-white/80 md:bg-transparent backdrop-blur-md md:backdrop-blur-none border-t md:border-none z-20">
              <div className="max-w-4xl mx-auto flex gap-3">
                <button
                  onClick={async () => {
                    try {
                      const newStatus = !active.isLocked;

                      console.log("UPDATE isLocked:", newStatus);

                      await updateDoc(doc(db, "teams", active.id), {
                        isLocked: newStatus
                      });

                      setActive({ ...active, isLocked: newStatus });

                      await fetchTeams();

                      alert("Status berhasil diubah ✅");

                    } catch (err) {
                      console.error("UPDATE ERROR:", err);
                      alert("Gagal update (cek console) ❌");
                    }
                  }}
                  className={`flex-1 md:flex-none px-6 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95 ${active.isLocked ? 'bg-amber-100 text-amber-700 shadow-amber-100' : 'bg-slate-800 text-white shadow-slate-200'}`}
                >
                  {active.isLocked ? <Lock size={18} /> : <Unlock size={18} />}
                  {active.isLocked ? "Unlock Team" : "Lock Team"}
                </button>

                <button
                  onClick={handleSave}
                  className="flex-[2] md:flex-none px-10 py-3 bg-red-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-red-200 shadow-xl transition-transform active:scale-95 hover:bg-red-700"
                >
                  <Save size={18} /> Simpan Perubahan
                </button>
              </div>
            </div>

          </div>
        ) : (
          <div className="hidden md:flex flex-col items-center justify-center h-full text-gray-400 space-y-4">
            <div className="p-6 bg-gray-100 rounded-full">
              <Users size={48} />
            </div>
            <p className="font-medium">Pilih tim dari daftar untuk mengelola data</p>
          </div>
        )}
      </div>
    </div>
  );
}