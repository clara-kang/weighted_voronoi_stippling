import {CentroidCalculator} from './centroid-calculator';
import {Point} from './point';
import {RejectionSampleGenerator} from './rejection-sample-generator';
import {StipplingOptions} from './stippling-options';
import {VoronoiRenderer} from './voronoiRenderer';

export function generateStipples(
    image: HTMLImageElement,
    options: StipplingOptions
): Array<Point> {

    const sampleTimes = options.sampleTimes ?? 5000;
    const chanel = options.chanel ?? 'avg';
    const convergeThreshold = options.convergeThreshold ?? 1;
    const maxIteration = options.maxIteration ?? 10;

    const imgCanvas = document.createElement('canvas');
    const voronoiCanvas = document.createElement('canvas');

    imgCanvas.style.display = 'none';
    voronoiCanvas.style.display = 'none';

    document.body.appendChild(imgCanvas);
    document.body.appendChild(voronoiCanvas);

    imgCanvas.width = image.width;
    imgCanvas.height = image.height;
    voronoiCanvas.width = image.width;
    voronoiCanvas.height = image.height;

    // tslint:disable-next-line:no-non-null-assertion
    imgCanvas.getContext('2d')!.drawImage(image, 0, 0);

    const rejectionSampleGenerator = new RejectionSampleGenerator(imgCanvas);
    const voronoiRenderer = new VoronoiRenderer(voronoiCanvas);
    const centroidCalculator = new CentroidCalculator(imgCanvas);

    let samples = rejectionSampleGenerator.sampleImage(sampleTimes, chanel);
    let newSamples: Array<Point>;
    let diffs;

    for (let i = 0; i < maxIteration; i++) {
        voronoiRenderer.drawVoronoiDiagram(samples);
        newSamples = centroidCalculator.calculateCentroids(voronoiCanvas, samples.length);

        diffs = samples.map((sample, index) => (
            Math.sqrt(Math.pow(sample.x - newSamples[index].x, 2.0) + Math.pow(sample.y - newSamples[index].y, 2.0))
        ));

        const validDiffs = diffs.filter(diff => !Number.isNaN(diff));
        const maxDiff = validDiffs.reduce((acc, diff) => Math.max(acc, diff), Number.NEGATIVE_INFINITY);

        if (maxDiff < convergeThreshold) {
            break;
        }

        samples = newSamples.filter(diff => !Number.isNaN(diff));
    }

    voronoiRenderer.dispose();
    document.body.removeChild(imgCanvas);
    document.body.removeChild(voronoiCanvas);

    return samples;
}

