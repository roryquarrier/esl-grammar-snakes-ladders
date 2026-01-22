
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'essential_grammar_study_guide_hk_kids_with_explanations.md');

try {
    const content = fs.readFileSync(filePath, 'utf8');
    const blocks = content.split('## Question').slice(1);

    blocks.forEach((block, index) => {
        const headerMatch = block.match(/^([0-9.]+)/);
        const header = headerMatch ? "Question " + headerMatch[1] : "Question " + (index + 1);

        // Find question text
        const qMatch = block.match(/\n([^\n]*______[^\n]*)\n/);
        if (!qMatch) return;
        const qText = qMatch[1];

        // Find suffix after ______
        const parts = qText.split('______');
        if (parts.length < 2) return;

        // Clean suffix: remove punctuation and whitespace for comparison
        let suffix = parts[1].trim();
        // Remove leading punctuation like ? or ! if it's separate? 
        // Actually, " hot!" -> "hot"
        const cleanSuffix = suffix.replace(/^[.,?!]+|[.,?!]+$/g, '').toLowerCase().trim();

        if (!cleanSuffix) return;

        // Find Correct Option
        const optsLines = block.split('\n');
        let correctOpt = "";
        optsLines.forEach(line => {
            const m = line.match(/^-\s*\*\*\([A-E]\)\*\*\s*(.*?)(✓)?\s*$/);
            if (m && m[3] === '✓') {
                correctOpt = m[2].trim();
            }
        });

        if (!correctOpt) return;

        // Relaxed Check: Split into words
        const suffixWords = cleanSuffix.split(/\s+/);
        const optWords = correctOpt.replace(/[.,?!]+$/g, '').toLowerCase().trim().split(/\s+/);

        // Check if the last word of option matches the first word of suffix
        // OR if the option contains the suffix entirely
        if (optWords.length > 0 && suffixWords.length > 0) {
            const lastOptWord = optWords[optWords.length - 1];
            const firstSuffixWord = suffixWords[0];

            if (lastOptWord === firstSuffixWord || correctOpt.toLowerCase().includes(cleanSuffix)) {
                console.log(`POTENTIAL REDUNDANCY: ${header}`);
                console.log(`  Question: "${qText}"`);
                console.log(`  Answer:   "${correctOpt}"`);
                console.log(`  Suffix:   "${suffix}"`);
                console.log('---');
            }
        }
    });

} catch (e) {
    console.error(e);
}
