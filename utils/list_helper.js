// 4.3 dummy
const dummy = (blogs) => {return 1}


// 4.4 totalLikes
const totalLikes = (blogs) => {return blogs.reduce((sum, blog) => sum + blog.likes, 0)}

// 4.5 favoriteBlog
const favoriteBlog = (blogs) => {
  if (blogs.length === 0) {
    return null
  }

  return blogs.reduce((fav, blog) =>blog.likes > fav.likes ? blog : fav)
}
 // 4.3 4.4 4.5 
module.exports = {dummy,totalLikes,favoriteBlog,}
