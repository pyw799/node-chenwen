<!--
 * @Author: pangyawei
 * @Date: 2025-09-24 16:30:00
 * @LastEditors: pangyawei
 * @LastEditTime: 2025-09-28 15:20:39
 * @Description: 通用顶部组件
 * @filePath: Do not edit
-->
<script lang="ts" setup>
interface Props {
  title?: string
  subtitle?: string
  showBack?: boolean
  backgroundColor?: string
  textColor?: string
  icon?: string
  iconColor?: string
  phone?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  subtitle: '',
  showBack: true,
  backgroundColor: '#fff',
  textColor: '#333',
  icon: '',
  iconColor: '#ff6b6b',
  phone: ''
})

const emit = defineEmits(['back'])

function handleBack() {
  if (props.showBack) {
    emit('back')
    uni.navigateBack()
  }
}

// onLoad(() => {
//   console.log('onLoad')
//   userStore.getUserInfo()
// })
</script>

<template>
  <view class="top-header flex items-center justify-between px-4 py-3"
    :style="{ backgroundColor: props.backgroundColor, color: props.textColor }">
    <view class="flex-1 flex items-center">
      <view class="flex items-center gap-2">
        <img src="@/static/images/body.png" alt="icon"
          class="icon-wrapper flex items-center w-12 h-12 rounded-2 bg-red-50">
        <view class="text-center">
          <view class="title text-lg font-medium leading-tight" :style="{ color: textColor }">
            {{ title }}
          </view>
          <view v-if="subtitle" class="subtitle text-sm opacity-70 mt-1 text-left" :style="{ color: textColor }">
            {{ subtitle }}
          </view>
          <view v-if="phone" class="title text-lg font-medium leading-tight" :style="{ color: textColor }">
            {{ phone }}
          </view>
        </view>
      </view>
    </view>
    <view class="w-10"></view>
  </view>
</template>

<style lang="scss" scoped>
.top-header {
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
  min-height: 120rpx;

  .back-btn {
    padding: 0 !important;
    min-width: auto !important;
  }

  .icon-wrapper {
    width: 80rpx;
    height: 80rpx;
    border-radius: 12rpx;
  }

  .title {
    font-size: 36rpx;
    font-weight: 500;
    line-height: 1.2;
  }

  .subtitle {
    font-size: 28rpx;
    line-height: 1.2;
  }
}
</style>
