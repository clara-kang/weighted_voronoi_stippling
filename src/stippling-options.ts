export type Chanel =  'r' | 'g' | 'b' | 'a' | 'avg';

export interface StipplingOptions {
    sampleTimes?: number;
    chanel?: Chanel;
    convergeThreshold?: number;
    maxIteration?: number;
}
