const router = require('express').Router()
const User = require('../models/User')
const CryptoJs = require('crypto-js')
const Jwt = require('jsonwebtoken')

//register

router.post('/register', async (req, res) => {
  const newUser = new User({
    username: req.body.username,
    email: req.body.email,
    password: CryptoJs.AES.encrypt(
      req.body.password,
      process.env.SEC_PASS
    ).toString(),
  })

  try {
    const savedUser = await newUser.save()
    res.status(201).json(savedUser)
  } catch (error) {
    res.status(500).json(err)
  }
})

//loginn

router.post('/login', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username })

    !user && res.status(401).json('wrong username')

    const hashedPassword = CryptoJs.AES.decrypt(
      user.password,
      process.env.SEC_PASS
    )
    const originalPassword = hashedPassword.toString(CryptoJs.enc.Utf8)
    const inputPassword = req.body.password

    originalPassword != inputPassword && res.status(401).json('wrong password')

    const accessToken = Jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SEC,
      { expiresIn: '3d' }
    )
    const { password, ...others } = user._doc
    res.status(200).json({ ...others, accessToken })
  } catch (err) {
    res.status(500).json(err)
    console.log(err)
  }
})

module.exports = router
