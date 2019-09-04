import { Measure } from "./measure";

export interface PersistentStore<T> {
    get(key: string): Promise<T>;
    set(key: string): Promise<T>;
    exists(key: string): Promise<boolean>;
}

export interface Platform {
    persistentStore: PersistentStore<any>;
    measure: Measure;
}
