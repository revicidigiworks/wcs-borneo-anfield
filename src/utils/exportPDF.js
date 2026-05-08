import jsPDF from "jspdf";

/* =========================
   ASSET
========================= */

import headerImg from "../assets/img/header.png";
import footerImg from "../assets/img/footer.png";
import logoWCS from "../assets/img/logo-wcs.webp";

/* =========================
   CONFIG
========================= */

const PAGE = {
  W: 210,
  H: 297,
  M: 10,
};

const COLOR = {
  RED: [220, 20, 35],
  DARK: [18, 18, 18],
  TEXT: [40, 40, 40],
  MUTED: [120, 120, 120],
  LINE: [220, 220, 220],
};

/* =========================
   HELPERS
========================= */

const sanitizeFileName = (name = "TEAM") =>
  name
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "_")
    .toUpperCase();

const drawLine = (
  doc,
  y,
  color = COLOR.LINE,
  width = 0.3
) => {
  doc.setDrawColor(...color);
  doc.setLineWidth(width);

  doc.line(
    PAGE.M,
    y,
    PAGE.W - PAGE.M,
    y
  );
};

const meta = () => ({
  doc: `WCS-${Math.floor(
    Math.random() * 999999
  )}`,
  verify: Math.random()
    .toString(36)
    .substring(2, 10)
    .toUpperCase(),
});

/* =========================
   IMAGE TO BASE64
========================= */

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

/* =========================
   HEADER
========================= */

const drawHeader = async (
  doc,
  team,
  metaData
) => {
  const header = await toBase64(
    headerImg
  );

  if (header) {
    const img = new Image();

    img.src = header;

    await new Promise((resolve) => {
      img.onload = resolve;
    });

    /* RATIO ASLI IMAGE */
    const pdfWidth = PAGE.W;

    const ratio =
      img.height / img.width;

    const pdfHeight =
      pdfWidth * ratio;

    doc.addImage(
      header,
      "PNG",
      0,
      0,
      pdfWidth,
      pdfHeight
    );

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(12);

    doc.setTextColor(
      ...COLOR.DARK
    );

    doc.text(
      "FORMULIR PENDAFTARAN & VERIFIKASI TIM",
      PAGE.M,
      pdfHeight + 12
    );

    return pdfHeight + 20;
  }

  return 50;
};
/* =========================
   INFO BAR
========================= */

const drawInfoBar = (
  doc,
  team,
  y
) => {
  const total =
    team.players?.length || 0;

  doc.setFillColor(...COLOR.RED);

  doc.rect(
    PAGE.M,
    y,
    PAGE.W - PAGE.M * 2,
    16,
    "F"
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);

  doc.setTextColor(255);

  doc.text(
    `TOTAL PEMAIN : ${total}`,
    PAGE.M + 7,
    y + 10
  );

  doc.text(
    `STATUS : VALID`,
    PAGE.M + 70,
    y + 10
  );

  doc.text(
    `DOKUMEN : TERVERIFIKASI`,
    PAGE.M + 130,
    y + 10
  );

  return y + 26;
};

/* =========================
   WATERMARK
========================= */

/* =========================
   WATERMARK
========================= */

const drawWatermark = async (
  doc
) => {
  const logo = await toBase64(
    logoWCS
  );

  if (!logo) return;

  const img = new Image();

  img.src = logo;

  await new Promise((resolve) => {
    img.onload = resolve;
  });

  doc.saveGraphicsState();

  doc.setGState(
    new doc.GState({
      opacity: 0.05,
    })
  );

  /* WIDTH ONLY */
  const width = 55;

  /* AUTO HEIGHT */
  const height =
    width * (img.height / img.width);

  doc.addImage(
    logo,
    "PNG",
    (PAGE.W - width) / 2,
    108,
    width,
    height
  );

  doc.restoreGraphicsState();
};

/* =========================
   TEAM INFO
========================= */

const drawTeamInfo = (
  doc,
  team,
  y
) => {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...COLOR.DARK);

  doc.text(
    "INFORMASI TIM",
    PAGE.M,
    y
  );

  drawLine(doc, y + 4);

  y += 14;

  const left = [
    ["NAMA TIM", team.name],
    ["MANAGER", team.manager],
    ["NO WHATSAPP", team.phone],
  ];

  const right = [
    ["OFFICIAL 1", team.official1],
    ["OFFICIAL 2", team.official2],
    ["OFFICIAL 3", team.official3],
  ];

  const drawColumn = (
    data,
    startX
  ) => {
    data.forEach((item, i) => {
      const rowY = y + i * 10;

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.setFontSize(9);

      doc.setTextColor(...COLOR.DARK);

      doc.text(
        item[0],
        startX,
        rowY
      );

      doc.text(
        ":",
        startX + 40,
        rowY
      );

      doc.setFont(
        "helvetica",
        "normal"
      );

      doc.text(
        item[1] || "-",
        startX + 44,
        rowY
      );
    });
  };

  drawColumn(left, PAGE.M);

  drawColumn(
    right,
    PAGE.W / 2 + 5
  );

  return y + 36;
};

/* =========================
   PLAYER SECTION
========================= */

const drawPlayersPage = async (
  doc,
  players,
  isFirstPage = false
) => {
  await drawWatermark(doc);

  let y = isFirstPage ? 128 : 52;

  doc.setFont("helvetica", "bold");

  doc.setFontSize(12);

  doc.setTextColor(...COLOR.DARK);

  doc.text(
    "DAFTAR PEMAIN",
    PAGE.M,
    y
  );

  drawLine(doc, y + 4);

  y += 10;

  const leftX = 10;
  const rightX = 108;

  for (
    let i = 0;
    i < players.length;
    i++
  ) {
    const player = players[i];

    const column =
      i % 2 === 0
        ? leftX
        : rightX;

    const row = Math.floor(i / 2);

    /* CARD HEIGHT LEBIH COMPACT */
    const cardY =
      y + row * 40;

    /* FOTO */

    const photoX = column;
    const photoY = cardY;

    const photoW = 20;
    const photoH = 28;

    if (player.photo) {
      const img = await toBase64(
        player.photo
      );

      if (img) {
        doc.addImage(
          img,
          "JPEG",
          photoX,
          photoY,
          photoW,
          photoH
        );
      } else {
        doc.setFillColor(90);

        doc.rect(
          photoX,
          photoY,
          photoW,
          photoH,
          "F"
        );
      }
    } else {
      doc.setFillColor(90);

      doc.rect(
        photoX,
        photoY,
        photoW,
        photoH,
        "F"
      );
    }

    /* TEXT */

    const tx = column + 26;

    const writeRow = (
      label,
      value,
      yy
    ) => {
      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.setFontSize(7.5);

      doc.setTextColor(
        ...COLOR.DARK
      );

      doc.text(
        label,
        tx,
        yy
      );

      doc.text(
        ":",
        tx + 14,
        yy
      );

      doc.setFont(
        "helvetica",
        "normal"
      );

      doc.text(
        String(value || "-"),
        tx + 18,
        yy,
        {
          maxWidth: 55,
        }
      );
    };

    writeRow(
      "NAMA",
      player.name,
      cardY + 6
    );

    writeRow(
      "TTL",
      `${player.pob || "-"}, ${
        player.dob || "-"
      }`,
      cardY + 12
    );

    writeRow(
      "NIK",
      player.nik,
      cardY + 18
    );

    writeRow(
      "POSISI",
      player.position,
      cardY + 24
    );
  }
};

/* =========================
   SIGNATURE
========================= */

/* =========================
   SIGNATURE
========================= */

const drawSignature = async (
  doc
) => {
  const logo = await toBase64(
    logoWCS
  );

  const y = 248;

  doc.setFont("helvetica", "bold");

  doc.setFontSize(11);

  doc.setTextColor(...COLOR.DARK);

  doc.text(
    "MANAGER TIM",
    45,
    y,
    {
      align: "center",
    }
  );

  doc.text(
    "PANITIA WCS",
    165,
    y,
    {
      align: "center",
    }
  );

  /* LOGO PROPORSIONAL */
  if (logo) {
    const img = new Image();

    img.src = logo;

    await new Promise((resolve) => {
      img.onload = resolve;
    });

    /* WIDTH ONLY */
    const width = 16;

    /* AUTO HEIGHT */
    const height =
      width *
      (img.height / img.width);

    doc.addImage(
      logo,
      "PNG",
      96,
      y - 1,
      width,
      height
    );
  }

  doc.setDrawColor(...COLOR.RED);

  doc.line(
    22,
    y + 24,
    68,
    y + 24
  );

  doc.line(
    142,
    y + 24,
    188,
    y + 24
  );
};

/* =========================
   FOOTER
========================= */

const drawFooter = async (
  doc
) => {
  const totalPages =
    doc.internal.getNumberOfPages();

  const footer = await toBase64(
    footerImg
  );

  for (
    let i = 1;
    i <= totalPages;
    i++
  ) {
    doc.setPage(i);

    if (footer) {
      doc.addImage(
        footer,
        "PNG",
        0,
        PAGE.H - 12,
        PAGE.W,
        12
      );
    }

    doc.setFont("helvetica", "bold");

    doc.setFontSize(8);

    doc.setTextColor(255);

    doc.text(
      `HAL ${i}/${totalPages}`,
      PAGE.W - 8,
      PAGE.H - 5.5,
      {
        align: "right",
      }
    );
  }
};

/* =========================
   MAIN EXPORT
========================= */

export const exportTeamsPDF =
  async (teams) => {
    const doc = new jsPDF(
      "p",
      "mm",
      "a4"
    );

    const list =
      Array.isArray(teams)
        ? teams
        : [teams];

    for (
      let t = 0;
      t < list.length;
      t++
    ) {
      if (t > 0) {
        doc.addPage();
      }

      const team = list[t];

      const metaData = meta();

      let y =
        await drawHeader(
          doc,
          team,
          metaData
        );

      y = drawInfoBar(
        doc,
        team,
        y
      );

      y = drawTeamInfo(
        doc,
        team,
        y
      );

      /* ======================
         PLAYER PAGINATION
      ====================== */

      const players =
        team.players || [];

      const chunkSize = 6;

      const chunks = [];

      for (
        let i = 0;
        i < players.length;
        i += chunkSize
      ) {
        chunks.push(
          players.slice(
            i,
            i + chunkSize
          )
        );
      }

      for (
        let c = 0;
        c < chunks.length;
        c++
      ) {
        if (c > 0) {
          doc.addPage();

          await drawHeader(
            doc,
            team,
            metaData
          );
        }

        await drawPlayersPage(
          doc,
          chunks[c],
          c === 0
        );
      }

      /* SIGNATURE */
      await drawSignature(doc);
    }

    /* FOOTER */
    await drawFooter(doc);

    /* SAVE */

    const isBulk =
      Array.isArray(teams);

    if (isBulk) {
      doc.save(
        "ALL_TEAM_WCS_2026.pdf"
      );
    } else {
      const teamName =
        sanitizeFileName(
          teams?.name ||
            "TEAM"
        );

      doc.save(
        `${teamName}_WCS_2026.pdf`
      );
    }
  };