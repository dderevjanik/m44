/**
 * Create HTMLImage to be rendered later by canvas
 */
export function createImage(url: string): Promise<HTMLImageElement> {
    const image = new Image();
    return new Promise((resolve, reject) => {
        image.crossOrigin = 'Anonymous'
        image.onload = () => {
            resolve(image);
        }
        image.onerror = (err) => {
            reject(err);
        }
        image.src = url;
    });
}
