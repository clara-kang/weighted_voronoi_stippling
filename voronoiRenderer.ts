/* tslint:disable:no-bitwise */
/* tslint:disable:no-non-null-assertion */
import { indexToColor } from './helpers';
import { Point } from './point';
import fragmentShader from './voronoid.f.glsl';
import vertexShader from './voronoid.v.glsl';

export class VoronoiRenderer {

    private width: number;
    private height: number;
    private maxRadius: number;

    private gl: WebGL2RenderingContext;
    private program: WebGLProgram;

    private positionBuffer: WebGLBuffer;
    private centerBuffer: WebGLBuffer;
    private colorBuffer: WebGLBuffer;
    private indexBuffer: WebGLBuffer;

    constructor(canvas: HTMLCanvasElement) {
        this.width = canvas.width;
        this.height = canvas.height;
        this.maxRadius = Math.max(this.width, this.height);

        if (canvas.getContext('webgl2', {preserveDrawingBuffer: true, antialias: false})) {
            this.gl = canvas.getContext('webgl2', {preserveDrawingBuffer: true, antialias: false})!;
            this.program = this.shaderProgram(this.gl, vertexShader, fragmentShader);
            this.gl.useProgram(this.program);

            const canvasWidthLoc = this.gl.getUniformLocation(this.program, 'canvasWidth');
            const canvasHeightLoc = this.gl.getUniformLocation(this.program, 'canvasHeight');
            const maxRadiusLoc = this.gl.getUniformLocation(this.program, 'maxRadius');

            this.gl.uniform1f(canvasWidthLoc, this.width);
            this.gl.uniform1f(canvasHeightLoc, this.height);
            this.gl.uniform1f(maxRadiusLoc, this.maxRadius);

            this.positionBuffer = this.gl.createBuffer()!;
            this.centerBuffer = this.gl.createBuffer()!;
            this.colorBuffer = this.gl.createBuffer()!;
            this.indexBuffer = this.gl.createBuffer()!;

            this.gl.enable(this.gl.DEPTH_TEST);
        } else {
            throw new Error('Webgl not supported');
        }
    }

    drawVoronoiDiagram(generators: Array<Point>): void {
        this.gl.clearColor(0.8, 0.8, 0.8, 1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.createQuadssMesh(generators);
        this.gl.drawElements(this.gl.TRIANGLES, generators.length * 6, this.gl.UNSIGNED_SHORT, 0);
    }

    dispose(): void {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
        this.gl.deleteBuffer(this.positionBuffer);
        this.gl.deleteBuffer(this.centerBuffer);
        this.gl.deleteBuffer(this.colorBuffer);
        this.gl.deleteBuffer(this.indexBuffer);
    }

    private addShader(prog: WebGLProgram, type: number, source: string): void {
        const shader = this.gl.createShader(type);
        if (shader) {
            this.gl.shaderSource(shader, source);
            this.gl.compileShader(shader);

            if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
                throw new Error('Could not compile shader:\n\n' + this.gl.getShaderInfoLog(shader));
            }

            this.gl.attachShader(prog, shader);
        }
    }
    private shaderProgram(gl: WebGL2RenderingContext, vs: string, fs: string): WebGLProgram {
        const prog = gl.createProgram();
        if (prog) {
            this.addShader(prog, this.gl.VERTEX_SHADER, vs);
            this.addShader(prog, this.gl.FRAGMENT_SHADER, fs);

            gl.linkProgram(prog!);

            if (!gl.getProgramParameter(prog!, gl.LINK_STATUS)) {
                throw new Error('Could not link the shader program!');
            }
            return prog;
        } else {
            throw new Error('cannot create program');
        }
    }

    private attributeSetFloats(
        gl: WebGL2RenderingContext,
        prog: WebGLProgram,
        buffer: WebGLBuffer,
        attrName: string,
        componentSize: number,
        data: Float32Array
    ): void {
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
        const attr = gl.getAttribLocation(prog, attrName);
        gl.enableVertexAttribArray(attr);
        gl.vertexAttribPointer(attr, componentSize, gl.FLOAT, false, 0, 0);
    }


    private createQuadssMesh(generators: Array<Point>): void {
        const ptsNum = generators.length;
        const quadVerticesNum = 4;
        const indicesNum = 6 * ptsNum;
        const radius = Math.max(this.width, this.height);

        const verticesPositions = new Float32Array(quadVerticesNum * 2 * ptsNum);
        const quadCenters = new Float32Array(quadVerticesNum * 2 * ptsNum);
        const verticesColors = new Float32Array(quadVerticesNum * 3 * ptsNum);
        const indices = new Array(indicesNum);

        for (let quadIndex = 0; quadIndex < ptsNum; quadIndex++) {
            const vertexOffset = quadVerticesNum * quadIndex * 2;
            const colorOffset = quadVerticesNum * quadIndex * 3;
            const faceIndexOffset = 6 * quadIndex;
            const vertexIndexOffset = quadVerticesNum * quadIndex;
            const color = indexToColor(quadIndex);
            const ptLoc = generators[quadIndex];

            let vIndex = 0;
            for (const i of [-1, 1]) {
                for (const j of [-1, 1]) {
                    verticesPositions[vertexOffset + vIndex * 2] = ptLoc.x + radius * i;
                    verticesPositions[vertexOffset + vIndex * 2 + 1] =  this.height - ptLoc.y - 1 + radius * j;
                    vIndex ++;
                }
            }

            for (vIndex = 0; vIndex < quadVerticesNum; vIndex ++) {
                verticesColors[colorOffset + vIndex * 3] = color.r;
                verticesColors[colorOffset + vIndex * 3 + 1] = color.g;
                verticesColors[colorOffset + vIndex * 3 + 2] = color.b;
            }

            for (vIndex = 0; vIndex < quadVerticesNum; vIndex ++) {
                quadCenters[vertexOffset + vIndex * 2] = ptLoc.x;
                quadCenters[vertexOffset + vIndex * 2 + 1] = this.height - ptLoc.y - 1;
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
    }
}
