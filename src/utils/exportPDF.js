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

const drawLine = (doc, y, color = COLOR.LINE, width = 0.3) => {
  doc.setDrawColor(...color);

  doc.setLineWidth(width);

  doc.line(PAGE.M, y, PAGE.W - PAGE.M, y);
};

const toBase64 = async (url) => {
  try {
    return await new Promise((resolve) => {
      const img = new Image();

      img.crossOrigin = "Anonymous";

      img.onload = () => {
        const canvas = document.createElement("canvas");

        /* RESIZE */
        const maxWidth = 1400;

        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height *= maxWidth / width;

          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");

        ctx.fillStyle = "#FFFFFF";

        ctx.fillRect(0, 0, width, height);

        ctx.drawImage(img, 0, 0, width, height);

        /* JPEG COMPRESS */
        resolve(canvas.toDataURL("image/jpeg", 0.92));
      };

      img.src = url;
    });
  } catch {
    return null;
  }
};

const toBase64PlayerPhoto = async (url) => {
  try {
    return await new Promise((resolve) => {
      const img = new Image();

      img.crossOrigin = "Anonymous";

      img.onload = () => {
        const canvas = document.createElement("canvas");

        const width = img.width;
        const height = img.height;

        const targetRatio = 20 / 26;

        let cropWidth = width;
        let cropHeight = height;

        if (width / height > targetRatio) {
          cropWidth = height * targetRatio;
        } else {
          cropHeight = width / targetRatio;
        }

        const sx = (width - cropWidth) / 2;
        const sy = (height - cropHeight) / 2;

        canvas.width = 1000;
        canvas.height = 1300;

        const ctx = canvas.getContext("2d");

        ctx.fillStyle = "#FFFFFF";

        ctx.fillRect(0, 0, 500, 650);

        ctx.drawImage(img, sx, sy, cropWidth, cropHeight, 0, 0, 500, 650);

        resolve(canvas.toDataURL("image/jpeg", 0.95));
      };

      img.src = url;
    });
  } catch {
    return null;
  }
};

/* =========================
   TEMPLATE
========================= */

const drawTemplate = async (doc) => {
  const template = await toBase64(templateImg);

  if (!template) return;

  const img = new Image();

  img.src = template;

  await new Promise((resolve) => {
    img.onload = resolve;
  });

  const width = PAGE.W;

  const height = width * (img.height / img.width);

  doc.addImage(template, "JPEG", 0, 0, width, height);
};

/* =========================
   HEADER TITLE
========================= */

const drawHeader = async (doc, showTitle = true) => {
  await drawTemplate(doc);

  doc.setFont("helvetica", "bold");

  doc.setFontSize(12);

  doc.setTextColor(...COLOR.DARK);

  if (showTitle) {
    doc.text("FORMULIR PENDAFTARAN & VERIFIKASI TIM", PAGE.M, 62);
  }

  return 58;
};

/* =========================
   INFO BAR
========================= */

const drawInfoBar = (doc, team, y) => {
  const total = team.players?.length || 0;

  doc.setFillColor(...COLOR.RED);

  doc.rect(PAGE.M, y, PAGE.W - PAGE.M * 2, 14, "F");

  doc.setFont("helvetica", "bold");

  doc.setFontSize(9);

  doc.setTextColor(255);

  doc.text(`TOTAL PEMAIN : ${total}`, PAGE.M + 6, y + 9);

  doc.text("STATUS : VALID", PAGE.M + 70, y + 9);

  doc.text("DOKUMEN : TERVERIFIKASI", PAGE.M + 125, y + 9);

  return y + 22;
};

/* =========================
   WATERMARK
========================= */

const drawWatermark = async (doc) => {
  const logo = await toBase64(logoWCS);

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
    }),
  );

  /* TANPA DIUBAH RATIO */
  const width = 55;

  const height = width * (img.height / img.width);

  doc.addImage(logo, "JPEG", (PAGE.W - width) / 2, 110, width, height);

  doc.restoreGraphicsState();
};

/* =========================
   TEAM INFO
========================= */

const drawTeamInfo = (doc, team, y) => {
  doc.setFont("helvetica", "bold");

  doc.setFontSize(11);

  doc.setTextColor(...COLOR.DARK);

  doc.text("INFORMASI TIM", PAGE.M, y);

  drawLine(doc, y + 4);

  y += 12;

  /* LOGO TEAM */
  if (team.logo) {
    doc.addImage(team.logo, "PNG", PAGE.M, y - 4, 22, 22);
  }

  const left = [
    ["NAMA TIM", (team.name || "").toUpperCase()],
    ["MANAGER", (team.manager || "").toUpperCase()],
    ["NO WHATSAPP", team.phone],
  ];

  const right = [
    ["OFFICIAL 1", (team.official1 || "").toUpperCase()],
    ["OFFICIAL 2", (team.official2 || "").toUpperCase()],
    ["OFFICIAL 3", (team.official3 || "").toUpperCase()],
  ];

  const drawColumn = (data, startX, colonX, valueX) => {
    data.forEach((item, i) => {
      const rowY = y + i * 7;

      doc.setFont("helvetica", "bold");

      doc.setFontSize(9);

      doc.text(item[0], startX, rowY);

      doc.text(":", colonX, rowY);

      doc.setFont("helvetica", "normal");

      doc.text(item[1] || "-", valueX, rowY, {
        maxWidth: 42,
      });
    });
  };

  drawColumn(left, PAGE.M + 30, PAGE.M + 56, PAGE.M + 61);

  drawColumn(right, 116, 142, 147);

  return y + 30;
};

/* =========================
   OFFICIAL PHOTO
========================= */

const drawOfficialPhotos = async (doc, team, y) => {
  const officials = [
    {
      label: "MANAGER",
      photo: team.managerPhoto,
    },
    {
      label: "OFFICIAL 1",
      photo: team.official1Photo,
    },
    {
      label: "OFFICIAL 2",
      photo: team.official2Photo,
    },
    {
      label: "OFFICIAL 3",
      photo: team.official3Photo,
    },
  ];

  const startX = 35;

  const gap = 38;

  for (let i = 0; i < officials.length; i++) {
    const item = officials[i];

    const x = startX + i * gap;

    /* TITLE */
    doc.setFillColor(...COLOR.RED);

    doc.rect(x, y, 24, 5, "F");

    doc.setFont("helvetica", "bold");

    doc.setFontSize(7);

    doc.setTextColor(255);

    doc.text(item.label, x + 12, y + 3.5, {
      align: "center",
    });

    /* BOX */
    doc.setFillColor(248, 248, 248);

    doc.setDrawColor(220);

    doc.roundedRect(x, y + 7, 24, 30, 1.5, 1.5, "FD");

    if (item.photo) {
      const img = await toBase64PlayerPhoto(item.photo);

      if (img) {
        doc.addImage(img, "JPEG", x + 1, y + 8, 22, 28);
      }
    } else {
      doc.setFont("helvetica", "normal");

      doc.setFontSize(7);

      doc.setTextColor(160);

      doc.text("BELUM\nDIISI", x + 12, y + 22, {
        align: "center",
      });
    }
  }
  doc.setTextColor(...COLOR.DARK);
  return y + 45;
};

/* =========================
   PLAYER SECTION
========================= */

const drawPlayersPage = async (doc, players, isFirstPage = false) => {
  await drawWatermark(doc);

  let y = isFirstPage ? 180 : 62;

  doc.setFont("helvetica", "bold");

  doc.setFontSize(11);

  doc.text("DAFTAR PEMAIN", PAGE.M, y);

  drawLine(doc, y + 4);

  y += 10;

  const leftX = 10;
  const rightX = 108;

  for (let i = 0; i < players.length; i++) {
    const player = players[i];

    const column = i % 2 === 0 ? leftX : rightX;

    const row = Math.floor(i / 2);

    const cardY = y + row * 32;

    /* FOTO */

    const photoX = column;
    const photoY = cardY;

    /* LEBIH PENDEK */
    const photoW = 20;
    const photoH = 26;

    if (player.photo) {
      const img = await toBase64PlayerPhoto(player.photo);

      if (img) {
        doc.addImage(img, "PNG", photoX, photoY, photoW, photoH);
      }
    }

    /* TEXT */

    const tx = column + 29;

    const writeRow = (label, value, yy) => {
      doc.setFont("helvetica", "bold");

      doc.setFontSize(9);

      doc.text(label, tx, yy);

      doc.text(":", tx + 13, yy);

      doc.setFont("helvetica", "normal");

      doc.text(String(value || "-"), tx + 17, yy, {
        maxWidth: 55,
      });
    };

    writeRow("NAMA", (player.name || "").toUpperCase(), cardY + 5);

    writeRow(
      "TTL",
      `${(player.pob || "-").toUpperCase()}, ${player.dob || "-"}`,
      cardY + 11,
    );

    writeRow("NIK", player.nik, cardY + 17);

    writeRow("POSISI", (player.position || "").toUpperCase(), cardY + 23);
  }
};

/* =========================
   SIGNATURE
========================= */

const drawSignature = async (doc) => {
  const logo = await toBase64(logoWCS);

  const y = 248;

  doc.setFont("helvetica", "bold");

  doc.setFontSize(10);

  doc.text("MANAGER TIM", 45, y, {
    align: "center",
  });

  doc.text("PANITIA WCS", 165, y, {
    align: "center",
  });

  /* LOGO TANPA DISTORT */
  if (logo) {
    const img = new Image();

    img.src = logo;

    await new Promise((resolve) => {
      img.onload = resolve;
    });

    const width = 15;

    const height = width * (img.height / img.width);

    doc.addImage(logo, "JPEG", (PAGE.W - width) / 2, y - 2, width, height);
  }

  doc.setDrawColor(...COLOR.RED);

  doc.line(22, y + 22, 68, y + 22);

  doc.line(142, y + 22, 188, y + 22);
};

/* =========================
   FOOTER
========================= */

const drawFooter = async (doc) => {
  const totalPages = doc.internal.getNumberOfPages();

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    doc.setFont("helvetica", "bold");

    doc.setFontSize(8);

    doc.setTextColor(255);

    /* NAIK 2 */
    doc.text(`HAL ${i}/${totalPages}`, PAGE.W - 8, PAGE.H - 7.5, {
      align: "right",
    });
  }
};

/* =========================
   EXPORT
========================= */

export const exportTeamsPDF = async (teams) => {
  const doc = new jsPDF({
    orientation: "p",
    unit: "mm",
    format: "a4",
  });

  const list = Array.isArray(teams) ? teams : [teams];

  for (let t = 0; t < list.length; t++) {
    if (t > 0) {
      doc.addPage();
    }

    const team = list[t];

    /* PAGE 1 */
    let y = await drawHeader(doc, true);

    y = drawInfoBar(doc, team, y + 8);

    y = drawTeamInfo(doc, team, y);

    y = await drawOfficialPhotos(doc, team, y + 2);

    const players = team.players || [];

    /* PAGE 1 = 6 PLAYER */
    const firstChunk = players.slice(0, 6);

    /* PAGE 2+ = 10 PLAYER */
    const nextChunks = [];

    for (let i = 6; i < players.length; i += 10) {
      nextChunks.push(players.slice(i, i + 10));
    }

    /* PAGE 1 */
    await drawPlayersPage(doc, firstChunk, true);

    /* PAGE 2+ */
    for (let c = 0; c < nextChunks.length; c++) {
      doc.addPage();

      await drawHeader(doc, false);

      await drawPlayersPage(doc, nextChunks[c], false);
    }

    await drawSignature(doc);
  }

  await drawFooter(doc);

  const isBulk = Array.isArray(teams);

  if (isBulk) {
    doc.save("ALL_TEAM_WCS_2026.pdf");
  } else {
    const teamName = sanitizeFileName(teams?.name || "TEAM");

    doc.save(`${teamName}_WCS_2026.pdf`);
  }
};
