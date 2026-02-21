require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const mongoose = require('mongoose');

const email = process.argv[2] || 'cybershield929@gmail.com';

async function makeAdmin() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const result = await mongoose.connection.collection('users').findOneAndUpdate(
        { email },
        { $set: { role: 'admin' } },
        { returnDocument: 'after' }
    );

    if (!result) {
        console.log(`❌ No user found with email: ${email}`);
    } else {
        console.log(`✅ User promoted to admin:`);
        console.log(`   Name:  ${result.name}`);
        console.log(`   Email: ${result.email}`);
        console.log(`   Role:  ${result.role}`);
    }

    await mongoose.disconnect();
    process.exit(0);
}

makeAdmin().catch(err => { console.error(err); process.exit(1); });
