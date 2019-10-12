const path = require('path');
const htmlWepackPlugin = require('html-webpack-plugin');
module.exports = {
    entry: './src/index.js', // 入口配置
    output: { // 出口配置
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle-[hash].js' //添加hash值
    },
    devServer: {
        contentBase: "./dist", // 本地服务路径
        inline: true //实时刷新
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ['style-loader','css-loader']
            },
            {
                test: /\.(jpg|png|gif|jpeg)$/,
                use: 'file-loader'
            }
        ]
    },
    // 插件是个数组
    plugins: [
        new htmlWepackPlugin({
            template: "./src/index.html", // 引入
            minify: {
                removeAttributeQuotes: true, // 去除引号
                removeComments: true,// 去除注释
                removeEmptyAttributes: true,// 去除空属性
                collapseWhitespace: true// 去除空格
            }
        })
    ],
};