import jsPDF from "jspdf";

/* =====================
   CONVERT IMAGE → BASE64 (WAJIB BIAR FOTO MUNCUL)
===================== */
const getBase64Image = (url) => {
  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.setAttribute("crossOrigin", "anonymous");

      img.onload = function () {
        const canvas = document.createElement("canvas");
        canvas.width = this.width;
        canvas.height = this.height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(this, 0, 0);

        const dataURL = canvas.toDataURL("image/jpeg", 0.7);
        resolve(dataURL);
      };

      img.onerror = () => resolve(null);

      // 🔥 Cloudinary optimization
      img.src = url.replace("/upload/", "/upload/f_auto,q_auto/");
    } catch {
      resolve(null);
    }
  });
};

/* =====================
   HEADER
===================== */
const drawHeader = (doc, team) => {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("FORMULIR RESMI PANITIA", 14, 15);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("World Cup Series Borneo Anfield 2026", 14, 22);

  doc.setFont("helvetica", "bold");
  doc.text(`TIM: ${team.name || "-"}`, 14, 30);

  return 36;
};

/* =====================
   TEAM INFO
===================== */
const drawTeamInfo = (doc, team, y) => {
  doc.setFontSize(9);

  doc.text(`Manager: ${team.manager || "-"}`, 14, y);
  doc.text(`WhatsApp: ${team.phone || "-"}`, 14, y + 5);

  doc.text(`Official 1: ${team.official1 || "-"}`, 110, y);
  doc.text(`Official 2: ${team.official2 || "-"}`, 110, y + 5);
  doc.text(`Official 3: ${team.official3 || "-"}`, 110, y + 10);

  return y + 18;
};

/* =====================
   PLAYERS GRID (FOTO ONLY)
===================== */
const drawPlayers = async (doc, players, startY) => {
  let x = 14;
  let y = startY;

  const cardW = 60;
  const cardH = 45;

  for (let i = 0; i < players.length; i++) {
    const p = players[i];

    // pindah baris tiap 3 kolom
    if (i !== 0 && i % 3 === 0) {
      x = 14;
      y += cardH + 5;
    }

    // page break
    if (y + cardH > 280) {
      doc.addPage();
      y = 20;
      x = 14;
    }

    // BOX
    doc.rect(x, y, cardW, cardH);

    // FOTO
    if (p.photo) {
      const base64 = await getBase64Image(p.photo);

      if (base64) {
        doc.addImage(base64, "JPEG", x + 2, y + 2, 16, 20);
      }
    }

    // TEXT
    doc.setFontSize(7);
    doc.text(`Nama: ${p.name || "-"}`, x + 20, y + 8);
    doc.text(`TTL: ${p.pob || "-"}, ${p.dob || "-"}`, x + 20, y + 13);
    doc.text(`Umur: ${p.age || "-"}`, x + 20, y + 18);
    doc.text(`#${i + 1}`, x + 2, y + 42);

    x += cardW + 4;
  }

  return y + cardH + 10;
};

/* =====================
   SIGNATURE
===================== */
const drawSignature = (doc) => {
  const y = 260;

  doc.setFontSize(9);
  doc.text("Manager Tim", 20, y);
  doc.text("Panitia", 150, y);

  doc.line(15, y + 15, 70, y + 15);
  doc.line(140, y + 15, 195, y + 15);
};

/* =====================
   MAIN EXPORT FUNCTION
===================== */
export const exportTeamsPDF = async (teams) => {
  const doc = new jsPDF();

  // support array / single
  const list = Array.isArray(teams) ? teams : [teams];

  for (let i = 0; i < list.length; i++) {
    const team = list[i];

    if (i > 0) doc.addPage();

    let y = drawHeader(doc, team);
    y = drawTeamInfo(doc, team, y);
    y = await drawPlayers(doc, team.players || [], y);

    drawSignature(doc);
  }

  const fileName =
    list.length === 1
      ? (list[0].name || "TEAM").replace(/\s+/g, "_").toUpperCase()
      : "ALL_TEAMS";

  doc.save(`${fileName}.pdf`);
};