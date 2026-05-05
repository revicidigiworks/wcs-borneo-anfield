import jsPDF from "jspdf";

/* =====================
   CONFIG
===================== */
const COLOR = {
  PRIMARY: [200, 16, 46],
  DARK: [20, 20, 20],
  GRAY: [120, 120, 120],
  BORDER: [220, 220, 220],
};

const PAGE = {
  W: 210,
  H: 297,
  M: 15,
};

/* =====================
   IMAGE CONVERTER
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
  doc.setTextColor(...COLOR.DARK);
  doc.text("WORLD CUP SERIES 2026", PAGE.M, 15);

  doc.setFontSize(10);
  doc.setTextColor(...COLOR.PRIMARY);
  doc.text("BORNEO ANFIELD • OFFICIAL TEAM FORM", PAGE.M, 21);

  doc.setDrawColor(...COLOR.PRIMARY);
  doc.line(PAGE.M, 24, PAGE.W - PAGE.M, 24);

  doc.setFontSize(9);
  doc.setTextColor(...COLOR.GRAY);
  doc.text(`TIM: ${team.name}`, PAGE.W - PAGE.M, 15, { align: "right" });

  return 30;
};

/* =====================
   TEAM INFO
===================== */
const drawTeamInfo = (doc, team, y) => {
  const left = PAGE.M;
  const right = PAGE.W / 2;

  doc.setFontSize(9);
  doc.setTextColor(...COLOR.DARK);

  const data = [
    ["Manager", team.manager],
    ["Whatsapp", team.phone],
    ["Official 1", team.official1],
    ["Official 2", team.official2],
    ["Official 3", team.official3],
    ["Alamat", team.address],
  ];

  data.forEach((d, i) => {
    const x = i % 2 === 0 ? left : right;
    const row = Math.floor(i / 2);

    doc.setFont("helvetica", "bold");
    doc.text(`${d[0]}:`, x, y + row * 8);

    doc.setFont("helvetica", "normal");
    doc.text(d[1] || "-", x + 28, y + row * 8);
  });

  return y + 28;
};

/* =====================
   PLAYER CARD
===================== */
const drawPlayer = async (doc, p, x, y, index) => {
  const cardW = 85;
  const cardH = 42;

  // border
  doc.setDrawColor(...COLOR.BORDER);
  doc.rect(x, y, cardW, cardH);

  // number
  doc.setFontSize(8);
  doc.setTextColor(...COLOR.GRAY);
  doc.text(`#${index + 1}`, x + 2, y + 5);

  // FOTO
  if (p.photo) {
    const img = await toBase64(p.photo);
    if (img) {
      doc.addImage(img, "JPEG", x + 3, y + 8, 18, 24);
    }
  }

  // DATA
  doc.setFontSize(8);
  doc.setTextColor(...COLOR.DARK);

  const tx = x + 24;

  doc.setFont("helvetica", "bold");
  doc.text("Nama:", tx, y + 10);

  doc.setFont("helvetica", "normal");
  doc.text((p.name || "-").substring(0, 22), tx + 18, y + 10);

  doc.setFont("helvetica", "bold");
  doc.text("TTL:", tx, y + 17);

  doc.setFont("helvetica", "normal");
  doc.text(`${p.pob || "-"}, ${p.dob || "-"}`, tx + 18, y + 17);

  doc.setFont("helvetica", "bold");
  doc.text("Usia:", tx, y + 24);

  doc.setFont("helvetica", "normal");
  doc.text(`${p.age || "-"} th`, tx + 18, y + 24);
};

/* =====================
   PLAYERS GRID
===================== */
const drawPlayers = async (doc, players, startY) => {
  let y = startY;
  let x = PAGE.M;

  for (let i = 0; i < players.length; i++) {
    await drawPlayer(doc, players[i], x, y, i);

    if (i % 2 === 0) {
      x = PAGE.W / 2 + 5;
    } else {
      x = PAGE.M;
      y += 48;

      if (y > 250) {
        doc.addPage();
        y = 20;
      }
    }
  }

  return y;
};

/* =====================
   SIGNATURE
===================== */
const drawSignature = (doc) => {
  const y = PAGE.H - 40;

  doc.setFontSize(9);
  doc.setTextColor(...COLOR.DARK);

  doc.text("MANAGER TIM", PAGE.M + 20, y);
  doc.text("PANITIA", PAGE.W - PAGE.M - 30, y);

  doc.line(PAGE.M + 5, y + 15, PAGE.M + 60, y + 15);
  doc.line(PAGE.W - PAGE.M - 60, y + 15, PAGE.W - PAGE.M - 5, y + 15);
};

/* =====================
   MAIN EXPORT
===================== */
export const exportTeamsPDF = async (teams) => {
  const doc = new jsPDF("p", "mm", "a4");

  const list = Array.isArray(teams) ? teams : [teams];

  for (let i = 0; i < list.length; i++) {
    if (i > 0) doc.addPage();

    const team = list[i];

    let y = drawHeader(doc, team);
    y = drawTeamInfo(doc, team, y);
    y += 5;

    y = await drawPlayers(doc, team.players || [], y);

    drawSignature(doc);
  }

  doc.save("TEAM_REGISTRATION.pdf");
};