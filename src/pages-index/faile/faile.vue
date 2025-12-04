<!--
 * @Author: pangyawei
 * @Date: 2025-09-25 09:29:15
 * @LastEditors: pangyawei
 * @LastEditTime: 2025-09-29 14:26:20
 * @Description: 挽留失败需求处理列表页面
 * @filePath: Do not edit
-->
<route lang="jsonc" type="page">{
  "layout": "default",
  "style": {
    "navigationBarTitleText": "挽留失败需求处理",
    "navigationStyle": "custom"
  }
}</route>

<template>
  <view class="fail-page min-h-screen bg-[#f5f5f5]">
    <TopHeader :title="title" :subtitle="subtitle" @back="handleBack" />
    <view class="list-container">
      <z-paging ref="paging" v-model="dataList" @query="queryList" :use-page-scroll="true"
        :empty-view-style="{ paddingTop: '200rpx' }">
        <template v-for="item in dataList" :key="item.id">
          <view class="list-item" @click="handleItemClick(item)">
            <view class="item-content">
              <view class="item-header">
                <view class="item-title">{{ getItemTitle(item.needType) }}</view>
                <view class="item-status">
                  <wd-tag custom-class="space" type="danger" mark v-if="item.holdResult === '失败'">{{ item.holdResult
                  }}</wd-tag>
                  <wd-tag custom-class="space" type="warning" mark v-if="item.holdResult === '待处理'">{{ item.holdResult
                  }}</wd-tag>
                  <wd-tag custom-class="space" type="success" mark v-if="item.holdResult === '成功'">{{ item.holdResult
                  }}</wd-tag>
                </view>
              </view>
              <view class="item-info">
                <view class="info-row">
                  <text class="info-label">客户姓名：</text>
                  <text class="info-value">{{ item.customerName }}</text>
                </view>
                <view class="info-row">
                  <text class="info-label">客户电话：</text>
                  <text class="info-value">{{ item.customerPhone }}</text>
                </view>
                <view class="info-row">
                  <text class="info-label">所在地址：</text>
                  <text class="info-value">{{ item.address || '--' }}</text>
                </view>
                <view class="info-row">
                  <text class="info-label">提交时间：</text>
                  <text class="info-value">{{ item.createTime }}</text>
                </view>
              </view>
              <view class="item-arrow">
                <wd-icon name="arrow-right" size="16" color="#C7C7CC" />
              </view>
            </view>
          </view>
        </template>
        <template #empty>
          <view class="empty-container">
            <view class="empty-content">
              <view class="empty-icon">
                <wd-img src="/static/images/empty.png" mode="widthFix" width="80" height="80"></wd-img>
              </view>
              <view class="empty-text">当前暂无"挽留需求"处理</view>
              <view class="empty-action">
                <wd-button type="primary" size="medium" @click="handleReturnHome">返回首页</wd-button>
              </view>
            </view>
          </view>
        </template>
      </z-paging>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { orderProcessList, userUsernameUsingGet } from '@/service/jdwl'
import TopHeader from '@/components/TopHeader.vue'
import { useUserStore } from '@/store/user'
const userStore = useUserStore()
const title = ref(userStore.userInfo.user.channelName)
const subtitle = ref(userStore.userInfo.user.nickName)

interface ListItem {
  id: number
  address: string | null
  applyCode: string
  approveUserId: number | null
  approveUserName: string | null
  channelId: number | null
  channelName: string
  createBy: string
  createId: number
  createTime: string
  customerName: string
  customerPhone: string
  deleteFlag: string
  endTime: string | null
  failHandle: string | null
  failResult: string
  holdResult: string
  needType: string
  picUrl: string | null
  processKey: string | null
  remark: string
  startTime: string | null
  sucessAct: string
  updateBy: string | null
  updateTime: string
  workStatus: string | null
  submitTime?: string // 如果有用到submitTime字段
  status?: string     // 如果有用到status字段
  title?: string      // 如果有用到title字段
}
const paging = ref()
const dataList = ref<ListItem[]>([])
const needTypeOptions = ref([])

onLoad(() => {
  getNeedTypeOptions()
})

const getNeedTypeOptions = async () => {
  const res = await userUsernameUsingGet({ params: { dictType: 'jdwl_need_type' } })
  needTypeOptions.value = res.data
}

const getItemTitle = (needType: string) => {
  const item = needTypeOptions.value.find(item => item.dictValue === needType)
  return item ? item.dictLabel : needType
}

// 查询列表数据
function queryList(pageNo: number, pageSize: number) {
  // 模拟网络请求
  orderProcessList({
    params: {
      pageNum: pageNo,
      pageSize: pageSize,
      holdResult: '待处理'
    }
  }).then(res => {
    if (res.code === 200) {
      dataList.value = res.rows
      paging.value?.complete(dataList.value)
    }
  })
}

// 获取状态样式类
function getStatusClass(status: string) {
  switch (status) {
    case '成功':
      return 'status-processing'
    case '失败':
      return 'status-completed'
    case '失败并派单':
      return 'status-pending'
    default:
      return 'status-default'
  }
}

// 点击列表项 - 进入详情页面
function handleItemClick(item: ListItem) {
  console.log('点击列表项:', item)
  // 跳转到详情页面，传递参数
  uni.navigateTo({
    url: `/pages-index/faile/fail-detail?id=${item.id}`
  })
}

// 返回首页
function handleReturnHome() {
  uni.reLaunch({
    url: '/pages/index/index'
  })
}

// 返回处理
function handleBack() {
  uni.navigateBack()
}
</script>

<style lang="scss" scoped>
.fail-page {
  .list-container {
    padding: 20rpx;
    padding-bottom: 40rpx;
  }

  .list-item {
    margin-bottom: 24rpx;
    background: white;
    border-radius: 16rpx;
    overflow: hidden;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
    transition: all 0.3s ease;

    &:active {
      transform: translateY(2rpx);
      box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
    }
  }

  .item-content {
    position: relative;
    padding: 32rpx 24rpx;
    padding-right: 60rpx; // 为箭头留出空间
  }

  .item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;
  }

  .item-title {
    font-size: 36rpx;
    font-weight: 600;
    color: #333;
    flex: 1;
  }

  .item-status {
    display: flex;
    align-items: center;
    padding: 8rpx 16rpx;
    border-radius: 20rpx;
  }

  .item-info {
    .info-row {
      display: flex;
      margin-bottom: 12rpx;
      line-height: 1.5;

      &:last-child {
        margin-bottom: 0;
      }
    }

    .info-label {
      font-size: 28rpx;
      color: #666;
      min-width: 140rpx;
      flex-shrink: 0;
    }

    .info-value {
      font-size: 28rpx;
      color: #333;
      flex: 1;
      word-break: break-all;
    }
  }

  .item-arrow {
    position: absolute;
    right: 24rpx;
    top: 50%;
    transform: translateY(-50%);
  }

  .empty-container {
    padding: 100rpx 40rpx;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .empty-content {
    text-align: center;
  }

  .empty-icon {
    margin-bottom: 40rpx;
  }

  .empty-text {
    font-size: 32rpx;
    color: #666;
    margin-bottom: 60rpx;
    line-height: 1.5;
  }

  .empty-action {
    // 空状态按钮样式
  }
}
</style>