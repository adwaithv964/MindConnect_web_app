const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const DoctorRegistry = require('../models/DoctorRegistry');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Configuration
const BATCH_SIZE = 1000; // Number of records to insert at once
const DATA_FILE_NAME = 'doctors_data.json'; // The file expected in server/scripts/ or server/

// MongoDB Connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected for Import...');
    } catch (err) {
        console.error('Database connection failed:', err.message);
        process.exit(1);
    }
};

const importData = async () => {
    await connectDB();

    try {
        const filePath = path.join(__dirname, DATA_FILE_NAME);

        if (!fs.existsSync(filePath)) {
            console.error(`Error: Data file not found at ${filePath}`);
            console.log('Please place your "doctors_data.json" file in this directory.');
            process.exit(1);
        }

        console.log('Reading data file...');
        const rawData = fs.readFileSync(filePath, 'utf-8');
        const doctors = JSON.parse(rawData);

        console.log(`Found ${doctors.length} records. Starting import...`);

        // Clear existing data to prevent duplicates
        await DoctorRegistry.deleteMany({});
        console.log('Existing registry cleared.');

        let batch = [];
        let count = 0;

        for (const doc of doctors) {
            // Map keys from your source data to our schema if necessary
            // Assuming source keys match user description: year of info, registration number, state medical councils, name, fathers name
            const newDoc = {
                registrationNumber: doc['registration number'] || doc.registrationNumber,
                stateMedicalCouncil: doc['state medical councils'] || doc.stateMedicalCouncil,
                name: doc.name,
                fatherName: doc['fathers name'] || doc.fatherName,
                yearOfInfo: doc['year of info'] || doc.yearOfInfo,
                originalData: doc // Keep original just in case
            };

            // Basic validation
            if (newDoc.registrationNumber && newDoc.stateMedicalCouncil) {
                batch.push(newDoc);
            }

            if (batch.length >= BATCH_SIZE) {
                try {
                    await DoctorRegistry.insertMany(batch, { ordered: false });
                    count += batch.length;
                    console.log(`Imported ${count} records...`);
                } catch (e) {
                    // If duplicate key error (11000), we just log it and continue
                    if (e.code === 11000) {
                        // Some inserted, some failed. 
                        // With ordered: false, successful ones are inserted.
                        // But count logic is tricky. We'll just assume batch size for now or check e.result.nInserted
                        count += (e.result ? e.result.nInserted : 0);
                        console.warn(`Batch had duplicates. Inserted ${e.result ? e.result.nInserted : 'some'}.`);
                    } else {
                        throw e; // Rethrow other errors
                    }
                }
                batch = []; // Reset batch
            }
        }

        // Insert remaining
        if (batch.length > 0) {
            await DoctorRegistry.insertMany(batch);
            count += batch.length;
        }

        console.log(`SUCCESS! Total ${count} doctor records imported.`);
        process.exit();

    } catch (err) {
        console.error('Import failed:', err);
        process.exit(1);
    }
};

importData();
