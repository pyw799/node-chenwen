<route lang="jsonc" type="page">{
  "style": {
    // 'custom' 表示开启自定义导航栏，默认 'default'
    "navigationStyle": "custom",
    "navigationBarTitleText": "我的"
  }
}</route>

<script lang="ts" setup>
import type { IUploadSuccessInfo } from '@/api/types/login'
import { storeToRefs } from 'pinia'
import { computed } from 'vue' // 新增导入
import { LOGIN_PAGE } from '@/router/config'
import { systemUserProfileAvatarUsingPost } from '@/service/user'
import { useUserStore } from '@/store'
import { useTokenStore } from '@/store/token'
import { useUpload } from '@/utils/uploadFile'

const baseProxyPerf = import.meta.env.VITE_UPLOAD_BASEURL
const userStore = useUserStore()
const tokenStore = useTokenStore()
// 使用storeToRefs解构userInfo
const { userInfo } = storeToRefs(userStore)
// 计算属性：判断用户是否包含营业厅人员角色（jdwl_yytry）
const isYingYeTing = computed(() => {
  // 从userInfo中获取角色列表，判断是否包含营业厅人员标识
  return userInfo.value?.roles?.includes('jdwl_yytry') ?? false
})
// #ifndef MP-WEIXIN
// 上传头像
const { run: uploadAvatar } = useUpload<IUploadSuccessInfo>(
  '/file/uploadFile',
  {},
  {
    onSuccess: (res) => {
      console.log('h5头像上传成功', res)
      useUserStore().setUserAvatar(res.fileUrl)
      uni.showToast({
        title: '头像上传成功',
        icon: 'success',
      })
    },
  },
)
// #endif

// 微信小程序下登录
async function handleLogin() {
  // #ifdef MP-WEIXIN

  // 微信登录
  await tokenStore.wxLogin()
  // #endif
  // #ifndef MP-WEIXIN
  uni.navigateTo({ url: LOGIN_PAGE })
  // #endif
}

// #ifdef MP-WEIXIN

// 微信小程序下选择头像事件
function onChooseAvatar(e: any) {
  console.log('选择头像', e.detail)
  const { avatarUrl } = e.detail
  const { run } = useUpload<IUploadSuccessInfo>(
    systemUserProfileAvatarUsingPost(),
    {},
    {
      onSuccess: (res) => {
        console.log('wx头像上传成功', res)
        useUserStore().setUserAvatar(baseProxyPerf + res.url)
      },
    },
    avatarUrl,
  )
  run()
}
// #endif
// #ifdef MP-WEIXIN
// 微信小程序下设置用户名
function getUserInfo(e: any) {
  console.log(e.detail)
}
// #endif

// 退出登录
function handleLogout() {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        // 清空用户信息
        useTokenStore().logout()
        localStorage.removeItem('user')
        localStorage.removeItem('token')
        // 执行退出登录逻辑
        uni.showToast({
          title: '退出登录成功',
          icon: 'success',
        })
        // #ifdef MP-WEIXIN
        // 微信小程序，去首页
        // uni.reLaunch({ url: '/pages/index/index' })
        // #endif
        // #ifndef MP-WEIXIN
        // 非微信小程序，去登录页
        uni.navigateTo({ url: LOGIN_PAGE })
        // #endif
      }
    },
  })
}
</script>

<template>
  <view class="profile-container">
    <!-- 用户信息区域 -->
    <view class="user-info-section">
      <!-- #ifdef MP-WEIXIN -->

      <button class="avatar-button" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
        <image :src="useUserStore().userInfo.avatar" mode="scaleToFill" class="h-full w-full" />
      </button>
      <!-- #endif -->
      <!-- #ifndef MP-WEIXIN -->
      <view class="avatar-wrapper" @click="uploadAvatar">
        <image :src="useUserStore().userInfo.avatar" mode="scaleToFill" class="h-full w-full" />
      </view>
      <!-- #endif -->
      <view class="user-details">
        <!-- #ifdef MP-WEIXIN -->
        <input v-model="userInfo.username" type="nickname" class="weui-input" placeholder="请输入昵称">
        <!-- #endif -->
        <!-- #ifndef MP-WEIXIN -->
        <view class="username">
          {{ userInfo.user.nickName }}
        </view>
        <view class="username" style="font-size: 26rpx;">
          手机号：{{ userInfo.user.phonenumber }}
        </view>
        <view v-if="isYingYeTing" class="username" style="font-size: 26rpx;">
          营业厅：{{ userInfo.user.channelName }}
        </view>
        <!-- #endif -->
        <!-- <view class="user-id">
          角色:
          <view v-for="item in userInfo.user.roles" :key="item.id">
            <wd-tag custom-class="space" type="primary">
              {{ item.roleName }}
            </wd-tag>
          </view>
        </view> -->
      </view>
    </view>
    <!-- <view class="mt-3 break-all px-3">
      {{ JSON.stringify(userInfo, null, 2) }}
    </view> -->

    <view class="mt-20 px-3">
      <view class="m-auto w-160px text-center">
        <button v-if="tokenStore.tokenInfo.token" type="warn" class="w-full" @click="handleLogout">
          退出登录
        </button>
        <button v-else type="primary" class="w-full" @click="handleLogin">
          登录
        </button>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
/* 基础样式 */
.profile-container {
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif;
  // background-color: #f7f8fa;
}

/* 用户信息区域 */
.user-info-section {
  display: flex;
  align-items: center;
  padding: 40rpx;
  margin: 30rpx 30rpx 20rpx;
  background-color: #fff;
  border-radius: 24rpx;
  box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.avatar-wrapper {
  width: 160rpx;
  height: 160rpx;
  margin-right: 40rpx;
  overflow: hidden;
  border: 4rpx solid #f5f5f5;
  border-radius: 50%;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.avatar-button {
  height: 160rpx;
  width: 160rpx;
  padding: 0;
  margin-right: 40rpx;
  overflow: hidden;
  border: 4rpx solid #f5f5f5;
  border-radius: 50%;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.user-details {
  flex: 1;
}

.username {
  margin-bottom: 12rpx;
  font-size: 38rpx;
  font-weight: 600;
  color: #333;
  letter-spacing: 0.5rpx;
}

.user-id {
  display: flex;
  align-items: center;
  gap: 10rpx;
  flex-wrap: wrap;
  font-size: 28rpx;
  color: #666;
}

.user-created {
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #999;
}
</style>
