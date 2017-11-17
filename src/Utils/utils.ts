
/**
 * Get Random Integer Between a Minimum and Maximum, Inclusive
 *
 * @param {number} min Minimum possible integer
 * @param {number} max Maximum possible integer
 * @returns {number} Random Integer between min and max, inclusive
 *
 */
export function getRandomIntegerInclusive(min: number, max: number): number {
    const minimum: number = Math.ceil(min);
    const maximum: number = Math.floor(max);
    return Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
}

/**
 * Durstenfeld Shuffle of an Array
 * Based on: https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle#The_modern_algorithm
 *
 * @param {Array<any>} array Input Array
 * @returns {Array<any>} Shuffled Array
 *
 */
export function shuffleArray(array: Array<any>): Array<any> {
    const shuffledInstances: Array<any> = array.slice(0);
    for (let i: number = shuffledInstances.length - 1; i > 0; i--) {
        const j: number = getRandomIntegerInclusive(0, i);
        [shuffledInstances[i], shuffledInstances[j]] = [shuffledInstances[j], shuffledInstances[i]];
    }
    return shuffledInstances;
}

/**
 * N base logarithm for Entropy Calculations - Returns 0 instead of -infinity
 *
 * @param {number} value Value to calculate logarithm for
 * @param {number} n base of the logarithm
 * @returns {number} logn(val) or zero
 *
 */
export function logBaseN(value: number, n: number): number {
    return (value === 0) ? 0 : Math.log(value) / Math.log(n);
}
