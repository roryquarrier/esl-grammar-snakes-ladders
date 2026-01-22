
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'essential_grammar_study_guide_hk_kids_with_explanations.md');

try {
    const content = fs.readFileSync(filePath, 'utf8');
    const questions = [];

    // Split by "## Question"
    // The regex matches "## Question" and captures the rest until the next match
    const blocks = content.split('## Question').slice(1);

    blocks.forEach(block => {
        const qData = {};
        const lines = block.trim().split('\n');
        qData.id = lines[0].trim(); // "1.1" etc

        const getValue = (key) => {
            const regex = new RegExp(`\\*\\*${key}:\\*\\*\\s*(.*)`);
            const match = block.match(regex);
            return match ? match[1].trim() : "";
        };

        qData.units = getValue("Study Units");
        qData.topic = getValue("Topic");
        let rawDiff = getValue("Difficulty");
        // Normalize: Remove stars and whitespace, then re-add standard stars
        let cleanDiff = rawDiff.replace(/[⭐\s]+/g, '').trim();

        if (cleanDiff.includes('VeryHard')) cleanDiff = 'Very Hard';

        switch (cleanDiff) {
            case 'Easy': qData.difficulty = '⭐ Easy'; break;
            case 'Medium': qData.difficulty = '⭐⭐ Medium'; break;
            case 'Hard': qData.difficulty = '⭐⭐⭐ Hard'; break;
            case 'Very Hard': qData.difficulty = '⭐⭐⭐⭐ Very Hard'; break;
            default: qData.difficulty = '⭐⭐ Medium'; // Fallback
        }

        // Grammar Rule
        const ruleMatch = block.match(/\*\*📘 Grammar Rule:\*\*\s*([\s\S]*?)\n\n/);
        qData.rule = ruleMatch ? ruleMatch[1].trim() : "";

        // Example
        // Capture between Example and the actual question (which we heuristically find)
        // Actually, let's just grab the text section under Example
        const exampleMatch = block.match(/\*\*Example:\*\*\s*([\s\S]*?)\n\n/);
        qData.example = exampleMatch ? exampleMatch[1].trim() : "";

        // Question Text
        // Look for the line containing "______"
        const questionMatch = block.match(/\n([^\n]*______[^\n]*)\n/);
        if (questionMatch) {
            qData.question = questionMatch[1].trim();
        } else {
            // Fallback: look for line before options? 
            // for now, let's skip if no question found, or try to be smarter
            // some questions might be formatted differently
        }

        // Options
        const options = [];
        const correctIndices = [];

        const optionRegex = /- \*\*\((.)\)\*\*\s*(.*)/g;
        let match;
        let idx = 0;
        // resetting regex state just in case, though match() doesn't need it but exec() does
        // we use block.matchAll or loop with exec
        while ((match = optionRegex.exec(block)) !== null) {
            let text = match[2].trim();
            const isCorrect = text.includes('✓');
            text = text.replace('✓', '').trim();
            options.push(text);
            if (isCorrect) correctIndices.push(idx);
            idx++;
        }

        qData.options = options;
        qData.correctIndices = correctIndices;

        if (qData.question && qData.options.length > 0) {
            questions.push(qData);
        }
    });

    fs.writeFileSync('questions.json', JSON.stringify(questions, null, 2), 'utf8');
    console.log("Successfully wrote questions.json");

} catch (err) {
    console.error(err);
}
