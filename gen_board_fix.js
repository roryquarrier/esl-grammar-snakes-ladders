
const fs = require('fs');

// Helpers
const getXY = (n) => {
    const row0 = Math.floor((n - 1) / 10);
    const col0 = (n - 1) % 10;
    let x = (row0 % 2 === 0) ? col0 : (9 - col0);
    let y = row0;
    return { x, y };
};

const intersect = (a, b, c, d) => {
    const det = (b.x - a.x) * (d.y - c.y) - (d.x - c.x) * (b.y - a.y);
    if (det === 0) return false;
    const lambda = ((d.y - c.y) * (d.x - a.x) + (c.x - d.x) * (d.y - a.y)) / det;
    const gamma = ((a.y - b.y) * (d.x - a.x) + (b.x - a.x) * (d.y - a.y)) / det;
    return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
};

// ORIGINAL SET
const TARGETS = [
    // Ladders
    { start: 2, end: 22, type: 'ladder' },
    { start: 5, end: 15, type: 'ladder' },
    // {start: 9, end: 30, type: 'ladder'}, // Remove congestion
    { start: 26, end: 77, type: 'ladder' },
    { start: 35, end: 56, type: 'ladder' },
    // {start: 39, end: 42, type: 'ladder'}, // Small
    // {start: 52, end: 69, type: 'ladder'}, // Congestion
    { start: 71, end: 91, type: 'ladder' },
    { start: 81, end: 100, type: 'ladder' },
    // Snakes
    { start: 99, end: 82, type: 'snake' },
    { start: 95, end: 76, type: 'snake' },
    { start: 92, end: 63, type: 'snake' }, // Tweak end to 63
    { start: 74, end: 24, type: 'snake' },
    { start: 64, end: 3, type: 'snake' },
    // {start: 49, end: 12, type: 'snake'}, // Remove
    { start: 48, end: 27, type: 'snake' }
];

const checkSafety = (features) => {
    for (let i = 0; i < features.length; i++) {
        const f1 = features[i];
        const p1s = getXY(f1.start);
        const p1e = getXY(f1.end);

        // Check against others
        for (let j = i + 1; j < features.length; j++) {
            const f2 = features[j];
            const p2s = getXY(f2.start);
            const p2e = getXY(f2.end);

            // 1. Intersection
            if (intersect(p1s, p1e, p2s, p2e)) return false;

            // 2. Adjacency (Endpoints only or path? Prompt says "one square adjacent to each other" usually implies endpoints or general clutter)
            // Let's check endpoint proximity
            const dists = [
                Math.max(Math.abs(p1s.x - p2s.x), Math.abs(p1s.y - p2s.y)),
                Math.max(Math.abs(p1s.x - p2e.x), Math.abs(p1s.y - p2e.y)),
                Math.max(Math.abs(p1e.x - p2s.x), Math.abs(p1e.y - p2s.y)),
                Math.max(Math.abs(p1e.x - p2e.x), Math.abs(p1e.y - p2e.y))
            ];
            if (Math.min(...dists) < 2) return false; // Must be at least 2 squares away (distance >= 2)
        }
    }
    return true;
};

// Optimizer: Stochastic Hill Climbing / Random Perturbation
let bestSet = null;
let bestScore = -1; // Higher is better (fewer conflicts, closer to original)

// Function to clone and perturb
const perturb = (baseSet) => {
    const newSet = JSON.parse(JSON.stringify(baseSet));
    // Pick one feature
    const idx = Math.floor(Math.random() * newSet.length);
    const f = newSet[idx];

    // Nudge start or end
    if (Math.random() < 0.5) {
        f.start += (Math.random() < 0.5 ? 1 : -1);
    } else {
        f.end += (Math.random() < 0.5 ? 1 : -1);
    }

    // Boundary checks
    if (f.start < 1) f.start = 1; if (f.start > 100) f.start = 100;
    if (f.end < 1) f.end = 1; if (f.end > 100) f.end = 100;
    if (f.start === f.end) f.end = f.start + (f.type === 'ladder' ? 10 : -10);

    return newSet;
}

// Try to find valid set closest to original
let currentSet = JSON.parse(JSON.stringify(TARGETS));

for (let k = 0; k < 100000; k++) {
    if (checkSafety(currentSet)) {
        console.log("Found valid configuration!");
        const obj = {};
        // Sort for output niceness
        currentSet.forEach(f => obj[f.start] = f.end);
        console.log(JSON.stringify(obj, null, 2));
        process.exit(0);
    }

    // If not safe, perturb
    // But we want to stay CLOSE to original.
    // So maybe just random walk from original?
    // Let's rely on random walk finding a hole.
    currentSet = perturb(currentSet);

    // Reset occasionally to original to avoid drifting too far?
    if (k % 1000 === 0) {
        currentSet = JSON.parse(JSON.stringify(TARGETS));
    }
}

console.log("Failed to find strict solution. Outputting best effort (likely overlaps).");
