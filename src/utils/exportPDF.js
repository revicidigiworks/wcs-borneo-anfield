import jsPDF from "jspdf";

/* =========================================================
   WORLD CUP SERIES 2026
   PREMIUM OFFICIAL PDF
   CLEAN • MODERN • SPORTY • LIVERPOOL VIBES
========================================================= */

const COLOR = {
  PRIMARY: [200, 16, 46],
  PRIMARY_SOFT: [255, 236, 240],

  DARK: [15, 15, 15],
  TEXT: [45, 45, 45],
  MUTED: [115, 115, 115],

  BORDER: [232, 232, 232],
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
  doc: `WCS-${Math.floor(
    Math.random() * 999999
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

const line = (
  doc,
  y,
  color = COLOR.BORDER,
  width = 0.2
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
   PAGE DECORATION
========================================================= */

const drawDecoration = (doc) => {
  /* TOP RED BAR */
  doc.setFillColor(...COLOR.PRIMARY);

  doc.rect(0, 0, PAGE.W, 7, "F");

  /* RIGHT ACCENT */
  doc.setFillColor(...COLOR.PRIMARY_SOFT);

  doc.triangle(
    PAGE.W,
    0,
    PAGE.W,
    40,
    PAGE.W - 45,
    0,
    "F"
  );
};

/* =========================================================
   WATERMARK
========================================================= */

const drawWatermark = async (doc) => {
  try {
    const img = await toBase64(
      "/assets/img/logo-wcs.webp"
    );

    if (!img) return;

    doc.saveGraphicsState();

    doc.setGState(
      new doc.GState({
        opacity: 0.04,
      })
    );

    doc.addImage(
      img,
      "WEBP",
      55,
      90,
      100,
      100
    );

    doc.restoreGraphicsState();
  } catch {}
};

/* =========================================================
   HEADER
========================================================= */

const drawHeader = async (
  doc,
  team,
  m
) => {
  /* TITLE */
  doc.setFont("helvetica", "bold");
  doc.setFontSize(23);

  doc.setTextColor(...COLOR.DARK);

  doc.text(
    "PIALA DUNIA SERIES 2026",
    PAGE.M,
    22
  );

  /* SUBTITLE */
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);

  doc.setTextColor(...COLOR.MUTED);

  doc.text(
    "Dokumen Resmi Pendaftaran Tim",
    PAGE.M,
    28
  );

  doc.text(
    "Verifikasi & Akreditasi Turnamen",
    PAGE.M,
    33
  );

  /* RED LINE */
  doc.setDrawColor(...COLOR.PRIMARY);

  doc.setLineWidth(0.8);

  doc.line(PAGE.M, 38, 92, 38);

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
        13,
        28,
        28
      );
    }
  } catch {}

  /* META CARD */
  doc.setFillColor(...COLOR.WHITE);

  doc.setDrawColor(...COLOR.BORDER);

  doc.roundedRect(
    PAGE.M,
    46,
    82,
    20,
    2,
    2,
    "FD"
  );

  /* SMALL RED ACCENT */
  doc.setFillColor(...COLOR.PRIMARY);

  doc.roundedRect(
    PAGE.M,
    46,
    4,
    20,
    2,
    2,
    "F"
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);

  doc.setTextColor(...COLOR.MUTED);

  doc.text(
    "NAMA TIM",
    PAGE.M + 8,
    53
  );

  doc.text(
    "ID DOKUMEN",
    PAGE.M + 8,
    59
  );

  doc.text(
    "VERIFIKASI",
    PAGE.M + 8,
    65
  );

  doc.setFont("helvetica", "normal");

  doc.setTextColor(...COLOR.TEXT);

  doc.text(
    String(team.name || "-"),
    PAGE.M + 34,
    53
  );

  doc.text(
    String(m.doc),
    PAGE.M + 34,
    59
  );

  doc.text(
    String(m.verify),
    PAGE.M + 34,
    65
  );

  return 78;
};

/* =========================================================
   TEAM INFO
========================================================= */

const drawTeamInfo = (doc, team, y) => {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);

  doc.setTextColor(...COLOR.DARK);

  doc.text(
    "INFORMASI TIM",
    PAGE.M,
    y
  );

  y += 6;

  /* BACKGROUND */
  doc.setFillColor(...COLOR.SOFT);

  doc.roundedRect(
    PAGE.M,
    y,
    PAGE.W - PAGE.M * 2,
    30,
    2,
    2,
    "F"
  );

  const left = [
    ["Manager", team.manager],
    ["WhatsApp", team.phone],
    ["Total Pemain", team.players?.length],
  ];

  const right = [
    ["Official 1", team.official1],
    ["Official 2", team.official2],
    ["Official 3", team.official3],
  ];

  const drawColumn = (data, x) => {
    data.forEach((item, i) => {
      const yy = y + 8 + i * 7;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.5);

      doc.setTextColor(...COLOR.MUTED);

      doc.text(
        item[0].toUpperCase(),
        x,
        yy
      );

      doc.setFont("helvetica", "normal");

      doc.setTextColor(...COLOR.TEXT);

      doc.text(
        String(item[1] || "-"),
        x + 28,
        yy
      );
    });
  };

  drawColumn(left, PAGE.M + 6);
  drawColumn(right, PAGE.W / 2 + 6);

  return y + 40;
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
    "DAFTAR PEMAIN",
    PAGE.M,
    y
  );

  y += 8;

  const cardW = 88;
  const cardH = 34;

  const leftX = PAGE.M;
  const rightX = PAGE.M + cardW + 6;

  const drawCard = async (
    p,
    x,
    y,
    no
  ) => {
    if (!p) return;

    /* FAKE SHADOW */
    doc.setFillColor(240, 240, 240);

    doc.roundedRect(
      x + 1,
      y + 1,
      cardW,
      cardH,
      2,
      2,
      "F"
    );

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

    /* RED STRIP */
    doc.setFillColor(...COLOR.PRIMARY);

    doc.roundedRect(
      x,
      y,
      5,
      cardH,
      2,
      2,
      "F"
    );

    /* PLAYER NUMBER BG */
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);

    doc.setTextColor(242, 242, 242);

    doc.text(
      String(no).padStart(2, "0"),
      x + 70,
      y + 27
    );

    /* PHOTO */
    if (p.photo) {
      const img = await toBase64(
        p.photo
      );

      if (img) {
        doc.addImage(
          img,
          "JPEG",
          x + 10,
          y + 5,
          20,
          24
        );
      }
    }

    /* NAME */
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);

    doc.setTextColor(...COLOR.DARK);

    doc.text(
      String(p.name || "-")
        .toUpperCase()
        .slice(0, 24),
      x + 35,
      y + 10
    );

    /* POSITION BADGE */
    doc.setFillColor(
      ...COLOR.PRIMARY_SOFT
    );

    doc.roundedRect(
      x + 35,
      y + 13,
      22,
      5,
      1,
      1,
      "F"
    );

    doc.setFontSize(6.2);

    doc.setTextColor(...COLOR.PRIMARY);

    doc.text(
      String(p.position || "-")
        .toUpperCase(),
      x + 46,
      y + 16.2,
      {
        align: "center",
      }
    );

    /* INFO */
    doc.setFont("helvetica", "normal");

    doc.setFontSize(6.5);

    doc.setTextColor(...COLOR.TEXT);

    doc.text(
      `NIK : ${p.nik || "-"}`,
      x + 35,
      y + 23
    );

    doc.text(
      `UMUR : ${p.age || "-"} TAHUN`,
      x + 35,
      y + 27
    );

    /* MINI LOGO */
    try {
      const logo = await toBase64(
        "/assets/img/logo-wcs.webp"
      );

      if (logo) {
        doc.saveGraphicsState();

        doc.setGState(
          new doc.GState({
            opacity: 0.15,
          })
        );

        doc.addImage(
          logo,
          "WEBP",
          x + 63,
          y + 3,
          18,
          18
        );

        doc.restoreGraphicsState();
      }
    } catch {}
  };

  for (let i = 0; i < players.length; i += 2) {
    if (y + cardH > 248) {
      doc.addPage();

      drawDecoration(doc);

      await drawWatermark(doc);

      y = 24;
    }

    await drawCard(
      players[i],
      leftX,
      y,
      i + 1
    );

    await drawCard(
      players[i + 1],
      rightX,
      y,
      i + 2
    );

    y += cardH + 6;
  }

  return y;
};

/* =========================================================
   SIGNATURE
========================================================= */

const drawSignature = (doc) => {
  const y = PAGE.H - 42;

  const leftStart = PAGE.M + 8;
  const leftEnd = PAGE.M + 68;

  const rightStart =
    PAGE.W - PAGE.M - 68;

  const rightEnd =
    PAGE.W - PAGE.M - 8;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);

  doc.setTextColor(...COLOR.DARK);

  doc.text(
    "MANAJER TIM",
    (leftStart + leftEnd) / 2,
    y,
    {
      align: "center",
    }
  );

  doc.text(
    "PANITIA",
    (rightStart + rightEnd) / 2,
    y,
    {
      align: "center",
    }
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

    line(
      doc,
      PAGE.H - 10,
      COLOR.BORDER,
      0.2
    );

    doc.setFont("helvetica", "normal");

    doc.setFontSize(6.5);

    doc.setTextColor(...COLOR.MUTED);

    doc.text(
      `PIALA DUNIA SERIES 2026 • DOKUMEN RESMI`,
      PAGE.M,
      PAGE.H - 5
    );

    doc.text(
      `HALAMAN ${i}/${total}`,
      PAGE.W - PAGE.M,
      PAGE.H - 5,
      {
        align: "right",
      }
    );
  }
};

/* =========================================================
   EXPORT PDF
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

    drawDecoration(doc);

    await drawWatermark(doc);

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

    drawSignature(doc);
  }

  drawFooter(doc);

  const isBulk = Array.isArray(teams);

  if (isBulk) {
    doc.save(
      "ALL_TEAM_WCS_2026.pdf"
    );
  } else {
    const teamName = sanitizeFileName(
      teams?.name || "TEAM"
    );

    doc.save(
      `${teamName}_WCS_2026.pdf`
    );
  }
};