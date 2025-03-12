import { flattenObject } from "./flatten-object";

export type Diff = {
    added: Record<string, any>;
    removed: Record<string, any>;
    changed: Record<string, { oldValue: any, newValue: any }>;
};

export function createDiff(oldObj: object, newObj:object) {
    const oldFlat = flattenObject(oldObj);
    const newFlat = flattenObject(newObj);

    const allKeys = Array.from(new Set([...Object.keys(oldFlat), ...Object.keys(newFlat)]));
    const diff: Diff = {
        added: {},
        removed: {},
        changed: {}
    };

    for (const key of allKeys) {
        if (oldFlat[key] === undefined) {
            diff.added[key] = newFlat[key];
        } else if (newFlat[key] === undefined) {
            diff.removed[key] = oldFlat[key];
        } else if (oldFlat[key] !== newFlat[key]) {
            diff.changed[key] = {
                oldValue: oldFlat[key],
                newValue: newFlat[key]
            }
        }
    }
    
    return diff;
}