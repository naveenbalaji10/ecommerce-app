const {
  verifyToken,
  verifyTokenAndAuthorize,
  verifyTokenIsAdmin,
} = require('./verify')
const router = require('express').Router()
const Order = require('../models/order')

router.post('/', verifyTokenIsAdmin, async (req, res) => {
  const newOrder = new Order(req.body)

  try {
    const savedOrder = await newOrder.save()
    res.status(200).json(savedOrder)
  } catch (err) {
    res.status(500).json(err)
  }
})

//UPDATE
router.put('/:id', verifyTokenIsAdmin, async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    )
    res.status(200).json(updatedOrder)
  } catch (err) {
    res.status(500).json(err)
  }
})

//DELETE
router.delete('/:id', verifyTokenIsAdmin, async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id)
    res.status(200).json('Order has been deleted...')
  } catch (err) {
    res.status(500).json(err)
  }
})

//GET PRODUCT
router.get('/find/:id', async (req, res) => {
  try {
    const orders = await Order.findById(req.params.id)
    res.status(200).json(orders)
  } catch (err) {
    res.status(500).json(err)
  }
})

//GET ALL PRODUCTS
router.get('/', async (req, res) => {
  const qNew = req.query.new
  const qCategory = req.query.category
  try {
    let orders

    if (qNew) {
      orders = await Order.find().sort({ createdAt: -1 }).limit(1)
    } else if (qCategory) {
      orders = await Order.find({
        categories: {
          $in: [qCategory],
        },
      })
    } else {
      orders = await Order.find()
    }

    res.status(200).json(orders)
  } catch (err) {
    res.status(500).json(err)
  }
})

//get monthly income

router.get('/income', verifyTokenIsAdmin, async (req, res) => {
  const date = new Date()
  const lastMonth = new Date(date.setMonth(date.getMonth() - 1))
  const previousMonth = new Date(new Date().setMonth(lastMonth - 1))

  try {
    const income = await Order.aggregate([
      { $match: { createdAt: { $gte: previousMonth } } },
      {
        $project: {
          month: { $month: '$createdAt' },
          sales: '$amount',
        },
      },
      {
        $group: {
          _id: '$month',
          total: { $sum: '$sales' },
        },
      },
    ])
    res.status(200).json(income)
  } catch (err) {
    res.status(500).json(err)
  }
})
module.exports = router
