export class MathUtils {
    static linearInterpolation(a, b, t) {
        return ((1.0 - t) * a) + (t * b);
    }

    static randomRange(min, max) {
        return min + (Math.random() * (max - min));
    }

    static randomAroundZero(interval) {
        return (Math.random() * interval) - (interval * 0.5);
    }

    static randomArrayEntry(array) {
        return array[Math.floor(MathUtils.randomRange(0, array.length))];
    }

    static randomSign(x) {
        return Math.random() > 0.5 ? x : -x;
    }

    static getClosestAxis(direction) {
        const absX = Math.abs(direction.x);
        const absY = Math.abs(direction.y);
        if (absX >= absY) {
            return direction.x > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 };
        } else {
            return direction.y > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 };
        }
    }
}
