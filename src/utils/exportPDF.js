import jsPDF from "jspdf";

/* =====================
   CONFIG
===================== */
const M = 15;
const PAGE_W = 210;

/* =====================
   IMAGE HELPER
===================== */
const toBase64 = async (url) => {
  try {
    const res = await fetch(url);
    const blob = await res.blob();

    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
};

/* =====================
   HEADER
===================== */
const drawHeader = (doc, team) => {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("WORLD CUP SERIES 2026", M, 15);

  doc.setFontSize(10);
  doc.setTextColor(200, 16, 46);
  doc.text("OFFICIAL TEAM SHEET", M, 21);

  doc.setDrawColor(200, 16, 46);
  doc.setLineWidth(0.8);
  doc.line(M, 25, PAGE_W - M, 25);

  doc.setTextColor(0);
  doc.setFontSize(9);
  doc.text(`TEAM: ${team.name}`, PAGE_W - M, 15, { align: "right" });

  return 32;
};

/* =====================
   TEAM INFO
===================== */
const drawTeamInfo = (doc, team, y) => {
  const left = M;
  const right = PAGE_W / 2;

  const data = [
    ["Manager", team.manager],
    ["Whatsapp", team.phone],
    ["Official 1", team.official1],
    ["Official 2", team.official2],
    ["Official 3", team.official3],
    ["Alamat", team.address],
  ];

  doc.setFontSize(9);

  data.forEach((d, i) => {
    const x = i % 2 === 0 ? left : right;
    const row = Math.floor(i / 2);

    doc.setFont("helvetica", "bold");
    doc.text(`${d[0]}:`, x, y + row * 8);

    doc.setFont("helvetica", "normal");
    doc.text(d[1] || "-", x + 30, y + row * 8);
  });

  return y + 28;
};

/* =====================
   DRAW TABLE HEADER
===================== */
const drawTableHeader = (doc, y) => {
  const cols = ["NO", "NAMA", "TTL", "USIA", "FOTO"];
  const colX = [M, M + 12, M + 70, M + 140, M + 155];

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);

  cols.forEach((c, i) => {
    doc.text(c, colX[i], y);
  });

  doc.setDrawColor(0);
  doc.line(M, y + 2, PAGE_W - M, y + 2);

  return y + 6;
};

/* =====================
   DRAW PLAYERS
===================== */
const drawPlayers = async (doc, players, startY) => {
  let y = startY;

  const colX = {
    no: M,
    name: M + 12,
    ttl: M + 70,
    age: M + 140,
    photo: M + 155,
  };

  for (let i = 0; i < players.length; i++) {
    const p = players[i];

    if (y > 260) {
      doc.addPage();
      y = 20;
      drawTableHeader(doc, y);
      y += 6;
    }

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);

    doc.text(String(i + 1), colX.no, y);
    doc.text((p.name || "-").substring(0, 25), colX.name, y);
    doc.text(`${p.pob || "-"}, ${p.dob || "-"}`, colX.ttl, y);
    doc.text(`${p.age || "-"} TH`, colX.age, y);

    // FOTO
    if (p.photo) {
      const img = await toBase64(p.photo);
      if (img) {
        doc.addImage(img, "JPEG", colX.photo, y - 5, 16, 20);
      }
    }

    y += 10;
  }

  return y;
};

/* =====================
   SIGNATURE
===================== */
const drawSignature = (doc) => {
  const y = doc.internal.pageSize.height - 35;

  doc.setFontSize(9);

  doc.text("MANAGER TIM", M + 20, y);
  doc.text("PANITIA", PAGE_W - M - 30, y);

  doc.line(M + 5, y + 15, M + 60, y + 15);
  doc.line(PAGE_W - M - 60, y + 15, PAGE_W - M - 5, y + 15);
};

/* =====================
   EXPORT
===================== */
export const exportTeamsPDF = async (teams) => {
  const doc = new jsPDF("p", "mm", "a4");

  const list = Array.isArray(teams) ? teams : [teams];

  for (let i = 0; i < list.length; i++) {
    if (i > 0) doc.addPage();

    const team = list[i];

    let y = drawHeader(doc, team);
    y = drawTeamInfo(doc, team, y);

    y = drawTableHeader(doc, y);
    y = await drawPlayers(doc, team.players || [], y);

    drawSignature(doc);
  }

  doc.save("FINAL_FORM_RESMI.pdf");
};