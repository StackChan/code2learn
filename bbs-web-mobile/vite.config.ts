import { defineConfig } from 'vite'
import path from 'path'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite';
import { VantResolver } from 'unplugin-vue-components/resolvers';
import legacy from '@vitejs/plugin-legacy'
import prismjs from "vite-plugin-prismjs";
import postcsspxtoviewport from 'postcss-px-to-viewport'


// https://vitejs.dev/config/
export default defineConfig({
    resolve: {

        //别名 以根目录的方式定义相对路径
        alias: {
            "@": path.resolve(__dirname, "src"),
          //"@components": path.resolve(__dirname, "src/components")
            vue: 'vue/dist/vue.esm-bundler.js',//编译器版本支持运行时编译
        },
    },
    plugins: [
        vue({
            template: {
                compilerOptions: {
                    isCustomElement: (tag) => ['player','hide'].includes(tag),//预编译时支持原生自定义元素   player为引入的播放器使用标签
                }
            }
        }),
        //Prism代码高亮插件
        prismjs({
            languages: ["xml", "css", "html", "javascript", "java", "perl", "python", "ruby", "go", "cpp", "cs", "bash"],
            //  languages: 'all',
            plugins: ["line-numbers","toolbar","copy-to-clipboard"], //配置显示行号插件 copy-to-clipboard
            theme: "default", //主题名称 default solarizedlight
            css: true,
        }),
        Components({
            resolvers: [VantResolver()],
        }),
        legacy({
            targets: ['defaults', 'ie >= 11', 'chrome 52','Firefox ESR',],  //需要兼容的目标列表，可以设置多个
        }),
    ],
    css: {
        postcss: {
          plugins: [
            postcsspxtoviewport({
                unitToConvert: 'px', // 要转化的单位
                viewportWidth: 375, // UI设计稿的宽度
                unitPrecision: 6, // 转换后的精度，即小数点位数
                propList: ['*'], // 指定转换的css属性的单位，*代表全部css属性的单位都进行转换
                viewportUnit: 'vw', // 指定需要转换成的视窗单位，默认vw
                fontViewportUnit: 'vw', // 指定字体需要转换成的视窗单位，默认vw
                selectorBlackList: ['ignore-'], // 指定不转换为视窗单位的类名，
                minPixelValue: 1, // 默认值1，小于或等于1px则不进行转换
                mediaQuery: true, // 是否在媒体查询的css代码中也进行转换，默认false
                replace: true, // 是否转换后直接更换属性值
               // exclude: [/node_modules/], // 设置忽略文件，用正则做目录名匹配
                exclude: [],
                landscape: false // 是否处理横屏情况
            })
            
          ]
        }
    },
    build: {
        target: 'es2015',
        outDir: './dist/',
        cssCodeSplit: true
    },
    server:{
        host:'0.0.0.0',
    }
})
