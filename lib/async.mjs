// Array.fromAsync = Array.fromAsync ?? (iterable => fromAsync(toAsyncIterator(iterable)))

export async function fromAsync (iterable) {
  const array = []
  for await (const item of iterable) {
    array.push(item)
  }
  return array
}

export async function * toAsyncIterator (iterable) {
  for (const item of iterable) {
    yield item
  }
}
