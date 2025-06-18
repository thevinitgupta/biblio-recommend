
export interface CreateVector {
    blog : string,
    id : string
}


export type UpsertStatus = "upserted" | "failed" | "pending";

export interface UpsertResult {
    status: UpsertStatus,
    id: string | null;
}