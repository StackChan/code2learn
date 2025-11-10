<!--发红包金额分配列表-->
<template>
    <div class="main">
        <div class="main-container">
            <van-sticky>
                <!--title="金额分配" left-text="返回"-->
                <van-nav-bar :title="t('redEnvelopeAmountDistributionList.10')" :left-text="t('common.110')" left-arrow @click-left="onBack" @click-right="router.push({path: '/index'})">
                    <template #right>
                        <van-icon name="wap-home-o" :size="convertViewportWidth('18px')"/>
                    </template>
                </van-nav-bar>
            </van-sticky>
            <!-- success-text="刷新成功" -->
            <van-pull-refresh v-model="state.isRefreshing" :success-text="t('common.130')" pull-distance="200" @refresh="onRefresh" style="min-height: 50vh;">  
                <div class="headModule">
                    <div class="giveRedEnvelopeInfo">
                        <div class="top-container">
                            <div class="left-layout">
                                <span class="tag" v-if="state.giveRedEnvelope.type == 10">{{t('redEnvelopeAmountDistributionList.20')}}</span><!-- 个人定向红包 -->
                                <span class="tag" v-if="state.giveRedEnvelope.type == 20">{{t('redEnvelopeAmountDistributionList.30')}}</span><!-- 公共随机红包 -->
                                <span class="tag" v-if="state.giveRedEnvelope.type == 30">{{t('redEnvelopeAmountDistributionList.40')}}</span><!-- 公共定额红包 -->
                            </div>
                            <div class="right-layout">
                                <span class="time">
                                    {{state.giveRedEnvelope.giveTime}}
                                </span>
                            </div>
                        </div>
                        <div class="middle-container">
                            <div class="layout">
                                <router-link  tag="div" class="title" :to="{path: '/thread', query: {topicId: state.giveRedEnvelope.bindTopicId}}" >
                                    {{state.giveRedEnvelope.bindTopicTitle}}
                                </router-link>
                            </div>
                        </div>
                        <div class="middle-lower-container">
                            
                            <div class="details">
                                <!-- 总金额 -->
                                <span class="text">{{t('redEnvelopeAmountDistributionList.50')}}：</span>
                                <!-- {{state.giveRedEnvelope.totalAmount}}元 返还{{state.giveRedEnvelope.refundAmount}}-->
                                <span class="val">{{t('redEnvelopeAmountDistributionList.60',{'p1': state.giveRedEnvelope.totalAmount})}}<span class="refundAmount" v-if="parseFloat(state.giveRedEnvelope.refundAmount) >0">{{t('redEnvelopeAmountDistributionList.70',{'p1': state.giveRedEnvelope.refundAmount})}}</span></span>
                            </div>  
                        </div>
                        <div class="bottom-container">
                            <!-- 发放数量 -->
                            <div class="details"><span class="text">{{t('redEnvelopeAmountDistributionList.80')}}：</span><span class="val">{{state.giveRedEnvelope.giveQuantity}}</span></div>
                            <!-- 已领取数量 -->
                            <div class="details"><span class="text">{{t('redEnvelopeAmountDistributionList.90')}}：</span><span class="val">{{state.giveRedEnvelope.giveQuantity - state.giveRedEnvelope.remainingQuantity}}</span></div>
                        </div>
                    </div>
                </div>
                <div class="receiveRedEnvelopeListModule" >
                    <!--error-text="请求失败，点击重新加载" finished-text="没有更多了"-->
                    <van-list v-model:loading="state.isLoading" :finished="state.isFinished" v-model:error="state.isError" :error-text="t('common.140')" :finished-text="t('common.150')" @load="onLoad">
                    
                        <div v-for="(receiveRedEnvelope,index) in state.receiveRedEnvelopeList" :key="receiveRedEnvelope.id" class="item van-hairline--bottom">
                            <div class="top-container">
                                <div class="userInfo">
                                    <router-link tag="a" :to="{path:'/user/control/home',query: {userName: receiveRedEnvelope.receiveUserName}}">
                                        <span class="avatarImg">
                                            <img v-if="receiveRedEnvelope.receiveAvatarName != null" :src="receiveRedEnvelope.receiveAvatarPath+'100x100/'+receiveRedEnvelope.receiveAvatarName" class="img">
                                        
                                            <img v-if="receiveRedEnvelope.receiveAvatarName == null" :src="receiveRedEnvelope.receiveAvatar" class="img"/>
                                        </span>
                                    </router-link>
                                    <span v-if="receiveRedEnvelope.receiveNickname == null || receiveRedEnvelope.receiveNickname == ''" class="account">{{receiveRedEnvelope.receiveAccount}}</span>
                                    <span v-if="receiveRedEnvelope.receiveNickname != null && receiveRedEnvelope.receiveNickname != ''" class="account">{{receiveRedEnvelope.receiveNickname}}</span>
                                    <!--此用户账号已注销-->
                                    <div v-if="receiveRedEnvelope.receiveAccount == null || receiveRedEnvelope.receiveAccount == ''" class="cancelAccount">{{t('redEnvelopeAmountDistributionList.100')}}</div>
                                </div>
                                <div class="time">{{receiveRedEnvelope.receiveTime}}</div>
                            </div>
                            <!--{{receiveRedEnvelope.amount}}元-->
                            <div class="bottom-container">
                                {{t('redEnvelopeAmountDistributionList.60',{'p1': receiveRedEnvelope.amount})}}
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
    import { GiveRedEnvelope, ReceiveRedEnvelope } from "@/types/index";
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
            document.title = t('redEnvelopeAmountDistributionList.110')+' - ' + titleValue;//发红包金额分配列表
        }
    }, {
        flush: 'post'//在组件更新后触发，第一次运行需要组件渲染完成才执行
    })
    
    const state = reactive({
        giveRedEnvelopeId :'',
        giveRedEnvelope :{} as GiveRedEnvelope,//发红包
        receiveRedEnvelopeList:[] as Array<ReceiveRedEnvelope>,
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

        state.giveRedEnvelope = {} as GiveRedEnvelope;//发红包
        state.receiveRedEnvelopeList.length = 0;
        state.totalrecord = 0; //总记录数
		state.currentpage = 0; //当前页码
        state.totalpage = 1; //总页数
        state.maxresult = 12; //每页显示记录数 
        state.isError = false;//是否列表数据加载失败   
        state.isFinished = false; 

        state.isLoading = true;//手动触发查询数据需将'加载状态结束'设为true
        queryRedEnvelopeAmountDistributionList(state.giveRedEnvelopeId,state.currentpage+1);
    };
    //加载列表
    const onLoad = () => {
        queryRedEnvelopeAmountDistributionList(state.giveRedEnvelopeId,state.currentpage+1);
    }
    


    //查询发红包金额分配列表
    const queryRedEnvelopeAmountDistributionList = (giveRedEnvelopeId:string,page: number) => {
        proxy?.$axios({
            url: '/user/control/redEnvelopeAmountDistributionList',
            method: 'get',
            params:  { 
                giveRedEnvelopeId: giveRedEnvelopeId,
                page: page
            },
            showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
            showErrorMessage:false,// 是否显示错误提示
        })
        .then((response: AxiosResponse) => {
            if(response){
                const data: any = response.data;
                if(data){
                    state.isSkeleton = false;//关闭骨架屏
                    state.giveRedEnvelope = data.giveRedEnvelope;

                    if(data.pageView.records != null && data.pageView.records.length >0){
                        for(let i:number=0; i<data.pageView.records.length; i++){
                            let receiveRedEnvelope = data.pageView.records[i];
                            if(receiveRedEnvelope.receiveNickname != null && receiveRedEnvelope.receiveNickname !=''){
                                receiveRedEnvelope.receiveAvatar = letterAvatar(receiveRedEnvelope.receiveNickname, 40);
                            }else{
                                receiveRedEnvelope.receiveAvatar = letterAvatar(receiveRedEnvelope.receiveAccount, 40);
                            }

                        }
                        state.receiveRedEnvelopeList.push.apply(state.receiveRedEnvelopeList,data.pageView.records)
                    }

                    state.totalrecord = parseInt(data.pageView.totalrecord);//服务器返回的long类型已转为String类型
                    state.currentpage = data.pageView.currentpage;
                    state.totalpage = parseInt(data.pageView.totalpage);//服务器返回的long类型已转为String类型
                    state.maxresult = data.pageView.maxresult;

                    state.isShowPage = true;//显示分页栏
                    if(state.totalpage == 0 || state.totalpage == page){//如果没有内容或是最后一页，则不再加载
                        state.isFinished = true;
                    }
                    state.isLoading = false;//加载状态结束
                }
            }
        })
        .catch((error: any) =>{
            state.isError = true;
            state.isLoading = false;//加载状态结束
            console.log(error);
        });
    }


    onMounted(() => {
        state.giveRedEnvelopeId = router.currentRoute.value.query.giveRedEnvelopeId != undefined ? router.currentRoute.value.query.giveRedEnvelopeId as string :'';
        //设置缓存
        store.setCacheComponents(String(router.currentRoute.value.name))
    })

    //进入keep-alive组件时触发
    onActivated(()=>{
        //后退时修改浏览器标题
        let titleValue = store_title.value
        if(titleValue != null && titleValue != ''){
            document.title = t('redEnvelopeAmountDistributionList.110')+' - ' + titleValue;//发红包金额分配列表
        }
    })
</script>

<style scoped lang="scss">
.headModule{
    margin: var(--van-cell-group-inset-padding);
    border-radius: var(--van-border-radius-lg);
    background: #fff;
    .giveRedEnvelopeInfo{
       
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
                   // line-height: 12px;
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
            padding-top: 10px;
            padding-bottom: 10px;
            .layout{
                flex: 1;
                .title{
                    font-size: 15px;
                    line-height: 32px;
                    color: var(--van-gray-8);
                }
            }
        }
        .middle-lower-container{
            display: flex;
            .details {
                font-size: 14px;
                line-height: 24px;
                color: var(--van-gray-7);
                .val{
                    margin-right: 15px;
                }
                .refundAmount{
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
}

.receiveRedEnvelopeListModule{
    margin: var(--van-cell-group-inset-padding);
    border-radius: var(--van-border-radius-lg);
    background: #fff;
    .item{
        margin-left: 8px;
        margin-right: 8px;
        padding: 8px 0px 8px 0px;

        .top-container{
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
        .bottom-container{
            font-size: 18px;
            font-weight:bold;
            line-height: 36px;
            color: var(--van-gray-7);
        }
    }
    
    
    .skeleton{
        padding-top: 16px;
        padding-bottom: 16px;
    }
}

</style>
