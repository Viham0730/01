let A, B;  // A起点和B终点坐标
let obstacle; // 矩形障碍物
let ball;
let pathIndex = 0;
let upperPath, lowerPath;
let currentPath;
let moving = false;

let brightness = 512;//0-1023 ->512
let distance   = 512;
let lastPrint = 0;
let timeToPri = 0;

let serial;           // 串口对象
let portName = "COM3";  
let distanceValue = 0; //50~980
let lightValue = 0;//580~680


function setup() {
  createCanvas(600, 400);
  
  
  serial = new p5.SerialPort();  // 创建串口对象
  serial.list();  // 列出所有可用的串口
  serial.open(portName);  // 打开串口连接
  serial.on('data', handleData);
  
  
  lastPrint = millis();
  
  A = createVector(100, height / 2);
  B = createVector(width - 100, height / 2);
  
  obstacle = {
    x: width / 3,
    y: height / 2 - 25,
    w: width / 3,
    h: 50
  };
  
  upperPath = [ 
    createVector(A.x, A.y), 
    createVector(A.x + obstacle.x / 2, A.y - 100), 
    createVector(B.x - obstacle.x / 2, A.y - 100), 
    B
  ];
  lowerPath = [
    createVector(A.x, A.y),
    createVector(A.x + obstacle.x / 2, A.y + 100),
    createVector(B.x - obstacle.x / 2, A.y + 100),
    B
  ];

  currentPath = upperPath; // 默认从上方路径开始
  ball = new Ball(A.x, A.y);
  
}

function draw() {
  background(240);
  
  // 画A和B点
  fill(0);
  ellipse(A.x, A.y, 10, 10);
  ellipse(B.x, B.y, 10, 10);
  
  // 绘制矩形障碍
  fill(150);
  rect(obstacle.x, obstacle.y, obstacle.w, obstacle.h);
  
  // 绘制路径
  //drawPath(upperPath, color(255, 0, 0, 150));  // 红色上方路径
  //drawPath(lowerPath, color(0, 0, 255, 150));  // 蓝色下方路径
  
  // 更新和显示球体
  //if (moving) {
  ball.moveAlongPath(currentPath);
  //}
  ball.display();
  
  fill(125);
  textSize(10);
  text("brightness: "+lightValue, 10,15);
  textSize(10);
  text("distance: "+distanceValue, 10,30);
 
  textSize(50);
  text("time used : " + timeToPri, 125,125);
 
}
function handleData() {
  let data = serial.readLine();  // 读取串口数据
  if (data.length > 0) {
    // 假设数据是通过 "Distance: xxx lightValue: xxx" 这种格式传输的
    let sensorData = split(data, '\n');  // 按换行符分割数据
    for (let i = 0; i < sensorData.length; i++) {
      let dataItem = sensorData[i];
      if (dataItem.includes("Distance")) {
        distanceValue = int(dataItem.split(":")[1].trim());
      }
      if (dataItem.includes("lightValue")) {
        lightValue = int(dataItem.split(":")[1].trim());
      }
    }
  }
}



function drawPath(path, col) {
  noFill();
  stroke(col);
  strokeWeight(2);
  beginShape();
  for (let p of path) {
    vertex(p.x, p.y);
  }
  endShape();
}

class Ball {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.speed = 2;
    this.currentIndex = 0;
  }
  
  moveAlongPath(path) {
    if (this.currentIndex < path.length) {
      let target = path[this.currentIndex];
      let dir = p5.Vector.sub(target, this.pos);
      dir.setMag(this.speed);

      // ligt and dist
      if (currentPath === upperPath) { // 上方路径
        if (brightness > 800) { // 亮 减速
            dir.setMag(this.speed - 1);
        }
        if (distance > 800) { // 远 加速
            dir.setMag(this.speed + 1);
        }
      } else { // 下方路径
        if (brightness < 200) { // 暗 加速
            dir.setMag(this.speed + 1);
        }
        if (distance < 200) { // 近 减速
            dir.setMag(this.speed - 1);
        }
      }
      /*
      if (brightness < 200) { // 暗 加速
        dir.setMag(this.speed + 5);
      } else if (brightness > 800) { // 亮 减速
        dir.setMag(this.speed - 1);
      }
      if (distance > 800) { // 远 加速
        dir.setMag(this.speed + 5);
      } else if (distance < 200) { // 近 减速
        dir.setMag(this.speed - 1);
      }*/
      this.pos.add(dir);
      
      if (this.pos.dist(target) < 5) {
        this.currentIndex++;
      }
    } else {
      
      // 完成路径
      let timeElapsed = millis() - lastPrint;
      timeToPri = timeElapsed / 1000;
      
      
      moving = false;
      setTimeout(() => {
        lastPrint = millis();
        this.reset();
      }, 200);
    }
  }

  reset() {
    this.pos = createVector(A.x, A.y);
    this.currentIndex = 0;
    if (currentPath === upperPath) {
      currentPath = lowerPath;
    } else {
      currentPath = upperPath;
    }
    moving = true;
  }
  
  display() {
    fill(0, 255, 0);
    ellipse(this.pos.x, this.pos.y, 20, 20);
  }
}

//function mousePressed() {
  //moving = true;
//}
