export const AnimationUtils = {
    lerp: (start, end, t) => {
        return start * (1 - t) + end * t;
    },
    
    easeInOut: (t) => {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    },
    
    clamp: (value, min, max) => {
        return Math.min(Math.max(value, min), max);
    }
}; 