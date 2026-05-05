import jsPDF from "jspdf";

/* ===================== DESIGN SYSTEM ===================== */
const COLOR = {
  PRIMARY: [200, 16, 46],
  SECONDARY: [15, 15, 15],
  TEXT_MAIN: [45, 45, 45],
  TEXT_MUTE: [100, 100, 100],
  BG_LIGHT: [248, 248, 248],
  BORDER: [210, 210, 210],
  LINE: [235, 235, 235],
  WHITE: [255, 255, 255],
};

const PAGE = {
  W: 210,
  H: 297,
  M: 15,
};

/* ===================== HELPER ===================== */
const drawLine = (doc, y, color = COLOR.PRIMARY, thickness = 0.5) => {
  doc.setDrawColor(...color);
  doc.setLineWidth(thickness);
  doc.line(PAGE.M, y, PAGE.W - PAGE.M, y);
};

const meta = () => ({
  doc: `WCS-2026-${Math.floor(Math.random() * 999999)}`,
  verify: Math.random().toString(36).substring(2, 10).toUpperCase(),
});

/* ===================== IMAGE ===================== */
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

/* ===================== HEADER ===================== */
const drawHeader = (doc, team, metaData) => {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...COLOR.SECONDARY);
  doc.text("WORLD CUP SERIES 2026", PAGE.M, 15);

  doc.setFontSize(10);
  doc.setTextColor(...COLOR.PRIMARY);
  doc.setFont("helvetica", "normal");
  doc.text("DOKUMEN RESMI PENDAFTARAN TIM", PAGE.M, 21);

  drawLine(doc, 25, COLOR.PRIMARY, 0.8);

  doc.setFontSize(8);
  doc.setTextColor(...COLOR.TEXT_MUTE);

  doc.text(`Tim: ${team.name}`, PAGE.W - PAGE.M, 14, { align: "right" });
  doc.text(`Doc ID: ${metaData.doc}`, PAGE.W - PAGE.M, 18, { align: "right" });
  doc.text(`Verifikasi: ${metaData.verify}`, PAGE.W - PAGE.M, 22, { align: "right" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...COLOR.SECONDARY);
  doc.text("FORMULIR RESMI PENDAFTARAN & VERIFIKASI TIM", PAGE.M, 32);

  return 38;
};

/* ===================== INFO BAR ===================== */
const drawInfoBar = (doc, team, y) => {
  const total = team.players?.length ?? 0;

  doc.setFillColor(...COLOR.BG_LIGHT);
  doc.setDrawColor(...COLOR.BORDER);
  doc.roundedRect(PAGE.M, y, 180, 12, 1, 1, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...COLOR.TEXT_MAIN);

  doc.text(`TOTAL PEMAIN: ${total}`, PAGE.M + 5, y + 7);
  doc.text(`STATUS: VALID`, PAGE.M + 65, y + 7);
  doc.text(`DOKUMEN: TERKONFIRMASI`, PAGE.M + 120, y + 7);

  return y + 18;
};

/* ===================== TEAM INFO (2 KOLOM) ===================== */
const drawTeamInfo = (doc, team, y) => {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...COLOR.SECONDARY);
  doc.text("INFORMASI TIM", PAGE.M, y);

  drawLine(doc, y + 2, COLOR.BORDER, 0.3);

  y += 10;

  const left = [
    ["Nama Tim", team.name],
    ["Manajer", team.manager],
    ["WhatsApp", team.phone],
  ];

  const right = [
    ["Official 1", team.official1],
    ["Official 2", team.official2],
    ["Official 3", team.official3],
  ];

  doc.setFontSize(9);

  left.forEach((d, i) => {
    doc.setFont("helvetica", "bold");
    doc.text(d[0], PAGE.M, y + i * 7);

    doc.setFont("helvetica", "normal");
    doc.text(`: ${d[1] || "-"}`, PAGE.M + 28, y + i * 7);
  });

  right.forEach((d, i) => {
    doc.setFont("helvetica", "bold");
    doc.text(d[0], PAGE.W / 2 + 5, y + i * 7);

    doc.setFont("helvetica", "normal");
    doc.text(`: ${d[1] || "-"}`, PAGE.W / 2 + 30, y + i * 7);
  });

  return y + 25;
};

/* ===================== PLAYER LIST ===================== */
const drawPlayers = async (doc, players, yStart) => {
  let y = yStart;

  const rowH = 17;

  const col = {
    no: PAGE.M,
    foto: PAGE.M + 10,
    nama: PAGE.M + 30,
    ttl: PAGE.M + 95,
    usia: PAGE.W - PAGE.M - 5,
  };

  // TITLE
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("DAFTAR PEMAIN TERDAFTAR", PAGE.M, y);

  y += 5;

  // HEADER
  doc.setFillColor(...COLOR.PRIMARY);
  doc.rect(PAGE.M, y, 180, 7, "F");

  doc.setTextColor(255);
  doc.setFontSize(8);

  doc.text("NO", col.no + 2, y + 5);
  doc.text("FOTO", col.foto, y + 5);
  doc.text("NAMA LENGKAP", col.nama, y + 5);
  doc.text("TTL", col.ttl, y + 5);
  doc.text("USIA", col.usia, y + 5, { align: "right" });

  y += 7;

  doc.setTextColor(...COLOR.TEXT_MAIN);

  for (let i = 0; i < players.length; i++) {
    const p = players[i];

    if (y + rowH > 270) {
      doc.addPage();
      y = 20;
    }

    doc.text(String(i + 1), col.no + 2, y + 10);

    if (p.photo) {
      const img = await toBase64(p.photo);
      if (img) {
        doc.addImage(img, "JPEG", col.foto, y + 1, 14, 15);
      }
    }

    doc.text((p.name || "-").toUpperCase(), col.nama, y + 10);

    doc.text(
      `${p.pob || "-"}, ${p.dob || "-"}`,
      col.ttl,
      y + 10
    );

    doc.text(
      `${p.age || "-"} THN`,
      col.usia,
      y + 10,
      { align: "right" }
    );

    // garis tipis
    doc.setDrawColor(...COLOR.LINE);
    doc.setLineWidth(0.2);
    doc.line(PAGE.M, y + rowH, PAGE.W - PAGE.M, y + rowH);

    y += rowH;
  }

  return y + 10;
};

/* ===================== SIGNATURE ===================== */
const drawSignature = (doc) => {
  const y = PAGE.H - 40;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);

  doc.text("MANAJER TIM", PAGE.M + 20, y);
  doc.text("PANITIA", PAGE.W - PAGE.M - 30, y);

  doc.setDrawColor(...COLOR.BORDER);
  doc.line(PAGE.M + 5, y + 15, PAGE.M + 60, y + 15);
  doc.line(PAGE.W - PAGE.M - 60, y + 15, PAGE.W - PAGE.M - 5, y + 15);
};

/* ===================== FOOTER ===================== */
const drawFooter = (doc) => {
  const pages = doc.internal.getNumberOfPages();

  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);

    const h = doc.internal.pageSize.height;

    drawLine(doc, h - 15, COLOR.BORDER, 0.2);

    doc.setFontSize(7);
    doc.setTextColor(...COLOR.TEXT_MUTE);

    doc.text("Borneo Anfield", PAGE.M, h - 10);
    doc.text(`Halaman ${i} dari ${pages}`, PAGE.W - PAGE.M, h - 10, {
      align: "right",
    });
  }
};

/* ===================== EXPORT ===================== */
export const exportTeamsPDF = async (teams) => {
  const doc = new jsPDF("p", "mm", "a4");

  const list = Array.isArray(teams) ? teams : [teams];

  for (let i = 0; i < list.length; i++) {
    if (i > 0) doc.addPage();

    const m = meta();
    const team = list[i];

    let y = drawHeader(doc, team, m);
    y = drawInfoBar(doc, team, y);
    y = drawTeamInfo(doc, team, y);
    y = await drawPlayers(doc, team.players || [], y);

    drawSignature(doc);
  }

  drawFooter(doc);

  doc.save("FORM_RESMI_TIM.pdf");
};