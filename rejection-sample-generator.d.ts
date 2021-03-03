import { Point } from './point';
export declare class RejectionSampleGenerator {
    private imageData;
    private width;
    private height;
    constructor(imageCanvas: HTMLCanvasElement);
    sampleImage(sampleTimes: number, chanel: number): Array<Point>;
    private updateAvailability;
    private getIndex;
    private getRandomInt;
    private readDensity;
}
