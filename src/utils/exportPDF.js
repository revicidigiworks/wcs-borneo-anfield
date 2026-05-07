import jsPDF from "jspdf";

/* ===================== DESIGN SYSTEM ===================== */
const COLOR = {
  PRIMARY: [200, 16, 46],
  SECONDARY: [20, 20, 20],
  TEXT: [55, 55, 55],
  MUTED: [120, 120, 120],
  BORDER: [220, 220, 220],
  LIGHT: [248, 248, 248],
};

const PAGE = {
  W: 210,
  H: 297,
  M: 14,
};

/* ===================== HELPERS ===================== */
const line = (doc, y, color = COLOR.BORDER, width = 0.3) => {
  doc.setDrawColor(...color);
  doc.setLineWidth(width);
  doc.line(PAGE.M, y, PAGE.W - PAGE.M, y);
};

const meta = () => ({
  doc: `WCS-${Math.floor(Math.random() * 999999)}`,
  verify: Math.random().toString(36).substring(2, 8).toUpperCase(),
});

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
const drawHeader = (doc, team, m) => {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.setTextColor(...COLOR.SECONDARY);

  doc.text("WORLD CUP SERIES 2026", PAGE.M, 15);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...COLOR.PRIMARY);

  doc.text("DOKUMEN RESMI PENDAFTARAN TIM", PAGE.M, 20);

  doc.setFontSize(7);
  doc.setTextColor(...COLOR.MUTED);

  doc.text(`Tim: ${team.name || "-"}`, PAGE.W - PAGE.M, 13, {
    align: "right",
  });

  doc.text(`Doc ID: ${m.doc}`, PAGE.W - PAGE.M, 17, {
    align: "right",
  });

  doc.text(`Verifikasi: ${m.verify}`, PAGE.W - PAGE.M, 21, {
    align: "right",
  });

  doc.setDrawColor(...COLOR.PRIMARY);
  doc.setLineWidth(0.6);
  doc.line(PAGE.M, 24, PAGE.W - PAGE.M, 24);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...COLOR.SECONDARY);

  doc.text(
    "FORMULIR RESMI PENDAFTARAN & VERIFIKASI TIM",
    PAGE.M,
    31
  );

  return 37;
};

/* ===================== INFO BAR ===================== */
const drawInfoBar = (doc, team, y) => {
  doc.setFillColor(...COLOR.LIGHT);
  doc.setDrawColor(...COLOR.BORDER);

  doc.roundedRect(PAGE.M, y, 182, 10, 1.5, 1.5, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...COLOR.TEXT);

  doc.text(
    `TOTAL PEMAIN : ${team.players?.length || 0}`,
    PAGE.M + 5,
    y + 6.5
  );

  doc.text(
    "STATUS : VALID",
    PAGE.M + 70,
    y + 6.5
  );

  doc.text(
    "DOKUMEN : TERKONFIRMASI",
    PAGE.M + 120,
    y + 6.5
  );

  return y + 16;
};

/* ===================== TEAM INFO ===================== */
const drawTeamInfo = (doc, team, y) => {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);

  doc.text("INFORMASI TIM", PAGE.M, y);

  line(doc, y + 2);

  y += 9;

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

  const drawRow = (label, value, x, yy) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.8);

    doc.text(label, x, yy);

    doc.setFont("helvetica", "normal");

    doc.text(":", x + 20, yy);

    doc.text(value || "-", x + 23, yy);
  };

  left.forEach((d, i) => {
    drawRow(d[0], d[1], PAGE.M, y + i * 6);
  });

  right.forEach((d, i) => {
    drawRow(d[0], d[1], PAGE.W / 2 + 6, y + i * 6);
  });

  return y + 23;
};

/* ===================== PLAYER SECTION ===================== */
const drawPlayers = async (doc, players, startY) => {
  let y = startY;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);

  doc.text("DAFTAR PEMAIN TERDAFTAR", PAGE.M, y);

  y += 7;

  const boxW = 86;
  const boxH = 34;

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

  const drawCard = async (p, x, yy, no) => {
    if (!p) return;

    doc.setDrawColor(...COLOR.BORDER);
    doc.setFillColor(255, 255, 255);

    doc.roundedRect(x, yy, boxW, boxH, 1.5, 1.5, "FD");

    /* FOTO */
    if (p.photo) {
      const img = await toBase64(p.photo);

      if (img) {
        doc.addImage(
          img,
          "JPEG",
          x + 3,
          yy + 5,
          16,
          20
        );
      }
    }

    /* NOMOR */
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);

    doc.text(`#${no}`, x + 3, yy + 3);

    /* CONTENT */
    const labelX = x + 22;
    const colonX = x + 34;
    const valueX = x + 37;

    const maxWidth = 44;

    const row = (label, value, rowY, bold = false) => {
      doc.setFont(
        "helvetica",
        bold ? "bold" : "normal"
      );

      doc.setFontSize(7);

      doc.text(label, labelX, rowY);
      doc.text(":", colonX, rowY);

      doc.text(
        value || "-",
        valueX,
        rowY,
        {
          maxWidth,
        }
      );
    };

    row("Nama", p.name || "-", yy + 10, true);

    row("Posisi", p.position || "-", yy + 15);

    row(
      "TTL",
      `${p.pob || "-"}, ${p.dob || "-"}`,
      yy + 20
    );

    row(
      "Umur",
      `${p.age || "-"} Tahun`,
      yy + 25
    );
  };

  for (let i = 0; i < sortedPlayers.length; i += 2) {
    if (y + boxH > 258) {
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
  doc.setFontSize(8);

  doc.text("MANAJER TIM", PAGE.M + 25, y);

  doc.text(
    "PANITIA",
    PAGE.W - PAGE.M - 38,
    y
  );

  doc.setDrawColor(...COLOR.BORDER);

  doc.line(
    PAGE.M + 5,
    y + 14,
    PAGE.M + 58,
    y + 14
  );

  doc.line(
    PAGE.W - PAGE.M - 58,
    y + 14,
    PAGE.W - PAGE.M - 5,
    y + 14
  );
};

/* ===================== FOOTER ===================== */
const drawFooter = (doc) => {
  const pages = doc.internal.getNumberOfPages();

  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);

    doc.setFontSize(6.5);
    doc.setTextColor(150);

    doc.text(
      `Halaman ${i}/${pages}`,
      PAGE.W - PAGE.M,
      PAGE.H - 6,
      {
        align: "right",
      }
    );
  }
};

/* ===================== EXPORT ===================== */
export const exportTeamsPDF = async (
  teams,
  allTeams = false
) => {
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

  /* 🔥 NAMA FILE */
  if (allTeams) {
    doc.save("ALL_TIM_WCS_2026.pdf");
  } else {
    const teamName = (list[0]?.name || "TIM")
      .replace(/\s+/g, "_")
      .toUpperCase();

    doc.save(`${teamName}.pdf`);
  }
};