/**
 *  WatchCatalogue model
 *
 * This is our local reference database seeded to mongodb.
 * It replaces the WatchBase API ($0.25/call) for the MVP.
 * 
 * Design decision: We store brand + model + reference as a compound unique index.
 * Lookups are done with case-insensitive collation so "audemars piguet" matches
 * "Audemars Piguet". This is sub-millisecond with the index in place.
 */

import mongoose, { Document, model, Schema } from "mongoose";
import { InferSchemaType } from "mongoose";

// why are we extending Document? because we want to use the mongoose document methods like .save() and .find() on the WatchCatalogue model. By extending Document, we get access to those methods and can interact with the database more easily.
export interface IWatchCatalogue extends Document {
    brand: string;
    watchModel: string; // this is the model of the watch i think there is a clash between this and mongoose model
    reference: string;
    description: string;
    // other fields like release year, movement type, etc can be added later
}

const WatchCatalogueSchema = new Schema({

    brand: { type: String, required: true, trim: true },
    watchModel: { type: String, required: true, trim: true },
    reference: { type: String, required: true, unique: true, trim: true },
    description: { type: String, trim: true },
}, {collation: { locale: 'en', strength: 2 }}); // case-insensitive collation eg "Royal Oak" matches "royal oak"

// compound unique index on brand + model + reference to prevent duplicates and allow fast lookups
WatchCatalogueSchema.index({ brand: 1, watchModel: 1, reference: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } }); // an index on the combination of brand, model, and reference to ensure uniqueness and allow fast lookups. The collation makes it case-insensitive so "Audemars Piguet Royal Oak 15400" matches "audemars piguet royal oak 15400". and must be the same as the collation on the collection to work properly.

WatchCatalogueSchema.index({ brand: 1 }); // index on brand for fast lookups when user searches by brand

export const WatchCatalogue = model<IWatchCatalogue>('WatchCatalogue', WatchCatalogueSchema);
export type WatchCatalogueType = InferSchemaType<typeof WatchCatalogueSchema>;