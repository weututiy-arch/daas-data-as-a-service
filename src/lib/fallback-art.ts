type AspectRatio = "1:1" | "3:4" | "4:3" | "9:16" | "16:9";
export type FallbackVariant = "hero" | "course" | "square" | "brand" | "portrait";

const SIZE_MAP: Record<AspectRatio, { width: number; height: number }> = {
  "1:1": { width: 1200, height: 1200 },
  "3:4": { width: 1200, height: 1600 },
  "4:3": { width: 1600, height: 1200 },
  "9:16": { width: 900, height: 1600 },
  "16:9": { width: 1600, height: 900 },
};

const PALETTES = [
  {
    backgroundStart: "#08111F",
    backgroundEnd: "#141B2D",
    accentPrimary: "#FF2E63",
    accentSecondary: "#08D9D6",
    accentSoft: "#223553",
  },
  {
    backgroundStart: "#0D1728",
    backgroundEnd: "#1A2035",
    accentPrimary: "#F55174",
    accentSecondary: "#1FC7C5",
    accentSoft: "#2E3F5C",
  },
  {
    backgroundStart: "#111827",
    backgroundEnd: "#1E293B",
    accentPrimary: "#FF4D6D",
    accentSecondary: "#4FE3E1",
    accentSoft: "#334155",
  },
];

const hashString = (value: string) =>
  Array.from(value).reduce((acc, char) => acc + char.charCodeAt(0), 0);

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const wrapText = (value: string, maxChars: number, maxLines: number) => {
  const words = value.trim().split(/\s+/);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length <= maxChars) {
      current = next;
      continue;
    }

    if (current) {
      lines.push(current);
    }
    current = word;

    if (lines.length === maxLines - 1) {
      break;
    }
  }

  if (current && lines.length < maxLines) {
    lines.push(current);
  }

  if (lines.length === 0) {
    lines.push(value);
  }

  const consumedWords = lines.join(" ").split(/\s+/).length;
  if (consumedWords < words.length) {
    lines[lines.length - 1] = `${lines[lines.length - 1].replace(/[.,;:!?]?$/, "")}...`;
  }

  return lines;
};

const renderTextLines = (
  lines: string[],
  x: number,
  y: number,
  fontSize: number,
  lineHeight: number,
  weight: number,
  color: string
) =>
  lines
    .map(
      (line, index) =>
        `<text x="${x}" y="${y + index * lineHeight}" fill="${color}" font-family="Outfit, Inter, Arial, sans-serif" font-size="${fontSize}" font-weight="${weight}" letter-spacing="-0.02em">${escapeXml(line)}</text>`
    )
    .join("");

export const buildFallbackArtDataUrl = ({
  title,
  subtitle,
  aspectRatio = "16:9",
  seed = "daas",
  variant = "hero",
}: {
  title: string;
  subtitle?: string;
  aspectRatio?: AspectRatio;
  seed?: string;
  variant?: FallbackVariant;
}) => {
  const { width, height } = SIZE_MAP[aspectRatio];
  const palette = PALETTES[hashString(seed) % PALETTES.length];
  const titleLines = wrapText(title, variant === "course" ? 22 : 20, 3);
  const subtitleLines = wrapText(subtitle || "Professional technology and data solutions", variant === "course" ? 34 : 32, 2);
  const cardWidth = variant === "square" ? width * 0.48 : width * 0.34;
  const cardHeight = variant === "square" ? height * 0.38 : height * 0.56;
  const cardX = width - cardWidth - width * 0.07;
  const cardY = variant === "square" ? height * 0.16 : height * 0.18;
  const label = variant === "course" ? "Learning Path" : variant === "square" ? "AI Data Platform" : "DaaS";

  if (variant === "portrait") {
    const portraitSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none">
        <defs>
          <linearGradient id="portraitBg" x1="0" y1="0" x2="${width}" y2="${height}">
            <stop offset="0%" stop-color="${palette.backgroundStart}" />
            <stop offset="100%" stop-color="${palette.backgroundEnd}" />
          </linearGradient>
          <radialGradient id="portraitGlow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(${width * 0.5} ${height * 0.28}) rotate(90) scale(${height * 0.3} ${width * 0.24})">
            <stop stop-color="${palette.accentSecondary}" stop-opacity="0.28" />
            <stop offset="1" stop-color="${palette.accentSecondary}" stop-opacity="0" />
          </radialGradient>
        </defs>

        <rect width="${width}" height="${height}" fill="url(#portraitBg)" />
        <circle cx="${width * 0.5}" cy="${height * 0.28}" r="${height * 0.12}" fill="rgba(255,255,255,0.78)" />
        <path d="M${width * 0.28} ${height * 0.86} C ${width * 0.34} ${height * 0.62}, ${width * 0.66} ${height * 0.62}, ${width * 0.72} ${height * 0.86}" fill="rgba(255,255,255,0.7)" />
        <circle cx="${width * 0.5}" cy="${height * 0.34}" r="${height * 0.3}" fill="url(#portraitGlow)" />
        <rect x="${width * 0.18}" y="${height * 0.78}" width="${width * 0.64}" height="${height * 0.08}" rx="${height * 0.04}" fill="rgba(255,255,255,0.08)" />
      </svg>
    `;

    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(portraitSvg.replace(/\s+/g, " ").trim())}`;
  }

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="${width}" y2="${height}">
          <stop offset="0%" stop-color="${palette.backgroundStart}" />
          <stop offset="100%" stop-color="${palette.backgroundEnd}" />
        </linearGradient>
        <radialGradient id="glowPrimary" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(${width * 0.82} ${height * 0.2}) rotate(90) scale(${height * 0.45} ${width * 0.32})">
          <stop stop-color="${palette.accentPrimary}" stop-opacity="0.42" />
          <stop offset="1" stop-color="${palette.accentPrimary}" stop-opacity="0" />
        </radialGradient>
        <radialGradient id="glowSecondary" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(${width * 0.18} ${height * 0.82}) rotate(90) scale(${height * 0.42} ${width * 0.3})">
          <stop stop-color="${palette.accentSecondary}" stop-opacity="0.28" />
          <stop offset="1" stop-color="${palette.accentSecondary}" stop-opacity="0" />
        </radialGradient>
      </defs>

      <rect width="${width}" height="${height}" rx="${Math.min(width, height) * 0.04}" fill="url(#bg)" />
      <rect x="${width * 0.04}" y="${height * 0.05}" width="${width * 0.92}" height="${height * 0.9}" rx="${Math.min(width, height) * 0.035}" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.08)" />

      <circle cx="${width * 0.82}" cy="${height * 0.2}" r="${height * 0.34}" fill="url(#glowPrimary)" />
      <circle cx="${width * 0.18}" cy="${height * 0.82}" r="${height * 0.28}" fill="url(#glowSecondary)" />

      <g opacity="0.16">
        <path d="M0 ${height * 0.68} C ${width * 0.18} ${height * 0.58}, ${width * 0.28} ${height * 0.88}, ${width * 0.48} ${height * 0.76} S ${width * 0.8} ${height * 0.54}, ${width} ${height * 0.72}" stroke="white" stroke-width="2"/>
        <path d="M0 ${height * 0.74} C ${width * 0.2} ${height * 0.63}, ${width * 0.32} ${height * 0.92}, ${width * 0.54} ${height * 0.8} S ${width * 0.82} ${height * 0.58}, ${width} ${height * 0.76}" stroke="white" stroke-width="2"/>
      </g>

      <rect x="${width * 0.08}" y="${height * 0.1}" width="${width * 0.16}" height="${height * 0.065}" rx="${height * 0.03}" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.12)" />
      <text x="${width * 0.104}" y="${height * 0.145}" fill="white" fill-opacity="0.92" font-family="Inter, Arial, sans-serif" font-size="${Math.round(height * 0.03)}" font-weight="700" letter-spacing="0.18em">${escapeXml(label.toUpperCase())}</text>

      ${renderTextLines(titleLines, width * 0.08, height * 0.28, Math.round(height * 0.08), Math.round(height * 0.095), 700, "white")}
      ${renderTextLines(subtitleLines, width * 0.08, height * 0.56, Math.round(height * 0.038), Math.round(height * 0.052), 500, "rgba(255,255,255,0.76)")}

      <g>
        <rect x="${cardX}" y="${cardY}" width="${cardWidth}" height="${cardHeight}" rx="${Math.min(width, height) * 0.03}" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)" />
        <rect x="${cardX + cardWidth * 0.1}" y="${cardY + cardHeight * 0.12}" width="${cardWidth * 0.28}" height="${cardHeight * 0.12}" rx="${cardHeight * 0.05}" fill="${palette.accentSecondary}" fill-opacity="0.18" stroke="${palette.accentSecondary}" stroke-opacity="0.35" />
        <rect x="${cardX + cardWidth * 0.1}" y="${cardY + cardHeight * 0.28}" width="${cardWidth * 0.8}" height="${cardHeight * 0.1}" rx="${cardHeight * 0.05}" fill="rgba(255,255,255,0.08)" />
        <rect x="${cardX + cardWidth * 0.1}" y="${cardY + cardHeight * 0.44}" width="${cardWidth * 0.8}" height="${cardHeight * 0.1}" rx="${cardHeight * 0.05}" fill="rgba(255,255,255,0.08)" />
        <rect x="${cardX + cardWidth * 0.1}" y="${cardY + cardHeight * 0.6}" width="${cardWidth * 0.62}" height="${cardHeight * 0.1}" rx="${cardHeight * 0.05}" fill="rgba(255,255,255,0.08)" />
        <circle cx="${cardX + cardWidth * 0.78}" cy="${cardY + cardHeight * 0.8}" r="${cardHeight * 0.09}" fill="${palette.accentPrimary}" fill-opacity="0.18" />
        <circle cx="${cardX + cardWidth * 0.6}" cy="${cardY + cardHeight * 0.8}" r="${cardHeight * 0.06}" fill="${palette.accentSecondary}" fill-opacity="0.25" />
      </g>

      <g>
        <rect x="${width * 0.08}" y="${height * 0.74}" width="${width * 0.18}" height="${height * 0.12}" rx="${Math.min(width, height) * 0.025}" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.1)" />
        <rect x="${width * 0.1}" y="${height * 0.775}" width="${width * 0.09}" height="${height * 0.018}" rx="${height * 0.009}" fill="${palette.accentPrimary}" fill-opacity="0.9" />
        <rect x="${width * 0.1}" y="${height * 0.815}" width="${width * 0.12}" height="${height * 0.018}" rx="${height * 0.009}" fill="rgba(255,255,255,0.2)" />
      </g>

      <g>
        <rect x="${width * 0.29}" y="${height * 0.74}" width="${width * 0.18}" height="${height * 0.12}" rx="${Math.min(width, height) * 0.025}" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.1)" />
        <rect x="${width * 0.31}" y="${height * 0.775}" width="${width * 0.11}" height="${height * 0.018}" rx="${height * 0.009}" fill="${palette.accentSecondary}" fill-opacity="0.9" />
        <rect x="${width * 0.31}" y="${height * 0.815}" width="${width * 0.09}" height="${height * 0.018}" rx="${height * 0.009}" fill="rgba(255,255,255,0.2)" />
      </g>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg.replace(/\s+/g, " ").trim())}`;
};
