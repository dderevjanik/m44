import { Renderer } from "./renderer";
import { ImageStorage } from "./imagestorage";

export interface Renderable {
    render(ctx: Renderer<any, any>, imgStore: ImageStorage<any>, ...args: any[]): Promise<void>;
}
