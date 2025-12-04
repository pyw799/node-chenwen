<!--
 * @Author: pangyawei
 * @Date: 2025-09-25 17:08:19
 * @LastEditors: pangyawei
 * @LastEditTime: 2025-09-29 16:13:59
 * @Description: 文件内容描述
 * @filePath: Do not edit
-->
<route lang="jsonc" type="page">{
  "layout": "default",
  "style": {
    "navigationBarTitleText": "客户需求填写",
    "navigationStyle": "custom"
  }
}</route>

<script lang="ts" setup>
import { addjdwlOrderProcessForXQ, getShopByLocation, userUsernameUsingGet } from '@/service/jdwl'

const formData = ref({
  customerName: '',
  customerPhone: sessionStorage.getItem('phone'),
  needType: '',
  address: '',
})
const phone = ref(sessionStorage.getItem('phone'))
const formErrors = ref({
  customerName: '',
  customerPhone: '',
  needType: '',
  address: '',
})
const submitSuccess = ref(true)
const currentLocation = ref({
  latitude: 34.79011,
  longitude: 113.543474,
})
const targetLocation = ref({
  latitude: 0, // 目标纬度，后续从外部传入
  longitude: 0, // 目标经度，后续从外部传入
  range: 500, // 允许的范围，单位：米
})
const isLocationValid = ref(false)
const locationMessage = ref('')
const isLocating = ref(false)
const showLocationDetails = ref(false)
const demandTypeOptions = ref([])

onLoad(() => {
  getDemandTypeOptions()
})

function reBackHome() {
  submitSuccess.value = true
  formData.value = {
    customerName: '',
    customerPhone: sessionStorage.getItem('phone'),
    needType: '',
    address: '',
  }
}

async function getDemandTypeOptions() {
  const res = await userUsernameUsingGet({ params: { dictType: 'jdwl_need_type' } })
  if (res.code == 200) {
    demandTypeOptions.value = res.data
  }
  console.log('字典', res, demandTypeOptions.value)
}

// 选择需求类型
function selectDemandType(type) {
  formData.value.needType = type
  formErrors.value.needType = ''
}

// 计算表单完成进度
const formProgress = computed(() => {
  let progress = 0
  const totalFields = 3
  if (formData.value.customerName && !formErrors.value.customerName)
    progress += 33
  if (formData.value.needType && !formErrors.value.needType)
    progress += 33
  if (formData.value.address && !formErrors.value.address)
    progress += 34
  return Math.min(100, progress)
})

// 获取当前位置
function getCurrentLocation() {
  isLocating.value = true
  locationMessage.value = '正在获取位置...'
  // matchShopByLocation(34.79011, 113.543474)
  uni.getLocation({
    type: 'gcj02', // 高德地图坐标系
    geocode: true, // 返回地理编码信息
    success: (res) => {
      currentLocation.value = {
        latitude: res.latitude,
        longitude: res.longitude,
      }
      // 定位成功后，调用后台接口匹配营业厅（核心修改）
      matchShopByLocation(res.latitude, res.longitude)
      isLocating.value = false
    },
    fail: (err) => {
      isLocating.value = false
      locationMessage.value = '获取位置失败，请检查定位权限'
      uni.showModal({
        title: '定位失败',
        content: '无法获取您的位置信息，请确保已开启定位权限并重试。',
        showCancel: false,
        confirmText: '重试',
        success: () => {
          getCurrentLocation()
        },
      })
    },
  })
}
// 2. 调用后台接口，根据用户位置匹配营业厅
async function matchShopByLocation(lat, lon) {
  try {
    const response = await getShopByLocation({
      latitude: lat,
      longitude: lon,
    })
    // 接口返回格式示例：{ code: 200, data: { id: 'B1001', name: '开封尉氏城东营业厅', range: 300 } }
    if (response.code === 200 && response.data) {
      // 匹配到营业厅：记录营业厅信息，验证位置（实际已在后台验证）
      formData.value.channelId = response.data.channelId
      formData.value.channelName = response.data.channelName
      // 设置目标位置（用于前端地图显示范围）
      setTargetLocation(
        response.data.latitude,
        response.data.longitude,
        response.data.range,
      )
      isLocationValid.value = true
      locationMessage.value = `已匹配营业厅：${response.data.channelName}（范围内）`
    }
    else {
      // 未匹配到营业厅
      isLocationValid.value = false
      locationMessage.value = '未在任何营业厅范围内，无法提交'
    }
  }
  catch (error) {
    isLocationValid.value = false
    locationMessage.value = '匹配营业厅失败，请重试'
  }
}
// 计算两点间距离（米）
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371000 // 地球半径，单位：米
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
    + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180)
    * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// 验证位置是否在允许范围内
function validateLocation() {
  if (targetLocation.value.latitude === 0 || targetLocation.value.longitude === 0) {
    locationMessage.value = '请设置目标位置'
    isLocationValid.value = false
    return
  }

  const distance = calculateDistance(
    currentLocation.value.latitude,
    currentLocation.value.longitude,
    targetLocation.value.latitude,
    targetLocation.value.longitude,
  )

  if (distance <= targetLocation.value.range) {
    isLocationValid.value = true
    locationMessage.value = `位置验证通过，距离目标点 ${Math.round(distance)} 米`
  }
  else {
    isLocationValid.value = false
    locationMessage.value = `位置超出范围，距离目标点 ${Math.round(distance)} 米，需要在 ${targetLocation.value.range} 米范围内`
  }
}

// 实时表单验证
function validateField(field) {
  switch (field) {
    case 'customerName':
      if (!formData.value.customerName.trim()) {
        formErrors.value.customerName = '请填写姓名'
      }
      else if (formData.value.customerName.trim().length < 2) {
        formErrors.value.customerName = '姓名至少需要2个字符'
      }
      else {
        formErrors.value.customerName = ''
      }
      break
    case 'needType':
      if (!formData.value.needType) {
        formErrors.value.needType = '请选择需求类型'
      }
      else {
        formErrors.value.needType = ''
      }
      break
    case 'address':
      if (!formData.value.address.trim()) {
        formErrors.value.address = '请填写拆机地址'
      }
      else if (formData.value.address.trim().length < 5) {
        formErrors.value.address = '地址至少需要5个字符'
      }
      else {
        formErrors.value.address = ''
      }
      break
  }
}

// 表单验证规则
function validateForm() {
  validateField('customerName')
  validateField('needType')
  validateField('address')

  return Object.values(formErrors.value).every(error => error === '')
}

// 提交表单
async function handleSubmit() {
  // 验证表单
  const isValid = validateForm()
  if (!isValid) {
    console.error('表单验证失败:', formErrors.value, formData.value)
    uni.showToast({
      title: '请检查表单信息',
      icon: 'error',
    })
    return
  }

  // 验证位置
  if (!isLocationValid.value) {
    uni.showModal({
      title: '位置验证失败',
      content: '请确保您在指定的工作范围内，然后重新定位后提交。',
      showCancel: true,
      cancelText: '取消',
      confirmText: '重新定位',
      success: (res) => {
        if (res.confirm) {
          getCurrentLocation()
        }
      },
    })
    return
  }

  // 显示加载状态
  uni.showLoading({
    title: '提交中...',
  })

  try {
    // 提交逻辑
    const submitData = {
      ...formData.value,
      holdResult: '待处理',
      location: currentLocation.value,
      // channelId: 'B1001', // 营业厅编号
      // channelName: '开封尉氏城东营业厅', // 营业厅名称
      submitTime: new Date().toISOString(),
    }

    await addjdwlOrderProcessForXQ({ body: submitData })

    console.log('提交数据:', submitData)

    uni.hideLoading()
    uni.showToast({
      title: '提交成功',
      icon: 'success',
      duration: 2000,
    })
    submitSuccess.value = false
  }
  catch (error) {
    uni.hideLoading()
    uni.showModal({
      title: '提交失败',
      content: '网络错误，请稍后重试',
      showCancel: false,
    })
  }
}

// 设置目标位置（供外部调用）
function setTargetLocation(latitude: number, longitude: number, range: number = 500) {
  targetLocation.value = { latitude, longitude, range }
  if (currentLocation.value.latitude !== 0) {
    validateLocation()
  }
}

onMounted(() => {
  console.log('开始')
  getCurrentLocation() // 仅启动定位，不再硬编码目标位置
})

// // 暴露方法给外部使用
// defineExpose({
//   setTargetLocation,
// })
</script>

<template>
  <view class="client-write-page min-h-screen bg-[#f5f5f5]">
    <TopHeader :phone="phone" />
    <template v-if="submitSuccess">
      <!-- 主要内容区域 -->
      <view class="content-container">
        <!-- 表单卡片 -->
        <view class="process-detail-card">
          <!-- 姓名 -->
          <view class="form-row">
            <view class="form-label">
              <span style="color: red;">*</span>姓名：
            </view>
            <view class="form-content">
              <wd-input v-model="formData.customerName" placeholder="请输入姓名" clearable
                @blur="validateField('customerName')" />
              <text v-if="formErrors.customerName" class="error-text">{{ formErrors.customerName }}</text>
            </view>
          </view>

          <!-- 需求类型 -->
          <view class="form-row">
            <view class="form-label">
              <span style="color: red;">*</span>需求类型：
            </view>
            <view class="form-content">
              <wd-picker v-model="formData.needType" :columns="demandTypeOptions" label-key="dictLabel"
                value-key="dictValue" placeholder="请选择需求类型" @change="validateField('needType')" />
              <text v-if="formErrors.needType" class="error-text">{{ formErrors.needType }}</text>
            </view>
          </view>

          <!-- 拆机地址 -->
          <view class="form-row">
            <view class="form-label">
              <span style="color: red;">*</span>拆机地址：
            </view>
            <view class="form-content">
              <wd-textarea v-model="formData.address" placeholder="请输入详细的拆机地址" :rows="3" :maxlength="200"
                show-word-limit @blur="validateField('address')" />
              <text v-if="formErrors.address" class="error-text">{{ formErrors.address }}</text>
            </view>
          </view>
        </view>

        <!-- 位置验证区域 -->
        <view class="info-section">
          <view class="info-title">
            位置验证
          </view>

          <!-- 地图 -->
          <view class="map-container">
            <map :latitude="currentLocation.latitude" :longitude="currentLocation.longitude" :circles="[{
              latitude: targetLocation.latitude,
              longitude: targetLocation.longitude,
              radius: targetLocation.range,
              color: isLocationValid ? '#4CAF5020' : '#ff475720',
              strokeWidth: 2,
              fillColor: isLocationValid ? '#4CAF5020' : '#ff475720',
              strokeColor: isLocationValid ? '#4CAF50' : '#ff4757',
            }]" scale="15" enableZoom enableSatellite enablePoi enableBuilding class="map" showLocation
              @tap="getCurrentLocation" />
          </view>

          <!-- 位置信息 -->
          <view class="location-info">
            <view class="info-row">
              <text class="info-label">位置状态：</text>
              <text class="info-value" :class="{ 'text-green-500': isLocationValid, 'text-red-500': !isLocationValid }">
                {{ isLocating ? '定位中...' : (isLocationValid ? '验证通过' : '验证失败') }}
              </text>
            </view>
            <view class="info-row">
              <text class="info-label">详细信息：</text>
              <text class="info-value">{{ locationMessage || '正在获取位置...' }}</text>
            </view>
            <view v-if="showLocationDetails && currentLocation.latitude" class="info-row">
              <text class="info-label">坐标信息：</text>
              <text class="info-value">
                {{ currentLocation.latitude.toFixed(6) }}, {{
                  currentLocation.longitude.toFixed(6)
                }}
              </text>
            </view>
          </view>

          <!-- 操作按钮 -->
          <view class="location-actions">
            <wd-button size="small" type="primary" :loading="isLocating" @click="getCurrentLocation">
              {{ isLocating ? '定位中...' : '重新定位' }}
            </wd-button>
            <wd-button size="small" type="text" @click="showLocationDetails = !showLocationDetails">
              {{ showLocationDetails ? '收起详情' : '查看详情' }}
            </wd-button>
          </view>
        </view>
      </view>

      <!-- 底部按钮 -->
      <view class="bottom-button">
        <wd-button type="success" block size="large" :disabled="!isLocationValid || formProgress < 100"
          @click="handleSubmit">
          {{ formProgress < 100 ? `完善表单信息 (${formProgress}%)` : (isLocationValid ? '提交' : '等待位置验证') }} </wd-button>
      </view>
    </template>
    <template v-else>
      <view class="submit-success flex items-center justify-center">
        <wd-icon name="check-circle-filled" size="80px" color="#118EE9" />
        <view class="submit-success-content">
          你的需求已记录，等待客服处理
        </view>
        <wd-button block size="large" custom-class="mt-20" @click="reBackHome">
          返回首页
        </wd-button>
      </view>
    </template>
  </view>
</template>

<style lang="scss" scoped>
// 使用项目标准样式
.client-write-page {
  padding-bottom: 120rpx; // 为底部按钮留出空间
}

.content-container {
  padding: 20rpx;
}

// 表单卡片样式（复用项目中的样式）
.process-detail-card {
  background: white;
  border-radius: 16rpx;
  padding: 32rpx 24rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
  margin-bottom: 20rpx;
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

.error-text {
  color: #ff4757;
  font-size: 24rpx;
  margin-top: 8rpx;
  line-height: 1.4;
  display: block;
}

// 信息区域样式（复用项目中的样式）
.info-section {
  background: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.info-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 24rpx;
  border-bottom: 2rpx solid #f0f0f0;
  padding-bottom: 16rpx;
}

.location-info {
  margin-top: 20rpx;
}

.info-row {
  display: flex;
  margin-bottom: 16rpx;
  align-items: flex-start;

  &:last-child {
    margin-bottom: 0;
  }
}

.info-label {
  font-size: 28rpx;
  color: #666;
  min-width: 160rpx;
  flex-shrink: 0;
}

.info-value {
  font-size: 28rpx;
  color: #333;
  flex: 1;
  word-break: break-all;
}

// 地图样式
.map-container {
  margin: 20rpx 0;
  border-radius: 12rpx;
  overflow: hidden;
  border: 1px solid #e0e0e0;
}

.map {
  width: 100%;
  height: 400rpx;
}

// 操作按钮
.location-actions {
  display: flex;
  justify-content: center;
  gap: 20rpx;
  margin-top: 20rpx;
}

// 底部按钮
.bottom-button {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 20rpx 20rpx 40rpx;
  border-top: 1px solid #f0f0f0;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
}

// UnoCSS类的补充样式
.text-green-500 {
  color: #10b981;
}

.text-red-500 {
  color: #ef4444;
}

// 覆盖input样式
:deep(.wd-input) {
  .wd-input__inner {
    //border: 1rpx solid #e5e5e5;
    border-radius: 12rpx;
    padding: 0 20rpx;
    font-size: 30rpx;
    // background-color: #fafafa;

    &:focus {
      border-color: #4a90e2;
      background-color: #fff;
    }
  }

  .wd-input__placeholder {
    color: #999;
    font-size: 30rpx;
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
    // background-color: #fafafa;

    &:focus {
      border-color: #4a90e2;
      background-color: #fff;
    }
  }

  .wd-textarea__count {
    font-size: 24rpx;
    color: #999;
    margin-top: 12rpx;
  }
}

:deep(.wd-popup) {
  z-index: 161 !important;
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

.submit-success {
  flex-direction: column;
  margin-top: 200rpx;

  .submit-success-content {
    margin-top: 20rpx;
    font-size: 30rpx;
    color: #333;
  }
}
</style>