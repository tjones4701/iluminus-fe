export function isString(myVar: unknown): myVar is string {
    return typeof myVar === "string" || myVar instanceof String;
}
