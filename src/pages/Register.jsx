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
import imageCompression from "browser-image-compression";
import logoWCS from "../assets/img/logo-wcs.webp";

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
    managerPhoto: null,
    managerKtp: null,

    official1: "",
    official1Photo: null,

    official2: "",
    official2Photo: null,

    official3: "",
    official3Photo: null,

    logo: null,

    phone: "",
    address: "",
  });

  const [players, setPlayers] = useState([
    {
      id: Date.now(),
      nik: "",
      name: "",
      pob: "",
      dob: "",
      age: "",
      position: "",
      ktp: null,
      photo: null,
    },
  ]);

  const [loading, setLoading] = useState(false);

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

  const handleChange = (e) => {
    setTeam({ ...team, [e.target.name]: e.target.value });
  };
  const handleTeamFileChange = async (field, file) => {
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      alert("Ukuran file maksimal 1MB");
      return;
    }

    try {
      const type = field.toLowerCase().includes("ktp") ? "ktp" : "photo";

      const compressedFile = await compressImage(file, type);

      setTeam((prev) => ({
        ...prev,
        [field]: compressedFile,
      }));
    } catch (error) {
      console.error(error);
      alert("Gagal memproses gambar");
    }
  };

  const handlePlayerChange = (index, field, value) => {
    const updated = [...players];
    updated[index][field] = value;

    if (field === "dob") {
      updated[index].age = calcAge(value);
    }

    setPlayers(updated);
  };

  const MAX_FILE_SIZE = 1 * 1024 * 1024;

  const handleFileChange = async (index, field, file) => {
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      alert("Ukuran file maksimal 1MB");
      return;
    }

    try {
      const compressedFile = await compressImage(file, field);

      const updated = [...players];
      updated[index][field] = compressedFile;

      setPlayers(updated);
    } catch (error) {
      console.error(error);
      alert("Gagal memproses gambar");
    }
  };

  const addPlayer = () => {
    if (players.length >= 16) return alert("Maksimal hanya 16 pemain");
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
        ktp: null,
        photo: null,
      },
    ]);
  };

  const removePlayer = (index) => {
    if (players.length === 1) return alert("Minimal harus ada 1 pemain");
    setPlayers(players.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    if (registrationNotOpenYet)
      return (alert("Pendaftaran belum dibuka"), false);

    if (registrationClosed)
      return (alert("Pendaftaran telah ditutup pada 01 Juni 2026"), false);

    if (sanitizeText(team.name).length < 3)
      return (alert("Nama tim minimal 3 karakter"), false);

    if (!team.logo) return (alert("Logo tim wajib upload"), false);

    if (sanitizeText(team.manager).length < 3)
      return (alert("Nama Manager / PIC wajib diisi"), false);

    if (!team.managerPhoto) return (alert("Foto Manager wajib upload"), false);

    if (!team.managerKtp) return (alert("KTP Manager wajib upload"), false);

    if (!team.official1Photo)
      return (alert("Foto Official 1 wajib upload"), false);

    if (!team.official2Photo)
      return (alert("Foto Official 2 wajib upload"), false);

    if (!team.official3Photo)
      return (alert("Foto Official 3 wajib upload"), false);

    if (sanitizeText(team.official1).length < 3)
      return (alert("Official 1 wajib diisi"), false);

    if (sanitizeText(team.official2).length < 3)
      return (alert("Official 2 wajib diisi"), false);

    if (sanitizeText(team.official3).length < 3)
      return (alert("Official 3 wajib diisi"), false);

    if (!/^08[0-9]{8,13}$/.test(team.phone.trim()))
      return (alert("Nomor Whatsapp harus valid"), false);

    if (sanitizeText(team.address).length < 8)
      return (alert("Alamat tim terlalu pendek"), false);

    for (let i = 0; i < players.length; i++) {
      const p = players[i];

      if (sanitizeText(p.name).length < 3)
        return (alert(`Nama pemain ke-${i + 1} tidak valid`), false);

      if (!/^\d{16}$/.test(p.nik))
        return (alert(`NIK pemain ke-${i + 1} harus 16 digit`), false);

      if (sanitizeText(p.pob).length < 3)
        return (alert(`Tempat lahir pemain ke-${i + 1} tidak valid`), false);

      if (!p.dob)
        return (alert(`Tanggal lahir pemain ke-${i + 1} wajib diisi`), false);

      const age = calcAge(p.dob);
      if (age < 17 || age > 50)
        return (alert(`Usia pemain ke-${i + 1} harus 17 - 50 tahun`), false);
      if (!p.position)
        return (alert(`Posisi pemain ke-${i + 1} wajib diisi`), false);

      if (!p.ktp) return (alert(`KTP pemain ke-${i + 1} wajib upload`), false);
      if (!p.photo)
        return (alert(`Foto pemain ke-${i + 1} wajib upload`), false);
    }

    const uniqueCheck = new Set();
    const nikCheck = new Set();

    for (let i = 0; i < players.length; i++) {
      const p = players[i];

      const key =
        sanitizeText(p.name).toLowerCase() + p.pob.toLowerCase() + p.dob;

      if (uniqueCheck.has(key)) {
        return (alert(`Pemain duplikat di form (index ${i + 1})`), false);
      }

      if (nikCheck.has(p.nik)) {
        return (alert(`NIK pemain duplikat pada pemain ke-${i + 1}`), false);
      }

      uniqueCheck.add(key);
      nikCheck.add(p.nik);
    }

    return true;
  };

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
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
      console.error(data);
      throw new Error("Upload gagal");
    }

    return data.secure_url.replace("/upload/", "/upload/f_auto,q_auto/");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);

      const snapshot = await getDocs(collection(db, "teams"));

      if (snapshot.size >= 32) {
        alert("Slot sudah penuh (32 tim)");
        return;
      }

      const existingPlayers = [];
      const existingNiks = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.players) {
          data.players.forEach((p) => {
            existingPlayers.push(
              p.name.toLowerCase() + p.pob.toLowerCase() + p.dob,
            );

            existingNiks.push(p.nik?.trim());
          });
        }
      });

      for (let i = 0; i < players.length; i++) {
        const key =
          sanitizeText(players[i].name).toLowerCase() +
          players[i].pob.toLowerCase() +
          players[i].dob;

        if (existingPlayers.includes(key)) {
          alert(`Pemain ${players[i].name} sudah terdaftar di tim lain`);
          return;
        }

        if (existingNiks.includes(players[i].nik)) {
          alert(`NIK ${players[i].nik} sudah terdaftar`);
          return;
        }
      }

      const logoUrl = await uploadFile(team.logo);

      const managerPhotoUrl = await uploadFile(team.managerPhoto);

      const managerKtpUrl = await uploadFile(team.managerKtp);

      const official1PhotoUrl = await uploadFile(team.official1Photo);

      const official2PhotoUrl = await uploadFile(team.official2Photo);

      const official3PhotoUrl = await uploadFile(team.official3Photo);

      const cleanPlayers = [];

      for (let i = 0; i < players.length; i++) {
        const p = players[i];

        const ktpUrl = await uploadFile(p.ktp);
        const photoUrl = await uploadFile(p.photo);

        cleanPlayers.push({
          id: p.id,
          nik: p.nik.trim(),
          name: sanitizeText(p.name),
          pob: sanitizeText(p.pob),
          dob: p.dob,
          age: calcAge(p.dob),
          position: p.position,
          ktp: ktpUrl,
          photo: photoUrl,
        });
      }

      const editToken = uuidv4();

      await addDoc(collection(db, "teams"), {
        name: sanitizeText(team.name),
        logo: logoUrl,
        manager: sanitizeText(team.manager),
        managerPhoto: managerPhotoUrl,
        managerKtp: managerKtpUrl,
        official1: sanitizeText(team.official1),
        official2: sanitizeText(team.official2),
        official3: sanitizeText(team.official3),
        official1Photo: official1PhotoUrl,
        official2Photo: official2PhotoUrl,
        official3Photo: official3PhotoUrl,
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
          <div className="flex items-center justify-between gap-4">
            {/* LEFT CONTENT */}
            <div>
              <div className="flex items-center gap-2 text-[10px] sm:text-xs uppercase tracking-[3px] text-white/70">
                <ShieldCheck size={16} /> Secure Team Registration
              </div>

              <h1 className="text-xl sm:text-2xl md:text-4xl font-bold mt-2">
                PENDAFTARAN TIM
              </h1>

              <p className="text-white/70 text-xs sm:text-sm mt-1">
                Pendaftaran dibuka 05 Mei 2026 • Ditutup 01 Juni 2026
              </p>
            </div>

            {/* RIGHT LOGO */}
            <div className="flex-shrink-0">
              <img
                src={logoWCS}
                alt="WCS Logo"
                className="w-12 sm:w-16 md:w-20 object-contain"
              />
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 md:p-8 space-y-8">
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
                  placeholder="Nama Tim"
                  className="border rounded-md px-4 h-11 text-sm w-full"
                />

                <input
                  name="phone"
                  value={team.phone}
                  onChange={handleChange}
                  placeholder="No. Whatsapp Aktif"
                  className="border rounded-md px-4 h-11 text-sm w-full"
                />

                <input
                  name="address"
                  value={team.address}
                  onChange={handleChange}
                  placeholder="Alamat Lengkap Tim"
                  className="border rounded-md px-4 h-11 text-sm w-full"
                />

                <div className="border rounded-xl p-4 bg-white">
                  <p className="text-xs font-semibold text-gray-700">
                    Upload Logo Tim
                  </p>

                  <p className="text-[11px] text-gray-500 mt-1">
                    PNG transparan disarankan • Maksimal 1MB
                  </p>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleTeamFileChange("logo", e.target.files[0])
                    }
                    className="mt-3 block w-full text-sm text-gray-600
        file:mr-3 file:px-4 file:py-2
        file:border-0 file:rounded-md
        file:bg-[#c8102e] file:text-white"
                  />
                </div>
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
                  placeholder="Nama Manager / PIC"
                  className="border rounded-md px-4 h-11 text-sm w-full"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="border rounded-xl p-4 bg-white">
                    <p className="text-xs font-semibold text-gray-700">
                      Upload Foto Manager
                    </p>
                    <p className="text-[11px] text-gray-500 mt-1">
                      JPG / PNG • Maksimal Ukuran File 1MB
                    </p>

                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleTeamFileChange("managerPhoto", e.target.files[0])
                      }
                      className="mt-3 block w-full text-sm text-gray-600
          file:mr-3 file:px-4 file:py-2
          file:border-0 file:rounded-md
          file:bg-[#c8102e] file:text-white"
                    />
                  </div>

                  <div className="border rounded-xl p-4 bg-white">
                    <p className="text-xs font-semibold text-gray-700">
                      Upload KTP Manager
                    </p>
                    <p className="text-[11px] text-gray-500 mt-1">
                      JPG / PNG • Maksimal 1MB
                    </p>

                    <p className="text-[11px] text-red-500 mt-1">
                      Gunakan foto portrait / close-up agar wajah terlihat jelas
                    </p>

                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleTeamFileChange("managerKtp", e.target.files[0])
                      }
                      className="mt-3 block w-full text-sm text-gray-600
          file:mr-3 file:px-4 file:py-2
          file:border-0 file:rounded-md
          file:bg-[#c8102e] file:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* OFFICIAL */}
              <div className="border rounded-lg p-4 bg-[#fafafa] space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-sm text-gray-500">
                    Official Team
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* OFFICIAL 1 */}
                  <div className="border rounded-xl p-4 bg-white space-y-3">
                    <input
                      name="official1"
                      value={team.official1}
                      onChange={handleChange}
                      placeholder="Nama Official 1"
                      className="border border-gray-300 rounded-md px-4 h-11 text-sm w-full"
                    />

                    <p className="text-[11px] text-gray-500">
                      JPG / PNG • Maksimal Ukuran File 1MB
                    </p>

                    <p className="text-[11px] text-red-500">
                      Gunakan foto portrait / close-up agar wajah terlihat jelas
                    </p>

                    {team.official1Photo && (
                      <img
                        src={URL.createObjectURL(team.official1Photo)}
                        alt="Official 1"
                        className="w-[140px] h-24 object-cover rounded-md border"
                      />
                    )}

                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleTeamFileChange(
                          "official1Photo",
                          e.target.files[0],
                        )
                      }
                      className="block w-full text-sm text-gray-600
        file:mr-3 file:px-4 file:py-2
        file:border-0 file:rounded-md
        file:bg-[#c8102e] file:text-white"
                    />
                  </div>

                  {/* OFFICIAL 2 */}
                  <div className="border rounded-xl p-4 bg-white space-y-3">
                    <input
                      name="official2"
                      value={team.official2}
                      onChange={handleChange}
                      placeholder="Nama Official 2"
                      className="border border-gray-300 rounded-md px-4 h-11 text-sm w-full"
                    />

                    <p className="text-[11px] text-gray-500">
                      JPG / PNG • Maksimal Ukuran File 1MB
                    </p>

                    <p className="text-[11px] text-red-500">
                      Gunakan foto portrait / close-up agar wajah terlihat jelas
                    </p>

                    {team.official2Photo && (
                      <img
                        src={URL.createObjectURL(team.official2Photo)}
                        alt="Official 2"
                        className="w-[140px] h-24 object-cover rounded-md border"
                      />
                    )}

                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleTeamFileChange(
                          "official2Photo",
                          e.target.files[0],
                        )
                      }
                      className="block w-full text-sm text-gray-600
        file:mr-3 file:px-4 file:py-2
        file:border-0 file:rounded-md
        file:bg-[#c8102e] file:text-white"
                    />
                  </div>
                </div>

                {/* OFFICIAL 3 */}
                <div className="border rounded-xl p-4 bg-white space-y-3">
                  <input
                    name="official3"
                    value={team.official3}
                    onChange={handleChange}
                    placeholder="Nama Official 3"
                    className="border border-gray-300 rounded-md px-4 h-11 text-sm w-full"
                  />

                  <p className="text-[11px] text-gray-500">
                    JPG / PNG • Maksimal Ukuran File 1MB
                  </p>

                  <p className="text-[11px] text-red-500">
                    Gunakan foto portrait / close-up agar wajah terlihat jelas
                  </p>

                  {team.official3Photo && (
                    <img
                      src={URL.createObjectURL(team.official3Photo)}
                      alt="Official 3"
                      className="w-[140px] h-24 object-cover rounded-md border"
                    />
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleTeamFileChange("official3Photo", e.target.files[0])
                    }
                    className="block w-full text-sm text-gray-600
      file:mr-3 file:px-4 file:py-2
      file:border-0 file:rounded-md
      file:bg-[#c8102e] file:text-white"
                  />
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
            </div>

            <div className="space-y-4">
              {players.map((p, i) => (
                <div
                  key={p.id}
                  className="border rounded-lg p-4 bg-[#fafafa] space-y-3"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-sm text-gray-500">
                      Pemain #{i + 1}
                    </span>
                  </div>

                  <input
                    value={p.name}
                    onChange={(e) =>
                      handlePlayerChange(i, "name", e.target.value)
                    }
                    placeholder="Contoh: Risal Gerrad (sesuai KTP)"
                    className="border rounded-md px-4 h-11 text-sm w-full"
                  />
                  <div>
                    <p className="text-[10px] text-gray-500 mb-1">NIK</p>

                    <input
                      value={p.nik}
                      onChange={(e) =>
                        handlePlayerChange(
                          i,
                          "nik",
                          e.target.value.replace(/\D/g, ""),
                        )
                      }
                      placeholder="16 digit NIK"
                      maxLength={16}
                      className="border rounded-md px-4 h-11 text-sm w-full"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] text-gray-500 mb-1">
                        Tempat Lahir
                      </p>
                      <input
                        value={p.pob}
                        onChange={(e) =>
                          handlePlayerChange(i, "pob", e.target.value)
                        }
                        placeholder="Contoh: Samarinda"
                        className="border rounded-md px-3 h-11 text-sm w-full"
                      />
                    </div>

                    <div>
                      <p className="text-[10px] text-gray-500 mb-1">
                        Tanggal Lahir
                      </p>
                      <div className="relative">
                        <input
                          type="date"
                          value={p.dob}
                          onChange={(e) =>
                            handlePlayerChange(i, "dob", e.target.value)
                          }
                          className="border rounded-md px-3 h-11 text-sm w-full appearance-none"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 mb-1">Umur</p>
                    <input
                      value={p.age}
                      readOnly
                      placeholder="Otomatis dari tanggal lahir"
                      className="border rounded-md px-3 h-11 text-sm bg-gray-100 w-full"
                    />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 mb-1">Posisi</p>
                    <select
                      value={p.position}
                      onChange={(e) =>
                        handlePlayerChange(i, "position", e.target.value)
                      }
                      className="border rounded-md px-3 h-11 text-sm w-full"
                    >
                      <option value="">Pilih Posisi</option>
                      <option value="Kiper">Kiper</option>
                      <option value="Belakang">Belakang</option>
                      <option value="Tengah">Tengah</option>
                      <option value="Depan">Depan</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* KTP */}
                    <div className="border rounded-xl p-4 bg-white">
                      <p className="text-xs font-semibold text-gray-700">
                        Upload KTP
                      </p>

                      <p className="text-[11px] text-gray-500 mt-1">
                        JPG / PNG • Maksimal Ukuran File 1MB
                      </p>

                      <p className="text-[11px] text-red-500 mt-1">
                        Pastikan foto terang dan tulisan terbaca jelas
                      </p>

                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleFileChange(i, "ktp", e.target.files[0])
                        }
                        className="mt-3 block w-full text-sm text-gray-600
    file:mr-3 file:px-4 file:py-2
    file:border-0 file:rounded-md
    file:bg-[#c8102e] file:text-white
    hover:file:bg-[#a70d26]"
                      />
                    </div>

                    {/* FOTO PEMAIN */}
                    <div className="border rounded-xl p-4 bg-white">
                      <p className="text-xs font-semibold text-gray-700">
                        Upload Foto Pemain
                      </p>

                      <p className="text-[11px] text-gray-500 mt-1">
                        JPG / PNG / WEBP • Maksimal Ukuran File 1MB
                      </p>

                      <p className="text-[11px] text-red-500 mt-1">
                        Gunakan foto portrait / close-up agar wajah terlihat
                        jelas
                      </p>

                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleFileChange(i, "photo", e.target.files[0])
                        }
                        className="mt-3 block w-full text-sm text-gray-600
    file:mr-3 file:px-4 file:py-2
    file:border-0 file:rounded-md
    file:bg-[#c8102e] file:text-white
    hover:file:bg-[#a70d26]"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    {/* ➕ TAMBAH */}
                    {i === players.length - 1 && (
                      <button
                        type="button"
                        onClick={addPlayer}
                        className="flex items-center gap-1 text-green-600 hover:text-green-700 font-medium transition"
                      >
                        <Plus size={16} />
                        <span>Tambah</span>
                      </button>
                    )}

                    {/* SEPARATOR */}
                    {i === players.length - 1 && (
                      <span className="text-gray-300">|</span>
                    )}

                    {/* 🗑 HAPUS */}
                    <button
                      type="button"
                      onClick={() => removePlayer(i)}
                      className="flex items-center gap-1 text-red-600 hover:text-red-700 font-medium transition"
                    >
                      <Trash2 size={16} />
                      <span>Hapus</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#fff8f8] border border-[#ffd6dc] rounded-lg p-4 text-sm text-gray-700 leading-6">
            <p>
              • Pendaftaran peserta dibuka mulai 05 Mei 2026 dan ditutup pada 01
              Juni 2026.
            </p>
            <p>• Setelah submit akan dapat link edit privat.</p>
            <p>• Edit maksimal sampai 08 Juni 2026 (H-5).</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#c8102e] hover:bg-[#a70d26] text-white h-12 rounded-md font-bold uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Menyimpan Data..." : "Simpan & Dapatkan Link Edit"}
          </button>
        </form>
      </div>
    </div>
  );
}
