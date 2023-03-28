export const validateFields = (list) => {
  let obj = {}
  let bool = false
  list.forEach(item => {
    const { id, value = '', rules = [] } = item
    for (let i = 0, length = rules.length; i < length; i++) {
      const ruleItem = rules[i]
      const { message = '', required, pattern } = ruleItem
      console.log('ruleItem', ruleItem)
      if (required && value.length === 0) {
        obj[`${id}`] = { err: true, msg: message }
        bool = true
        return
      }
      if (pattern && pattern.test(value)) {
        obj[`${id}`] = { err: true, msg: message }
        bool = true
        return
      }
      obj[`${id}`] = { err: false }
      return
    }
  })
  return {
    code: bool,
    data: obj
  }
}
