const jwt = require('jsonwebtoken')
const User = require('./models/user')



const tokenExtractor = (request, response, next) => {
  const authorization = request.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    request.token = authorization.substring(7)
  } else {
    request.token = null
  }
  next()
}

const userExtractor = async (request, response, next) => {
  const token = request.token

  if (!token) {
    request.user = null
    return next()
  }

  let decodedToken
  try {
    decodedToken = jwt.verify(token, process.env.SECRET)
  } catch (error) {
    request.user = null
    return next()
  }

  if (!decodedToken.id) {
    request.user = null
    return next()
  }

  const user = await User.findById(decodedToken.id)
  request.user = user || null
  next()
}

module.exports = {
  tokenExtractor,
  userExtractor,
}
