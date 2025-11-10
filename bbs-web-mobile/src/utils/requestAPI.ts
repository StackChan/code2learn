import { AxiosResponse } from "axios";
import { User } from "@/types";
import axiosInstance from '@/utils/http'


let queryData = (keyword:string) =>{
   /**
    const [res] = await Promise.all([axiosInstance({
        url: '/user/control/queryUser',
        method: 'get',
        params:  {keyword:keyword},
        showLoading: false,//是否显示加载图标
        loadingMask:false,// 是否显示遮罩层
        })])

        console.log("查询提及用户",res);

    return res**/

    /** 
    return axiosInstance({ 
        url: '/user/control/queryUser',
        method: 'get',
        params:  {keyword:keyword},
        showLoading: false,//是否显示加载图标
        loadingMask:false,// 是否显示遮罩层
    })**/
    return new Promise((resolve, reject) => {
        axiosInstance({ 
            url: '/user/control/queryUser',
            method: 'get',
            params:  {keyword:keyword},
            showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
        }).then((result) => {
            console.log("查询提及用户");
            resolve(result);
        })
    }); 
};


/**
 * 查询提及用户
 * @param keyword 关键字
 * @param callback 回调
 */
export function queryMentionUser(keyword:string,callback: { (mentionUser: User): void; (arg0: User | undefined): void; }){
    axiosInstance({
        url: '/user/control/queryUser',
        method: 'get',
        params:  {keyword:keyword},
        showLoading: false,//是否显示加载图标
        loadingMask:false,// 是否显示遮罩层
    }).then((response: AxiosResponse) => {
        const result: any = response.data;
        if(result != ""){
            let mentionUser:User = JSON.parse(result);
            if(mentionUser != null){
                callback(mentionUser);
                return;
            }
            
        }
        callback(undefined);
    }).catch((error: any) =>{
        console.log(error);
    });
}
