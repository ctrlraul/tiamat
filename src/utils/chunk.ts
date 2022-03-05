export function chunk <T> (array: T[], chunkLength: number): T[][] {

  if (chunkLength < 1) {
    throw new Error(`Chunk length can't be smaller than 1`)
  }

  if (chunkLength === Infinity) {
    throw new Error(`Chunk length can't be infinite`)
  }
  
  const result = []
  let start = 0

  do {
    start = result.length * chunkLength
    result.push(array.slice(start, start + chunkLength))
  } while (array.length > start + chunkLength)

  return result

}
