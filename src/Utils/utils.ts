export function getRandomIntegerInclusive(min: number, max: number): number {
    const minimum = Math.ceil(min);
    const maximum = Math.floor(max);
    return Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
}

/* Durstenfeld Shuffle: https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle#The_modern_algorithm*/
export function shuffleArray(array: Array<any>): Array<any> {
    const shuffledInstances = array.slice(0);
    for (let i = shuffledInstances.length - 1; i > 0; i--) {
        const j = getRandomIntegerInclusive(0, i);
        [shuffledInstances[i], shuffledInstances[j]] = [shuffledInstances[j], shuffledInstances[i]];
    }
    return shuffledInstances;
}

export function logBaseN(val: number, n: number): number {
    return (val === 0) ? 0 : Math.log(val) / Math.log(n);
}
