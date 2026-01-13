const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const config = require('./utils/config')
const logger = require('./utils/logger')
const middleware = require('./utils/middleware')
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
app.use(middleware.tokenExtractor)

app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)

// GET /api/blogs (без токена)
app.get('/api/blogs', async (request, response) => {
  const blogs = await Blog
    .find({})
    .populate('user', { username: 1, name: 1 })

  response.json(blogs)
})

// POST /api/blogs (з токеном)
app.post('/api/blogs', middleware.userExtractor, async (request, response) => {
  const body = request.body

  if (!body.title || !body.url) {
    return response.status(400).end()
  }

  const user = request.user
  if (!user) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes || 0,
    user: user._id,
  })

  const savedBlog = await blog.save()

  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()

  response.status(201).json(savedBlog)
})

// DELETE /api/blogs/:id (з токеном)
app.delete('/api/blogs/:id', middleware.userExtractor, async (request, response) => {
  const user = request.user
  if (!user) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }

  const blog = await Blog.findById(request.params.id)

  if (!blog) {
    return response.status(404).json({ error: 'blog not found' })
  }

  if (blog.user.toString() !== user._id.toString()) {
    return response.status(403).json({ error: 'only the creator can delete this blog' })
  }

  await Blog.findByIdAndDelete(request.params.id)
  response.status(204).end()
})

// PUT /api/blogs/:id (без токена)
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
