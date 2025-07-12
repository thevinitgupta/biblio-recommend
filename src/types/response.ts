export interface SearchResponseDataI{
    id: String,
    score: number,
}

export interface SearchResponseI {
    data: Array<SearchResponseDataI>,
    error : String | null 
}