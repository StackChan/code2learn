<!-- 搜索 -->
<template>
    <div class="main">
        <div class="main-container">
            <van-sticky>
                <!-- placeholder="搜索" -->
                <van-search v-model.trim="state.keyword" :placeholder="t('search.10')" @search="onSearch" class="searchKeyword"/>
            </van-sticky>
            <!-- success-text="刷新成功" -->
            <van-pull-refresh v-model="state.isRefreshing" :success-text="t('common.130')" pull-distance="200" @refresh="onRefresh" style="min-height: 50vh;">
                <div class="searchModule" >
                    <!-- error-text="请求失败，点击重新加载"   没有更多了 -->
                    <van-list v-model:loading="state.isLoading" :finished="state.isFinished" v-model:error="state.isError" :error-text="t('common.140')" :finished-text="(state.keyword != null && state.keyword != '' && state.currentpage > 0) ? t('common.150') : ''" @load="onLoad"> 
                        <template v-for="(searchResult,index) in state.searchResultList" >
                            <div class="item" v-if="searchResult.indexModule == 10">
                                <div class="ribbon-wrapper">
                                    <div class="container">
                                        <template v-if="searchResult.topic.essence && searchResult.topic.sort >0">
                                            <div class="angle"><span>{{t('search.40')}}</span></div><!-- 精华 -->
                                            <div class="ribbon"><span>{{t('search.50')}}</span></div><!-- 置顶 -->
                                        </template>
                                        <template v-else>
                                            <div class="angle single-essence" v-if="searchResult.topic.essence"><span>{{t('search.40')}}</span></div><!-- 精华 -->
                                            <div class="angle single-top" v-if="searchResult.topic.sort >0"><span>{{t('search.50')}}</span></div><!-- 置顶 -->
                                        </template>
                                        
                                    </div>
                                </div>
                                <div class="top-container">
                                    <div class="left-layout">
                                        <router-link v-if="searchResult.topic.account != null && searchResult.topic.account != ''" tag="a" :to="{path:'/user/control/home',query: {userName: searchResult.topic.userName}}">
                                            <span class="avatarImg">
                                                <img v-if="searchResult.topic.avatarName != null" :src="searchResult.topic.avatarPath+'100x100/'+searchResult.topic.avatarName" class="img">
                                            
                                                <img v-if="searchResult.topic.avatarName == null" :src="searchResult.topic.avatar" class="img"/>
                                            </span>
                                        </router-link>
                                        <template v-if="searchResult.topic.account == null || searchResult.topic.account == ''">
                                            <span class="avatarImg">
                                                <img v-if="searchResult.topic.avatarName == null" :src="searchResult.topic.avatar" class="img"/>
                                            </span>
                                        </template>
                                    </div>
                                    <div class="middle-layout">
                                        <div class="userInfo">
                                            
                                            
                                            <span v-if="(searchResult.topic.nickname == null || searchResult.topic.nickname == '') && searchResult.topic.account != null && searchResult.topic.account != ''" class="account">{{searchResult.topic.account}}</span>
                                            <span v-if="searchResult.topic.nickname != null && searchResult.topic.nickname != ''" class="account">{{searchResult.topic.nickname}}</span>
                                            <span class="userRoleName" v-for="roleName in searchResult.topic.userRoleNameList">{{roleName}}</span>
                                            <!-- 官方人员 -->
                                            <span class="staff" v-if="searchResult.topic.isStaff">{{t('search.60')}}</span>
                                            <!-- 已注销 -->
                                            <div v-if="searchResult.topic.account == null || searchResult.topic.account == ''" class="cancelNickname">{{t('search.70')}}</div>   
                                            <span class="time">{{searchResult.topic.postTime}}</span>
                                        </div>
                                    </div>
                                    
                                </div>
                                <div class="middle-container">
                                    <!-- 此用户账号已注销 -->
                                    <div class="cancelAccount" v-if="searchResult.topic.account == null || searchResult.topic.account == ''">{{t('search.80')}}</div>
                                    <div class="topic-layout">
                                        <router-link tag="span" class="title highlight" :to="{path: '/thread', query: {topicId: searchResult.topic.id}}" ><span v-html="searchResult.topic.title"></span></router-link>
                                        <span class="topicRoleName" v-for="roleName in searchResult.topic.allowRoleViewList">{{roleName}}</span>
                               
                                        <!--
                                        <span class="essence" v-if="topic.essence == true"><span>精华</span></span>
                                        <span class="top" v-if="topic.sort >0"><span>置顶</span></span>
                                        -->
                                    
                                        <span class="redEnvelope" v-if="searchResult.topic.giveRedEnvelopeId != null && searchResult.topic.giveRedEnvelopeId != ''"><Icon name="redEnvelope-1" :size="convertViewportWidth('20px')" /></span>
                                

                                    </div>
                                    <div class="detail">
                                        <div class="summary van-multi-ellipsis--l2 highlight">
                                            <router-link tag="span" :to="{path: '/thread', query: {topicId: searchResult.topic.id}}" ><span v-html="searchResult.topic.content"></span></router-link>
                                        </div>
                                        
                                    </div>
                                    
                                </div>
                                <div class="bottom-container">
                                    <div class="left-layout">
                                        <!-- 话题 -->
                                        <div class="tagName">{{t('search.90')}}</div>
                                    </div>
                                    <div class="right-layout">
                                        <div class="statistics">
                                            <Icon name="commentCount" :size="convertViewportWidth('14px')" class="icon"/><span class="commentTotal">{{searchResult.topic.commentTotal}}</span>
                                            <Icon name="view" :size="convertViewportWidth('14px')" class="icon"/><span class="viewTotal">{{searchResult.topic.viewTotal}}</span>
                            

                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="item" v-if="searchResult.indexModule == 20">
                                <div class="top-container">
                                    <div class="left-layout">
                                        <router-link v-if="searchResult.question.account != null && searchResult.question.account != ''" tag="a" :to="{path:'/user/control/home',query: {userName: searchResult.question.userName}}">
                                            <span class="avatarImg">
                                                <img v-if="searchResult.question.avatarName != null" :src="searchResult.question.avatarPath+'100x100/'+searchResult.question.avatarName" class="img">
                                            
                                                <img v-if="searchResult.question.avatarName == null" :src="searchResult.question.avatar" class="img"/>
                                            </span>
                                        </router-link>
                                        <template v-if="searchResult.question.account == null || searchResult.question.account == ''">
                                            <span class="avatarImg">
                                                <img v-if="searchResult.question.avatarName == null" :src="searchResult.question.avatar" class="img"/>
                                            </span>
                                        </template>
                                    </div>
                                    <div class="middle-layout">
                                        <div class="userInfo">
                                            
                                            <span v-if="(searchResult.question.nickname == null || searchResult.question.nickname == '') && searchResult.question.account != null && searchResult.question.account != ''" class="account">{{searchResult.question.account}}</span>
                                             <span v-if="searchResult.question.nickname != null && searchResult.question.nickname != ''" class="account">{{searchResult.question.nickname}}</span>
                                            <span class="userRoleName" v-for="roleName in searchResult.question.userRoleNameList">{{roleName}}</span>
                                            <!-- 官方人员 -->
                                            <span class="staff" v-if="searchResult.question.isStaff">{{t('search.60')}}</span>
                                            <!-- 已注销 -->
                                            <div v-if="searchResult.question.account == null || searchResult.question.account == ''" class="cancelNickname">{{t('search.70')}}</div>
                                            <span class="time">{{searchResult.question.postTime}}</span>
                                        </div>
                                    </div>
                                    
                                </div>
                                <div class="middle-container">
                                    <!-- 此用户账号已注销 -->
                                    <div class="cancelAccount" v-if="searchResult.question.account == null || searchResult.question.account == ''">{{t('search.80')}}</div>
                                    <div class="topic-layout">
                                        <router-link tag="span" class="title highlight" :to="{path:'/question',query: {questionId: searchResult.question.id}}" ><span v-html="searchResult.question.title"></span></router-link>
                                        
                                    </div>
                                    <div class="detail">
                                        <div class="summary van-multi-ellipsis--l2 highlight">
                                            <router-link tag="span" :to="{path:'/question',query: {questionId: searchResult.question.id}}" ><span v-html="searchResult.question.content"></span></router-link>
                                        </div>
                                        
                                    </div>
                                    
                                </div>
                                <div class="bottom-container">
                                    <div class="left-layout">
                                        <!-- 问题 -->
                                        <div class="questionTagName">{{t('search.100')}}</div>
                                    </div>
                                    <div class="right-layout">
                                        <div class="statistics">
                                            <Icon name="commentCount" :size="convertViewportWidth('14px')" class="icon"/><span class="commentTotal">{{searchResult.question.answerTotal}}</span>
                                            <Icon name="view" :size="convertViewportWidth('14px')" class="icon"/><span class="viewTotal">{{searchResult.question.viewTotal}}</span>
                            

                                        </div>
                                    </div>
                                </div>
                            </div>
                        </template>
                    </van-list>
                </div>
            </van-pull-refresh>

    </div>
</div>
    <!-- 底部导航栏-->
    <BottomTabbar/>
</template>
<script lang="ts" setup>
    import { onMounted, getCurrentInstance, ComponentInternalInstance, reactive, watchEffect, onActivated,} from 'vue'
    import { AxiosResponse } from 'axios'
    import pinia from '@/store/store'
    import {useStore} from '@/store'
    import { storeToRefs } from 'pinia';
    import { convertViewportWidth } from '@/utils/px-to-viewport';
    import { onBeforeRouteUpdate } from 'vue-router';
    import { useRouter } from 'vue-router'
    import { SearchResult} from '@/types';
    import { letterAvatar } from '@/utils/letterAvatar';
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
            document.title = t('search.10')+' - ' + titleValue;//搜索
        }
    }, {
        flush: 'post'//在组件更新后触发，第一次运行需要组件渲染完成才执行
    })
    
    const state = reactive({
        keyword : '', //关键词
        searchResultList :[] as Array<SearchResult>,
        totalrecord : 0, //总记录数
		currentpage : 0, //当前页码
        totalpage : 1, //总页数
        maxresult: 12, //每页显示记录数  
        
        isRefreshing:false,//是否处于下拉加载中状态
        isError:false,//是否列表数据加载失败
        isLoading:false,//是否处于加载中状态
        isFinished:false,//是否加载完毕
        isSkeleton:true,//是否显示骨架屏
        isShowPage:false,//是否显示分页
    });

    //下拉刷新时触发
    const onRefresh = () => {
        state.isRefreshing = false;

      
        //重置
        state.searchResultList.length = 0;//分页
        state.totalrecord = 0; //总记录数
		state.currentpage = 0; //当前页码
        state.totalpage = 1; //总页数
        state.maxresult = 12; //每页显示记录数   
        

        state.isError = false;//是否列表数据加载失败
        state.isFinished = false; 

        state.isLoading = true;//手动触发查询数据需将'加载状态结束'设为true
        if(state.keyword != null && state.keyword != ''){
            searchData(state.currentpage+1);
		}else{
            state.isFinished = true;//是否加载完毕
        }
    };
    //加载列表
    const onLoad = () => {
        if(state.keyword != null && state.keyword != ''){
            searchData(state.currentpage+1);
		}else{
            state.isFinished = true;//是否加载完毕
        }
        
    }

    //搜索
    const onSearch = () => {
        let param = {} as any
        if(state.keyword){
			param.keyword = state.keyword
		}else{
            return;
        }
		router.push({
            path: '/search', 
            query:param
		});

        router.afterEach(() => {
            window.scrollTo(0,0); //切换路由之后滚动条始终在最顶部
        });
	}

    //搜索数据
    const searchData = (page: number| undefined) => {
        let param = {} as any
        if(state.keyword){
			param.keyword = state.keyword
		}
        if(page){
            param.page = page
        }
        proxy?.$axios({
            url: '/search',
            method: 'get',
            params:  param,
            showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
            showErrorMessage:false,// 是否显示错误提示
        })
        .then((response: AxiosResponse) => {
            if(response){
                const result: any = response.data;
                state.isSkeleton = false;//关闭骨架屏
                if(JSON.parse(result.success)){
                    let searchResultPage = result.searchResultPage;
                    if(searchResultPage != undefined && searchResultPage != null){
                        if(searchResultPage.records != null && searchResultPage.records.length >0){
                            for(let i:number=0; i<searchResultPage.records.length; i++){
                                let searchResult = searchResultPage.records[i];
                                if(searchResult.indexModule == 10){
                                    if(searchResult.topic.nickname != null && searchResult.topic.nickname !=''){
                                        searchResult.topic.avatar = letterAvatar(searchResult.topic.nickname, 62);
                                    }else{
                                        searchResult.topic.avatar = letterAvatar(searchResult.topic.account, 62);
                                    }
                                }else if(searchResult.indexModule == 20){
                                    if(searchResult.question.nickname != null && searchResult.question.nickname !=''){
                                        searchResult.question.avatar = letterAvatar(searchResult.question.nickname, 62);
                                    }else{
                                        searchResult.question.avatar = letterAvatar(searchResult.question.account, 62);
                                    }
                                }
                            }

                            state.searchResultList.push.apply(state.searchResultList,searchResultPage.records)

                        }
                        state.totalrecord = parseInt(result.searchResultPage.totalrecord);//服务器返回的long类型已转为String类型
                        state.currentpage = result.searchResultPage.currentpage;
                        state.totalpage = parseInt(result.searchResultPage.totalpage);//服务器返回的long类型已转为String类型
                        state.maxresult = result.searchResultPage.maxresult;

                        
                   }
                    
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


    //导航守卫
    onBeforeRouteUpdate((to, from, next) => {
        if(to.name == 'search'){
            let keyword:string = '';
            if(to.query.keyword != undefined){
                keyword = to.query.keyword as string
            }
            state.keyword = decodeURIComponent(keyword);

            //删除缓存
            store.setCacheNumber(to.name)
        }
        
        next();
    });


    onMounted(() => {
        let keyword:string = router.currentRoute.value.query.keyword != undefined ?router.currentRoute.value.query.keyword as string :'';
        state.keyword = decodeURIComponent(keyword);

        //if(state.keyword != null && state.keyword != ''){
         //   state.isLoading = true;//手动触发查询数据需将'加载状态结束'设为true
         //   searchData(1);
		//}
       
        //设置缓存
        store.setCacheComponents(String(router.currentRoute.value.name))
    }) 

    //进入keep-alive组件时触发
    onActivated(()=>{
        //后退时修改浏览器标题
        let titleValue = store_title.value
        if(titleValue != null && titleValue != ''){
            document.title = t('search.10')+' - ' + titleValue;//搜索
        }
    })
</script>
<style scoped lang="scss">
//修复打包后搜索框背景颜色变白
.searchKeyword{
    :deep(.van-cell){
        padding : 0px 0px;
        background : var(--van-gray-1);
    }
    :deep(.van-cell__value){
        margin-right: 10px;
    }
}
.searchModule{
    margin: var(--van-cell-group-inset-padding) var(--van-cell-group-inset-padding) 58px var(--van-cell-group-inset-padding);
 
   .item{
       padding: 12px 12px 12px 12px;
       margin-bottom: 8px;
       border-radius: var(--van-border-radius-lg);
       background: #fff;
       position: relative;
       .ribbon-wrapper {
           width: 70px;
           height: 70px;
           overflow: hidden;
           position: absolute;
           top: 0px;
           right: 0px; 
           border-radius: var(--van-border-radius-lg);
           .container{
               position: relative;
               .angle{
                   text-align :center;
                   transform: rotate(45deg);
                   position :absolute;

                   top:-25px;
                   right:-25px;

                   background-color:#F87770;
                   color: #fff;
                   width: 50px;
                   height: 50px;
                   display: flex;
                   align-items :flex-end;
                   justify-content :center;
                   
                   
                   span{
                       display: block;
                       font-size: 12px;
                       line-height: 10px;
                       transform: scale(0.8,0.8);
                       position: relative;
                       top: -3px;
                       left: 1px;
                   }
               }
               .ribbon {
                   text-align: center;
                   transform: rotate(45deg);
                   position: absolute;
                   padding: 3px 0;
                   left: 0px;
                   top: 15px;
                   width:94px;
                   height: 10px;
                   background-color: #69B4FC;
                   color: #fff;
                   span{
                       display: block;
                       font-size: 12px;
                       line-height: 10px;
                       transform: scale(0.8,0.8);
                   }
               }

               .single-essence{
                   background-color: #F87770;
               }
               .single-top{
                   background-color: #69B4FC;
               }

              

           }
           
       }
       .top-container{
           display: flex;
           align-items:center;
           .left-layout{
               .avatarImg{
                   img {
                       width: 40px;
                       height: 40px;
                       border-radius:40px;
                       vertical-align: middle;
                   }
               }
           }
           .middle-layout{
               flex: 1;
               margin-left: 10px;
               margin-right: 10px;
               .userInfo{
                   display: flex; 
                   align-items: center;
                   flex-wrap: wrap;
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
                       left: -5px;
                       margin-top: 2px;
                       margin-bottom: 2px;
                   }
                   .cancelNickname{
                        font-weight:normal;
                        margin-right: 3px;
                        color: transparent;
                        text-shadow: 0 0 5px rgba(0,0,0,0.4);
                        zoom: 1;
                        user-select:none;
                    }
                   .account{
                       color: var(--van-gray-7);
                       margin-right: 5px;
                       position: relative;
                       top: -2px;
                   }  
                   .userRoleName{
                       display: inline-block;
                       white-space:nowrap;
                       vertical-align: middle;
                       padding: 3px 4px;
                       margin-right: 5px;
                       margin-bottom: 5px;
                       font-size: 12px;
                       line-height: 12px;
                       -webkit-border-radius: 2px;
                       -moz-border-radius: 2px;
                       border-radius: 2px;
                       color:#e2b46e;
                       background-color:#f8e7c4;
                       position: relative;
                       top: 1px;
                   }
                   .staff{
                       display: inline-block;
                       white-space:nowrap;
                       vertical-align: middle;
                       padding: 3px 4px;
                       margin-right: 5px;
                       margin-bottom: 5px;
                       font-size: 12px;
                       line-height: 12px;
                       -webkit-border-radius: 2px;
                       -moz-border-radius: 2px;
                       border-radius: 2px;
                       color:#4CD263;
                       background-color:#cafcc7;
                       position: relative;
                       top: 1px;
                   }
                   .time{
                       width:100%;
                       color: var(--van-gray-6);
                       font-size: 12px;
                       margin-top: 3px;
                   }
               }
               
           }
       }
       .middle-container{
           margin-top: 10px;
           .cancelAccount{
               display: inline-block;
               vertical-align: middle;
               padding: 6px 6px;
               font-size: 14px;
               line-height: 14px;
               -webkit-border-radius: 2px;
               -moz-border-radius: 2px;
               border-radius: 2px;
               color: var(--van-gray-5);
               background-color: var(--van-gray-1);
               margin-bottom: 6px;
           }
           .topic-layout {
               font-size:0;/*父级元素设置font-size:0; 解决 display：inline-block两个元素之间的默认空格 */
               .title{
                   color: var(--van-gray-8);
                   font-size: 18px;
                   line-height: 32px;
               }
               .topicRoleName{
                   display: inline-block;
                   white-space:nowrap;
                   vertical-align: middle;
                   padding: 2px 4px;
                   margin-left:5px;
                   font-size: 14px;
                   line-height: 16px;
                   -webkit-border-radius: 2px;
                   -moz-border-radius: 2px;
                   border-radius: 2px;
                   color: #fff;
                   background-color:#F9CC45;
                   position: relative;
                   top: -6px;
               }
               .redEnvelope{
                   font-size: 22px;
                   position:relative;
                   top:4px;
                   color: #ff483a;
                   margin-left: 3px;
               }
               .hideTagType{
                   font-size:0;/*父级元素设置font-size:0; 解决 display：inline-block两个元素之间的默认空格 */
                   position:relative;
                   top:-4px;
                   .circle{
                       border-radius:12px;display: inline-block;margin-left:5px;
                       width: 24px;height: 24px;
                       position:relative;
                       .icon{
                           margin-left: 5px;position:relative;top:4px;
                       }
                   }
                   .point{
                       &:before{
                           content: ' ';
                           position: absolute;
                           width: 4px;
                           height: 4px;
                           border-radius: 2px;
                           top: 13px;
                           left: 10px;
                       }
                   }
               }
               .hide_10{
                   .circle{
                       background: #ebebeb;
                       .icon{
                           color: #b2b2b2;
                       }
                   }
                   .point{
                       &:before{
                           background-color: #ebebeb;
                       }
                   }
               }
               .hide_20{
                   .circle{
                       background: #bbf9d5;
                       .icon{
                           color: #21de70;
                       }
                   }
                   .point{
                       &:before{
                           background-color: #bbf9d5;
                       }
                   }
               }
               .hide_30{
                   .circle{
                       background: #bfebfb;
                       .icon{
                           color: #27c3fc;
                       }
                   }
                       .point{
                       &:before{
                           background-color: #bfebfb;
                       }
                       }
               }
               .hide_40{
                   .circle{
                       background: #e2cffe;
                       .icon{
                           color: #af82f2;
                       }
                   }
                   .point{
                       &:before{
                           background-color: #e2cffe;
                       }
                   }
               }
               .hide_50{
                   .circle{
                       background: #fedbb2;
                       .icon{
                           color: #fe9d2d;
                       }
                   }
                   .point{
                       &:before{
                           background-color: #fedbb2;
                       }
                   }
               }
               .essence{
                   display: inline-block;
                   vertical-align: middle;
                   padding: 2px 4px;
                   margin-left:5px;
                   font-size: 14px;
                   line-height: 16px;
                   -webkit-border-radius: 2px;
                   -moz-border-radius: 2px;
                   border-radius: 2px;
                   color: #fff;
                   background-color: #F76560;
                   position: relative;
                   top: -6px;
               }
               .top{
                   display: inline-block;
                   vertical-align: middle;
                   padding: 2px 4px;
                   margin-left:5px;
                   font-size: 14px;
                   line-height: 16px;
                   -webkit-border-radius: 2px;
                   -moz-border-radius: 2px;
                   border-radius: 2px;
                   color: #fff;
                   background-color: #57A9FB;
                   position: relative;
                   top: -6px;
               }
           }
           .detail{
               position: relative;
               .imageZoom{
                   margin-top:8px;
                   .imageZoom-container {
                       margin: 2px 0px 0px 0px;
                       display: flex;
                       flex-wrap: wrap;
                       max-width: 100%;
                       
                       .image-box{
                           width: calc((100% - 16px)/3);/*每行3张图片，每张图片8px间隔 每行最后一张图片0px间隔 */
                           
                           //flex: 0 1 auto;
                           margin-top: 8px;
                           margin-right: 8px;
                           &:nth-child(3n){
                               margin-right: 0px;//最后一张图片不设置右边距
                           }
                           .image-column{
                               position: relative;
                               height: 0;
                               padding-bottom: 100%;
                               overflow: hidden;
                               .img {
                              
                                   position: absolute;
                                   width: 100%;
                                   height: 100%;
                               }
                           }

                           
                       }
                       
                   }
               }
               .videoInfo{
                   margin: 10px 0 0 0;
                   player{
                       width: 320px;
                       height: 180px;
                       display: block;
                       margin-right: 8px;
                       margin-bottom: 8px;
                       background: #000;
                       position: relative;
                       text-align: center;
                       .cover{
                           max-height: 100%;  
                           max-width: 100%; 
                           width: auto;
                           height: auto;
                           position: absolute;  
                           top: 0;  
                           bottom: 0;  
                           left: 0;  
                           right: 0;  
                           margin: auto;
                       }
                       .circle{
                           display: inline-block;
                           position: absolute;
                           top: 0;  
                           bottom: 0;  
                           left: 0;  
                           right: 0;  
                           margin: auto;
                           line-height:180px;
                           border-radius:30px;
                           width: 60px;
                           height: 60px;
                           background-color: rgba(0,0,0,0.5);
                       }
                       .iconBox{
                           display: block;
                           position: relative;
                           width: 60px;
                           height: 60px;
                           .playIcon{
                               font-size: 30px;
                               position: absolute;  
                               line-height:22px; 
                               width: 22px;
                               height: 22px;
                               top: 0;  
                               bottom: 0;  
                               left: 0;  
                               right: 0;  
                               margin: auto;
                               color: #fff;
                           }
                       }
                       :deep(.dplayer-process) {
                           position: absolute;
                           top: 0;
                           bottom: 0;
                           left: 0;
                           right: 0;
                           z-index: 99;
                           .box{
                               position: relative;
                               width: 100%;
                               height: 100%;
                               .prompt{
                                   width: 250px;
                                   height: 40px;
                                   position: absolute;
                                   left: 0;
                                   top: -110px;
                                   right: 0;
                                   bottom: 0;
                                   margin: auto;
                                   padding :0px 30px;
                                   border-radius :3px;
                                   color: #fff;
                                   line-height: 40px;
                                   font-size: 16px;
                                   background-color:rgb(0,0,0);
                                   opacity:0.7;
                                   text-align: center;
                                   &:before{
                                       content: '';
                                       position: absolute;
                                       left: 0;
                                       top: 0;
                                       right: 0;
                                       bottom: -110px;
                                       margin: auto;
                                       background-color: rgba(255,255,255);
                                       border-radius:30px;
                                       width: 60px;
                                       height: 60px;
                                       opacity:0.3;
                                   }
                               }
                           }
                       }
                       //关闭页面全屏按钮
                       :deep(.dplayer-full-in-icon){
                           display: none;
                       }
                   }
                   
               }
               
               .summary{
                   margin-top: 6px;
                   a{
                       font-size: 15px;
                       line-height: 28px;
                       font-weight:normal;
                       text-decoration:none;
                       color: var(--van-gray-7);
                   }
               }
           }
       }
   }
   .bottom-container{
       margin-top: 15px;
       display: flex;
       .left-layout{
           flex: 1;
           margin-right: 10px;
           .tagName{
               background-color: var(--van-gray-1);
               font-size: 14px;
               line-height: 14px;
               display: inline-block;
               padding: 6px 6px 6px 6px;
               -moz-border-radius: 2px;
               -webkit-border-radius: 2px;
               border-radius: 2px;
               text-decoration: none;
               color: var(--van-gray-6);
               word-break:break-all;
           }
           .questionTagName{
                background-color: #E8F3FF;
                font-size: 14px;
                line-height: 14px;
                display: inline-block;
                padding: 6px 6px 6px 6px;
                -moz-border-radius: 2px;
                -webkit-border-radius: 2px;
                border-radius: 2px;
                text-decoration: none;
                color: var(--van-blue);
                word-break:break-all;
           }
           
       }
       .right-layout{
           color: var(--van-gray-6);
           font-size: 14px;
           margin-top: 3px;
           .statistics{
               .icon{
                   position: relative;
                   top: 2px;
               }
               .commentTotal{
                   margin-left: 2px;
                   margin-right: 12px;
               }
               .viewTotal{
                   margin-left: 2px;
               }
           }
           
       }
   }
   :deep(.highlight){
        B{
            color: #F53F3F;
            font-weight:normal;
        }
    }
   .skeleton{
       padding-top: 16px;
       padding-bottom: 16px;
   }
}
</style>