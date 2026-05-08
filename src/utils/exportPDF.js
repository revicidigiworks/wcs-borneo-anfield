import jsPDF from "jspdf";

/* =========================================================
   PREMIUM FOOTBALL DOSSIER DESIGN SYSTEM
========================================================= */

const COLOR = {
  PRIMARY: [200, 16, 46],
  DARK: [15, 15, 15],
  TEXT: [55, 55, 55],
  MUTED: [130, 130, 130],
  LINE: [228, 228, 228],
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

const sanitizeFileName = (name = "TEAM") =>
  name
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "_")
    .toUpperCase();

const meta = () => ({
  doc: `WCS-${Math.floor(Math.random() * 999999)}`,
  verification: Math.random()
    .toString(36)
    .substring(2, 10)
    .toUpperCase(),
});

const line = (
  doc,
  x1,
  y1,
  x2,
  y2,
  color = COLOR.LINE,
  width = 0.3
) => {
  doc.setDrawColor(...color);
  doc.setLineWidth(width);
  doc.line(x1, y1, x2, y2);
};

const shadowRect = (
  doc,
  x,
  y,
  w,
  h,
  radius = 3
) => {
  doc.setFillColor(235, 235, 235);

  doc.roundedRect(
    x + 1,
    y + 1.2,
    w,
    h,
    radius,
    radius,
    "F"
  );

  doc.setFillColor(...COLOR.WHITE);

  doc.roundedRect(
    x,
    y,
    w,
    h,
    radius,
    radius,
    "F"
  );
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
   WATERMARK
========================================================= */

const drawWatermark = async (doc) => {
  try {
    const logo = await toBase64(
      "/assets/img/logo-wcs.webp"
    );

    if (!logo) return;

    doc.saveGraphicsState();

    doc.setGState(
      new doc.GState({ opacity: 0.05 })
    );

    doc.addImage(
      logo,
      "WEBP",
      45,
      75,
      120,
      120
    );

    doc.restoreGraphicsState();
  } catch {}
};

/* =========================================================
   PREMIUM HEADER
========================================================= */

const drawHeader = async (
  doc,
  team,
  metaData
) => {
  await drawWatermark(doc);

  /* TOP RED BAR */
  doc.setFillColor(...COLOR.PRIMARY);

  doc.rect(0, 0, PAGE.W, 6, "F");

  /* RED DECOR */
  doc.setFillColor(...COLOR.PRIMARY);

  doc.rect(PAGE.W - 50, 20, 50, 2.2, "F");

  doc.rect(PAGE.W - 32, 25, 32, 1.2, "F");

  /* TITLE */
  doc.setTextColor(...COLOR.DARK);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);

  doc.text(
    "TOURNAMENT",
    PAGE.M,
    28
  );

  doc.text(
    "REGISTRATION",
    PAGE.M,
    38
  );

  doc.text(
    "DOSSIER",
    PAGE.M,
    48
  );

  /* SUBTEXT */
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);

  doc.setTextColor(...COLOR.MUTED);

  doc.text(
    "OFFICIAL FOOTBALL TEAM ACCREDITATION DOCUMENT",
    PAGE.M,
    56
  );

  /* LOGO */
  try {
    const logo = await toBase64(
      "/assets/img/logo-wcs.webp"
    );

    if (logo) {
      doc.addImage(
        logo,
        "WEBP",
        PAGE.W - 48,
        18,
        28,
        28
      );
    }
  } catch {}

  /* FLOATING META CARD */
  shadowRect(
    doc,
    PAGE.W - 78,
    58,
    64,
    34,
    4
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);

  doc.setTextColor(...COLOR.MUTED);

  doc.text(
    "DOCUMENT ID",
    PAGE.W - 72,
    67
  );

  doc.text(
    "VERIFICATION",
    PAGE.W - 72,
    78
  );

  doc.text(
    "TEAM STATUS",
    PAGE.W - 72,
    89
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);

  doc.setTextColor(...COLOR.DARK);

  doc.text(
    metaData.doc,
    PAGE.W - 72,
    72
  );

  doc.text(
    metaData.verification,
    PAGE.W - 72,
    83
  );

  doc.setTextColor(...COLOR.PRIMARY);

  doc.text(
    "APPROVED",
    PAGE.W - 72,
    94
  );

  return 104;
};

/* =========================================================
   TEAM INFO SECTION
========================================================= */

const drawTeamInfo = (
  doc,
  team,
  y
) => {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);

  doc.setTextColor(...COLOR.PRIMARY);

  doc.text(
    "TEAM INFORMATION",
    PAGE.M,
    y
  );

  line(
    doc,
    PAGE.M,
    y + 4,
    PAGE.W - PAGE.M,
    y + 4
  );

  y += 14;

  shadowRect(
    doc,
    PAGE.M,
    y,
    PAGE.W - PAGE.M * 2,
    34,
    4
  );

  const leftX = PAGE.M + 8;
  const rightX = PAGE.W / 2 + 5;

  const row = (
    label,
    value,
    x,
    yy
  ) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);

    doc.setTextColor(...COLOR.MUTED);

    doc.text(
      label.toUpperCase(),
      x,
      yy
    );

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);

    doc.setTextColor(...COLOR.DARK);

    doc.text(
      value || "-",
      x,
      yy + 6
    );
  };

  row(
    "Team Name",
    team.name,
    leftX,
    y + 10
  );

  row(
    "Manager",
    team.manager,
    leftX,
    y + 24
  );

  row(
    "WhatsApp",
    team.phone,
    rightX,
    y + 10
  );

  row(
    "Total Players",
    `${team.players?.length || 0} Players`,
    rightX,
    y + 24
  );

  return y + 48;
};

/* =========================================================
   POSITION BADGE
========================================================= */

const badgeColor = (position) => {
  switch (position) {
    case "Kiper":
      return [30, 30, 30];

    case "Belakang":
      return [38, 70, 140];

    case "Tengah":
      return [140, 90, 10];

    default:
      return COLOR.PRIMARY;
  }
};

/* =========================================================
   PLAYER CARD
========================================================= */

const drawPlayerCard = async (
  doc,
  player,
  x,
  y,
  no
) => {
  const W = 84;
  const H = 42;

  shadowRect(doc, x, y, W, H, 4);

  /* LARGE TRANSPARENT NUMBER */
  doc.setFont("helvetica", "bold");
  doc.setFontSize(42);

  doc.setTextColor(242, 242, 242);

  doc.text(
    String(no).padStart(2, "0"),
    x + 64,
    y + 33
  );

  /* PHOTO */
  if (player.photo) {
    try {
      const img = await toBase64(
        player.photo
      );

      if (img) {
        doc.addImage(
          img,
          "JPEG",
          x + 5,
          y + 5,
          20,
          24
        );
      }
    } catch {}
  }

  /* RED SIDE ACCENT */
  doc.setFillColor(...COLOR.PRIMARY);

  doc.rect(x, y, 3, H, "F");

  /* NAME */
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);

  doc.setTextColor(...COLOR.DARK);

  doc.text(
    player.name || "-",
    x + 30,
    y + 10,
    {
      maxWidth: 44,
    }
  );

  /* POSITION BADGE */
  const badge = badgeColor(
    player.position
  );

  doc.setFillColor(...badge);

  doc.roundedRect(
    x + 30,
    y + 14,
    22,
    6,
    2,
    2,
    "F"
  );

  doc.setFontSize(6.5);

  doc.setTextColor(255);

  doc.text(
    (
      player.position || "-"
    ).toUpperCase(),
    x + 41,
    y + 18,
    {
      align: "center",
    }
  );

  /* DIVIDER */
  line(
    doc,
    x + 30,
    y + 24,
    x + 76,
    y + 24
  );

  /* INFO */
  const info = (
    label,
    value,
    yy
  ) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6);

    doc.setTextColor(...COLOR.MUTED);

    doc.text(
      label.toUpperCase(),
      x + 30,
      yy
    );

    doc.setFont("helvetica", "normal");

    doc.setTextColor(...COLOR.TEXT);

    doc.text(
      value || "-",
      x + 48,
      yy,
      {
        maxWidth: 28,
      }
    );
  };

  info("NIK", player.nik, y + 30);

  info(
    "TTL",
    `${player.pob || "-"}, ${
      player.dob || "-"
    }`,
    y + 35
  );

  info(
    "AGE",
    `${player.age || "-"} YEARS`,
    y + 40
  );
};

/* =========================================================
   PLAYER SECTION
========================================================= */

const drawPlayers = async (
  doc,
  players,
  yStart
) => {
  let y = yStart;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);

  doc.setTextColor(...COLOR.PRIMARY);

  doc.text(
    "REGISTERED PLAYERS",
    PAGE.M,
    y
  );

  line(
    doc,
    PAGE.M,
    y + 4,
    PAGE.W - PAGE.M,
    y + 4
  );

  y += 10;

  const cardW = 84;
  const cardH = 42;
  const gapX = 10;
  const gapY = 8;

  const leftX = PAGE.M;
  const rightX =
    PAGE.M + cardW + gapX;

  for (
    let i = 0;
    i < players.length;
    i += 2
  ) {
    if (y + cardH > 245) {
      doc.addPage();

      await drawWatermark(doc);

      y = 24;
    }

    await drawPlayerCard(
      doc,
      players[i],
      leftX,
      y,
      i + 1
    );

    if (players[i + 1]) {
      await drawPlayerCard(
        doc,
        players[i + 1],
        rightX,
        y,
        i + 2
      );
    }

    y += cardH + gapY;
  }

  return y;
};

/* =========================================================
   SIGNATURE AREA
========================================================= */

const drawSignature = (
  doc,
  team
) => {
  const y = PAGE.H - 42;

  line(
    doc,
    PAGE.M,
    y - 8,
    PAGE.W - PAGE.M,
    y - 8
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);

  doc.setTextColor(...COLOR.DARK);

  doc.text(
    "TEAM MANAGER",
    42,
    y
  );

  doc.text(
    "TOURNAMENT OFFICIAL",
    PAGE.W - 70,
    y
  );

  line(
    doc,
    28,
    y + 22,
    72,
    y + 22
  );

  line(
    doc,
    PAGE.W - 84,
    y + 22,
    PAGE.W - 40,
    y + 22
  );

  doc.setFontSize(8);

  doc.setTextColor(...COLOR.MUTED);

  doc.text(
    team.manager || "-",
    50,
    y + 27,
    {
      align: "center",
    }
  );
};

/* =========================================================
   FOOTER
========================================================= */

const drawFooter = (doc) => {
  const totalPages =
    doc.internal.getNumberOfPages();

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    line(
      doc,
      PAGE.M,
      PAGE.H - 12,
      PAGE.W - PAGE.M,
      PAGE.H - 12
    );

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);

    doc.setTextColor(...COLOR.MUTED);

    doc.text(
      "WORLD CUP SERIES 2026 • OFFICIAL REGISTRATION DOSSIER",
      PAGE.M,
      PAGE.H - 6
    );

    doc.text(
      `${i}/${totalPages}`,
      PAGE.W - PAGE.M,
      PAGE.H - 6,
      {
        align: "right",
      }
    );
  }
};

/* =========================================================
   EXPORT
========================================================= */

export const exportTeamsPDF = async (
  teams
) => {
  const doc = new jsPDF(
    "p",
    "mm",
    "a4"
  );

  const list = Array.isArray(teams)
    ? teams
    : [teams];

  for (let i = 0; i < list.length; i++) {
    if (i > 0) doc.addPage();

    const team = list[i];

    const m = meta();

    let y = await drawHeader(
      doc,
      team,
      m
    );

    y = drawTeamInfo(doc, team, y);

    y = await drawPlayers(
      doc,
      team.players || [],
      y
    );

    drawSignature(doc, team);
  }

  drawFooter(doc);

  /* FILE NAME */
  const isBulk = Array.isArray(teams);

  if (isBulk) {
    doc.save(
      "ALL_TEAM_WCS_2026.pdf"
    );
  } else {
    const teamName =
      sanitizeFileName(
        teams?.name || "TEAM"
      );

    doc.save(
      `${teamName}_WCS_2026.pdf`
    );
  }
};