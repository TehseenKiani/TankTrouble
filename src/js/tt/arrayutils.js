export class ArrayUtils {
    // Shuffles the array in place
    static shuffle(array) {
        let currentIndex = array.length;

        while (currentIndex !== 0) {
            const randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
        }

        return array;
    }

    // Removes duplicates from the array in place
    static unique(array) {
        const filtered = [...new Set(array)];

        array.length = 0;
        array.push(...filtered);

        return array;
    }

    // Finds index of first occurrence of item in array using comparisonFunction to test for equality. Returns -1 if item was not found.
    static indexOf(array, item, comparisonFunction) {
        for (let i = 0; i < array.length; ++i) {
            if (comparisonFunction(array[i], item)) {
                return i;
            }
        }
        return -1;
    }

    // Determines if array contains any duplicates.
    static containsDuplicates(array) {
        return new Set(array).size !== array.length;
    }

    // Determines if first array contains one or more items from second array.
    static containsSome(firstArray, secondArray) {
        return secondArray.some(value => {
            return firstArray.includes(value);
        });
    }

    // Determines if first array contains all items from second array (ignoring duplicates).
    static containsAll(firstArray, secondArray) {
        return secondArray.every(value => {
            return firstArray.includes(value);
        });
    }

    // Determines if first array and second array contain the same items (ignoring duplicates).
    static containsSame(firstArray, secondArray) {
        return ArrayUtils.containsAll(firstArray, secondArray) && ArrayUtils.containsAll(secondArray, firstArray);
    }
}
