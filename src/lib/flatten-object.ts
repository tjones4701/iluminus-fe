// deno-lint-ignore-file no-explicit-any
export function flattenObject(obj: any, prefix = ""): any {
    const flattened: any = {};
    for (const key in obj) {
        const propName = prefix ? `${prefix}.${key}` : key;
        if (Array.isArray(obj[key])) {
            obj[key].forEach((item: any, index: number) => {
                const arrayPropName = `${propName}[${index}]`;
                if (typeof item === "object" && item !== null) {
                    Object.assign(flattened, flattenObject(item, arrayPropName));
                } else {
                    flattened[arrayPropName] = item;
                }
            });
        } else if (typeof obj[key] === "object" && obj[key] !== null) {
            if (obj[key].constructor === Object) {
                Object.assign(flattened, flattenObject(obj[key], propName));
            } else {
                flattened[propName] = obj[key];
            }
        } else {
            flattened[propName] = obj[key];
        }
    }
    return flattened;
}
