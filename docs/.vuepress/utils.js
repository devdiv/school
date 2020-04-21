const path = require('path')
const fs = require('fs')

const sidebarMap = require('./sidebarMap.js')

exports.inferSiderbars = () => {
  const sidebar = {}
  sidebarMap.forEach(({ title, dirname }) => {
    const dirpath = path.resolve(__dirname, '../' + dirname)
    const parent = `/${dirname}/`
    const children = fs
      .readdirSync(dirpath)
      .filter(
        item =>
          item.endsWith('.md') && fs.statSync(path.join(dirpath, item)).isFile()
      )
      .reverse((prev, next) => (next.includes('README.md') ? 0 : -1))
      .map(item => item.replace(/(README)?(.md)$/, ''))

    sidebar[parent] = [
      {
        title,
        children,
        collapsable: false
      }
    ]
  })
  return sidebar
}
