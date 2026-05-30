import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../services/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import {
  Trash2,
  Plus,
  ShieldAlert,
  Users,
  Copy,
  ChevronDown,
} from "lucide-react";
import imageCompression from "browser-image-compression";

export default function EditTeam() {
  const { token } = useParams();

  const [docId, setDocId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [locked, setLocked] = useState(false);
  const [activePlayer, setActivePlayer] = useState(null);

  const [team, setTeam] = useState({
    name: "",

    logo: "",

    manager: "",
    managerPhoto: "",
    managerKtp: "",

    official1: "",
    official1Photo: "",

    official2: "",
    official2Photo: "",

    official3: "",
    official3Photo: "",

    phone: "",
    address: "",
  });

  const [players, setPlayers] = useState([]);

  const registrationCloseDate = "05 Juni 2026";
  const rosterEditCloseDate = "08 Juni 2026";
  const hardLockDate = new Date("2026-06-08T23:59:59");

  const compressImage = async (file, type) => {
    const options =
      type === "ktp"
        ? {
            maxSizeMB: 0.4,
            maxWidthOrHeight: 1800,
            useWebWorker: true,
            fileType: "image/jpeg",
            initialQuality: 0.9,
          }
        : {
            maxSizeMB: 1,
            maxWidthOrHeight: 1600,
            useWebWorker: true,
            fileType: "image/webp",
            initialQuality: 0.92,
          };

    try {
      const compressedFile = await imageCompression(file, options);

      return compressedFile;
    } catch (error) {
      console.error("Compress error:", error);
      return file;
    }
  };

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

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const q = query(
          collection(db, "teams"),
          where("editToken", "==", token),
        );

        const snap = await getDocs(q);

        if (snap.empty) {
          alert("Link tidak valid ❌");
          return;
        }

        const docData = snap.docs[0];
        const data = docData.data();

        setDocId(docData.id);

        setTeam({
          name: data.name || "",
          logo: data.logo || "",
          manager: data.manager || "",
          managerPhoto: data.managerPhoto || "",
          managerKtp: data.managerKtp || "",

          official1: data.official1 || "",
          official1Photo: data.official1Photo || "",

          official2: data.official2 || "",
          official2Photo: data.official2Photo || "",

          official3: data.official3 || "",
          official3Photo: data.official3Photo || "",

          phone: data.phone || "",
          address: data.address || "",
        });

        setPlayers(data.players || []);

        const now = new Date();
        const expiry = data.editExpiry?.toDate();

        if (data.isLocked || (expiry && now > expiry) || now > hardLockDate) {
          setLocked(true);
          alert("Batas edit sudah habis");
        }
      } catch (err) {
        console.error(err);
        alert("Gagal memuat data ❌");
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, [token]);

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
    if (locked) return;
    if (players.length >= 16) return alert("Maksimal 16 pemain");

    setPlayers([
      ...players,
      {
        id: Date.now() + Math.random(),
        nik: "",
        name: "",
        pob: "",
        dob: "",
        age: "",
        position: "",
        ktp: "",
        photo: "",
      },
    ]);
  };

  const removePlayer = (index) => {
    if (locked) return;
    if (players.length === 1) return alert("Minimal 1 pemain");

    setPlayers(players.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    for (let i = 0; i < players.length; i++) {
      const p = players[i];

      if (!p.name || p.name.trim().length < 3) {
        alert(`Nama pemain ke-${i + 1} tidak valid`);
        return false;
      }

      if (!/^\d{16}$/.test(p.nik || "")) {
        alert(`NIK pemain ke-${i + 1} harus 16 digit`);
        return false;
      }

      if (!p.pob || p.pob.trim().length < 3) {
        alert(`Tempat lahir pemain ke-${i + 1} tidak valid`);
        return false;
      }

      if (!p.dob) {
        alert(`Tanggal lahir pemain ke-${i + 1} wajib diisi`);
        return false;
      }

      const age = calcAge(p.dob);

      if (age < 16) {
        alert(`Usia pemain ke-${i + 1} minimal 16 tahun`);
        return false;
      }

      if (age > 50) {
        alert(`Usia pemain ke-${i + 1} maksimal 50 tahun`);
        return false;
      }

      if (!p.position) {
        alert(`Posisi pemain ke-${i + 1} wajib diisi`);
        return false;
      }

      if (!p.ktp) {
        alert(`KTP pemain ke-${i + 1} wajib upload`);
        return false;
      } 

      if (!p.photo) {
        alert(`Foto pemain ke-${i + 1} wajib upload`);
        return false;
      }
    }

    const uniqueCheck = new Set();
    const nikCheck = new Set();

    for (let i = 0; i < players.length; i++) {
      const p = players[i];

      const key =
        sanitizeText(p.name || "").toLowerCase() +
        (p.pob || "").toLowerCase() +
        (p.dob || "");

      if (uniqueCheck.has(key)) {
        alert(`Pemain duplikat pada pemain ke-${i + 1}`);
        return false;
      }

      if (nikCheck.has(p.nik)) {
        alert(`NIK duplikat pada pemain ke-${i + 1}`);
        return false;
      }

      uniqueCheck.add(key);
      nikCheck.add(p.nik);
    }

    return true;
  };

  const handleFileChangeEdit = async (index, field, file) => {
    if (!file) return;

    const MAX_FILE_SIZE = 1 * 1024 * 1024;

    if (file.size > MAX_FILE_SIZE) {
      alert("Ukuran maksimal 1MB");
      return;
    }

    try {
      const compressedFile = await compressImage(file, field);
      const formData = new FormData();
      formData.append("file", compressedFile);
      formData.append("upload_preset", "unsigned_upload");

      const res = await fetch(
        "https://api.cloudinary.com/v1_1/da9y2lsrs/image/upload",
        {
          method: "POST",
          body: formData,
        },
      );

      const data = await res.json();

      if (!data.secure_url) {
        alert("Upload gagal");
        return;
      }

      const updated = [...players];
      updated[index][field] = data.secure_url.replace(
        "/upload/",
        "/upload/f_auto,q_auto/",
      );

      setPlayers(updated);

      alert("Upload berhasil diganti ✅");
    } catch (err) {
      console.error(err);
      alert("Upload error ❌");
    }
  };

  const handleTeamFileChangeEdit = async (field, file) => {
    if (!file) return;

    const MAX_FILE_SIZE = 1 * 1024 * 1024;

    if (file.size > MAX_FILE_SIZE) {
      alert("Ukuran maksimal 1MB");
      return;
    }

    try {
      const type = field.toLowerCase().includes("ktp") ? "ktp" : "photo";

      const compressedFile = await compressImage(file, type);

      const formData = new FormData();

      formData.append("file", compressedFile);

      formData.append("upload_preset", "unsigned_upload");

      const res = await fetch(
        "https://api.cloudinary.com/v1_1/da9y2lsrs/image/upload",
        {
          method: "POST",
          body: formData,
        },
      );

      const data = await res.json();

      if (!data.secure_url) {
        alert("Upload gagal");
        return;
      }

      setTeam((prev) => ({
        ...prev,
        [field]: data.secure_url.replace("/upload/", "/upload/f_auto,q_auto/"),
      }));

      alert("Upload berhasil diganti ✅");
    } catch (err) {
      console.error(err);
      alert("Upload error ❌");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (locked) {
      alert("Batas edit sudah habis");
      return;
    }

    if (!validateForm()) return;

    try {
      setSaving(true);

      const snapshot = await getDocs(collection(db, "teams"));

      const existingPlayers = [];
      const existingNiks = [];

      snapshot.forEach((teamDoc) => {
        // SKIP TIM SENDIRI
        if (teamDoc.id === docId) return;

        const data = teamDoc.data();

        if (data.players) {
          data.players.forEach((p) => {
            existingPlayers.push(
              (p.name || "").toLowerCase() +
                (p.pob || "").toLowerCase() +
                (p.dob || ""),
            );

            existingNiks.push(p.nik?.trim());
          });
        }
      });

      for (let i = 0; i < players.length; i++) {
        const p = players[i];
        const key =
          sanitizeText(p.name || "").toLowerCase() +
          (p.pob || "").toLowerCase() +
          (p.dob || "");

        if (existingPlayers.includes(key)) {
          alert(`Pemain ${p.name} sudah terdaftar di tim lain`);
          setSaving(false);
          return;
        }

        if (existingNiks.includes(p.nik?.trim())) {
          alert(`NIK ${p.nik} sudah terdaftar di tim lain`);
          setSaving(false);
          return;
        }
      }

      const cleanPlayers = players.map((p) => ({
        id: p.id,
        nik: p.nik.trim(),
        name: sanitizeText(p.name),
        pob: sanitizeText(p.pob),
        dob: p.dob,
        age: calcAge(p.dob),
        position: p.position || "",
        ktp: p.ktp || "",
        photo: p.photo || "",
      }));

      await updateDoc(doc(db, "teams", docId), {
        ...team,
        name: sanitizeText(team.name),
        logo: team.logo,
        manager: sanitizeText(team.manager),
        official1: sanitizeText(team.official1),
        official2: sanitizeText(team.official2),
        official3: sanitizeText(team.official3),
        phone: team.phone.trim(),
        address: sanitizeText(team.address),
        players: cleanPlayers,
        updatedAt: serverTimestamp(),
      });

      alert("Perubahan data berhasil disimpan ✅");
    } catch (err) {
      console.error(err);
      alert("Gagal update data ❌");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading data...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] px-3 py-4 md:py-10">
      <div className="max-w-5xl mx-auto bg-white rounded-xl overflow-hidden shadow-2xl border border-gray-200">
        {/* HEADER */}
        <div className="bg-[#111] text-white px-5 py-6 md:px-8 border-b-4 border-[#c8102e]">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[3px] text-white/70">
            <ShieldAlert size={16} /> Secure Edit Access
          </div>
          <h1 className="text-2xl md:text-4xl font-bold mt-2">EDIT DATA TIM</h1>
          <p className="text-white/70 text-sm mt-1">
            Pendaftaran ditutup {registrationCloseDate} • Revisi roster sampai{" "}
            {rosterEditCloseDate}
          </p>
        </div>

        <form onSubmit={handleUpdate} className="p-4 md:p-8 space-y-8">
          {/* DATA TIM */}
          <div>
            <h2 className="font-bold text-lg mb-4">Data Tim</h2>

            <div className="space-y-4">
              {/* IDENTITAS TIM */}
              <div className="border rounded-lg p-4 bg-[#fafafa] space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-sm text-gray-500">
                    Identitas Tim
                  </span>
                </div>

                <input
                  name="name"
                  value={team.name}
                  onChange={handleChange}
                  disabled={locked}
                  placeholder="Nama Tim"
                  className="border border-gray-300 rounded-md px-4 h-12 text-sm w-full"
                />

                <div className="border rounded-xl p-4 bg-white">
                  <p className="text-xs font-semibold text-gray-700">
                    Logo Tim
                  </p>

                  <p className="text-[11px] text-gray-500 mt-1">
                    PNG transparan disarankan • Maksimal 1MB
                  </p>

                  {team.logo && (
                    <img
                      src={team.logo}
                      alt="Logo Tim"
                      className="w-24 h-24 object-contain rounded-lg border bg-white p-2 mt-3"
                    />
                  )}

                  {!locked && (
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleTeamFileChangeEdit("logo", e.target.files[0])
                      }
                      className="mt-3 block w-full text-sm text-gray-600
            file:mr-3 file:px-4 file:py-2
            file:border-0 file:rounded-md
            file:bg-[#c8102e] file:text-white
            hover:file:bg-[#a70d26]"
                    />
                  )}
                </div>

                <input
                  name="phone"
                  value={team.phone}
                  onChange={handleChange}
                  disabled={locked}
                  placeholder="Nomor HP"
                  className="border border-gray-300 rounded-md px-4 h-12 text-sm w-full"
                />

                <input
                  name="address"
                  value={team.address}
                  onChange={handleChange}
                  disabled={locked}
                  placeholder="Alamat"
                  className="border border-gray-300 rounded-md px-4 h-12 text-sm w-full"
                />
              </div>

              {/* MANAGER */}
              <div className="border rounded-lg p-4 bg-[#fafafa] space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-sm text-gray-500">
                    Manager / PIC
                  </span>
                </div>

                <input
                  name="manager"
                  value={team.manager}
                  onChange={handleChange}
                  disabled={locked}
                  placeholder="Nama Manager"
                  className="border border-gray-300 rounded-md px-4 h-12 text-sm w-full"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* FOTO MANAGER */}
                  <div className="border rounded-xl p-4 bg-white">
                    <p className="text-xs font-semibold text-gray-700">
                      Foto Manager
                    </p>

                    <p className="text-[11px] text-gray-500 mt-1">
                      JPG / PNG • Maksimal 1MB
                    </p>

                    <p className="text-[11px] text-red-500 mt-1">
                      Gunakan foto portrait / close-up agar wajah terlihat jelas
                    </p>

                    {team.managerPhoto && (
                      <div className="mt-3">
                        <img
                          src={team.managerPhoto}
                          alt="Manager"
                          className="w-35 h-24 object-cover rounded-md border"
                        />
                      </div>
                    )}

                    {!locked && (
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleTeamFileChangeEdit(
                            "managerPhoto",
                            e.target.files[0],
                          )
                        }
                        className="mt-3 block w-full text-sm text-gray-600
              file:mr-3 file:px-4 file:py-2
              file:border-0 file:rounded-md
              file:bg-[#c8102e] file:text-white
              hover:file:bg-[#a70d26]"
                      />
                    )}
                  </div>

                  {/* KTP MANAGER */}
                  <div className="border rounded-xl p-4 bg-white">
                    <p className="text-xs font-semibold text-gray-700">
                      KTP Manager
                    </p>

                    <p className="text-[11px] text-gray-500 mt-1">
                      JPG / PNG • Maksimal 1MB
                    </p>

                    <p className="text-[11px] text-red-500 mt-1">
                      Pastikan tulisan pada KTP terlihat jelas
                    </p>

                    {team.managerKtp && (
                      <img
                        src={team.managerKtp}
                        alt="KTP Manager"
                        className="w-[140px] h-24 object-cover rounded-md border mt-3"
                      />
                    )}

                    {!locked && (
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleTeamFileChangeEdit(
                            "managerKtp",
                            e.target.files[0],
                          )
                        }
                        className="mt-3 block w-full text-sm text-gray-600
              file:mr-3 file:px-4 file:py-2
              file:border-0 file:rounded-md
              file:bg-[#c8102e] file:text-white
              hover:file:bg-[#a70d26]"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* OFFICIAL TEAM */}
              <div className="border rounded-lg p-4 bg-[#fafafa] space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-sm text-gray-500">
                    Official Team
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* OFFICIAL 1 */}
                  <div className="border rounded-xl p-4 bg-white space-y-3">
                    <input
                      name="official1"
                      value={team.official1}
                      onChange={handleChange}
                      disabled={locked}
                      placeholder="Official 1"
                      className="border border-gray-300 rounded-md px-4 h-11 text-sm w-full"
                    />

                    {team.official1Photo && (
                      <img
                        src={team.official1Photo}
                        alt="Official 1"
                        className="w-[140px] h-24 object-cover rounded-md border"
                      />
                    )}

                    <p className="text-[11px] text-gray-500">
                      JPG / PNG • Maksimal 1MB
                    </p>

                    {!locked && (
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleTeamFileChangeEdit(
                            "official1Photo",
                            e.target.files[0],
                          )
                        }
                        className="block w-full text-sm text-gray-600
          file:mr-3 file:px-4 file:py-2
          file:border-0 file:rounded-md
          file:bg-[#c8102e] file:text-white"
                      />
                    )}
                  </div>

                  {/* OFFICIAL 2 */}
                  <div className="border rounded-xl p-4 bg-white space-y-3">
                    <input
                      name="official2"
                      value={team.official2}
                      onChange={handleChange}
                      disabled={locked}
                      placeholder="Official 2"
                      className="border border-gray-300 rounded-md px-4 h-11 text-sm w-full"
                    />

                    {team.official2Photo && (
                      <img
                        src={team.official2Photo}
                        alt="Official 2"
                        className="w-[140px] h-24 object-cover rounded-md border"
                      />
                    )}

                    <p className="text-[11px] text-gray-500">
                      JPG / PNG • Maksimal 1MB
                    </p>

                    {!locked && (
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleTeamFileChangeEdit(
                            "official2Photo",
                            e.target.files[0],
                          )
                        }
                        className="block w-full text-sm text-gray-600
          file:mr-3 file:px-4 file:py-2
          file:border-0 file:rounded-md
          file:bg-[#c8102e] file:text-white"
                      />
                    )}
                  </div>

                  {/* OFFICIAL 3 */}
                  <div className="border rounded-xl p-4 bg-white space-y-3">
                    <input
                      name="official3"
                      value={team.official3}
                      onChange={handleChange}
                      disabled={locked}
                      placeholder="Official 3"
                      className="border border-gray-300 rounded-md px-4 h-11 text-sm w-full"
                    />

                    {team.official3Photo && (
                      <img
                        src={team.official3Photo}
                        alt="Official 3"
                        className="w-[140px] h-24 object-cover rounded-md border"
                      />
                    )}

                    <p className="text-[11px] text-gray-500">
                      JPG / PNG • Maksimal 1MB
                    </p>

                    {!locked && (
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleTeamFileChangeEdit(
                            "official3Photo",
                            e.target.files[0],
                          )
                        }
                        className="block w-full text-sm text-gray-600
          file:mr-3 file:px-4 file:py-2
          file:border-0 file:rounded-md
          file:bg-[#c8102e] file:text-white"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* PLAYERS */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <Users size={18} /> Daftar Pemain
              </h2>

              {!locked && (
                <button
                  type="button"
                  onClick={addPlayer}
                  className="text-[#c8102e] text-sm font-semibold flex items-center gap-1"
                >
                  <Plus size={15} /> Tambah
                </button>
              )}
            </div>

            <div className="space-y-3">
              {players.map((p, i) => {
                const open = activePlayer === i;

                return (
                  <div
                    key={p.id}
                    className="border rounded-lg bg-white overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => setActivePlayer(open ? null : i)}
                      className="w-full flex items-center justify-between px-4 py-3 bg-gray-50"
                    >
                      <div className="text-left">
                        <div className="font-semibold text-sm">
                          Pemain #{i + 1}
                        </div>
                        <div className="text-xs text-gray-500">
                          {p.name || "Belum diisi"}
                        </div>
                      </div>

                      <ChevronDown
                        className={`transition ${open ? "rotate-180" : ""}`}
                      />
                    </button>

                    {open && (
                      <div className="p-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <div>
                            <p className="text-[10px] text-gray-500 mb-1">
                              Nama Lengkap
                            </p>
                            <input
                              value={p.name}
                              disabled={locked}
                              placeholder="Contoh: Muhammad Rafli Tawil"
                              onChange={(e) =>
                                handlePlayerChange(i, "name", e.target.value)
                              }
                              className="border rounded-md px-3 h-10 text-xs w-full"
                            />
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-500 mb-1">
                              NIK
                            </p>

                            <input
                              value={p.nik || ""}
                              disabled={locked}
                              placeholder="16 digit NIK"
                              maxLength={16}
                              onChange={(e) =>
                                handlePlayerChange(
                                  i,
                                  "nik",
                                  e.target.value.replace(/\D/g, ""),
                                )
                              }
                              className="border rounded-md px-3 h-10 text-xs w-full"
                            />
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-500 mb-1">
                              Tempat Lahir
                            </p>
                            <input
                              value={p.pob}
                              disabled={locked}
                              placeholder="Contoh: Samarinda"
                              onChange={(e) =>
                                handlePlayerChange(i, "pob", e.target.value)
                              }
                              className="border rounded-md px-3 h-10 text-xs w-full"
                            />
                          </div>

                          <div>
                            <p className="text-[10px] text-gray-500 mb-1">
                              Tanggal Lahir
                            </p>
                            <input
                              type="date"
                              value={p.dob}
                              disabled={locked}
                              onChange={(e) =>
                                handlePlayerChange(i, "dob", e.target.value)
                              }
                              className="border rounded-md px-3 h-10 text-xs w-full appearance-none"
                              placeholder="Tanggal Lahir"
                            />
                          </div>
                        </div>

                        <div>
                          <p className="text-[10px] text-gray-500 mb-1">Umur</p>
                          <input
                            value={p.age}
                            readOnly
                            placeholder="Otomatis dari tanggal lahir"
                            className="border rounded-md px-3 h-10 text-xs bg-gray-100 w-full"
                          />
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-500 mb-1">
                            Posisi
                          </p>
                          <select
                            value={p.position || ""}
                            disabled={locked}
                            onChange={(e) =>
                              handlePlayerChange(i, "position", e.target.value)
                            }
                            className="border rounded-md px-3 h-10 text-xs w-full"
                          >
                            <option value="">Pilih Posisi</option>
                            <option value="Kiper">Kiper</option>
                            <option value="Belakang">Belakang</option>
                            <option value="Tengah">Tengah</option>
                            <option value="Depan">Depan</option>
                          </select>
                        </div>
                        <div className="flex gap-3 flex-wrap">
                          {p.ktp && (
                            <div>
                              <p className="text-[10px] text-gray-500 mb-1">
                                KTP
                              </p>
                              <img
                                src={p.ktp}
                                alt="KTP"
                                className="w-[140px] h-24 object-cover rounded-md border"
                              />
                            </div>
                          )}

                          {p.photo && (
                            <div>
                              <p className="text-[10px] text-gray-500 mb-1">
                                Foto
                              </p>
                              <img
                                src={p.photo}
                                alt="Foto Pemain"
                                className="w-[140px] h-24 object-cover rounded-md border"
                              />
                            </div>
                          )}
                        </div>

                        {!locked && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {/* KTP */}
                            <div className="border rounded-xl p-4 bg-[#fafafa]">
                              <p className="text-xs font-semibold text-gray-700">
                                Ganti KTP
                              </p>

                              <p className="text-[11px] text-gray-500 mt-1">
                                JPG / PNG • Maksimal 1MB
                              </p>

                              <p className="text-[11px] text-red-500 mt-1">
                                Pastikan foto terang dan tulisan terbaca jelas
                              </p>

                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) =>
                                  handleFileChangeEdit(
                                    i,
                                    "ktp",
                                    e.target.files[0],
                                  )
                                }
                                className="mt-3 block w-full text-sm text-gray-600
    file:mr-3 file:px-4 file:py-2
    file:border-0 file:rounded-md
    file:bg-[#c8102e] file:text-white
    hover:file:bg-[#a70d26]"
                              />
                            </div>

                            {/* FOTO PEMAIN */}
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 bg-[#fafafa]">
                              <p className="text-xs font-semibold text-gray-700">
                                Ganti Foto Pemain
                              </p>

                              <p className="text-[11px] text-gray-500 mt-1">
                                JPG / PNG • Maksimal 1MB
                              </p>

                              <p className="text-[11px] text-red-500 mt-1">
                                Gunakan foto portrait / close-up agar wajah
                                terlihat jelas
                              </p>

                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) =>
                                  handleFileChangeEdit(
                                    i,
                                    "photo",
                                    e.target.files[0],
                                  )
                                }
                                className="mt-3 block w-full text-sm text-gray-600
    file:mr-3 file:px-4 file:py-2
    file:border-0 file:rounded-md
    file:bg-[#c8102e] file:text-white
    hover:file:bg-[#a70d26]"
                              />
                            </div>
                          </div>
                        )}

                        {!locked && (
                          <button
                            type="button"
                            onClick={() => removePlayer(i)}
                            className="text-red-600 text-sm flex items-center gap-1"
                          >
                            <Trash2 size={14} /> Hapus
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800 leading-6">
            <p className="font-semibold mb-2">Akses Link Edit Tim</p>

            <div className="flex flex-col md:flex-row md:items-center gap-2 mb-3">
              <input
                value={window.location.href}
                readOnly
                className="border bg-white rounded-md px-3 h-10 text-xs w-full"
              />

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert("Link edit berhasil disalin ✅");
                }}
                className="px-4 h-10 bg-green-700 text-white rounded-md text-xs font-semibold flex items-center justify-center gap-1"
              >
                <Copy size={14} /> Salin Link
              </button>
            </div>

            <p>
              • Simpan link edit privat ini dengan baik untuk melakukan
              perubahan data tim.
            </p>
            <p>• Pendaftaran tim baru ditutup pada {registrationCloseDate}.</p>
            <p>
              • Revisi roster pemain masih diperbolehkan sampai{" "}
              {rosterEditCloseDate} pukul 23:59 WITA.
            </p>
            <p>
              • Setelah tanggal tersebut sistem otomatis mengunci seluruh data
              pemain (H-5 tournament).
            </p>
            <p>
              • Panitia tidak bertanggung jawab apabila link edit hilang atau
              dibagikan ke pihak lain.
            </p>
          </div>

          {/* BUTTON */}
          {!locked && (
            <div className="pt-2 md:pt-2">
              <button
                type="submit"
                disabled={saving}
                className="
                    w-full 
                    h-12 
                    md:h-14
                    rounded-xl 
                    font-bold 
                    text-white 
                    text-sm md:text-base
                    bg-[#c8102e] 
                    shadow-lg 
                    shadow-red-200
                    transition 
                    active:scale-[0.98]
                    hover:brightness-110
                    disabled:opacity-70
                    disabled:cursor-not-allowed
                    flex items-center justify-center gap-2
                  "
              >
                {saving ? "Menyimpan..." : "Simpan Perubahan"}
              </button>

              <div className="h-6 md:h-0" />
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
