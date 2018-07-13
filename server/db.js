// Schema、Model、Entity或者Documents的关系请牢记，Schema生成Model，Model创造Entity，Model和Entity都可对数据库操作造成影响，但Model比Entity更具操作性。
const mongoose = require('mongoose')
// 连接数据库 如果不自己创建 默认test数据库会自动生成
mongoose.connect('mongodb://localhost/sjz')

// 为这次连接绑定事件
const db = mongoose.connection
db.once('error', () => console.log('Mongo connection error'))
db.once('open', () => console.log('Mongo connection successed'))
/** ************ 定义模式loginSchema **************/
const orderSchema = mongoose.Schema({
  id: String,
  type: String,
  beginTime: String,
  orderTime: String,
  state: String,
  foodId: String,
  timer: String,
  timeOutText: String,
  waitTimeout: String,
  workTimeout: String,
  settled: String
})
const foodSchema = mongoose.Schema({
  id: String,
  name: String,
  time: String
})

/** ************ 定义模型Model **************/
const Models = {
  Order: mongoose.model('Order', orderSchema),
  Food: mongoose.model('Food', foodSchema)
}

module.exports = Models
