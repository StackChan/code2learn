import { VNode, createApp } from 'vue'
import NotifyHtml from '@/components/NotifyHtml.vue'

export interface NotifyHtml {
    close: ()=>{}
}


//创建头部弹出消息提示
const createNotifyHtml = (message:string|VNode, option = {}) => {
    const mountNode:any = document.createElement('div');


    const Instance = createApp(NotifyHtml, {
        show: true,
        message,
        ...option,
        close: () => { 
            Instance.unmount(); //卸载应用
            document.body.removeChild(mountNode);
        }
    })

  
    document.body.appendChild(mountNode)
    Instance.mount(mountNode)//挂载应用
    return {
        close: () => {
            Instance.unmount(); //卸载应用
            document.body.removeChild(mountNode);
        },
    } as NotifyHtml;
}
export default createNotifyHtml