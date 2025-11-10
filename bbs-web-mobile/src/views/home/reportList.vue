<!-- 举报列表 -->
<template>
    <div class="main">
        <div class="main-container">
            <van-sticky>
                <!-- title="举报" left-text="返回" -->
                <van-nav-bar :title="t('reportList.10')" :left-text="t('common.110')" left-arrow @click-left="onBack" @click-right="router.push({path: '/index'})">
                    <template #right>
                        <van-icon name="wap-home-o" :size="convertViewportWidth('18px')"/>
                    </template>
                </van-nav-bar>
            </van-sticky>
            <!-- success-text="刷新成功" -->
            <van-pull-refresh v-model="state.isRefreshing" :success-text="t('common.130')" pull-distance="200" @refresh="onRefresh" style="min-height: 50vh;">
                <div class="reportListModule" >
                    <!--error-text="请求失败，点击重新加载" finished-text="没有更多了"-->
                    <van-list v-model:loading="state.isLoading" :finished="state.isFinished" v-model:error="state.isError" :error-text="t('common.140')" :finished-text="t('common.150')" @load="onLoad">
                   
                        <div v-for="(report,index) in state.reportList" :key="report.id" class="item van-hairline--bottom">
                            <div class="top-container">
                                <div class="left-layout">
                                    <span class="type" >{{report.reportTypeName}}</span>
                                </div>
                                <div class="right-layout">
                                    <span class="time">
                                        {{report.postTime}}
                                    </span>
                                </div>
                            </div>
                            
                            <div class="middle-container">
                                <div class="left-layout">
                                    <div class="reason">{{report.reason}}</div>
                                    <div class="imageZoom" v-if="report.imageInfoList.length > 0">
                                        <div class="imageZoom-container">
                                            <template v-for="imageInfo in report.imageInfoList" >
                                                <div class="image-box" >
                                                    <!-- 本地存储 -->
                                                    <div class="image-column" v-if="store_fileStorageSystem ==0">
                                                        <van-image :src="imageInfo.path+imageInfo.name" lazy-load fit="cover" radius="8px" class="img" @click="onZoomPicture(imageInfo.name,report.imageInfoList);"></van-image>
                                                    </div>
                                                    <!-- SeaweedFS存储 使用nginx image_filter的缩略图处理功能 -->
                                                    <div class="image-column" v-if="store_fileStorageSystem ==10">
                                                        <van-image :src="imageInfo.path+imageInfo.name+'?width=240'" lazy-load fit="cover" radius="8px" class="img" @click="onZoomPicture(imageInfo.name,report.imageInfoList);"></van-image>
                                                    </div>
                                                    <!--  MinIO存储 使用nginx image_filter的缩略图处理功能 -->
                                                    <div class="image-column" v-if="store_fileStorageSystem ==20">
                                                        <van-image :src="imageInfo.path+imageInfo.name+'?width=240'" lazy-load fit="cover" radius="8px" class="img" @click="onZoomPicture(imageInfo.name,report.imageInfoList);"></van-image>
                                                    </div>
                                                    
                                                    <!-- 阿里云OSS存储 -->
                                                    <div class="image-column" v-if="store_fileStorageSystem ==30">
                                                        <van-image :src="imageInfo.path+imageInfo.name+'?x-oss-process=image/resize,w_240'" lazy-load fit="cover" radius="8px" class="img" @click="onZoomPicture(imageInfo.name,report.imageInfoList);"></van-image>
                                                    </div>
                                                </div>
                                            </template>
                                        </div>
                                    </div>
                                </div>
                                <div class="right-layout">
                                    <!-- 查看话题 -->
                                    <van-button plain round type="primary" v-if="report.module == 10" @click="router.push({path: '/thread', query:{ topicId : report.parameterId, reportModule:report.module}})">{{t('reportList.20')}}</van-button>
                                    <!-- 查看评论 -->
                                    <van-button plain round type="primary" v-if="report.module == 20" @click="router.push({path: '/thread', query:{ topicId : report.extraParameterId,commentId:report.parameterId, reportModule:report.module}})">{{t('reportList.30')}}</van-button>
                                    <!-- 查看评论回复 -->
                                    <van-button plain round type="primary" v-if="report.module == 30" @click="router.push({path: '/thread', query:{ topicId : report.extraParameterId.split('-')[0], commentId:report.extraParameterId.split('-')[1], replyId:report.parameterId, reportModule:report.module}})">{{t('reportList.40')}}</van-button>
                                    <!-- 查看问题 -->
                                    <van-button plain round type="primary" v-if="report.module == 40" @click="router.push({path: '/question', query:{ questionId : report.parameterId, reportModule:report.module}})">{{t('reportList.50')}}</van-button>
                                    <!-- 查看答案 -->
                                    <van-button plain round type="primary" v-if="report.module == 50" @click="router.push({path: '/question', query:{ questionId : report.extraParameterId,answerId:report.parameterId, reportModule:report.module}})">{{t('reportList.60')}}</van-button>
                                    <!-- 查看答案回复 -->
                                    <van-button plain round type="primary" v-if="report.module == 60" @click="router.push({path: '/question', query:{ questionId : report.extraParameterId.split('-')[0], answerId:report.extraParameterId.split('-')[1], replyId:report.parameterId, reportModule:report.module}})">{{t('reportList.70')}}</van-button>
                                </div>
                            </div>
                            <div class="middle-processResult-container" v-if="report.processResult != null && report.processResult != ''">
                                <!-- 处理结果 -->
                                <div class="details"><span class="text">{{t('reportList.80')}}：</span><span class="val">{{report.processResult}}</span></div>  
                            </div>
                            <div class="bottom-container">
                                <div class="left-layout">
                                        <van-tag type="primary" v-if="report.status ==10">{{t('reportList.90')}}</van-tag><!-- 待处理 -->
                                        <van-tag type="warning" v-if="report.status ==40">{{t('reportList.100')}}</van-tag><!-- 投拆失败 -->
                                        <van-tag type="success" v-if="report.status ==50">{{t('reportList.110')}}</van-tag><!-- 投诉成功 -->
                                </div>
                                <div class="right-layout">
                                    <div class="processCompleteTime">
                                        {{report.processCompleteTime}}
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
    import { useRouter } from 'vue-router'
    import { AxiosResponse } from 'axios'
    import { ImageInfo, PageView,Report} from "@/types/index";
    import { ImagePreview } from 'vant';
    import { useI18n } from 'vue-i18n';
    let { t } = useI18n();

    const store = useStore(pinia);
    const router = useRouter();
    const { proxy } = getCurrentInstance() as ComponentInternalInstance;
    const {title:store_title,keywords:store_keywords,description:store_description,systemUser:store_systemUser,fileStorageSystem:store_fileStorageSystem} = storeToRefs(store)
 

    //html页元信息
    watchEffect(() => {
        let titleValue = store_title.value//监听网站标题
        if(titleValue != null && titleValue != ''){
            document.title = t('reportList.120')+' - ' + titleValue;//举报列表
        }
    }, {
        flush: 'post'//在组件更新后触发，第一次运行需要组件渲染完成才执行
    })
    
    const state = reactive({
        reportList:[] as Array<Report>,
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
        state.reportList.length = 0;
        state.totalrecord = 0; //总记录数
		state.currentpage = 0; //当前页码
        state.totalpage = 1; //总页数
        state.maxresult = 12; //每页显示记录数    
        state.isError = false;//是否列表数据加载失败
        state.isFinished = false; 

        state.isLoading = true;//手动触发查询数据需将'加载状态结束'设为true
        queryReportList(state.currentpage+1);
    };
    //加载列表
    const onLoad = () => {
        queryReportList(state.currentpage+1);
    }

    //查询举报列表
    const queryReportList = (page: number) => {
        proxy?.$axios({
            url: '/user/control/reportList',
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
        .then((data: PageView<Report>) => {
            if(data){
                state.isSkeleton = false;//关闭骨架屏

                state.reportList.push.apply(state.reportList,data.records)

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

    //放大图片
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
  
    onMounted(() => {
        //设置缓存
        store.setCacheComponents(String(router.currentRoute.value.name))
    })

    //进入keep-alive组件时触发
    onActivated(()=>{
        //后退时修改浏览器标题
        let titleValue = store_title.value
        if(titleValue != null && titleValue != ''){
            document.title = t('reportList.120')+' - ' + titleValue;//举报列表
        }
    })
</script>

<style scoped lang="scss">
.reportListModule{
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
                .type{
                   
                    background-color:var(--van-gray-2);
                    font-size: 12px;
                  //  line-height: 12px;
                    display: inline-block;
                    padding: 2px 4px 2px 4px;
                    -moz-border-radius: 2px;
                    -webkit-border-radius: 2px;
                    border-radius: 2px;
                    text-decoration: none;
                    color: var(--van-gray-6);
                    margin-right: 5px;
                    margin-bottom: 5px;
               }
            }
            .right-layout{
                margin-bottom: 5px;
              //  box-sizing: border-box;
                min-height: 1px;
                .time{
                    font-size: 14px;
                    color: var(--van-gray-7);
                    position: relative;
                    top: 2px;
                }
            }
        }
        .middle-container{
            display: flex;
            align-items: center;
            padding-top: 15px;
            padding-bottom: 15px;
            .left-layout{
                flex: 1;
                .reason{
                    margin-right:15px;
                    font-size: 15px;
                    line-height: 32px;
                    color: var(--van-gray-8);
                }
                .imageZoom{
                    margin-right: 15px;
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
            }
            .right-layout{
                :deep(.van-button){
                    height: 36px;
                }
            }
        }
        .middle-processResult-container{
            margin-top: 5px;
            display: flex;
            .details {
                font-size: 14px;
                line-height: 24px;
                color: var(--van-gray-7);
                .val{
                    margin-right: 15px;
                }
                .refundAmount{
                    color: #F56C6C;
                }
            }
        }
        .bottom-container{
            display: flex;
            margin-top: 2px;
            
            .left-layout{
                flex: 1;
                display: block;
                min-height: 1px;
                color: var(--van-gray-7);
            }
            .right-layout{
                min-height: 1px;
                text-align: right;
                .processCompleteTime{
                    color: #07c160;
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