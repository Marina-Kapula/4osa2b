const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const config = require('./utils/config')
const logger = require('./utils/logger')
const Blog = require('./models/blog')

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

// 4.8 + async/await: GET /api/blogs
app.get('/api/blogs', async (request, response) => {
  const blogs = await Blog.find({})
  response.json(blogs)
})

// 4.10–4.12: POST /api/blogs
app.post('/api/blogs', async (request, response) => {
  const body = request.body

  // 4.12: нет title или url -> 400
  if (!body.title || !body.url) {
    return response.status(400).end()
  }

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    // 4.11: likes по умолчанию 0
    likes: body.likes || 0,
  })

  const savedBlog = await blog.save()
  response.status(201).json(savedBlog)
})

module.exports = app
