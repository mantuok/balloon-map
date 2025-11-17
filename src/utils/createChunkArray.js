export const createChunkArray = (arr, size) => {
  const chunks = [];
  let chunk = [];
  for (let i = 0; i < arr.length; i++) {
    chunk.push(arr[i]);
    if (chunk.length === size || i === arr.length - 1) {
      chunks.push(chunk);
      chunk = [];
    }
  }
  return chunks;
};
