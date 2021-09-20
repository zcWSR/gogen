const path = require('path')
const glob = require('glob')
const {mock, run} = require('../lib')
const createTempDir = require('../lib/utils/createTempDir')

describe('index', () => {
  test('should throw errors', async () => {
    await expect(mock('', '')).rejects.toThrow()
    await expect(mock('foo', '')).rejects.toThrow()
    await expect(mock('', 'foo')).rejects.toThrow()
  })
})

describe('integration', () => {
  test('run error', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
    jest.spyOn(process, 'exit').mockImplementation((code) => {
      throw new Error(code)
    })
    await expect(run([__dirname], 'usage')).rejects.toThrow(/1/)
    await expect(run([__dirname, ''], 'usage')).rejects.toThrow(/1/)
  })

  test('run ok from local', async () => {
    const dist = createTempDir({prefix: 'gogen'})
    const generator = path.resolve(__dirname, 'fixtures/test-basic')
    await run([generator, dist])
    expect(
      glob.sync('**', {cwd: dist, dot: true, ignore: ['.git/*/**']}).sort()
    ).toMatchInlineSnapshot(`
Array [
  ".git",
  ".gitignore",
  "README.md",
  "index.js",
  "node_modules",
  "node_modules/.yarn-integrity",
  "node_modules/olt",
  "node_modules/olt/LICENSE",
  "node_modules/olt/README.md",
  "node_modules/olt/index.cjs.js",
  "node_modules/olt/index.js",
  "node_modules/olt/package.json",
  "package.json",
  "yarn.lock",
]
`)
  })

  test('run ok from npm', async () => {
    const dist = createTempDir({prefix: 'gogen'})
    const generator = 'gogen-pkg'
    await run([generator, dist])
    expect(glob.sync('**', {cwd: dist}).sort()).toMatchInlineSnapshot(`
Array [
  "LICENSE",
  "README.md",
  "index.js",
  "node_modules",
  "package.json",
  "test.js",
  "yarn.lock",
]
`)
  })
})