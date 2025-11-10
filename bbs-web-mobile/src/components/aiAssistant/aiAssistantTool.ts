import { AiChatInsertData } from "@/types";
import { editorUpload, showNotifications } from "@/utils/markdownEditor";
import { AppContext, ComponentPublicInstance } from "vue";
import AiAssistantDialog from "@/components/aiAssistant/aiAssistantDialog.vue";
import type { BytemdEditorContext } from 'bytemd'
import { useStore } from "@/store";
import { storeToRefs } from "pinia";
import { Notify } from "vant";
import i18n from "@/locale/index";
const { t } = i18n.global;


/**
 * 显示、隐藏AI弹窗
 * @param proxy
 * @param appContext
 * @param editorId 编辑器Id
 * @param uploadServer 上传服务器地址
 * @param uploadFieldName 上传字段名称
 * @param fileStorageSystem 文件存储系统
 * @param isMarkdown 是否为Markdown编辑器
 * @param richTextEditor 富文本编辑器
 * @param ctx Markdown编辑器
 */
export function aiPopUp (proxy: any,appContext: AppContext,editorId: string, uploadServer:string,uploadFieldName:string,fileStorageSystem:number, isMarkdown:boolean,richTextEditor:any, ctx:BytemdEditorContext| undefined){
    const store = useStore();
    const {aiAssistantParameter:store_aiAssistantParameter} = storeToRefs(store);

    let parameter = {
        editorId: editorId, 
        uploadServer:uploadServer,
        uploadFieldName:uploadFieldName,
        fileStorageSystem:fileStorageSystem, 
        isMarkdown:isMarkdown,
        richTextEditor:richTextEditor, 
        ctx:ctx
    }

    store_aiAssistantParameter.value = parameter;

    // 调用弹窗
    proxy?.$aiAssistantDialog(AiAssistantDialog, {
        show: true
    },
    appContext,
    (data:AiChatInsertData)=>{

        let aiAssistantParameter = store_aiAssistantParameter.value
        //type 0.无 10.纯文本 20.代码 30.图片
        if(data.type == 20){//代码
            if(aiAssistantParameter.isMarkdown){
                if(aiAssistantParameter.ctx){
                    aiAssistantParameter.ctx.appendBlock(`\`\`\`${data.language}\n${data.content}\`\`\``+'\n');
                }
            }else{
                aiAssistantParameter.richTextEditor.txt.insertCode(data.language, data.content);
            }
            Notify({ 
                type: 'success', 
                message: t('aiAssistantTool.10')//代码已插入到编辑器
            });
        }else if(data.type == 30){//图片
            fetch(data.content)
                .then(response => response.blob())
                .then(async blob => {
                    
                    let fileName = data.content.substring(data.content.lastIndexOf("/")+1);
                    if(fileName.indexOf("?") != -1){
                        fileName = fileName.substring(0,fileName.lastIndexOf('?'));
                    }
                    
                    let file = blobToFile(blob,fileName);

                    let notificationMap = showNotifications(new Array(file));

                    editorUpload(new Array(file), (url: string, title: string)=>{
                        
                        if(aiAssistantParameter.isMarkdown){
                            if(aiAssistantParameter.ctx){
                                aiAssistantParameter.ctx.appendBlock(`![${title}](${url})`+'\n');
                            }
                        }else{
                            aiAssistantParameter.richTextEditor.txt.insertImage(url,title);
                        }


                        let notification = notificationMap.get(title)
                        if(notification){
                            notification.close();
                        }
                    },aiAssistantParameter.uploadServer,aiAssistantParameter.uploadFieldName,'image',aiAssistantParameter.fileStorageSystem);
                }
            );

        }
    })
}

//Blob转File格式
const blobToFile = (theBlob: Blob, fileName:string): File => {       
    return new File(
        [theBlob as any], // cast as any
        fileName, 
        {
            lastModified: new Date().getTime(),
            type: theBlob.type 
        }
    )
}
