import {types as t, flow} from "mobx-state-tree"

import warn from "lib/helper/model/warnNotImplementedAction"

const schema = {
  hasNext: t.boolean,
  count: t.number,
  limit: t.number,
  offset: t.number,
  current: t.number,
  last: t.number
  // list: Array<T>
}

const volatile = () => ({isLoading: false})

const actions = self => ({
  /**
   * Loads the previous page frame if exists
   *
   * @param {object} params – additional query parameters
   * @param {object} options – navigation options
   */
  prev: warn.flow(self),

  /**
   * Loads the next page frame if exists
   *
   * @param {object} params – additional query parameters
   * @param {object} options – navigation options
   */
  next: warn.flow(self),

  /**
   * Loads loads a page frame with the given number if exists
   *
   * @param {function} query – a GraphQL query handler to load a new page
   * @param {number} page – a number of the page to load
   * @param {object} params – additional query parameters
   * @param {object} options – query options
   */
  navigate: flow(function* (query, page, params, options) {
    // Do nothing if the given page value goes out of avaialable frames range
    if ((!self.hasNext && page >= self.current) || page < 1) {
      return undefined
    }

    /**
     * The query function must take these arguments:
     *
     * @param {number} page
     * @param {any} params
     */
    const frame = yield query(page, params)

    if (options.push) {
      self.add(undefined, frame.list)
    } else {
      self.list = frame.list
    }

    self.hasNext = frame.hasNext
    self.offset = frame.offset
    self.limit = frame.limit
    self.count = frame.count
    self.current = frame.current
    self.last = frame.last
  }),

  /**
   * An alias of Array#splice() method on self.list field.
   * Overrides different default parameters.
   */
  splice(position = self.list.length, deleteCount = 0, ...elements) {
    return self.list.splice(position, deleteCount, ...elements)
  },

  /**
   * Removes the given amount of elements starting from the postion
   *
   * @param {number} [position = self.list.length]
   * @param {element} [amount = 0]
   */
  remove(position, amount) {
    if (amount && amount > 0) {
      self.count -= amount
    }

    return self.splice(position, amount)
  },

  /**
   * Add a new elements starting from given position
   *
   * @param {number} [position = self.list.length]
   * @param {array} [elements = []]
   */
  add(position, elements = []) {
    self.count += elements.length

    return self.splice(position, undefined, ...elements)
  }
})

const views = self => ({
  /**
   * Returns the number of the next page
   *
   * @return {number}
   */
  get nextPage() {
    return self.current < self.last ? self.current + 1 : self.last
  },

  /**
   * Returns the number of the previous page
   *
   * @return {number}
   */
  get prevPage() {
    return self.current > 1 ? self.current - 1 : 1
  }
})

const Page = t.model("Page", schema)
  .volatile(volatile)
  .actions(actions)
  .views(views)

export default Page
