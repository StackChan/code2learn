<!-- 点赞 -->
<template>
    <div class="main">
        <div class="main-container">
            <van-sticky>
                <!-- title="点赞" left-text="返回" -->
                <van-nav-bar :title="t('likeList.10')" :left-text="t('common.110')" left-arrow @click-left="onBack" @click-right="router.push({path: '/index'})">
                    <template #right>
                        <van-icon name="wap-home-o" :size="convertViewportWidth('18px')"/>
                    </template>
                </van-nav-bar>
            </van-sticky>
            <!-- success-text="刷新成功" -->
            <van-pull-refresh v-model="state.isRefreshing" :success-text="t('common.130')" pull-distance="200" @refresh="onRefresh" style="min-height: 50vh;">
            <div class="likeListModule" >
                <!--error-text="请求失败，点击重新加载" finished-text="没有更多了"-->
                <van-list v-model:loading="state.isLoading" :finished="state.isFinished" v-model:error="state.isError" :error-text="t('common.140')" :finished-text="t('common.150')" @load="onLoad">
                   
                    <div v-for="(like,index) in state.likeList" :key="like.id" class="item van-hairline--bottom">
                        <div class="top-container">
                            <div class="left-layout">

                                <div class="topicTag" v-if="like.module == 10">{{t('likeList.20')}}</div><!-- 话题 -->
                                <div class="topicTag" v-if="like.module == 20">{{t('likeList.30')}}</div><!-- 评论 -->
                                <div class="topicTag" v-if="like.module == 30">{{t('likeList.40')}}</div><!-- 评论回复 -->
                                <div class="topicTag" v-if="like.module == 40">{{t('likeList.50')}}</div><!-- 问题 -->
                                <div class="topicTag" v-if="like.module == 50">{{t('likeList.60')}}</div><!-- 答案 -->
                                <div class="topicTag" v-if="like.module == 60">{{t('likeList.70')}}</div><!-- 答案回复 -->
                            </div>
                            <div class="right-layout">
                                
                                <span class="time">
                                    {{like.addtime}}
                                </span>
                                <span class="more">
                                    <Icon name="trash" :size="convertViewportWidth('16px')" @click="onDelete(like.id)"/>
                                </span>
                            </div>
                        </div>
                        <div class="bottom-container">
                            <div class="title">
                                <router-link tag="div" class="link" v-if="like.module == 10 || like.module == 20 || like.module == 30" :to="{path: '/thread', query:{ topicId : like.topicId}}">
                                    {{like.topicTitle}}
                                </router-link>
                                <router-link tag="div" class="link" v-if="like.module == 40 || like.module == 50 || like.module == 60" :to="{path: '/question', query:{ questionId : like.questionId}}">
                                    {{like.questionTitle}}
                                </router-link>
                            </div>
                            <div class="content">
                                <div v-if="like.module == 10">{{like.summary}}</div>
                                <!--reportModule为前端借用‘举报’功能标记模块提示项的参数   10:话题  20:评论  30:评论回复  40:问题  50:答案   60:答案回复-->
                                <router-link tag="div" class="link" v-if="like.module == 20" :to="{path: '/thread', query:{ topicId : like.topicId,commentId:like.commentId,reportModule:20}}">
                                    {{like.summary}}
                                </router-link>
                                <router-link tag="div" class="link" v-if="like.module == 30" :to="{path: '/thread', query:{ topicId : like.topicId,commentId:like.commentId,replyId:like.commentReplyId,reportModule:30}}">
                                    {{like.summary}}
                                </router-link>
                                <div v-if="like.module == 40">{{like.summary}}</div>
                                <router-link tag="div" class="link" v-if="like.module == 50" :to="{path: '/question', query:{ questionId : like.questionId,answerId:like.answerId,reportModule:50}}">
                                    {{like.summary}}
                                </router-link>
                                <router-link tag="div" class="link" v-if="like.module == 60" :to="{path: '/question', query:{ questionId : like.questionId,answerId:like.answerId,replyId:like.answerReplyId,reportModule:60}}">
                                    {{like.summary}}
                                </router-link>
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
    import { Like, PageView } from "@/types/index";
    import { Dialog, Notify } from 'vant';
    import { processErrorInfo } from '@/utils/tool';
    import { useI18n } from 'vue-i18n';
    let { t } = useI18n();
    const { proxy } = getCurrentInstance() as ComponentInternalInstance;
    const store = useStore(pinia);
    const router = useRouter();
    const {title:store_title,keywords:store_keywords,description:store_description} = storeToRefs(store)

    //html页元信息
    watchEffect(() => {
        let titleValue = store_title.value//监听网站标题
        if(titleValue != null && titleValue != ''){
            document.title = t('likeList.10')+' - ' + titleValue;//点赞
        }
    }, {
        flush: 'post'//在组件更新后触发，第一次运行需要组件渲染完成才执行
    })

    const state = reactive({
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
    //错误
    const error = reactive({})
    

    //下拉刷新时触发
    const onRefresh = () => {
        state.isRefreshing = false;

        state.likeList.length = 0;
        state.totalrecord = 0; //总记录数
		state.currentpage = 0; //当前页码
        state.totalpage = 1; //总页数
        state.maxresult = 12; //每页显示记录数
        state.isError = false;//是否列表数据加载失败    
        state.isFinished = false; 

        state.isLoading = true;//手动触发查询数据需将'加载状态结束'设为true
        queryLikeList(state.currentpage+1);
    };
    //加载列表
    const onLoad = () => {
        queryLikeList(state.currentpage+1);
    }

    //查询点赞列表
    const queryLikeList = (page: number) => {
        proxy?.$axios({
            url: '/user/control/likeList',
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
        .then((data: PageView<Like>) => {
            if(data){
                state.isSkeleton = false;//关闭骨架屏
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

    
    //删除点赞
    const onDelete = (id: string) => {
        Dialog.confirm({
            message:t('likeList.80'),//是否确定删除该项？
        })
        .then(() => {
            handleDeleteLike(id);
        })
        .catch(() => {
            // on cancel
        });
    }

    //处理删除
    const handleDeleteLike = (likeId:string) => {
        proxy?.$axios({
            url: '/user/control/deleteLike',
            method: 'post',
            params:  { 
                likeId: likeId
            },
        })
        .then((response: AxiosResponse) => {
            if(response){
                const result: any = response.data;
                    
                if(JSON.parse(result.success)){//成功
                    for(let i=0; i<state.likeList.length; i++){
                        let like = state.likeList[i];
                        if(like.id == likeId){
                            state.likeList.splice(i, 1);//删除
                            break;
                        }
                    }
                    Notify({ 
                        type: 'success', 
                        message: t('likeList.90')//删除成功
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
        let titleValue = store_title.value//监听网站标题
        if(titleValue != null && titleValue != ''){
            document.title = t('likeList.10')+' - ' + titleValue;//点赞
        }
    })
</script>

<style scoped lang="scss">
.likeListModule{
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
                margin-right: 10px;
                .topicTag{
                    background-color:var(--van-gray-2);
                    font-size: 12px;
                  //  line-height: 12px;
                    display: inline-block;
                    padding: 2px 4px 2px 4px;
                    -moz-border-radius: 2px;
                    -webkit-border-radius: 2px;
                    border-radius: 2px;
                    text-decoration: none;
                    color: var(--van-gray-6);
               }
               .questionTag{
                    background-color:var(--blue-100);
                    font-size: 12px;
                    line-height: 12px;
                    display: inline-block;
                    padding: 4px 4px 4px 4px;
                    -moz-border-radius: 2px;
                    -webkit-border-radius: 2px;
                    border-radius: 2px;
                    text-decoration: none;
                    color: var(--van-blue);
               }
                
            }
            .right-layout{
                
              //  box-sizing: border-box;
                min-height: 1px;
                font-size: 14px;
                color: var(--van-gray-6);
                
                .time{
                    position: relative;
                    top: -1px;
                    margin-left: 5px;
                }
                .more{
                    margin-left: 5px;
                    position: relative;
                    top: 2px; 
                }
            }
        }
        .bottom-container{
            margin-top: 10px;
            .title{
                .link{
                    line-height: 26px;
                    color: var(--van-gray-8);
                }
            }
            .content{
                margin-top: 10px;
                line-height: 26px;
                color: var(--van-gray-8);
                word-wrap: break-word;
            }
        }
        
    }
    .skeleton{
        padding-top: 16px;
        padding-bottom: 16px;
    }
}

</style>
