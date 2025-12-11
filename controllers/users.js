// 4.15–4.16: users controller
const bcrypt = require('bcryptjs')

const usersRouter = require('express').Router()
const User = require('../utils/models/user')


// 4.16: валидация + создание пользователя
usersRouter.post('/', async (request, response) => {
  const { username, name, password } = request.body

  if (!username || !password) {
    return response.status(400).json({ error: 'username and password required' })
  }
  if (username.length < 3 || password.length < 3) {
    return response.status(400).json({ error: 'username and password must be at least 3 characters long' })
  }

  const existingUser = await User.findOne({ username })
  if (existingUser) {
    return response.status(400).json({ error: 'username must be unique' })
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    username,
    name,
    passwordHash,
  })

  const savedUser = await user.save()
  response.status(201).json(savedUser)
})

// 4.15: список всех пользователей
usersRouter.get('/', async (request, response) => {
  const users = await User.find({})
  response.json(users)
})

module.exports = usersRouter
