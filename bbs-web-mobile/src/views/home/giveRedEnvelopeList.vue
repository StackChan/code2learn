<!--发红包列表-->
<template>
    <div class="main">
        <div class="main-container">
            <van-sticky>
                <!--title="发红包列表" left-text="返回"-->
                <van-nav-bar :title="t('giveRedEnvelopeList.10')" :left-text="t('common.110')" left-arrow @click-left="onBack" @click-right="router.push({path: '/index'})">
                    <template #right>
                        <van-icon name="wap-home-o" :size="convertViewportWidth('18px')"/>
                    </template>
                </van-nav-bar>
            </van-sticky>
            <!-- success-text="刷新成功" -->
            <van-pull-refresh v-model="state.isRefreshing" :success-text="t('common.130')" pull-distance="200" @refresh="onRefresh" style="min-height: 50vh;">
            <div class="giveRedEnvelopeListModule" >
                <!--error-text="请求失败，点击重新加载" finished-text="没有更多了"-->
                <van-list v-model:loading="state.isLoading" :finished="state.isFinished" v-model:error="state.isError" :error-text="t('common.140')" :finished-text="t('common.150')" @load="onLoad">
                   
                    <div v-for="(giveRedEnvelope,index) in state.giveRedEnvelopeList" :key="giveRedEnvelope.id" class="item van-hairline--bottom">
                        <div class="top-container">
                            <div class="left-layout">
                                <!--个人定向红包-->
                                <span class="tag" v-if="giveRedEnvelope.type == 10">{{t('giveRedEnvelopeList.20')}}</span>
                                <!--公共随机红包-->
                                <span class="tag" v-if="giveRedEnvelope.type == 20">{{t('giveRedEnvelopeList.30')}}</span>
                                <!--公共定额红包-->
                                <span class="tag" v-if="giveRedEnvelope.type == 30">{{t('giveRedEnvelopeList.40')}}</span>
                            </div>
                            <div class="right-layout">
                                <span class="time">
                                    {{giveRedEnvelope.giveTime}}
                                </span>
                            </div>
                        </div>
                        <div class="middle-container">
                            <div class="left-layout">
                                <router-link  tag="div" class="title" :to="{path: '/thread', query: {topicId: giveRedEnvelope.bindTopicId}}" >
                                    {{giveRedEnvelope.bindTopicTitle}}
                                </router-link>
                            </div>
                            <div class="right-layout">
                                <!--金额分配-->
                                <van-button plain round type="primary" @click="router.push({path: '/user/control/redEnvelopeAmountDistributionList', query:{ giveRedEnvelopeId : giveRedEnvelope.id}})">{{t('giveRedEnvelopeList.50')}}</van-button>
                            </div>
                        </div>
                        <div class="middle-lower-container">
                            <!--总金额  返还{{giveRedEnvelope.refundAmount}}-->
                            <div class="details"><span class="text">{{t('giveRedEnvelopeList.60')}}：</span><span class="val">{{giveRedEnvelope.totalAmount}}元<span class="refundAmount" v-if="parseFloat(giveRedEnvelope.refundAmount) >0">{{t('giveRedEnvelopeList.70',{'p1': giveRedEnvelope.refundAmount})}}</span></span></div>  
                        </div>
                        <div class="bottom-container">
                            <!--发放数量-->
                            <div class="details"><span class="text">{{t('giveRedEnvelopeList.80')}}：</span><span class="val">{{giveRedEnvelope.giveQuantity}}</span></div>
                            <!--已领取数量-->
                            <div class="details"><span class="text">{{t('giveRedEnvelopeList.90')}}：</span><span class="val">{{giveRedEnvelope.giveQuantity - giveRedEnvelope.remainingQuantity}}</span></div>
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
    import { onBack } from '@/utils/history'
    import { convertViewportWidth } from '@/utils/px-to-viewport';
    import {useRouter } from 'vue-router'
    import { AxiosResponse } from 'axios'
    import { GiveRedEnvelope, PageView} from "@/types/index";
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
            document.title = t('giveRedEnvelopeList.10')+' - ' + titleValue;//发红包列表
        }
    }, {
        flush: 'post'//在组件更新后触发，第一次运行需要组件渲染完成才执行
    })


    const state = reactive({
        giveRedEnvelopeList:[] as Array<GiveRedEnvelope>,
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

        state.giveRedEnvelopeList.length = 0;
        state.totalrecord = 0; //总记录数
		state.currentpage = 0; //当前页码
        state.totalpage = 1; //总页数
        state.maxresult = 12; //每页显示记录数   
        state.isError = false;//是否列表数据加载失败 
        state.isFinished = false; 

        state.isLoading = true;//手动触发查询数据需将'加载状态结束'设为true
        queryGiveRedEnvelopeList(state.currentpage+1);
    };
    //加载列表
    const onLoad = () => {
        queryGiveRedEnvelopeList(state.currentpage+1);
    }

     //查询发红包列表
    const queryGiveRedEnvelopeList = (page: number) => {
        proxy?.$axios({
            url: '/user/control/giveRedEnvelopeList',
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
        .then((data: PageView<GiveRedEnvelope>) => {
            if(data){
                state.isSkeleton = false;//关闭骨架屏
                state.giveRedEnvelopeList.push.apply(state.giveRedEnvelopeList,data.records)

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
        let titleValue = store_title.value
        if(titleValue != null && titleValue != ''){
            document.title = t('giveRedEnvelopeList.10')+' - ' + titleValue;//发红包列表
        }
    })
</script>

<style scoped lang="scss">
.giveRedEnvelopeListModule{
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

                overflow:hidden;
             //   word-break: break-all;
                position: relative;
                border-radius: 2px;
                .tag{
                   
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
                    margin-right: 5px;
                    margin-bottom: 5px;
               }
            }
            .right-layout{
                margin-bottom: 5px;
              //  box-sizing: border-box;
                min-height: 1px;
                .time{
                    font-size: 14px;
                    color: var(--van-gray-6);
                    position: relative;
                    top: 2px;
                }
            }
        }
        .middle-container{
            display: flex;
            align-items: center;
            padding-top: 15px;
            padding-bottom: 15px;
            .left-layout{
                flex: 1;
                .title{
                    margin-right:15px;
                    font-size: 15px;
                    line-height: 32px;
                    color: var(--van-gray-8);
                }
            }
            .right-layout{
                :deep(.van-button){
                    height: 36px;
                }
            }
        }
        .middle-lower-container{
            margin-top: 5px;
            display: flex;
            .details {
                font-size: 14px;
                line-height: 24px;
                color: var(--van-gray-7);
                .val{
                    margin-right: 15px;
                }
                .refundAmount{
                    margin-left: 5px;
                    color: #F56C6C;
                }
            }
        }
        .bottom-container{
            display: flex;
            .details {
                font-size: 14px;
                line-height: 24px;
                color: var(--van-gray-7);
                .val{
                    margin-right: 15px;
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
