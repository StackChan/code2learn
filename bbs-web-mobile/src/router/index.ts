import { readBrowserHistory } from '@/utils/history';
import { setScrollTop } from '@/utils/tool';
import { nextTick } from 'vue';
import { createRouter, createWebHistory } from 'vue-router'
import pinia from '@/store/store'
import {useStore} from '@/store'

const routes = [
    {
        path: '/diary',//日记本（改为首页）
        name: 'diary',
        component: () => import('@/views/diary.vue'),
        meta: {cacheNumber:0},
        beforeEnter: (to:any, from:any, next:any) => {
            const store = useStore(pinia);
            if(from.name != 'addDiary' && from.name != 'editTopic' && from.name != 'thread'){//如果不是来自指定页,则删除缓存
                store.setCacheNumber(to.name)
            }
            next();
        }
    },
    {
        path: '/addDiary',//添加日记
        name: 'addDiary',
        component: () => import('@/views/addDiary.vue'),
        meta: {cacheNumber:0}
    },
    {
        path: '/index',//原首页（话题列表）
        name: 'index',
        component: () => import('@/views/index.vue'),
        meta: {cacheNumber:0},
        beforeEnter: (to:any, from:any, next:any) => {
            const store = useStore(pinia);
            if(from.name != 'thread' && from.name != 'home'){//如果不是来自指定页,则删除缓存
                store.setCacheNumber(to.name)
            }
            if(from.name == 'home' && from.query.userName == undefined){//如果是来自'用户中心'页并且来的'我的',则删除缓存
                store.setCacheNumber(to.name)
            }
            next();
        }
    },
    {
        path: '/search',//搜索
        name: 'search',
        component: () => import('@/views/search.vue'),
        meta: {cacheNumber:0},
        beforeEnter: (to:any, from:any, next:any) => {
            const store = useStore(pinia);
            if(from.name == 'index' || from.name == 'askList' || from.name == 'membershipCardList' || from.name == 'help' ||  from.name == 'login'){//如果来自指定页,则删除缓存
                store.setCacheNumber(to.name)
            }
            if(from.name == 'home' && from.query.userName == undefined){//如果是来自‘用户中心’页并且来的‘我的’,则删除缓存
                store.setCacheNumber(to.name)
            }
            next();
        }
    },
    {
        path: '/addTopic',//发表话题
        name: 'addTopic',
        component: () => import('@/views/addTopic.vue'),
        meta: {cacheNumber:0}
    },
    {
        path: '/thread',//话题内容
        name: 'thread',
        component: () => import('@/views/thread.vue'),
        meta: {cacheNumber:0},
        beforeEnter: (to:any, from:any, next:any) => {
            const store = useStore(pinia);
            if(from.name == 'index' || from.name == 'editTopic' || from.name == 'login' || from.name == 'reportList' || from.name == 'remindList'){//如果来自指定页,则删除缓存
                store.setCacheNumber(to.name)
            }
            next();
        }
    },
    {
        path: '/user/editTopic',//修改话题
        name: 'editTopic',
        component: () => import('@/views/editTopic.vue'),
        meta: {cacheNumber:0}
    },
    {
        path: '/askList',//问答列表
        name: 'askList',
        component: () => import('@/views/askList.vue'),
        meta: {cacheNumber:0},
        beforeEnter: (to:any, from:any, next:any) => {
            const store = useStore(pinia);
            if(from.name != 'question' && from.name != 'home'){//如果不是来自指定页,则删除缓存
                store.setCacheNumber(to.name)
            }
            if(from.name == 'home' && from.query.userName == undefined){//如果是来自‘用户中心’页并且来的‘我的’,则删除缓存
                store.setCacheNumber(to.name)
            }
            next();
        }
    },
    {
        path: '/addQuestion',//提问题
        name: 'addQuestion',
        component: () => import('@/views/addQuestion.vue'),
        meta: {cacheNumber:0},
    },

    {
        path: '/question',//问题内容
        name: 'question',
        component: () => import('@/views/question.vue'),
        meta: {cacheNumber:0},
        beforeEnter: (to:any, from:any, next:any) => {
            const store = useStore(pinia);
            if(from.name == 'askList' || from.name == 'login' || from.name == 'reportList' || from.name == 'remindList'){//如果来自指定页,则删除缓存
                store.setCacheNumber(to.name)
            }
            next();
        }
    },
    {
        path: '/membershipCardList',//会员卡列表
        name: 'membershipCardList',
        component: () => import('@/views/membershipCardList.vue'),
        meta: {cacheNumber:0},
        beforeEnter: (to:any, from:any, next:any) => {
            const store = useStore(pinia);


            if(from.name == 'index' || from.name == 'askList' || from.name == 'search' || from.name == 'membershipCard' || from.name == 'help' || from.name == 'home' || from.name == 'login'){//如果来自指定页,则删除缓存
                store.setCacheNumber(to.name)
            }
            next();
        }
    },
    {
        path: '/membershipCard',//会员卡明细
        name: 'membershipCard',
        component: () => import('@/views/membershipCard.vue'),
        meta: {cacheNumber:0},
    },
    {
        path: '/help',//帮助中心
        name: 'help',
        component: () => import('@/views/help.vue'),
        meta: {cacheNumber:0},
        beforeEnter: (to:any, from:any, next:any) => {
            const store = useStore(pinia);
            if(from.name == 'index' || from.name == 'askList' || from.name == 'search' || from.name == 'membershipCardList' || from.name == 'helpDetail' || from.name == 'home' || from.name == 'login'){//如果来自指定页,则删除缓存
                store.setCacheNumber(to.name)
            }
            next();
        }
    },
    {
        path: '/helpDetail',//帮助内容
        name: 'helpDetail',
        component: () => import('@/views/helpDetail.vue'),
        meta: {cacheNumber:0},
    },
    {
        path: '/login',//登录
        name: 'login',
        component: () => import('@/views/login.vue'),
        meta: {cacheNumber:0}
    },
    {
        path: '/thirdParty/loginRedirect',//第三方重定向登录
        name: 'loginRedirect',
        component: () => import('@/views/loginRedirect.vue'),
        meta: {cacheNumber:0}
    },
    {
        path: '/register',//注册
        name: 'register',
        component: () => import('@/views/register.vue'),
        meta: {cacheNumber:0},
        beforeEnter: (to:any, from:any, next:any) => {
            const store = useStore(pinia);
            if(from.name == 'login'){//如果来自指定页,则删除缓存
                store.setCacheNumber(to.name)
            }
            next();
        }
    },
    {
        path: '/termsService',//服务条款
        name: 'termsService',
        component: () => import('@/views/termsService.vue'),
        meta: {cacheNumber:0}
    },
    /** 
    {
        path: '/feedback',//在线留言
        name: 'feedback',
        component: () => import('@/views/feedback.vue')
    },*/
    {
        path: '/user/control/home',//用户中心
        name: 'home',
        component: () => import('@/views/home/home.vue'),
        meta: {cacheNumber:0},
        beforeEnter: (to:any, from:any, next:any) => {
            const store = useStore(pinia);
            if(from.name == 'index' || from.name == 'login'){//如果来自指定页,则删除缓存
                store.setCacheNumber(to.name)
            }
            next();
        }
    },
    {
        path: '/user/control/topicList',//我的话题
        name: 'topicList',
        component: () => import('@/views/home/topicList.vue'),
        meta: {cacheNumber:0},
        beforeEnter: (to:any, from:any, next:any) => {
            const store = useStore(pinia);
            if(from.name == 'home' || from.name == 'login'){//如果来自指定页,则删除缓存
                store.setCacheNumber(to.name)
            }
            next();
        }
    },
    {
        path: '/user/control/topicUnhideList',//解锁隐藏标签用户
        name: 'topicUnhideList',
        component: () => import('@/views/home/topicUnhideList.vue'),
        meta: {cacheNumber:0},
        beforeEnter: (to:any, from:any, next:any) => {
            const store = useStore(pinia);
            if(from.name == 'topicList' || from.name == 'login'){//如果来自指定页,则删除缓存
                store.setCacheNumber(to.name)
            }
            next();
        }
    },
    
    {
        path: '/user/control/topicFavoriteList',//话题收藏用户
        name: 'topicFavoriteList',
        component: () => import('@/views/home/topicFavoriteList.vue'),
        meta: {cacheNumber:0},
        beforeEnter: (to:any, from:any, next:any) => {
            const store = useStore(pinia);
            if(from.name == 'topicList' || from.name == 'login'){//如果来自指定页,则删除缓存
                store.setCacheNumber(to.name)
            }
            next();
        }
    },
    {
        path: '/user/control/topicLikeList',//话题点赞用户
        name: 'topicLikeList',
        component: () => import('@/views/home/topicLikeList.vue'),
        meta: {cacheNumber:0},
        beforeEnter: (to:any, from:any, next:any) => {
            const store = useStore(pinia);
            if(from.name == 'topicList' || from.name == 'login'){//如果来自指定页,则删除缓存
                store.setCacheNumber(to.name)
            }
            next();
        }
    },
    {
        path: '/user/control/commentList',//我的评论
        name: 'commentList',
        component: () => import('@/views/home/commentList.vue'),
        meta: {cacheNumber:0},
        beforeEnter: (to:any, from:any, next:any) => {
            const store = useStore(pinia);
            if(from.name == 'home' || from.name == 'login'){//如果来自指定页,则删除缓存
                store.setCacheNumber(to.name)
            }
            next();
        }
    },
    {
        path: '/user/control/replyList',//我的回复
        name: 'replyList',
        component: () => import('@/views/home/replyList.vue'),
        meta: {cacheNumber:0},
        beforeEnter: (to:any, from:any, next:any) => {
            const store = useStore(pinia);
            if(from.name == 'home' || from.name == 'login'){//如果来自指定页,则删除缓存
                store.setCacheNumber(to.name)
            }
            next();
        }
    },
    {
        path: '/user/control/questionList',//我的问题
        name: 'questionList',
        component: () => import('@/views/home/questionList.vue'),
        meta: {cacheNumber:0},
        beforeEnter: (to:any, from:any, next:any) => {
            const store = useStore(pinia);
            if(from.name == 'home' || from.name == 'login'){//如果来自指定页,则删除缓存
                store.setCacheNumber(to.name)
            }
            next();
        }
    },
    {
        path: '/user/control/questionFavoriteList',//问题收藏用户
        name: 'questionFavoriteList',
        component: () => import('@/views/home/questionFavoriteList.vue'),
        meta: {cacheNumber:0},
        beforeEnter: (to:any, from:any, next:any) => {
            const store = useStore(pinia);
            if(from.name == 'questionList' || from.name == 'login'){//如果来自指定页,则删除缓存
                store.setCacheNumber(to.name)
            }
            next();
        }
    },
    
    {
        path: '/user/control/answerList',//我的答案
        name: 'answerList',
        component: () => import('@/views/home/answerList.vue'),
        meta: {cacheNumber:0},
        beforeEnter: (to:any, from:any, next:any) => {
            const store = useStore(pinia);
            if(from.name == 'home' || from.name == 'login'){//如果来自指定页,则删除缓存
                store.setCacheNumber(to.name)
            }
            next();
        }
    },
    {
        path: '/user/control/answerReplyList',//我的答案回复
        name: 'answerReplyList',
        component: () => import('@/views/home/answerReplyList.vue'),
        meta: {cacheNumber:0},
        beforeEnter: (to:any, from:any, next:any) => {
            const store = useStore(pinia);
            if(from.name == 'home' || from.name == 'login'){//如果来自指定页,则删除缓存
                store.setCacheNumber(to.name)
            }
            next();
        }
    },
    {
        path: '/user/control/favoriteList',//收藏夹
        name: 'favoriteList',
        component: () => import('@/views/home/favoriteList.vue'),
        meta: {cacheNumber:0},
        beforeEnter: (to:any, from:any, next:any) => {
            const store = useStore(pinia);
            if(from.name == 'home' || from.name == 'login'){//如果来自指定页,则删除缓存
                store.setCacheNumber(to.name)
            }
            next();
        }
    },
    {
        path: '/user/control/likeList',//点赞
        name: 'likeList',
        component: () => import('@/views/home/likeList.vue'),
        meta: {cacheNumber:0},
        beforeEnter: (to:any, from:any, next:any) => {
            const store = useStore(pinia);
            if(from.name == 'home' || from.name == 'login'){//如果来自指定页,则删除缓存
                store.setCacheNumber(to.name)
            }
            next();
        }
    },
    {
        path: '/user/control/followList',//关注
        name: 'followList',
        component: () => import('@/views/home/followList.vue'),
        meta: {cacheNumber:0},
        beforeEnter: (to:any, from:any, next:any) => {
            const store = useStore(pinia);
            if((from.name == 'home' && from.query.userName == undefined) || from.name == 'login'){//如果来自指定页,则删除缓存
                store.setCacheNumber(to.name)
            }
            next();
        }
    },
    {
        path: '/user/control/followerList',//粉丝
        name: 'followerList',
        component: () => import('@/views/home/followerList.vue'),
        meta: {cacheNumber:0},
        beforeEnter: (to:any, from:any, next:any) => {
            const store = useStore(pinia);
            if((from.name == 'home' && from.query.userName == undefined) || from.name == 'login'){//如果来自指定页,则删除缓存
                store.setCacheNumber(to.name)
            }
            next();
        }
    },
    {
        path: '/user/control/privateMessageList',//私信列表
        name: 'privateMessageList',
        component: () => import('@/views/home/privateMessageList.vue'),
        meta: {cacheNumber:0},
        beforeEnter: (to:any, from:any, next:any) => {
            const store = useStore(pinia);
            if((from.name == 'home' && from.query.userName == undefined) || from.name == 'login'){//如果来自指定页,则删除缓存
                store.setCacheNumber(to.name)
            }
            next();
        }
    },
    {
        path: '/user/control/privateMessageChatList',//私信对话
        name: 'privateMessageChatList',
        component: () => import('@/views/home/privateMessageChatList.vue'),
        meta: {cacheNumber:0},
        beforeEnter: (to:any, from:any, next:any) => {
            const store = useStore(pinia);
            if(from.name == 'home' || from.name == 'privateMessageList' || from.name == 'login'){//如果来自指定页,则删除缓存
                store.setCacheNumber(to.name)
            }
            next();
        }
    },
    {
        path: '/user/control/remindList',//提醒
        name: 'remindList',
        component: () => import('@/views/home/remindList.vue'),
        meta: {cacheNumber:0},
        beforeEnter: (to:any, from:any, next:any) => {
            const store = useStore(pinia);
            if((from.name == 'home' && from.query.userName == undefined) || from.name == 'login'){//如果来自指定页,则删除缓存
                store.setCacheNumber(to.name)
            }
            next();
        }
    },
    {
        path: '/user/control/systemNotifyList',//系统通知
        name: 'systemNotifyList',
        component: () => import('@/views/home/systemNotifyList.vue'),
        meta: {cacheNumber:0},
        beforeEnter: (to:any, from:any, next:any) => {
            const store = useStore(pinia);
            if(from.name == 'home' || from.name == 'login'){//如果来自指定页,则删除缓存
                store.setCacheNumber(to.name)
            }
            next();
        }
    },
    {
        path: '/user/control/membershipCardOrderList',//会员卡订单
        name: 'membershipCardOrderList',
        component: () => import('@/views/home/membershipCardOrderList.vue'),
        meta: {cacheNumber:0},
        beforeEnter: (to:any, from:any, next:any) => {
            const store = useStore(pinia);
            if(from.name == 'home' || from.name == 'login'){//如果来自指定页,则删除缓存
                store.setCacheNumber(to.name)
            }
            next();
        }
    },
    {
        path: '/user/control/balance',//余额
        name: 'balance',
        component: () => import('@/views/home/balance.vue'),
        meta: {cacheNumber:0},
        beforeEnter: (to:any, from:any, next:any) => {
            const store = useStore(pinia);
            if(from.name == 'home' || from.name == 'login'){//如果来自指定页,则删除缓存
                store.setCacheNumber(to.name)
            }
            next();
        }
    },
    {
        path: '/user/control/payment',//付款
        name: 'payment',
        component: () => import('@/views/home/payment.vue'),
        meta: {cacheNumber:0},
    },
    {
        path: '/paymentCompleted/:interfaceProduct/:paymentModule/:parameterId',//支付完成
        name: 'paymentCompleted',
        component: () => import('@/views/paymentCompleted.vue'),
        meta: {cacheNumber:0}
    },
    {
        path: '/user/control/giveRedEnvelopeList',//发红包列表
        name: 'giveRedEnvelopeList',
        component: () => import('@/views/home/giveRedEnvelopeList.vue'),
        meta: {cacheNumber:0},
        beforeEnter: (to:any, from:any, next:any) => {
            const store = useStore(pinia);
            if(from.name == 'home' || from.name == 'login'){//如果来自指定页,则删除缓存
                store.setCacheNumber(to.name)
            }
            next();
        }
    },
    {
        path: '/user/control/redEnvelopeAmountDistributionList',//发红包金额分配列表
        name: 'redEnvelopeAmountDistributionList',
        component: () => import('@/views/home/redEnvelopeAmountDistributionList.vue'),
        meta: {cacheNumber:0},
        beforeEnter: (to:any, from:any, next:any) => {
            const store = useStore(pinia);
            if(from.name == 'giveRedEnvelopeList' ||from.name == 'topicList' || from.name == 'login'){//如果来自指定页,则删除缓存
                store.setCacheNumber(to.name)
            }
            next();
        }
    }, 
    {
        path: '/user/control/receiveRedEnvelopeList',//收红包列表
        name: 'receiveRedEnvelopeList',
        component: () => import('@/views/home/receiveRedEnvelopeList.vue'),
        meta: {cacheNumber:0},
        beforeEnter: (to:any, from:any, next:any) => {
            const store = useStore(pinia);
            if((from.name == 'home' && from.query.userName == undefined) || from.name == 'login'){//如果来自指定页,则删除缓存
                store.setCacheNumber(to.name)
            }
            next();
        }
    },
    {
        path: '/user/control/realNameAuthentication',//实名认证
        name: 'realNameAuthentication',
        component: () => import('@/views/home/realNameAuthentication.vue'),
        meta: {cacheNumber:0}
    },
    {
        path: '/user/control/editUser',//修改个人资料
        name: 'editUser',
        component: () => import('@/views/home/editUser.vue'),
        meta: {cacheNumber:0}
    },
    {
        path: '/user/control/phoneBinding',//手机绑定
        name: 'phoneBinding',
        component: () => import('@/views/home/phoneBinding.vue'),
        meta: {cacheNumber:0}
    },
    {
        path: '/user/control/updatePhoneBinding/step1',//修改手机绑定 第一步验证旧手机
        name: 'updatePhoneBinding_step1',
        component: () => import('@/views/home/updatePhoneBinding_step1.vue'),
        meta: {cacheNumber:0}
    },
    {
        path: '/user/control/updatePhoneBinding/step2',//修改手机绑定 第二步验证新手机
        name: 'updatePhoneBinding_step2',
        component: () => import('@/views/home/updatePhoneBinding_step2.vue'),
        meta: {cacheNumber:0}
    },
    
    {
        path: '/user/control/point',//积分
        name: 'point',
        component: () => import('@/views/home/point.vue'),
        meta: {cacheNumber:0}
    },
    {
        path: '/user/control/reportList',//举报列表
        name: 'reportList',
        component: () => import('@/views/home/reportList.vue'),
        meta: {cacheNumber:0}
    },
    {
        path: '/user/control/userLoginLogList',//用户登录日志列表
        name: 'userLoginLogList',
        component: () => import('@/views/home/userLoginLogList.vue'),
        meta: {cacheNumber:0}
    },
    {
        path: '/findPassWord/step1',//找回密码 第一步
        name: 'findPassWord_step1',
        component: () => import('@/views/findPassWord_step1.vue'),
        meta: {cacheNumber:0}
    },
    {
        path: '/findPassWord/step2',//找回密码 第二步
        name: 'findPassWord_step2',
        component: () => import('@/views/findPassWord_step2.vue'),
        meta: {cacheNumber:0}
    },

    
//    {path : '/:pathMatch(.*)*', redirect:{name:'diary'}}//其余路由重定向至日记本首页。
    { path: '/', redirect: { name: 'diary' }},//根路径重定向到日记本
    { path: '/:pathMatch(.*)*', redirect: (to: any) => {

        return { name: 'diary' };//重定向的 字符串路径/路径对象
    }},
    
]

let scrollBehavior = function (to:any, from:any, savedPosition:any) {
	if (savedPosition) {
		// savedPosition仅适用于popstate导航。
		return savedPosition;
	} else {
        
        //只有点击返回按钮，才执行滚动
        nextTick(()=>{
            let scrollTop = 0;

            let browserHistoryList = readBrowserHistory();
            if(browserHistoryList != null && browserHistoryList.length >0 && browserHistoryList[browserHistoryList.length-1]){
                //最后一个浏览记录(最后一项记录对应点击返回按钮onBack()) 
                let lastHistory = browserHistoryList[browserHistoryList.length-1];
                if(lastHistory.url == to.fullPath){
                    scrollTop = lastHistory.scrollTop;
                }
            }
            setScrollTop(scrollTop)
        })
	}
};

export default createRouter({
    history: createWebHistory(),
    scrollBehavior : scrollBehavior, //记住页面的滚动位置 html5模式适用
    routes
})