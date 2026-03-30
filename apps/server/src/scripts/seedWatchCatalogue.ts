/**
 *
 */
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import data from '../seed/data/Mintd v1.1 Database.json';
import fs from 'fs';
import path from 'path';
import {
    WatchCatalogue,
    } from '../models/WatchCatalogue.model';
dotenv.config();

interface RawWatchCatalogue {
    Brand: string;
    Model: string;
    'Reference No.': string;
    Description?: string;
}


const DATA_FILE_PATH = path.join(
    __dirname,
    '../seed/data/Mintd v1.1 Database.json',
);
const BATCH_SIZE = 500; // how many watches to insert at a time
async function seed() {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
        console.error('MONGODB_URI is not set in environment variables');
        process.exit(1);
    }

    if (!fs.existsSync(DATA_FILE_PATH)) {
        console.error(`Data file not found at path: ${DATA_FILE_PATH}`);
        process.exit(1);
    }
    console.log('connecting to mongoDB...');
    await mongoose.connect(mongoUri);
    console.log('connected to mongoDB');

    // READ AND PARSE THE JSON DATA
    const rawData = JSON.parse(fs.readFileSync(DATA_FILE_PATH, 'utf-8'));
    // The JSON is an array of watches grouped by brand, we need to flatten it into an array of watch objects. why? because our WatchCatalogue model expects each document to represent a single watch with brand, model, reference, etc. The JSON structure is more nested and grouped by brand, so we need to transform it into the flat structure that matches our database schema before we can insert it into MongoDB.
    const allWatches = Object.values(rawData).flat() as RawWatchCatalogue[]; // json.parse can be called here too

    console.log(`loaded  ${allWatches.length} watches from JSON...`);

    let insertedCount = 0;
    let skippedCount = 0;

    for (let i = 0; i < allWatches.length; i += BATCH_SIZE) {
        const batch = allWatches.slice(i, i + BATCH_SIZE);

        const ops = batch.map((item) => {
            // Map JSON keys to Schema keys
            const watchData = {
                brand: item['Brand'],
                watchModel: item['Model'], // Maps to 'watchModel' in your schema
                reference: item['Reference No.'],
                description: item['Description'] || '',
            };

            return {
                updateOne: {
                    filter: {
                        // Using reference as the unique identifier
                        reference: watchData.reference,
                    },
                    update: { $setOnInsert: watchData },
                    upsert: true,
                },
            };
        });
        try {
            const result = await WatchCatalogue.bulkWrite(ops);
            insertedCount += result.upsertedCount;
            skippedCount += result.matchedCount;
            console.log(
                `Processed batch ${i / BATCH_SIZE + 1}: Inserted ${result.upsertedCount}, Skipped ${result.matchedCount}`,
            );
        } catch (error) {
            console.error('Error inserting batch:', error);
            process.exit(1);
        }
        console.log('\n Seed complete:');
        console.log(`    New Records Inserted: ${insertedCount}`);
        console.log(`     Duplicates Skipped: ${skippedCount}`);
        console.log(`   Total Processed: ${allWatches.length}`);
    }

    await mongoose.disconnect();
    console.log('Disconnected. Done.');
}

seed().catch((error) => {
    console.error('Error seeding database:', error);
    process.exit(1);
});
