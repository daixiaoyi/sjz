// 可能是我的node版本问题，不用严格模式使用ES6语法会报错
'use strict'
const models = require('./db')
const express = require('express')
const router = express.Router()

/** ************ 创建(create) 读取(get) 更新(update) 删除(delete) **************/

// 创建订单
router.post('/api/order/createOrder', (req, res) => {
  // 这里的req.body能够使用就在index.js中引入了const bodyParser = require('body-parser')
  let newOrder = new models.Order({
    id: req.body.id,
    type: req.body.type,
    beginTime: req.body.beginTime,
    orderTime: req.body.orderTime,
    state: req.body.state,
    foodId: req.body.foodId,
    timer: req.body.timer,
    timeOutText: req.body.timeOutText
  })
  // 保存数据newAccount数据进mongoDB
  newOrder.save((err, data) => {
    if (err) {
      res.send(err)
    } else {
      res.send('createOrder successed')
    }
  })
})
// 更新订单
router.post('/api/order/updateOrder', (req, res) => {
  var conditions = {_id: req.body._id}
  var updates = {$set: {state: req.body.state, beginTime: req.body.beginTime}}
  models.Order.update(conditions, updates, function (error) {
    if (error) {
      console.error(error)
    } else {
      res.send('updateOrder successed')
    }
  })
})
// 删除订单
router.post('/api/order/deleteOrder', (req, res) => {
  var conditions = {_id: req.body._id}
  models.Order.remove(conditions, function (error) {
    if (error) {
      console.error(error)
    } else {
      res.send('deleteOrder successed')
    }
  })
})
// 获取订单列表
router.get('/api/order/getOrderList', (req, res) => {
  var timeStamp = new Date()
  timeStamp = timeStamp.getTime() / 1000
  models.Order.find({orderTime: {$gt: timeStamp - 86400}}, (err, data) => {
    if (err) {
      res.send(err)
    } else {
      res.send(data)
    }
  })
})
// 获取食物列表
router.get('/api/food/getFoodList', (req, res) => {
  models.Food.find((err, data) => {
    if (err) {
      res.send(err)
    } else {
      res.send(data)
    }
  })
})

module.exports = router
