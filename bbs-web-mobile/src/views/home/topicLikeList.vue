<!--话题点赞用户-->
<template>
    <div class="main">
        <div class="main-container">
            <van-sticky>
                <!--title="点赞用户" left-text="返回"-->
                <van-nav-bar :title="t('topicLikeList.10')" :left-text="t('common.110')" left-arrow @click-left="onBack" @click-right="router.push({path: '/index'})">
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
            <div class="topicLikeListModule" >
                <!--error-text="请求失败，点击重新加载" finished-text="没有更多了"-->
                <van-list v-model:loading="state.isLoading" :finished="state.isFinished" v-model:error="state.isError" :error-text="t('common.140')" :finished-text="t('common.150')" @load="onLoad">
                   
                    <div v-for="(like,index) in state.likeList" :key="like.id" class="item van-hairline--bottom">
                        <div class="top-container">
                            <div class="userInfo">
                                <!-- 此用户账号已注销 -->
                                <div v-if="like.account == null || like.account == ''" class="cancelAccount">{{t('topicLikeList.20')}}</div>
                                <div v-if="like.account != null && like.account != ''" >
                                    <router-link tag="a" :to="{path:'/user/control/home',query: {userName: like.userName}}">
                                        <span class="avatarImg">
                                            <img v-if="like.avatarName != null" :src="like.avatarPath+'100x100/'+like.avatarName" class="img">
                                        
                                            <img v-if="like.avatarName == null" :src="like.avatar" class="img"/>
                                        </span>
                                        <span v-if="like.nickname == null || like.nickname == ''" class="account">{{like.account}}</span>
                                        <span v-if="like.nickname != null && like.nickname != ''" class="account">{{like.nickname}}</span>
                                    </router-link>
                                </div>
                            </div>
                        </div>
                        <div class="bottom-container">
                            <div class="layout">
                                <span class="time">
                                    {{like.addtime}}
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
    import { getCurrentInstance, ComponentInternalInstance, reactive, onMounted, watchEffect, onActivated} from 'vue'
    import pinia from '@/store/store'
    import {useStore} from '@/store'
    import { storeToRefs } from 'pinia';
    import { onBack } from '@/utils/history'
    import { convertViewportWidth } from '@/utils/px-to-viewport';
    import {useRouter } from 'vue-router'
    import { AxiosResponse } from 'axios'
    import { Like, PageView,Topic } from "@/types/index";
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
            document.title = t('topicLikeList.10')+' - ' + titleValue;//点赞用户
        }
    }, {
        flush: 'post'//在组件更新后触发，第一次运行需要组件渲染完成才执行
    })
    
    const state = reactive({
        showPopover:[],//气泡弹出框
        topicId : '',
        topic: {} as Topic,
        likeList:[] as Array<Like>,
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
        state.likeList.length = 0;
        state.totalrecord = 0; //总记录数
		state.currentpage = 0; //当前页码
        state.totalpage = 1; //总页数
        state.maxresult = 12; //每页显示记录数    
        state.isError = false;//是否列表数据加载失败
        state.isFinished = false; 

        state.isLoading = true;//手动触发查询数据需将'加载状态结束'设为true
        queryTopicFavoritesList(state.topicId,state.currentpage+1);
        queryTopic(state.topicId);
    };
    //加载列表
    const onLoad = () => {
        queryTopicFavoritesList(state.topicId,state.currentpage+1);
    }

    //查询话题收藏列表
    const queryTopicFavoritesList = (topicId:string,page: number) => {
        proxy?.$axios({
            url: '/user/control/topicLikeList',
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
        .then((data: PageView<Like>) => {
            if(data){
                state.isSkeleton = false;//关闭骨架屏


                if(data.records != null && data.records.length >0){
                    for(let i:number=0; i<data.records.length; i++){
                        let topicFavorites = data.records[i];
                        if(topicFavorites.nickname != null && topicFavorites.nickname !=''){
                            topicFavorites.avatar = letterAvatar(topicFavorites.nickname, 40);
                        }else{
                            topicFavorites.avatar = letterAvatar(topicFavorites.account, 40);
                        }
                    }
                }

                state.likeList.push.apply(state.likeList,data.records)

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
            document.title = t('topicLikeList.10')+' - ' + titleValue;//点赞用户
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
.topicLikeListModule{
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
            
            .layout{
                flex: 1;
                box-sizing: border-box;
                min-height: 1px; 
                text-align: left;
                .time{
                    font-size: 14px;
                    line-height: 28px;
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
