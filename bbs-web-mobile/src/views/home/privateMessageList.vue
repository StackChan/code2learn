<!-- 私信列表 -->
<template>
    <div class="main">
        <div class="main-container">
            <van-sticky>
                <!-- title="私信列表" left-text="返回" -->
                <van-nav-bar :title="t('privateMessageList.10')" :left-text="t('common.110')" left-arrow @click-left="onBack" @click-right="router.push({path: '/index'})">
                    <template #right>
                        <van-icon name="wap-home-o" :size="convertViewportWidth('18px')"/>
                    </template>
                </van-nav-bar>
            </van-sticky>
            <!-- success-text="刷新成功" -->
            <van-pull-refresh v-model="state.isRefreshing" :success-text="t('common.130')" pull-distance="200" @refresh="onRefresh" style="min-height: 50vh;">
            <div class="privateMessageListModule" >
                <!--error-text="请求失败，点击重新加载" finished-text="没有更多了"-->
                <van-list v-model:loading="state.isLoading" :finished="state.isFinished" v-model:error="state.isError" :error-text="t('common.140')" :finished-text="t('common.150')" @load="onLoad">
                   
                    <div v-for="(privateMessage,index) in state.privateMessageList" :key="privateMessage.id" class="item van-hairline--bottom">
                        <div class="top-container">
                            <div class="left-layout">
                                <div class="userInfo">
                                    <router-link tag="a" :to="{path:'/user/control/home',query: {userName: privateMessage.friendUserName}}">
                                        <span class="avatarImg">
                                            <img v-if="privateMessage.friendAvatarName != null" :src="privateMessage.friendAvatarPath+'100x100/'+privateMessage.friendAvatarName" class="img">
                                        
                                            <img v-if="privateMessage.friendAvatarName == null" :src="privateMessage.friendAvatar" class="img"/>
                                        </span>
                                    </router-link>
                                    <span v-if="privateMessage.friendNickname == null || privateMessage.friendNickname == ''" class="account">{{privateMessage.friendAccount}}</span>
                                    <span v-if="privateMessage.friendNickname != null && privateMessage.friendNickname != ''" class="account">{{privateMessage.friendNickname}}</span>
                                    <!--此用户账号已注销-->
                                    <div v-if="privateMessage.friendAccount == null || privateMessage.friendAccount == ''" class="cancelAccount">{{t('privateMessageList.20')}}</div>
                                </div>
                                <div class="time">{{privateMessage.sendTime}}</div>
                            </div>
                            <div class="right-layout">
                                <span class="more">
                                    <Icon name="trash" :size="convertViewportWidth('16px')" @click="onDelete(privateMessage)"/>
                                </span>
                            </div>
                        </div>
                        <div class="bottom-container">
                            <div class="content" @click="router.push({path: '/user/control/privateMessageChatList', query:{ friendUserName : privateMessage.friendUserName}})">{{privateMessage.messageContent}}</div> 
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
    import { PrivateMessage, PageView } from "@/types/index";
    import { letterAvatar } from '@/utils/letterAvatar';
    import { Dialog, Notify } from 'vant';
    import { processErrorInfo } from '@/utils/tool';
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
            document.title = t('privateMessageList.10')+' - ' + titleValue;//私信列表
        }
    }, {
        flush: 'post'//在组件更新后触发，第一次运行需要组件渲染完成才执行
    })

    const state = reactive({
        privateMessageList:[] as Array<PrivateMessage>,
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

        state.privateMessageList.length = 0;
        state.totalrecord = 0; //总记录数
		state.currentpage = 0; //当前页码
        state.totalpage = 1; //总页数
        state.maxresult = 12; //每页显示记录数    
        state.isError = false;//是否列表数据加载失败
        state.isFinished = false; 

        state.isLoading = true;//手动触发查询数据需将'加载状态结束'设为true
        queryPrivateMessageList(state.currentpage+1);
    };
    //加载列表
    const onLoad = () => {
        queryPrivateMessageList(state.currentpage+1);
    }

    //查询私信列表
    const queryPrivateMessageList = (page: number) => {
        proxy?.$axios({
            url: '/user/control/privateMessageList',
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
        .then((data: PageView<PrivateMessage>) => {
            if(data){
                state.isSkeleton = false;//关闭骨架屏


                if(data.records != null && data.records.length >0){
                    for(let i:number=0; i<data.records.length; i++){
                        let privateMessage = data.records[i];
                        if(privateMessage.friendNickname != null && privateMessage.friendNickname !=''){
                            privateMessage.friendAvatar = letterAvatar(privateMessage.friendNickname, 64);
                        }else{
                            privateMessage.friendAvatar = letterAvatar(privateMessage.friendAccount, 64);
                        }
                    }
                }

                state.privateMessageList.push.apply(state.privateMessageList,data.records)

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

   //删除私信
   const onDelete = (privateMessage:PrivateMessage) => {
        Dialog.confirm({
            message:t('privateMessageList.30'),//是否确定删除该项？
        })
        .then(() => {
            deletePrivateMessage(privateMessage.id, privateMessage.friendUserName);
        })
        .catch(() => {
            // on cancel
        });
    }

    //处理删除
    const deletePrivateMessage = (privateMessageId: string,friendUserName: string) => {
        proxy?.$axios({
            url: '/user/control/deletePrivateMessage',
            method: 'post',
            params:  { 
                friendUserName: friendUserName
            },
        })
        .then((response: AxiosResponse) => {
            if(response){
                const result: any = response.data;
                    
                if(JSON.parse(result.success)){//成功
                    for(let i=0; i<state.privateMessageList.length; i++){
                        let privateMessage = state.privateMessageList[i];
                        if(privateMessage.id == privateMessageId){
                            state.privateMessageList.splice(i, 1);//删除
                            break;
                        }
                    }
                    Notify({ 
                        type: 'success', 
                        message: t('privateMessageList.40')//删除成功
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
        let titleValue = store_title.value
        if(titleValue != null && titleValue != ''){
            document.title = t('privateMessageList.10')+' - ' + titleValue;//私信列表
        }
    })
</script>

<style scoped lang="scss">
.privateMessageListModule{
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
            .right-layout{
              //  box-sizing: border-box;
                min-height: 1px;
                color: var(--van-gray-6);
                text-align: right;
                .more{
                    color: var(--van-gray-6);
                }
            }

        }
        .bottom-container{
            margin-top: 5px;
            margin-bottom: 5px;
            display: flex;
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
