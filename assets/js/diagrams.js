// =========================================================
// diagrams.js: draws drill diagrams as SVG, in code.
// Each drill has a `diagram` key (e.g. "slalom"). That key
// picks a LAYOUT below. One function, drawDiagram(), turns a
// layout into a picture: pitch, cones, players and arrows.
//
// The drawing area is 400 wide x 260 high.
//   cones:   [x, y]
//   players: [x, y, "letter", team]  team: a | d | g | s
//   pass:    ball movement: solid white arrow
//   run:     player run without the ball: dashed yellow arrow
//   dribble: player running WITH the ball: wavy white arrow
// A pass/run with 4 numbers is a straight line; with 6 numbers
// it is a curve: [startX, startY, bendX, bendY, endX, endY].
// =========================================================

const LAYOUTS = {
  "gk-serve": {
    goal: "right",
    players: [[370, 130, "G", "g"], [240, 130, "S", "s"]],
    ball: [[256, 136]],
    pass: [[258, 130, 352, 130], [258, 124, 352, 104], [258, 136, 352, 158]],
  },
  "gk-footwork": {
    goal: "right",
    cones: [[378, 106], [378, 154]],
    players: [[368, 130, "G", "g"], [260, 130, "S", "s"]],
    run: [[366, 120, 366, 110], [366, 140, 366, 150]],
    pass: [[276, 128, 352, 112]],
  },
  "gk-dive": {
    goal: "right",
    players: [[370, 125, "G", "g"], [290, 130, "S", "s"]],
    pass: [[306, 134, 376, 168]],
    run: [[370, 138, 372, 160]],
  },
  "gk-distribution": {
    goal: "left",
    cones: [[120, 112], [120, 148], [190, 105], [190, 155], [260, 98], [260, 162]],
    players: [[34, 130, "G", "g"], [330, 130, "A", "a"]],
    pass: [[50, 130, 120, 130], [50, 126, 190, 118], [50, 122, 260, 106]],
    run: [[330, 116, 330, 90]],
  },
  "gk-cross": {
    goal: "right",
    players: [[370, 130, "G", "g"], [290, 32, "A", "a"], [320, 160, "B", "a"]],
    dribble: [[200, 30, 276, 30]],
    pass: [[300, 40, 345, 50, 354, 118]],
    run: [[362, 124, 352, 112]],
  },
  "gk-1v1": {
    goal: "right",
    cones: [[160, 95], [160, 165]],
    players: [[372, 130, "G", "g"], [170, 130, "A", "a"]],
    dribble: [[184, 130, 296, 130]],
    run: [[362, 130, 334, 130]],
  },
  mirror: {
    cones: [[100, 90], [200, 90], [300, 90], [100, 170], [200, 170], [300, 170]],
    line: [[100, 130, 300, 130]],
    players: [[200, 110, "A", "a"], [200, 150, "D", "d"]],
    run: [[188, 110, 130, 110], [212, 110, 270, 110], [188, 150, 130, 150], [212, 150, 270, 150]],
  },
  "passing-pair": {
    cones: [[60, 170], [100, 170], [300, 90], [340, 90]],
    players: [[80, 130, "A", "a"], [320, 130, "B", "a"]],
    pass: [[96, 124, 304, 124], [304, 138, 96, 138]],
    dribble: [[80, 144, 80, 166], [320, 116, 320, 94]],
  },
  "1v1": {
    cones: [[50, 80], [195, 80], [340, 80], [50, 180], [195, 180], [340, 180]],
    line: [[340, 80, 340, 180]],
    players: [[80, 130, "A", "a"], [220, 130, "D", "d"]],
    dribble: [[96, 130, 180, 104, 330, 100]],
    run: [[220, 116, 254, 102]],
  },
  "defend-shape": {
    goal: "right",
    players: [
      [235, 55, "D", "d"], [250, 105, "D", "d"], [250, 155, "D", "d"], [235, 205, "D", "d"],
      [110, 65, "S", "s"],
    ],
    ball: [[124, 74]],
    run: [[222, 58, 150, 66], [246, 118, 232, 92], [248, 168, 246, 138], [240, 192, 252, 172]],
  },
  switch: {
    box: [[40, 180, 60, 60], [300, 20, 60, 60]],
    players: [[70, 210, "A", "a"], [330, 50, "B", "a"]],
    pass: [[84, 200, 200, 30, 316, 56]],
  },
  recovery: {
    goal: "right",
    cones: [[140, 40], [140, 220]],
    players: [[160, 90, "A", "a"], [160, 175, "A", "a"], [100, 130, "D", "d"]],
    dribble: [[176, 175, 270, 165]],
    pass: [[176, 170, 250, 110]],
    run: [[114, 136, 210, 200, 310, 140], [176, 90, 260, 92]],
  },
  crossing: {
    goal: "right",
    cones: [[120, 30], [150, 30], [180, 30], [210, 30], [240, 30], [350, 140]],
    players: [[90, 30, "A", "a"], [290, 175, "B", "a"], [372, 130, "G", "g"]],
    dribble: [[104, 30, 270, 30]],
    pass: [[282, 34, 340, 40, 348, 132]],
    run: [[300, 165, 340, 150]],
  },
  triangle: {
    cones: [[100, 214], [300, 214], [200, 46]],
    players: [[100, 200, "A", "a"], [300, 200, "B", "a"], [200, 62, "C", "a"]],
    pass: [[116, 200, 284, 200], [292, 188, 210, 76], [190, 76, 108, 186]],
  },
  gates: {
    cones: [
      [80, 58], [100, 82], [190, 40], [214, 58], [300, 72], [322, 94],
      [100, 180], [122, 204], [210, 190], [234, 210], [312, 170], [334, 192],
    ],
    players: [[50, 130, "A", "a"]],
    dribble: [[62, 120, 90, 70, 202, 50, 311, 83, 323, 181, 222, 200]],
  },
  turn: {
    cones: [[320, 70], [344, 96], [320, 190], [344, 164]],
    players: [[60, 130, "A", "a"], [200, 130, "B", "a"], [250, 130, "D", "d"]],
    pass: [[76, 130, 184, 130]],
    dribble: [[208, 118, 325, 86]],
  },
  square: {
    cones: [[110, 40], [290, 40], [110, 220], [290, 220]],
    line: [[110, 40, 290, 40], [290, 40, 290, 220], [290, 220, 110, 220], [110, 220, 110, 40]],
    players: [[200, 40, "A", "a"], [290, 130, "A", "a"], [200, 220, "A", "a"], [110, 130, "A", "a"], [200, 130, "D", "d"]],
    pass: [[214, 48, 282, 116], [282, 144, 214, 212], [186, 212, 118, 144]],
    run: [[200, 116, 200, 90]],
  },
  "wall-pass": {
    goal: "right",
    players: [[70, 180, "A", "a"], [180, 90, "B", "a"]],
    pass: [[84, 172, 168, 100], [192, 98, 250, 168], [272, 168, 384, 140]],
    run: [[86, 186, 246, 176]],
  },
  slalom: {
    cones: [[80, 130], [110, 130], [140, 130], [170, 130], [200, 130], [230, 130], [260, 130], [290, 130], [360, 95], [360, 165]],
    players: [[45, 130, "A", "a"]],
    dribble: [[58, 130, 95, 112, 125, 148, 155, 112, 185, 148, 215, 112, 245, 148, 275, 112, 340, 130]],
  },
  shooting: {
    goal: "right",
    cones: [[296, 88], [296, 172]],
    players: [[190, 130, "A", "a"], [372, 130, "G", "g"]],
    dribble: [[204, 130, 270, 118]],
    pass: [[282, 116, 386, 106], [282, 120, 386, 154]],
  },
  overlap: {
    goal: "right",
    players: [[200, 60, "A", "a"], [110, 90, "B", "a"], [372, 130, "G", "g"]],
    pass: [[124, 84, 186, 64], [248, 88, 294, 38], [304, 34, 340, 40, 350, 140]],
    run: [[116, 76, 190, 10, 290, 28], [250, 100, 336, 150]],
    dribble: [[212, 66, 244, 86]],
  },
  "through-ball": {
    goal: "right",
    cones: [[230, 40], [230, 85], [230, 130], [230, 175], [230, 220]],
    players: [[110, 130, "A", "a"], [222, 130, "B", "a"], [245, 100, "D", "d"], [245, 175, "D", "d"]],
    pass: [[126, 130, 312, 116], [330, 114, 386, 124]],
    run: [[222, 144, 260, 150, 318, 120]],
  },
};

// Colours match the brand (see variables.css)
const COLORS = {
  pitch: "#0B6E4F",
  lines: "rgba(247,249,250,0.45)",
  cone: "#7CC6F2",
  pass: "#F6F8FB",
  run: "#A9DCFA",
  team: {
    a: { fill: "#0A1F44", text: "#F6F8FB" }, // attacker / your player
    d: { fill: "#7CC6F2", text: "#0A1F44" }, // defender
    g: { fill: "#A9DCFA", text: "#0A1F44" }, // goalkeeper
    s: { fill: "#F6F8FB", text: "#0A1F44" }, // server / coach
  },
};

let diagramCount = 0; // gives each SVG unique arrow IDs

// Turn a 4-number or 6-number list into an SVG path "d" string.
function linePath(p) {
  if (p.length === 6) return `M${p[0]},${p[1]} Q${p[2]},${p[3]} ${p[4]},${p[5]}`;
  return `M${p[0]},${p[1]} L${p[2]},${p[3]}`;
}

// A wavy line through a list of points = dribbling.
function wavyPath(points) {
  let d = `M${points[0]},${points[1]}`;
  let flip = 1;
  for (let i = 2; i < points.length; i += 2) {
    const x1 = points[i - 2], y1 = points[i - 1];
    const x2 = points[i], y2 = points[i + 1];
    const length = Math.hypot(x2 - x1, y2 - y1);
    const steps = Math.max(2, Math.round(length / 10));
    const nx = -(y2 - y1) / length; // perpendicular direction
    const ny = (x2 - x1) / length;
    for (let s = 1; s <= steps; s++) {
      const t = s / steps;
      const wobble = s === steps ? 0 : 4 * flip;
      flip = -flip;
      const x = x1 + (x2 - x1) * t + nx * wobble;
      const y = y1 + (y2 - y1) * t + ny * wobble;
      d += ` L${x.toFixed(1)},${y.toFixed(1)}`;
    }
  }
  return d;
}

function drawGoal(side) {
  if (side === "right") {
    return `
      <rect x="320" y="55" width="76" height="150" fill="none" stroke="${COLORS.lines}" stroke-width="2"/>
      <rect x="366" y="95" width="30" height="70" fill="none" stroke="${COLORS.lines}" stroke-width="2"/>
      <rect x="390" y="108" width="8" height="44" fill="#F6F8FB"/>`;
  }
  if (side === "left") {
    return `
      <rect x="4" y="55" width="76" height="150" fill="none" stroke="${COLORS.lines}" stroke-width="2"/>
      <rect x="2" y="108" width="8" height="44" fill="#F6F8FB"/>`;
  }
  return "";
}

function drawCone([x, y]) {
  return `<polygon points="${x},${y - 7} ${x - 6},${y + 5} ${x + 6},${y + 5}" fill="${COLORS.cone}" stroke="#0A1F44" stroke-width="1"/>`;
}

function drawPlayer([x, y, letter, team]) {
  const c = COLORS.team[team] || COLORS.team.a;
  return `
    <circle cx="${x}" cy="${y}" r="12" fill="${c.fill}" stroke="#0A1F44" stroke-width="2"/>
    <text x="${x}" y="${y + 5}" text-anchor="middle" font-family="Arial, sans-serif" font-size="13" font-weight="700" fill="${c.text}">${letter}</text>`;
}

function drawBall([x, y]) {
  return `<circle cx="${x}" cy="${y}" r="5" fill="#FFFFFF" stroke="#0A1F44" stroke-width="1.5"/>`;
}

// Main function: returns the SVG as text.
// `description` is read out by screen readers.
export function drawDiagram(key, description = "Drill diagram") {
  const layout = LAYOUTS[key];
  if (!layout) return `<p class="muted">No diagram for this drill yet.</p>`;
  diagramCount += 1;
  const id = `dg${diagramCount}`;

  const parts = [];
  // Pitch background and halfway-style markings
  parts.push(`<rect width="400" height="260" rx="10" fill="${COLORS.pitch}"/>`);
  parts.push(`<rect x="4" y="4" width="392" height="252" rx="8" fill="none" stroke="${COLORS.lines}" stroke-width="2"/>`);
  parts.push(drawGoal(layout.goal));
  (layout.box || []).forEach(([x, y, w, h]) =>
    parts.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="rgba(255,200,87,0.15)" stroke="${COLORS.run}" stroke-width="2" stroke-dasharray="4 3"/>`));
  (layout.line || []).forEach((p) =>
    parts.push(`<path d="${linePath(p)}" stroke="${COLORS.lines}" stroke-width="2" fill="none"/>`));

  (layout.cones || []).forEach((c) => parts.push(drawCone(c)));

  (layout.pass || []).forEach((p) =>
    parts.push(`<path d="${linePath(p)}" stroke="${COLORS.pass}" stroke-width="2.5" fill="none" marker-end="url(#${id}-pass)"/>`));
  (layout.run || []).forEach((p) =>
    parts.push(`<path d="${linePath(p)}" stroke="${COLORS.run}" stroke-width="2.5" stroke-dasharray="6 4" fill="none" marker-end="url(#${id}-run)"/>`));
  (layout.dribble || []).forEach((p) =>
    parts.push(`<path d="${wavyPath(p)}" stroke="${COLORS.pass}" stroke-width="2" fill="none" marker-end="url(#${id}-pass)"/>`));

  (layout.ball || []).forEach((b) => parts.push(drawBall(b)));
  (layout.players || []).forEach((p) => parts.push(drawPlayer(p)));

  return `
    <svg class="diagram" viewBox="0 0 400 260" role="img" aria-labelledby="${id}-title">
      <title id="${id}-title">${description}</title>
      <defs>
        <marker id="${id}-pass" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill="${COLORS.pass}"/>
        </marker>
        <marker id="${id}-run" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill="${COLORS.run}"/>
        </marker>
      </defs>
      ${parts.join("")}
    </svg>`;
}

// The key/legend shown under every diagram. Uses words AND
// shapes, so colour is never the only way to understand it.
export function diagramLegend() {
  return `
    <ul class="diagram-legend">
      <li><svg viewBox="0 0 30 12" aria-hidden="true"><line x1="0" y1="6" x2="24" y2="6" stroke="#0A1F44" stroke-width="2.5"/><path d="M22,1 L30,6 L22,11z" fill="#0A1F44"/></svg> Solid line = pass or shot</li>
      <li><svg viewBox="0 0 30 12" aria-hidden="true"><line x1="0" y1="6" x2="24" y2="6" stroke="#0B5C8E" stroke-width="2.5" stroke-dasharray="5 3"/><path d="M22,1 L30,6 L22,11z" fill="#0B5C8E"/></svg> Dashed line = run without the ball</li>
      <li><svg viewBox="0 0 30 12" aria-hidden="true"><path d="M0,6 L4,2 L8,10 L12,2 L16,10 L20,2 L24,6" stroke="#0A1F44" stroke-width="2" fill="none"/><path d="M22,1 L30,6 L22,11z" fill="#0A1F44"/></svg> Wavy line = dribble</li>
      <li><svg viewBox="0 0 14 14" aria-hidden="true"><polygon points="7,1 1,13 13,13" fill="#7CC6F2" stroke="#0A1F44"/></svg> Triangle = cone</li>
      <li>Letters: A, B, C = players · D = defender · G = goalkeeper · S = server/coach</li>
    </ul>`;
}

export const DIAGRAM_KEYS = Object.keys(LAYOUTS);
