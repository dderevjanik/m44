export interface ImageStorage<IMG> {
    get(imageName: string): Promise<IMG>;
}
