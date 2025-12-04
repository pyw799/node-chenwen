<!--
 * @Author: pangyawei
 * @Date: 2025-08-25 15:07:18
 * @LastEditors: pangyawei
 * @LastEditTime: 2025-09-24 11:57:29
 * @Description: 文件内容描述
 * @filePath: Do not edit
-->
<script setup lang="ts">
import { onHide, onLaunch, onShow } from '@dcloudio/uni-app'
import { navigateToInterceptor } from '@/router/interceptor'
import 'abortcontroller-polyfill/dist/abortcontroller-polyfill-only'

onLaunch((options) => {
  console.log('App Launch', options)
})
onShow((options) => {
  is_weixn();
  console.log('App Show', options)
  sessionStorage.setItem('type', options.type)
  // 处理直接进入页面路由的情况：如h5直接输入路由、微信小程序分享后进入等
  // https://github.com/unibest-tech/unibest/issues/192
  if (options?.path) {
    navigateToInterceptor.invoke({ url: `/${options.path}`, query: options.query })
  } else {
    navigateToInterceptor.invoke({ url: '/' })
  }
})
onHide(() => {
  console.log('App Hide')
})

function is_weixn() {
  var ua = navigator.userAgent.toLowerCase();
  if (ua.match(/MicroMessenger/i) == "micromessenger") {
    // 检测到微信环境，引导用户在外部浏览器打开
    openInExternalBrowser();
    return "weixin";
  }
}

function openInExternalBrowser() {
  // 创建提示页面元素
  const maskDiv = document.createElement("div");
  maskDiv.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    z-index: 9999;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    padding-top: 50px;
    color: white;
    font-size: 16px;
    text-align: center;
  `;

  // 创建箭头指向右上角
  const arrow = document.createElement("div");
  arrow.style.cssText = `
    position: absolute;
    top: 20px;
    right: 30px;
    font-size: 30px;
    animation: bounce 1s infinite;
  `;
  arrow.innerHTML = "↗️";

  // 创建提示文字
  const tipText = document.createElement("div");
  tipText.style.cssText = `
    padding: 20px;
    line-height: 1.8;
    max-width: 300px;
  `;
  tipText.innerHTML = `
    <div style="font-size: 18px; margin-bottom: 15px; font-weight: bold;">
      请在浏览器中打开
    </div>
    <div style="margin-bottom: 10px;">
      点击右上角 <span style="color: #1aad19;">"···"</span> 或 <span style="color: #1aad19;">"更多"</span>
    </div>
    <div style="margin-bottom: 10px;">
      选择 <span style="color: #1aad19;">"在浏览器中打开"</span>
    </div>
    <div style="color: #999; font-size: 14px;">
      获得更好的浏览体验
    </div>
  `;

  // 添加弹跳动画
  const style = document.createElement("style");
  style.textContent = `
    @keyframes bounce {
      0%, 20%, 50%, 80%, 100% {
        transform: translateY(0);
      }
      40% {
        transform: translateY(-10px);
      }
      60% {
        transform: translateY(-5px);
      }
    }
  `;
  document.head.appendChild(style);

  maskDiv.appendChild(arrow);
  maskDiv.appendChild(tipText);
  document.body.appendChild(maskDiv);

  // 自动尝试调用外部浏览器（支持多种机型和浏览器）
  tryOpenInExternalBrowser();
}

function tryOpenInExternalBrowser() {
  const currentUrl = window.location.href;
  const ua = navigator.userAgent.toLowerCase();

  // 检测设备类型和系统
  const isAndroid = ua.indexOf("android") > -1;
  const isIOS = ua.indexOf("iphone") > -1 || ua.indexOf("ipad") > -1;

  // 安卓设备尝试多种浏览器包名
  if (isAndroid) {
    const browsers = [
      "com.android.chrome", // Chrome
      "com.android.browser", // 原生浏览器
      "com.tencent.mtt", // QQ浏览器
      "com.UCMobile", // UC浏览器
      "com.huawei.browser", // 华为浏览器
      "com.xiaomi.browser", // 小米浏览器
      "com.vivo.browser", // vivo浏览器
      "com.oppo.browser", // OPPO浏览器
      "com.samsung.android.app.sbrowser", // 三星浏览器
      "com.microsoft.emmx", // Edge浏览器
      "org.mozilla.firefox", // Firefox
      "com.opera.browser", // Opera浏览器
      "com.qihoo.browser", // 360浏览器
    ];

    // 逐个尝试不同的浏览器
    let attempted = false;
    browsers.forEach((packageName, index) => {
      setTimeout(() => {
        try {
          const intentUrl = `intent://${currentUrl.replace(
            /^https?:\/\//,
            ""
          )}#Intent;scheme=http;package=${packageName};end`;
          window.location.href = intentUrl;
          console.log(`尝试调用浏览器: ${packageName}`);
        } catch (e) {
          console.log(`无法调用浏览器 ${packageName}`);
        }
      }, index * 500); // 每500ms尝试一个
    });

    // 通用安卓Intent调用
    setTimeout(() => {
      try {
        window.location.href = `intent://${currentUrl.replace(
          /^https?:\/\//,
          ""
        )}#Intent;scheme=http;action=android.intent.action.VIEW;end`;
        console.log("尝试通用Intent调用");
      } catch (e) {
        console.log("通用Intent调用失败");
      }
    }, browsers.length * 500);
  } else if (isIOS) {
    // iOS设备尝试多种URL Scheme
    const schemes = [
      `googlechrome://${currentUrl}`, // Chrome
      `firefox://${currentUrl}`, // Firefox
      `opera-http://${currentUrl}`, // Opera
      `msedge-http://${currentUrl}`, // Edge
      currentUrl, // Safari (默认)
    ];

    schemes.forEach((schemeUrl, index) => {
      setTimeout(() => {
        try {
          window.location.href = schemeUrl;
          console.log(`尝试调用iOS浏览器: ${schemeUrl}`);
        } catch (e) {
          console.log(`无法调用iOS浏览器: ${schemeUrl}`);
        }
      }, index * 300);
    });
  }

  // 通用方法：尝试新窗口打开
  setTimeout(() => {
    try {
      window.open(currentUrl, "_blank");
      console.log("尝试新窗口打开");
    } catch (e) {
      console.log("新窗口打开失败");
    }
  }, 3000);
}
</script>

<style lang="scss">
@import '@/static/css/quill.bubble.css';
@import '@/static/css/quill.snow.css';
@import '@/static/css/quill.core.css';

page {
  background-color: #f5f5f5;
}

swiper,
scroll-view {
  flex: 1;
  height: 100%;
  overflow: hidden;
}

image {
  width: 100%;
  height: 100%;
  vertical-align: middle;
}
</style>
