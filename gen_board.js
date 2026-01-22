
const fs = require('fs');

// Helpers for board geometry
const getXY = (n) => {
    // 1-100 to row/col
    // Row 0 is bottom (1-10), Row 9 is top (91-100)
    // Actually standard board usually has 1 at bottom left.
    // My renderBoard() loop:
    /*
    for (let row = 9; row >= 0; row--) {
       ...
       rowStart = row * 10 + 1;
       ...
    }
    */
    // Let's stick to 0-9 for x,y where 0,0 is bottom left (1)
    const row0 = Math.floor((n - 1) / 10);
    const col0 = (n - 1) % 10;

    // Boustrophedon
    // If row is even (0, 2, ...), left to right (0 -> 9)
    // If row is odd (1, 3, ...), right to left (9 -> 0)
    let x = (row0 % 2 === 0) ? col0 : (9 - col0);
    let y = row0;

    return { x, y };
};

const dist = (p1, p2) => Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));

const intersect = (a, b, c, d) => {
    // Segment AB and CD
    const det = (b.x - a.x) * (d.y - c.y) - (d.x - c.x) * (b.y - a.y);
    if (det === 0) return false;
    const lambda = ((d.y - c.y) * (d.x - a.x) + (c.x - d.x) * (d.y - a.y)) / det;
    const gamma = ((a.y - b.y) * (d.x - a.x) + (b.x - a.x) * (d.y - a.y)) / det;
    return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
};

// Features
const NUM_SNAKES = 7;
const NUM_LADDERS = 8;
const MIN_LEN = 20; // unit difference
const FEATURES = []; // {start, end, type}

// Constraints
// 1. Endpoints not adjacent to any other endpoint (dist > 1.5)
// 2. Segments not intersecting

const isSafe = (start, end) => {
    const pStart = getXY(start);
    const pEnd = getXY(end);

    // Check endpoints against existing
    for (const f of FEATURES) {
        const fStart = getXY(f.start);
        const fEnd = getXY(f.end);

        // Adjacency Check (Endpoints) - Just ensure no overlapping endpoints
        if (pStart.x === fStart.x && pStart.y === fStart.y) return false;
        if (pStart.x === fEnd.x && pStart.y === fEnd.y) return false;
        if (pEnd.x === fStart.x && pEnd.y === fStart.y) return false;
        if (pEnd.x === fEnd.x && pEnd.y === fEnd.y) return false;

        // Intersection Check
        if (intersect(pStart, pEnd, fStart, fEnd)) return false;
    }
    return true;
};

// Generate
let attempts = 0;
while (FEATURES.length < NUM_SNAKES + NUM_LADDERS && attempts < 500000) {
    attempts++;
    const isSnake = FEATURES.length < NUM_SNAKES;

    let start, end;
    if (isSnake) {
        // High to Low
        start = Math.floor(Math.random() * 98) + 2; // 2-99
        if (start < 15) continue; // Snakes usually start high
        end = start - (Math.floor(Math.random() * 60) + 10);
        if (end < 1) continue;
    } else {
        // Low to High
        start = Math.floor(Math.random() * 80) + 2;
        end = start + (Math.floor(Math.random() * 60) + 10);
        if (end > 99) continue;
    }

    // Avoid special squares (1, 100)
    if (start === 1 || start === 100 || end === 1 || end === 100) continue;

    // Check steepness?
    // User might dislike horizontal snakes.
    const ps = getXY(start);
    const pe = getXY(end);
    if (Math.abs(ps.y - pe.y) < 2) continue; // At least 2 rows difference

    if (isSafe(start, end)) {
        FEATURES.push({ start, end, type: isSnake ? 'snake' : 'ladder' });
        // console.log(`Added ${isSnake?'snake':'ladder'} ${start}->${end}`);
    }
}

if (FEATURES.length < NUM_SNAKES + NUM_LADDERS) {
    console.log("Failed to generate complete set.");
}

const obj = {};
FEATURES.forEach(f => obj[f.start] = f.end);
console.log(JSON.stringify(obj, null, 2));
