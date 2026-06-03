/**
 * Serializes async tasks per key by chaining promises.
 * Tasks sharing the same key run sequentially; different keys stay concurrent.
 */
export class KeyedSerializer {
  private _chains: Map<string, Promise<unknown>> = new Map()

  run<T>(key: string, task: () => Promise<T>): Promise<T> {
    const previous = this._chains.get(key) ?? Promise.resolve()
    const result = previous.then(task, task)
    // keep the chain alive even if a task rejects, then prune once it is the tail
    const chained = result.catch(() => {})
    this._chains.set(key, chained)
    chained.finally(() => {
      if (this._chains.get(key) === chained) this._chains.delete(key)
    })
    return result
  }
}
