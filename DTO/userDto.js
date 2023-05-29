const getDao = require('../DAO/factory')

const checkUserDto = async( username, password ) => {
  const users = await (await getDao()).users
  const userCheck = await users.checkUser( username, password )
  return userCheck
}

const addUserDto = async( userData ) => {
  const users = await (await getDao()).users
  const newUser = await users.addUser( userData )
  return newUser
}

const getUserDto = async( username ) => {
  const users = await (await getDao()).users
  const userData = await users.getUser( username )
  return userData
}


module.exports = { checkUserDto, addUserDto, getUserDto }