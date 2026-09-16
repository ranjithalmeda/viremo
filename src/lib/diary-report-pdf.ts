import type { EntryRecord } from "@/src/lib/data";
import {
  entryTypes,
  formatRating,
  formatStatus,
  formatType,
  watchStatuses,
} from "@/src/lib/watchlist";

type PdfLine = {
  text: string;
  size?: number;
  bold?: boolean;
  gapBefore?: number;
  indent?: number;
};

type DiaryReportInput = {
  entries: EntryRecord[];
  userLabel: string;
  generatedAt: Date;
};

const pageWidth = 595;
const pageHeight = 842;
const marginX = 48;
const topY = 792;
const bottomY = 54;

function cleanText(value: string) {
  return value
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function escapePdfText(value: string) {
  return cleanText(value).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(value);
}

function wrapText(text: string, maxCharacters: number) {
  const words = cleanText(text).split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;

    if (next.length > maxCharacters && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }

  if (current) {
    lines.push(current);
  }

  return lines.length ? lines : [""];
}

function addWrappedLine(
  lines: PdfLine[],
  text: string,
  options: Omit<PdfLine, "text"> = {},
) {
  const maxCharacters = Math.max(36, 96 - Math.floor((options.indent ?? 0) / 4));
  const wrapped = wrapText(text, maxCharacters);

  wrapped.forEach((line, index) => {
    lines.push({
      text: line,
      ...options,
      gapBefore: index === 0 ? options.gapBefore : 0,
      indent: index === 0 ? options.indent : (options.indent ?? 0) + 12,
    });
  });
}

function buildReportLines({ entries, userLabel, generatedAt }: DiaryReportInput) {
  const lines: PdfLine[] = [];
  const completedCount = entries.filter((entry) => entry.status === "COMPLETED").length;
  const watchingCount = entries.filter((entry) => entry.status === "WATCHING").length;
  const droppedCount = entries.filter((entry) => entry.status === "DROPPED").length;
  const ratedEntries = entries.filter((entry) => typeof entry.rating === "number");
  const averageRating = ratedEntries.length
    ? (
        ratedEntries.reduce((sum, entry) => sum + (entry.rating ?? 0), 0) /
        ratedEntries.length
      ).toFixed(1)
    : "No ratings";

  lines.push({ text: "Viremo Diary Report", size: 22, bold: true });
  lines.push({
    text: `User: ${userLabel}`,
    size: 11,
    gapBefore: 8,
  });
  lines.push({
    text: `Generated: ${formatDate(generatedAt)}`,
    size: 11,
  });

  lines.push({ text: "Summary", size: 16, bold: true, gapBefore: 18 });
  lines.push({ text: `Total entries: ${entries.length}`, size: 11 });
  lines.push({ text: `Completed: ${completedCount}`, size: 11 });
  lines.push({ text: `Watching / Reading: ${watchingCount}`, size: 11 });
  lines.push({ text: `Dropped: ${droppedCount}`, size: 11 });
  lines.push({ text: `Average rating: ${averageRating}`, size: 11 });

  if (!entries.length) {
    lines.push({
      text: "No diary entries yet. Add movies, series, anime, or books to build a richer report.",
      gapBefore: 18,
    });
    return lines;
  }

  for (const type of entryTypes) {
    const typeEntries = entries.filter((entry) => entry.type === type);

    if (!typeEntries.length) {
      continue;
    }

    lines.push({
      text: `${formatType(type)} (${typeEntries.length})`,
      size: 16,
      bold: true,
      gapBefore: 20,
    });

    for (const status of watchStatuses) {
      const statusEntries = typeEntries.filter((entry) => entry.status === status);

      if (!statusEntries.length) {
        continue;
      }

      lines.push({
        text: `${formatStatus(status, type)} (${statusEntries.length})`,
        size: 13,
        bold: true,
        gapBefore: 10,
        indent: 8,
      });

      statusEntries.forEach((entry, index) => {
        const updatedAt =
          entry.updatedAt instanceof Date
            ? entry.updatedAt
            : new Date(entry.updatedAt);

        addWrappedLine(
          lines,
          `${index + 1}. ${entry.title} - ${formatRating(entry.rating)} - Updated ${formatDate(updatedAt)}`,
          { size: 10.5, indent: 18, gapBefore: 4 },
        );

        if (entry.notes) {
          addWrappedLine(lines, `Notes: ${entry.notes}`, {
            size: 9.5,
            indent: 34,
            gapBefore: 1,
          });
        }
      });
    }
  }

  return lines;
}

function renderPage(lines: PdfLine[], pageNumber: number, totalPages: number) {
  const commands: string[] = [];
  let y = topY;

  for (const line of lines) {
    y -= line.gapBefore ?? 0;
    const size = line.size ?? 10;
    const font = line.bold ? "F2" : "F1";
    const x = marginX + (line.indent ?? 0);

    commands.push(`BT /${font} ${size} Tf ${x} ${y} Td (${escapePdfText(line.text)}) Tj ET`);
    y -= Math.max(12, size + 5);
  }

  commands.push(
    `BT /F1 8 Tf ${marginX} 28 Td (${escapePdfText(`Viremo - Page ${pageNumber} of ${totalPages}`)}) Tj ET`,
  );

  return commands.join("\n");
}

function paginate(lines: PdfLine[]) {
  const pages: PdfLine[][] = [];
  let current: PdfLine[] = [];
  let y = topY;

  for (const line of lines) {
    const size = line.size ?? 10;
    const height = (line.gapBefore ?? 0) + Math.max(12, size + 5);

    if (current.length && y - height < bottomY) {
      pages.push(current);
      current = [];
      y = topY;
    }

    current.push(line);
    y -= height;
  }

  if (current.length) {
    pages.push(current);
  }

  return pages.length ? pages : [[]];
}

function createPdfDocument(pageStreams: string[]) {
  const objects: string[] = [];
  const pageObjectIds: number[] = [];
  const contentObjectIds: number[] = [];

  objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[3] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";
  objects[4] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>";

  let nextObjectId = 5;

  for (const stream of pageStreams) {
    const pageId = nextObjectId++;
    const contentId = nextObjectId++;
    pageObjectIds.push(pageId);
    contentObjectIds.push(contentId);

    objects[pageId] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentId} 0 R >>`;
    objects[contentId] = `<< /Length ${Buffer.byteLength(stream, "latin1")} >>\nstream\n${stream}\nendstream`;
  }

  objects[2] = `<< /Type /Pages /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageObjectIds.length} >>`;

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [0];

  for (let id = 1; id < objects.length; id += 1) {
    offsets[id] = Buffer.byteLength(pdf, "latin1");
    pdf += `${id} 0 obj\n${objects[id]}\nendobj\n`;
  }

  const xrefOffset = Buffer.byteLength(pdf, "latin1");
  pdf += `xref\n0 ${objects.length}\n`;
  pdf += "0000000000 65535 f \n";

  for (let id = 1; id < objects.length; id += 1) {
    pdf += `${String(offsets[id]).padStart(10, "0")} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(pdf, "latin1");
}

export function generateDiaryReportPdf(input: DiaryReportInput) {
  const lines = buildReportLines(input);
  const pages = paginate(lines);
  const streams = pages.map((pageLines, index) =>
    renderPage(pageLines, index + 1, pages.length),
  );

  return createPdfDocument(streams);
}
