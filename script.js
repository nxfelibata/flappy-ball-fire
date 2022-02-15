Player = function(game){
  var self = this;
  this.game = game;
  this.size = 5;
  this.y = this.game.tunnelHeight/2;
  this.pos = 0;
  this.jumpSpeed = 4;
  this.yv = 0;
  this.calculate = function(){
    this.pos += this.game.speed;
    this.yv += 0.2;
    this.y += this.yv;
    if(this.y > this.game.tunnelHeight-this.size){
      this.y = this.game.tunnelHeight-this.size;
      this.game.gameOver();
    }else if(this.y < this.size){
      this.y = this.size;
      this.yv = 0;
    }
    for(var i=0;i<this.game.obstacles.length;i++){
      var obstacle = this.game.obstacles[i];
      if(obstacle.pos<this.pos+this.size&&
         obstacle.pos+this.game.obstacleWidth>this.pos){
        if(this.y-this.size<obstacle.holePos){
          this.game.gameOver()
        }else if(this.y+this.size>obstacle.holePos+this.game.holeSize){
          this.game.gameOver()
        }
      }
    }
  }
  this.jump = function(){
    self.yv = -self.jumpSpeed;
  }
}

game = new (function(Player){
  var self = this;
  this.canvas = document.querySelector('canvas');
  var ctx = this.ctx = this.canvas.getContext('2d');
  this.speed = 2;
  this.obstacleSpacing = 120;
  this.obstacleWidth = 30;
  this.tunnelHeight = 300;
  this.holeSize = 80;
  this.player = new Player(this);
  
  (this.resize = function(){
    self.width = self.canvas.width = self.canvas.clientWidth;
    self.height = self.canvas.height = self.canvas.clientHeight;
    self.o = {x:Math.floor(self.width/3),y:Math.floor((self.height-self.tunnelHeight)/2)};
  })();
  
  addEventListener('resize',this.resize);

  this.setClickHandeler = function(handeler){
    removeEventListener('click',this.clickHandeler);
    this.clickHandeler = handeler;
    addEventListener('click',this.clickHandeler);
  }
  
  this.startGame = function(){
    var rightEdge = self.width-self.o.x;
    self.nextObstaclesPos = self.firstObstaclePos = rightEdge>300?rightEdge:300;
    self.player.yv = -self.player.jumpSpeed
    self.state = 1;
    self.setClickHandeler(self.player.jump);
  }
  
  this.gameOver = function(){
    self.state = 2;
    self.setClickHandeler(self.newGame);
  };
  
  (this.newGame = function(){
    self.state = 0;
    self.score = 0;
    self.obstacles = [];
    self.particles = [];
    self.stars = [];
    self.player = new Player(self);
    self.setClickHandeler(self.startGame);
  })();
  
  this.startLoop = function(){
    requestAnimationFrame(function(time){
      self.prevTime = time;
      requestAnimationFrame(self.loop);
    });
  }
  this.loop = function(time){
    self.dt = time-self.prevTime;
    self.prevTime = time;
    switch(self.state){
      case 0:
        self.calculateParticles();
        self.draw();
        self.drawStartGame();
        break;
      case 1:
        self.generateObstacles();
        self.calculateParticles();
        self.calculate(self.dt);
        self.draw();
        break;
      case 2:
        self.draw();
        self.drawGameOver();
        break;
    }
    requestAnimationFrame(self.loop);
  }
  
  this.generateObstacles = function(){
    if(this.nextObstaclesPos<this.player.pos+this.width-this.o.x){
      this.obstacles.push({
        pos: this.nextObstaclesPos,
        holePos: Math.random()*(this.tunnelHeight-this.holeSize-60)+30
      });
      this.nextObstaclesPos += this.obstacleSpacing;
    }
  }
  this.generateParticles = function(){
    for(var i=0;i<8;i++){
      var a = Math.random()*Math.PI*2,
          sin = Math.sin(a),
          cos = Math.cos(a),
          r1 = Math.random(),
          r2 = Math.random();
      
      this.particles.push({
        x:cos*this.player.size*r1,
        y:this.player.y+sin*this.player.size*r1,
        xv:cos*r2,
        yv:sin*r2+this.player.yv,
        opacity:0.6,
        size:Math.random()*5,
        color:'rgb(255,'+Math.floor(200*Math.random())+','+Math.floor(80*Math.random())+')'
      });
    }
  }
  this.calculateParticles = function(){
    this.generateParticles()
    var particleOverflow = this.particles.length-400
    if(particleOverflow>0){
      this.particles.splice(0,particleOverflow)
    }
    for(var i=0;i<this.particles.length;i++){
      var p = this.particles[i];
      p.xv -= (this.speed+p.xv)*0.1
      p.yv *= 0.9
      p.x += p.xv;
      p.y += p.yv;
      p.opacity *= 0.95
      p.size *= 0.95
    }
  }
  this.calculate = function(){
    this.player.calculate();
    if(this.obstacles.lengtht>0&&this.obstacles[0].pos+this.obstacleWidth<this.player.pos-this.o.x){
      this.obstacles.shift();
    }
    this.score = Math.ceil((this.player.pos-this.firstObstaclePos-this.obstacleWidth/2)/this.obstacleSpacing)
    if(this.score<0){
      this.score = 0
    }
  }
  this.drawStartGame = function(){
    ctx.font='16px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgb(255,'+Math.floor(200*Math.random())+','+Math.floor(80*Math.random())+')';
    ctx.fillText('Click To Start',0,160);
  }
  this.drawGameOver = function(){
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgb(255,'+Math.floor(200*Math.random())+','+Math.floor(80*Math.random())+')';
    ctx.font='50px Arial';
    ctx.fillText('Game Over',0,70);
    ctx.font='16px Arial';
    ctx.fillText('Click To Try Again',0,160);
  }
  this.draw = function(){
    ctx.setTransform(1,0,0,1,0,0);
    ctx.fillStyle = '#0a0c12';
    ctx.fillRect(0,0,this.width,this.height);
    ctx.fillStyle = '#123';
    ctx.fillRect(0,0,this.width,this.o.y);
    ctx.fillRect(0,this.o.y+this.tunnelHeight,this.width,this.height-this.o.y-this.tunnelHeight);
    ctx.setTransform(1,0,0,1,this.o.x-this.player.pos,this.o.y);
    for(var i=0;i<this.obstacles.length;i++){
      var obstacle = this.obstacles[i]
      ctx.fillRect(obstacle.pos,0,this.obstacleWidth,obstacle.holePos);
      ctx.fillRect(obstacle.pos,obstacle.holePos+this.holeSize,this.obstacleWidth,this.tunnelHeight-obstacle.holePos-this.holeSize);
    }
    ctx.setTransform(1,0,0,1,this.o.x,this.o.y);
    ctx.globalCompositeOperation = 'lighter'
    for(var i=0;i<this.particles.length;i++){
      p = this.particles[i];
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.opacity;
      ctx.beginPath();
      ctx.arc(p.x,p.y,p.size,0,Math.PI*2);
      ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over'
    ctx.globalAlpha = 1;
    ctx.setTransform(1,0,0,1,this.width/2,this.o.y+60);
    ctx.font='60px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#eee';
    ctx.fillText(this.score,0,0);
  }
})(Player);

window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
game.startLoop();