<!--帮助内容-->
<template>
    <div class="main">
        <div class="main-container">
            <van-sticky>
                <!--title="帮助内容" left-text="返回"-->
                <van-nav-bar :title="t('helpDetail.10')" :left-text="t('common.110')" left-arrow @click-left="onBack" @click-right="router.push({path: '/index'})">
                    <template #right>
                        <van-icon name="wap-home-o" :size="convertViewportWidth('18px')"/>
                    </template>
                </van-nav-bar>
            </van-sticky>
            <!-- 占位播放器 -->
            <div ref ="placeholderVideo" style="width: 0px;height: 0px;"></div>
            <!-- success-text="刷新成功" -->
            <van-pull-refresh v-model="state.isRefreshing" :success-text="t('common.130')" pull-distance="200" @refresh="onRefresh" style="min-height: 50vh;">
                <div class="helpContentModule">
                    <div class="head">
                        <div class="container">
                            <div class="icon" @click="showHelpList();"><Icon name="menu-unfold-fill" :size="convertViewportWidth('18px')"/></div>
                            <div class="typeName" @click="showHelpList();">{{state.helpNavigationName}}</div>
                        
                        </div>
                    </div>
                    <van-popup v-model:show="state.popup_helpList" safe-area-inset-top safe-area-inset-bottom :close-on-popstate="true" position="left" closeable close-icon="close" class="custom-left-popupModule" :style="{ width: '80%',height: '100%'  }">
                        <div class="scroll">
                            <van-sidebar v-model="state.help_sidebar_active" @change="onChangeHelp" class="help-sidebar">
                                <van-sidebar-item v-for="(help,index) in state.helpList">
                                    <template #title>
                                        <div class="name">{{help.name}}</div>
                                    </template>
                                </van-sidebar-item>
                            </van-sidebar>
                        </div>
                    </van-popup>
                    <div class="helpDetail"  v-if="!state.isSkeleton">
                        <h1 class="name">{{state.help.name}}</h1>
                        <div class="time van-hairline--bottom">{{state.help.times}}</div>
                        <div :class="[state.help.isMarkdown != null && state.help.isMarkdown == true ? 'markdown-body-custom helpMarkdownContent' : 'content']" :ref="'help_'+state.help.id">
                            <RenderTemplate @click-onZoomPicture="onZoomPicture" @click-onDownload="onDownload" :html="state.help.content"></RenderTemplate>
                                        
                        </div>
                    </div>
                    <div class="helpDetail" v-if="state.isSkeleton">
                        <van-skeleton :row="3" :loading="state.isSkeleton" class="skeleton"/>
                    </div>
                </div>
            </van-pull-refresh>
        </div>
    </div>
</template>

<script lang="ts" setup>
    import { getCurrentInstance, ComponentInternalInstance, reactive, onMounted, watchEffect, onUnmounted, ref, nextTick, onActivated} from 'vue'
    import pinia from '@/store/store'
    import {useStore} from '@/store'
    import { storeToRefs } from 'pinia';
    import { onBack } from '@/utils/history'
    import { convertViewportWidth } from '@/utils/px-to-viewport';
    import { onBeforeRouteUpdate, useRouter } from 'vue-router'
    import { AxiosResponse } from 'axios'
    import { Help } from "@/types/index";
    import { escapeHtml, escapeVueHtml,unescapeHtml } from '@/utils/escape';
    import { getLanguageClassName, getPageBasePath } from '@/utils/tool';
    import { ImagePreview} from 'vant';
    import Hls from 'hls.js';
    import DPlayer from 'dplayer';
    import Prism from "prismjs";
    import { nativeDownloadRedirect, nativeQueryVideoRedirect, nativeRefreshToken } from '@/utils/http';
    import mermaid from "mermaid";
    import katex from 'katex'
    import 'katex/dist/katex.css'   
    import { useI18n } from 'vue-i18n';
    let { t } = useI18n();

    mermaid.mermaidAPI.initialize({ startOnLoad: false });



    const { proxy } = getCurrentInstance() as ComponentInternalInstance;
    const store = useStore(pinia);
    const router = useRouter();
    const {title:store_title,keywords:store_keywords,description:store_description,systemUser:store_systemUser,currentLanguage:store_currentLanguage} = storeToRefs(store)
    const placeholderVideo = ref();


    //html页元信息
    watchEffect(() => {
        let titleValue = store_title.value//监听网站标题
      
        if(titleValue != null && titleValue != '' && state.help != null && Object.keys(state.help).length > 0){
            document.title = (state.help.name != null ? state.help.name : '')+ ' - ' + titleValue;
        }
    }, {
        flush: 'post'//在组件更新后触发，第一次运行需要组件渲染完成才执行
    })
     
    
     const state = reactive({
        helpTypeId : '',//帮助分类Id
        helpId : '',//帮助Id
        help : {} as Help, //帮助
        helpList : [] as Array<Help>, //帮助列表
        helpNavigationName : '', //帮助导航名称(导航最后一个节点名称)

        help_sidebar_active:0,//Sidebar 侧边导航
        popup_helpList:false,//帮助列表弹出层

        playerIdList: [] as Array<string>,//视频播放Id列表
		playerObjectList: [] as Array<any>,//视频播放对象集合
        playerHlsList: [] as Array<any>,//视频播放流对象集合
		playerNodeList: [] as Array<any>,//视频节点对象集合
        placeholder_DPlayer:'' as any,//占位播放器
        lastPlayerId:'',//最后运行的播放Id
        
        isSkeleton:true,//是否显示骨架屏
        isRefreshing:false,//是否处于下拉加载中状态
    })
    //错误
    const error = reactive({
    })
   
    //下拉刷新时触发
    const onRefresh = () => {
        state.isRefreshing = false;

        clearVideoPlayer();
        //重置
        state.help = {} as Help;//帮助
        state.helpList.length = 0; //帮助列表
        state.helpNavigationName = ''; //帮助导航名称(导航最后一个节点名称)

        state.playerIdList.length = 0;//视频播放Id列表
        state.playerObjectList.length = 0;//视频播放对象集合
        state.playerHlsList.length = 0;//视频播放流对象集合
        state.playerNodeList.length = 0;//视频节点对象集合
        state.placeholder_DPlayer = '';//占位播放器
        state.lastPlayerId = '';//最后运行的播放Id
        
        init();
    };

    //显示帮助列表界面
    const showHelpList = () => {
        state.popup_helpList = true;//显示帮助列表

        
        if(state.helpList != null && state.helpList.length >0){
            for(let i=0; i<state.helpList.length; i++ ){
                let help = state.helpList[i];
                if(help.id == state.helpId){
                    state.help_sidebar_active = i;
                    break;
                }
            }
        }
    }

    //侧边导航选中帮助
    const onChangeHelp = (index:number) => {
        if(state.helpList != null && state.helpList.length >0){
            for(let i=0; i<state.helpList.length; i++ ){
                let help = state.helpList[i];
                if(index == i){
                    state.popup_helpList = false;
                    router.push({path: '/helpDetail', query: {helpTypeId: help.helpTypeId, helpId:help.id}})
                    break;
                }
            }
        }
    }

    //查询帮助导航
    const queryHelpNavigation = (helpTypeId:string) => {
        proxy?.$axios({
            url: '/queryHelpNavigation',
            method: 'get',
            params:  {
                helpTypeId:helpTypeId
            },
            showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
        })
        .then((response: AxiosResponse) => {
            if(response){
                const result: any = response.data;
                
                if(result && Object.keys(result).length >0){
                    for(let key in result){
                        state.helpNavigationName = result[key];
					}
                }
            }
        })
        .catch((error: any) =>{
            console.log(error);
        });
    }

    //查询帮助列表
    const queryHelpList = (helpTypeId:string,callback: any) => {
        proxy?.$axios({
            url: '/queryHelpList',
            method: 'get',
            params:  {
                helpTypeId: helpTypeId
            },
            showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
        })
        .then((response: AxiosResponse) => {
            return response?.data
        })
        .then((data: Array<Help>) => {
            if(data != null && data.length > 0){
                state.helpList = data;
                callback();
            }
        })
        .catch((error: any) =>{
            console.log(error);
        });
    }

    //查询帮助
    const queryHelp = (helpId:string) => {
        proxy?.$axios({
            url: '/queryHelp',
            method: 'get',
            params:  {
                helpId: helpId
            },
            showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
        })
        .then((response: AxiosResponse) => {
            return response?.data
        })
        .then((data: Help) => {
            state.isSkeleton = false;//关闭骨架屏
            if(data){
                //清空播放器
                clearVideoPlayer();
                
                //处理隐藏标签
                let contentNode = document.createElement("div");
                contentNode.innerHTML = data.content;
                
                bindNode(contentNode);
                data.content = escapeVueHtml(contentNode.innerHTML);
        
                
                state.help = data;

                nextTick(function() {
                    setTimeout(function() {
                        renderVideoPlayer();//渲染视频播放器
                    }, 30);
                    
                    //渲染代码
                    let helpRefValue = proxy?.$refs['help_'+helpId];
                    if(helpRefValue != undefined){
                        renderBindNode(helpRefValue); 
                    }
                }); 
            }
        })
        .catch((error: any) =>{
            console.log(error);
        });
    }

    
    //文件下载
    const onDownload = (href: string) => {
        let regx = new RegExp("^"+store.apiUrl,"i");//忽略大小写
        let path = href.replace(regx,"")

        proxy?.$axios({
            url: '/'+path,
            method: 'get',
            params:  {
            },
            showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
        })
        .then((response: AxiosResponse) => {
            if(response){
                const result: any = response.data;
                if(JSON.parse(result.success)){
                    location.href = result.redirect;
                }
            }
        }).catch((error: any) =>{
            console.log(error);
        });
    }

    //递归绑定节点参数
    const bindNode = (node:any) => {
        
        
        //先找到子节点
        let nodeList = node.childNodes;
        for(let i = 0;i < nodeList.length;i++){
            //childNode获取到到的节点包含了各种类型的节点
            //但是我们只需要元素节点  通过nodeType去判断当前的这个节点是不是元素节点
            let childNode = nodeList[i];
            let random = Math.random().toString().slice(2);
            //判断是否是元素节点。如果节点是元素(Element)节点，则 nodeType 属性将返回 1。如果节点是属性(Attr)节点，则 nodeType 属性将返回 2。
            if(childNode.nodeType == 1){

                //处理图片
                if(childNode.nodeName.toLowerCase() == "img" ){
                    let src = childNode.getAttribute("src");
                    

                    childNode.removeAttribute("src");//将原节点src属性删除，防止多请求一次
                
                    let html = '';
                    let style = '';
                    if(childNode.getAttribute("width") != null){//如果是表情，表情图不放大
                        style = 'style="width: '+childNode.getAttribute("width")+'; height: '+childNode.getAttribute("height")+'"';
                        html = '<van-image src="'+src+'" '+style+' lazy-load ></van-image>';
                    
                      //  html = '<img '+style+' v-lazy="{src:\''+src+'\',loading:\''+state.photo_loading+'\',error:\''+state.photo_error+'\'}" />';
                    
                    }else{
                        //@click方法由RenderTemplate.vue调度处理
                        html = '<van-image src="'+src+'" '+style+' lazy-load @click="onZoomPicture_renderTemplate(\''+src+'\')"></van-image>';
                      
                       // html = '<img '+style+'  v-lazy="{src:\''+src+'\',error:\''+state.photo_error+'\'}" @click="onZoomPicture_renderTemplate(\''+src+'\')"/>';
                    
                    }
                    //创建要替换的元素
                //	let html = '<el-image src="'+src+'" '+style+' lazy></el-image>';
                //	let html = '<el-image src="'+src+'" '+style+' :preview-src-list=["http://127.0.0.1:8080/cms/common/tttttt/templates.jpg"] lazy hide-on-click-modal ></el-image>';
                    
                
                   
                    let placeholder = document.createElement('div');
                    placeholder.innerHTML = html;
                    let node = placeholder.childNodes[0];
                    childNode.parentNode.replaceChild(node,childNode);//替换节点

                }
                
                //处理表格 (解决Chrome内核浏览器DPI缩放比例高于100%时部分边框变粗问题，需要CSS配合)
                if(childNode.nodeName.toLowerCase() == "table" ){
                    childNode.removeAttribute("border");
                    childNode.removeAttribute("bordercolor");
                }


                
                //处理视频标签
                if(childNode.nodeName.toLowerCase() == "player" ){
                    
                    let id = "player_"+random+"_"+i;
                    childNode.setAttribute("id",id);//设置Id
                    state.playerIdList.push(id);	
                }

                //处理下载
                if(childNode.nodeName.toLowerCase() == "a" ){
                    let href = childNode.getAttribute("href")
                    let title = childNode.innerText;
                    let linkType = childNode.getAttribute("linkType")
                    let startUrl = store.apiUrl+"fileDowload?jump=";
                    if(linkType == "download" && href != ""){
                        let downloadHtml = "";
                        if(href.toLowerCase().startsWith(startUrl.toLowerCase())){
                            downloadHtml ='<span class="download" @click="onDownload_renderTemplate(`'+href+'`);"><Icon name="download-2-line" size="24px" class="link-icon"></Icon>'+escapeHtml(title)+'</span>';
                            
                        }else{
                            downloadHtml ='<a class="download" href="'+href+'"><Icon name="download-2-line" size="24px" class="link-icon"></Icon>'+escapeHtml(title)+'</a>';
                        }
                        let downloadDom = document.createElement('div');
                        downloadDom.innerHTML=downloadHtml;

                        childNode.replaceWith(downloadDom.firstElementChild);
                    }
                }

                
                //处理代码标签
                if(childNode.nodeName.toLowerCase() == "pre" ){

                    
                    let firstChildNode = null;//第一个子节点

                    for(let p = 0;p < childNode.childNodes.length;p++){
                        let preChildNode = childNode.childNodes[p];
                        if(preChildNode.nodeName.toLowerCase() == "code" ){
                            firstChildNode = preChildNode;
                            break;
                        }
                    }
                    
                    if(firstChildNode != null && firstChildNode.getAttribute("class")!= null && firstChildNode.getAttribute("class").indexOf("language-") != -1){//Markdown代码
                        
                        let class_val = firstChildNode.className;
                        let lan_class = "";
                        let class_arr = new Array();
                        class_arr = class_val.split(' ');
                        
                        for(let k=0; k<class_arr.length; k++){
                            let className = class_arr[k].trim();
                            
                            if(className != null && className != ""){
                                if (className.lastIndexOf('language-', 0) === 0) {
                                    lan_class = className;
                                    break;
                                }
                            }
                        }
                        if(firstChildNode.getAttribute("class").indexOf("language-mermaid") == -1){
                            childNode.className = "line-numbers "+lan_class;
                            childNode.setAttribute("data-prismjs-copy",t('helpDetail.20'));//复制
                            childNode.setAttribute("data-prismjs-copy-error",t('helpDetail.30'));//按Ctrl+C复制
                            childNode.setAttribute("data-prismjs-copy-success",t('helpDetail.40'));//复制成功

                            let nodeHtml = "";

                            //删除code节点
                            let preChildNodeList = childNode.childNodes;
                            for(let p = 0;p < preChildNodeList.length;p++){
                                let preChildNode = preChildNodeList[p];
                                if(preChildNode.nodeName.toLowerCase() == "code" ){
                                    nodeHtml += preChildNode.innerHTML;
                                    preChildNode.parentNode.removeChild(preChildNode);
                                }
                                
                            }
                            
                            let dom = document.createElement('code');
                            dom.className = "line-numbers "+lan_class;
                            dom.innerHTML=nodeHtml;
                            
                        
                            childNode.appendChild(dom);
                        }
                    }


                    if(childNode.className != null && childNode.className.indexOf("lang-") != -1){//富文本编辑器代码
                       
                        let pre_html = childNode.innerHTML;
                        let class_val = childNode.className;
                        let lan_class = "";
                        
                        let class_arr = new Array();
                        class_arr = class_val.split(' ');
                        
                        for(let k=0; k<class_arr.length; k++){
                            let className = class_arr[k].trim();
                            
                            if(className != null && className != ""){
                                if (className.lastIndexOf('lang-', 0) === 0) {
                                    lan_class = className;
                                    break;
                                }
                            }
                        }
                        
                        childNode.className = "line-numbers "+getLanguageClassName(lan_class);
                        childNode.setAttribute("data-prismjs-copy",t('helpDetail.20'));//复制
                        childNode.setAttribute("data-prismjs-copy-error",t('helpDetail.30'));//按Ctrl+C复制
                        childNode.setAttribute("data-prismjs-copy-success",t('helpDetail.40'));//复制成功


                        let nodeHtml = "";

                        //删除code节点
                        let preChildNodeList = childNode.childNodes;
                        for(let p = 0;p < preChildNodeList.length;p++){
                            let preChildNode = preChildNodeList[p];
                            if(preChildNode.nodeName.toLowerCase() == "code" ){
                                nodeHtml += preChildNode.innerHTML;
                                preChildNode.parentNode.removeChild(preChildNode);
                            }
                            
                        }
                        
                        let dom = document.createElement('code');
                        dom.className = "line-numbers "+getLanguageClassName(lan_class);
                        dom.innerHTML=nodeHtml;
                        
                    
                        childNode.appendChild(dom);
                    }

                    
                    
                   
                }
                
                bindNode(childNode);

                
            }
        }
    }
    

    //递归渲染绑定节点
    const renderBindNode = (node:any) => {	
        //先找到子节点
        let nodeList = node.childNodes;
        for(let i = 0;i < nodeList.length;i++){
            //childNode获取到到的节点包含了各种类型的节点
            //但是我们只需要元素节点  通过nodeType去判断当前的这个节点是不是元素节点
            let childNode = nodeList[i];
            let random = Math.random().toString().slice(2);
            //判断是否是元素节点。如果节点是元素(Element)节点，则 nodeType 属性将返回 1。如果节点是属性(Attr)节点，则 nodeType 属性将返回 2。
            if(childNode.nodeType == 1){
                //处理代码标签
                if(childNode.nodeName.toLowerCase() == "pre" ){
                    let firstChildNode:any = null;//第一个子节点
                    for(let p = 0;p < childNode.childNodes.length;p++){
                        let preChildNode = childNode.childNodes[p];
                        if(preChildNode.nodeName.toLowerCase() == "code" ){
                            firstChildNode = preChildNode;
                            break;
                        }
                    }
                   
                    if(firstChildNode != null && firstChildNode.getAttribute("class")!= null){
                        if(firstChildNode.getAttribute("class") != null && firstChildNode.getAttribute("class").indexOf("language-mermaid") != -1){
                           
                            if(firstChildNode.innerHTML){
                                  //  const { svg } = await mermaid.render('mermaid_'+random, unescapeHtml(firstChildNode.innerHTML));

                              //  childNode.innerHTML = svg;

                              const mermaid_container = document.createElement('div')
                                mermaid_container.style.lineHeight = 'initial' //重置行高

                                childNode.replaceWith(mermaid_container);
                                mermaid.render(
                                    'mermaid_'+random,
                                    unescapeHtml(firstChildNode.innerHTML),
                                    // @ts-ignore
                                    mermaid_container
                                ).then((svgCode) => {
                                    // @ts-ignore
                                    mermaid_container.innerHTML = svgCode.svg
                                
                                })
                                .catch((err) => {
                                // console.error(err);
                                })
                            }
                        }else if(firstChildNode.getAttribute("class").indexOf("language-mermaid") != -1){
                            
                        }else{
                            Prism.highlightAllUnder(childNode);
                        }
                    }
                   
                    
                   
                }else if(childNode.nodeName.toLowerCase() == "span"){
                    if(childNode.getAttribute("class") != null && childNode.getAttribute("class").indexOf("math-inline") != -1 && childNode.childNodes.length==1 && childNode.childNodes[0].nodeType ==3){
                        let tex = katex.renderToString(unescapeHtml(childNode.innerHTML), {
                            throwOnError: false,
                            displayMode:false//内联模式
                        });
                        childNode.innerHTML = tex;
                    }
                }else if(childNode.nodeName.toLowerCase() == "div"){
                    if(childNode.getAttribute("class") != null && childNode.getAttribute("class").indexOf("math-display") != -1 && childNode.childNodes.length==1 && childNode.childNodes[0].nodeType ==3){
                        let tex = katex.renderToString(unescapeHtml(childNode.innerHTML), {
                            throwOnError: false,
                            displayMode:true//块模式
                        });
                        childNode.innerHTML = tex;

                    }
                }
                renderBindNode(childNode);
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

    //清空播放器
    const clearVideoPlayer = () => {
        for(let i=0; i< state.playerObjectList.length; i++){
            let playerObject = state.playerObjectList[i];
            
            playerObject.destroy();//销毁播放器
        }
        for(let i=0; i< state.playerHlsList.length; i++){
            let hls = state.playerHlsList[i];
            hls.destroy();//销毁视频流
        }

        if(state.placeholder_DPlayer != ""){
			state.placeholder_DPlayer.destroy();//销毁播放器
		}

        state.playerObjectList.length = 0;//清空数组
        state.playerHlsList.length = 0;//清空数组
        state.playerIdList.length = 0;//清空数组
        state.playerNodeList.length = 0;//清空数组
        state.placeholder_DPlayer = "";
        state.lastPlayerId = "";
    }


    //渲染视频播放器
    const renderVideoPlayer = () => {
        //占位播放器
        createPlaceholderPlayer();

        for(let i=0; i< state.playerIdList.length; i++){
            let playerId = state.playerIdList[i];
            let url = document.getElementById(playerId)?.getAttribute("url");
            let cover = document.getElementById(playerId)?.getAttribute("cover");//封面
            let thumbnail = document.getElementById(playerId)?.getAttribute("thumbnail");//缩略图
            
            //语言
            let lang = "en";
            if(store_currentLanguage.value == 'zh'){//语言 zh,en
                lang = 'zh-cn';
            }

            let dp = null as any;
            if(url == ""){//如果视频处理中
                dp = new DPlayer({
                    container: document.getElementById(playerId),//播放器容器元素
                    screenshot: false,//开启截图，如果开启，视频和视频封面需要开启跨域
                    lang:lang,
                    video: {
                        
                    }
                });
                let dom = document.createElement('div');
                //视频处理中，请稍后再刷新
                dom.innerHTML="<div class='dplayer-process'><div class='box'><div class='prompt'>"+t('helpDetail.50')+"</div></div></div>";
                document.getElementById(playerId)?.appendChild(dom);
            }else{
                if(cover != undefined && cover != "" && thumbnail != undefined && thumbnail != ""){//切片视频
                    let hls = null;
                    dp = new DPlayer({
                        container: document.getElementById(playerId),//播放器容器元素
                        screenshot: false,//开启截图，如果开启，视频和视频封面需要开启跨域
                        lang:lang,
                        video: {
                            url: url,
                            pic: cover,//视频封面
                            thumbnails: thumbnail,//视频预览图
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
                    state.playerHlsList.push(hls);
                }else{
                    dp = new DPlayer({
                        container: document.getElementById(playerId),//播放器容器元素
                        screenshot: false,//开启截图，如果开启，视频和视频封面需要开启跨域
                        lang:lang,
                        video: {
                            url: url
                        }
                    });
                }
                
            }
            if(dp != null){
                dp.on('play', function () {//播放事件
                    state.lastPlayerId = dp.container.getAttribute('id');
                });
                dp.on('pause', function () {//暂停事件
                    playPlaceholderPlayer(dp.container.getAttribute('id'));
                });
            }
            state.playerObjectList.push(dp);
        }
        
        
        //添加播放器节点数据
        if(state.playerObjectList.length >0){
            
            for(let i=0; i< state.playerIdList.length; i++){
                let playerId = state.playerIdList[i];
                let node = document.getElementById(playerId);//节点对象
                state.playerNodeList.push(node);
            }
        }
        
    }

    //放大图片
    const onZoomPicture = (imagePath:string) => {
        ImagePreview({
            images:[
                imagePath
            ],
            showIndex:false,//是否显示页码
        });
    }



    //导航守卫
    onBeforeRouteUpdate((to, from, next) => {
        if(to.name == 'helpDetail'){
            if(to.query.helpTypeId != undefined){
                state.helpTypeId = to.query.helpTypeId as string
            }
            if(to.query.helpId != undefined){
                state.helpId = to.query.helpId as string;
            }
            
        }
        
        next();
    });

    onMounted(() => {
        state.helpTypeId = router.currentRoute.value.query.helpTypeId != undefined ?router.currentRoute.value.query.helpTypeId as string :'';
        state.helpId = router.currentRoute.value.query.helpId != undefined ?router.currentRoute.value.query.helpId as string :'';
        
        init();
    }) 

    //卸载组件实例后调用
    onUnmounted (()=>{
        //清除播放器
        clearVideoPlayer();

    })


    //初始化
    const init = () => {
        queryHelpNavigation(state.helpTypeId);
        queryHelpList( state.helpTypeId,()=>{
            if(state.helpId == null || state.helpId == ''){
                //查询第一个帮助
                if(state.helpList != null && state.helpList.length >0){
                    for(let i=0; i<state.helpList.length; i++){
                        let help = state.helpList[i];
                        
                        state.helpId = help.id;
                        break;
                    }
                }
            }
            if(state.helpId != null && state.helpId != ''){
                queryHelp(state.helpId);
            }
        })
    }


    //进入keep-alive组件时触发
    onActivated(()=>{
        //后退时修改浏览器标题
        let titleValue = store_title.value
      
        if(titleValue != null && titleValue != '' && state.help != null && Object.keys(state.help).length > 0){
            document.title = (state.help.name != null ? state.help.name : '')+ ' - ' + titleValue;
        }
    })

</script>
<style scoped lang="scss">
.helpContentModule{
    margin: var(--van-cell-group-inset-padding);
	.head{
        background: #fff;
        padding: 8px;
        border-radius: var(--van-border-radius-lg);
        .container{
            display: flex;
            align-items: center;
            margin-top: 4px;
            margin-bottom: 4px;
            .icon{
                margin-left: 8px;
                font-size: 18px; 
                color:var(--van-blue);
                padding:4px 0;
                margin-top: 6px;
            }
            .typeName{
                margin-left:12px;
                
                font-size: 16px; 
                color:var(--van-blue);
                padding:4px 0;
                word-break:break-all;
            }
        }
    }
    .helpDetail{
        margin-top: 8px;
        background: #fff;
        border-radius: var(--van-border-radius-lg);
        padding: 0px 12px 0px 12px;
        .name{
            padding-top: 12px;
            padding-bottom: 8px;
            color: var(--van-gray-8);
            font-weight: 400;
            font-size: 18px;
            line-height: 30px;
        }
        .time{
            font-size: 14px;
            margin-top: 10px;
            padding-bottom: 10px;
            color: var(--van-gray-6);
        }
        :deep(.helpMarkdownContent){
            margin-top: 12px;
            padding-bottom: 20px;
            color:var(--van-gray-8);
            font-size:16px; 
            line-height:1.75; 
            word-wrap:break-word;
            min-height: 100px;
            //自动换行
            pre{
                white-space:pre-wrap;
            }
            
            ol{
                list-style: decimal;
            }
            ol li{
                list-style-type:decimal;
                list-style-position:inside;
            }
            ul{
                list-style: disc;
            }
            // ul li{
                //   list-style-type:disc;
            //  }
            .task-list-item {
                list-style-type:none;
            }
            .download{
                color: #1890ff;
                margin: 0 5px 0 5px;
                cursor: pointer;
                .link-icon {
                    position: relative;
                    top: 4px;
                    margin-right: 2px;
                    color:#1890ff;
                    width: 20px; height: 20px;
                }
            }
            a{
                color: var(--van-blue);
                font-size:16px;
            }
            p{
                font-size:16px;
                word-wrap:break-word
            }
            img{
                max-width:100%;height:auto;border:none;background:none;margin:0;padding:0; 
                cursor: -webkit-zoom-in;
                cursor: zoom-in;
                vertical-align: sub;
            }
            .van-image[style*="width: 32px; height: 32px;"]{
                top: 3px;
            }
            code[class*="language-"]{
                padding: 0 0;
            }


            /** 解决Chrome内核浏览器DPI缩放比例高于100%时部分边框变粗问题   本方案需删除table样式 border="1" bordercolor="#000000" */
            table {
                border-collapse: separate; 
                border-spacing: 0; 
                border-top: 1px solid var(--van-gray-3);
                border-left: 1px solid var(--van-gray-3);
                th {
                    font-weight: 600
                }
                th, td {
                    border-right: 1px solid var(--van-gray-3);
                    border-bottom: 1px solid var(--van-gray-3);
                    padding: 6px 13px
                }
                tr {
                    background-color: #fff;
                    border-top: 1px solid var(--van-gray-3);
                    &:nth-child(2n) {
                        background-color: var(--van-gray-1);
                    }
                }
            }
            ol{
                li{ 
                    list-style-type:decimal;
                    list-style-position:inside;
                }
            }
            ul{
                li{ 
                    margin-left:20px;
                    list-style-type:disc;
                }
            }
            iframe{
                width:100%; height: 300px;padding:10px 0px; 
            }
            player{
                width: 100%;
                height: 576px;
                display: block;
                margin-top: 10px;
                margin-bottom: 10px;
                //关闭页面全屏按钮
                .dplayer-full-in-icon{
                    display: none !important;
                }
            }
            .dplayer-process {
                position: absolute;
                top: 0;
                bottom: 0;
                left: 0;
                right: 0;
                z-index: 10;
                .box{
                    position: relative;
                    width: 100%;
                    height: 100%;
                    .prompt{
                        width: 250px;
                        height: 80px;
                        position: absolute;
                        left: 0;
                        top: 0;
                        right: 0;
                        bottom: 0;
                        margin: 100px auto;
                        padding :0px 30px;
                        border-radius :3px;
                        color: #fff;
                        line-height: 80px;
                        font-size: 20px;
                        background-color:rgb(0,0,0);
                        opacity:0.7;
                        filter:alpha(opacity=70);
                        text-align: center;
                    }
                }
            }
        }
        :deep(.content){
            margin-top: 12px;
            padding-bottom: 20px;
            color:var(--van-gray-8);
            font-size:16px; 
            line-height:1.75; 
            word-wrap:break-word;
            min-height: 100px;
            a{
                color: var(--van-blue);
            }
            p{
                font-size:16px;
                word-wrap:break-word
            }
            img{
                max-width:100%;height:auto;border:none;background:none;margin:0;padding:0; 
                cursor: -webkit-zoom-in;
                cursor: zoom-in;
                vertical-align: sub;
            }
            .van-image[style*="width: 32px; height: 32px;"]{
                top: 3px;
            }
            .download{
                color: #1890ff;
                margin: 0 5px 0 5px;
                cursor: pointer;
                .link-icon {
                    position: relative;
                    top: 4px;
                    margin-right: 2px;
                    color:#1890ff;
                    width: 20px; height: 20px;
                }
            }
            /** 解决Chrome内核浏览器DPI缩放比例高于100%时部分边框变粗问题   本方案需删除table样式 border="1" bordercolor="#000000" */
            table {
                border-collapse: separate; 
                border-spacing: 0; 
                border-top: 1px solid var(--van-gray-3);
                border-left: 1px solid var(--van-gray-3);
                th {
                    font-weight: 600
                }
                th, td {
                    border-right: 1px solid var(--van-gray-3);
                    border-bottom: 1px solid var(--van-gray-3);
                    padding: 6px 13px
                }
                tr {
                    background-color: #fff;
                    border-top: 1px solid var(--van-gray-3);
                    &:nth-child(2n) {
                        background-color: var(--van-gray-1);
                    }
                }
            }
            ol{
                li{ 
                    list-style-type:decimal;
                    list-style-position:inside;
                }
            }
            ul{
                li{ 
                    margin-left:20px;
                    list-style-type:disc;
                }
            }
            iframe{
                width:100%; height: 300px;padding:10px 0px; 
            }
            player{
                width: 100%;
                height: 576px;
                display: block;
                margin-top: 10px;
                margin-bottom: 10px;
                //关闭页面全屏按钮
                .dplayer-full-in-icon{
                    display: none !important;
                }
            }
            .dplayer-process {
                position: absolute;
                top: 0;
                bottom: 0;
                left: 0;
                right: 0;
                z-index: 10;
                .box{
                    position: relative;
                    width: 100%;
                    height: 100%;
                    .prompt{
                        width: 250px;
                        height: 80px;
                        position: absolute;
                        left: 0;
                        top: 0;
                        right: 0;
                        bottom: 0;
                        margin: 100px auto;
                        padding :0px 30px;
                        border-radius :3px;
                        color: #fff;
                        line-height: 80px;
                        font-size: 20px;
                        background-color:rgb(0,0,0);
                        opacity:0.7;
                        filter:alpha(opacity=70);
                        text-align: center;
                    }
                }
            }
            
            //自动换行
            pre{
                white-space:pre-wrap;
            }
        }
        .skeleton{
            padding-top: 16px;
            padding-bottom: 16px;
        }
    }
}

.help-sidebar{
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
</style>