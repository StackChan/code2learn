<!-- 首页 -->
<template>
    <div class="main">
        <div class="main-container">
            <van-sticky>
                <div class="headModule">
                    <div class="container">
                        <div class="left-layout">
                            <div class="tagIcon" @click="displayAllTag();"><Icon name="menu-alt" :size="convertViewportWidth('18px')" class="icon"/></div>
                            <!-- 全部 -->
					        <div class="tagName" @click="displayAllTag();">{{state.tagName == '' ?  t('index.10') : state.tagName}}</div>
                        </div>
                        <div class="right-layout">
                            <!-- 发表话题 -->
                            <van-button plain round type="primary" @click="router.push({path: '/addTopic'})">{{t('index.20')}}</van-button>
                        </div>
                    </div>
                  <div class="container full-width">
                    <van-search
                        v-model="state.keyword"
                        placeholder="请输入搜索关键词"
                        @search="onSearch()"
                        clearable
                    />
                  </div>
                </div>
            </van-sticky>
            <van-popup v-model:show="state.popup_allTag" safe-area-inset-top safe-area-inset-bottom :close-on-popstate="true" position="left" closeable close-icon="close" class="custom-left-popupModule" :style="{ width: '50%',height: '100%'  }">
                <div class="scroll">
                    <van-sidebar v-model="state.tag_sidebar_active" @change="onChangeTag" class="tag-sidebar">
                        <!-- title="全部" -->
                        <van-sidebar-item :title="t('index.10')"/>

                        <van-sidebar-item v-for="(tag,index) in state.tagList" >
                            <template #title>
                                <div class="name">{{tag.name}}</div>
                                <div class="allowRoleView">
                                    <span v-if="tag.allowRoleViewList != null && tag.allowRoleViewList.length > 0" v-for="(allowRoleView,index) in tag.allowRoleViewList">{{allowRoleView}}<span v-if="(index+1) < tag.allowRoleViewList.length" class="space"></span></span>
                                </div>

                            </template>
                        </van-sidebar-item>
                    </van-sidebar>
                </div>
            </van-popup>
            <!-- 占位播放器 -->
            <div ref ="placeholderVideo" style="width: 0px;height: 0px;"></div>
            <!-- success-text="刷新成功" -->
            <van-pull-refresh v-model="state.isRefreshing" :success-text="t('common.130')" pull-distance="200" @refresh="onRefresh" style="min-height: 50vh;">
                <div class="indexModule" >
                    <!-- error-text="请求失败，点击重新加载" finished-text="没有更多了" -->
                    <van-list v-model:loading="state.isLoading" :finished="state.isFinished" v-model:error="state.isError" :error-text="t('common.140')" :finished-text="t('common.150')" @load="onLoad">

                        <div v-for="(topic,index) in state.topicList" :key="topic.id" class="item">
                            <div class="ribbon-wrapper">
                                <div class="container">
                                    <template v-if="topic.essence && topic.sort >0">
                                        <div class="angle"><span>{{t('index.50')}}</span></div><!-- 精华 -->
                                        <div class="ribbon"><span>{{t('index.60')}}</span></div><!-- 置顶 -->
                                    </template>
                                    <template v-else>
                                        <!-- 精华 -->
                                        <div class="angle single-essence" v-if="topic.essence"><span>{{t('index.50')}}</span></div>
                                        <!-- 置顶 -->
                                        <div class="angle single-top" v-if="topic.sort >0"><span>{{t('index.60')}}</span></div>
                                    </template>

                                </div>
                            </div>
                            <div class="top-container">
                                <div class="left-layout">
                                    <router-link v-if="topic.account != null && topic.account != ''" tag="a" :to="{path:'/user/control/home',query: {userName: topic.userName}}">
                                        <span class="avatarImg">
                                            <img v-if="topic.avatarName != null" :src="topic.avatarPath+'100x100/'+topic.avatarName" class="img">

                                            <img v-if="topic.avatarName == null" :src="topic.avatar" class="img"/>
                                        </span>
                                    </router-link>
                                    <template v-if="topic.account == null || topic.account == ''">
                                        <span class="avatarImg">
                                            <img v-if="topic.avatarName == null" :src="topic.avatar" class="img"/>
                                        </span>
                                    </template>
                                </div>
                                <div class="middle-layout">
                                    <div class="userInfo">
                                        <span v-if="(topic.nickname == null || topic.nickname == '') && topic.account != null && topic.account != ''" class="account">{{topic.account}}</span>
                                        <span v-if="topic.nickname != null && topic.nickname != ''" class="account">{{topic.nickname}}</span>
                                        <span class="userRoleName" v-for="roleName in topic.userRoleNameList">{{roleName}}</span>
                                        <!-- 官方人员 -->
                                        <span class="staff" v-if="topic.isStaff">{{t('index.70')}}</span>
                                        <!-- 已注销 -->
                                        <div v-if="topic.account == null || topic.account == ''" class="cancelNickname">{{t('index.80')}}</div>
                                        <span class="time">{{topic.postTime}}</span>
                                    </div>
                                </div>

                            </div>
                            <div class="middle-container">
                                <!-- 此用户账号已注销 -->
                                <div class="cancelAccount" v-if="topic.account == null || topic.account == ''">{{t('index.90')}}</div>
                                <div class="topic-layout">
                                    <router-link tag="span" class="title" :to="{path: '/thread', query: {topicId: topic.id}}" >{{topic.title}}</router-link>
                                    <span class="topicRoleName" v-for="roleName in topic.allowRoleViewList">{{roleName}}</span>
                                    <span :class="'hideTagType hide_'+key"  v-for="(value, key) in topic.hideTagTypeMap">
                                        <span class="circle point" v-if="value"><Icon name="unlock-solid" :size="convertViewportWidth('14px')" class="icon"/></span>
                                        <span class="circle" v-if="!value"><Icon name="lock-solid" :size="convertViewportWidth('14px')" class="icon"/></span>
                                    </span>
                                    <!--
                                    <span class="essence" v-if="topic.essence == true"><span>精华</span></span>
                                    <span class="top" v-if="topic.sort >0"><span>置顶</span></span>
                                    -->
                                    <span class="redEnvelope" v-if="topic.giveRedEnvelopeId != null && topic.giveRedEnvelopeId != ''"><Icon name="redEnvelope-1" :size="convertViewportWidth('20px')" /></span>
                                </div>
                                <div class="detail">
<!--                                  封面展示图片-->
                                    <div class="imageZoom" v-if="topic.imageInfoList.length > 0">
                                        <div class="imageZoom-container">
                                            <template v-for="(imageInfo,index) in topic.imageInfoList" >
                                                <!-- 最多显示6张图片 -->
                                                <div class="image-box" v-if="index <6" ref="imageInfoGroupRef">
                                                    <!-- 本地缩略图 -->
                                                    <div class="image-column" v-if="store_fileStorageSystem ==0">
                                                        <van-image :src="imageInfo.path+'240x240/'+imageInfo.name" lazy-load fit="cover" radius="8px" class="img" @click="onZoomPicture(imageInfo.name,topic.imageInfoList);"></van-image>
                                                    </div>
                                                    <!-- SeaweedFS缩略图 使用nginx image_filter的缩略图处理功能 -->
                                                    <div class="image-column" v-if="store_fileStorageSystem ==10">
                                                        <van-image :src="imageInfo.path+imageInfo.name+'?width=240'" lazy-load fit="cover" radius="8px" class="img" @click="onZoomPicture(imageInfo.name,topic.imageInfoList);"></van-image>
                                                    </div>
                                                    <!--  MinIO缩略图 使用nginx image_filter的缩略图处理功能 -->
                                                    <div class="image-column" v-if="store_fileStorageSystem ==20">
                                                        <van-image :src="imageInfo.path+imageInfo.name+'?width=240'" lazy-load fit="cover" radius="8px" class="img" @click="onZoomPicture(imageInfo.name,topic.imageInfoList);"></van-image>
                                                    </div>
                                                    <!-- 阿里云OSS缩略图 -->
                                                    <div class="image-column" v-if="store_fileStorageSystem ==30">
                                                        <van-image :src="imageInfo.path+imageInfo.name+'?x-oss-process=image/resize,w_240'" lazy-load fit="cover" radius="8px" class="img" @click="onZoomPicture(imageInfo.name,topic.imageInfoList);"></van-image>
                                                    </div>
                                                </div>
                                            </template>
                                        </div>
                                    </div>
<!--封面展示视频-->
                                    <div class="videoInfo" v-if="topic.mediaInfoList.length > 0">
                                        <template v-for="(mediaInfo,index) in topic.mediaInfoList">
                                           <!--视频最多显示1个-->
                                            <player v-if="index <1" :ref="'player_'+topic.id+'_'+index"  @click="createVideoPlayer(mediaInfo,index,topic.id);">
                                                <img class="cover" :src="mediaInfo.cover"/>
                                                <span class="circle">
                                                    <span class="iconBox">
                                                        <Icon name="control-play" size="30px" class="playIcon"/>
                                                    </span>
                                                </span>
                                            </player>
                                        </template>
                                    </div>


                                    <div class="summary van-multi-ellipsis--l2" v-if="topic.imageInfoList.length == 0 && topic.mediaInfoList.length == 0">
                                        <router-link tag="span" :to="{path: '/thread', query: {topicId: topic.id}}" >{{topic.summary}}</router-link>
                                    </div>

                                </div>

                            </div>
                            <div class="bottom-container">
                                <div class="left-layout">
                                    <div class="tagName">{{topic.tagName}}</div>
                                </div>
                                <div class="right-layout">
                                    <div class="statistics">
                                        <Icon name="commentCount" :size="convertViewportWidth('14px')" class="icon"/><span class="commentTotal">{{topic.commentTotal}}</span>
				            	        <Icon name="view" :size="convertViewportWidth('14px')" class="icon"/><span class="viewTotal">{{topic.viewTotal}}</span>


                                    </div>
                                </div>
                            </div>
                        </div>

                    </van-list>

                    <div class="item" v-if="state.isSkeleton">
                        <van-skeleton :row="3" :loading="state.isSkeleton" class="skeleton"/>
                    </div>
                </div>
            </van-pull-refresh>

    </div>
</div>
    <!-- 底部导航栏-->
    <BottomTabbar/>
</template>
<script lang="ts" setup>
    import { onMounted, getCurrentInstance, ComponentInternalInstance, reactive, ref, onUnmounted, watchEffect, onActivated,} from 'vue'
    import { AxiosResponse } from 'axios'
    import pinia from '@/store/store'
    import {useStore} from '@/store'
    import { storeToRefs } from 'pinia';
    import { convertViewportWidth } from '@/utils/px-to-viewport';
    import { ImagePreview } from 'vant';
    import { onBeforeRouteUpdate } from 'vue-router';
    import { useRouter } from 'vue-router'
    import { ImageInfo, MediaInfo, PageView, Tag, Topic } from '@/types';
    import { letterAvatar } from '@/utils/letterAvatar';
    import Hls from 'hls.js';
    import DPlayer from 'dplayer';
    import { getPageBasePath } from '@/utils/tool';
    import { nativeQueryVideoRedirect, nativeRefreshToken } from '@/utils/http';
    import { useI18n } from 'vue-i18n';
    let { t } = useI18n();

    const store = useStore(pinia);
    const router = useRouter();
    const { proxy } = getCurrentInstance() as ComponentInternalInstance;

    const {title:store_title,keywords:store_keywords,description:store_description,systemUser:store_systemUser,fileStorageSystem:store_fileStorageSystem,currentLanguage:store_currentLanguage} = storeToRefs(store)

    const placeholderVideo = ref();


    const state = reactive({
        popup_allTag :false,
        tag_sidebar_active:0,//Sidebar 侧边导航
        tagId :'',//标签Id
	   	tagName :'',//标签名称
        tagList:[] as Array<Tag>,//标签集合
        keyword : null, //搜索关键字
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
        isShowPage:false,//是否显示分页

        videoPlayerBind: [] as Array<string>,//视频播放器绑定Id集合
		videoPlayerList: [] as Array<any>,//视频播放器集合
        playerHlsList: [] as Array<any>,//视频播放流对象集合
		placeholder_DPlayer:'' as any,//占位播放器
		lastPlayerId:'',//最后运行的播放Id
    });


    //下拉刷新时触发
    const onRefresh = () => {
        state.isRefreshing = false;

        //清除播放器
        clearPlayer();
        //重置
        state.popup_allTag = false;
        state.tag_sidebar_active = 0;//Sidebar 侧边导航
        state.tagId = '';//标签Id
		   state.tagName = '';//标签名称
        state.tagList.length = 0;//标签集合
      state.keyword=null;
        state.topicList.length = 0;
        state.totalrecord = 0; //总记录数
		   state.currentpage = 0; //当前页码
        state.totalpage = 1; //总页数
        state.maxresult = 12; //每页显示记录数

        state.videoPlayerBind.length = 0;//视频播放器绑定Id集合
        state.videoPlayerList.length = 0;//视频播放器集合
        state.playerHlsList.length = 0;//视频播放流对象集合
        state.placeholder_DPlayer = '' as any;//占位播放器
        state.lastPlayerId = '';//最后运行的播放Id

        state.isError = false;//是否列表数据加载失败
        state.isFinished = false;

        state.isLoading = true;//手动触发查询数据需将'加载状态结束'设为true
        init();
        queryTopicList(state.tagId,state.currentpage+1,state.keyword);
    };
    //加载列表
    const onLoad = () => {
        queryTopicList(state.tagId,state.currentpage+1,state.keyword);
    }


    //显示所有标签选择
    const displayAllTag = () => {
        state.popup_allTag = true;

        if(state.tagId == ''){
            state.tag_sidebar_active = 0;
            return;
        }else{
            if(state.tagList != null && state.tagList.length >0){
                for(let i=0; i<state.tagList.length; i++ ){
                    let tag = state.tagList[i];
                    if(tag.id == state.tagId){
                        state.tag_sidebar_active = (i+1);
                        break;
                    }
                }
            }
        }
    }


     //查询标签列表
     const queryTagList = () => {
        proxy?.$axios({
            url: '/allTag',
            method: 'get',
            params:  {},
            showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
        })
        .then((response: AxiosResponse) => {
            return response?.data
        })
        .then((data: Array<Tag>) => {
            if(data){
                for(let i=0; i<data.length; i++ ){
                    let tag = data[i];
                    if(tag.id == state.tagId){
                        state.tag_sidebar_active = (i+1);
                        state.tagName = tag.name;
                        break;
                    }
                }

                state.tagList = data;


            }
        })
        .catch((error: any) =>{
            console.log(error);
        });
    }

    //侧边导航选中标签
    const onChangeTag = (index:number) => {
        if(index == 0){
            state.popup_allTag = false;
            router.push({path: '/index'});
            return;
        }
        if(state.tagList != null && state.tagList.length >0){
            for(let i=0; i<state.tagList.length; i++ ){
                let tag = state.tagList[i];
                if((index-1) == i){
                    state.popup_allTag = false;
                    router.push({path: '/index', query:{ tagId : tag.id}})
                    break;
                }
            }
        }
    }

    //查询话题列表
    const queryTopicList = (tagId:string,page: number,keyword:string) => {
        let param = {} as any
        if(tagId){
			param.tagId = tagId
		}
        if(page){
            param.page = page
        }
      if (keyword && keyword.trim() !== "") { // 检查 keyword 是否为 null 或空字符串
        param.keyword = keyword;
      }
        proxy?.$axios({
            url: '/queryTopicList',
            method: 'get',
            params:  param,
            showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
            showErrorMessage:false,// 是否显示错误提示
        })
        .then((response: AxiosResponse) => {
            return response?.data
        })
        .then((data: PageView<Topic>) => {
            state.isSkeleton = false;//关闭骨架屏
            //清除播放器
            clearPlayer();

            if(data.records != null && data.records.length >0){
                for(let i:number=0; i<data.records.length; i++){
                    let topic = data.records[i];
                    if(topic.nickname != null && topic.nickname !=''){
                        topic.avatar = letterAvatar(topic.nickname, 40);
                    }else{
                        topic.avatar = letterAvatar(topic.account, 40);
                    }


                }
                state.topicList.push.apply(state.topicList,data.records)
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
        })
        .catch((error: any) =>{
            state.isError = true;
            state.isLoading = false;//加载状态结束
            console.log(error);
        });
    }

    //创建视频播放器
    const createVideoPlayer = (mediaInfo:MediaInfo,index:number,topicId:string) => {
        //创建占位播放器
        createPlaceholderPlayer();
        if(state.videoPlayerBind.contains(topicId+'_'+index)){
		    return;
		}
        let playerRefValue = (proxy?.$refs['player_'+topicId+'_'+index] as any)[0];
        playerRefValue.setAttribute('id','player_'+topicId+'_'+index);

        if(mediaInfo.mediaUrl == null || mediaInfo.mediaUrl == ""){
            if(playerRefValue.querySelector('.dplayer-process') == null){
                let dom = document.createElement('div');
                //视频处理中，请稍后再刷新
                dom.innerHTML="<div class='dplayer-process'><div class='box'><div class='prompt'>"+t('index.100')+"</div></div></div>";
                playerRefValue.appendChild(dom);
            }
        }else{
            state.videoPlayerBind.push(topicId+'_'+index);//视频播放器绑定Id
            //语言
            let lang = "en";
            if(store_currentLanguage.value == 'zh'){//语言 zh,en
                lang = 'zh-cn';
            }

            if(mediaInfo.cover != undefined && mediaInfo.cover != "" && mediaInfo.thumbnail != undefined && mediaInfo.thumbnail != ""){//切片视频
                let hls = null;
                let dp = new DPlayer({
                    container: playerRefValue,//播放器容器元素
                    screenshot: false,//开启截图，如果开启，视频和视频封面需要开启跨域
					          hotkey: true,//开启热键，支持快进、快退、音量控制、播放暂停
                    preload: 'none', //禁止视频预加载
                    lang:lang,
                    video: {
                        url: mediaInfo.mediaUrl,
                        pic: mediaInfo.cover,//视频封面
                        thumbnails: mediaInfo.thumbnail,//视频预览图
                        type: 'customHls',
                        customType: {
                            customHls: function (video:any, player:any) {
                                hls = new Hls();
                                hls.loadSource(video.src);
                                hls.attachMedia(video);
                                hls.config.xhrSetup = (xhr, url) => {
                                    if(url.startsWith(store.apiUrl+"videoRedirect?")){//如果访问视频重定向页
                                        //如果使用重定向跳转时会自动将标头Authorization发送到seaweedfs，seaweedfs会报501错误 A header you provided implies functionality that is not implemented
                                        //这里发送X-Requested-With标头到后端，让后端返回需要跳转的地址
                                        let videoRedirectDate = {} as any;
                                        nativeQueryVideoRedirect(url,function(date:any){
                                            if(store.systemUser != null && Object.keys(store.systemUser).length>0 && date.isLogin == false && date.isPermission == false){
                                                //会话续期
                                                nativeRefreshToken();
                                                nativeQueryVideoRedirect(url,function(date:any){
                                                    videoRedirectDate = date;
                                                });
                                            }else{
                                                videoRedirectDate = date;
                                            }

                                        });

                                        if(videoRedirectDate != null && Object.keys(videoRedirectDate).length>0 && videoRedirectDate.redirect != ''){
                                            //告诉hls重新发送ts请求
                                            xhr.open("GET", videoRedirectDate.redirect, true);//用重定向后的地址请求
                                            // xhr.setRequestHeader("X-Requested-With", 'XMLHttpRequest');
                                        }
                                    }else{
                                        // 请求ts的url 添加参数 props.fileid
                                        //url = url + "?t=" + props.fileid;
                                        // 这一步必须 告诉hls重新发送ts请求
                                        xhr.open("GET", url, true);
                                        //xhr.setRequestHeader("X-Requested-With", 'XMLHttpRequest');
                                    }
                                };
                            },
                        },
                    }
                });
                dp.play();//播放视频
                dp.on('play', function () {//播放事件
                    state.lastPlayerId = dp.container.getAttribute('id');
                });
                dp.on('pause', function () {//暂停事件
                    playPlaceholderPlayer(dp.container.getAttribute('id'));
                });
                state.videoPlayerList.push(dp);//视频播放器
                state.playerHlsList.push(hls);
            }else{
                let dp = new DPlayer({
                    container: playerRefValue,//播放器容器元素
                    screenshot: false,//开启截图，如果开启，视频和视频封面需要开启跨域
                    hotkey: true,//开启热键，支持快进、快退、音量控制、播放暂停
					          preload: 'none', //禁止视频预加载
                    lang:lang,
                    video: {
                        url: mediaInfo.mediaUrl
                    }
                });
                dp.play();//播放视频
                dp.on('play', function () {//播放事件
                    state.lastPlayerId = dp.container.getAttribute('id');
                });
                dp.on('pause', function () {//暂停事件
                    playPlaceholderPlayer(dp.container.getAttribute('id'));
                });
                state.videoPlayerList.push(dp);//视频播放器
            }
        }
    }

    //创建占位播放器(有部分浏览器会对video标签进行劫持，使播放器显示在最顶层,上下滚动时会破坏界面结构)
    const createPlaceholderPlayer = () => {
        if(state.placeholder_DPlayer == ""){
            let dp_placeholder = new DPlayer({
                container: placeholderVideo.value,//播放器容器元素
                screenshot: false,//开启截图，如果开启，视频和视频封面需要开启跨域
                video: {
                    url: getPageBasePath()+'common/default/pc/video/placeholderVideo.mp4',//占位用，1帧的mp4视频。
                }
            });
            state.placeholder_DPlayer = dp_placeholder;
        }
    }
    //占位播放器播放
    const playPlaceholderPlayer = (playerId:string) => {
        if(state.placeholder_DPlayer != ""){
            if(state.lastPlayerId == playerId){
                state.placeholder_DPlayer.play();
            }
        }
    }

    //清除播放器
    const clearPlayer = () => {
        for(let i =0; i<state.videoPlayerList.length; i++){
			var videoPlayer = state.videoPlayerList[i];
			videoPlayer.destroy();//销毁播放器
		}
        for(let i=0; i< state.playerHlsList.length; i++){
            let hls = state.playerHlsList[i];
            hls.destroy();//销毁视频流
        }
		if(state.placeholder_DPlayer != ""){
			state.placeholder_DPlayer.destroy();//销毁播放器
		}
        state.videoPlayerBind.length =0
        state.videoPlayerList.length =0;
        state.playerHlsList.length = 0;//清空数组
        state.lastPlayerId = '';
        state.placeholder_DPlayer = "";
    }

    //放大图片  模板中将点击事件绑定到本函数，作用域只限在这个子组件中
    const onZoomPicture = (imageName:string,imageInfoList:Array<ImageInfo>) => {
        let imageList = [];
        let index = 0;
        for(let i=0; i< imageInfoList.length; i++){
            let imageInfo = imageInfoList[i];
            if(imageName == imageInfo.name){
                index = i;
            }
            if(store_fileStorageSystem.value == 0){//本地图片
                imageList.push(imageInfo.path+imageInfo.name);
            }
            if(store_fileStorageSystem.value == 10){//SeaweedFS缩略图 使用nginx image_filter的缩略图处理功能
                imageList.push(imageInfo.path+imageInfo.name);
            }
            if(store_fileStorageSystem.value == 20){//MinIO缩略图 使用nginx image_filter的缩略图处理功能
                imageList.push(imageInfo.path+imageInfo.name);
            }
            if(store_fileStorageSystem.value == 30){//阿里云OSS缩略图
                imageList.push(imageInfo.path+imageInfo.name);
            }
        }
        ImagePreview({
            images: imageList,
            startPosition:index,
            showIndex:true,//是否显示页码
        });
    }

    //导航守卫
    onBeforeRouteUpdate((to, from, next) => {
        if(to.name == 'index'){
            if(to.query.tagId != undefined){
                state.tagId = to.query.tagId as string
            }

            //删除缓存
            store.setCacheNumber(to.name)

        }

        next();
    });

    onMounted(() => {
        init();
    })
    //卸载组件实例后调用
    onUnmounted (()=>{
        //清除播放器
        clearPlayer();
    })
    //初始化
    const init = () => {

        state.tagId = router.currentRoute.value.query.tagId != undefined ?router.currentRoute.value.query.tagId as string :'';

        queryTagList();

        //设置缓存
        store.setCacheComponents(String(router.currentRoute.value.name))
    }

    const onSearch = () => {
      state.currentpage = 0; // 重置当前页码
      state.topicList.length = 0; // 清空问题列表
      state.isFinished = false; // 重置加载状态
      state.isLoading = true; // 设置加载状态onLoad
      queryTopicList(state.tagId, state.currentpage + 1, state.keyword);
    };
    //html页元信息
    watchEffect(() => {
        let tagId = state.tagId;
        let titleValue = store_title.value//监听网站标题


        if(tagId == ''){
            document.title = (titleValue != null && titleValue != '' ? titleValue : '');
        }
        if(state.tagList != null && state.tagList.length >0){
            for(let i=0; i<state.tagList.length; i++ ){
                let tag = state.tagList[i];
                if(tag.id == tagId){
                    document.title = tag.name;
                    (document.getElementsByName('description')[0] as any).content  = tag.name;
                    break;
                }
            }
        }


    }, {
        flush: 'post'//在组件更新后触发，第一次运行需要组件渲染完成才执行
    })

    //进入keep-alive组件时触发
    onActivated(()=>{
        //后退时修改浏览器标题

    })
</script>
<style scoped lang="scss">

.headModule{
    background: #fff;
    box-shadow: 0 2px 12px rgba(100, 101, 102, .12);
    padding: 8px;
    .container{
        display: flex;
        align-items: center;
        margin-top: 4px;
        margin-bottom: 4px;
        .left-layout{
            flex: 1;
            display: flex;
            margin-right: 12px;
           // overflow:hidden;
          //  position: relative;
            .tagIcon{
                margin-left: 8px;
                font-size: 18px;
                color:var(--van-blue);
                padding:4px 0;
                margin-top: 3px;
            }
            .tagName{
                margin-left:12px;

                font-size: 16px;
                color:var(--van-blue);
                border-bottom:2px solid var(--van-blue);
                padding:4px 0;
                word-break:break-all;
            }

            /**
            &::before {
                content: " ";
                position: absolute;
                width: 16px;
                height: 100%;
                right:0;
                top: 0px;
                background-image: linear-gradient(90deg,rgba(255,255,255,0) 0%,#fff 100%);
            } */
        }

        .right-layout{
            margin-right: 8px;
            :deep(.van-button){
                height: 36px;
            }
        }
      .van-search {
        flex: 1; /* 使 van-search 占满剩余空间 */
      }
    }

}

.tag-sidebar{
    width: auto;
    margin-right: 10px;
    overflow:hidden;//让栏目触摸可以滑动
    .name{
        line-height: 24px;
    }
    .allowRoleView{
        line-height: 28px;
        color: var(--van-gray-6);
        .space{
            margin-right: 6px;
        }
    }
    :deep(.van-sidebar-item--select){
        &:before{
            background-color: var(--van-blue);
        }

    }
}
.indexModule{
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
                    .userRoleName{/**
                        display: inline-flex;
                        white-space:nowrap;
                        align-items: center;
                        padding: 2px 4px;
                        color: #e2b46e;
                        font-size: 12px;
                        line-height: 14px;
                        border-radius: 2px;
                        background-color:#f8e7c4;
                        margin-right: 5px;
                        margin-bottom: 5px;
                        position: relative;
                        top: 1px;*/

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
                    word-break: break-all;
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
            margin-right: 10px;
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
    .skeleton{
        padding-top: 16px;
        padding-bottom: 16px;
    }
}
</style>
