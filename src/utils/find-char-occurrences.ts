export const findCharOccurrences = (str: string, char: string) => {
    const occurrences = [];
    for (let i = 0; i < str.length; i++) {
        const s = str[i];
        if (char === s) {
            occurrences.push(i);
        }
    }
    return occurrences;
};
