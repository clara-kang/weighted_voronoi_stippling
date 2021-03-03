"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoronoiRenderer = void 0;
var helpers_1 = require("./helpers");
var voronoid_f_glsl_1 = __importDefault(require("./voronoid.f.glsl"));
var voronoid_v_glsl_1 = __importDefault(require("./voronoid.v.glsl"));
var VoronoiRenderer = /** @class */ (function () {
    function VoronoiRenderer(canvas) {
        this.width = canvas.width;
        this.height = canvas.height;
        this.maxRadius = Math.max(this.width, this.height);
        this.gl = canvas.getContext('webgl2', { preserveDrawingBuffer: true, antialias: false });
        this.program = this.shaderProgram(this.gl, voronoid_v_glsl_1.default, voronoid_f_glsl_1.default);
        this.gl.useProgram(this.program);
        var canvasWidthLoc = this.gl.getUniformLocation(this.program, "canvasWidth");
        var canvasHeightLoc = this.gl.getUniformLocation(this.program, "canvasHeight");
        var maxRadiusLoc = this.gl.getUniformLocation(this.program, "maxRadius");
        this.gl.uniform1f(canvasWidthLoc, this.width);
        this.gl.uniform1f(canvasHeightLoc, this.height);
        this.gl.uniform1f(maxRadiusLoc, this.maxRadius);
        this.positionBuffer = this.gl.createBuffer();
        this.centerBuffer = this.gl.createBuffer();
        this.colorBuffer = this.gl.createBuffer();
        this.indexBuffer = this.gl.createBuffer();
        this.gl.enable(this.gl.DEPTH_TEST);
    }
    VoronoiRenderer.prototype.drawVoronoiDiagram = function (generators) {
        this.gl.clearColor(0.8, 0.8, 0.8, 1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.createQuadssMesh(generators);
        this.gl.drawElements(this.gl.TRIANGLES, generators.length * 6, this.gl.UNSIGNED_SHORT, 0);
    };
    VoronoiRenderer.prototype.dispose = function () {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
        this.gl.deleteBuffer(this.positionBuffer);
        this.gl.deleteBuffer(this.centerBuffer);
        this.gl.deleteBuffer(this.colorBuffer);
        this.gl.deleteBuffer(this.indexBuffer);
    };
    VoronoiRenderer.prototype.shaderProgram = function (gl, vs, fs) {
        var prog = gl.createProgram();
        var addshader = function (type, source) {
            var s = gl.createShader((type == 'vertex') ?
                gl.VERTEX_SHADER : gl.FRAGMENT_SHADER);
            gl.shaderSource(s, source);
            gl.compileShader(s);
            if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
                throw "Could not compile " + type +
                    " shader:\n\n" + gl.getShaderInfoLog(s);
            }
            gl.attachShader(prog, s);
        };
        addshader('vertex', vs);
        addshader('fragment', fs);
        gl.linkProgram(prog);
        if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
            throw "Could not link the shader program!";
        }
        return prog;
    };
    VoronoiRenderer.prototype.attributeSetFloats = function (gl, prog, buffer, attrName, componentSize, data) {
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
        var attr = gl.getAttribLocation(prog, attrName);
        gl.enableVertexAttribArray(attr);
        gl.vertexAttribPointer(attr, componentSize, gl.FLOAT, false, 0, 0);
    };
    VoronoiRenderer.prototype.createQuadssMesh = function (generators) {
        var ptsNum = generators.length;
        var quadVerticesNum = 4;
        var indicesNum = 6 * ptsNum;
        var radius = Math.max(this.width, this.height);
        var verticesPositions = new Float32Array(quadVerticesNum * 2 * ptsNum);
        var quadCenters = new Float32Array(quadVerticesNum * 2 * ptsNum);
        var verticesColors = new Float32Array(quadVerticesNum * 3 * ptsNum);
        var indices = new Array(indicesNum);
        for (var quadIndex = 0; quadIndex < ptsNum; quadIndex++) {
            var vertexOffset = quadVerticesNum * quadIndex * 2;
            var colorOffset = quadVerticesNum * quadIndex * 3;
            var faceIndexOffset = 6 * quadIndex;
            var vertexIndexOffset = quadVerticesNum * quadIndex;
            var color = helpers_1.indexToColor(quadIndex);
            var ptLoc = generators[quadIndex];
            var vIndex = 0;
            for (var _i = 0, _a = [-1, 1]; _i < _a.length; _i++) {
                var i = _a[_i];
                for (var _b = 0, _c = [-1, 1]; _b < _c.length; _b++) {
                    var j = _c[_b];
                    verticesPositions[vertexOffset + vIndex * 2] = ptLoc.x + radius * i;
                    verticesPositions[vertexOffset + vIndex * 2 + 1] = this.height - ptLoc.y - 1 + radius * j;
                    vIndex++;
                }
            }
            for (var vIndex_1 = 0; vIndex_1 < quadVerticesNum; vIndex_1++) {
                verticesColors[colorOffset + vIndex_1 * 3] = color.r;
                verticesColors[colorOffset + vIndex_1 * 3 + 1] = color.g;
                verticesColors[colorOffset + vIndex_1 * 3 + 2] = color.b;
            }
            for (var vIndex_2 = 0; vIndex_2 < quadVerticesNum; vIndex_2++) {
                quadCenters[vertexOffset + vIndex_2 * 2] = ptLoc.x;
                quadCenters[vertexOffset + vIndex_2 * 2 + 1] = this.height - ptLoc.y - 1;
            }
            indices[faceIndexOffset] = vertexIndexOffset;
            indices[faceIndexOffset + 1] = vertexIndexOffset + 2;
            indices[faceIndexOffset + 2] = vertexIndexOffset + 3;
            indices[faceIndexOffset + 3] = vertexIndexOffset;
            indices[faceIndexOffset + 4] = vertexIndexOffset + 3;
            indices[faceIndexOffset + 5] = vertexIndexOffset + 1;
        }
        this.attributeSetFloats(this.gl, this.program, this.positionBuffer, 'position', 2, verticesPositions);
        this.attributeSetFloats(this.gl, this.program, this.centerBuffer, 'center', 2, quadCenters);
        this.attributeSetFloats(this.gl, this.program, this.colorBuffer, 'color', 3, verticesColors);
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), this.gl.STATIC_DRAW);
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    };
    return VoronoiRenderer;
}());
exports.VoronoiRenderer = VoronoiRenderer;
