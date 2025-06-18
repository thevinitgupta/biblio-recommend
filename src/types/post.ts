import { Document } from "mongoose";

// TODO : Add all fields - NOT REQUIRED AS WE CAN UPDATE SINGLE FIELD using FindOneAndUpdate and $set
// TODO : Add isVectorized flag that should be false by default, updated on successfull upsert
// TODO : Cron job to retry all false flag in batch

export interface PostData extends Document{
    title: string;
    content: string;
    createdAt: Date;
    slug: string;
}