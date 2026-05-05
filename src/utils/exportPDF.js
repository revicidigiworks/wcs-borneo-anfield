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
  doc.text("WORLD CUP SERIES 2026", PAGE.M, 16);

  doc.setFontSize(11);
  doc.setTextColor(...COLOR.PRIMARY);
  doc.text("OFFICIAL TEAM REGISTRATION FORM", PAGE.M, 23);

  doc.setFontSize(10);
  doc.setTextColor(...COLOR.SUB);
  doc.text(`TEAM: ${team.name}`, PAGE.W - PAGE.M, 16, {
    align: "right",
  });

  doc.setDrawColor(...COLOR.PRIMARY);
  doc.setLineWidth(1.2);
  doc.line(PAGE.M, 27, PAGE.W - PAGE.M, 27);

  return 35;
};

/* ===================== TEAM INFO ===================== */
const drawTeamInfo = (doc, team, y) => {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...COLOR.TEXT);
  doc.text("TEAM INFORMATION", PAGE.M, y);

  doc.setDrawColor(220);
  doc.setLineWidth(0.5);
  doc.line(PAGE.M, y + 2, PAGE.W - PAGE.M, y + 2);

  y += 10;

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
    doc.setFont("helvetica", "bold");
    doc.text(d[0], PAGE.M, y + i * 7);

    doc.setFont("helvetica", "normal");
    doc.text(`: ${d[1] || "-"}`, PAGE.M + 28, y + i * 7);
  });

  return y + data.length * 7 + 10;
};

/* ===================== PLAYER TABLE ===================== */
const drawPlayers = async (doc, players, yStart) => {
  let y = yStart;
  const rowH = 22;

  const col = {
    no: PAGE.M,
    foto: PAGE.M + 10,
    nama: PAGE.M + 32,
    ttl: PAGE.M + 105,
    usia: PAGE.W - PAGE.M - 5,
  };

  /* HEADER MERAH */
  doc.setFillColor(...COLOR.PRIMARY);
  doc.rect(PAGE.M, y, PAGE.W - PAGE.M * 2, 8, "F");

  doc.setTextColor(255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);

  doc.text("NO", col.no + 2, y + 5);
  doc.text("FOTO", col.foto + 2, y + 5);
  doc.text("NAMA", col.nama, y + 5);
  doc.text("TTL", col.ttl, y + 5);
  doc.text("USIA", col.usia, y + 5, { align: "right" });

  y += 8;

  /* GARIS TIPIS */
  doc.setDrawColor(220);
  doc.setLineWidth(0.3);
  doc.line(PAGE.M, y, PAGE.W - PAGE.M, y);

  y += 3;

  doc.setTextColor(...COLOR.TEXT);
  doc.setFont("helvetica", "normal");

  for (let i = 0; i < players.length; i++) {
    const p = players[i];

    if (y + rowH > 270) {
      doc.addPage();
      y = 20;
    }

    // NO
    doc.text(String(i + 1), col.no + 2, y + 10);

    // FOTO (NO BORDER)
    if (p.photo) {
      const img = await toBase64(p.photo);
      if (img) {
        doc.addImage(img, "JPEG", col.foto, y + 1, 16, 20);
      }
    }

    // NAMA
    doc.text(
      (p.name || "-").toUpperCase(),
      col.nama,
      y + 10
    );

    // TTL
    doc.text(
      `${p.pob || "-"}, ${p.dob || "-"}`,
      col.ttl,
      y + 10
    );

    // USIA
    doc.text(
      `${p.age || "-"} TH`,
      col.usia,
      y + 10,
      { align: "right" }
    );

    /* GARIS BAWAH HALUS */
    doc.setDrawColor(...COLOR.LINE);
    doc.setLineWidth(0.2);
    doc.line(PAGE.M, y + rowH, PAGE.W - PAGE.M, y + rowH);

    y += rowH;
  }

  return y + 10;
};

/* ===================== SIGNATURE ===================== */
const drawSignature = (doc) => {
  const y = PAGE.H - 35;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);

  doc.text("MANAGER TIM", PAGE.M + 25, y);
  doc.text("PANITIA", PAGE.W - PAGE.M - 30, y);

  doc.setLineWidth(0.5);
  doc.line(PAGE.M + 5, y + 15, PAGE.M + 65, y + 15);
  doc.line(PAGE.W - PAGE.M - 65, y + 15, PAGE.W - PAGE.M - 5, y + 15);
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