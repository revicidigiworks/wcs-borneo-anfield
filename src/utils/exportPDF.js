import jsPDF from "jspdf";

/* ===================== CONFIG ===================== */
const COLOR = {
  PRIMARY: [200, 16, 46],
  TEXT: [30, 30, 30],
  SUB: [120, 120, 120],
  LINE: [235, 235, 235],
};

const PAGE = {
  W: 210,
  H: 297,
  M: 15,
};

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
const drawHeader = (doc, team) => {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...COLOR.TEXT);
  doc.text("SERI PIALA DUNIA 2026", PAGE.M, 16);

  doc.setFontSize(11);
  doc.setTextColor(...COLOR.PRIMARY);
  doc.text("FORMULIR PENDAFTARAN TIM RESMI", PAGE.M, 23);

  doc.setFontSize(10);
  doc.setTextColor(...COLOR.SUB);
  doc.text(`TIM: ${team.name}`, PAGE.W - PAGE.M, 16, {
    align: "right",
  });

  doc.setDrawColor(...COLOR.PRIMARY);
  doc.setLineWidth(1.2);
  doc.line(PAGE.M, 27, PAGE.W - PAGE.M, 27);

  return 35;
};

/* ===================== INFO TIM (2 KOLOM) ===================== */
const drawTeamInfo = (doc, team, y) => {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("INFORMASI TIM", PAGE.M, y);

  doc.setDrawColor(220);
  doc.line(PAGE.M, y + 2, PAGE.W - PAGE.M, y + 2);

  y += 10;

  const left = [
    ["Manajer", team.manager],
    ["Whatsapp", team.phone],
    ["Official 1", team.official1],
  ];

  const right = [
    ["Official 2", team.official2],
    ["Official 3", team.official3],
    ["Alamat", team.address],
  ];

  doc.setFontSize(9);

  left.forEach((d, i) => {
    doc.setFont("helvetica", "bold");
    doc.text(d[0], PAGE.M, y + i * 7);

    doc.setFont("helvetica", "normal");
    doc.text(`: ${d[1] || "-"}`, PAGE.M + 25, y + i * 7);
  });

  right.forEach((d, i) => {
    doc.setFont("helvetica", "bold");
    doc.text(d[0], PAGE.W / 2 + 5, y + i * 7);

    doc.setFont("helvetica", "normal");
    doc.text(`: ${d[1] || "-"}`, PAGE.W / 2 + 30, y + i * 7);
  });

  return y + 25;
};

/* ===================== PEMAIN ===================== */
const drawPlayers = async (doc, players, yStart) => {
  let y = yStart;

  const rowH = 18; // 🔥 DIPERKECIL

  const col = {
    no: PAGE.M,
    foto: PAGE.M + 10,
    nama: PAGE.M + 30,
    ttl: PAGE.M + 100,
    usia: PAGE.W - PAGE.M - 5,
  };

  /* HEADER */
  doc.setFillColor(...COLOR.PRIMARY);
  doc.rect(PAGE.M, y, PAGE.W - PAGE.M * 2, 7, "F");

  doc.setTextColor(255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);

  doc.text("NO", col.no + 2, y + 5);
  doc.text("FOTO", col.foto + 1, y + 5);
  doc.text("NAMA", col.nama, y + 5);
  doc.text("TTL", col.ttl, y + 5);
  doc.text("USIA", col.usia, y + 5, { align: "right" });

  y += 7;

  doc.setDrawColor(220);
  doc.setLineWidth(0.3);
  doc.line(PAGE.M, y, PAGE.W - PAGE.M, y);

  y += 2;

  doc.setTextColor(...COLOR.TEXT);
  doc.setFont("helvetica", "normal");

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
        doc.addImage(img, "JPEG", col.foto, y + 1, 14, 16);
      }
    }

    doc.text(
      (p.name || "-").toUpperCase(),
      col.nama,
      y + 10
    );

    doc.text(
      `${p.pob || "-"}, ${p.dob || "-"}`,
      col.ttl,
      y + 10
    );

    doc.text(
      `${p.age || "-"} TH`,
      col.usia,
      y + 10,
      { align: "right" }
    );

    doc.setDrawColor(...COLOR.LINE);
    doc.setLineWidth(0.2);
    doc.line(PAGE.M, y + rowH, PAGE.W - PAGE.M, y + rowH);

    y += rowH;
  }

  return y + 8;
};

/* ===================== TANDA TANGAN ===================== */
const drawSignature = (doc) => {
  const y = PAGE.H - 35;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);

  doc.text("MANAJER TIM", PAGE.M + 20, y);
  doc.text("PANITIA", PAGE.W - PAGE.M - 30, y);

  doc.line(PAGE.M + 5, y + 15, PAGE.M + 60, y + 15);
  doc.line(PAGE.W - PAGE.M - 60, y + 15, PAGE.W - PAGE.M - 5, y + 15);
};

/* ===================== EXPORT ===================== */
export const exportTeamsPDF = async (teams) => {
  const doc = new jsPDF("p", "mm", "a4");

  const list = Array.isArray(teams) ? teams : [teams];

  for (let i = 0; i < list.length; i++) {
    if (i > 0) doc.addPage();

    const team = list[i];

    let y = drawHeader(doc, team);
    y = drawTeamInfo(doc, team, y);
    y = await drawPlayers(doc, team.players || [], y);

    drawSignature(doc);
  }

  doc.save("FORM_PENDAFTARAN_TIM.pdf");
};