<!--话题解锁隐藏标签用户-->
<template>
    <div class="main">
        <div class="main-container">
            <van-sticky>
                <!--title="解锁隐藏标签用户" left-text="返回"-->
                <van-nav-bar :title="t('topicUnhideList.10')" :left-text="t('common.110')" left-arrow @click-left="onBack" @click-right="router.push({path: '/index'})">
                    <template #right>
                        <van-icon name="wap-home-o" :size="convertViewportWidth('18px')"/>
                    </template>
                </van-nav-bar>
            </van-sticky>
            <!-- success-text="刷新成功" -->
            <van-pull-refresh v-model="state.isRefreshing" :success-text="t('common.130')" pull-distance="200" @refresh="onRefresh" style="min-height: 50vh;">
            <div class="headModule" v-if="state.topic == null || Object.keys(state.topic).length > 0">
                <div class="container">
                    <div class="title">
                        {{state.topic.title}}
                    </div>
                </div>
            </div>
            <div class="topicUnhideListModule" >
                <!--error-text="请求失败，点击重新加载" finished-text="没有更多了"-->
                <van-list v-model:loading="state.isLoading" :finished="state.isFinished" v-model:error="state.isError" :error-text="t('common.140')" :finished-text="t('common.150')" @load="onLoad">
                   
                    <div v-for="(topicUnhide,index) in state.topicUnhideList" :key="topicUnhide.id" class="item van-hairline--bottom">
                        <div class="top-container">
                            <div class="userInfo">
                                <!--此用户账号已注销-->
                                <div v-if="topicUnhide.account == null || topicUnhide.account == ''" class="cancelAccount">{{t('topicUnhideList.20')}}</div>
                                <div v-if="topicUnhide.account != null && topicUnhide.account != ''" >
                                    <router-link tag="a" :to="{path:'/user/control/home',query: {userName: topicUnhide.userName}}">
                                        <span class="avatarImg">
                                            <img v-if="topicUnhide.avatarName != null" :src="topicUnhide.avatarPath+'100x100/'+topicUnhide.avatarName" class="img">
                                        
                                            <img v-if="topicUnhide.avatarName == null" :src="topicUnhide.avatar" class="img"/>
                                        </span>
                                        <span v-if="topicUnhide.nickname == null || topicUnhide.nickname == ''" class="account">{{topicUnhide.account}}</span>
                                        <span v-if="topicUnhide.nickname != null && topicUnhide.nickname != ''" class="account">{{topicUnhide.nickname}}</span>
                                    </router-link>
                                </div>
                            </div>
                        </div>
                        <div class="bottom-container">
                            <div class="left-layout">
                                <!--输入密码-->
                                <span v-if="topicUnhide.hideTagType == 10" class="tag tag-type-10"><span class="tag-content"><span>{{t('topicUnhideList.30')}}</span></span></span>
                                <!--积分购买-->
                                <span v-if="topicUnhide.hideTagType == 40" class="tag tag-type-40"><span class="tag-content"><span>{{t('topicUnhideList.40')}}</span></span></span>
                                <!--余额购买-->
                                <span v-if="topicUnhide.hideTagType == 50" class="tag tag-type-50"><span class="tag-content"><span>{{t('topicUnhideList.50')}}</span></span></span>
                            </div>
                            <div class="right-layout">
                                <span class="time">
                                    {{topicUnhide.cancelTime}}
                                </span>
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
    import { getCurrentInstance, ComponentInternalInstance, reactive, onMounted,watchEffect, onActivated} from 'vue'
    import pinia from '@/store/store'
    import {useStore} from '@/store'
    import { storeToRefs } from 'pinia';
    import { onBack} from '@/utils/history'
    import { convertViewportWidth } from '@/utils/px-to-viewport';
    import {useRouter } from 'vue-router'
    import { AxiosResponse } from 'axios'
    import { PageView,Topic, TopicUnhide } from "@/types/index";
    import { letterAvatar } from '@/utils/letterAvatar';
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
            document.title = t('topicUnhideList.60')+' - ' + titleValue;//话题解锁隐藏标签用户
        }
    }, {
        flush: 'post'//在组件更新后触发，第一次运行需要组件渲染完成才执行
    })


    const state = reactive({
        showPopover:[],//气泡弹出框
        topicId : '',
        topic: {} as Topic,
        topicUnhideList:[] as Array<TopicUnhide>,
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

    

    //下拉刷新时触发
    const onRefresh = () => {
        state.isRefreshing = false;

        state.topic = {} as Topic,
        state.topicUnhideList.length = 0;
        state.totalrecord = 0; //总记录数
		state.currentpage = 0; //当前页码
        state.totalpage = 1; //总页数
        state.maxresult = 12; //每页显示记录数
        state.isError = false;//是否列表数据加载失败    
        state.isFinished = false; 

        state.isLoading = true;//手动触发查询数据需将'加载状态结束'设为true
        queryTopicUnhideList(state.topicId,state.currentpage+1);
        queryTopic(state.topicId);
    };
    //加载列表
    const onLoad = () => {
        queryTopicUnhideList(state.topicId,state.currentpage+1);
    }

    //查询话题解锁隐藏标签用户列表
    const queryTopicUnhideList = (topicId:string,page: number) => {
        proxy?.$axios({
            url: '/user/control/topicUnhideList',
            method: 'get',
            params:  { 
                topicId: topicId,
                page: page
            },
            showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
            showErrorMessage:false,// 是否显示错误提示
        })
        .then((response: AxiosResponse) => {
            return response?.data
        })
        .then((data: PageView<TopicUnhide>) => {
            if(data){
                state.isSkeleton = false;//关闭骨架屏


                if(data.records != null && data.records.length >0){
                    for(let i:number=0; i<data.records.length; i++){
                        let topicUnhide = data.records[i];
                        if(topicUnhide.nickname != null && topicUnhide.nickname !=''){
                            topicUnhide.avatar = letterAvatar(topicUnhide.nickname, 40);
                        }else{
                            topicUnhide.avatar = letterAvatar(topicUnhide.account, 40);
                        }
                    }
                }

                state.topicUnhideList.push.apply(state.topicUnhideList,data.records)

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

    //查询话题
    const queryTopic = (topicId: string) => {
		 proxy?.$axios({
            url: '/thread',
            method: 'get',
            params:  { 
                topicId: topicId,
            },
            showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
        })
        .then((response: AxiosResponse) => {
            return response?.data
        })
        .then((data: Topic) => {
            if(data){
                state.topic = data;
            }
        })
        .catch((error: any) =>{
            console.log(error);
        });
        

	}

    onMounted(() => {
        state.topicId = router.currentRoute.value.query.topicId != undefined ? router.currentRoute.value.query.topicId as string :'';
        queryTopic(state.topicId);
        //设置缓存
        store.setCacheComponents(String(router.currentRoute.value.name))
    })

    //进入keep-alive组件时触发
    onActivated(()=>{
        //后退时修改浏览器标题
        let titleValue = store_title.value
        if(titleValue != null && titleValue != ''){
            document.title = t('topicUnhideList.60')+' - ' + titleValue;//话题解锁隐藏标签用户
        }
    })
</script>

<style scoped lang="scss">
.headModule{
    margin: var(--van-cell-group-inset-padding);
    border-radius: var(--van-border-radius-lg);
    background: #fff;
    padding: 8px;
    .container{
        .title{
            line-height: 26px;
            font-size: 14px;
            color: var(--van-gray-7)
        }
    }
}
.topicUnhideListModule{
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

           .userInfo{
                display: flex; 
                align-items: center;
                .cancelAccount{
                    display: inline-block;
                    vertical-align: middle;
                    padding: 6px 6px;
                    font-size: 12px;
                    line-height: 12px;
                    -webkit-border-radius: 2px;
                    -moz-border-radius: 2px;
                    border-radius: 2px;
                    color: var(--van-gray-5);
                    background-color: var(--van-gray-1);
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
                    position: relative;
                    top: 1px;
                }  
            }
        }
        .bottom-container{
            display: flex;
            margin-top: 10px;
            .left-layout{
                flex: 1;
                box-sizing: border-box;
                min-height: 1px;
                .tag{
                    color: red;
                    border: 1px solid red;
                    height: 32px;
                    padding: 0 8px;
                    font-size: 12px;
                    background: #fff;

                    position: relative;
                    display: inline-block;
                    box-sizing: border-box;
                    margin: 0;
                    line-height: 1.2;
                    text-align: center;
                    border-radius: 2px;
                    cursor: pointer;
                    transition: opacity .2s;
                    -webkit-appearance: none;
                    .tag-content {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        height: 100%;
                        &:before {
                            content: " ";
                        }
                    }
                    &:before {
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        width: 100%;
                        height: 100%;
                        background: #000;
                        border: inherit;
                        border-color: #000;
                        border-radius: inherit;
                        transform: translate(-50%,-50%);
                        opacity: 0;
                        content: " ";
                    }
                }
                .tag-type-10{
                    color: #b2b2b2;
                    border: 1px solid #ebebeb;
                }
                .tag-type-40{
                    color: #af82f2;
                    border: 1px solid #e2cffe;
                }
                .tag-type-50{
                    color:  #fe9d2d;
                    border: 1px solid #fedbb2;
                }
            }
            
            .right-layout{
                flex: 1;
                box-sizing: border-box;
                min-height: 1px; 
                text-align: right;
                .time{
                    font-size: 14px;
                    line-height: 34px;
                    color: var(--van-gray-6)
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
