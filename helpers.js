"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.colorToIndex = exports.indexToColor = void 0;
function indexToColor(index) {
    var upper = (index >> 16);
    var middle = (index >> 8) - (upper << 8);
    var lower = index % 256;
    var r = upper / 255;
    var g = middle / 255;
    var b = lower / 255;
    return { r: r, g: g, b: b };
}
exports.indexToColor = indexToColor;
function colorToIndex(buffer) {
    return (buffer[0] << 16) + (buffer[1] << 8) + buffer[2];
}
exports.colorToIndex = colorToIndex;
