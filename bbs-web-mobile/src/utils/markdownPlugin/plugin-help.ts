import { UserGrade } from '@/types';
import type { BytemdPlugin } from 'bytemd'
import Long from "long";
import { createApp } from 'vue'
import MarkdownEditorHelpPopup from '@/components/MarkdownEditorHelpPopup.vue'

/**
 * 帮助信息
 * @param availableTag 编辑器允许使用标签
 * @param userGradeList 用户等级
 * @returns 
 */
export function help(availableTag: Array<string>, userGradeList: Array<UserGrade>): BytemdPlugin {

  interface MarkdownEditorHelp {
      close: ()=>{}
  }

  interface Tag {
    icon:string,
    title:string,
    content:string,
  }


  //创建底部弹出框
  const createMarkdownEditorHelpPopup = (message:HTMLElement, option = {}) => {
      const mountNode:any = document.createElement('div');


      const Instance = createApp(MarkdownEditorHelpPopup, {
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
      } as MarkdownEditorHelp;
  }

  //帮助内容
  const helpElement = () => {
    const help_element:HTMLElement = document.createElement("div");
    help_element.className = "markdown-help";
    

    const default_title_element:HTMLElement = document.createElement("h2");
    default_title_element.innerHTML = "Markdown 语法"
    help_element.appendChild(default_title_element);


    let default_ul = document.createElement("ul");


    let default_tags = new Array<Tag>();
    default_tags.push({title:'一级标题',content:'# 标题',icon:'<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 48 48"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M6 8v32M25 8v32M6 24h19M34.226 24 39 19.017V40"></path></svg>'})
    default_tags.push({title:'二级标题',content:'## 标题',icon:'<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 48 48"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M6 8v32M24 8v32M7 24h16M32 25c0-3.167 2.667-5 5-5s5 1.833 5 5c0 5.7-10 9.933-10 15h10"></path></svg>'})
    default_tags.push({title:'三级标题',content:'### 标题',icon:'<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 48 48"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M6 8v32M24 8v32M7 24h16M32 20h10l-7 9c4 0 7 2 7 6s-3 5-5 5c-2.381 0-4-1-5-2.1"></path></svg>'})
    default_tags.push({title:'粗体',content:'**粗体文本**',icon:'<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 48 48"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M24 24c5.506 0 9.969-4.477 9.969-10S29.506 4 24 4H11v20h13ZM28.031 44C33.537 44 38 39.523 38 34s-4.463-10-9.969-10H11v20h17.031Z" clip-rule="evenodd"></path></svg>'})
    default_tags.push({title:'斜体',content:'*斜体文本*',icon:'<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 48 48"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M20 6h16M12 42h16M29 5.952 19 42"></path></svg>'})
    default_tags.push({title:'引用',content:'> 引用文本',icon:'<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 48 48"><path fill="currentColor" fill-rule="evenodd" d="M18.853 9.116C11.323 13.952 7.14 19.58 6.303 26.003 5 36 13.94 40.893 18.47 36.497 23 32.1 20.285 26.52 17.005 24.994c-3.28-1.525-5.286-.994-4.936-3.033.35-2.038 5.016-7.69 9.116-10.322a.749.749 0 0 0 .114-1.02L20.285 9.3c-.44-.572-.862-.55-1.432-.185ZM38.679 9.116c-7.53 4.836-11.714 10.465-12.55 16.887-1.303 9.997 7.637 14.89 12.167 10.494 4.53-4.397 1.815-9.977-1.466-11.503-3.28-1.525-5.286-.994-4.936-3.033.35-2.038 5.017-7.69 9.117-10.322a.749.749 0 0 0 .113-1.02L40.11 9.3c-.44-.572-.862-.55-1.431-.185Z" clip-rule="evenodd"></path></svg>'})
    default_tags.push({title:'链接',content:'[链接描述](url)',icon:'<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 48 48"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="m26.24 16.373-9.14-9.14c-2.661-2.661-7.035-2.603-9.768.131-2.734 2.734-2.793 7.107-.131 9.768l7.935 7.936M32.903 23.003l7.935 7.935c2.661 2.662 2.603 7.035-.13 9.769-2.735 2.734-7.108 2.792-9.77.13l-9.14-9.14"></path><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M26.11 26.142c2.733-2.734 2.792-7.108.13-9.769M21.799 21.798c-2.734 2.734-2.792 7.108-.131 9.769"></path></svg>'})
    default_tags.push({title:'图片',content:'![alt](url "图片描述")',icon:'<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 48 48"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M5 10a2 2 0 0 1 2-2h34a2 2 0 0 1 2 2v28a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V10Z" clip-rule="evenodd"></path><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M14.5 18a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" clip-rule="evenodd"></path><path stroke="currentColor" stroke-linejoin="round" stroke-width="4" d="m15 24 5 4 6-7 17 13v4a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-4l10-10Z"></path></svg>'})
    default_tags.push({title:'代码',content:'`代码`',icon:'<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 48 48"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M16 13 4 25.432 16 37M32 13l12 12.432L32 37"></path><path stroke="currentColor" stroke-linecap="round" stroke-width="4" d="m28 4-7 40"></path></svg>'})
    default_tags.push({title:'代码块',content:'```编程语言↵',icon:'<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 48 48"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M16 4c-2 0-5 1-5 5v9c0 3-5 5-5 5s5 2 5 5v11c0 4 3 5 5 5M32 4c2 0 5 1 5 5v9c0 3 5 5 5 5s-5 2-5 5v11c0 4-3 5-5 5"></path></svg>'})
    default_tags.push({title:'无序列表',content:'- 项目',icon:'<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 48 48"><path stroke="currentColor" stroke-linejoin="round" stroke-width="4" d="M9 42a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM9 14a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM9 28a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"></path><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M21 24h22M21 38h22M21 10h22"></path></svg>'})
    default_tags.push({title:'有序列表',content:'1. 项目',icon:'<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 48 48"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M9 4v9M12 13H6M12 27H6M6 20s3-3 5 0-5 7-5 7M6 34.5s2-3 5-1 0 4.5 0 4.5 3 2.5 0 4.5-5-1-5-1M11 38H9M9 4 6 6M21 24h22M21 38h22M21 10h22"></path></svg>'})
    default_tags.push({title:'分割线',content:'---',icon:'<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 48 48"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M5 24h38M21 38h6M37 38h6M21 10h6M5 38h6M5 10h6M37 10h6"></path></svg>'})
    default_tags.push({title:'删除线',content:'~~文本~~',icon:'<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 48 48"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M5 24h38M24 24c16 6 10 20 0 20s-12-8-12-8M36 12s-3-8-12-8-12.564 7.6-8.39 14"></path><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M12 36s4 8 12 8 12.564-7.6 8.39-14"></path></svg>'})
    default_tags.push({title:'任务列表',content:'- [ ] 待办事项',icon:'<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 48 48"><g stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" clip-path="url(#a)"><path d="M42 20v19a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3V9a3 3 0 0 1 3-3h21"></path><path d="m16 20 10 8L41 7"></path></g><defs><clipPath id="a"><path fill="currentColor" d="M0 0h48v48H0z"></path></clipPath></defs></svg>'})
    default_tags.push({title:'行内公式',content:'$公式$',icon:'<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 48 48"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="m37 9-3-3H8l17 18L8 42h26l3-3M5 24h10M33 24h10"></path></svg>'})
    default_tags.push({title:'块级公式',content:'$$↵公式↵$$',icon:'<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 48 48"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="m36 11-3-3H12l16 16-16 16h21l3-3M6 5v38M42 5v38"></path></svg>'})
    default_tags.push({title:'Mermaid图表',content:'```mermaid',icon:'<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 48 48"><path stroke="currentColor" stroke-linejoin="round" stroke-width="4" d="M17 6h14v9H17zM6 33h14v9H6zM28 33h14v9H28z"></path><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M24 16v8M13 33v-9h22v9"></path></svg>'})



    for(let i =0; i<default_tags.length; i++){
      let tag = default_tags[i];

      let li = document.createElement("li");
      let div_icon = document.createElement("div");
      div_icon.setAttribute("class","help-icon");
      div_icon.innerHTML = tag.icon;
      let div_title = document.createElement("div");
      div_title.setAttribute("class","help-title");
      div_title.innerText = tag.title;
      let div_content = document.createElement("div");
      div_content.setAttribute("class","help-content");
      let div_code = document.createElement("code");
      div_code.innerText = tag.content;
      div_content.appendChild(div_code);
      li.appendChild(div_icon);
      li.appendChild(div_title);
      li.appendChild(div_content);
      default_ul.appendChild(li);

    }

    help_element.appendChild(default_ul);

    
    const fast_title_element:HTMLElement = document.createElement("h2");
    fast_title_element.innerHTML = "快捷键"
    help_element.appendChild(fast_title_element);


    let fast_ul = document.createElement("ul");
    let fast_tags = new Array<Tag>();
    fast_tags.push({title:'粗体',content:'Ctrl-B',icon:'<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 48 48"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M24 24c5.506 0 9.969-4.477 9.969-10S29.506 4 24 4H11v20h13ZM28.031 44C33.537 44 38 39.523 38 34s-4.463-10-9.969-10H11v20h17.031Z" clip-rule="evenodd"></path></svg>'})
    fast_tags.push({title:'斜体',content:'Ctrl-I',icon:'<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 48 48"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M20 6h16M12 42h16M29 5.952 19 42"></path></svg>'})
    fast_tags.push({title:'链接',content:'Ctrl-K',icon:'<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 48 48"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="m26.24 16.373-9.14-9.14c-2.661-2.661-7.035-2.603-9.768.131-2.734 2.734-2.793 7.107-.131 9.768l7.935 7.936M32.903 23.003l7.935 7.935c2.661 2.662 2.603 7.035-.13 9.769-2.735 2.734-7.108 2.792-9.77.13l-9.14-9.14"></path><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M26.11 26.142c2.733-2.734 2.792-7.108.13-9.769M21.799 21.798c-2.734 2.734-2.792 7.108-.131 9.769"></path></svg>'})
    fast_tags.push({title:'代码',content:'Shift-Ctrl-K',icon:'<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 48 48"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M16 13 4 25.432 16 37M32 13l12 12.432L32 37"></path><path stroke="currentColor" stroke-linecap="round" stroke-width="4" d="m28 4-7 40"></path></svg>'})
    fast_tags.push({title:'代码块',content:'Shift-Ctrl-C',icon:'<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 48 48"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M16 4c-2 0-5 1-5 5v9c0 3-5 5-5 5s5 2 5 5v11c0 4 3 5 5 5M32 4c2 0 5 1 5 5v9c0 3 5 5 5 5s-5 2-5 5v11c0 4-3 5-5 5"></path></svg>'})
    fast_tags.push({title:'无序列表',content:'Shift-Ctrl-U',icon:'<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 48 48"><path stroke="currentColor" stroke-linejoin="round" stroke-width="4" d="M9 42a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM9 14a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM9 28a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"></path><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M21 24h22M21 38h22M21 10h22"></path></svg>'})
    fast_tags.push({title:'有序列表',content:'Shift-Ctrl-O',icon:'<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 48 48"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M9 4v9M12 13H6M12 27H6M6 20s3-3 5 0-5 7-5 7M6 34.5s2-3 5-1 0 4.5 0 4.5 3 2.5 0 4.5-5-1-5-1M11 38H9M9 4 6 6M21 24h22M21 38h22M21 10h22"></path></svg>'})

    for(let i =0; i<fast_tags.length; i++){
      let tag = fast_tags[i];

      let li = document.createElement("li");
      let div_icon = document.createElement("div");
      div_icon.setAttribute("class","help-icon");
      div_icon.innerHTML = tag.icon;
      let div_title = document.createElement("div");
      div_title.setAttribute("class","help-title");
      div_title.innerText = tag.title;
      let div_content = document.createElement("div");
      div_content.setAttribute("class","help-content");
      let div_code = document.createElement("code");
      div_code.innerText = tag.content;
      div_content.appendChild(div_code);
      li.appendChild(div_icon);
      li.appendChild(div_title);
      li.appendChild(div_content);
      fast_ul.appendChild(li);

    }

    help_element.appendChild(fast_ul);


    let h2 = document.createElement("h2");
    h2.innerText = '扩展标签';
    help_element.appendChild(h2);

    let ul = document.createElement("ul");
    


    if(availableTag != null && availableTag.length >0){
      for(let i=0; i< availableTag.length; i++){
          let tag = availableTag[i];
          if(tag == "hidePassword"){
            let li = document.createElement("li");
            let div1 = document.createElement("div");
            div1.setAttribute("class","help-icon");
            div1.innerHTML = '<svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="6" y="22" width="36" height="22" rx="2" fill="none" stroke="#969799" stroke-width="4" stroke-linejoin="round"/><path d="M14 22V14C14 8.47715 18.4772 4 24 4C29.5228 4 34 8.47715 34 14V22" stroke="#969799" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M24 30V36" stroke="#969799" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
            let div2 = document.createElement("div");
            div2.setAttribute("class","help-title");
            div2.innerText = '隐藏内容 -- 输入密码可见';
            let div3 = document.createElement("div");
            let div3_code = document.createElement("code");
            div3_code.innerText = '<hide hide-type="10" input-value="密码"></hide>';
            div3.appendChild(div3_code);
            li.appendChild(div1);
            li.appendChild(div2);
            li.appendChild(div3);
            ul.appendChild(li);
          }
          if(tag == "hideComment"){
            let li = document.createElement("li");
            let div1 = document.createElement("div");
            div1.setAttribute("class","help-icon");
            div1.innerHTML = '<svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="6" y="22" width="36" height="22" rx="2" fill="none" stroke="#969799" stroke-width="4" stroke-linejoin="round"/><path d="M14 22V14C14 8.47715 18.4772 4 24 4C29.5228 4 34 8.47715 34 14V22" stroke="#969799" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M24 30V36" stroke="#969799" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
            let div2 = document.createElement("div");
            div2.setAttribute("class","help-title");
            div2.innerText = '隐藏内容 -- 回复话题可见';
            let div3 = document.createElement("div");
            let div3_code = document.createElement("code");
            div3_code.innerText = '<hide hide-type="20"></hide>';
            div3.appendChild(div3_code);
            li.appendChild(div1);
            li.appendChild(div2);
            li.appendChild(div3);
            ul.appendChild(li);
          }
          if(tag == "hideGrade"){
            let li = document.createElement("li");
            let div1 = document.createElement("div");
            div1.setAttribute("class","help-icon");
            div1.innerHTML = '<svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="6" y="22" width="36" height="22" rx="2" fill="none" stroke="#969799" stroke-width="4" stroke-linejoin="round"/><path d="M14 22V14C14 8.47715 18.4772 4 24 4C29.5228 4 34 8.47715 34 14V22" stroke="#969799" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M24 30V36" stroke="#969799" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
            let div2 = document.createElement("div");
            div2.setAttribute("class","help-title");
            div2.innerText = '隐藏内容 -- 达到等级可见';
            let div3 = document.createElement("div");
            let div3_code = document.createElement("code");
            div3_code.innerText = '<hide hide-type="30" input-value="等级积分" description="等级名称"></hide>';
            div3.appendChild(div3_code);


            let div4 = document.createElement("div");
            div4.setAttribute("class","help-selectGrade");
            div4.innerText = '可选等级：';

            li.appendChild(div1);
            li.appendChild(div2);
            li.appendChild(div3);
            li.appendChild(div4);
            
            if(userGradeList != null && userGradeList.length >0){
              for(let i=0; i< userGradeList.length; i++){
                  let userGrade:UserGrade = userGradeList[i];
                  if(Long.fromString(userGrade.needPoint).gt(0)){
                    let div5 = document.createElement("div");
                    div5.setAttribute("class","help-gradeItem");
                    let span1 = document.createElement("span");
                    span1.setAttribute("class","help-userGrade-needPoint");
                    span1.innerText = userGrade.name;

                    let span2 = document.createElement("span");
                    span2.innerText = userGrade.needPoint;
                    div5.appendChild(span1);
                    div5.appendChild(span2);
                    li.appendChild(div5);
                  }
              }
            }
            ul.appendChild(li);
          }
          if(tag == "hidePoint"){
            let li = document.createElement("li");
            let div1 = document.createElement("div");
            div1.setAttribute("class","help-icon");
            div1.innerHTML = '<svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="6" y="22" width="36" height="22" rx="2" fill="none" stroke="#969799" stroke-width="4" stroke-linejoin="round"/><path d="M14 22V14C14 8.47715 18.4772 4 24 4C29.5228 4 34 8.47715 34 14V22" stroke="#969799" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M24 30V36" stroke="#969799" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
            let div2 = document.createElement("div");
            div2.setAttribute("class","help-title");
            div2.innerText = '隐藏内容 -- 积分购买可见';
            let div3 = document.createElement("div");
            let div3_code = document.createElement("code");
            div3_code.innerText = '<hide hide-type="40" input-value="积分"></hide>';
            div3.appendChild(div3_code);
            li.appendChild(div1);
            li.appendChild(div2);
            li.appendChild(div3);
            ul.appendChild(li);
          }
          if(tag == "hideAmount"){
            let li = document.createElement("li");
            let div1 = document.createElement("div");
            div1.setAttribute("class","help-icon");
            div1.innerHTML = '<svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="6" y="22" width="36" height="22" rx="2" fill="none" stroke="#969799" stroke-width="4" stroke-linejoin="round"/><path d="M14 22V14C14 8.47715 18.4772 4 24 4C29.5228 4 34 8.47715 34 14V22" stroke="#969799" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M24 30V36" stroke="#969799" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
            let div2 = document.createElement("div");
            div2.setAttribute("class","help-title");
            div2.innerText = '隐藏内容 -- 余额购买可见';
            let div3 = document.createElement("div");
            let div3_code = document.createElement("code");
            div3_code.innerText = '<hide hide-type="50" input-value="价格"></hide>';
            div3.appendChild(div3_code);
            li.appendChild(div1);
            li.appendChild(div2);
            li.appendChild(div3);
            ul.appendChild(li);
            
          }

          if(tag == "uploadVideo"){
            let li = document.createElement("li");
            let div1 = document.createElement("div");
            div1.setAttribute("class","help-icon");
            div1.innerHTML = '<svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 10C4 8.89543 4.89543 8 6 8H42C43.1046 8 44 8.89543 44 10V38C44 39.1046 43.1046 40 42 40H6C4.89543 40 4 39.1046 4 38V10Z" fill="none" stroke="#969799" stroke-width="4" stroke-linejoin="round"/><path d="M36 8V40" stroke="#969799" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 8V40" stroke="#969799" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M38 18H44" stroke="#969799" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M38 30H44" stroke="#969799" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 18H10" stroke="#969799" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 16V20" stroke="#969799" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 8H15" stroke="#969799" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 40H15" stroke="#969799" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M33 8H39" stroke="#969799" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M33 40H39" stroke="#969799" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 30H10" stroke="#969799" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 28V32" stroke="#969799" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M44 28V32" stroke="#969799" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M44 16V20" stroke="#969799" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M21 19L29 24L21 29V19Z" fill="none" stroke="#969799" stroke-width="4" stroke-linejoin="round"/></svg>';
            let div2 = document.createElement("div");
            div2.setAttribute("class","help-title");
            div2.innerText = '视频上传';
            let div3 = document.createElement("div");
            div3.setAttribute("class","help-content");
            let div3_code = document.createElement("code");
            div3_code.innerText = '!video[alt](url)';
            div3.appendChild(div3_code);
            li.appendChild(div1);
            li.appendChild(div2);
            li.appendChild(div3);
            ul.appendChild(li);
          }

          if(tag == "embedVideo"){
            let li = document.createElement("li");
            let div1 = document.createElement("div");
            div1.setAttribute("class","help-icon");
            div1.innerHTML = '<svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 10C4 8.89543 4.89543 8 6 8H42C43.1046 8 44 8.89543 44 10V38C44 39.1046 43.1046 40 42 40H6C4.89543 40 4 39.1046 4 38V10Z" fill="none" stroke="#969799" stroke-width="4" stroke-linejoin="round"/><path d="M36 8V40" stroke="#969799" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 8V40" stroke="#969799" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M38 18H44" stroke="#969799" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M38 30H44" stroke="#969799" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 18H10" stroke="#969799" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 16V20" stroke="#969799" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 8H15" stroke="#969799" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 40H15" stroke="#969799" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M33 8H39" stroke="#969799" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M33 40H39" stroke="#969799" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 30H10" stroke="#969799" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 28V32" stroke="#969799" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M44 28V32" stroke="#969799" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M44 16V20" stroke="#969799" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M21 19L29 24L21 29V19Z" fill="none" stroke="#969799" stroke-width="4" stroke-linejoin="round"/></svg>';
            let div2 = document.createElement("div");
            div2.setAttribute("class","help-title");
            div2.innerText = '嵌入视频';
            let div3 = document.createElement("div");
            let div3_code = document.createElement("code");
            div3_code.innerText = '<iframe src="视频地址"></iframe>';
            div3.appendChild(div3_code);
            li.appendChild(div1);
            li.appendChild(div2);
            li.appendChild(div3);
            ul.appendChild(li);
          }

          if(tag == "insertfile"){
            let li = document.createElement("li");
            let div1 = document.createElement("div");
            div1.setAttribute("class","help-icon");
            div1.innerHTML = '<svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M40 23V14L31 4H10C8.89543 4 8 4.89543 8 6V42C8 43.1046 8.89543 44 10 44H22" stroke="#969799" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M33 29V43" stroke="#969799" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M26 36H33H40" stroke="#969799" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M30 4V14H40" stroke="#969799" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
            let div2 = document.createElement("div");
            div2.setAttribute("class","help-title");
            div2.innerText = '文件上传';
            let div3 = document.createElement("div");
            div3.setAttribute("class","help-content");
            let div3_code = document.createElement("code");
            div3_code.innerText = '!file[alt](url)';
            div3.appendChild(div3_code);
            li.appendChild(div1);
            li.appendChild(div2);
            li.appendChild(div3);
            ul.appendChild(li);
          }


          if(tag == "mention"){
            let li = document.createElement("li");
            let div1 = document.createElement("div");
            div1.setAttribute("class","help-icon");
            div1.innerHTML = '<svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M44 24C44 12.9543 35.0457 4 24 4C12.9543 4 4 12.9543 4 24C4 35.0457 12.9543 44 24 44V44C28.9886 44 33.5507 42.1735 37.0539 39.1529" stroke="#959da5" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M24 32C28.4183 32 32 28.4183 32 24C32 19.5817 28.4183 16 24 16C19.5817 16 16 19.5817 16 24C16 28.4183 19.5817 32 24 32Z" fill="none" stroke="#959da5" stroke-width="4" stroke-linejoin="round"/><path d="M32 24C32 27.3137 34.6863 30 38 30V30C41.3137 30 44 27.3137 44 24" stroke="#959da5" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M32 25V16" stroke="#959da5" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
            let div2 = document.createElement("div");
            div2.setAttribute("class","help-title");
            div2.innerText = '提及';
            let div3 = document.createElement("div");
            div3.setAttribute("class","help-content");
            let div3_code = document.createElement("code");
            div3_code.innerText = '@用户账号或呢称';
            div3.appendChild(div3_code);
            li.appendChild(div1);
            li.appendChild(div2);
            li.appendChild(div3);
            ul.appendChild(li);
          }

      }
    }


    let liTextColor = document.createElement("li");
    let divTextColor1 = document.createElement("div");
    divTextColor1.setAttribute("class","help-icon");
    divTextColor1.innerHTML = '<svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="6" y="6" width="36" height="36" rx="3" fill="none" stroke="#969799" stroke-width="4" stroke-linejoin="round"/><path d="M16 19V16H32V19" stroke="#969799" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M22 34H26" stroke="#969799" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M24 18L24 34" stroke="#969799" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    let divTextColor2 = document.createElement("div");
    divTextColor2.setAttribute("class","help-title");
    divTextColor2.innerText = '文字颜色';
    let divTextColor3 = document.createElement("div");
    let divTextColor3_code = document.createElement("code");
    divTextColor3_code.innerText = '<font color=#008000>绿色</font>';
    divTextColor3.appendChild(divTextColor3_code);
    liTextColor.appendChild(divTextColor1);
    liTextColor.appendChild(divTextColor2);
    liTextColor.appendChild(divTextColor3);
    ul.appendChild(liTextColor);


    let liBr = document.createElement("li");
    let divBr1 = document.createElement("div");
    divBr1.setAttribute("class","help-icon");
    divBr1.innerHTML = '<svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 8V40" stroke="#969799" stroke-width="4" stroke-linecap="round"/><path d="M40 8V40" stroke="#969799" stroke-width="4" stroke-linecap="round"/><path d="M20.0522 24.0083H40.0002" stroke="#969799" stroke-width="4" stroke-linecap="round"/></svg>';
    let divBr2 = document.createElement("div");
    divBr2.setAttribute("class","help-title");
    divBr2.innerText = '换行';
    let divBr3 = document.createElement("div");
    divBr3.setAttribute("class","help-content");
    let divBr3_code = document.createElement("code");
    divBr3_code.innerText = '<br>';
    divBr3.appendChild(divBr3_code);
    liBr.appendChild(divBr1);
    liBr.appendChild(divBr2);
    liBr.appendChild(divBr3);
    ul.appendChild(liBr);




    help_element.appendChild(ul);

    return help_element;
  }

  return {
    actions: [
      {
        title: '帮助',
        icon: '<svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M39 6H9C7.34315 6 6 7.34315 6 9V39C6 40.6569 7.34315 42 9 42H39C40.6569 42 42 40.6569 42 39V9C42 7.34315 40.6569 6 39 6Z" fill="none" stroke="#646566" stroke-width="4" stroke-linejoin="round"/><path d="M24 28.625V24.625C27.3137 24.625 30 21.9387 30 18.625C30 15.3113 27.3137 12.625 24 12.625C20.6863 12.625 18 15.3113 18 18.625" stroke="#646566" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path fill-rule="evenodd" clip-rule="evenodd" d="M24 37.625C25.3807 37.625 26.5 36.5057 26.5 35.125C26.5 33.7443 25.3807 32.625 24 32.625C22.6193 32.625 21.5 33.7443 21.5 35.125C21.5 36.5057 22.6193 37.625 24 37.625Z" fill="#646566"/></svg>',
        position: 'right',
        handler: {
          type: 'action',
          click: (ctx) => {

            createMarkdownEditorHelpPopup(helpElement());
            
          }
        }
      }
    ]
  }


  /** 
  return {
    editorEffect({root}) {
        const help_element = root.querySelector('.bytemd-help');
        if(help_element){
          let h2 = document.createElement("h2");
          h2.innerText = '扩展标签';
          help_element.appendChild(h2);

          let ul = document.createElement("ul");
          


          if(availableTag != null && availableTag.length >0){
            for(let i=0; i< availableTag.length; i++){
                let tag = availableTag[i];
                if(tag == "hidePassword"){
                  let li = document.createElement("li");
                  let div1 = document.createElement("div");
                  div1.setAttribute("class","bytemd-help-icon");
                  div1.innerHTML = '<svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="6" y="22" width="36" height="22" rx="2" fill="none" stroke="#969799" stroke-width="4" stroke-linejoin="round"/><path d="M14 22V14C14 8.47715 18.4772 4 24 4C29.5228 4 34 8.47715 34 14V22" stroke="#969799" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M24 30V36" stroke="#969799" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
                  let div2 = document.createElement("div");
                  div2.setAttribute("class","bytemd-help-title");
                  div2.innerText = '隐藏内容 -- 输入密码可见';
                  let div3 = document.createElement("div");
                  let div3_code = document.createElement("code");
                  div3_code.innerText = '<hide hide-type="10" input-value="密码"></hide>';
                  div3.appendChild(div3_code);
                  li.appendChild(div1);
                  li.appendChild(div2);
                  li.appendChild(div3);
                  ul.appendChild(li);
                }
                if(tag == "hideComment"){
                  let li = document.createElement("li");
                  let div1 = document.createElement("div");
                  div1.setAttribute("class","bytemd-help-icon");
                  div1.innerHTML = '<svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="6" y="22" width="36" height="22" rx="2" fill="none" stroke="#969799" stroke-width="4" stroke-linejoin="round"/><path d="M14 22V14C14 8.47715 18.4772 4 24 4C29.5228 4 34 8.47715 34 14V22" stroke="#969799" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M24 30V36" stroke="#969799" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
                  let div2 = document.createElement("div");
                  div2.setAttribute("class","bytemd-help-title");
                  div2.innerText = '隐藏内容 -- 回复话题可见';
                  let div3 = document.createElement("div");
                  let div3_code = document.createElement("code");
                  div3_code.innerText = '<hide hide-type="20"></hide>';
                  div3.appendChild(div3_code);
                  li.appendChild(div1);
                  li.appendChild(div2);
                  li.appendChild(div3);
                  ul.appendChild(li);
                }
                if(tag == "hideGrade"){
                  let li = document.createElement("li");
                  let div1 = document.createElement("div");
                  div1.setAttribute("class","bytemd-help-icon");
                  div1.innerHTML = '<svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="6" y="22" width="36" height="22" rx="2" fill="none" stroke="#969799" stroke-width="4" stroke-linejoin="round"/><path d="M14 22V14C14 8.47715 18.4772 4 24 4C29.5228 4 34 8.47715 34 14V22" stroke="#969799" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M24 30V36" stroke="#969799" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
                  let div2 = document.createElement("div");
                  div2.setAttribute("class","bytemd-help-title");
                  div2.innerText = '隐藏内容 -- 达到等级可见';
                  let div3 = document.createElement("div");
                  let div3_code = document.createElement("code");
                  div3_code.innerText = '<hide hide-type="30" input-value="等级积分" description="等级名称"></hide>';
                  div3.appendChild(div3_code);


                  let div4 = document.createElement("div");
                  div4.setAttribute("class","bytemd-help-selectGrade");
                  div4.innerText = '可选等级：';

                  li.appendChild(div1);
                  li.appendChild(div2);
                  li.appendChild(div3);
                  li.appendChild(div4);
                 
                  if(userGradeList != null && userGradeList.length >0){
                    for(let i=0; i< userGradeList.length; i++){
                        let userGrade:UserGrade = userGradeList[i];
                        if(Long.fromString(userGrade.needPoint).gt(0)){
                          let div5 = document.createElement("div");
                          div5.setAttribute("class","bytemd-help-gradeItem");
                          let span1 = document.createElement("span");
                          span1.setAttribute("class","bytemd-help-userGrade-needPoint");
                          span1.innerText = userGrade.name;

                          let span2 = document.createElement("span");
                          span2.innerText = userGrade.needPoint;
                          div5.appendChild(span1);
                          div5.appendChild(span2);
                          li.appendChild(div5);
                        }
                    }
                  }
                  ul.appendChild(li);
                }
                if(tag == "hidePoint"){
                  let li = document.createElement("li");
                  let div1 = document.createElement("div");
                  div1.setAttribute("class","bytemd-help-icon");
                  div1.innerHTML = '<svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="6" y="22" width="36" height="22" rx="2" fill="none" stroke="#969799" stroke-width="4" stroke-linejoin="round"/><path d="M14 22V14C14 8.47715 18.4772 4 24 4C29.5228 4 34 8.47715 34 14V22" stroke="#969799" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M24 30V36" stroke="#969799" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
                  let div2 = document.createElement("div");
                  div2.setAttribute("class","bytemd-help-title");
                  div2.innerText = '隐藏内容 -- 积分购买可见';
                  let div3 = document.createElement("div");
                  let div3_code = document.createElement("code");
                  div3_code.innerText = '<hide hide-type="40" input-value="积分"></hide>';
                  div3.appendChild(div3_code);
                  li.appendChild(div1);
                  li.appendChild(div2);
                  li.appendChild(div3);
                  ul.appendChild(li);
                }
                if(tag == "hideAmount"){
                  let li = document.createElement("li");
                  let div1 = document.createElement("div");
                  div1.setAttribute("class","bytemd-help-icon");
                  div1.innerHTML = '<svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="6" y="22" width="36" height="22" rx="2" fill="none" stroke="#969799" stroke-width="4" stroke-linejoin="round"/><path d="M14 22V14C14 8.47715 18.4772 4 24 4C29.5228 4 34 8.47715 34 14V22" stroke="#969799" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M24 30V36" stroke="#969799" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
                  let div2 = document.createElement("div");
                  div2.setAttribute("class","bytemd-help-title");
                  div2.innerText = '隐藏内容 -- 余额购买可见';
                  let div3 = document.createElement("div");
                  let div3_code = document.createElement("code");
                  div3_code.innerText = '<hide hide-type="50" input-value="价格"></hide>';
                  div3.appendChild(div3_code);
                  li.appendChild(div1);
                  li.appendChild(div2);
                  li.appendChild(div3);
                  ul.appendChild(li);
                  
                }

                if(tag == "uploadVideo"){
                  let li = document.createElement("li");
                  let div1 = document.createElement("div");
                  div1.setAttribute("class","bytemd-help-icon");
                  div1.innerHTML = '<svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 10C4 8.89543 4.89543 8 6 8H42C43.1046 8 44 8.89543 44 10V38C44 39.1046 43.1046 40 42 40H6C4.89543 40 4 39.1046 4 38V10Z" fill="none" stroke="#969799" stroke-width="4" stroke-linejoin="round"/><path d="M36 8V40" stroke="#969799" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 8V40" stroke="#969799" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M38 18H44" stroke="#969799" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M38 30H44" stroke="#969799" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 18H10" stroke="#969799" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 16V20" stroke="#969799" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 8H15" stroke="#969799" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 40H15" stroke="#969799" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M33 8H39" stroke="#969799" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M33 40H39" stroke="#969799" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 30H10" stroke="#969799" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 28V32" stroke="#969799" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M44 28V32" stroke="#969799" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M44 16V20" stroke="#969799" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M21 19L29 24L21 29V19Z" fill="none" stroke="#969799" stroke-width="4" stroke-linejoin="round"/></svg>';
                  let div2 = document.createElement("div");
                  div2.setAttribute("class","bytemd-help-title");
                  div2.innerText = '视频上传';
                  let div3 = document.createElement("div");
                  div3.setAttribute("class","bytemd-help-content");
                  let div3_code = document.createElement("code");
                  div3_code.innerText = '!video[alt](url)';
                  div3.appendChild(div3_code);
                  li.appendChild(div1);
                  li.appendChild(div2);
                  li.appendChild(div3);
                  ul.appendChild(li);
                }

                if(tag == "embedVideo"){
                  let li = document.createElement("li");
                  let div1 = document.createElement("div");
                  div1.setAttribute("class","bytemd-help-icon");
                  div1.innerHTML = '<svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 10C4 8.89543 4.89543 8 6 8H42C43.1046 8 44 8.89543 44 10V38C44 39.1046 43.1046 40 42 40H6C4.89543 40 4 39.1046 4 38V10Z" fill="none" stroke="#969799" stroke-width="4" stroke-linejoin="round"/><path d="M36 8V40" stroke="#969799" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 8V40" stroke="#969799" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M38 18H44" stroke="#969799" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M38 30H44" stroke="#969799" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 18H10" stroke="#969799" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 16V20" stroke="#969799" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 8H15" stroke="#969799" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 40H15" stroke="#969799" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M33 8H39" stroke="#969799" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M33 40H39" stroke="#969799" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 30H10" stroke="#969799" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 28V32" stroke="#969799" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M44 28V32" stroke="#969799" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M44 16V20" stroke="#969799" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M21 19L29 24L21 29V19Z" fill="none" stroke="#969799" stroke-width="4" stroke-linejoin="round"/></svg>';
                  let div2 = document.createElement("div");
                  div2.setAttribute("class","bytemd-help-title");
                  div2.innerText = '嵌入视频';
                  let div3 = document.createElement("div");
                  let div3_code = document.createElement("code");
                  div3_code.innerText = '<iframe src="视频地址"></iframe>';
                  div3.appendChild(div3_code);
                  li.appendChild(div1);
                  li.appendChild(div2);
                  li.appendChild(div3);
                  ul.appendChild(li);
                }

                if(tag == "insertfile"){
                  let li = document.createElement("li");
                  let div1 = document.createElement("div");
                  div1.setAttribute("class","bytemd-help-icon");
                  div1.innerHTML = '<svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M40 23V14L31 4H10C8.89543 4 8 4.89543 8 6V42C8 43.1046 8.89543 44 10 44H22" stroke="#969799" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M33 29V43" stroke="#969799" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M26 36H33H40" stroke="#969799" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M30 4V14H40" stroke="#969799" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
                  let div2 = document.createElement("div");
                  div2.setAttribute("class","bytemd-help-title");
                  div2.innerText = '文件上传';
                  let div3 = document.createElement("div");
                  div3.setAttribute("class","bytemd-help-content");
                  let div3_code = document.createElement("code");
                  div3_code.innerText = '!file[alt](url)';
                  div3.appendChild(div3_code);
                  li.appendChild(div1);
                  li.appendChild(div2);
                  li.appendChild(div3);
                  ul.appendChild(li);
                }

                
                


            }
          }


          let liTextColor = document.createElement("li");
          let divTextColor1 = document.createElement("div");
          divTextColor1.setAttribute("class","bytemd-help-icon");
          divTextColor1.innerHTML = '<svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="6" y="6" width="36" height="36" rx="3" fill="none" stroke="#969799" stroke-width="4" stroke-linejoin="round"/><path d="M16 19V16H32V19" stroke="#969799" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M22 34H26" stroke="#969799" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M24 18L24 34" stroke="#969799" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
          let divTextColor2 = document.createElement("div");
          divTextColor2.setAttribute("class","bytemd-help-title");
          divTextColor2.innerText = '文字颜色';
          let divTextColor3 = document.createElement("div");
          let divTextColor3_code = document.createElement("code");
          divTextColor3_code.innerText = '<font color=#008000>绿色</font>';
          divTextColor3.appendChild(divTextColor3_code);
          liTextColor.appendChild(divTextColor1);
          liTextColor.appendChild(divTextColor2);
          liTextColor.appendChild(divTextColor3);
          ul.appendChild(liTextColor);


          let liBr = document.createElement("li");
          let divBr1 = document.createElement("div");
          divBr1.setAttribute("class","bytemd-help-icon");
          divBr1.innerHTML = '<svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 8V40" stroke="#969799" stroke-width="4" stroke-linecap="round"/><path d="M40 8V40" stroke="#969799" stroke-width="4" stroke-linecap="round"/><path d="M20.0522 24.0083H40.0002" stroke="#969799" stroke-width="4" stroke-linecap="round"/></svg>';
          let divBr2 = document.createElement("div");
          divBr2.setAttribute("class","bytemd-help-title");
          divBr2.innerText = '换行';
          let divBr3 = document.createElement("div");
          divBr3.setAttribute("class","bytemd-help-content");
          let divBr3_code = document.createElement("code");
          divBr3_code.innerText = '<br>';
          divBr3.appendChild(divBr3_code);
          liBr.appendChild(divBr1);
          liBr.appendChild(divBr2);
          liBr.appendChild(divBr3);
          ul.appendChild(liBr);




          help_element.appendChild(ul);

         
        }
    }
  }**/
}

