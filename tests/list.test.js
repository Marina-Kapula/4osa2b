const { test, describe } = require('node:test')
const assert = require('node:assert')
const listHelper = require('../utils/list_helper')


// 4.3 dummy
test('dummy returns one', () => {
  const result = listHelper.dummy([])
  assert.strictEqual(result, 1)
})

// 4.4 totalLikes
describe('total likes', () => {
  test('of empty list is zero', () => {
    const result = listHelper.totalLikes([])
    assert.strictEqual(result, 0)
  })

  const listWithOneBlog = [
    {
      _id: '5a422aa71b54a676234d17f8',
      title: 'Go To Statement Considered Harmful',
      author: 'Edsger W. Dijkstra',
      url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
      likes: 5,
      __v: 0,
    },
  ]

  test('when list has only one blog equals the likes of that', () => {
    const result = listHelper.totalLikes(listWithOneBlog)
    assert.strictEqual(result, 5)
  })

  const listWithManyBlogs = [
    { likes: 7 },
    { likes: 4 },
    { likes: 2 },
  ]

  test('of a bigger list is calculated right', () => {
    const result = listHelper.totalLikes(listWithManyBlogs)
    assert.strictEqual(result, 13)
  })
})

// 4.5 favoriteBlog
describe('favorite blog', () => {
  test('of empty list is null', () => {
    const result = listHelper.favoriteBlog([])
    assert.strictEqual(result, null)
  })

  const blogs = [
    {
      _id: '1',
      title: 'Blog one',
      author: 'Author A',
      url: 'http://example.com/1',
      likes: 5,
      __v: 0,
    },
    {
      _id: '2',
      title: 'Blog two',
      author: 'Author B',
      url: 'http://example.com/2',
      likes: 10,
      __v: 0,
    },
    {
      _id: '3',
      title: 'Blog three',
      author: 'Author C',
      url: 'http://example.com/3',
      likes: 7,
      __v: 0,
    },
  ]

  test('of a bigger list returns blog with most likes', () => {
    const result = listHelper.favoriteBlog(blogs)

    const expected = {
      _id: '2',
      title: 'Blog two',
      author: 'Author B',
      url: 'http://example.com/2',
      likes: 10,
      __v: 0,
    }

    assert.deepStrictEqual(result, expected)
  })
})

// 4.6 mostBlogs
describe('most blogs', () => {
  test('of empty list is null', () => {
    const result = listHelper.mostBlogs([])
    assert.strictEqual(result, null)
  })

  const blogs = [
    {
      _id: '1',
      title: 'First',
      author: 'Robert C. Martin',
      url: 'http://example.com/1',
      likes: 2,
      __v: 0,
    },
    {
      _id: '2',
      title: 'Second',
      author: 'Edsger W. Dijkstra',
      url: 'http://example.com/2',
      likes: 5,
      __v: 0,
    },
    {
      _id: '3',
      title: 'Third',
      author: 'Robert C. Martin',
      url: 'http://example.com/3',
      likes: 1,
      __v: 0,
    },
    {
      _id: '4',
      title: 'Fourth',
      author: 'Robert C. Martin',
      url: 'http://example.com/4',
      likes: 7,
      __v: 0,
    },
  ]

  test('of a bigger list returns author with most blogs', () => {
    const result = listHelper.mostBlogs(blogs)

    const expected = {
      author: 'Robert C. Martin',
      blogs: 3,
    }

    assert.deepStrictEqual(result, expected)
  })
})

// 4.7 mostLikes
describe('most likes', () => {
  test('of empty list is null', () => {
    const result = listHelper.mostLikes([])
    assert.strictEqual(result, null)
  })

  const blogs = [
    {
      _id: '1',
      title: 'First',
      author: 'Edsger W. Dijkstra',
      url: 'http://example.com/1',
      likes: 5,
      __v: 0,
    },
    {
      _id: '2',
      title: 'Second',
      author: 'Robert C. Martin',
      url: 'http://example.com/2',
      likes: 4,
      __v: 0,
    },
    {
      _id: '3',
      title: 'Third',
      author: 'Edsger W. Dijkstra',
      url: 'http://example.com/3',
      likes: 12,
      __v: 0,
    },
  ]

  test('of a bigger list returns author with most likes', () => {
    const result = listHelper.mostLikes(blogs)

    const expected = {
      author: 'Edsger W. Dijkstra',
      likes: 17,
    }

    assert.deepStrictEqual(result, expected)
  })
})
