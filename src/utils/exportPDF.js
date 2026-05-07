import jsPDF from "jspdf";

/* ===================== DESIGN SYSTEM ===================== */
const COLOR = {
  PRIMARY: [200, 16, 46],
  SECONDARY: [18, 18, 18],
  TEXT: [55, 55, 55],
  MUTED: [120, 120, 120],
  BORDER: [225, 225, 225],
  LIGHT: [248, 248, 248],
};

const PAGE = {
  W: 210,
  H: 297,
  M: 14,
};

/* ===================== HELPER ===================== */
const drawLine = (
  doc,
  y,
  color = COLOR.BORDER,
  width = 0.4
) => {
  doc.setDrawColor(...color);
  doc.setLineWidth(width);
  doc.line(PAGE.M, y, PAGE.W - PAGE.M, y);
};

const meta = () => ({
  doc: `WCS-2026-${Math.floor(Math.random() * 999999)}`,
  verify: Math.random()
    .toString(36)
    .substring(2, 10)
    .toUpperCase(),
});

const sanitizeFileName = (name = "TEAM") =>
  name
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "_")
    .toUpperCase();

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
  doc.setFontSize(20);
  doc.setTextColor(...COLOR.SECONDARY);

  doc.text("WORLD CUP SERIES 2026", PAGE.M, 18);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...COLOR.PRIMARY);

  doc.text(
    "DOKUMEN RESMI PENDAFTARAN TIM",
    PAGE.M,
    24
  );

  drawLine(doc, 28, COLOR.PRIMARY, 0.8);

  /* RIGHT INFO */
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...COLOR.MUTED);

  doc.text(
    `Tim : ${team.name || "-"}`,
    PAGE.W - PAGE.M,
    15,
    { align: "right" }
  );

  doc.text(
    `Doc ID : ${metaData.doc}`,
    PAGE.W - PAGE.M,
    19,
    { align: "right" }
  );

  doc.text(
    `Verifikasi : ${metaData.verify}`,
    PAGE.W - PAGE.M,
    23,
    { align: "right" }
  );

  /* TITLE */
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...COLOR.SECONDARY);

  doc.text(
    "FORMULIR PENDAFTARAN & VERIFIKASI TIM",
    PAGE.M,
    36
  );

  return 42;
};

/* ===================== INFO BAR ===================== */
const drawInfoBar = (doc, team, y) => {
  const total = team.players?.length || 0;

  doc.setFillColor(...COLOR.LIGHT);
  doc.setDrawColor(...COLOR.BORDER);

  doc.roundedRect(
    PAGE.M,
    y,
    PAGE.W - PAGE.M * 2,
    12,
    1.5,
    1.5,
    "FD"
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...COLOR.TEXT);

  doc.text(
    `TOTAL PEMAIN : ${total}`,
    PAGE.M + 5,
    y + 7
  );

  doc.text(
    "STATUS : VALID",
    PAGE.M + 70,
    y + 7
  );

  doc.text(
    "DOKUMEN : TERVERIFIKASI",
    PAGE.M + 120,
    y + 7
  );

  return y + 18;
};

/* ===================== TEAM INFO ===================== */
const drawTeamInfo = (doc, team, y) => {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...COLOR.SECONDARY);

  doc.text("INFORMASI TIM", PAGE.M, y);

  drawLine(doc, y + 3);

  y += 11;

  const left = [
    ["Nama Tim", team.name],
    ["Manager", team.manager],
    ["WhatsApp", team.phone],
  ];

  const right = [
    ["Official 1", team.official1],
    ["Official 2", team.official2],
    ["Official 3", team.official3],
  ];

  const drawColumn = (data, startX) => {
    data.forEach((item, i) => {
      const rowY = y + i * 8;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);

      doc.text(item[0], startX, rowY);

      doc.setFont("helvetica", "normal");

      doc.text(
        `: ${item[1] || "-"}`,
        startX + 28,
        rowY
      );
    });
  };

  drawColumn(left, PAGE.M);
  drawColumn(right, PAGE.W / 2 + 2);

  return y + 28;
};

/* ===================== PLAYER SECTION ===================== */
const drawPlayers = async (doc, players, yStart) => {
  let y = yStart;

  const boxW = 82;
  const boxH = 38;
  const gapX = 8;

  const leftX = PAGE.M;
  const rightX = PAGE.M + boxW + gapX;

  const positionOrder = {
    Kiper: 1,
    Belakang: 2,
    Tengah: 3,
    Depan: 4,
  };

  const sortedPlayers = [...players].sort(
    (a, b) =>
      (positionOrder[a.position] || 99) -
      (positionOrder[b.position] || 99)
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);

  doc.text(
    "DAFTAR PEMAIN TERDAFTAR",
    PAGE.M,
    y
  );

  drawLine(doc, y + 3);

  y += 8;

  const drawCard = async (p, x, y, no) => {
    if (!p) return;

    /* CARD */
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(215, 215, 215);
    doc.setLineWidth(0.25);

    doc.roundedRect(
      x,
      y,
      boxW,
      boxH,
      1.5,
      1.5,
      "FD"
    );

    /* FOTO */
    if (p.photo) {
      const img = await toBase64(p.photo);

      if (img) {
        doc.addImage(
          img,
          "JPEG",
          x + 3,
          y + 4,
          18,
          22
        );
      }
    }

    /* BADGE NOMOR */
    doc.setFillColor(...COLOR.PRIMARY);

    doc.roundedRect(
      x + 3,
      y + 29,
      18,
      6,
      1,
      1,
      "F"
    );

    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(255);

    doc.text(
      `PLAYER ${no}`,
      x + 12,
      y + 33,
      { align: "center" }
    );

    /* CONTENT */
    const labelX = x + 25;
    const colonX = x + 39;
    const valueX = x + 41;

    doc.setTextColor(...COLOR.TEXT);

    const row = (label, value, rowY) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.2);

      doc.text(label, labelX, rowY);

      doc.setFont("helvetica", "normal");

      doc.text(":", colonX, rowY);

      doc.text(
        String(value || "-"),
        valueX,
        rowY,
        {
          maxWidth: 40,
        }
      );
    };

    row("Nama", p.name, y + 8);
    row("NIK", p.nik, y + 14);
    row("Posisi", p.position, y + 20);

    row(
      "TTL",
      `${p.pob || "-"}, ${p.dob || "-"}`,
      y + 26
    );

    row(
      "Umur",
      `${p.age || "-"} Tahun`,
      y + 32
    );
  };

  for (let i = 0; i < sortedPlayers.length; i += 2) {
    if (y + boxH > 248) {
      doc.addPage();
      y = 20;
    }

    await drawCard(
      sortedPlayers[i],
      leftX,
      y,
      i + 1
    );

    await drawCard(
      sortedPlayers[i + 1],
      rightX,
      y,
      i + 2
    );

    y += boxH + 5;
  }

  return y;
};

/* ===================== SIGNATURE ===================== */
const drawSignature = (doc) => {
  const y = PAGE.H - 42;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...COLOR.SECONDARY);

  /* AREA MANAGER */
  const managerStart = PAGE.M + 10;
  const managerEnd = PAGE.M + 65;
  const managerCenter =
    (managerStart + managerEnd) / 2;

  /* AREA PANITIA */
  const panitiaStart =
    PAGE.W - PAGE.M - 65;

  const panitiaEnd =
    PAGE.W - PAGE.M - 10;

  const panitiaCenter =
    (panitiaStart + panitiaEnd) / 2;

  /* TEXT */
  doc.text(
    "MANAJER TIM",
    managerCenter,
    y,
    { align: "center" }
  );

  doc.text(
    "PANITIA",
    panitiaCenter,
    y,
    { align: "center" }
  );

  /* GARIS */
  doc.setDrawColor(...COLOR.BORDER);

  doc.line(
    managerStart,
    y + 18,
    managerEnd,
    y + 18
  );

  doc.line(
    panitiaStart,
    y + 18,
    panitiaEnd,
    y + 18
  );
};

/* ===================== FOOTER ===================== */
const drawFooter = (doc) => {
  const totalPages =
    doc.internal.getNumberOfPages();

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    doc.setFontSize(7);
    doc.setTextColor(...COLOR.MUTED);

    doc.text(
      `Halaman ${i}/${totalPages}`,
      PAGE.W - PAGE.M,
      PAGE.H - 6,
      { align: "right" }
    );
  }
};

/* ===================== EXPORT ===================== */
export const exportTeamsPDF = async (teams) => {
  const doc = new jsPDF("p", "mm", "a4");

  const list = Array.isArray(teams)
    ? teams
    : [teams];

  for (let i = 0; i < list.length; i++) {
    if (i > 0) doc.addPage();

    const team = list[i];

    const m = meta();

    let y = drawHeader(doc, team, m);

    y = drawInfoBar(doc, team, y);

    y = drawTeamInfo(doc, team, y);

    y = await drawPlayers(
      doc,
      team.players || [],
      y
    );

    drawSignature(doc);
  }

  drawFooter(doc);

  /* ===================== FILE NAME ===================== */

  const isBulk = Array.isArray(teams);

  if (isBulk) {
    doc.save("ALL_TEAM_WCS_2026.pdf");
  } else {
    const teamName = sanitizeFileName(
      teams?.name || "TEAM"
    );

    doc.save(`${teamName}_WCS_2026.pdf`);
  }
};