<!-- 余额 -->
<template>
    <div class="main">
        <div class="main-container">
            <van-sticky>
                <!-- title="余额" left-text="返回" -->
                <van-nav-bar :title="t('balance.10')" :left-text="t('common.110')" left-arrow @click-left="onBack" @click-right="router.push({path: '/index'})">
                    <template #right>
                        <van-icon name="wap-home-o" :size="convertViewportWidth('18px')"/>
                    </template>
                </van-nav-bar>
            </van-sticky>
            <!-- success-text="刷新成功" -->
            <van-pull-refresh v-model="state.isRefreshing" :success-text="t('common.130')" pull-distance="200" @refresh="onRefresh" style="min-height: 50vh;">
                
                <div class="headModule">
                    <div class="container">
                        <div class="left-layout">
                            <span class="currency">¥</span>
                            <h2>{{state.deposit}}</h2>
                            <!-- 元 -->
                            <span class="unit">{{t('balance.20')}}</span>
                        </div>
                        <div class="right-layout">
                            <!-- 充值 -->
                            <van-button plain round type="primary" @click="router.push({path: '/user/control/payment', query:{ paymentModule : 5}})">{{t('balance.30')}}</van-button>
                        </div>
                    </div>
                </div>
                
                <div class="balanceModule" >
                    <!-- error-text="请求失败，点击重新加载" finished-text="没有更多了" -->
                    <van-list v-model:loading="state.isLoading" :finished="state.isFinished" v-model:error="state.isError" :error-text="t('common.140')" :finished-text="t('common.150')" @load="onLoad">
                    
                        <div v-for="(paymentLog,index) in state.paymentLogList" :key="paymentLog.paymentRunningNumber" class="item van-hairline--bottom">
                            <div class="top-container">
                                <div class="layout">
                                    <!-- 支付流水号 -->
                                    <div class="runningNumber">{{t('balance.40')}}：{{paymentLog.paymentRunningNumber}}</div>
                                </div>
                            </div>
                            <div class="middle-container">
                                <div class="layout">
                                    <div :class="paymentLog.amountState == 1 ? 'income' : 'outgoings'">
                                        <p v-if="paymentLog.amountState == 1">+{{t('balance.140',{'p1': paymentLog.amount})}}</p><!-- +{{paymentLog.amount}}元 -->
                                        <p v-if="paymentLog.amountState == 2">-{{t('balance.140',{'p1': paymentLog.amount})}}</p><!-- -{{paymentLog.amount}}元 -->
                                        <p>{{paymentLog.remark}}</p>
                                    </div>  
                                </div>
                            </div>
                            <div class="bottom-container">
                                <div class="left-layout">
                                    <span class="module" v-if="paymentLog.paymentModule == 1">{{t('balance.50')}}</span><!-- 会员卡订单支付 -->
                                    <span class="module" v-if="paymentLog.paymentModule == 5">{{t('balance.30')}}</span><!-- 充值 -->
                                    <span class="module" v-if="paymentLog.paymentModule == 70">{{t('balance.60')}}</span><!-- 余额购买话题隐藏内容 -->
                                    <span class="module" v-if="paymentLog.paymentModule == 80">{{t('balance.70')}}</span><!-- 解锁话题隐藏内容分成 -->
                                    <span class="module" v-if="paymentLog.paymentModule == 90">{{t('balance.80')}}</span><!-- 悬赏金额 -->
                                    <span class="module" v-if="paymentLog.paymentModule == 100">{{t('balance.90')}}</span><!-- 采纳答案 -->
                                    <span class="module" v-if="paymentLog.paymentModule == 110">{{t('balance.100')}}</span><!-- 调整赏金 -->
                                    <span class="module" v-if="paymentLog.paymentModule == 120">{{t('balance.110')}}</span><!-- 话题发红包 -->
                                    <span class="module" v-if="paymentLog.paymentModule == 130">{{t('balance.120')}}</span><!-- 话题收红包 -->
                                    <span class="module" v-if="paymentLog.paymentModule == 140">{{t('balance.130')}}</span><!-- 话题返还红包 -->
                                </div>
                                <div class="right-layout">
                                    <span class="time">
                                        {{paymentLog.times}}
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
    import { useRouter } from 'vue-router'
    import { AxiosResponse } from 'axios'
    import { PaymentLog } from "@/types/index";
    import { useI18n } from 'vue-i18n';
    let { t } = useI18n();

    const store = useStore(pinia);
    const router = useRouter();
    const { proxy } = getCurrentInstance() as ComponentInternalInstance;
    const {title:store_title,keywords:store_keywords,description:store_description,systemUser:store_systemUser} = storeToRefs(store)


    //html页元信息
    watchEffect(() => {
        let titleValue = store_title.value//监听网站标题
        if(titleValue != null && titleValue != ''){
            document.title = t('balance.10')+' - ' + titleValue;//余额
        }
    }, {
        flush: 'post'//在组件更新后触发，第一次运行需要组件渲染完成才执行
    })

    const state = reactive({
        deposit :'',//预存款
        paymentLogList:[] as Array<PaymentLog>,
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

        //重置
        state.deposit = '';//预存款
        state.paymentLogList.length = 0;
        state.totalrecord = 0; //总记录数
		state.currentpage = 0; //当前页码
        state.totalpage = 1; //总页数
        state.maxresult = 12; //每页显示记录数    
        state.isError = false;//是否列表数据加载失败
        state.isFinished = false; 

        state.isLoading = true;//手动触发查询数据需将'加载状态结束'设为true
        queryBalance(state.currentpage+1);
    };
    //加载列表
    const onLoad = () => {
        queryBalance(state.currentpage+1);
    }

    //查询余额
    const queryBalance = (page: number) => {
        proxy?.$axios({
            url: '/user/control/balance',
            method: 'get',
            params:  { 
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

                    state.deposit = data.deposit;

                    if(data.pageView.records != null && data.pageView.records.length >0){
                        state.paymentLogList.push.apply(state.paymentLogList,data.pageView.records)
                    }
                    

                    state.totalrecord = parseInt(data.pageView.totalrecord);//服务器返回的long类型已转为String类型
                    state.currentpage =data.pageView.currentpage;
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
    })

    //进入keep-alive组件时触发
    onActivated(()=>{
        //后退时修改浏览器标题
        let titleValue = store_title.value//监听网站标题
        if(titleValue != null && titleValue != ''){
            document.title = t('balance.10')+' - ' + titleValue;//余额
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
        display: flex;
        align-items: center;
        margin-left: 15px;
        padding-top: 15px;
        padding-bottom: 15px;
        .left-layout{
            flex: 1;
            
            .currency{
                margin-right:3px;
                font-size: 14px;
                position: relative;
                top: -1px;
            }
            H2{
                display: inline;
                margin-right:3px;
                font-size: 26px;
                color: var(--van-gray-8);
            }
            .unit{
                font-size: 14px;
                position: relative;
                top: -1px;
            }
        }
        
        .right-layout{
            margin-right: 15px;
            :deep(.van-button){
                height: 36px;
            }
        }
    }
}

.balanceModule{
    margin: var(--van-cell-group-inset-padding);
    border-radius: var(--van-border-radius-lg);
    background: #fff;
    .item{
        margin-left: 8px;
        margin-right: 8px;
        padding: 8px 0px 8px 0px;

        .top-container{
           .layout{
                display: flex;
                .runningNumber{
                    font-size: 14px;
                    color: var(--van-gray-7);
                    line-height: 24px;
                }
            }
        }
        .middle-container{
            margin-top: 10px;
            .layout{
                display: flex;
                
                line-height: 32px;
                font-size: 16px;
                .income{
                    color: var(--van-green);
                }
                .outgoings{
                    color: var(--van-blue);
                }
            }
            
        }
        .bottom-container{
            margin-top: 10px;
            margin-bottom: 2px;
            display: flex;
           // flex-wrap: wrap;
            .left-layout{
                flex: 1;
                .module{
                    font-size: 14px;
                    color: var(--van-gray-7);
                }
            }
            .right-layout{
              //  box-sizing: border-box;
                min-height: 1px;
                .time{
                    position: relative;
                    top: 1px;
                    font-size: 14px;
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