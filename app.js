// app.js

const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const config = require('./utils/config')
const logger = require('./utils/logger')
const middleware = require('./utils/middleware') // 4.20: підключаємо middleware
const Blog = require('./utils/models/blog')
const User = require('./utils/models/user')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')

const app = express()

mongoose.set('strictQuery', false)

logger.info('connecting to', config.MONGODB_URI)
mongoose
  .connect(config.MONGODB_URI)
  .then(() => {
    logger.info('connected to MongoDB')
  })
  .catch((error) => {
    logger.error('error connecting to MongoDB:', error.message)
  })

app.use(cors())
app.use(express.json())
app.use(middleware.tokenExtractor) // 4.20: додаємо tokenExtractor для всіх роутів

app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)

// 4.8 + 4.17: GET /api/blogs с populate (працює БЕЗ токена)
app.get('/api/blogs', async (request, response) => {
  const blogs = await Blog
    .find({})
    .populate('user', { username: 1, name: 1 })

  response.json(blogs)
})

// 4.10–4.12 + 4.17 + 4.19 + 4.20 + 4.22: POST /api/blogs
app.post('/api/blogs', middleware.userExtractor, async (request, response) => {
  const body = request.body

  // 4.12: нет title или url -> 400
  if (!body.title || !body.url) {
    return response.status(400).end()
  }

  // 4.22: берем пользователя из request.user (добавлен через userExtractor)
  const user = request.user

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes || 0,   // 4.11
    user: user._id,           // 4.17 + 4.19
  })

  const savedBlog = await blog.save()

  // 4.17: добавляем блог в user.blogs
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()

  response.status(201).json(savedBlog)
})

// 4.13 + 4.21 + 4.22: DELETE /api/blogs/:id
app.delete('/api/blogs/:id', middleware.userExtractor, async (request, response) => {
  // 4.22: берем пользователя из request.user
  const user = request.user
  
  const blog = await Blog.findById(request.params.id)
  
  if (!blog) {
    return response.status(404).json({ error: 'blog not found' })
  }

  // 4.21: проверяем, что пользователь является автором блога
  if (blog.user.toString() !== user._id.toString()) {
    return response.status(403).json({ error: 'only the creator can delete this blog' })
  }

  await Blog.findByIdAndDelete(request.params.id)
  response.status(204).end()
})

// 4.14: PUT /api/blogs/:id (працює БЕЗ токена)
app.put('/api/blogs/:id', async (request, response) => {
  const id = request.params.id
  const body = request.body

  const updatedBlog = await Blog.findByIdAndUpdate(
    id,
    { likes: body.likes },
    { new: true, runValidators: true }
  )

  response.json(updatedBlog)
})

module.exports = app
