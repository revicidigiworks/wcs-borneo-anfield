import jsPDF from "jspdf";
import logoWCS from "../assets/img/logo-wcs.webp";

/* =====================================================
   PREMIUM WORLD CUP SERIES PDF EXPORT
   CLEAN • MODERN • PREMIUM • 16 PLAYERS READY
===================================================== */

const COLOR = {
  GOLD: [212, 175, 55],
  NAVY: [8, 20, 46],
  DARK: [25, 25, 25],
  TEXT: [55, 55, 55],
  MUTED: [120, 120, 120],
  BORDER: [228, 228, 228],
  LIGHT: [248, 248, 248],
  WHITE: [255, 255, 255],
};

const PAGE = {
  W: 210,
  H: 297,
  M: 12,
};

/* =====================================================
   HELPERS
===================================================== */

const line = (
  doc,
  x1,
  y1,
  x2,
  y2,
  color = COLOR.BORDER,
  width = 0.3
) => {
  doc.setDrawColor(...color);
  doc.setLineWidth(width);
  doc.line(x1, y1, x2, y2);
};

const box = (
  doc,
  x,
  y,
  w,
  h,
  fill = COLOR.WHITE,
  border = COLOR.BORDER
) => {
  doc.setFillColor(...fill);
  doc.setDrawColor(...border);

  doc.roundedRect(x, y, w, h, 2, 2, "FD");
};

const text = (
  doc,
  value,
  x,
  y,
  size = 10,
  style = "normal",
  color = COLOR.TEXT,
  align = "left"
) => {
  doc.setFont("helvetica", style);
  doc.setFontSize(size);
  doc.setTextColor(...color);

  doc.text(String(value || "-"), x, y, {
    align,
  });
};

const meta = () => ({
  docId: `WCS-2026-${Math.floor(
    100000 + Math.random() * 900000
  )}`,

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

/* =====================================================
   IMAGE
===================================================== */

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

/* =====================================================
   HEADER PREMIUM
===================================================== */

const drawHeader = async (doc, team, m) => {
  /* TOP ACCENT */
  doc.setFillColor(...COLOR.NAVY);
  doc.rect(0, 0, PAGE.W, 7, "F");

  /* TITLE */
  text(
    doc,
    "WORLD CUP",
    PAGE.M,
    20,
    24,
    "bold",
    COLOR.DARK
  );

  text(
    doc,
    "SERIES 2026",
    PAGE.M,
    31,
    24,
    "bold",
    COLOR.GOLD
  );

  text(
    doc,
    "DOKUMEN RESMI PENDAFTARAN TIM",
    PAGE.M,
    39,
    10,
    "normal",
    COLOR.MUTED
  );

  /* RIGHT INFO */
  box(doc, 138, 14, 60, 25, COLOR.LIGHT);

  text(
    doc,
    `Tim : ${team.name || "-"}`,
    143,
    22,
    8,
    "normal"
  );

  text(
    doc,
    `Doc ID : ${m.docId}`,
    143,
    28,
    8,
    "normal"
  );

  text(
    doc,
    `Verifikasi : ${m.verify}`,
    143,
    34,
    8,
    "normal"
  );

  /* GOLD LINE */
  doc.setDrawColor(...COLOR.GOLD);
  doc.setLineWidth(0.8);
  doc.line(PAGE.M, 46, PAGE.W - PAGE.M, 46);

    /* LOGO WCS */
  const logo = await toBase64(logoWCS);

  if (logo) {
    doc.addImage(
      logo,
      "WEBP",
      PAGE.W - 48,
      12,
      24,
      24
    );
  }

  return 55;
};

/* =====================================================
   STATUS BAR
===================================================== */

const drawStatusBar = (doc, total, y) => {
  box(
    doc,
    PAGE.M,
    y,
    PAGE.W - PAGE.M * 2,
    18,
    COLOR.NAVY,
    COLOR.NAVY
  );

  const itemW = (PAGE.W - PAGE.M * 2) / 3;

  line(doc, PAGE.M + itemW, y + 3, PAGE.M + itemW, y + 15, [60, 60, 60]);

  line(doc, PAGE.M + itemW * 2, y + 3, PAGE.M + itemW * 2, y + 15, [60, 60, 60]);

  text(doc, "TOTAL PEMAIN", PAGE.M + 10, y + 7, 8, "normal", COLOR.WHITE);

  text(doc, total, PAGE.M + 10, y + 14, 16, "bold", COLOR.GOLD);

  text(doc, "STATUS", PAGE.M + itemW + 10, y + 7, 8, "normal", COLOR.WHITE);

  text(doc, "VALID", PAGE.M + itemW + 10, y + 14, 16, "bold", COLOR.GOLD);

  text(doc, "DOKUMEN", PAGE.M + itemW * 2 + 10, y + 7, 8, "normal", COLOR.WHITE);

  text(doc, "TERVERIFIKASI", PAGE.M + itemW * 2 + 10, y + 14, 14, "bold", COLOR.GOLD);

  return y + 26;
};

/* =====================================================
   TEAM INFO
===================================================== */

const drawTeamInfo = (doc, team, y) => {
  text(doc, "INFORMASI TIM", PAGE.M, y, 12, "bold", COLOR.DARK);

  doc.setFillColor(...COLOR.GOLD);
  doc.rect(PAGE.M, y + 3, 1.5, 8, "F");

  y += 10;

  box(doc, PAGE.M, y, PAGE.W - PAGE.M * 2, 38);

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
      const yy = y + 10 + i * 10;

      text(doc, item[0], startX, yy, 8, "bold", COLOR.MUTED);

      text(doc, item[1] || "-", startX, yy + 5, 10, "normal", COLOR.DARK);
    });
  };

  drawColumn(left, PAGE.M + 10);
  drawColumn(right, PAGE.W / 2 + 10);

  return y + 50;
};

/* =====================================================
   PLAYER CARD
===================================================== */

const drawPlayerCard = async (
  doc,
  player,
  x,
  y,
  no
) => {
  const cardW = 43;
  const cardH = 52;

  box(doc, x, y, cardW, cardH);

  /* NUMBER */
  doc.setFillColor(...COLOR.GOLD);

  doc.roundedRect(x + 2, y + 2, 5, 5, 1, 1, "F");

  text(doc, no, x + 4.5, y + 5.5, 7, "bold", COLOR.WHITE, "center");

  /* PHOTO */
  if (player.photo) {
    const img = await toBase64(player.photo);

    if (img) {
      doc.addImage(img, "JPEG", x + 2, y + 7, 14, 18);
    }
  }

  /* NAME */
  text(
    doc,
    player.name || "-",
    x + 18,
    y + 11,
    7.5,
    "bold",
    COLOR.DARK
  );

  text(
    doc,
    player.position || "-",
    x + 18,
    y + 17,
    7,
    "bold",
    COLOR.GOLD
  );

  /* DETAIL */
  text(doc, player.nik || "-", x + 18, y + 24, 5.8);

  text(
    doc,
    `${player.pob || "-"}, ${player.dob || "-"}`,
    x + 18,
    y + 30,
    5.6
  );

  text(
    doc,
    `${player.age || "-"} Tahun`,
    x + 18,
    y + 36,
    5.8
  );

  /* BOTTOM */
  doc.setFillColor(...COLOR.NAVY);

  doc.roundedRect(x + 2, y + 44, cardW - 4, 6, 1, 1, "F");

  text(
    doc,
    `PLAYER ${no}`,
    x + cardW / 2,
    y + 48,
    7,
    "bold",
    COLOR.WHITE,
    "center"
  );
};

/* =====================================================
   PLAYER PAGE
===================================================== */

const drawPlayersPage = async (
  doc,
  players
) => {
  doc.addPage();

  text(
    doc,
    "DAFTAR 16 PEMAIN",
    PAGE.M,
    22,
    14,
    "bold",
    COLOR.DARK
  );

  doc.setFillColor(...COLOR.GOLD);
  doc.rect(PAGE.M, 25, 1.5, 9, "F");

  let x = PAGE.M;
  let y = 30;

  const cols = 4;
  const gap = 4;

  const cardW = 43;
  const cardH = 52;

  for (let i = 0; i < players.length; i++) {
    await drawPlayerCard(
      doc,
      players[i],
      x,
      y,
      i + 1
    );

    x += cardW + gap;

    if ((i + 1) % cols === 0) {
      x = PAGE.M;
      y += cardH + 5;
    }
  }
};

/* =====================================================
   SIGNATURE
===================================================== */

const drawSignature = (doc, team) => {
  const y = 245;

  box(doc, PAGE.M, y, PAGE.W - PAGE.M * 2, 34, [252, 252, 252]);

  /* LEFT */
  text(doc, "MANAJER TIM", 50, y + 10, 9, "bold", COLOR.DARK, "center");

  text(
    doc,
    team.manager || "-",
    50,
    y + 17,
    9,
    "normal",
    COLOR.TEXT,
    "center"
  );

  line(doc, 28, y + 26, 72, y + 26, COLOR.GOLD, 0.6);

  /* CENTER */
  text(doc, "WORLD CUP SERIES", 105, y + 14, 11, "bold", COLOR.GOLD, "center");

  /* RIGHT */
  text(doc, "PANITIA", 160, y + 10, 9, "bold", COLOR.DARK, "center");

  text(doc, "DENY KUNCORO", 160, y + 17, 9, "normal", COLOR.TEXT, "center");

  line(doc, 138, y + 26, 182, y + 26, COLOR.GOLD, 0.6);
};

/* =====================================================
   FOOTER
===================================================== */

const drawFooter = (doc) => {
  const pages = doc.internal.getNumberOfPages();

  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);

    /* BOTTOM BAR */
    doc.setFillColor(...COLOR.NAVY);
    doc.rect(0, PAGE.H - 12, PAGE.W, 12, "F");

    text(
      doc,
      "WORLD CUP SERIES 2026",
      PAGE.M,
      PAGE.H - 4,
      8,
      "normal",
      COLOR.GOLD
    );

    text(
      doc,
      `Halaman ${i}/${pages}`,
      PAGE.W - PAGE.M,
      PAGE.H - 4,
      8,
      "normal",
      COLOR.WHITE,
      "right"
    );
  }
};

/* =====================================================
   EXPORT PDF
===================================================== */

export const exportTeamsPDF = async (teams) => {
  const doc = new jsPDF("p", "mm", "a4");

  const teamList = Array.isArray(teams)
    ? teams
    : [teams];

  for (let i = 0; i < teamList.length; i++) {
    if (i > 0) doc.addPage();

    const team = teamList[i];

    const m = meta();

    let y = await drawHeader(doc, team, m);

    y = drawStatusBar(
      doc,
      team.players?.length || 0,
      y
    );

    y = drawTeamInfo(doc, team, y);

    /* PREVIEW 4 PLAYER DI HALAMAN 1 */

    text(
      doc,
      "PREVIEW PEMAIN",
      PAGE.M,
      y,
      12,
      "bold",
      COLOR.DARK
    );

    doc.setFillColor(...COLOR.GOLD);
    doc.rect(PAGE.M, y + 3, 1.5, 8, "F");

    y += 10;

    const previewPlayers = (
      team.players || []
    ).slice(0, 4);

    let startX = PAGE.M;

    for (let p = 0; p < previewPlayers.length; p++) {
      await drawPlayerCard(
        doc,
        previewPlayers[p],
        startX,
        y,
        p + 1
      );

      startX += 47;
    }

    drawSignature(doc, team);

    /* PAGE 2 = FULL 16 PLAYER */
    await drawPlayersPage(
      doc,
      team.players || []
    );
  }

  drawFooter(doc);

  /* SAVE */
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