<!-- 会员卡订单 -->
<template>
    <div class="main">
        <div class="main-container">
            <van-sticky>
                <!-- title="会员卡订单" left-text="返回" -->
                <van-nav-bar :title="t('membershipCardOrderList.10')" :left-text="t('common.110')" left-arrow @click-left="onBack" @click-right="router.push({path: '/index'})">
                    <template #right>
                        <van-icon name="wap-home-o" :size="convertViewportWidth('18px')"/>
                    </template>
                </van-nav-bar>
            </van-sticky>
            <!-- success-text="刷新成功" -->
            <van-pull-refresh v-model="state.isRefreshing" :success-text="t('common.130')" pull-distance="200" @refresh="onRefresh" style="min-height: 50vh;">
            <div class="membershipCardOrderListModule" >
                <!--error-text="请求失败，点击重新加载" finished-text="没有更多了"-->
                <van-list v-model:loading="state.isLoading" :finished="state.isFinished" v-model:error="state.isError" :error-text="t('common.140')" :finished-text="t('common.150')" @load="onLoad">
                   
                    <div v-for="(membershipCardOrder,index) in state.membershipCardOrderList" :key="membershipCardOrder.orderId" class="item van-hairline--bottom">
                        <div class="top-container">
                            <div class="left-layout">
                                <span class="orderId">
                                    <!-- 订单号 -->
                                    {{t('membershipCardOrderList.20')}}：{{membershipCardOrder.orderId}}
                                </span>
                            </div>
                            <div class="right-layout">
                                <span class="duration">
                                    {{membershipCardOrder.duration}}
                                    <span v-if="membershipCardOrder.unit == 10">{{t('membershipCardOrderList.30')}}</span><!-- 小时 -->
                                    <span v-if="membershipCardOrder.unit == 20">{{t('membershipCardOrderList.40')}}</span><!-- 日 -->
                                    <span v-if="membershipCardOrder.unit == 30">{{t('membershipCardOrderList.50')}}</span><!-- 月 -->
                                    <span v-if="membershipCardOrder.unit == 40">{{t('membershipCardOrderList.60')}}</span><!-- 年 -->
                                    × {{membershipCardOrder.quantity}}
                                </span>       
                            </div>
                        </div>
                        <div class="middle-container">
                            <div class="content">
                                <p>{{membershipCardOrder.roleName}}</p>
                                <p>{{membershipCardOrder.specificationName}}</p>
                            </div>
                        </div>
                        <div class="bottom-container">
                            <div class="left-layout">
                                <span class="funds" >
                                    <Icon name="deposit" :size="convertViewportWidth('16px')" class="paymentAmount-icon"/>
                                    <!-- {{membershipCardOrder.paymentAmount}}元 -->
                                    <span class="paymentAmount" >{{t('membershipCardOrderList.70',{'p1': membershipCardOrder.paymentAmount})}}</span>
                                    <Icon name="point" :size="convertViewportWidth('16px')" class="paymentPoint-icon"/>
                                    <!-- {{membershipCardOrder.paymentPoint}}积分 -->
                                    <span class="paymentPoint" >{{t('membershipCardOrderList.80',{'p1': membershipCardOrder.paymentPoint})}}</span>
                                </span>
                            </div>
                            <div class="right-layout">
                                <div class="time">
                                    {{membershipCardOrder.createDate}}
                                </div>       
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
    import { MembershipCardOrder, PageView} from "@/types/index";
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
            document.title = t('membershipCardOrderList.10')+' - ' + titleValue;//会员卡订单
        }
    }, {
        flush: 'post'//在组件更新后触发，第一次运行需要组件渲染完成才执行
    })


    const state = reactive({
        membershipCardOrderList:[] as Array<MembershipCardOrder>,
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

        state.membershipCardOrderList.length = 0;
        state.totalrecord = 0; //总记录数
		state.currentpage = 0; //当前页码
        state.totalpage = 1; //总页数
        state.maxresult = 12; //每页显示记录数  
        state.isError = false;//是否列表数据加载失败  
        state.isFinished = false; 

        state.isLoading = true;//手动触发查询数据需将'加载状态结束'设为true
        queryMembershipCardOrderList(state.currentpage+1);
    };
    //加载列表
    const onLoad = () => {
        queryMembershipCardOrderList(state.currentpage+1);
    }

    //查询会员卡订单列表
    const queryMembershipCardOrderList = (page: number) => {
        proxy?.$axios({
            url: '/user/control/membershipCardOrderList',
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
        .then((data: PageView<MembershipCardOrder>) => {
            if(data){
                state.isSkeleton = false;//关闭骨架屏


                if(data.records != null && data.records.length >0){
                    state.membershipCardOrderList.push.apply(state.membershipCardOrderList,data.records)
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
        let titleValue = store_title.value
        if(titleValue != null && titleValue != ''){
            document.title = t('membershipCardOrderList.10')+' - ' + titleValue;//会员卡订单
        }
    })
</script>

<style scoped lang="scss">
.membershipCardOrderListModule{
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
                .orderId{
                    color: var(--van-gray-7);
                }
            }
            .right-layout{
              //  box-sizing: border-box;
                min-height: 1px;
                text-align: right;
                .duration{
                    color: var(--van-gray-7);
                }
            }

        }
        .middle-container{
            display: flex;
            margin-top: 10px;
            
            .content{
                line-height: 26px;
                font-size: 16px;
                color: var(--van-gray-8);
            }
        }
        .bottom-container{
            display: flex;
            margin-top: 10px;
            
            .left-layout{
                flex: 1;
                display: block;
             //   box-sizing: border-box;
                min-height: 1px;
                color: var(--van-gray-7);
                .funds {
                    .paymentAmount-icon{
                        position: relative;
                        top: 2px;
                    }
                    .paymentAmount{
                        margin-left: 4px;
                        position: relative;
                        top: -1px;
                    }
                    .paymentPoint-icon{
                        margin-left: 8px;
                        position: relative;
                        top: 2px;
                    }
                    .paymentPoint{
                        margin-left: 4px;
                        position: relative;
                        top: -1px;
                    }
                }
            }
            .right-layout{
              //  box-sizing: border-box;
                min-height: 1px;
                text-align: right;
                .time{
                    color: var(--van-gray-7);
                    position: relative;
                    top: 2px;
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
