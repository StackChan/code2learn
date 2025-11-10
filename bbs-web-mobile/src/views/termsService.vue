<!-- 服务条款 -->
<template>
    <div class="main">
        <div class="main-container wrap backgroundModule main-fullScreen">
            <!-- title="服务条款" left-text="返回" -->
            <van-nav-bar :title="t('termsService.10')" :left-text="t('common.110')" left-arrow @click-left="onBack" @click-right="router.push({path: '/index'})">
                <template #right>
                    <van-icon name="wap-home-o" :size="convertViewportWidth('18px')"/>
                </template>
            </van-nav-bar>
            <div class="termsServiceModule">
                <div class="container">
                    <div class="title">{{state.title}}</div>

                    <div class="content" ref="content">
                        <RenderTemplate @click-onZoomPicture="onZoomPicture" :html="state.content"></RenderTemplate>    
                    </div>
                    <van-skeleton title :row="3" :loading="state.loading"/>
                </div>
            </div>
        </div>
    </div>
    <!-- 底部导航栏-->
    <BottomTabbar/>
</template>

<script lang="ts" setup>
    import { onMounted, getCurrentInstance, ComponentInternalInstance, reactive, watchEffect, onActivated, } from 'vue'
    import { onBeforeRouteUpdate, useRouter } from 'vue-router'
    import { CustomHTML, } from "@/types/index";
    import { AxiosResponse } from 'axios';
    import pinia from '@/store/store'
    import {useStore} from '@/store'
    import { storeToRefs } from 'pinia';
    import { getLanguageClassName} from '@/utils/tool';
    import { escapeVueHtml } from '@/utils/escape';
    import { onBack } from '@/utils/history'
    import { convertViewportWidth } from '@/utils/px-to-viewport';
    import { ImagePreview } from 'vant';
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
            document.title = t('termsService.10')+' - ' + titleValue;//服务条款
        }
    }, {
        flush: 'post'//在组件更新后触发，第一次运行需要组件渲染完成才执行
    })
    
    const state = reactive({
        title : '', //标题
        content : '', //服务协议内容
        loading:true,//是否显示骨架屏
    });
    //错误
    const error = reactive({
    })

    //放大图片
    const onZoomPicture = (imagePath:string) => {
        ImagePreview({
            images:[
                imagePath
            ],
            showIndex:false,//是否显示页码
        });
    }

    //查询服务条款
    const queryTermsService = () => {
        proxy?.$axios({
            url: '/queryTermsService',
            method: 'get',
            params:  {},
            //showLoading: false,//是否显示加载图标
            //loadingMask:false,// 是否显示遮罩层
        })
        .then((response: AxiosResponse) => {
            return response?.data
        })
        .then((data: CustomHTML) => {
            state.loading = false;//关闭骨架屏
            if(data){
                //处理自定义标签
                let contentNode = document.createElement("div");
                contentNode.innerHTML = data.content;
                bindNode(contentNode);
                
                state.content = escapeVueHtml(contentNode.innerHTML);

                state.title = data.forumTitle
            }
        })
        .catch((error: any) =>{
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
                        html = '<van-image src="'+src+'" '+style+' lazy-load></van-image>';
                    }else{
                        html = '<van-image src="'+store.apiUrl+src+'" '+style+' lazy-load @click="onZoomPicture_renderTemplate(\''+store.apiUrl+src+'\')"></van-image>';
                      
                    }
                    //创建要替换的元素
                //	let html = '<el-image src="'+src+'" '+style+' lazy></el-image>';
                //	let html = '<el-image src="'+src+'" '+style+' :preview-src-list=["http://127.0.0.1:8080/cms/common/tttttt/templates.jpg"] lazy hide-on-click-modal ></el-image>';
                    
                
                
                //	let html = '<el-image src="backstage/images/null.gif" lazy></el-image>';
                    let placeholder = document.createElement('div');
                    placeholder.innerHTML = html;
                    let node = placeholder.childNodes[0];
                //	node.setAttribute("src",src);
                    childNode.parentNode.replaceChild(node,childNode);//替换节点	 
                }
                
                //处理表格 (解决Chrome内核浏览器DPI缩放比例高于100%时部分边框变粗问题，需要CSS配合)
                if(childNode.nodeName.toLowerCase() == "table" ){
                    childNode.removeAttribute("border");
                    childNode.removeAttribute("bordercolor");
                }

                
                //处理代码标签
                if(childNode.nodeName.toLowerCase() == "pre" ){
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
                    childNode.setAttribute("data-prismjs-copy",t('termsService.20'));//复制
                    childNode.setAttribute("data-prismjs-copy-error",t('termsService.30'));//按Ctrl+C复制
                    childNode.setAttribute("data-prismjs-copy-success",t('termsService.40'));//复制成功

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
                
                bindNode(childNode);

                
            }
        }
    }

    

    //导航守卫
    onBeforeRouteUpdate((to, from, next) => {
        if(to.name == 'termsService'){
            queryTermsService()
        }
        
        next();
    });

    onMounted(() => {
        queryTermsService()
    }) 

    //进入keep-alive组件时触发
    onActivated(()=>{
        //后退时修改浏览器标题
        let titleValue = store_title.value
        if(titleValue != null && titleValue != ''){
            document.title = t('termsService.10')+' - ' + titleValue;//服务条款
        }
    })
</script>
<style scoped lang="scss">
.termsServiceModule{
    background: #fff;
    padding:0px 15px 36px 15px;
    .container{
        .title{
            padding:40px 5px 20px 5px;
            color:var(--van-gray-8);
            font-size:24px;
            border:none;
            line-height:34px; 
            text-align: center;
        }
        :deep(.content){
            padding:20px 5px;
            color:var(--van-gray-7);
            font-size:16px;
            line-height:2; 
            word-wrap:break-word;
            p{
                font-size:16px;
                word-wrap:break-word
            }
            img{
                max-width:100%;
                height:auto;
                border:none;
                background:none;
                margin:0;
                padding:0;
                vertical-align: sub;
            }
            .van-image[style*="width: 32px; height: 32px;"]{
                top: 3px;
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
        }
    }
    
}
</style>