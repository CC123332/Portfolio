import * as THREE from "three";
import React from "react";

function mat4Rows(M) {
  const e = M.elements; // three.js Matrix4 is column-major
  // return row-major rows for display and computations
  return [
    [e[0], e[4], e[8],  e[12]],
    [e[1], e[5], e[9],  e[13]],
    [e[2], e[6], e[10], e[14]],
    [e[3], e[7], e[11], e[15]],
  ];
}

function fmtNum(n) {
  // tighter + consistent formatting for the HUD
  const s = n.toFixed(3);
  return n >= 0 ? ` ${s}` : s;
}

export function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

export function fmtVec3(v) {
  return `(${v.x.toFixed(3)}, ${v.y.toFixed(3)}, ${v.z.toFixed(3)})`;
}

export function fmtMat4(M) {
  const r = mat4Rows(M);
  return (
    `[ ${fmtNum(r[0][0])} ${fmtNum(r[0][1])} ${fmtNum(r[0][2])} ${fmtNum(r[0][3])} ]\n` +
    `[ ${fmtNum(r[1][0])} ${fmtNum(r[1][1])} ${fmtNum(r[1][2])} ${fmtNum(r[1][3])} ]\n` +
    `[ ${fmtNum(r[2][0])} ${fmtNum(r[2][1])} ${fmtNum(r[2][2])} ${fmtNum(r[2][3])} ]\n` +
    `[ ${fmtNum(r[3][0])} ${fmtNum(r[3][1])} ${fmtNum(r[3][2])} ${fmtNum(r[3][3])} ]`
  );
}

export function calcMatMulProcess(M, p /* Vector3 or {x,y,z} */) {
  const r = mat4Rows(M); // rows: [[..],[..],[..],[..]]
  const x = p.x, y = p.y, z = p.z, w = 1;

  const dotLine = (row, label) => {
    const out = row[0] * x + row[1] * y + row[2] * z + row[3] * w;
    return (
      `${label} = ` +
      `${fmtNum(row[0])}*${fmtNum(x)} + ` +
      `${fmtNum(row[1])}*${fmtNum(y)} + ` +
      `${fmtNum(row[2])}*${fmtNum(z)} + ` +
      `${fmtNum(row[3])}*${fmtNum(w)} ` +
      `= ${fmtNum(out)}`
    );
  };

  return [
    `p_h = (${fmtNum(x)}, ${fmtNum(y)}, ${fmtNum(z)}, ${fmtNum(w)})`,
    ``,
    dotLine(r[0], "x'"),
    dotLine(r[1], "y'"),
    dotLine(r[2], "z'"),
    dotLine(r[3], "w'"),
  ].join("\n");
}

export function calcWorldProcess(M, pLocal) {
  const r = mat4Rows(M);
  const x = pLocal.x;
  const y = pLocal.y;
  const z = pLocal.z;
  const w = 1;

  const xw = r[0][0] * x + r[0][1] * y + r[0][2] * z + r[0][3] * w;
  const yw = r[1][0] * x + r[1][1] * y + r[1][2] * z + r[1][3] * w;
  const zw = r[2][0] * x + r[2][1] * y + r[2][2] * z + r[2][3] * w;
  const ww = r[3][0] * x + r[3][1] * y + r[3][2] * z + r[3][3] * w;

  const line = (row, out, label) => {
    return (
      `${label} = ` +
      `${fmtNum(row[0])}*${fmtNum(x)} + ` +
      `${fmtNum(row[1])}*${fmtNum(y)} + ` +
      `${fmtNum(row[2])}*${fmtNum(z)} + ` +
      `${fmtNum(row[3])}*${fmtNum(w)} ` +
      `= ${fmtNum(out)}`
    );
  };

  return [
    `p_local_h = (${fmtNum(x)}, ${fmtNum(y)}, ${fmtNum(z)}, ${fmtNum(w)})`,
    "",
    line(r[0], xw, "x_world"),
    line(r[1], yw, "y_world"),
    line(r[2], zw, "z_world"),
    line(r[3], ww, "w'"),
  ].join("\n");
}

// Build Minv analytically from TRS (uses your actual quat, s, t)
export function describeMinvBuild({ t, s, quat, Minv }) {
  const x = quat.x, y = quat.y, z = quat.z, w = quat.w;

  // same precompute as before (three.js style)
  const x2 = x + x, y2 = y + y, z2 = z + z;
  const xx = x * x2, xy = x * y2, xz = x * z2;
  const yy = y * y2, yz = y * z2, zz = z * z2;
  const wx = w * x2, wy = w * y2, wz = w * z2;

  // R (row-major)
  const r00 = 1 - (yy + zz), r01 = xy - wz,     r02 = xz + wy;
  const r10 = xy + wz,       r11 = 1 - (xx+zz), r12 = yz - wx;
  const r20 = xz - wy,       r21 = yz + wx,     r22 = 1 - (xx+yy);

  // inv scale
  const isx = 1 / s.x, isy = 1 / s.y, isz = 1 / s.z;

  // A = R * S (column scaling). A^{-1} = S^{-1} * R^T
  // R^T (row-major) entries:
  // [r00 r10 r20;
  //  r01 r11 r21;
  //  r02 r12 r22]
  //
  // Multiply on the left by S^{-1} scales rows:
  const a00 = isx * r00, a01 = isx * r10, a02 = isx * r20;
  const a10 = isy * r01, a11 = isy * r11, a12 = isy * r21;
  const a20 = isz * r02, a21 = isz * r12, a22 = isz * r22;

  // translation part of inverse: -A^{-1} * t
  const tx = t.x, ty = t.y, tz = t.z;
  const itx = -(a00 * tx + a01 * ty + a02 * tz);
  const ity = -(a10 * tx + a11 * ty + a12 * tz);
  const itz = -(a20 * tx + a21 * ty + a22 * tz);

  const mul = (a, b) => `${fmtNum(a)} * ${fmtNum(b)} = ${fmtNum(a * b)}`;

  return [
    `// Analytic inverse for TRS`,
    `// If M = [ A    t ][ 0    1 ]`,
    `// M^{-1} = [ A^{-1}  -A^{-1}t ][ 0   1 ]`,
    ``,
    `// A = R * S, so A^{-1} = S^{-1} * R^T`,
    `S^{-1} = diag(${fmtNum(isx)}, ${fmtNum(isy)}, ${fmtNum(isz)})`,
    ``,
    `// A^{-1} = S^{-1} * R^T`,
    `a00 = (1/sx)*r00 → ${mul(isx, r00)}`,
    `a01 = (1/sx)*r10 → ${mul(isx, r10)}`,
    `a02 = (1/sx)*r20 → ${mul(isx, r20)}`,
    ``,
    `a10 = (1/sy)*r01 → ${mul(isy, r01)}`,
    `a11 = (1/sy)*r11 → ${mul(isy, r11)}`,
    `a12 = (1/sy)*r21 → ${mul(isy, r21)}`,
    ``,
    `a20 = (1/sz)*r02 → ${mul(isz, r02)}`,
    `a21 = (1/sz)*r12 → ${mul(isz, r12)}`,
    `a22 = (1/sz)*r22 → ${mul(isz, r22)}`,
    ``,
    `// inv translation = -A^{-1} * t`,
    `invTx = -(a00*tx + a01*ty + a02*tz) = ${fmtNum(itx)}`,
    `invTy = -(a10*tx + a11*ty + a12*tz) = ${fmtNum(ity)}`,
    `invTz = -(a20*tx + a21*ty + a22*tz) = ${fmtNum(itz)}`,
    ``,
    `M^{-1} =`,
    `[ ${fmtNum(a00)} ${fmtNum(a01)} ${fmtNum(a02)} ${fmtNum(itx)} ]`,
    `[ ${fmtNum(a10)} ${fmtNum(a11)} ${fmtNum(a12)} ${fmtNum(ity)} ]`,
    `[ ${fmtNum(a20)} ${fmtNum(a21)} ${fmtNum(a22)} ${fmtNum(itz)} ]`,
    `[  0.000  0.000  0.000  1.000 ]`,
    ``,
  ].join("\n");
}

export function describeMBuildJSX({ t, rDeg, s, quat, M }) {
  // ===== color helpers (DOM/React) =====
  const inputColor = {
    tx: "#ff4d4f",
    ty: "#52c41a",
    tz: "#fadb14",

    sx: "#1677ff",
    sy: "#c41d7f",
    sz: "#13c2c2",

    x:  "#ff4d4f",
    y:  "#52c41a",
    z:  "#1677ff",
    w:  "#c41d7f",

    ex: "#13c2c2",
    ey: "#fadb14",
    ez: "#8c8c8c",
  };

  const SP = (text, colorKey) => (
    <span style={colorKey ? { color: inputColor[colorKey] } : undefined}>
      {text}
    </span>
  );
  
  const inNum = (colorKey, v) => SP(fmtNum(v), colorKey);
  const num = (v) => SP(fmtNum(v), null);


  // join pieces into a line (array of strings/spans)
  const line = (...parts) => parts.flat();

  // ===== math =====
  const ex = THREE.MathUtils.degToRad(rDeg.x);
  const ey = THREE.MathUtils.degToRad(rDeg.y);
  const ez = THREE.MathUtils.degToRad(rDeg.z);

  const x = quat.x, y = quat.y, z = quat.z, w = quat.w;

  const x2 = x + x, y2 = y + y, z2 = z + z;

  const xx = x * x2, xy = x * y2, xz = x * z2;
  const yy = y * y2, yz = y * z2, zz = z * z2;
  const wx = w * x2, wy = w * y2, wz = w * z2;

  const r00 = 1 - (yy + zz);
  const r01 = xy - wz;
  const r02 = xz + wy;

  const r10 = xy + wz;
  const r11 = 1 - (xx + zz);
  const r12 = yz - wx;

  const r20 = xz - wy;
  const r21 = yz + wx;
  const r22 = 1 - (xx + yy);

  const sx = s.x, sy = s.y, sz = s.z;
  const tx = t.x, ty = t.y, tz = t.z;

  // ===== formatting helpers that return “parts” =====
  const mulParts = (a, b, bKey) =>
    line(num(a), " * ", bKey ? inNum(bKey, b) : num(b), " = ", num(a * b));

  const plusStr = (a, b) => `${fmtNum(a)} + ${fmtNum(b)}`;
  const minusStr = (a, b) => `${fmtNum(a)} - ${fmtNum(b)}`;

  const Rexpr = {
    r00: `1 - (yy + zz)`,
    r01: `xy - wz`,
    r02: `xz + wy`,

    r10: `xy + wz`,
    r11: `1 - (xx + zz)`,
    r12: `yz - wx`,

    r20: `xz - wy`,
    r21: `yz + wx`,
    r22: `1 - (xx + yy)`,
  };

  const e1Str = (name, exprStr, result) =>
    `${name} = ${exprStr} = ${fmtNum(result)}`;

  const row3Expanded = (aName, bName, cName, aVal, bVal, cVal) =>
    `[ ${e1Str(aName, Rexpr[aName], aVal)} | ${e1Str(bName, Rexpr[bName], bVal)} | ${e1Str(cName, Rexpr[cName], cVal)} ]`;

  const row3Nums = (a, b, c) => `[ ${fmtNum(a)} ${fmtNum(b)} ${fmtNum(c)} ]`;

  // Build lines as arrays of parts, then render with <br/>
  const lines = [
    line("// Inputs"),
    line("t = (", inNum("tx", tx), ", ", inNum("ty", ty), ", ", inNum("tz", tz), ")"),
    line(
      "rDeg = (",
      `${rDeg.x.toFixed(1)}°`,
      ", ",
      `${rDeg.y.toFixed(1)}°`,
      ", ",
      `${rDeg.z.toFixed(1)}°`,
      ")"
    ),
    line("euler(rad) = (", inNum("ex", ex), ", ", inNum("ey", ey), ", ", inNum("ez", ez), ")"),
    line("quat = (", inNum("x", x), ", ", inNum("y", y), ", ", inNum("z", z), ", ", inNum("w", w), ")"),
    line("s = (", inNum("sx", sx), ", ", inNum("sy", sy), ", ", inNum("sz", sz), ")"),
    line(""),

    line("x2 = x * 2 = ", inNum("x", x), " * 2 = ", num(x2)),
    line("y2 = y * 2 = ", inNum("y", y), " * 2 = ", num(y2)),
    line("z2 = z * 2 = ", inNum("z", z), " * 2 = ", num(z2)),
    line(""),

    line("xx = x * x2 = ", inNum("x", x), " * ", num(x2), " = ", num(xx)),
    line("xy = x * y2 = ", inNum("x", x), " * ", num(y2), " = ", num(xy)),
    line("xz = x * z2 = ", inNum("x", x), " * ", num(z2), " = ", num(xz)),
    line(""),

    line("yy = y * y2 = ", inNum("y", y), " * ", num(y2), " = ", num(yy)),
    line("yz = y * z2 = ", inNum("y", y), " * ", num(z2), " = ", num(yz)),
    line("zz = z * z2 = ", inNum("z", z), " * ", num(z2), " = ", num(zz)),
    line(""),

    line("wx = w * x2 = ", inNum("w", w), " * ", num(x2), " = ", num(wx)),
    line("wy = w * y2 = ", inNum("w", w), " * ", num(y2), " = ", num(wy)),
    line("wz = w * z2 = ", inNum("w", w), " * ", num(z2), " = ", num(wz)),
    line(""),

    line("// Step 1: Rotation matrix R (entries expanded)"),
    line("R ="),
    line(row3Expanded("r00", "r01", "r02", r00, r01, r02)),
    line(row3Expanded("r10", "r11", "r12", r10, r11, r12)),
    line(row3Expanded("r20", "r21", "r22", r20, r21, r22)),
    line(""),
    line("// R (numbers)"),
    line(row3Nums(r00, r01, r02)),
    line(row3Nums(r10, r11, r12)),
    line(row3Nums(r20, r21, r22)),
    line(""),

    line("// Step 2: Apply scale (column-wise)"),
    line("RS[0,0] = r00 * sx → ", ...mulParts(r00, sx, "sx")),
    line("RS[0,1] = r01 * sy → ", ...mulParts(r01, sy, "sy")),
    line("RS[0,2] = r02 * sz → ", ...mulParts(r02, sz, "sz")),
    line(""),
    line("RS[1,0] = r10 * sx → ", ...mulParts(r10, sx, "sx")),
    line("RS[1,1] = r11 * sy → ", ...mulParts(r11, sy, "sy")),
    line("RS[1,2] = r12 * sz → ", ...mulParts(r12, sz, "sz")),
    line(""),
    line("RS[2,0] = r20 * sx → ", ...mulParts(r20, sx, "sx")),
    line("RS[2,1] = r21 * sy → ", ...mulParts(r21, sy, "sy")),
    line("RS[2,2] = r22 * sz → ", ...mulParts(r22, sz, "sz")),
    line(""),

    line("// Step 3: Insert translation"),
    line("M ="),
    line("[ ", num(r00 * sx), " ", num(r01 * sy), " ", num(r02 * sz), " ", inNum("tx", tx), " ]"),
    line("[ ", num(r10 * sx), " ", num(r11 * sy), " ", num(r12 * sz), " ", inNum("ty", ty), " ]"),
    line("[ ", num(r20 * sx), " ", num(r21 * sy), " ", num(r22 * sz), " ", inNum("tz", tz), " ]"),
    line("[  0.000  0.000  0.000  1.000 ]"),
    line(""),

    line("// three.js Matrix4 (actual)"),
    line(fmtMat4(M)), // (string) you can also split+render if you want per-number styling
  ];

  return (
    <>
      {lines.map((parts, i) => {
        const arr = Array.isArray(parts) ? parts : [parts];

        return (
          <React.Fragment key={`line-${i}`}>
            {arr.map((p, j) =>
              typeof p === "string" ? (
                <React.Fragment key={`p-${i}-${j}`}>{p}</React.Fragment>
              ) : React.isValidElement(p) ? (
                React.cloneElement(p, { key: `p-${i}-${j}` })
              ) : (
                <React.Fragment key={`p-${i}-${j}`}>{String(p)}</React.Fragment>
              )
            )}
            <br />
          </React.Fragment>
        );
      })}
    </>
  );
}
