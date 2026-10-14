export class IdGenerator {
    static generatorId = IdGenerator._s4();
    static nextId = 0;

    static generate(prefix) {
        // Handle the theoretical situation where
        // nextId wraps around.
        // Number.MAX_VALUE is approx. 1.79E+308
        if (IdGenerator.nextId >= Number.MAX_VALUE) {
            IdGenerator.generatorId = IdGenerator._s4();
            IdGenerator.nextId = 0;
        }

        // Prepend prefix if one was provided
        prefix = prefix ? `${prefix}-` : "";

        return `${prefix + IdGenerator.generatorId}-${IdGenerator.nextId++}`;
    }

    static _s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .slice(1);
    }
}
