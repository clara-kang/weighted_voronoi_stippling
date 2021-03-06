import {Point} from './point';
import {Chanel} from './stippling-options';

export class RejectionSampleGenerator{

    private imageData: Uint8ClampedArray;
    private width: number;
    private height: number;

    constructor(imageCanvas: HTMLCanvasElement) {
        this.width = imageCanvas.width;
        this.height = imageCanvas.height;
        // tslint:disable-next-line:no-non-null-assertion
        this.imageData = imageCanvas.getContext('2d')!.getImageData(0, 0, imageCanvas.width, imageCanvas.height).data;
    }

    sampleImage(sampleTimes: number, chanel: Chanel): Array<Point> {

        const samples = Array<Point>();
        const availability = new Array<boolean>(this.width * this.height).fill(true);

        if (chanel === 'r') {
            return this.getSamplesForChanel(sampleTimes, 0);
        } else if (chanel === 'g') {
            return this.getSamplesForChanel(sampleTimes, 1);
        } else if (chanel === 'b') {
            return this.getSamplesForChanel(sampleTimes, 2);
        } else if (chanel === 'a') {
            return this.getSamplesForChanel(sampleTimes, 3);
        } else {
            return this.getSamplesForAvgImage(sampleTimes);
        }
    }

    private getSamplesForChanel(sampleTimes: number, chanel: number) {
        const samples = Array<Point>();
        const availability = new Array<boolean>(this.width * this.height).fill(true);
        let sampleAttemptNum = 0;

        for (sampleAttemptNum = 0; sampleAttemptNum < sampleTimes; sampleAttemptNum++) {
            const x = this.getRandomInt(this.width);
            const y = this.getRandomInt(this.height);

            const density = this.readDensityByChanel(x, y, chanel);
            const randomThreshold = Math.random();

            if (density > randomThreshold) {
                if (availability[this.getIndex(x, y)]) {
                    samples.push({x, y});
                    this.updateAvailability(availability, x, y);
                }
            }
        }

        return samples;
    }

    private getSamplesForAvgImage(sampleTimes: number) {
        const samples = Array<Point>();
        const availability = new Array<boolean>(this.width * this.height).fill(true);
        let sampleAttemptNum = 0;

        for (sampleAttemptNum = 0; sampleAttemptNum < sampleTimes; sampleAttemptNum++) {
            const x = this.getRandomInt(this.width);
            const y = this.getRandomInt(this.height);

            const density = this.readAvgDensity(x, y);
            const randomThreshold = Math.random();

            if (density > randomThreshold) {
                if (availability[this.getIndex(x, y)]) {
                    samples.push({x, y});
                    this.updateAvailability(availability, x, y);
                }
            }
        }

        return samples;
    }

    private updateAvailability(availability: Array<boolean>, x: number, y: number): void {
        availability[this.getIndex(x, y)] = false;

        if (x > 0) {
            availability[this.getIndex(x - 1, y)] = false;
        }

        if (x < this.width - 1) {
            availability[this.getIndex(x + 1, y)] = false;
        }

        if (y > 0) {
            availability[this.getIndex(x, y - 1)] = false;
        }

        if (y < this.height - 1) {
            availability[this.getIndex(x, y + 1)] = false;
        }

        if (x > 0 && y > 0) {
            availability[this.getIndex(x - 1, y - 1)] = false;
        }

        if (x > 0 && y < this.height - 1) {
            availability[this.getIndex(x - 1, y + 1)] = false;
        }

        if (x < this.width - 1 && y > 0) {
            availability[this.getIndex(x + 1, y - 1)] = false;
        }

        if (x < this.width - 1 && y < this.height - 1) {
            availability[this.getIndex(x + 1, y + 1)] = false;
        }
    }

    private getIndex(x: number, y: number): number {
        return y * this.width + x;
    }

    private getRandomInt(max: number): number {
        return Math.floor(Math.random() * max);
    }

    private readDensityByChanel(x: number, y: number, chanel: number): number {
        const index = ((y * this.width) + x) * 4;
        const density = 1.0 - this.imageData[index + chanel] / 255.0;

        return density;
    }

    private readAvgDensity(x: number, y: number): number {
        const index = ((y * this.width) + x) * 4;

        let density = 0;
        for (let chanel = 0; chanel < 4; chanel++) {
            density += 1.0 - this.imageData[index + chanel] / 255.0;
        }
        density /= 4;

        return density;
    }
}
