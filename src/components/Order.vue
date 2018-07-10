<template>
  <v-card>
    <!--弹出新增框-->
    <v-layout row justify-center>
      <v-dialog v-model="create_order_dialog" max-width="500px">
        <v-card>
          <v-card-title>
            <span class="headline">新增订单</span>
          </v-card-title>
          <v-card-text>
            <v-text-field label="订单号" v-model="newOrder.id"></v-text-field>
            <v-select
              :items="foodList"
              v-model="newOrder.foodId"
              label="食品类型"
              item-text="name"
              item-value="id"
            ></v-select>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="success" @click.native="createOrder()" :loading="createOrderLoading">新增</v-btn>
            <v-btn color="error" @click.native="create_order_dialog = false">取消</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-layout>

    <!--弹出删除确认框-->
    <v-layout row justify-center style="position: relative;">
      <v-dialog v-model="delete_order_dialog" max-width="500px">
        <v-card>
          <v-card-title>
            <div class="headline">确定删除吗？</div>
          </v-card-title>
          <v-card-text>删除后不可恢复！</v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="success" @click="deleteOrder()" :loading="deleteOrderLoading">删除</v-btn>
            <v-btn color="error" @click="delete_order_dialog = false">取消</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-layout>

    <!--弹出接单确认框-->
    <v-layout row justify-center style="position: relative;">
      <v-dialog v-model="confirm_order_dialog" max-width="500px">
        <v-card>
          <v-card-title>
            <div class="headline">确定接单吗？</div>
          </v-card-title>
          <v-card-text></v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="success" @click="confirmOrder()" :loading="confirmOrderLoading">确定</v-btn>
            <v-btn color="error" @click="confirm_order_dialog = false">取消</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-layout>

    <!--弹出完成确认框-->
    <v-layout row justify-center style="position: relative;">
      <v-dialog v-model="confirm_complete_dialog" max-width="500px">
        <v-card>
          <v-card-title>
            <div class="headline">确定完成吗？</div>
          </v-card-title>
          <v-card-text></v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="success" @click="confirmComplete()" :loading="confirmCompleteLoading">确定</v-btn>
            <v-btn color="error" @click="confirm_complete_dialog = false">取消</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-layout>

    <v-container
      fluid
      grid-list-lg
    >
      <v-layout row wrap>
        <template v-for="order in orderList">
          <v-flex xs2 @click="showConfirm(order)">
            <v-card :color="order.color" class="white--text">
              <v-card-title primary-title>
                <div class="title">订单号：{{order.id}}</div>
              </v-card-title>
              <v-card-text>
                <div class="body-2">食品类型：{{order.foodName}}</div>
                <div class="body-2">订单状态：{{order.info}}</div>
                <div class="title">剩余时间：{{order.timeOutText}}秒</div>
              </v-card-text>
              <v-card-actions>
                <v-btn flat dark @click="showConfirm(order)" :disabled="order.ensureDisabled">{{order.ensureText}}
                </v-btn>
                <v-spacer></v-spacer>
                <v-btn dark icon @click="showDelete(order)" title="删除">
                  <v-icon>delete</v-icon>
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-flex>
        </template>
      </v-layout>
    </v-container>
    <v-btn
      color="pink"
      dark
      normal
      absolute
      bottom
      right
      fab
      @click="showCreate()"
    >
      <v-icon>add</v-icon>
    </v-btn>
    <v-snackbar
      v-model="snackbarModel.snackbar"
      :bottom="snackbarModel.y === 'bottom'"
      :left="snackbarModel.x === 'left'"
      :multi-line="snackbarModel.mode === 'multi-line'"
      :right="snackbarModel.x === 'right'"
      :timeout="snackbarModel.timeout"
      :top="snackbarModel.y === 'top'"
      :vertical="snackbarModel.mode === 'vertical'"
      color="green"
    >
      {{ infoText }}
      <v-btn
        dark
        flat
        @click="snackbarModel.snackbar = false"
      >
        Close
      </v-btn>
    </v-snackbar>
  </v-card>
</template>
<script>
  import axios from 'axios'
  import {getCurrentSecond} from '@/assets/js/Utils'

  var newEmptyOrder = {
    id: '',
    type: '0',
    beginTime: '',
    orderTime: '',
    state: '0',
    foodId: '',
    timer: null,
    ensureText: '确认接单',
    ensureDisabled: false,
    timeOutText: ''
  }
  export default {
    mounted () {
      this.getFoodList()
      this.getOrderList()
    },
    data () {
      return {

        STATE_WAITING_CONFIRM: '0',
        STATE_WORKING: '1',
        STATE_WORK_TIMEOUT: '2',
        STATE_WAITING_TIMEOUT: '3',
        STATE_COMPLETED: '4',

        create_order_dialog: false,
        createOrderLoading: false,

        delete_order_dialog: false,
        deleteOrderLoading: false,

        confirm_order_dialog: false,
        confirmOrderLoading: false,

        confirm_complete_dialog: false,
        confirmCompleteLoading: false,

        newOrder: newEmptyOrder,
        updateOrder: null,
        orderList: [],
        foodList: [],
        infoText: '',
        snackbarModel: {
          snackbar: false,
          y: 'top',
          x: null,
          mode: '',
          timeout: 3000
        }
      }
    },
    methods: {
      getFoodList () {
        axios.get('/api/food/getFoodList')
          .then((response) => {
            this.foodList = response.data
          })
      },
      getOrderList () {
        axios.get('/api/order/getOrderList')
          .then((response) => {
            this.orderList = response.data
            this.orderList.forEach((order) => {
              order.foodName = this.foodList[order.foodId].name
              if (order.state === this.STATE_WAITING_CONFIRM) {
                order.info = '等待接单'
                order.color = 'warning'
                order.ensureText = '确认接单'
              } else if (order.state === this.STATE_WORKING) {
                order.info = '已接单，处理中'
                order.color = 'primary'
                order.timeOutText = '0'
                order.ensureText = '确认完成'
              }
              this.countDown(order)
            })
          })
      },
      showCreate () {
        this.create_order_dialog = true
      },
      showConfirm (order) {
        if (order.state === this.STATE_WAITING_CONFIRM) {
          this.confirm_order_dialog = true
          this.updateOrder = order
        } else if (order.state === this.STATE_WORKING) {
          this.confirm_complete_dialog = true
          this.updateOrder = order
        }
      },
      showDelete (order) {
        this.delete_order_dialog = true
        this.updateOrder = order
      },
      createOrder () {
        // console.log(formatDate(getCurrentSecond(), 'yyyy-MM-dd hh:mm:ss'))
        if (this.newOrder.foodId === '') {
          this.infoText = '食品类型不能为空'
          this.snackbarModel.snackbar = true
          this.getOrderList()
          return
        }
        this.createOrderLoading = true
        this.newOrder.orderTime = getCurrentSecond()
        // this.newOrder.timeOutText = this.foodList[this.newOrder.foodId].time * 60
        this.newOrder.timeOutText = 300
        axios.post('/api/order/createOrder', this.newOrder)
          .then(() => {
            this.createOrderLoading = false
            this.create_order_dialog = false
            this.getOrderList()
          })
      },
      confirmOrder () {
        this.confirmOrderLoading = true
        this.updateOrder.state = this.STATE_WORKING
        this.updateOrder.beginTime = getCurrentSecond()
        this.updateOrder.timeOutText = this.foodList[this.updateOrder.foodId].time * 60
        axios.post('/api/order/updateOrder', this.updateOrder)
          .then(() => {
            this.confirmOrderLoading = false
            this.confirm_order_dialog = false
            this.updateOrder = null
            this.getOrderList()
          })
      },
      confirmComplete () {
        this.updateOrder.state = this.STATE_COMPLETED
        this.updateOrderState()
      },
      updateOrderState () {
        console.log(this.updateOrder)
        axios.post('/api/order/updateOrder', this.updateOrder)
          .then(() => {
            this.updateOrder = null
            this.confirmCompleteLoading = false
            this.confirm_complete_dialog = false
            this.getOrderList()
          })
      },
      deleteOrder () {
        this.deleteOrderLoading = true
        axios.post('/api/order/deleteOrder', this.updateOrder)
          .then(() => {
            this.deleteOrderLoading = false
            this.delete_order_dialog = false
            this.updateOrder = null
            this.getOrderList()
          })
      },
      countDown (order) {
        if (!order.timer) {
          if (order.state === this.STATE_WAITING_CONFIRM) {
            order.timer = setInterval(() => {
              if (getCurrentSecond() - order.orderTime < 300) {
                order.timeOutText = 300 - (getCurrentSecond() - order.orderTime)
              } else {
                order.info = '接单已超时'
                order.color = 'error'
                order.timeOutText = '0'
                clearInterval(order.timer)
                order.timer = null
              }
            }, 1000)
          } else if (order.state === this.STATE_WORKING) {
            order.timer = setInterval(() => {
              if (getCurrentSecond() - order.beginTime < this.foodList[order.foodId].time * 60) {
                order.timeOutText = this.foodList[order.foodId].time * 60 - (getCurrentSecond() - order.beginTime)
              } else {
                order.info = '制作已超时'
                order.color = 'error'
                order.timeOutText = '0'
                order.ensureText = '已超时'
                order.ensureDisabled = true
                order.state = this.STATE_WORK_TIMEOUT
                this.updateOrder = order
                this.updateOrderState()
                clearInterval(order.timer)
                order.timer = null
              }
            }, 1000)
          } else if (order.state === this.STATE_WORK_TIMEOUT) {
            order.info = '制作已超时'
            order.color = 'error'
            order.timeOutText = '0'
            order.ensureText = '已超时'
            order.ensureDisabled = true
          } else if (order.state === this.STATE_COMPLETED) {
            order.info = '制作完成'
            order.color = 'success'
            order.timeOutText = '0'
            order.ensureText = ''
            order.ensureDisabled = true
          }
        }
      }
    }
  }
</script>
