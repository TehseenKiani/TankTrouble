export class MazeMap {
    width = 0;
    height = 0;
    values = null;

    constructor(width, height, initialValue, values) {
        this.width = width;
        this.height = height;

        initialValue = initialValue !== undefined ? initialValue : 0;

        if (values !== undefined) {
            this.values = values;
        } else {
            this.values = new Array(this.width);
            for (let i = 0; i < this.width; ++i) {
                this.values[i] = new Array(this.height);
                for (let j = 0; j < this.height; ++j) {
                    this.values[i][j] = initialValue;
                }
            }
        }
    }

    clear(value) {
        for (let i = 0; i < this.width; ++i) {
            for (let j = 0; j < this.height; ++j) {
                this.values[i][j] = value;
            }
        }
    }

    get(position) {
        return this.values[position.x][position.y];
    }

    set(position, value) {
        this.values[position.x][position.y] = value;
    }

    add(position, value) {
        this.values[position.x][position.y] += value;
    }

    data() {
        return this.values;
    }

    isPositionInsideMap(position) {
        return position.x >= 0
            && position.x < this.width
            && position.y >= 0
            && position.y < this.height;
    }
}
