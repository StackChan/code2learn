<!-- 提醒列表 -->
<template>
    <div class="main">
        <div class="main-container">
            <van-sticky>
                <!-- title="提醒列表" left-text="返回" -->
                <van-nav-bar :title="t('remindList.10')" :left-text="t('common.110')" left-arrow @click-left="onBack" @click-right="router.push({path: '/index'})">
                    <template #right>
                        <van-icon name="wap-home-o" :size="convertViewportWidth('18px')"/>
                    </template>
                </van-nav-bar>
            </van-sticky>
            <!-- success-text="刷新成功" -->
            <van-pull-refresh v-model="state.isRefreshing" :success-text="t('common.130')" pull-distance="200" @refresh="onRefresh" style="min-height: 50vh;">
            <div class="remindListModule" >
                <!--error-text="请求失败，点击重新加载" finished-text="没有更多了"-->
                <van-list v-model:loading="state.isLoading" :finished="state.isFinished" v-model:error="state.isError" :error-text="t('common.140')" :finished-text="t('common.150')" @load="onLoad">
                   
                    <div v-for="(remind,index) in state.remindList" :key="remind.id" class="item van-hairline--bottom">
                        <div class="top-container">
                            <div class="left-layout">
                                <div class="userInfo">

                                    <router-link v-if="remind.senderAccount != null && remind.senderAccount != ''" tag="a" :to="{path:'/user/control/home',query: {userName: remind.senderUserName}}">
                                        <span class="avatarImg">
                                            <img v-if="remind.senderAvatarName != null" :src="remind.senderAvatarPath+'100x100/'+remind.senderAvatarName" class="img">
                                        
                                            <img v-if="remind.senderAvatarName == null" :src="remind.senderAvatar" class="img"/>
                                        </span>
                                    </router-link>
                                    <template v-if="remind.senderAccount == null || remind.senderAccount == ''">
                                        <span class="avatarImg">
                                            <img v-if="remind.senderAvatarName != null" :src="remind.senderAvatarPath+'100x100/'+remind.senderAvatarName" class="img">
                                        
                                            <img v-if="remind.senderAvatarName == null" :src="remind.senderAvatar" class="img"/>
                                        </span>
                                    </template>
                                    <span v-if="remind.senderNickname == null || remind.senderNickname == ''" class="account">{{remind.senderAccount}}</span>
                                    <span v-if="remind.senderNickname != null && remind.senderNickname != ''" class="account">{{remind.senderNickname}}</span>
                                    <!-- 此用户账号已注销 -->
                                    <div v-if="remind.senderAccount == null || remind.senderAccount == ''" class="cancelAccount">{{t('remindList.60')}}</div>
                                </div>
                                <div class="time">{{remind.sendTime}}</div>
                            </div>
                            <div class="right-layout">
                                <span v-if="remind.status == 10" class="status">{{t('remindList.30')}}</span><!-- 未读 -->
                                <span v-if="remind.status == 20" class="status alreadyRead">{{t('remindList.40')}}</span><!-- 已读 -->
                                <span class="more">
                                    <Icon name="trash" :size="convertViewportWidth('16px')" @click="onDelete(remind.id)"/>
                                </span>
                            </div>
                        </div>
                        <div class="bottom-container">
                            <div class="content">
                                <div v-if="remind.typeCode == 10">
                                    <!--<cite>
                                        此用户账号已注销
                                        <span class="cancelAccount" v-if="remind.senderAccount == null || remind.senderAccount == ''">{{t('remindList.60')}}</span>
                                        <router-link tag="a" :to="{path:'/user/control/home',query:{userName:remind.senderUserName}}">
                                            {{remind.senderNickname != null && remind.senderNickname != '' ? remind.senderNickname : remind.senderAccount}}
                                        </router-link>
                                    </cite> 
                                    在
                                    <cite>
                                        <router-link tag="a" :to="{path:'/thread',query:{topicId:remind.topicId,commentId:remind.friendTopicCommentId,reportModule:20}}">
                                            {{remind.topicTitle}}
                                        </router-link>
                                    </cite> 
                                    评论了我的话题-->
                                    <i18n-t keypath="remindList.70" scope="global">
                                        <template #p1>
                                            <cite>
                                                <!-- 此用户账号已注销 -->
                                                <span class="cancelAccount" v-if="remind.senderAccount == null || remind.senderAccount == ''">{{t('remindList.60')}}</span>
                                                <router-link tag="a" :to="{path:'/user/control/home',query:{userName:remind.senderUserName}}">
                                                    {{remind.senderNickname != null && remind.senderNickname != '' ? remind.senderNickname : remind.senderAccount}}
                                                </router-link>
                                            </cite> 
                                        </template>
                                        <template #p2>
                                            <cite>
                                                <router-link tag="a" :to="{path:'/thread',query:{topicId:remind.topicId,commentId:remind.friendTopicCommentId,reportModule:20}}">
                                                    {{remind.topicTitle}}
                                                </router-link>
                                            </cite> 
                                        </template>
                                    </i18n-t>
                                    <div class="summary">
                                        {{remind.summary}}
                                    </div>
                                </div>
                                <div v-if="remind.typeCode == 20">
                                    <!-- <cite>
                                        此用户账号已注销
                                        <span class="cancelAccount" v-if="remind.senderAccount == null || remind.senderAccount == ''">{{t('remindList.60')}}</span>
                                        <router-link tag="a" :to="{path:'/user/control/home',query:{userName:remind.senderUserName}}">
                                            {{remind.senderNickname != null && remind.senderNickname != '' ? remind.senderNickname : remind.senderAccount}}
                                        </router-link>
                                    </cite> 
                                    在
                                    <cite>
                                        <router-link tag="a" :to="{path:'/thread',query:{topicId:remind.topicId,commentId:remind.friendTopicCommentId,replyId:remind.friendTopicReplyId,reportModule:30}}">
                                            {{remind.topicTitle}}
                                        </router-link>
                                    </cite> 
                                    回复了我的话题 -->
                                    <i18n-t keypath="remindList.80" scope="global">
                                        <template #p1>
                                            <cite>
                                                <!-- 此用户账号已注销 -->
                                                <span class="cancelAccount" v-if="remind.senderAccount == null || remind.senderAccount == ''">{{t('remindList.60')}}</span>
                                                <router-link tag="a" :to="{path:'/user/control/home',query:{userName:remind.senderUserName}}">
                                                    {{remind.senderNickname != null && remind.senderNickname != '' ? remind.senderNickname : remind.senderAccount}}
                                                </router-link>
                                            </cite> 
                                        </template>
                                        <template #p2>
                                            <cite>
                                                <router-link tag="a" :to="{path:'/thread',query:{topicId:remind.topicId,commentId:remind.friendTopicCommentId,replyId:remind.friendTopicReplyId,reportModule:30}}">
                                                    {{remind.topicTitle}}
                                                </router-link>
                                            </cite> 
                                        </template>
                                    </i18n-t>
                                    <div class="summary">
                                        {{remind.summary}}
                                    </div>
                                </div>
                                <div v-if="remind.typeCode == 30">
                                    <!-- <cite>
                                        此用户账号已注销
                                        <span class="cancelAccount" v-if="remind.senderAccount == null || remind.senderAccount == ''">{{t('remindList.60')}}</span>
                                        <router-link tag="a" :to="{path:'/user/control/home',query:{userName:remind.senderUserName}}">
                                            {{remind.senderNickname != null && remind.senderNickname != '' ? remind.senderNickname : remind.senderAccount}}
                                        </router-link>
                                    </cite> 
                                    在
                                    <cite>
                                        <router-link tag="a" :to="{path:'/thread',query:{topicId:remind.topicId,commentId:remind.friendTopicCommentId,reportModule:20}}">
                                            {{remind.topicTitle}}
                                        </router-link>
                                    </cite> 
                                    引用了我的评论 -->
                                    <i18n-t keypath="remindList.90" scope="global">
                                        <template #p1>
                                            <cite>
                                                <!-- 此用户账号已注销 -->
                                                <span class="cancelAccount" v-if="remind.senderAccount == null || remind.senderAccount == ''">{{t('remindList.60')}}</span>
                                                <router-link tag="a" :to="{path:'/user/control/home',query:{userName:remind.senderUserName}}">
                                                    {{remind.senderNickname != null && remind.senderNickname != '' ? remind.senderNickname : remind.senderAccount}}
                                                </router-link>
                                            </cite> 
                                        </template>
                                        <template #p2>
                                            <cite>
                                                <router-link tag="a" :to="{path:'/thread',query:{topicId:remind.topicId,commentId:remind.friendTopicCommentId,reportModule:20}}">
                                                    {{remind.topicTitle}}
                                                </router-link>
                                            </cite> 
                                        </template>
                                    </i18n-t>
                                    <div class="summary">
                                        {{remind.summary}}
                                    </div>
                                </div>
                                <div v-if="remind.typeCode == 40">
                                    <!-- <cite>
                                        此用户账号已注销
                                        <span class="cancelAccount" v-if="remind.senderAccount == null || remind.senderAccount == ''">{{t('remindList.60')}}</span>
                                        <router-link tag="a" :to="{path:'/user/control/home',query:{userName:remind.senderUserName}}">
                                            {{remind.senderNickname != null && remind.senderNickname != '' ? remind.senderNickname : remind.senderAccount}}
                                        </router-link>
                                    </cite> 
                                    在
                                    <cite>
                                        <router-link tag="a" :to="{path:'/thread',query:{topicId:remind.topicId,commentId:remind.topicCommentId,replyId:remind.friendTopicReplyId,reportModule:30}}">
                                            {{remind.topicTitle}}
                                        </router-link>
                                    </cite> 
                                    回复了我的评论 -->
                                    <i18n-t keypath="remindList.100" scope="global">
                                        <template #p1>
                                            <cite>
                                                <!-- 此用户账号已注销 -->
                                                <span class="cancelAccount" v-if="remind.senderAccount == null || remind.senderAccount == ''">{{t('remindList.60')}}</span>
                                                <router-link tag="a" :to="{path:'/user/control/home',query:{userName:remind.senderUserName}}">
                                                    {{remind.senderNickname != null && remind.senderNickname != '' ? remind.senderNickname : remind.senderAccount}}
                                                </router-link>
                                            </cite> 
                                        </template>
                                        <template #p2>
                                            <cite>
                                                <router-link tag="a" :to="{path:'/thread',query:{topicId:remind.topicId,commentId:remind.topicCommentId,replyId:remind.friendTopicReplyId,reportModule:30}}">
                                                    {{remind.topicTitle}}
                                                </router-link>
                                            </cite> 
                                        </template>
                                    </i18n-t>
                                    <div class="summary">
                                        {{remind.summary}}
                                    </div>
                                </div>
                                <div v-if="remind.typeCode == 50">
                                    <!-- <cite>
                                        此用户账号已注销
                                        <span class="cancelAccount" v-if="remind.senderAccount == null || remind.senderAccount == ''">{{t('remindList.60')}}</span>
                                        <router-link tag="a" :to="{path:'/user/control/home',query:{userName:remind.senderUserName}}">
                                            {{remind.senderNickname != null && remind.senderNickname != '' ? remind.senderNickname : remind.senderAccount}}
                                        </router-link>
                                    </cite> 
                                    在
                                    <cite>
                                        <router-link tag="a" :to="{path:'/thread',query:{topicId:remind.topicId,commentId:remind.friendTopicCommentId,replyId:remind.friendTopicReplyId,reportModule:30}}">
                                            {{remind.topicTitle}}
                                        </router-link>
                                    </cite> 
                                    回复了我回复过的评论 -->
                                    <i18n-t keypath="remindList.110" scope="global">
                                        <template #p1>
                                            <cite>
                                                <!-- 此用户账号已注销 -->
                                                <span class="cancelAccount" v-if="remind.senderAccount == null || remind.senderAccount == ''">{{t('remindList.60')}}</span>
                                                <router-link tag="a" :to="{path:'/user/control/home',query:{userName:remind.senderUserName}}">
                                                    {{remind.senderNickname != null && remind.senderNickname != '' ? remind.senderNickname : remind.senderAccount}}
                                                </router-link>
                                            </cite> 
                                        </template>
                                        <template #p2>
                                            <cite>
                                                <router-link tag="a" :to="{path:'/thread',query:{topicId:remind.topicId,commentId:remind.friendTopicCommentId,replyId:remind.friendTopicReplyId,reportModule:30}}">
                                                    {{remind.topicTitle}}
                                                </router-link>
                                            </cite> 
                                        </template>
                                    </i18n-t>
                                    <div class="summary">
                                        {{remind.summary}}
                                    </div>
                                </div>
                                <div v-if="remind.typeCode == 55">
                                    <!-- <cite>
                                        此用户账号已注销
                                        <span class="cancelAccount" v-if="remind.senderAccount == null || remind.senderAccount == ''">{{t('remindList.60')}}</span>
                                        <router-link tag="a" :to="{path:'/user/control/home',query:{userName:remind.senderUserName}}">
                                            {{remind.senderNickname != null && remind.senderNickname != '' ? remind.senderNickname : remind.senderAccount}}
                                        </router-link>
                                    </cite> 
                                    在
                                    <cite>
                                        <router-link tag="a" :to="{path:'/thread',query:{topicId:remind.topicId,commentId:remind.friendTopicCommentId,replyId:remind.friendTopicReplyId,reportModule:30}}">
                                            {{remind.topicTitle}}
                                        </router-link>
                                    </cite> 
                                    回复了我的评论回复 -->
                                    <i18n-t keypath="remindList.120" scope="global">
                                        <template #p1>
                                            <cite>
                                                <!-- 此用户账号已注销 -->
                                                <span class="cancelAccount" v-if="remind.senderAccount == null || remind.senderAccount == ''">{{t('remindList.60')}}</span>
                                                <router-link tag="a" :to="{path:'/user/control/home',query:{userName:remind.senderUserName}}">
                                                    {{remind.senderNickname != null && remind.senderNickname != '' ? remind.senderNickname : remind.senderAccount}}
                                                </router-link>
                                            </cite> 
                                        </template>
                                        <template #p2>
                                            <cite>
                                                <router-link tag="a" :to="{path:'/thread',query:{topicId:remind.topicId,commentId:remind.friendTopicCommentId,replyId:remind.friendTopicReplyId,reportModule:30}}">
                                                    {{remind.topicTitle}}
                                                </router-link>
                                            </cite> 
                                        </template>
                                    </i18n-t>
                                    <div class="summary">
                                        {{remind.summary}}
                                    </div>
                                </div>
                                <div v-if="remind.typeCode == 60">
                                    <!-- <cite>
                                        此用户账号已注销
                                        <span class="cancelAccount" v-if="remind.senderAccount == null || remind.senderAccount == ''">{{t('remindList.60')}}</span>
                                        <router-link tag="a" :to="{path:'/user/control/home',query:{userName:remind.senderUserName}}">
                                            {{remind.senderNickname != null && remind.senderNickname != '' ? remind.senderNickname : remind.senderAccount}}
                                        </router-link>
                                    </cite> 
                                    在
                                    <cite>
                                        <router-link tag="a" :to="{path:'/thread',query:{topicId:remind.topicId}}">
                                            {{remind.topicTitle}}
                                        </router-link>
                                    </cite> 
                                    解锁了我的话题 -->
                                    <i18n-t keypath="remindList.130" scope="global">
                                        <template #p1>
                                            <cite>
                                                <!-- 此用户账号已注销 -->
                                                <span class="cancelAccount" v-if="remind.senderAccount == null || remind.senderAccount == ''">{{t('remindList.60')}}</span>
                                                <router-link tag="a" :to="{path:'/user/control/home',query:{userName:remind.senderUserName}}">
                                                    {{remind.senderNickname != null && remind.senderNickname != '' ? remind.senderNickname : remind.senderAccount}}
                                                </router-link>
                                            </cite> 
                                        </template>
                                        <template #p2>
                                            <cite>
                                                <router-link tag="a" :to="{path:'/thread',query:{topicId:remind.topicId}}">
                                                    {{remind.topicTitle}}
                                                </router-link>
                                            </cite> 
                                        </template>
                                    </i18n-t>
                                    <div class="summary">
                                        {{remind.summary}}
                                    </div>
                                </div>
                                <div v-if="remind.typeCode == 70">
                                    <!-- <cite>
                                        此用户账号已注销
                                        <span class="cancelAccount" v-if="remind.senderAccount == null || remind.senderAccount == ''">{{t('remindList.60')}}</span>
                                        <router-link tag="a" :to="{path:'/user/control/home',query:{userName:remind.senderUserName}}">
                                            {{remind.senderNickname != null && remind.senderNickname != '' ? remind.senderNickname : remind.senderAccount}}
                                        </router-link>
                                    </cite> 
                                    在
                                    <cite>
                                        <router-link tag="a" :to="{path:'/thread',query:{topicId:remind.topicId}}">
                                            {{remind.topicTitle}}
                                        </router-link>
                                    </cite> 
                                    赞了我的话题 -->
                                    <i18n-t keypath="remindList.140" scope="global">
                                        <template #p1>
                                            <cite>
                                                <!-- 此用户账号已注销 -->
                                                <span class="cancelAccount" v-if="remind.senderAccount == null || remind.senderAccount == ''">{{t('remindList.60')}}</span>
                                                <router-link tag="a" :to="{path:'/user/control/home',query:{userName:remind.senderUserName}}">
                                                    {{remind.senderNickname != null && remind.senderNickname != '' ? remind.senderNickname : remind.senderAccount}}
                                                </router-link>
                                            </cite> 
                                        </template>
                                        <template #p2>
                                            <cite>
                                                <router-link tag="a" :to="{path:'/thread',query:{topicId:remind.topicId}}">
                                                    {{remind.topicTitle}}
                                                </router-link>
                                            </cite> 
                                        </template>
                                    </i18n-t>
                                    <div class="summary">
                                        {{remind.summary}}
                                    </div>
                                </div>
                                <div v-if="remind.typeCode == 80">
                                    <!-- <cite>
                                        此用户账号已注销
                                        <span class="cancelAccount" v-if="remind.senderAccount == null || remind.senderAccount == ''">{{t('remindList.60')}}</span>
                                        <router-link tag="a" :to="{path:'/user/control/home',query:{userName:remind.senderUserName}}">
                                            {{remind.senderNickname != null && remind.senderNickname != '' ? remind.senderNickname : remind.senderAccount}}
                                        </router-link>
                                    </cite> 
                                    关注了我 -->
                                    <i18n-t keypath="remindList.145" scope="global">
                                        <template #p1>
                                            <cite>
                                                <!-- 此用户账号已注销 -->
                                                <span class="cancelAccount" v-if="remind.senderAccount == null || remind.senderAccount == ''">{{t('remindList.60')}}</span>
                                                <router-link tag="a" :to="{path:'/user/control/home',query:{userName:remind.senderUserName}}">
                                                    {{remind.senderNickname != null && remind.senderNickname != '' ? remind.senderNickname : remind.senderAccount}}
                                                </router-link>
                                            </cite> 
                                        </template>
                                    </i18n-t>
                                </div>
                                <div v-if="remind.typeCode == 90">
                                    <!-- 我关注的
                                    <cite>
                                        此用户账号已注销
                                        <span class="cancelAccount" v-if="remind.senderAccount == null || remind.senderAccount == ''">{{t('remindList.60')}}</span>
                                        <router-link tag="a" :to="{path:'/user/control/home',query:{userName:remind.senderUserName}}">
                                            {{remind.senderNickname != null && remind.senderNickname != '' ? remind.senderNickname : remind.senderAccount}}
                                        </router-link>
                                    </cite> 
                                    发表了话题
                                    <cite>
                                        <router-link tag="a" :to="{path:'/thread',query:{topicId:remind.topicId}}">
                                            {{remind.topicTitle}}
                                        </router-link>
                                    </cite> -->

                                    <i18n-t keypath="remindList.150" scope="global">
                                        <template #p1>
                                            <cite>
                                                <!-- 此用户账号已注销 -->
                                                <span class="cancelAccount" v-if="remind.senderAccount == null || remind.senderAccount == ''">{{t('remindList.60')}}</span>
                                                <router-link tag="a" :to="{path:'/user/control/home',query:{userName:remind.senderUserName}}">
                                                    {{remind.senderNickname != null && remind.senderNickname != '' ? remind.senderNickname : remind.senderAccount}}
                                                </router-link>
                                            </cite> 
                                        </template>
                                        <template #p2>
                                            <cite>
                                                <router-link tag="a" :to="{path:'/thread',query:{topicId:remind.topicId}}">
                                                    {{remind.topicTitle}}
                                                </router-link>
                                            </cite> 
                                        </template>
                                    </i18n-t>
                                    <div class="summary">
                                        {{remind.summary}}
                                    </div>
                                </div>
                                <div v-if="remind.typeCode == 100">
                                    <!-- 我关注的
                                    <cite>
                                        此用户账号已注销
                                        <span class="cancelAccount" v-if="remind.senderAccount == null || remind.senderAccount == ''">{{t('remindList.60')}}</span>
                                        <router-link tag="a" :to="{path:'/user/control/home',query:{userName:remind.senderUserName}}">
                                            {{remind.senderNickname != null && remind.senderNickname != '' ? remind.senderNickname : remind.senderAccount}}
                                        </router-link>
                                    </cite> 
                                    在
                                     <cite>
                                        <router-link tag="a" :to="{path:'/thread',query:{topicId:remind.topicId,commentId:remind.friendTopicCommentId,reportModule:20}}">
                                            {{remind.topicTitle}}
                                        </router-link>
                                    </cite> 
                                    发表了评论 -->
                                    <i18n-t keypath="remindList.160" scope="global">
                                        <template #p1>
                                            <cite>
                                                <!-- 此用户账号已注销 -->
                                                <span class="cancelAccount" v-if="remind.senderAccount == null || remind.senderAccount == ''">{{t('remindList.60')}}</span>
                                                <router-link tag="a" :to="{path:'/user/control/home',query:{userName:remind.senderUserName}}">
                                                    {{remind.senderNickname != null && remind.senderNickname != '' ? remind.senderNickname : remind.senderAccount}}
                                                </router-link>
                                            </cite> 
                                        </template>
                                        <template #p2>
                                            <cite>
                                                <router-link tag="a" :to="{path:'/thread',query:{topicId:remind.topicId,commentId:remind.friendTopicCommentId,reportModule:20}}">
                                                    {{remind.topicTitle}}
                                                </router-link>
                                            </cite> 
                                        </template>
                                    </i18n-t>
                                    <div class="summary">
                                        {{remind.summary}}
                                    </div>
                                </div>
                                <div v-if="remind.typeCode == 110">
                                    <!-- 我关注的
                                    <cite>
                                        此用户账号已注销
                                        <span class="cancelAccount" v-if="remind.senderAccount == null || remind.senderAccount == ''">{{t('remindList.60')}}</span>
                                        <router-link tag="a" :to="{path:'/user/control/home',query:{userName:remind.senderUserName}}">
                                            {{remind.senderNickname != null && remind.senderNickname != '' ? remind.senderNickname : remind.senderAccount}}
                                        </router-link>
                                    </cite> 
                                    在
                                     <cite>
                                        <router-link tag="a" :to="{path:'/thread',query:{topicId:remind.topicId,commentId:remind.friendTopicCommentId,replyId:remind.friendTopicReplyId,reportModule:30}}">
                                            {{remind.topicTitle}}
                                        </router-link>
                                    </cite> 
                                    发表了评论回复 -->
                                    <i18n-t keypath="remindList.170" scope="global">
                                        <template #p1>
                                            <cite>
                                                <!-- 此用户账号已注销 -->
                                                <span class="cancelAccount" v-if="remind.senderAccount == null || remind.senderAccount == ''">{{t('remindList.60')}}</span>
                                                <router-link tag="a" :to="{path:'/user/control/home',query:{userName:remind.senderUserName}}">
                                                    {{remind.senderNickname != null && remind.senderNickname != '' ? remind.senderNickname : remind.senderAccount}}
                                                </router-link>
                                            </cite> 
                                        </template>
                                        <template #p2>
                                            <cite>
                                                <router-link tag="a" :to="{path:'/thread',query:{topicId:remind.topicId,commentId:remind.friendTopicCommentId,replyId:remind.friendTopicReplyId,reportModule:30}}">
                                                    {{remind.topicTitle}}
                                                </router-link>
                                            </cite> 
                                        </template>
                                    </i18n-t>
                                    <div class="summary">
                                        {{remind.summary}}
                                    </div>
                                </div>
                                <div v-if="remind.typeCode == 120">
                                    <!-- <cite>
                                        此用户账号已注销
                                        <span class="cancelAccount" v-if="remind.senderAccount == null || remind.senderAccount == ''">{{t('remindList.60')}}</span>
                                        <router-link tag="a" :to="{path:'/user/control/home',query:{userName:remind.senderUserName}}">
                                            {{remind.senderNickname != null && remind.senderNickname != '' ? remind.senderNickname : remind.senderAccount}}
                                        </router-link>
                                    </cite> 
                                    在
                                    <cite>
                                        <router-link tag="a" :to="{path:'/question',query:{questionId:remind.questionId,answerId:remind.friendQuestionAnswerId,reportModule:50}}">
                                            {{remind.questionTitle}}
                                        </router-link>
                                    </cite> 
                                    回答了我的问题 -->
                                    <i18n-t keypath="remindList.180" scope="global">
                                        <template #p1>
                                            <cite>
                                                <!-- 此用户账号已注销 -->
                                                <span class="cancelAccount" v-if="remind.senderAccount == null || remind.senderAccount == ''">{{t('remindList.60')}}</span>
                                                <router-link tag="a" :to="{path:'/user/control/home',query:{userName:remind.senderUserName}}">
                                                    {{remind.senderNickname != null && remind.senderNickname != '' ? remind.senderNickname : remind.senderAccount}}
                                                </router-link>
                                            </cite> 
                                        </template>
                                        <template #p2>
                                            <cite>
                                                <router-link tag="a" :to="{path:'/question',query:{questionId:remind.questionId,answerId:remind.friendQuestionAnswerId,reportModule:50}}">
                                                    {{remind.questionTitle}}
                                                </router-link>
                                            </cite> 
                                        </template>
                                    </i18n-t>
                                    <div class="summary">
                                        {{remind.summary}}
                                    </div>
                                </div>
                                <div v-if="remind.typeCode == 130">
                                    <!-- <cite>
                                        此用户账号已注销
                                        <span class="cancelAccount" v-if="remind.senderAccount == null || remind.senderAccount == ''">{{t('remindList.60')}}</span>
                                        <router-link tag="a" :to="{path:'/user/control/home',query:{userName:remind.senderUserName}}">
                                            {{remind.senderNickname != null && remind.senderNickname != '' ? remind.senderNickname : remind.senderAccount}}
                                        </router-link>
                                    </cite> 
                                    在
                                     <cite>
                                        <router-link tag="a" :to="{path:'/question',query:{questionId:remind.questionId,answerId:remind.friendQuestionAnswerId,replyId:remind.friendQuestionReplyId,reportModule:60}}">
                                            {{remind.questionTitle}}
                                        </router-link>
                                    </cite> 
                                    回复了我的问题 -->

                                    <i18n-t keypath="remindList.190" scope="global">
                                        <template #p1>
                                            <cite>
                                                <!-- 此用户账号已注销 -->
                                                <span class="cancelAccount" v-if="remind.senderAccount == null || remind.senderAccount == ''">{{t('remindList.60')}}</span>
                                                <router-link tag="a" :to="{path:'/user/control/home',query:{userName:remind.senderUserName}}">
                                                    {{remind.senderNickname != null && remind.senderNickname != '' ? remind.senderNickname : remind.senderAccount}}
                                                </router-link>
                                            </cite> 
                                        </template>
                                        <template #p2>
                                            <cite>
                                                <router-link tag="a" :to="{path:'/question',query:{questionId:remind.questionId,answerId:remind.friendQuestionAnswerId,replyId:remind.friendQuestionReplyId,reportModule:60}}">
                                                    {{remind.questionTitle}}
                                                </router-link>
                                            </cite> 
                                        </template>
                                    </i18n-t>
                                    <div class="summary">
                                        {{remind.summary}}
                                    </div>
                                </div>
                                <div v-if="remind.typeCode == 140">
                                    <!-- <cite>
                                        此用户账号已注销
                                        <span class="cancelAccount" v-if="remind.senderAccount == null || remind.senderAccount == ''">{{t('remindList.60')}}</span>
                                        <router-link tag="a" :to="{path:'/user/control/home',query:{userName:remind.senderUserName}}">
                                            {{remind.senderNickname != null && remind.senderNickname != '' ? remind.senderNickname : remind.senderAccount}}
                                        </router-link>
                                    </cite> 
                                    在
                                     <cite>
                                        <router-link tag="a" :to="{path:'/question',query:{questionId:remind.questionId,answerId:remind.questionAnswerId,replyId:remind.friendQuestionReplyId,reportModule:60}}">
                                            {{remind.questionTitle}}
                                        </router-link>
                                    </cite> 
                                    回复了我的答案 -->
                                    <i18n-t keypath="remindList.200" scope="global">
                                        <template #p1>
                                            <cite>
                                                <!-- 此用户账号已注销 -->
                                                <span class="cancelAccount" v-if="remind.senderAccount == null || remind.senderAccount == ''">{{t('remindList.60')}}</span>
                                                <router-link tag="a" :to="{path:'/user/control/home',query:{userName:remind.senderUserName}}">
                                                    {{remind.senderNickname != null && remind.senderNickname != '' ? remind.senderNickname : remind.senderAccount}}
                                                </router-link>
                                            </cite> 
                                        </template>
                                        <template #p2>
                                            <cite>
                                                <router-link tag="a" :to="{path:'/question',query:{questionId:remind.questionId,answerId:remind.questionAnswerId,replyId:remind.friendQuestionReplyId,reportModule:60}}">
                                                    {{remind.questionTitle}}
                                                </router-link>
                                            </cite> 
                                        </template>
                                    </i18n-t>
                                    <div class="summary">
                                        {{remind.summary}}
                                    </div>
                                </div>
                                <div v-if="remind.typeCode == 150">
                                    <!-- <cite>
                                        此用户账号已注销
                                        <span class="cancelAccount" v-if="remind.senderAccount == null || remind.senderAccount == ''">{{t('remindList.60')}}</span>
                                        <router-link tag="a" :to="{path:'/user/control/home',query:{userName:remind.senderUserName}}">
                                            {{remind.senderNickname != null && remind.senderNickname != '' ? remind.senderNickname : remind.senderAccount}}
                                        </router-link>
                                    </cite> 
                                    在
                                     <cite>
                                        <router-link tag="a" :to="{path:'/question',query:{questionId:remind.questionId,answerId:remind.friendQuestionAnswerId,replyId:remind.friendQuestionReplyId,reportModule:60}}">
                                            {{remind.questionTitle}}
                                        </router-link>
                                    </cite> 
                                    回复了我回复过的答案 -->
                                    <i18n-t keypath="remindList.210" scope="global">
                                        <template #p1>
                                            <cite>
                                                <!-- 此用户账号已注销 -->
                                                <span class="cancelAccount" v-if="remind.senderAccount == null || remind.senderAccount == ''">{{t('remindList.60')}}</span>
                                                <router-link tag="a" :to="{path:'/user/control/home',query:{userName:remind.senderUserName}}">
                                                    {{remind.senderNickname != null && remind.senderNickname != '' ? remind.senderNickname : remind.senderAccount}}
                                                </router-link>
                                            </cite> 
                                        </template>
                                        <template #p2>
                                            <cite>
                                                <router-link tag="a" :to="{path:'/question',query:{questionId:remind.questionId,answerId:remind.friendQuestionAnswerId,replyId:remind.friendQuestionReplyId,reportModule:60}}">
                                                    {{remind.questionTitle}}
                                                </router-link>
                                            </cite> 
                                        </template>
                                    </i18n-t>
                                    <div class="summary">
                                        {{remind.summary}}
                                    </div>
                                </div>
                                <div v-if="remind.typeCode == 160">
                                    <!-- <cite>
                                        此用户账号已注销
                                        <span class="cancelAccount" v-if="remind.senderAccount == null || remind.senderAccount == ''">{{t('remindList.60')}}</span>
                                        <router-link tag="a" :to="{path:'/user/control/home',query:{userName:remind.senderUserName}}">
                                            {{remind.senderNickname != null && remind.senderNickname != '' ? remind.senderNickname : remind.senderAccount}}
                                        </router-link>
                                    </cite> 
                                    在
                                     <cite>
                                        <router-link tag="a" :to="{path:'/question',query:{questionId:remind.questionId,answerId:remind.friendQuestionAnswerId,replyId:remind.friendQuestionReplyId,reportModule:60}}">
                                            {{remind.questionTitle}}
                                        </router-link>
                                    </cite> 
                                    回复了我的答案回复 -->
                                    <i18n-t keypath="remindList.220" scope="global">
                                        <template #p1>
                                            <cite>
                                                <!-- 此用户账号已注销 -->
                                                <span class="cancelAccount" v-if="remind.senderAccount == null || remind.senderAccount == ''">{{t('remindList.60')}}</span>
                                                <router-link tag="a" :to="{path:'/user/control/home',query:{userName:remind.senderUserName}}">
                                                    {{remind.senderNickname != null && remind.senderNickname != '' ? remind.senderNickname : remind.senderAccount}}
                                                </router-link>
                                            </cite> 
                                        </template>
                                        <template #p2>
                                            <cite>
                                                <router-link tag="a" :to="{path:'/question',query:{questionId:remind.questionId,answerId:remind.friendQuestionAnswerId,replyId:remind.friendQuestionReplyId,reportModule:60}}">
                                                    {{remind.questionTitle}}
                                                </router-link>
                                            </cite> 
                                        </template>
                                    </i18n-t>
                                    <div class="summary">
                                        {{remind.summary}}
                                    </div>
                                </div>
                                <div v-if="remind.typeCode == 170">
                                    <!-- 我关注的
                                    <cite>
                                        此用户账号已注销
                                        <span class="cancelAccount" v-if="remind.senderAccount == null || remind.senderAccount == ''">{{t('remindList.60')}}</span>
                                        <router-link tag="a" :to="{path:'/user/control/home',query:{userName:remind.senderUserName}}">
                                            {{remind.senderNickname != null && remind.senderNickname != '' ? remind.senderNickname : remind.senderAccount}}
                                        </router-link>
                                    </cite> 
                                    提了问题
                                    <cite>
                                        <router-link tag="a" :to="{path:'/question',query:{questionId:remind.questionId}}">
                                            {{remind.questionTitle}}
                                        </router-link>
                                    </cite> -->
                                    <i18n-t keypath="remindList.230" scope="global">
                                        <template #p1>
                                            <cite>
                                                <!-- 此用户账号已注销 -->
                                                <span class="cancelAccount" v-if="remind.senderAccount == null || remind.senderAccount == ''">{{t('remindList.60')}}</span>
                                                <router-link tag="a" :to="{path:'/user/control/home',query:{userName:remind.senderUserName}}">
                                                    {{remind.senderNickname != null && remind.senderNickname != '' ? remind.senderNickname : remind.senderAccount}}
                                                </router-link>
                                            </cite> 
                                        </template>
                                        <template #p2>
                                            <cite>
                                                <router-link tag="a" :to="{path:'/question',query:{questionId:remind.questionId}}">
                                                    {{remind.questionTitle}}
                                                </router-link>
                                            </cite> 
                                        </template>
                                    </i18n-t>
                                    <div class="summary">
                                        {{remind.summary}}
                                    </div>
                                </div>
                                <div v-if="remind.typeCode == 180">
                                    <!-- 我关注的
                                    <cite>
                                        此用户账号已注销
                                        <span class="cancelAccount" v-if="remind.senderAccount == null || remind.senderAccount == ''">{{t('remindList.60')}}</span>
                                        <router-link tag="a" :to="{path:'/user/control/home',query:{userName:remind.senderUserName}}">
                                            {{remind.senderNickname != null && remind.senderNickname != '' ? remind.senderNickname : remind.senderAccount}}
                                        </router-link>
                                    </cite> 
                                    在
                                     <cite>
                                        <router-link tag="a" :to="{path:'/question',query:{questionId:remind.questionId,answerId:remind.friendQuestionAnswerId,reportModule:50}}">
                                            {{remind.questionTitle}}
                                        </router-link>
                                    </cite> 
                                    回答了问题 -->
                                    <i18n-t keypath="remindList.240" scope="global">
                                        <template #p1>
                                            <cite>
                                                <!-- 此用户账号已注销 -->
                                                <span class="cancelAccount" v-if="remind.senderAccount == null || remind.senderAccount == ''">{{t('remindList.60')}}</span>
                                                <router-link tag="a" :to="{path:'/user/control/home',query:{userName:remind.senderUserName}}">
                                                    {{remind.senderNickname != null && remind.senderNickname != '' ? remind.senderNickname : remind.senderAccount}}
                                                </router-link>
                                            </cite> 
                                        </template>
                                        <template #p2>
                                            <cite>
                                                <router-link tag="a" :to="{path:'/question',query:{questionId:remind.questionId,answerId:remind.friendQuestionAnswerId,reportModule:50}}">
                                                    {{remind.questionTitle}}
                                                </router-link>
                                            </cite> 
                                        </template>
                                    </i18n-t>
                                    <div class="summary">
                                        {{remind.summary}}
                                    </div>
                                </div>
                                <div v-if="remind.typeCode == 190">
                                    <!-- 我关注的
                                    <cite>
                                        此用户账号已注销
                                        <span class="cancelAccount" v-if="remind.senderAccount == null || remind.senderAccount == ''">{{t('remindList.60')}}</span>
                                        <router-link tag="a" :to="{path:'/user/control/home',query:{userName:remind.senderUserName}}">
                                            {{remind.senderNickname != null && remind.senderNickname != '' ? remind.senderNickname : remind.senderAccount}}
                                        </router-link>
                                    </cite> 
                                    在
                                     <cite>
                                        <router-link tag="a" :to="{path:'/question',query:{questionId:remind.questionId,answerId:remind.friendQuestionAnswerId,replyId:remind.friendQuestionReplyId,reportModule:60}}">
                                            {{remind.questionTitle}}
                                        </router-link>
                                    </cite> 
                                    发表了答案回复 -->
                                    <i18n-t keypath="remindList.250" scope="global">
                                        <template #p1>
                                            <cite>
                                                <!-- 此用户账号已注销 -->
                                                <span class="cancelAccount" v-if="remind.senderAccount == null || remind.senderAccount == ''">{{t('remindList.60')}}</span>
                                                <router-link tag="a" :to="{path:'/user/control/home',query:{userName:remind.senderUserName}}">
                                                    {{remind.senderNickname != null && remind.senderNickname != '' ? remind.senderNickname : remind.senderAccount}}
                                                </router-link>
                                            </cite> 
                                        </template>
                                        <template #p2>
                                            <cite>
                                                <router-link tag="a" :to="{path:'/question',query:{questionId:remind.questionId,answerId:remind.friendQuestionAnswerId,replyId:remind.friendQuestionReplyId,reportModule:60}}">
                                                    {{remind.questionTitle}}
                                                </router-link>
                                            </cite> 
                                        </template>
                                    </i18n-t>
                                    <div class="summary">
                                        {{remind.summary}}
                                    </div>
                                </div>
                                <div v-if="remind.typeCode == 200">
                                    <!-- <cite>
                                        此用户账号已注销
                                        <span class="cancelAccount" v-if="remind.senderAccount == null || remind.senderAccount == ''">{{t('remindList.60')}}</span>
                                        <router-link tag="a" :to="{path:'/user/control/home',query:{userName:remind.senderUserName}}">
                                            {{remind.senderNickname != null && remind.senderNickname != '' ? remind.senderNickname : remind.senderAccount}}
                                        </router-link>
                                    </cite> 
                                    在话题
                                    <cite>
                                        <router-link tag="a" :to="{path:'/thread',query:{topicId:remind.topicId}}">
                                            {{remind.topicTitle}}
                                        </router-link>
                                    </cite> 
                                    提到我 -->
                                    <i18n-t keypath="remindList.260" scope="global">
                                        <template #p1>
                                            <cite>
                                                <!-- 此用户账号已注销 -->
                                                <span class="cancelAccount" v-if="remind.senderAccount == null || remind.senderAccount == ''">{{t('remindList.60')}}</span>
                                                <router-link tag="a" :to="{path:'/user/control/home',query:{userName:remind.senderUserName}}">
                                                    {{remind.senderNickname != null && remind.senderNickname != '' ? remind.senderNickname : remind.senderAccount}}
                                                </router-link>
                                            </cite> 
                                        </template>
                                        <template #p2>
                                            <cite>
                                                <router-link tag="a" :to="{path:'/thread',query:{topicId:remind.topicId}}">
                                                    {{remind.topicTitle}}
                                                </router-link>
                                            </cite> 
                                        </template>
                                    </i18n-t>
                                    <div class="summary">
                                        {{remind.summary}}
                                    </div>
                                </div>
                                <div v-if="remind.typeCode == 210">
                                    <!--<cite>
                                         此用户账号已注销
                                        <span class="cancelAccount" v-if="remind.senderAccount == null || remind.senderAccount == ''">{{t('remindList.60')}}</span>
                                        <router-link tag="a" :to="{path:'/user/control/home',query:{userName:remind.senderUserName}}">
                                            {{remind.senderNickname != null && remind.senderNickname != '' ? remind.senderNickname : remind.senderAccount}}
                                        </router-link>
                                    </cite> 
                                    在评论
                                    <cite>
                                        <router-link tag="a" :to="{path:'/thread',query:{topicId:remind.topicId,commentId:remind.friendTopicCommentId,reportModule:20}}">
                                            {{remind.topicTitle}}
                                        </router-link>
                                    </cite> 
                                    提到我 -->
                                    <i18n-t keypath="remindList.270" scope="global">
                                        <template #p1>
                                            <cite>
                                                <!-- 此用户账号已注销 -->
                                                <span class="cancelAccount" v-if="remind.senderAccount == null || remind.senderAccount == ''">{{t('remindList.60')}}</span>
                                                <router-link tag="a" :to="{path:'/user/control/home',query:{userName:remind.senderUserName}}">
                                                    {{remind.senderNickname != null && remind.senderNickname != '' ? remind.senderNickname : remind.senderAccount}}
                                                </router-link>
                                            </cite> 
                                        </template>
                                        <template #p2>
                                            <cite>
                                                <router-link tag="a" :to="{path:'/thread',query:{topicId:remind.topicId,commentId:remind.friendTopicCommentId,reportModule:20}}">
                                                    {{remind.topicTitle}}
                                                </router-link>
                                            </cite> 
                                        </template>
                                    </i18n-t>
                                    <div class="summary">
                                        {{remind.summary}}
                                    </div>
                                </div>
                                <div v-if="remind.typeCode == 220">
                                    <!-- <cite>
                                        此用户账号已注销
                                        <span class="cancelAccount" v-if="remind.senderAccount == null || remind.senderAccount == ''">{{t('remindList.60')}}</span>
                                        <router-link tag="a" :to="{path:'/user/control/home',query:{userName:remind.senderUserName}}">
                                            {{remind.senderNickname != null && remind.senderNickname != '' ? remind.senderNickname : remind.senderAccount}}
                                        </router-link>
                                    </cite> 
                                    在评论回复
                                    <cite>
                                        <router-link tag="a" :to="{path:'/thread',query:{topicId:remind.topicId,commentId:remind.friendTopicCommentId,replyId:remind.friendTopicReplyId,reportModule:30}}">
                                            {{remind.topicTitle}}
                                        </router-link>
                                    </cite> 
                                    提到我 -->
                                    <i18n-t keypath="remindList.280" scope="global">
                                        <template #p1>
                                            <cite>
                                                <!-- 此用户账号已注销 -->
                                                <span class="cancelAccount" v-if="remind.senderAccount == null || remind.senderAccount == ''">{{t('remindList.60')}}</span>
                                                <router-link tag="a" :to="{path:'/user/control/home',query:{userName:remind.senderUserName}}">
                                                    {{remind.senderNickname != null && remind.senderNickname != '' ? remind.senderNickname : remind.senderAccount}}
                                                </router-link>
                                            </cite> 
                                        </template>
                                        <template #p2>
                                            <cite>
                                                <router-link tag="a" :to="{path:'/thread',query:{topicId:remind.topicId,commentId:remind.friendTopicCommentId,replyId:remind.friendTopicReplyId,reportModule:30}}">
                                                    {{remind.topicTitle}}
                                                </router-link>
                                            </cite> 
                                        </template>
                                    </i18n-t>
                                    <div class="summary">
                                        {{remind.summary}}
                                    </div>
                                </div>
                                <div v-if="remind.typeCode == 230">
                                    <!-- <cite>
                                        此用户账号已注销
                                        <span class="cancelAccount" v-if="remind.senderAccount == null || remind.senderAccount == ''">{{t('remindList.60')}}</span>
                                        <router-link tag="a" :to="{path:'/user/control/home',query:{userName:remind.senderUserName}}">
                                            {{remind.senderNickname != null && remind.senderNickname != '' ? remind.senderNickname : remind.senderAccount}}
                                        </router-link>
                                    </cite> 
                                    在问题
                                    <cite>
                                        <router-link tag="a" :to="{path:'/question',query:{questionId:remind.questionId}}">
                                            {{remind.questionTitle}}
                                        </router-link>
                                    </cite>
                                    提到我 -->
                                    <i18n-t keypath="remindList.290" scope="global">
                                        <template #p1>
                                            <cite>
                                                <!-- 此用户账号已注销 -->
                                                <span class="cancelAccount" v-if="remind.senderAccount == null || remind.senderAccount == ''">{{t('remindList.60')}}</span>
                                                <router-link tag="a" :to="{path:'/user/control/home',query:{userName:remind.senderUserName}}">
                                                    {{remind.senderNickname != null && remind.senderNickname != '' ? remind.senderNickname : remind.senderAccount}}
                                                </router-link>
                                            </cite> 
                                        </template>
                                        <template #p2>
                                            <cite>
                                                <router-link tag="a" :to="{path:'/question',query:{questionId:remind.questionId}}">
                                                    {{remind.questionTitle}}
                                                </router-link>
                                            </cite> 
                                        </template>
                                    </i18n-t>
                                    <div class="summary">
                                        {{remind.summary}}
                                    </div>
                                </div>
                                <div v-if="remind.typeCode == 240">
                                    <!-- <cite>
                                        此用户账号已注销
                                        <span class="cancelAccount" v-if="remind.senderAccount == null || remind.senderAccount == ''">{{t('remindList.60')}}</span>
                                        <router-link tag="a" :to="{path:'/user/control/home',query:{userName:remind.senderUserName}}">
                                            {{remind.senderNickname != null && remind.senderNickname != '' ? remind.senderNickname : remind.senderAccount}}
                                        </router-link>
                                    </cite> 
                                    在答案
                                     <cite>
                                        <router-link tag="a" :to="{path:'/question',query:{questionId:remind.questionId,answerId:remind.friendQuestionAnswerId,reportModule:50}}">
                                            {{remind.questionTitle}}
                                        </router-link>
                                    </cite> 
                                    提到我 -->
                                    <i18n-t keypath="remindList.300" scope="global">
                                        <template #p1>
                                            <cite>
                                                <!-- 此用户账号已注销 -->
                                                <span class="cancelAccount" v-if="remind.senderAccount == null || remind.senderAccount == ''">{{t('remindList.60')}}</span>
                                                <router-link tag="a" :to="{path:'/user/control/home',query:{userName:remind.senderUserName}}">
                                                    {{remind.senderNickname != null && remind.senderNickname != '' ? remind.senderNickname : remind.senderAccount}}
                                                </router-link>
                                            </cite> 
                                        </template>
                                        <template #p2>
                                            <cite>
                                                <router-link tag="a" :to="{path:'/question',query:{questionId:remind.questionId,answerId:remind.friendQuestionAnswerId,reportModule:50}}">
                                                    {{remind.questionTitle}}
                                                </router-link>
                                            </cite> 
                                        </template>
                                    </i18n-t>
                                    <div class="summary">
                                        {{remind.summary}}
                                    </div>
                                </div>
                                <div v-if="remind.typeCode == 250">
                                    <!-- <cite>
                                        此用户账号已注销
                                        <span class="cancelAccount" v-if="remind.senderAccount == null || remind.senderAccount == ''">{{t('remindList.60')}}</span>
                                        <router-link tag="a" :to="{path:'/user/control/home',query:{userName:remind.senderUserName}}">
                                            {{remind.senderNickname != null && remind.senderNickname != '' ? remind.senderNickname : remind.senderAccount}}
                                        </router-link>
                                    </cite> 
                                    在答案回复
                                     <cite>
                                        <router-link tag="a" :to="{path:'/question',query:{questionId:remind.questionId,answerId:remind.friendQuestionAnswerId,replyId:remind.friendQuestionReplyId,reportModule:60}}">
                                            {{remind.questionTitle}}
                                        </router-link>
                                    </cite> 
                                    提到我 -->
                                    <i18n-t keypath="remindList.310" scope="global">
                                        <template #p1>
                                            <cite>
                                                <!-- 此用户账号已注销 -->
                                                <span class="cancelAccount" v-if="remind.senderAccount == null || remind.senderAccount == ''">{{t('remindList.60')}}</span>
                                                <router-link tag="a" :to="{path:'/user/control/home',query:{userName:remind.senderUserName}}">
                                                    {{remind.senderNickname != null && remind.senderNickname != '' ? remind.senderNickname : remind.senderAccount}}
                                                </router-link>
                                            </cite> 
                                        </template>
                                        <template #p2>
                                            <cite>
                                                <router-link tag="a" :to="{path:'/question',query:{questionId:remind.questionId,answerId:remind.friendQuestionAnswerId,replyId:remind.friendQuestionReplyId,reportModule:60}}">
                                                    {{remind.questionTitle}}
                                                </router-link>
                                            </cite> 
                                        </template>
                                    </i18n-t>
                                    <div class="summary">
                                        {{remind.summary}}
                                    </div>
                                </div>
                                <div v-if="remind.typeCode == 260">
                                    <!-- <cite>
                                        此用户账号已注销
                                        <span class="cancelAccount" v-if="remind.senderAccount == null || remind.senderAccount == ''">{{t('remindList.60')}}</span>
                                        <router-link tag="a" :to="{path:'/user/control/home',query:{userName:remind.senderUserName}}">
                                            {{remind.senderNickname != null && remind.senderNickname != '' ? remind.senderNickname : remind.senderAccount}}
                                        </router-link>
                                    </cite> 
                                    在
                                     <cite>
                                        <router-link tag="a" :to="{path:'/thread',query:{topicId:remind.topicId,commentId:remind.topicCommentId,reportModule:20}}">
                                            {{remind.topicTitle}}
                                        </router-link>
                                    </cite> 
                                    赞了我的评论 -->
                                    <i18n-t keypath="remindList.320" scope="global">
                                        <template #p1>
                                            <cite>
                                                <!-- 此用户账号已注销 -->
                                                <span class="cancelAccount" v-if="remind.senderAccount == null || remind.senderAccount == ''">{{t('remindList.60')}}</span>
                                                <router-link tag="a" :to="{path:'/user/control/home',query:{userName:remind.senderUserName}}">
                                                    {{remind.senderNickname != null && remind.senderNickname != '' ? remind.senderNickname : remind.senderAccount}}
                                                </router-link>
                                            </cite> 
                                        </template>
                                        <template #p2>
                                            <cite>
                                                <router-link tag="a" :to="{path:'/thread',query:{topicId:remind.topicId,commentId:remind.topicCommentId,reportModule:20}}">
                                                    {{remind.topicTitle}}
                                                </router-link>
                                            </cite> 
                                        </template>
                                    </i18n-t>
                                    <div class="summary">
                                        {{remind.summary}}
                                    </div>
                                </div>
                                <div v-if="remind.typeCode == 270">
                                    <!-- <cite>
                                        此用户账号已注销
                                        <span class="cancelAccount" v-if="remind.senderAccount == null || remind.senderAccount == ''">{{t('remindList.60')}}</span>
                                        <router-link tag="a" :to="{path:'/user/control/home',query:{userName:remind.senderUserName}}">
                                            {{remind.senderNickname != null && remind.senderNickname != '' ? remind.senderNickname : remind.senderAccount}}
                                        </router-link>
                                    </cite> 
                                    在
                                    <cite>
                                        <router-link tag="a" :to="{path:'/thread',query:{topicId:remind.topicId,commentId:remind.topicCommentId,replyId:remind.topicReplyId,reportModule:30}}">
                                            {{remind.topicTitle}}
                                        </router-link>
                                    </cite> 
                                    赞了我的评论回复 -->
                                    <i18n-t keypath="remindList.330" scope="global">
                                        <template #p1>
                                            <cite>
                                                <!-- 此用户账号已注销 -->
                                                <span class="cancelAccount" v-if="remind.senderAccount == null || remind.senderAccount == ''">{{t('remindList.60')}}</span>
                                                <router-link tag="a" :to="{path:'/user/control/home',query:{userName:remind.senderUserName}}">
                                                    {{remind.senderNickname != null && remind.senderNickname != '' ? remind.senderNickname : remind.senderAccount}}
                                                </router-link>
                                            </cite> 
                                        </template>
                                        <template #p2>
                                            <cite>
                                                <router-link tag="a" :to="{path:'/thread',query:{topicId:remind.topicId,commentId:remind.topicCommentId,replyId:remind.topicReplyId,reportModule:30}}">
                                                    {{remind.topicTitle}}
                                                </router-link>
                                            </cite> 
                                        </template>
                                    </i18n-t>
                                    <div class="summary">
                                        {{remind.summary}}
                                    </div>
                                </div>
                                <div v-if="remind.typeCode == 280">
                                    <!-- <cite>
                                        此用户账号已注销
                                        <span class="cancelAccount" v-if="remind.senderAccount == null || remind.senderAccount == ''">{{t('remindList.60')}}</span>
                                        <router-link tag="a" :to="{path:'/user/control/home',query:{userName:remind.senderUserName}}">
                                            {{remind.senderNickname != null && remind.senderNickname != '' ? remind.senderNickname : remind.senderAccount}}
                                        </router-link>
                                    </cite> 
                                    在
                                    <cite>
                                        <router-link tag="a" :to="{path:'/question',query:{questionId:remind.questionId}}">
                                            {{remind.questionTitle}}
                                        </router-link>
                                    </cite> 
                                    赞了我的问题 -->
                                    <i18n-t keypath="remindList.340" scope="global">
                                        <template #p1>
                                            <cite>
                                                <!-- 此用户账号已注销 -->
                                                <span class="cancelAccount" v-if="remind.senderAccount == null || remind.senderAccount == ''">{{t('remindList.60')}}</span>
                                                <router-link tag="a" :to="{path:'/user/control/home',query:{userName:remind.senderUserName}}">
                                                    {{remind.senderNickname != null && remind.senderNickname != '' ? remind.senderNickname : remind.senderAccount}}
                                                </router-link>
                                            </cite> 
                                        </template>
                                        <template #p2>
                                            <cite>
                                                <router-link tag="a" :to="{path:'/question',query:{questionId:remind.questionId}}">
                                                    {{remind.questionTitle}}
                                                </router-link>
                                            </cite> 
                                        </template>
                                    </i18n-t>
                                    <div class="summary">
                                        {{remind.summary}}
                                    </div>
                                </div>
                                <div v-if="remind.typeCode == 290">
                                    <!-- <cite>
                                        此用户账号已注销
                                        <span class="cancelAccount" v-if="remind.senderAccount == null || remind.senderAccount == ''">{{t('remindList.60')}}</span>
                                        <router-link tag="a" :to="{path:'/user/control/home',query:{userName:remind.senderUserName}}">
                                            {{remind.senderNickname != null && remind.senderNickname != '' ? remind.senderNickname : remind.senderAccount}}
                                        </router-link>
                                    </cite> 
                                    在
                                     <cite>
                                        <router-link tag="a" :to="{path:'/question',query:{questionId:remind.questionId,answerId:remind.questionAnswerId,reportModule:50}}">
                                            {{remind.questionTitle}}
                                        </router-link>
                                    </cite> 
                                    赞了我的答案 -->
                                    <i18n-t keypath="remindList.350" scope="global">
                                        <template #p1>
                                            <cite>
                                                <!-- 此用户账号已注销 -->
                                                <span class="cancelAccount" v-if="remind.senderAccount == null || remind.senderAccount == ''">{{t('remindList.60')}}</span>
                                                <router-link tag="a" :to="{path:'/user/control/home',query:{userName:remind.senderUserName}}">
                                                    {{remind.senderNickname != null && remind.senderNickname != '' ? remind.senderNickname : remind.senderAccount}}
                                                </router-link>
                                            </cite> 
                                        </template>
                                        <template #p2>
                                            <cite>
                                                <router-link tag="a" :to="{path:'/question',query:{questionId:remind.questionId,answerId:remind.questionAnswerId,reportModule:50}}">
                                                {{remind.questionTitle}}
                                            </router-link>
                                            </cite> 
                                        </template>
                                    </i18n-t>
                                    <div class="summary">
                                        {{remind.summary}}
                                    </div>
                                </div>
                                <div v-if="remind.typeCode == 300">
                                    <!-- <cite>
                                        此用户账号已注销
                                        <span class="cancelAccount" v-if="remind.senderAccount == null || remind.senderAccount == ''">{{t('remindList.60')}}</span>
                                        <router-link tag="a" :to="{path:'/user/control/home',query:{userName:remind.senderUserName}}">
                                            {{remind.senderNickname != null && remind.senderNickname != '' ? remind.senderNickname : remind.senderAccount}}
                                        </router-link>
                                    </cite> 
                                    在
                                    <cite>
                                        <router-link tag="a" :to="{path:'/question',query:{questionId:remind.questionId,answerId:remind.questionAnswerId,replyId:remind.questionReplyId,reportModule:60}}">
                                            {{remind.questionTitle}}
                                        </router-link>
                                    </cite> 
                                    赞了我的答案回复 -->
                                    <i18n-t keypath="remindList.360" scope="global">
                                        <template #p1>
                                            <cite>
                                                <!-- 此用户账号已注销 -->
                                                <span class="cancelAccount" v-if="remind.senderAccount == null || remind.senderAccount == ''">{{t('remindList.60')}}</span>
                                                <router-link tag="a" :to="{path:'/user/control/home',query:{userName:remind.senderUserName}}">
                                                    {{remind.senderNickname != null && remind.senderNickname != '' ? remind.senderNickname : remind.senderAccount}}
                                                </router-link>
                                            </cite> 
                                        </template>
                                        <template #p2>
                                            <cite>
                                                <router-link tag="a" :to="{path:'/question',query:{questionId:remind.questionId,answerId:remind.questionAnswerId,replyId:remind.questionReplyId,reportModule:60}}">
                                                    {{remind.questionTitle}}
                                                </router-link>
                                            </cite> 
                                        </template>
                                    </i18n-t>
                                    <div class="summary">
                                        {{remind.summary}}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </van-list>
                
                <van-skeleton :row="3" :loading="state.isSkeleton" class="skeleton"/>
            </div>
        </van-pull-refresh>
        </div>
    </div>
</template>


<script lang="ts" setup>
    import { getCurrentInstance, ComponentInternalInstance, reactive, onMounted, watchEffect, onActivated} from 'vue'
    import pinia from '@/store/store'
    import {useStore} from '@/store'
    import { storeToRefs } from 'pinia';
    import { onBack } from '@/utils/history'
    import { convertViewportWidth } from '@/utils/px-to-viewport';
    import {useRouter } from 'vue-router'
    import { AxiosResponse } from 'axios'
    import { PageView, Remind } from "@/types/index";
    import { letterAvatar } from '@/utils/letterAvatar';
    import { Dialog, Notify } from 'vant';
    import { processErrorInfo } from '@/utils/tool';
    import { useI18n } from 'vue-i18n';
    let { t } = useI18n();
    const { proxy } = getCurrentInstance() as ComponentInternalInstance;
    const store = useStore(pinia);
    const router = useRouter();
    const {title:store_title,keywords:store_keywords,description:store_description,systemUser:store_systemUser} = storeToRefs(store)
 
    
    //html页元信息
    watchEffect(() => {
        let titleValue = store_title.value//监听网站标题
        if(titleValue != null && titleValue != ''){
            document.title = t('remindList.10')+' - ' + titleValue;//提醒列表
        }
    }, {
        flush: 'post'//在组件更新后触发，第一次运行需要组件渲染完成才执行
    })


    const state = reactive({
        remindList:[] as Array<Remind>,
        totalrecord : 0, //总记录数
		currentpage : 0, //当前页码
        totalpage : 1, //总页数
        maxresult: 12, //每页显示记录数     

        isRefreshing:false,//是否处于下拉加载中状态
        isError:false,//是否列表数据加载失败
        isLoading:false,//是否处于加载中状态
        isFinished:false,//是否加载完毕
        isSkeleton:true,//是否显示骨架屏
        isShowPage:false//是否显示分页
    });
    //错误
    const error = reactive({})
    

    //下拉刷新时触发
    const onRefresh = () => {
        state.isRefreshing = false;

        state.remindList.length = 0;
        state.totalrecord = 0; //总记录数
		state.currentpage = 0; //当前页码
        state.totalpage = 1; //总页数
        state.maxresult = 12; //每页显示记录数    
        state.isError = false;//是否列表数据加载失败
        state.isFinished = false; 

        state.isLoading = true;//手动触发查询数据需将'加载状态结束'设为true
        queryRemindList(state.currentpage+1);
    };
    //加载列表
    const onLoad = () => {
        queryRemindList(state.currentpage+1);
    }

    //查询提醒列表
    const queryRemindList = (page: number) => {
        proxy?.$axios({
            url: '/user/control/remindList',
            method: 'get',
            params:  { 
                page: page
            },
            showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
            showErrorMessage:false,// 是否显示错误提示
        })
        .then((response: AxiosResponse) => {
            return response?.data
        })
        .then((data: PageView<Remind>) => {
            if(data){
                state.isSkeleton = false;//关闭骨架屏


                if(data.records != null && data.records.length >0){
                    for(let i:number=0; i<data.records.length; i++){
                        let remind = data.records[i];
                        if(remind.senderNickname != null && remind.senderNickname !=''){
                            remind.senderAvatar = letterAvatar(remind.senderNickname, 64);
                        }else{
                            remind.senderAvatar = letterAvatar(remind.senderAccount, 64);
                        }

                    }
                }

                state.remindList.push.apply(state.remindList,data.records)

                state.totalrecord = parseInt(data.totalrecord);//服务器返回的long类型已转为String类型
                state.currentpage = data.currentpage;
                state.totalpage = parseInt(data.totalpage);//服务器返回的long类型已转为String类型
                state.maxresult = data.maxresult;

                state.isShowPage = true;//显示分页栏
                if(state.totalpage == 0 || state.totalpage == page){//如果没有内容或是最后一页，则不再加载
                    state.isFinished = true;
                }
                state.isLoading = false;//加载状态结束
            }
            
        })
        .catch((error: any) =>{
            state.isError = true;
            state.isLoading = false;//加载状态结束
            console.log(error);
        });
    }

   //删除提醒
   const onDelete = (remindId: string) => {
        Dialog.confirm({
            message:t('remindList.370'),//是否确定删除该项？
        })
        .then(() => {
            deleteRemind(remindId);
        })
        .catch(() => {
            // on cancel
        });
    }

    //处理删除
    const deleteRemind = (remindId: string) => {
        proxy?.$axios({
            url: '/user/control/deleteRemind',
            method: 'post',
            params:  { 
                remindId: remindId
            },
        })
        .then((response: AxiosResponse) => {
            if(response){
                const result: any = response.data;
                    
                if(JSON.parse(result.success)){//成功
                    for(let i=0; i<state.remindList.length; i++){
                        let remind = state.remindList[i];
                        if(remind.id == remindId){
                            state.remindList.splice(i, 1);//删除
                            break;
                        }
                    }
                    Notify({ 
                        type: 'success', 
                        message: t('remindList.380')//删除成功
                    });


                }else{
                    //处理错误信息
                    processErrorInfo(result.error as Map<string,string> , error,()=>{});
                }
            }
            
        })
        .catch((error: any) =>{
            console.log(error);
        });
    }

    onMounted(() => {
        //设置缓存
        store.setCacheComponents(String(router.currentRoute.value.name))
    })

    //进入keep-alive组件时触发
    onActivated(()=>{
        //后退时修改浏览器标题
        let titleValue = store_title.value
        if(titleValue != null && titleValue != ''){
            document.title = t('remindList.10')+' - ' + titleValue;//提醒列表
        }
    })
</script>

<style scoped lang="scss">
.remindListModule{
    margin: var(--van-cell-group-inset-padding);
    border-radius: var(--van-border-radius-lg);
    background: #fff;
    
    .item{
        margin-left: 8px;
        margin-right: 8px;
        padding: 8px 0px 8px 0px;

        .top-container{
            display: flex;
           // flex-wrap: wrap;
           .left-layout{
                flex: 1;
                display: block;
             //   box-sizing: border-box;
                min-height: 1px;

                .userInfo{
                    display: flex; 
                    align-items: center;
                    .cancelAccount{
                        display: inline-block;
                        vertical-align: middle;
                        padding: 4px 4px;
                        font-size: 12px;
                        line-height: 12px;
                        -webkit-border-radius: 2px;
                        -moz-border-radius: 2px;
                        border-radius: 2px;
                        color: var(--van-gray-5);
                        background-color: var(--van-gray-1);
                        position: relative;
                        top: -9px;
                    }
                    .avatarImg{
                        img {
                            width: 40px;
                            height: 40px;
                            margin-right: 10px;
                            border-radius:40px;
                            vertical-align: middle;
                        }
                    }
                    .account{
                        color: var(--van-gray-7);
                        position: relative;
                        top: -9px;
                    }  
                }
                .time{
                    color: var(--van-gray-6);
                    margin-left: 50px;
                    position: relative;
                    font-size: 12px;
                    top: -15px;
                }
            }
            .right-layout{
              //  box-sizing: border-box;
                min-height: 1px;
                color: var(--van-gray-6);
                text-align: right;
                .status{
                    margin-right: 10px;
                }
                .alreadyRead{
                    color: #009A29;
                }
                .more{
                    position: relative;
                    top: 3px;
                    color: var(--van-gray-6);
                }
            }

        }
        .bottom-container{
            margin-top: 5px;
            margin-bottom: 5px;
            display: flex;
            .content{
                word-wrap:break-word;
                color: var(--van-gray-8);
                line-height: 26px;
                font-size: 14px;
                cite{
                    font-style:normal;
                    font-size: 14px;
                    a{
                        color: var(--van-blue);
                    }
                }
                .summary{
                    margin-top: 8px;
                    word-break: break-all;
                    color: var(--van-gray-6);
                }
                .cancelAccount{
                    display: inline-block;
                    vertical-align: middle;
                    padding: 4px 4px;
                    font-size: 14px;
                    line-height: 14px;
                    -webkit-border-radius: 2px;
                    -moz-border-radius: 2px;
                    border-radius: 2px;
                    color: var(--van-gray-5);
                    background-color: var(--van-gray-1);
                }
            }
            
        }
        
    }
    .skeleton{
        padding-top: 16px;
        padding-bottom: 16px;
    }
}

</style>
