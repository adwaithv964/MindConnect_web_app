const fs = require('fs');
const path = require('path');

const INPUT_FILE = 'doctors_data.txt';
const OUTPUT_FILE = 'doctors_data.json';

const convert = () => {
    try {
        const inputPath = path.join(__dirname, INPUT_FILE);
        const outputPath = path.join(__dirname, OUTPUT_FILE);

        if (!fs.existsSync(inputPath)) {
            console.error(`Error: ${INPUT_FILE} not found in ${__dirname}`);
            console.log('Please place the text file in this directory.');
            return;
        }

        const rawData = fs.readFileSync(inputPath, 'utf8');
        const lines = rawData.split('\n');

        const doctors = [];

        // Skip header if it starts with "sorting_"
        let startIndex = 0;
        if (lines[0] && lines[0].includes('sorting_')) {
            startIndex = 1;
        }

        console.log(`Processing ${lines.length} lines...`);

        for (let i = startIndex; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            // NEW PARSING LOGIC:
            // The file seems to be tab-separated but with irregular empty tabs.
            // Data seems to end with "View" and a javascript link.
            // We'll filter empty tokens, but we also check if we can salvage records with fewer tokens (e.g. missing father name).

            const tokens = line.split('\t').map(t => t.trim()).filter(t => t.length > 0);

            // Accepted patterns:
            // Perfect: [Index, Year, RegNo, Council, Name, FatherName, "View", ...] -> Length >= 6
            // Missing Father: [Index, Year, RegNo, Council, Name, "View", ...] -> Length 5 (We can support this)

            let doc = null;

            if (tokens.length >= 6) {
                // Standard case
                doc = {
                    yearOfInfo: tokens[1],
                    registrationNumber: tokens[2],
                    stateMedicalCouncil: tokens[3],
                    name: tokens[4],
                    fatherName: tokens[5]
                };
            } else if (tokens.length >= 5) {
                // Attempt to rescue missing father name
                // Check if last valid token looks like "View" or "javascript"
                // If tokens[1] is year, tokens[2] Reg, tokens[3] Council, tokens[4] Name...
                doc = {
                    yearOfInfo: tokens[1],
                    registrationNumber: tokens[2],
                    stateMedicalCouncil: tokens[3],
                    name: tokens[4],
                    fatherName: "" // Default empty
                };
            }

            if (doc && doc.registrationNumber && doc.name) {
                doctors.push(doc);
            } else {
                fs.appendFileSync('skipped_lines.txt', `Line ${i + 1} Skipped (${tokens.length} tokens): ${line}\n`);
                console.warn(`Line ${i + 1} skipped. See skipped_lines.txt`);
            }
        }

        fs.writeFileSync(outputPath, JSON.stringify(doctors, null, 2));
        console.log(`Success! Converted ${doctors.length} records to ${OUTPUT_FILE}`);
        console.log(`Check "skipped_lines.txt" for any missing records.`);

    } catch (err) {
        console.error('Conversion Failed:', err);
    }
};

convert();
