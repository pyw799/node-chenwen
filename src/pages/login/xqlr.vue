<route lang="jsonc" type="page">{
  "style": {
    "navigationBarTitleText": "开封业务综合平台",
    "navigationStyle": "custom"
  }
}</route>
<template>
  <view class="login-container">
    <!-- 状态栏占位 -->
    <view class="status-bar" />

    <!-- 头部区域 -->
    <view class="header">
      <div class="logo-container">
        <image src="@/static/images/china-mobile.png" mode="aspectFit" class="logo-icon"
          style="width: 200rpx; height: 100rpx" />
        <image src="@/static/images/mobile5G.png" mode="aspectFit" class="logo-icon"
          style="width: 150rpx; height: 100rpx" />
      </div>

      <view class="logo-section">
        <image src="/static/images/mobile.png" mode="aspectFit" class="logo-icon" />
        <text class="logo-title">开封移动客户需求录入</text>
      </view>
    </view>

    <!-- 登录表单 -->
    <view class="login-form">
      <view class="form-container">
        <!-- 手机号输入框 -->
        <view class="input-item">
          <view class="input-label">手机号</view>
          <input v-model="formData.phone" type="number" placeholder="请输入11位手机号" maxlength="11" class="native-input" />
        </view>

        <!-- 验证码输入框 -->
        <view class="input-item">
          <view class="input-label">验证码</view>
          <view class="sms-input-group">
            <input v-model="formData.smsCode" type="number" placeholder="请输入6位验证码" maxlength="6"
              class="native-input sms-input" />
            <button :disabled="!canSendSms" class="native-button sms-button flex items-center justify-center"
              :class="{ 'button-loading': smsLoading, 'button-disabled': !canSendSms }" @click="sendSmsCode">
              {{ smsLoading ? "发送中" : canSendSms ? "获取验证码" : `${countdown}s` }}
            </button>
          </view>
        </view>

        <!-- 登录按钮 -->
        <view class="login-button-wrapper">
          <button class="native-button login-button" :class="{ 'button-loading': loading }" :disabled="loading"
            @click="handleLogin">
            {{ loading ? "登录中..." : "立即登录" }}
          </button>
        </view>
      </view>
    </view>

    <!-- 底部信息 -->
    <view class="footer">
      <text class="footer-text">© 2025 开封业务综合平台</text>
    </view>
  </view>
</template>
<script lang="ts" setup>
import { getSmsCodeUsingPost, getSmsCodeUsingCodePost } from "@/service/login";
import { useTokenStore } from "@/store/token";
import { useUserStore } from "@/store/user";

const userStore = useUserStore();
const tokenStore = useTokenStore();

const redirectUrl = ref("");
const loading = ref(false);

// 表单数据
const formData = reactive({
  phone: "",
  smsCode: "",
});

// 短信验证码相关
const smsLoading = ref(false);
const countdown = ref(0);
const canSendSms = ref(true);
const type = ref("");

// 表单验证规则
const rules = {
  phone: [
    { required: true, message: "请输入手机号" },
    { pattern: /^1[3-9]\d{9}$/, message: "请输入正确的手机号" },
  ],
  smsCode: [
    { required: true, message: "请输入验证码" },
    { len: 6, message: "验证码为6位数字" },
  ],
};

onLoad((options) => {
  console.log(options, "options");
  type.value = options.type;
});

// 发送短信验证码
async function sendSmsCode() {
  if (!formData.phone.trim()) {
    uni.showToast({
      title: "请输入手机号",
      icon: "none",
    });
    return;
  }

  if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
    uni.showToast({
      title: "请输入正确的手机号",
      icon: "none",
    });
    return;
  }

  smsLoading.value = true;

  try {
    let getApi = type.value === "jdwl" ? getSmsCodeUsingPost : getSmsCodeUsingCodePost;
    const res = await getApi({
      body: {
        phoneNum: formData.phone,
      },
    });

    if (res.code !== 200) {
      uni.showToast({
        title: res.msg || "发送失败，请重试",
        icon: "none",
      });
      return;
    }

    uni.showToast({
      title: "验证码已发送",
      icon: "success",
    });

    // 开始倒计时
    countdown.value = 60;
    canSendSms.value = false;

    const timer = setInterval(() => {
      countdown.value--;
      if (countdown.value <= 0) {
        clearInterval(timer);
        canSendSms.value = true;
      }
    }, 1000);
  } catch (error) {
    console.error("发送验证码失败:", error);
    uni.showToast({
      title: "发送失败，请重试",
      icon: "none",
    });
  } finally {
    smsLoading.value = false;
  }
}

async function handleLogin() {
  if (!formData.phone.trim()) {
    uni.showToast({
      title: "请输入手机号",
      icon: "none",
    });
    return;
  }

  if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
    uni.showToast({
      title: "请输入正确的手机号",
      icon: "none",
    });
    return;
  }

  if (!formData.smsCode.trim()) {
    uni.showToast({
      title: "请输入验证码",
      icon: "none",
    });
    return;
  }

  if (formData.smsCode.length !== 6) {
    uni.showToast({
      title: "验证码为6位数字",
      icon: "none",
    });
    return;
  }

  try {
    loading.value = true;
    sessionStorage.setItem('phone', formData.phone);
    // 使用TokenStore的smsLogin方法，遵循若依风格
    await tokenStore.smsLogin(formData.phone, formData.smsCode, "QR");
  } catch (error) {
    console.error("登录失败:", error);
    // 错误提示已在tokenStore.smsLogin中处理，这里不需要重复提示
  } finally {
    loading.value = false;
  }
}
</script>

<style lang="scss" scoped>
.login-container {
  min-height: 100vh;
  background-image: url("@/static/images/bg.jpg");
  background-size: 100% 100%;
  background-repeat: no-repeat;
  display: flex;
  flex-direction: column;
}

.status-bar {
  height: var(--status-bar-height, 44px);
}

.header {
  text-align: center;
  padding: 0 40rpx 60rpx;

  .logo-container {
    text-align: left;
  }

  .logo-section {
    margin-top: 50px;

    .logo-icon {
      width: 100rpx;
      height: 100rpx;
      margin-bottom: 32rpx;
    }

    .logo-title {
      display: block;
      font-size: 44rpx;
      font-weight: 600;
      color: #ffffff;
      margin-bottom: 16rpx;
      letter-spacing: 1rpx;
    }

    .logo-subtitle {
      display: block;
      font-size: 26rpx;
      color: #666666;
      font-weight: 400;
    }
  }
}

.login-form {
  flex: 1;
  padding: 0 40rpx;

  .form-container {
    background: #ffffff;
    border-radius: 12rpx;
    padding: 50rpx 40rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);

    .input-item {
      margin-bottom: 40rpx;

      .input-label {
        font-size: 28rpx;
        font-weight: 600;
        color: #333333;
        margin-bottom: 16rpx;
        display: block;
      }

      .native-input {
        width: 100%;
        height: 80rpx;
        padding: 0 20rpx;
        font-size: 28rpx;
        color: #333333;
        background: #ffffff;
        border: 1rpx solid #dcdcdc;
        border-radius: 0;
        box-sizing: border-box;
        transition: all 0.2s ease;
        outline: none;

        &:focus {
          border-color: #1890ff;
          box-shadow: 0 0 0 2rpx rgba(24, 144, 255, 0.2);
        }

        &::placeholder {
          color: #999999;
          font-size: 26rpx;
        }
      }

      .sms-input-group {
        display: flex;
        align-items: center;
        gap: 20rpx;

        .sms-input {
          flex: 1;
        }

        .sms-button {
          height: 80rpx;
          padding: 0 24rpx;
          min-width: 160rpx;
          font-size: 24rpx;
          font-weight: 500;
          color: #1890ff;
          background: #ffffff;
          border: 1rpx solid #1890ff;

          &:active {
            background: #f0f8ff;
          }

          &.button-disabled {
            color: #999999;
            border-color: #dcdcdc;
            background: #f5f5f5;
            cursor: not-allowed;
          }

          &.button-loading {
            color: #999999;
            background: #f5f5f5;
            border-color: #dcdcdc;
          }
        }
      }
    }

    // 原生按钮通用样式
    .native-button {
      outline: none;
      border: none;
      cursor: pointer;
      transition: all 0.3s ease;
      font-family: inherit;

      &:focus {
        outline: none;
      }
    }

    .login-button-wrapper {
      margin-top: 60rpx;

      .login-button {
        width: 100%;
        height: 80rpx;
        font-size: 30rpx;
        font-weight: 600;
        letter-spacing: 1rpx;
        color: #ffffff;
        background: #1890ff;
        border: 1rpx solid #1890ff;

        &:active {
          background: #1677cc;
        }

        &.button-loading {
          background: #cccccc;
          color: #ffffff;
          cursor: not-allowed;
          border-color: #cccccc;
        }

        &:disabled {
          background: #cccccc;
          color: #ffffff;
          cursor: not-allowed;
          border-color: #cccccc;
        }
      }
    }
  }
}

.footer {
  text-align: center;
  padding: 40rpx;
  //   background: #ffffff;

  .footer-text {
    color: #000000;
    font-size: 24rpx;
    font-weight: 400;
  }
}

/* 响应式适配 */
@media (max-height: 800px) {
  .header {
    padding: 60rpx 40rpx 40rpx;

    .logo-section {
      .logo-icon {
        width: 80rpx;
        height: 80rpx;
        margin-bottom: 24rpx;
      }

      .logo-title {
        font-size: 40rpx;
      }
    }
  }

  .login-form .form-container {
    padding: 40rpx;

    .input-item {
      margin-bottom: 28rpx;
    }

    .login-button-wrapper {
      margin-top: 40rpx;
    }
  }
}
</style>
