/**
 * px转视口宽度
 * @param px 
 * @returns 
 */
 export function convertViewportWidth(px:string){
    let viewportWidth:number =  375; // UI设计稿的宽度
    //let viewportWidth = window.innerWidth;
    px = px.replace(/[a-zA-Z]+/g,"");//去掉字母
    
    let number_px:number = parseInt(px)
    
    
   return (100 * number_px / viewportWidth)+'vw';
}
