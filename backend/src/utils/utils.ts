export function serializeResponse(res: any){
    return JSON.parse(JSON.stringify(res))
}