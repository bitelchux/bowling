/*global Ball Pin ScoreBoard*/

let Game = {
    
    start: null,
    end: null,
    
    initialize: function()
    {
        // Handles input events
        this.input = new Game.Input();
        Game.physics = new Game.PhysicsManager();
        
                
        // Get the canvas and context
        this.canvas = document.getElementById('bowling');
        this.ctx = this.canvas.getContext('2d');

        this.width = 400;
        this.height = 800;
        
        // Canvas height and width
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        
        // Array to store all the pins
        this.pins = [];
        
        // Width and height of pins
        this.pinWidth = 20;
        // this.pinHeight = Math.PI * this.pinWidth;
        this.pinHeight = 46;
        
        // Bowling ball
        this.ball = new Ball(this.width/2, this.height - 60, "black");
        
        
        this.scoreboard = new ScoreBoard();
        
        this.setPins();
        
        

        
        this.lane = new Game.Rectangle(110, 0, 180, 650, "rgba(153, 85, 45, 1)");
        this.leftGutter = new Game.Gutter(75, 0, "left");
        this.rightGutter = new Game.Gutter(290, 0, "right");
        
        this.resetButton = new Game.Rectangle(0, 0, 68, 50, "rgba(15, 85, 5, 1)");
        this.resetBall = new Game.Rectangle(0, 50, 68, 50, "rgba(1, 85, 175, 1)");
        

        this.input.listen(this.canvas);
      
      
      
        this.input.addCallback('onmousedown', this.cbOnContains(this.resetButton, this.reset));
        this.input.addCallback('onmousedown', this.cbOnContains(this.resetBall, pos => {
            // Reset ball velocity and position
            Game.ball.body.setVelocity({x: 0, y: 0});
            Game.ball.body.setPosition({x: Game.width/2, y: Game.height - 60});
            Game.scoreboard.addScore(Game.pins.filter((p) => {return !p.isStanding; }).length);
        }));
        

    },
    
    
    
    /**
     * Check for containment on rectangle and call cb if true.
     * @returns {function} eventHandler - Event handler for determining collision.
     */
    cbOnContains(rect, cb){
        return (pos) => {
            if(rect.contains(pos)){
                cb(pos);
            }
        };
    },
    
    
    update: function (delta)
    {
        // Move the ball
        this.ball.update(delta);
        
        for(let p = 0; p < this.pins.length; p++)
        {
            this.pins[p].update(delta);
        }
        
        
        Game.physics.update(delta);
        
        
        // Handle reset logic
        if(Game.ball.body.pos.y < 0)
        {
            
            Game.scoreboard.addScore(Game.pins.filter((p) => {return !p.isStanding; }).length);
            
            if(Game.scoreboard.goToNextFrame){
                
                this.resetFrame();
                
                Game.scoreboard.goToNextFrame = false;
                
            }
            else{
                
                this.resetBowl();
            
            }
        }
        
        
        
        
    },
    
    
    
    draw: function ()
    {
        
        this.ctx.fillStyle = 'lightblue';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        
        this.lane.draw(this.ctx);
        this.leftGutter.draw(this.ctx);
        this.rightGutter.draw(this.ctx);

        this.resetButton.draw(this.ctx);
        this.resetBall.draw(this.ctx);
        
        
        
        this.ctx.font = "20px Arial";
        this.ctx.fillStyle = "yellow";
        this.ctx.fillText("RESET", 0, 30);
        this.ctx.fillText("BALL", 0, 75)
        
        for(var i = this.pins.length - 1; i > -1; i--){
            
            this.pins[i].draw(this.ctx);
            
        }
        
        this.ball.draw(this.ctx);
        
        
        this.scoreboard.draw(0, 120, this.ctx);
        
    },
    
    
    gameLoop: function (timestamp)
    {
        
        // Starting timestamp
        this.start = timestamp;
        
        // Determine the delta time
        let deltaTime = this.start - this.end;
    	    
    	    
        this.update(deltaTime);
        this.draw();
        
        
        // Ending timestamp
    	this.end = timestamp;
        
        /*
    	 * The gameLoop() function is now getting executed again and again within a requestAnimationFrame() loop, 
    	 * where we are giving control of the framerate back to the browser. 
    	 * It will sync the framerate accordingly and render the shapes only when needed. 
    	 * This produces a more efficient, smoother animation loop than the older setInterval() method.
    	*/
        requestAnimationFrame(this.gameLoop.bind(this));
    },
    
    
    resetBowl: function(){
        
        Game.ball.body.setVelocity({x: 0, y: 0});
        Game.ball.body.setPosition({x: Game.width/2, y: Game.height - 60});
        // Game.scoreboard.addScore(Game.pins.filter((p) => {return !p.isStanding; }).length);
        
        
        Game.pins.forEach((pin) => {
            
            if(!pin.isStanding)
            {
                pin.isActive = false;
                pin.body.isBouncyCollidy = false;
                
            }
            
        });
        
    },
    
    resetFrame: function(){
        
        Game.ball.body.setVelocity({x: 0, y: 0});
        Game.ball.body.setPosition({x: Game.width/2, y: Game.height - 60});

        this.resetPins();
        
    },
    
    
    reset: function(pos)
    {
        
        /*
        // If mouse is on reset button
        if(Game.resetButton.contains(pos))
        {
            // Reset ball velocity and position
            Game.ball.body.setVelocity({x: 0, y: 0});
            Game.ball.body.setPosition({x: Game.width/2, y: Game.height - 60});
            
            
            
            Game.resetPins();
            
        }
        
        if(Game.resetBall.contains(pos))
        {
            
            // Reset ball velocity and position
            Game.ball.body.setVelocity({x: 0, y: 0});
            Game.ball.body.setPosition({x: Game.width/2, y: Game.height - 60});
            Game.scoreboard.addScore(Game.pins.filter((p) => {return !p.isStanding; }).length);
            
        }
        */
        window.location.reload(false);
        
        
    },
    
    setPins: function()
    {
        
        
        var pinInRow = -1;
        // Loop through 10 pins
        for(let p = 10, y = 3; p > 0; p--)
        {
            if(p == 4 || p == 7 || p == 9)
            {
                pinInRow = -1;
                y--;
            }
            
            pinInRow ++;
            
            let dx = 40;
            
            // Push dat pin
            this.pins.push(new Pin(this.width/2 - this.pinWidth/2 + ((y - 3) * 20 + (pinInRow * dx)), 
                (200) + (y - 3) * 50, 
                this.pinWidth, this.pinHeight));
            
        }
        
    },
    
    
    resetPins: function()
    {
        
        for(let p in Game.pins){
            
            Game.pins[p].reset();
            
        }
        
    }


};


/*

// Draw rect outline
ctx.beginPath();
ctx.rect(x, y, width, height);
ctx.strokeStyle = "rgba(2, 18, 8, 1)";
ctx.stroke();
ctx.closePath();

// Draw text
ctx.font = "20px Arial";
ctx.fillStyle = "black";
ctx.fillText("Text goes here", x, y);*/