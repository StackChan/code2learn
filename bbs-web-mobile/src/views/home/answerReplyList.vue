<!-- 我的答案回复 -->
<template>
    <div class="main">
        <div class="main-container">
            <van-sticky>
                <!-- title="我的答案回复" left-text="返回" -->
                <van-nav-bar :title="t('answerReplyList.10')" :left-text="t('common.110')" left-arrow @click-left="onBack" @click-right="router.push({path: '/index'})">
                    <template #right>
                        <van-icon name="wap-home-o" :size="convertViewportWidth('18px')"/>
                    </template>
                </van-nav-bar>
            </van-sticky>
            <!-- success-text="刷新成功" -->
            <van-pull-refresh v-model="state.isRefreshing" :success-text="t('common.130')" pull-distance="200" @refresh="onRefresh" style="min-height: 50vh;">
            <div class="answerReplyListModule" >
                <!-- error-text="请求失败，点击重新加载" finished-text="没有更多了" -->
                <van-list v-model:loading="state.isLoading" :finished="state.isFinished" v-model:error="state.isError" :error-text="t('common.140')" :finished-text="t('common.150')" @load="onLoad">
                   
                    <div v-for="(reply,index) in state.replyList" :key="reply.id" class="item van-hairline--bottom">
                        <div class="top-container">
                            <div class="layout">
                                <div class="icon"><Icon name="topic" :size="convertViewportWidth('16px')"/></div>
                                <router-link tag="div" class="link" :to="{path: '/question', query:{questionId : reply.questionId}}">
                                    {{reply.questionTitle}}
                                </router-link>
                            </div>
                        </div>
                        <div class="middle-container">
                            <div class="layout">
                                <div class="icon"><Icon name="reply" :size="convertViewportWidth('16px')"/></div>
                                <div v-if="reply.status == 10" class="no-link">{{reply.content}}</div>
                                <router-link tag="div" class="link" v-if="reply.status == 20" :to="{path: '/question', query:{ questionId : reply.questionId,answerId:reply.answerId,replyId:reply.id}}">
                                    {{reply.content}}
                                </router-link>
                            </div>
                        </div>
                        <div class="bottom-container">
                            <div class="layout">
                                <!-- [待审核] -->
                                <span class="status" v-if="reply.status == 10">{{t('answerReplyList.20')}}</span>
                                <span class="time">{{reply.postTime}}</span>
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
    import { PageView, AnswerReply} from "@/types/index";
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
            document.title = t('answerReplyList.10')+' - ' + titleValue;//我的答案回复
        }
    }, {
        flush: 'post'//在组件更新后触发，第一次运行需要组件渲染完成才执行
    })


    const state = reactive({
        replyList:[] as Array<AnswerReply>,
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

        state.replyList.length = 0;
        state.totalrecord = 0; //总记录数
		state.currentpage = 0; //当前页码
        state.totalpage = 1; //总页数
        state.maxresult = 12; //每页显示记录数  
        state.isError = false;//是否列表数据加载失败  
        state.isFinished = false; 

        state.isLoading = true;//手动触发查询数据需将'加载状态结束'设为true
        queryAnswerReplyList(state.currentpage+1);
    };
    //加载列表
    const onLoad = () => {
        queryAnswerReplyList(state.currentpage+1);
    }

    //查询答案回复列表
    const queryAnswerReplyList = (page: number) => {
        proxy?.$axios({
            url: '/user/control/answerReplyList',
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
        .then((data: PageView<AnswerReply>) => {
            if(data){
                state.isSkeleton = false;//关闭骨架屏
                state.replyList.push.apply(state.replyList,data.records)

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


    onMounted(() => {
        //设置缓存
        store.setCacheComponents(String(router.currentRoute.value.name))
    })

    //进入keep-alive组件时触发
    onActivated(()=>{
        //后退时修改浏览器标题
        let titleValue = store_title.value//监听网站标题
        if(titleValue != null && titleValue != ''){
            document.title = t('answerReplyList.10')+' - ' + titleValue;//我的答案回复
        }
    })
</script>

<style scoped lang="scss">
.answerReplyListModule{
    margin: var(--van-cell-group-inset-padding);
    border-radius: var(--van-border-radius-lg);
    background: #fff;
    .item{
        margin-left: 8px;
        margin-right: 8px;
        padding: 8px 0px 8px 0px;

        .top-container{
            margin-top: -5px;
           .layout{
                display: flex;
                .icon{
                    margin-right: 6px;
                    color: var(--van-blue);
                    position: relative;
                    top: 6px;
                }
                .link{
                    color: var(--van-gray-8);
                    line-height: 28px;
                }
            }
        }
        .middle-container{
            margin-top: 10px;
            .layout{
                display: flex;
                .icon{
                    margin-right: 6px;
                    color: var(--van-orange);
                    position: relative;
                    top: 6px;
                }
                .link{
                    color: var(--van-gray-8);
                    line-height: 28px;
                }
                .no-link{
                    color: var(--van-gray-6);
                    line-height: 28px;
                }
            }
            
        }
        .bottom-container{
            margin-top: 10px;
            
            display: flex;
            .layout{
                margin-left: auto;
                .status{
                    margin-right: 6px;
                    font-size: 14px;
                    color: var(--van-orange);
                } 
                .time{
                    color: var(--van-gray-6);
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
