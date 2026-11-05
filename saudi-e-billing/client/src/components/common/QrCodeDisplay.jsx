import React, { useMemo } from 'react';
import { generateSaudiQrData } from '../../utils/formatters';

export const QrCodeDisplay = ({
  sellerName,
  vatNumber,
  invoiceTimestamp,
  invoiceTotal,
  vatTotal,
  size = 110,
  className = '',
}) => {
  // Generate base64 TLV string
  const base64Data = useMemo(() => {
    return generateSaudiQrData({
      sellerName,
      vatNumber,
      invoiceTimestamp,
      invoiceTotal,
      vatTotal,
    });
  }, [sellerName, vatNumber, invoiceTimestamp, invoiceTotal, vatTotal]);

  // Generate deterministic grid pattern for authentic QR appearance
  const grid = useMemo(() => {
    const gridSize = 21; // standard QR dimension
    const matrix = Array.from({ length: gridSize }, () => Array(gridSize).fill(0));

    // Corner Finder Patterns
    const drawFinder = (startX, startY) => {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          if (
            r === 0 ||
            r === 6 ||
            c === 0 ||
            c === 6 ||
            (r >= 2 && r <= 4 && c >= 2 && c <= 4)
          ) {
            matrix[startY + r][startX + c] = 1;
          }
        }
      }
    };

    drawFinder(0, 0);
    drawFinder(gridSize - 7, 0);
    drawFinder(0, gridSize - 7);

    // Timing lines
    for (let i = 8; i < gridSize - 8; i++) {
      if (i % 2 === 0) {
        matrix[6][i] = 1;
        matrix[i][6] = 1;
      }
    }

    // Fill data area pseudo-deterministically from base64 string
    let charIdx = 0;
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        // Skip corner finder zones
        const inFinder =
          (r < 8 && c < 8) ||
          (r < 8 && c >= gridSize - 8) ||
          (r >= gridSize - 8 && c < 8);
        if (!inFinder && matrix[r][c] === 0) {
          const charCode = base64Data.charCodeAt(charIdx % base64Data.length) || 42;
          charIdx++;
          if ((charCode + r * 7 + c * 13) % 3 === 0) {
            matrix[r][c] = 1;
          }
        }
      }
    }

    return { gridSize, matrix };
  }, [base64Data]);

  const cell = size / grid.gridSize;

  return (
    <div
      className={`qr-code-wrapper ${className}`}
      title={`Saudi E-Billing QR Data:\n${base64Data.slice(0, 32)}...`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="qr-svg"
        shapeRendering="crispEdges"
      >
        <rect width={size} height={size} fill="#ffffff" />
        {grid.matrix.map((row, r) =>
          row.map((val, c) =>
            val === 1 ? (
              <rect
                key={`${r}-${c}`}
                x={c * cell}
                y={r * cell}
                width={cell}
                height={cell}
                fill="#0f2e22"
              />
            ) : null
          )
        )}
      </svg>
      <span className="qr-caption">KSA Tax QR</span>
    </div>
  );
};

