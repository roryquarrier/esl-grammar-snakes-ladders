
const fs = require('fs');
const path = require('path');

const tplPath = path.join(__dirname, 'game_template.html');
const jsonPath = path.join(__dirname, 'questions.json');
const bgPath = path.join(__dirname, 'background.png');
const mascotPath = path.join(__dirname, 'mascot.png');
const piecePath = path.join(__dirname, 'piece.png');
const snakePath = path.join(__dirname, 'snake.png');
const ladderPath = path.join(__dirname, 'ladder.png');
const outPath = path.join(__dirname, 'game.html');

// Run Parser First to regenerate questions.json
try {
    const { execSync } = require('child_process');
    execSync('node parser.js', { stdio: 'inherit' });
    console.log("Parser execution complete.");
} catch (e) {
    console.error("Failed to run parser:", e);
    process.exit(1);
}

try {
    const tpl = fs.readFileSync(tplPath, 'utf8');
    const questions = fs.readFileSync(jsonPath, 'utf8');

    // Read and encode images
    const bgBase64 = fs.readFileSync(bgPath).toString('base64');
    const mascotBase64 = fs.readFileSync(mascotPath).toString('base64');
    const pieceBase64 = fs.readFileSync(piecePath).toString('base64');
    const snakeBase64 = fs.readFileSync(snakePath).toString('base64');
    const ladderBase64 = fs.readFileSync(ladderPath).toString('base64');

    // Inject Data
    let finalHtml = tpl.replace('/* GRAMMAR_QUESTIONS_PLACEHOLDER */', questions);

    // Inject Images (Replace ALL occurrences)
    finalHtml = finalHtml.replaceAll('/* BACKGROUND_IMAGE_B64 */', `data:image/png;base64,${bgBase64}`);
    finalHtml = finalHtml.replaceAll('/* MASCOT_IMAGE_B64 */', `data:image/png;base64,${mascotBase64}`);
    finalHtml = finalHtml.replaceAll('/* PIECE_IMAGE_B64 */', `data:image/png;base64,${pieceBase64}`);
    finalHtml = finalHtml.replaceAll('/* SNAKE_IMAGE_B64 */', `data:image/png;base64,${snakeBase64}`);
    finalHtml = finalHtml.replaceAll('/* LADDER_IMAGE_B64 */', `data:image/png;base64,${ladderBase64}`);

    fs.writeFileSync(outPath, finalHtml, 'utf8');
    console.log("Successfully built game.html with embedded assets");

    // Build Test Filtering
    const testTplPath = path.join(__dirname, 'test_filtering.html');
    const testOutPath = path.join(__dirname, 'test_filtering_built.html');
    if (fs.existsSync(testTplPath)) {
        const testTpl = fs.readFileSync(testTplPath, 'utf8');
        const testHtml = testTpl.replace('/* GRAMMAR_QUESTIONS_PLACEHOLDER */', questions);
        fs.writeFileSync(testOutPath, testHtml, 'utf8');
        console.log("Successfully built test_filtering_built.html");
    }

} catch (err) {
    console.error(err);
}
