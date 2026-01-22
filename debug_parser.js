
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'essential_grammar_study_guide_hk_kids_with_explanations.md');

try {
    const content = fs.readFileSync(filePath, 'utf8');

    // Split by "## Question"
    const blocks = content.split('## Question').slice(1);

    const difficulties = new Set();
    const errors = [];
    const questions = [];

    blocks.forEach((block, index) => {
        const qData = {};
        const getVal = (key) => {
            const regex = new RegExp(`\\*\\*${key}:\\*\\*\\s*(.*)`);
            const match = block.match(regex);
            return match ? match[1].trim() : null;
        };

        qData.id = (index + 1).toString();
        // Capture the "## Question X.Y" line
        const headerMatch = block.match(/^([0-9.]+)/);
        // Actually split('## Question') removes "## Question", so block starts with " 1.1\n..."
        const header = block.split('\n')[0].trim();
        qData.header = "Question " + header;

        qData.difficulty = getVal("Difficulty");

        if (qData.difficulty) {
            difficulties.add(qData.difficulty);
        } else {
            errors.push(`Question ${qData.id}: Missing Difficulty`);
        }

        // Check options and correct answer
        // Regex from parser.js (simplified)
        const optionsRegex = /-\s*\*\*\([A-D]\)\*\*\s*(.*?)(✓)?\s*$/gm;
        let match;
        let opts = [];
        let correctIdx = -1;
        let i = 0;

        // Reset lastIndex for exec logic if needed, but matchAll or loop is better
        // Let's use string splitting or just look for the lines
        const lines = block.split('\n');
        lines.forEach(line => {
            const m = line.match(/^-\s*\*\*\(([A-E])\)\*\*\s*(.*?)(✓)?\s*$/); // Updated regex to include E
            if (m) {
                opts.push(m[2].trim());
                if (m[3] === '✓') correctIdx = i;
                i++;
            }
        });

        if (opts.length < 2) {
            errors.push(`${qData.header} (Index ${qData.id}): Fewer than 2 options found`);
        }
        if (correctIdx === -1) {
            errors.push(`${qData.header} (Index ${qData.id}): No correct answer marked with ✓`);
        }

        // Check Question Text
        const qMatch = block.match(/\n([^\n]*______[^\n]*)\n/);
        if (!qMatch) {
            // Try to find the line before the options?
            // Or maybe it's a question mark ending line?
            if (!block.includes('______') && !block.includes('?')) {
                errors.push(`${qData.header} (Index ${qData.id}): No question text found`);
            }
        }
    });

    console.log("=== UNIQUE DIFFICULTIES FOUND ===");
    Array.from(difficulties).sort().forEach(d => console.log(`"${d}"`));

    console.log("\n=== ERRORS FOUND ===");
    if (errors.length === 0) {
        console.log("No obvious parsing errors found.");
    } else {
        errors.forEach(e => console.log(e));
    }

} catch (e) {
    console.error("Error reading file:", e);
}
