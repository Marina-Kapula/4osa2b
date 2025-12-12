// tests/blog_api.test.js

const { test, beforeEach, after } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../utils/models/blog')
const User = require('../utils/models/user')
const bcrypt = require('bcryptjs')

const api = supertest(app)

// helper функція для отримання токена
const getToken = async () => {
  const response = await api
    .post('/api/login')
    .send({ username: 'testuser', password: 'testpassword' })
  
  return response.body.token
}

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
  await User.deleteMany({})

  // створюємо тестового користувача
  const passwordHash = await bcrypt.hash('testpassword', 10)
  const user = new User({
    username: 'testuser',
    name: 'Test User',
    passwordHash,
  })
  const savedUser = await user.save()

  // створюємо блоги для цього користувача
  const blogsWithUser = initialBlogs.map(blog => ({
    ...blog,
    user: savedUser._id
  }))
  
  await Blog.insertMany(blogsWithUser)
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

// 4.10 + 4.23: POST /api/blogs добавляет новый блог (с токеном)
test('a valid blog can be added', async () => {
  const token = await getToken()

  const newBlog = {
    title: 'New blog',
    author: 'Author Three',
    url: 'http://example.com/3',
    likes: 7,
  }

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await Blog.find({})
  assert.strictEqual(blogsAtEnd.length, initialBlogs.length + 1)

  const titles = blogsAtEnd.map((b) => b.title)
  assert(titles.includes('New blog'))
})

// 4.11 + 4.23: если likes не указан, он становится 0
test('if likes property is missing, it will default to 0', async () => {
  const token = await getToken()

  const newBlog = {
    title: 'No likes field blog',
    author: 'Author Four',
    url: 'http://example.com/4',
  }

  const response = await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  assert.strictEqual(response.body.likes, 0)
})

// 4.13 + 4.23: a blog can be deleted (з токеном)
test('a blog can be deleted', async () => {
  const token = await getToken()

  const blogsAtStart = await Blog.find({})
  const blogToDelete = blogsAtStart[0]

  await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(204)

  const blogsAtEnd = await Blog.find({})

  const titles = blogsAtEnd.map(b => b.title)
  assert(!titles.includes(blogToDelete.title))

  assert.strictEqual(blogsAtEnd.length, blogsAtStart.length - 1)
})

// 4.12 + 4.23: нет title -> 400 Bad Request (навіть з токеном)
test('blog without title is not added', async () => {
  const token = await getToken()

  const newBlog = {
    author: 'No title Author',
    url: 'http://example.com/5',
    likes: 1,
  }

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(400)

  const blogsAtEnd = await Blog.find({})
  assert.strictEqual(blogsAtEnd.length, initialBlogs.length)
})

// 4.14: a blog's likes can be updated (БЕЗ токена)
test("a blog's likes can be updated", async () => {
  const blogsAtStart = await Blog.find({})
  const blogToUpdate = blogsAtStart[0]

  const updatedData = { likes: blogToUpdate.likes + 1 }

  const response = await api
    .put(`/api/blogs/${blogToUpdate.id}`)
    .send(updatedData)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  assert.strictEqual(response.body.likes, blogToUpdate.likes + 1)

  const blogInDb = await Blog.findById(blogToUpdate.id)
  assert.strictEqual(blogInDb.likes, blogToUpdate.likes + 1)
})

// 4.12 + 4.23: нет url -> 400 Bad Request (навіть з токеном)
test('blog without url is not added', async () => {
  const token = await getToken()

  const newBlog = {
    title: 'No url blog',
    author: 'No url Author',
    likes: 1,
  }

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(400)

  const blogsAtEnd = await Blog.find({})
  assert.strictEqual(blogsAtEnd.length, initialBlogs.length)
})

// 4.23: НОВИЙ ТЕСТ - без токена повертає 401
test('adding a blog fails with status code 401 if token is not provided', async () => {
  const newBlog = {
    title: 'Blog without token',
    author: 'No Token Author',
    url: 'http://example.com/notoken',
    likes: 0,
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(401)

  const blogsAtEnd = await Blog.find({})
  assert.strictEqual(blogsAtEnd.length, initialBlogs.length)
})

// 4.23: НОВИЙ ТЕСТ - видалення без токена повертає 401
test('deleting a blog fails with status code 401 if token is not provided', async () => {
  const blogsAtStart = await Blog.find({})
  const blogToDelete = blogsAtStart[0]

  await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .expect(401)

  const blogsAtEnd = await Blog.find({})
  assert.strictEqual(blogsAtEnd.length, blogsAtStart.length)
})

after(async () => {
  await mongoose.connection.close()
})
