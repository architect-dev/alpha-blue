// Includes "min", but excludes "max" as a potential result
export const randomNumber = (max = 100, min = 0): number =>
    Math.floor(Math.random() * (max - min) + min);
