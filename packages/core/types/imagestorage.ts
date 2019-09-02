export interface PersistentStorage<IMG> {
    get(imageName: string): Promise<IMG>;
}
