"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CentroidCalculator = void 0;
var helpers_1 = require("./helpers");
var CentroidCalculator = /** @class */ (function () {
    function CentroidCalculator(imageCanvas) {
        this.width = imageCanvas.width;
        this.height = imageCanvas.height;
        this.imageData = imageCanvas.getContext('2d').getImageData(0, 0, this.width, this.height).data;
    }
    CentroidCalculator.prototype.calculateCentroids = function (voronoiCanvas, generatorAmount) {
        var _this = this;
        var areas = new Array(generatorAmount).fill(0);
        var centerYNumerators = new Array(generatorAmount).fill(0);
        var centerXNumerators = new Array(generatorAmount).fill(0);
        var gl = voronoiCanvas.getContext('webgl2', { preserveDrawingBuffer: true });
        var pixels = new Uint8Array(voronoiCanvas.width * voronoiCanvas.height * 4);
        gl.readPixels(0, 0, voronoiCanvas.width, voronoiCanvas.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels, 0);
        var regionIndices = new Set();
        for (var y = 0; y < voronoiCanvas.height; y++) {
            for (var x = 0; x < voronoiCanvas.width; x++) {
                var index = this.getIndex(x, y);
                var pseudoColor = pixels.slice(index * 4, index * 4 + 4);
                var regionIndex = helpers_1.colorToIndex(pseudoColor);
                regionIndices.add(regionIndex);
                var density = this.readDensity(x, y);
                areas[regionIndex] += density;
                centerYNumerators[regionIndex] += y * density;
                centerXNumerators[regionIndex] += x * density;
            }
        }
        var centerYs = centerYNumerators
            .map(function (val, index) { return val / areas[index]; });
        var centerXs = centerXNumerators
            .map(function (val, index) { return val / areas[index]; });
        return centerXs.map(function (val, index) { return ({ x: val + 0.5, y: _this.height - centerYs[index] - 1.5 }); });
    };
    CentroidCalculator.prototype.getIndex = function (x, y) {
        return this.width * y + x;
    };
    CentroidCalculator.prototype.readDensity = function (x, y) {
        var index = (((this.height - y - 1) * this.width) + x) * 4;
        var density = 1.0 - this.imageData[index] / 255.0;
        return density;
    };
    return CentroidCalculator;
}());
exports.CentroidCalculator = CentroidCalculator;
