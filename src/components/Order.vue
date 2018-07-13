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
            <v-text-field label="订单号" v-model="newOrder.id"/>
            <v-select
              :items="foodList"
              v-model="newOrder.foodId"
              label="食品类型"
              item-text="name"
              item-value="id"/>
          </v-card-text>
          <v-card-actions>
            <v-spacer/>
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
            <v-spacer/>
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
          <v-card-actions>
            <v-spacer/>
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

    <!--弹出完成确认框-->
    <v-layout row justify-center style="position: relative;">
      <v-dialog v-model="settle_order_dialog" max-width="500px">
        <v-card>
          <v-card-title>
            <div class="headline">确定清空所有订单吗？（不可恢复）</div>
          </v-card-title>
          <v-card-actions>
            <v-spacer/>
            <v-btn color="success" @click="settleOrder()" :loading="settleOrderLoading">确定</v-btn>
            <v-btn color="error" @click="settle_order_dialog = false">取消</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-layout>

    <!--顶部工具栏-->
    <v-toolbar color="primary" dark="dark">
      <v-toolbar-title>闪金镇</v-toolbar-title>
      <v-toolbar-title>等待接单：{{COUNT_WAITING_CONFIRM}}</v-toolbar-title>
      <v-toolbar-title>接单超时：{{COUNT_WAITING_TIMEOUT}}</v-toolbar-title>
      <v-toolbar-title>制作超时：{{COUNT_WORK_TIMEOUT}}</v-toolbar-title>
      <v-toolbar-title>制作中：{{COUNT_WORKING}}</v-toolbar-title>
      <v-toolbar-title>完成：{{COUNT_COMPLETED}}</v-toolbar-title>
      <v-spacer/>
      <v-btn icon @click="showCreate()">
        <v-icon>add</v-icon>
      </v-btn>
      <v-btn icon @click="changeSort(0)" title="最近时间排序">
        <v-icon>query_builder</v-icon>
      </v-btn>
      <v-btn icon @click="changeSort(1)" title="订单号排序">
        <v-icon>filter_1</v-icon>
      </v-btn>
      <v-btn icon @click="changeSort(2)" title="订单类型排序">
        <v-icon>sort</v-icon>
      </v-btn>
      <v-btn icon @click="showSettle()" title="清空现有订单">
        <v-icon>remove_circle</v-icon>
      </v-btn>
    </v-toolbar>
    <!--订单列表-->
    <v-container
      fluid
      grid-list-lg
    >
      <v-layout row wrap>
        <template v-for="order in orderList" style="height: 10px">
          <v-flex xs2>
            <v-card :color="order.color" class="white--text">
              <v-card-title primary-title @click="showConfirm(order)">
                <div class="title">{{order.id}}</div>
                <v-spacer/>
                <span dark>{{order.waitTimeout == 0 ? '':'接'}}</span>
                <span dark>{{order.workTimeout == 0 ? '':'制'}}</span>
              </v-card-title>
              <v-card-text @click="showConfirm(order)">
                <div class="body-2">{{order.foodName}}</div>
                <div class="body-2">{{order.info}}</div>
                <div class="title">剩余时间：</div>
                <div class="title">{{order.timeOutText}}秒</div>
              </v-card-text>
              <v-card-actions>
                <v-spacer/>
                <v-btn dark icon @click="showDelete(order)" title="删除">
                  <v-icon>delete</v-icon>
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-flex>
        </template>
      </v-layout>
    </v-container>
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
    state: '1',
    foodId: '0',
    timer: null,
    timeOutText: '',
    waitTimeout: '0',
    workTimeout: '0',
    settled: '0'
  }
  export default {
    mounted () {
      this.getFoodList()
      this.getOrderList()
    },
    data () {
      return {

        STATE_WAITING_CONFIRM: '1',
        STATE_WORKING: '2',
        STATE_WORK_TIMEOUT: '4',
        STATE_WAITING_TIMEOUT: '0',
        STATE_COMPLETED: '3',

        COUNT_WAITING_CONFIRM: 0,
        COUNT_WORKING: 0,
        COUNT_WORK_TIMEOUT: 0,
        COUNT_WAITING_TIMEOUT: 0,
        COUNT_COMPLETED: 0,

        create_order_dialog: false,
        createOrderLoading: false,

        delete_order_dialog: false,
        deleteOrderLoading: false,

        confirm_order_dialog: false,
        confirmOrderLoading: false,

        confirm_complete_dialog: false,
        confirmCompleteLoading: false,

        settle_order_dialog: false,
        settleOrderLoading: false,

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
        },
        sortItems: [
          {text: '最近时间', value: 's'},
          {text: '最小订单', value: 'm'},
          {text: '订单类型', value: 'm'}
        ],
        sortType: 0
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
            // 默认按最近订单排序
            this.changeSort()
            // 重置计数器
            this.COUNT_WAITING_CONFIRM = 0
            this.COUNT_WORKING = 0
            this.COUNT_WORK_TIMEOUT = 0
            this.COUNT_WAITING_TIMEOUT = 0
            this.COUNT_COMPLETED = 0
            this.orderList.forEach((order) => {
              order.foodName = this.foodList[order.foodId].name
              this.countDown(order)
            })
          })
      },
      changeSort (sortType) {
        this.sortType = sortType
        if (this.sortType === 0) {
          this.orderList.sort((a, b) => {
            return b.orderTime - a.orderTime
          })
        } else if (this.sortType === 1) {
          this.orderList.sort((a, b) => {
            return a.id - b.id
          })
        } else if (this.sortType === 2) {
          this.orderList.sort((a, b) => {
            return a.state - b.state
          })
        }
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
        } else if (order.state === this.STATE_WORK_TIMEOUT) {
          this.confirm_complete_dialog = true
          this.updateOrder = order
        } else if (order.state === this.STATE_WAITING_TIMEOUT) {
          this.confirm_order_dialog = true
          this.updateOrder = order
        }
      },
      showDelete (order) {
        this.delete_order_dialog = true
        this.updateOrder = order
      },
      showSettle () {
        this.settle_order_dialog = true
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
      settleOrder () {
        axios.post('/api/order/settleOrder', this.updateOrder)
          .then(() => {
            this.settleOrderLoading = false
            this.settle_order_dialog = false
            this.getOrderList()
          })
      },
      countDown (order) {
        if (order.state === this.STATE_WAITING_CONFIRM) {
          this.COUNT_WAITING_CONFIRM++
          order.info = '等待接单'
          order.color = 'warning'
          order.timer = setInterval(() => {
            if (getCurrentSecond() - order.orderTime < 300) {
              order.timeOutText = 300 - (getCurrentSecond() - order.orderTime)
            } else {
              order.info = '接单已超时'
              order.color = 'error'
              order.timeOutText = '0'
              order.state = this.STATE_WAITING_TIMEOUT
              order.waitTimeout = 1
              this.updateOrder = order
              this.updateOrderState()
              clearInterval(order.timer)
              order.timer = null
            }
          }, 1000)
        } else if (order.state === this.STATE_WORKING) {
          this.COUNT_WORKING++
          order.info = '已接单，处理中'
          order.color = 'primary'
          order.timer = setInterval(() => {
            if (getCurrentSecond() - order.beginTime < this.foodList[order.foodId].time * 60) {
              order.timeOutText = this.foodList[order.foodId].time * 60 - (getCurrentSecond() - order.beginTime)
            } else {
              order.info = '制作已超时'
              order.color = 'error'
              order.timeOutText = '0'
              order.state = this.STATE_WORK_TIMEOUT
              order.workTimeout = 1
              this.updateOrder = order
              this.updateOrderState()
              clearInterval(order.timer)
              order.timer = null
            }
          }, 1000)
        } else if (order.state === this.STATE_WORK_TIMEOUT) {
          this.COUNT_WORK_TIMEOUT++
          order.info = '制作已超时'
          order.color = 'error'
          order.timeOutText = '0'
          clearInterval(order.timer)
          order.timer = null
        } else if (order.state === this.STATE_WAITING_TIMEOUT) {
          this.COUNT_WAITING_TIMEOUT++
          order.info = '接单已超时'
          order.color = 'error'
          order.timeOutText = '0'
          clearInterval(order.timer)
          order.timer = null
        } else if (order.state === this.STATE_COMPLETED) {
          this.COUNT_COMPLETED++
          order.info = '制作完成'
          order.color = 'success'
          order.timeOutText = '0'
          clearInterval(order.timer)
          order.timer = null
        }
      }
    }
  }
</script>
