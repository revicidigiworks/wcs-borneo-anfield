import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/* =====================
   CONFIG
===================== */
const COLOR = {
  PRIMARY: [200, 16, 46],
  DARK: [15, 15, 15],
  GRAY: [100, 100, 100],
  BORDER: [210, 210, 210],
};

const PAGE = {
  W: 210,
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
   HEADER (PRO STYLE)
===================== */
const drawHeader = (doc, team) => {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...COLOR.DARK);
  doc.text("WORLD CUP SERIES 2026", PAGE.M, 15);

  doc.setFontSize(10);
  doc.setTextColor(...COLOR.PRIMARY);
  doc.text("OFFICIAL TEAM REGISTRATION FORM", PAGE.M, 21);

  doc.setDrawColor(...COLOR.PRIMARY);
  doc.setLineWidth(1);
  doc.line(PAGE.M, 25, PAGE.W - PAGE.M, 25);

  doc.setFontSize(9);
  doc.setTextColor(...COLOR.GRAY);
  doc.text(`TEAM: ${team.name}`, PAGE.W - PAGE.M, 15, { align: "right" });

  return 32;
};

/* =====================
   TEAM INFO
===================== */
const drawTeamInfo = (doc, team, y) => {
  const left = PAGE.M;
  const right = PAGE.W / 2;

  const data = [
    ["Manager", team.manager],
    ["Whatsapp", team.phone],
    ["Official 1", team.official1],
    ["Official 2", team.official2],
    ["Official 3", team.official3],
    ["Alamat", team.address],
  ];

  doc.setFontSize(9);
  doc.setTextColor(...COLOR.DARK);

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
   FOTO GRID (3x4 STYLE)
===================== */
const drawPhotos = async (doc, players, y) => {
  const sizeW = 18;
  const sizeH = 24;

  let x = PAGE.M;
  let row = 0;

  for (let i = 0; i < players.length; i++) {
    if (players[i].photo) {
      const img = await toBase64(players[i].photo);

      if (img) {
        doc.addImage(img, "JPEG", x, y, sizeW, sizeH);
      }
    }

    // nama kecil di bawah foto
    doc.setFontSize(6);
    doc.text(
      (players[i].name || "-").substring(0, 12),
      x + sizeW / 2,
      y + sizeH + 3,
      { align: "center" }
    );

    x += 22;

    if ((i + 1) % 8 === 0) {
      x = PAGE.M;
      row++;
      y += 32;
    }
  }

  return y + 5;
};

/* =====================
   TABLE (PRO CLEAN)
===================== */
const drawTable = (doc, players, y) => {
  autoTable(doc, {
    startY: y,
    margin: { left: PAGE.M, right: PAGE.M },

    head: [["NO", "NAMA LENGKAP", "TEMPAT LAHIR", "TANGGAL LAHIR", "USIA"]],

    body: players.map((p, i) => [
      i + 1,
      (p.name || "-").toUpperCase(),
      p.pob || "-",
      p.dob || "-",
      `${p.age || "-"} TH`,
    ]),

    theme: "grid",

    styles: {
      fontSize: 8,
      cellPadding: 3,
    },

    headStyles: {
      fillColor: COLOR.PRIMARY,
      textColor: 255,
      fontStyle: "bold",
      halign: "center",
    },

    columnStyles: {
      0: { halign: "center", cellWidth: 10 },
      4: { halign: "center", cellWidth: 20 },
    },
  });

  return doc.lastAutoTable.finalY + 5;
};

/* =====================
   SIGNATURE
===================== */
const drawSignature = (doc) => {
  const y = doc.internal.pageSize.height - 35;

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

    // FOTO GRID
    y = await drawPhotos(doc, team.players || [], y);

    // TABLE
    y = drawTable(doc, team.players || [], y);

    drawSignature(doc);
  }

  doc.save("FINAL_FORM_PANITIA.pdf");
};