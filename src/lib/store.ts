/* eslint-disable @typescript-eslint/no-unused-vars */


class StorageItem {
    value: any;
    key: string;
    expiry: number | null;
    localStore: LocalStore;

    constructor(localStore: LocalStore, key: string, value: any, expiry: number | null = null) {
        this.localStore = localStore;
        this.key = key;
        this.value = value;
        this.expiry = expiry;
    }

    setLocalStore(store: LocalStore): void {
        this.localStore = store;
    }

    getLocalStore() {
        return this.localStore;
    }

    getValue(def: any, ignoreExpired = false): any {
        if (!ignoreExpired && this.isExpired()) {
            return def;
        }
        if (this.value == null) {
            return def;
        }
        return this.value;
    }
    setValue(value: any, newExpiry: number | null, save = true): StorageItem {
        this.value = value;
        if (newExpiry != null) {
            this.setExpiry(newExpiry, false);
        }
        if (save) {
            this.save();
        }

        return this;
    }

    getKey(): string {
        return this.key;
    }
    setKey(key: string): StorageItem {
        this.key = key;
        return this;
    }

    getExpiry(): number | null {
        return this.expiry;
    }

    setExpiry(expiry: number, save = true): StorageItem {
        const currentTime = new Date().getTime();
        this.expiry = currentTime + expiry;
        if (save) {
            this.save();
        }
        return this;
    }

    isExpired() {
        const currentTime = new Date().getTime();
        if (this.expiry == null) {
            return false;
        }
        return this.expiry <= currentTime;
    }

    update(key: string, value: any, expiry: number | null) {
        this.setKey(key);
        this.setValue(value, expiry, true);
    }

    serialize() {
        const jsonObject = {
            value: this.value,
            expiry: this.expiry,
        };

        return JSON.stringify(jsonObject);
    }

    save() {
        if (this.localStore != null) {
            this.localStore.saveStorageItem(this);
        } else {
            throw "No Local Store Set for StorageItem";
        }
    }
}

export class LocalStore {
    prefix = "app";
    encryptFunction: ((value: any) => any) | null;

    constructor(
        prefix: string,
        options = {
            encryptFunction: null,
        }
    ) {
        this.encryptFunction = options?.encryptFunction;
        this.prefix = prefix;
    }

    getPrefix(): string {
        if (this.prefix == null) {
            return "app";
        }
        return this.prefix;
    }
    setPrefix(prefix: string): LocalStore {
        this.prefix = prefix;
        return this;
    }

    generateKey(key: string): string {
        return this.prefix + "-" + key;
    }

    get(key: string, def: any = null): any {
        try {
            const storageItem = this.getStorageItem(key);
            if (storageItem != null) {
                return storageItem.getValue(def);
            }
        } catch (e) {
            console.log("Error getting storage item", e);
        }
        return def;
    }

    isLocalStorageItem(key: string): boolean {
        try {
            const item = localStorage.getItem(this.generateKey(key));
            if (item != null) {
                return false;
            }
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    getStorageItem(key: string): StorageItem | null {
        const localStoreKey = this.generateKey(key);
        if (localStoreKey != null) {
            try {
                const localStoreString = localStorage.getItem(localStoreKey);
                if (localStoreString != null) {
                    const val = JSON.parse(localStoreString);
                    return new StorageItem(this, key, val.value, val.expiry);
                }
            } catch (_e) {
                console.error(_e);
            }
        }
        return null;
    }

    saveStorageItem(storageItem: StorageItem) {
        try {
            const data: string = storageItem.serialize();
            const key = this.generateKey(storageItem.getKey());
            storageItem.setLocalStore(this);
            localStorage.setItem(key, data);
            return storageItem;
        } catch (e) {
            console.error("Error saving storage item", e);
            return null;
        }
    }

    getCurrentTime(): number {
        const d = new Date();
        return d.getTime();
    }

    isExpired(key: string | StorageItem): boolean {
        let storageItem: StorageItem | null = null;
        if (!(key instanceof StorageItem)) {
            storageItem = this.getStorageItem(key);
        }

        if (storageItem == null) {
            throw "No storage item found";
        }

        return storageItem.isExpired();
    }

    getTimeUntilExpiry(key: string): number | null {
        const now = new Date().getTime();

        const expiry = this.getExpiry(key);
        if (expiry != null) {
            return expiry - now;
        }
        return null;
    }

    getExpiry(key: string): number | null {
        const storageItem = this.getStorageItem(key);
        if (storageItem != null) {
            return storageItem.expiry;
        } else {
            return null;
        }
    }

    createStorageItem(key: string, value: any, expiry: number | null = null): StorageItem {
        const storageItem = new StorageItem(this, key, value, expiry);
        storageItem.save();
        return storageItem;
    }

    set(key: string, value: any, expiry: number | null = null): StorageItem {
        let storageItem = this.getStorageItem(key);
        if (storageItem == null) {
            storageItem = this.createStorageItem(key, value, expiry);
        }
        storageItem.update(key, value, expiry);
        return storageItem;
    }

    clearAll() {
        const items = this.getAllStorageItemKeys();
        for (const index in items) {
            this.clear(items[index]);
        }
    }

    clear(key: string): void {
        try {
            const localStoreKey = this.generateKey(key);
            localStorage.removeItem(localStoreKey);
        } catch (e) { }
    }

    getAllStorageItemKeys(): string[] {
        try {
            const keys = Object.keys(localStorage);
            const prefix = this.getPrefix() + "_";
            const itemKeys = [];
            for (const index in keys) {
                let itemKey = keys[index];
                if (itemKey.startsWith(prefix)) {
                    itemKey = itemKey.substr(prefix.length);
                    itemKeys.push(itemKey);
                }
            }

            return itemKeys;
        } catch (e) {
            console.error(e);
            return [];
        }
    }

    getAll() {
        const keys = this.getAllStorageItemKeys();
        const values: any = {};
        for (const index in keys) {
            const itemKey = keys[index];
            try {
                const val = this.get(itemKey);
                values[itemKey] = val;
            } catch (e) {
                console.error(e);
            }
        }
        return values;
    }

    getAllStorageItems() {
        const keys = this.getAllStorageItemKeys();
        const storageItems: any = {};
        for (const index in keys) {
            const itemKey = keys[index];

            try {
                const storageItem = this.getStorageItem(itemKey);
                const storageItemKey = storageItem?.getKey();
                if (storageItemKey != null) {
                    storageItems[storageItemKey] = storageItem;
                }
            } catch (e) {
                console.error(e);
            }
        }

        return storageItems;
    }
    encrypt(value: any) {
        return value;
    }
}

const defaultAppStore = new LocalStore("ia");
export default defaultAppStore;
