import jsPDF from "jspdf";

/* =======================================================
   WORLD CUP SERIES 2026
   PREMIUM PDF EXPORT
======================================================= */

const COLOR = {
  PRIMARY: [200, 16, 46],
  DARK: [20, 20, 20],
  TEXT: [55, 55, 55],
  MUTED: [120, 120, 120],
  BORDER: [230, 230, 230],
  LIGHT: [248, 248, 248],
  WHITE: [255, 255, 255],
};

const PAGE = {
  W: 210,
  H: 297,
  M: 10,
};

const PLAYERS_PER_PAGE = 8;

/* =======================================================
   HELPER
======================================================= */

const meta = () => ({
  doc: `WCS-2026-${Math.floor(
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

  doc.roundedRect(
    x,
    y,
    w,
    h,
    2,
    2,
    "FD"
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

/* =======================================================
   HEADER
======================================================= */

const drawHeader = (
  doc,
  team,
  metaData,
  pageNo
) => {
  /* TOP BG */
  doc.setFillColor(255, 255, 255);

  doc.rect(0, 0, PAGE.W, 42, "F");

  /* RED RIGHT */
  doc.setFillColor(...COLOR.PRIMARY);

  doc.triangle(
    140,
    0,
    210,
    0,
    210,
    42,
    "F"
  );

  /* BLACK ACCENT */
  doc.setFillColor(...COLOR.DARK);

  doc.triangle(
    135,
    0,
    145,
    0,
    132,
    42,
    "F"
  );

  /* TITLE */
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.setTextColor(...COLOR.DARK);

  doc.text(
    "WORLD CUP",
    PAGE.M + 25,
    18
  );

  doc.setTextColor(...COLOR.PRIMARY);

  doc.text(
    "SERIES 2026",
    PAGE.M + 25,
    30
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...COLOR.TEXT);

  doc.text(
    "DOKUMEN RESMI PENDAFTARAN TIM",
    PAGE.M + 25,
    36
  );

  /* LOGO SIMPLE */
  doc.setDrawColor(...COLOR.DARK);
  doc.setLineWidth(1.2);

  doc.circle(PAGE.M + 10, 18, 8);

  doc.setFontSize(18);
  doc.setTextColor(...COLOR.DARK);

  doc.text("⚽", PAGE.M + 6.5, 21);

  /* RIGHT INFO */
  doc.setTextColor(255);
  doc.setFontSize(8);

  doc.text(
    `Tim : ${team.name || "-"}`,
    158,
    14
  );

  doc.text(
    `Doc ID : ${metaData.doc}`,
    158,
    22
  );

  doc.text(
    `Verifikasi : ${metaData.verify}`,
    158,
    30
  );

  /* BOTTOM LINE */
  doc.setFillColor(...COLOR.PRIMARY);

  doc.rect(0, 42, PAGE.W, 1.2, "F");

  /* PAGE */
  doc.setFontSize(7);
  doc.setTextColor(...COLOR.MUTED);

  doc.text(
    `Halaman ${pageNo}`,
    194,
    290
  );

  return 52;
};

/* =======================================================
   INFO BAR
======================================================= */

const drawInfoBar = (
  doc,
  totalPlayers,
  y
) => {
  box(
    doc,
    PAGE.M,
    y,
    190,
    18,
    [250, 250, 250]
  );

  line(doc, 72, y + 3, 72, y + 15);
  line(doc, 130, y + 3, 130, y + 15);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);

  doc.setTextColor(...COLOR.PRIMARY);

  doc.text("TOTAL PEMAIN", 26, y + 7);

  doc.text("STATUS", 92, y + 7);

  doc.text("DOKUMEN", 145, y + 7);

  doc.setTextColor(...COLOR.DARK);
  doc.setFontSize(14);

  doc.text(
    String(totalPlayers),
    28,
    y + 14
  );

  doc.text("VALID", 92, y + 14);

  doc.text(
    "TERVERIFIKASI",
    145,
    y + 14
  );

  return y + 26;
};

/* =======================================================
   TEAM INFO
======================================================= */

const drawTeamInfo = (doc, team, y) => {
  box(doc, PAGE.M, y, 190, 58);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...COLOR.DARK);

  doc.text("INFORMASI TIM", 20, y + 10);

  doc.setFillColor(...COLOR.PRIMARY);

  doc.rect(14, y + 14, 52, 1, "F");

  line(doc, 105, y + 16, 105, y + 48);

  const left = [
    ["NAMA TIM", team.name],
    ["MANAGER", team.manager],
    ["WHATSAPP", team.phone],
  ];

  const right = [
    ["OFFICIAL 1", team.official1],
    ["OFFICIAL 2", team.official2],
    ["OFFICIAL 3", team.official3],
  ];

  const drawData = (
    data,
    startX,
    startY
  ) => {
    data.forEach((d, i) => {
      const yy = startY + i * 15;

      doc.setFontSize(7);
      doc.setTextColor(...COLOR.MUTED);
      doc.setFont("helvetica", "bold");

      doc.text(d[0], startX, yy);

      doc.setFontSize(10);
      doc.setTextColor(...COLOR.DARK);
      doc.setFont("helvetica", "normal");

      doc.text(
        d[1] || "-",
        startX,
        yy + 7
      );
    });
  };

  drawData(left, 20, y + 24);
  drawData(right, 115, y + 24);

  return y + 68;
};

/* =======================================================
   PLAYER TABLE
======================================================= */

const drawPlayersTable = async (
  doc,
  players,
  y,
  startNo = 1
) => {
  box(doc, PAGE.M, y, 190, 120);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...COLOR.DARK);

  doc.text(
    "DAFTAR PEMAIN TERDAFTAR",
    20,
    y + 10
  );

  doc.setFillColor(...COLOR.PRIMARY);

  doc.rect(14, y + 14, 70, 1, "F");

  y += 22;

  const cols = {
    no: 10,
    nama: 56,
    posisi: 24,
    ttl: 40,
    umur: 14,
  };

  const startX = 14;

  /* HEADER */
  doc.setFillColor(...COLOR.PRIMARY);

  doc.roundedRect(
    startX,
    y,
    182,
    9,
    1,
    1,
    "F"
  );

  doc.setFontSize(7);
  doc.setTextColor(255);

  let cx = startX + 3;

  doc.text("NO", cx, y + 6);

  cx += cols.no;

  doc.text("NAMA PEMAIN", cx, y + 6);

  cx += cols.nama;

  doc.text("POSISI", cx, y + 6);

  cx += cols.posisi;

  doc.text("TTL", cx, y + 6);

  cx += cols.ttl;

  doc.text("UMUR", cx, y + 6);

  y += 9;

  /* ROW */
  for (let i = 0; i < players.length; i++) {
    const p = players[i];

    doc.setDrawColor(...COLOR.BORDER);

    doc.rect(startX, y, 182, 12);

    let xx = startX;

    /* NUMBER */
    doc.setFillColor(...COLOR.PRIMARY);

    doc.rect(xx + 1, y + 1, 6, 10, "F");

    doc.setFontSize(7);
    doc.setTextColor(255);
    doc.setFont("helvetica", "bold");

    doc.text(
      String(startNo + i),
      xx + 4,
      y + 6.8,
      {
        align: "center",
      }
    );

    xx += cols.no;

    /* FOTO */
    if (p?.photo) {
      const img = await toBase64(
        p.photo
      );

      if (img) {
        doc.addImage(
          img,
          "JPEG",
          xx + 1,
          y + 1.3,
          8,
          8
        );
      }
    }

    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLOR.TEXT);
    doc.setFontSize(7);

    doc.text(
      p?.name || "-",
      xx + 11,
      y + 7
    );

    xx += cols.nama;

    doc.text(
      p?.position || "-",
      xx + 2,
      y + 7
    );

    xx += cols.posisi;

    doc.text(
      `${p?.pob || "-"}, ${
        p?.dob || "-"
      }`,
      xx + 2,
      y + 7
    );

    xx += cols.ttl;

    doc.text(
      p?.age
        ? `${p.age}`
        : "-",
      xx + 4,
      y + 7
    );

    y += 12;
  }

  return y + 8;
};

/* =======================================================
   SIGNATURE
======================================================= */

const drawSignature = (doc) => {
  const y = 228;

  box(doc, PAGE.M, y, 190, 48);

  /* LEFT */
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...COLOR.DARK);

  doc.text("MANAJER TIM", 42, y + 16, {
    align: "center",
  });

  line(doc, 24, y + 32, 60, y + 32);

  doc.setFontSize(7);
  doc.setTextColor(...COLOR.MUTED);

  doc.text(
    "Tanggal: ___ / ___ / 2026",
    26,
    y + 40
  );

  /* CENTER */
  doc.setFontSize(18);
  doc.setTextColor(180);

  doc.text("⚽", 105, y + 18, {
    align: "center",
  });

  doc.setFontSize(9);

  doc.text(
    "WORLD CUP",
    105,
    y + 28,
    {
      align: "center",
    }
  );

  doc.text(
    "SERIES 2026",
    105,
    y + 34,
    {
      align: "center",
    }
  );

  /* RIGHT */
  doc.setFontSize(10);
  doc.setTextColor(...COLOR.DARK);

  doc.text("PANITIA", 168, y + 16, {
    align: "center",
  });

  line(doc, 150, y + 32, 186, y + 32);

  doc.setFontSize(7);
  doc.setTextColor(...COLOR.MUTED);

  doc.text(
    "Tanggal: ___ / ___ / 2026",
    150,
    y + 40
  );
};

/* =======================================================
   FOOTER
======================================================= */

const drawFooter = (doc) => {
  const totalPages =
    doc.internal.getNumberOfPages();

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    /* BOTTOM DECOR */
    doc.setFillColor(...COLOR.PRIMARY);

    doc.triangle(
      0,
      297,
      0,
      285,
      30,
      297,
      "F"
    );

    doc.setFillColor(...COLOR.DARK);

    doc.triangle(
      210,
      297,
      180,
      297,
      210,
      285,
      "F"
    );

    /* PAGE */
    doc.setFillColor(...COLOR.PRIMARY);

    doc.roundedRect(
      92,
      286,
      26,
      8,
      4,
      4,
      "F"
    );

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(255);

    doc.text(
      `Halaman ${i}/${totalPages}`,
      105,
      291,
      {
        align: "center",
      }
    );
  }
};

/* =======================================================
   EXPORT
======================================================= */

export const exportTeamsPDF = async (
  teams
) => {
  const doc = new jsPDF("p", "mm", "a4");

  const list = Array.isArray(teams)
    ? teams
    : [teams];

  for (let t = 0; t < list.length; t++) {
    if (t > 0) doc.addPage();

    const team = list[t];

    const metaData = meta();

    const players =
      team.players || [];

    const chunks = [];

    for (
      let i = 0;
      i < players.length;
      i += PLAYERS_PER_PAGE
    ) {
      chunks.push(
        players.slice(
          i,
          i + PLAYERS_PER_PAGE
        )
      );
    }

    for (let p = 0; p < chunks.length; p++) {
      if (p > 0) doc.addPage();

      let y = drawHeader(
        doc,
        team,
        metaData,
        p + 1
      );

      /* PAGE 1 ONLY */
      if (p === 0) {
        y = drawInfoBar(
          doc,
          players.length,
          y
        );

        y = drawTeamInfo(doc, team, y);
      }

      y = await drawPlayersTable(
        doc,
        chunks[p],
        y,
        p * PLAYERS_PER_PAGE + 1
      );

      /* LAST PAGE */
      if (p === chunks.length - 1) {
        drawSignature(doc);
      }
    }
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

    doc.save(
      `${teamName}_WCS_2026.pdf`
    );
  }
};