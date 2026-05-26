const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

const PDF_DIR = path.join(__dirname, '../data');
const OUTPUT_FILE = path.join(__dirname, '../lib/gita-full-data.json');

async function processPDFs() {
    const files = fs.readdirSync(PDF_DIR).filter(f => f.endsWith('.pdf'));
    const results = {
        english: "",
        telugu: ""
    };

    for (const file of files) {
        console.log(`Processing ${file}...`);
        const dataBuffer = fs.readFileSync(path.join(PDF_DIR, file));
        const data = await pdf(dataBuffer);
        
        if (file.toLowerCase().includes('english')) {
            results.english = data.text;
        } else if (file.toLowerCase().includes('telugu') || file.toLowerCase().includes('gita_telugu')) {
            results.telugu = data.text;
        }
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));
    console.log(`Knowledge base generated at ${OUTPUT_FILE}`);
}

processPDFs().catch(err => console.error(err));
