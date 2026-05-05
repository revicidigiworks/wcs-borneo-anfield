import jsPDF from "jspdf";

/* =====================
   HELPER LOAD IMAGE
===================== */
const loadImage = (url) =>
  new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = url;
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
  });

/* =====================
   HEADER
===================== */
const drawHeader = (doc, team) => {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("FORMULIR RESMI PANITIA", 14, 15);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
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
   PLAYER GRID + FOTO
===================== */
const drawPlayers = async (doc, players, startY) => {
  let x = 14;
  let y = startY;

  const cardW = 60;
  const cardH = 45;

  for (let i = 0; i < players.length; i++) {
    const p = players[i];

    // pindah baris
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
      const img = await loadImage(p.photo);
      if (img) {
        doc.addImage(img, "JPEG", x + 2, y + 2, 16, 20);
      }
    }

    // TEXT
    doc.setFontSize(7);
    doc.text(`Nama: ${p.name || "-"}`, x + 20, y + 8);
    doc.text(`TTL: ${p.pob || "-"}, ${p.dob || "-"}`, x + 20, y + 13);
    doc.text(`Umur: ${p.age || "-"}`, x + 20, y + 18);

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
   MAIN EXPORT
===================== */
export const exportTeamsPDF = async (teams) => {
  const doc = new jsPDF();

  // 🔥 SUPPORT 1 ATAU BANYAK
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
      ? (list[0].name || "TEAM").replace(/\s+/g, "_")
      : "ALL_TEAMS";

  doc.save(`${fileName}.pdf`);
};