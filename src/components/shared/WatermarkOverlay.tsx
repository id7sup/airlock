"use client";

import { useEffect, useState } from "react";

interface WatermarkOverlayProps {
  /** Text to display in watermark */
  text?: string;
  /** Secondary text (smaller, below main text) */
  subText?: string;
  /** Opacity of the watermark (0-1) */
  opacity?: number;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Whether to use dark text (for light backgrounds) */
  darkText?: boolean;
  /** Additional class names */
  className?: string;
}

export default function WatermarkOverlay({
  text = "CONFIDENTIEL",
  subText,
  opacity = 0.15,
  size = "md",
  darkText = false,
  className = "",
}: WatermarkOverlayProps) {
  const [timestamp, setTimestamp] = useState<string>("");

  useEffect(() => {
    // Generate timestamp on client side only
    const now = new Date();
    setTimestamp(
      now.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  }, []);

  const fontSize = {
    sm: "text-[10px]",
    md: "text-xs",
    lg: "text-sm",
  }[size];

  const spacing = {
    sm: "gap-[120px]",
    md: "gap-[180px]",
    lg: "gap-[240px]",
  }[size];

  const rowSpacing = {
    sm: "gap-y-[80px]",
    md: "gap-y-[120px]",
    lg: "gap-y-[160px]",
  }[size];

  const textColor = darkText ? "text-black" : "text-white";

  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none select-none ${className}`}
      style={{ zIndex: 50 }}
      aria-hidden="true"
    >
      {/* Diagonal pattern overlay */}
      <div
        className="absolute inset-0"
        style={{
          transform: "rotate(-35deg) scale(1.5)",
          transformOrigin: "center center",
        }}
      >
        <div className={`flex flex-col ${rowSpacing} -mt-[200px] -ml-[200px]`}>
          {Array.from({ length: 15 }).map((_, rowIndex) => (
            <div
              key={rowIndex}
              className={`flex ${spacing}`}
              style={{
                marginLeft: rowIndex % 2 === 0 ? "0" : "90px",
              }}
            >
              {Array.from({ length: 12 }).map((_, colIndex) => (
                <div
                  key={colIndex}
                  className={`flex flex-col items-center whitespace-nowrap ${textColor} ${fontSize} font-semibold tracking-wider`}
                  style={{ opacity }}
                >
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-3 h-3"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 6c1.4 0 2.8 1.1 2.8 2.5V11c.6 0 1.2.6 1.2 1.3v3.5c0 .6-.6 1.2-1.3 1.2H9.2c-.6 0-1.2-.6-1.2-1.3v-3.5c0-.6.6-1.2 1.2-1.2V9.5C9.2 8.1 10.6 7 12 7zm0 1.2c-.8 0-1.5.5-1.5 1.3V11h3V9.5c0-.8-.7-1.3-1.5-1.3z" />
                    </svg>
                    <span>{text}</span>
                  </div>
                  {(subText || timestamp) && (
                    <span
                      className="text-[8px] mt-0.5 font-normal tracking-normal"
                      style={{ opacity: 0.7 }}
                    >
                      {subText || `AIRLOCK • ${timestamp}`}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Corner badges */}
      <div
        className={`absolute top-4 left-4 flex items-center gap-1.5 px-2 py-1 rounded ${
          darkText ? "bg-black/5" : "bg-white/5"
        } ${textColor} ${fontSize}`}
        style={{ opacity: opacity * 1.5 }}
      >
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
        </svg>
        <span className="font-medium">LECTURE SEULE</span>
      </div>

      <div
        className={`absolute bottom-4 right-4 flex items-center gap-1.5 px-2 py-1 rounded ${
          darkText ? "bg-black/5" : "bg-white/5"
        } ${textColor} ${fontSize}`}
        style={{ opacity: opacity * 1.5 }}
      >
        <span className="font-medium">AIRLOCK SECURE</span>
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
        </svg>
      </div>
    </div>
  );
}

/**
 * Apply watermark to a canvas context (for images)
 * This is used by SecureCanvas for direct canvas rendering
 */
export function applyCanvasWatermark(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  options?: {
    text?: string;
    opacity?: number;
    darkText?: boolean;
  }
): void {
  const {
    text = "CONFIDENTIEL",
    opacity = 0.12,
    darkText = false,
  } = options || {};

  ctx.save();

  const diagonal = Math.sqrt(width * width + height * height);
  const fontSize = Math.max(12, Math.min(28, diagonal / 30));

  // Set up text style
  ctx.font = `600 ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
  ctx.fillStyle = darkText
    ? `rgba(0, 0, 0, ${opacity})`
    : `rgba(255, 255, 255, ${opacity})`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Rotate canvas
  ctx.translate(width / 2, height / 2);
  ctx.rotate((-35 * Math.PI) / 180);

  const spacing = fontSize * 8;
  const rowSpacing = fontSize * 5;

  // Draw watermark pattern
  for (let y = -diagonal; y < diagonal; y += rowSpacing) {
    const offset = Math.floor(y / rowSpacing) % 2 === 0 ? 0 : spacing / 2;
    for (let x = -diagonal + offset; x < diagonal; x += spacing) {
      // Draw shield icon (simplified)
      ctx.beginPath();
      const iconSize = fontSize * 0.6;
      ctx.moveTo(x - iconSize / 2, y - fontSize * 0.3);
      ctx.lineTo(x - iconSize / 2, y + iconSize * 0.3);
      ctx.quadraticCurveTo(x, y + iconSize * 0.6, x + iconSize / 2, y + iconSize * 0.3);
      ctx.lineTo(x + iconSize / 2, y - fontSize * 0.3);
      ctx.closePath();
      ctx.fill();

      // Draw text
      ctx.fillText(text, x + iconSize, y);

      // Draw subtext
      ctx.save();
      ctx.font = `400 ${fontSize * 0.5}px -apple-system, BlinkMacSystemFont, sans-serif`;
      ctx.fillStyle = darkText
        ? `rgba(0, 0, 0, ${opacity * 0.7})`
        : `rgba(255, 255, 255, ${opacity * 0.7})`;
      ctx.fillText("AIRLOCK SECURE", x + iconSize, y + fontSize * 0.7);
      ctx.restore();
    }
  }

  // Corner badges
  ctx.restore();
  ctx.save();

  // Top left badge
  ctx.font = `600 ${Math.max(10, fontSize * 0.5)}px -apple-system, BlinkMacSystemFont, sans-serif`;
  ctx.fillStyle = darkText
    ? `rgba(0, 0, 0, ${opacity * 2})`
    : `rgba(255, 255, 255, ${opacity * 2})`;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText("LECTURE SEULE", 20, 20);

  // Bottom right badge
  ctx.textAlign = "right";
  ctx.textBaseline = "bottom";
  ctx.fillText("AIRLOCK SECURE", width - 20, height - 20);

  ctx.restore();
}
