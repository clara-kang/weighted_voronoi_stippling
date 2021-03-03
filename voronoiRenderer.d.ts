import { Point } from "./point";
export declare class VoronoiRenderer {
    private width;
    private height;
    private maxRadius;
    private gl;
    private program;
    private positionBuffer;
    private centerBuffer;
    private colorBuffer;
    private indexBuffer;
    constructor(canvas: HTMLCanvasElement);
    drawVoronoiDiagram(generators: Array<Point>): void;
    dispose(): void;
    private shaderProgram;
    private attributeSetFloats;
    private createQuadssMesh;
}
