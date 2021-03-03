import { Point } from './point';
export declare class CentroidCalculator {
    private imageData;
    private width;
    private height;
    constructor(imageCanvas: HTMLCanvasElement);
    calculateCentroids(voronoiCanvas: HTMLCanvasElement, generatorAmount: number): Array<Point>;
    private getIndex;
    private readDensity;
}
