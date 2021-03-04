import { Point } from './point';
import { colorToIndex } from './helpers';

export class CentroidCalculator {

    private imageData: Uint8ClampedArray;
    private width: number;
    private height: number;

    constructor(imageCanvas: HTMLCanvasElement) {
        this.width = imageCanvas.width;
        this.height = imageCanvas.height;
        // tslint:disable-next-line:no-non-null-assertion
        this.imageData = imageCanvas.getContext('2d')!.getImageData(0, 0, this.width, this.height).data;
    }

    calculateCentroids(
        voronoiCanvas: HTMLCanvasElement,
        generatorAmount: number
    ): Array<Point>{
        const areas = new Array(generatorAmount).fill(0);
        const centerYNumerators = new Array(generatorAmount).fill(0);
        const centerXNumerators = new Array(generatorAmount).fill(0);

        // tslint:disable-next-line:no-non-null-assertion
        const gl = voronoiCanvas.getContext('webgl2', {preserveDrawingBuffer: true})!;
        const pixels = new Uint8Array(voronoiCanvas.width * voronoiCanvas.height * 4);
        gl.readPixels(0, 0, voronoiCanvas.width, voronoiCanvas.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels, 0);

        const regionIndices = new Set();

        for (let y = 0; y < voronoiCanvas.height; y++) {

            for (let x = 0; x < voronoiCanvas.width; x++) {
                const index = this.getIndex(x, y);
                const pseudoColor = pixels.slice(index * 4, index * 4 + 4);
                const regionIndex = colorToIndex(pseudoColor);
                regionIndices.add(regionIndex);

                const density = this.readDensity(x, y);
                areas[regionIndex] += density;
                centerYNumerators[regionIndex] += y * density;
                centerXNumerators[regionIndex] += x * density;
            }
        }

        const centerYs = centerYNumerators
            .map((val, index) => val / areas[index]);
        const centerXs = centerXNumerators
            .map((val, index) => val / areas[index]);

        return centerXs.map((val, index) => ({x: val + 0.5, y: this.height - centerYs[index] - 1.5}));
    }

    private getIndex(x: number, y: number): number {
        return this.width * y + x;
    }

    private readDensity(x: number, y: number): number {
        const index = (((this.height - y - 1) * this.width) + x) * 4;
        const density = 1.0 - this.imageData[index] / 255.0;

        return density;
    }
}
