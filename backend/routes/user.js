const {
  verifyToken,
  verifyTokenAndAuthorize,
  verifyTokenIsAdmin,
} = require('./verify')

const router = require('express').Router()
const CryptoJs = require('crypto-js')
const User = require('../models/User')

//update

router.put('/:id', verifyTokenAndAuthorize, async (req, res) => {
  if (req.body.password) {
    req.body.password = CryptoJs.AES.encrypt(
      req.body.password,
      process.env.SEC_PASS
    ).toString()
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    )
    res.status(200).json(updatedUser)
  } catch (err) {
    res.status(500).json(err)
  }
})

//delete
router.delete('/:id', verifyTokenAndAuthorize, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id)
    res.status(200).json('user has been deleted')
  } catch (err) {
    res.status(500).json(err)
  }
})

//get user

router.get('/find/:id', verifyTokenIsAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    const { password, ...others } = user._doc
    res.status(200).json(others)
  } catch (err) {
    res.status(500).json(err)
  }
})

//get all user

router.get('/', verifyTokenIsAdmin, async (req, res) => {
  try {
    const query = req.query.new
    const users = query
      ? await User.find().sort({ _id: -1 }).limit(5)
      : await User.find()
    res.status(200).json(users)
  } catch (err) {
    res.status(500).json(err)
  }
})

//get stats

router.get('/stats', verifyTokenIsAdmin, async (req, res) => {
  const date = new Date()
  const LastYear = new Date(date.setFullYear(date.getFullYear() - 1))
  try {
    const data = await User.aggregate([
      { $match: { createdAt: { $gte: LastYear } } },
      {
        $project: {
          month: { $month: '$createdAt' },
        },
      },
      {
        $group: {
          _id: '$month',
          total: { $sum: 1 },
        },
      },
    ])
    res.status(200).json(data)
  } catch (err) {}
})
module.exports = router
