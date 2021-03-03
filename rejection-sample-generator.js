"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RejectionSampleGenerator = void 0;
var RejectionSampleGenerator = /** @class */ (function () {
    function RejectionSampleGenerator(imageCanvas) {
        this.width = imageCanvas.width;
        this.height = imageCanvas.height;
        this.imageData = imageCanvas.getContext('2d').getImageData(0, 0, imageCanvas.width, imageCanvas.height).data;
    }
    RejectionSampleGenerator.prototype.sampleImage = function (sampleTimes, chanel) {
        var sampleAttemptNum = 0;
        var samples = Array();
        var availability = new Array(this.width * this.height).fill(true);
        for (sampleAttemptNum = 0; sampleAttemptNum < sampleTimes; sampleAttemptNum++) {
            var x = this.getRandomInt(this.width);
            var y = this.getRandomInt(this.height);
            var density = this.readDensity(x, y, chanel);
            var randomThreshold = Math.random();
            if (density > randomThreshold) {
                if (availability[this.getIndex(x, y)]) {
                    samples.push({ x: x, y: y });
                    this.updateAvailability(availability, x, y);
                }
            }
        }
        return samples;
    };
    RejectionSampleGenerator.prototype.updateAvailability = function (availability, x, y) {
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
    };
    RejectionSampleGenerator.prototype.getIndex = function (x, y) {
        return y * this.width + x;
    };
    RejectionSampleGenerator.prototype.getRandomInt = function (max) {
        return Math.floor(Math.random() * max);
    };
    RejectionSampleGenerator.prototype.readDensity = function (x, y, chanel) {
        var index = ((y * this.width) + x) * 4;
        var density = 1.0 - this.imageData[index + chanel] / 255.0;
        return density;
    };
    return RejectionSampleGenerator;
}());
exports.RejectionSampleGenerator = RejectionSampleGenerator;
