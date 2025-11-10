<!-- 日记本页 -->
<template>
    <div class="main">
        <div class="main-container">
            <van-sticky>
                <!--title="日记本" -->
                <van-nav-bar title="日记本" :fixed="false">
                    <template #right>
                        <van-icon name="plus" :size="convertViewportWidth('20px')" @click="addDiary"/>
                    </template>
                </van-nav-bar>
            </van-sticky>
            
            <!-- 目录标签 -->
            <van-tabs v-model:active="state.activeTab" @change="onTabChange">
                <van-tab title="全部" name="all"></van-tab>
                <van-tab title="我的草稿" name="draft"></van-tab>
                <van-tab title="统计信息" name="statistics"></van-tab>
            </van-tabs>

            <!-- 全部日记 / 草稿 -->
            <div v-if="state.activeTab === 'all' || state.activeTab === 'draft'">
                <van-pull-refresh v-model="state.isRefreshing" @refresh="onRefresh" style="min-height: 50vh;">
                    <div class="diaryModule">
                        <van-list v-model:loading="state.isLoading" :finished="state.isFinished" v-model:error="state.isError" :error-text="'请求失败，点击重新加载'" :finished-text="'没有更多了'" @load="onLoad">
                            
                            <div v-for="(diary,index) in state.diaryList" :key="diary.id" class="item van-hairline--bottom">
                                <div class="date-container">
                                    <span class="date">{{formatDate(diary.postTime)}}</span>
                                </div>
                                <div class="content-container">
                                    <div class="title" @click="viewDiary(diary)">{{diary.title || '无标题'}}</div>
                                    <div class="summary" v-if="diary.summary">{{diary.summary}}</div>
                                    <div class="time">{{formatTime(diary.postTime)}}</div>
                                </div>
                                <div class="operation" @click.stop="showActions(diary)">
                                    <Icon name="ellipsis-v-solid" :size="convertViewportWidth('16px')"/>
                                </div>
                            </div>
                            
                        </van-list>
                        
                        <van-skeleton :row="3" :loading="state.isSkeleton" class="skeleton"/>
                    </div>
                </van-pull-refresh>
            </div>

            <!-- 统计信息 -->
            <div v-if="state.activeTab === 'statistics'" class="statisticsModule">
                <van-pull-refresh v-model="state.isRefreshing" @refresh="onRefreshStatistics">
                    <div class="statistics-container">
                        <div class="stat-item">
                            <div class="stat-value">{{state.statistics.diaryCount}}</div>
                            <div class="stat-label">日记数量</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">{{state.statistics.recordDays}}</div>
                            <div class="stat-label">记录天数</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">{{state.statistics.totalWords}}</div>
                            <div class="stat-label">总字数</div>
                        </div>
                    </div>
                    
                    <van-divider content-position="left">高频词云</van-divider>
                    
                    <div class="wordcloud-container">
                        <div v-if="state.statistics.highFreqWords.length === 0" class="empty-tips">
                            暂无数据
                        </div>
                        <div v-else class="word-cloud">
                            <span v-for="(word,index) in state.statistics.highFreqWords" :key="index" 
                                  class="word-tag" 
                                  :style="{fontSize: (15 + index * 2) + 'px'}">
                                {{word.text}} ({{word.count}})
                            </span>
                        </div>
                    </div>
                </van-pull-refresh>
            </div>
        </div>
        
        <BottomTabbar/>
    </div>
</template>

<script lang="ts" setup>
    import { getCurrentInstance, ComponentInternalInstance, reactive, onMounted, watchEffect, onActivated} from 'vue'
    import pinia from '@/store/store'
    import {useStore} from '@/store'
    import { storeToRefs } from 'pinia';
    import { convertViewportWidth } from '@/utils/px-to-viewport';
    import {useRouter } from 'vue-router'
    import { AxiosResponse } from 'axios'
    import { PageView } from "@/types/index";
    import { useI18n } from 'vue-i18n';
    import Icon from "@/components/icon/Icon.vue";
    import BottomTabbar from '@/components/BottomTabbar.vue';
    import { Toast, Dialog } from 'vant';
    
    let { t } = useI18n();
    const { proxy } = getCurrentInstance() as ComponentInternalInstance;
    const store = useStore(pinia);
    const router = useRouter();
    const {title:store_title} = storeToRefs(store)
    
    // 日记接口
    interface Diary {
        id: string;
        title: string;
        content: string;
        summary: string;
        postTime: string;
        lastUpdateTime: string;
        status: number; // 状态: 10.待审核 20.已发布
        imageInfoList?: Array<any>;
    }
  
    //html页元信息
    watchEffect(() => {
        let titleValue = store_title.value
        if(titleValue != null && titleValue != ''){
            document.title = '日记本 - ' + titleValue;
        }
    }, {
        flush: 'post'
    })
    
    const state = reactive({
        activeTab: 'all' as string,
        diaryList: [] as Array<Diary>,
        totalrecord : 0, 
        currentpage : 0, 
        totalpage : 1, 
        maxresult: 12, 
        isRefreshing:false,
        isError:false,
        isLoading:false,
        isFinished:false,
        isSkeleton:true,
        statistics: {
            diaryCount: 0,
            recordDays: 0,
            totalWords: 0,
            highFreqWords: [] as Array<{text: string, count: number}>
        }
    });

    //下拉刷新
    const onRefresh = () => {
        state.isRefreshing = false;
        state.diaryList.length = 0;
        state.totalrecord = 0; 
        state.currentpage = 0; 
        state.totalpage = 1; 
        state.maxresult = 12; 
        state.isError = false;
        state.isFinished = false; 
        state.isLoading = true;
        queryDiaryList(state.currentpage+1);
    };

    //加载列表
    const onLoad = () => {
        queryDiaryList(state.currentpage+1);
    }

    //切换标签
    const onTabChange = (name: string) => {
        if(name === 'statistics') {
            queryStatistics();
        } else {
            state.diaryList.length = 0;
            state.currentpage = 0;
            state.totalpage = 1;
            state.isFinished = false;
            state.isLoading = true;
            queryDiaryList(1);
        }
    }

    //查询日记列表
    const queryDiaryList = (page: number) => {
        const status = state.activeTab === 'draft' ? 'draft' : 'all';
        proxy?.$axios({
            url: '/user/control/diary/list',
            method: 'get',
            params:  { 
                page: page,
                status: status
            },
            showLoading: false,
            loadingMask:false,
            showErrorMessage:false,
        })
        .then((response: AxiosResponse) => {
            return response?.data
        })
        .then((data: PageView<any>) => {
            if(data){
                state.isSkeleton = false;
                
                if(data.records && data.records.length > 0){
                    state.diaryList.push.apply(state.diaryList, data.records);
                }
                state.totalrecord = parseInt(data.totalrecord || '0');
                state.currentpage = data.currentpage || page;
                state.totalpage = parseInt(data.totalpage || '1');
                state.maxresult = data.maxresult || 12;
                if(state.totalpage == 0 || state.totalpage <= page){
                    state.isFinished = true;
                }
                state.isLoading = false;
            } else {
                state.isLoading = false;
                state.isFinished = true;
            }
        })
        .catch((error: any) =>{
            state.isError = true;
            state.isLoading = false;
            console.log(error);
        });
    }

    //查询统计信息
    const queryStatistics = () => {
        proxy?.$axios({
            url: '/user/control/diary/statistics',
            method: 'get',
            params: {},
            showLoading: false,
            loadingMask: false,
        })
        .then((response: AxiosResponse) => {
            const data = response?.data;
            if(data){
                state.statistics = {
                    diaryCount: data.diaryCount || 0,
                    recordDays: data.recordDays || 0,
                    totalWords: data.totalWords || 0,
                    highFreqWords: data.highFreqWords || []
                };
            }
            state.isRefreshing = false;
        })
        .catch((error: any) => {
            console.log(error);
            state.isRefreshing = false;
        });
    }

    const onRefreshStatistics = () => {
        queryStatistics();
    }

    //格式化日期
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return `${month}月${day}日`;
    }

    //格式化时间
    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    //添加日记
    const addDiary = () => {
        router.push({path: '/addDiary'});
    }

    //查看日记
    const viewDiary = (diary: Diary) => {
        router.push({path: '/thread', query: {topicId: diary.id}});
    }

    //显示操作菜单
    const showActions = (diary: Diary) => {
        Dialog.confirm({
            title: '确认删除',
            message: '确定要删除这篇日记吗？',
            confirmButtonText: '删除',
            cancelButtonText: '取消',
        }).then(() => {
            deleteDiary(diary);
        }).catch(() => {
            // 用户取消，不做任何操作
        });
    }

    //编辑日记
    const editDiary = (diary: Diary) => {
        // TODO: 创建日记编辑页面
        Toast('编辑功能待实现');
    }
    
    //删除日记
    const deleteDiary = (diary: Diary) => {
        proxy?.$axios({
            url: '/user/control/diary/delete',
            method: 'post',
            data: {
                diaryId: diary.id
            },
            loadingMask: false,
        })
        .then((response: AxiosResponse) => {
            const result = response?.data;
            if(result && result.success){
                Toast.success('删除成功');
                // 重新加载列表
                onRefresh();
            } else {
                Toast.fail('删除失败');
            }
        })
        .catch((error: any) => {
            console.log(error);
            Toast.fail('删除失败');
        });
    }

    onMounted(() => {
        store.setCacheComponents(String(router.currentRoute.value.name))
        // 初始化加载数据
        if(state.isLoading === false && state.isFinished === false){
            state.isLoading = true;
            queryDiaryList(1);
        }
    })

    onActivated(()=>{
        let titleValue = store_title.value
        if(titleValue != null && titleValue != ''){
            document.title = '日记本 - ' + titleValue;
        }
    })
</script>

<style scoped lang="scss">
.diaryModule{
    margin: var(--van-cell-group-inset-padding);
    border-radius: var(--van-border-radius-lg);
    background: #fff;
    
    .item{
        margin-left: 8px;
        margin-right: 8px;
        padding: 12px 0;
        display: flex;
        position: relative;
        
        .date-container{
            min-width: 60px;
            margin-right: 12px;
            
            .date{
                font-size: 16px;
                color: var(--van-gray-8);
                font-weight: 500;
            }
        }
        
        .content-container{
            flex: 1;
            min-width: 0;
            
            .title{
                font-size: 15px;
                color: var(--van-gray-8);
                margin-bottom: 6px;
                cursor: pointer;
                
                &:active {
                    color: var(--van-primary-color);
                }
            }
            
            .summary{
                font-size: 13px;
                color: var(--van-gray-6);
                margin-bottom: 6px;
                overflow: hidden;
                text-overflow: ellipsis;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
            }
            
            .time{
                font-size: 12px;
                color: var(--van-gray-5);
            }
        }
        
        .operation{
            margin-left: 8px;
            display: flex;
            align-items: center;
            cursor: pointer;
        }
    }
    
    .skeleton{
        padding-top: 16px;
        padding-bottom: 16px;
    }
}

.statisticsModule{
    padding: 16px;
    
    .statistics-container{
        display: flex;
        justify-content: space-around;
        padding: 20px 0;
        background: #fff;
        border-radius: var(--van-border-radius-lg);
        margin-bottom: 16px;
        
        .stat-item{
            text-align: center;
            
            .stat-value{
                font-size: 24px;
                font-weight: 600;
                color: var(--van-primary-color);
                margin-bottom: 8px;
            }
            
            .stat-label{
                font-size: 13px;
                color: var(--van-gray-6);
            }
        }
    }
    
    .wordcloud-container{
        background: #fff;
        border-radius: var(--van-border-radius-lg);
        padding: 16px;
        min-height: 200px;
        
        .empty-tips{
            text-align: center;
            color: var(--van-gray-5);
            padding: 40px 0;
        }
        
        .word-cloud{
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            justify-content: center;
            
            .word-tag{
                color: var(--van-primary-color);
                padding: 4px 8px;
                border-radius: 4px;
                background: var(--van-gray-1);
            }
        }
    }
}
</style>

