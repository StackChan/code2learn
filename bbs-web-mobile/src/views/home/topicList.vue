<!--我的话题-->
<template>
    <div class="main">
        <div class="main-container">
            <van-sticky>
                <!--title="我的话题" left-text="返回"-->
                <van-nav-bar :title="t('topicList.10')" :left-text="t('common.110')" left-arrow @click-left="onBack" @click-right="router.push({path: '/index'})">
                    <template #right>
                        <van-icon name="wap-home-o" :size="convertViewportWidth('18px')"/>
                    </template>
                </van-nav-bar>
            </van-sticky>
            <!-- success-text="刷新成功" -->
            <van-pull-refresh v-model="state.isRefreshing" :success-text="t('common.130')" pull-distance="200" @refresh="onRefresh" style="min-height: 50vh;">
            <div class="topicListModule" >
                <!--error-text="请求失败，点击重新加载" finished-text="没有更多了"-->
                <van-list v-model:loading="state.isLoading" :finished="state.isFinished" v-model:error="state.isError" :error-text="t('common.140')" :finished-text="t('common.150')" @load="onLoad">
                   
                    <div v-for="(topic,index) in state.topicList" :key="topic.id" class="item van-hairline--bottom">
                        <div class="top-container">
                            <div class="left-layout">
                                <div class="tag">{{topic.tagName}}</div>
                            </div>
                            <div class="middle-layout" v-if="topic.status == 10">
                                <!-- [待审核] -->
                                <span class="status">
                                    {{t('topicList.20')}}
                                </span>
                            </div>
                            
                            <div class="right-layout">
                                
                                <span class="time">
                                    {{topic.postTime}}
                                </span>
                                <span class="more">
                                    <van-popover v-model:show="state.showPopover[index]" placement="left-start" :overlay="true" overlay-class="custom-popoverModule-overlay" :actions="onPopoverActions(topic)" @select="onPopoverSelect">
                                        <template #reference>
                                            <Icon name="ellipsis-v-solid" :size="convertViewportWidth('16px')"/>
                                        </template>
                                    </van-popover>
                                </span>
                            </div>
                        </div>
                        <div class="bottom-container">
                            <router-link tag="div" class="content" :to="{path: '/thread', query: {topicId: topic.id}}" >{{topic.title}}</router-link>
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
    import { PageView,Topic } from "@/types/index";
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
            document.title = t('topicList.10')+' - ' + titleValue;//我的话题
        }
    }, {
        flush: 'post'//在组件更新后触发，第一次运行需要组件渲染完成才执行
    })
    
    const state = reactive({
        showPopover:[],//气泡弹出框
        topicList:[] as Array<Topic>,
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

        state.topicList.length = 0;
        state.totalrecord = 0; //总记录数
		state.currentpage = 0; //当前页码
        state.totalpage = 1; //总页数
        state.maxresult = 12; //每页显示记录数   
        state.isError = false;//是否列表数据加载失败 
        state.isFinished = false; 

        state.isLoading = true;//手动触发查询数据需将'加载状态结束'设为true
        queryTopicList(state.currentpage+1);
    };
    //加载列表
    const onLoad = () => {
        queryTopicList(state.currentpage+1);
    }

    //查询话题列表
    const queryTopicList = (page: number) => {
        proxy?.$axios({
            url: '/user/control/topicList',
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
        .then((data: PageView<Topic>) => {
            if(data){
                state.isSkeleton = false;//关闭骨架屏
                state.topicList.push.apply(state.topicList,data.records)

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


    //气泡弹出框菜单选项
    const onPopoverActions = (topic:Topic) => {
      //  [{ text: '解锁隐藏标签用户', topicId:topic.id, className:'custom-popoverModule-1'},{ text: '收藏用户', topicId:topic.id, className:'custom-popoverModule-1'},{ text: '点赞用户', topicId:topic.id, className:'custom-popoverModule-1'}]
    
        let actions = new Array()
        actions.push({ text: t('topicList.30'), topicId:topic.id, className:'custom-popoverModule-1'});//解锁隐藏标签用户
        actions.push({ text: t('topicList.40'), topicId:topic.id, className:'custom-popoverModule-1'});//收藏用户
        actions.push({ text: t('topicList.50'), topicId:topic.id, className:'custom-popoverModule-1'});//点赞用户

        if(topic.giveRedEnvelopeId != null && topic.giveRedEnvelopeId != ''){
            actions.push({ text: t('topicList.60'), giveRedEnvelopeId:topic.giveRedEnvelopeId, className:'custom-popoverModule-1'});//红包
        }
        actions.push({ text: t('topicList.70'), topicId:topic.id, className:'custom-popoverModule-1'});//编辑
        return actions;
    }
    


    //气泡弹出框选择
    const onPopoverSelect = (action:any) => {
        if(action.text == t('topicList.30')){//解锁隐藏标签用户
            router.push({path: '/user/control/topicUnhideList', query:{ topicId : action.topicId}})
        }else if(action.text == t('topicList.40')){//收藏用户
            router.push({path: '/user/control/topicFavoriteList', query:{ topicId : action.topicId}})
        }else if(action.text == t('topicList.50')){//点赞用户
            router.push({path: '/user/control/topicLikeList', query:{ topicId : action.topicId}})
        }else if(action.text == t('topicList.60')){//红包
            router.push({path: '/user/control/redEnvelopeAmountDistributionList', query:{ giveRedEnvelopeId : action.giveRedEnvelopeId}})
        }else if(action.text == t('topicList.70')){//编辑
            router.push({path: '/user/editTopic', query:{ topicId : action.topicId}})
        }
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
            document.title = t('topicList.10')+' - ' + titleValue;//我的话题
        }
    })
</script>

<style scoped lang="scss">
.topicListModule{
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
                   
                   background-color: var(--van-gray-2);
                   font-size: 12px;
                  // line-height: 12px;
                   display: inline-block;
                
                   padding: 2px 4px 2px 4px;
                   -moz-border-radius: 2px;
                   -webkit-border-radius: 2px;
                   border-radius: 2px;
                   text-decoration: none;
                   color: var(--van-gray-6);

                   white-space: nowrap;
                  
                  // overflow: hidden;
                  // white-space: nowrap;
                  // text-overflow: ellipsis;
                    
                  
               }
               /* 实现省略号 */
               &::before {
                    content: "...";
                    position: absolute;
                    background:  var(--van-gray-2);
                    font-size: 14px;
                    color: var(--van-gray-6);
                    width: 16px;
                    right:0;
                    top: 3px;
                }
                /* 盖住...的内容*/
                &::after {
                    content: " ";
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    background: white;
                } 
                
            }
            .middle-layout{
             //   box-sizing: border-box;
                min-height: 1px;
                .status{
                    font-size: 14px;
                    color: var(--van-orange);
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
