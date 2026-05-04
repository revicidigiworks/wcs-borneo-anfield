import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/** =====================
 *  DESIGN SYSTEM (PREMIUM FIFA STYLE)
 ====================== */
const COLOR = {
  PRIMARY: [200, 16, 46],
  SECONDARY: [15, 15, 15],
  TEXT_MAIN: [45, 45, 45],
  TEXT_MUTE: [100, 100, 100],
  BG_LIGHT: [248, 248, 248],
  BORDER: [210, 210, 210],
  WHITE: [255, 255, 255],
};

const LAYOUT = {
  PAGE_W: 210,
  MARGIN: 15,
  CONTENT_W: 180,
};

/** =====================
 *  HELPER
 ====================== */
const drawLine = (doc, y, color = COLOR.PRIMARY, thickness = 0.5) => {
  doc.setDrawColor(...color);
  doc.setLineWidth(thickness);
  doc.line(LAYOUT.MARGIN, y, LAYOUT.PAGE_W - LAYOUT.MARGIN, y);
};

const meta = () => ({
  doc: `WCS-2026-${Math.floor(Math.random() * 999999)}`,
  verify: Math.random().toString(36).substring(2, 10).toUpperCase(),
});

/** =====================
 *  HEADER
 ====================== */
const drawHeader = (doc, teamName, metaData) => {
  doc.setFillColor(...COLOR.WHITE);
  doc.rect(0, 0, LAYOUT.PAGE_W, 35, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...COLOR.SECONDARY);
  doc.text("WORLD CUP SERIES 2026", LAYOUT.MARGIN, 15);

  doc.setFontSize(10);
  doc.setTextColor(...COLOR.PRIMARY);
  doc.setFont("helvetica", "normal");
  doc.text("BORNEO ANFIELD STADIUM • OFFICIAL DOCUMENT", LAYOUT.MARGIN, 21);

  drawLine(doc, 25, COLOR.PRIMARY, 0.8);

  doc.setFontSize(8);
  doc.setTextColor(...COLOR.TEXT_MUTE);
  doc.text(`Tim: ${teamName?.toUpperCase() || "-"}`, LAYOUT.PAGE_W - LAYOUT.MARGIN, 14, { align: "right" });
  doc.text(`Doc: ${metaData.doc}`, LAYOUT.PAGE_W - LAYOUT.MARGIN, 19, { align: "right" });
  doc.text(`Verify: ${metaData.verify}`, LAYOUT.PAGE_W - LAYOUT.MARGIN, 23, { align: "right" });

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLOR.SECONDARY);
  doc.text("FORMULIR RESMI PENDAFTARAN & VERIFIKASI TIM", LAYOUT.MARGIN, 32);

  return 38;
};

/** =====================
 *  INFO BAR
 ====================== */
const drawInfoBar = (doc, team, startY) => {
  const total = team.players?.length ?? 0;
  const y = startY;

  doc.setFillColor(...COLOR.BG_LIGHT);
  doc.setDrawColor(...COLOR.BORDER);
  doc.roundedRect(LAYOUT.MARGIN, y, LAYOUT.CONTENT_W, 12, 1, 1, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...COLOR.TEXT_MAIN);

  const col = LAYOUT.CONTENT_W / 3;
  doc.text(`TOTAL PEMAIN: ${total}`, LAYOUT.MARGIN + 5, y + 7.5);
  doc.text(`STATUS: VALID`, LAYOUT.MARGIN + col + 5, y + 7.5);
  doc.text(`DOKUMEN: TERKONFIRMASI`, LAYOUT.MARGIN + col * 2 + 5, y + 7.5);

  return y + 18;
};

/** =====================
 *  TEAM BOX
 ====================== */
const drawTeamBox = (doc, team, startY) => {
  const x = LAYOUT.MARGIN;
  const y = startY;
  const h = 35;

  doc.setDrawColor(...COLOR.BORDER);
  doc.rect(x, y, LAYOUT.CONTENT_W, h);

  doc.setFillColor(...COLOR.SECONDARY);
  doc.rect(x, y, 55, 6, "F");

  doc.setFontSize(7);
  doc.setTextColor(...COLOR.WHITE);
  doc.text("DATA IDENTITAS TIM", x + 3, y + 4);

  doc.setTextColor(...COLOR.TEXT_MAIN);
  doc.setFontSize(9);

  const left = x + 5;
  const right = x + 95;

  const data = [
    { label: "Nama Tim", value: team.name, x: left, y: y + 14 },
    { label: "Manager", value: team.manager, x: left, y: y + 22 },
    { label: "WhatsApp", value: team.phone, x: left, y: y + 30 },
    { label: "Official 1", value: team.official1, x: right, y: y + 14 },
    { label: "Official 2", value: team.official2, x: right, y: y + 22 },
    { label: "Official 3", value: team.official3, x: right, y: y + 30 },
  ];

  data.forEach(d => {
    doc.setFont("helvetica", "bold");
    doc.text(`${d.label}:`, d.x, d.y);

    doc.setFont("helvetica", "normal");
    doc.text(`${d.value || "-"}`, d.x + 25, d.y);
  });

  return y + h + 10;
};

/** =====================
 *  PLAYERS TABLE
 ====================== */
const drawPlayers = (doc, team, startY) => {
  const pageHeight = doc.internal.pageSize.height;

  const SIGNATURE_SPACE = 55; // ruang aman untuk TTD
  const FOOTER_SPACE = 20;

  const maxY = pageHeight - SIGNATURE_SPACE - FOOTER_SPACE;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...COLOR.SECONDARY);
  doc.text("DAFTAR PEMAIN TERDAFTAR", LAYOUT.MARGIN, startY);

  autoTable(doc, {
    startY: startY + 5,
    margin: { left: LAYOUT.MARGIN, right: LAYOUT.MARGIN },

    head: [["NO", "NAMA LENGKAP", "TEMPAT LAHIR", "TANGGAL LAHIR", "USIA"]],

    body: (team.players || []).map((p, i) => [
      i + 1,
      (p.name || "-").toUpperCase(),
      p.pob || "-",
      p.dob || "-",
      `${p.age || "-"} THN`,
    ]),

    theme: "grid",

    styles: {
      fontSize: 7,
      cellPadding: 2,
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

    // 🔥 INI KUNCINYA
    didDrawPage: (data) => {
      if (data.cursor.y > maxY) {
        doc.setPage(doc.internal.getNumberOfPages());
      }
    },
  });

  // clamp posisi akhir biar gak nabrak signature
  return Math.min(doc.lastAutoTable.finalY, maxY);
};
/** =====================
 *  SIGNATURE
 ====================== */
const drawSignature = (doc, yStart) => {
  const pageHeight = doc.internal.pageSize.height;

  // paksa signature di area bawah
  const y = pageHeight - 50;

  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(...COLOR.TEXT_MUTE);

  const signY = y + 15;

  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLOR.TEXT_MAIN);

  doc.text("MANAGER TIM", LAYOUT.MARGIN + 15, signY);
  doc.text("PANITIA", LAYOUT.PAGE_W - LAYOUT.MARGIN - 35, signY);

  doc.setDrawColor(...COLOR.BORDER);
  doc.line(LAYOUT.MARGIN + 5, signY + 15, LAYOUT.MARGIN + 55, signY + 15);
  doc.line(LAYOUT.PAGE_W - LAYOUT.MARGIN - 55, signY + 15, LAYOUT.PAGE_W - LAYOUT.MARGIN - 5, signY + 15);
};

/** =====================
 *  FOOTER
 ====================== */
const drawFooter = (doc) => {
  const pages = doc.internal.getNumberOfPages();

  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);

    const h = doc.internal.pageSize.height;

    drawLine(doc, h - 15, COLOR.BORDER, 0.2);

    doc.setFontSize(7);
    doc.setTextColor(...COLOR.TEXT_MUTE);

    doc.text("Borneo Anfield", LAYOUT.MARGIN, h - 10);
    doc.text(`Halaman ${i} dari ${pages}`, LAYOUT.PAGE_W - LAYOUT.MARGIN, h - 10, { align: "right" });
  }
};

/** =====================
 *  EXPORT
 ====================== */
export const exportTeamsPDF = (teams) => {
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  const list = Array.isArray(teams) ? teams : [teams];

  list.forEach((team, i) => {
    if (i > 0) doc.addPage();

    const m = meta();

    let y = drawHeader(doc, team.name, m);
    y = drawInfoBar(doc, team, y);
    y = drawTeamBox(doc, team, y);
    y = drawPlayers(doc, team, y);
    drawSignature(doc, y);
  });

  drawFooter(doc);

  /* ======================
     FILE NAME LOGIC
  ====================== */
  let fileName = "ALL_TEAMS";

  if (list.length === 1) {
    fileName =
      list[0].name
        ?.replace(/\s+/g, "_")
        .replace(/[^\w]/g, "")
        .toUpperCase() || "TEAM";
  }

  doc.save(`${fileName}.pdf`);
};