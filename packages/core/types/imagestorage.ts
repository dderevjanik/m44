export interface ImageStorage {
    get(imageName: string): Promise<Buffer>;
}
