const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const DoctorRegistry = require('../models/DoctorRegistry');

dotenv.config({ path: path.join(__dirname, '../.env') });

const debugParams = {
    regNo: "741",
    council: "Travancore Cochin Medical Council, Trivandrum"
};

const runDebug = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to DB.");

        console.log(`Searching for: Reg "${debugParams.regNo}" | Council "${debugParams.council}"`);

        // 1. Exact Match
        const exact = await DoctorRegistry.findOne({
            registrationNumber: debugParams.regNo,
            stateMedicalCouncil: debugParams.council
        });
        console.log("Exact Match Result:", exact ? "FOUND" : "NOT FOUND");
        if (exact) console.log(JSON.stringify(exact, null, 2));

        // 2. Loose Match (Reg Only)
        const looseReg = await DoctorRegistry.find({ registrationNumber: debugParams.regNo });
        console.log(`\nFound ${looseReg.length} records with Reg "${debugParams.regNo}":`);
        looseReg.forEach(r => console.log(` - [${r.registrationNumber}] Council: "${r.stateMedicalCouncil}"`));

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
};

runDebug();
