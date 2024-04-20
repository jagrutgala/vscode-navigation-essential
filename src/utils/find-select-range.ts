export const findSelectRange = (cursorIndex: number, matchIndexes: number[]): [number, number] => {
    const matchDistance = matchIndexes.map(x => Math.abs(x - cursorIndex));
    let minLb = matchDistance.length;
    let minUb = matchDistance.length;
    for (const i of matchDistance) {
        if (i < minLb) {
            minLb = i;
        }
        else if (i < minUb && i > minLb) {
            minUb = i;
        }
    }
    return [minLb, minUb];
};
