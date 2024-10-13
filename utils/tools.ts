type TObj = Record<string, any>

export const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

export const randomInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min)
}
export const seed = () => randomInt(10000000000, 999999999999)

/**
 * Converts an object with array values into an array of objects, where each object
 * represents a unique combination of the array elements.
 *
 * @param input - The input object where some values are arrays.
 * @returns An array of objects, each containing a unique combination of the array elements
 *          from the input object, along with the non-array values.
 *
 * @example
 * ```typescript
 * const input = {
 *   a: [1, 2],
 *   b: [3, 4],
 *   c: 5
 * };
 * const result = convertObjectToArrayOfObjects(input);
 * // result will be:
 * // [
 * //   { a: 1, b: 3, c: 5 },
 * //   { a: 1, b: 4, c: 5 },
 * //   { a: 2, b: 3, c: 5 },
 * //   { a: 2, b: 4, c: 5 }
 * // ]
 * ```
 */
export const convertObjectToArrayOfObjects = (input: TObj): TObj[] => {
  const result: TObj[] = []
  const keys = Object.keys(input)
  const arrayKeys = keys.filter((key) => Array.isArray(input[key]))
  const nonArrayKeys = keys.filter((key) => !Array.isArray(input[key]))

  function helper(current: TObj, index: number) {
    if (index === arrayKeys.length) {
      const finalObj = { ...current }
      nonArrayKeys.forEach((key) => {
        finalObj[key] = input[key]
      })
      result.push(finalObj)
      return
    }

    const key = arrayKeys[index]
    for (let i = 0; i < input[key].length; i++) {
      helper({ ...current, [key]: input[key][i] }, index + 1)
    }
  }

  helper({}, 0)
  return result
}
