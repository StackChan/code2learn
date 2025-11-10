<!--话题内容-->
<template>
    <div class="main">
        <div class="main-container">
            <van-sticky>
                <!--title="话题" left-text="返回"-->
                <van-nav-bar :title="t('thread.10')" :left-text="t('common.110')" left-arrow @click-left="onBack" @click-right="router.push({path: '/index'})">
                    <template #right>
                        <van-icon name="wap-home-o" :size="convertViewportWidth('18px')"/>
                    </template>
                </van-nav-bar>
            </van-sticky>
            <!-- 占位播放器 -->
            <div ref ="placeholderVideo" style="width: 0px;height: 0px;"></div>
            <!-- success-text="刷新成功" -->
            <van-pull-refresh v-model="state.isRefreshing" :success-text="t('common.130')" pull-distance="200" :disabled="isPopupWindow()" @refresh="onRefresh">
                <div class="head" v-if="store_topicDetailPermission == false">
                    <!-- description="您没有本话题的访问权限" -->
                    <van-empty :description="t('thread.20')" />
                </div>
                <div class="topicContentModule" v-if="store_topicDetailPermission == true">
                    <div class="head" v-if="state.topic != null && Object.keys(state.topic).length>0">
                        <div class="container">
                            <div class="left-layout" v-if="!state.isTopicSkeleton">
                                <router-link v-if="state.topic.account != null && state.topic.account != ''" tag="a" :to="{path:'/user/control/home',query: {userName: state.topic.userName}}">
                                    <span class="avatarImg">
                                        <img v-if="state.topic.avatarName != null" :src="state.topic.avatarPath+'100x100/'+state.topic.avatarName" class="img">

                                        <img v-if="state.topic.avatarName == null" :src="state.topic.avatar" class="img"/>
                                    </span>
                                </router-link>
                                <template v-if="state.topic.account == null || state.topic.account == ''">
                                    <span class="avatarImg">
                                        <img v-if="state.topic.avatarName == null" :src="state.topic.avatar" class="img"/>
                                    </span>
                                </template>
                            </div>
                            <div class="middle-layout" v-if="!state.isTopicSkeleton">
                                <div class="userInfo">
                                    <span v-if="state.topic.nickname == null || state.topic.nickname == ''" class="account">{{state.topic.account}}</span>
                                    <span v-if="state.topic.nickname != null && state.topic.nickname != ''" class="account">{{state.topic.nickname}}</span>
                                    <span class="userRoleName" v-for="roleName in state.topic.userRoleNameList">{{roleName}}</span>
                                    <!-- 官方人员 -->
                                    <span class="staff" v-if="state.topic.isStaff">{{t('thread.30')}}</span>
                                    <!-- 此用户账号已注销 -->
                                    <div v-if="state.topic.account == null || state.topic.account == ''" class="cancelAccount">{{t('thread.40')}}</div>
                                    <span class="time">{{state.topic.postTime}}</span>

                                </div>

                            </div>
                            <div class="right-layout">
                                <van-button plain type="primary" v-if="!state.topic.isStaff" @click="addFollow(state.topic.userName)" round>{{state.followText}}</van-button>
                            </div>
                        </div>

                    </div>
                    <div class="receiveRedEnvelope"  v-if="state.giveRedEnvelope != undefined && state.giveRedEnvelope != null && Object.keys(state.giveRedEnvelope).length >0">
                        <!-- 还有未被领取的红包 -->
                        <div class="redEnvelope" v-if="state.giveRedEnvelope.remainingQuantity >0">
                            <div class="box">
                                <div class="head-bg">
                                    <div class="head"></div>
                                </div>
                                <div class="body">
                                    <div class="content">
                                        <div class="avatarBox" >
                                            <img v-if="state.giveRedEnvelope.avatarName != null" :src="state.giveRedEnvelope.avatarPath+'100x100/'+state.giveRedEnvelope.avatarName" >
                                            <img v-if="state.giveRedEnvelope.avatarName == null" :src="state.giveRedEnvelope.avatar" width="48" height="48"/>
                                        </div>
                                        <!-- 给大家发个红包 -->
                                        <div>{{t('thread.50')}}</div>
                                    </div>
                                </div>
                                <!-- 已拆 -->
                                <div id="open" class="open-btn" v-if="state.giveRedEnvelope.accessUserUnwrap">已拆</div>

                                <template v-if="!state.giveRedEnvelope.accessUserUnwrap">
                                    <!-- 开 -->
                                    <div id="notOpen" class="btn"  @click="grabRedEnvelope(state.giveRedEnvelope.id)">开</div>
                                    <!-- 已拆 -->
                                    <div id="open" class="open-btn" style="display: none;">已拆</div>
                                </template>
                            </div>
                        </div>
                        <div class="noRedEnvelope" v-if="state.giveRedEnvelope.remainingQuantity ==0">
                            <div class="box">
                                <!-- 您来晚了，红包已被抢光 -->
                                <div class="content">{{t('thread.80')}}</div>
                            </div>
                        </div>

                        <!-- 已领取红包用户 -->
                        <div class="receiveRedEnvelopeUser" v-if="state.receiveRedEnvelopeList != undefined && state.receiveRedEnvelopeList != null && state.receiveRedEnvelopeList.length >0">
                            <div class="box">
                                <template v-for="(receiveRedEnvelope,index) in state.receiveRedEnvelopeList">
                                    <van-popover v-model:show="state.showPopover_receiveRedEnvelope[index]" :placement="state.receiveRedEnvelopePlacement.get(receiveRedEnvelope.id)" :offset="[0,15]" class="custom-popoverModule-2" @open="onReceiveRedEnvelopePopoverLocation(receiveRedEnvelope.id)">
                                        <div class="tooltip-text">
                                            <template v-if="receiveRedEnvelope.receiveAccount != null && receiveRedEnvelope.receiveAccount !=''">
                                                <span v-if="receiveRedEnvelope.receiveNickname != null && receiveRedEnvelope.receiveNickname !=''">{{receiveRedEnvelope.receiveNickname}}</span>
                                                <span v-if="receiveRedEnvelope.receiveNickname == null || receiveRedEnvelope.receiveNickname ==''">{{receiveRedEnvelope.receiveAccount}}</span>
                                                <!-- 获得 {{receiveRedEnvelope.amount}} 元 -->
                                                <span>{{t('thread.90',{'p1': receiveRedEnvelope.amount})}}</span>
                                            </template>
                                            <!-- 此用户账号已注销 获得 {{receiveRedEnvelope.amount}} 元 -->
                                            <span v-if="(receiveRedEnvelope.receiveAvatarName == null || receiveRedEnvelope.receiveAvatarName=='') && (receiveRedEnvelope.receiveAccount == null || receiveRedEnvelope.receiveAccount =='')">{{t('thread.100',{'p1': receiveRedEnvelope.amount})}}</span>

                                        </div>
                                        <template #reference>
                                            <img :ref="'receiveRedEnvelopec_'+receiveRedEnvelope.id" v-if="receiveRedEnvelope.receiveAvatarName != null && receiveRedEnvelope.receiveAvatarName != ''" class='avatar'  :src="receiveRedEnvelope.receiveAvatarPath+'100x100/'+receiveRedEnvelope.receiveAvatarName"/>
                                            <img :ref="'receiveRedEnvelopec_'+receiveRedEnvelope.id" v-if="(receiveRedEnvelope.receiveAvatarName == null || receiveRedEnvelope.receiveAvatarName=='') && (receiveRedEnvelope.receiveAccount != null && receiveRedEnvelope.receiveAccount !='')" class='avatar' :src="receiveRedEnvelope.receiveAvatar"/>

                                            <img :ref="'receiveRedEnvelopec_'+receiveRedEnvelope.id" v-if="(receiveRedEnvelope.receiveAvatarName == null || receiveRedEnvelope.receiveAvatarName=='') && (receiveRedEnvelope.receiveAccount == null || receiveRedEnvelope.receiveAccount =='')" class='avatar' :src="receiveRedEnvelope.receiveAvatar"/>
                                        </template>
                                    </van-popover>
                                </template>
                            </div>
                            <div class="more" v-if="state.receiveRedEnvelope_more">
                                <!-- title="更多" -->
                                <Icon name="angle-down" size="15px" class="icon" :title="t('thread.110')" @click="queryReceiveRedEnvelopeUser(state.giveRedEnvelope.id,state.receiveRedEnvelopeCurrentPage+1)"/>
                            </div>
                        </div>
                    </div>

                    <div class="topicDetail">
                        <div class="head" v-if="!state.isTopicSkeleton">
                            <div class="titleBox">
                                <h1 class="title">{{state.topic.title}}</h1>
                                <!-- 精华 -->
                                <span class="essence" v-if="state.topic.essence == true"><span>{{t('thread.120')}}</span></span>
                                <!-- 置顶 -->
                                <span class="top" v-if="state.topic.sort >0"><span>{{t('thread.130')}}</span></span>
                            </div>
                            <div class="info van-hairline--bottom">
                                <div class="left-layout">
                                    <div class="tagName-box"><div class="tagName">{{state.topic.tagName}}</div></div>
                                </div>
                                <div class="right-layout">
                                    <div class="statistics">
                                        <template v-if="state.topic.ipAddress != null && state.topic.ipAddress != ''">
                                            <Icon name="map-pin-line" :size="convertViewportWidth('14px')" class="icon"/><span class="ipAddress">{{state.topic.ipAddress}}</span>
                                        </template>
                                        <Icon name="commentCount" :size="convertViewportWidth('14px')" class="icon"/><span class="commentTotal">{{state.topic.commentTotal}}</span>
				            	        <Icon name="view" :size="convertViewportWidth('14px')" class="icon"/><span class="viewTotal">{{state.topic.viewTotal}}</span>
                                        <span class="more" v-if="onTopicPopoverActions(state.topic).length >0">
                                            <van-popover v-model:show="state.showTopicPopover" placement="left-start" :overlay="true" overlay-class="custom-popoverModule-overlay" :actions="onTopicPopoverActions(state.topic)" @select="onTopicPopoverSelect">
                                                <template #reference>
                                                    <van-icon name="ellipsis" :size="convertViewportWidth('16px')"/>
                                                </template>
                                            </van-popover>
                                        </span>
                                    </div>
                                </div>
                            </div>

                        </div>
                        <div v-if="!state.isTopicSkeleton" :class="[state.topic.isMarkdown != null && state.topic.isMarkdown == true ? 'markdown-body-custom topicMarkdownContent' : 'topicContent',router.currentRoute.value.query.reportModule !=undefined && parseInt(router.currentRoute.value.query.reportModule as string) == 10 ? 'reportMark' : '']">
                            <!-- 最后修改时间： -->
                            <div class="lastUpdateTime" v-if="state.topic.lastUpdateTime != null">{{t('thread.140')}}：{{state.topic.lastUpdateTime}}</div>

                            <!-- 此用户账号已注销 -->
                            <div class="cancelAccount" v-if="state.topic.account == null || state.topic.account == ''">{{t('thread.40')}}</div>

                            <div :ref="'topic_'+state.topic.id">
                                <RenderTemplate @click-onZoomPicture="onZoomPicture" @load-onLoadPicture="onLoadPicture" @click-onTopicUnhide="onTopicUnhide" @click-onDownload="onDownload" :html="state.topic.content"></RenderTemplate>
                            </div>


                        </div>
                        <div class="topicContent" v-if="state.isTopicSkeleton">
                            <van-skeleton :row="3" :loading="state.isTopicSkeleton" class="skeleton" style="padding-top: 30px;"/>
                        </div>

                        <div class="operating" v-if="state.topic != null && Object.keys(state.topic).length>0">
                            <div class="bottomInfo">
                                <van-button type="primary" plain class="favorites" @click="()=>{state.alreadyCollected == true ? deleteFavorite(state.topic.id) : addFavorite(state.topic.id)}">
                                    <template #default>
                                        <span>{{state.favoriteCount}}</span>
                                        <!-- '已收藏':'收藏' -->
                                        {{state.alreadyCollected == true ? t('thread.150'):t('thread.160')}}
                                    </template>
                                    <template #icon>
                                        <Icon name="favorites" :size="convertViewportWidth('16px')" class="icon"/>
                                    </template>
                                </van-button>
                                <van-button type="primary" plain class="like" @click="()=>{state.alreadyLiked == true ? deleteLike(state.topic.id,10) : addLike(state.topic.id,10);}">
                                    <template #default>
                                        <span>{{state.likeCount}}</span>
                                        <!-- '已赞':'赞' -->
                                        {{state.alreadyLiked == true ? t('thread.170'):t('thread.180')}}
                                    </template>
                                    <template #icon>
                                        <Icon name="thumb-up" :size="convertViewportWidth('16px')" class="icon"/>
                                    </template>
                                </van-button>
                            </div>
                        </div>

                    </div>

                     <!-- 话题允许评论 -->
                    <div class="allow-comment-wrap" v-if="state.topic.allow">
                        <!-- 已登录 -->
                        <div v-if="store_systemUser != null && Object.keys(store_systemUser).length>0">
                            <!-- 显示评论按钮 -->
                            <div class="comment-button" v-if="state.allowComment">
                                <!-- 发表评论 -->
                                <van-button round block plain type="primary" native-type="submit" @click="addCommentUI" >{{t('thread.190')}}</van-button>
                            </div>
                             <!-- 不显示评论按钮 评论已关闭-->
                            <div class="no-comment-button" v-if="!state.allowComment">
                                {{t('thread.200')}}
                            </div>
                        </div>
                        <!-- 未登录 -->
                        <div v-else class="comment-button" >
                            <div class="login-button">
                                <!-- <span @click="router.push({path: '/login',query:{jumpUrl :createJumpAttribute()}})">登录</span>后发表评论-->
                                <i18n-t keypath="thread.210" scope="global">
                                    <template #p1>
                                        <span @click="router.push({path: '/login',query:{jumpUrl :createJumpAttribute()}})">{{t('thread.220')}}</span>
                                    </template>
                                </i18n-t>
                            </div>
                        </div>
                    </div>

                    <!-- 话题不允许评论 -->
					<div class="no-comment-wrap" v-if="state.topic != null && Object.keys(state.topic).length>0 && !state.topic.allow">
                        <!-- 本话题评论已关闭 -->
                        <div class="no-comment">
                            {{t('thread.230')}}
                        </div>
					</div>

                    <!-- 上一页评论 -->
                    <div class="previous-comment-wrap" v-if="state.initialPage >1">
                        <!-- 上一页评论 -->
                        <van-button round block plain type="primary" native-type="submit" @click="queryPreviousCommentList(state.topicId, state.initialPage-1)" >{{t('thread.240')}}</van-button>
                    </div>
                    <!-- 添加评论 -->
                    <van-popup v-model:show="state.popup_addComment" :lock-scroll="false" @close="closeAddComment" safe-area-inset-bottom :close-on-popstate="true" position="bottom" closeable close-icon="close" :style="{ height: '100%' }">
                        <div class="addCommentModule">
                            <van-form :ref="'formAddCommentRef'" class="form-container">
                                <van-cell-group>
                                    <van-field center :error-message="error.content.get('addComment-'+state.topicId)">
                                        <template #input>
                                            <div v-show="!state.isAddCommentMarkdown" style="width: 100%;">
                                                <van-sticky :z-index="1" >
                                                    <div ref="addCommentContentEditorToolbarRef" class="editor-toolbar" style="padding-top: 13px;"></div>
                                                </van-sticky>
                                                <div ref="addCommentContentEditorTextRef" :editorId="'addComment'" class="editor-text" style="min-height: 320px;"></div>
                                            </div>
                                            <div v-if="state.isAddCommentMarkdown" style="width: 100%;" >
                                                <!-- placeholder="请输入内容..." -->
                                                <Editor mode="tab" :editorId="'addComment'" :value="state.addCommentMarkdownContent" :plugins="state.addCommentEditorPlugin" :locale="setMarkdownLanguage()" :sanitize="commentSanitize" :placeholder="t('thread.250')" @change="handleAddCommentMarkdownChange"/>
                                            </div>
                                        </template>
                                    </van-field>
                                    <!-- label="验证码" placeholder="请输入验证码" -->
                                    <van-field v-model="state.captchaValue['addComment-'+state.topicId]"  @change.native="checkCaptchaValueRules('addComment-'+state.topicId)" class="captcha-item captcha-input-left" :label="t('common.70')" :placeholder="t('common.120')" maxlength="4" center clearable v-if="state.showCaptcha.get('addComment-'+state.topicId)" :error-message="error.captchaValue.get('addComment-'+state.topicId)">
                                        <template #button>
                                            <van-image :src="state.imgUrl.get('addComment-'+state.topicId)" @click="replaceCaptcha('addComment-'+state.topicId)" class="captcha-image"/>
                                        </template>
                                        <template #extra >
                                            <!-- 换一幅 -->
                                            <span class="captcha-replace" @click="replaceCaptcha('addComment-'+state.topicId)">{{t('common.80')}}</span>
                                        </template>
                                    </van-field>

                                </van-cell-group>

                                <van-field center :error-message="error.comment.get('addComment-'+state.topicId)">
                                    <template #input>
                                        <div class="submitButton">
                                            <!-- 提交 -->
                                            <van-button round block type="primary" native-type="submit" @mousedown="onAddCommentFormSubmit" :disabled="state.allowSubmit.get('addComment-'+state.topicId)">{{t('common.50')}}</van-button>
                                        </div>
                                    </template>
                                </van-field>
                            </van-form>
                        </div>
                    </van-popup>
                    <!-- 请求失败，点击重新加载 -->
                    <van-list v-model:loading="state.isLoading" :finished="state.isFinished" v-model:error="state.isError" :error-text="(state.topic != null && Object.keys(state.topic).length>0) ? t('thread.260') : ''" finished-text="" @load="onLoad" >

                        <div class="commentList" v-if="state.commentList != null && state.commentList.length >0">
                            <!-- 延迟加载点赞 -->
                            <div class="item van-hairline--bottom" :class="router.currentRoute.value.query.reportModule !=undefined && parseInt(router.currentRoute.value.query.reportModule as string) == 20 && comment.id == router.currentRoute.value.query.commentId ? 'reportMark' : ''" v-for="(comment,index) in state.commentList" :key="comment.id"  :ref="'comment_'+comment.id" v-lazy-tag="()=>{onQueryLike(comment.id,20)}">
                                <div class="top-container">
                                    <div class="left-layout">
                                        <router-link v-if="comment.account != null && comment.account != ''" tag="a" :to="{path:'/user/control/home',query: {userName: comment.userName}}">
                                            <span class="avatarImg">
                                                <img v-if="comment.avatarName != null" :src="comment.avatarPath+'100x100/'+comment.avatarName" class="img">

                                                <img v-if="comment.avatarName == null" :src="comment.avatar" class="img"/>
                                            </span>
                                        </router-link>
                                        <template v-if="comment.account == null || comment.account == ''">
                                            <span class="avatarImg">
                                                <img v-if="comment.avatarName == null" :src="comment.avatar" class="img"/>
                                            </span>
                                        </template>
                                    </div>
                                    <div class="middle-layout">
                                        <div class="userInfo">
                                            <span v-if="(comment.nickname == null || comment.nickname == '') && comment.account != null && comment.account != ''" class="account">{{comment.account}}</span>
                                            <span v-if="comment.nickname != null && comment.nickname != ''" class="account">{{comment.nickname}}</span>
                                            <span class="userRoleName" v-for="roleName in comment.userRoleNameList">{{roleName}}</span>
                                            <!-- 官方人员 -->
                                            <span class="staff" v-if="comment.isStaff">{{t('thread.30')}}</span>
                                            <!-- 已注销 -->
                                            <div v-if="comment.account == null || comment.account == ''" class="cancelNickname">{{t('thread.270')}}</div>
                                            <span class="time">
                                                {{comment.postTime}}<span v-if="comment.ipAddress != null && comment.ipAddress != ''"><span class="separate">·</span>{{comment.ipAddress}}</span>


                                                <a v-if="state.alreadyLikedComment.get(comment.id) != undefined && state.alreadyLikedComment.get(comment.id) == true" @click="deleteLike(comment.id,20)">
                                                    <span class="separate">·</span><Icon name="heart-fill" :size="convertViewportWidth('13px')" class="like-icon"/>
                                                    <span class="like-quantity-container">
                                                        <span class="like-quantity" v-if="state.commentLikeCount.get(comment.id) != undefined && Long.fromString(String(state.commentLikeCount.get(comment.id))).gte(1000000)">999K+</span>  <!--超过1000000显示999k+  -->
                                                        <span class="like-quantity" v-else-if="state.commentLikeCount.get(comment.id) != undefined && Long.fromString(String(state.commentLikeCount.get(comment.id))).gte(10000)">{{Math.floor(parseFloat(String(state.commentLikeCount.get(comment.id)))/1000)}}k</span> <!--向下取整  -->
                                                        <span class="like-quantity" v-else>{{state.commentLikeCount.get(comment.id) != undefined  && Long.fromString(String(state.commentLikeCount.get(comment.id))).gt(0) ? state.commentLikeCount.get(comment.id) : ''}}</span>
                                                    </span>
                                                </a>
                                                <a v-else >
                                                    <span class="separate">·</span><Icon name="heart" :size="convertViewportWidth('13px')" class="like-icon" @click="addLike(comment.id,20)"/>
                                                    <span class="like-quantity-container">
                                                        <span class="like-quantity" v-if="state.commentLikeCount.get(comment.id) != undefined && Long.fromString(String(state.commentLikeCount.get(comment.id))).gte(1000000)">999K+</span>  <!--超过1000000显示999k+  -->
                                                        <span class="like-quantity" v-else-if="state.commentLikeCount.get(comment.id) != undefined && Long.fromString(String(state.commentLikeCount.get(comment.id))).gte(10000)">{{Math.floor(parseFloat(String(state.commentLikeCount.get(comment.id)))/1000)}}k</span> <!--向下取整  -->
                                                        <span class="like-quantity" v-else>{{state.commentLikeCount.get(comment.id) != undefined  && Long.fromString(String(state.commentLikeCount.get(comment.id))).gt(0) ? state.commentLikeCount.get(comment.id) : ''}}</span>
                                                    </span>
                                                </a>

                                            </span>

                                        </div>

                                    </div>
                                    <div class="right-layout">
                                        <!--{{calculateFloor(comment.id)}}楼-->
                                        <div class="floor">{{t('thread.280',{'p1': calculateFloor(comment.id)})}}</div>
                                        <div class="more" v-if="onCommentPopoverActions(comment).length >0">
                                            <van-popover v-model:show="state.showCommentPopover[comment.id]" placement="left-start" :overlay="true" overlay-class="custom-popoverModule-overlay" :actions="onCommentPopoverActions(comment)" @select="onCommentPopoverSelect">
                                                <template #reference>
                                                    <van-icon name="ellipsis" :size="convertViewportWidth('16px')"/>
                                                </template>
                                            </van-popover>
                                        </div>
                                    </div>
                                </div>
                                <div class="bottom-container">

                                    <div class="quote" v-if="comment.quoteList != null && comment.quoteList.length >0">
                                        <RenderTemplate  :html="state.quoteData.get(comment.id)"></RenderTemplate>
                                    </div>

                                    <div :class="[comment.isMarkdown != null && comment.isMarkdown == true ? 'markdown-body-custom commentMarkdownContent' : 'commentContent']">
                                        <!-- 此用户账号已注销 -->
                                        <div class="cancelAccount" v-if="comment.account == null || comment.account == ''">{{t('thread.40')}}</div>


                                        <div :ref="'commentContent_'+comment.id">
                                            <RenderTemplate @click-onZoomPicture="onZoomPicture" @load-onLoadPicture="onLoadPicture" :html="comment.content"></RenderTemplate>

                                        </div>
                                    </div>

                                    <div class="replyList timeline" v-if="comment.replyList != null && comment.replyList.length >0">
                                        <!-- 延迟加载点赞 -->
                                        <div class="reply-container timeline-item" :class="[reply.friendUserName != null && reply.friendUserName != '' ? 'node-position':'',(reply.friendUserName != null && reply.friendUserName != '' && state.line.keys().next().value == reply.id) ? 'first-position':'']" v-for="(reply,index2) in comment.replyList" :key="reply.id" v-show="state.replyExpandOrShrink.get(comment.id) || (state.replyExpandOrShrink.get(comment.id) == false && index2 <state.viewNumber)" :ref="'replyData_'+reply.id" v-lazy-tag="()=>{onQueryLike(reply.id,30)}">
                                            <div class="tail" v-if="state.line.get(reply.id)"></div>
                                            <div class="last-tail" v-if="state.dot.size >0 && [...state.dot][state.dot.size-1][0] == reply.id"></div>
                                            <div class="node node--normal"  v-if="state.dot.get(reply.id)"></div>
                                            <div class="replyItem van-hairline--top ">
                                                <div :class="router.currentRoute.value.query.reportModule !=undefined && parseInt(router.currentRoute.value.query.reportModule as string) == 30 && reply.id == router.currentRoute.value.query.replyId ? 'reply-reportMark' : ''">
                                                    <div class="top-container" >
                                                        <div class="left-layout">
                                                            <router-link v-if="reply.account != null && reply.account != ''" tag="a" :to="{path:'/user/control/home',query: {userName: reply.userName}}">
                                                                <span class="avatarImg">
                                                                    <img v-if="reply.avatarName != null" :src="reply.avatarPath+'100x100/'+reply.avatarName" class="img">

                                                                    <img v-if="reply.avatarName == null" :src="reply.avatar" class="img"/>
                                                                </span>
                                                            </router-link>
                                                            <template v-if="reply.account == null || reply.account == ''">
                                                                <span class="avatarImg">
                                                                    <img v-if="reply.avatarName == null" :src="reply.avatar" class="img"/>
                                                                </span>
                                                            </template>
                                                        </div>
                                                        <div class="middle-layout">
                                                            <div class="userInfo">
                                                                <span v-if="(reply.nickname == null || reply.nickname == '') && reply.account != null && reply.account != ''" class="account">{{reply.account}}</span>
                                                                <span v-if="reply.nickname != null && reply.nickname != ''" class="account">{{reply.nickname}}</span>
                                                                <span class="userRoleName" v-for="roleName in reply.userRoleNameList">{{roleName}}</span>
                                                                <!-- 官方人员 -->
                                                                <span class="staff" v-if="reply.isStaff">{{t('thread.30')}}</span>
                                                                <!-- 已注销 -->
                                                                <div v-if="reply.account == null || reply.account == ''" class="cancelNickname">{{t('thread.270')}}</div>
                                                                <span class="time">{{reply.postTime}}
                                                                    <span v-if="reply.ipAddress != null && reply.ipAddress != ''"><span class="separate">·</span>{{reply.ipAddress}}</span>




                                                                    <a v-if="state.alreadyLikedCommentReply.get(reply.id) != undefined && state.alreadyLikedCommentReply.get(reply.id) == true" >
                                                                        <span class="separate">·</span><Icon name="heart-fill" :size="convertViewportWidth('13px')" class="like-icon" @click="deleteLike(reply.id,30)"/>
                                                                        <span class="like-quantity-container">
                                                                            <span class="like-quantity" v-if="state.commentReplyLikeCount.get(reply.id) != undefined && Long.fromString(String(state.commentReplyLikeCount.get(reply.id))).gte(1000000)">999K+</span>  <!--超过1000000显示999k+  -->
                                                                            <span class="like-quantity" v-else-if="state.commentReplyLikeCount.get(reply.id) != undefined && Long.fromString(String(state.commentReplyLikeCount.get(reply.id))).gte(10000)">{{Math.floor(parseFloat(String(state.commentReplyLikeCount.get(reply.id)))/1000)}}k</span> <!--向下取整  -->
                                                                            <span class="like-quantity" v-else>{{state.commentReplyLikeCount.get(reply.id) != undefined  && Long.fromString(String(state.commentReplyLikeCount.get(reply.id))).gt(0) ? state.commentReplyLikeCount.get(reply.id) : ''}}</span>
                                                                        </span>
                                                                    </a>
                                                                    <a v-else >
                                                                        <span class="separate">·</span><Icon name="heart" :size="convertViewportWidth('13px')" class="like-icon" @click="addLike(reply.id,30)"/>
                                                                        <span class="like-quantity-container">
                                                                            <span class="like-quantity" v-if="state.commentReplyLikeCount.get(reply.id) != undefined && Long.fromString(String(state.commentReplyLikeCount.get(reply.id))).gte(1000000)">999K+</span>  <!--超过1000000显示999k+  -->
                                                                            <span class="like-quantity" v-else-if="state.commentReplyLikeCount.get(reply.id) != undefined && Long.fromString(String(state.commentReplyLikeCount.get(reply.id))).gte(10000)">{{Math.floor(parseFloat(String(state.commentReplyLikeCount.get(reply.id)))/1000)}}k</span> <!--向下取整  -->
                                                                            <span class="like-quantity" v-else>{{state.commentReplyLikeCount.get(reply.id) != undefined  && Long.fromString(String(state.commentReplyLikeCount.get(reply.id))).gt(0) ? state.commentReplyLikeCount.get(reply.id) : ''}}</span>
                                                                        </span>
                                                                    </a>
                                                                </span>
                                                            </div>

                                                        </div>
                                                        <div class="right-layout">
                                                            <div class="more" v-if="onReplyPopoverActions(reply).length >0">
                                                                <van-popover v-model:show="state.showReplyPopover[reply.id]" placement="left-start" :overlay="true" overlay-class="custom-popoverModule-overlay" :actions="onReplyPopoverActions(reply)" @select="onReplyPopoverSelect">
                                                                    <template #reference>
                                                                        <van-icon name="ellipsis" :size="convertViewportWidth('16px')"/>
                                                                    </template>
                                                                </van-popover>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="bottom-container">
                                                        <!-- 回复对方用户 -->
                                                        <div class="friendInfo-wrap" v-if="reply.friendUserName != null && reply.friendUserName != ''">
                                                            <div class="friendInfo">
                                                                <div class="icon-container">
                                                                    <van-icon name="play" :size="convertViewportWidth('14px')" class="icon"/>
                                                                </div>
                                                                <div class="avatarImg-container">
                                                                    <router-link v-if="reply.friendUserName!= null && reply.friendUserName != ''" tag="a" :to="{path:'/user/control/home',query: {userName: reply.friendUserName}}">
                                                                        <span class="avatarImg">
                                                                            <img v-if="reply.friendAvatarName != null" :src="reply.friendAvatarPath+'100x100/'+reply.friendAvatarName" class="img">

                                                                            <img v-if="reply.friendAvatarName == null" :src="reply.friendAvatar" class="img"/>
                                                                        </span>
                                                                    </router-link>
                                                                </div>
                                                                <div class="nameInfo-container">
                                                                    <span class="nameInfo" >
                                                                        <!-- 已注销 -->
                                                                        <span v-if="reply.friendAccount == null || reply.friendAccount == ''" class="cancelNickname">{{t('thread.270')}}</span>
                                                                        <router-link tag="a" v-if="reply.friendAccount != null && reply.friendAccount != ''" class="userName" :to="{path:'/user/control/home',query: {userName: reply.friendUserName}}">
                                                                            <span v-if="reply.friendNickname != null && reply.friendNickname != ''">{{reply.friendNickname}}</span>
                                                                            <span v-if="reply.friendNickname == null || reply.friendNickname == ''">{{reply.friendAccount}}</span>
                                                                        </router-link>
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="replyContent" @click="clickReplyLevel(comment.id,reply.id)">
                                                            <!-- 此用户账号已注销 -->
                                                            <div v-if="reply.account == null || reply.account == ''" class="cancelAccount">{{t('thread.40')}}</div>


                                                            <RenderTemplate @click-onZoomPicture="onZoomPicture" @load-onLoadPicture="onLoadPicture" :html="reply.content"></RenderTemplate>

                                                        </div>

                                                    </div>
                                                    <!-- 回复对方 -->
                                                    <van-popup v-model:show="state.addReplyFriendFormView[reply.id]" :lock-scroll="false" @close="closeAddReplyFriend" safe-area-inset-bottom :close-on-popstate="true" position="bottom" closeable close-icon="close" :style="{ height: '100%' }">
                                                        <div :class="['addReplyFriendModule','addReplyFriendModule_lock_'+reply.id]">
                                                            <van-form :scroll-to-error="true" class="form-container">
                                                                <van-field class="friendUser">
                                                                    <template #input>
                                                                        @{{state.friendUser}}
                                                                    </template>
                                                                </van-field>

                                                                <van-field center :error-message="error.replyContent.get('addReplyFriend-'+reply.id)">
                                                                    <template #input>
                                                                        <div style="width: 100%;">
                                                                            <van-sticky :z-index="1" >
                                                                                <div :ref="'addReplyFriendContentEditorToolbarRef_'+reply.id" class="editor-toolbar" style="padding-top: 13px;"></div>
                                                                            </van-sticky>
                                                                            <div :ref="'addReplyFriendContentEditorTextRef_'+reply.id" :editorId="'addReplyFriend_'+reply.id" class="editor-text" style="min-height: 320px;"></div>
                                                                        </div>
                                                                    </template>
                                                                </van-field>
                                                                <!-- label="验证码" placeholder="请输入验证码" -->
                                                                <van-field v-model="state.captchaValue['addReplyFriend-'+reply.id]"  @change.native="checkCaptchaValueRules('addReplyFriend-'+reply.id)" class="captcha-item captcha-input-left" :label="t('common.70')" :placeholder="t('common.120')" maxlength="4" center clearable v-if="state.showCaptcha.get('addReplyFriend-'+reply.id)" :error-message="error.captchaValue.get('addReplyFriend-'+reply.id)">
                                                                    <template #button>
                                                                        <van-image :src="state.imgUrl.get('addReplyFriend-'+reply.id)" @click="replaceCaptcha('addReplyFriend-'+reply.id)" class="captcha-image"/>
                                                                    </template>
                                                                    <template #extra >
                                                                        <!-- 换一幅 -->
                                                                        <span class="captcha-replace" @click="replaceCaptcha('addReplyFriend-'+reply.id)">{{t('common.80')}}</span>
                                                                    </template>
                                                                </van-field>

                                                                <van-field :error-message="error.reply.get('addReplyFriend-'+reply.id)">
                                                                    <template #input>
                                                                        <div class="submitButton">
                                                                            <!-- 提交 -->
                                                                            <van-button round block type="primary" native-type="submit" @mousedown="onAddReplyFriend(comment.id,reply.id)" :disabled="state.allowSubmit.get('addReplyFriend-'+reply.id)">{{t('common.50')}}</van-button>
                                                                        </div>
                                                                    </template>
                                                                </van-field>
                                                            </van-form>
                                                        </div>
                                                    </van-popup>
                                                    <!-- 修改回复 -->
                                                    <van-popup v-model:show="state.editReplyFormView[reply.id]" :lock-scroll="false" @close="closeEditReply" safe-area-inset-bottom :close-on-popstate="true" position="bottom" closeable close-icon="close" :style="{ height: '100%' }">
                                                         <div :class="['editReplyModule','addReplyModule_lock_'+reply.id]">
                                                            <van-form :scroll-to-error="true" class="form-container">
                                                                <van-field center :error-message="error.replyContent.get('editReply-'+reply.id)">
                                                                    <template #input>
                                                                        <div style="width: 100%;">
                                                                            <van-sticky :z-index="1" >
                                                                                <div :ref="'editReplyContentEditorToolbarRef_'+reply.id" class="editor-toolbar" style="padding-top: 13px;"></div>
                                                                            </van-sticky>
                                                                            <div :ref="'editReplyContentEditorTextRef_'+reply.id" :editorId="'editReply_'+reply.id" class="editor-text" style="min-height: 320px;"></div>
                                                                        </div>
                                                                    </template>
                                                                </van-field>
                                                                <!-- label="验证码" placeholder="请输入验证码" -->
                                                                <van-field v-model="state.captchaValue['editReply-'+reply.id]"  @change.native="checkCaptchaValueRules('editReply-'+reply.id)" class="captcha-item captcha-input-left" :label="t('common.70')" :placeholder="t('common.120')" maxlength="4" center clearable v-if="state.showCaptcha.get('editReply-'+reply.id)" :error-message="error.captchaValue.get('editReply-'+reply.id)">
                                                                    <template #button>
                                                                        <van-image :src="state.imgUrl.get('editReply-'+reply.id)" @click="replaceCaptcha('editReply-'+reply.id)" class="captcha-image"/>
                                                                    </template>
                                                                    <template #extra >
                                                                        <!-- 换一幅 -->
                                                                        <span class="captcha-replace" @click="replaceCaptcha('editReply-'+reply.id)">{{t('common.80')}}</span>
                                                                    </template>
                                                                </van-field>

                                                                <van-field :error-message="error.reply.get('editReply-'+reply.id)">
                                                                    <template #input>
                                                                        <div class="submitButton">
                                                                            <!-- 提交 -->
                                                                            <van-button round block type="primary" native-type="submit" @mousedown="onEditReply(reply.id)" :disabled="state.allowSubmit.get('editReply-'+reply.id)">{{t('common.50')}}</van-button>
                                                                        </div>
                                                                    </template>
                                                                </van-field>
                                                            </van-form>
                                                        </div>
                                                    </van-popup>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="link" v-if="comment.replyList.length >state.viewNumber">
                                            <!-- 点击收缩 -->
                                            <span @click="telescopicReply(comment.id);" v-if="state.replyExpandOrShrink.get(comment.id)">{{t('thread.290')}}</span>
                                            <!-- 剩余{{comment.replyList.length-state.viewNumber}}条 -->
                                            <span @click="telescopicReply(comment.id);" v-else>{{t('thread.300',{'p1': comment.replyList.length-state.viewNumber})}}</span>
                                        </div>
                                    </div>

                                    <!-- 添加回复 -->
                                    <van-popup v-model:show="state.addReplyFormView[comment.id]" :lock-scroll="false" @close="closeAddReply" safe-area-inset-bottom :close-on-popstate="true" position="bottom" closeable close-icon="close" :style="{ height: '100%' }">
                                        <div :class="['addReplyModule','addReplyModule_lock_'+comment.id]">
                                            <van-form :scroll-to-error="true" class="form-container">

                                                 <van-field center :error-message="error.replyContent.get('addReply-'+comment.id)">
                                                    <template #input>
                                                        <div style="width: 100%;">
                                                            <van-sticky :z-index="1" >
                                                                <div :ref="'addReplyContentEditorToolbarRef_'+comment.id" class="editor-toolbar" style="padding-top: 13px;"></div>
                                                            </van-sticky>
                                                            <div :ref="'addReplyContentEditorTextRef_'+comment.id" :editorId="'addReply_'+comment.id" class="editor-text" style="min-height: 320px;"></div>
                                                        </div>
                                                    </template>
                                                </van-field>
                                                <!-- label="验证码" placeholder="请输入验证码" -->
                                                <van-field v-model="state.captchaValue['addReply-'+comment.id]"  @change.native="checkCaptchaValueRules('addReply-'+comment.id)" class="captcha-item captcha-input-left" :label="t('common.70')" :placeholder="t('common.120')" maxlength="4" center clearable v-if="state.showCaptcha.get('addReply-'+comment.id)" :error-message="error.captchaValue.get('addReply-'+comment.id)">
                                                    <template #button>
                                                        <van-image :src="state.imgUrl.get('addReply-'+comment.id)" @click="replaceCaptcha('addReply-'+comment.id)" class="captcha-image"/>
                                                    </template>
                                                    <template #extra >
                                                        <!-- 换一幅 -->
                                                        <span class="captcha-replace" @click="replaceCaptcha('addReply-'+comment.id)">{{t('common.80')}}</span>
                                                    </template>
                                                </van-field>

                                                <van-field :error-message="error.reply.get('addReply-'+comment.id)">
                                                    <template #input>
                                                        <div class="submitButton">
                                                            <!-- 提交 -->
                                                            <van-button round block type="primary" native-type="submit" @mousedown="onAddReply(comment.id)" :disabled="state.allowSubmit.get('addReply-'+comment.id)">{{t('common.50')}}</van-button>
                                                        </div>
                                                    </template>
                                                </van-field>
                                            </van-form>
                                        </div>
                                    </van-popup>
                                    <!-- 引用评论 -->
                                    <van-popup v-model:show="state.quoteFormView[comment.id]" :lock-scroll="false" @close="closeQuoteComment"  safe-area-inset-bottom :close-on-popstate="true" position="bottom" closeable close-icon="close" :style="{ height: '100%' }">
                                        <div :class="['quoteCommentModule','quoteCommentModule_lock_'+comment.id]">
                                            <div class="quoteBox"><span class="van-multi-ellipsis--l2">{{state.quoteCommentContent}}</span></div>
                                            <van-form :scroll-to-error="true" class="form-container">
                                                <van-field center :error-message="error.content.get('addQuoteComment-'+comment.id)">
                                                    <template #input>
                                                        <div v-show="!state.isQuoteCommentMarkdownMap.get(comment.id)" style="width: 100%;">
                                                            <van-sticky :z-index="1" >
                                                                <div :ref="'quoteCommentContentEditorToolbarRef_'+comment.id" class="editor-toolbar" style="padding-top: 13px;"></div>
                                                            </van-sticky>
                                                            <div :ref="'quoteCommentContentEditorTextRef_'+comment.id" :editorId="'quoteComment_'+comment.id" class="editor-text" style="min-height: 320px;"></div>
                                                        </div>
                                                        <div v-if="state.isQuoteCommentMarkdownMap.get(comment.id)" style="width: 100%;">
                                                            <Editor mode="tab" :editorId="'quoteComment_'+comment.id" :value="(state.quoteCommentMarkdownContent[comment.id] as string)" :plugins="state.quoteCommentEditorPlugin" :locale="setMarkdownLanguage()" :sanitize="commentSanitize" :placeholder="t('thread.250')" @change="handleQuoteCommentMarkdownChange($event,comment.id)"/>
                                                        </div>
                                                    </template>
                                                </van-field>
                                                <!-- label="验证码" placeholder="请输入验证码" -->
                                                <van-field v-model="state.captchaValue['addQuoteComment-'+comment.id]"  @change.native="checkCaptchaValueRules('addQuoteComment-'+comment.id)" class="captcha-item captcha-input-left" :label="t('common.70')" :placeholder="t('common.120')" maxlength="4" center clearable v-if="state.showCaptcha.get('addQuoteComment-'+comment.id)" :error-message="error.captchaValue.get('addQuoteComment-'+comment.id)">
                                                    <template #button>
                                                        <van-image :src="state.imgUrl.get('addQuoteComment-'+comment.id)" @click="replaceCaptcha('addQuoteComment-'+comment.id)" class="captcha-image"/>
                                                    </template>
                                                    <template #extra >
                                                        <!-- 换一幅 -->
                                                        <span class="captcha-replace" @click="replaceCaptcha('addQuoteComment-'+comment.id)">{{t('common.80')}}</span>
                                                    </template>
                                                </van-field>

                                                <van-field :error-message="error.comment.get('addQuoteComment-'+comment.id)">
                                                    <template #input>
                                                        <div class="submitButton">
                                                            <!-- 提交 -->
                                                            <van-button round block type="primary" native-type="submit" @mousedown="onQuoteCommentFormSubmit(comment.id)" :disabled="state.allowSubmit.get('addQuoteComment-'+comment.id)">{{t('common.50')}}</van-button>
                                                        </div>
                                                    </template>
                                                </van-field>
                                            </van-form>
                                        </div>
                                    </van-popup>
                                    <!-- 修改评论 -->
                                    <van-popup v-model:show="state.editCommentFormView[comment.id]" :lock-scroll="false" @close="closeEditComment" safe-area-inset-bottom :close-on-popstate="true" position="bottom" closeable close-icon="close" :style="{ height: '100%' }">
                                        <div :class="['editCommentModule','editCommentModule_lock_'+comment.id]">
                                            <van-form :scroll-to-error="true" class="form-container">
                                                <van-field center :error-message="error.content.get('editComment-'+comment.id)">
                                                    <template #input>
                                                        <div style="width: 100%;" v-show="!state.isEditCommentMarkdownMap.get(comment.id)" >
                                                            <van-sticky :z-index="1" >
                                                                <div :ref="'editCommentContentEditorToolbarRef_'+comment.id" class="editor-toolbar" style="padding-top: 13px;"></div>
                                                            </van-sticky>
                                                            <div :ref="'editCommentContentEditorTextRef_'+comment.id" :editorId="'editComment_'+comment.id" class="editor-text" style="min-height: 320px;"></div>
                                                        </div>
                                                        <div v-if="state.isEditCommentMarkdownMap.get(comment.id)" style="width: 100%;">
                                                            <!-- placeholder="请输入内容..." -->
                                                            <Editor mode="tab" :editorId="'editComment_'+comment.id" :value="(state.editCommentMarkdownContent[comment.id] as string)" :plugins="state.editCommentEditorPlugin" :locale="setMarkdownLanguage()" :sanitize="commentSanitize" :placeholder="t('thread.250')" @change="handleEditCommentMarkdownChange($event,comment.id)"/>
                                                        </div>
                                                    </template>
                                                </van-field>
                                                <!-- label="验证码" placeholder="请输入验证码" -->
                                                <van-field v-model="state.captchaValue['editComment-'+comment.id]"  @change.native="checkCaptchaValueRules('editComment-'+comment.id)" class="captcha-item captcha-input-left" :label="t('common.70')" :placeholder="t('common.120')" maxlength="4" center clearable v-if="state.showCaptcha.get('editComment-'+comment.id)" :error-message="error.captchaValue.get('editComment-'+comment.id)">
                                                    <template #button>
                                                        <van-image :src="state.imgUrl.get('editComment-'+comment.id)" @click="replaceCaptcha('editComment-'+comment.id)" class="captcha-image"/>
                                                    </template>
                                                    <template #extra >
                                                        <!-- 换一幅 -->
                                                        <span class="captcha-replace" @click="replaceCaptcha('editComment-'+comment.id)">{{t('common.80')}}</span>
                                                    </template>
                                                </van-field>

                                                <van-field :error-message="error.comment.get('editComment-'+comment.id)">
                                                    <template #input>
                                                        <div class="submitButton">
                                                            <!-- 提交 -->
                                                            <van-button round block type="primary" native-type="submit" @mousedown="onEditCommentFormSubmit(comment.id)" :disabled="state.allowSubmit.get('editComment-'+comment.id)">{{t('common.50')}}</van-button>
                                                        </div>
                                                    </template>
                                                </van-field>
                                            </van-form>
                                        </div>
                                    </van-popup>


                                </div>
                            </div>
                        </div>
                    </van-list>


                    <!-- 举报 -->
                    <van-popup v-model:show="state.addReportFormView" safe-area-inset-bottom :close-on-popstate="true" position="bottom" closeable close-icon="close" :style="{ height: '100%' }">
                        <div class="addReportModule">
                            <van-form :scroll-to-error="true" class="form-container">
                                <van-cell-group inset>
                                    <van-field center :error-message="error.reportTypeId">
                                        <template #input>
                                            <div class="reportType-container" style="width: 100%;">
                                                <van-radio-group v-model="state.reportTypeId" @change="selectReportType(state.reportTypeList)">
                                                    <div class="reportType-group" v-for="reportType in state.reportTypeList">
                                                        <!--  仅有一级分类 -->
                                                        <div v-if="reportType.childType.length ==0">
                                                            <ul class="reportType-list">
                                                                <li class="reportType-item">
                                                                    <van-radio :name="reportType.id">{{reportType.name}}</van-radio>
                                                                </li>
                                                            </ul>

                                                        </div>
                                                        <div v-else><!-- 含有多级分类 -->
                                                            <p class="reportType-name">{{reportType.name}}</p>
                                                            <ul class="reportType-list reportType-list-multiple">
                                                                <li class="reportType-item reportType-item-multiple" v-for="childReportType in reportType.childType">
                                                                    <van-radio :name="childReportType.id" >{{childReportType.name}}</van-radio>
                                                                </li>
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </van-radio-group>
                                            </div>
                                        </template>
                                    </van-field>
                                </van-cell-group>

                                <van-field center :error-message="error.reason" v-if="state.show_giveReason">
                                    <template #input>
                                        <div style="width: 100%;">
                                            <!-- placeholder="请填写举报理由" -->
                                            <van-field v-model="state.reason"  :placeholder="t('thread.310')"  rows="3" type="textarea" autosize maxlength="500" show-word-limit/>
                                        </div>
                                    </template>
                                </van-field>

                                <van-field :error-message="error.imageFile">
                                    <template #input>
                                        <van-uploader v-if="state.show_giveReason && state.reportMaxImageUpload >0" class="fileList" v-model="state.fileList" :before-read="beforeRead" :accept="'.jpg,.jpeg,.gif,.png,.bmp'">

                                        </van-uploader>
                                    </template>
                                </van-field>

                                <!-- label="验证码" placeholder="请输入验证码" -->
                                <van-field v-model="state.captchaValue['report']"  @change.native="checkCaptchaValueRules('report')" class="captcha-item captcha-input-left" :label="t('common.70')" :placeholder="t('common.120')" maxlength="4" center clearable v-if="state.showCaptcha.get('report')" :error-message="error.captchaValue.get('report')">
                                    <template #button>
                                        <van-image :src="state.imgUrl.get('report')" @click="replaceCaptcha('report')" class="captcha-image"/>
                                    </template>
                                    <template #extra >
                                        <!-- 换一幅 -->
                                        <span class="captcha-replace" @click="replaceCaptcha('report')">{{t('common.80')}}</span>
                                    </template>
                                </van-field>

                                <van-field :error-message="error.report">
                                    <template #input>
                                        <div class="submitButton">
                                            <!-- 提交 -->
                                            <van-button round block type="primary" native-type="submit" @mousedown="onAddReportFormSubmit()" :disabled="state.allowSubmit.get('report')">{{t('common.50')}}</van-button>
                                        </div>
                                    </template>
                                </van-field>
                            </van-form>
                        </div>
                    </van-popup>
                    <van-popup v-model:show="state.popup_mentionUser" class="markdownEditorMentionPopup" :lock-scroll="false" position="bottom" :close-on-popstate="true" close-icon="close" :round="true" :closeable="true"  @closed="closeMentionUser()">
                        <van-form ref="formMentionRef" class="form-mention-container">
                            <!-- placeholder="用户账号或呢称" -->
                            <van-search v-model.trim="state.keyword" show-action maxlength="30" clearable :placeholder="t('thread.320')" @search="searchMentionUser">
                                <template #action>
                                    <!-- 搜索 -->
                                    <van-button size="small" type="primary" @click="searchMentionUser">{{t('thread.330')}}</van-button>
                                </template>
                            </van-search>

                        </van-form>
                        <div class="container">
                            <div class="mentionUserItem" v-for="mentionUser in state.mentionUserList" @click="selectMentionUser(mentionUser)">
                                <div class="left-layout">
                                    <div class="avatarBox">

                                        <img v-if="mentionUser.avatarName != null" :src="mentionUser.avatarPath+'100x100/'+mentionUser.avatarName" class="img">
                                        <img v-if="mentionUser.avatarName == null" :src="mentionUser.avatar" width="48" height="48" class="img"/>

                                    </div>
                                </div>
                                <div class="right-layout">
                                    <span class="userInfo">{{mentionUser.nickname != null && mentionUser.nickname != '' ?mentionUser.nickname : mentionUser.account}}</span>
                                </div>
                            </div>
                        </div>
                    </van-popup>
                </div>
                <!--  相似话题 集合 -->
                <div class="likeTopicModule" v-if="state.likeTopicList != null && state.likeTopicList.length >0 && store_topicDetailPermission == true">
                    <div class="likeTopic">
                        <!-- 相关话题 -->
                        <div class="title van-hairline--bottom">{{t('thread.340')}}</div>
                        <ul class="topicList">
                            <li class="topic-title " v-for="likeTopic in state.likeTopicList">
                                <router-link tag="a" :to="{path: '/thread', query:{ topicId : likeTopic.id}}">
                                    {{likeTopic.title}}
                                </router-link>
                            </li>
                        </ul>
                    </div>
                </div>
            </van-pull-refresh>

        </div>
    </div>
</template>
<script lang="ts" setup>
    import { getCurrentInstance, ComponentInternalInstance, reactive, onMounted, nextTick, onUnmounted,  ref, watchEffect, onActivated} from 'vue'
    import pinia from '@/store/store'
    import {useStore} from '@/store'
    import { storeToRefs } from 'pinia';
    import { onBack } from '@/utils/history'
    import { convertViewportWidth } from '@/utils/px-to-viewport';
    import { onBeforeRouteLeave, onBeforeRouteUpdate, useRouter } from 'vue-router'
    import { AxiosResponse } from 'axios'
    import { PageView,Topic,Comment, Reply, GiveRedEnvelope, ReceiveRedEnvelope, ReportType, User } from "@/types/index";
    import { letterAvatar } from '@/utils/letterAvatar';
    import { escapeHtml, escapeVueHtml, unescapeHtml } from '@/utils/escape';
    import Hls from 'hls.js';
    import DPlayer from 'dplayer';
    import { getLanguageClassName, getPageBasePath, processErrorInfo } from '@/utils/tool';
    import Prism from "prismjs";
    import { Dialog, Image as VanImage, ImagePreview, Notify } from 'vant';
    import Icon from "@/components/icon/Icon.vue";
    import { createEditor, destroyEditor } from '@/utils/editor';
    import { createJumpAttribute } from '@/utils/jumpProcess';
    import { nativeDownloadRedirect, nativeQueryVideoRedirect, nativeRefreshToken } from '@/utils/http';
    import { markdownPlugins,markdownEditorConfig,sanitize, markdownToHtml, setMarkdownLanguage } from '@/utils/markdownEditor';
    import { toggleEditor } from '@/utils/markdownPlugin/plugin-toggle-editor';
    import { help } from '@/utils/markdownPlugin/plugin-help';
    import { emoji } from '@/utils/markdownPlugin/plugin-emoji';
    import { imageUpload } from '@/utils/markdownPlugin/plugin-image-upload';
    import { pasteImageUpload } from '@/utils/markdownPlugin/plugin-paste-image';
    import { fileUpload } from '@/utils/markdownPlugin/plugin-file-upload';
    import { videoUpload } from '@/utils/markdownPlugin/plugin-video-upload';
    import { hideContent } from '@/utils/markdownPlugin/plugin-hide-content';
    import type { BytemdPlugin,BytemdEditorContext } from 'bytemd'
    import { Editor } from '@bytemd/vue-next'
    import { clearBodyLocks, lock, unlock } from 'tua-body-scroll-lock'
    import mermaid from "mermaid";
    import katex from 'katex'
    import 'katex/dist/katex.css'
    import { mention } from '@/utils/markdownPlugin/plugin-mention';
    import Long from "long";
    import { aiPopUp } from '@/components/aiAssistant/aiAssistantTool';
    import { ai } from '@/utils/markdownPlugin/plugin-ai';
    import { useI18n } from 'vue-i18n';
    import {notifyBackend} from "@/api/history";
    let { t } = useI18n();

    const { proxy,appContext } = getCurrentInstance() as ComponentInternalInstance;
    const store = useStore(pinia);
    const router = useRouter();
    const {title:store_title,keywords:store_keywords,description:store_description,systemUser:store_systemUser,topicDetailPermission:store_topicDetailPermission,currentLanguage:store_currentLanguage} = storeToRefs(store)


    const placeholderVideo = ref();

    const addCommentContentEditorToolbarRef = ref();
    const addCommentContentEditorTextRef = ref();


    //html页元信息
    watchEffect(() => {
        let titleValue = store_title.value//监听网站标题

        if(titleValue != null && titleValue != '' && state.topic != null && Object.keys(state.topic).length > 0){
            document.title = (state.topic.title != null ? state.topic.title : '')+ ' - ' + titleValue;
            (document.getElementsByName('description')[0] as any).content  = (state.topic.summary != null ? state.topic.summary : '');
        }
    }, {
        flush: 'post'//在组件更新后触发，第一次运行需要组件渲染完成才执行
    })


    const state = reactive({
        topicId:'',
        topic: {} as Topic,
        playerIdList: [] as Array<string>,//视频播放Id列表
        playerObjectList: [] as Array<any>,//视频播放对象集合
        playerHlsList: [] as Array<any>,//视频播放流对象集合
        playerNodeList: [] as Array<any>,//视频节点对象集合
        placeholder_DPlayer:'' as any,//占位播放器
        lastPlayerId:'',//最后运行的播放Id

        showTopicPopover :false,//话题气泡弹出框

        alreadyCollected :false,//用户是否已经收藏话题
        favoriteCount : 0,//话题用户收藏总数
        alreadyLiked:false,//用户是否已经点赞该话题
        likeCount : 0,//话题用户点赞总数
        hidePasswordIndex:0,//隐藏标签密码框索引
        isReplyTopicVisible:false,//是否包含回复话题可见隐藏标签

        alreadyLikedComment: new Map(),//用户是否已经点赞该评论
        commentLikeCount : new Map(),//评论用户点赞总数

        alreadyLikedCommentReply: new Map(),//用户是否已经点赞该评论回复
        commentReplyLikeCount : new Map(),//评论回复用户点赞总数

        followText:t('thread.350'),//关注文本 关注

        popup_mentionUser :false,//是否弹出选择提及用户表单
        keyword :'',//关键词
        mentionUserList:[] as Array<User>,//提及用户集合
        mentionUserEditorId:'',//提及用户编辑器Id
        currentMarkdownEditor:{} as BytemdEditorContext | undefined,//Markdown编辑器打开‘@提及’弹窗的编辑器对象

        showPopover_receiveRedEnvelope:[] as any,//气泡弹出框
        receiveRedEnvelopePlacement:new Map(),//红包位置 map格式 key:红包Id value: placement属性
        giveRedEnvelope :{} as GiveRedEnvelope,//红包
        receiveRedEnvelopeList:[] as Array<ReceiveRedEnvelope>,//领取红包用户集合
        selectedReceiveRedEnvelopeId:'',//选中领取红包用户
        receiveRedEnvelopeCurrentPage:0,//领取红包用户当前页
        receiveRedEnvelope_more:false,//是否显示更多领取红包用户

        showCommentPopover:{} as any,//评论气泡弹出框   key:评论Id value:是否显示  {评论Id-1 : 是否显示,评论Id-2 : 是否显示}
        showReplyPopover:{} as any,//回复气泡弹出框  key:回复Id value:是否显示  {回复Id-1 : 是否显示,回复Id-2 : 是否显示}
        commentList:[] as Array<Comment>,
        totalrecord : 0, //总记录数
        currentpage : 0, //当前页码
        totalpage : 1, //总页数
        maxresult: 12, //每页显示记录数

        viewNumber:2,//回复伸缩 展示数量
        initialPage : 0, //初始页码（当URL参数commentId有值时commentList的第一项页码数）

        replyExpandOrShrink :new Map(), //回复展开/收缩 map格式 key:评论Id value:是否展开
        allowComment:false,//是否显示评论表单
        availableTag:[] as Array<string>,//评论编辑器允许使用标签
        fileSystem:0,//文件存储系统
        supportEditor:10,//支持编辑器

        popup_addComment:false,//添加评论弹出窗口
        addCommentEditor :{} as any,//添加评论编辑器
        addCommentEditorCreateParameObject :{} as any,//添加评论编辑器的创建参数
        addCommentMarkdownContent:'',//markdown评论内容
        isAddCommentMarkdown:false,//是否使用markdown评论编辑器

        quoteCommentContent : '',//引用评论内容
        quoteFormView : {} as any,//评论引用表单  key:评论Id value:是否显示  key:评论Id value:是否显示  {评论Id-1 : 是否显示,评论Id-2 : 是否显示}
        quoteEditorMap:new Map(),//引用评论富文本编辑器集合 key:评论Id value:富文本编辑器
        quoteEditorCreateParameMap:new Map(),//引用评论编辑器的创建参数 key:评论Id value:编辑器参数对象
        quoteData : new Map(),//引用数据 map格式 key:评论Id value:引用html数据

        isQuoteCommentMarkdownMap: new Map(),//引用评论是否使用markdown编辑器  key:评论Id value:是否为markdown编辑器
        quoteCommentMarkdownContent : {} as any,//引用评论markdown编辑内容 key:评论Id value:评论内容


        editCommentFormView : {} as any,//修改评论表单  key:评论Id value:是否显示  key:评论Id value:是否显示  {评论Id-1 : 是否显示,评论Id-2 : 是否显示}
        editCommentEditorMap:new Map(),//修改评论富文本编辑器集合 key:评论Id value:富文本编辑器
        editCommentEditorCreateParameMap:new Map(),//修改评论编辑器的创建参数 key:评论Id value:编辑器参数对象

        isEditCommentMarkdownMap: new Map(),//修改评论是否使用markdown编辑器  key:评论Id value:是否为markdown编辑器
        editCommentMarkdownContent : {} as any,//修改评论markdown编辑内容 key:评论Id value:评论内容


        addReplyFormView : {} as any,//添加回复表单  key:评论Id value:是否显示  {评论Id-1 : 是否显示,评论Id-2 : 是否显示}
        addReplyEditorMap:new Map(),//添加回复富文本编辑器集合 key:评论Id value:富文本编辑器
        addReplyEditorCreateParameMap:new Map(),//添加回复编辑器的创建参数 key:评论Id value:编辑器参数对象

        editReplyFormView  : {} as any,//修改回复表单  key:回复Id value:是否显示  {回复Id-1 : 是否显示,回复Id-2 : 是否显示}
        editReplyEditorMap:new Map(),//修改回复富文本编辑器集合 key:回复Id value:富文本编辑器
        editReplyEditorCreateParameMap:new Map(),//修改回复编辑器的创建参数 key:回复Id value:编辑器参数对象

        addReplyFriendFormView : {} as any,//添加回复对方表单  key:回复Id value:是否显示  {回复Id-1 : 是否显示,回复Id-2 : 是否显示}
        addReplyFriendEditorMap:new Map(),//添加回复对方富文本编辑器集合 key:回复Id value:富文本编辑器
        addReplyFriendEditorCreateParameMap:new Map(),//添加回复对方编辑器的创建参数 key:回复Id value:编辑器参数对象


        showCaptcha:new Map<string,boolean>(),//是否显示验证码  本项及以下几项的key格式为 key:模块+id  例如：添加评论key=addComment-话题Id   修改评论key=editComment-评论Id    添加引用评论key=addQuoteComment-评论Id    添加回复key=addReply-评论Id   修改回复key=editReply-回复Id
        captchaKey: new Map<string,string>(),//验证码key
        captchaValue: {} as any,//验证码值
        imgUrl: new Map<string,string>(),//验证码图片
        allowSubmit:new Map<string,boolean>(),//提交按钮disabled状态

        likeTopicList:[] as Array<Topic>, //相似话题集合


        isRefreshing:false,//是否处于下拉加载中状态
        isError:false,//是否列表数据加载失败
        isLoading:false,//是否处于加载中状态
        isFinished:false,//是否加载完毕
        isTopicSkeleton:true,//是否显示话题骨架屏
        isCommentSkeleton:true,//是否显示评论骨架屏
        isShowPage:false,//是否显示分页

       // photo_loading:photo,//图片加载中图标
       // photo_error:photo_fail,//图片加载失败图标

        addReportFormView:false,//举报表单
        reportTypeId : ''as string,//举报分类Id
        reason : ''as string,//举报理由
        fileList : [] as any,//上传表单图片列表
        parameterId : '' as string,//举报参数Id
		module: 0 as number,//举报模块
        reportTypeList:[] as Array<ReportType>,//举报分类列表
        reportMaxImageUpload: 0 as number,//图片允许最大上传数量
        show_giveReason:false,//是否显示说明理由表单

        friendUser : '' as string,//对方用户

        line : new Map(),//楼中楼的线  key:回复Id value:是否显示
        dot : new Map(),//楼中楼的点  key:回复Id value:是否显示

        addCommentEditorPlugin:[] as BytemdPlugin[],//添加评论Markdown编辑器插件
        quoteCommentEditorPlugin:[] as BytemdPlugin[],//引用评论Markdown编辑器插件
        editCommentEditorPlugin:[] as BytemdPlugin[],//修改评论Markdown编辑器插件
    });



    //下拉刷新时触发
    const onRefresh = () => {
        state.isRefreshing = false;

        clearVideoPlayer();
        state.topic= {} as Topic;
        state.playerIdList.length = 0;//视频播放Id列表
        state.playerObjectList.length = 0;//视频播放对象集合
        state.playerHlsList.length = 0;//视频播放流对象集合
        state.playerNodeList.length = 0;//视频节点对象集合
        state.placeholder_DPlayer = '';//占位播放器
        state.lastPlayerId = '';//最后运行的播放Id

        state.showTopicPopover = false;//话题气泡弹出框

        state.alreadyCollected = false;//用户是否已经收藏话题
        state.favoriteCount = 0;//话题用户收藏总数
        state.alreadyLiked = false;//用户是否已经点赞该话题
        state.likeCount = 0;//话题用户点赞总数
        state.hidePasswordIndex = 0;//隐藏标签密码框索引
        state.isReplyTopicVisible = false;//是否包含回复话题可见隐藏标签

        state.alreadyLikedComment.clear();//用户是否已经点赞该评论
        state.commentLikeCount.clear();//评论用户点赞总数

        state.alreadyLikedCommentReply.clear();//用户是否已经点赞该评论回复
        state.commentReplyLikeCount.clear();//评论回复用户点赞总数

        state.followText = t('thread.350');//关注文本   关注

        state.popup_mentionUser =false;//是否弹出选择提及用户表单
        state.keyword ='';//关键词
        state.mentionUserList.length= 0;//提及用户集合
        state.mentionUserEditorId='';//提及用户编辑器Id
        state.currentMarkdownEditor = {} as BytemdEditorContext | undefined,//Markdown编辑器打开‘@提及’弹窗的编辑器对象

        state.showPopover_receiveRedEnvelope.length = 0;//气泡弹出框
        state.receiveRedEnvelopePlacement.clear();//红包位置 map格式 key:红包Id value: placement属性
        state.giveRedEnvelope = {} as GiveRedEnvelope;//红包
        state.receiveRedEnvelopeList.length = 0;//领取红包用户集合
        state.selectedReceiveRedEnvelopeId = '';//选中领取红包用户
        state.receiveRedEnvelopeCurrentPage = 0;//领取红包用户当前页
        state.receiveRedEnvelope_more = false;//是否显示更多领取红包用户

        state.showCommentPopover = {} as any;//评论气泡弹出框   key:评论Id value:是否显示  {评论Id-1 : 是否显示,评论Id-2 : 是否显示}
        state.showReplyPopover = {} as any;//回复气泡弹出框  key:回复Id value:是否显示  {回复Id-1 : 是否显示,回复Id-2 : 是否显示}
        state.commentList.length = 0;
        state.totalrecord = 0; //总记录数
        state.currentpage = 0; //当前页码
        state.totalpage = 1; //总页数
        state.maxresult = 12; //每页显示记录数

        state.viewNumber = 2;//回复伸缩 展示数量
        state.initialPage = 0; //初始页码（当URL参数commentId有值时commentList的第一项页码数）

        state.replyExpandOrShrink.clear(); //回复展开/收缩 map格式 key:评论Id value:是否展开
        state.allowComment = false;//是否显示评论表单
        state.availableTag.length = 0;//评论编辑器允许使用标签
        state.fileSystem = 0;//文件存储系统
        state.supportEditor=10;//支持编辑器

        state.popup_addComment = false;//添加评论弹出窗口
        state.addCommentEditor = {} as any;//添加评论编辑器
        state.addCommentEditorCreateParameObject = {} as any;//添加评论编辑器的创建参数
        state.addCommentMarkdownContent='';//markdown评论内容
        state.isAddCommentMarkdown=false;//是否使用markdown评论编辑器

        state.quoteCommentContent = '';//引用评论内容
        state.quoteFormView = {} as any;//评论引用表单  key:评论Id value:是否显示  key:评论Id value:是否显示  {评论Id-1 : 是否显示,评论Id-2 : 是否显示}
        state.quoteEditorMap.clear();//引用评论富文本编辑器集合 key:评论Id value:富文本编辑器
        state.quoteEditorCreateParameMap.clear();//引用评论编辑器的创建参数 key:评论Id value:编辑器参数对象
        state.quoteData.clear();//引用数据 map格式 key:评论Id value:引用html数据

        state.isQuoteCommentMarkdownMap.clear();//引用评论是否使用markdown编辑器  key:评论Id value:是否为markdown编辑器
        state.quoteCommentMarkdownContent = {} as any;//引用评论markdown编辑内容 key:评论Id value:评论内容

        state.editCommentFormView = {} as any;//修改评论表单  key:评论Id value:是否显示  {评论Id-1 : 是否显示,评论Id-2 : 是否显示}
        state.editCommentEditorMap.clear();//修改评论富文本编辑器集合 key:评论Id value:富文本编辑器
        state.editCommentEditorCreateParameMap.clear();//修改评论编辑器的创建参数 key:评论Id value:编辑器参数对象

        state.isEditCommentMarkdownMap.clear();//修改评论是否使用markdown编辑器  key:评论Id value:是否为markdown编辑器
        state.editCommentMarkdownContent = {} as any;//修改评论markdown编辑内容 key:评论Id value:评论内容


        state.addReplyFormView = {} as any;//添加回复表单  key:评论Id value:是否显示  {评论Id-1 : 是否显示,评论Id-2 : 是否显示}
        state.addReplyEditorMap.clear();//添加回复富文本编辑器集合 key:评论Id value:富文本编辑器
        state.addReplyEditorCreateParameMap.clear();//添加回复编辑器的创建参数 key:评论Id value:编辑器参数对象

        state.editReplyFormView = {} as any;//修改回复表单  key:回复Id value:是否显示  {回复Id-1 : 是否显示,回复Id-2 : 是否显示}
        state.editReplyEditorMap.clear();//修改回复富文本编辑器集合 key:回复Id value:富文本编辑器
        state.editReplyEditorCreateParameMap.clear();//修改回复编辑器的创建参数 key:回复Id value:编辑器参数对象

        state.addReplyFriendFormView = {} as any;//添加回复对方表单  key:回复Id value:是否显示  {回复Id-1 : 是否显示,回复Id-2 : 是否显示}
        state.addReplyFriendEditorMap.clear();//添加回复对方富文本编辑器集合 key:回复Id value:富文本编辑器
        state.addReplyFriendEditorCreateParameMap.clear();//添加回复对方编辑器的创建参数 key:回复Id value:编辑器参数对象


        state.showCaptcha.clear();//是否显示验证码  本项及以下几项的key格式为 key:模块+id  例如：添加评论key=addComment-话题Id   修改评论key=editComment-评论Id    添加引用评论key=addQuoteComment-评论Id    添加回复key=addReply-评论Id   修改回复key=editReply-回复Id
        state.captchaKey.clear();//验证码key
        state.captchaValue = {} as any;//验证码值
        state.imgUrl.clear();//验证码图片
        state.allowSubmit.clear();//提交按钮disabled状态

        state.likeTopicList.length = 0; //相似话题集合

        state.friendUser = '';//对方用户

        state.line.clear();//楼中楼的线  key:回复Id value:是否显示
        state.dot.clear();//楼中楼的点  key:回复Id value:是否显示

        state.addCommentEditorPlugin.length = 0;//添加评论Markdown编辑器插件
        state.quoteCommentEditorPlugin.length = 0;//引用评论Markdown编辑器插件
        state.editCommentEditorPlugin.length = 0;//修改评论Markdown编辑器插件


        state.isError = false;//是否列表数据加载失败
        state.isFinished = false;

        state.isLoading = true;//手动触发查询数据需将'加载状态结束'设为true
        init();
        queryCommentList(state.topicId,'', '', state.currentpage+1);
    };

    //错误
    const error = reactive({
        content : new Map<string,string>(),//评论和引用内容错误
        replyContent: new Map<string,string>(),//回复内容错误
        captchaValue : new Map<string,string>(),
        comment: new Map<string,string>(),//评论和引用错误
        reply: new Map<string,string>(),//回复错误
        reportTypeId:'',//举报分类Id
        reason:'',//举报理由
        imageFile:'',//举报图片
        report:'',//举报

        keyword :'',
    })


    //处理添加评论Markdown
    const handleAddCommentMarkdownChange = (value: string) => {
        state.addCommentMarkdownContent = value;
    }

    //评论白名单
    const commentSanitize = (schema: any) => {
        schema = sanitize(schema);
        return schema;
    }


     //处理切换到富文本编辑器
     const handleAddCommentToggleRichtextEditor = (editorId: string) => {
        state.isAddCommentMarkdown = false;
        nextTick(()=>{
            if (Object.keys(state.addCommentEditorCreateParameObject).length != 0) {//不等于空
                //创建富文本编辑器
                state.addCommentEditor = createEditor(
                    state.addCommentEditorCreateParameObject.toolbarRef,
                    state.addCommentEditorCreateParameObject.textRef,
                    state.addCommentEditorCreateParameObject.editorIconList,
                    getPageBasePath()+'common/default/',
                    state.addCommentEditorCreateParameObject.uploadPath,
                    state.addCommentEditorCreateParameObject.userGradeList,
                    state.fileSystem,
                    ()=>{
                        handleAddCommentToggleMarkdownEditor(editorId);
                    },
                    ()=>{
                        mentionPopUp(editorId,undefined)
                    },
                    ()=>{
                        //AI弹窗
                        aiPopUp(proxy,appContext,editorId,state.addCommentEditorCreateParameObject.uploadPath,'file',state.fileSystem,state.isAddCommentMarkdown,state.addCommentEditor,undefined)
                    }
                );
                state.addCommentEditor.txt.html(state.addCommentEditorCreateParameObject.html);//切换时设置富文本内容
            }
        })
    }

    //处理添加评论切换到Markdown编辑器
    const handleAddCommentToggleMarkdownEditor = (editorId: string) => {
        if (Object.keys(state.addCommentEditor).length != 0) {//不等于空
            state.addCommentEditorCreateParameObject.html = state.addCommentEditor.txt.html();//切换时保存富文本内容
            destroyEditor(state.addCommentEditor);
            state.addCommentEditor = {};
        }
        state.isAddCommentMarkdown = true;
    }


    //处理引用评论Markdown
    const handleQuoteCommentMarkdownChange = (value: string, commentId: string) => {
       Object.assign(state.quoteCommentMarkdownContent, {[commentId] : value});
    }


    //处理引用评论切换到富文本编辑器
    const handleQuoteCommentToggleRichtextEditor = (editorId: string) => {
        let commentId = editorId.split("_")[1];
        state.isQuoteCommentMarkdownMap.set(commentId,false);

        nextTick(()=>{

            let quoteEditorCreateParameObject = state.quoteEditorCreateParameMap.get(commentId);

            if (quoteEditorCreateParameObject !=undefined && Object.keys(quoteEditorCreateParameObject).length != 0) {//不等于空

                //创建富文本编辑器
                let quoteCommentEditor = createEditor(
                    quoteEditorCreateParameObject.toolbarRef,
                    quoteEditorCreateParameObject.textRef,
                    quoteEditorCreateParameObject.editorIconList,
                    getPageBasePath()+'common/default/',
                    quoteEditorCreateParameObject.uploadPath,
                    quoteEditorCreateParameObject.userGradeList,
                    state.fileSystem,
                    ()=>{
                        handleQuoteCommentToggleMarkdownEditor(editorId);
                    },
                    ()=>{
                        mentionPopUp(editorId,undefined)
                    },
                    ()=>{
                        //AI弹窗
                        aiPopUp(proxy,appContext,editorId,quoteEditorCreateParameObject.uploadPath,'file',state.fileSystem,state.isQuoteCommentMarkdownMap.get(commentId),quoteCommentEditor,undefined)
                    }
                );
                quoteCommentEditor.txt.html(quoteEditorCreateParameObject.html);//切换时设置富文本内容
                state.quoteEditorMap.set(commentId, quoteCommentEditor);
            }
        })
    }

    //处理引用评论切换到Markdown编辑器
    const handleQuoteCommentToggleMarkdownEditor = (editorId: string) => {
        let commentId = editorId.split("_")[1];

        let quoteEditor = state.quoteEditorMap.get(commentId);
        if (quoteEditor !=undefined && Object.keys(quoteEditor).length != 0) {//不等于空
            let quoteEditorCreateParameObject = state.quoteEditorCreateParameMap.get(commentId);
            quoteEditorCreateParameObject.html = quoteEditor.txt.html();//切换时保存富文本内容
            destroyEditor(quoteEditor);
            quoteEditor = {};
        }

        state.isQuoteCommentMarkdownMap.set(commentId,true);
    }


    //处理修改评论Markdown
    const handleEditCommentMarkdownChange = (value: string, commentId: string) => {
       Object.assign(state.editCommentMarkdownContent, {[commentId] : value});
    }

    //显示、隐藏提及弹窗
    const mentionPopUp = (editorId: string,ctx:BytemdEditorContext| undefined) => {

        state.popup_mentionUser = true;
        state.mentionUserEditorId = editorId;
        state.keyword = "";
        state.mentionUserList.length = 0;
        state.currentMarkdownEditor = ctx;
        error.keyword = "";
    }

    //关闭提及用户弹出框
    const closeMentionUser = () => {
        state.popup_mentionUser = false;
        state.currentMarkdownEditor = undefined;
    }

    //选择提及用户
    const selectMentionUser = (mentionUser:User) => {
        let url = "user/control/home?userName="+mentionUser.userName;
        let title = mentionUser.nickname != null && mentionUser.nickname != '' ? '@'+mentionUser.nickname : '@'+mentionUser.account;


        let forum = state.mentionUserEditorId.split("_")[0];//版块

        if(forum == 'addComment'){//添加评论
            if(state.isAddCommentMarkdown){//是否使用markdown评论编辑器
                state.currentMarkdownEditor?.editor.replaceSelection(`${title}`);
            }else{
                state.addCommentEditor.txt.insertMention(title, url);
            }
        }else if(forum == 'editComment'){//修改评论
            let commentId:string = state.mentionUserEditorId.split("_")[1];//Id

            if(state.isEditCommentMarkdownMap.get(commentId)!= undefined && state.isEditCommentMarkdownMap.get(commentId) == true){//修改评论是否使用markdown编辑器  key:评论Id value:是否为markdown编辑器
                state.currentMarkdownEditor?.editor.replaceSelection(`${title}`);
            }else{
                let editor = state.editCommentEditorMap.get(commentId);
                editor.txt.insertMention(title, url);
            }
        }else if(forum == 'quoteComment'){//引用评论
            let commentId:string = state.mentionUserEditorId.split("_")[1];//Id


            if(state.isQuoteCommentMarkdownMap.get(commentId)!= undefined && state.isQuoteCommentMarkdownMap.get(commentId)){//引用评论是否使用markdown编辑器  key:评论Id value:是否为markdown编辑器
                state.currentMarkdownEditor?.editor.replaceSelection(`${title}`);

            }else{
                let editor = state.quoteEditorMap.get(commentId);
                editor.txt.insertMention(title, url);
            }
        }else if(forum == 'addReply'){//添加回复
            let commentId:string = state.mentionUserEditorId.split("_")[1];//Id

            let editor = state.addReplyEditorMap.get(commentId);
            editor.txt.insertMention(title, url);
        }else if(forum == 'addReplyFriend'){//添加回复对方
            let replyId:string = state.mentionUserEditorId.split("_")[1];//Id

            let editor = state.addReplyFriendEditorMap.get(replyId);
            editor.txt.insertMention(title, url);
        }else if(forum == 'editReply'){//修改回复
            let replyId:string = state.mentionUserEditorId.split("_")[1];//Id

            let editor = state.editReplyEditorMap.get(replyId);
            editor.txt.insertMention(title, url);
        }

        closeMentionUser();
    }


    //搜索提及用户
    const searchMentionUser = () => {
        state.mentionUserList.length = 0
        error.keyword = "";
        if(state.keyword == null || state.keyword.trim() == ''){
            error.keyword = t('thread.360');//请输入用户账号或呢称
            return;
        }
        proxy?.$axios({
            url: '/user/control/queryUser',//暂时使用查询提及用户API
            method: 'get',
            params:  {keyword:state.keyword},
            showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
        })
        .then((response: AxiosResponse) => {
            if(response){
                const result: any = response.data;
                if(result != ""){
                    let mentionUser = JSON.parse(result)

                    if(mentionUser != null){
                        let userList = new Array();
                        if(mentionUser.nickname != null && mentionUser.nickname !=''){
                            mentionUser.avatar = letterAvatar(mentionUser.nickname, 48);
                        }else{
                            mentionUser.avatar = letterAvatar(mentionUser.account, 48);
                        }
                        userList.push(mentionUser);

                        state.mentionUserList = userList;
                    }else{
                        error.keyword = t('thread.370');//当前用户不存在
                    }
                }
            }
        })
        .catch((error: any) =>{
            console.log(error);
        });

    }


    //加载列表
    const onLoad = () => {

        let commentId = router.currentRoute.value.query.commentId != undefined ?router.currentRoute.value.query.commentId as string :'';
        let replyId = router.currentRoute.value.query.replyId != undefined ?router.currentRoute.value.query.replyId as string :'';


        if(commentId != '' && state.currentpage == 0){
            queryCommentList(state.topicId,commentId, replyId, undefined);
        }else{
            queryCommentList(state.topicId,'', '', state.currentpage+1);
        }
    }

    //查询话题
    const queryTopic = (topicId: string,callback :any) => {
        proxy?.$axios({
            url: '/thread',
            method: 'get',
            params:  {
                topicId: topicId,
            },
            showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
            showErrorMessage:false,// 是否显示错误提示
        })
        .then((response: AxiosResponse) => {
            return response?.data
        })
        .then((data: Topic) => {
            if(data){
                state.isTopicSkeleton = false;//关闭骨架屏
                //清空播放器
                clearVideoPlayer();
                //处理自定义标签
                let contentNode = document.createElement("div");
                contentNode.innerHTML = data.content;
                bindNode(contentNode);

                data.content = escapeVueHtml(contentNode.innerHTML);


                state.topic = data;

                if(state.topic.nickname != null && state.topic.nickname !=''){
                    state.topic.avatar = letterAvatar(state.topic.nickname, 40);
                }else{
                    state.topic.avatar = letterAvatar(state.topic.account, 40);
                }

                nextTick(()=>{
                    setTimeout(function() {
                        renderVideoPlayer();//渲染视频播放器
                    }, 30);

                    //渲染代码
                    let topicRefValue = proxy?.$refs['topic_'+state.topicId];
                    if(topicRefValue != undefined){
                        renderBindNode(topicRefValue);
                    }
                });



                //回调
                callback();

            }

        })
        .catch((error: any) =>{
            state.isError = true;
            state.isLoading = false;//加载状态结束
            console.log(error);
        });
    }



    //查询上一页评论
    const queryPreviousCommentList = (topicId: string, page:number|undefined) => {
        let params = {} as any;
        params.topicId = topicId;
        if(page != undefined && page >0){
            params.page = page;
        }
        proxy?.$axios({
            url: '/queryCommentList',
            method: 'get',
            params:  params,
            showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
            showErrorMessage:false,// 是否显示错误提示
        })
        .then((response: AxiosResponse) => {
            return response?.data
        })
        .then((data: PageView<Comment>) => {
            state.isCommentSkeleton = false;//关闭骨架屏


            if(data.records != null && data.records.length >0){
                //处理评论数据
                processCommentData(data);


                for (let i:number = data.records.length - 1; i >= 0; i--) { // 倒序
                    let comment = data.records[i];
                    state.commentList.unshift(comment);
                }
                state.initialPage = state.initialPage-1; //初始页码
            }



            state.isShowPage = true;//显示分页栏

            nextTick(()=>{
                if(data.records != null && data.records.length > 0){
                    for (let i = 0; i <data.records.length; i++) {
                        let comment = data.records[i];
                        let commentRefValue =  (proxy?.$refs['commentContent_'+comment.id] as any);
                        if(commentRefValue != undefined){
                            renderBindNode(commentRefValue[0]);
                        }

                    }
                }
            })

        })
        .catch((error: any) =>{
            console.log(error);
        });
    }



    //查询评论列表
    const queryCommentList = (topicId: string,commentId: string, replyId: string, page:number|undefined) => {
        let params = {} as any;
        params.topicId = topicId;
        if(commentId != null && commentId != ''){
            params.commentId = commentId;
        }
        if(page != undefined){
            params.page = page;
        }

        proxy?.$axios({
            url: '/queryCommentList',
            method: 'get',
            params:  params,
            showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
            showErrorMessage:false,// 是否显示错误提示
        })
        .then((response: AxiosResponse) => {
            return response?.data
        })
        .then((data: PageView<Comment>) => {
            state.isCommentSkeleton = false;//关闭骨架屏


            if(data.records != null && data.records.length >0){
                //处理评论数据
                processCommentData(data);
                state.commentList.push.apply(state.commentList,data.records);
            }


            state.totalrecord = parseInt(data.totalrecord);//服务器返回的long类型已转为String类型
            state.currentpage = data.currentpage;
            state.totalpage = parseInt(data.totalpage);//服务器返回的long类型已转为String类型
            state.maxresult = data.maxresult;

            state.isShowPage = true;//显示分页栏


            if(page == undefined){
                state.initialPage = data.currentpage; //初始页码

                if(state.totalpage == data.currentpage){//如果是最后一页
                    state.isFinished = true;
                }

            }

            if(state.totalpage == 0 || state.totalpage == page){//如果没有内容或是最后一页，则不再加载
                state.isFinished = true;
            }
            state.isLoading = false;//加载状态结束

            nextTick(()=>{
                if(data.records != null && data.records.length > 0){
                    for (let i = 0; i <data.records.length; i++) {
                        let comment = data.records[i];
                        let commentRefValue =  (proxy?.$refs['commentContent_'+comment.id] as any);
                        if(commentRefValue != undefined){
                            renderBindNode(commentRefValue[0]);
                        }

                    }
                }

                //跳转到锚点
                nextTick(()=>{
                    //跳转到评论
                    if(commentId != null && commentId != '' && (replyId == null || replyId == '')){

                        let commentRef = (proxy?.$refs['comment_'+commentId] as any);
                        if(commentRef !=undefined){
                            let commentRefValue = commentRef[0];
                            window.scrollTo(0,commentRefValue.getBoundingClientRect().top-40);

                        }
                    }
                    //跳转到回复
                    if(replyId != null && replyId != ''){
                        if (state.commentList != null && state.commentList.length > 0) {
                            for(var i=0;i<state.commentList.length; i++){
                                var comment = state.commentList[i];
                                if(comment.replyList != null && comment.replyList.length > 0){
                                    for(var j=0;j<comment.replyList.length; j++){
                                        var reply = comment.replyList[j];
                                        if(reply.id==replyId && j >=state.viewNumber){//如果在收缩层
                                            telescopicReply(comment.id);//展开
                                        }
                                    }
                                }
                            }
                        }
                        nextTick(()=>{
                            let replyIdRef = (proxy?.$refs['replyData_'+replyId] as any);
                            if(replyIdRef !=undefined){
                                let replyIdRefValue = replyIdRef[0];
                                window.scrollTo(0,replyIdRefValue.getBoundingClientRect().top-40);

                            }
                        })
                    }
                })
            })



        })
        .catch((error: any) =>{
            state.isError = true;
            state.isLoading = false;//加载状态结束
            console.log(error);
        });
    }

    //处理评论数据
    const processCommentData = (data: PageView<Comment>) => {
        for(let i:number=0; i<data.records.length; i++){
            let comment = data.records[i];

            state.replyExpandOrShrink.set(comment.id, false); //是否展开

            if(comment.nickname != null && comment.nickname !=''){
                comment.avatar = letterAvatar(comment.nickname, 60);
            }else{
                comment.avatar = letterAvatar(comment.account, 60);
            }

            if(comment.replyList != null && comment.replyList.length >0){
                for(let j:number=0; j<comment.replyList.length; j++){
                    let reply = comment.replyList[j];
                    if(reply.nickname != null && reply.nickname !=''){
                        reply.avatar = letterAvatar(reply.nickname, 38);
                    }else{
                        reply.avatar = letterAvatar(reply.account, 38);
                    }

                    if(reply.friendUserName != null && reply.friendUserName != ''){
                        if(reply.friendNickname != null && reply.friendNickname !=''){
                            reply.friendAvatar = letterAvatar(reply.friendNickname, 22);
                        }else{
                            reply.friendAvatar = letterAvatar(reply.friendAccount, 22);
                        }
                    }

                    //处理图片放大标签
                    let contentNode = document.createElement("div");
                    contentNode.innerHTML = reply.content;
                    bindNode(contentNode);
                    reply.content = escapeVueHtml(contentNode.innerHTML);
                }
            }


            //组装引用数据
            if(comment.quoteList != null && comment.quoteList.length >0){
                let quoteContent = "";
                for (let j = 0; j <comment.quoteList.length; j++) {
                    let quote = comment.quoteList[j];

                    let avatarHtml = "";
                    if(quote.account != null && quote.account != ''){
                        avatarHtml += "<router-link class=\"avatarBox\"  tag=\"a\" :to=\"{path: '/user/control/home', query: {userName: '"+quote.userName+"'}}\">";
                        if(quote.avatarName != undefined && quote.avatarName != null && quote.avatarName != ''){
                            avatarHtml += "<img src=\""+quote.avatarPath+"100x100/"+quote.avatarName+"\">";
                        }
                        if(quote.avatarName == undefined || quote.avatarName == null || quote.avatarName == ''){
                            let char = (quote.nickname != null && quote.nickname != '') ? quote.nickname : quote.account;
                            let width = 22;//头像宽
                            avatarHtml += "<img src=\""+letterAvatar(char, width)+"\">";

                        }
                        avatarHtml += "</router-link>";
                    }

                    if(quote.account == null || quote.account == ''){
                        avatarHtml += "<span class='avatarBox'>";
                        if(quote.avatarName != undefined && quote.avatarName != null && quote.avatarName != ''){
                            avatarHtml += "<img src=\""+quote.avatarPath+"100x100/"+quote.avatarName+"\">";
                        }
                        if(quote.avatarName == undefined || quote.avatarName == null || quote.avatarName == ''){
                            let char = (quote.nickname != null && quote.nickname != '') ? quote.nickname : quote.account;
                            let width = 22;//头像宽
                            avatarHtml += "<img src=\""+letterAvatar(char, width)+"\">";

                        }
                        avatarHtml += "</span>";
                        avatarHtml += "<span class='cancelNickname'>"+t('thread.270')+"</span>";//已注销

                    }

                    let quoteCancelAccountHtml = "";
                    if(quote.account == null || quote.account == ''){
                        quoteCancelAccountHtml = "<div class='cancelAccount'>"+t('thread.40')+"</div>";//此用户账号已注销
                    }

                    //quoteContent = "<div class=\"quoteComment\">"+quoteContent+"<span class=\"userName\">"+avatarHtml+"<router-link tag=\"span\" :to=\"{path: '/user/control/home', query: {userName: '"+quote.userName+"'}}\">"+(quote.nickname != null && quote.nickname != '' ? escapeHtml(quote.nickname) : escapeHtml(quote.account))+"</router-link>&nbsp;的评论：</span><br/><div class=\"quoteContent\">"+quote.content+quoteCancelAccountHtml+"</div></div>";
                    quoteContent = "<div class=\"quoteComment\">"+quoteContent+"<span class=\"userName\"><i18n-t keypath=\"thread.380\" scope=\"global\"> <template #p1>"+avatarHtml+"<router-link tag=\"span\" :to=\"{path: '/user/control/home', query: {userName: '"+quote.userName+"'}}\">"+(quote.nickname != null && quote.nickname != '' ? escapeHtml(quote.nickname) : escapeHtml(quote.account))+"</router-link>&nbsp;</template></i18n-t>：</span><br/><div class=\"quoteContent\">"+quote.content+quoteCancelAccountHtml+"</div></div>";

                }

                state.quoteData.set(comment.id, escapeVueHtml(quoteContent));
            }


            //处理图片放大标签
            let contentNode = document.createElement("div");
            contentNode.innerHTML = comment.content;
            bindNode(contentNode);
            comment.content = escapeVueHtml(contentNode.innerHTML);
        }
    }



    //清除评论列表
    const clearCommentList = () => {
        state.quoteData.clear();
        state.commentList.length =0;
        state.isFinished = false;
        state.line.clear();//楼中楼的线  key:回复Id value:是否显示
        state.dot.clear();//楼中楼的点  key:回复Id value:是否显示

        for (const [key, value] of Object.entries(state.editCommentEditorMap)){
            if(value != null){
                destroyEditor(value);
            }
        }
        state.editCommentEditorMap.clear();
        state.editCommentEditorCreateParameMap.clear();

        for (const [key, value] of Object.entries(state.quoteEditorMap)){
            if(value != null){
                destroyEditor(value);
            }
        }
        state.quoteEditorMap.clear();
        state.quoteEditorCreateParameMap.clear();

        for (const [key, value] of Object.entries(state.addReplyEditorMap)){
            if(value != null){
                destroyEditor(value);
            }
        }
        state.addReplyEditorMap.clear();
        state.addReplyEditorCreateParameMap.clear();

        for (const [key, value] of Object.entries(state.addReplyFriendEditorMap)){
            if(value != null){
                destroyEditor(value);
            }
        }
        state.addReplyFriendEditorMap.clear();
        state.addReplyFriendEditorCreateParameMap.clear();

        for (const [key, value] of Object.entries(state.editReplyEditorMap)){
            if(value != null){
                destroyEditor(value);
            }
        }
        state.editReplyEditorMap.clear();
        state.editReplyEditorCreateParameMap.clear();
    }

    //话题气泡弹出框菜单选项
    const onTopicPopoverActions = (topic:Topic) => {
        let actions = new Array()
        if(state.topic.userName == store_systemUser.value.userName){
            actions.push({ text: t('thread.390'), topicId:topic.id});//编辑
        }
        if(store_systemUser.value != null && Object.keys(store_systemUser.value).length >0){
            actions.push({ text: t('thread.400'), topicId:topic.id});//举报
        }

        return actions;
    }



    //话题气泡弹出框选择
    const onTopicPopoverSelect = (action:any) => {
        if(action.text == t('thread.390')){//编辑
            router.push({path: '/user/editTopic', query:{ topicId : action.topicId}})
        }
        if(action.text == t('thread.400')){//举报
            addReportUI(action.topicId,10);
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
                dom.innerHTML="<div class='dplayer-process'><div class='box'><div class='prompt'>"+t('thread.410')+"</div></div></div>";
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
    //展示/隐藏回复
    const telescopicReply = (commentId:string) => {
        let status = state.replyExpandOrShrink.get(commentId);
        if(status){
            state.replyExpandOrShrink.set(commentId, false); //收缩
        }else{
            state.replyExpandOrShrink.set(commentId, true); //伸展
        }

        closeReplyLevel()
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
    //图片加载完成
    const onLoadPicture = (imagePath:string) => {

    }


    //话题解锁
    const onTopicUnhide = (hideType: number,hidePassword: string) => {
        let formData = new FormData();
        formData.append('topicId', state.topicId);
        formData.append('hideType',  String(hideType));
        if(hideType == 10){
            if(hidePassword != undefined && hidePassword != ""){
                formData.append('password',  hidePassword);
            }else{
                Notify({
                    type: 'danger',
                    message: t('thread.420')//密码不能为空
                });

                return;
            }
        }

        Dialog.confirm({
            message:t('thread.430'),//确定解锁?
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
                            message: t('thread.440')//话题解锁成功
                        });
                        //查询话题
                        queryTopic(state.topicId,()=>{});//调用父组件方法
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
    const bindNode = (node:any) => {


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
                        nodeHtml += 	'<div class="background-prompt">'+t('thread.450')+'</div>';
                        nodeHtml += 	'<div class="input-box">';
                        //placeholder="密码"
                        nodeHtml += 		'<input type="password" v-model.trim="hide_passwordList['+state.hidePasswordIndex+']" class="text" maxlength="30"  placeholder="'+t('thread.460')+'">';
                        //提交
                        nodeHtml += 		'<div class="button" @click="onTopicUnhide_renderTemplate(10,'+state.hidePasswordIndex+');">'+t('thread.470')+'</div>';

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
                        nodeHtml += 	'<div class="background-prompt">'+t('thread.480')+'</div>';
                        nodeHtml += '</div>';
                        childNode.innerHTML = nodeHtml;
                        state.isReplyTopicVisible = true;
                    }else if(childNode.getAttribute("hide-type") == "30"){
                        var nodeHtml = "";
                        nodeHtml += '<div class="hide-box">';
                        nodeHtml += 	'<Icon name="lock-solid-2" size="52px" class="background-image"></Icon>';
                        //nodeHtml += 	'<div class="background-prompt">此处内容已被隐藏，等级达到‘'+escapeHtml(childNode.getAttribute("description"))+'’可见</div>';
                        nodeHtml += 	'<div class="background-prompt">'+t('thread.490',{'p1': escapeHtml(childNode.getAttribute("description"))})+'</div>';
                        nodeHtml += '</div>';
                        childNode.innerHTML = nodeHtml;
                    }else if(childNode.getAttribute("hide-type") == "40"){
                        var nodeHtml = "";
                        nodeHtml += '<div class="hide-box">';
                        nodeHtml += 	'<Icon name="lock-solid-2" size="52px" class="background-image"></Icon>';
                        //nodeHtml += 	'<div class="background-prompt">此处内容已被隐藏，支付'+childNode.getAttribute("input-value")+'积分可见</div>';
                        nodeHtml += 	'<div class="background-prompt">'+t('thread.500',{'p1': childNode.getAttribute("input-value")})+'</div>';
                        nodeHtml += 	'<div class="submit-box" @click="onTopicUnhide_renderTemplate(40);">'+t('thread.510')+'</div>';
                        nodeHtml += '</div>';
                        childNode.innerHTML = nodeHtml;
                    }else if(childNode.getAttribute("hide-type") == "50"){
                        var nodeHtml = "";
                        nodeHtml += '<div class="hide-box">';
                        nodeHtml += 	'<Icon name="lock-solid-2" size="52px" class="background-image"></Icon>';
                        //nodeHtml += 	'<div class="background-prompt">此处内容已被隐藏，支付 ￥<span class="highlight">'+childNode.getAttribute("input-value")+'</span> 元可见</div>';
                        nodeHtml += 	'<div class="background-prompt"><i18n-t keypath="thread.520" scope="global"><template #p1><span class="highlight">'+childNode.getAttribute("input-value")+'</span></template></i18n-t></div>';
                        nodeHtml += 	'<div class="submit-box" @click="onTopicUnhide_renderTemplate(50);">'+t('thread.510')+'</div>';
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
                        html = '<van-image src="'+src+'" '+style+' lazy-load ></van-image>';

                      //  html = '<img '+style+' v-lazy="{src:\''+src+'\',loading:\''+state.photo_loading+'\',error:\''+state.photo_error+'\'}" />';

                    }else{
                        //@click方法由RenderTemplate.vue调度处理
                        html = '<van-image src="'+src+'" '+style+' lazy-load @click="onZoomPicture_renderTemplate(\''+src+'\')" @load="onLoadPicture_renderTemplate(\''+src+'\')"></van-image>';

                       // html = '<img '+style+'  v-lazy="{src:\''+src+'\',error:\''+state.photo_error+'\'}" @click="onZoomPicture_renderTemplate(\''+src+'\')"/>';

                    }
                    //创建要替换的元素
                //	let html = '<el-image src="'+src+'" '+style+' lazy></el-image>';
                //	let html = '<el-image src="'+src+'" '+style+' :preview-src-list=["http://127.0.0.1:8080/cms/common/tttttt/templates.jpg"] lazy hide-on-click-modal ></el-image>';



                    let placeholder = document.createElement('div');
                    placeholder.innerHTML = html;
                    let node = placeholder.childNodes[0];
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

                //处理 @提及 标签
                if(childNode.nodeName.toLowerCase() == "a" ){
                    let linkType = childNode.getAttribute("linkType");
                    if(linkType == "mention"){
                        childNode.removeAttribute("target");
                    }
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
                            childNode.setAttribute("data-prismjs-copy",t('thread.530'));//复制
                            childNode.setAttribute("data-prismjs-copy-error",t('thread.540'));//按Ctrl+C复制
                            childNode.setAttribute("data-prismjs-copy-success",t('thread.550'));//复制成功


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
                        childNode.setAttribute("data-prismjs-copy",t('thread.530'));//复制
                        childNode.setAttribute("data-prismjs-copy-error",t('thread.540'));//按Ctrl+C复制
                        childNode.setAttribute("data-prismjs-copy-success",t('thread.550'));//复制成功



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

                bindNode(childNode);


            }
        }
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


    //计算楼层
    const calculateFloor = (commentId:string) => {
        if(state.commentList != null && state.commentList.length >0){
            for(let i:number=0; i<state.commentList.length; i++){
                let comment = state.commentList[i];
                if(comment.id == commentId){

                    if(state.initialPage >1){
                        return (state.initialPage-1) * state.maxresult + i +1;
                    }else{
                        return i +1;
                    }
                }
            }
        }
        return '';
    }

    //查询是否已经关注该用户
    const queryFollowing = (userName:string) => {
        //清空信息
        state.followText = t('thread.350');//关注

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
                    state.followText = t('thread.560');//已关注
                }
            }
        }).catch((error: any) =>{
            console.log(error);
        });
    }
    //添加关注
    const addFollow = (userName:string) => {
        if(state.followText ==t('thread.350')){//关注
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
                        state.followText =t('thread.560')//已关注
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
    //添加收藏
    const addFavorite = (topicId:string) => {
        if(store_systemUser.value == null || Object.keys(store_systemUser.value).length==0){
            Notify({
                type: 'warning',
                message: t('thread.570')//请先登录再加入收藏
            });
            return;
        }
        if(state.alreadyCollected){
            return;
        }

        let formData = new FormData();
        formData.append('topicId', topicId);

        proxy?.$axios({
            url: '/user/control/favorite/add',
            method: 'post',
            data: formData
        })
        .then((response: AxiosResponse) => {
            if(response){

                const result: any = response.data;

                if(JSON.parse(result.success)){
                    Notify({
                        type: 'success',
                        message: t('thread.580')//加入收藏成功
                    });
                    queryAlreadyCollected(topicId);
                    queryFavoriteCount(topicId);

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

    //用户是否已经收藏话题
    const queryAlreadyCollected = (topicId:string) => {
        proxy?.$axios({
            url: '/queryAlreadyCollected',
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
                state.alreadyCollected = JSON.parse(data)
            }

        })
        .catch((error: any) =>{
            console.log(error);
        });
    }
    //查询话题用户收藏总数
    const queryFavoriteCount = (topicId:string) => {
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
                state.favoriteCount = count;
            }
        })
        .catch((error: any) =>{
            console.log(error);
        });
    }
    //删除收藏
    const deleteFavorite = (topicId: string) => {
        proxy?.$axios({
            url: '/user/control/deleteFavorite',
            method: 'post',
            params:  {
                topicId: topicId,
            },
        })
        .then((response: AxiosResponse) => {
            if(response){
                const result: any = response.data;

                if(JSON.parse(result.success)){//成功
                    Notify({
                        type: 'success',
                        message: t('thread.600')//取消收藏成功
                    });
                    queryAlreadyCollected(topicId);
                    queryFavoriteCount(topicId);
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


    //回调查询点赞
    const onQueryLike = (itemId:string,module:number) => {
        queryAlreadyLiked(itemId,module);
        queryLikeCount(itemId,module);
    }

    //添加点赞
    const addLike = (itemId:string,module:number) => {
        if(store_systemUser.value == null || Object.keys(store_systemUser.value).length==0){
            Notify({
                type: 'warning',
                message: t('thread.610')//请先登录再点赞
            });
            return;
        }
        if(module == 10){
            if(state.alreadyLiked){
                return;
            }
        }else if(module == 20){
            if(state.alreadyLikedComment.get(itemId)){
                return;
            }
        }else if(module == 30){
            if(state.alreadyLikedCommentReply.get(itemId)){
                return;
            }
        }

        let formData = new FormData();
        formData.append('itemId', itemId);
        formData.append('module', String(module));

        proxy?.$axios({
            url: '/user/control/like/add',
            method: 'post',
            data: formData
        })
        .then((response: AxiosResponse) => {
            if(response){

                const result: any = response.data;

                if(JSON.parse(result.success)){
                    Notify({
                        type: 'success',
                        message: t('thread.620')//点赞成功
                    });
                    queryAlreadyLiked(itemId,module);
                    queryLikeCount(itemId,module);
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
    //用户是否已经点赞话题
    const queryAlreadyLiked = (itemId:string,module:number) => {
        proxy?.$axios({
            url: '/queryAlreadyLiked',
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

                if(module == 10){
                    state.alreadyLiked = JSON.parse(data);
                }else if(module == 20){
                    state.alreadyLikedComment.set(itemId,JSON.parse(data))
                }else if(module == 30){
                    state.alreadyLikedCommentReply.set(itemId,JSON.parse(data))
                }

            }

        })
        .catch((error: any) =>{
            console.log(error);
        });
    }
    //查询话题用户点赞总数
    const queryLikeCount = (itemId:string,module:number) => {
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
                if(module == 10){
                    state.likeCount = count;
                }else if(module == 20){
                    state.commentLikeCount.set(itemId,count)
                }else if(module == 30){
                    state.commentReplyLikeCount.set(itemId,count)
                }
            }
        })
        .catch((error: any) =>{
            console.log(error);
        });
    }

   //删除点赞
   const deleteLike = (itemId:string,module:number) => {
        proxy?.$axios({
            url: '/user/control/deleteLike',
            method: 'post',
            params:  {
                itemId: itemId,
                module: module,
            },
        })
        .then((response: AxiosResponse) => {
            if(response){
                const result: any = response.data;

                if(JSON.parse(result.success)){//成功
                    Notify({
                        type: 'success',
                        message: t('thread.630')//取消点赞成功
                    });

                    queryAlreadyLiked(itemId,module);
                    queryLikeCount(itemId,module);
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

     //刷新验证码
     const replaceCaptcha = (key:string) => {
        state.imgUrl.set(key,store.baseURL+"captcha/" + state.captchaKey.get(key) + ".jpg?" + Math.random())
    }


    //校验验证码
    const checkCaptchaValue = (value: any, callback: any,key:string) => {
        if(state.captchaKey.get(key) != null && state.captchaKey.get(key) != ''){
            if (value === '') {
                return callback(t('common.10'));//验证码不能为空
            }else{
                if (value.trim().length < 4) {
                    callback(t('common.20'));//验证码长度为4个字符
                } else {

                    proxy?.$axios({
                        url: '/userVerification',
                        method: 'get',
                        params:  {
                            captchaKey:state.captchaKey.get(key),
                            captchaValue:state.captchaValue[key]
                        },
                        showLoading: false,//是否显示加载图标
                        loadingMask:false,// 是否显示遮罩层
                    })
                    .then((response: AxiosResponse) => {
                        if(response){
                            const result: any = response.data;
                            if(!JSON.parse(result)){
                                callback(t('common.30'));//验证码错误
                            }else{
                                callback();
                            }
                        }
                    }).catch((error: any) =>{
                        console.log(error);
                    });
                }

            }
        }
    }

    //校验验证码规则
    const checkCaptchaValueRules = (key:string) =>{
        error.captchaValue.set(key,'');
        checkCaptchaValue(state.captchaValue[key].trim(), (err:string)=>{
            if(err != undefined){
                error.captchaValue.set(key,err);
            }
        },key)
    }

    //评论气泡弹出框菜单选项
    const onCommentPopoverActions = (comment:Comment) => {
      //  [{ text: '解锁隐藏标签用户', topicId:topic.id, className:'custom-popoverModule-1'},{ text: '收藏用户', topicId:topic.id, className:'custom-popoverModule-1'},{ text: '点赞用户', topicId:topic.id, className:'custom-popoverModule-1'}]

        let actions = new Array()
        if(store_systemUser.value != null && Object.keys(store_systemUser.value).length>0){
            if(state.alreadyLikedComment.get(comment.id) != undefined && state.alreadyLikedComment.get(comment.id) == true){
                actions.push({ text: t('thread.170'), comment:comment});//已赞
            }else{
                actions.push({ text: t('thread.640'), comment:comment});//点赞
            }
            actions.push({ text: t('thread.650'), commentId:comment.id});//回复
            actions.push({ text: t('thread.660'), comment:comment});//引用

            actions.push({ text: t('thread.400'), commentId:comment.id});//举报
            if(comment.userName ==  store_systemUser.value.userName){
                actions.push({ text: t('thread.390'), comment:comment});//编辑
                actions.push({ text: t('thread.670'), commentId:comment.id});//删除
            }
        }
        return actions;
    }



    //评论气泡弹出框选择
    const onCommentPopoverSelect = (action:any) => {
        if(action.text == t('thread.640')){//点赞
            addLike(action.comment.id,20)
            queryAlreadyLiked(action.comment.id,20);
            queryLikeCount(action.comment.id,20);
        }else if(action.text == t('thread.170')){//已赞
            deleteLike(action.comment.id,20)
            queryAlreadyLiked(action.comment.id,20);
            queryLikeCount(action.comment.id,20);
        }else if(action.text == t('thread.650')){//回复
            //添加回复表单
            addReplyUI(action.commentId);
        }else if(action.text == t('thread.660')){//引用
            quoteCommentUI(action.comment);
        }else if(action.text == t('thread.400')){//举报
            addReportUI(action.commentId,20);
        }else if(action.text == t('thread.390')){//编辑
            editCommentUI(action.comment)
        }else if(action.text == t('thread.670')){//删除
            onDeleteComment(action.commentId);
        }
    }

    //发表评论表单
    const addCommentUI = () => {
        state.popup_addComment = true;

        //锁定滚动层
        lock(document.querySelector('.addCommentModule') as any)
        document.querySelector('body')!.style.setProperty('position', 'sticky')//移除tua-body-scroll-lock锁定层时添加在body上的position: fixed属性,此属性会导致ByteMD编辑器不能选择行



        nextTick(()=>{
            if(state.showCaptcha.get("addComment-"+state.topicId)){
                replaceCaptcha("addComment-"+state.topicId);//刷新验证码
            }

            if (Object.keys(state.addCommentEditorCreateParameObject).length > 0 && Object.keys(state.addCommentEditor).length == 0) {
                if(!state.isAddCommentMarkdown){
                    //创建富文本编辑器
                    state.addCommentEditor = createEditor(
                        addCommentContentEditorToolbarRef.value,
                        addCommentContentEditorTextRef.value,
                        state.addCommentEditorCreateParameObject.editorIconList,
                        getPageBasePath()+'common/default/',
                        state.addCommentEditorCreateParameObject.uploadPath,
                        null,
                        state.fileSystem,
                        (editorId: string)=>{
                            handleAddCommentToggleMarkdownEditor(editorId);
                        },
                        (editorId: string)=>{
                            mentionPopUp(editorId,undefined)
                        },
                        (editorId: string)=>{
                            //AI弹窗
                            aiPopUp(proxy,appContext,editorId,state.addCommentEditorCreateParameObject.uploadPath,'file',state.fileSystem,state.isAddCommentMarkdown,state.addCommentEditor,undefined)
                        }
                    );
                }
                state.addCommentEditorCreateParameObject.toolbarRef = addCommentContentEditorToolbarRef.value;
                state.addCommentEditorCreateParameObject.textRef = addCommentContentEditorTextRef.value;
            }

        })
    }

    //关闭添加评论页
    const closeAddComment = () => {
        clearBodyLocks()//关闭锁定的滚动层
    }
    //查询添加评论页
    const queryAddComment = (topicId:string) => {
        if(store_systemUser.value == null || Object.keys(store_systemUser.value).length==0){
            return;
        }

        proxy?.$axios({
            url: '/queryAddComment',
            method: 'get',
            params:  {},
            showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
        })
        .then((response: AxiosResponse) => {
            if(response){
                let data =  response.data;
                state.allowComment = data.allowComment;

                nextTick(()=>{
                    if(state.topic?.allow && data.allowComment){
                        //编辑器图标
                        let editorIconList = new Array();
                        if(data.availableTag != null && data.availableTag != ''){
                            let availableTagObject = JSON.parse(data.availableTag);//JSON转为对象
                            if(data.supportEditor == 30 || data.supportEditor == 40){
                                availableTagObject.push("toggleEditor");
                            }
                            if(availableTagObject != null && availableTagObject.length >0){
                                for(let i=0; i<availableTagObject.length; i++){
                                    let _availableTag = availableTagObject[i];

                                    if(_availableTag == "code"){//代码
                                        editorIconList.push("code");
                                    }else if(_availableTag == "forecolor"){//文字颜色
                                    //	editorIconList.push("foreColor");
                                    }else if(_availableTag == "hilitecolor"){//文字背景
                                    //	editorIconList.push("backColor");
                                    }else if(_availableTag == "bold"){//粗体
                                    //    editorIconList.push("bold");
                                    }else if(_availableTag == "italic"){//斜体
                                     //   editorIconList.push("italic");
                                    }else if(_availableTag == "underline"){//下划线
                                    //    editorIconList.push("underline");
                                    }else if(_availableTag == "link"){//插入链接
                                        editorIconList.push("link");
                                    }else if(_availableTag == "emoticons"){//插入表情
                                        editorIconList.push("emoticon");
                                    }else if(_availableTag == "image"){//图片
                                        editorIconList.push("image");
                                    }else if(_availableTag == "insertfile"){//文件
                                        editorIconList.push("file");
                                    }else if(_availableTag == "mention"){//提及
                                        editorIconList.push("mention");
                                    }else if(_availableTag == "ai"){//AI
                                        editorIconList.push("ai");
                                    }else if(_availableTag == "toggleEditor"){//切换编辑器
                                        editorIconList.push("toggleEditor");
                                    }
                                }
                            }

                            state.availableTag = availableTagObject;//话题编辑器允许使用标签
                        }

                        state.fileSystem = data.fileSystem;//文件存储系统
                        state.supportEditor = data.supportEditor;//支持编辑器 10.仅富文本编辑器 20.仅Markdown编辑器  30.富文本编辑器优先 40.Markdown编辑器优先
                        let uploadPath = "user/control/comment/uploadImage?topicId="+topicId;

                        if(data.supportEditor == 20 || data.supportEditor == 40){
                            state.isAddCommentMarkdown = true;
                        }

                        if(state.addCommentEditorPlugin != null && state.addCommentEditorPlugin.length ==0){
                            //添加插件
                            state.addCommentEditorPlugin.push(...markdownPlugins());

                            if(state.supportEditor == 30 || state.supportEditor == 40){//10.仅富文本编辑器 20.仅Markdown编辑器  30.富文本编辑器优先 40.Markdown编辑器优先
                                state.addCommentEditorPlugin.push(
                                    toggleEditor((editorId: string)=>{handleAddCommentToggleRichtextEditor(editorId)})
                                );
                            }

                            if(editorIconList?.indexOf('image') != -1){
                                state.addCommentEditorPlugin.push(
                                    imageUpload("user/control/comment/uploadImage?topicId="+state.topicId,'file',state.fileSystem)
                                );
                                state.addCommentEditorPlugin.push(
                                    pasteImageUpload("user/control/comment/uploadImage?topicId="+state.topicId,'file',state.fileSystem)
                                );
                            }

                            state.addCommentEditorPlugin.push(emoji());
                            if(editorIconList?.indexOf('mention') != -1){
                                state.addCommentEditorPlugin.push(
                                    mention((editorId: string,ctx:BytemdEditorContext)=>{mentionPopUp(editorId,ctx)})
                                );
                            }
                            if(editorIconList?.indexOf('ai') != -1){
                                state.addCommentEditorPlugin.push(

                                    ai((editorId: string,ctx:BytemdEditorContext)=>{aiPopUp(proxy,appContext,editorId,uploadPath,'file',state.fileSystem,state.isAddCommentMarkdown,undefined,ctx)})
                                );
                            }
                            state.addCommentEditorPlugin.push(
                                help(editorIconList,[])
                            );


                        }


                        if (data.captchaKey != undefined && data.captchaKey != '') {

                            state.showCaptcha.set("addComment-"+topicId,true)
                            state.captchaKey.set("addComment-"+topicId,data.captchaKey)
                            Object.assign(state.captchaValue, {['addComment-'+topicId] : ''});

                        }


                        if (Object.keys(state.addCommentEditorCreateParameObject).length === 0) {//等于空

                            state.addCommentEditorCreateParameObject = {
                                toolbarRef:addCommentContentEditorToolbarRef.value,
                                textRef:addCommentContentEditorTextRef.value,
                                editorIconList:editorIconList,
                                uploadPath:uploadPath,
                                userGradeList:null
                            }

                        }

                    }

                })
            }


        })
        .catch((error: any) =>{
            console.log(error);
        });

    }
    //添加评论 -- 提交数据
    const onAddCommentFormSubmit = () => {
        let _key =  "addComment-"+state.topicId;
        state.allowSubmit.set(_key,true);//提交按钮disabled状态

        const p1 = new Promise<void>((resolve, reject) => {
            error.captchaValue.set(_key,'');
            if(state.captchaKey.get(_key) != undefined && state.captchaKey.get(_key) != null){

                if(state.captchaValue[_key] != undefined && state.captchaValue[_key] != null && state.captchaValue[_key] != ''){
                    checkCaptchaValue(state.captchaValue[_key].trim(), (err:string)=>{
                        if(err != undefined){
                            error.captchaValue.set(_key,err);
                            state.allowSubmit.set(_key,false);//提交按钮disabled状态
                        }else{
                            resolve();
                        }
                    },_key)
                }else{
                    error.captchaValue.set(_key,t('common.10'));//验证码不能为空
                    state.allowSubmit.set(_key,false);//提交按钮disabled状态
                }
            }else{
                resolve();
            }
        });

        Promise.all([p1])
            .then(() => {
                //清空所有错误
                error.content.delete(_key);
                error.captchaValue.delete(_key);
                error.comment.delete(_key);

                let formData = new FormData();
                formData.append('topicId', state.topicId);




                if(state.isAddCommentMarkdown){
                    formData.append('isMarkdown', state.isAddCommentMarkdown.toString());
                    formData.append('markdownContent', state.addCommentMarkdownContent);
                }else{
                    let content =  state.addCommentEditor.txt.html()
                    if(content != null && content !=''){
                        formData.append('content', content);
                    }
                }


                if(state.captchaKey.get(_key) != undefined && state.captchaKey.get(_key) != null){
                    //验证码Key
                    formData.append('captchaKey', state.captchaKey.get(_key) as string);
                }

                //验证码值
                if(state.captchaValue[_key] != undefined && state.captchaValue[_key] != null && state.captchaValue[_key] != ''){
                     formData.append('captchaValue', (state.captchaValue[_key] as string).trim());
                }

                proxy?.$axios({
                    url: '/user/control/comment/add',
                    method: 'post',
                    data: formData
                })
                .then((response: AxiosResponse) => {
                    if(response){

                        const result: any = response.data;

                        if(JSON.parse(result.success)){
                            // 成功通知
                            Notify({
                                type: 'success',
                                message: t('thread.680'),//提交成功
                                onClose: ()=>{

                                }
                            });
                            //关闭添加评论页
                            closeAddComment()

                            state.popup_addComment = false;


                            state.addCommentMarkdownContent = "";
                            if (Object.keys(state.addCommentEditor).length != 0) {//不等于空
                               //清空字段
                                state.addCommentEditor.txt.clear();//清空
                                //destroyEditor(state.addCommentEditor);
                                //state.addCommentEditor.remove();
                                //state.addCommentEditorCreateParameObject = {};
                            }




                            if(state.showCaptcha.get(_key) == true){
                                Object.assign(state.captchaValue, {[_key] : ''});
                            }

                            //清除评论列表
                            clearCommentList();

                            state.isLoading = true;//手动触发查询数据需将'加载状态结束'设为true
                            queryCommentList(state.topicId,'','',1);
                            if(state.isReplyTopicVisible){
                                queryTopic(state.topicId,()=>{});
                            }

                        }else{
                            //处理错误信息
                            for (const [key, value] of Object.entries(result.error) as [string, string][]){
                                if(key == 'content'){
                                    error.content.set(_key,value);
                                }else if(key == 'comment'){
                                    error.comment.set(_key,value);
                                }else if(key == 'captchaValue'){
                                    error.captchaValue.set(_key,value);
                                }
                            }

                            if(result.captchaKey != null){
                                state.showCaptcha.set(_key,true);
                                state.captchaKey.set(_key,result.captchaKey);
                                Object.assign(state.captchaValue, {[_key] : ''});
                                replaceCaptcha(_key);
                            }else{
                                state.showCaptcha.set(_key,false);
                            }


                        }
                        state.allowSubmit.set(_key,false);;//提交按钮disabled状态
                    }
                })
                .catch((error: any) =>{
                    console.log(error);
                    state.allowSubmit.set(_key,false);//提交按钮disabled状态
                });
            }).catch(() => {
                console.log("提交数据错误");
            });



    }

    //引用评论表单
    const quoteCommentUI = (comment: Comment) => {
        let _key =  "addQuoteComment-"+comment.id;
        if(state.quoteFormView[comment.id] == true){//如果已打开
            return;
        }

        if(store_systemUser.value == null || Object.keys(store_systemUser.value).length==0){
            return;
        }
        state.allowSubmit.set(_key,true);//提交按钮disabled状态

        proxy?.$axios({
            url: '/user/queryQuoteComment',
            method: 'get',
            params:  {
                commentId: comment.id
            },
            showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
        })
        .then((response: AxiosResponse) => {
            if(response){
                let data =  response.data;

                state.quoteCommentContent = data.quoteContent;


                if(data.allowComment){
                    Object.assign(state.quoteFormView, {[comment.id] : true});

                    nextTick(()=>{
                        //锁定滚动层
                        lock(document.querySelector('.quoteCommentModule_lock_'+comment.id) as any)
                        document.querySelector('body')!.style.setProperty('position', 'sticky')//移除tua-body-scroll-lock锁定层时添加在body上的position: fixed属性,此属性会导致ByteMD编辑器不能选择行



                        //编辑器图标
                        let editorIconList = new Array();
                        if(data.availableTag != null && data.availableTag != ''){
                            let availableTagObject = JSON.parse(data.availableTag);//JSON转为对象
                            if(data.supportEditor == 30 || data.supportEditor == 40){
                                availableTagObject.push("toggleEditor");
                            }
                            if(availableTagObject != null && availableTagObject.length >0){
                                for(let i=0; i<availableTagObject.length; i++){
                                    let _availableTag = availableTagObject[i];

                                    if(_availableTag == "code"){//代码
                                        editorIconList.push("code");
                                    }else if(_availableTag == "forecolor"){//文字颜色
                                    //	editorIconList.push("foreColor");
                                    }else if(_availableTag == "hilitecolor"){//文字背景
                                    //	editorIconList.push("backColor");
                                    }else if(_availableTag == "bold"){//粗体
                                    //    editorIconList.push("bold");
                                    }else if(_availableTag == "italic"){//斜体
                                     //   editorIconList.push("italic");
                                    }else if(_availableTag == "underline"){//下划线
                                     //   editorIconList.push("underline");
                                    }else if(_availableTag == "link"){//插入链接
                                        editorIconList.push("link");
                                    }else if(_availableTag == "emoticons"){//插入表情
                                        editorIconList.push("emoticon");
                                    }else if(_availableTag == "image"){//图片
                                        editorIconList.push("image");
                                    }else if(_availableTag == "insertfile"){//文件
                                        editorIconList.push("file");
                                    }else if(_availableTag == "mention"){//提及
                                        editorIconList.push("mention");
                                    }else if(_availableTag == "ai"){//AI
                                        editorIconList.push("ai");
                                    }else if(_availableTag == "toggleEditor"){//切换编辑器
                                        editorIconList.push("toggleEditor");
                                    }
                                }
                            }

                        }


                        state.fileSystem = data.fileSystem;//文件存储系统
                        state.supportEditor = data.supportEditor;//支持编辑器 10.仅富文本编辑器 20.仅Markdown编辑器  30.富文本编辑器优先 40.Markdown编辑器优先
                        let uploadPath = "user/control/comment/uploadImage?topicId="+state.topicId;

                        if(state.quoteCommentEditorPlugin != null && state.quoteCommentEditorPlugin.length ==0){
                            //添加插件
                            state.quoteCommentEditorPlugin.push(...markdownPlugins());

                            if(state.supportEditor == 30 || state.supportEditor == 40){//10.仅富文本编辑器 20.仅Markdown编辑器  30.富文本编辑器优先 40.Markdown编辑器优先
                                state.quoteCommentEditorPlugin.push(
                                    toggleEditor((editorId: string)=>{handleQuoteCommentToggleRichtextEditor(editorId)})
                                );
                            }

                            if(editorIconList?.indexOf('image') != -1){
                                state.quoteCommentEditorPlugin.push(
                                    imageUpload("user/control/comment/uploadImage?topicId="+state.topicId,'file',state.fileSystem)
                                );
                                state.quoteCommentEditorPlugin.push(
                                    pasteImageUpload("user/control/comment/uploadImage?topicId="+state.topicId,'file',state.fileSystem)
                                );
                            }
                            state.quoteCommentEditorPlugin.push(emoji());
                            if(editorIconList?.indexOf('mention') != -1){
                                state.quoteCommentEditorPlugin.push(
                                    mention((editorId: string,ctx:BytemdEditorContext)=>{mentionPopUp(editorId,ctx)})
                                );
                            }
                            if(editorIconList?.indexOf('ai') != -1){
                                state.quoteCommentEditorPlugin.push(
                                    ai((editorId: string,ctx:BytemdEditorContext)=>{aiPopUp(proxy,appContext,editorId,uploadPath,'file',state.fileSystem ,true,undefined,ctx)})
                                );
                            }
                            state.quoteCommentEditorPlugin.push(
                                help(editorIconList,[])
                            );
                        }



                        if (data.captchaKey != undefined && data.captchaKey != '') {

                            state.showCaptcha.set(_key,true)
                            state.captchaKey.set(_key,data.captchaKey)
                            Object.assign(state.captchaValue, {[_key] : ''});
                            replaceCaptcha(_key);//刷新验证码
                        }

                        if (state.quoteEditorCreateParameMap.get(comment.id) == null || Object.keys(state.quoteEditorCreateParameMap.get(comment.id)).length === 0) {//等于空


                            let quoteCommentContentEditorToolbarRefValue = (proxy?.$refs['quoteCommentContentEditorToolbarRef_'+comment.id] as any)[0];
                            let quoteCommentContentEditorTextRefValue = (proxy?.$refs['quoteCommentContentEditorTextRef_'+comment.id] as any)[0];

                            if(data.supportEditor == 20 || data.supportEditor == 40){
                                state.isQuoteCommentMarkdownMap.set(comment.id,true);
                            }else{
                                state.isQuoteCommentMarkdownMap.set(comment.id,false);
                            }

                            if(!state.isQuoteCommentMarkdownMap.get(comment.id)){
                                 //创建富文本编辑器
                                let editor = createEditor(
                                    quoteCommentContentEditorToolbarRefValue,
                                    quoteCommentContentEditorTextRefValue,
                                    editorIconList,
                                    getPageBasePath()+'common/default/',
                                    uploadPath,
                                    null,
                                    state.fileSystem,
                                    (editorId: string)=>{
                                        handleQuoteCommentToggleMarkdownEditor(editorId);
                                    },
                                    (editorId: string)=>{
                                        mentionPopUp(editorId,undefined)
                                    },
                                    (editorId: string)=>{
                                        //AI弹窗
                                        aiPopUp(proxy,appContext,editorId,uploadPath,'file',state.fileSystem,state.isQuoteCommentMarkdownMap.get(comment.id),editor,undefined)
                                    }
                                );
                                state.quoteEditorMap.set(comment.id,editor);
                            }

                            state.quoteEditorCreateParameMap.set(comment.id, {
                                    toolbarRef:quoteCommentContentEditorToolbarRefValue,
                                    textRef:quoteCommentContentEditorTextRefValue,
                                    editorIconList:editorIconList,
                                    uploadPath:uploadPath,
                                    userGradeList:null
                            })

                        }
                    })

                    state.allowSubmit.set(_key,false);;//提交按钮disabled状态
                }else{
                    Notify({
                        type: 'warning',
                        message: t('thread.690'),//不允许引用评论
                        onClose: ()=>{

                        }
                    });
                }
            }

        })
        .catch((error: any) =>{
            console.log(error);
        });
    }
    //关闭引用评论页
    const closeQuoteComment = () => {
        clearBodyLocks()//关闭锁定的滚动层
    }

    //引用评论 -- 提交数据
    const onQuoteCommentFormSubmit = (commentId:string) => {
        let _key =  "addQuoteComment-"+commentId;
        state.allowSubmit.set(_key,true);//提交按钮disabled状态

        const p1 = new Promise<void>((resolve, reject) => {
            error.captchaValue.set(_key,'');
            if(state.captchaKey.get(_key) != undefined && state.captchaKey.get(_key) != null){

                if(state.captchaValue[_key] != undefined && state.captchaValue[_key] != null && state.captchaValue[_key] != ''){
                    checkCaptchaValue(state.captchaValue[_key].trim(), (err:string)=>{
                        if(err != undefined){
                            error.captchaValue.set(_key,err);
                            state.allowSubmit.set(_key,false);//提交按钮disabled状态
                        }else{
                            resolve();
                        }
                    },_key)
                }else{
                    error.captchaValue.set(_key,t('common.10'));//验证码不能为空
                    state.allowSubmit.set(_key,false);//提交按钮disabled状态
                }
            }else{
                resolve();
            }
        });

        Promise.all([p1])
            .then(() => {
                //清空所有错误
                error.content.delete(_key);
                error.captchaValue.delete(_key);
                error.comment.delete(_key);

                let formData = new FormData();
                formData.append('commentId', commentId);


                if(state.isQuoteCommentMarkdownMap.get(commentId)!= undefined && state.isQuoteCommentMarkdownMap.get(commentId) == true){
                    formData.append('isMarkdown', state.isQuoteCommentMarkdownMap.get(commentId).toString());
                    if(state.quoteCommentMarkdownContent[commentId] != undefined){
                        formData.append('markdownContent', state.quoteCommentMarkdownContent[commentId]);
                    }
                }else{
                    let quoteEditor = state.quoteEditorMap.get(commentId);
                    if(quoteEditor != null){
                        let content =  quoteEditor.txt.html()
                        if(content != null && content !=''){
                            formData.append('content', content);
                        }
                    }
                }



                if(state.captchaKey.get(_key) != undefined && state.captchaKey.get(_key) != null){
                    //验证码Key
                    formData.append('captchaKey', state.captchaKey.get(_key) as string);
                }

                //验证码值
                if(state.captchaValue[_key] != undefined && state.captchaValue[_key] != null && state.captchaValue[_key] != ''){
                     formData.append('captchaValue', (state.captchaValue[_key] as string).trim());
                }

                proxy?.$axios({
                    url: '/user/control/comment/addQuote',
                    method: 'post',
                    data: formData
                })
                .then((response: AxiosResponse) => {
                    if(response){

                        const result: any = response.data;

                        if(JSON.parse(result.success)){
                            // 成功通知
                            Notify({
                                type: 'success',
                                message: t('thread.680'),//提交成功
                                onClose: ()=>{

                                }
                            });
                            closeQuoteComment();//关闭引用评论页


                            let quoteEditor = state.quoteEditorMap.get(commentId);
                            if(quoteEditor != null){
                                destroyEditor(quoteEditor);
                                state.quoteEditorMap.delete(commentId);
                                state.quoteEditorCreateParameMap.delete(commentId);
                            }

                            if(state.quoteCommentMarkdownContent[commentId] != undefined){
                               state.quoteCommentMarkdownContent[commentId] = ""
                            }


                            nextTick(()=>{//需要延迟才能让state.quoteCommentMarkdownContent[commentId]的设置生效
                                Object.assign(state.quoteFormView, {[commentId] : false});
                            })



                            //重置表单
                            //formAddCommentRef.value?.resetFields();
                            if(state.showCaptcha.get(_key) == true){
                                Object.assign(state.captchaValue, {[_key] : ''});
                            }

                            //清除评论列表
                            clearCommentList();

                            state.isLoading = true;//手动触发查询数据需将'加载状态结束'设为true
                            queryCommentList(state.topicId,'','',1);



                        }else{
                            //处理错误信息
                            for (const [key, value] of Object.entries(result.error) as [string, string][]){
                                if(key == 'content'){
                                    error.content.set(_key,value);
                                }else if(key == 'comment'){
                                    error.comment.set(_key,value);
                                }else if(key == 'captchaValue'){
                                    error.captchaValue.set(_key,value);
                                }
                            }

                            if(result.captchaKey != null){
                                state.showCaptcha.set(_key,true);
                                state.captchaKey.set(_key,result.captchaKey);
                                Object.assign(state.captchaValue, {[_key] : ''});
                                replaceCaptcha(_key);
                            }else{
                                state.showCaptcha.set(_key,false);
                            }


                        }
                        state.allowSubmit.set(_key,false);;//提交按钮disabled状态
                    }
                })
                .catch((error: any) =>{
                    console.log(error);
                    state.allowSubmit.set(_key,false);//提交按钮disabled状态
                });
            }).catch(() => {
                console.log("提交数据错误");
            });
    }


    //修改评论表单
    const editCommentUI = (comment: Comment) => {
        let _key =  "editComment-"+comment.id;
        if(state.editCommentFormView[comment.id] == true){//如果已打开
            return;
        }

        if(store_systemUser.value == null || Object.keys(store_systemUser.value).length==0){
            return;
        }

        state.allowSubmit.set(_key,true);//提交按钮disabled状态

        proxy?.$axios({
            url: '/user/queryEditComment',
            method: 'get',
            params:  {
                commentId: comment.id
            },
            showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
        })
        .then((response: AxiosResponse) => {
            let data =  response.data;

            let _comment = data.comment;

            if(data.allowComment && _comment != undefined){
                Object.assign(state.editCommentMarkdownContent, {[_comment.id] : _comment.markdownContent});
                Object.assign(state.editCommentFormView, {[comment.id] : true});

                nextTick(()=>{
                    //锁定滚动层
                    lock(document.querySelector('.editCommentModule_lock_'+comment.id) as any)
                    document.querySelector('body')!.style.setProperty('position', 'sticky')//移除tua-body-scroll-lock锁定层时添加在body上的position: fixed属性,此属性会导致ByteMD编辑器不能选择行



                    //编辑器图标
                    let editorIconList = new Array();
                    if(data.availableTag != null && data.availableTag != ''){
                        let availableTagObject = JSON.parse(data.availableTag);//JSON转为对象

                        if(availableTagObject != null && availableTagObject.length >0){
                            for(let i=0; i<availableTagObject.length; i++){
                                let _availableTag = availableTagObject[i];

                                if(_availableTag == "code"){//代码
                                    editorIconList.push("code");
                                }else if(_availableTag == "forecolor"){//文字颜色
                                //	editorIconList.push("foreColor");
                                }else if(_availableTag == "hilitecolor"){//文字背景
                                //	editorIconList.push("backColor");
                                }else if(_availableTag == "bold"){//粗体
                                //    editorIconList.push("bold");
                                }else if(_availableTag == "italic"){//斜体
                                 //   editorIconList.push("italic");
                                }else if(_availableTag == "underline"){//下划线
                                 //   editorIconList.push("underline");
                                }else if(_availableTag == "link"){//插入链接
                                    editorIconList.push("link");
                                }else if(_availableTag == "emoticons"){//插入表情
                                    editorIconList.push("emoticon");
                                }else if(_availableTag == "image"){//图片
                                    editorIconList.push("image");
                                }else if(_availableTag == "insertfile"){//文件
                                    editorIconList.push("file");
                                }else if(_availableTag == "mention"){//提及
								    editorIconList.push("mention");
                                }else if(_availableTag == "ai"){//AI
                                    editorIconList.push("ai");
                                }else if(_availableTag == "toggleEditor"){//切换编辑器
                                    editorIconList.push("toggleEditor");
                                }
                            }
                        }
                    }

                    state.fileSystem = data.fileSystem;//文件存储系统
                    let uploadPath = "user/control/comment/uploadImage?topicId="+state.topicId;


                    if(state.editCommentEditorPlugin != null && state.editCommentEditorPlugin.length ==0){
                        //添加插件
                        state.editCommentEditorPlugin.push(...markdownPlugins());
                        if(editorIconList?.indexOf('image') != -1){
                            state.editCommentEditorPlugin.push(
                                imageUpload("user/control/comment/uploadImage?topicId="+state.topicId,'file',state.fileSystem)
                            );
                            state.editCommentEditorPlugin.push(
                                pasteImageUpload("user/control/comment/uploadImage?topicId="+state.topicId,'file',state.fileSystem)
                            );
                        }
                        state.editCommentEditorPlugin.push(emoji());
                        if(editorIconList?.indexOf('mention') != -1){
                            state.editCommentEditorPlugin.push(
                                mention((editorId: string,ctx:BytemdEditorContext)=>{mentionPopUp(editorId,ctx)})
                            );
                        }
                        if(editorIconList?.indexOf('ai') != -1){
                            state.editCommentEditorPlugin.push(

                                ai((editorId: string,ctx:BytemdEditorContext)=>{aiPopUp(proxy,appContext,editorId,uploadPath,'file',state.fileSystem ,true,undefined,ctx)})
                            );
                        }
                        state.editCommentEditorPlugin.push(
                            help(editorIconList,[])
                        );

                    }


                    if (data.captchaKey != undefined && data.captchaKey != '') {

                        state.showCaptcha.set(_key,true)
                        state.captchaKey.set(_key,data.captchaKey)
                        Object.assign(state.captchaValue, {[_key] : ''});
                        replaceCaptcha(_key);//刷新验证码
                    }


                    if (state.editCommentEditorCreateParameMap.get(comment.id) == null || Object.keys(state.editCommentEditorCreateParameMap.get(comment.id)).length === 0) {//等于空

                        if(_comment.isMarkdown != null && _comment.isMarkdown == true){
                            state.isEditCommentMarkdownMap.set(comment.id,true);
                        }else{
                            state.isEditCommentMarkdownMap.set(comment.id,false);
                        }

                        let editCommentContentEditorToolbarRefValue = (proxy?.$refs['editCommentContentEditorToolbarRef_'+comment.id] as any)[0];
                        let editCommentContentEditorTextRefValue = (proxy?.$refs['editCommentContentEditorTextRef_'+comment.id] as any)[0];

                        if(!state.isEditCommentMarkdownMap.get(comment.id)){
                            //创建富文本编辑器
                            let editor = createEditor(
                                editCommentContentEditorToolbarRefValue,
                                editCommentContentEditorTextRefValue,
                                editorIconList,
                                getPageBasePath()+'common/default/',
                                uploadPath,
                                null,
                                state.fileSystem,
                                (editorId: string)=>{},
                                (editorId: string)=>{
                                    mentionPopUp(editorId,undefined)
                                },
                                (editorId: string)=>{
                                    //AI弹窗
                                    aiPopUp(proxy,appContext,editorId,uploadPath,'file',state.fileSystem,state.isEditCommentMarkdownMap.get(comment.id),editor,undefined)
                                }
                            );
                            editor.txt.html(_comment.content);//初始化内容
                            state.editCommentEditorMap.set(comment.id,editor);
                        }



                        state.editCommentEditorCreateParameMap.set(comment.id, {
                                toolbarRef:editCommentContentEditorToolbarRefValue,
                                textRef:editCommentContentEditorTextRefValue,
                                editorIconList:editorIconList,
                                uploadPath:uploadPath,
                                userGradeList:null
                        })

                    }

                })

                state.allowSubmit.set(_key,false);;//提交按钮disabled状态
            }else{
                if(!data.allowComment){
                    Notify({
                        type: 'warning',
                        message: t('thread.700'),//不允许修改评论
                        onClose: ()=>{

                        }
                    });
                }
            }
        })
        .catch((error: any) =>{
            console.log(error);
        });
    }
    //关闭修改评论页
    const closeEditComment = () => {
        clearBodyLocks()//关闭锁定的滚动层
    }

    //修改评论 -- 提交数据
    const onEditCommentFormSubmit = (commentId:string) => {
        let _key =  "editComment-"+commentId;
        state.allowSubmit.set(_key,true);//提交按钮disabled状态

        const p1 = new Promise<void>((resolve, reject) => {
            error.captchaValue.set(_key,'');
            if(state.captchaKey.get(_key) != undefined && state.captchaKey.get(_key) != null){

                if(state.captchaValue[_key] != undefined && state.captchaValue[_key] != null && state.captchaValue[_key] != ''){
                    checkCaptchaValue(state.captchaValue[_key].trim(), (err:string)=>{
                        if(err != undefined){
                            error.captchaValue.set(_key,err);
                            state.allowSubmit.set(_key,false);//提交按钮disabled状态
                        }else{
                            resolve();
                        }
                    },_key)
                }else{
                    error.captchaValue.set(_key,t('common.10'));//验证码不能为空
                    state.allowSubmit.set(_key,false);//提交按钮disabled状态
                }
            }else{
                resolve();
            }
        });

        Promise.all([p1])
            .then(() => {
                //清空所有错误
                error.content.delete(_key);
                error.captchaValue.delete(_key);
                error.comment.delete(_key);

                let formData = new FormData();
                formData.append('commentId', commentId);


                if(state.isEditCommentMarkdownMap.get(commentId)!= undefined && state.isEditCommentMarkdownMap.get(commentId) == true){
                    if(state.editCommentMarkdownContent[commentId] != undefined){
                        formData.append('markdownContent', state.editCommentMarkdownContent[commentId]);
                    }
                }else{
                    let editCommentEditor = state.editCommentEditorMap.get(commentId);
                    if(editCommentEditor != null){
                        let content =  editCommentEditor.txt.html()
                        if(content != null && content !=''){
                            formData.append('content', content);
                        }
                    }

                }



                if(state.captchaKey.get(_key) != undefined && state.captchaKey.get(_key) != null){
                    //验证码Key
                    formData.append('captchaKey', state.captchaKey.get(_key) as string);
                }

                //验证码值
                if(state.captchaValue[_key] != undefined && state.captchaValue[_key] != null && state.captchaValue[_key] != ''){
                     formData.append('captchaValue', (state.captchaValue[_key] as string).trim());
                }

                proxy?.$axios({
                    url: '/user/control/comment/edit',
                    method: 'post',
                    data: formData
                })
                .then((response: AxiosResponse) => {
                    if(response){

                        const result: any = response.data;

                        if(JSON.parse(result.success)){
                            // 成功通知
                            Notify({
                                type: 'success',
                                message: t('thread.680'),//提交成功
                                onClose: ()=>{

                                }
                            });
                            //关闭修改评论页
                            closeEditComment();


                            let editCommentEditor = state.editCommentEditorMap.get(commentId);
                            if(editCommentEditor != null){
                                destroyEditor(editCommentEditor);
                                state.editCommentEditorMap.delete(commentId);
                                state.editCommentEditorCreateParameMap.delete(commentId);
                            }

                            if(state.editCommentMarkdownContent[commentId] != undefined){
                               state.editCommentMarkdownContent[commentId] = ""
                            }


                            nextTick(()=>{//需要延迟才能让state.editCommentMarkdownContent[commentId]的设置生效
                                Object.assign(state.editCommentFormView, {[commentId] : false});
                            })






                            //重置表单
                            //formAddCommentRef.value?.resetFields();
                            if(state.showCaptcha.get(_key) == true){
                                Object.assign(state.captchaValue, {[_key] : ''});
                            }

                            //清除评论列表
                            clearCommentList();

                            state.isLoading = true;//手动触发查询数据需将'加载状态结束'设为true
                            queryCommentList(state.topicId,'','',1);
                        }else{
                            //处理错误信息
                            for (const [key, value] of Object.entries(result.error) as [string, string][]){
                                if(key == 'content'){
                                    error.content.set(_key,value);
                                }else if(key == 'comment'){
                                    error.comment.set(_key,value);
                                }else if(key == 'captchaValue'){
                                    error.captchaValue.set(_key,value);
                                }
                            }

                            if(result.captchaKey != null){
                                state.showCaptcha.set(_key,true);
                                state.captchaKey.set(_key,result.captchaKey);
                                Object.assign(state.captchaValue, {[_key] : ''});
                                replaceCaptcha(_key);
                            }else{
                                state.showCaptcha.set(_key,false);
                            }


                        }
                        state.allowSubmit.set(_key,false);//提交按钮disabled状态
                    }
                })
                .catch((error: any) =>{
                    console.log(error);
                    state.allowSubmit.set(_key,false);//提交按钮disabled状态
                });
            }).catch(() => {
                console.log("提交数据错误");
            });
    }

    //删除评论
    const onDeleteComment = (commentId:string) => {
        Dialog.confirm({
            message:t('thread.710'),//确定删除评论?
        })
        .then(() => {
            let formData = new FormData();
            formData.append('commentId', commentId);

            proxy?.$axios({
                url: '/user/control/comment/delete',
                method: 'post',
                data: formData
            })
            .then((response: AxiosResponse) => {
                if(response){

                    const result: any = response.data;

                    if(JSON.parse(result.success)){
                        Notify({
                            type: 'success',
                            message: t('thread.720'),//删除成功
                            onClose: ()=>{

                            }
                        });


                        let editCommentEditor = state.editCommentEditorMap.get(commentId);
                        if(editCommentEditor != null){
                            destroyEditor(editCommentEditor);
                            state.editCommentEditorMap.delete(commentId);
                            state.editCommentEditorCreateParameMap.delete(commentId);
                        }
                        Object.assign(state.editCommentFormView, {[commentId] : false});

                        let quoteEditor = state.quoteEditorMap.get(commentId);
                        if(quoteEditor != null){
                            destroyEditor(quoteEditor);
                            state.quoteEditorMap.delete(commentId);
                            state.quoteEditorCreateParameMap.delete(commentId);
                        }
                        Object.assign(state.quoteFormView, {[commentId] : false});



                        if(state.commentList != null && state.commentList.length > 0){
                            for(let i = state.commentList.length - 1; i >= 0; i--){
                                let comment = state.commentList[i];
                                if(comment.id == commentId){
                                    state.commentList.splice(i, 1);
                                    break;
                                }
                            }
                        }
                    }else{
                        //处理错误信息
                        processErrorInfo(result.error as Map<string,string> , reactive({}),()=>{});



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


    //选择举报分类
    const selectReportType = (reportTypeList: Array<ReportType>) => {
        nextTick(()=>{
            for(let i =0; i<reportTypeList.length; i++){
                let reportType = reportTypeList[i];
                if(reportType.id == state.reportTypeId && reportType.giveReason){
                    state.show_giveReason = true;
                    return;
                }

                for(let j =0; j<reportType.childType.length; j++){
                    let childReportType = reportType.childType[j];
                    if(childReportType.id == state.reportTypeId && childReportType.giveReason){
                        state.show_giveReason = true;
                        return;
                    }
                }
            }

            state.show_giveReason = false;

        })
    }
    //上传图片前处理
    const beforeRead = (file:any):boolean => {

        if(state.reportMaxImageUpload >0  && state.fileList.length < state.reportMaxImageUpload){
            return true;
        }else{
            Notify({
                type: 'warning',
                message: t('thread.730'),//已达到最大图片允许上传数量
                onClose: ()=>{

                }
            });
        }
        return false;
    };
    //举报表单
    const addReportUI = (parameterId: string,module: number) => {

        if(store_systemUser.value == null || Object.keys(store_systemUser.value).length==0){
            return;
        }
        state.allowSubmit.set('report',true);//提交按钮disabled状态


        //清空表单
        state.reportTypeList.length = 0;
        state.reportTypeId = '';//举报分类Id
        state.reason = '';//理由
        state.fileList.length = 0;
        state.reportMaxImageUpload = 0;//图片允许最大上传数量
        state.parameterId = '',//举报参数Id
        state.module = 0,//举报模块
        state.show_giveReason = false,//是否显示说明理由表单


        state.showCaptcha.delete('report');//是否显示验证码
        state.captchaKey.delete('report');//验证码key
        Object.assign(state.captchaValue, {['report'] : ''});//验证码value

        //清空所有错误
        error.reportTypeId= "";//举报分类Id
        error.reason= "";//理由
        error.imageFile = "";
        error.report= "";
        error.captchaValue.delete('report');





        proxy?.$axios({
            url: '/user/queryAddReport',
            method: 'get',
            params:  {
            },
            showLoading: true,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
        })
        .then((response: AxiosResponse) => {
            let data =  response.data;
            if(data.allowReport){


                state.parameterId = parameterId;//举报参数Id
				state.module = module;//举报模块

                state.reportTypeList = data.reportTypeList;
                state.reportMaxImageUpload = data.reportMaxImageUpload;

                if(state.reportTypeList != null && state.reportTypeList.length >0){
                    state.addReportFormView = true;
                }else{
                    Notify({
                        type: 'warning',
                        message: t('thread.740'),//举报分类没开启
                        onClose: ()=>{

                        }
                    });
                }


                if (data.captchaKey != undefined && data.captchaKey != '') {
                    state.showCaptcha.set('report',true)
                    state.captchaKey.set('report',data.captchaKey)
                    Object.assign(state.captchaValue, {['report'] : ''});
                    replaceCaptcha('report');//刷新验证码
                }

                state.allowSubmit.set('report',false);//提交按钮disabled状态
            }else{
                Notify({
                    type: 'warning',
                    message: t('thread.750'),//举报功能已关闭
                    onClose: ()=>{

                    }
                });
            }
        })
        .catch((error: any) =>{
            console.log(error);
        });
    }

    //添加举报 -- 提交数据
    const onAddReportFormSubmit = () => {
        let _key =  "report";
        state.allowSubmit.set(_key,true);//提交按钮disabled状态

        const p1 = new Promise<void>((resolve, reject) => {
            error.captchaValue.set(_key,'');
            if(state.captchaKey.get(_key) != undefined && state.captchaKey.get(_key) != null){

                if(state.captchaValue[_key] != undefined && state.captchaValue[_key] != null && state.captchaValue[_key] != ''){
                    checkCaptchaValue(state.captchaValue[_key].trim(), (err:string)=>{
                        if(err != undefined){
                            error.captchaValue.set(_key,err);
                            state.allowSubmit.set(_key,false);//提交按钮disabled状态
                        }else{
                            resolve();
                        }
                    },_key)
                }else{
                    error.captchaValue.set(_key,t('common.10'));//验证码不能为空
                    state.allowSubmit.set(_key,false);//提交按钮disabled状态
                }
            }else{
                resolve();
            }
        });

        Promise.all([p1])
            .then(() => {
                //清空所有错误
                error.captchaValue.delete(_key);

                error.reportTypeId= "";//举报分类Id
                error.reason= "";//理由
                error.imageFile = "";
                error.report= "";

                let formData = new FormData();


                formData.append("parameterId", state.parameterId);
                formData.append("module", String(state.module));

                if(state.reportTypeId){
                    formData.append("reportTypeId", state.reportTypeId);
                }

                if(state.reason){
                    formData.append("reason", state.reason);
                }

                //图片
                for(var i=0; i<state.fileList.length; i++){
                    var fileData = state.fileList[i];
                    formData.append("imageFile", fileData.file);
                }

                if(state.captchaKey.get(_key) != undefined && state.captchaKey.get(_key) != null){
                    //验证码Key
                    formData.append('captchaKey', state.captchaKey.get(_key) as string);
                }

                //验证码值
                if(state.captchaValue[_key] != undefined && state.captchaValue[_key] != null && state.captchaValue[_key] != ''){
                     formData.append('captchaValue', (state.captchaValue[_key] as string).trim());
                }

                proxy?.$axios({
                    url: '/user/control/report/add',
                    method: 'post',
                    data: formData
                })
                .then((response: AxiosResponse) => {
                    if(response){
                        const result: any = response.data;

                        if(JSON.parse(result.success)){
                            Notify({
                                type: 'success',
                                message: t('thread.680'),//提交成功
                                onClose: ()=>{

                                }
                            });



                            state.addReportFormView = false;


                            //重置表单
                            //formAddCommentRef.value?.resetFields();
                            if(state.showCaptcha.get(_key) == true){
                                Object.assign(state.captchaValue, {[_key] : ''});
                            }

                        }else{
                            //处理错误信息
                            for (const [key, value] of Object.entries(result.error) as [string, string][]){
                                if(key == 'reportTypeId'){
                                    error.reportTypeId = value;
                                }else if(key == 'reason'){
                                    error.reason = value;
                                }else if(key == 'imageFile'){
                                    error.imageFile = value;
                                }else if(key == 'report'){
                                    error.report = value;
                                }else if(key == 'captchaValue'){
                                    error.captchaValue.set(_key,value);
                                }

                            }

                            if(result.captchaKey != null){
                                state.showCaptcha.set(_key,true);
                                state.captchaKey.set(_key,result.captchaKey);
                                Object.assign(state.captchaValue, {[_key] : ''});
                                replaceCaptcha(_key);
                            }else{
                                state.showCaptcha.set(_key,false);
                            }


                        }
                        state.allowSubmit.set(_key,false);;//提交按钮disabled状态
                    }
                })
                .catch((error: any) =>{
                    console.log(error);
                    state.allowSubmit.set(_key,false);//提交按钮disabled状态
                });
            }).catch(() => {
                console.log("提交数据错误");
            });

    }

    //回复气泡弹出框菜单选项
    const onReplyPopoverActions = (reply:Reply) => {
        let actions = new Array()
        if(store_systemUser.value != null && Object.keys(store_systemUser.value).length >0){
            if(state.alreadyLikedCommentReply.get(reply.id) != undefined && state.alreadyLikedCommentReply.get(reply.id) == true){
                actions.push({ text: t('thread.170'), reply:reply});//已赞
            }else{
                actions.push({ text: t('thread.640'), reply:reply});//点赞
            }
            actions.push({ text: t('thread.650'), reply:reply});//回复

            if(reply.userName ==  store_systemUser.value.userName){
                actions.push({ text: t('thread.390'), reply:reply});//编辑
            }
            actions.push({ text: t('thread.400'), replyId:reply.id});//举报
            if(reply.userName ==  store_systemUser.value.userName){
                actions.push({ text: t('thread.670'), commentId :reply.commentId,replyId:reply.id});//删除
            }
        }

        return actions;
    }



    //回复气泡弹出框选择
    const onReplyPopoverSelect = (action:any) => {
        if(action.text == t('thread.640')){//点赞
            addLike(action.reply.id,30)
            queryAlreadyLiked(action.reply.id,30);
            queryLikeCount(action.reply.id,30);
        }else if(action.text == t('thread.170')){//已赞
            deleteLike(action.reply.id,30)
            queryAlreadyLiked(action.reply.id,30);
            queryLikeCount(action.reply.id,30);
        }else if(action.text == t('thread.650')){//回复
            addReplyFriendUI(action.reply);
        }else if(action.text == t('thread.390')){//编辑
            editReplyUI(action.reply)
        }else if(action.text == t('thread.400')){//举报
            addReportUI(action.replyId,30);
        }else if(action.text == t('thread.670')){//删除
            onDeleteReply(action.commentId,action.replyId);
        }
    }


    //添加回复对方表单
    const addReplyFriendUI = (reply:Reply) => {
        let _key =  "addReplyFriend-"+reply.id;
        if(state.addReplyFriendFormView[reply.id] == true){//如果已打开
			return;
		}
        if(store_systemUser.value == null || Object.keys(store_systemUser.value).length==0){
            return;
        }
        state.allowSubmit.set(_key,true);//提交按钮disabled状态


        proxy?.$axios({
            url: '/user/queryAddReply',
            method: 'get',
            params:  {
                commentId: reply.commentId
            },
            showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
        })
        .then((response: AxiosResponse) => {
            if(response){
                let data =  response.data;
                if(data.allowReply){
                    Object.assign(state.addReplyFriendFormView, {[reply.id] : true});

                    //对方用户
                    let friendUser = '';
                    if(reply.nickname != null && reply.nickname != ''){
                        friendUser = reply.nickname;
                    }
                    if(reply.nickname == null || reply.nickname == ''){
                        friendUser = reply.account;
                    }
                    state.friendUser = friendUser;

                    nextTick(()=>{
                        //锁定滚动层
                        lock(document.querySelector('.addReplyFriendModule_lock_'+reply.id) as any)
                        document.querySelector('body')!.style.setProperty('position', 'sticky')//移除tua-body-scroll-lock锁定层时添加在body上的position: fixed属性,此属性会导致ByteMD编辑器不能选择行



                        //编辑器图标
                        let editorIconList = new Array();
                        if(data.availableTag != null && data.availableTag != ''){
                            let availableTagObject = JSON.parse(data.availableTag);//JSON转为对象

                            if(availableTagObject != null && availableTagObject.length >0){
                                for(let i=0; i<availableTagObject.length; i++){
                                    let _availableTag = availableTagObject[i];

                                    if(_availableTag == "code"){//代码
                                        editorIconList.push("code");
                                    }else if(_availableTag == "forecolor"){//文字颜色
                                    //	editorIconList.push("foreColor");
                                    }else if(_availableTag == "hilitecolor"){//文字背景
                                    //	editorIconList.push("backColor");
                                    }else if(_availableTag == "bold"){//粗体
                                    //    editorIconList.push("bold");
                                    }else if(_availableTag == "italic"){//斜体
                                    //   editorIconList.push("italic");
                                    }else if(_availableTag == "underline"){//下划线
                                    //    editorIconList.push("underline");
                                    }else if(_availableTag == "link"){//插入链接
                                        editorIconList.push("link");
                                    }else if(_availableTag == "emoticons"){//插入表情
                                        editorIconList.push("emoticon");
                                    }else if(_availableTag == "image"){//图片
                                        editorIconList.push("image");
                                    }else if(_availableTag == "insertfile"){//文件
                                        editorIconList.push("file");
                                    }else if(_availableTag == "mention"){//提及
                                        editorIconList.push("mention");
                                    }else if(_availableTag == "ai"){//AI
                                    //    editorIconList.push("ai");
                                    }else if(_availableTag == "toggleEditor"){//切换编辑器
                                        editorIconList.push("toggleEditor");
                                    }
                                }
                            }
                        }

                        state.fileSystem = data.fileSystem;//文件存储系统

                        if (data.captchaKey != undefined && data.captchaKey != '') {

                            state.showCaptcha.set(_key,true)
                            state.captchaKey.set(_key,data.captchaKey)
                            Object.assign(state.captchaValue, {[_key] : ''});
                            replaceCaptcha(_key);//刷新验证码
                        }

                        if (state.addReplyFriendEditorCreateParameMap.get(reply.id) == null || Object.keys(state.addReplyFriendEditorCreateParameMap.get(reply.id)).length === 0) {//等于空
                            let uploadPath = "user/control/comment/uploadImage?topicId="+state.topicId;

                            let addReplyFriendContentEditorToolbarRefValue = (proxy?.$refs['addReplyFriendContentEditorToolbarRef_'+reply.id] as any)[0];
                            let addReplyFriendContentEditorTextRefValue = (proxy?.$refs['addReplyFriendContentEditorTextRef_'+reply.id] as any)[0];


                            //创建富文本编辑器
                            let editor = createEditor(
                                addReplyFriendContentEditorToolbarRefValue,
                                addReplyFriendContentEditorTextRefValue,
                                editorIconList,
                                getPageBasePath()+'common/default/',
                                uploadPath,
                                null,
                                state.fileSystem,
                                (editorId: string)=>{},
                                (editorId: string)=>{
                                    mentionPopUp(editorId,undefined)
                                },
                                (editorId: string)=>{
                                    //AI弹窗
                                    aiPopUp(proxy,appContext,editorId,uploadPath,'file',state.fileSystem,false,editor,undefined)
                                }
                            );
                            state.addReplyFriendEditorMap.set(reply.id,editor);



                            state.addReplyFriendEditorCreateParameMap.set(reply.id, {
                                    toolbarRef:addReplyFriendContentEditorToolbarRefValue,
                                    textRef:addReplyFriendContentEditorTextRefValue,
                                    editorIconList:editorIconList,
                                    uploadPath:uploadPath,
                                    userGradeList:null
                            })

                        }
                    })
                    state.allowSubmit.set(_key,false);;//提交按钮disabled状态
                }else{
                    Notify({
                        type: 'warning',
                        message: t('thread.760'),//不允许添加回复
                        onClose: ()=>{

                        }
                    });
                }
            }

        })
        .catch((error: any) =>{
            console.log(error);
        });
    }

    //添加回复对方 -- 提交数据
    const onAddReplyFriend = (commentId:string,replyId:string) => {
        let _key =  "addReplyFriend-"+replyId;
        state.allowSubmit.set(_key,true);//提交按钮disabled状态

        const p1 = new Promise<void>((resolve, reject) => {
            error.captchaValue.set(_key,'');
            if(state.captchaKey.get(_key) != undefined && state.captchaKey.get(_key) != null){

                if(state.captchaValue[_key] != undefined && state.captchaValue[_key] != null && state.captchaValue[_key] != ''){
                    checkCaptchaValue(state.captchaValue[_key].trim(), (err:string)=>{
                        if(err != undefined){
                            error.captchaValue.set(_key,err);
                            state.allowSubmit.set(_key,false);//提交按钮disabled状态
                        }else{
                            resolve();
                        }
                    },_key)
                }else{
                    error.captchaValue.set(_key,t('common.10'));//验证码不能为空
                    state.allowSubmit.set(_key,false);//提交按钮disabled状态
                }
            }else{
                resolve();
            }
        });

        Promise.all([p1])
            .then(() => {
                //清空所有错误
                error.replyContent.delete(_key);
                error.captchaValue.delete(_key);
                error.reply.delete(_key);

                let formData = new FormData();
                formData.append('commentId',  commentId);
                formData.append('friendReplyId',  replyId);

                let addReplyFriendEditor = state.addReplyFriendEditorMap.get(replyId);
                if(addReplyFriendEditor != null){
                    let content =  addReplyFriendEditor.txt.html()
                    if(content != null && content !=''){
                        formData.append('content', content);
                    }
                }

                if(state.captchaKey.get(_key) != undefined && state.captchaKey.get(_key) != null){
                    //验证码Key
                    formData.append('captchaKey', state.captchaKey.get(_key) as string);
                }

                //验证码值
                if(state.captchaValue[_key] != undefined && state.captchaValue[_key] != null && state.captchaValue[_key] != ''){
                     formData.append('captchaValue', (state.captchaValue[_key] as string).trim());
                }

                proxy?.$axios({
                    url: '/user/control/comment/addReply',
                    method: 'post',
                    data: formData
                })
                .then((response: AxiosResponse) => {
                    if(response){

                        const result: any = response.data;

                        if(JSON.parse(result.success)){
                            Notify({
                                type: 'success',
                                message: t('thread.680'),//提交成功
                                onClose: ()=>{

                                }
                            });

                            //关闭添加回复对方页
                            closeAddReplyFriend();

                            let addReplyFriendEditor = state.addReplyFriendEditorMap.get(replyId);
                            if(addReplyFriendEditor != null){
                                destroyEditor(addReplyFriendEditor);
                                state.addReplyFriendEditorMap.delete(replyId);
                                state.addReplyFriendEditorCreateParameMap.delete(replyId);
                            }


                            nextTick(()=>{
                                Object.assign(state.addReplyFriendFormView, {[replyId] : false});
                            })

                            //重置表单
                            //formAddCommentRef.value?.resetFields();
                            if(state.showCaptcha.get(_key) == true){
                                Object.assign(state.captchaValue, {[_key] : ''});
                            }

                            //清除评论列表
                            clearCommentList();

                            state.isLoading = true;//手动触发查询数据需将'加载状态结束'设为true
                            queryCommentList(state.topicId,'','',1);

                        }else{
                            //处理错误信息
                            for (const [key, value] of Object.entries(result.error) as [string, string][]){
                                if(key == 'content'){
                                    error.replyContent.set(_key,value);
                                }else if(key == 'reply'){
                                    error.reply.set(_key,value);
                                }else if(key == 'friendReplyId'){
                                    error.reply.set(_key,value);
                                }else if(key == 'captchaValue'){
                                    error.captchaValue.set(_key,value);
                                }
                            }

                            if(result.captchaKey != null){
                                state.showCaptcha.set(_key,true);
                                state.captchaKey.set(_key,result.captchaKey);
                                Object.assign(state.captchaValue, {[_key] : ''});
                                replaceCaptcha(_key);
                            }else{
                                state.showCaptcha.set(_key,false);
                            }


                        }
                        state.allowSubmit.set(_key,false);;//提交按钮disabled状态
                    }
                })
                .catch((error: any) =>{
                    console.log(error);
                    state.allowSubmit.set(_key,false);//提交按钮disabled状态
                });
            }).catch(() => {
                console.log("提交数据错误");
            });
    }

    //关闭添加回复对方页
    const closeAddReplyFriend = () => {
        clearBodyLocks()//关闭锁定的滚动层
    }



    //添加回复表单
    const addReplyUI = (commentId:string) => {
        let _key =  "addReply-"+commentId;
        if(state.addReplyFormView[commentId] == true){//如果已打开
			return;
		}
        if(store_systemUser.value == null || Object.keys(store_systemUser.value).length==0){
            return;
        }
        state.allowSubmit.set(_key,true);//提交按钮disabled状态


        proxy?.$axios({
            url: '/user/queryAddReply',
            method: 'get',
            params:  {
                commentId: commentId
            },
            showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
        })
        .then((response: AxiosResponse) => {
            if(response){
                let data =  response.data;
                if(data.allowReply){
                    Object.assign(state.addReplyFormView, {[commentId] : true});

                    nextTick(()=>{
                        //锁定滚动层
                        lock(document.querySelector('.addReplyModule_lock_'+commentId) as any)
                        document.querySelector('body')!.style.setProperty('position', 'sticky')//移除tua-body-scroll-lock锁定层时添加在body上的position: fixed属性,此属性会导致ByteMD编辑器不能选择行


                        //编辑器图标
                        let editorIconList = new Array();
                        if(data.availableTag != null && data.availableTag != ''){
                            let availableTagObject = JSON.parse(data.availableTag);//JSON转为对象

                            if(availableTagObject != null && availableTagObject.length >0){
                                for(let i=0; i<availableTagObject.length; i++){
                                    let _availableTag = availableTagObject[i];

                                    if(_availableTag == "code"){//代码
                                        editorIconList.push("code");
                                    }else if(_availableTag == "forecolor"){//文字颜色
                                    //	editorIconList.push("foreColor");
                                    }else if(_availableTag == "hilitecolor"){//文字背景
                                    //	editorIconList.push("backColor");
                                    }else if(_availableTag == "bold"){//粗体
                                    //    editorIconList.push("bold");
                                    }else if(_availableTag == "italic"){//斜体
                                    //   editorIconList.push("italic");
                                    }else if(_availableTag == "underline"){//下划线
                                    //    editorIconList.push("underline");
                                    }else if(_availableTag == "link"){//插入链接
                                        editorIconList.push("link");
                                    }else if(_availableTag == "emoticons"){//插入表情
                                        editorIconList.push("emoticon");
                                    }else if(_availableTag == "image"){//图片
                                        editorIconList.push("image");
                                    }else if(_availableTag == "insertfile"){//文件
                                        editorIconList.push("file");
                                    }else if(_availableTag == "mention"){//提及
                                        editorIconList.push("mention");
                                    }else if(_availableTag == "ai"){//AI
                                    //    editorIconList.push("ai");
                                    }else if(_availableTag == "toggleEditor"){//切换编辑器
                                        editorIconList.push("toggleEditor");
                                    }
                                }
                            }
                        }

                        state.fileSystem = data.fileSystem;//文件存储系统

                        if (data.captchaKey != undefined && data.captchaKey != '') {

                            state.showCaptcha.set(_key,true)
                            state.captchaKey.set(_key,data.captchaKey)
                            Object.assign(state.captchaValue, {[_key] : ''});
                            replaceCaptcha(_key);//刷新验证码
                        }

                        if (state.addReplyEditorCreateParameMap.get(commentId) == null || Object.keys(state.addReplyEditorCreateParameMap.get(commentId)).length === 0) {//等于空
                            let uploadPath = "user/control/comment/uploadImage?topicId="+state.topicId;

                            let addReplyContentEditorToolbarRefValue = (proxy?.$refs['addReplyContentEditorToolbarRef_'+commentId] as any)[0];

                            let addReplyContentEditorTextRefValue = (proxy?.$refs['addReplyContentEditorTextRef_'+commentId] as any)[0];

                            //创建富文本编辑器
                            let editor = createEditor(
                                addReplyContentEditorToolbarRefValue,
                                addReplyContentEditorTextRefValue,
                                editorIconList,
                                getPageBasePath()+'common/default/',
                                uploadPath,
                                null,
                                state.fileSystem,
                                (editorId: string)=>{},
                                (editorId: string)=>{
                                    mentionPopUp(editorId,undefined)
                                },
                                (editorId: string)=>{
                                    //AI弹窗
                                    aiPopUp(proxy,appContext,editorId,uploadPath,'file',state.fileSystem,false,editor,undefined)
                                }
                            );
                            state.addReplyEditorMap.set(commentId,editor);



                            state.addReplyEditorCreateParameMap.set(commentId, {
                                    toolbarRef:addReplyContentEditorToolbarRefValue,
                                    textRef:addReplyContentEditorTextRefValue,
                                    editorIconList:editorIconList,
                                    uploadPath:uploadPath,
                                    userGradeList:null
                            })

                        }
                    })
                    state.allowSubmit.set(_key,false);;//提交按钮disabled状态
                }else{
                    Notify({
                        type: 'warning',
                        message: t('thread.760'),//不允许添加回复
                        onClose: ()=>{

                        }
                    });
                }
            }

        })
        .catch((error: any) =>{
            console.log(error);
        });
    }

    //添加回复 -- 提交数据
    const onAddReply = (commentId:string) => {
        let _key =  "addReply-"+commentId;
        state.allowSubmit.set(_key,true);//提交按钮disabled状态

        const p1 = new Promise<void>((resolve, reject) => {
            error.captchaValue.set(_key,'');
            if(state.captchaKey.get(_key) != undefined && state.captchaKey.get(_key) != null){

                if(state.captchaValue[_key] != undefined && state.captchaValue[_key] != null && state.captchaValue[_key] != ''){
                    checkCaptchaValue(state.captchaValue[_key].trim(), (err:string)=>{
                        if(err != undefined){
                            error.captchaValue.set(_key,err);
                            state.allowSubmit.set(_key,false);//提交按钮disabled状态
                        }else{
                            resolve();
                        }
                    },_key)
                }else{
                    error.captchaValue.set(_key,t('common.10'));//验证码不能为空
                    state.allowSubmit.set(_key,false);//提交按钮disabled状态
                }
            }else{
                resolve();
            }
        });

        Promise.all([p1])
            .then(() => {
                //清空所有错误
                error.replyContent.delete(_key);
                error.captchaValue.delete(_key);
                error.reply.delete(_key);

                let formData = new FormData();
                formData.append('commentId', commentId);

                let addReplyEditor = state.addReplyEditorMap.get(commentId);
                if(addReplyEditor != null){
                    let content =  addReplyEditor.txt.html()
                    if(content != null && content !=''){
                        formData.append('content', content);
                    }
                }

                if(state.captchaKey.get(_key) != undefined && state.captchaKey.get(_key) != null){
                    //验证码Key
                    formData.append('captchaKey', state.captchaKey.get(_key) as string);
                }

                //验证码值
                if(state.captchaValue[_key] != undefined && state.captchaValue[_key] != null && state.captchaValue[_key] != ''){
                     formData.append('captchaValue', (state.captchaValue[_key] as string).trim());
                }

                proxy?.$axios({
                    url: '/user/control/comment/addReply',
                    method: 'post',
                    data: formData
                })
                .then((response: AxiosResponse) => {
                    if(response){

                        const result: any = response.data;

                        if(JSON.parse(result.success)){
                            Notify({
                                type: 'success',
                                message: t('thread.680'),//提交成功
                                onClose: ()=>{

                                }
                            });
                            //关闭添加回复页
                            closeAddReply();

                            let addReplyEditor = state.addReplyEditorMap.get(commentId);
                            if(addReplyEditor != null){
                                destroyEditor(addReplyEditor);
                                state.addReplyEditorMap.delete(commentId);
                                state.addReplyEditorCreateParameMap.delete(commentId);
                            }


                            nextTick(()=>{
                                Object.assign(state.addReplyFormView, {[commentId] : false});
                            })

                            //重置表单
                            //formAddCommentRef.value?.resetFields();
                            if(state.showCaptcha.get(_key) == true){
                                Object.assign(state.captchaValue, {[_key] : ''});
                            }

                            //清除评论列表
                            clearCommentList();

                            state.isLoading = true;//手动触发查询数据需将'加载状态结束'设为true
                            queryCommentList(state.topicId,'','',1);

                        }else{
                            //处理错误信息
                            for (const [key, value] of Object.entries(result.error) as [string, string][]){
                                if(key == 'content'){
                                    error.replyContent.set(_key,value);
                                }else if(key == 'reply'){
                                    error.reply.set(_key,value);
                                }else if(key == 'captchaValue'){
                                    error.captchaValue.set(_key,value);
                                }
                            }

                            if(result.captchaKey != null){
                                state.showCaptcha.set(_key,true);
                                state.captchaKey.set(_key,result.captchaKey);
                                Object.assign(state.captchaValue, {[_key] : ''});
                                replaceCaptcha(_key);
                            }else{
                                state.showCaptcha.set(_key,false);
                            }


                        }
                        state.allowSubmit.set(_key,false);;//提交按钮disabled状态
                    }
                })
                .catch((error: any) =>{
                    console.log(error);
                    state.allowSubmit.set(_key,false);//提交按钮disabled状态
                });
            }).catch(() => {
                console.log("提交数据错误");
            });
    }

    //关闭添加回复页
    const closeAddReply = () => {
        clearBodyLocks()//关闭锁定的滚动层
    }

    //修改回复表单
    const editReplyUI = (reply:Reply) => {
        let _key =  "editReply-"+reply.id;
        if(state.editReplyFormView[reply.id] == true){//如果已打开
			return;
		}
        if(store_systemUser.value == null || Object.keys(store_systemUser.value).length==0){
            return;
        }
        state.allowSubmit.set(_key,true);//提交按钮disabled状态


        proxy?.$axios({
            url: '/user/queryEditReply',
            method: 'get',
            params:  {
                replyId: reply.id
            },
            showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
        })
        .then((response: AxiosResponse) => {
            if(response){
                let data =  response.data;
                let _reply = data.reply;
                if(data.allowReply && _reply != undefined){
                    Object.assign(state.editReplyFormView, {[reply.id] : true});
                    nextTick(()=>{
                        //锁定滚动层
                        lock(document.querySelector('.editReplyModule_lock_'+reply.id) as any)
                        document.querySelector('body')!.style.setProperty('position', 'sticky')//移除tua-body-scroll-lock锁定层时添加在body上的position: fixed属性,此属性会导致ByteMD编辑器不能选择行


                        //编辑器图标
                        let editorIconList = new Array();
                        if(data.availableTag != null && data.availableTag != ''){
                            let availableTagObject = JSON.parse(data.availableTag);//JSON转为对象

                            if(availableTagObject != null && availableTagObject.length >0){
                                for(let i=0; i<availableTagObject.length; i++){
                                    let _availableTag = availableTagObject[i];

                                    if(_availableTag == "code"){//代码
                                        editorIconList.push("code");
                                    }else if(_availableTag == "forecolor"){//文字颜色
                                    //	editorIconList.push("foreColor");
                                    }else if(_availableTag == "hilitecolor"){//文字背景
                                    //	editorIconList.push("backColor");
                                    }else if(_availableTag == "bold"){//粗体
                                    //    editorIconList.push("bold");
                                    }else if(_availableTag == "italic"){//斜体
                                    //   editorIconList.push("italic");
                                    }else if(_availableTag == "underline"){//下划线
                                    //    editorIconList.push("underline");
                                    }else if(_availableTag == "link"){//插入链接
                                        editorIconList.push("link");
                                    }else if(_availableTag == "emoticons"){//插入表情
                                        editorIconList.push("emoticon");
                                    }else if(_availableTag == "image"){//图片
                                        editorIconList.push("image");
                                    }else if(_availableTag == "insertfile"){//文件
                                        editorIconList.push("file");
                                    }else if(_availableTag == "mention"){//提及
                                        editorIconList.push("mention");
                                    }else if(_availableTag == "ai"){//AI
                                     //   editorIconList.push("ai");
                                    }else if(_availableTag == "toggleEditor"){//切换编辑器
                                        editorIconList.push("toggleEditor");
                                    }
                                }
                            }
                        }

                        state.fileSystem = data.fileSystem;//文件存储系统

                        if (data.captchaKey != undefined && data.captchaKey != '') {

                            state.showCaptcha.set(_key,true)
                            state.captchaKey.set(_key,data.captchaKey)
                            Object.assign(state.captchaValue, {[_key] : ''});
                            replaceCaptcha(_key);//刷新验证码
                        }

                        if (state.editReplyEditorCreateParameMap.get(reply.id) == null || Object.keys(state.editReplyEditorCreateParameMap.get(reply.id)).length === 0) {//等于空
                            let uploadPath = "user/control/comment/uploadImage?topicId="+state.topicId;

                            let editReplyContentEditorToolbarRefValue = (proxy?.$refs['editReplyContentEditorToolbarRef_'+reply.id] as any)[0];
                            let editReplyContentEditorTextRefValue = (proxy?.$refs['editReplyContentEditorTextRef_'+reply.id] as any)[0];


                            //创建富文本编辑器
                            let editor = createEditor(
                                editReplyContentEditorToolbarRefValue,
                                editReplyContentEditorTextRefValue,
                                editorIconList,
                                getPageBasePath()+'common/default/',
                                uploadPath,
                                null,
                                state.fileSystem,
                                (editorId: string)=>{},
                                (editorId: string)=>{
                                    mentionPopUp(editorId,undefined)
                                },
                                (editorId: string)=>{
                                    //AI弹窗
                                    aiPopUp(proxy,appContext,editorId,uploadPath,'file',state.fileSystem,false,editor,undefined)
                                }
                            );
                            editor.txt.html(_reply.content);//初始化内容
                            state.editReplyEditorMap.set(reply.id,editor);



                            state.editReplyEditorCreateParameMap.set(reply.id, {
                                    toolbarRef:editReplyContentEditorToolbarRefValue,
                                    textRef:editReplyContentEditorTextRefValue,
                                    editorIconList:editorIconList,
                                    uploadPath:uploadPath,
                                    userGradeList:null
                            })

                        }
                    })
                    state.allowSubmit.set(_key,false);;//提交按钮disabled状态
                }else{
                    if(!data.allowReply){
                        Notify({
                            type: 'warning',
                            message: t('thread.770'),//不允许修改回复
                            onClose: ()=>{

                            }
                        });
                    }
                }
            }

        })
        .catch((error: any) =>{
            console.log(error);
        });

    }

    //修改回复 -- 提交数据
    const onEditReply = (replyId:string) => {
        let _key =  "editReply-"+replyId;
        state.allowSubmit.set(_key,true);//提交按钮disabled状态

        const p1 = new Promise<void>((resolve, reject) => {
            error.captchaValue.set(_key,'');
            if(state.captchaKey.get(_key) != undefined && state.captchaKey.get(_key) != null){

                if(state.captchaValue[_key] != undefined && state.captchaValue[_key] != null && state.captchaValue[_key] != ''){
                    checkCaptchaValue(state.captchaValue[_key].trim(), (err:string)=>{
                        if(err != undefined){
                            error.captchaValue.set(_key,err);
                            state.allowSubmit.set(_key,false);//提交按钮disabled状态
                        }else{
                            resolve();
                        }
                    },_key)
                }else{
                    error.captchaValue.set(_key,t('common.10'));//验证码不能为空
                    state.allowSubmit.set(_key,false);//提交按钮disabled状态
                }
            }else{
                resolve();
            }
        });

        Promise.all([p1])
            .then(() => {
                //清空所有错误
                error.replyContent.delete(_key);
                error.captchaValue.delete(_key);
                error.reply.delete(_key);

                let formData = new FormData();
                formData.append('replyId', replyId);

                let editReplyEditor = state.editReplyEditorMap.get(replyId);
                if(editReplyEditor != null){
                    let content =  editReplyEditor.txt.html()
                    if(content != null && content !=''){
                        formData.append('content', content);
                    }
                }



                if(state.captchaKey.get(_key) != undefined && state.captchaKey.get(_key) != null){
                    //验证码Key
                    formData.append('captchaKey', state.captchaKey.get(_key) as string);
                }

                //验证码值
                if(state.captchaValue[_key] != undefined && state.captchaValue[_key] != null && state.captchaValue[_key] != ''){
                     formData.append('captchaValue', (state.captchaValue[_key] as string).trim());
                }

                proxy?.$axios({
                    url: '/user/control/comment/editReply',
                    method: 'post',
                    data: formData
                })
                .then((response: AxiosResponse) => {
                    if(response){

                        const result: any = response.data;

                        if(JSON.parse(result.success)){
                            Notify({
                                type: 'success',
                                message: t('thread.680'),//提交成功
                                onClose: ()=>{

                                }
                            });
                            //关闭修改回复页
                            closeEditReply();

                            let editReplyEditor = state.editReplyEditorMap.get(replyId);
                            if(editReplyEditor != null){
                                destroyEditor(editReplyEditor);
                                state.editReplyEditorMap.delete(replyId);
                                state.editReplyEditorCreateParameMap.delete(replyId);
                            }


                            nextTick(()=>{
                                Object.assign(state.editReplyFormView, {[replyId] : false});
                            })


                            //重置表单
                            //formAddCommentRef.value?.resetFields();
                            if(state.showCaptcha.get(_key) == true){
                                Object.assign(state.captchaValue, {[_key] : ''});
                            }

                            //清除评论列表
                            clearCommentList();

                            state.isLoading = true;//手动触发查询数据需将'加载状态结束'设为true
                            queryCommentList(state.topicId,'','',1);

                        }else{
                            //处理错误信息
                            for (const [key, value] of Object.entries(result.error) as [string, string][]){
                                if(key == 'content'){
                                    error.replyContent.set(_key,value);
                                }else if(key == 'reply'){
                                    error.reply.set(_key,value);
                                }else if(key == 'captchaValue'){
                                    error.captchaValue.set(_key,value);
                                }
                            }

                            if(result.captchaKey != null){
                                state.showCaptcha.set(_key,true);
                                state.captchaKey.set(_key,result.captchaKey);
                                Object.assign(state.captchaValue, {[_key] : ''});
                                replaceCaptcha(_key);
                            }else{
                                state.showCaptcha.set(_key,false);
                            }


                        }
                        state.allowSubmit.set(_key,false);;//提交按钮disabled状态
                    }
                })
                .catch((error: any) =>{
                    console.log(error);
                    state.allowSubmit.set(_key,false);//提交按钮disabled状态
                });
            }).catch(() => {
                console.log("提交数据错误");
            });
    }

    //关闭修改回复页
    const closeEditReply = () => {
        clearBodyLocks()//关闭锁定的滚动层
    }

    //删除回复
    const onDeleteReply = (commentId:string, replyId:string) => {
        Dialog.confirm({
            message:t('thread.780'),//确定删除回复?
        })
        .then(() => {
            let _key =  "addReply-"+commentId;
            let _key2 =  "editReply-"+replyId;
            let _key3 =  "addReplyFriend-"+replyId;

            //清空所有错误
            error.replyContent.delete(_key);
            error.captchaValue.delete(_key);
            error.reply.delete(_key);

            error.replyContent.delete(_key2);
            error.captchaValue.delete(_key2);
            error.reply.delete(_key2);

            error.replyContent.delete(_key3);
            error.captchaValue.delete(_key3);
            error.reply.delete(_key3);

            let formData = new FormData();
            formData.append('replyId', replyId);

            proxy?.$axios({
                url: '/user/control/comment/deleteReply',
                method: 'post',
                data: formData
            })
            .then((response: AxiosResponse) => {
                if(response){

                    const result: any = response.data;

                    if(JSON.parse(result.success)){
                        Notify({
                            type: 'success',
                            message: t('thread.720'),//删除成功
                            onClose: ()=>{

                            }
                        });

                        let addReplyEditor = state.addReplyEditorMap.get(commentId);
                        if(addReplyEditor != null){
                            destroyEditor(addReplyEditor);
                            state.addReplyEditorMap.delete(commentId);
                            state.addReplyEditorCreateParameMap.delete(commentId);
                        }
                        delete state.addReplyFormView[commentId];

                        let addReplyFriendEditor = state.addReplyFriendEditorMap.get(replyId);
                        if(addReplyFriendEditor != null){
                            destroyEditor(addReplyFriendEditor);
                            state.addReplyFriendEditorMap.delete(replyId);
                            state.addReplyFriendEditorCreateParameMap.delete(replyId);
                        }
                        delete state.addReplyFriendFormView[replyId];

                        let editReplyEditor = state.editReplyEditorMap.get(replyId);
                        if(editReplyEditor != null){
                            destroyEditor(editReplyEditor);
                            state.editReplyEditorMap.delete(replyId);
                            state.editReplyEditorCreateParameMap.delete(replyId);
                        }
                        delete state.editReplyFormView[replyId];



                        state.friendUser = '';
                        //重置表单
                        //formAddCommentRef.value?.resetFields();
                        if(state.showCaptcha.get(_key) == true){
                            Object.assign(state.captchaValue, {[_key] : ''});
                        }


                        if(state.commentList != null && state.commentList.length > 0){
                            for(let i = state.commentList.length - 1; i >= 0; i--){
                                let comment = state.commentList[i];
                                if(comment.replyList != null && comment.replyList.length >0){
                                    for(let j = comment.replyList.length - 1; j >= 0; j--){
                                        let reply = comment.replyList[j];
                                        if(reply.id == replyId){
                                            comment.replyList.splice(j, 1);
                                        }
                                    }
                                }
                            }
                        }
                    }else{
                        //处理错误信息
                        processErrorInfo(result.error as Map<string,string> , reactive({}),()=>{});
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

     //查询发红包内容
     const queryGiveRedEnvelopeContent = (giveRedEnvelopeId:string) => {
        proxy?.$axios({
            url: '/queryGiveRedEnvelopeContent',
            method: 'get',
            params:  {
                giveRedEnvelopeId:giveRedEnvelopeId
            },
            showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
        })
        .then((response: AxiosResponse) => {
            return response?.data;
        })
        .then((data: GiveRedEnvelope) => {

            state.giveRedEnvelope = {} as GiveRedEnvelope;

            if(data){
                state.giveRedEnvelope = data;
                if(state.giveRedEnvelope.nickname != null && state.giveRedEnvelope.nickname !=''){
                    state.giveRedEnvelope.avatar = letterAvatar(state.giveRedEnvelope.nickname, 48);
                }else{
                    state.giveRedEnvelope.avatar = letterAvatar(state.giveRedEnvelope.account, 48);
                }
            }

        }).catch((error: any) =>{
            console.log(error);
        });
    }
    //查询领取红包用户列表
    const queryReceiveRedEnvelopeUser = (giveRedEnvelopeId:string, page:number) => {
        proxy?.$axios({
            url: '/queryReceiveRedEnvelopeUser',
            method: 'get',
            params:  {
                giveRedEnvelopeId:giveRedEnvelopeId,
                page : page
            },
            showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
        })
        .then((response: AxiosResponse) => {
            return response?.data;
        })
        .then((data: PageView<ReceiveRedEnvelope>) => {

            if(data && data.records != null && data.records.length >0){

                let receiveRedEnvelopeList = data.records;
                if (receiveRedEnvelopeList != null && receiveRedEnvelopeList.length > 0) {
                    for(var i=0;i<receiveRedEnvelopeList.length; i++){
                        let receiveRedEnvelope = receiveRedEnvelopeList[i] as ReceiveRedEnvelope;
                        if(receiveRedEnvelope.receiveNickname != null && receiveRedEnvelope.receiveNickname !=''){
                            receiveRedEnvelope.receiveAvatar = letterAvatar(receiveRedEnvelope.receiveNickname, 32);
                        }else{
                            receiveRedEnvelope.receiveAvatar = letterAvatar(receiveRedEnvelope.receiveAccount, 32);
                        }
                        state.receiveRedEnvelopeList.push(receiveRedEnvelope);
                    }
                }

                //显示更多
                if(parseInt(data.totalrecord) != state.receiveRedEnvelopeList.length){

                    state.receiveRedEnvelope_more = true;
                }else{
                    state.receiveRedEnvelope_more = false;
                }
                state.receiveRedEnvelopeCurrentPage = data.currentpage;
            }

        }).catch((error: any) =>{
            console.log(error);
        });
    }


    //抢红包
    const grabRedEnvelope = (giveRedEnvelopeId:string) => {
        let formData = new FormData();
        formData.append('giveRedEnvelopeId', giveRedEnvelopeId);

        proxy?.$axios({
            url: '/user/control/redEnvelope/addReceiveRedEnvelope',
            method: 'post',
            data: formData
        })
        .then((response: AxiosResponse) => {
            if(response){

                const result: any = response.data;

                if(JSON.parse(result.success)){

                    let receiveRedEnvelopeAmount = result.receiveRedEnvelopeAmount
                    Notify({
                        type: 'success',
                        message: t('thread.790',{'p1': receiveRedEnvelopeAmount}),//抢到 "+receiveRedEnvelopeAmount+" 元红包
                        onClose: ()=>{

                        }
                    });

                    nextTick(()=>{
                        state.receiveRedEnvelopeList.length = 0;//清空数组
                        queryGiveRedEnvelopeContent(giveRedEnvelopeId);
                        queryReceiveRedEnvelopeUser(giveRedEnvelopeId,1);

                    })
                }else{
                    //处理错误信息
                    processErrorInfo(result.error as Map<string,string> , reactive({}),()=>{});



                }
            }
        })
        .catch((error: any) =>{
            console.log(error);
        });
    }
    let ii =0;
    //计算红包气泡弹出框位置
    const onReceiveRedEnvelopePopoverLocation = (receiveRedEnvelopeId:string) => {
        let receiveRedEnvelopecRefValue = (proxy?.$refs['receiveRedEnvelopec_'+receiveRedEnvelopeId] as any)[0];

        let clientWidth = document.documentElement.clientWidth;



        if((receiveRedEnvelopecRefValue.offsetLeft+12) > (clientWidth/2)){
            state.receiveRedEnvelopePlacement.set(receiveRedEnvelopeId,'top-end')
        }else{
            state.receiveRedEnvelopePlacement.set(receiveRedEnvelopeId,'top-start')
        }
    }

    //查询相似话题
    const queryLikeTopic = (topicId:string) => {
        proxy?.$axios({
            url: '/queryLikeTopic',
            method: 'get',
            params:  {
                topicId:topicId
            },
            showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
        })
        .then((response: AxiosResponse) => {
            return response?.data;
        })
        .then((data: Array<Topic>) => {
            state.likeTopicList.length =0;

            if(data){
                state.likeTopicList = data;
            }
        }).catch((error: any) =>{
            console.log(error);
        });
    }

    //点击回复层级
    const clickReplyLevel = (commentId:string,replyId:string) => {

        //是否点击已选中的项
        let isSelectedItem = false;


        if(state.dot.size >0){
            let lastFriendReplyId = [...state.dot][state.dot.size-1];//最后一个元素
            if(lastFriendReplyId[0] == replyId){
                isSelectedItem = true;
            }
        }

        state.dot.clear();
        state.line.clear();
        if(!isSelectedItem){
            showReplyLevel(commentId,replyId);
        }

    }

    //关闭回复层级
    const closeReplyLevel = () => {
        state.dot.clear();
        state.line.clear();
    }

    //展示回复层级
    const showReplyLevel = (commentId:string,replyId:string) => {

        let dotArray = new Array();
        let replyList = [] as Array<Reply>;
        if(state.commentList != null && state.commentList.length > 0){
            A:for (let i = 0; i <state.commentList.length; i++) {
                let comment = state.commentList[i];

                    if(comment.id == commentId){
                    //回复
                    if(comment.replyList != null && comment.replyList.length >0){
                        replyList = comment.replyList;
                        for (let j = 0; j <comment.replyList.length; j++) {
                            let reply = comment.replyList[j];
                            if(reply.id == replyId && reply.friendUserName != null && reply.friendUserName != ''){
                                let friendReplyIdArray = reply.friendReplyIdGroup.split(",");
                                for (let k = 0; k <friendReplyIdArray.length; k++) {
                                    let friendReplyId = friendReplyIdArray[k];
                                    if(friendReplyId != '' && friendReplyId != '0'){
                                        dotArray.push(friendReplyId);
                                    }
                                }
                                break A;
                            }
                        }
                    }
                    }

            }
        }

        //第一个有效层级
        let firstLevel = '';

        A:for (let i = 0; i <dotArray.length; i++) {
            let friendReplyId = dotArray[i];
            for (let j = 0; j <replyList.length; j++) {
                let reply = replyList[j];
                if(reply.id == friendReplyId){
                    firstLevel = friendReplyId;
                    break A;
                }
            }
        }

        //过滤无效的点
        A:for (let i = dotArray.length - 1; i >= 0; i--) {
            let friendReplyId = dotArray[i];
            for (let j = 0; j <replyList.length; j++) {
                let reply = replyList[j];
                if(reply.id == friendReplyId){
                    continue A;
                }
            }
            dotArray.splice(i, 1);
        }

        if(dotArray.length >0){
            for (let i = 0; i <dotArray.length; i++) {
                let friendReplyId = dotArray[i];
                state.dot.set(friendReplyId,true);//楼中楼的点
            }
            for (let i = 0; i <replyList.length; i++) {
                let reply = replyList[i];
                if(reply.id == firstLevel){
                    state.line.set(reply.id,true);//楼中楼的线
                    continue;
                }
                if(reply.id == replyId){
                    break;
                }
                if(state.line.size >0){
                    state.line.set(reply.id,true);//楼中楼的线
                }
            }

            state.dot.set(replyId,true);//楼中楼点击的层
        }
    }

    //判断是否有弹窗
    const isPopupWindow = () => {
        let isPopup = false;//是否有弹窗

        if(state.popup_addComment){//添加评论弹窗
            isPopup = true;
        }
        //修改评论弹窗
        for(let editCommentForm in state.editCommentFormView){
            if(state.editCommentFormView[editCommentForm]){
                isPopup = true;
            }
        }
        //引用评论弹窗
        for(let quoteForm in state.quoteFormView){
            if(state.quoteFormView[quoteForm]){
                isPopup = true;
            }
        }
        //添加回复弹窗
        for(let addReplyForm in state.addReplyFormView){
            if(state.addReplyFormView[addReplyForm]){
                isPopup = true;
            }
        }
        //修改回复弹窗
        for(let editReplyForm in state.editReplyFormView){
            if(state.editReplyFormView[editReplyForm]){
                isPopup = true;
            }
        }

        //回复对方弹窗
        for(let addReplyFriendForm in state.addReplyFriendFormView){
            if(state.addReplyFriendFormView[addReplyFriendForm]){
                isPopup = true;
            }
        }

        //添加举报弹窗
        if(state.addReportFormView){
            isPopup = true;
        }
        return isPopup;
    }



    //导航守卫
    onBeforeRouteUpdate((to, from, next) => {
        if(to.name == 'thread'){
            if(to.query.topicId != undefined){
                state.topicId = to.query.topicId as string
            }
            //删除缓存
            store.setCacheNumber(to.name)
        }
        //如果有弹出层，则不离开当前路由
        if(isPopupWindow()){
            store.setPopUpWindow(true);//标记有弹出窗口
            next(false);
        }else{
            next();
        }
    });

    //离开当前路由（解决有弹窗按返回键时会返回上一页）
    onBeforeRouteLeave((to, from) => {
        //如果有弹出层，则不离开当前路由
        if(isPopupWindow()){
            store.setPopUpWindow(true);//标记有弹出窗口
            return false;
        }
    })


    onMounted(() => {

        state.topicId = router.currentRoute.value.query.topicId != undefined ?router.currentRoute.value.query.topicId as string :'';
        init();
        notifyBackend(state.topicId,1);
        //设置缓存
        store.setCacheComponents(String(router.currentRoute.value.name))
    })

    //卸载组件实例后调用
    onUnmounted (()=>{
        //清除播放器
        clearVideoPlayer();

    })

    //初始化
    const init = () => {
        queryTopic(state.topicId,()=>{
            queryAddComment(state.topicId);
            queryFollowing(state.topic.userName);//查询是否已关注该用户
            queryGiveRedEnvelopeContent(state.topic.giveRedEnvelopeId);
            queryReceiveRedEnvelopeUser(state.topic.giveRedEnvelopeId, 1)
        });

        queryAlreadyCollected(state.topicId);
        queryFavoriteCount(state.topicId);
        queryAlreadyLiked(state.topicId,10);
        queryLikeCount(state.topicId,10);
        queryLikeTopic(state.topicId);
    }

    //进入keep-alive组件时触发
    onActivated(()=>{
        //后退时修改浏览器标题
        let titleValue = store_title.value
        if(titleValue != null && titleValue != '' && state.topic != null && Object.keys(state.topic).length > 0){
            document.title = (state.topic.title != null ? state.topic.title : '')+ ' - ' + titleValue;
            (document.getElementsByName('description')[0] as any).content  = (state.topic.summary != null ? state.topic.summary : '');
        }
    })
</script>
<style scoped lang="scss">
.topicContentModule{
    margin: var(--van-cell-group-inset-padding);
    .head{
        padding: 12px 12px 12px 12px;
        border-radius: var(--van-border-radius-lg);
        background: #fff;
        .container{
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
            .right-layout{
                :deep(.van-button){
                    height: 36px;
                }
            }
        }
    }


    /* 红包 */
    .receiveRedEnvelope{
        margin-top: 8px;
        background: #fff;
        border-radius: var(--van-border-radius-lg);
        .redEnvelope{
            margin-bottom:10px;
            padding:20px 15px 20px;
            margin:0 auto;
            width:150px;
            .box {
                border-radius: 16px;
                background-color: #ff483a;
                overflow: hidden;
                position: relative;
                color: #FFFFFF;
                .head {
                    border-bottom-right-radius: 100%;
                    border-bottom-left-radius: 100%;
                    width: 150%;
                    border-bottom: 2px solid #e03d19;
                    background-image: linear-gradient(-180deg, #ff583f 0%, #ff483a 100%);
                    position: relative;
                    left: 50%;
                    transform: translateX(-50%);
                    min-height: 16px;
                }
                .body {
                    padding-top: 20px;
                    margin:0 auto;
                    .content{
                        margin-bottom:15px;
	                    color:#fed68e;font-size:16px;position: relative;text-align: center;
                        .avatarBox{
                            border-radius:100%;
	                        margin-top: 40px;text-align: center;
                            img{
                                border-radius:100%;
	                            width: 32px;
                            }
                        }
                    }
                }
                .btn{
                    border:none;
                    position: absolute;
                    top:15px;
                    left: 50%;
                    transform: translateX(-50%);
                    background-color: #fed848;
                    width: 46px;
                    height: 46px;
                    line-height: 46px;
                    text-align: center;
                    font-size: 30px;
                    color:#dc972e;
                    border-radius: 100%;
                    cursor: pointer;
                    transition: transform 0.3s;
                    transform-origin:0 50%;
                    -moz-user-select:none; /*火狐*/
                    -webkit-user-select:none; /*webkit浏览器*/
                    user-select:none;
                    &:hover {
                        transform: scale(1.2) translateX(-50%) ;/* perspective(1px) translate3d(0,0,0) */
                    }
                }
                .open-btn{
                    border:none;
                    position: absolute;
                    top:13px;
                    left: 50%;
                    transform: translateX(-50%);
                    background-color: #fed848;
                    width: 50px;
                    height: 50px;
                    line-height: 50px;
                    text-align: center;
                    font-size: 18px;
                    color:#dc972e;
                    border-radius: 100%;
                    cursor: pointer;
                    transition: transform 0.3s;
                    transform-origin:0 50%;
                }
            }
        }

        .receiveRedEnvelopeUser{
            margin-left: 25px;padding-bottom: 15px;margin-right: 25px;position: relative;
            .box{
                text-align: center;
                margin-left: 8px;
            }
            .avatar {
                width: 32px;
                height: 32px;
                line-height: 32px;
                margin-bottom:8px;
                display: inline-block;
                margin-right: 8px;
                background: #fff no-repeat center/cover;
                position: relative;
                text-align: center;
                color: #fff;
                vertical-align: bottom;

                -webkit-user-select: none;
                -moz-user-select: none;
                -ms-user-select: none;
                user-select: none;
                border-radius: 50%;
                box-shadow: 0 0 0 1px rgba(0,0,0,.1);
            }
            .more {
                width:20px; height:14px; position: absolute;left: 0; right: 0; bottom: 5px;
                margin: auto;
                .icon {
                    font-size: 15px;
                    color: var(--van-gray-5);
                    &:hover{
                        color: #1890ff;
                    }
                }
            }
        }
        .noRedEnvelope{
            margin-bottom:10px;
            padding:20px 15px 20px;
            margin:0 auto;
            width:220px;
            .box {
                border-radius: 16px;
                background-color: #ff483a;
                overflow: hidden;
                position: relative;
                color: #FFFFFF;
                .content{
                    color:#fed68e;font-size:16px;height: 60px;line-height:60px; position: relative;text-align: center;
                }
            }
        }

    }








    .topicDetail{
        margin-top: 8px;
        background: #fff;
        border-radius: var(--van-border-radius-lg);
        position: relative;
        .head{

            .titleBox{
                font-size:0;/*父级元素设置font-size:0; 解决 display:inline-block两个元素之间的默认空格 */
                line-height:0;
                .title {
                    display: inline;
                    color: var(--van-gray-8);
                    font-weight: 400;
                    font-size: 20px;
                    line-height: 30px;
                }
                .essence{
                    display: inline-block;
                    padding: 2px 3px;
                    margin-left:5px;
                    font-size: initial;/*解决安卓浏览器文本无法垂直居中*/
                    line-height: 14px;
                    -webkit-border-radius: 2px;
                    -moz-border-radius: 2px;
                    border-radius: 2px;
                    color: #fff;
                    background-color: #ff7875;
                    position: relative;
                    top: -2px;
                    span{
                        font-size: 14px;
                    }
                }
                .top{
                    display: inline-block;
                    padding: 2px 3px;
                    margin-left:5px;
                    font-size: initial;/*解决安卓浏览器文本无法垂直居中*/
                    line-height: 14px;
                    -webkit-border-radius: 2px;
                    -moz-border-radius: 2px;
                    border-radius: 2px;
                    color: #fff;
                    background-color: #69c0ff;
                    position: relative;
                    top: -2px;
                    span{
                        font-size: 14px;
                    }
                }
            }
            .info{
                margin-top: 15px;
                padding-bottom: 6px;
                display: flex;
                .left-layout{
                    flex: 1;
                    margin-right: 10px;
                    .tagName-box{
                        display: inline-block;
                        position: relative;
                        .tagName{

                            border-radius: 3px;
                            background-color: var(--van-gray-1);
                            color: var(--van-gray-6);
                            height:26px;
                            line-height:26px;
                            padding-left:8px;
                            padding-right:8px;
                            font-size: 14px;
                            position: relative;
                            top: 1px;

                            display: -webkit-box;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            line-clamp: 1;
                            -webkit-box-orient: vertical;
                            word-wrap:break-word;
                            word-break:break-all;
                        }
                    }


                }
                .right-layout{
                    color: var(--van-gray-6);
                    font-size: 14px;
                    margin-top: 4px;
                    .statistics{
                        .icon{
                            position: relative;
                            top: 2px;
                        }
                        .ipAddress{
                            margin-left: 2px;
                            margin-right: 12px;
                        }
                        .commentTotal{
                            margin-left: 2px;
                            margin-right: 12px;
                        }
                        .viewTotal{
                            margin-left: 2px;
                        }
                        .more{
                            margin-left: 12px;
                            position: relative;
                            top: 1px;
                        }
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
            .cancelAccount{
                display: inline-block;
                vertical-align: middle;
                padding: 6px 6px;
                font-size: 14px;
                line-height: 14px;
                -webkit-border-radius: 2px;
                -moz-border-radius: 2px;
                border-radius: 2px;
                color: var(--van-gray-5);
                background-color: var(--van-gray-1);
                margin-bottom: 6px;
            }
            .lastUpdateTime{
                text-align: center;padding-top: 20px; padding-bottom: 20px;color: var(--van-gray-6);font-size: 15px;
            }
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
            margin-left: 12px;
            margin-right: 12px;
            padding-bottom: 20px;
            color:var(--van-gray-8);
            font-size:16px;
            line-height:1.75;
            word-wrap:break-word;
            min-height: 100px;
            .cancelAccount{
                display: inline-block;
                vertical-align: middle;
                padding: 6px 6px;
                font-size: 14px;
                line-height: 14px;
                -webkit-border-radius: 2px;
                -moz-border-radius: 2px;
                border-radius: 2px;
                color: var(--van-gray-5);
                background-color: var(--van-gray-1);
                margin-bottom: 6px;
            }
            .lastUpdateTime{
                text-align: center;padding-top: 20px; padding-bottom: 20px;color: var(--van-gray-6);font-size: 15px;
            }
            a{
                color: var(--van-blue);
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
            //自动换行
            pre{
                white-space:pre-wrap;
            }
        }
        //举报标记
        :deep(.reportMark){
            &:before{
                content: " ";
                position: absolute;
                top: 0px;
                left: -8px;
                bottom:0px;
                border-left: 5px solid #f89898;
            }
        }
        .operating {
            display:inline-block;
            text-align: center;
            width: 100%;
            .bottomInfo{
                margin-top: 12px;
                margin-bottom: 12px;
                .favorites{
                    height: 38px;
                    border-radius: var(--van-button-round-border-radius);//var(--van-border-radius-lg);
                    border: var(--van-button-border-width) solid var(--van-gray-4);
                    color: var(--van-gray-6);
                    span{
                        margin-right: 4px;
                    }
                }
                .like{
                    height: 38px;
                    border-radius: var(--van-button-round-border-radius);//var(--van-border-radius-lg);
                    border: var(--van-button-border-width) solid var(--van-gray-4);
                    color: var(--van-gray-6);
                    margin-left: 10px;
                    span{
                        margin-right: 4px;
                    }
                }
                .icon{
                    margin-right: 4px;
                    position: relative;
                    top: 2px;
                }
            }
        }







    }
    .allow-comment-wrap{
        margin-top: 8px;
        background: #fff;
        padding: 12px;
        border-radius: var(--van-border-radius-lg);
        .no-comment-button{
            text-align: center;
            background: var(--van-gray-1);
            color: var(--van-gray-6);
            line-height: 42px;
            border-radius: var(--van-border-radius-lg);
        }

        .comment-button{
            .login-button{
                text-align: center;
                background: var(--van-gray-1);
                color: var(--van-gray-6);
                line-height: 42px;
                border-radius: var(--van-border-radius-lg);
                span{
                    color: var(--van-blue);
                    margin-right: 3px;
                }
            }
        }
    }
    .no-comment-wrap{
        margin-top: 8px;
        background: #fff;
        padding: 12px;
        border-radius: var(--van-border-radius-lg);
        .no-comment{
            text-align: center;
            background: var(--van-gray-1);
            color: var(--van-gray-6);
            line-height: 42px;
            border-radius: var(--van-border-radius-lg);
        }
    }
    .previous-comment-wrap{
        margin-top: 8px;
        background: #fff;
        padding: 12px;
        border-radius: var(--van-border-radius-lg);
    }
    .commentList{
        margin-top: 8px;
        background: #fff;
        border-radius: var(--van-border-radius-lg);
        .item{
            margin-left: 12px;
            margin-right: 12px;
            padding-top: 12px;
            padding-bottom: 12px;

            .top-container{
                display: flex;
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
                        min-height: 42px;
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
                            .separate{
                                margin-left: 6px;
                                margin-right: 6px;
                                font-size: 12px;
                            }
                            .like-icon{
                                position: relative;
                                top: 2px;
                                color: var(--van-gray-6);
                            }
                            .like-quantity-container{
                                position: relative;
                                top: 2px;
                                margin-left: 2px;
                                .like-quantity{
                                    position: absolute;
                                    top: 0px;
                                    left: 0px;
                                    font-size: 12px;
                                    color: var(--van-gray-6);
                                }
                            }
                        }
                    }

                }
                .right-layout{
                    display: flex;
                    position: relative;
                    top: -2px;
                    .floor{
                        font-size: 12px;
                        color: var(--van-gray-6);
                    }
                    .more{
                        margin-left: 10px;
                        color: var(--van-gray-6);
                        position: relative;
                        top: 1px;
                    }
                }
            }
            .bottom-container{
                :deep(.quote){
                    padding:5px 8px;
                    border-bottom:none;
                    text-align: left;
                    margin-top: 20px;
                    .cancelAccount{
                        display: inline-block;
                        vertical-align: middle;
                        padding: 6px 6px;
                        font-size: 14px;
                        line-height: 14px;
                        -webkit-border-radius: 2px;
                        -moz-border-radius: 2px;
                        border-radius: 2px;
                        color: var(--van-gray-5);
                        background-color: var(--van-gray-1);
                    }
                    .cancelNickname{
                        font-weight:normal;
                        color: transparent;
                        text-shadow: 0 0 5px rgba(0,0,0,0.4);
                        zoom: 1;
                        user-select:none;
                    }
                    .quoteComment{
                        background:var(--van-gray-1);
                        padding:5px 8px 8px 8px;
                        border:1px solid var(--van-gray-3);
                        line-height:140%;
                        margin-bottom:6px;
                        line-height: 28px;
                        border-radius: 3px;
                        .userName{
                            font-size:14px;
                            height: 30px;
                            position: relative;
                            margin-left: 26px;
                            color:var(--van-gray-6);
                            .avatarBox{
                                position:absolute;
                                display:inline-block;
                                border-radius:100%;
                                left: -26px;
                                top:-4px;
                                img{
                                    border-radius:100%;
                                    width: 22px;
                                }
                            }
                        }
                        .quoteContent{
                            margin-top: 8px;
                            margin-bottom: 2px;
                        }
                    }
                }
                :deep(.commentMarkdownContent){
                    padding-bottom: 10px;
                    word-wrap:break-word;
                    color: var(--van-gray-8);
                    font-size:15px;
                    line-height:1.75;
                    margin-top: 20px;

                    .cancelAccount{
                        display: inline-block;
                        vertical-align: middle;
                        padding: 6px 6px;
                        font-size: 14px;
                        line-height: 14px;
                        -webkit-border-radius: 2px;
                        -moz-border-radius: 2px;
                        border-radius: 2px;
                        color:  var(--van-gray-5);
                        background-color:  var(--van-gray-1);
                    }
                    img {
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
                    p{
                        font-size:16px;
                        word-wrap:break-word
                    }
                    a[linkType*="mention"] {
                        color: var(--van-blue);
                    }
                    code[class*="language-"]{
                        padding: 0 0;
                    }
                    pre{
                        white-space:pre-wrap;
                        code{/*连续字母数字换行*/
                            word-break: break-all;
                        }
                    }
                    table {
                        width: 100%;
                        th {
                            font-weight: 600
                        }
                        td,th {
                            border: 1px solid  var(--van-gray-3);
                            padding: 6px 13px
                        }
                        tr {
                            background-color: #fff;
                            border-top: 1px solid  var(--van-gray-3);
                            &:nth-child(2n) {
                                background-color:  var(--van-gray-1);
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
                    .task-list-item {
                        list-style-type:none;
                    }
                    iframe{
                        width:100%; height: 550px;padding:10px 0px;
                    }
                }
                :deep(.commentContent){
                    padding-bottom: 10px;
                    word-wrap:break-word;
                    color: var(--van-gray-8);
                    font-size:15px;
                    line-height:1.75;
                    margin-top: 20px;

                    .cancelAccount{
                        display: inline-block;
                        vertical-align: middle;
                        padding: 6px 6px;
                        font-size: 14px;
                        line-height: 14px;
                        -webkit-border-radius: 2px;
                        -moz-border-radius: 2px;
                        border-radius: 2px;
                        color:  var(--van-gray-5);
                        background-color:  var(--van-gray-1);
                    }
                    img {
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
                    pre{
                        white-space:pre-wrap;
                        code{/*连续字母数字换行*/
                            word-break: break-all;
                        }
                    }
                    a[linkType*="mention"] {
                        color: var(--van-blue);
                    }
                    table {
                        width: 100%;
                        th {
                            font-weight: 600
                        }
                        td,th {
                            border: 1px solid  var(--van-gray-3);
                            padding: 6px 13px
                        }
                        tr {
                            background-color: #fff;
                            border-top: 1px solid  var(--van-gray-3);
                            &:nth-child(2n) {
                                background-color:  var(--van-gray-1);
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
                }
                .replyList{
                    margin-top: 15px;
                    margin-left: 50px;
                    position: relative;
                    &:before {
                        position: absolute;
                        width: 14px;
                        height: 14px;
                        box-sizing: border-box;
                        content: " ";
                        pointer-events: none;
                        border-top: 1px solid var(--van-gray-3);
                        border-left: 1px solid var(--van-gray-3);
                        transform: rotate(45deg) scale(.5) ;
                        background-color: #fff;
                        top: -7px;
                        left: 30px;
                        z-index: 1;
                    }
                    .reply-container{
                        position: relative;
                        left: -30px;

                        .replyItem{
                            padding-top: 12px;
                            padding-bottom: 12px;
                            margin-left: 30px;
                            margin-right:-30px;
                            //举报标记
                            .reply-reportMark{
                                position: relative;
                                &:before{
                                    content: " ";
                                    position: absolute;
                                    top: -10px;
                                    left: -18px;
                                    bottom:-5px;
                                    border-left: 5px solid #f89898;
                                }
                            }
                            .top-container{
                                display: flex;
                                .left-layout{
                                    .avatarImg{
                                        img {
                                            width: 32px;
                                            height: 32px;
                                            border-radius:32px;
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
                                        min-height: 39px;
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
                                        .account{
                                            color: var(--van-gray-7);
                                            margin-right: 5px;
                                            position: relative;
                                            top: -3px;
                                        }
                                        .userRoleName{
                                            display: inline-block;
                                            white-space:nowrap;
                                            vertical-align: middle;
                                            padding: 2px 4px;
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
                                            top: -1px;
                                        }
                                        .staff{
                                            display: inline-block;
                                            white-space:nowrap;
                                            vertical-align: middle;
                                            padding: 2px 4px;
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
                                            top: -1px;
                                        }
                                        .time{
                                            width:100%;
                                            color: var(--van-gray-6);
                                            font-size: 12px;
                                            position: relative;
                                            top: -4px;
                                            .separate{
                                                margin-left: 6px;
                                                margin-right: 6px;
                                            }
                                            .like-icon{
                                                position: relative;
                                                top: 2px;
                                                color: var(--van-gray-6);
                                            }
                                            .like-quantity-container{
                                                position: relative;
                                                top: 2px;
                                                margin-left: 2px;
                                                .like-quantity{
                                                    position: absolute;
                                                    top: 0px;
                                                    left: 0px;
                                                    font-size: 12px;
                                                    color: var(--van-gray-6);
                                                }
                                            }

                                        }
                                    }

                                }
                                .right-layout{
                                    display: flex;
                                    .more{
                                        color: var(--van-gray-6);
                                        position: relative;
                                        top: 1px;
                                    }
                                }
                            }
                            .bottom-container{
                                .friendInfo-wrap{
                                    margin-top: 6px;
                                    background: #fff;
                                    padding: 6px 0px;
                                    border-radius: var(--van-border-radius-lg);

                                    .friendInfo{
                                        background: var(--van-gray-1);
                                        color: var(--van-gray-6);
                                        line-height: 38px;
                                        border-radius: var(--van-border-radius-lg);
                                        display: flex;

                                        .icon-container{
                                            margin-left: 12px;
                                            position: relative;
                                            top: 1px;
                                            color: var(--van-gray-6);
                                        }
                                        .avatarImg-container{
                                            margin-left: 12px;
                                            position: relative;
                                            top: -1px;
                                            img {
                                                width: 22px;
                                                height: 22px;
                                                border-radius:22px;
                                                vertical-align: middle;
                                            }
                                        }
                                        .nameInfo-container {
                                            flex: 1;
                                            margin-left: 6px;
                                            margin-right: 6px;
                                            overflow:hidden;
                                            text-overflow:ellipsis; //溢出用省略号显示
                                            white-space:nowrap; //溢出不换行
                                            .userName {
                                                color: var(--van-gray-6);
                                                font-size: 14px;
                                                position: relative;
                                                top: 1px;
                                            }
                                            .cancelNickname{
                                                font-weight:normal;
                                                margin-right: 3px;
                                                color: transparent;
                                                text-shadow: 0 0 5px rgba(0,0,0,0.4);
                                                zoom: 1;
                                                user-select:none;
                                            }
                                        }
                                    }
                                }

                                :deep(.replyContent){
                                    word-wrap:break-word;
                                    color: var(--van-gray-8);
                                    font-size:15px;
                                    line-height:1.75;
                                    padding-top: 8px;
                                    padding-bottom: 8px;

                                    .cancelAccount{
                                        display: inline-block;
                                        vertical-align: middle;
                                        padding: 6px 6px;
                                        font-size: 14px;
                                        line-height: 14px;
                                        -webkit-border-radius: 2px;
                                        -moz-border-radius: 2px;
                                        border-radius: 2px;
                                        color:  var(--van-gray-5);
                                        background-color:  var(--van-gray-1);
                                    }
                                    img {
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
                                    pre{
                                        white-space:pre-wrap;
                                        code{/*连续字母数字换行*/
                                            word-break: break-all;
                                        }
                                    }
                                    a[linkType*="mention"] {
                                        color: var(--van-blue);
                                    }


                                    .cancelAccount{
                                        display: inline-block;
                                        vertical-align: middle;
                                        padding: 6px 6px;
                                        font-size: 14px;
                                        line-height: 14px;
                                        -webkit-border-radius: 2px;
                                        -moz-border-radius: 2px;
                                        border-radius: 2px;
                                        color: var(--van-gray-5);
                                        background-color:  var(--van-gray-1);
                                    }
                                }
                            }
                        }
                    }

                    //第一项时间线并且含有回复对方的节点位置
                    :deep(.first-position){
                        .tail {
                            top: 126px;
                        }

                    }
                    //含有回复对方的节点位置
                    :deep(.node-position){
                        .node {
                            top: 126px;
                        }
                    }

                    .link {
                        text-align: right;
                        margin-bottom: 5px;
                        span {
                            font-size: 14px;
                            color: var(--van-blue);
                        }
                    }
                }
            }
        }
        //举报标记
        .reportMark{
            position:relative;
            &:before{
                content: " ";
                position: absolute;
                top: 0px;
                left: -18px;
                bottom:0px;
                border-left: 5px solid #f89898;
            }
        }
    }
}

.addCommentModule{
    overflow-y:auto;
	-webkit-overflow-scrolling: touch;
	height: 100%;
    .form-container{
        :deep(.bytemd-editor){
            min-height: 250px !important;
        }

        :deep(.CodeMirror-sizer){
            min-height: 245px !important;
        }
        :deep(.bytemd-preview){
            min-height: 250px !important;
        }
        .van-cell {
            padding: 0px var(--van-cell-horizontal-padding) var(--van-cell-vertical-padding) var(--van-cell-horizontal-padding);

            &:after {
                border-bottom: 1px solid transparent;
            }
        }
        [class*=van-hairline]:after{
            border-bottom: 1px solid transparent;
        }
        .submitButton{
            width: 100%;
            margin: 16px 0px;
        }

    }
}

.quoteCommentModule{
    overflow-y:auto;
	-webkit-overflow-scrolling: touch;
	height: 100%;
    .quoteBox{
        background: var(--van-gray-1);
        padding: 12px;
        margin: 46px 16px 0px 16px;
        font-size: 14px;
        line-height: 28px;
        color: var(--van-gray-6);
        border-radius:3px;
    }
    .form-container{
        :deep(.bytemd-editor){
            min-height: 250px !important;
        }

        :deep(.CodeMirror-sizer){
            min-height: 245px !important;
        }
        :deep(.bytemd-preview){
            min-height: 250px !important;
        }
        .van-cell {
            padding: 0px var(--van-cell-horizontal-padding) var(--van-cell-vertical-padding) var(--van-cell-horizontal-padding);

            &:after {
                border-bottom: 1px solid transparent;
            }
        }
        [class*=van-hairline]:after{
            border-bottom: 1px solid transparent;
        }
        .submitButton{
            width: 100%;
            margin: 16px 0px;
        }

    }
}
.editCommentModule{
    overflow-y:auto;
	-webkit-overflow-scrolling: touch;
	height: 100%;
    .form-container{
        :deep(.bytemd-editor){
            min-height: 250px !important;
        }

        :deep(.CodeMirror-sizer){
            min-height: 245px !important;
        }
        :deep(.bytemd-preview){
            min-height: 250px !important;
        }
        .van-cell {
            padding: 0px var(--van-cell-horizontal-padding) var(--van-cell-vertical-padding) var(--van-cell-horizontal-padding);

            &:after {
                border-bottom: 1px solid transparent;
            }
        }
        [class*=van-hairline]:after{
            border-bottom: 1px solid transparent;
        }
        .submitButton{
            width: 100%;
            margin: 16px 0px;
        }

    }
}

.addReplyModule{
    overflow-y:auto;
	-webkit-overflow-scrolling: touch;
	height: 100%;
    .form-container{
        .van-cell {
            padding: 0px var(--van-cell-horizontal-padding) var(--van-cell-vertical-padding) var(--van-cell-horizontal-padding);

            &:after {
                border-bottom: 1px solid transparent;
            }
        }
        [class*=van-hairline]:after{
            border-bottom: 1px solid transparent;
        }
        .submitButton{
            width: 100%;
            margin: 16px 0px;
        }

    }
}
//回复对方
.addReplyFriendModule{
    overflow-y:auto;
	-webkit-overflow-scrolling: touch;
	height: 100%;

    .form-container{
        .friendUser{
            margin-top: 8px;
            &:after{
                border-bottom: 1px solid transparent;
            }
        }
        .van-cell {
            padding: 0px var(--van-cell-horizontal-padding) var(--van-cell-vertical-padding) var(--van-cell-horizontal-padding);

            &:after {
                border-bottom: 1px solid transparent;
            }
        }
        [class*=van-hairline]:after{
            border-bottom: 1px solid transparent;
        }
        .submitButton{
            width: 100%;
            margin: 16px 0px;
        }

    }
}
.editReplyModule{
    overflow-y:auto;
	-webkit-overflow-scrolling: touch;
	height: 100%;
    .form-container{
        .van-cell {
            padding: 0px var(--van-cell-horizontal-padding) var(--van-cell-vertical-padding) var(--van-cell-horizontal-padding);

            &:after {
                border-bottom: 1px solid transparent;
            }
        }
        [class*=van-hairline]:after{
            border-bottom: 1px solid transparent;
        }
        .submitButton{
            width: 100%;
            margin: 16px 0px;
        }

    }
}

/* 相关话题 */
.likeTopicModule{
    margin: var(--van-cell-group-inset-padding);
	background: #fff;
    border-radius: var(--van-border-radius-lg);
    .likeTopic{
        margin-bottom:10px;
        padding:0 12px 0;
        .title{
            font-size:16px;
            padding:20px 0 15px;
            color:var(--van-gray-8);
        }
        .topicList {
            font-size: 15px;
            margin-top: 12px;
            padding-bottom: 12px;
            > .topic-title {
                counter-increment: index;
                display: flex;
                flex-direction: row;
                padding-top: 5px;
                padding-bottom: 5px;
                &::before {
                    content: counter(index);
                    display: flex;
                    width: 22px;
                    height: 22px;
                    background-color: var(--van-gray-1);
                    text-align: center;
                    border-radius: 4px;
                    flex: none;
                    align-items: center;
                    justify-content: center;
                    color: var(--van-gray-5);
                    position: relative;
                    top: 1px;
                }
                .top{
                    &::before {
                        background-color: var(--van-blue);
                        color: #fff;
                    }
                }
                > a {
                    display: block;
                    word-break: break-word; font-size: 15px;
                    flex: auto;
                    margin-left: 8px;
                    line-height: 26px;
                    color: var(--van-gray-8);
                    &:hover {
                        color: var(--van-blue);
                    }
                }
            }
        }
    }
}

/* 添加举报 */
.addReportModule{
	overflow-y:auto;
	-webkit-overflow-scrolling: touch;
	height: 100%;
    margin-top:10px;
    .form-container{
        .van-cell {
            padding: 0px var(--van-cell-horizontal-padding) var(--van-cell-vertical-padding) var(--van-cell-horizontal-padding);

            &:after {
                border-bottom: 1px solid transparent;
            }
        }
        [class*=van-hairline]:after{
            border-bottom: 1px solid transparent;
        }
        .fileList{
            margin-left: 16px;
            margin-right: 16px;
        }
        .submitButton{
            width: 100%;
            margin: 16px 0px;
        }

    }
    .reportType-container{
        display: flex;
        flex-direction: column;
        padding-top: 20px;
        .reportType-group{
            display: flex;
            flex-direction: column;
            margin-bottom: 15px;
            .reportType-name{
                margin-bottom: 15px;
                font-size: 14px;
                text-align: left;
                color: #86909C;
            }
            .reportType-list{
                display: flex;
                flex-wrap: wrap;
                padding: 0;
                margin: 0;
                list-style: none;
                white-space: nowrap;

                .reportType-item{
                    display: flex;
                    flex-wrap: wrap;
                    padding: 0;
                    margin: 0;
                    margin-right:30px;
                    list-style: none;
                    white-space: nowrap;
                }

            }
            .reportType-list-multiple{
                margin-top: -15px;
                .reportType-item-multiple{
                    margin-top: 15px;
                }
            }
        }
    }
}

</style>
