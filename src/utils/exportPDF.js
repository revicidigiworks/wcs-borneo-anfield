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

  const boxW = 86;
  const boxH = 34; // sebelumnya 48
  const gapX = 10;

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

  y += 9;

  const drawCard = async (p, x, y, no) => {
    if (!p) return;

    /* CARD */
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...COLOR.BORDER);

    doc.roundedRect(
      x,
      y,
      boxW,
      boxH,
      2,
      2,
      "FD"
    );

    /* PHOTO */
    if (p.photo) {
      const img = await toBase64(p.photo);

      if (img) {
        doc.addImage(
          img,
          "JPEG",
          x + 3,
          y + 4,
          16,
          20
        );
      }
    }

    /* NUMBER BADGE */
    doc.setFillColor(...COLOR.PRIMARY);

    doc.roundedRect(
      x + 3,
      y + 26,
      16,
      5,
      1,
      1,
      "F"
    );

    doc.setFont("helvetica", "bold");
    doc.setFontSize(6);
    doc.setTextColor(255);

    doc.text(
      `#${no}`,
      x + 11,
      y + 29.5,
      { align: "center" }
    );

    /* CONTENT */
    const startX = x + 23;

    const row = (label, value, rowY) => {
      doc.setTextColor(...COLOR.TEXT);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.8);

      doc.text(`${label}:`, startX, rowY);

      doc.setFont("helvetica", "normal");

      doc.text(
        String(value || "-"),
        startX + 14,
        rowY,
        {
          maxWidth: 45,
        }
      );
    };

    row("Nama", p.name, y + 8);
    row("NIK", p.nik, y + 13);
    row("Posisi", p.position, y + 18);

    row(
      "TTL",
      `${p.pob || "-"}, ${p.dob || "-"}`,
      y + 23
    );

    row(
      "Umur",
      `${p.age || "-"} Th`,
      y + 28
    );
  };

  for (let i = 0; i < sortedPlayers.length; i += 2) {
    if (y + boxH > 250) {
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

  doc.text(
    "MANAJER TIM",
    PAGE.M + 28,
    y
  );

  doc.text(
    "PANITIA",
    PAGE.W - PAGE.M - 32,
    y
  );

  doc.setDrawColor(...COLOR.BORDER);

  doc.line(
    PAGE.M + 5,
    y + 18,
    PAGE.M + 60,
    y + 18
  );

  doc.line(
    PAGE.W - PAGE.M - 60,
    y + 18,
    PAGE.W - PAGE.M - 5,
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