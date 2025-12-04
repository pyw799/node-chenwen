<!--
 * @Author: pangyawei
 * @Date: 2025-09-24 16:23:57
 * @LastEditors: pangyawei
 * @LastEditTime: 2025-09-29 15:32:11
 * @Description: 文件内容描述
 * @filePath: Do not edit
-->
<route lang="jsonc" type="page">{
  "layout": "default",
  "style": {
    "navigationBarTitleText": "挽留成功信息补录",
    "navigationStyle": "custom"
  }
}</route>

<template>
  <view class="success-page min-h-screen bg-[#f5f5f5]">
    <!-- 顶部组件 -->
    <TopHeader :title="title" :subtitle="subtitle" icon="user" />

    <template v-if="showForm">
      <!-- 表单内容 -->
      <view class="content-container">
        <!-- 表单卡片 -->
        <view class="form-detail-card">
          <!-- 客户姓名 -->
          <view class="form-row">
            <view class="form-label"><span style="color: red;">*</span>客户姓名</view>
            <view class="form-content">
              <wd-input v-model="formData.customerName" placeholder="请输入客户姓名" />
            </view>
          </view>

          <!-- 客户电话 -->
          <view class="form-row">
            <view class="form-label"><span style="color: red;">*</span>客户电话</view>
            <view class="form-content">
              <wd-input v-model="formData.customerPhone" placeholder="请输入客户电话" type="tel" />
            </view>
          </view>

          <!-- 需求类型 -->
          <view class="form-row">
            <view class="form-label"><span style="color: red;">*</span>需求类型</view>
            <view class="form-content">
              <wd-picker v-model="formData.needType" placeholder="请选择需求类型" :columns="needTypeOptions"
                value-key="dictValue" label-key="dictLabel" />
            </view>
          </view>

          <!-- 成功举措 -->
          <view class="form-row">
            <view class="form-label"><span style="color: red;">*</span>成功举措</view>
            <view class="form-content">
              <wd-textarea v-model="formData.sucessAct" placeholder="请输入成功举措" :rows="3" :maxlength="500"
                show-word-limit />
            </view>
          </view>

          <!-- 处理备注 -->
          <view class="form-row">
            <view class="form-label"><span style="color: red;">*</span>处理备注</view>
            <view class="form-content">
              <wd-textarea v-model="formData.remark" placeholder="请输入处理备注" :rows="3" :maxlength="500" show-word-limit />
            </view>
          </view>
        </view>
      </view>

      <!-- 底部按钮 -->
      <BottomBtn submit-text="提交" save-draft-text="返回首页" @submit="handleSubmit" @save-draft="handleSaveDraft" />
    </template>
    <template v-else>
      <view class="flex items-center justify-center flex-col mt-10">
        <wd-icon name="check-circle-filled" size="100px" color="#4A90E2"></wd-icon>
        <view class="text-xl font-bold">录入成功</view>
      </view>
      <BottomBtn submit-text="新增补录" save-draft-text="返回首页" @submit="newAddSubmit" @save-draft="handleSaveDraft" />
    </template>
  </view>
</template>


<script lang="ts" setup>
import { userUsernameUsingGet, addjdwlOrderProcess } from '@/service/jdwl'
import TopHeader from '@/components/TopHeader.vue'
import BottomBtn from '@/components/bottomBtn.vue'
import { useUserStore } from '@/store/user'
const userStore = useUserStore()
const title = ref(userStore.userInfo.user.channelName)
const subtitle = ref(userStore.userInfo.user.nickName)
const needTypeOptions = ref([])
const showForm = ref(true)
const formData = ref({
  customerName: '',
  customerPhone: '',
  needType: '',
  sucessAct: '',
  remark: ''
})

onLoad(() => {
  getNeedTypeOptions()
})


const getNeedTypeOptions = async () => {
  const res = await userUsernameUsingGet({ params: { dictType: 'jdwl_need_type' } })
  needTypeOptions.value = res.data
}

// 新增补录
function newAddSubmit() {
  formData.value = {
    customerName: '',
    customerPhone: '',
    needType: '',
    sucessAct: '',
    remark: ''
  }
  showForm.value = true
}

function handleSubmit() {
  if (!formData.value.customerName.trim()) {
    uni.showToast({
      title: '请输入客户姓名',
      icon: 'none'
    })
    return
  }

  if (!formData.value.customerPhone.trim()) {
    uni.showToast({
      title: '请输入客户电话',
      icon: 'none'
    })
    return
  }
  const phoneRegex = /^1[3-9]\d{9}$/
  if (!phoneRegex.test(formData.value.customerPhone)) {
    uni.showToast({
      title: '请输入正确的手机号码',
      icon: 'none'
    })
    return
  }

  if (!formData.value.needType) {
    uni.showToast({
      title: '请选择需求类型',
      icon: 'none'
    })
    return
  }

  if (!formData.value.sucessAct.trim()) {
    uni.showToast({
      title: '请输入成功举措',
      icon: 'none'
    })
    return
  }

  if (!formData.value.remark.trim()) {
    uni.showToast({
      title: '请输入处理备注',
      icon: 'none'
    })
    return
  }
  formData.value.holdResult = '成功'
  formData.value.channelName = userStore.userInfo.user.channelName
  formData.value.channelId = userStore.userInfo.user.channelId
  addjdwlOrderProcess({ body: formData.value }).then(res => {
    if (res.code === 200) {
      uni.showToast({
        title: '提交成功',
        icon: 'success'
      })
      showForm.value = false
    }
  })
}


function handleSaveDraft() {
  console.log('保存草稿:', formData.value)
  uni.switchTab({
    url: '/pages/index/index'
  })
}
</script>

<style lang="scss" scoped>
.success-page {
  .content-container {
    padding: 20rpx;
    padding-bottom: 160rpx; // 为底部按钮留出空间
  }

  .info-section {
    background: white;
    border-radius: 16rpx;
    // padding: 32rpx 24rpx;
    // box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
  }

  .info-title {
    font-size: 36rpx;
    font-weight: 600;
    color: #333;
    text-align: center;
  }

  .form-detail-card {
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
      border-color: #4A90E2;
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

// 覆盖input样式
:deep(.wd-input) {
  .wd-input__inner {
    border-radius: 12rpx;
    padding: 0 20rpx;
    font-size: 30rpx;

    &:focus {
      border-color: #4A90E2;
      background-color: #fff;
    }
  }

  .wd-input__placeholder {
    color: #999;
    font-size: 30rpx;
  }
}
</style>
