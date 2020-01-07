import { gen, getDefault } from './lib'
export default function (filename, dataSource, options = getDefault()) {
  return gen(filename, dataSource, options)
}
