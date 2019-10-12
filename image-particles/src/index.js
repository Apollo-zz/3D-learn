// 引入
let THREE = require('three');
let MobileDetect = require('mobile-detect');
let $ = require("jquery");
let imgData = require('./imgData').text;

// 随机星星
var Stars = {
    canvas: null,
    context: null,
    circleArray: [],
    colorArray: ['#4c1a22', '#4c1a23', '#5d6268', '#1f2e37', '#474848', '#542619', '#ead8cf', '#4c241f', '#d6b9b1', '#964a47'],

    mouseDistance: 50,
    radius: .5,
    maxRadius: 1.5,

    //  MOUSE
    mouse: {
        x: undefined,
        y: undefined,
        down: false,
        move: false
    },

    //  INIT
    init: function () {
        this.canvas = document.getElementById('stars');
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.canvas.style.display = 'block';
        this.context = this.canvas.getContext('2d');

        window.addEventListener('mousemove', this.mouseMove);
        window.addEventListener('resize', this.resize);

        this.prepare();
        this.animate();
    },

    //  CIRCLE
    Circle: function (x, y, dx, dy, radius, fill) {
        this.x = x;
        this.y = y;
        this.dx = dx;
        this.dy = dy;
        this.radius = radius;
        this.minRadius = this.radius;

        this.draw = function () {
        Stars.context.beginPath();
        Stars.context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        Stars.context.fillStyle = fill;
        Stars.context.fill();
        };

        this.update = function () {
        if (this.x + this.radius > Stars.canvas.width || this.x - this.radius < 0) this.dx = -this.dx;
        if (this.y + this.radius > Stars.canvas.height || this.y - this.radius < 0) this.dy = -this.dy;

        this.x += this.dx;
        this.y += this.dy;

        //  INTERACTIVITY
        if (Stars.mouse.x - this.x < Stars.mouseDistance && Stars.mouse.x - this.x > -Stars.mouseDistance && Stars.mouse.y - this.y < Stars.mouseDistance && Stars.mouse.y - this.y > -Stars.mouseDistance) {
            if (this.radius < Stars.maxRadius) this.radius += 1;
        } else if (this.radius > this.minRadius) {
            this.radius -= 1;
        }

        this.draw();
        };
    },

    //  PREPARE
    prepare: function () {
        this.circleArray = [];

        for (var i = 0; i < 1200; i++) {
        var radius = Stars.radius;
        var x = Math.random() * (this.canvas.width - radius * 2) + radius;
        var y = Math.random() * (this.canvas.height - radius * 2) + radius;
        var dx = (Math.random() - 0.5) * 1.5;
        var dy = (Math.random() - 1) * 1.5;
        var fill = this.colorArray[Math.floor(Math.random() * this.colorArray.length)];

        this.circleArray.push(new this.Circle(x, y, dx, dy, radius, fill));
        }
    },

    //  ANIMATE
    animate: function () {
        requestAnimationFrame(Stars.animate);
        Stars.context.clearRect(0, 0, Stars.canvas.width, Stars.canvas.height);

        for (var i = 0; i < Stars.circleArray.length; i++) {
        var circle = Stars.circleArray[i];
        circle.update();
        }
    },

    //  MOUSE MOVE
    mouseMove: function (event) {
        Stars.mouse.x = event.x;
        Stars.mouse.y = event.y;
    },

    //  RESIZE
    resize: function () {
        Stars.canvas.width = window.innerWidth;
        Stars.canvas.height = window.innerHeight;
    }
};

// 
let image = document.createElement("img");
image.src = imgData;

let renderer, scene, camera, ww, wh, particles;
  
ww = window.innerWidth, wh = window.innerHeight;
  
var centerVector = new THREE.Vector3(0, 0, 0);
speed = 10;
isMouseDown = false;

// 获取imageData
var getImageData = function (image) {
    // 获取canvas画布
    let canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;

    // 将图片渲染到canvas画布上
    let ctx = canvas.getContext("2d");
    ctx.drawImage(image, 0, 0);

    // 返回图像的imageData
    return ctx.getImageData(0, 0, image.width, image.height);
};
  
function getPixel(imagedata, x, y) {
    var position = (x + imagedata.width * y) * 4,
        data = imagedata.data;
    return { r: data[position], g: data[position + 1], b: data[position + 2], a: data[position + 3] };
}

// 把imageData画到画布上
var drawTheMap = function () {
    // 新建一个几何模型
    var geometry = new THREE.Geometry();

    // 新建一个点材料
    var material = new THREE.PointsMaterial();
    material.vertexColors = true;
    material.transparent = true;

    for (let y = 0, y2 = imagedata.height; y < y2; y += 1) {
        for (let x = 0, x2 = imagedata.width; x < x2; x += 1) {
            // 若R通道的值>0的话，取渲染该点
            if (imagedata.data[x * 4 + y * 4 * imagedata.width] > 0) {
                var vertex = new THREE.Vector3();
                vertex.x = x - imagedata.width / 2; // x轴居中
                vertex.y = -(y - imagedata.height / 2); // y轴居中
                vertex.z = -Math.random() * 500; // 随机渲染z层级

                // vertex.speed = Math.random() / speed + 0.015;

                var pixelColor = getPixel(imagedata, x, y);
                var color = "rgb(" + pixelColor.r + ", " + pixelColor.g + ", " + pixelColor.b + ")";
                // 颜色队列
                geometry.colors.push(new THREE.Color(color));
                // 位置信息队列
                geometry.vertices.push(vertex);
            }
        }
    }
    particles = new THREE.Points(geometry, material);

    scene.add(particles); 

    requestAnimationFrame(render);
};
  

// 初始化人物
var init = function () {
    // 渲染器
    renderer = new THREE.WebGLRenderer({
        canvas: document.getElementById("img"),
        antialias: true,
        alpha: true
    });

    // 设置大小，这里以屏幕宽高为宽高
    renderer.setSize(ww, wh);

    // 创建舞台
    scene = new THREE.Scene();

    // 定义一个正交投影相机(left, right, top, bottom, near, far)
    camera = new THREE.OrthographicCamera(ww / -2, ww / 2, wh / 2, wh / -2, 1, 1000);
    camera.position.set(0, -10, 4); // 确定相机位置(x,y,z)
    camera.lookAt(centerVector); // 相机朝向centerVector,也就是(0,0,0)
    scene.add(camera); // 放好相机

    camera.updateProjectionMatrix(); // 更新相机投影矩阵数据

    // 获取图片的imageData，并渲染到img画布上
    imagedata = getImageData(image); 
    drawTheMap();

    // 监听各种鼠标事件和浏览器窗口变化
    window.addEventListener('mousemove', onMousemove, false);
    window.addEventListener('mousedown', onMousedown, false);
    window.addEventListener('mouseup', onMouseup, false);
    window.addEventListener('resize', onResize, false);
};

// 浏览器窗口缩放函数
var onResize = function () {
    ww = window.innerWidth;
    wh = window.innerHeight;
    renderer.setSize(ww, wh);
    camera.left = ww / -2;
    camera.right = ww / 2;
    camera.top = wh / 2;
    camera.bottom = wh / -2;
    camera.updateProjectionMatrix();
};
// 鼠标松开
var onMouseup = function () {
    isMouseDown = false;
};
// 鼠标按下
var onMousedown = function (e) {
    isMouseDown = true;
    lastMousePos = { x: e.clientX, y: e.clientY };
};
// 鼠标移动
var onMousemove = function (e) {
    if (isMouseDown) {
        camera.position.x += (e.clientX - lastMousePos.x) / 100;
        camera.position.y -= (e.clientY - lastMousePos.y) / 100;
        camera.lookAt(centerVector);
        lastMousePos = { x: e.clientX, y: e.clientY };
    }
};

// 渲染
var render = function (a) {
    requestAnimationFrame(render);

    // 如果顶点队列中的数据被修改，该值需要被设置为 true。
    particles.geometry.verticesNeedUpdate = true;
    if (!isMouseDown) {
        if(camera.position.x < 0.001 && camera.position.x > -0.001 && camera.position.y < 0.001 && camera.position.y > -0.001){
            camera.position.x = 0;
            camera.position.y = 0;
            return;
        }else{
            camera.position.x += (0 - camera.position.x) * 0.06;
            camera.position.y += (0 - camera.position.y) * 0.06;
        }        
        camera.lookAt(centerVector);
    }

    renderer.render(scene, camera); // 渲染，相当于按下快门
};



function loadProject() {
    setTimeout(function () {
        // 非移动端则初始化页面
        const md = new MobileDetect(window.navigator.userAgent);
        if (!md.mobile()) {
            // Stars.init();
            init();
        }
    }, 200);
};
// 加载项目
loadProject();