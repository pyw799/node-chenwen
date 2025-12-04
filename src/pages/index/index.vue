<!--
 * @Author: pangyawei
 * @Date: 2025-09-24 15:51:52
 * @LastEditors: pangyawei
 * @LastEditTime: 2025-09-29 14:56:23
 * @Description: 营业厅牌档管理系统首页
 * @filePath: Do not edit
-->
<route lang="jsonc" type="home">{
  "layout": "default",
  "style": {
    "navigationStyle": "custom",
    "navigationBarTitleText": "首页",
    "navigationBarTextStyle": "white"
  }
}</route>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { getTodoList, orderProcessList } from '@/service/jdwl'
import { useUserStore } from '@/store'

const userStore = useUserStore()
// 使用storeToRefs解构userInfo
const { userInfo } = storeToRefs(userStore)
const isYingYeTing = computed(() => {
  // 从userInfo中获取角色列表，判断是否包含营业厅人员标识
  return userInfo.value?.roles?.includes('jdwl_yytry') ?? false
})
const todoTotal = ref(0)
const orderProcessTotal = ref(0)

function navigateToPage(url: string) {
  uni.navigateTo({
    url,
    fail: (err) => {
      console.error('页面跳转失败:', err)
      uni.showToast({
        title: '页面暂未开放',
        icon: 'none',
      })
    },
  })
}

async function getTodoListFn() {
  const res = await getTodoList({ params: { pageNum: 1, pageSize: 1 } })
  todoTotal.value = res.total
}

async function getOrderProcessListFn() {
  const res = await orderProcessList({ params: { pageNum: 1, pageSize: 1, holdResult: '待处理' } })
  orderProcessTotal.value = res.total
}

getTodoListFn()
getOrderProcessListFn()
</script>

<template>
  <view class="home-container">
    <!-- 顶部背景区域 -->
    <view class="header-section">
      <image src="/static/images/index.jpg" mode="Widthfix" class="header-bg" />
    </view>

    <!-- 功能菜单区域 -->
    <view class="menu-section">
      <view class="menu-list">
        <!-- 按需成功需求信息补录 -->
        <view v-if="isYingYeTing" class="menu-item" @click="navigateToPage('/pages-index/success/success')">
          <view class="menu-icon-wrapper">
            <wd-icon name="folder" size="24" color="#4A90E2" />
          </view>
          <view class="menu-content">
            <view class="menu-title">
              挽留成功需求信息补录
            </view>
          </view>
          <view class="menu-arrow">
            <wd-icon name="arrow-right" size="16" color="#C7C7CC" />
          </view>
        </view>

        <!-- 降档需求处理 -->
        <view v-if="isYingYeTing" class="menu-item" @click="navigateToPage('/pages-index/faile/faile')">
          <view class="menu-icon-wrapper">
            <wd-icon name="folder" size="24" color="#4A90E2" />
            <view class="badge-dot">
              {{ orderProcessTotal }}
            </view>
          </view>
          <view class="menu-content">
            <view class="menu-title">
              降档需求处理
            </view>
          </view>
          <view class="menu-arrow">
            <wd-icon name="arrow-right" size="16" color="#C7C7CC" />
          </view>
        </view>

        <!-- 待办任务处理 -->
        <view class="menu-item" @click="navigateToPage('/pages-index/todo/todo')">
          <view class="menu-icon-wrapper">
            <wd-icon name="folder" size="24" color="#4A90E2" />
            <view class="badge-dot">
              {{ todoTotal }}
            </view>
          </view>
          <view class="menu-content">
            <view class="menu-title">
              待办任务处理
            </view>
          </view>
          <view class="menu-arrow">
            <wd-icon name="arrow-right" size="16" color="#C7C7CC" />
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.home-container {
  min-height: 100vh;
  background-color: #f5f6fa;
}

/* 顶部背景区域 */
.header-section {
  position: relative;
  height: 200rpx;
  overflow: hidden;
}

.header-bg {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.header-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(74, 144, 226, 0.9) 0%, rgba(56, 103, 214, 0.9) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-content {
  text-align: center;
  color: white;
  padding: 0 40rpx;
}

.system-title {
  font-size: 48rpx;
  font-weight: bold;
  margin-bottom: 16rpx;
  letter-spacing: 2rpx;
}

.system-subtitle {
  font-size: 28rpx;
  opacity: 0.9;
  letter-spacing: 1rpx;
}

/* 功能菜单区域 */
.menu-section {
  padding: 20rpx;
  position: relative;
  z-index: 2;
}

.menu-list {
  background: white;
  border-radius: 24rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 40rpx 32rpx;
  border-bottom: 1rpx solid #f0f0f0;
  transition: background-color 0.2s ease;

  &:last-child {
    border-bottom: none;
  }

  &:active {
    background-color: #f8f9fa;
  }
}

.menu-icon-wrapper {
  position: relative;
  width: 80rpx;
  height: 80rpx;
  background: #f0f4ff;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 32rpx;
}

.badge-dot {
  position: absolute;
  top: -8rpx;
  right: -8rpx;
  min-width: 32rpx;
  height: 32rpx;
  background: #ff4757;
  color: white;
  font-size: 20rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 8rpx;
  font-weight: bold;
  border: 2rpx solid white;
}

.menu-content {
  flex: 1;
}

.menu-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 8rpx;
  line-height: 1.4;
}

.menu-desc {
  font-size: 24rpx;
  color: #999;
  line-height: 1.3;
}

.menu-arrow {
  margin-left: 16rpx;
}

/* 响应式适配 */
@media screen and (max-width: 750rpx) {
  .system-title {
    font-size: 42rpx;
  }

  .system-subtitle {
    font-size: 26rpx;
  }

  .menu-item {
    padding: 32rpx 24rpx;
  }

  .menu-title {
    font-size: 30rpx;
  }
}
</style>
