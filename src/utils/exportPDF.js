import jsPDF from "jspdf";

/* =========================
   ASSET
========================= */

import templateImg from "../assets/img/template.webp";
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

const toBase64 = async (url) => {
  try {
    return await new Promise(
      (resolve) => {
        const img = new Image();

        img.crossOrigin =
          "Anonymous";

        img.onload = () => {
          const canvas =
            document.createElement(
              "canvas"
            );

          canvas.width =
            img.width;

          canvas.height =
            img.height;

          const ctx =
            canvas.getContext("2d");

          /* BACKGROUND PUTIH */
          ctx.fillStyle = "#FFFFFF";

          ctx.fillRect(
            0,
            0,
            canvas.width,
            canvas.height
          );

          ctx.drawImage(
            img,
            0,
            0
          );

          resolve(
            canvas.toDataURL(
              "image/png"
            )
          );
        };

        img.src = url;
      }
    );
  } catch {
    return null;
  }
};

/* =========================
   TEMPLATE
========================= */

const drawTemplate = async (
  doc
) => {
  const template =
    await toBase64(
      templateImg
    );

  if (!template) return;

  const img = new Image();

  img.src = template;

  await new Promise((resolve) => {
    img.onload = resolve;
  });

  const width = PAGE.W;

  const height =
    width *
    (img.height / img.width);

  doc.addImage(
    template,
    "PNG",
    0,
    0,
    width,
    height
  );
};

/* =========================
   HEADER TITLE
========================= */

const drawHeader = async (
  doc
) => {
  await drawTemplate(doc);

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
    62
  );

  return 58;
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
    14,
    "F"
  );

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(9);

  doc.setTextColor(255);

  doc.text(
    `TOTAL PEMAIN : ${total}`,
    PAGE.M + 6,
    y + 9
  );

  doc.text(
    "STATUS : VALID",
    PAGE.M + 70,
    y + 9
  );

  doc.text(
    "DOKUMEN : TERVERIFIKASI",
    PAGE.M + 125,
    y + 9
  );

  return y + 22;
};

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

  /* TANPA DIUBAH RATIO */
  const width = 55;

  const height =
    width *
    (img.height / img.width);

  doc.addImage(
    logo,
    "PNG",
    (PAGE.W - width) / 2,
    110,
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
  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(11);

  doc.setTextColor(
    ...COLOR.DARK
  );

  doc.text(
    "INFORMASI TIM",
    PAGE.M,
    y
  );

  drawLine(doc, y + 4);

  y += 12;

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
      const rowY = y + i * 9;

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.setFontSize(8);

      doc.text(
        item[0],
        startX,
        rowY
      );

      doc.text(
        ":",
        startX + 35,
        rowY
      );

      doc.setFont(
        "helvetica",
        "normal"
      );

      doc.text(
        item[1] || "-",
        startX + 39,
        rowY
      );
    });
  };

  drawColumn(left, PAGE.M);

  drawColumn(
    right,
    PAGE.W / 2 + 5
  );

  return y + 30;
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

  let y = isFirstPage
    ? 124
    : 52;

  doc.setFont(
    "arial",
    "bold"
  );

  doc.setFontSize(11);

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

    const cardY =
      y + row * 35;

    /* FOTO */

    const photoX = column;
    const photoY = cardY;

    /* LEBIH PENDEK */
    const photoW = 18;
    const photoH = 24;

    if (player.photo) {
      const img = await toBase64(
        player.photo
      );

      if (img) {
        doc.addImage(
          img,
          "PNG",
          photoX,
          photoY,
          photoW,
          photoH
        );
      }
    }

    /* TEXT */

    const tx = column + 24;

    const writeRow = (
      label,
      value,
      yy
    ) => {
      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.setFontSize(7.2);

      doc.text(
        label,
        tx,
        yy
      );

      doc.text(
        ":",
        tx + 13,
        yy
      );

      doc.setFont(
        "helvetica",
        "normal"
      );

      doc.text(
        String(value || "-"),
        tx + 17,
        yy,
        {
          maxWidth: 55,
        }
      );
    };

    writeRow(
      "NAMA",
      player.name,
      cardY + 5
    );

    writeRow(
      "TTL",
      `${player.pob || "-"}, ${
        player.dob || "-"
      }`,
      cardY + 10
    );

    writeRow(
      "NIK",
      player.nik,
      cardY + 15
    );

    writeRow(
      "POSISI",
      player.position,
      cardY + 20
    );
  }
};

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

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(10);

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

  /* LOGO TANPA DISTORT */
  if (logo) {
    const img = new Image();

    img.src = logo;

    await new Promise((resolve) => {
      img.onload = resolve;
    });

    const width = 15;

    const height =
      width *
      (img.height / img.width);

    doc.addImage(
      logo,
      "PNG",
      (PAGE.W - width) / 2,
      y - 2,
      width,
      height
    );
  }

  doc.setDrawColor(...COLOR.RED);

  doc.line(
    22,
    y + 22,
    68,
    y + 22
  );

  doc.line(
    142,
    y + 22,
    188,
    y + 22
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

  for (
    let i = 1;
    i <= totalPages;
    i++
  ) {
    doc.setPage(i);

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(8);

    doc.setTextColor(255);

    /* NAIK 2 */
    doc.text(
      `HAL ${i}/${totalPages}`,
      PAGE.W - 8,
      PAGE.H - 7.5,
      {
        align: "right",
      }
    );
  }
};

/* =========================
   EXPORT
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

      let y =
        await drawHeader(doc);

      y = drawInfoBar(
        doc,
        team,
        y + 8
      );

      y = drawTeamInfo(
        doc,
        team,
        y
      );

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
            doc
          );
        }

        await drawPlayersPage(
          doc,
          chunks[c],
          c === 0
        );
      }

      await drawSignature(doc);
    }

    await drawFooter(doc);

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