"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateStipples = void 0;
var centroid_calculator_1 = require("./centroid-calculator");
var rejection_sample_generator_1 = require("./rejection-sample-generator");
var voronoiRenderer_1 = require("./voronoiRenderer");
function generateStipples(image, options) {
    var _a, _b, _c, _d;
    var sampleTimes = (_a = options.sampleTimes) !== null && _a !== void 0 ? _a : 5000;
    var chanel = (_b = options.chanel) !== null && _b !== void 0 ? _b : 0;
    var convergeThreshold = (_c = options.convergeThreshold) !== null && _c !== void 0 ? _c : 1;
    var maxIteration = (_d = options.maxIteration) !== null && _d !== void 0 ? _d : 10;
    var imgCanvas = document.createElement('canvas');
    var voronoiCanvas = document.createElement('canvas');
    imgCanvas.style.display = 'none';
    voronoiCanvas.style.display = 'none';
    document.body.appendChild(imgCanvas);
    document.body.appendChild(voronoiCanvas);
    imgCanvas.width = image.width;
    imgCanvas.height = image.height;
    voronoiCanvas.width = image.width;
    voronoiCanvas.height = image.height;
    imgCanvas.getContext('2d').drawImage(image, 0, 0);
    var rejectionSampleGenerator = new rejection_sample_generator_1.RejectionSampleGenerator(imgCanvas);
    var voronoiRenderer = new voronoiRenderer_1.VoronoiRenderer(voronoiCanvas);
    var centroidCalculator = new centroid_calculator_1.CentroidCalculator(imgCanvas);
    var samples = rejectionSampleGenerator.sampleImage(sampleTimes, chanel);
    var newSamples;
    var diffs;
    for (var i = 0; i < maxIteration; i++) {
        voronoiRenderer.drawVoronoiDiagram(samples);
        newSamples = centroidCalculator.calculateCentroids(voronoiCanvas, samples.length);
        diffs = samples.map(function (sample, index) { return (Math.sqrt(Math.pow(sample.x - newSamples[index].x, 2.0) + Math.pow(sample.y - newSamples[index].y, 2.0))); });
        var validDiffs = diffs.filter(function (diff) { return !Number.isNaN(diff); });
        var maxDiff = validDiffs.reduce(function (acc, diff) { return Math.max(acc, diff); }, Number.NEGATIVE_INFINITY);
        console.log('maxDiff: ', maxDiff);
        if (maxDiff < convergeThreshold) {
            console.log('converged at iteration', i);
            break;
        }
        samples = newSamples.filter(function (diff) { return !Number.isNaN(diff); });
    }
    voronoiRenderer.dispose();
    return samples;
}
exports.generateStipples = generateStipples;
