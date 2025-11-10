<!-- 系统通知 -->
<template>
    <div class="main">
        <div class="main-container">
            <van-sticky>
                <!-- title="系统通知" left-text="返回" -->
                <van-nav-bar :title="t('systemNotifyList.10')" :left-text="t('common.110')" left-arrow @click-left="onBack" @click-right="router.push({path: '/index'})">
                    <template #right>
                        <van-icon name="wap-home-o" :size="convertViewportWidth('18px')"/>
                    </template>
                </van-nav-bar>
            </van-sticky>
            <!-- success-text="刷新成功" -->
            <van-pull-refresh v-model="state.isRefreshing" :success-text="t('common.130')" pull-distance="200" @refresh="onRefresh" style="min-height: 50vh;">
            <div class="systemNotifyListModule" >
                <!--error-text="请求失败，点击重新加载" finished-text="没有更多了"-->
                <van-list v-model:loading="state.isLoading" :finished="state.isFinished" v-model:error="state.isError" :error-text="t('common.140')" :finished-text="t('common.150')" @load="onLoad">
                   
                    <div v-for="(subscriptionSystemNotify,index) in state.subscriptionSystemNotifyList" :key="subscriptionSystemNotify.id" class="item van-hairline--bottom">
                        <div class="top-container">
                            <div class="left-layout">
                                <span class="time">
                                    {{subscriptionSystemNotify.sendTime}}
                                </span>
                            </div>
                            <div class="right-layout">
                                <!-- 未读 -->
                                <span v-if="subscriptionSystemNotify.status == 10" class="status">{{t('systemNotifyList.20')}}</span>
                                <!-- 已读 -->
                                <span v-if="subscriptionSystemNotify.status == 20" class="status alreadyRead">{{t('systemNotifyList.30')}}</span>
                                <span class="more">
                                    <Icon name="trash" :size="convertViewportWidth('16px')" @click="onDelete(subscriptionSystemNotify.id)"/>
                                </span>
                            </div>
                        </div>
                        <div class="bottom-container">
                            <div class="content" v-html="subscriptionSystemNotify.content"></div>
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
    import { PageView, SubscriptionSystemNotify } from "@/types/index";
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
            document.title = t('systemNotifyList.10')+' - ' + titleValue;//系统通知
        }
    }, {
        flush: 'post'//在组件更新后触发，第一次运行需要组件渲染完成才执行
    })



    const state = reactive({
        subscriptionSystemNotifyList:[] as Array<SubscriptionSystemNotify>,
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

        state.subscriptionSystemNotifyList.length = 0;
        state.totalrecord = 0; //总记录数
		state.currentpage = 0; //当前页码
        state.totalpage = 1; //总页数
        state.maxresult = 12; //每页显示记录数    
        state.isError = false;//是否列表数据加载失败
        state.isFinished = false; 

        state.isLoading = true;//手动触发查询数据需将'加载状态结束'设为true
        querySystemNotifyList(state.currentpage+1);
    };
    //加载列表
    const onLoad = () => {
        querySystemNotifyList(state.currentpage+1);
    }

    //查询系统通知列表
    const querySystemNotifyList = (page: number) => {
        proxy?.$axios({
            url: '/user/control/systemNotifyList',
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
        .then((data: PageView<SubscriptionSystemNotify>) => {
            if(data){
                state.isSkeleton = false;//关闭骨架屏


                if(data.records != null && data.records.length >0){
                    state.subscriptionSystemNotifyList.push.apply(state.subscriptionSystemNotifyList,data.records)
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

   //删除系统通知
   const onDelete = (subscriptionSystemNotifyId: string) => {
        Dialog.confirm({
            message:t('systemNotifyList.40'),//是否确定删除该项？
        })
        .then(() => {
            deleteSystemNotify(subscriptionSystemNotifyId);
        })
        .catch(() => {
            // on cancel
        });
    }

    //处理删除
    const deleteSystemNotify = (subscriptionSystemNotifyId: string) => {
        proxy?.$axios({
            url: '/user/control/deleteSystemNotify',
            method: 'post',
            params:  { 
                subscriptionSystemNotifyId: subscriptionSystemNotifyId
            },
        })
        .then((response: AxiosResponse) => {
            if(response){
                const result: any = response.data;
                    
                if(JSON.parse(result.success)){//成功
                    for(let i=0; i<state.subscriptionSystemNotifyList.length; i++){
                        let subscriptionSystemNotify = state.subscriptionSystemNotifyList[i];
                        if(subscriptionSystemNotify.id == subscriptionSystemNotifyId){
                            state.subscriptionSystemNotifyList.splice(i, 1);//删除
                            break;
                        }
                    }
                    Notify({ 
                        type: 'success', 
                        message: t('systemNotifyList.50')//删除成功
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

    })

    //进入keep-alive组件时触发
    onActivated(()=>{
        //后退时修改浏览器标题
        let titleValue = store_title.value
        if(titleValue != null && titleValue != ''){
            document.title = t('systemNotifyList.10')+' - ' + titleValue;//系统通知
        }
    })
</script>

<style scoped lang="scss">
.systemNotifyListModule{
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
                .time{
                    color: var(--van-gray-6);
                    position: relative;
                    top: 2px;
                }
            }
            .right-layout{
                flex: 1;
              //  box-sizing: border-box;
                min-height: 1px;
                color: var(--van-gray-6);
                text-align: right;
                .status{
                    margin-right: 10px;
                }
                .alreadyRead{
                    color: #009A29;
                }
                .more{
                    position: relative;
                    top: 3px;
                    color: var(--van-gray-6);
                }
            }

        }
        .bottom-container{
            display: flex;
            margin-top: 5px;
            
            .content{
                line-height: 26px;
                color: var(--van-gray-8);
            }
        }
        
    }
    .skeleton{
        padding-top: 16px;
        padding-bottom: 16px;
    }
}

</style>
