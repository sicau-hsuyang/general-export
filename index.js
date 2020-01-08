import { gen, getDefault } from './libs'
export default function (filename, dataSource, options = getDefault()) {
  return gen(filename, dataSource, options)
}
