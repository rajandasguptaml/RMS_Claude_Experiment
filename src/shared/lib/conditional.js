import clsx from 'clsx'

/**
 * Thin re-export wrapper for clsx so feature code imports from one place.
 * @param  {...any} args
 * @returns {string}
 */
export function cx(...args) {
  return clsx(...args)
}
