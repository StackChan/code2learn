import { BytemdPlugin } from 'bytemd';

/**
 * 过滤iframe标签
 * @returns 
 */
export default function filterIframe(): BytemdPlugin {
  return {
    viewerEffect({ markdownBody }) {
      Array.from(markdownBody.querySelectorAll('iframe'))
        .filter((frame) => {
          return Boolean(frame.getAttribute('src'));
        })
        .forEach((frame) => {
          //如果不是以 http:// 或者 https:// 开头
          if(frame.src.toLowerCase().indexOf('http://') == -1 && frame.src.toLowerCase().indexOf('https://') == -1){ //不包含等于-1 
            frame.src = ''
          }

        });
    }
  };
}