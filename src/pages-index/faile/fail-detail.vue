<!--
 * @Author: pangyawei
 * @Date: 2025-09-25 10:30:00
 * @LastEditors: pangyawei
 * @LastEditTime: 2025-09-29 15:34:09
 * @Description: 挽留失败需求处理详情页面 - 集成现场处理和装维上门
 * @filePath: Do not edit
-->
<route lang="jsonc" type="page">{
  "layout": "default",
  "style": {
    "navigationBarTitleText": "需求处理详情",
    "navigationStyle": "custom"
  }
}</route>

<script lang="ts" setup>
import BottomBtn from '@/components/bottomBtn.vue'
import TopHeader from '@/components/TopHeader.vue'
import { editjdwlOrderProcess, getChannel, getjdwlTeamList, getTodoDoneDetail, orderProcessDetail, userUsernameUsingGet } from '@/service/jdwl'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()
const title = ref(userStore.userInfo.channelName)
const subtitle = ref(userStore.userInfo.user.nickName)
const customerInfo = ref({})
const failHandle = ref('1')
const failResult = ref('')
const remark = ref('')
const teamName = ref('')
const esopArea = ref('')
const approveUserId = ref('')
const teamOptions = ref([])
const sopOptions = ref([])
const staffOptions = ref([])
const needTypeOptions = ref([])
const channelOptions = ref([])
const type = ref('')

onLoad((options: any) => {
  type.value = options.type
  if (options.type === 'todo') {
    getTodoDoneDetail({ params: { processKey: options.procInsId } }).then((res) => {
      console.log(res, 'res')
      if (res.code === 200) {
        customerInfo.value = res.data
      }
    })
  }
  else {
    getOrderProcessDetail(options.id)
  }
  getNeedTypeOptions()
  getChannelOptions()
})

watch([() => teamName.value, () => esopArea.value], async (newVal) => {
  console.log(newVal, 'newVal')
  if (newVal[0]) {
    const res = await getChannel({ params: { channelName: newVal[0] } })
    sopOptions.value = res.rows
  }
  if (newVal[1]) {
    const res = await getjdwlTeamList({ params: { teamName: newVal[0], esopArea: newVal[1], orderType: '0' } })
    staffOptions.value = res.rows
  }
})

async function getChannelOptions() {
  const res = await getChannel({ params: { channelName: '' } })
  channelOptions.value = res.rows
}

async function getNeedTypeOptions() {
  const res = await userUsernameUsingGet({ params: { dictType: 'jdwl_need_type' } })
  needTypeOptions.value = res.data
}

function getItemTitle(needType: string) {
  const item = needTypeOptions.value.find(item => item.dictValue === needType)
  return item ? item.dictLabel : needType
}

async function getOrderProcessDetail(id: string) {
  const res = await orderProcessDetail({ params: { id } })
  if (res.code === 200) {
    customerInfo.value = res.data
  }
}

function handleSubmit() {
  if (failHandle.value === '1') {
    if (!failResult.value.trim()) {
      uni.showToast({
        title: '请输入失败原因',
        icon: 'none',
      })
      return
    }

    if (!remark.value.trim()) {
      uni.showToast({
        title: '请输入处理备注',
        icon: 'none',
      })
      return
    }

    // 现场处理提交
    submitOnsiteProcess()
  }
  else if (failHandle.value === '2') {
    // 装维上门验证
    if (!teamName.value) {
      uni.showToast({
        title: '请选择装维团队',
        icon: 'none',
      })
      return
    }

    if (!esopArea.value) {
      uni.showToast({
        title: '请选择sop小区',
        icon: 'none',
      })
      return
    }

    if (!approveUserId.value) {
      uni.showToast({
        title: '请选择装维人员',
        icon: 'none',
      })
      return
    }
    submitDoorService()
  }
}

function submitOnsiteProcess() {
  uni.showLoading({
    title: '提交中...',
  })
  editjdwlOrderProcess({
    body: {
      ...customerInfo.value,
      id: customerInfo.value.id,
      failHandle: failHandle.value,
      failResult: failResult.value,
      remark: remark.value,
    },
  }).then((res) => {
    if (res.code === 200) {
      uni.hideLoading()
      uni.showToast({
        title: '提交成功',
        icon: 'success',
      })
      setTimeout(() => {
        uni.navigateTo({
          url: '/pages-index/faile/faile',
        })
      }, 1500)
    }
    else {
      uni.hideLoading()
      uni.showToast({
        title: res.msg,
        icon: 'none',
      })
    }
  })
}

// 装维上门提交
function submitDoorService() {
  editjdwlOrderProcess({
    body: {
      ...customerInfo.value,
      id: customerInfo.value.id,
      failHandle: failHandle.value,
      teamName: teamName.value,
      esopArea: esopArea.value,
      approveUserId: approveUserId.value,
    },
  }).then((res) => {
    if (res.code === 200) {
      uni.showToast({
        title: '提交成功',
        icon: 'success',
      })
      setTimeout(() => {
        if (type.value === 'todo') {
          uni.navigateTo({
            url: '/pages-index/todo/todo',
          })
        }
        else {
          uni.navigateTo({
            url: '/pages-index/faile/faile',
          })
        }
      }, 1500)
    }
    else {
      uni.showToast({
        title: res.msg,
        icon: 'none',
      })
    }
  })
}

// 取消处理
function handleCancel() {
  uni.navigateTo({
    url: '/pages-index/faile/faile',
  })
}

// 返回处理
function handleBack() {
  uni.navigateBack()
}
</script>

<template>
  <view class="fail-detail-page min-h-screen bg-[#f5f5f5]">
    <!-- 顶部组件 -->
    <TopHeader :title="title" :subtitle="subtitle" @back="handleBack" />

    <!-- 主要内容区域 -->
    <view class="content-container">
      <!-- 需求类型需求类型 -->
      <view class="info-section">
        <view class="info-title">
          {{ getItemTitle(customerInfo.needType) }}
        </view>

        <!-- 客户信息 -->
        <view class="customer-info">
          <view class="info-row">
            <text class="info-label">客户姓名：</text>
            <text class="info-value">{{ customerInfo.customerName }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">客户电话：</text>
            <text class="info-value">{{ customerInfo.customerPhone }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">所在地址：</text>
            <text class="info-value">{{ customerInfo.address || '--' }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">提交时间：</text>
            <text class="info-value">{{ customerInfo.createTime }}</text>
          </view>
        </view>
      </view>

      <!-- 处理详情卡片 -->
      <view class="process-detail-card">
        <!-- 处理方式选择 -->
        <view class="form-row" style="align-items: center;">
          <view class="form-label">
            <span style="color: red;">*</span>处理方式：
          </view>
          <view class="form-content">
            <wd-radio-group v-model="failHandle" inline shape="dot">
              <wd-radio value="1">
                现场处理
              </wd-radio>
              <wd-radio value="2">
                装维上门
              </wd-radio>
            </wd-radio-group>
          </view>
        </view>

        <!-- 现场处理内容 -->
        <template v-if="failHandle === '1'">
          <view class="form-row">
            <view class="form-label">
              <span style="color: red;">*</span>失败原因
            </view>
            <view class="form-content">
              <wd-textarea v-model="failResult" placeholder="请输入失败原因" :rows="3" :maxlength="500" show-word-limit />
            </view>
          </view>

          <view class="form-row">
            <view class="form-label">
              <span style="color: red;">*</span>处理备注
            </view>
            <view class="form-content">
              <wd-textarea v-model="remark" placeholder="请输入处理备注" :rows="3" :maxlength="500" show-word-limit />
            </view>
          </view>
        </template>

        <!-- 装维上门内容 -->
        <template v-if="failHandle === '2'">
          <view class="form-row">
            <view class="form-label">
              <span style="color: red;">*</span>选择装维团队
            </view>
            <view class="form-content">
              <wd-picker v-model="teamName" :columns="channelOptions" value-key="resultField" label-key="resultField"
                placeholder="请选择装维团队" />
            </view>
          </view>

          <view class="form-row">
            <view class="form-label">
              <span style="color: red;">*</span>选择sop小区
            </view>
            <view class="form-content">
              <wd-picker v-model="esopArea" :columns="sopOptions" placeholder="请选择sop小区" label-key="resultField"
                value-key="resultField" :disabled="!teamName" />
            </view>
          </view>

          <view class="form-row">
            <view class="form-label">
              <span style="color: red;">*</span>选择装维人员
            </view>
            <view class="form-content">
              <wd-picker v-model="approveUserId" :columns="staffOptions" value-key="userId" label-key="nickName"
                placeholder="请选择装维人员" :disabled="!esopArea" />
            </view>
          </view>
        </template>
      </view>
    </view>

    <!-- 底部按钮 -->
    <BottomBtn :submit-text="failHandle === '1' ? '提交派单' : '提交派单'" save-draft-text="取消" @submit="handleSubmit"
      @save-draft="handleCancel" />
  </view>
</template>

<style lang="scss" scoped>
.fail-detail-page {
  .content-container {
    padding: 20rpx;
    padding-bottom: 160rpx; // 为底部按钮留出空间
  }

  .info-section {
    margin-bottom: 20rpx;
    background: white;
    border-radius: 16rpx;
    padding: 32rpx 24rpx;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
  }

  .info-title {
    font-size: 36rpx;
    font-weight: 600;
    color: #333;
    padding-bottom: 24rpx;
    text-align: center;
    border-bottom: 1rpx solid #f0f0f0;
    margin-bottom: 24rpx;
  }

  .customer-info {
    .info-row {
      display: flex;
      margin-bottom: 16rpx;
      line-height: 1.5;

      &:last-child {
        margin-bottom: 0;
      }
    }

    .info-label {
      font-size: 30rpx;
      color: #666;
      min-width: 140rpx;
      flex-shrink: 0;
    }

    .info-value {
      font-size: 30rpx;
      color: #333;
      flex: 1;
      word-break: break-all;
      font-weight: 500;
    }
  }

  .process-detail-card {
    background: white;
    border-radius: 16rpx;
    padding: 32rpx 24rpx;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
    margin-bottom: 40rpx;
  }

  .form-row {
    display: flex;
    align-items: flex-start;
    margin-bottom: 32rpx;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .form-label {
    font-size: 30rpx;
    font-weight: 500;
    color: #333;
    min-width: 160rpx;
    flex-shrink: 0;
    padding-top: 12rpx; // 与表单控件对齐
    line-height: 1.4;
  }

  .form-content {
    flex: 1;
    margin-left: 24rpx;
  }

  .radio-group {
    :deep(.wd-radio) {
      margin-right: 40rpx;
      margin-bottom: 16rpx;

      .wd-radio__label {
        font-size: 30rpx;
        color: #333;
      }
    }
  }
}

// 覆盖textarea样式
:deep(.wd-textarea) {
  padding: 0;

  .wd-textarea__inner {
    border: 1rpx solid #e5e5e5;
    border-radius: 12rpx;
    padding: 20rpx;
    font-size: 30rpx;
    line-height: 1.5;
  }

  .wd-textarea__count {
    font-size: 24rpx;
    color: #999;
    margin-top: 12rpx;
  }
}

// 覆盖picker样式
:deep(.wd-picker) {
  .wd-picker__field {
    border: 1rpx solid #e5e5e5;
    border-radius: 12rpx;
    padding: 24rpx 20rpx;
    font-size: 30rpx;
    background-color: #fafafa;

    &.is-focus {
      border-color: #4a90e2;
      background-color: #fff;
    }
  }

  .wd-picker__placeholder {
    color: #999;
    font-size: 30rpx;
  }

  .wd-picker__value {
    color: #333;
    font-size: 30rpx;
  }
}
</style>
