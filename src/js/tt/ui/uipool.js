export class UIPool {
    items = [];

    add(item) {
        this.items.push(item);
    }

    getFirstExists(exists) {
        for (let i = 0; i < this.items.length; i++) {
            if (this.items[i].exists === exists) {
                return this.items[i];
            }
        }

        return null;
    }
}
