/* tslint:disable:no-bitwise */
export function indexToColor(index: number): {r: number, g: number, b: number} {
    const upper = (index >> 16);
    const middle = (index >> 8) - (upper << 8);
    const lower = index % 256;

    const r = upper / 255;
    const g = middle / 255;
    const b = lower / 255;

    return {r, g, b};
}

export function colorToIndex(buffer: Uint8Array): number {
    return (buffer[0] << 16) + (buffer[1] << 8) + buffer[2];
}
