
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

const FEATURES = [
    // Ladders (Start < End)
    { start: 2, end: 38, type: 'ladder' },
    { start: 7, end: 14, type: 'ladder' },
    { start: 10, end: 31, type: 'ladder' },
    { start: 28, end: 84, type: 'ladder' },
    { start: 37, end: 44, type: 'ladder' },
    { start: 52, end: 67, type: 'ladder' },
    { start: 71, end: 91, type: 'ladder' },
    { start: 81, end: 100, type: 'ladder' },
    // Snakes (Start > End)
    { start: 17, end: 6, type: 'snake' },
    { start: 48, end: 26, type: 'snake' },
    { start: 49, end: 11, type: 'snake' },
    { start: 62, end: 2, type: 'snake' },
    { start: 64, end: 24, type: 'snake' },
    { start: 87, end: 66, type: 'snake' },
    { start: 93, end: 73, type: 'snake' },
    { start: 95, end: 75, type: 'snake' },
    { start: 99, end: 80, type: 'snake' }
];

console.log("Checking collisions...");

for (let i = 0; i < FEATURES.length; i++) {
    for (let j = i + 1; j < FEATURES.length; j++) {
        const f1 = FEATURES[i];
        const f2 = FEATURES[j];

        const p1s = getXY(f1.start);
        const p1e = getXY(f1.end);
        const p2s = getXY(f2.start);
        const p2e = getXY(f2.end);

        if (intersect(p1s, p1e, p2s, p2e)) {
            console.log(`COLLISION: ${f1.type} ${f1.start}->${f1.end} intersects with ${f2.type} ${f2.start}->${f2.end}`);
        }

        // Check closeness of lines?
        // Simplest check: Endpoints
        // ...
    }
}
