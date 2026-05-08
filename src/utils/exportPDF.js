import jsPDF from "jspdf";

/* =========================================================
   FIFA OFFICIAL PREMIUM PDF STYLE
   CLEAN • MODERN • COMPACT • 16 PLAYERS READY
========================================================= */

const COLOR = {
  PRIMARY: [145, 18, 40],
  DARK: [18, 18, 18],
  TEXT: [45, 45, 45],
  MUTED: [120, 120, 120],
  BORDER: [228, 228, 228],
  SOFT: [248, 248, 248],
  WHITE: [255, 255, 255],
};

const PAGE = {
  W: 210,
  H: 297,
  M: 14,
};

/* =========================================================
   HELPERS
========================================================= */

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

const line = (
  doc,
  y,
  width = 0.25,
  color = COLOR.BORDER
) => {
  doc.setDrawColor(...color);
  doc.setLineWidth(width);

  doc.line(PAGE.M, y, PAGE.W - PAGE.M, y);
};

const toBase64 = async (url) => {
  try {
    const res = await fetch(url);
    const blob = await res.blob();

    return await new Promise((resolve) => {
      const reader = new FileReader();

      reader.onloadend = () =>
        resolve(reader.result);

      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
};

/* =========================================================
   HEADER
========================================================= */

const drawHeader = (doc, team, m) => {
  /* TOP BAR */
  doc.setFillColor(...COLOR.PRIMARY);

  doc.rect(0, 0, PAGE.W, 8, "F");

  /* TITLE */
  doc.setFont("helvetica", "bold");
  doc.setFontSize(21);
  doc.setTextColor(...COLOR.DARK);

  doc.text(
    "WORLD CUP SERIES 2026",
    PAGE.M,
    20
  );

  /* SUBTITLE */
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...COLOR.MUTED);

  doc.text(
    "OFFICIAL TEAM REGISTRATION DOCUMENT",
    PAGE.M,
    25
  );

  /* META CARD */
  doc.setFillColor(...COLOR.SOFT);

  doc.roundedRect(
    PAGE.W - 70,
    12,
    56,
    18,
    2,
    2,
    "F"
  );

  doc.setFontSize(6.8);
  doc.setTextColor(...COLOR.TEXT);

  doc.text(
    `TEAM : ${team.name || "-"}`,
    PAGE.W - 66,
    18
  );

  doc.text(
    `DOC ID : ${m.doc}`,
    PAGE.W - 66,
    22
  );

  doc.text(
    `VERIFY : ${m.verify}`,
    PAGE.W - 66,
    26
  );

  line(doc, 34, 0.4, COLOR.PRIMARY);

  return 42;
};

/* =========================================================
   TEAM INFO
========================================================= */

const drawTeamInfo = (doc, team, y) => {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...COLOR.DARK);

  doc.text("TEAM INFORMATION", PAGE.M, y);

  y += 5;

  doc.setFillColor(...COLOR.SOFT);

  doc.roundedRect(
    PAGE.M,
    y,
    PAGE.W - PAGE.M * 2,
    26,
    2,
    2,
    "F"
  );

  const left = [
    ["Team", team.name],
    ["Manager", team.manager],
    ["Phone", team.phone],
  ];

  const right = [
    ["Official 1", team.official1],
    ["Official 2", team.official2],
    ["Official 3", team.official3],
  ];

  const drawColumn = (data, x) => {
    data.forEach((item, i) => {
      const rowY = y + 7 + i * 6.5;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);

      doc.setTextColor(...COLOR.MUTED);

      doc.text(item[0].toUpperCase(), x, rowY);

      doc.setFont("helvetica", "normal");

      doc.setTextColor(...COLOR.TEXT);

      doc.text(
        String(item[1] || "-"),
        x + 26,
        rowY
      );
    });
  };

  drawColumn(left, PAGE.M + 5);
  drawColumn(right, PAGE.W / 2 + 5);

  return y + 36;
};

/* =========================================================
   PLAYER CARD
========================================================= */

const drawPlayers = async (
  doc,
  players,
  startY
) => {
  let y = startY;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...COLOR.DARK);

  doc.text(
    "REGISTERED PLAYERS",
    PAGE.M,
    y
  );

  y += 6;

  const cardW = 88;
  const cardH = 30;

  const leftX = PAGE.M;
  const rightX = PAGE.M + cardW + 6;

  const sorted = [...players];

  const drawCard = async (
    player,
    x,
    y,
    no
  ) => {
    if (!player) return;

    /* CARD */
    doc.setFillColor(...COLOR.WHITE);
    doc.setDrawColor(...COLOR.BORDER);
    doc.setLineWidth(0.15);

    doc.roundedRect(
      x,
      y,
      cardW,
      cardH,
      2,
      2,
      "FD"
    );

    /* RED SIDE */
    doc.setFillColor(...COLOR.PRIMARY);

    doc.roundedRect(
      x,
      y,
      6,
      cardH,
      2,
      2,
      "F"
    );

    /* PHOTO */
    if (player.photo) {
      const img = await toBase64(player.photo);

      if (img) {
        doc.addImage(
          img,
          "JPEG",
          x + 10,
          y + 4,
          18,
          22
        );
      }
    }

    /* PLAYER NAME */
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...COLOR.DARK);

    doc.text(
      String(player.name || "-")
        .toUpperCase()
        .slice(0, 24),
      x + 32,
      y + 9
    );

    /* POSITION BADGE */
    doc.setFillColor(...COLOR.SOFT);

    doc.roundedRect(
      x + 32,
      y + 12,
      18,
      5,
      1,
      1,
      "F"
    );

    doc.setFontSize(6.5);
    doc.setTextColor(...COLOR.PRIMARY);

    doc.text(
      String(player.position || "-")
        .toUpperCase(),
      x + 41,
      y + 15.3,
      {
        align: "center",
      }
    );

    /* INFO */
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.8);
    doc.setTextColor(...COLOR.TEXT);

    doc.text(
      `NIK : ${player.nik || "-"}`,
      x + 32,
      y + 21
    );

    doc.text(
      `AGE : ${player.age || "-"}`,
      x + 32,
      y + 25
    );

    /* NUMBER */
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(235, 235, 235);

    doc.text(
      String(no).padStart(2, "0"),
      x + 77,
      y + 24
    );
  };

  for (let i = 0; i < sorted.length; i += 2) {
    if (y + cardH > 248) {
      doc.addPage();

      drawPageDecoration(doc);

      y = 24;
    }

    await drawCard(
      sorted[i],
      leftX,
      y,
      i + 1
    );

    await drawCard(
      sorted[i + 1],
      rightX,
      y,
      i + 2
    );

    y += cardH + 5;
  }

  return y;
};

/* =========================================================
   SIGNATURE
========================================================= */

const drawSignature = (doc) => {
  const y = PAGE.H - 38;

  const leftStart = PAGE.M + 10;
  const leftEnd = PAGE.M + 65;

  const rightStart =
    PAGE.W - PAGE.M - 65;

  const rightEnd =
    PAGE.W - PAGE.M - 10;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...COLOR.DARK);

  doc.text(
    "TEAM MANAGER",
    (leftStart + leftEnd) / 2,
    y,
    { align: "center" }
  );

  doc.text(
    "ORGANIZER",
    (rightStart + rightEnd) / 2,
    y,
    { align: "center" }
  );

  doc.setDrawColor(...COLOR.BORDER);

  doc.line(
    leftStart,
    y + 18,
    leftEnd,
    y + 18
  );

  doc.line(
    rightStart,
    y + 18,
    rightEnd,
    y + 18
  );
};

/* =========================================================
   FOOTER
========================================================= */

const drawFooter = (doc) => {
  const total =
    doc.internal.getNumberOfPages();

  for (let i = 1; i <= total; i++) {
    doc.setPage(i);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(...COLOR.MUTED);

    line(doc, PAGE.H - 10);

    doc.text(
      `WORLD CUP SERIES 2026 • PAGE ${i}/${total}`,
      PAGE.W - PAGE.M,
      PAGE.H - 5,
      {
        align: "right",
      }
    );
  }
};

/* =========================================================
   PAGE DECORATION
========================================================= */

const drawPageDecoration = (doc) => {
  doc.setFillColor(...COLOR.PRIMARY);

  doc.rect(0, 0, PAGE.W, 6, "F");
};

/* =========================================================
   EXPORT
========================================================= */

export const exportTeamsPDF = async (
  teams
) => {
  const doc = new jsPDF("p", "mm", "a4");

  const list = Array.isArray(teams)
    ? teams
    : [teams];

  for (let i = 0; i < list.length; i++) {
    if (i > 0) doc.addPage();

    drawPageDecoration(doc);

    const team = list[i];

    const m = meta();

    let y = drawHeader(doc, team, m);

    y = drawTeamInfo(doc, team, y);

    y = await drawPlayers(
      doc,
      team.players || [],
      y
    );

    drawSignature(doc);
  }

  drawFooter(doc);

  const isBulk = Array.isArray(teams);

  if (isBulk) {
    doc.save("ALL_TEAM_WCS_2026.pdf");
  } else {
    const teamName = sanitizeFileName(
      teams?.name || "TEAM"
    );

    doc.save(
      `${teamName}_WCS_2026.pdf`
    );
  }
};