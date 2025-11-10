<!--问答列表-->
<template>
    <div class="main">
        <div class="main-container">
            <van-sticky>
                <div class="headModule">
                    <div class="container">
                        <div class="left-layout">
                            <div class="tagIcon" @click="displayAllTag();"><Icon name="menu-alt" :size="convertViewportWidth('18px')" class="icon"/></div>
                            <!--全部-->
					        <div class="tagName" @click="displayAllTag();">{{state.questionTagName == '' ?  t('askList.10') : state.questionTagName}}</div>
                        </div>
                      <div class="right-layout">
                        <van-search
                            v-model="state.keyword"
                            placeholder="请输入搜索关键词"
                            @search="onSearch()"
                            clearable
                        />
                      </div>
                    </div>
                </div>
            </van-sticky>
            <van-popup v-model:show="state.popup_allTag" safe-area-inset-top safe-area-inset-bottom :close-on-popstate="true" position="left" closeable close-icon="close" class="custom-left-popupModule" :style="{ width: '50%',height: '100%'  }">
                <div class="scroll">
                  <van-sidebar v-model="state.tag_sidebar_active" @change="onChangeTag" class="tag-sidebar">
                    <!--title="全部"-->
                    <van-sidebar-item :title="t('askList.10')" />

                    <template v-for="(tag, index) in state.tagList" :key="tag.id">
                      <!-- 一级标签 -->
                      <van-sidebar-item :title="tag.name" :disabled="tag.childTag && tag.childTag.length > 0" />

                      <!-- 二级标签 -->
                      <template v-for="(childTag, index2) in tag.childTag" :key="childTag.id">
                        <van-sidebar-item :title="childTag.name" class="second-level-tag" />
                      </template>
                    </template>
                  </van-sidebar>
                </div>
            </van-popup>

<!--            <div class="navTabModule">-->
<!--                <van-tabs v-model:active="state.filterCondition" :shrink="true" @click-tab="onClickNavTab">-->
<!--                    <van-tab :title="t('askList.30')" :name="10"></van-tab>&lt;!&ndash;title="最新"&ndash;&gt;-->
<!--                    <van-tab :title="t('askList.40')" :name="20"></van-tab>&lt;!&ndash;title="未解决"&ndash;&gt;-->
<!--                    <van-tab :title="t('askList.50')" :name="30"></van-tab>&lt;!&ndash;title="已解决"&ndash;&gt;-->
<!--                    <van-tab :title="t('askList.60')" :name="40"></van-tab>&lt;!&ndash;title="积分悬赏"&ndash;&gt;-->
<!--                    <van-tab :title="t('askList.70')" :name="50"></van-tab>&lt;!&ndash;title="现金悬赏"&ndash;&gt;-->
<!--                </van-tabs>-->
<!--            </div>-->
            <!-- success-text="刷新成功" -->
            <van-pull-refresh v-model="state.isRefreshing" :success-text="t('common.130')" pull-distance="200" @refresh="onRefresh" style="min-height: 50vh;">
                <div class="askListModule" >
                    <!--error-text="请求失败，点击重新加载" finished-text="没有更多了"-->
                    <van-list v-model:loading="state.isLoading" :finished="state.isFinished" v-model:error="state.isError" :error-text="t('common.140')" :finished-text="t('common.150')" @load="onLoad">
                        <div v-for="(question,index) in state.questionList" :key="question.id" class="item">
                            <div class="middle-container">
                              <div class="left-layout">
                                    <span class="avatarImg">
                                        <img v-if="question.cover" :src="question.cover" class="img" width="100" height="100">
                                    </span>
                              </div>
                              <div class="right-layout">
                                <div class="topic-layout">
                                  <router-link tag="span" class="title" :to="{path: '/question', query: {questionId: question.id}}" >{{question.title}}</router-link>
                                </div>
                                <div class="summary van-multi-ellipsis--l2">
                                  <router-link tag="span" :to="{path: '/question', query: {questionId: question.id}}" >{{question.summary}}</router-link>
                                </div>
                              </div>
                            </div>
                            <div class="middle-lower-container"  v-if="parseFloat(question.amount) > 0 || Long.fromString(question.point).gt(0)">
                                <div class="reward" >
                                    <span class="rewardInfo" >
                                        <!--
                                        悬赏<span v-if="parseFloat(question.amount) >0">金额<span class="symbol">¥</span><span class="amount">{{question.amount}}</span>元</span>

                                        <span v-if="Long.fromString(question.point).gt(0)"><span class="point">{{question.point}}</span>积分</span>-->

                                        <!-- 仅含有金额 -->
                                        <template v-if="parseFloat(question.amount) >0 && Long.fromString(question.point).lte(0)">
                                            <i18n-t keypath="askList.140" scope="global">
                                                <template #p1>
                                                    <span class="symbol">¥</span><span class="amount">{{question.amount}}</span>
                                                </template>
                                            </i18n-t>
                                        </template>
                                        <!-- 仅含有积分 -->
                                        <template v-if="parseFloat(question.amount) <=0 && Long.fromString(question.point).gt(0)">
                                            <i18n-t keypath="askList.150" scope="global">
                                                <template #p1>
                                                    <span class="point">{{question.point}}</span>
                                                </template>
                                            </i18n-t>
                                        </template>

                                        <!-- 含有金额和积分 -->
                                        <template v-if="parseFloat(question.amount) >0 && Long.fromString(question.point).gt(0)">
                                            <i18n-t keypath="askList.160" scope="global">
                                                <template #p1>
                                                    <span class="symbol">¥</span><span class="amount">{{question.amount}}</span>
                                                </template>
                                                <template #p2>
                                                    <span class="point">{{question.point}}</span>
                                                </template>
                                            </i18n-t>
                                        </template>
                                    </span>
                                </div>
                            </div>
                            <div class="bottom-container">
                                <div class="left-layout">
                                    <div class="tagName-box">
                                        <div class="tagName" v-for="questionTagAssociation in question.questionTagAssociationList">{{questionTagAssociation.questionTagName}}</div>
                                    </div>
                                </div>
                              <div class="middle-layout">
                                <div class="userInfo">
                                  <span class="time">{{question.postTime}}</span>
                                </div>
                              </div>
                                <div class="right-layout">
                                    <div class="statistics">
                                        <Icon name="info-alt" :size="convertViewportWidth('14px')" class="icon"/><span class="commentTotal">{{question.answerTotal}}</span>
				            	        <Icon name="view" :size="convertViewportWidth('14px')" class="icon"/><span class="viewTotal">{{question.viewTotal}}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </van-list>
                </div>
            </van-pull-refresh>
        </div>
    </div>
    <!-- 底部导航栏-->
    <BottomTabbar/>
</template>
<script lang="ts" setup>
    import { onMounted, getCurrentInstance, ComponentInternalInstance, reactive, watchEffect, onActivated, nextTick, } from 'vue'
    import { AxiosResponse } from 'axios'
    import pinia from '@/store/store'
    import {useStore} from '@/store'
    import { storeToRefs } from 'pinia';
    import { convertViewportWidth } from '@/utils/px-to-viewport';
    import { onBeforeRouteUpdate } from 'vue-router';
    import { useRouter } from 'vue-router'
    import { PageView, Question, QuestionTag, } from '@/types';
    import { letterAvatar } from '@/utils/letterAvatar';
    import Long from "long";
    import { useI18n } from 'vue-i18n';
    let { t } = useI18n();

    const store = useStore(pinia);
    const router = useRouter();
    const { proxy } = getCurrentInstance() as ComponentInternalInstance;

    const {title:store_title,keywords:store_keywords,description:store_description,systemUser:store_systemUser} = storeToRefs(store)


    const state = reactive({
        keyword: null,//搜索关键字 ,
        popup_allTag :false,
        tag_sidebar_active:0,//Sidebar 侧边导航
        questionTagId :'',//标签Id
	    	questionTagName :'',//标签名称
        tagList:[] as Array<QuestionTag>,//标签
        filterCondition:10,//过滤条件

        questionList:[] as Array<Question>,
        totalrecord : 0, //总记录数
		    currentpage : 0, //当前页码
        totalpage : 1, //总页数
        maxresult: 12, //每页显示记录数

        isRefreshing:false,//是否处于下拉加载中状态
        isError:false,//是否列表数据加载失败
        isLoading:false,//是否处于加载中状态
        isFinished:false,//是否加载完毕
        isSkeleton:true,//是否显示骨架屏
        isShowPage:false,//是否显示分页

    });


    //下拉刷新时触发
    const onRefresh = () => {
        state.isRefreshing = false;

        //重置
        state.popup_allTag = false;
        state.tag_sidebar_active = 0;//Sidebar 侧边导航
        state.questionTagId ='';//标签Id
		    state.questionTagName ='';//标签名称
        state.tagList.length =0;//标签
        state.filterCondition =10;//过滤条件
        state.keyword = null; // 搜索关键字
        state.questionList.length = 0;
        state.totalrecord = 0; //总记录数
	    	state.currentpage = 0; //当前页码
        state.totalpage = 1; //总页数
        state.maxresult = 12; //每页显示记录数

        state.isError = false;//是否列表数据加载失败
        state.isFinished = false;

        state.isLoading = true;//手动触发查询数据需将'加载状态结束'设为true
        init();
        queryQuestionList(state.questionTagId,state.filterCondition,state.currentpage+1,state.keyword);
    };
    //加载列表
    const onLoad = () => {
        queryQuestionList(state.questionTagId,state.filterCondition,state.currentpage+1,state.keyword);
    }

    //显示所有标签选择
    const displayAllTag = () => {
        state.popup_allTag = true;
        if(state.questionTagId == ''){
            state.tag_sidebar_active = 0;
            return;
        }else{
            if(state.tagList != null && state.tagList.length >0){
                let count =0;
                for(let i=0; i<state.tagList.length; i++ ){
                    let questionTag = state.tagList[i];
                    count++;
                    if(questionTag.id == state.questionTagId){
                        state.tag_sidebar_active = (count);
                        break;
                    }
                    if (questionTag.childTag != null && questionTag.childTag.length > 0) {
                        for (let j = 0; j < questionTag.childTag.length; j++) {
                            let childQuestionTag = questionTag.childTag[j];
                            count++;
                            if(state.questionTagId == childQuestionTag.id){
                                state.tag_sidebar_active = (count);
                                break;
                            }
                        }

                    }
                }
            }
        }
    }

    //查询所有问题标签
    const queryTagList = () => {
        proxy?.$axios({
            url: '/queryAllQuestionTag',
            method: 'get',
            params:  {},
            showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
        })
        .then((response: AxiosResponse) => {
            return response?.data
        })
        .then((data: Array<QuestionTag>) => {


            if (data != null && data.length > 0) {
                let count =0;
                for (let i= 0; i < data.length; i++) {
                    let questionTag = data[i];
                    count++;
                    if(state.questionTagId == questionTag.id){
                        state.tag_sidebar_active = (count);
                        state.questionTagName = questionTag.name;
                        break;
                    }
                    if (questionTag.childTag != null && questionTag.childTag.length > 0) {
                        for (let j = 0; j < questionTag.childTag.length; j++) {
                            count++;
                            let childQuestionTag = questionTag.childTag[j];
                            if(state.questionTagId == childQuestionTag.id){
                                state.tag_sidebar_active = (count);
                                state.questionTagName = childQuestionTag.name;
                                break;
                            }
                        }

                    }
                }
            }

            state.tagList = data;
        })
        .catch((error: any) =>{
            console.log(error);
        });
    }

    //侧边导航选中标签
    const onChangeTag = (index:number) => {
        if(index == 0){
            state.popup_allTag = false;
            router.push({path: '/askList'});
            return;
        }
        if(state.tagList != null && state.tagList.length >0){
            let count =0;
            for(let i=0; i<state.tagList.length; i++ ){
                let questionTag = state.tagList[i];
                count++;
                if(index == count){
                    state.popup_allTag = false;
                    router.push({path: '/askList', query:{ questionTagId : questionTag.id}})
                    break;
                }
                if (questionTag.childTag != null && questionTag.childTag.length > 0) {
                    for (let j = 0; j < questionTag.childTag.length; j++) {
                        count++;
                        let childQuestionTag = questionTag.childTag[j];
                        if(index == count){
                            state.popup_allTag = false;
                            router.push({path: '/askList', query:{ questionTagId : childQuestionTag.id}})
                            break;
                        }
                    }

                }
            }
        }
    }


     //标签导航
     const onClickNavTab = ( {name} :any) => {
        setTimeout(function () {//让底部方块滑完再跳转
            if(name == 10){//最新
                router.push({path: '/askList'});
            }else if(name == 20){
                router.push({path: '/askList', query: {filterCondition: 20}});
            }else if(name == 30){
                router.push({path: '/askList', query: {filterCondition: 30}});
            }else if(name == 40){
                router.push({path: '/askList', query: {filterCondition: 40}});
            }else if(name == 50){
                router.push({path: '/askList', query: {filterCondition: 50}});
            }
        }, 300);

     }
    const onSearch = () => {
      state.currentpage = 0; // 重置当前页码
      state.questionList.length = 0; // 清空问题列表
      state.isFinished = false; // 重置加载状态
      state.isLoading = true; // 设置加载状态onLoad
      queryQuestionList(state.questionTagId, state.filterCondition, state.currentpage + 1, state.keyword);
    };
    //查询问题列表
    const queryQuestionList = (questionTagId:string,filterCondition:number,page: number,keyword:string) => {
        let param = {} as any
        if(questionTagId){
			    param.questionTagId = questionTagId
	    	}
        if(filterCondition){
		    	param.filterCondition = filterCondition
		   }
        if(page){
            param.page = page
        }
        console.log("keyword:"+keyword);
       if (keyword && keyword.trim() !== "") { // 检查 keyword 是否为 null 或空字符串
        param.keyword = keyword;
       }

        proxy?.$axios({
            url: '/queryQuestionList',
            method: 'get',
            params:  param,
            showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
            showErrorMessage:false,// 是否显示错误提示
        })
        .then((response: AxiosResponse) => {
            return response?.data
        })
        .then((data: PageView<Question>) => {
            state.isSkeleton = false;//关闭骨架屏
            if(data.records != null && data.records.length >0){
                for(let i:number=0; i<data.records.length; i++){
                    let question = data.records[i];
                    if(question.nickname != null && question.nickname !=''){
                        question.avatar = letterAvatar(question.nickname, 40);
                    }else{
                        question.avatar = letterAvatar(question.account, 40);
                    }

                }
                state.questionList.push.apply(state.questionList,data.records)
            }



            state.totalrecord = parseInt(data.totalrecord);//服务器返回的long类型已转为String类型
            state.currentpage = data.currentpage;
            state.totalpage = parseInt(data.totalpage);//服务器返回的long类型已转为String类型
            state.maxresult = data.maxresult;

            state.isShowPage = true;//显示分页栏
            if(state.totalpage == 0 || state.totalpage == page){//如果没有内容或是最后一页，则不再加载
                state.isFinished = true;
            }
            state.isLoading = false;//加载状态结束



        })
        .catch((error: any) =>{
            state.isError = true;
            state.isLoading = false;//加载状态结束
            console.log(error);
        });
    }


    //导航守卫
    onBeforeRouteUpdate((to, from, next) => {
        if(to.name == 'askList'){
            if(to.query.questionTagId != undefined){
                state.questionTagId = to.query.questionTagId as string
            }
            if(to.query.filterCondition != undefined){
                state.filterCondition = parseInt(to.query.filterCondition as string)
            }
            //删除缓存
            store.setCacheNumber(to.name)
           // init();
        }

    });
    // 异步通知后端函数

    //html页元信息
    watchEffect(() => {
        let tagId = state.questionTagId;
        let titleValue = store_title.value//监听网站标题


        if(tagId == ''){
            document.title = t('askList.130')+' - ' + (titleValue != null && titleValue != '' ? titleValue : '');//问答
        }
        if(state.tagList != null && state.tagList.length >0){
            for(let i=0; i<state.tagList.length; i++ ){
                let questionTag = state.tagList[i];
                if(questionTag.id == tagId){
                    document.title = questionTag.name;
                    (document.getElementsByName('description')[0] as any).content  = questionTag.name;
                    break;
                }
                if (questionTag.childTag != null && questionTag.childTag.length > 0) {
                    for (let j = 0; j < questionTag.childTag.length; j++) {
                        let childQuestionTag = questionTag.childTag[j];
                        if(tagId == childQuestionTag.id){
                            document.title = childQuestionTag.name;
                            (document.getElementsByName('description')[0] as any).content  = childQuestionTag.name;
                            break;
                        }
                    }

                }
            }
        }


    }, {
        flush: 'post'//在组件更新后触发，第一次运行需要组件渲染完成才执行
    })

    onMounted(() => {
        state.questionTagId = router.currentRoute.value.query.questionTagId != undefined ? router.currentRoute.value.query.questionTagId as string :'';
        state.filterCondition = router.currentRoute.value.query.filterCondition != undefined ? parseInt(router.currentRoute.value.query.filterCondition as string) :10;

        init();
    })

    //初始化
    const init = () => {
        queryTagList();
        //设置缓存
        store.setCacheComponents(String(router.currentRoute.value.name))
    }

    //进入keep-alive组件时触发
    onActivated(()=>{

    })
</script>
<style scoped lang="scss">
.tag-sidebar {
  width: auto;
  margin-right: 10px;
  overflow: hidden; // 让栏目触摸可以滑动

  .van-sidebar-item {
    &.first-level-tag {
      background-color: #f0f0f0; // 一级标签背景颜色
      color: #333; // 一级标签文字颜色
      font-weight: bold; // 一级标签加粗
    }

    &.second-level-tag {
      padding-left: 20px; // 二级标签缩进
      background-color: #fff; // 二级标签背景颜色
      color: #666; // 二级标签文字颜色
    }

    .name {
      line-height: 24px;
    }

    .allowRoleView {
      line-height: 28px;
      color: var(--van-gray-6);
      .space {
        margin-right: 6px;
      }
    }

    &:deep(.van-sidebar-item--select) {
      &:before {
        background-color: var(--van-blue);
      }
    }
  }
}
.headModule{
    background: #fff;
    box-shadow: 0 2px 12px rgba(100, 101, 102, .12);
    padding: 8px;
    .container{
        display: flex;
        align-items: center;
        margin-top: 4px;
        margin-bottom: 4px;
        .left-layout{
            flex: 1;
            display: flex;
            margin-right: 12px;
            overflow:hidden;
            position: relative;
            .tagIcon{
                margin-left: 8px;
                font-size: 18px;
                color:var(--van-blue);
                padding:4px 0;
                margin-top: 3px;
            }
            .tagName{
                margin-left:12px;

                font-size: 16px;
                color:var(--van-blue);
                border-bottom:2px solid var(--van-blue);
                padding:4px 0;
                white-space:nowrap;
            }
            &::before {
                content: " ";
                position: absolute;
                width: 16px;
                height: 100%;
                right:0;
                top: 0px;
                background-image: linear-gradient(90deg,rgba(255,255,255,0) 0%,#fff 100%);
            }

        }

        .right-layout{
            margin-right: 8px;
            :deep(.van-button){
                height: 36px;
            }
        }
    }

}

.tag-sidebar{
    width: auto;
    margin-right: 10px;
    overflow:hidden;//让栏目触摸可以滑动
    .name{
        line-height: 24px;
    }
    .allowRoleView{
        line-height: 28px;
        color: var(--van-gray-6);
        .space{
            margin-right: 6px;
        }
    }
    :deep(.van-sidebar-item--select){
        &:before{
            background-color: var(--van-blue);
        }

    }
}

.navTabModule{
    :deep(.van-tabs__nav){
        background: transparent;
    }
    :deep(.van-tab--shrink){
        padding-right: 12px;
        padding-left: 12px;
    }
    :deep(.van-tabs__line){
        background: var(--van-blue);
    }
    :deep(.van-tab--active) {
        color: var(--van-blue);
    }
}

.askListModule{
    margin: var(--van-cell-group-inset-padding) var(--van-cell-group-inset-padding) 58px var(--van-cell-group-inset-padding);

    .item{
        padding: 12px 12px 12px 12px;
        margin-bottom: 8px;
        border-radius: var(--van-border-radius-lg);
        background: #fff;
        position: relative;
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
                .solve{
                    .adoption{
                        margin-left:3px;
                        white-space:nowrap;
                        color:#fff;
                        background-color:#26a2ff;
                        border-radius:4px;
                        padding:1px 5px;
                        font-size: 12px;
                    }
                }
            }
        }
        .middle-container{
          display: flex;
          align-items: flex-start;
          .left-layout {
            margin-right: 16px; /* 调整间距 */
            flex-shrink: 0; /* 防止收缩 */
          }

          .right-layout {
            flex-grow: 1; /* 占据剩余空间 */
            display: flex;
            flex-direction: column; /* 垂直排列 */
          }

          .avatarImg {
            img {
              width: 100px;
              height: 100px;
              border-radius: 5px;
              vertical-align: middle;
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
            .topic-layout {
                font-size:0;/*父级元素设置font-size:0; 解决 display：inline-block两个元素之间的默认空格 */
                .title{
                    color: var(--van-gray-8);
                    font-size: 18px;
                    line-height: 32px;
                    word-break: break-all;
                }
            }
            .summary{
                margin-top: 6px;
                a{
                    font-size: 15px;
                    line-height: 28px;
                    font-weight:normal;
                    text-decoration:none;
                    color: var(--van-gray-7);
                }
            }
        }
        .middle-lower-container{
            display: flex;
            justify-content: flex-end;
            margin-top: 8px;
            .reward{
                background: #fcf3e6;
                border-radius:3px;
                padding: 2px 0px;
               .rewardInfo{
                    padding: 1px 5px;
                    color: #e2b46d;
                    font-size: 14px;
                    .symbol{
                        font-family:Arial;
                        font-weight:normal;
                        vertical-align: middle;
                        display:inline-block;
                        margin-left: 5px;
                        color: #cca558;
                        font-size: 13px;
                    }
                    .amount{
                        margin-left: 1px;
                        color: #cca558;
                        margin-right: 5px;
                        font-weight: 600;
                        font-size: 16px;
                        position: relative;
                        top: 1px;
                    }
                    .point{
                        color: #cca558;
                        margin-left: 3px;
                        margin-right: 5px;
                        font-weight: 600;
                        font-size: 16px;
                        position: relative;
                        top: 1px;
                    }
                }
            }
        }
        .bottom-container{
            margin-top: 15px;
            display: flex;
            .left-layout{
                flex: 1;
                margin-right: 10px;
                overflow:hidden;
                position: relative;
                .tagName-box{
                    display: flex;
                    overflow-x: auto;
                    .tagName{
                        background-color: var(--van-gray-1);
                        font-size: 14px;
                        line-height: 14px;
                        display: inline-block;
                        padding: 6px 6px 6px 6px;
                        -moz-border-radius: 2px;
                        -webkit-border-radius: 2px;
                        border-radius: 2px;
                        text-decoration: none;
                        color: var(--van-gray-6);
                        white-space:nowrap;
                        margin-right: 6px;
                    }
                    &::-webkit-scrollbar {
                        display: none;
                    }
                }
                &::before {
                    content: " ";
                    position: absolute;
                    width: 16px;
                    height: 100%;
                    right:0;
                    top: 0px;
                    background-image: linear-gradient(90deg,rgba(255,255,255,0) 0%,#fff 100%);
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
              .time{
                width:100%;
                color: var(--van-gray-6);
                font-size: 12px;
                margin-top: 3px;
              }
            }

          }
            .right-layout{
                color: var(--van-gray-6);
                font-size: 14px;
                margin-top: 3px;
                .statistics{
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
                    }
                }

            }
        }
    }
}
</style>
