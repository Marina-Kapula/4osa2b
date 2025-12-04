const { test, beforeEach, after } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')

const api = supertest(app)

const initialBlogs = [
  {
    title: 'First blog',
    author: 'Author One',
    url: 'http://example.com/1',
    likes: 5,
  },
  {
    title: 'Second blog',
    author: 'Author Two',
    url: 'http://example.com/2',
    likes: 10,
  },
]

// перед КАЖДЫМ тестом очищаем и заполняем тестовую БД
beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(initialBlogs)
})

// 4.8: GET /api/blogs возвращает правильное количество и JSON
test('blogs are returned as json and correct amount', async () => {
  const response = await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)

  assert.strictEqual(response.body.length, initialBlogs.length)
})

// 4.9: поле идентификатора называется id, а не _id
test('unique identifier field is named id', async () => {
  const response = await api.get('/api/blogs')

  const blog = response.body[0]
  assert.ok(blog.id)
  assert.strictEqual(blog._id, undefined)
})

// 4.10: POST /api/blogs добавляет новый блог
test('a valid blog can be added', async () => {
  const newBlog = {
    title: 'New blog',
    author: 'Author Three',
    url: 'http://example.com/3',
    likes: 7,
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await Blog.find({})
  assert.strictEqual(blogsAtEnd.length, initialBlogs.length + 1)

  const titles = blogsAtEnd.map((b) => b.title)
  assert(titles.includes('New blog'))
})

// 4.11: если likes не указан, он становится 0
test('if likes property is missing, it will default to 0', async () => {
  const newBlog = {
    title: 'No likes field blog',
    author: 'Author Four',
    url: 'http://example.com/4',
  }

  const response = await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  assert.strictEqual(response.body.likes, 0)
})

// 4.12: нет title или url -> 400 Bad Request
test('blog without title is not added', async () => {
  const newBlog = {
    author: 'No title Author',
    url: 'http://example.com/5',
    likes: 1,
  }

  await api.post('/api/blogs').send(newBlog).expect(400)

  const blogsAtEnd = await Blog.find({})
  assert.strictEqual(blogsAtEnd.length, initialBlogs.length)
})

test('blog without url is not added', async () => {
  const newBlog = {
    title: 'No url blog',
    author: 'No url Author',
    likes: 1,
  }

  await api.post('/api/blogs').send(newBlog).expect(400)

  const blogsAtEnd = await Blog.find({})
  assert.strictEqual(blogsAtEnd.length, initialBlogs.length)
})

after(async () => {
  await mongoose.connection.close()
})
