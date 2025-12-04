<!--
 * @Author: pangyawei
 * @Date: 2025-09-25 14:28:52
 * @LastEditors: pangyawei
 * @LastEditTime: 2025-09-29 15:53:46
 * @Description: 待办事项列表页面
 * @filePath: Do not edit
-->
<route lang="jsonc" type="page">{
  "layout": "default",
  "style": {
    "navigationBarTitleText": "待办事项",
    "navigationStyle": "custom"
  }
}</route>

<template>
  <z-paging ref="paging" v-model="todoList" @query="queryList" :refresher-enabled="true" :loading-more-enabled="true"
    empty-view-text="当前暂无待办事务" :empty-view-img="'/static/images/body.png'" :empty-view-style="{ paddingTop: '200rpx' }">
    <template #top>
      <TopHeader :title="title" :subtitle="subtitle" />
      <view class="tabs-wrapper">
        <wd-tabs v-model="activeTab" @change="onTabChange">
          <wd-tab name="my" title="我的待办" />
          <wd-tab name="done" title="我的已办" />
        </wd-tabs>
      </view>
    </template>
    <view class="todo-list">
      <view v-for="(item, index) in todoList" :key="index" class="todo-item" @click="handleItemClick(item)">
        <view class="status-badge">
          <wd-tag custom-class="space" type="primary">{{ item.taskName }}</wd-tag>
        </view>
        <view class="customer-info">
          <view class="info-row">
            <text class="label">客户姓名：</text>
            <text class="value">{{ item.startUserName }}</text>
          </view>
          <view class="info-row">
            <text class="label">客户电话：</text>
            <text class="value">{{ item.customerPhone }}</text>
          </view>
          <view class="info-row">
            <text class="label">拆机地址：</text>
            <text class="value">{{ item.address }}</text>
          </view>
          <view class="info-row">
            <text class="label">填写时间：</text>
            <text class="value">{{ item.createTime }}</text>
          </view>
        </view>
      </view>
    </view>
    <wd-popup v-model="showProcessRecord" position="bottom" custom-style="height: 70%; border-radius: 20rpx 20rpx 0 0;">
      <view class="process-popup">
        <view class="popup-header">
          <text class="popup-title">流转记录</text>
          <wd-icon name="close" size="20px" @click="showProcessRecord = false" />
        </view>
        <scroll-view scroll-y class="popup-content">
          <wd-steps :active="processRecord.length - 1" vertical custom-class="p-5">
            <wd-step v-for="(item, index) in processRecord" :key="index" :title="item.activityName"
              :status="item.endTime ? 'finished' : 'process'">
              <template #description>
                <view class="step-content">
                  <view v-if="item.activityType === 'startEvent'" class="step-card">
                    <text>{{ item.assigneeName }} 在 {{ item.createTime }} 发起流程</text>
                  </view>
                  <view v-if="item.activityType === 'userTask'" class="step-card">
                    <view class="card-row">
                      <text class="label">实际办理：</text>
                      <text>{{ item.assigneeName || "-" }}</text>
                    </view>
                    <view class="card-row">
                      <text class="label">候选办理：</text>
                      <text>{{ item.candidate || "-" }}</text>
                    </view>
                    <view class="card-row">
                      <text class="label">接收时间：</text>
                      <text>{{ item.createTime || "-" }}</text>
                    </view>
                    <view class="card-row">
                      <text class="label">办结时间：</text>
                      <text>{{ item.endTime || "-" }}</text>
                    </view>
                    <view class="card-row">
                      <text class="label">耗时：</text>
                      <text>{{ item.duration || "-" }}</text>
                    </view>
                    <view v-if="item.commentList && item.commentList.length > 0" class="comments">
                      <view v-for="(comment, commentIndex) in item.commentList" :key="commentIndex"
                        class="comment-item">
                        <view class="comment-header">
                          <wd-tag :type="getApproveTypeTag(comment.type)" size="small">
                            {{ getCommentType(comment.type) }}
                          </wd-tag>
                          <wd-tag type="primary" size="small">
                            {{ comment.time }}
                          </wd-tag>
                        </view>
                        <text class="comment-text">{{ comment.fullMessage }}</text>
                      </view>
                    </view>
                  </view>
                  <view v-if="item.activityType === 'endEvent'" class="step-card">
                    <text>{{ item.createTime }} 结束流程</text>
                  </view>
                </view>
              </template>
            </wd-step>
          </wd-steps>
        </scroll-view>
      </view>
    </wd-popup>
  </z-paging>
</template>

<script lang="ts" setup>
import { getTodoList, getDoneList } from '@/service/jdwl'
import TopHeader from '@/components/TopHeader.vue'
import { useUserStore } from '@/store/user'
const userStore = useUserStore()
const title = ref(userStore.userInfo.user.channelName)
const subtitle = ref(userStore.userInfo.user.nickName)
const activeTab = ref('my')
const showProcessRecord = ref(false)
const paging = ref()
const todoList = ref([])
const processRecord = ref([])

onLoad((options: any) => {
  activeTab.value = options.type || 'my'
})

async function queryList(pageNo: number, pageSize: number) {
  try {
    let res = null
    if (activeTab.value === 'my') {
      res = await getTodoList({ params: { pageNum: pageNo, pageSize } })
    } else {
      res = await getDoneList({ params: { pageNum: pageNo, pageSize } })
    }
    paging.value.complete(res.rows)
  } catch (error) {
    paging.value.complete(false)
  }
}

function onTabChange(value: string) {
  activeTab.value = value
  paging.value.reload()
}

function handleItemClick(item: any) {
  if (item.taskName === "提交派单" && activeTab.value === 'my') {
    uni.navigateTo({
      url: `/pages-index/faile/fail-detail?id=${item.id}&processKey=${item.processKey}&procInsId=${item.procInsId}&type=todo`
    })
  } else {
    uni.navigateTo({
      url: `/pages-index/todo/todo-detail?id=${item.id}&processKey=${item.processKey}&procInsId=${item.procInsId}&type=${activeTab.value}`
    })
  }
}

function getCommentType(val: string) {
  switch (val) {
    case '1':
      return '通过'
    case '2':
      return '退回'
    case '3':
      return '驳回'
    case '4':
      return '委派'
    case '5':
      return '转办'
    case '6':
      return '终止'
    case '7':
      return '撤回'
    default:
      return '-'
  }
}

function getApproveTypeTag(val: string) {
  switch (val) {
    case '1':
      return 'success'
    case '2':
      return 'warning'
    case '3':
      return 'danger'
    case '4':
      return 'primary'
    case '5':
      return 'success'
    case '6':
      return 'danger'
    case '7':
      return 'info'
    default:
      return 'info'
  }
}

function getStatusTextByTab(tab: string) {
  switch (tab) {
    case 'my':
      return '待处理'
    case 'done':
      return '已处理'
    default:
      return '待处理'
  }
}

function getStatusText(status: string) {
  switch (status) {
    case 'urgent':
      return '紧急'
    case 'normal':
      return '正常'
    case 'processing':
      return '处理中'
    case 'overdue':
      return '超期'
    default:
      return '待处理'
  }
}
</script>

<style lang="scss" scoped>
.tabs-wrapper {
  background: white;
  padding: 0 32rpx;

  :deep(.wd-tabs) {
    .wd-tabs__nav {
      border-bottom: none;
    }

    .wd-tab {
      font-size: 32rpx;
      font-weight: 500;

      &.is-active {
        color: #4A90E2;
      }
    }

    .wd-tabs__line {
      background-color: #4A90E2;
    }
  }
}

.todo-list {
  padding: 20rpx;
  background-color: #f5f5f5;

  .todo-item {
    background: white;
    border-radius: 10rpx;
    padding: 32rpx;
    margin-bottom: 24rpx;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
    position: relative;

    &:active {
      background-color: #f8f9fa;
    }

    &:last-child {
      margin-bottom: 0;
    }
  }

  .status-badge {
    position: absolute;
    top: 24rpx;
    right: 24rpx;
    padding: 8rpx 16rpx;
    border-radius: 24rpx;
    font-size: 24rpx;
    font-weight: 500;
    z-index: 1;

    .status-text {
      color: white;
    }

    &.status-my {
      background: linear-gradient(135deg, #FA8C16, #FFA940);
      box-shadow: 0 2rpx 8rpx rgba(250, 140, 22, 0.3);
    }

    &.status-done {
      background: linear-gradient(135deg, #52C41A, #73D13D);
      box-shadow: 0 2rpx 8rpx rgba(82, 196, 26, 0.3);
    }
  }

  .item-header {
    display: flex;
    align-items: center;
    margin-bottom: 32rpx;
    padding-bottom: 24rpx;
    border-bottom: 2rpx solid #f0f0f0;

    .red-icon {
      width: 80rpx;
      height: 80rpx;
      background: #FF4D4F;
      border-radius: 16rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 24rpx;

      .icon-img {
        width: 48rpx;
        height: 48rpx;
      }
    }

    .header-text {
      flex: 1;

      .main-title {
        display: block;
        font-size: 36rpx;
        font-weight: 600;
        color: #333;
        margin-bottom: 8rpx;
        line-height: 1.3;
      }

      .sub-title {
        font-size: 28rpx;
        color: #666;
      }
    }
  }

  .customer-info {
    .info-row {
      display: flex;
      align-items: flex-start;
      margin-bottom: 16rpx;
      line-height: 1.4;

      &:last-child {
        margin-bottom: 0;
      }

      .label {
        font-size: 30rpx;
        color: #666;
        min-width: 160rpx;
        flex-shrink: 0;
      }

      .value {
        font-size: 30rpx;
        color: #333;
        flex: 1;
        word-break: break-all;
      }
    }
  }
}

.process-popup {
  height: 100%;
  display: flex;
  flex-direction: column;

  .popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 32rpx;
    border-bottom: 2rpx solid #f0f0f0;

    .popup-title {
      font-size: 36rpx;
      font-weight: 600;
      color: #333;
    }
  }

  .popup-content {
    flex: 1;
    padding: 24rpx;
  }

  .step-content {
    margin-top: 16rpx;
  }

  .step-card {
    background: #f8f9fa;
    border-radius: 16rpx;
    padding: 24rpx;
    margin-bottom: 16rpx;

    .card-row {
      display: flex;
      margin-bottom: 12rpx;
      font-size: 28rpx;

      &:last-child {
        margin-bottom: 0;
      }

      .label {
        font-weight: 500;
        color: #666;
        width: 160rpx;
        flex-shrink: 0;
      }
    }

    .comments {
      margin-top: 20rpx;

      .comment-item {
        margin-bottom: 16rpx;

        &:last-child {
          margin-bottom: 0;
        }

        .comment-header {
          display: flex;
          gap: 12rpx;
          margin-bottom: 8rpx;
        }

        .comment-text {
          font-size: 28rpx;
          color: #333;
          line-height: 1.5;
        }
      }
    }
  }
}
</style>