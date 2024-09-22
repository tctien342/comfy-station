import React from 'react'

export const useKeygen = () => {
  const crrId = React.useRef(1)
  const ids = React.useRef(new WeakMap())
  const getObjectId = (object: object) => {
    if (ids.current.has(object)) {
      return ids.current.get(object)
    } else {
      const id = String(crrId.current++)
      ids.current.set(object, id)
      return id
    }
  }
  return { gen: getObjectId }
}
