import BSRunner from './libs'
export default function (filename, dataSource, options = {}) {
  return new BSRunner(filename, dataSource, options)
}
