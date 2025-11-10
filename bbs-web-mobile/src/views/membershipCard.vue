<!-- 会员卡 -->
<template>
    <div class="main">
        <div class="main-container">
            <van-sticky>
                <!-- title="会员卡" left-text="返回" -->
                <van-nav-bar :title="t('membershipCard.10')" :left-text="t('common.110')" left-arrow @click-left="onBack" @click-right="router.push({path: '/index'})">
                    <template #right>
                        <van-icon name="wap-home-o" :size="convertViewportWidth('18px')"/>
                    </template>
                </van-nav-bar>
            </van-sticky>
            <!-- success-text="刷新成功" -->
            <van-pull-refresh v-model="state.isRefreshing" :success-text="t('common.130')" pull-distance="200" @refresh="onRefresh" style="min-height: 50vh;">
                <div class="membershipCardModule">
                    <div class="item" v-for="(specification,index) in state.membershipCard.specificationList">
                        <div class="left-layout">
                            <div class="title">{{specification.specificationName}}</div>
                            <div class="sellingPrice" v-if="specification.sellingPrice != null && parseFloat(specification.sellingPrice) > 0">
                                <!-- <b>￥</b><strong>{{specification.sellingPrice}}</strong> 元 -->
                                <i18n-t keypath="membershipCard.20" scope="global">
                                    <template #p1>
                                        <b>￥</b><strong>{{specification.sellingPrice}}</strong>
                                    </template>
                                </i18n-t>
                            </div>
                              
                            <div class="sellingPrice" v-if="specification.point != null && Long.fromString(specification.point).gt(0)">
                                <!-- <strong>{{specification.point}}</strong> 积分 -->
                                <i18n-t keypath="membershipCard.30" scope="global">
                                    <template #p1>
                                        <strong>{{specification.point}}</strong>
                                    </template>
                                </i18n-t>
                            </div>
                                
                            <div class="marketPrice" v-if="specification.marketPrice != null && parseFloat(specification.marketPrice) >0">
                                <!-- 原价￥<span>{{specification.marketPrice}}</span> 元 -->
                                <i18n-t keypath="membershipCard.40" scope="global">
                                    <template #p1>
                                        <span>{{specification.marketPrice}}</span>
                                    </template>
                                </i18n-t>
                            </div>
                                
                        </div>
                        <div class="right-layout">
                            <!-- 立即购买 -->
                            <van-button round block type="primary" native-type="submit" :disabled="state.buttonDisabled[index]"  @click="addMembershipCardOrder(index,specification.id);">{{t('membershipCard.50')}}</van-button>
                        </div>
                    </div>
                    <div class="detail" v-if="state.membershipCard.introduction != null && state.membershipCard.introduction != ''">
                        <div class="top-layout van-hairline--bottom">
                            <!-- 详情 -->
                            <span class="title">{{t('membershipCard.60')}}</span>
                        </div>
                        <div class="bottom-layout">
                            <div class="content">
                                <RenderTemplate @click-onZoomPicture="onZoomPicture" :html="state.membershipCard.introduction"></RenderTemplate>
                            </div> 
                        </div>
                    </div>
                </div>
            </van-pull-refresh>
        </div>
    </div>
</template>

<script lang="ts" setup>
    import { getCurrentInstance, ComponentInternalInstance, reactive, onMounted, computed, watchEffect, onActivated} from 'vue'
    import pinia from '@/store/store'
    import {useStore} from '@/store'
    import { storeToRefs } from 'pinia';
    import { onBack } from '@/utils/history'
    import { convertViewportWidth } from '@/utils/px-to-viewport';
    import { onBeforeRouteUpdate, useRouter } from 'vue-router'
    import { AxiosResponse } from 'axios'
    import { MembershipCard } from "@/types/index";
    import Long from "long";
    import { escapeVueHtml } from '@/utils/escape';
    import { getLanguageClassName, processErrorInfo } from '@/utils/tool';
    import { Dialog, ImagePreview, Notify } from 'vant';
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
            document.title = t('membershipCard.10')+' - ' + titleValue;//会员卡
        }
    }, {
        flush: 'post'//在组件更新后触发，第一次运行需要组件渲染完成才执行
    })
    
    
     const state = reactive({
        membershipCardId :'',//会员卡Id
        membershipCard :{} as MembershipCard,//会员卡
        buttonDisabled:[] as Array<boolean>,//提交按钮是否允许点击
        
        isSkeleton:true,//是否显示骨架屏
        isRefreshing:false,//是否处于下拉加载中状态
    })
    //错误
    const error = reactive({
    })
   
    //下拉刷新时触发
    const onRefresh = () => {
        state.isRefreshing = false;

        //重置
        state.membershipCard = {} as MembershipCard;//会员卡
        state.buttonDisabled.length = 0;//提交按钮是否允许点击
        
        queryMembershipCard(state.membershipCardId);
    };


    //查询会员卡
    const queryMembershipCard = (membershipCardId:string) => {
        proxy?.$axios({
            url: '/queryMembershipCard',
            method: 'get',
            params:  {
                membershipCardId:membershipCardId
            },
            showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
        })
        .then((response: AxiosResponse) => {
            return response?.data
        })
        .then((data: MembershipCard) => {
            state.isSkeleton = false;//关闭骨架屏
            if(data){
                for (let i = 0; i < data.specificationList.length; i++) {
                    let specification = data.specificationList[i];
                    if(Long.fromString(specification.stock).gte(0)){
                        state.buttonDisabled.push(false); 
                    }else{
                        state.buttonDisabled.push(true);
                    }
                }

                //处理自定义标签
                let contentNode = document.createElement("div");
                contentNode.innerHTML = data.introduction;
                bindNode(contentNode);
                
                data.introduction = escapeVueHtml(contentNode.innerHTML);


                state.membershipCard = data;
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
                        html = '<van-image src="'+store.apiUrl+src+'" '+style+' lazy-load ></van-image>';
                    
                      //  html = '<img '+style+' v-lazy="{src:\''+src+'\',loading:\''+state.photo_loading+'\',error:\''+state.photo_error+'\'}" />';
                    
                    }else{
                        //@click方法由RenderTemplate.vue调度处理
                        html = '<van-image src="'+src+'" '+style+' lazy-load @click="onZoomPicture_renderTemplate(\''+src+'\')"></van-image>';
                      
                       // html = '<img '+style+'  v-lazy="{src:\''+src+'\',error:\''+state.photo_error+'\'}" @click="onZoomPicture_renderTemplate(\''+src+'\')"/>';
                    
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
                    childNode.setAttribute("data-prismjs-copy",t('membershipCard.70'));//复制
                    childNode.setAttribute("data-prismjs-copy-error",t('membershipCard.80'));//按Ctrl+C复制
                    childNode.setAttribute("data-prismjs-copy-success",t('membershipCard.90'));//复制成功

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

    //购买会员卡
    const addMembershipCardOrder = (index:number,specificationId:string) => {
        state.buttonDisabled.splice(index,1,true);//修改为不允许点击按钮

        Dialog.confirm({
            message:t('membershipCard.100'),
        })
        .then(() => {
            let formData = new FormData();
            formData.append('specificationId', specificationId);

            proxy?.$axios({
                url: '/user/control/membershipCard/add',
                method: 'post',
                data: formData
            })
            .then((response: AxiosResponse) => {
                if(response){

                    const result: any = response.data;
                
                    if(JSON.parse(result.success)){
                        Notify({ 
                            type: 'success', 
                            message: t('membershipCard.110'),//购买会员卡成功
                            onClose: ()=>{
                                
                            } 
                        });
                    }else{
                        //处理错误信息
                        processErrorInfo(result.error as Map<string,string> ,  error,()=>{});
                        
                    }
                }
            })
            .catch((error: any) =>{
                console.log(error);
            });
        })
        .catch(() => {
            // on cancel
            state.buttonDisabled.splice(index,1,false);
        });
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
        if(to.name == 'membershipCard'){
            if(to.query.membershipCardId != undefined){
                state.membershipCardId = to.query.membershipCardId as string
            }
        }
        
        next();
    });

    onMounted(() => {
        state.membershipCardId= router.currentRoute.value.query.membershipCardId != undefined ?router.currentRoute.value.query.membershipCardId as string :'';
        
        queryMembershipCard(state.membershipCardId)
    }) 

    //进入keep-alive组件时触发
    onActivated(()=>{
        //后退时修改浏览器标题
        let titleValue = store_title.value
        if(titleValue != null && titleValue != ''){
            document.title = t('membershipCard.10')+' - ' + titleValue;//会员卡
        }
    })
</script>
<style scoped lang="scss">
.membershipCardModule{
    margin: var(--van-cell-group-inset-padding);
    .item{
        padding: 12px 12px 12px 12px;
        margin-bottom: 8px;
        border-radius: var(--van-border-radius-lg);
        background: #fff;
        position: relative;
        display: flex;
        align-items: center;
        .left-layout{
            width: 70%;
            .title{
                font-size: 16px;
                line-height: 32px;
                color: var(--van-gray-8);
                text-align: center;
            }
            .sellingPrice{
                text-align: center;
                font-size: 14px;
                margin-top: 8px;
                b{ 
                    color: #f75d51; 
                    font-size: 24px; 
                    font-weight: normal;
                    position: relative;
                    top: 1px;
                }
                strong{
                    font-size: 36px;
                    color: #f75d51; 
                    position: relative;
                    top: 2px;
                }
            }
            .marketPrice{
                text-align: center;
                text-decoration: line-through;
                font-size: 14px;
                margin-top: 10px;
                color: var(--van-gray-6);
            }
        }
        .right-layout{
            width: 30%;
            :deep(.van-button){
                height: 36px;
            }
        }


    }
    .detail{
        padding: 12px 12px 12px 12px;
        margin-bottom: 8px;
        border-radius: var(--van-border-radius-lg);
        background: #fff;
        .top-layout{
            padding-bottom: 8px;
            .title{
                color: var(--van-gray-8);
                font-size: 16px;
                line-height: 32px;
            }
        }
        .bottom-layout{
            margin-top: 10px;
            padding-bottom: 20px;

            :deep(.content){
                color:var(--van-gray-8);
                font-size:16px; 
                line-height:1.75; 
                word-wrap:break-word;
                min-height: 100px;
                .reward{
                    margin-top: 5px;
                    margin-bottom: 20px;
                    background: #fcf3e6;
                    
                    height: 36px;
                    line-height: 36px;
                    border-radius:3px;
                    padding: 5px;
                    .info{
                        padding: 0px 12px;color: #e2b46d;font-size: 16px;
                        position: relative;top: -1px;
                        .icon{
                            font-size: 26px;position: relative;top: 7px;left: -4px;
                        }
                        .symbol{
                            font-family:Arial;font-weight:normal; vertical-align: middle; display:inline-block;margin-left: 5px;color: #cca558;
                        }
                        .amount{
                            margin-left: 1px;color: #cca558; margin-right: 5px;font-weight: 700;font-size: 18px;position: relative;top: 1px;
                        }
                        .point{
                            color: #cca558; margin-right: 5px;font-weight: 700;font-size: 18px;position: relative;top: 1px;
                        }
                    }
                }
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
        }
    }
}
</style>