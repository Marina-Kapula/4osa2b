const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const config = require('./utils/config')
const logger = require('./utils/logger')
const Blog = require('./utils/models/blog')
const User = require('./utils/models/user')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')

const jwt = require('jsonwebtoken')

const app = express()

// 4.19: helper to get token from Authorization header
const getTokenFrom = (request) => {
  const authorization = request.get('authorization')
  if (authorization && authorization.startsWith('Bearer ')) {
    return authorization.replace('Bearer ', '')
  }
  return null
}

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
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)

// 4.8 + 4.17: GET /api/blogs c populate
app.get('/api/blogs', async (request, response) => {
  const blogs = await Blog
    .find({})
    .populate('user', { username: 1, name: 1 })

  response.json(blogs)
})

// 4.10–4.12 + 4.17 + 4.19: POST /api/blogs
app.post('/api/blogs', async (request, response) => {
  const body = request.body

  // 4.12: нет title или url -> 400
  if (!body.title || !body.url) {
    return response.status(400).end()
  }

  // 4.19: проверяем токен
  const token = getTokenFrom(request)
  const decodedToken = jwt.verify(token, process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' })
  }

  const user = await User.findById(decodedToken.id)

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

// 4.13: DELETE /api/blogs/:id
app.delete('/api/blogs/:id', async (request, response) => {
  const id = request.params.id
  await Blog.findByIdAndDelete(id)
  response.status(204).end()
})

// 4.14: PUT /api/blogs/:id
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
