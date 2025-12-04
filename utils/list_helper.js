// 4.3 dummy
const dummy = (blogs) => {
  return 1
}

// 4.4 totalLikes
const totalLikes = (blogs) => {
  return blogs.reduce((sum, blog) => sum + blog.likes, 0)
}

// 4.5 favoriteBlog
const favoriteBlog = (blogs) => {
  if (blogs.length === 0) {
    return null
  }

  return blogs.reduce((fav, blog) =>
    blog.likes > fav.likes ? blog : fav
  )
}

// 4.6 mostBlogs
const mostBlogs = (blogs) => {
  if (blogs.length === 0) {
    return null
  }

  const countsByAuthor = {}

  for (const blog of blogs) {
    const author = blog.author
    countsByAuthor[author] = (countsByAuthor[author] || 0) + 1
  }

  let topAuthor = null
  let maxBlogs = 0

  for (const author in countsByAuthor) {
    if (countsByAuthor[author] > maxBlogs) {
      topAuthor = author
      maxBlogs = countsByAuthor[author]
    }
  }

  return {
    author: topAuthor,
    blogs: maxBlogs,
  }
}


// 4.7 mostLikes
const mostLikes = (blogs) => {
  if (blogs.length === 0) {
    return null
  }

  const likesByAuthor = {}

  for (const blog of blogs) {
    const author = blog.author
    likesByAuthor[author] = (likesByAuthor[author] || 0) + blog.likes
  }

  let topAuthor = null
  let maxLikes = 0

  for (const author in likesByAuthor) {
    if (likesByAuthor[author] > maxLikes) {
      topAuthor = author
      maxLikes = likesByAuthor[author]
    }
  }

  return {
    author: topAuthor,
    likes: maxLikes,
  }
}

module.exports = {
  dummy,        // 4.3
  totalLikes,   // 4.4
  favoriteBlog, // 4.5
  mostBlogs,    // 4.6
  mostLikes,    // 4.7
}
