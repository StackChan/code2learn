<!--问题内容-->
<template>
    <div class="main">
        <div class="main-container">
            <van-sticky>
                <!--title="问答" left-text="返回"-->
                <van-nav-bar :title="t('question.10')" :left-text="t('common.110')" left-arrow @click-left="onBack" @click-right="router.push({path: '/askList'})">
                    <template #right>
                        <van-icon name="wap-home-o" :size="convertViewportWidth('18px')"/>
                    </template>
                </van-nav-bar>
            </van-sticky>
          <!-- 占位播放器 -->
          <div ref ="placeholderVideo" style="width: 0px;height: 0px;"></div>
            <!-- success-text="刷新成功" -->
            <van-pull-refresh v-model="state.isRefreshing" :success-text="t('common.130')" pull-distance="200" :disabled="isPopupWindow()" @refresh="onRefresh">
                <div class="questionContentModule">

                    <div class="head" v-if="state.question != null && Object.keys(state.question).length>0">
                        <div class="container">
                            <div class="left-layout" v-if="!state.isQuestionSkeleton">
                                    <span class="avatarImg">
                                        <img v-if="state.question.avatarName != null" :src="state.question.avatarPath+'100x100/'+state.question.avatarName" class="img">
                                    </span>
                            </div>
                            <div class="middle-layout" v-if="!state.isQuestionSkeleton">
                                <div class="userInfo">

                                    <span class="time">{{state.question.postTime}}</span>
                                </div>
                            </div>
                            <div class="right-layout">
                            </div>
                        </div>
                    </div>

                    <div class="questionDetail">
                        <div class="head" v-if="!state.isQuestionSkeleton">
                            <div class="titleBox">
                                <h1 class="title">{{state.question.title}}</h1>
                            </div>
                            <div class="info van-hairline--bottom">
                                <div class="left-layout">
                                    <div class="tagName-box" v-for="questionTag in state.question.questionTagAssociationList"><span class="tagName">{{questionTag.questionTagName}}</span></div>
                                </div>
                                <div class="right-layout">
                                    <div class="statistics">
                                        <template v-if="state.question.ipAddress != null && state.question.ipAddress != ''">
                                            <Icon name="map-pin-line" :size="convertViewportWidth('14px')" class="icon"/><span class="ipAddress">{{state.question.ipAddress}}</span>
                                        </template>
                                        <Icon name="info-alt" :size="convertViewportWidth('14px')" class="icon"/><span class="answerTotal">{{state.question.answerTotal}}</span>
				            	             <Icon name="view" :size="convertViewportWidth('14px')" class="icon"/><span class="viewTotal">{{state.question.viewTotal}}</span>

                                        <span class="more" v-if="onQuestionPopoverActions(state.question).length >0">
                                            <van-popover v-model:show="state.showQuestionPopover" placement="left-start" :overlay="true" overlay-class="custom-popoverModule-overlay" :actions="onQuestionPopoverActions(state.question)" @select="onQuestionPopoverSelect">
                                                <template #reference>
                                                    <van-icon name="ellipsis" :size="convertViewportWidth('16px')"/>
                                                </template>
                                            </van-popover>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div :class="[state.question.isMarkdown != null && state.question.isMarkdown == true ? 'markdown-body-custom questionMarkdownContent' : 'questionContent',router.currentRoute.value.query.reportModule !=undefined && parseInt(router.currentRoute.value.query.reportModule as string) == 40 ? 'reportMark' : '']" v-if="!state.isQuestionSkeleton" >
                            <div class="reward" v-if="parseFloat(state.question.amount) > 0 || Long.fromString(String(state.question.point)).gt(0)">
                                <div class="info" >
                                    <Icon name="deposit" size="26px" class="icon"/>
                                    <!--
                                    悬赏<template v-if="parseFloat(state.question.amount) > 0">金额<span class="symbol">¥</span><span class="amount">{{state.question.amount}}</span>元 </template>
                                    <template v-if="Long.fromString(state.question.point).gt(0)">
                                        <span class="point">{{state.question.point}}</span>积分
                                    </template>-->
                                    <!-- 仅含有金额 -->
                                    <template v-if="parseFloat(state.question.amount) > 0 && Long.fromString(state.question.point).lte(0)">
                                        <i18n-t keypath="question.590" scope="global">
                                            <template #p1>
                                                <span class="symbol">¥</span><span class="amount">{{state.question.amount}}</span>
                                            </template>
                                        </i18n-t>
                                    </template>
                                    <!-- 仅含有积分 -->
                                    <template v-if="parseFloat(state.question.amount) <=0 && Long.fromString(state.question.point).gt(0)">
                                        <i18n-t keypath="question.600" scope="global">
                                            <template #p1>
                                                <span class="point">{{state.question.point}}</span>
                                            </template>
                                        </i18n-t>
                                    </template>
                                    <!-- 含有金额和积分 -->
                                    <template v-if="parseFloat(state.question.amount) >0 && Long.fromString(state.question.point).gt(0)">
                                        <i18n-t keypath="question.610" scope="global">
                                            <template #p1>
                                                <span class="symbol">¥</span><span class="amount">{{state.question.amount}}</span>
                                            </template>
                                            <template #p2>
                                                <span class="point">{{state.question.point}}</span>
                                            </template>
                                        </i18n-t>
                                    </template>
                                </div>
                            </div>

                            <!--此用户账号已注销-->
                            <div class="cancelAccount" v-if="state.question.account == null || state.question.account == ''">{{t('question.40')}}</div>
                          <!--                  具体的问答内容  -->
                            <div :ref="'question_'+state.question.id">
                                <RenderTemplate @click-onZoomPicture="onZoomPicture" @load-onLoadPicture="onLoadPicture" :html="state.question.content"></RenderTemplate>
                            </div>
                        </div>
                      <!--              评论-->
                        <template v-for="(appendQuestionItem,index) in state.question.appendQuestionItemList">
                            <div :class="(index%2)==0 ? 'appendBox odd' : 'appendBox even'">
                                <div class="appendHead">
                                    <!--第{{index + 1}}条附言-->
                                    <span class="prompt">{{t('question.50',{'p1': index + 1})}}</span>
                                    <span class="appendTime">{{appendQuestionItem.postTime}}</span>
                                </div>
                                <div :class="[appendQuestionItem.isMarkdown != null && appendQuestionItem.isMarkdown == true ? 'markdown-body-custom appendMarkdownContent' : 'appendContent']" :ref="'appendQuestion_'+appendQuestionItem.id">
                                    <RenderTemplate @click-onZoomPicture="onZoomPicture" @load-onLoadPicture="onLoadPicture" :html="appendQuestionItem.content"></RenderTemplate>
                                </div>
                            </div>
                        </template>
                      <!--              评论-->
                        <div class="questionContent" v-if="state.isQuestionSkeleton">
                            <van-skeleton :row="3" :loading="state.isQuestionSkeleton" class="skeleton" style="padding-top: 30px;"/>
                        </div>
                        <div class="operating" v-if="state.question != null && Object.keys(state.question).length>0">
                            <div class="bottomInfo">
                                <van-button type="primary" plain class="favorites"  @click="()=>{state.alreadyCollected == true ? deleteFavorite(state.question.id) : addFavorite(state.question.id)}">
                                    <template #default>
                                        <span>{{state.favoriteCount}}</span>
                                        <!--'已收藏':'收藏'-->
                                        {{state.alreadyCollected == true ? t('question.60'):t('question.70')}}
                                    </template>
                                    <template #icon>
                                        <Icon name="favorites" :size="convertViewportWidth('16px')" class="icon"/>
                                    </template>
                                </van-button>
                                <van-button type="primary" plain class="like"  @click="()=>{state.alreadyLiked == true ? deleteLike(state.question.id,40) : addLike(state.question.id,40);}" >
                                    <template #default>
                                        <span>{{state.likeCount}}</span>
                                        <!--已赞':'赞'-->
                                        {{state.alreadyLiked == true ? t('question.80'):t('question.90')}}
                                    </template>
                                    <template #icon>
                                        <Icon name="thumb-up" :size="convertViewportWidth('16px')" class="icon"/>
                                    </template>
                                </van-button>
                            </div>
                        </div>
                    </div>
                    <!-- 问题允许回答 -->
                    <div class="allow-answer-wrap" v-if="state.question.allow">
                        <!-- 已登录 -->
                        <div v-if="store_systemUser != null && Object.keys(store_systemUser).length>0">
                            <!-- 显示回答按钮 -->
                            <div class="answer-button" v-if="state.allowAnswer">
                                <!--回答问题-->
                                <van-button round block plain type="primary" native-type="submit" @click="addAnswerUI" >{{t('question.100')}}</van-button>
                            </div>
                             <!-- 不显示回答按钮 回答已关闭-->
                            <div class="no-answer-button" v-if="!state.allowAnswer">
                                {{t('question.110')}}
                            </div>
                        </div>
                        <!-- 未登录 -->
                        <div v-else class="answer-button" >
                            <div class="login-button">
                                <!-- <span @click="router.push({path: '/login',query:{jumpUrl :createJumpAttribute()}})">登录</span>后回答问题-->
                                <i18n-t keypath="question.120" scope="global">
                                    <template #p1>
                                        <span @click="router.push({path: '/login',query:{jumpUrl :createJumpAttribute()}})">{{t('question.130')}}</span>
                                    </template>
                                </i18n-t>
                            </div>
                        </div>
                    </div>

                    <!-- 问题不允许回答 -->
					<div class="no-answer-wrap" v-if="state.question != null && Object.keys(state.question).length>0 && !state.question.allow">
                        <!-- 本问题回答已关闭 -->
                        <div class="no-answer">
                            {{t('question.140')}}
                        </div>
					</div>

                    <!-- 上一页答案 -->
                    <div class="previous-answer-wrap" v-if="state.initialPage >1">
                        <!-- 上一页答案 -->
                        <van-button round block plain type="primary" native-type="submit" @click="queryPreviousAnswerList(state.questionId, state.initialPage-1)" >{{t('question.150')}}</van-button>
                    </div>

                    <!-- 追加提问 -->
                    <van-popup v-model:show="state.appendQuestionFormView" :lock-scroll="false" @close="closeAppendQuestion" safe-area-inset-bottom :close-on-popstate="true" position="bottom" closeable close-icon="close" :style="{ height: '100%' }">
                        <div class="appendQuestionModule">
                            <van-form :ref="'formAppendQuestionRef'" :scroll-to-error="true" class="form-container">
                                <van-cell-group>
                                    <van-field center :error-message="error.appendQuestionContent">
                                        <template #input>
                                            <div v-show="!state.isAppendQuestionMarkdown" style="width: 100%;">
                                                <van-sticky :z-index="1" >
                                                    <div ref="appendQuestionContentEditorToolbarRef" class="editor-toolbar" style="padding-top: 13px;"></div>
                                                </van-sticky>
                                                <div :editorId="'appendQuestion'" ref="appendQuestionContentEditorTextRef"  class="editor-text" style="min-height: 320px;"></div>
                                            </div>
                                            <div v-if="state.isAppendQuestionMarkdown" style="width: 100%;">
                                                <!-- placeholder="请输入内容..." -->
                                                <Editor mode="tab" :editorId="'appendQuestion'" :value="state.appendQuestionMarkdownContent" :plugins="state.appendQuestionEditorPlugin" :locale="setMarkdownLanguage()" :sanitize="appendQuestionSanitize" :placeholder="t('question.160')" @change="handleAppendQuestionMarkdownChange"/>
                                            </div>
                                        </template>
                                    </van-field>
                                    <!-- label="验证码" placeholder="请输入验证码" -->
                                    <van-field v-model="state.captchaValue['appendQuestion-'+state.questionId]"  @change.native="checkCaptchaValueRules('appendQuestion-'+state.questionId)" class="captcha-item captcha-input-left" :label="t('common.70')" :placeholder="t('common.120')" maxlength="4" center clearable v-if="state.showCaptcha.get('appendQuestion-'+state.questionId)" :error-message="error.captchaValue.get('appendQuestion-'+state.questionId)">
                                        <template #button>
                                            <van-image :src="state.imgUrl.get('appendQuestion-'+state.questionId)" @click="replaceCaptcha('appendQuestion-'+state.questionId)" class="captcha-image"/>
                                        </template>
                                        <template #extra >
                                            <!-- 换一幅 -->
                                            <span class="captcha-replace" @click="replaceCaptcha('appendQuestion-'+state.questionId)">{{t('common.80')}}</span>
                                        </template>
                                    </van-field>

                                </van-cell-group>

                                <van-field center :error-message="error.question">
                                    <template #input>
                                        <div class="submitButton">
                                            <!-- 追加提交 -->
                                            <van-button round block type="primary" native-type="submit" @mousedown="onAppendQuestionFormSubmit" :disabled="state.allowSubmit.get('appendQuestion-'+state.questionId)">{{t('question.170')}}</van-button>
                                        </div>
                                    </template>
                                </van-field>
                            </van-form>
                        </div>
                    </van-popup>

                    <!-- 添加答案 -->
                    <van-popup v-model:show="state.popup_addAnswer" :lock-scroll="false" @close="closeAddAnswer" safe-area-inset-bottom :close-on-popstate="true" position="bottom" closeable close-icon="close" :style="{ height: '100%' }">
                        <div class="addAnswerModule">
                            <van-form :ref="'formAddAnswerRef'" :scroll-to-error="true" class="form-container">
                                <van-cell-group>
                                    <van-field center :error-message="error.content.get('addAnswer-'+state.questionId)">
                                        <template #input>
                                            <div v-show="!state.isAddAnswerMarkdown" style="width: 100%;">
                                                <van-sticky :z-index="1" >
                                                    <div ref="addAnswerContentEditorToolbarRef" class="editor-toolbar" style="padding-top: 13px;"></div>
                                                </van-sticky>
                                                <div ref="addAnswerContentEditorTextRef" :editorId="'addAnswer'" class="editor-text" style="min-height: 320px;"></div>
                                            </div>
                                            <div v-if="state.isAddAnswerMarkdown" style="width: 100%;" >
                                                <!-- placeholder="请输入内容..." -->
                                                <Editor mode="tab" :editorId="'addAnswer'" :value="state.addAnswerMarkdownContent" :plugins="state.addAnswerEditorPlugin" :locale="setMarkdownLanguage()" :sanitize="answerSanitize" :placeholder="t('question.160')" @change="handleAddAnswerMarkdownChange"/>
                                            </div>
                                        </template>
                                    </van-field>
                                    <!-- label="验证码" placeholder="请输入验证码" -->
                                    <van-field v-model="state.captchaValue['addAnswer-'+state.questionId]"  @change.native="checkCaptchaValueRules('addAnswer-'+state.questionId)" class="captcha-item captcha-input-left" :label="t('common.70')" :placeholder="t('common.120')" maxlength="4" center clearable v-if="state.showCaptcha.get('addAnswer-'+state.questionId)" :error-message="error.captchaValue.get('addAnswer-'+state.questionId)">
                                        <template #button>
                                            <van-image :src="state.imgUrl.get('addAnswer-'+state.questionId)" @click="replaceCaptcha('addAnswer-'+state.questionId)" class="captcha-image"/>
                                        </template>
                                        <template #extra >
                                            <!-- 换一幅 -->
                                            <span class="captcha-replace" @click="replaceCaptcha('addAnswer-'+state.questionId)">{{t('common.80')}}</span>
                                        </template>
                                    </van-field>

                                </van-cell-group>

                                <van-field center :error-message="error.answer.get('addAnswer-'+state.questionId)">
                                    <template #input>
                                        <div class="submitButton">
                                            <!-- 提交 -->
                                            <van-button round block type="primary" native-type="submit" @mousedown="onAddAnswerFormSubmit" :disabled="state.allowSubmit.get('addAnswer-'+state.questionId)">{{t('common.50')}}</van-button>
                                        </div>
                                    </template>
                                </van-field>
                            </van-form>
                        </div>
                    </van-popup>
                    <!-- 请求失败，点击重新加载 -->
                    <van-list v-model:loading="state.isLoading" :finished="state.isFinished" v-model:error="state.isError" :error-text="(state.question != null && Object.keys(state.question).length>0) ? t('question.180') : ''" finished-text="" @load="onLoad" >

                        <div class="answerList" v-if="state.answerList != null && state.answerList.length >0">
                            <!-- 延迟加载点赞 -->
                            <div class="item van-hairline--bottom" :class="[answer.adoption == true ? 'active' : '',router.currentRoute.value.query.reportModule !=undefined && parseInt(router.currentRoute.value.query.reportModule as string) == 50 && answer.id == router.currentRoute.value.query.answerId ? 'reportMark' : '']" v-for="(answer,index) in state.answerList" :key="answer.id"  :ref="'answer_'+answer.id" v-lazy-tag="()=>{onQueryLike(answer.id,50)}">
                                <div class="adoption" v-if="answer.adoption">
                                    <div class="ribbon-wrapper">
                                        <!-- 最佳答案-->
                                        <div class="ribbon">{{t('question.190')}}</div>
                                    </div>
                                </div>
                                <div class="top-container">
                                    <div class="left-layout">
                                        <router-link v-if="answer.account != null && answer.account != ''" tag="a" :to="{path:'/user/control/home',query: {userName: answer.userName}}">
                                            <span class="avatarImg">
                                                <img v-if="answer.avatarName != null" :src="answer.avatarPath+'100x100/'+answer.avatarName" class="img">

                                                <img v-if="answer.avatarName == null" :src="answer.avatar" class="img"/>
                                            </span>
                                        </router-link>
                                        <template v-if="answer.account == null || answer.account == ''">
                                            <span class="avatarImg">
                                                <img v-if="answer.avatarName == null" :src="answer.avatar" class="img"/>
                                            </span>
                                        </template>
                                    </div>
                                    <div class="middle-layout">
                                        <div class="userInfo">
                                            <span v-if="(answer.nickname == null || answer.nickname == '') && answer.account != null && answer.account != ''" class="account">{{answer.account}}</span>
                                            <span v-if="answer.nickname != null && answer.nickname != ''" class="account">{{answer.nickname}}</span>
                                            <span class="userRoleName" v-for="roleName in answer.userRoleNameList">{{roleName}}</span>
                                            <!-- 官方人员-->
                                            <span class="staff" v-if="answer.isStaff">{{t('question.20')}}</span>
                                            <!-- 已注销-->
                                            <div v-if="answer.account == null || answer.account == ''" class="cancelNickname">{{t('question.30')}}</div>
                                            <span class="time">
                                                {{answer.postTime}}<span v-if="answer.ipAddress != null && answer.ipAddress != ''"><span class="separate">·</span>{{answer.ipAddress}}</span>
                                                <a v-if="state.alreadyLikedAnswer.get(answer.id) != undefined && state.alreadyLikedAnswer.get(answer.id) == true">
                                                    <span class="separate">·</span><Icon name="heart-fill" :size="convertViewportWidth('13px')" class="like-icon" @click="deleteLike(answer.id,50)"/>
                                                    <span class="like-quantity-container">
                                                        <span class="like-quantity" v-if="state.answerLikeCount.get(answer.id) != undefined && Long.fromString(String(state.answerLikeCount.get(answer.id))).gte(1000000)">999K+</span>  <!--超过1000000显示999k+  -->
                                                        <span class="like-quantity" v-else-if="state.answerLikeCount.get(answer.id) != undefined && Long.fromString(String(state.answerLikeCount.get(answer.id))).gte(10000)">{{Math.floor(parseFloat(String(state.answerLikeCount.get(answer.id)))/1000)}}k</span> <!--向下取整  -->
                                                        <span class="like-quantity" v-else>{{state.answerLikeCount.get(answer.id) != undefined  && Long.fromString(String(state.answerLikeCount.get(answer.id))).gt(0) ? state.answerLikeCount.get(answer.id) : ''}}</span>
                                                    </span>
                                                </a>
                                                <a v-else >
                                                    <span class="separate">·</span><Icon name="heart" :size="convertViewportWidth('13px')" class="like-icon" @click="addLike(answer.id,50)"/>
                                                    <span class="like-quantity-container">
                                                        <span class="like-quantity" v-if="state.answerLikeCount.get(answer.id) != undefined && Long.fromString(String(state.answerLikeCount.get(answer.id))).gte(1000000)">999K+</span>  <!--超过1000000显示999k+  -->
                                                        <span class="like-quantity" v-else-if="state.answerLikeCount.get(answer.id) != undefined && Long.fromString(String(state.answerLikeCount.get(answer.id))).gte(10000)">{{Math.floor(parseFloat(String(state.answerLikeCount.get(answer.id)))/1000)}}k</span> <!--向下取整  -->
                                                        <span class="like-quantity" v-else>{{state.answerLikeCount.get(answer.id) != undefined  && Long.fromString(String(state.answerLikeCount.get(answer.id))).gt(0) ? state.answerLikeCount.get(answer.id) : ''}}</span>
                                                    </span>
                                                </a>

                                            </span>

                                        </div>

                                    </div>
                                    <div class="right-layout">
                                        <!-- {{calculateFloor(answer.id)}}楼-->
                                        <div class="floor" v-if="answer.adoption == false">{{t('question.200',{'p1': calculateFloor(answer.id)})}}</div>
                                        <div class="more active-more" v-if="onAnswerPopoverActions(answer).length >0">
                                            <van-popover v-model:show="state.showAnswerPopover[answer.id]" placement="left-start" :overlay="true" overlay-class="custom-popoverModule-overlay" :actions="onAnswerPopoverActions(answer)" @select="onAnswerPopoverSelect">
                                                <template #reference>
                                                    <van-icon name="ellipsis" :size="convertViewportWidth('16px')"/>
                                                </template>
                                            </van-popover>
                                        </div>
                                    </div>
                                </div>

                                <div class="bottom-container">
                                    <div :class="[answer.isMarkdown != null && answer.isMarkdown == true ? 'markdown-body-custom answerMarkdownContent' : 'answerContent']">
                                        <!-- 此用户账号已注销-->
                                        <div class="cancelAccount" v-if="answer.account == null || answer.account == ''">{{t('question.40')}}</div>


                                        <div :ref="'answerContent_'+answer.id">
                                            <RenderTemplate @click-onZoomPicture="onZoomPicture" @load-onLoadPicture="onLoadPicture" :html="answer.content"></RenderTemplate>

                                        </div>
                                    </div>

                                    <div class="replyList timeline" v-if="answer.answerReplyList != null && answer.answerReplyList.length >0">
                                        <!-- 延迟加载点赞 -->
                                        <div class="reply-container timeline-item" :class="[reply.friendUserName != null && reply.friendUserName != '' ? 'node-position':'',(reply.friendUserName != null && reply.friendUserName != '' && state.line.keys().next().value == reply.id) ? 'first-position':'']" v-for="(reply,index2) in answer.answerReplyList" :key="reply.id" v-show="state.replyExpandOrShrink.get(answer.id) || (state.replyExpandOrShrink.get(answer.id) == false && index2 <state.viewNumber)" :ref="'replyData_'+reply.id" v-lazy-tag="()=>{onQueryLike(reply.id,60)}">
                                            <div class="tail" v-if="state.line.get(reply.id)"></div>
                                            <div class="last-tail" v-if="state.dot.size >0 && [...state.dot][state.dot.size-1][0] == reply.id"></div>
                                            <div class="node node--normal"  v-if="state.dot.get(reply.id)"></div>
                                            <div class="replyItem van-hairline--top ">
                                                <div :class="router.currentRoute.value.query.reportModule !=undefined && parseInt(router.currentRoute.value.query.reportModule as string) == 60 && reply.id == router.currentRoute.value.query.replyId ? 'reply-reportMark' : ''">
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
                                                                <!--官方人员-->
                                                                <span class="staff" v-if="reply.isStaff">{{t('question.20')}}</span>
                                                                <!--已注销-->
                                                                <div v-if="reply.account == null || reply.account == ''" class="cancelNickname">{{t('question.30')}}</div>
                                                                <span class="time">{{reply.postTime}}
                                                                    <span v-if="reply.ipAddress != null && reply.ipAddress != ''"><span class="separate">·</span>{{reply.ipAddress}}</span>
                                                                    <a v-if="state.alreadyLikedAnswerReply.get(reply.id) != undefined && state.alreadyLikedAnswerReply.get(reply.id) == true" >
                                                                        <span class="separate">·</span><Icon name="heart-fill" :size="convertViewportWidth('13px')" class="like-icon" @click="deleteLike(reply.id,60)"/>
                                                                        <span class="like-quantity-container">
                                                                            <span class="like-quantity" v-if="state.answerReplyLikeCount.get(reply.id) != undefined && Long.fromString(String(state.answerReplyLikeCount.get(reply.id))).gte(1000000)">999K+</span>  <!--超过1000000显示999k+  -->
                                                                            <span class="like-quantity" v-else-if="state.answerReplyLikeCount.get(reply.id) != undefined && Long.fromString(String(state.answerReplyLikeCount.get(reply.id))).gte(10000)">{{Math.floor(parseFloat(String(state.answerReplyLikeCount.get(reply.id)))/1000)}}k</span> <!--向下取整  -->
                                                                            <span class="like-quantity" v-else>{{state.answerReplyLikeCount.get(reply.id) != undefined  && Long.fromString(String(state.answerReplyLikeCount.get(reply.id))).gt(0) ? state.answerReplyLikeCount.get(reply.id) : ''}}</span>
                                                                        </span>
                                                                    </a>
                                                                    <a v-else >
                                                                        <span class="separate">·</span><Icon name="heart" :size="convertViewportWidth('13px')" class="like-icon" @click="addLike(reply.id,60)"/>
                                                                        <span class="like-quantity-container">
                                                                            <span class="like-quantity" v-if="state.answerReplyLikeCount.get(reply.id) != undefined && Long.fromString(String(state.answerReplyLikeCount.get(reply.id))).gte(1000000)">999K+</span>  <!--超过1000000显示999k+  -->
                                                                            <span class="like-quantity" v-else-if="state.answerReplyLikeCount.get(reply.id) != undefined && Long.fromString(String(state.answerReplyLikeCount.get(reply.id))).gte(10000)">{{Math.floor(parseFloat(String(state.answerReplyLikeCount.get(reply.id)))/1000)}}k</span> <!--向下取整  -->
                                                                            <span class="like-quantity" v-else>{{state.answerReplyLikeCount.get(reply.id) != undefined  && Long.fromString(String(state.answerReplyLikeCount.get(reply.id))).gt(0) ? state.answerReplyLikeCount.get(reply.id) : ''}}</span>
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
                                                                        <!--已注销-->
                                                                        <span v-if="reply.friendAccount == null || reply.friendAccount == ''" class="cancelNickname">{{t('question.30')}}</span>
                                                                        <router-link tag="a" v-if="reply.friendAccount != null && reply.friendAccount != ''" class="userName" :to="{path:'/user/control/home',query: {userName: reply.friendUserName}}">
                                                                            <span v-if="reply.friendNickname != null && reply.friendNickname != ''">{{reply.friendNickname}}</span>
                                                                            <span v-if="reply.friendNickname == null || reply.friendNickname == ''">{{reply.friendAccount}}</span>
                                                                        </router-link>
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="replyContent" @click="clickReplyLevel(answer.id,reply.id)">
                                                            <!--此用户账号已注销-->
                                                            <div v-if="reply.account == null || reply.account == ''" class="cancelAccount">{{t('question.40')}}</div>
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
                                                                            <van-button round block type="primary" native-type="submit" @mousedown="onAddReplyFriend(answer.id,reply.id)" :disabled="state.allowSubmit.get('addReplyFriend-'+reply.id)">{{t('common.50')}}</van-button>
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
                                        <div class="link" v-if="answer.answerReplyList.length >state.viewNumber">
                                            <!--点击收缩-->
                                            <span @click="telescopicReply(answer.id);" v-if="state.replyExpandOrShrink.get(answer.id)">{{t('question.210')}}</span>
                                            <!--剩余{{answer.answerReplyList.length-state.viewNumber}}条-->
                                            <span @click="telescopicReply(answer.id);" v-else>{{t('question.220',{'p1': answer.answerReplyList.length-state.viewNumber})}}</span>
                                        </div>
                                    </div>

                                    <!-- 添加回复 -->
                                    <van-popup v-model:show="state.addReplyFormView[answer.id]" :lock-scroll="false" @close="closeAddReply" safe-area-inset-bottom :close-on-popstate="true" position="bottom" closeable close-icon="close" :style="{ height: '100%' }">
                                        <div :class="['addReplyModule','addReplyModule_lock_'+answer.id]">
                                            <van-form :scroll-to-error="true" class="form-container">

                                                 <van-field center :error-message="error.replyContent.get('addReply-'+answer.id)">
                                                    <template #input>
                                                        <div style="width: 100%;">
                                                            <van-sticky :z-index="1" >
                                                                <div :ref="'addReplyContentEditorToolbarRef_'+answer.id" class="editor-toolbar" style="padding-top: 13px;"></div>
                                                            </van-sticky>
                                                            <div :ref="'addReplyContentEditorTextRef_'+answer.id" :editorId="'addReply_'+answer.id" class="editor-text" style="min-height: 320px;"></div>
                                                        </div>
                                                    </template>
                                                </van-field>
                                                <!-- label="验证码" placeholder="请输入验证码" -->
                                                <van-field v-model="state.captchaValue['addReply-'+answer.id]"  @change.native="checkCaptchaValueRules('addReply-'+answer.id)" class="captcha-item captcha-input-left" :label="t('common.70')" :placeholder="t('common.120')" maxlength="4" center clearable v-if="state.showCaptcha.get('addReply-'+answer.id)" :error-message="error.captchaValue.get('addReply-'+answer.id)">
                                                    <template #button>
                                                        <van-image :src="state.imgUrl.get('addReply-'+answer.id)" @click="replaceCaptcha('addReply-'+answer.id)" class="captcha-image"/>
                                                    </template>
                                                    <template #extra >
                                                        <!-- 换一幅 -->
                                                        <span class="captcha-replace" @click="replaceCaptcha('addReply-'+answer.id)">{{t('common.80')}}</span>
                                                    </template>
                                                </van-field>

                                                <van-field :error-message="error.reply.get('addReply-'+answer.id)">
                                                    <template #input>
                                                        <div class="submitButton">
                                                            <!-- 提交 -->
                                                            <van-button round block type="primary" native-type="submit" @mousedown="onAddReply(answer.id)" :disabled="state.allowSubmit.get('addReply-'+answer.id)">{{t('common.50')}}</van-button>
                                                        </div>
                                                    </template>
                                                </van-field>
                                            </van-form>
                                        </div>
                                    </van-popup>
                                    <!-- 修改答案 -->
                                    <van-popup v-model:show="state.editAnswerFormView[answer.id]" :lock-scroll="false" @close="closeEditAnswer" safe-area-inset-bottom :close-on-popstate="true" position="bottom" closeable close-icon="close" :style="{ height: '100%' }">
                                        <div :class="['editAnswerModule','editAnswerModule_lock_'+answer.id]">
                                            <van-form :scroll-to-error="true" class="form-container">
                                                <van-field center :error-message="error.content.get('editAnswer-'+answer.id)">
                                                    <template #input>
                                                        <div v-show="!state.isEditAnswerMarkdownMap.get(answer.id)" style="width: 100%;">
                                                            <van-sticky :z-index="1" >
                                                                <div :ref="'editAnswerContentEditorToolbarRef_'+answer.id" class="editor-toolbar" style="padding-top: 13px;"></div>
                                                            </van-sticky>
                                                            <div :ref="'editAnswerContentEditorTextRef_'+answer.id" :editorId="'editAnswer_'+answer.id" class="editor-text" style="min-height: 320px;"></div>
                                                        </div>

                                                        <div v-if="state.isEditAnswerMarkdownMap.get(answer.id)" style="width: 100%;">
                                                             <!--placeholder="请输入内容..."-->
                                                            <Editor mode="tab" :editorId="'editAnswer_'+answer.id" :value="(state.editAnswerMarkdownContent[answer.id] as string)" :plugins="state.editAnswerEditorPlugin" :locale="setMarkdownLanguage()" :sanitize="answerSanitize" :placeholder="t('question.160')" @change="handleEditAnswerMarkdownChange($event,answer.id)"/>
                                                        </div>
                                                    </template>
                                                </van-field>
                                                <!-- label="验证码" placeholder="请输入验证码" -->
                                                <van-field v-model="state.captchaValue['editAnswer-'+answer.id]"  @change.native="checkCaptchaValueRules('editAnswer-'+answer.id)" class="captcha-item captcha-input-left" :label="t('common.70')" :placeholder="t('common.120')" maxlength="4" center clearable v-if="state.showCaptcha.get('editAnswer-'+answer.id)" :error-message="error.captchaValue.get('editAnswer-'+answer.id)">
                                                    <template #button>
                                                        <van-image :src="state.imgUrl.get('editAnswer-'+answer.id)" @click="replaceCaptcha('editAnswer-'+answer.id)" class="captcha-image"/>
                                                    </template>
                                                    <template #extra >
                                                        <!-- 换一幅 -->
                                                        <span class="captcha-replace" @click="replaceCaptcha('editAnswer-'+answer.id)">{{t('common.80')}}</span>
                                                    </template>
                                                </van-field>

                                                <van-field :error-message="error.answer.get('editAnswer-'+answer.id)">
                                                    <template #input>
                                                        <div class="submitButton">
                                                            <!-- 提交 -->
                                                            <van-button round block type="primary" native-type="submit" @mousedown="onEditAnswerFormSubmit(answer.id)" :disabled="state.allowSubmit.get('editAnswer-'+answer.id)">{{t('common.50')}}</van-button>
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
                                    <van-field center :error-message="error.reason" v-if="state.show_giveReason">
                                        <template #input>
                                            <div style="width: 100%;">
                                                <!-- placeholder="请填写举报理由" -->
                                                <van-field v-model="state.reason"  :placeholder="t('question.230')"  rows="3" type="textarea" autosize maxlength="500" show-word-limit/>
                                            </div>
                                        </template>
                                    </van-field>
                                </van-cell-group>

                                <van-uploader v-if="state.show_giveReason && state.reportMaxImageUpload >0" class="fileList" v-model="state.fileList" :before-read="beforeRead" :accept="'.jpg,.jpeg,.gif,.png,.bmp'">

                                </van-uploader>
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
                            <van-search v-model.trim="state.keyword" show-action maxlength="30" clearable :placeholder="t('question.240')" @search="searchMentionUser">
                                <template #action>
                                    <!-- 搜索 -->
                                    <van-button size="small" type="primary" @click="searchMentionUser">{{t('question.250')}}</van-button>
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
                <!--  相似问题 集合 -->
                <div class="likeQuestionModule" v-if="state.likeQuestionList != null && state.likeQuestionList.length >0">
                    <div class="likeQuestion">
                        <!-- 相关问题 -->
                        <div class="title van-hairline--bottom">{{t('question.260')}}</div>
                        <ul class="questionList">
                            <li class="question-title " v-for="likeQuestion in state.likeQuestionList">
                                <router-link tag="a" :to="{path: '/question', query:{ questionId : likeQuestion.id}}">
                                    {{likeQuestion.title}}
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
import {
  getCurrentInstance,
  ComponentInternalInstance,
  reactive,
  onMounted,
  nextTick,
  ref,
  watchEffect,
  onActivated,
  onUnmounted
} from 'vue'
    import pinia from '@/store/store'
    import {useStore} from '@/store'
    import { storeToRefs } from 'pinia';
    import { onBack } from '@/utils/history'
    import { convertViewportWidth } from '@/utils/px-to-viewport';
    import { onBeforeRouteLeave, onBeforeRouteUpdate, useRouter } from 'vue-router'
    import { AxiosResponse } from 'axios'
    import { Answer, AnswerReply, PageView, Question, ReportType, User } from "@/types/index";
    import { letterAvatar } from '@/utils/letterAvatar';
    import { escapeVueHtml,unescapeHtml } from '@/utils/escape';
    import { getLanguageClassName, getPageBasePath, processErrorInfo } from '@/utils/tool';
    import Prism from "prismjs";
    import { Dialog, Image as VanImage, ImagePreview, Notify } from 'vant';
    import Icon from "@/components/icon/Icon.vue";
    import { createEditor, destroyEditor } from '@/utils/editor';
    import { createJumpAttribute } from '@/utils/jumpProcess';
    import Long from "long";
    import mermaid from "mermaid";
    import katex from 'katex'
    import 'katex/dist/katex.css'
    import { markdownPlugins,sanitize, setMarkdownLanguage } from '@/utils/markdownEditor';

    import { toggleEditor } from '@/utils/markdownPlugin/plugin-toggle-editor';
    import { help } from '@/utils/markdownPlugin/plugin-help';
    import { emoji } from '@/utils/markdownPlugin/plugin-emoji';
    import { imageUpload } from '@/utils/markdownPlugin/plugin-image-upload';
    import { pasteImageUpload } from '@/utils/markdownPlugin/plugin-paste-image';
    import { Editor } from '@bytemd/vue-next'
    import type { BytemdPlugin,BytemdEditorContext } from 'bytemd'
    import { clearBodyLocks, lock } from 'tua-body-scroll-lock';
    import { mention } from '@/utils/markdownPlugin/plugin-mention';
    import { aiPopUp } from '@/components/aiAssistant/aiAssistantTool';
    import { ai } from '@/utils/markdownPlugin/plugin-ai';
    import { useI18n } from 'vue-i18n';
    import DPlayer from "dplayer";
    import Hls from "hls.js";
    import {nativeQueryVideoRedirect, nativeRefreshToken} from "@/utils/http";
import {notifyBackend} from "@/api/history";
    let { t } = useI18n();

    mermaid.mermaidAPI.initialize({ startOnLoad: false });

    const { proxy,appContext } = getCurrentInstance() as ComponentInternalInstance;
    const store = useStore(pinia);
    const router = useRouter();
    const {title:store_title,keywords:store_keywords,description:store_description,systemUser:store_systemUser,currentLanguage:store_currentLanguage} = storeToRefs(store)



    const appendQuestionContentEditorToolbarRef = ref();
    const appendQuestionContentEditorTextRef = ref();

    const placeholderVideo = ref();

    const addAnswerContentEditorToolbarRef = ref();
    const addAnswerContentEditorTextRef = ref();


    //html页元信息
    watchEffect(() => {
        let titleValue = store_title.value//监听网站标题

        if(titleValue != null && titleValue != '' && state.question != null && Object.keys(state.question).length > 0){
            document.title = (state.question.title != null ? state.question.title : '')+ ' - ' + titleValue;
            (document.getElementsByName('description')[0] as any).content  = (state.question.summary != null ? state.question.summary : '');
        }
    }, {
        flush: 'post'//在组件更新后触发，第一次运行需要组件渲染完成才执行
    })



    const state = reactive({
        questionId:'',
        question: {} as Question,
      playerIdList: [] as Array<string>,//视频播放Id列表
      playerObjectList: [] as Array<any>,//视频播放对象集合
      playerHlsList: [] as Array<any>,//视频播放流对象集合
      playerNodeList: [] as Array<any>,//视频节点对象集合
      placeholder_DPlayer:'' as any,//占位播放器
      lastPlayerId:'',//最后运行的播放Id

        showQuestionPopover :false,//问题气泡弹出框

        alreadyCollected :false,//用户是否已经收藏问题
        favoriteCount : 0,//问题用户收藏总数

        alreadyLiked:false,//用户是否已经点赞该问题
        likeCount : 0,//问题用户点赞总数
        alreadyLikedAnswer: new Map(),//用户是否已经点赞该答案
        answerLikeCount : new Map(),//答案用户点赞总数

        alreadyLikedAnswerReply: new Map(),//用户是否已经点赞该答案回复
        answerReplyLikeCount : new Map(),//答案回复用户点赞总数

        followText:t('question.270'),//关注文本  关注

        popup_mentionUser :false,//是否弹出选择提及用户表单
        keyword :'',//关键词
        mentionUserList:[] as Array<User>,//提及用户集合
        mentionUserEditorId:'',//提及用户编辑器Id
        currentMarkdownEditor:{} as BytemdEditorContext | undefined,//Markdown编辑器打开‘@提及’弹窗的编辑器对象

        appendQuestionFormView:false,//追加问题表单
        appendQuestionEditor :{} as any,//追加问题编辑器
        appendQuestionEditorCreateParameObject :{} as any,//追加问题编辑器的创建参数
        appendQuestionMarkdownContent:'',//追加问题markdown内容
        isAppendQuestionMarkdown:false,//追加问题是否使用markdown编辑器

        showAnswerPopover:{} as any,//答案气泡弹出框   key:答案Id value:是否显示  {答案Id-1 : 是否显示,答案Id-2 : 是否显示}
        showReplyPopover:{} as any,//回复气泡弹出框  key:回复Id value:是否显示  {回复Id-1 : 是否显示,回复Id-2 : 是否显示}
        answerList:[] as Array<Answer>,
        totalrecord : 0, //总记录数
        currentpage : 0, //当前页码
        totalpage : 1, //总页数
        maxresult: 12, //每页显示记录数

        viewNumber:2,//回复伸缩 展示数量
        initialPage : 0, //初始页码（当URL参数commentId有值时commentList的第一项页码数）

        replyExpandOrShrink :new Map(), //回复展开/收缩 map格式 key:答案Id value:是否展开
        allowAnswer:false,//是否显示答案表单
        availableTag:[] as Array<string>,//答案编辑器允许使用标签
        fileSystem:0,//文件存储系统
        supportEditor:10,//支持编辑器

        popup_addAnswer:false,//添加答案弹出窗口
        addAnswerEditor :{} as any,//添加答案编辑器
        addAnswerEditorCreateParameObject :{} as any,//添加答案编辑器的创建参数

        addAnswerMarkdownContent:'',//添加答案markdown内容
        isAddAnswerMarkdown:false,//添加答案是否使用markdown评论编辑器

        editAnswerFormView : {} as any,//修改答案表单  key:答案Id value:是否显示  key:答案Id value:是否显示  {答案Id-1 : 是否显示,答案Id-2 : 是否显示}
        editAnswerEditorMap:new Map(),//修改答案富文本编辑器集合 key:答案Id value:富文本编辑器
        editAnswerEditorCreateParameMap:new Map(),//修改答案编辑器的创建参数 key:答案Id value:编辑器参数对象

        isEditAnswerMarkdownMap: new Map(),//修改答案是否使用markdown编辑器  key:评论Id value:是否为markdown编辑器
        editAnswerMarkdownContent : {} as any,//修改答案markdown编辑内容 key:评论Id value:评论内容

        addReplyFormView : {} as any,//添加回复表单  key:评论Id value:是否显示  {评论Id-1 : 是否显示,评论Id-2 : 是否显示}
        addReplyEditorMap:new Map(),//添加回复富文本编辑器集合 key:评论Id value:富文本编辑器
        addReplyEditorCreateParameMap:new Map(),//添加回复编辑器的创建参数 key:评论Id value:编辑器参数对象

        editReplyFormView  : {} as any,//修改回复表单  key:回复Id value:是否显示  {回复Id-1 : 是否显示,回复Id-2 : 是否显示}
        editReplyEditorMap:new Map(),//修改回复富文本编辑器集合 key:回复Id value:富文本编辑器
        editReplyEditorCreateParameMap:new Map(),//修改回复编辑器的创建参数 key:回复Id value:编辑器参数对象

        addReplyFriendFormView : {} as any,//添加回复对方表单  key:回复Id value:是否显示  {回复Id-1 : 是否显示,回复Id-2 : 是否显示}
        addReplyFriendEditorMap:new Map(),//添加回复对方富文本编辑器集合 key:回复Id value:富文本编辑器
        addReplyFriendEditorCreateParameMap:new Map(),//添加回复对方编辑器的创建参数 key:回复Id value:编辑器参数对象



        showCaptcha:new Map<string,boolean>(),//是否显示验证码  本项及以下几项的key格式为 key:模块+id  例如：添加答案key=addAnswer-问题Id   修改评论key=editAnswer-答案Id  添加回复key=addReply-评论Id   修改回复key=editReply-回复Id
        captchaKey: new Map<string,string>(),//验证码key
        captchaValue: {} as any,//验证码值
        imgUrl: new Map<string,string>(),//验证码图片
        allowSubmit:new Map<string,boolean>(),//提交按钮disabled状态

        likeQuestionList:[] as Array<Question>, //相似问题集合

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

        isRefreshing:false,//是否处于下拉加载中状态
        isError:false,//是否列表数据加载失败
        isLoading:false,//是否处于加载中状态
        isFinished:false,//是否加载完毕
        isQuestionSkeleton:true,//是否显示问题骨架屏
        isAnswerSkeleton:true,//是否显示答案骨架屏
        isShowPage:false,//是否显示分页


        appendQuestionEditorPlugin:[] as BytemdPlugin[],//追加问题Markdown编辑器插件
        addAnswerEditorPlugin:[] as BytemdPlugin[],//添加答案Markdown编辑器插件
        editAnswerEditorPlugin:[] as BytemdPlugin[],//修改答案Markdown编辑器插件
    });



    //下拉刷新时触发
    const onRefresh = () => {
        state.isRefreshing = false;

        state.question = {} as Question;
      state.playerIdList.length = 0;//视频播放Id列表
      state.playerObjectList.length = 0;//视频播放对象集合
      state.playerHlsList.length = 0;//视频播放流对象集合
      state.playerNodeList.length = 0;//视频节点对象集合
      state.placeholder_DPlayer = '';//占位播放器
      state.lastPlayerId = '';//最后运行的播放Id
        state.showQuestionPopover = false;//问题气泡弹出框

        state.alreadyCollected = false;//用户是否已经收藏问题
        state.favoriteCount = 0;//问题用户收藏总数

        state.alreadyLiked = false;//用户是否已经点赞该问题
        state.likeCount = 0;//问题用户点赞总数
        state.alreadyLikedAnswer.clear();//用户是否已经点赞该答案
        state.answerLikeCount.clear();//答案用户点赞总数

        state.alreadyLikedAnswerReply.clear();//用户是否已经点赞该答案回复
        state.answerReplyLikeCount.clear();//答案回复用户点赞总数

        state.followText = t('question.270');//关注文本  关注

        state.popup_mentionUser =false;//是否弹出选择提及用户表单
        state.keyword ='';//关键词
        state.mentionUserList.length= 0;//提及用户集合
        state.mentionUserEditorId='';//提及用户编辑器Id
        state.currentMarkdownEditor = {} as BytemdEditorContext | undefined,//Markdown编辑器打开‘@提及’弹窗的编辑器对象

        state.appendQuestionFormView = false;//追加问题表单
        state.appendQuestionEditor = {} as any;//追加问题编辑器
        state.appendQuestionEditorCreateParameObject = {};//追加问题编辑器的创建参数
        state.appendQuestionMarkdownContent='';//追加问题markdown内容
        state.isAppendQuestionMarkdown =false;//追加问题是否使用markdown编辑器

        state.showAnswerPopover = {} as any;//答案气泡弹出框   key:答案Id value:是否显示  {答案Id-1 : 是否显示,答案Id-2 : 是否显示}
        state.showReplyPopover = {} as any;//回复气泡弹出框  key:回复Id value:是否显示  {回复Id-1 : 是否显示,回复Id-2 : 是否显示}
        state.answerList.length = 0;
        state.totalrecord = 0; //总记录数
        state.currentpage = 0; //当前页码
        state.totalpage = 1; //总页数
        state.maxresult = 12;//每页显示记录数

        state.viewNumber = 2;//回复伸缩 展示数量
        state.initialPage = 0; //初始页码（当URL参数commentId有值时commentList的第一项页码数）

        state.replyExpandOrShrink.clear(); //回复展开/收缩 map格式 key:答案Id value:是否展开
        state.allowAnswer = false;//是否显示答案表单
        state.availableTag.length = 0;//答案编辑器允许使用标签
        state.fileSystem = 0;//文件存储系统
        state.supportEditor = 10;//支持编辑器

        state.popup_addAnswer = false;//添加答案弹出窗口
        state.addAnswerEditor = {} as any;//添加答案编辑器
        state.addAnswerEditorCreateParameObject = {} as any;//添加答案编辑器的创建参数

        state.addAnswerMarkdownContent='';//添加答案markdown内容
        state.isAddAnswerMarkdown = false;//添加答案是否使用markdown评论编辑器

        state.editAnswerFormView = {} as any;//修改答案表单  key:答案Id value:是否显示  key:答案Id value:是否显示  {答案Id-1 : 是否显示,答案Id-2 : 是否显示}
        state.editAnswerEditorMap.clear();//修改答案富文本编辑器集合 key:答案Id value:富文本编辑器
        state.editAnswerEditorCreateParameMap.clear();//修改答案编辑器的创建参数 key:答案Id value:编辑器参数对象

        state.isEditAnswerMarkdownMap.clear();//修改答案是否使用markdown编辑器  key:评论Id value:是否为markdown编辑器
        state.editAnswerMarkdownContent = {} as any;//修改答案markdown编辑内容 key:评论Id value:评论内容

        state.addReplyFormView = {} as any;//添加回复表单  key:评论Id value:是否显示  {评论Id-1 : 是否显示,评论Id-2 : 是否显示}
        state.addReplyEditorMap.clear();//添加回复富文本编辑器集合 key:评论Id value:富文本编辑器
        state.addReplyEditorCreateParameMap.clear();//添加回复编辑器的创建参数 key:评论Id value:编辑器参数对象

        state.editReplyFormView = {} as any;//修改回复表单  key:回复Id value:是否显示  {回复Id-1 : 是否显示,回复Id-2 : 是否显示}
        state.editReplyEditorMap.clear();//修改回复富文本编辑器集合 key:回复Id value:富文本编辑器
        state.editReplyEditorCreateParameMap.clear();//修改回复编辑器的创建参数 key:回复Id value:编辑器参数对象

        state.addReplyFriendFormView = {} as any;//添加回复对方表单  key:回复Id value:是否显示  {回复Id-1 : 是否显示,回复Id-2 : 是否显示}
        state.addReplyFriendEditorMap.clear();//添加回复对方富文本编辑器集合 key:回复Id value:富文本编辑器
        state.addReplyFriendEditorCreateParameMap.clear();//添加回复对方编辑器的创建参数 key:回复Id value:编辑器参数对象


        state.showCaptcha.clear();//是否显示验证码  本项及以下几项的key格式为 key:模块+id  例如：添加答案key=addAnswer-问题Id   修改评论key=editAnswer-答案Id  添加回复key=addReply-评论Id   修改回复key=editReply-回复Id
        state.captchaKey.clear();//验证码key
        state.captchaValue = {} as any;//验证码值
        state.imgUrl.clear();//验证码图片
        state.allowSubmit.clear();//提交按钮disabled状态

        state.likeQuestionList.length = 0;//相似问题集合

        state.friendUser = '';//对方用户
        state.line.clear();//楼中楼的线  key:回复Id value:是否显示
        state.dot.clear();//楼中楼的点  key:回复Id value:是否显示

        state.appendQuestionEditorPlugin.length = 0;//追加问题Markdown编辑器插件
        state.addAnswerEditorPlugin.length = 0;//添加答案Markdown编辑器插件
        state.editAnswerEditorPlugin.length = 0;//修改答案Markdown编辑器插件

        state.isError = false;//是否列表数据加载失败
        state.isFinished = false;

        state.isLoading = true;//手动触发查询数据需将'加载状态结束'设为true
        init();
        queryAnswerList(state.questionId,'', '', state.currentpage+1);
    };

    //错误
    const error = reactive({
        appendQuestionContent: '',
		question: '',
        content : new Map<string,string>(),//答案内容错误
        replyContent: new Map<string,string>(),//回复内容错误
        captchaValue : new Map<string,string>(),
        answer: new Map<string,string>(),//答案错误
        reply: new Map<string,string>(),//回复错误
        reportTypeId:'',//举报分类Id
        reason:'',//举报理由
        image:'',//举报图片
        report:'',//举报

        keyword :'',
    })


     //处理追加问题Markdown
     const handleAppendQuestionMarkdownChange = (value: string) => {
        state.appendQuestionMarkdownContent = value;
    }

    //追加问题白名单
    const appendQuestionSanitize = (schema: any) => {
        schema = sanitize(schema);
        return schema;
    }

    //追加问题处理切换到富文本编辑器
    const handleAppendQuestionToggleRichtextEditor = (editorId: string) => {
        state.isAppendQuestionMarkdown = false;
        nextTick(()=>{
            if (Object.keys(state.appendQuestionEditorCreateParameObject).length != 0) {//不等于空
                //创建富文本编辑器
                state.appendQuestionEditor = createEditor(
                    state.appendQuestionEditorCreateParameObject.toolbarRef,
                    state.appendQuestionEditorCreateParameObject.textRef,
                    state.appendQuestionEditorCreateParameObject.editorIconList,
                    getPageBasePath()+'common/default/',
                    state.appendQuestionEditorCreateParameObject.uploadPath,
                    state.appendQuestionEditorCreateParameObject.userGradeList,
                    state.fileSystem,
                    ()=>{
                        handleAppendQuestionToggleMarkdownEditor(editorId);
                    },
                    ()=>{
                        mentionPopUp(editorId,undefined)
                    },
                    ()=>{
                        //AI弹窗
                        aiPopUp(proxy,appContext,editorId,state.appendQuestionEditorCreateParameObject.uploadPath,'file',state.fileSystem,state.isAppendQuestionMarkdown,state.appendQuestionEditor,undefined)
                    }
                );
                state.appendQuestionEditor.txt.html(state.appendQuestionEditorCreateParameObject.html);//切换时设置富文本内容
            }
        })


    }

    //追加问题处理切换到Markdown编辑器
    const handleAppendQuestionToggleMarkdownEditor = (editorId: string) => {

        if (Object.keys(state.appendQuestionEditor).length != 0) {//不等于空
            state.appendQuestionEditorCreateParameObject.html = state.appendQuestionEditor.txt.html();//切换时保存富文本内容
			destroyEditor(state.appendQuestionEditor);
            state.appendQuestionEditor = {};
		}
        state.isAppendQuestionMarkdown = true;
    }




    //处理添加答案Markdown
    const handleAddAnswerMarkdownChange = (value: string) => {
        state.addAnswerMarkdownContent = value;
    }

    //答案白名单
    const answerSanitize = (schema: any) => {
        schema = sanitize(schema);
        return schema;
    }


     //处理添加答案切换到富文本编辑器
     const handleAddAnswerToggleRichtextEditor = (editorId: string) => {
        state.isAddAnswerMarkdown = false;
        nextTick(()=>{

            if (Object.keys(state.addAnswerEditorCreateParameObject).length != 0) {//不等于空
                //创建富文本编辑器
                state.addAnswerEditor = createEditor(
                    state.addAnswerEditorCreateParameObject.toolbarRef,
                    state.addAnswerEditorCreateParameObject.textRef,
                    state.addAnswerEditorCreateParameObject.editorIconList,
                    getPageBasePath()+'common/default/',
                    state.addAnswerEditorCreateParameObject.uploadPath,
                    state.addAnswerEditorCreateParameObject.userGradeList,
                    state.fileSystem,
                    ()=>{
                        handleAddAnswerToggleMarkdownEditor(editorId);
                    },
                    ()=>{
                        mentionPopUp(editorId,undefined)
                    },
                    ()=>{
                        //AI弹窗
                        aiPopUp(proxy,appContext,editorId,state.addAnswerEditorCreateParameObject.uploadPath,'file',state.fileSystem,state.isAddAnswerMarkdown, state.addAnswerEditor,undefined)
                    }
                );
                state.addAnswerEditor.txt.html(state.addAnswerEditorCreateParameObject.html);//切换时设置富文本内容
            }
        })
    }

    //处理添加答案切换到Markdown编辑器
    const handleAddAnswerToggleMarkdownEditor = (editorId: string) => {
        if (Object.keys(state.addAnswerEditor).length != 0) {//不等于空
            state.addAnswerEditorCreateParameObject.html = state.addAnswerEditor.txt.html();//切换时保存富文本内容
            destroyEditor(state.addAnswerEditor);
            state.addAnswerEditor = {};
        }
        state.isAddAnswerMarkdown = true;
    }



    //处理修改答案Markdown
    const handleEditAnswerMarkdownChange = (value: string, answerId: string) => {
       Object.assign(state.editAnswerMarkdownContent, {[answerId] : value});
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

       if(forum == 'appendQuestion'){//追加问题
            if(state.isAppendQuestionMarkdown){//是否使用markdown编辑器
                state.currentMarkdownEditor?.editor.replaceSelection(`${title}`);
            }else{
                state.appendQuestionEditor.txt.insertMention(title, url);
            }
        }else if(forum == 'addAnswer'){//添加答案
            if(state.isAddAnswerMarkdown){//是否使用markdown编辑器
                state.currentMarkdownEditor?.editor.replaceSelection(`${title}`);
            }else{
                state.addAnswerEditor.txt.insertMention(title, url);
            }
        }else if(forum == 'editAnswer'){//修改答案
            let answerId:string = state.mentionUserEditorId.split("_")[1];//Id

            if(state.isEditAnswerMarkdownMap.get(answerId)!= undefined && state.isEditAnswerMarkdownMap.get(answerId) == true){//修改评论是否使用markdown编辑器  key:评论Id value:是否为markdown编辑器
                state.currentMarkdownEditor?.editor.replaceSelection(`${title}`);
            }else{
                let editor = state.editAnswerEditorMap.get(answerId);
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
           error.keyword = t('question.280');//请输入用户账号或呢称
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
                       error.keyword = t('question.290');//当前用户不存在
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
        let answerId = router.currentRoute.value.query.answerId != undefined ?router.currentRoute.value.query.answerId as string :'';
        let replyId = router.currentRoute.value.query.replyId != undefined ?router.currentRoute.value.query.replyId as string :'';


        if(answerId != '' && state.currentpage == 0){
            queryAnswerList(state.questionId,answerId, replyId, undefined);
        }else{
            queryAnswerList(state.questionId,'', '', state.currentpage+1);
        }
    }




    //查询问题
    const queryQuestion = (questionId: string,callback :any) => {
        proxy?.$axios({
            url: '/question',
            method: 'get',
            params:  {
                questionId: questionId,
            },
            showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
            showErrorMessage:false,// 是否显示错误提示
        })
        .then((response: AxiosResponse) => {
            return response?.data
        })
        .then((data: Question) => {
            if(data){

                state.isQuestionSkeleton = false;//关闭骨架屏
                //清空播放器
                clearVideoPlayer();
                //处理自定义标签
                let contentNode = document.createElement("div");
                contentNode.innerHTML = data.content;
                bindNode(contentNode);

                data.content = escapeVueHtml(contentNode.innerHTML);

                if(data.appendQuestionItemList != null && data.appendQuestionItemList.length >0){
                    for(let i=0; i<data.appendQuestionItemList.length; i++){
                        let appendQuestionItem = data.appendQuestionItemList[i];

                        //处理图片放大标签
                        let contentNode2 = document.createElement("div");
                        contentNode2.innerHTML = appendQuestionItem.content;
                        bindNode(contentNode2);
                        appendQuestionItem.content = escapeVueHtml(contentNode2.innerHTML);
                    }

                }


                state.question = data;

                if(state.question.nickname != null && state.question.nickname !=''){
                    state.question.avatar = letterAvatar(state.question.nickname, 70);
                }else{
                    state.question.avatar = letterAvatar(state.question.account, 70);
                }


                nextTick(()=>{
                  setTimeout(function() {
                    renderVideoPlayer();//渲染视频播放器
                  }, 30);
                    //渲染代码
                    let questionRefValue = proxy?.$refs['question_'+state.questionId];
                    if(questionRefValue != undefined){
                        renderBindNode(questionRefValue);
                    }
                    if(data.appendQuestionItemList != null && data.appendQuestionItemList.length >0){
                        for(let i=0; i<data.appendQuestionItemList.length; i++){
                            let appendQuestionItem = data.appendQuestionItemList[i];

                            let appendQuestionRefValue = (proxy?.$refs['appendQuestion_'+appendQuestionItem.id] as any);
                            if(appendQuestionRefValue != undefined){
                                renderBindNode(appendQuestionRefValue[0]);
                            }
                        }

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

    //查询上一页答案
    const queryPreviousAnswerList = (questionId: string, page:number|undefined) => {
        let params = {} as any;
        params.questionId = questionId;
        if(page != undefined && page >0){
            params.page = page;
        }

        proxy?.$axios({
            url: '/queryAnswerList',
            method: 'get',
            params:  params,
            showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
            showErrorMessage:false,// 是否显示错误提示
        })
        .then((response: AxiosResponse) => {
            return response?.data
        })
        .then((data: PageView<Answer>) => {
            state.isAnswerSkeleton = false;//关闭骨架屏

            if(data.records != null && data.records.length >0){
                //处理答案数据
                processAnswerData(data);


                for (let i:number = data.records.length - 1; i >= 0; i--) { // 倒序
                    let answer = data.records[i];
                    state.answerList.unshift(answer);
                }
                state.initialPage = state.initialPage-1; //初始页码
            }


            state.isShowPage = true;//显示分页栏


            nextTick(()=>{
                if(data.records != null && data.records.length > 0){
                    for (let i = 0; i <data.records.length; i++) {
                        let answer = data.records[i];
                        let answerRefValue =  (proxy?.$refs['answerContent_'+answer.id] as any);
                        if(answerRefValue != undefined){
                            renderBindNode(answerRefValue[0]);
                        }

                    }
                }
            })
        })
        .catch((error: any) =>{
            console.log(error);
        });
    }

    //查询答案列表
    const queryAnswerList = (questionId: string,answerId: string, replyId: string, page:number|undefined) => {
        let params = {} as any;
        params.questionId = questionId;
        if(answerId != null && answerId != ''){
            params.answerId = answerId;
        }
        if(page != undefined){
            params.page = page;
        }

        proxy?.$axios({
            url: '/queryAnswerList',
            method: 'get',
            params:  params,
            showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
            showErrorMessage:false,// 是否显示错误提示
        })
        .then((response: AxiosResponse) => {
            return response?.data
        })
        .then((data: PageView<Answer>) => {
            state.isAnswerSkeleton = false;//关闭骨架屏

            if(data.records != null && data.records.length >0){
                processAnswerData(data);
                state.answerList.push.apply(state.answerList,data.records);
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
                        let answer = data.records[i];
                        let answerRefValue =  (proxy?.$refs['answerContent_'+answer.id] as any);
                        if(answerRefValue != undefined){
                            renderBindNode(answerRefValue[0]);
                        }

                    }
                }

                //跳转到锚点
                nextTick(()=>{
                    //跳转到答案
                    if(answerId != null && answerId != '' && (replyId == null || replyId == '')){

                        let answerRef = (proxy?.$refs['answer_'+answerId] as any);
                        if(answerRef !=undefined){
                            let answerRefValue = answerRef[0];
                            window.scrollTo(0,answerRefValue.getBoundingClientRect().top-40);

                        }
                    }
                    //跳转到回复
                    if(replyId != null && replyId != ''){
                        if (state.answerList != null && state.answerList.length > 0) {
                            for(var i=0;i<state.answerList.length; i++){
                                var answer = state.answerList[i];
                                if(answer.answerReplyList != null && answer.answerReplyList.length > 0){
                                    for(var j=0;j<answer.answerReplyList.length; j++){
                                        var reply = answer.answerReplyList[j];
                                        if(reply.id==replyId && j >=state.viewNumber){//如果在收缩层
                                            telescopicReply(answer.id);//展开
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

    //处理答案数据
    const processAnswerData = (data: PageView<Answer>) => {
        for(let i:number=0; i<data.records.length; i++){
            let answer = data.records[i];
            state.replyExpandOrShrink.set(answer.id, false); //是否展开
            if(answer.nickname != null && answer.nickname !=''){
                answer.avatar = letterAvatar(answer.nickname, 60);
            }else{
                answer.avatar = letterAvatar(answer.account, 60);
            }

            if(answer.answerReplyList != null && answer.answerReplyList.length >0){
                for(let j:number=0; j<answer.answerReplyList.length; j++){
                    let reply = answer.answerReplyList[j];
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


            //处理图片放大标签
            let contentNode = document.createElement("div");
            contentNode.innerHTML = answer.content;
            bindNode(contentNode);
            answer.content = escapeVueHtml(contentNode.innerHTML);

        }
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
                            childNode.setAttribute("data-prismjs-copy",t('question.300'));//复制
                            childNode.setAttribute("data-prismjs-copy-error",t('question.310'));//按Ctrl+C复制
                            childNode.setAttribute("data-prismjs-copy-success",t('question.320'));//复制成功



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
                        childNode.setAttribute("data-prismjs-copy",t('question.300'));//复制
                        childNode.setAttribute("data-prismjs-copy-error",t('question.310'));//按Ctrl+C复制
                        childNode.setAttribute("data-prismjs-copy-success",t('question.320'));//复制成功


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
    const calculateFloor = (answerId:string) => {
        if(state.answerList != null && state.answerList.length >0){
            for(let i:number=0; i<state.answerList.length; i++){
                let answer = state.answerList[i];

                if(answer.id == answerId){
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
    //问题气泡弹出框菜单选项
    const onQuestionPopoverActions = (question:Question) => {
        let actions = new Array()
        if(state.question.userName == store_systemUser.value.userName){
            actions.push({ text: t('question.330'), questionId:question.id});//追加
        }
        if(store_systemUser.value != null && Object.keys(store_systemUser.value).length >0){
            actions.push({ text: t('question.340'), questionId:question.id});//举报
        }
        return actions;
    }



    //问题气泡弹出框选择
    const onQuestionPopoverSelect = (action:any) => {
        if(action.text == t('question.330')){//追加
            appendQuestionUI(action.questionId);
        }
        if(action.text == t('question.340')){//举报
            addReportUI(action.questionId,40);
        }
    }
    //清除答案列表
    const clearAnswerList = () => {
        state.answerList.length =0;
        state.isFinished = false;
        state.line.clear();//楼中楼的线  key:回复Id value:是否显示
        state.dot.clear();//楼中楼的点  key:回复Id value:是否显示

        for (const [key, value] of Object.entries(state.editAnswerEditorMap)){
            if(value != null){
                destroyEditor(value);
            }
        }
        state.editAnswerEditorMap.clear();
        state.editAnswerEditorCreateParameMap.clear();

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

     //答案气泡弹出框菜单选项
     const onAnswerPopoverActions = (answer:Answer) => {
        let actions = new Array()
        if(store_systemUser.value != null && Object.keys(store_systemUser.value).length>0){
            if(state.alreadyLikedAnswer.get(answer.id) != undefined && state.alreadyLikedAnswer.get(answer.id) == true){
                actions.push({ text: t('question.80'), answer:answer});//已赞
            }else{
                actions.push({ text: t('question.350'), answer:answer});//点赞
            }
            if(state.question.userName ==  store_systemUser.value.userName && Long.fromString(state.question.adoptionAnswerId).eq(0)){
                actions.push({ text: t('question.360'), answerId:answer.id});//采纳
            }

            actions.push({ text: t('question.370'), answerId:answer.id});//回复
            actions.push({ text: t('question.340'), answerId:answer.id});//举报
            if(answer.userName ==  store_systemUser.value.userName){
                actions.push({ text: t('question.380'),answer:answer});//编辑
                actions.push({ text: t('question.390'), answerId:answer.id});//删除
            }
        }
        return actions;
    }



    //答案气泡弹出框选择
    const onAnswerPopoverSelect = (action:any) => {
        if(action.text == t('question.350')){//点赞
            addLike(action.answer.id,50)
            queryAlreadyLiked(action.answer.id,50);
            queryLikeCount(action.answer.id,50);
        }else if(action.text == t('question.80')){//已赞
            deleteLike(action.answer.id,50)
            queryAlreadyLiked(action.answer.id,50);
            queryLikeCount(action.answer.id,50);
        }else if(action.text == t('question.360')){//采纳
            adoptionAnswer(action.answerId);
        }else if(action.text == t('question.370')){//回复
            //添加回复表单
            addReplyUI(action.answerId);
        }else if(action.text == t('question.340')){//举报
            addReportUI(action.answerId,50);
        }else if(action.text == t('question.380')){//编辑
            editAnswerUI(action.answer)
        }else if(action.text == t('question.390')){//删除
            onDeleteAnswer(action.answerId);
        }
    }

     //回复气泡弹出框菜单选项
     const onReplyPopoverActions = (reply:AnswerReply) => {
        let actions = new Array()

        if(store_systemUser.value != null && Object.keys(store_systemUser.value).length>0){


            if(state.alreadyLikedAnswerReply.get(reply.id) != undefined && state.alreadyLikedAnswerReply.get(reply.id) == true){
                actions.push({ text: t('question.80'), reply:reply});//已赞
            }else{
                actions.push({ text: t('question.350'), reply:reply});//点赞
            }


            //actions.push({ text: '点赞', reply:reply,icon:'add-o'});
            actions.push({ text: t('question.370'), reply:reply});//回复
            if(reply.userName ==  store_systemUser.value.userName){
                actions.push({ text: t('question.380'), reply:reply});//编辑
            }
            actions.push({ text: t('question.340'), replyId:reply.id});//举报
            if(reply.userName ==  store_systemUser.value.userName){
                actions.push({ text: t('question.390'), answerId :reply.answerId,replyId:reply.id});//删除
            }
        }

        return actions;
    }



    //回复气泡弹出框选择
    const onReplyPopoverSelect = (action:any) => {
        if(action.text == t('question.350')){//点赞
            addLike(action.reply.id,60)
            queryAlreadyLiked(action.reply.id,60);
            queryLikeCount(action.reply.id,60);
        }else if(action.text == t('question.80')){//已赞
            deleteLike(action.reply.id,60)
            queryAlreadyLiked(action.reply.id,60);
            queryLikeCount(action.reply.id,60);
        }else if(action.text == t('question.370')){//回复
            addReplyFriendUI(action.reply);
        }else if(action.text == t('question.340')){//举报
            addReportUI(action.replyId,60);
        }else if(action.text == t('question.380')){//编辑
            editReplyUI(action.reply)
        }else if(action.text == t('question.390')){//删除
            onDeleteReply(action.answerId,action.replyId);
        }
    }

     //展示/隐藏回复
     const telescopicReply = (answerId:string) => {
        let status = state.replyExpandOrShrink.get(answerId);
        if(status){
            state.replyExpandOrShrink.set(answerId, false); //收缩
        }else{
            state.replyExpandOrShrink.set(answerId, true); //伸展
        }
    }

    //查询是否已经关注该用户
    const queryFollowing = (userName:string) => {
        //清空信息
        state.followText = t('question.270');//关注

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
                    state.followText = t('question.400');//已关注
                }
            }
        }).catch((error: any) =>{
            console.log(error);
        });
    }
    //添加关注
    const addFollow = (userName:string) => {
        if(state.followText ==t('question.270')){//关注
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
                        state.followText =t('question.400')//已关注
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
    const addFavorite = (questionId:string) => {
        if(store_systemUser.value == null || Object.keys(store_systemUser.value).length==0){
            Notify({
                type: 'warning',
                message: t('question.410')//请先登录再加入收藏
            });
            return;
        }
        if(state.alreadyCollected){
            return;
        }

        let formData = new FormData();
        formData.append('questionId', questionId);

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
                        message: t('question.420')//加入收藏成功
                    });
                    queryAlreadyCollected(questionId);
                    queryFavoriteCount(questionId);

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
    //用户是否已经收藏问题
    const queryAlreadyCollected = (questionId:string) => {
        proxy?.$axios({
            url: '/queryAlreadyFavoriteQuestion',
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
                state.alreadyCollected = JSON.parse(data)

            }

        })
        .catch((error: any) =>{
            console.log(error);
        });
    }
    //查询问题用户收藏总数
    const queryFavoriteCount = (questionId:string) => {
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
                state.favoriteCount = count;
            }
        })
        .catch((error: any) =>{
            console.log(error);
        });
    }
    //删除收藏
    const deleteFavorite = (questionId: string) => {
        proxy?.$axios({
            url: '/user/control/deleteFavorite',
            method: 'post',
            params:  {
                questionId: questionId,
            },
        })
        .then((response: AxiosResponse) => {
            if(response){
                const result: any = response.data;

                if(JSON.parse(result.success)){//成功
                    Notify({
                        type: 'success',
                        message: t('question.430')//取消收藏成功
                    });
                    queryAlreadyCollected(questionId);
                    queryFavoriteCount(questionId);
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
                message: t('question.440')//请先登录再点赞
            });
            return;
        }
        if(module == 40){
            if(state.alreadyLiked){
                return;
            }
        }else if(module == 50){
            if(state.alreadyLikedAnswer.get(itemId)){
                return;
            }
        }else if(module == 60){
            if(state.alreadyLikedAnswerReply.get(itemId)){
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
                        message: t('question.450')//点赞成功
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
    //用户是否已经点赞问题
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
                if(module == 40){
                    state.alreadyLiked = JSON.parse(data);
                }else if(module == 50){
                    state.alreadyLikedAnswer.set(itemId,JSON.parse(data))
                }else if(module == 60){
                    state.alreadyLikedAnswerReply.set(itemId,JSON.parse(data))
                }

            }

        })
        .catch((error: any) =>{
            console.log(error);
        });
    }
    //查询问题用户点赞总数
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
                if(module == 40){
                    state.likeCount = count;
                }else if(module == 50){
                    state.answerLikeCount.set(itemId,count)
                }else if(module == 60){
                    state.answerReplyLikeCount.set(itemId,count)
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
                        message: t('question.460')//取消点赞成功
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

    //追加问题表单
    const appendQuestionUI = (questionId: string) => {

        let _key =  "appendQuestion-"+questionId;

        if(store_systemUser.value == null || Object.keys(store_systemUser.value).length==0){
            return;
        }



        state.allowSubmit.set(_key,true);//提交按钮disabled状态

        proxy?.$axios({
            url: '/user/queryAppendQuestion',
            method: 'get',
            params:  {
                questionId: questionId
            },
            showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
        })
        .then((response: AxiosResponse) => {
            if(response){
                let data =  response.data;
                if(data.allowQuestion){
                    state.appendQuestionFormView = true;
                    nextTick(()=>{
                         //锁定滚动层
                        lock(document.querySelector('.appendQuestionModule') as any)
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
                        if(data.supportEditor == 20 || data.supportEditor == 40){//支持编辑器 10.仅富文本编辑器 20.仅Markdown编辑器  30.富文本编辑器优先 40.Markdown编辑器优先
                            state.isAppendQuestionMarkdown = true;
                        }
                        let uploadPath = "user/control/question/upload";

                        if(state.appendQuestionEditorPlugin != null && state.appendQuestionEditorPlugin.length ==0){
                            //添加插件
                            state.appendQuestionEditorPlugin.push(...markdownPlugins());


                            if(state.supportEditor == 30 || state.supportEditor == 40){//10.仅富文本编辑器 20.仅Markdown编辑器  30.富文本编辑器优先 40.Markdown编辑器优先
                                state.appendQuestionEditorPlugin.push(
                                    toggleEditor((editorId: string)=>{handleAppendQuestionToggleRichtextEditor(editorId)})
                                );
                            }


                            if(editorIconList?.indexOf('image') != -1){
                                state.appendQuestionEditorPlugin.push(
                                    imageUpload("user/control/question/upload?method=upload",'file',state.fileSystem)
                                );
                                state.appendQuestionEditorPlugin.push(
                                    pasteImageUpload("user/control/question/upload?method=upload",'file',state.fileSystem)
                                );
                            }

                            state.appendQuestionEditorPlugin.push(emoji());
                            if(editorIconList?.indexOf('mention') != -1){
                                state.appendQuestionEditorPlugin.push(
                                    mention((editorId: string,ctx:BytemdEditorContext)=>{mentionPopUp(editorId,ctx)})
                                );
                            }
                            if(editorIconList?.indexOf('ai') != -1){
                                state.appendQuestionEditorPlugin.push(

                                    ai((editorId: string,ctx:BytemdEditorContext)=>{aiPopUp(proxy,appContext,editorId,uploadPath,'file',state.fileSystem,state.isAppendQuestionMarkdown,undefined,ctx)})
                                );
                            }
                            state.appendQuestionEditorPlugin.push(
                                help(editorIconList,[])
                            );

                        }



                        if (Object.keys(state.appendQuestionEditorCreateParameObject).length === 0) {//等于空

                            if(!state.isAppendQuestionMarkdown){
                                //创建富文本编辑器
                                state.appendQuestionEditor = createEditor(
                                    appendQuestionContentEditorToolbarRef.value,
                                    appendQuestionContentEditorTextRef.value,
                                    editorIconList,
                                    getPageBasePath()+'common/default/',
                                    uploadPath,
                                    null,
                                    state.fileSystem,
                                    (editorId: string)=>{
                                        handleAppendQuestionToggleMarkdownEditor(editorId);
                                    },
                                    (editorId: string)=>{
                                        mentionPopUp(editorId,undefined)
                                    },
                                    (editorId: string)=>{
                                        //AI弹窗
                                        aiPopUp(proxy,appContext,editorId,uploadPath,'file',state.fileSystem,state.isAppendQuestionMarkdown,state.appendQuestionEditor,undefined)
                                    }
                                );
                            }


                            state.appendQuestionEditorCreateParameObject = {
                                toolbarRef:appendQuestionContentEditorToolbarRef.value,
                                textRef:appendQuestionContentEditorTextRef.value,
                                editorIconList:editorIconList,
                                uploadPath:uploadPath,
                                userGradeList:null
                            }

                        }

                        if (data.captchaKey != undefined && data.captchaKey != '') {

                            state.showCaptcha.set(_key,true)
                            state.captchaKey.set(_key,data.captchaKey)
                            Object.assign(state.captchaValue, {[_key] : ''});
                            replaceCaptcha(_key);//刷新验证码
                        }


                    })

                    state.allowSubmit.set(_key,false);;//提交按钮disabled状态
                }else{
                    Notify({
                        type: 'warning',
                        message: t('question.470'),//不允许追加提问
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
    //关闭追加问题页
    const closeAppendQuestion = () => {
        clearBodyLocks()//关闭锁定的滚动层
    }

    //追加问题 -- 提交数据
    const onAppendQuestionFormSubmit = () => {
        let _key =  "appendQuestion-"+state.questionId;
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
                error.appendQuestionContent = '';
                error.captchaValue.delete(_key);
                error.question = '';

                let formData = new FormData();
                formData.append('questionId', state.questionId);

                if(state.isAppendQuestionMarkdown){
                    formData.append('isMarkdown', state.isAppendQuestionMarkdown.toString());
                    formData.append('markdownContent', state.appendQuestionMarkdownContent);
                }else{
                    let content =  state.appendQuestionEditor.txt.html()
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
                    url: '/user/control/question/appendQuestion',
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
                                message: t('question.480'),//提交成功
                                onClose: ()=>{

                                }
                            });
                             //关闭追加问题页
                            closeAppendQuestion();

                            state.appendQuestionMarkdownContent = "";

                            if (Object.keys(state.appendQuestionEditor).length != 0) {//不等于空
                                 //清空字段
                                state.appendQuestionEditor.txt.clear();//清空

                            }


                            nextTick(()=>{//需要延迟才能让state.appendQuestionFormView的设置生效
                                state.appendQuestionFormView = false;
                            })



                            //重置表单
                            //formAddCommentRef.value?.resetFields();
                            if(state.showCaptcha.get(_key) == true){
                                Object.assign(state.captchaValue, {[_key] : ''});
                            }


                            queryQuestion(state.questionId,()=>{});

                        }else{
                            //处理错误信息
                            for (const [key, value] of Object.entries(result.error) as [string, string][]){
                                if(key == 'content'){
                                    error.appendQuestionContent = value;
                                }else if(key == 'question'){
                                    error.question = value;
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

     //采纳答案
     const adoptionAnswer = (answerId:string) => {
        Dialog.confirm({
            message:t('question.490'),//确定采纳答案?
        })
        .then(() => {
            let formData = new FormData();
            formData.append('answerId', answerId);

            proxy?.$axios({
                url: '/user/control/question/adoptionAnswer',
                method: 'post',
                data: formData
            })
            .then((response: AxiosResponse) => {
                if(response){

                    const result: any = response.data;

                    if(JSON.parse(result.success)){
                        Notify({
                            type: 'success',
                            message: t('question.500'),//采纳当前答案成功
                            onClose: ()=>{

                            }
                        });

                        state.question.adoptionAnswerId = "1";

                        //清除答案列表
                        clearAnswerList();

                        state.isLoading = true;//手动触发查询数据需将'加载状态结束'设为true
                        queryAnswerList(state.questionId,'','',1);

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

    //发表答案表单
    const addAnswerUI = () => {
        state.popup_addAnswer = true;

        //锁定滚动层
        lock(document.querySelector('.addAnswerModule') as any)
        document.querySelector('body')!.style.setProperty('position', 'sticky')//移除tua-body-scroll-lock锁定层时添加在body上的position: fixed属性,此属性会导致ByteMD编辑器不能选择行



        nextTick(()=>{
            if(state.showCaptcha.get("addAnswer-"+state.questionId)){
                replaceCaptcha("addAnswer-"+state.questionId);//刷新验证码
            }

            if (Object.keys(state.addAnswerEditorCreateParameObject).length > 0 && Object.keys(state.addAnswerEditor).length == 0) {
                if(!state.isAddAnswerMarkdown){
                    //创建富文本编辑器
                    state.addAnswerEditor = createEditor(
                        addAnswerContentEditorToolbarRef.value,
                        addAnswerContentEditorTextRef.value,
                        state.addAnswerEditorCreateParameObject.editorIconList,
                        getPageBasePath()+'common/default/',
                        state.addAnswerEditorCreateParameObject.uploadPath,
                        null,
                        state.fileSystem,
                        (editorId: string)=>{
                            handleAddAnswerToggleMarkdownEditor(editorId);
                        },
                        (editorId: string)=>{
                            mentionPopUp(editorId,undefined)
                        },
                        (editorId: string)=>{
                            //AI弹窗
                            aiPopUp(proxy,appContext,editorId,state.addAnswerEditorCreateParameObject.uploadPath,'file',state.fileSystem,state.isAddAnswerMarkdown,state.addAnswerEditor,undefined)
                        }
                    );
                }

                state.addAnswerEditorCreateParameObject.toolbarRef = addAnswerContentEditorToolbarRef.value;
                state.addAnswerEditorCreateParameObject.textRef = addAnswerContentEditorTextRef.value;
            }

        })
    }


    //查询添加答案页
    const queryAddAnswer = (questionId:string) => {
        let _key =  "addAnswer-"+state.questionId;
        if(store_systemUser.value == null || Object.keys(store_systemUser.value).length==0){
            return;
        }

        proxy?.$axios({
            url: '/user/queryAddAnswer',
            method: 'get',
            params:  {},
            showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
        })
        .then((response: AxiosResponse) => {
            if(response){
                let data =  response.data;
                state.allowAnswer = data.allowAnswer;

                nextTick(()=>{

                    if(state.question?.allow && data.allowAnswer){
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

                            state.availableTag = availableTagObject;//答案编辑器允许使用标签
                        }

                        state.fileSystem = data.fileSystem;//文件存储系统
                        state.supportEditor = data.supportEditor;//支持编辑器 10.仅富文本编辑器 20.仅Markdown编辑器  30.富文本编辑器优先 40.Markdown编辑器优先

                        if(data.supportEditor == 20 || data.supportEditor == 40){
                            state.isAddAnswerMarkdown = true;
                        }
                        let uploadPath = "user/control/answer/uploadImage?questionId="+state.questionId;

                        if(state.addAnswerEditorPlugin != null && state.addAnswerEditorPlugin.length ==0){
                            //添加插件
                            state.addAnswerEditorPlugin.push(...markdownPlugins());

                            if(state.supportEditor == 30 || state.supportEditor == 40){//10.仅富文本编辑器 20.仅Markdown编辑器  30.富文本编辑器优先 40.Markdown编辑器优先
                                state.addAnswerEditorPlugin.push(
                                    toggleEditor((editorId: string)=>{handleAddAnswerToggleRichtextEditor(editorId)})
                                );
                            }

                            if(editorIconList?.indexOf('image') != -1){
                                state.addAnswerEditorPlugin.push(
                                    imageUpload("user/control/answer/uploadImage?questionId="+state.questionId,'file',state.fileSystem)
                                );
                                state.addAnswerEditorPlugin.push(
                                    pasteImageUpload("user/control/answer/uploadImage?questionId="+state.questionId,'file',state.fileSystem)
                                );
                            }

                            state.addAnswerEditorPlugin.push(emoji());
                            if(editorIconList?.indexOf('mention') != -1){
                                state.addAnswerEditorPlugin.push(
                                    mention((editorId: string,ctx:BytemdEditorContext)=>{mentionPopUp(editorId,ctx)})
                                );
                            }
                            if(editorIconList?.indexOf('ai') != -1){
                                state.addAnswerEditorPlugin.push(

                                    ai((editorId: string,ctx:BytemdEditorContext)=>{aiPopUp(proxy,appContext,editorId,uploadPath,'file',state.fileSystem,state.isAddAnswerMarkdown,undefined,ctx)})
                                );
                            }
                            state.addAnswerEditorPlugin.push(
                                help(editorIconList,[])
                            );


                        }


                        if (data.captchaKey != undefined && data.captchaKey != '') {

                            state.showCaptcha.set(_key,true)
                            state.captchaKey.set(_key,data.captchaKey)
                            Object.assign(state.captchaValue, {[_key] : ''});
                            replaceCaptcha(_key);//刷新验证码
                        }


                        if (Object.keys(state.addAnswerEditorCreateParameObject).length === 0) {//等于空


                            state.addAnswerEditorCreateParameObject = {
                                toolbarRef:addAnswerContentEditorToolbarRef.value,
                                textRef:addAnswerContentEditorTextRef.value,
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
    //关闭添加答案页
    const closeAddAnswer = () => {
        clearBodyLocks()//关闭锁定的滚动层
    }

     //添加答案 -- 提交数据
     const onAddAnswerFormSubmit = () => {
        let _key =  "addAnswer-"+state.questionId;
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
                error.answer.delete(_key);

                let formData = new FormData();
                formData.append('questionId', state.questionId);


                if(state.isAddAnswerMarkdown){
                    formData.append('isMarkdown', state.isAddAnswerMarkdown.toString());
                    formData.append('markdownContent', state.addAnswerMarkdownContent);
                }else{
                    let content =  state.addAnswerEditor.txt.html()
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
                    url: '/user/control/answer/add',
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
                                message: t('question.480'),//提交成功
                                onClose: ()=>{

                                }
                            });
                            //关闭添加答案页
                            closeAddAnswer()

                            state.popup_addAnswer = false;

                            state.addAnswerMarkdownContent = "";

                            if (Object.keys(state.addAnswerEditor).length != 0) {//不等于空
                                //清空字段
                                state.addAnswerEditor.txt.clear();//清空
                            }



                            if(state.showCaptcha.get(_key) == true){
                                Object.assign(state.captchaValue, {[_key] : ''});
                            }

                            //清除答案列表
                            clearAnswerList();

                            state.isLoading = true;//手动触发查询数据需将'加载状态结束'设为true
                            queryAnswerList(state.questionId,'','',1);


                        }else{
                            //处理错误信息
                            for (const [key, value] of Object.entries(result.error) as [string, string][]){
                                if(key == 'content'){
                                    error.content.set(_key,value);
                                }else if(key == 'answer'){
                                    error.answer.set(_key,value);
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
    //修改答案表单
    const editAnswerUI = (answer: Answer) => {
        let _key =  "editAnswer-"+answer.id;
        if(state.editAnswerFormView[answer.id] == true){//如果已打开
            return;
        }

        if(store_systemUser.value == null || Object.keys(store_systemUser.value).length==0){
            return;
        }

        state.allowSubmit.set(_key,true);//提交按钮disabled状态

        proxy?.$axios({
            url: '/user/queryEditAnswer',
            method: 'get',
            params:  {
                answerId: answer.id
            },
            showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
        })
        .then((response: AxiosResponse) => {
            let data =  response.data;

            let _answer = data.answer;

            if(data.allowAnswer && _answer != undefined){
                Object.assign(state.editAnswerMarkdownContent, {[_answer.id] : _answer.markdownContent});
                Object.assign(state.editAnswerFormView, {[answer.id] : true});

                nextTick(()=>{
                    //锁定滚动层
                    lock(document.querySelector('.editAnswerModule_lock_'+_answer.id) as any)
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
                                 //   editorIconList.push("bold");
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
                                }else if(_availableTag == "mention"){//提及
                                    editorIconList.push("mention");
                                }else if(_availableTag == "ai"){//AI
                                    editorIconList.push("ai");
                                }else if(_availableTag == "insertfile"){//文件
                                    editorIconList.push("file");
                                }
                            }
                        }
                        state.availableTag = availableTagObject;//答案编辑器允许使用标签
                    }

                    state.fileSystem = data.fileSystem;//文件存储系统
                    let uploadPath = "user/control/answer/uploadImage?questionId="+state.questionId;


                    if(state.editAnswerEditorPlugin != null && state.editAnswerEditorPlugin.length ==0){
                        //添加插件
                        state.editAnswerEditorPlugin.push(...markdownPlugins());
                        if(editorIconList?.indexOf('image') != -1){
                            state.editAnswerEditorPlugin.push(
                                imageUpload("user/control/answer/uploadImage?questionId="+state.questionId,'file',state.fileSystem)
                            );
                            state.editAnswerEditorPlugin.push(
                                pasteImageUpload("user/control/answer/uploadImage?questionId="+state.questionId,'file',state.fileSystem)
                            );
                        }
                        state.editAnswerEditorPlugin.push(emoji());
                        if(editorIconList?.indexOf('mention') != -1){
                            state.editAnswerEditorPlugin.push(
                                mention((editorId: string,ctx:BytemdEditorContext)=>{mentionPopUp(editorId,ctx)})
                            );
                        }
                        if(editorIconList?.indexOf('ai') != -1){
                            state.editAnswerEditorPlugin.push(

                                ai((editorId: string,ctx:BytemdEditorContext)=>{aiPopUp(proxy,appContext,editorId,uploadPath,'file',state.fileSystem ,true,undefined,ctx)})
                            );
                        }
                        state.editAnswerEditorPlugin.push(
                            help(editorIconList,[])
                        );

                    }

                    if (data.captchaKey != undefined && data.captchaKey != '') {

                        state.showCaptcha.set(_key,true)
                        state.captchaKey.set(_key,data.captchaKey)
                        Object.assign(state.captchaValue, {[_key] : ''});
                        replaceCaptcha(_key);//刷新验证码
                    }

                    if (state.editAnswerEditorCreateParameMap.get(answer.id) == null || Object.keys(state.editAnswerEditorCreateParameMap.get(answer.id)).length === 0) {//等于空

                        if(_answer.isMarkdown != null && _answer.isMarkdown == true){
                            state.isEditAnswerMarkdownMap.set(answer.id,true);
                        }else{
                            state.isEditAnswerMarkdownMap.set(answer.id,false);
                        }


                        let editAnswerContentEditorToolbarRefValue = (proxy?.$refs['editAnswerContentEditorToolbarRef_'+answer.id] as any)[0];
                        let editAnswerContentEditorTextRefValue = (proxy?.$refs['editAnswerContentEditorTextRef_'+answer.id] as any)[0];

                        if(!state.isEditAnswerMarkdownMap.get(answer.id)){
                            //创建富文本编辑器
                            let editor = createEditor(
                                editAnswerContentEditorToolbarRefValue,
                                editAnswerContentEditorTextRefValue,
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
                                    aiPopUp(proxy,appContext,editorId,uploadPath,'file',state.fileSystem,state.isEditAnswerMarkdownMap.get(answer.id),editor,undefined)
                                }
                            );
                            editor.txt.html(_answer.content);//初始化内容
                            state.editAnswerEditorMap.set(answer.id,editor);
                        }


                        state.editAnswerEditorCreateParameMap.set(answer.id, {
                                toolbarRef:editAnswerContentEditorToolbarRefValue,
                                textRef:editAnswerContentEditorTextRefValue,
                                editorIconList:editorIconList,
                                uploadPath:uploadPath,
                                userGradeList:null
                        })

                    }

                })

                state.allowSubmit.set(_key,false);;//提交按钮disabled状态
            }else{
                if(!data.allowAnswer){
                    Notify({
                        type: 'warning',
                        message: t('question.510'),//不允许修改答案
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

    //关闭修改答案页
    const closeEditAnswer = () => {
        clearBodyLocks()//关闭锁定的滚动层
    }

    //修改答案 -- 提交数据
    const onEditAnswerFormSubmit = (answerId:string) => {
        let _key =  "editAnswer-"+answerId;
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
                error.answer.delete(_key);

                let formData = new FormData();
                formData.append('answerId', answerId);

                if(state.isEditAnswerMarkdownMap.get(answerId)!= undefined && state.isEditAnswerMarkdownMap.get(answerId) == true){
                    if(state.editAnswerMarkdownContent[answerId] != undefined){
                        formData.append('markdownContent', state.editAnswerMarkdownContent[answerId]);
                    }
                }else{
                    let editAnswerEditor = state.editAnswerEditorMap.get(answerId);
                    if(editAnswerEditor != null){
                        let content =  editAnswerEditor.txt.html()
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
                    url: '/user/control/answer/edit',
                    method: 'post',
                    data: formData
                })
                .then((response: AxiosResponse) => {
                    if(response){

                        const result: any = response.data;

                        if(JSON.parse(result.success)){
                            Notify({
                                type: 'success',
                                message: t('question.480'),//提交成功
                                onClose: ()=>{

                                }
                            });
                            //关闭修改答案页
                            closeEditAnswer();

                            let editAnswerEditor = state.editAnswerEditorMap.get(answerId);
                            if(editAnswerEditor != null){
                                destroyEditor(editAnswerEditor);
                                state.editAnswerEditorMap.delete(answerId);
                                state.editAnswerEditorCreateParameMap.delete(answerId);
                            }

                            if(state.editAnswerMarkdownContent[answerId] != undefined){
                               state.editAnswerMarkdownContent[answerId] = ""
                            }

                            nextTick(()=>{//需要延迟才能让state.editAnswerMarkdownContent[answerId]的设置生效
                                Object.assign(state.editAnswerFormView, {[answerId] : false});
                            })





                            if(state.showCaptcha.get(_key) == true){
                                Object.assign(state.captchaValue, {[_key] : ''});
                            }

                            //清除答案列表
                            clearAnswerList();

                            state.isLoading = true;//手动触发查询数据需将'加载状态结束'设为true
                            queryAnswerList(state.questionId,'','',1);

                        }else{
                            //处理错误信息
                            for (const [key, value] of Object.entries(result.error) as [string, string][]){
                                if(key == 'content'){
                                    error.content.set(_key,value);
                                }else if(key == 'answer'){
                                    error.answer.set(_key,value);
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

    //删除答案
    const onDeleteAnswer = (answerId:string) => {
        Dialog.confirm({
            message:t('question.520'),//确定删除答案?
        })
        .then(() => {
            let formData = new FormData();
            formData.append('answerId', answerId);

            proxy?.$axios({
                url: '/user/control/answer/delete',
                method: 'post',
                data: formData
            })
            .then((response: AxiosResponse) => {
                if(response){

                    const result: any = response.data;

                    if(JSON.parse(result.success)){
                        Notify({
                            type: 'success',
                            message: t('question.620'),//删除成功
                            onClose: ()=>{

                            }
                        });


                        let editAnswerEditor = state.editAnswerEditorMap.get(answerId);
                        if(editAnswerEditor != null){
                            destroyEditor(editAnswerEditor);
                            state.editAnswerEditorMap.delete(answerId);
                            state.editAnswerEditorCreateParameMap.delete(answerId);
                        }
                        Object.assign(state.editAnswerFormView, {[answerId] : false});


                        if(state.answerList != null && state.answerList.length > 0){
                            for(let i = state.answerList.length - 1; i >= 0; i--){
                                let answer = state.answerList[i];
                                if(answer.id == answerId){
                                    state.answerList.splice(i, 1);
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
                message: t('question.530'),//已达到最大图片允许上传数量
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
        error.image = "";
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
                        message: t('question.540'),//举报分类没开启
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
                    message: t('question.550'),//举报功能已关闭
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
                error.image = "";
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
                                message: t('question.480'),//提交成功
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
                                }else if(key == 'image'){
                                    error.image = value;
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

     //添加回复对方表单
     const addReplyFriendUI = (reply:AnswerReply) => {
        let _key =  "addReplyFriend-"+reply.id;
        if(state.addReplyFriendFormView[reply.id] == true){//如果已打开
			return;
		}
        if(store_systemUser.value == null || Object.keys(store_systemUser.value).length==0){
            return;
        }
        state.allowSubmit.set(_key,true);//提交按钮disabled状态


        proxy?.$axios({
            url: '/user/queryAddAnswerReply',
            method: 'get',
            params:  {
                answerId: reply.answerId
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
                            let uploadPath = "user/control/answer/uploadImage?topicId="+state.questionId;

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
                        message: t('question.560'),//不允许添加回复
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
    const onAddReplyFriend = (answerId:string,replyId:string) => {
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
                formData.append('answerId',  answerId);

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
                    url: '/user/control/answer/addAnswerReply',
                    method: 'post',
                    data: formData
                })
                .then((response: AxiosResponse) => {
                    if(response){

                        const result: any = response.data;

                        if(JSON.parse(result.success)){
                            Notify({
                                type: 'success',
                                message: t('question.480'),//提交成功
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

                            //清除答案列表
                            clearAnswerList();

                            state.isLoading = true;//手动触发查询数据需将'加载状态结束'设为true
                            queryAnswerList(state.questionId,'','',1);

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
    const addReplyUI = (answerId:string) => {
        let _key =  "addReply-"+answerId;
        if(state.addReplyFormView[answerId] == true){//如果已打开
			return;
		}
        if(store_systemUser.value == null || Object.keys(store_systemUser.value).length==0){
            return;
        }
        state.allowSubmit.set(_key,true);//提交按钮disabled状态


        proxy?.$axios({
            url: '/user/queryAddAnswerReply',
            method: 'get',
            params:  {
                answerId: answerId
            },
            showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
        })
        .then((response: AxiosResponse) => {
            if(response){
                let data =  response.data;
                if(data.allowReply){
                    Object.assign(state.addReplyFormView, {[answerId] : true});
                    nextTick(()=>{
                        //锁定滚动层
                        lock(document.querySelector('.addReplyModule_lock_'+answerId) as any)
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
                                     //   editorIconList.push("bold");
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
                        if (state.addReplyEditorCreateParameMap.get(answerId) == null || Object.keys(state.addReplyEditorCreateParameMap.get(answerId)).length === 0) {//等于空
                            let uploadPath = "user/control/answer/uploadImage?questionId="+state.questionId;

                            let addReplyContentEditorToolbarRefValue = (proxy?.$refs['addReplyContentEditorToolbarRef_'+answerId] as any)[0];

                            let addReplyContentEditorTextRefValue = (proxy?.$refs['addReplyContentEditorTextRef_'+answerId] as any)[0];

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
                            state.addReplyEditorMap.set(answerId,editor);



                            state.addReplyEditorCreateParameMap.set(answerId, {
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
                        message: t('question.560'),//不允许添加回复
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
    const onAddReply = (answerId:string) => {
        let _key =  "addReply-"+answerId;
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
                formData.append('answerId', answerId);

                let addReplyEditor = state.addReplyEditorMap.get(answerId);
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
                    url: '/user/control/answer/addAnswerReply',
                    method: 'post',
                    data: formData
                })
                .then((response: AxiosResponse) => {
                    if(response){

                        const result: any = response.data;

                        if(JSON.parse(result.success)){
                            Notify({
                                type: 'success',
                                message: t('question.480'),//提交成功
                                onClose: ()=>{

                                }
                            });

                             //关闭添加回复页
                            closeAddReply();

                            let addReplyEditor = state.addReplyEditorMap.get(answerId);
                            if(addReplyEditor != null){
                                destroyEditor(addReplyEditor);
                                state.addReplyEditorMap.delete(answerId);
                                state.addReplyEditorCreateParameMap.delete(answerId);
                            }


                            nextTick(()=>{
                                Object.assign(state.addReplyFormView, {[answerId] : false});
                            })

                            if(state.showCaptcha.get(_key) == true){
                                Object.assign(state.captchaValue, {[_key] : ''});
                            }


                            //清除答案列表
                            clearAnswerList();

                            state.isLoading = true;//手动触发查询数据需将'加载状态结束'设为true
                            queryAnswerList(state.questionId,'','',1);

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
    const editReplyUI = (reply:AnswerReply) => {
        let _key =  "editReply-"+reply.id;
        if(state.editReplyFormView[reply.id] == true){//如果已打开
			return;
		}
        if(store_systemUser.value == null || Object.keys(store_systemUser.value).length==0){
            return;
        }
        state.allowSubmit.set(_key,true);//提交按钮disabled状态

        proxy?.$axios({
            url: '/user/queryEditAnswerReply',
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
                                     //   editorIconList.push("bold");
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
                            let uploadPath = "user/control/answer/uploadImage?questionId="+state.questionId;

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
                            message: t('question.570'),//不允许修改回复
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
                    url: '/user/control/answer/editReply',
                    method: 'post',
                    data: formData
                })
                .then((response: AxiosResponse) => {
                    if(response){

                        const result: any = response.data;

                        if(JSON.parse(result.success)){

                            Notify({
                                type: 'success',
                                message: t('question.480'),//提交成功
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

                            //清除答案列表
                            clearAnswerList();

                            state.isLoading = true;//手动触发查询数据需将'加载状态结束'设为true
                            queryAnswerList(state.questionId,'','',1);

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
    const onDeleteReply = (answerId:string, replyId:string) => {
        Dialog.confirm({
            message:t('question.580'),//确定删除回复?
        })
        .then(() => {
            let _key =  "addReply-"+answerId;
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
                url: '/user/control/answer/deleteReply',
                method: 'post',
                data: formData
            })
            .then((response: AxiosResponse) => {
                if(response){

                    const result: any = response.data;

                    if(JSON.parse(result.success)){
                        Notify({
                            type: 'success',
                            message: t('question.620'),//删除成功
                            onClose: ()=>{

                            }
                        });

                        let addReplyEditor = state.addReplyEditorMap.get(answerId);
                        if(addReplyEditor != null){
                            destroyEditor(addReplyEditor);
                            state.addReplyEditorMap.delete(answerId);
                            state.addReplyEditorCreateParameMap.delete(answerId);
                        }
                        delete state.addReplyFormView[answerId];

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

                        if(state.answerList != null && state.answerList.length > 0){
                            for(let i = state.answerList.length - 1; i >= 0; i--){
                                let answer = state.answerList[i];
                                if(answer.answerReplyList != null && answer.answerReplyList.length >0){
                                    for(let j = answer.answerReplyList.length - 1; j >= 0; j--){
                                        let reply = answer.answerReplyList[j];
                                        if(reply.id == replyId){
                                            answer.answerReplyList.splice(j, 1);
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

    //查询相似问题
    const queryLikeQuestion = (questionId:string) => {
        proxy?.$axios({
            url: '/queryLikeQuestion',
            method: 'get',
            params:  {
                questionId:questionId
            },
            showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
        })
        .then((response: AxiosResponse) => {
            return response?.data;
        })
        .then((data: Array<Question>) => {
            state.likeQuestionList.length =0;

            if(data){
                state.likeQuestionList = data;
            }
        }).catch((error: any) =>{
            console.log(error);
        });
    }


    //点击回复层级
    const clickReplyLevel = (answerId:string,replyId:string) => {

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
            showReplyLevel(answerId,replyId);
        }

    }

    //展示回复层级
    const showReplyLevel = (answerId:string,replyId:string) => {

        let dotArray = new Array();
        let replyList = [] as Array<AnswerReply>;
        if(state.answerList != null && state.answerList.length > 0){
            A:for (let i = 0; i <state.answerList.length; i++) {
                let answer = state.answerList[i];

                if(answer.id == answerId){
                    //回复
                    if(answer.answerReplyList != null && answer.answerReplyList.length >0){
                        replyList = answer.answerReplyList;
                        for (let j = 0; j <answer.answerReplyList.length; j++) {
                            let reply = answer.answerReplyList[j];
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

        if(state.appendQuestionFormView){//追加问题弹窗
            isPopup = true;
        }

        if(state.popup_addAnswer){//添加答案弹窗
            isPopup = true;
        }
        //修改答案弹窗
        for(let editAnswerForm in state.editAnswerFormView){
            if(state.editAnswerFormView[editAnswerForm]){
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
    //导航守卫
    onBeforeRouteUpdate((to, from, next) => {
        if(to.name == 'question'){
            if(to.query.questionId != undefined){
                state.questionId = to.query.questionId as string
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
        state.questionId = router.currentRoute.value.query.questionId != undefined ?router.currentRoute.value.query.questionId as string :'';
        init();
        notifyBackend(state.questionId,2);
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
        queryQuestion(state.questionId,()=>{
            queryAddAnswer(state.questionId);
            queryFollowing(state.question.userName);//查询是否已关注该用户
        });
        queryAlreadyCollected(state.questionId);
        queryFavoriteCount(state.questionId);
        queryAlreadyLiked(state.questionId,40);
        queryLikeCount(state.questionId,40);
        queryLikeQuestion(state.questionId);
    }
    //进入keep-alive组件时触发
    onActivated(()=>{
        //后退时修改浏览器标题
        let titleValue = store_title.value

        if(titleValue != null && titleValue != '' && state.question != null && Object.keys(state.question).length > 0){
            document.title = (state.question.title != null ? state.question.title : '')+ ' - ' + titleValue;
            (document.getElementsByName('description')[0] as any).content  = (state.question.summary != null ? state.question.summary : '');
        }
    })
</script>
<style scoped lang="scss">
.questionContentModule{
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
    .questionDetail{
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
            }
            .info{
                margin-top: 5px;
                padding-bottom: 10px;
                display: flex;
                align-items: flex-end;
                .left-layout{
                    flex: 1;
                    margin-right: 10px;
                    position: relative;
                    top: 5px;
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
                            margin-top: 6px;
                            margin-right: 6px;
                            font-size: 14px;

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
                    .statistics{
                        position: relative;
                        top: -3px;
                        .icon{
                            position: relative;
                            top: 2px;
                        }
                        .ipAddress{
                            margin-left: 2px;
                            margin-right: 12px;
                        }
                        .answerTotal{
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

        :deep(.questionMarkdownContent){
            margin-left: 12px;
            margin-right: 12px;
            padding-bottom: 20px;
            color:var(--van-gray-8);
            font-size:16px;
            line-height:1.75;
            word-wrap:break-word;
            min-height: 100px;
            .reward{
                margin-top: 5px;
                margin-bottom: 20px;
                background: #fcf3e6;

                height: 36px;
                line-height: 36px;
                border-radius:3px;
                padding: 5px;
                .info{
                    padding: 0px 12px;color: #e2b46d;font-size: 16px;
                    position: relative;top: -1px;
                    .icon{
                        font-size: 26px;position: relative;top: 7px;left: -4px;
                    }
                    .symbol{
                        font-family:Arial;font-weight:normal; vertical-align: middle; display:inline-block;margin-left: 5px;color: #cca558;
                    }
                    .amount{
                        margin-left: 1px;color: #cca558; margin-right: 5px;font-weight: 700;font-size: 18px;position: relative;top: 1px;
                    }
                    .point{
                        color: #cca558; margin-right: 5px;font-weight: 700;font-size: 18px;position: relative;top: 1px;
                    }
                }
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
                background-color: var(--van-gray-1);
                margin-bottom: 6px;
            }


            .task-list-item {
                list-style-type:none;
            }

            code[class*="language-"]{
                padding: 0 0;
            }
            a{
                color: var(--van-blue);
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
            //自动换行
            pre{
                white-space:pre-wrap;
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

        }

        :deep(.questionContent){
            margin-left: 12px;
            margin-right: 12px;
            padding-bottom: 20px;
            color:var(--van-gray-8);
            font-size:16px;
            line-height:1.75;
            word-wrap:break-word;
            min-height: 100px;
            .reward{
                margin-top: 5px;
                margin-bottom: 20px;
                background: #fcf3e6;

                height: 36px;
                line-height: 36px;
                border-radius:3px;
                padding: 5px;
                .info{
                    padding: 0px 12px;color: #e2b46d;font-size: 16px;
                    position: relative;top: -1px;
                    .icon{
                        font-size: 26px;position: relative;top: 7px;left: -4px;
                    }
                    .symbol{
                        font-family:Arial;font-weight:normal; vertical-align: middle; display:inline-block;margin-left: 5px;color: #cca558;
                    }
                    .amount{
                        margin-left: 1px;color: #cca558; margin-right: 5px;font-weight: 700;font-size: 18px;position: relative;top: 1px;
                    }
                    .point{
                        color: #cca558; margin-right: 5px;font-weight: 700;font-size: 18px;position: relative;top: 1px;
                    }
                }
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
                background-color: var(--van-gray-1);
                margin-bottom: 6px;
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
            //自动换行
            pre{
                white-space:pre-wrap;
            }
        }

        :deep(.appendBox){
            margin-top:10px;
            margin-left: 12px;
            margin-right: 12px;
            position:relative;
            .appendHead {
                height: 24px;
                .prompt{
                    font-size: 15px;
                    line-height: 34px;
                }
                .appendTime{
                    margin-left:5px;
                    font-size: 15px;
                    line-height: 34px;
                }
            }
            .appendMarkdownContent{
                padding:20px 0px;
                color:var(--van-gray-8);
                font-size:16px;
                line-height:1.75;
                word-wrap:break-word;
                min-height: 80px;

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
                .task-list-item {
                    list-style-type:none;
                }
                code[class*="language-"]{
                    padding: 0 0;
                }

                a{
                    color: var(--van-blue);
                }
                p{
                    font-size:16px;word-wrap:break-word
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
                pre{
                    white-space:pre-wrap;
                }
                iframe{
                    width:100%; height: 550px;padding:10px 0px;
                }

            }
            .appendContent{
                padding:20px 0px;
                color:var(--van-gray-8);
                font-size:16px;
                line-height:1.75;
                word-wrap:break-word;
                min-height: 80px;
                a{
                    color: var(--van-blue);
                }
                p{
                    font-size:16px;word-wrap:break-word
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
                pre{
                    white-space:pre-wrap;
                }
            }
        }
        .odd{
            .appendHead{
                color: #f9ce00;
            }
            &:before{
                content: " ";
                position: absolute;
                top: 0px;
                left: -12px;
                bottom:0px;
                border-left: 5px solid #f9ce00;
            }
        }
        .even{
            .appendHead{
                color: #85eb4e;
            }
            &:before{
                content: " ";
                position: absolute;
                top: 0px;
                left: -12px;
                bottom:0px;
                border-left: 5px solid #85eb4e;
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
                    border-radius: var(--van-button-round-border-radius); //var(--van-border-radius-lg);
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
    .allow-answer-wrap{
        margin-top: 8px;
        background: #fff;
        padding: 12px;
        border-radius: var(--van-border-radius-lg);
        .no-answer-button{
            text-align: center;
            background: var(--van-gray-1);
            color: var(--van-gray-6);
            line-height: 42px;
            border-radius: var(--van-border-radius-lg);
        }

        .answer-button{
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
    .no-answer-wrap{
        margin-top: 8px;
        background: #fff;
        padding: 12px;
        border-radius: var(--van-border-radius-lg);
        .no-answer{
            text-align: center;
            background: var(--van-gray-1);
            color: var(--van-gray-6);
            line-height: 42px;
            border-radius: var(--van-border-radius-lg);
        }
    }
    .previous-answer-wrap{
        margin-top: 8px;
        background: #fff;
        padding: 12px;
        border-radius: var(--van-border-radius-lg);
    }
    .answerList{
        margin-top: 8px;
        background: #fff;
        border-radius: var(--van-border-radius-lg);
        .active{
            position:relative;
            .adoption{
                display: inline;
                position: absolute;
                right: -13px;
                top: 0px;
                .ribbon-wrapper {
                    width: 70px;
                    height: 72px;
                    overflow: hidden;
                    position: absolute;
                    top: -6px;
                    right: -3px;
                    .ribbon {
                        font-size: 14px;
                        font-weight: 600;
                        line-height: 14px;
                        text-align: center;
                        text-transform: uppercase;
                        transform: rotate(45deg);
                        position: relative;
                        padding: 4px 0;
                        left: -5px;
                        top: 16px;
                        width: 98px;
                        background-color: #fe9d2d;
                        color: #fff;
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                        letter-spacing: 0.5px;
                        &:before, &:after {
                            content: "";
                            border-top: 4px solid #ce8025;
                            border-left: 4px solid transparent;
                            border-right: 4px solid transparent;
                            position: absolute;
                            bottom: -4px;
                        }
                        &:before {
                            left: 0;
                        }
                        &:after {
                            right: 0;
                        }
                    }
                }
            }
            &:before{
                content: " ";
                position: absolute;
                top: 0px;
                left: -12px;
                bottom:0px;
                border-left: 5px solid #fe9d2d;
            }

            .top-container{
                .right-layout{
                    .active-more{
                        position: relative;
                        top: 1px;
                        width: 55px;
                    }
                }
            }

        }
        .item{
            margin-left: 12px;
            margin-right: 12px;
            padding-top: 12px;
            padding-bottom: 12px;

            .top-container{
                display: flex;

                .adoption{
                    display: none;
                    position: absolute;
                }

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
                }
                :deep(.answerMarkdownContent){
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
                :deep(.answerContent){
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

.appendQuestionModule{
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

.addAnswerModule{
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
.editAnswerModule{
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

/** 相似问题 **/
.likeQuestionModule{
    margin: var(--van-cell-group-inset-padding);
	background: #fff;
    border-radius: var(--van-border-radius-lg);
    .likeQuestion{
        margin-bottom:10px;
        padding:0 12px 0;
        .title{
            font-size:16px;
            padding:20px 0 15px;
            color:var(--van-gray-8);
        }
        .questionList {
            font-size: 15px;
            margin-top: 12px;
            padding-bottom: 12px;
            > .question-title {
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
                    background-color: #E8F3FF;
                    text-align: center;
                    border-radius: 4px;
                    flex: none;
                    align-items: center;
                    justify-content: center;
                    color: var(--van-blue);
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
                    word-break: break-word;
                    font-size: 15px;
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
