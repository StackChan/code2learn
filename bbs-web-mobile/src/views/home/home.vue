<!-- 用户中心页 -->
<template>
    <div class="main">
        <div class="main-container">
            <!-- 占位播放器 -->
            <div ref ="placeholderVideo" style="width: 0px;height: 0px;"></div>
            <!-- success-text="刷新成功" -->
            <van-pull-refresh v-model="state.isRefreshing" :success-text="t('common.130')" pull-distance="200" :disabled="updateAvatarVisible" @refresh="onRefresh" style="min-height: 50vh;">

                <div class="homeModule">
                    <div class="homeHeader" v-if="state.user != null && Object.keys(state.user).length>0">
                        <div class="user">

                            <i class="avatar" v-if="state.user.avatarName == null || state.user.avatarName == ''"><Icon name="user2" :size="convertViewportWidth('74px')" class="icon" /></i>
                            <i class="avatarImg" v-if="state.user.avatarName != null && state.user.avatarName != ''"><img :src="state.avatar"></i>
                            <p class="userName">{{state.user.account}} <i class="userRoleName" v-for="(roleName,index) in state.user.userRoleNameList" >{{roleName}}</i></p>
                            <p class="nickname" v-if="state.user.nickname != null && state.user.nickname != ''">{{state.user.nickname}}</p>
                            <p class="grade" v-if="state.user.gradeName != null">{{state.user.gradeName}}</p>
                            <!-- 官方人员 -->
                            <p class="staff" v-if="state.user.id == '-1'">{{t('home.10')}}</p>
                            <p class="ipAddress" v-if="state.user.ipAddress != null && state.user.ipAddress != ''">
                                <Icon name="map-pin-line" :size="convertViewportWidth('14px')" class="icon"/>
                                <span class="ipAddressText">{{state.user.ipAddress}}</span>
                            </p>

                            <span class="privateMessageBox" v-if="state.user.userName != null && state.user.userName != store_systemUser.userName ">
                                <div class="followButton" @click="addFollow(state.user.userName)">{{state.followText}}</div>


                                <!-- 发私信-->
                                <router-link class="privateMessageButton" tag="div" :to="{path: '/user/control/privateMessageChatList', query: {friendUserName: state.user.userName}}">
                                    {{t('home.20')}}
                                </router-link>
                            </span>

                        </div>
                        <div class="setting" v-if="state.user.userName == store_systemUser.userName"><Icon name="settings" :size="convertViewportWidth('20px')" class="icon" @click="displayUserSetting"/></div>
                        <div class="quickTag" v-if="state.user.userName == store_systemUser.userName">
                            <div class="quickTag-container">
                                <span class="item"><i class="total">{{state.user.point}}</i>{{t('home.30')}}</span><!-- 积分-->
                                <span class="item"><i class="total">{{state.followerCount}}</i>{{t('home.40')}}</span><!-- 粉丝-->
                            </div>
                        </div>
                    </div>
                    <van-popup v-model:show="state.popup_userSetting" position="right" :style="{height: '100%',width: '40%' }" >
                        <div class="userSettingInfo">
                            <ul>
                                <li>
                                    <van-cell to="/user/control/editUser">
                                        <template #icon>
                                            <Icon name="pencil-alt" :size="convertViewportWidth('18px')" class="icon"/>
                                        </template>
                                        <template #title>
                                            <!-- 修改个人信息-->
                                            <span class="custom-title">{{t('home.50')}}</span>
                                        </template>
                                    </van-cell>
                                </li>
                                <li>
                                    <van-cell @click="updateAvatarVisible = true">
                                        <template #icon>
                                            <Icon name="user2" :size="convertViewportWidth('18px')" class="icon"/>
                                        </template>
                                        <template #title>
                                            <!-- 更换头像-->
                                            <span class="custom-title">{{t('home.60')}}</span>
                                        </template>
                                    </van-cell>
                                </li>
                                <li>
                                    <van-cell @click="onLogout" >
                                        <template #icon>
                                            <Icon name="logout-box-r-line" :size="convertViewportWidth('18px')" class="icon"/>
                                        </template>
                                        <template #title>
                                            <!-- 退出登录-->
                                            <span>{{t('home.70')}}</span>
                                        </template>
                                    </van-cell>
                                </li>
                            </ul>
                        </div>
                    </van-popup>


                    <!--更换头像弹出窗口-->
                    <van-popup v-model:show="updateAvatarVisible" closeable position="top" :style="{ height: '100%' }">
                        <UpdateAvatar @updateAvatar="receive_updateAvatar"/>
                    </van-popup>


                    <div v-if="!state.isHomeFinished && (state.user == null || Object.keys(state.user).length==0)">
                        <van-skeleton :row="3" class="skeleton"/>
                    </div>
                    <!--description="用户信息不存在或已隐藏"-->
                    <van-empty v-if="state.isHomeFinished && (state.user == null || Object.keys(state.user).length==0)" :description="t('home.80')"/>



                    <div v-if="state.user != null && Object.keys(state.user).length>0 && state.user.userName == store_systemUser.userName" class="homeMenu" >
                        <van-grid >


                            <van-grid-item to="/user/control/topicList">
                                <Icon name="topic" :size="convertViewportWidth('26px')" class="van-badge__wrapper van-icon van-grid-item__icon"/>
                                <span class="van-grid-item__text">{{t('home.90')}}</span><!-- 我的话题 -->
                            </van-grid-item>
                            <van-grid-item to="/user/control/commentList">
                                <Icon name="comment" :size="convertViewportWidth('26px')" class="van-badge__wrapper van-icon van-grid-item__icon"/>
                                <span class="van-grid-item__text">{{t('home.100')}}</span><!-- 我的评论 -->
                            </van-grid-item>
                            <van-grid-item to="/user/control/replyList">
                                <Icon name="reply" :size="convertViewportWidth('26px')" class="van-badge__wrapper van-icon van-grid-item__icon"/>
                                <span class="van-grid-item__text">{{t('home.110')}}</span><!-- 我的回复 -->
                            </van-grid-item>
                            <van-grid-item to="/user/control/questionList">
                                <Icon name="question-answer-line" :size="convertViewportWidth('26px')" class="van-badge__wrapper van-icon van-grid-item__icon"/>
                                <span class="van-grid-item__text">{{t('home.120')}}</span><!-- 我的问题 -->
                            </van-grid-item>
                            <van-grid-item to="/user/control/answerList">
                                <Icon name="info-alt" :size="convertViewportWidth('26px')" class="van-badge__wrapper van-icon van-grid-item__icon"/>
                                <span class="van-grid-item__text">{{t('home.130')}}</span><!-- 我的答案 -->
                            </van-grid-item>
                            <van-grid-item to="/user/control/answerReplyList">
                                <Icon name="reply" :size="convertViewportWidth('26px')" class="van-badge__wrapper van-icon van-grid-item__icon"/>
                                <span class="van-grid-item__text">{{t('home.140')}}</span><!-- 我的答案回复 -->
                            </van-grid-item>
                            <van-grid-item to="/user/control/favoriteList">
                                <Icon name="favorites" :size="convertViewportWidth('26px')" class="van-badge__wrapper van-icon van-grid-item__icon"/>
                                <span class="van-grid-item__text">{{t('home.150')}}</span><!-- 收藏夹 -->
                            </van-grid-item>
                            <van-grid-item to="/user/control/likeList">
                                <Icon name="thumb-up" :size="convertViewportWidth('26px')" class="van-badge__wrapper van-icon van-grid-item__icon"/>
                                <span class="van-grid-item__text">{{t('home.160')}}</span><!-- 点赞 -->
                            </van-grid-item>
                            <van-grid-item to="/user/control/followList">
                                <Icon name="heart" :size="convertViewportWidth('26px')" class="van-badge__wrapper van-icon van-grid-item__icon"/>
                                <span class="van-grid-item__text">{{t('home.170')}}</span><!-- 关注 -->
                            </van-grid-item>
                            <van-grid-item to="/user/control/followerList">
                                <Icon name="follower" :size="convertViewportWidth('26px')" class="van-badge__wrapper van-icon van-grid-item__icon"/>
                                <span class="van-grid-item__text">{{t('home.40')}}</span><!-- 粉丝 -->
                            </van-grid-item>
                            <van-grid-item to="/user/control/privateMessageList">
                                <van-badge :content="state.unreadMessage.privateMessageCount" max="99" :show-zero="false">
                                    <Icon name="email" :size="convertViewportWidth('26px')" class="van-badge__wrapper van-icon van-grid-item__icon"/>
                                </van-badge>
                                <span class="van-grid-item__text van-grid-item__text_badge">{{t('home.190')}}</span><!-- 私信 -->
                            </van-grid-item>
                            <van-grid-item to="/user/control/remindList">
                                <van-badge :content="state.unreadMessage.remindCount" max="99" :show-zero="false">
                                    <Icon name="bell" :size="convertViewportWidth('26px')" class="van-badge__wrapper van-icon van-grid-item__icon"/>
                                </van-badge>
                                <span class="van-grid-item__text van-grid-item__text_badge">{{t('home.200')}}</span><!-- 提醒 -->
                            </van-grid-item>
                            <van-grid-item to="/user/control/systemNotifyList">
                                <van-badge :content="state.unreadMessage.systemNotifyCount" max="99" :show-zero="false">
                                    <Icon name="announcement" :size="convertViewportWidth('26px')" class="van-badge__wrapper van-icon van-grid-item__icon"/>
                                </van-badge>
                                <span class="van-grid-item__text van-grid-item__text_badge">{{t('home.210')}}</span><!-- 系统通知 -->
                            </van-grid-item>
                            <van-grid-item to="/user/control/membershipCardOrderList">
                                <Icon name="order" :size="convertViewportWidth('26px')" class="van-badge__wrapper van-icon van-grid-item__icon"/>
                                <span class="van-grid-item__text">{{t('home.220')}}</span><!-- 会员卡订单 -->
                            </van-grid-item>
                            <van-grid-item to="/user/control/balance">
                                <Icon name="deposit" :size="convertViewportWidth('26px')" class="van-badge__wrapper van-icon van-grid-item__icon"/>
                                <span class="van-grid-item__text">{{t('home.230')}}</span><!-- 余额 -->
                            </van-grid-item>
                            <van-grid-item to="/user/control/giveRedEnvelopeList">
                                <Icon name="redEnvelope-2" :size="convertViewportWidth('26px')" class="van-badge__wrapper van-icon van-grid-item__icon"/>
                                <span class="van-grid-item__text">{{t('home.240')}}</span><!-- 发红包 -->
                            </van-grid-item>
                            <van-grid-item to="/user/control/receiveRedEnvelopeList">
                                <Icon name="redEnvelope-2" :size="convertViewportWidth('26px')" class="van-badge__wrapper van-icon van-grid-item__icon"/>
                                <span class="van-grid-item__text">{{t('home.250')}}</span><!-- 收红包 -->
                            </van-grid-item>
                            <van-grid-item to="/user/control/editUser">
                                <Icon name="pencil-alt" :size="convertViewportWidth('26px')" class="van-badge__wrapper van-icon van-grid-item__icon"/>
                                <span class="van-grid-item__text">{{t('home.260')}}</span><!-- 修改账户 -->
                            </van-grid-item>
                            <van-grid-item to="/user/control/realNameAuthentication">
                                <Icon name="realNameAuthentication" :size="convertViewportWidth('26px')" class="van-badge__wrapper van-icon van-grid-item__icon"/>
                                <span class="van-grid-item__text">{{t('home.270')}}</span><!-- 绑定手机 -->
                            </van-grid-item>
                            <van-grid-item to="/user/control/reportList">
                                <Icon name="error-warning-line" :size="convertViewportWidth('26px')" class="van-badge__wrapper van-icon van-grid-item__icon"/>
                                <span class="van-grid-item__text">{{t('home.280')}}</span><!-- 举报 -->
                            </van-grid-item>
                            <van-grid-item to="/user/control/point">
                                <Icon name="point" :size="convertViewportWidth('26px')" class="van-badge__wrapper van-icon van-grid-item__icon"/>
                                <span class="van-grid-item__text">{{t('home.290')}}</span><!-- 积分记录 -->
                            </van-grid-item>
                            <van-grid-item to="/user/control/userLoginLogList">
                                <Icon name="login" :size="convertViewportWidth('26px')" class="van-badge__wrapper van-icon van-grid-item__icon"/>
                                <span class="van-grid-item__text">{{t('home.300')}}</span><!-- 登录日志 -->
                            </van-grid-item>
                            <van-grid-item text="" />
                            <van-grid-item text="" />
                        </van-grid>
                    </div>

                    <div class="userDynamicModule" v-if="state.user.userName != undefined && store_systemUser != null && Object.keys(store_systemUser).length>0 && state.user.userName != store_systemUser.userName">
                        <!--error-text="请求失败，点击重新加载" 没有更多了-->
                        <van-list v-model:loading="state.isLoading" :finished="state.isFinished" v-model:error="state.isError" :error-text="t('common.140')" :finished-text="(state.userName != null && state.userName != '' && state.user.userName != undefined && state.user.userName != store_systemUser.userName) ? t('common.150') : ''" @load="onLoad">
                            <!-- 延迟加载点赞和收藏 -->
                            <div v-for="(userDynamic,index) in state.userDynamicList" :key="userDynamic.id" class="item" v-lazy-tag="()=>{onQueryLikeOrFavorite(userDynamic)}">
                                <div class="top-container">
                                    <div class="left-layout">
                                        <router-link v-if="userDynamic.account != null && userDynamic.account != ''" tag="a" :to="{path:'/user/control/home',query: {userName: userDynamic.userName}}">
                                            <span class="avatarImg">
                                                <img v-if="userDynamic.avatarName != null" :src="userDynamic.avatarPath+'100x100/'+userDynamic.avatarName" class="img">

                                                <img v-if="userDynamic.avatarName == null" :src="userDynamic.avatar" class="img"/>
                                            </span>
                                        </router-link>
                                        <template v-if="userDynamic.account == null || userDynamic.account == ''">
                                            <span class="avatarImg">
                                                <img v-if="userDynamic.avatarName == null" :src="userDynamic.avatar" class="img"/>
                                            </span>
                                        </template>
                                    </div>
                                    <div class="middle-layout">
                                        <div class="userInfo">


                                            <span v-if="(userDynamic.nickname == null || userDynamic.nickname == '') && userDynamic.account != null && userDynamic.account != ''" class="account">{{userDynamic.account}}</span>
                                            <span v-if="userDynamic.nickname != null && userDynamic.nickname != ''" class="account">{{userDynamic.nickname}}</span>
                                            <!-- 已注销 -->
                                            <div v-if="userDynamic.account == null || userDynamic.account == ''" class="cancelNickname">{{t('home.310')}}</div>
                                            <span class="time">{{userDynamic.postTime}}</span>
                                        </div>
                                    </div>

                                </div>
                                <div class="middle-container">
                                    <div class="topicTitle">
                                        <template v-if="userDynamic.module == 100">
                                            <span class="info">{{t('home.320')}}</span><!-- 发表了话题 -->
                                            <router-link tag="a" :to="{path:'/thread',query: {topicId: userDynamic.topicId}}" >
                                                {{userDynamic.topicTitle}}
                                            </router-link>
                                        </template>
                                        <template v-if="userDynamic.module == 200">
                                            <span class="info">{{t('home.330')}}</span><!-- 评论了话题 -->
                                            <router-link tag="a" :to="{path:'/thread',query: {topicId: userDynamic.topicId}}" >
                                                {{userDynamic.topicTitle}}
                                            </router-link>
                                        </template>
                                        <template v-if="userDynamic.module == 300">
                                            <span class="info">{{t('home.340')}}</span><!-- 引用了评论 -->
                                            <router-link tag="a" :to="{path:'/thread',query: {topicId: userDynamic.topicId}}" >
                                                {{userDynamic.topicTitle}}
                                            </router-link>
                                        </template>
                                        <template v-if="userDynamic.module == 400">
                                            <span class="info">{{t('home.350')}}</span><!-- 回复了话题 -->
                                            <router-link tag="a" :to="{path:'/thread',query: {topicId: userDynamic.topicId}}" >
                                                {{userDynamic.topicTitle}}
                                            </router-link>
                                        </template>
                                        <template v-if="userDynamic.module == 500">
                                            <span class="info">{{t('home.360')}}</span><!-- 提交了问题 -->
                                            <router-link tag="a" :to="{path:'/question',query: {questionId: userDynamic.questionId}}" >
                                                {{userDynamic.questionTitle}}
                                            </router-link>
                                        </template>
                                        <template v-if="userDynamic.module == 600">
                                            <span class="info">{{t('home.370')}}</span><!-- 回答了问题 -->
                                            <router-link tag="a" :to="{path:'/question',query: {questionId: userDynamic.questionId}}" >
                                                {{userDynamic.questionTitle}}
                                            </router-link>
                                        </template>
                                        <template v-if="userDynamic.module == 700">
                                            <span class="info">{{t('home.380')}}</span><!-- 回复了问题 -->
                                            <router-link tag="a" :to="{path:'/question',query: {questionId: userDynamic.questionId}}" >
                                                {{userDynamic.questionTitle}}
                                            </router-link>
                                        </template>
                                        <i class="userRoleName" v-for="roleName in userDynamic.allowRoleViewList">{{roleName}}</i>


                                        <span v-for="(value,key) in userDynamic.hideTagTypeMap" :class="'hideTagType hide_'+key">

                                            <span class="circle point" v-if="value">
                                                <Icon name="unlock-solid" size="14px" class="icon"/>
                                            </span>

                                            <span class="circle" v-if="!value">
                                                <Icon name="lock-solid" size="14px" class="icon"/>
                                            </span>
                                        </span>
                                    </div>
                                    <div :ref="'readMore_'+userDynamic.id">
                                        <template v-if="userDynamic.module == 100">
                                            <div :class="[userDynamic.isMarkdown != null && userDynamic.isMarkdown == true ? 'markdown-body-custom topicMarkdownContent collapsedContainer' : 'topicContent collapsedContainer']" :ref="'userDynamicContent_'+userDynamic.id" >
                                                <RenderTemplate @click-onZoomPicture="onZoomPicture" @load-onImageLoad="onImageLoad" @click-onTopicUnhide="onTopicUnhide" @click-onDownload="onDownload" :html="userDynamic.topicContent"></RenderTemplate>

                                            </div>
                                        </template>
                                        <template v-if="userDynamic.module == 200">
                                            <div :class="[userDynamic.isMarkdown != null && userDynamic.isMarkdown == true ? 'markdown-body-custom topicMarkdownContent collapsedContainer' : 'topicContent collapsedContainer']" :ref="'userDynamicContent_'+userDynamic.id" >
                                                <RenderTemplate @click-onZoomPicture="onZoomPicture" @load-onImageLoad="onImageLoad" @click-onDownload="onDownload" :html="userDynamic.commentContent"></RenderTemplate>

                                            </div>
                                        </template>
                                        <template v-if="userDynamic.module == 300">
                                            <div class="collapsedContainer" >
                                                <div :class="[userDynamic.isMarkdown != null && userDynamic.isMarkdown == true ? 'markdown-body-custom topicMarkdownContent' : 'commentContent']" :ref="'userDynamicContent_'+userDynamic.id" >
                                                    <RenderTemplate @click-onZoomPicture="onZoomPicture" @load-onImageLoad="onImageLoad" @click-onDownload="onDownload" :html="userDynamic.commentContent"></RenderTemplate>

                                                </div>
                                                <div class="quoteContent">
                                                    <div class="text" >
                                                        {{userDynamic.quoteCommentContent}}
                                                    </div>
                                                </div>
                                            </div>
                                        </template>
                                        <template v-if="userDynamic.module == 400">
                                            <div class="commentContent collapsedContainer" >
                                                <RenderTemplate @click-onZoomPicture="onZoomPicture" @load-onImageLoad="onImageLoad" @click-onDownload="onDownload" :html="userDynamic.replyContent"></RenderTemplate>

                                            </div>
                                        </template>
                                        <template v-if="userDynamic.module == 500">
                                            <div :class="[userDynamic.isMarkdown != null && userDynamic.isMarkdown == true ? 'markdown-body-custom topicMarkdownContent collapsedContainer' : 'topicContent collapsedContainer']" :ref="'userDynamicContent_'+userDynamic.id" >
                                                <RenderTemplate @click-onZoomPicture="onZoomPicture" @load-onImageLoad="onImageLoad" @click-onDownload="onDownload" :html="userDynamic.questionContent"></RenderTemplate>

                                            </div>
                                        </template>
                                        <template v-if="userDynamic.module == 600">
                                            <div :class="[userDynamic.isMarkdown != null && userDynamic.isMarkdown == true ? 'markdown-body-custom topicMarkdownContent collapsedContainer' : 'topicContent collapsedContainer']" :ref="'userDynamicContent_'+userDynamic.id" >
                                                <RenderTemplate @click-onZoomPicture="onZoomPicture" @load-onImageLoad="onImageLoad" @click-onDownload="onDownload" :html="userDynamic.answerContent"></RenderTemplate>

                                            </div>
                                        </template>
                                        <template v-if="userDynamic.module == 700">
                                            <div class="topicContent collapsedContainer" >
                                                <RenderTemplate @click-onZoomPicture="onZoomPicture" @load-onImageLoad="onImageLoad" @click-onDownload="onDownload" :html="userDynamic.answerReplyContent"></RenderTemplate>
                                            </div>
                                        </template>

                                        <template v-if="state.isReadMoreText.get(userDynamic.id) != undefined">
                                            <!-- 展开阅读 -->
                                            <span v-if="state.isReadMoreText.get(userDynamic.id) == true" class="readMore" @click="readMoreClick(userDynamic.id)">{{t('home.390')}}</span>
                                            <!-- 收起 -->
                                            <span v-if="state.isReadMoreText.get(userDynamic.id) == false" class="shrinkMore" @click="readMoreClick(userDynamic.id)">{{t('home.400')}}</span>
                                        </template>
                                    </div>

                                </div>
                                <div class="bottom-container">
                                    <div class="layout">
                                        <template v-if="userDynamic.module == 100">
                                            <!-- 查看原文 -->
                                            <router-link tag="a" class="viewText" :to="{path:'/thread',query: {topicId: userDynamic.topicId}}">
                                                {{t('home.410')}}
                                            </router-link>
                                            <Icon name="commentCount" :size="convertViewportWidth('14px')" class="icon"/><span class="commentTotal">{{Long.fromString(userDynamic.topicCommentTotal).gt(9999) ? '9999+' : userDynamic.topicCommentTotal}}</span>
				            	            <Icon name="view" :size="convertViewportWidth('14px')" class="icon"/><span class="viewTotal">{{Long.fromString(userDynamic.topicViewTotal).gt(9999) ? '9999+' : userDynamic.topicViewTotal}}</span>
                                            <Icon name="favorites" :size="convertViewportWidth('14px')" class="icon"/><span class="favoriteTotal">{{state.favoriteCount.get('topic_'+userDynamic.topicId)}}</span>
                                            <Icon name="thumb-up" :size="convertViewportWidth('14px')" class="icon"/><span class="likeTotal">{{state.likeCount.get('topic_'+userDynamic.topicId)}}</span>
                                        </template>
                                        <template v-if="userDynamic.module == 200">
                                            <!-- 查看原文 -->
                                            <router-link tag="a" class="viewText" :to="{path:'/thread',query: {topicId: userDynamic.topicId,commentId:userDynamic.commentId}}" >
                                                {{t('home.410')}}
                                            </router-link>
                                            <Icon name="thumb-up" :size="convertViewportWidth('14px')" class="icon"/><span class="likeTotal">{{state.likeCount.get('comment_'+userDynamic.commentId)}}</span>
                                        </template>
                                        <template v-if="userDynamic.module == 300">
                                            <!-- 查看原文 -->
                                            <router-link tag="a" class="viewText" :to="{path:'/thread',query: {topicId: userDynamic.topicId,commentId:userDynamic.commentId}}">
                                                {{t('home.410')}}
                                            </router-link>

                                        </template>
                                        <template v-if="userDynamic.module == 400">
                                            <!-- 查看原文 -->
                                            <router-link tag="a" class="viewText" :to="{path:'/thread',query: {topicId: userDynamic.topicId,commentId:userDynamic.commentId,replyId:userDynamic.replyId}}">
                                                {{t('home.410')}}
                                            </router-link>
                                            <Icon name="thumb-up" :size="convertViewportWidth('14px')" class="icon"/><span class="likeTotal">{{state.likeCount.get('commentReply_'+userDynamic.replyId)}}</span>

                                        </template>
                                        <template v-if="userDynamic.module == 500">
                                            <!-- 查看原文 -->
                                            <router-link tag="a" class="viewText" :to="{path:'/question',query: {questionId: userDynamic.questionId}}">
                                                {{t('home.410')}}
                                            </router-link>
                                            <Icon name="info-alt" :size="convertViewportWidth('14px')" class="icon"/><span class="commentTotal">{{Long.fromString(userDynamic.questionAnswerTotal).gt(9999) ? '9999+' : userDynamic.questionAnswerTotal}}</span>
				            	            <Icon name="view" :size="convertViewportWidth('14px')" class="icon"/><span class="viewTotal">{{Long.fromString(userDynamic.questionViewTotal).gt(9999) ? '9999+' : userDynamic.questionViewTotal}}</span>
                                            <Icon name="favorites" :size="convertViewportWidth('14px')" class="icon"/><span class="favoriteTotal">{{state.favoriteCount.get('question_'+userDynamic.questionId)}}</span>
                                            <Icon name="thumb-up" :size="convertViewportWidth('14px')" class="icon"/><span class="likeTotal">{{state.likeCount.get('question_'+userDynamic.questionId)}}</span>

                                        </template>
                                        <template v-if="userDynamic.module == 600">
                                            <!-- 查看原文 -->
                                            <router-link tag="a" class="viewText" :to="{path:'/question',query: {questionId: userDynamic.questionId,answerId:userDynamic.answerId}}" >
                                                {{t('home.410')}}
                                            </router-link>
                                            <Icon name="thumb-up" :size="convertViewportWidth('14px')" class="icon"/><span class="likeTotal">{{state.likeCount.get('answer_'+userDynamic.answerId)}}</span>

                                        </template>
                                        <template v-if="userDynamic.module == 700">
                                            <!-- 查看原文 -->
                                            <router-link tag="a" class="viewText" :to="{path:'/question',query: {questionId: userDynamic.questionId,answerId:userDynamic.answerId,replyId:userDynamic.answerReplyId}}">
                                                {{t('home.410')}}
                                            </router-link>
                                            <Icon name="thumb-up" :size="convertViewportWidth('14px')" class="icon"/><span class="likeTotal">{{state.likeCount.get('answerReply_'+userDynamic.answerReplyId)}}</span>

                                        </template>
                                    </div>
                                </div>
                            </div>
                        </van-list>
                    </div>
                </div>
                <!-- 底部导航栏-->
                <BottomTabbar @unreadMessage="receive_unreadMessage"/>
            </van-pull-refresh>
        </div>
    </div>
</template>


<script lang="ts" setup>
    import { getCurrentInstance, ComponentInternalInstance, reactive, onMounted, nextTick, ref, watchEffect, onActivated} from 'vue'
    import { PageView, SystemUser, UnreadMessage, User, UserDynamic } from "@/types/index";
    import { AxiosResponse } from 'axios'
    import { onBeforeRouteUpdate, useRouter } from 'vue-router'
    import {letterAvatar} from '@/utils/letterAvatar'
    import { getLanguageClassName, processErrorInfo,generateRandom, getPageBasePath} from '@/utils/tool';
    import { escapeHtml, escapeVueHtml, unescapeHtml } from '@/utils/escape';
    import Icon from "@/components/icon/Icon.vue";
    import pinia from '@/store/store'
    import {useStore} from '@/store'
    import { storeToRefs } from 'pinia';
    import { convertViewportWidth } from '@/utils/px-to-viewport';
    import { Dialog, ImagePreview, Notify } from 'vant';
    import Prism from "prismjs";
    import Hls from 'hls.js';
    import DPlayer from 'dplayer';
    import Long from "long";
    import { nativeQueryVideoRedirect, nativeRefreshToken } from '@/utils/http';
    import type { BytemdPlugin } from 'bytemd'
    import { Editor } from '@bytemd/vue-next'
    import { clearBodyLocks, lock, unlock } from 'tua-body-scroll-lock'
    import mermaid from "mermaid";
    import katex from 'katex'
    import 'katex/dist/katex.css'
    import { useI18n } from 'vue-i18n';
    let { t } = useI18n();
    const store = useStore(pinia);
    const {title:store_title,keywords:store_keywords,description:store_description,systemUser:store_systemUser,userInfoVersion:store_userInfoVersion,cacheComponents:store_cacheComponents,currentLanguage:store_currentLanguage} = storeToRefs(store)
    const router = useRouter();
    const { proxy } = getCurrentInstance() as ComponentInternalInstance;

    const placeholderVideo = ref();
    //更换头像窗口
    const updateAvatarVisible = ref(false)
    //传递消息给父组件
    const emit = defineEmits(['unreadMessage','updateAvatar'])


    //html页元信息
    watchEffect(() => {
        let titleValue = store_title.value//监听网站标题
        if(titleValue != null && titleValue != ''){
            document.title = t('home.420')+' - ' + titleValue;//用户中心
        }
    }, {
        flush: 'post'//在组件更新后触发，第一次运行需要组件渲染完成才执行
    })

    const state = reactive({
        isRefreshing:false,//是否处于下拉加载中状态

        userName:'',
        user: {} as User,//用户
        avatar:'',//字符头像
        followerCount:'0',//粉丝总数
        followText:t('home.430'),//关注文本   关注
        following:false,//是否已经关注该用户
        popup_userSetting : false, //'用户设置'弹出层
		popup_updateAvatar : false, //'更换头像'弹出层


        unreadMessage:{//未读消息
            privateMessageCount:0,
            systemNotifyCount:0,
            remindCount:0,
        } as UnreadMessage,


        userDynamicList: [] as Array<UserDynamic>,//动态
        totalrecord : 0, //总记录数
		currentpage : 0, //当前页码
        totalpage : 1, //总页数
        maxresult: 12, //每页显示记录数

        playerIdList: [] as Array<string>,//视频播放Id列表
		playerObjectList: [] as Array<any>,//视频播放对象集合
        playerHlsList: [] as Array<any>,//视频播放流对象集合
		playerNodeList: [] as Array<any>,//视频节点对象集合
        placeholder_DPlayer:'' as any,//占位播放器
        lastPlayerId:'',//最后运行的播放Id
        hidePasswordIndex:0,//隐藏标签密码框索引

        //“阅读更多”功能
        collapsedHeight:200, //默认高度
        isReadMoreText: new Map<string,boolean>,//是否显示展开文本 key:用户动态Id value:true(展开文本) false(收缩文本) key不存在时不显示任何文本

        favoriteCount: new Map<string,string>,//收藏数量 key:模块+id  例如话题收藏topic_topicId   问题收藏question_questionId
        likeCount: new Map<string,string>,//点赞数量 key:模块+id  例如话题点赞topic_topicId


        isError:false,//动态是否列表数据加载失败
        isLoading:false,//动态是否处于加载中状态
        isFinished:false,//动态是否加载完毕
        isSkeleton:true,//动态是否显示骨架屏
        isShowPage:false,//动态是否显示分页

        isHomeFinished:false,//用户中心是否加载完毕
    });

    //错误
    const error = reactive({
    })

    //接收子组件消息
    const receive_updateAvatar = (updateAvatar:boolean) => {
        if(updateAvatar){//如果头像上传成功
            updateAvatarVisible.value = false;
            //关闭设置栏
            state.popup_userSetting = false;
            //传递消息给父组件
            emit('updateAvatar',updateAvatar);


            //改变‘用户信息版本’,让App.vue监听到变化后执行刷新登录用户信息
            store_userInfoVersion.value = parseInt(generateRandom());



            queryHome(state.userName, () =>{});//查询用户中心

        }
    }

    //下拉刷新时触发
    const onRefresh = () => {
        state.isRefreshing = false;

        clearVideoPlayer();
        //清空是否显示展开文本
        state.isReadMoreText.clear();

        state.user = {} as User;//用户
        state.avatar = '';//字符头像
        state.followerCount = '0';//粉丝总数
        state.followText = t('home.430');//关注文本   关注
        state.following = false;//是否已经关注该用户
        state.popup_userSetting  = false; //'用户设置'弹出层
		state.popup_updateAvatar  = false; //'更换头像'弹出层


        state.userDynamicList.length = 0;//动态
        state.totalrecord = 0; //总记录数
        state.currentpage = 0; //当前页码
        state.totalpage = 1; //总页数
        state.maxresult = 12; //每页显示记录数

        state.playerIdList.length = 0;//视频播放Id列表
        state.playerObjectList.length = 0;//视频播放对象集合
        state.playerHlsList.length = 0;//视频播放流对象集合
        state.playerNodeList.length = 0;//视频节点对象集合
        state.placeholder_DPlayer = '';//占位播放器
        state.lastPlayerId = '';//最后运行的播放Id
        state.hidePasswordIndex = 0;//隐藏标签密码框索引

        //“阅读更多”功能
        state.collapsedHeight = 200; //默认高度
        state.isReadMoreText.clear();//是否显示展开文本 key:用户动态Id value:true(展开文本) false(收缩文本) key不存在时不显示任何文本

        state.favoriteCount.clear();//收藏数量 key:模块+id  例如话题收藏topic_topicId   问题收藏question_questionId
        state.likeCount.clear();//点赞数量 key:模块+id  例如话题点赞topic_topicId


        state.isError = false;//是否列表数据加载失败
        state.isFinished = false;

        state.isLoading = true;//手动触发查询数据需将'加载状态结束'设为true

        init(state.userName);
    };

    //加载列表
    const onLoad = () => {

        queryUserDynamicList(state.userName,state.currentpage+1);

    }


    //显示'用户设置'
    const displayUserSetting = () => {
        state.popup_userSetting = true;
    }

    //会员退出登录
    const onLogout = () => {
        let formData = new FormData();
        proxy?.$axios({
            url: '/logout',
            method: 'post',
            data: formData
        })
        .then((response: AxiosResponse) => {
            if(response){
                const result: any = response.data;

                if(JSON.parse(result.success)){//成功
                    let jumpUrl = result.jumpUrl;

                    //清理登录信息
                    window.localStorage.clear();//清空sessionStorage中所有信息
                    store_systemUser.value = {} as SystemUser;

                    if (jumpUrl != null) {
                        router.push(jumpUrl);
                    } else {
                        router.push("index");
                    }
                }else{
                    //处理错误信息
                    processErrorInfo(result.error as Map<string,string> , {},()=>{});

                }
            }
        })
        .catch((error: any) =>{
            console.log(error);
        });

    }

     //查询是否已经关注该用户
     const queryFollowing = (userName:string) => {
        //清空信息
        state.followText = t('home.430');//关注

        proxy?.$axios({
            url: '/queryFollowing',
            method: 'get',
            params:  {
                userName:userName
            },
            showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
        })
        .then((response: AxiosResponse) => {
            if(response){
                const result: any = response.data;
                if(JSON.parse(result)){
                    state.followText = t('home.440');//已关注
                }
            }
        }).catch((error: any) =>{
            console.log(error);
        });
    }
    //添加关注
    const addFollow = (userName:string) => {
        if(state.followText ==t('home.430')){//关注
            let formData = new FormData();
            formData.append('userName', userName);

            proxy?.$axios({
                url: '/user/control/follow/add',
                method: 'post',
                data: formData
            })
            .then((response: AxiosResponse) => {
                if(response){

                    const result: any = response.data;

                    if(JSON.parse(result.success)){
                        state.followText =t('home.440')//已关注
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

    }

    //查询用户中心
    const queryHome = (userName:string,callback:any) => {
        //清空用户信息
        state.user = {}as User;
        state.avatar = store.transparentImage;


        proxy?.$axios({
            url: '/user/control/home',
            method: 'get',
            params:  {
                userName:userName
            },
            showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
        })
        .then((response: AxiosResponse) => {
            if(response){
                const result: any = response.data;
                if(result.user != null){
                    state.user = result.user;

                    if(state.user.avatarName != null && state.user.avatarName != ''){
                        state.avatar = result.user.avatarPath + result.user.avatarName+"?"+Math.random().toString().slice(-6);;
                    }

                    callback();
                }else{
                    state.isHomeFinished = true;
                }
            }
        }).catch((error: any) =>{
            console.log(error);
        });
    }

    //查询粉丝总数
    const queryFollowerCount = (userName:string) => {
        //清空信息
        state.followerCount = '0';


        proxy?.$axios({
            url: '/queryFollowerCount',
            method: 'get',
            params:  {
                userName:userName
            },
            showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
        })
        .then((response: AxiosResponse) => {
            if(response){
                const result: any = response.data;
                state.followerCount = result;
            }
        }).catch((error: any) =>{
            console.log(error);
        });
    }


    //回调查询点赞和收藏
    const onQueryLikeOrFavorite = (userDynamic :UserDynamic) => {

        if(userDynamic.module == 100){//话题
            queryLikeCount(userDynamic.topicId,10,"topic_"+userDynamic.topicId);
            queryTopicFavoriteCount("topic_"+userDynamic.topicId,userDynamic.topicId);
        }else if(userDynamic.module == 200){//评论
            queryLikeCount(userDynamic.commentId,20,"comment_"+userDynamic.commentId);
        }else if(userDynamic.module == 400){//评论回复
            queryLikeCount(userDynamic.replyId,30,"commentReply_"+userDynamic.replyId);
        }else if(userDynamic.module == 500){//问题
            queryLikeCount(userDynamic.questionId,40,"question_"+userDynamic.questionId);
            queryQuestionFavoriteCount("question_"+userDynamic.questionId,userDynamic.questionId);
        }else if(userDynamic.module == 600){//答案
            queryLikeCount(userDynamic.answerId,50,"answer_"+userDynamic.answerId);
        }else if(userDynamic.module == 700){//答案回复
            queryLikeCount(userDynamic.answerReplyId,60,"answerReply_"+userDynamic.answerReplyId);
        }
    }
    //查询话题用户收藏总数
    const queryTopicFavoriteCount = (key:string,topicId:string) => {
        proxy?.$axios({
            url: '/queryFavoriteCount',
            method: 'get',
            params:  {
                topicId: topicId,
            },
            showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
        })
        .then((response: AxiosResponse) => {
            if(response){
                let data =  response.data;
                let count = JSON.parse(data);
                state.favoriteCount.set(key,count);
            }
        })
        .catch((error: any) =>{
            console.log(error);
        });
    }

    //查询问题用户收藏总数
    const queryQuestionFavoriteCount = (key:string,questionId:string) => {
        proxy?.$axios({
            url: '/queryQuestionFavoriteCount',
            method: 'get',
            params:  {
                questionId: questionId,
            },
            showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
        })
        .then((response: AxiosResponse) => {
            if(response){
                let data =  response.data;
                let count = JSON.parse(data);
                state.favoriteCount.set(key,count);
            }
        })
        .catch((error: any) =>{
            console.log(error);
        });
    }
    //查询用户点赞总数
    const queryLikeCount = (itemId:string,module:number,key:string) => {
        proxy?.$axios({
            url: '/queryLikeCount',
            method: 'get',
            params:  {
                itemId: itemId,
                module: module,
            },
            showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
        })
        .then((response: AxiosResponse) => {
            if(response){
                let data =  response.data;
                let count = JSON.parse(data);
                state.likeCount.set(key,count);
            }
        })
        .catch((error: any) =>{
            console.log(error);
        });
    }


    //查询用户动态
    const queryUserDynamicList = (userName:string,page: number) => {
        proxy?.$axios({
            url: '/user/control/userDynamicList',
            method: 'get',
            params:  {
                userName:userName,
                page: page
            },
            showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
            showErrorMessage:false,// 是否显示错误提示
        })
        .then((response: AxiosResponse) => {
            return response?.data
        })
        .then((data: PageView<UserDynamic>) => {
            state.isSkeleton = false;//关闭骨架屏


            if(data.records != null && data.records.length >0){
                for(let i:number=0; i<data.records.length; i++){
                    let userDynamic = data.records[i];

                    if(userDynamic.module == 100){
                        //处理隐藏标签富文本
                        let contentNode = document.createElement("div");
                        contentNode.innerHTML = userDynamic.topicContent;
                        state.hidePasswordIndex = 0;
                        bindNode(contentNode,userDynamic.topicId);
                        userDynamic.topicContent = escapeVueHtml(contentNode.innerHTML);

                    }else if(userDynamic.module == 200){
                        //处理富文本
                        let contentNode = document.createElement("div");
                        contentNode.innerHTML = userDynamic.commentContent;
                        bindNode(contentNode,"-1");
                        userDynamic.commentContent = escapeVueHtml(contentNode.innerHTML);
                    }else if(userDynamic.module == 300){
                        //处理富文本
                        let contentNode = document.createElement("div");
                        contentNode.innerHTML = userDynamic.commentContent;
                        bindNode(contentNode,"-1");
                        userDynamic.commentContent = escapeVueHtml(contentNode.innerHTML);
                    }else if(userDynamic.module == 400){
                        //处理富文本
                        let contentNode = document.createElement("div");
                        contentNode.innerHTML = userDynamic.replyContent;
                        bindNode(contentNode,"-1");
                        userDynamic.replyContent = escapeVueHtml(contentNode.innerHTML);
                    }else if(userDynamic.module == 500){
                        //处理富文本
                        let contentNode = document.createElement("div");
                        contentNode.innerHTML = userDynamic.questionContent;
                        bindNode(contentNode,"-1");
                        userDynamic.questionContent = escapeVueHtml(contentNode.innerHTML);
                    }else if(userDynamic.module == 600){
                        //处理富文本
                        let contentNode = document.createElement("div");
                        contentNode.innerHTML = userDynamic.answerContent;
                        bindNode(contentNode,"-1");
                        userDynamic.answerContent = escapeVueHtml(contentNode.innerHTML);
                    }else if(userDynamic.module == 700){
                        //处理富文本
                        let contentNode = document.createElement("div");
                        contentNode.innerHTML = userDynamic.answerReplyContent;
                        bindNode(contentNode,"-1");
                        userDynamic.answerReplyContent = escapeVueHtml(contentNode.innerHTML);
                    }



                    if(userDynamic.nickname != null && userDynamic.nickname !=''){
                        userDynamic.avatar = letterAvatar(userDynamic.nickname, 72);
                    }else{
                        userDynamic.avatar = letterAvatar(userDynamic.account, 72);
                    }

                }
                state.userDynamicList.push.apply(state.userDynamicList,data.records);
            }


            state.totalrecord = parseInt(data.totalrecord);//服务器返回的long类型已转为String类型
            state.currentpage = data.currentpage;
            state.totalpage = parseInt(data.totalpage);//服务器返回的long类型已转为String类型
            state.maxresult = data.maxresult;


            if(state.totalpage == 0 || state.totalpage == page){//如果没有内容或是最后一页，则不再加载
                state.isFinished = true;
            }
            state.isLoading = false;//加载状态结束
            state.isShowPage = true;//显示分页栏

            nextTick(()=>{
                setTimeout(function() {
                    renderVideoPlayer();//渲染视频播放器
                }, 30);

                if(data.records != null && data.records.length >0){
                    for(let i:number=0; i<data.records.length; i++){
                        let userDynamic = data.records[i];
                        //渲染代码
                        let userDynamicRefValue = proxy?.$refs['userDynamicContent_'+userDynamic.id];
                        if(userDynamicRefValue != undefined){
                            renderBindNode((userDynamicRefValue as any)[0]);
                        }
                    }

                }


                //"阅读更多"功能处理
                readMoreProcess();
            });
        })
        .catch((error: any) =>{
            state.isError = true;
            state.isLoading = false;//加载状态结束
            console.log(error);
        });
    }

    //文件下载
    const onDownload = (href: string) => {
        let regx = new RegExp("^"+store.apiUrl,"i");//忽略大小写
        let path = href.replace(regx,"")

        proxy?.$axios({
            url: '/'+path,
            method: 'get',
            params:  {
            },
            showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
        })
        .then((response: AxiosResponse) => {
            if(response){
                const result: any = response.data;
                if(JSON.parse(result.success)){
                    location.href = result.redirect;
                }
            }
        }).catch((error: any) =>{
            console.log(error);
        });
    }

    //递归绑定节点参数
    const bindNode = (node:any,topicId:string) => {


        //先找到子节点
        let nodeList = node.childNodes;
        for(let i = 0;i < nodeList.length;i++){
            //childNode获取到到的节点包含了各种类型的节点
            //但是我们只需要元素节点  通过nodeType去判断当前的这个节点是不是元素节点
            let childNode = nodeList[i];
            let random = Math.random().toString().slice(2);
            //判断是否是元素节点。如果节点是元素(Element)节点，则 nodeType 属性将返回 1。如果节点是属性(Attr)节点，则 nodeType 属性将返回 2。
            if(childNode.nodeType == 1){
                 //处理隐藏内容
                 if(childNode.nodeName.toLowerCase() == "hide" ){
                    if(childNode.getAttribute("hide-type") == "10"){//输入密码可见
                        var nodeHtml = "";
                        nodeHtml += '<div class="hide-box">';
                        nodeHtml += 	'<Icon name="lock-solid-2" size="52px" class="background-image"></Icon>';
                        //此处内容已被隐藏，输入密码可见
                        nodeHtml += 	'<div class="background-prompt">'+t('home.450')+'</div>';
                        nodeHtml += 	'<div class="input-box">';
                        //密码
                        nodeHtml += 		'<input type="password" v-model.trim="hide_passwordList['+state.hidePasswordIndex+']" class="text" maxlength="30"  placeholder="'+t('home.460')+'">';
                        //提交
                        nodeHtml += 		'<div class="button" @click="onTopicUnhide_renderTemplate(10,'+state.hidePasswordIndex+','+topicId+');">'+t('home.470')+'</div>';

                        nodeHtml += 	'</div>';
                        nodeHtml += '</div>';
                        childNode.innerHTML = nodeHtml;

                        state.hidePasswordIndex++;
                    }
                    else if(childNode.getAttribute("hide-type") == "20"){
                        var nodeHtml = "";
                        nodeHtml += '<div class="hide-box">';
                        nodeHtml += 	'<Icon name="lock-solid-2" size="52px" class="background-image"></Icon>';
                        //此处内容已被隐藏，评论话题可见
                        nodeHtml += 	'<div class="background-prompt">'+t('home.480')+'</div>';
                        nodeHtml += '</div>';
                        childNode.innerHTML = nodeHtml;
                    }else if(childNode.getAttribute("hide-type") == "30"){
                        var nodeHtml = "";
                        nodeHtml += '<div class="hide-box">';
                        nodeHtml += 	'<Icon name="lock-solid-2" size="52px" class="background-image"></Icon>';
                        //nodeHtml += 	'<div class="background-prompt">此处内容已被隐藏，等级达到‘'+escapeHtml(childNode.getAttribute("description"))+'’可见</div>';
                        nodeHtml += 	'<div class="background-prompt">'+t('home.490',{'p1': escapeHtml(childNode.getAttribute("description"))})+'</div>';
                        nodeHtml += '</div>';
                        childNode.innerHTML = nodeHtml;
                    }else if(childNode.getAttribute("hide-type") == "40"){
                        var nodeHtml = "";
                        nodeHtml += '<div class="hide-box">';
                        nodeHtml += 	'<Icon name="lock-solid-2" size="52px" class="background-image"></Icon>';
                        //nodeHtml += 	'<div class="background-prompt">此处内容已被隐藏，支付'+childNode.getAttribute("input-value")+'积分可见</div>';
                        nodeHtml += 	'<div class="background-prompt">'+t('home.500',{'p1': childNode.getAttribute("input-value")})+'</div>';
                        nodeHtml += 	'<div class="submit-box" @click="onTopicUnhide_renderTemplate(40,'+null+','+topicId+');">'+t('home.520')+'</div>';
                        nodeHtml += '</div>';
                        childNode.innerHTML = nodeHtml;
                    }else if(childNode.getAttribute("hide-type") == "50"){
                        var nodeHtml = "";
                        nodeHtml += '<div class="hide-box">';
                        nodeHtml += 	'<Icon name="lock-solid-2" size="52px" class="background-image"></Icon>';
                        //nodeHtml += 	'<div class="background-prompt">此处内容已被隐藏，支付 ￥<span class="highlight">'+childNode.getAttribute("input-value")+'</span> 元可见</div>';
                        nodeHtml += 	'<div class="background-prompt"><i18n-t keypath="home.510" scope="global"><template #p1><span class="highlight">'+childNode.getAttribute("input-value")+'</span></template></i18n-t></div>';

                        //立即购买
                        nodeHtml += 	'<div class="submit-box" @click="onTopicUnhide_renderTemplate(50,'+null+','+topicId+');">'+t('home.520')+'</div>';
                        nodeHtml += '</div>';
                        childNode.innerHTML = nodeHtml;
                    }
                }
                //处理图片
                if(childNode.nodeName.toLowerCase() == "img" ){
                    let src = childNode.getAttribute("src");

                    childNode.removeAttribute("src");//将原节点src属性删除，防止多请求一次

                    let html = '';
                    let style = '';
                    if(childNode.getAttribute("width") != null){//如果是表情，表情图不放大
                        style = 'style="width: '+childNode.getAttribute("width")+'; height: '+childNode.getAttribute("height")+'"';
                        html = '<van-image src="'+store.apiUrl+src+'" '+style+' lazy-load ></van-image>';

                    }else{
                        html = '<van-image src="'+src+'" '+style+' lazy-load @click="onZoomPicture_renderTemplate(\''+src+'\')" @load="imageLoad_renderTemplate"></van-image>';

                    }
                    //创建要替换的元素
                //	let html = '<el-image src="'+src+'" '+style+' lazy></el-image>';
                //	let html = '<el-image src="'+src+'" '+style+' :preview-src-list=["http://127.0.0.1:8080/cms/common/tttttt/templates.jpg"] lazy hide-on-click-modal ></el-image>';



                //	let html = '<el-image src="backstage/images/null.gif" lazy></el-image>';
                    let placeholder = document.createElement('div');
                    placeholder.innerHTML = html;
                    let node = placeholder.childNodes[0];
                //	node.setAttribute("src",src);
                    childNode.parentNode.replaceChild(node,childNode);//替换节点
                }

                //处理表格 (解决Chrome内核浏览器DPI缩放比例高于100%时部分边框变粗问题，需要CSS配合)
                if(childNode.nodeName.toLowerCase() == "table" ){
                    childNode.removeAttribute("border");
                    childNode.removeAttribute("bordercolor");
                }



                //处理视频标签
                if(childNode.nodeName.toLowerCase() == "player" ){

                    let id = "player_"+random+"_"+i;
                    childNode.setAttribute("id",id);//设置Id
                    state.playerIdList.push(id);
                }

                //处理下载
                if(childNode.nodeName.toLowerCase() == "a" ){
                    let href = childNode.getAttribute("href")
                    let title = childNode.innerText;
                    let linkType = childNode.getAttribute("linkType")
                    let startUrl = store.apiUrl+"fileDowload?jump=";
                    if(linkType == "download" && href != ""){
                        let downloadHtml = "";
                        if(href.toLowerCase().startsWith(startUrl.toLowerCase())){
                            downloadHtml ='<span class="download" @click="onDownload_renderTemplate(`'+href+'`);"><Icon name="download-2-line" size="24px" class="link-icon"></Icon>'+escapeHtml(title)+'</span>';

                        }else{
                            downloadHtml ='<a class="download" href="'+href+'"><Icon name="download-2-line" size="24px" class="link-icon"></Icon>'+escapeHtml(title)+'</a>';
                        }
                        let downloadDom = document.createElement('div');
                        downloadDom.innerHTML=downloadHtml;

                        childNode.replaceWith(downloadDom.firstElementChild);
                    }

                }

                //处理 @提及 标签
                if(childNode.nodeName.toLowerCase() == "a" ){
                    let href = childNode.getAttribute("href")
                    let linkType = childNode.getAttribute("linkType");
                    if(linkType == "mention"){
                        childNode.removeAttribute("target");
                        if(href != ""){
                            childNode.setAttribute("href","/"+href)
                        }
                    }
                }

                //处理代码标签
                if(childNode.nodeName.toLowerCase() == "pre" ){


                    let firstChildNode = null;//第一个子节点

                    for(let p = 0;p < childNode.childNodes.length;p++){
                        let preChildNode = childNode.childNodes[p];
                        if(preChildNode.nodeName.toLowerCase() == "code" ){
                            firstChildNode = preChildNode;
                            break;
                        }
                    }

                    if(firstChildNode != null && firstChildNode.getAttribute("class")!= null && firstChildNode.getAttribute("class").indexOf("language-") != -1){//Markdown代码

                        let class_val = firstChildNode.className;
                        let lan_class = "";
                        let class_arr = new Array();
                        class_arr = class_val.split(' ');

                        for(let k=0; k<class_arr.length; k++){
                            let className = class_arr[k].trim();

                            if(className != null && className != ""){
                                if (className.lastIndexOf('language-', 0) === 0) {
                                    lan_class = className;
                                    break;
                                }
                            }
                        }
                        if(firstChildNode.getAttribute("class").indexOf("language-mermaid") == -1){
                            childNode.className = "line-numbers "+lan_class;
                            childNode.setAttribute("data-prismjs-copy",t('home.530'));//复制
                            childNode.setAttribute("data-prismjs-copy-error",t('home.540'));//按Ctrl+C复制
                            childNode.setAttribute("data-prismjs-copy-success",t('home.550'));//复制成功



                            let nodeHtml = "";

                            //删除code节点
                            let preChildNodeList = childNode.childNodes;
                            for(let p = 0;p < preChildNodeList.length;p++){
                                let preChildNode = preChildNodeList[p];
                                if(preChildNode.nodeName.toLowerCase() == "code" ){
                                    nodeHtml += preChildNode.innerHTML;
                                    preChildNode.parentNode.removeChild(preChildNode);
                                }

                            }

                            let dom = document.createElement('code');
                            dom.className = "line-numbers "+lan_class;
                            dom.innerHTML=nodeHtml;


                            childNode.appendChild(dom);
                        }
                    }


                    if(childNode.className != null && childNode.className.indexOf("lang-") != -1){//富文本编辑器代码

                        let pre_html = childNode.innerHTML;
                        let class_val = childNode.className;
                        let lan_class = "";

                        let class_arr = new Array();
                        class_arr = class_val.split(' ');

                        for(let k=0; k<class_arr.length; k++){
                            let className = class_arr[k].trim();

                            if(className != null && className != ""){
                                if (className.lastIndexOf('lang-', 0) === 0) {
                                    lan_class = className;
                                    break;
                                }
                            }
                        }

                        childNode.className = "line-numbers "+getLanguageClassName(lan_class);
                        childNode.setAttribute("data-prismjs-copy",t('home.530'));//复制
                        childNode.setAttribute("data-prismjs-copy-error",t('home.540'));//按Ctrl+C复制
                        childNode.setAttribute("data-prismjs-copy-success",t('home.550'));//复制成功


                        let nodeHtml = "";

                        //删除code节点
                        let preChildNodeList = childNode.childNodes;
                        for(let p = 0;p < preChildNodeList.length;p++){
                            let preChildNode = preChildNodeList[p];
                            if(preChildNode.nodeName.toLowerCase() == "code" ){
                                nodeHtml += preChildNode.innerHTML;
                                preChildNode.parentNode.removeChild(preChildNode);
                            }

                        }

                        let dom = document.createElement('code');
                        dom.className = "line-numbers "+getLanguageClassName(lan_class);
                        dom.innerHTML=nodeHtml;


                        childNode.appendChild(dom);
                    }




                }

                bindNode(childNode,topicId);


            }
        }
    }

    //创建占位播放器(有部分浏览器会对video标签进行劫持，使播放器显示在最顶层,上下滚动时会破坏界面结构)
    const createPlaceholderPlayer = () => {
        if(state.placeholder_DPlayer == ""){
            let dp_placeholder = new DPlayer({
                container: placeholderVideo.value,//播放器容器元素
                screenshot: false,//开启截图，如果开启，视频和视频封面需要开启跨域

                video: {
                    url: getPageBasePath()+'common/default/pc/video/placeholderVideo.mp4',//占位用，1帧的mp4视频。
                }
            });

            state.placeholder_DPlayer = dp_placeholder;
        }
    }
    //占位播放器播放
    const playPlaceholderPlayer = (playerId:string) => {
        if(state.placeholder_DPlayer != ""){
            if(state.lastPlayerId == playerId){
                state.placeholder_DPlayer.play();
            }
        }
    }

    //清空播放器
    const clearVideoPlayer = () => {
        for(let i=0; i< state.playerObjectList.length; i++){
            let playerObject = state.playerObjectList[i];

            playerObject.destroy();//销毁播放器
        }
        for(let i=0; i< state.playerHlsList.length; i++){
            let hls = state.playerHlsList[i];
            hls.destroy();//销毁视频流
        }

        if(state.placeholder_DPlayer != ""){
			state.placeholder_DPlayer.destroy();//销毁播放器
		}

        state.playerObjectList.length = 0;//清空数组
        state.playerHlsList.length = 0;//清空数组
        state.playerIdList.length = 0;//清空数组
        state.playerNodeList.length = 0;//清空数组
        state.placeholder_DPlayer = "";
        state.lastPlayerId = "";
    }


    //渲染视频播放器
    const renderVideoPlayer = () => {
        //占位播放器
        createPlaceholderPlayer();

        for(let i=0; i< state.playerIdList.length; i++){
            let playerId = state.playerIdList[i];
            let url = document.getElementById(playerId)?.getAttribute("url");
            let cover = document.getElementById(playerId)?.getAttribute("cover");//封面
            let thumbnail = document.getElementById(playerId)?.getAttribute("thumbnail");//缩略图
            //语言
            let lang = "en";
            if(store_currentLanguage.value == 'zh'){//语言 zh,en
                lang = 'zh-cn';
            }
            let dp = null as any;
            if(url == ""){//如果视频处理中
                dp = new DPlayer({
                    container: document.getElementById(playerId),//播放器容器元素
                    screenshot: false,//开启截图，如果开启，视频和视频封面需要开启跨域
                    lang:lang,
                    video: {

                    }
                });
                let dom = document.createElement('div');
                //视频处理中，请稍后再刷新
                dom.innerHTML="<div class='dplayer-process'><div class='box'><div class='prompt'>"+t('home.560')+"</div></div></div>";
                document.getElementById(playerId)?.appendChild(dom);
            }else{
                if(cover != undefined && cover != "" && thumbnail != undefined && thumbnail != ""){//切片视频
                    let hls = null;
                    dp = new DPlayer({
                        container: document.getElementById(playerId),//播放器容器元素
                        screenshot: false,//开启截图，如果开启，视频和视频封面需要开启跨域
                        lang:lang,
                        video: {
                            url: url,
                            pic: cover,//视频封面
                            thumbnails: thumbnail,//视频预览图
                            type: 'customHls',
                            customType: {
                                customHls: function (video:any, player:any) {
                                    hls = new Hls();
                                    hls.loadSource(video.src);
                                    hls.attachMedia(video);
                                    hls.config.xhrSetup = (xhr, url) => {

                                        if(url.startsWith(store.apiUrl+"videoRedirect?")){//如果访问视频重定向页
                                            //如果使用重定向跳转时会自动将标头Authorization发送到seaweedfs，seaweedfs会报501错误 A header you provided implies functionality that is not implemented
                                            //这里发送X-Requested-With标头到后端，让后端返回需要跳转的地址
                                            let videoRedirectDate = {} as any;
                                            nativeQueryVideoRedirect(url,function(date:any){
                                                if(store.systemUser != null && Object.keys(store.systemUser).length>0 && date.isLogin == false && date.isPermission == false){
                                                    //会话续期
                                                    nativeRefreshToken();
                                                    nativeQueryVideoRedirect(url,function(date:any){
                                                        videoRedirectDate = date;
                                                    });
                                                }else{
                                                    videoRedirectDate = date;
                                                }

                                            });

                                            if(videoRedirectDate != null && Object.keys(videoRedirectDate).length>0 && videoRedirectDate.redirect != ''){
                                                //告诉hls重新发送ts请求
                                                xhr.open("GET", videoRedirectDate.redirect, true);//用重定向后的地址请求
                                               // xhr.setRequestHeader("X-Requested-With", 'XMLHttpRequest');
                                            }
                                        }else{
                                            // 请求ts的url 添加参数 props.fileid
                                            //url = url + "?t=" + props.fileid;
                                            // 这一步必须 告诉hls重新发送ts请求
                                            xhr.open("GET", url, true);
                                            //xhr.setRequestHeader("X-Requested-With", 'XMLHttpRequest');
                                        }
                                    };
                                },
                            },
                        }
                    });
                    state.playerHlsList.push(hls);
                }else{
                    dp = new DPlayer({
                        container: document.getElementById(playerId),//播放器容器元素
                        screenshot: false,//开启截图，如果开启，视频和视频封面需要开启跨域
                        lang:lang,
                        video: {
                            url: url
                        }
                    });
                }

            }
            if(dp != null){
                dp.on('play', function () {//播放事件
                    state.lastPlayerId = dp.container.getAttribute('id');
                });
                dp.on('pause', function () {//暂停事件
                    playPlaceholderPlayer(dp.container.getAttribute('id'));
                });
            }
            state.playerObjectList.push(dp);
        }


        //添加播放器节点数据
        if(state.playerObjectList.length >0){

            for(let i=0; i< state.playerIdList.length; i++){
                let playerId = state.playerIdList[i];
                let node = document.getElementById(playerId);//节点对象
                state.playerNodeList.push(node);
            }
        }

    }


    //放大图片
    const onZoomPicture = (imagePath:string) => {
        ImagePreview({
            images:[
                imagePath
            ],
            showIndex:false,//是否显示页码
        });
    }

    //递归渲染绑定节点
    const renderBindNode = (node:any) => {
        //先找到子节点
        let nodeList = node.childNodes;
        for(let i = 0;i < nodeList.length;i++){
            //childNode获取到到的节点包含了各种类型的节点
            //但是我们只需要元素节点  通过nodeType去判断当前的这个节点是不是元素节点
            let childNode = nodeList[i];
            let random = Math.random().toString().slice(2);
            //判断是否是元素节点。如果节点是元素(Element)节点，则 nodeType 属性将返回 1。如果节点是属性(Attr)节点，则 nodeType 属性将返回 2。
            if(childNode.nodeType == 1){
                //处理代码标签
                if(childNode.nodeName.toLowerCase() == "pre" ){
                    let firstChildNode:any = null;//第一个子节点
                    for(let p = 0;p < childNode.childNodes.length;p++){
                        let preChildNode = childNode.childNodes[p];
                        if(preChildNode.nodeName.toLowerCase() == "code" ){
                            firstChildNode = preChildNode;
                            break;
                        }
                    }

                    if(firstChildNode != null && firstChildNode.getAttribute("class")!= null){
                        if(firstChildNode.getAttribute("class") != null && firstChildNode.getAttribute("class").indexOf("language-mermaid") != -1){

                            if(firstChildNode.innerHTML){
                                  //  const { svg } = await mermaid.render('mermaid_'+random, unescapeHtml(firstChildNode.innerHTML));

                              //  childNode.innerHTML = svg;

                              const mermaid_container = document.createElement('div')
                                mermaid_container.style.lineHeight = 'initial' //重置行高

                                childNode.replaceWith(mermaid_container);
                                mermaid.render(
                                    'mermaid_'+random,
                                    unescapeHtml(firstChildNode.innerHTML),
                                    // @ts-ignore
                                    mermaid_container
                                ).then((svgCode) => {
                                    // @ts-ignore
                                    mermaid_container.innerHTML = svgCode.svg

                                })
                                .catch((err) => {
                                // console.error(err);
                                })
                            }
                        }else if(firstChildNode.getAttribute("class").indexOf("language-mermaid") != -1){

                        }else{
                            Prism.highlightAllUnder(childNode);
                        }
                    }



                }else if(childNode.nodeName.toLowerCase() == "span"){
                    if(childNode.getAttribute("class") != null && childNode.getAttribute("class").indexOf("math-inline") != -1 && childNode.childNodes.length==1 && childNode.childNodes[0].nodeType ==3){
                        let tex = katex.renderToString(unescapeHtml(childNode.innerHTML), {
                            throwOnError: false,
                            displayMode:false//内联模式
                        });
                        childNode.innerHTML = tex;
                    }
                }else if(childNode.nodeName.toLowerCase() == "div"){
                    if(childNode.getAttribute("class") != null && childNode.getAttribute("class").indexOf("math-display") != -1 && childNode.childNodes.length==1 && childNode.childNodes[0].nodeType ==3){
                        let tex = katex.renderToString(unescapeHtml(childNode.innerHTML), {
                            throwOnError: false,
                            displayMode:true//块模式
                        });
                        childNode.innerHTML = tex;

                    }
                }
                renderBindNode(childNode);
            }
        }
    }

    //话题解锁
    const onTopicUnhide = (hideType: number,hidePassword: string,topicId:string) => {
        let formData = new FormData();
        formData.append('topicId', topicId);
        formData.append('hideType',  String(hideType));
        if(hideType == 10){
            if(hidePassword != undefined && hidePassword != ""){
                formData.append('password',  hidePassword);
            }else{
                Notify({
                    type: 'danger',
                    message: t('home.570')//密码不能为空
                });

                return;
            }
        }

        Dialog.confirm({
            message:t('home.580'),//确定解锁?
        })
        .then(() => {
            proxy?.$axios({
                url: '/user/control/topic/unhide',
                method: 'post',
                data: formData
            })
            .then((response: AxiosResponse) => {
                if(response){

                    const result: any = response.data;

                    if(JSON.parse(result.success)){
                        Notify({
                            type: 'success',
                            message: t('home.590')//话题解锁成功
                        });
                        //查询动态
                        if(state.user.userName != store_systemUser.value.userName){//如果查询用户自已的动态，则不显示
                            onRefresh()
                        }
                    }else{
                        //处理错误信息
                        processErrorInfo(result.error as Map<string,string> ,  error,()=>{});

                    }
                }
            })
            .catch((error: any) =>{
                console.log(error);
            });
        })
        .catch(() => {
            // on cancel
        });
    }

    //“阅读更多”功能处理
    const readMoreProcess = () => {
		if(state.userDynamicList != null && state.userDynamicList.length >0){
            for(let i:number=0; i<state.userDynamicList.length; i++){
                let userDynamic = state.userDynamicList[i];
                let refValue =  (proxy?.$refs['readMore_'+userDynamic.id] as any);

                if(state.isReadMoreText.get(userDynamic.id) == false){//如果已经展开
                    if(refValue && refValue[0]){
                        refValue[0].children[0].removeAttribute("style");
                        let height = refValue[0].children[0].offsetHeight;
                        refValue[0].children[0].setAttribute('style', 'max-height: none; height: '+state.collapsedHeight+'px;');

                        setTimeout(function () {
                            refValue[0].children[0].setAttribute('style', 'max-height: none; height: '+height+'px;');
                        }, 0);

                    }
                    continue;
                }

                if(refValue && refValue[0]){

                    if (typeof window.getComputedStyle != "undefined"){
                        let height = window.getComputedStyle(refValue[0]).height;
                        if(parseInt(height) > state.collapsedHeight){
                            state.isReadMoreText.set(userDynamic.id,true);
                            refValue[0].children[0].setAttribute('style', 'max-height: none; height: '+state.collapsedHeight+'px;');

                        }
                    }
                }
            }
        }
	}
    //“阅读更多”功能点击
    const readMoreClick = (userDynamicId:string) => {
        let refValue =  (proxy?.$refs['readMore_'+userDynamicId] as any);
		if(state.isReadMoreText.get(userDynamicId) == true){
            state.isReadMoreText.set(userDynamicId,false);

            if(refValue && refValue[0]){
                refValue[0].children[0].removeAttribute("style");
                let height = refValue[0].children[0].offsetHeight;
                refValue[0].children[0].setAttribute('style', 'max-height: none; height: '+state.collapsedHeight+'px;');

                setTimeout(function () {
                    refValue[0].children[0].setAttribute('style', 'max-height: none; height: '+height+'px;');
                }, 0);

            }
        }else{
            if(refValue && refValue[0]){
                refValue[0].children[0].setAttribute('style', 'max-height: none; height: '+state.collapsedHeight+'px;');
            }
            state.isReadMoreText.set(userDynamicId,true)
        }
	}

    //图片加载成功触发事件
    const onImageLoad = (e:Event) => {
        readMoreProcess();
    }

    //接收子组件消息
    const receive_unreadMessage = (unreadMessage:UnreadMessage) => {
        state.unreadMessage = unreadMessage;
    }

    //导航守卫
    onBeforeRouteUpdate((to, from, next) => {
        if(to.name == 'home'){
            if(to.query.userName != undefined){
                state.userName =to.query.userName as string;
            }
            //删除缓存
            store.setCacheNumber(to.name)
        }

        next();
    });

    onMounted(()=>{
        //获取URL中的参数
        state.userName = router.currentRoute.value.query.userName != undefined ? router.currentRoute.value.query.userName as string : '';

        init(state.userName != '' ? state.userName: store_systemUser.value.userName);

    });


    //初始化
    const init = (userName:string) => {

        queryHome(userName, () =>{
           // if(state.user.userName != store.state.systemUser.userName){//如果查询用户自已的动态，则不显示
               // queryUserDynamicList(userName,page);
           // }
        });//查询用户中心

        queryFollowerCount(userName);//查询粉丝总数

        queryFollowing(userName);//查询是否已关注该用户

        //设置缓存
        store.setCacheComponents(String(router.currentRoute.value.name))

    }

    //进入keep-alive组件时触发
    onActivated(()=>{
        //后退时修改浏览器标题
        let titleValue = store_title.value
        if(titleValue != null && titleValue != ''){
            document.title = t('home.420')+' - ' + titleValue;//用户中心
        }
    })
</script>

<style scoped lang="scss">
.homeModule{
    padding-bottom: 50px;
    .homeHeader{
        position: relative;
        background: var(--van-blue);
        min-height: 160px;
        border-radius: 0px 0px 5% 5%;
        .user{
            padding-left:100px;
            padding-top:15px;
            font-size:12px;
            padding-bottom: 46px;
            color:#fff;
            user-select:none;
            line-height:30px;
            .avatar{
                position:absolute;
                left:10px;
                top:15px;
                display:inline-block;
                background-size:212px 645px;
                font-size:74px;
            }
            .avatarImg{
                position:absolute;left:15px;top:15px;display:inline-block;border-radius:100%;
                img{
                    border-radius:100%;box-shadow: 0 0 0 1px #26a2ff,0 0 0 2px #fff;
                    width: 72px;
                }
            }
            .userName{
                line-height:20px;
                margin:3px 0;
                font-size:16px;
            }
            .nickname{
                line-height:20px;
                margin:5px 0;
                font-size:17px;
                font-weight:bold;
            }
            .userRoleName{
                font-style:normal;
                margin-left:5px;
                white-space:nowrap;
                color: #b25c1e;
                background-color:#ffe29b;
             //   color: #d48529;
             //   background-color:#f9d892;

                border-radius:4px;
                padding:2px 5px 0px;
                font-size: 14px;
            }
            .grade{
                line-height:25px;
                background-repeat:no-repeat;
                background-position:left center;
                background-size:auto 100%;
                font-size:12px;
                height:23px;
                min-width:40px;
                display:inline-block;
                background-color:rgba(86,183,255, 0.5);
               /** background-color:#56b7ff; */
                border-radius:20px;
                text-align:center;
                padding-left: 10px;
                padding-right: 10px;
            }
            .staff{
                line-height:25px;
                background-repeat:no-repeat;
                background-position:left center;
                background-size:auto 100%;
                font-size:12px;
                height:23px;
                min-width:40px;
                display:inline-block;
                color:#4CD263;
                background-color:#cafcc7;
               /** background-color:#56b7ff; */
                border-radius:20px;
                text-align:center;
                padding-left: 10px;
                padding-right: 10px;
            }
            .ipAddress{
                line-height:20px;
                margin:5px 0;
                font-weight:normal;
                .icon{
                    position: relative;
                    top: 2px;
                    margin-right: 3px;
                }
                .ipAddressText{
                    font-size:14px;
                }
            }
        }
        .setting{
            position: absolute;
            right: 12px;top: 12px;
            font-size: 20px;
            color: #fff;
        }
        .privateMessageBox{
            position: absolute;
            right: 15px;
            bottom: 8px;
        }
        /* 快捷标签 */
        .quickTag{
            position: absolute;
            bottom: -25px;
            left: 0px;
            right: 0px;
            height:70px;


            .quickTag-container{
                margin-left: var(--van-cell-group-inset-padding);
                margin-right: var(--van-cell-group-inset-padding);
                height: 100%;
                background:#fff;
                border-radius: var(--van-border-radius-lg);
                .item{
                    position:relative;
                    float:left;
                    width:25%;
                    text-align:center;
                    font-size: 14px;
                    color: #666;
                    i{
                        display:block;margin:10px auto 5px;font-size:27px;
                    }
                    .total{
                        font-size:18px;font-style:normal;line-height: 26px;
                    }
                    .number{
                        position:absolute;
                        top: 8px;
                        left: 55%;
                    }
                }
            }
        }

    }
    .privateMessageButton{
        color: #fff;
        border-color: #fff;
        outline: none;
        display: inline-block;
        padding: 0 16px;
        font-size: 14px;
        line-height: 32px;
        text-align: center;
        cursor: pointer;
        background: none;
        border: 1px solid;
        border-radius: 3px;
        margin: 0;
        margin-left: 8px;
    }
    .followButton{
        color: #fff;
        border-color: #fff;
        outline: none;
        display: inline-block;
        padding: 0 16px;
        font-size: 14px;
        line-height: 32px;
        text-align: center;
        cursor: pointer;
        background: none;
        border: 1px solid;
        border-radius: 3px;
        margin: 0;

    }
    /* 用户设置 */
    .userSettingInfo{
	    padding-top: 10px;
        padding-bottom: 10px;
        margin-left: 3px;
        margin-right: 3px;
        .icon{
            position: relative;
            top: 2px;
            right: 4px;
        }
    }
    .skeleton{
        margin-top: 16px;
    }
    .homeMenu{
        margin-top:33px;
        margin-left: var(--van-cell-group-inset-padding);
        margin-right: var(--van-cell-group-inset-padding);
        margin-bottom: var(--van-cell-group-inset-padding);
        :deep(.van-grid){
            border-radius: 8px;
            overflow: hidden;
        }
        :deep(.van-icon){
            color: var(--van-blue);
            position: relative;
            top: 2px;
        }
        :deep(.van-grid-item__text) {
            font-size: 14px;
            margin-left: 2px;
            margin-right: 2px;
        }
        :deep(.van-grid-item__text_badge) {
            margin-top: 4px;
        }
        :deep(.van-grid-item__content--center) {
            justify-content: flex-start;
        }

        :deep([class*=van-hairline]:after) {
            border: 0 solid transparent;
        }
        :deep(.van-grid-item__content) {
            padding: 16px 0px;
        }
    }
    .userDynamicModule{
        margin: var(--van-cell-group-inset-padding) var(--van-cell-group-inset-padding) 58px var(--van-cell-group-inset-padding);
        .item{
            padding: 12px 12px 12px 12px;
            margin-bottom: 8px;
            border-radius: var(--van-border-radius-lg);
            background: #fff;
            position: relative;
            .top-container{
                display: flex;
                align-items:center;
                .left-layout{
                    .avatarImg{
                        img {
                            width: 40px;
                            height: 40px;
                            border-radius:40px;
                            vertical-align: middle;
                        }
                    }
                }
                .middle-layout{
                    flex: 1;
                    margin-left: 10px;
                    margin-right: 10px;
                    .userInfo{
                        display: flex;
                        align-items: center;
                        flex-wrap: wrap;
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
                            left: -5px;
                            margin-top: 2px;
                            margin-bottom: 2px;
                        }
                        .cancelNickname{
                            font-weight:normal;
                            margin-right: 3px;
                            color: transparent;
                            text-shadow: 0 0 5px rgba(0,0,0,0.4);
                            zoom: 1;
                            user-select:none;
                        }
                        .account{
                            color: var(--van-gray-7);
                            margin-right: 5px;
                            position: relative;
                            top: -2px;
                        }
                        .userRoleName{
                            display: inline-block;
                            white-space:nowrap;
                            vertical-align: middle;
                            padding: 3px 4px;
                            margin-right: 5px;
                            margin-bottom: 5px;
                            font-size: 12px;
                            line-height: 12px;
                            -webkit-border-radius: 2px;
                            -moz-border-radius: 2px;
                            border-radius: 2px;
                            color:#e2b46e;
                            background-color:#f8e7c4;
                            position: relative;
                            top: 1px;
                        }
                        .staff{
                            display: inline-block;
                            white-space:nowrap;
                            vertical-align: middle;
                            padding: 3px 4px;
                            margin-right: 5px;
                            margin-bottom: 5px;
                            font-size: 12px;
                            line-height: 12px;
                            -webkit-border-radius: 2px;
                            -moz-border-radius: 2px;
                            border-radius: 2px;
                            color:#4CD263;
                            background-color:#cafcc7;
                            position: relative;
                            top: 1px;
                        }
                        .time{
                            width:100%;
                            color: var(--van-gray-6);
                            font-size: 12px;
                            margin-top: 3px;
                        }
                    }

                }
            }
            .middle-container{
                margin-top: 10px;
                .topicTitle{
                    padding:0px;word-wrap:break-word;margin-top: 5px;
                    font-size:0;/*父级元素设置font-size:0; 解决 display：inline-block两个元素之间的默认空格 */
                    .info{
                        background-color: var(--van-gray-2);
                        border-radius: 4px;
                        color: var(--van-gray-7);
                        font-size: 13px;
                        padding: 5px 8px 5px 8px;
                        line-height: 32px;
                    }
                    a{
                        color: var(--van-blue);
                        font-size: 15px;
                        line-height: 32px;
                        margin-left: 5px;
                    }
                    .hideTagType{
                        font-size:0;/*父级元素设置font-size:0; 解决 display：inline-block两个元素之间的默认空格 */
                        position:relative;
                        top:-4px;
                        .circle{
                            border-radius:12px;display: inline-block;margin-left:5px;
                            width: 24px;height: 24px;
                            position:relative;
                            .icon{
                                margin-left: 5px;position:relative;top:4px;
                            }
                        }
                        .point{
                            &:before{
                                content: ' ';
                                position: absolute;
                                width: 4px;
                                height: 4px;
                                border-radius: 2px;
                                top: 13px;
                                left: 10px;
                            }
                        }
                    }
                    .hide_10{
                        .circle{
                            background: #ebebeb;
                            .icon{
                                color: #b2b2b2;
                            }
                        }
                        .point{
                            &:before{
                                background-color: #ebebeb;
                            }
                        }
                    }
                    .hide_20{
                        .circle{
                            background: #bbf9d5;
                            .icon{
                                color: #21de70;
                            }
                        }
                        .point{
                            &:before{
                                background-color: #bbf9d5;
                            }
                        }
                    }
                    .hide_30{
                        .circle{
                            background: #bfebfb;
                            .icon{
                                color: #27c3fc;
                            }
                        }
                            .point{
                            &:before{
                                background-color: #bfebfb;
                            }
                            }
                    }
                    .hide_40{
                        .circle{
                            background: #e2cffe;
                            .icon{
                                color: #af82f2;
                            }
                        }
                        .point{
                            &:before{
                                background-color: #e2cffe;
                            }
                        }
                    }
                    .hide_50{
                        .circle{
                            background: #fedbb2;
                            .icon{
                                color: #fe9d2d;
                            }
                        }
                        .point{
                            &:before{
                                background-color: #fedbb2;
                            }
                        }
                    }


                }

                :deep(.topicMarkdownContent){
                    margin-left: 12px;
                    margin-right: 12px;
                    padding-bottom: 20px;
                    color:var(--van-gray-8);
                    font-size:16px;
                    line-height:1.75;
                    word-wrap:break-word;
                    min-height: 100px;
                    //自动换行
                    pre{
                        white-space:pre-wrap;
                    }

                    ol{
                        list-style: decimal;
                    }
                    ol li{
                        list-style-type:decimal;
                        list-style-position:inside;
                    }
                    ul{
                        list-style: disc;
                    }
                    // ul li{
                        //   list-style-type:disc;
                    //  }
                    .task-list-item {
                        list-style-type:none;
                    }
                    a{
                        color: var(--van-blue);
                        font-size:16px;
                    }
                    p{
                        font-size:16px;
                        word-wrap:break-word
                    }
                    img{
                        max-width:100%;height:auto;border:none;background:none;margin:0;padding:0;
                        cursor: -webkit-zoom-in;
                        cursor: zoom-in;
                        vertical-align: sub;
                    }
                    .van-image[style*="width: 32px; height: 32px;"]{
                        top: 3px;
                    }
                    code[class*="language-"]{
                        padding: 0 0;
                    }
                    .download{
                        color: #1890ff;
                        margin: 0 5px 0 5px;
                        cursor: pointer;
                        .link-icon {
                            position: relative;
                            top: 4px;
                            margin-right: 2px;
                            color:#1890ff;
                            width: 20px; height: 20px;
                        }
                    }
                    /** 解决Chrome内核浏览器DPI缩放比例高于100%时部分边框变粗问题   本方案需删除table样式 border="1" bordercolor="#000000" */
                    table {
                        border-collapse: separate;
                        border-spacing: 0;
                        border-top: 1px solid var(--van-gray-3);
                        border-left: 1px solid var(--van-gray-3);
                        th {
                            font-weight: 600
                        }
                        th, td {
                            border-right: 1px solid var(--van-gray-3);
                            border-bottom: 1px solid var(--van-gray-3);
                            padding: 6px 13px
                        }
                        tr {
                            background-color: #fff;
                            border-top: 1px solid var(--van-gray-3);
                            &:nth-child(2n) {
                                background-color: var(--van-gray-1);
                            }
                        }
                    }
                    ol{
                        li{
                            list-style-type:decimal;
                            list-style-position:inside;
                        }
                    }
                    ul{
                        li{
                            margin-left:20px;
                            list-style-type:disc;
                        }
                    }
                    iframe{
                        width:100%; height: 300px;padding:10px 0px;
                    }
                    player{
                        width: 100%;
                        height: 576px;
                        display: block;
                        margin-top: 10px;
                        margin-bottom: 10px;
                        //关闭页面全屏按钮
                        .dplayer-full-in-icon{
                            display: none !important;
                        }
                    }
                    .dplayer-process {
                        position: absolute;
                        top: 0;
                        bottom: 0;
                        left: 0;
                        right: 0;
                        z-index: 10;
                        .box{
                            position: relative;
                            width: 100%;
                            height: 100%;
                            .prompt{
                                width: 250px;
                                height: 80px;
                                position: absolute;
                                left: 0;
                                top: 0;
                                right: 0;
                                bottom: 0;
                                margin: 100px auto;
                                padding :0px 30px;
                                border-radius :3px;
                                color: #fff;
                                line-height: 80px;
                                font-size: 20px;
                                background-color:rgb(0,0,0);
                                opacity:0.7;
                                filter:alpha(opacity=70);
                                text-align: center;
                            }
                        }
                    }

                    hide{
                        display:block;
                        background: var(--van-gray-1);
                        min-height:80px;
                        margin-top: 17px;
                        margin-bottom: 15px;
                        border: 3px dashed var(--van-gray-3);
                        border-radius: 5px;
                        .hide-box{
                            margin: 20px;position: relative;text-align: center;
                        }
                        .background-image{
                            margin: auto;
                            color: var(--van-gray-4);
                        }
                        .background-prompt{
                            margin-top: 5px; color: var(--van-gray-5);font-size: 16px;
                        }
                        .highlight{
                            font-weight:bold;
                        }
                        .input-box{
                            pointer-events: none;
                            margin: auto;
                            margin-top: 10px;
                            margin-bottom:25px;
                            border:var(--van-gray-7) solid 2px;
                            width:226px;
                            height:26px;
                            // overflow:hidden;
                            border-radius: 2px;
                            position: relative;
                            &:hover{
                                border:var(--van-gray-8) solid 2px;
                                .button{
                                    border:transparent solid 0px;
                                    background:var(--van-gray-8);
                                }
                            }
                            .text{
                                pointer-events:auto;
                                width:145px;
                                height:26px;
                                line-height:26px;
                                border:0;
                                float:left;
                                font-size:14px;
                                color:var(--van-gray-8);
                                text-indent: 6px;
                                vertical-align:middle;
                                outline:none;
                                background: var(--van-gray-1);
                            }
                            .button{
                                position: absolute;
                                top: -1px;
                                right: -2px;
                                pointer-events:auto;
                                display: inline-block;
                                white-space:nowrap;
                                width:80px;
                                height:28px;
                                vertical-align: middle;
                                font-size: 15px;
                                line-height: 28px;
                                -webkit-border-radius: 0px 2px 2px 0px;
                                -moz-border-radius: 0px 2px 2px 0px;
                                border-radius: 0px 2px 2px 0px;
                                color:#fff;
                                background-color:var(--van-gray-7);
                                cursor:pointer;
                                user-select:none;
                                &:hover{
                                    background:var(--van-gray-8);
                                }
                            }
                        }
                        .submit-box{
                            margin-top: 10px;
                            margin-bottom:5px;
                            display: inline-block;
                            white-space:nowrap;
                            width:80px;
                            height:30px;
                            vertical-align: middle;
                            font-size: 15px;
                            line-height: 30px;
                            -webkit-border-radius: 2px;
                            -moz-border-radius: 2px;
                            border-radius: 2px;
                            color:#fff;
                            background-color:var(--van-gray-7);
                            cursor:pointer;
                            user-select:none;
                            &:hover{
                                background:var(--van-gray-8);
                            }
                        }
                        .input-box{
                            .text::-webkit-input-placeholder {
                                color: var(--van-gray-7);
                            }
                            .text:-ms-input-placeholder {
                                color: var(--van-gray-7);
                            }
                            .text:-moz-placeholder {
                                color: var(--van-gray-7);
                            }
                            .text::-moz-placeholder {
                                color: var(--van-gray-7);
                            }
                        }
                    }
                }
                :deep(.topicContent){
                    padding:0px;
                    word-wrap:break-word;
                    color:var(--van-gray-8);
                    font-size:16px;
                    line-height:1.75;
                    margin-top:12px;
                    p{
                        font-size:16px;
                        word-wrap:break-word;
                    }
                    img{
                        max-width:100%;
                        height:auto;
                        border:none;
                        background:none;
                        margin:0;
                        padding:0;
                        vertical-align: sub;
                    }
                    .van-image[style*="width: 32px; height: 32px;"]{
                        top: 3px;
                    }
                    a[linkType*="mention"] {
                        color: #409eff;
                    }
                    .download{
                        color: #1890ff;
                        margin: 0 5px 0 5px;
                        cursor: pointer;
                        .link-icon {
                            position: relative;
                            top: 4px;
                            margin-right: 2px;
                            color:#1890ff;
                            width: 20px; height: 20px;
                        }
                    }
                    /** 解决Chrome内核浏览器DPI缩放比例高于100%时部分边框变粗问题   本方案需删除table样式 border="1" bordercolor="#000000" */
                    table {
                        border-collapse: separate;
                        border-spacing: 0;
                        border-top: 1px solid var(--van-gray-3);
                        border-left: 1px solid var(--van-gray-3);
                        th {
                            font-weight: 600
                        }
                        th, td {
                            border-right: 1px solid var(--van-gray-3);
                            border-bottom: 1px solid var(--van-gray-3);
                            padding: 6px 13px
                        }
                        tr {
                            background-color: #fff;
                            border-top: 1px solid var(--van-gray-3);
                            &:nth-child(2n) {
                                background-color: var(--van-gray-1);
                            }
                        }
                    }
                    ol{
                        li{
                            list-style-type:decimal;
                            list-style-position:inside;
                        }
                    }
                    ul{
                        li{
                            margin-left:20px;
                            list-style-type:disc;
                        }
                    }
                    iframe{
                        width:100%; height: 550px;padding:10px 0px;
                    }
                    pre{
                        white-space:pre-wrap;
                    }
                    player{
                        width: 100%;
                        height: 576px;
                        display: block;
                        margin-top: 10px;
                        margin-bottom: 10px;
                        //关闭页面全屏按钮
                        .dplayer-full-in-icon{
                            display: none !important;
                        }
                        .cover{
                            max-height: 100%;
                            max-width: 100%;
                            width: auto;
                            height: auto;
                            position: absolute;
                            top: 0;
                            bottom: 0;
                            left: 0;
                            right: 0;
                            margin: auto;
                        }
                        .buttonCircle{
                            display: inline-block;
                            position: absolute;
                            top: 0;
                            bottom: 0;
                            left: 0;
                            right: 0;
                            margin: auto;
                            line-height:270px;
                            border-radius:30px;
                            width: 60px;
                            height: 60px;
                            background-color: rgba(0,0,0,0.5);
                        }
                        .iconBox{
                            display: block;
                            position: relative;
                            width: 60px;
                            height: 60px;
                            .playIcon{
                                font-size: 30px;
                                position: absolute;
                                line-height:22px;
                                width: 22px;
                                height: 22px;
                                top: 0;
                                bottom: 0;
                                left: -5px;
                                right: 0;
                                margin: auto;
                                color: #fff;
                            }
                        }
                    }
                    .dplayer-process {
                        position: absolute;
                        top: 0;
                        bottom: 0;
                        left: 0;
                        right: 0;
                        z-index: 99;
                        .box{
                            position: relative;
                            width: 100%;
                            height: 100%;
                            .prompt{
                                width: 250px;
                                height: 180px;
                                position: absolute;
                                left: 0;
                                top: 0;
                                right: 0;
                                bottom: 0;
                                margin: auto;
                                padding :0px 30px;
                                border-radius :3px;
                                color: #fff;
                                line-height: 50px;
                                font-size: 16px;
                                background-color:rgb(0,0,0);
                                opacity:0.7;
                                filter:alpha(opacity=70);
                                text-align: center;
                            }
                        }
                    }
                    hide{
                        display:block;
                        background: var(--van-gray-1);
                        min-height:100px;
                        margin-top: 17px;
                        margin-bottom: 15px;
                        border: 3px dashed var(--van-gray-3);
                        border-radius: 5px;
                        .hide-box{
                            margin: 20px;position: relative;text-align: center;
                        }
                        .background-image{
                            margin: auto;
                            color: var(--van-gray-4);
                        }
                        .background-prompt{
                            margin-top: 5px; color: var(--van-gray-5);font-size: 16px;
                        }
                        .highlight{
                            font-weight:bold;
                        }
                        .input-box{
                            pointer-events: none;
                            margin: auto;
                            margin-top: 10px;
                            margin-bottom:25px;
                            border:var(--van-gray-7) solid 2px;
                            width:226px;
                            height:26px;
                            // overflow:hidden;
                            border-radius: 2px;
                            position: relative;

                            &:hover{
                                border:var(--van-gray-8) solid 2px;
                                .button{
                                    border:transparent solid 0px;
                                    background:var(--van-gray-8);
                                }
                            }
                            .text{
                                pointer-events:auto;
                                width:145px;
                                height:26px;
                                line-height:26px;
                                border:0;
                                float:left;
                                font-size:14px;
                                color:var(--van-gray-8);
                                text-indent: 6px;
                                vertical-align:middle;
                                outline:none;
                                background: var(--van-gray-1);
                                &::-webkit-input-placeholder {
                                    color: var(--van-gray-7);
                                }
                                &:-ms-input-placeholder {
                                    color: var(--van-gray-7);
                                }
                                &:-moz-placeholder {
                                    color: var(--van-gray-7);
                                }
                                &::-moz-placeholder {
                                    color: var(--van-gray-7);
                                }
                            }
                            .button{
                                position: absolute;
                                top: -1px;
                                right: -2px;
                                pointer-events:auto;
                                display: inline-block;
                                white-space:nowrap;
                                width:80px;
                                height:28px;
                                vertical-align: middle;
                                font-size: 15px;
                                line-height: 28px;
                                -webkit-border-radius: 0px 2px 2px 0px;
                                -moz-border-radius: 0px 2px 2px 0px;
                                border-radius: 0px 2px 2px 0px;
                                color:#fff;
                                background-color: var(--van-gray-7);
                                cursor:pointer;
                                user-select:none;
                                &:hover{
                                    background:var(--van-gray-8);
                                }
                            }
                        }

                        .submit-box{
                            margin-top: 10px;
                            margin-bottom:5px;
                            display: inline-block;
                            white-space:nowrap;
                            width:80px;
                            height:30px;
                            vertical-align: middle;
                            font-size: 15px;
                            line-height: 30px;
                            -webkit-border-radius: 2px;
                            -moz-border-radius: 2px;
                            border-radius: 2px;
                            color:#fff;
                            background-color:var(--van-gray-7);
                            cursor:pointer;
                            user-select:none;
                            &:hover{
                                background:var(--van-gray-87);
                            }
                        }
                    }
                }
                :deep(.commentContent){
                    padding:0px;
                    word-wrap:break-word;
                    color:var(--van-gray-8);
                    font-size:16px;
                    line-height:1.75;
                    margin-top:12px;
                    p{
                        font-size:16px;
                        word-wrap:break-word;
                    }
                    a[linkType*="mention"] {
                        color: #409eff;
                    }
                    img{
                        max-width:100%;
                        height:auto;
                        border:none;
                        background:none;
                        margin:0;
                        padding:0;
                        vertical-align: sub;
                    }
                    .van-image[style*="width: 32px; height: 32px;"]{
                        top: 3px;
                    }
                    .download{
                        color: #1890ff;
                        margin: 0 5px 0 5px;
                        cursor: pointer;
                        .link-icon {
                            position: relative;
                            top: 4px;
                            margin-right: 2px;
                            color:#1890ff;
                            width: 20px; height: 20px;
                        }
                    }
                }
                .quoteContent{
                    position: relative;
                    margin: 20px 0px 0px 0px;
                    padding: 15px;
                    border-radius: 3px;
                    background: var(--van-gray-1);
                    border: 1px solid var(--van-gray-3);
                    &:before{
                        position: absolute;
                        content: '';
                        width: 0;
                        height: 0;
                        top: -7px;
                        border-width: 0 7px 7px 7px;
                        border-style: solid;
                        border-color: transparent transparent var(--van-gray-1) transparent;
                        z-index: 1
                    }
                    &:after{
                        position: absolute;
                        content: '';
                        width: 0;
                        height: 0;
                        top: -8px;
                        border-width: 0 7px 7px 7px;
                        border-style: solid;
                        border-color: transparent transparent var(--van-gray-3) transparent
                    }
                    .text{
                        color:var(--van-gray-7);
                        line-height:1.75;
                        font-size: 16px;
                    }
                }
                .replyContent{
                    padding:0px;
                    word-wrap:break-word;
                    color:var(--van-gray-8);
                    font-size:16px;
                    line-height:1.75;
                    margin-top:12px;
                    p{
                        font-size:16px;
                        word-wrap:break-word;
                    }
                }
            }
            .bottom-container{
                margin-top: 15px;
                .layout{
                    color: var(--van-gray-6);
                    line-height: 26px;
                    position: relative;
                    bottom: -5px;
                    .viewText{
                        margin-right: 10px;
                    }
                    .icon{
                        position: relative;
                        top: 2px;
                    }
                    .commentTotal{
                        margin-left: 2px;
                        margin-right: 12px;
                    }
                    .viewTotal{
                        margin-left: 2px;
                        margin-right: 12px;
                    }
                    .favoriteTotal{
                        margin-left: 2px;
                        margin-right: 12px;
                    }
                    .likeTotal{
                        margin-left: 2px;
                        margin-right: 12px;
                    }

                }
            }
        }
    }
    //阅读更多
    :deep(.collapsedContainer){
        transition: height 300ms;
        overflow: hidden;
        display: block;
        width: 100%;

    }
    :deep(.readMore){
        position: relative;
        display: block;
        color: #FF7D00;
        text-align:center;
        height: 65px;
        line-height:110px;
        font-size:15px;
        margin-top: -65px;
        user-select: none;
        cursor: pointer;
        background-image: -webkit-gradient(linear,left top, left bottom,from(rgba(255,255,255,0)),color-stop(70%, #fff));
        background-image: linear-gradient(-180deg,rgba(255,255,255,0) 0%,#fff 70%);
        z-index: 100;//要比视频播放器的“视频处理中，请稍后再刷新”层要高
    }
    :deep(.shrinkMore){
        position: relative;
        display: block;
        color: #FF7D00;
        text-align:center;
        height: 30px;
        line-height:30px;
        font-size:15px;
        margin-top: 10px;
        user-select: none;
        cursor: pointer;
    }

}
</style>
