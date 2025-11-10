import { SystemUser } from "@/types";
import { defineStore } from "pinia";
import createRouter from '@/router'
import * as extension from "@/utils/extension";
const extensionFunction = extension;

 /**
  * 定义容器并导出
  * 参数一: 容器ID, 唯一, Pinia 会把所有的容器挂载到根容器
  * 参数二: 选项对象
  * 返回值: 函数, 调用的时候要空参调用, 返回容器实例
  */
export const useStore = defineStore('main', {
     /**
      * 类似组件的 data, 用于存储全局的的状态
      * 注意:
      *    1.必须是函数, 为了在服务端渲染的时候避免交叉请求导致的数据交叉污染
      *    2.必须是箭头函数, 为了更好的 TS 类型推导
      */
     state: () => {
         return {
            apiUrl: import.meta.env.VITE_API_URL,//后端地址
            baseURL :'',//系统路径
            commonPath:'',//后端资源路径
            contextPath:'',//后端系统虚拟目录
            templateDir:'',//后端模板目录名称
            title: '',//站点名称
            keywords:'',//站点关键词
            description:'',//站点描述
            systemUser:  {} as SystemUser,//登录用户
            baseURI:'',//系统资源标识符
            fileStorageSystem: 0,//文件存储系统 0.本地系统 10.SeaweedFS 20.MinIO 30.阿里云OSS
            supportAccessDevice: 1,//支持访问设备 1.自动识别终端 2.电脑端 3.移动端
            weixin_oa_appid:'',//微信公众号appid

            transparentImage:'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==',//透明1像素图片
            
            userInfoVersion: 0, //用户信息信息版本  App.vue监听本参数，当数值变化时执行刷新登录用户信息
            topicDetailPermission:true,//是否有话题内容页的访问权限
            isPopUpWindow: false, //是否有弹出窗口

            aiAssistantParameter :{} as any,//AI助手参数

            defaultLanguage:'zh_CN',//默认语言（当用户不主动切换语言时指定的默认语言。空值表示选择用户操作系统浏览器的语言为默认语言；"zh_CN"; "en_US"）
            currentLanguage:'',//当前语言
            languageSwitching: new Map<string,string>,//多语言切换

            cacheComponents: [] as any,//keepAlive缓存组件
         }
     },
     /**
      * 类似组件的 computed, 用来封装计算属性, 具有缓存特性
      */
     getters: {
        getCacheComponents: function (state) {
            return state.cacheComponents;
        },
        //keep-alive缓存key
        getCacheKey: function () {
            let cacheNumber = 0;

            let name = String(createRouter.currentRoute.value.name);
            let routes =  createRouter.getRoutes();
            for(let i=0; i<routes.length; i++){
                let route = routes[i];
                if(route.name == name){
                    cacheNumber = route.meta.cacheNumber as number;
                }
            }
            return cacheNumber+"::"+createRouter.currentRoute.value.fullPath;
        },

        //是否有弹出窗口
        getPopUpWindow: function (state) {
            return state.isPopUpWindow;
        },
      
    },
    /**
      * 类似组件的 methods, 封装业务逻辑, 修改state
      * 注意: 里面的函数不能定义成箭头函数(函数体中会用到this)
      */
    actions: {
        setCacheComponents: function (name:string) {
            if(!this.cacheComponents.contains(name)){
                this.cacheComponents.push(name);
            }
        },
        //设置缓存编号
		setCacheNumber : function (name:string){
            let routes =  createRouter.getRoutes();
            for(let i=0; i<routes.length; i++){
                let route = routes[i];
                if(route.name == name){
                    route.meta.cacheNumber = new Date().getTime();
                }
            }
        },
        //设置是否有弹出窗口
        setPopUpWindow: function (status:boolean) {
            this.isPopUpWindow = status;
        },
 
    }
})
