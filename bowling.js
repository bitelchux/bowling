/*global Game*/

class Ball{
    
    constructor(x, y, color){
        
        // Color of ball
        this.color = color;
        
        // Mass of the ball
        this.mass = 7.25 * 1;
        
        // Color when mouse is hovering
        this.hoverColor = "#17202A";
        
        // Boolean to see if the ball is rolling
        this.isRolling = true;
        
        // Check if the ball is held by the mouse
        this.isGrabbed = false;
        
        // Boolean for when the ball is being hovered over
        this.isHovering = false;
        
        // All mouse holding info
        this.hold = {
            
            positions: [],
            times: [],
            
        };
        
        // Make da body
        this.body = new Game.Body({x:x, y:y}, {x: 0, y: 0}, this.mass, Game.BodyTypes.CIRCLE);
        
        // Set max speed
        this.body.maxSpeed = 20;
        
        // Create the circle geometry
        this.body.createGeometry('circle', {radius: 20});
        
        // Set the collision group to be pins
        this.body.setCollisionGroups(['pins' ,'gutters']);
        
        this.body.angularVel = 0.05;
        
        this.body.onCollided = this.onCollided.bind(this);
        
        // Add the memeber
        Game.physics.addMember(this);
        
        // Add to balls group
        Game.physics.addToGroup('balls', this);
        
        
        Game.input.addCallback('onmousemove', (pos) => {
            
            this.move(pos);
            
        });
        
        Game.input.addCallback('onmousedown', (pos) => {
            
            this.grab(pos);
            // this.reset(pos);
            
        });
        
        Game.input.addCallback('onmouseup', (pos) => {
            
            this.release(pos);
            
        });
        
        Game.input.addCallback('onmousemove', (pos) => {
            
            this.hoverCheck(pos);
            
        });
        
        
        // load image from data url
        this.image = new Image();
        
        this.image.src = 'assets/images/ball.png';
        
        
    }
    
    
    
    onCollided(member){
        
        
        if(member.type === 'inner'){
            
            
            
        }
        else if(member.type === 'rail'){
            
            this.body.setVelocity({x: 0, y: this.body.vel.y < -0.5 ? this.body.vel.y : -1});
            
        }
        
        
    }
    
    
    update(delta){
        
        // If the bowling ball is rolling!
        if(this.isRolling){
            
            // Move the ball
            this.body.update(delta);
            
        }
        
    }
    
    
    draw(ctx){
        
        // Set the color of the ball
        ctx.fillStyle = this.isHovering ? this.hoverColor : this.color;
        
        // Save context
        ctx.save();
        
        // Translate the context around rotation center
        ctx.translate(this.body.geometry.x, this.body.geometry.y);
        
        // Rotate the circle
        ctx.rotate(this.body.angle);
        
        // Translate back to where we were before
        ctx.translate(-this.body.geometry.x, -this.body.geometry.y);
        
        // Draw the circle
        this.body.geometry.draw(ctx, this.image);
        
        // Restore context
        ctx.restore();
        
    }
    
    
    record(pos){
        
        this.hold.positions.push(pos);
        this.hold.times.push(performance.now());
        
        if(this.hold.positions.length > 20){
            this.hold.positions.shift();
            this.hold.times.shift();
        }
        
    }
    
    calculateVelocity() {
        
        let ps = this.hold.positions; // hold positions
        // let ts = this.hold.times; // hold times
        
        let sum_x = 0;
        let sum_y = 0;
        
        // The number of points to average
        let numPoints = 2;
        
        let new_ps = ps.splice(ps.length - 1 - numPoints);
        for(var i = 0; i < numPoints; i++){
            
            let lastPosition = new_ps[i + 1];
            let secondLastPosition = new_ps[i];
            
            if(lastPosition === undefined)
            {
                console.log('There is no last position, Dingus', lastPosition);
                
                return {x: 0, y: 0};
            }
            
            sum_x += (lastPosition.x - secondLastPosition.x);
            sum_y += (lastPosition.y - secondLastPosition.y);
            
        }
        
        
        let vel = {
            
            x: sum_x/numPoints,
            y: sum_y/numPoints
            
        };
        
        console.log(vel);
        
        // Two point difference
        /* let lastPosition = ps[ps.length - 1];
        let secondLastPosition = ps[ps.length - 2];
        
        vel = {
            x: lastPosition.x - secondLastPosition.x,
            y: lastPosition.y - secondLastPosition.y
        };
        console.log(vel);*/
        
        
        
        return vel;
    }
    
    
    grab(pos){
    
        if(this.body.geometry.contains(pos)){
            
            this.body.setVelocity({x:0, y:0});
            this.isGrabbed = true;
            this.hold.startTime = performance.now();
            this.hold.positions = [];
            
        }
        
    }
    
    
    move(pos){
        
        if(this.isGrabbed)
        {
            this.record(pos);
            this.body.setPosition(pos);
            
        }
        
    }
    
    
    release(pos){
        
        if(this.isGrabbed){
            
            this.isGrabbed = false;
            this.isRolling = true;
            
            let v = this.calculateVelocity();
            this.body.setVelocity(v);
            
        }
        
    }
    
    
    hoverCheck(pos){
        
        this.isHovering = false;
        
        if(this.body.geometry.contains(pos)){
            
            this.isHovering = true;
            
        }
        
    }
    
}
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
        

      //  this.input.listen(this.canvas);
      
      
      
        // this.input.addCallback('onmousedown', (pos) => {
            
        //     // console.log('Mouse position', pos);
        //     this.reset(pos);
            
        // });
        

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
/*global Game*/

/*
 * Rail is the edge of the gutter, inner is the gutter itself.
 *
 */
Game.Gutter = class Gutter{
    
    constructor(x, y, side)
    {

        // Infinite mass
        this.mass = Number.NEGATIVE_INFINITY * -1;
        
        // Width of gutter
        this.innerWidth = 40;
        
        // Width of edge
        this.railWidth = 4;
        
        // Height of lane
        this.height = 650;
        
        // Colors
        this.innerColor = "rgba(155, 155, 155, 1)";
        this.railColor = "rgba(100, 100, 100, 1)";
        
        // If left side
        if(side === 'left'){
            
            // Make the rects
            this.inner = new Game.Rectangle(x, y, this.innerWidth, this.height, this.innerColor);
            this.rail = new Game.Rectangle(x, y, this.railWidth, this.height, this.railColor);
            
        }
        // Else right side
        else{
            
            // Make the rects
            this.inner = new Game.Rectangle(x, y, this.innerWidth, this.height, this.innerColor);
            this.rail = new Game.Rectangle(x + this.innerWidth - this.railWidth, y, this.railWidth, this.height, this.railColor);
            
        }
        
        this.inner.type = 'inner';
        this.rail.type = 'rail';
        
        // Make a body for the rail
        this.rail.body = new Game.Body({x: this.rail.x, y: this.rail.y}, {x: 0, y: 0}, this.mass, Game.BodyTypes.RECTANGLE);
        
        // Set it to be fixed
        this.rail.body.fixed = true;
        
        // Set body geometry type
        this.rail.body.createGeometry('rectangle', {width: this.rail.width, height: this.rail.height});
        
        // Collide with pins and balls
        this.rail.body.setCollisionGroups(['balls', 'pins']);
        
        
        // Make gutter body
        this.inner.body = new Game.Body({x: this.inner.x, y: this.inner.y}, {x: 0, y: 0}, 10, Game.BodyTypes.RECTANGLE);
        this.inner.body.createGeometry('rectangle', {width: this.inner.width * 2/3, height: this.inner.height});
        this.inner.body.isBouncyCollidy = false;
        this.inner.body.setCollisionGroups(['balls', 'pins']);
        
        
        // Make gutter a member of gutter group
        Game.physics.addToGroup('gutters', this.inner);
        Game.physics.addToGroup('gutters', this.rail);
        
        // Add the member
        Game.physics.addMember(this.rail);
        Game.physics.addMember(this.inner);
        
    }
    
    
    
    
    draw(ctx)
    {
        this.inner.draw(ctx);
        this.rail.draw(ctx);
    }
    
};
/*global Game Image*/
class Pin{
    
    constructor(x, y, width, height){
        
        // Position of pin
        // this.pos = {x:x, y:y};
        // this.rotation = 0;

        this.mass = 1.5 * 1;

        // Width of pin
        this.width = width;
        
        // Height of pin
        this.height = height;
        
        // Collision radius
        this.collisionRadius = 10;
        
        // Color of pin
        this.color = "rgba(255, 255, 255, 1)";
        
        // Boolean for collision rectangle size
        this.isStanding = true;
        
        // Boolean for collision and drawing of pin
        this.isActive = true;
        
        this.initialPosition = {
            x: x + this.width/2,
            y: y + this.height - this.collisionRadius,
        };
        
        
        // Make da body
        this.body = new Game.Body({x: x + this.width/2, y: y + this.height - this.collisionRadius}, {x: 0, y: 0}, this.mass, Game.BodyTypes.CIRCLE);
        
        // Set the max sped
        this.body.maxSpeed = 20;
        
        // Create the circle geometry for when pin is standing
        this.body.createGeometry('circle', {radius: this.collisionRadius});
        
        // Set the colllision to be with the ball and pins
        this.body.setCollisionGroups(['balls', 'pins', 'gutters']);
        
        // Add the member
        Game.physics.addMember(this);
        
        // Add to pins group
        Game.physics.addToGroup('pins', this);
        
        this.body.angularVel = 0;
     
        // load image from data url
        this.image = new Image();
        
        this.image.src = 'assets/images/pin.png';
        
        
        this.body.onCollided = this.onCollided.bind(this);
        
        this.body.rotationalDamping = 0.001;
        this.body.initialFriction = 0.03;
        this.body.friction = this.body.initialFriction;
        
        this.initialAngularVelocity = 0.28;
        
        this.isInGutter = false;
        
     
    }
    
    
    update(delta){
        
        this.body.update(delta);

    }
    
    
    
    onCollided(member){
        
        this.body.friction = this.body.initialFriction;
        
        this.isStanding = false;

        if(member.type === 'inner'){
            
            if(!this.isInGutter)
            {
                this.body.friction = .2;
                this.body.rotationalDamping = .001;
             //   this.body.angularVel = this.body.angularVel < 0 ? -0.02 : 0.02;
            }
            
          
            this.isInGutter = true;

            let piSize = Math.PI / 8; // 22.5 degrees
            
            
            
            // Angle is around 0deg
            if(this.body.angle > -piSize && this.body.angle < piSize){
                
                this.body.angularVel = 0;
                this.body.angle = 0;
                
            }
            // Angle is around 180deg
            else if(this.body.angle > Math.PI - piSize && this.body.angle < Math.PI + piSize){
                
                this.body.angularVel = 0;
                this.body.angle = Math.PI;
                
            }
             
            // if(this.body.angle > Math.PI/2 && this.body.angle < Math.PI){
                
            //     this.body.angularVel = -1;
                
            // }
            // else
            // {
            //     this.body.angularVel = 1;
            // }
            
            // this.body.rotationalDamping = .02;
            
        }
        else if(member.body.isBouncyCollidy && !this.isInGutter){
            
            this.setRotation();
            
        }
        
        if(member.type === 'rail'){
            
            this.body.friction = 20;
            
            console.log('PEEEENNNOOOSSSSS');
            
        }
        
    }
    
    
    setRotation(member){
        
        if(this.body.angularVel >= 0){
            
            this.body.angularVel = -this.initialAngularVelocity;
            
        }
        else{
            
            this.body.angularVel = this.initialAngularVelocity;
            
        }
        
    }
    

    draw(ctx){
        
       // console.log('Pin Active', this.body.pos);
        if(this.isActive){
            
            let drawX = this.body.pos.x - this.width/2;
            let drawY = this.body.pos.y - this.height + this.collisionRadius;
            
            
            // Set the color of the ball
            ctx.fillStyle = this.isHovering ? this.hoverColor : this.color;
            
            // Save context
            ctx.save();
            
            // Translate the context around rotation center
            ctx.translate(this.body.geometry.x, this.body.geometry.y);
            
            // Rotate the circle
            ctx.rotate(this.body.angle);
            
            // Translate back to where we were before
            ctx.translate(-this.body.geometry.x, -this.body.geometry.y);
            
            // this.body.geometry.draw(ctx, this.image);
            
            // Draw the circle
            ctx.drawImage(this.image, drawX, drawY);
            
            // Restore context
            ctx.restore();

        }
        
    }
    
    
    reset(){
                
        this.body.setVelocity({
            x: 0,
            y: 0,
        });
        
        this.body.setPosition(JSON.parse(JSON.stringify(this.initialPosition)));
        this.body.angularVel = 0;
        this.body.angle = 0;
        this.isInGutter = false;
        this.isStanding = true;
        this.isActive = true;
        this.body.isBouncyCollidy = true;
    }
    
    
    
}
/*global Game*/
class ScoreBoard {

	/*
	  We need array for actual score, and an array for what score to display [total for frame, spares(/) and strikes(X)].
	 */

	constructor() {

		// Store frames
		this.frames = [];

		// Current frame
		this.currentFrame = 0;
		this.score = 0;
		
		// Boolean for when to change frame in Game.js for reseting logic
		this.goToNextFrame = false;


		// First 9 frames
		for (let i = 0; i < 9; i++) {
			// Push empty array in frames
			this.frames.push({
				one: null,
				two: null,
				score: null,
				isFinal: false,
			});
		}

		// Last frame
		this.frames.push({
			one: null,
			two: null,
			three: null,
			score: null,
			isFinal: false,
		});

	}


	addScore(numPins) {

		// Don't let an invalid index be used.
		if (this.currentFrame >= this.frames.length) return;

		let frame = this.frames[this.currentFrame];


		if (this.currentFrame === 9) {
			this.tenthFrameLogic(numPins);
		}
		else if (frame.one === null) {
			frame.one = numPins;
		}
		else if (frame.two === null) {
			frame.two = numPins - frame.one;
		}

		this.calculateScores();

		// If user has scored a strike or end of frame
		if (numPins === 10 || (frame.one !== null && frame.two !== null)) {
			
			if (this.currentFrame !== 9) {
				// Increment frame
				this.goToNextFrame = true;
				this.currentFrame++;
				console.log('go to next frame, bitch');
			}

		}

	}

	calculateScores() {

		for (let i = 0; i <= this.currentFrame; i++) {

			let frame = this.frames[i];
			let nextFrame = this.frames[i + 1];
			let nextNextFrame = this.frames[i + 2];
			console.log(this.currentFrame);

			
		//	if(i === 9)
		//	{
				frame.isFinal = true;
		//	}


			// Get a non mark (#)
			if (frame.one !== 10 && (frame.one + frame.two) !== 10) {

				// Add the scores to the total score
				frame.score = frame.one + frame.two;

				if (frame.two !== null)
					frame.isFinal = true;

			}
			// Get a strike
			else if (frame.one === 10) {

				// If on the 10th frame
				if(i === 9)
				{
					// Add all 3 scores since first bowl was a strike	
					frame.score = frame.one + frame.two + frame.three;
				}
				// If on frame 9th frame
				else if(i === 8)
				{
					
					// If next frame was a strike
					if (nextFrame.one === 10) {

						// If you've thrown the ball twice more after the current throw
						if (nextFrame.one !== null) frame.isFinal = true;

						// Add score of frame.one(strike so 10) and the next frames total
						frame.score = frame.one + nextFrame.one + nextFrame.two;

					}
					else {

						// If you've finished bowling in the entire frame ahead of i
						if (nextFrame.one !== null && nextFrame.two !== null) frame.isFinal = true;

						// Add score of frame.one(strike so 10) and the next frames total
						frame.score = frame.one + nextFrame.one + nextFrame.two;

					}
					
				}
				// If on frames 1-8th
				else
				{
					// If next frame was a strike
					if (nextFrame.one === 10) {

						// If you've thrown the ball twice more after the current throw
						if (nextNextFrame.one !== null) frame.isFinal = true;

						// Add total score of the frame and the next next frames first bowl
						frame.score = frame.one + nextFrame.one + nextFrame.two + nextNextFrame.one;

					}
					else {

						// If you've finished bowling in the entire frame ahead of i
						if (nextFrame.one !== null && nextFrame.two !== null) frame.isFinal = true;

						// Add total score of the next frame
						frame.score = frame.one + nextFrame.one + nextFrame.two;

					}
				}
				
			}
			// Get a spare
			else if ((frame.one + frame.two) === 10) {
				
				// If on the 10th frame
				if(i === 9)
				{
					// Spare from first 2 bowls + last bowl
					frame.score = 10 + frame.three;
				}
				else
				{

					// Add the first bowl of the frame
					frame.score = frame.one + frame.two + nextFrame.one;


					if (nextFrame.one !== null) frame.isFinal = true;
					
				}
				

			}


			// Add the previous frame score if not the first frame
			frame.score += i > 0 ? this.frames[i - 1].score : 0;
			
			

			
		}


	}


	tenthFrameLogic(numPins) {
		// XXX, #/X, #/#, XX#, X##, X#/

		let frame = this.frames[this.currentFrame];
		
		

		if (frame.one === null) {
			frame.one = numPins;
		}
		else if (frame.two === null) {
			if (frame.one === 10) {
				frame.two = numPins;
			}
			else {
				frame.two = numPins - frame.one;
			}

		}
		else if (frame.three === null) {
			if (frame.two === 10) {
				frame.three = numPins;
			}
			else{
				frame.three = numPins;
			}

		}
		
		// debugger;
		if (frame.one === 10 && frame.two === null) {
			console.log('strike first frame');
			this.goToNextFrame = true;
		}
		else if ((frame.one + frame.two) === 10 && frame.one !== 10) {
			console.log('spare first frame');
			this.goToNextFrame = true;
		}
		else if (frame.one === 10 && frame.two === 10) {
			console.log('double strike');
			this.goToNextFrame = true;
		}

	}


	draw(left, top, ctx) {

		let cellSize = {
			w: 45,
			h: 45
		};

		// Background
		// ctx.fillStyle = 'lightgrey';
		// ctx.fillRect(left, top, cellSize.w, cellSize.h * 10);


		for (let i in this.frames) {

			let frame = this.frames[i];
			let cellTop = top + cellSize.h * i;
			let littleLeft = left + cellSize.w - 15;



			// Draw the big cell
			ctx.beginPath();

			ctx.strokeStyle = "black";
			ctx.rect(left, cellTop, cellSize.w, cellSize.h);
			ctx.stroke();

			ctx.closePath();



			// Draw the little cell in top right corner
			ctx.beginPath();

			ctx.strokeStyle = "blue";
			ctx.rect(littleLeft, cellTop, 15, 15);
			ctx.stroke();

			ctx.closePath();


			// Draw additional little cells for last frame
			if (i == this.frames.length - 1) {
				ctx.beginPath();

				ctx.strokeStyle = "blue";
				ctx.rect(left, cellTop, 15, 15);
				ctx.rect(left + 15, cellTop, 15, 15);
				ctx.stroke();

				ctx.closePath();
			}




			function drawLittleCell(val, leftVal) {
				if (val === null) return;
				ctx.fillStyle = 'black';
				ctx.font = "16px Arial";
				ctx.fillText(val, left + leftVal, cellTop + 12);
			}

			// Draw the SCORES
			ctx.fillStyle = 'black';
			ctx.font = "16px Arial";

			// Draw the 10th frame
			if (i == this.frames.length - 1) {

				if (frame.one === null) continue;

				if (frame.one === 10) {
					drawLittleCell('X', 2);
				}
				else if (frame.one === 0) {
					drawLittleCell('-', 2);
				}
				else {
					drawLittleCell(frame.one, 2);
				}

				if (frame.two === null) continue;
				if (frame.two === 10) {
					drawLittleCell('X', 15);
				}
				else if (frame.two + frame.one === 10) {
					drawLittleCell('/', 15);
				}
				else {
					drawLittleCell(frame.two, 15);
				}

				if (frame.three === null) continue;
				if (frame.three === 10) {
					drawLittleCell('X', 30);
				}
				else if (frame.three + frame.two === 10) {
					drawLittleCell('/', 30);
				}
				else {
					drawLittleCell(frame.three, 30);
				}
			}
			else {
				if (frame.one != null) {

					if (frame.one === 10) {

						ctx.fillText('X', littleLeft + 2, cellTop + 12);

					}
					else if (frame.one === 0) {

						ctx.fillText('-', left + 5, cellTop + 16);

					}
					else {

						ctx.fillText(frame.one.toString(), left + 5, cellTop + 16);

					}

				}

				if (frame.two != null) {

					// Draw the little score on the right or / or X
					ctx.font = "14px Arial";
					if (frame.one + frame.two === 10) {
						ctx.fillText('/', littleLeft + 2, cellTop + 12);
					}
					else if (frame.two === 0) {
						ctx.fillText('-', littleLeft + 2, cellTop + 12);
					}
					else {

						ctx.fillText(frame.two.toString(), littleLeft + 2, cellTop + 12);

					}
				}
			}



			// Draw the total score so far
			ctx.font = "16px Arial";
			//	if(frame.score) {
			if (frame.isFinal) {

				ctx.fillText(frame.score.toString(), left + 5, cellTop + 32);
			}

		}


	}

}

/*global Game*/
Game.TestCircle = class TestCircle{
    
    constructor(c_x, c_y, radius){
        
        this.radius = radius;
        
        
        this.color = "yellow";
        
        this.body = new Game.Body({x: c_x, y: c_y}, {x: 0, y: 0}, 150);
        
        this.body.createGeometry('circle', {radius: this.radius});
        
        this.body.setCollisionGroups(['balls']);
        
        Game.physics.addMember(this);
        
        Game.physics.addToGroup('balls', this);
        
        
    }
    
    

    update(delta){
        
        this.body.update(delta);
        
    }
    
    
    draw(ctx){
        
        // Draw the circle
        ctx.beginPath();
        ctx.arc(this.body.pos.x, this.body.pos.y, this.radius, 0, Math.PI*2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
        
        
    }
    
    
}
"use strict";
class Animation{
    
    constructor(spritesheet, frames, animationTime){
        
        this.currentIndex = 0;
        this.frameTime = animationTime / frames.length;
        this.frames = frames;
        this.spritesheet = spritesheet;
        this.width = spritesheet.tileWidth;
        this.height = spritesheet.tileHeight;
        this.timeSinceLastFrameChange = 0;

        console.log('Animation frame time', this.frameTime);
        
    }
    
    update(delta){
        
        this.timeSinceLastFrameChange += delta;

        if(this.timeSinceLastFrameChange >= this.frameTime){
            
            if(this.currentIndex === this.frames.length - 1){
                // We are on the last frame so go to 0 index
                
                this.currentIndex = 0;
                
            }
            else{
                
                this.currentIndex ++;
                
            }
            
            // Reset the frame timer to 0
            this.timeSinceLastFrameChange = 0;
            
        }
        
    
    }
    
    render(ctx, x, y){
        
        this.spritesheet.render(ctx, x, y, this.frames[this.currentIndex]);
        
    }
    
};
/*global Game*/
Game.Body = class Body {

    constructor(pos, vel, mass, type) {

        this.pos = pos;
        this.vel = vel;
        this.acc = {
            x: 0,
            y: 0
        };

        
        this.angularVel = 0;
        this.angularAcc = 0;

        this.angle = 0;
        this.mass = mass;

        this.maxSpeed = null;

        this.type = type;

        this.rotationalDamping = 0;

        this.friction = 0;
        
        // Body type flags
        this.fixed = false;
        this.isBouncyCollidy = true;


        // Just to avoid errors when not ass-igned
        this.onCollided = () => {};
    }


    // Create the geometry
    createGeometry(type, config) {

        // If of type circle
        if (type.toLowerCase() === 'circle') {

            this.geometry = new Game.Circle(this.pos.x, this.pos.y, config.radius);

        }
        // Else if of type rectangle
        else if (type.toLowerCase() === 'rectangle') {

            this.geometry = new Game.Rectangle(this.pos.x, this.pos.y, config.width, config.height, config.color);


        }

    }


    // Check if the body intersects another body(so hawt)
    intersects(body) {

        return Game.Collision.intersects(this.geometry, body.geometry);

    }


    // Set the collision group
    setCollisionGroups(groups) {

        this.collidesWith = groups;

    }


    // Updates the position/velocity if acceleration
    update(delta) {

        // Accelerate the body's rotation
        this.angularVel += this.angularAcc;

        // Rotate the body
        this.angle += this.angularVel;
        
        
        if(this.angle >= Math.PI * 2)
        {
            this.angle = this.angle - Math.PI * 2;
        }
        else if(this.angle <= 0)
        {
            this.angle = this.angle + Math.PI * 2;
        }
        
        
        // Accelerate the body
        this.vel.x += this.acc.x;
        this.vel.y += this.acc.y;

        // console.log('Body update', this.vel);
        this.pos.x += this.vel.x;
        this.pos.y += this.vel.y;

        this.geometry.setPosition(this.pos);
        
        this.damping();
        this.accountForFriction();

    }
    
    
    
    accountForFriction(){
        
        if(this.vel.x < 0){
            
            this.vel.x += this.friction;
            
        }
        else{
            
            this.vel.x -= this.friction;
            
        }
        
        if(this.vel.y < 0){
            
            this.vel.y += this.friction;
            
        }
        else{
            
            this.vel.y -= this.friction;
            
        }
        
        
        if(this.vel.x >= -this.friction && this.vel.x <= this.friction){
            
            this.vel.x = 0;
            
        }
        
        if(this.vel.y >= -this.friction && this.vel.y <= this.friction){
            
            this.vel.y = 0;
            
        }
        
    }

    
    damping() {
        
        // Decrease angular velocity based on direction
        if(this.angularVel < 0){
            
            this.angularVel += this.rotationalDamping;
            
        }
        else{
            
            this.angularVel -= this.rotationalDamping;
            
        }
        // console.log(this.angularVel);
        
        // Account for values close to zero
        if(this.angularVel >= -this.rotationalDamping && this.angularVel <= this.rotationalDamping){
            
            // console.log('Almost zero');
            this.angularVel = 0;
            
        }
    }

    // Set position
    setPosition(pos) {

        this.pos = pos;
        this.geometry.setPosition(pos);

    }

    // Set the body velocity
    setVelocity(vel) {

        if (this.maxSpeed !== null) {

            // Magnitude squared
            let magnitudeSquared = (vel.x * vel.x + vel.y * vel.y);

            if (magnitudeSquared > this.maxSpeed * this.maxSpeed) {
                console.log("Velocity MAX POWER");

                // Normalize vector
                vel = Game.Mathematics.normalizeVector(vel);

                // Set new velocity
                vel.x = this.maxSpeed * vel.x;
                vel.y = this.maxSpeed * vel.y;

            }

        }

        this.vel = vel;

    }


    // Dat mass
    setMass(mass) {
        this.mass = mass;
    }
};
/*global Game*/
Game.BodyTypes = {
    CIRCLE: 0,
    RECTANGLE: 1,
};
/*global Game*/
Game.Circle = class Circle{
    
    constructor(c_x, c_y, radius){
        
        this.x = c_x;
        this.y = c_y;
        this.radius = radius;
        this.type = Game.BodyTypes.CIRCLE;
        
    }
    
    
    setPosition(pos){
        
        this.x = pos.x;
        this.y = pos.y;
    }
    
    
    draw(ctx, image){
        
        if(image){
            
            ctx.drawImage(image, this.x - this.radius, this.y - this.radius);
            
        }
        else{
            
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
            ctx.fill();
            ctx.closePath();
            
        }
        
    }
    
    
    contains(point){
        
        return Game.Collision.containsCircle(this, point);
        
    }
    
    
    intersects(obj){
        
        return Game.Collision.intersects(obj, this);

    }
    
};
/*global Game*/

Game.Collision = class Collision
{
    
    static intersects(obj1, obj2){
        
      //  console.log('Checking intersect', obj1, obj2);
        
        if(obj1.type === Game.BodyTypes.CIRCLE){
            
            if(obj2.type === Game.BodyTypes.CIRCLE){
                
                return Game.Collision.intersectCircles(obj1, obj2);
                
            }
            else if(obj2.type === Game.BodyTypes.RECTANGLE){
                
                return Game.Collision.intersectRectAndCircle(obj2, obj1);
                
            }
            else{
                
                console.log(typeof(obj1), 'intersecting', typeof(obj2), 'is not supported');
                return false;

            }
            
        }
        else if(obj2.type === Game.BodyTypes.CIRCLE){
            
            if(obj1.type === Game.BodyTypes.RECTANGLE){
                
                return Game.Collision.intersectRectAndCircle(obj1, obj2);
                
            }
            else{
                
                console.log(typeof(obj1), 'intersecting', typeof(obj2), 'is not supported');
                return false;
                
            }
            
        }
        else{
            
            console.log(typeof(obj1), 'intersecting', typeof(obj2), 'is not supported');
            return false;
            
        }
        
    }
    
    
    static intersectRects(rect1, rect2)
    {
        
        return rect1.left <= rect2.right &&
            rect2.left <= rect1.right &&
            rect1.top <= rect2.bottom &&
            rect2.top <= rect1.bottom;
            
    }
    
    static intersectCircles(ca, cb)
    {
       // console.log(ca, cb);
         // The x distance between the 2 points
        var dx = ca.x - cb.x;
        
        // The y distance between the 2 points
        var dy = ca.y - cb.y;
        
        // The sum of the circle radii
        var dr = ca.radius + cb.radius;
        
        // Compare the two distances. If the distance between the two points 
        // is less than the sum of the radii then the circles must intersect.
        return dx*dx + dy*dy <= dr*dr;
        
    }
    
    
    static intersectRectAndCircle(rect, circle)
    {
        // Horizontal distance between the circle center and rect center
        let distanceX = Math.abs(circle.x - rect.x - (rect.width/2));
        
        // Vertical distance between the circle center and rect center
        let distanceY = Math.abs(circle.y - rect.y - (rect.height/2));
    
    
        // If the distance is greater than half circle 
        // + half the width of half rect, 
        // then they are too far apart to be colliding
        if (distanceX > ((rect.width)/2 + circle.radius)) 
        { 
            // Return false
            return false;
        }
        
        // If the distance is greater than anchors half circle
        // + half the height of half rect, 
        // then they are too far apart to be colliding
        if (distanceY > ((rect.height)/2 + circle.radius)) 
        { 
            // Return false
            return false; 
            
        }
    
        // If the horizontal distance is less than or equal to half
        // the width of half rect then they are colliding 
        if (distanceX <= ((rect.width)/2)) 
        { 
            // Return true
            return true; 
        } 
        
        // If the vertical distance is less than or equal to half
        // the height of half rect then they are colliding 
        if (distanceY <= ((rect.height)/2)) 
        { 
            // Return true
            return true; 
        }
    
    
    
        /* This is for testing the collision at the image(rect) corners */
        
        // Think of a line from the rect center to any rect corner.
        // Now extend that line by the radius of the circle.
        // If the circle center is on that line then
        // they are colliding at exactly that rect corner.
        
        
        // The horizontal distance between the circle and rect
        // minus half the width of the rect
        let dx = distanceX - (rect.width)/2;
        
        // The vertical distance between the circle and rect
        // minus half the height of the rect
        let dy = distanceY - (rect.height)/2;
        
        
        // Use Pythagoras formula to compare the distance between circle and rect centers.
        return (dx * dx + dy * dy <= (circle.radius * circle.radius));
        
    }
    
    
    static containsRect(rect, point)
    {
        
        return (point.x <= rect.right && 
                point.x >= rect.x &&
                point.y >= rect.y && 
                point.y <= rect.bottom);
            
    }
    
    
    static containsCircle(circle, point)
    {
        
        let dx = circle.x - point.x;
        let dy = circle.y - point.y;
        
        return dx * dx + dy * dy <= circle.radius * circle.radius;
        
    }
    
};
/*global Game*/
Game.Input = class Input{
    
    constructor(){
        
        this.callbacks = {};
    }
    
    /*
     * Function that returns the mouses position.
     * It takes into account the size/position of the canvas and the scale(zoom in/out).
     */
    _mousePosition(event)
    {
        // Used to get the absolute size
        let rect = this.parent.getBoundingClientRect();
        
        /* relationship bitmap vs element for X/Y */
        
        // Gets the x scale
        let scaleX = this.parent.width / rect.width;
        
        // Gets the y scale
        let scaleY = this.parent.height / rect.height;
        
        
        // Returns two possible values
        return {
            // Mouse x position after taking into account the size/position of canvas and scale
            x: (event.clientX - rect.left) * scaleX,
            
            // Mouse y position after taking into account the size/position of canvas and scale
            y: (event.clientY - rect.top) * scaleY
            
        };
        
    }
    
    
    addCallback(type, cb){
        
        if(!this.callbacks[type]) this.callbacks[type] = [];
        
        this.callbacks[type].push(cb);

    }
    
    
    _react(type, event){
        
        var pos = this._mousePosition(event);
        
        for(var i in this.callbacks[type]){

            this.callbacks[type][i](pos);
            
        }
        
    }
    
    listen(parent){
        
        this.parent = parent;
        
        for(var type in this.callbacks){
            
            if(this.callbacks[type].length > 0){
                
                this.parent[type] = function(type){
                    
                    return function(event){
                        
                        this._react(type, event);
                        
                    };
                    
                }(type).bind(this);

            }
            
        }
        
    }
    
    
    clear(){
        
        for(let type in this.callbacks){
            
            this.parent[type] = undefined;
            
        }
        
    }
    
};
/*global Game*/
Game.Mathematics = class Mathematics {
    
    static normalizeVector(vector)
    {
        // Arc tan will give you the angle
        let angle = Math.atan2(vector.y, vector.x);
        
        // Will give number form 0 to 1
        let x = Math.cos(angle);
        let y = Math.sin(angle);
        
        // Set the new vector
        vector.x = x;
        vector.y = y;
        
        // Return the vector
        return vector;
    }
    
    
    /*
     *  Return the dot product for 2d and 3d vectors
     */
    static dot(vectorA, vectorB){

    	if(!vectorA.z) vectorA.z = 0;
    	if(!vectorB.z) vectorB.z = 0;
        
        let sum = 0;
        
        sum += vectorA.x * vectorB.x;
        sum += vectorA.y * vectorB.y;
        sum += vectorA.z * vectorB.z;
    	
    	return sum;
        
    }
    
    
    /*
     *  Vector sum
     */
    static vectorSum(A, B){
        
        return {
            x: A.x + B.x,
            y: A.y + B.y
        };
        
    }
    
    
    /*
     *  Return vector perpendicular
     */
    static perpendicularVector(vector){
        
        return {
            x: -vector.y,
            y: vector.x
        };
        
    }
    
    
    /*
     *  Scalar Vector multiplication
     */
    static scalarVectorMulti(scalar, vector)
    {
        return {x: scalar * vector.x, y: scalar * vector.y};
    }
    
    
    
    
    /*
     *  Returns a random integer within [min, max)
     */
    static randomInt(min, max){
        
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
        
    }
    
    
    
    
    /*
     *  Returns a random integer within [min, max]
     */
    static randomIntInc(min, max){
        
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
        
    }
    
    
    
    /**
     * Returns an array of integers from the min val to max - 1
     */
    static range(min, max){
        
        let l = [];
        for(let i=min; i < max; i++) l.push(i);
        return l;
        
    }
    
};
/*global Game*/
Game.Physics = class Physics {
    /**
     * The seven steps to 2d elastic collision using vector math can be found 
     * here -> http://www.imada.sdu.dk/~rolf/Edu/DM815/E10/2dcollisions.pdf
     * 
     * This case is for circles specifically, but by changing the step 1 for 
     * different geometries should make this method work for anything 2D.
     * 
     */
    
    
    
    
    /*
     *  Calculates final velocities for 1D elastic particle collision
     */
    static elasticParticleCollision1D(v_1, m_1, v_2, m_2){
        
        
        let v_1_f = v_1 * ((m_1 - m_2) / (m_1 + m_2)) + 
                    v_2 * ((2 * m_2 ) / (m_1 + m_2));
                    
        
        let v_2_f = v_1 * ((2 * m_1) / (m_1 + m_2)) +
                    v_2 * ((m_2 - m_1) / (m_1 + m_2));
        
        return {
            
            v1 : v_1_f,
            v2 : v_2_f,
            
        };
        
    }
    
    
    /*
     *  Returns the final velocities for two particles SLAMMING
     */
    static elasticParticleCollision2D(v_1, m_1, v_2, m_2){
        
        let v_f_x = Game.Physics.elasticParticleCollision1D(v_1.x, m_1, v_2.x, m_2);

        let v_f_y = Game.Physics.elasticParticleCollision1D(v_1.y, m_1, v_2.y, m_2);
        
        return {
            
            v1 : {
                x: v_f_x.v_1,
                y: v_f_y.v_1,
            },
            
            v2 : {
                x: v_f_x.v_2,
                y: v_f_y.v_2,
            },
            
        };
        
    }
    
    
    
    static unitNormalVectorCircle(center1, center2)
    {
        if(center1.x === undefined || center2.x === undefined || center1.y === undefined || center2.y === undefined)
        {
            
            throw Error("FAILED: center.x or center.y undefined");
            
        }
        
        let dx = center1.x - center2.x;
        let dy = center1.y - center2.y;
        
        
        
        return Game.Mathematics.normalizeVector({x: dx, y: dy});
    }

    
    
    
    static CirclesCollision(v1, c1, m1, v2, c2, m2){
        
        // Get unit normal vector between 2 circles
        let unitNormal = Game.Physics.unitNormalVectorCircle(c1, c2);
        let unitTangent = Game.Mathematics.perpendicularVector(unitNormal);
        
        let v1n = Game.Mathematics.dot(unitNormal, v1);
        let v1t = Game.Mathematics.dot(unitTangent, v1);
        
        let v2n = Game.Mathematics.dot(unitNormal, v2);
        let v2t = Game.Mathematics.dot(unitTangent, v2);
        
        let vfn = Game.Physics.elasticParticleCollision1D(v1n, m1, v2n, m2);
        
        let vf1n = Game.Mathematics.scalarVectorMulti(vfn.v1, unitNormal);
        let vf2n = Game.Mathematics.scalarVectorMulti(vfn.v2, unitNormal);
        let vf1t = Game.Mathematics.scalarVectorMulti(v1t, unitTangent);
        let vf2t = Game.Mathematics.scalarVectorMulti(v2t, unitTangent);
        
        let vf1 = Game.Mathematics.vectorSum(vf1n, vf1t);
        let vf2 = Game.Mathematics.vectorSum(vf2n, vf2t);
        
        
        
        return {
            v1: vf1,
            v2: vf2,
        };
        
    }
    
    
    
    static CircleRectCollision(c, r){
        
        // Do things
        
    }
    
    
    
    static Collision(A, B){
        
        if(A.body.type === Game.BodyTypes.CIRCLE && B.body.type === Game.BodyTypes.CIRCLE){
            
            return Game.Physics.CirclesCollision(A.body.vel, A.body.pos, A.body.mass, B.body.vel, B.body.pos, B.body.mass);
            
        }
        else if(A.body.type === Game.BodyTypes.RECTANGLE && B.body.type === Game.BodyTypes.RECTANGLE){
            
            console.log('Rect to Rect, mofo');

        }
        
        else if(A.body.type === Game.BodyTypes.RECTANGLE && B.body.type === Game.BodyTypes.CIRCLE){
            
            console.log('Rect to Circle, mofo');
            
            return {
                v1: {

                },
                v2: {
                    x: -B.body.vel.x,
                    y: B.body.vel.y
                }
            };
            
        }
        else if(A.body.type === Game.BodyTypes.CIRCLE && B.body.type === Game.BodyTypes.RECTANGLE){
            
            console.log('Circle to Rect, mofo');
            
            return {
                v1: {
                    x: -A.body.vel.x,
                    y: A.body.vel.y
                },
                v2: {
                    
                }
            };
            
        }
        
        
        
        
    }
    
};
/*global Game*/
Game.PhysicsManager = class PhysicsManager {

    constructor() {

        this.members = [
            // {
            //     collidesWith: ['balls', 'pins'],
            // }    
        ];

        this.collisionGroups = {

        };

    }


    addToGroup(groupName, member) {

        // Create the group if it doesn't exist
        if (!this.collisionGroups[groupName]) this.collisionGroups[groupName] = [];

        this.collisionGroups[groupName].push(member);

        console.log(groupName);

    }




    addMember(member) {

        member.collisionIndex = this.members.length;

        this.members.push(member);

        console.log("Added member");
        console.log(member);
    }



    update(delta) {

        this.alreadyCollided = {};

        // Loop through dem members
        for (let i = 0; i < this.members.length; i++) {

            // Current member at index i
            let member = this.members[i];

            // Loop through the groups that the member collides with
            for (let j = 0; j < member.body.collidesWith.length; j++) {

                // Array of members of the group
                let group = this.collisionGroups[member.body.collidesWith[j]];

                // Return the index that the member collides with.
                let collisionIndex = -1;


                // Check if any member of the group intersects the current memeber
                for (let k = 0; k < group.length; k++) {


                    // Has this member already collided with the other object?
                    let hasAlreadyCollided = this.alreadyCollided[member.collisionIndex] !== undefined;

                    // Is it colliding with itself?
                    let isCollidingWithSelf = group[k].body === member.body;

                    // Check for collision if it's not the same member we're checking
                    if (!hasAlreadyCollided && !isCollidingWithSelf && Game.Collision.intersects(group[k].body.geometry, member.body.geometry)) {

                        // console.log('Collision');
                        collisionIndex = k;

                        // Store the index of the collided member
                        this.alreadyCollided[group[k].collisionIndex] = member.collisionIndex;

                        // Break dance
                        break;

                    }

                }


                if (collisionIndex > -1) {

                    // The collision member body
                    let cmb = group[collisionIndex].body;

                    // The member body
                    let mb = member.body;

                    // console.log('Collision with', member.body.collidesWith[j]);

                    // Get the final velocity between the colliding circles
                    if(mb.isBouncyCollidy && cmb.isBouncyCollidy){
                        let finalVelocities = Game.Physics.Collision(member, group[collisionIndex]);
                        
                        // Set the velocities of the two objects
                        mb.setVelocity(finalVelocities.v1);
                        cmb.setVelocity(finalVelocities.v2);
                        
                        // Temporary final velocity fix
                        if (mb.fixed) mb.setVelocity({
                            x: 0,
                            y: 0
                        });
                        if (cmb.fixed) cmb.setVelocity({
                            x: 0,
                            y: 0
                        });
                    }
                    else{
                        
                        // console.log('Collision with inner gutter', mb, cmb);
                    
                    }
                    



                    // Let the event listeners know that a collision happened
                    mb.onCollided(group[collisionIndex]);
                    cmb.onCollided(member);

                }

            }

        }

    }

};
/*global Game*/
Game.Rectangle = class Rectangle{
    
    constructor(x, y, width, height, color){
        
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        
        this.left = x;
        this.right = x + width;
        this.top = y;
        this.bottom = y + height;
        
        this.color = color;
        this.type = Game.BodyTypes.RECTANGLE;
        
    }
    
    contains(point){
        
        return Game.Collision.containsRect(this, point);
                
    }
    
    
    intersects(obj){
        
        return Game.Collision.intersects(obj, this);
    }
    
    
    draw(ctx, image){
        
        // Draw the rect
        if(image){
            
            ctx.drawImage(image, this.x - this.radius, this.y - this.radius);
            
        }
        else{
            
            ctx.beginPath();
            ctx.rect(this.x, this.y, this.width, this.height);
            ctx.fillStyle = this.color;
            ctx.fill();
            ctx.closePath();
            
        }
        
    }
    
};
/*global Game*/
class Spritesheet{
    
    constructor(texture, tileWidth, tileHeight, tilePadding){
        
        this.texture = texture;
        this.spritePositions = [];
        this.tileWidth = tileWidth;
        this.tileHeight = tileHeight;
        this.tilePadding = tilePadding;
        
        this.calculatePositions();
        
    }
    
    
    /**
     * Calculate the x and y positions of each of the tiles in the spritesheet.
     */
    calculatePositions(){
        
        let numX = Math.floor(this.texture.width / this.tileWidth);
        let numY = Math.floor(this.texture.height / this.tileHeight);

        for(let y=0; y<numY; y++){
            
            for(let x=0; x<numX; x++){
                
                this.spritePositions.push([x * this.tileWidth, y * this.tileHeight]);
                
            }
            
        }

    }
    
    
    /**
     * Create an animation from the supplied spritesheet texture
     */
    makeAnimation(min, max, animationTime, backAndForth){
        
        // Get the array of frames between min and max
        let indexes = Game.Mathematics.range(min, max);
        
        // Add the reversed array minus start and end to the array of frames
        if(backAndForth) indexes = indexes.concat(Game.Mathematics.range(min + 1, max - 1).reverse());
        
        // Return an animation object
        return new Animation(this, indexes, animationTime);
        
    }
    
    
    
    /**
     * Render frame
     */
    render(ctx, x, y, index){
        
        ctx.fillStyle = "black";
        ctx.fillText(index.toString(), x + this.tileWidth/2, y + this.tileHeight + 10);
        let clippedPos = this.spritePositions[index];
        
        ctx.drawImage(this.texture, clippedPos[0], clippedPos[1], this.tileWidth, this.tileHeight, x, y, this.tileWidth, this.tileHeight);
        
    }
    
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJvd2wvQmFsbC5qcyIsImJvd2wvR2FtZS5qcyIsImJvd2wvR3V0dGVyLmpzIiwiYm93bC9QaW4uanMiLCJib3dsL1Njb3JlQm9hcmQuanMiLCJib3dsL1Rlc3RDaXJjbGUuanMiLCJlbmdpbmUvQW5pbWF0aW9uLmpzIiwiZW5naW5lL0JvZHkuanMiLCJlbmdpbmUvQm9keVR5cGVzLmpzIiwiZW5naW5lL0NpcmNsZS5qcyIsImVuZ2luZS9Db2xsaXNpb24uanMiLCJlbmdpbmUvSW5wdXQuanMiLCJlbmdpbmUvTWF0aGVtYXRpY3MuanMiLCJlbmdpbmUvUGh5c2ljcy5qcyIsImVuZ2luZS9QaHlzaWNzTWFuYWdlci5qcyIsImVuZ2luZS9SZWN0YW5nbGUuanMiLCJlbmdpbmUvU3ByaXRlc2hlZXQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVRQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMvUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzdOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDblpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNyTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDN0tBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQy9GQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbkhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDOUtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNyREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImJvd2xpbmcuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKmdsb2JhbCBHYW1lKi9cblxuY2xhc3MgQmFsbHtcbiAgICBcbiAgICBjb25zdHJ1Y3Rvcih4LCB5LCBjb2xvcil7XG4gICAgICAgIFxuICAgICAgICAvLyBDb2xvciBvZiBiYWxsXG4gICAgICAgIHRoaXMuY29sb3IgPSBjb2xvcjtcbiAgICAgICAgXG4gICAgICAgIC8vIE1hc3Mgb2YgdGhlIGJhbGxcbiAgICAgICAgdGhpcy5tYXNzID0gNy4yNSAqIDE7XG4gICAgICAgIFxuICAgICAgICAvLyBDb2xvciB3aGVuIG1vdXNlIGlzIGhvdmVyaW5nXG4gICAgICAgIHRoaXMuaG92ZXJDb2xvciA9IFwiIzE3MjAyQVwiO1xuICAgICAgICBcbiAgICAgICAgLy8gQm9vbGVhbiB0byBzZWUgaWYgdGhlIGJhbGwgaXMgcm9sbGluZ1xuICAgICAgICB0aGlzLmlzUm9sbGluZyA9IHRydWU7XG4gICAgICAgIFxuICAgICAgICAvLyBDaGVjayBpZiB0aGUgYmFsbCBpcyBoZWxkIGJ5IHRoZSBtb3VzZVxuICAgICAgICB0aGlzLmlzR3JhYmJlZCA9IGZhbHNlO1xuICAgICAgICBcbiAgICAgICAgLy8gQm9vbGVhbiBmb3Igd2hlbiB0aGUgYmFsbCBpcyBiZWluZyBob3ZlcmVkIG92ZXJcbiAgICAgICAgdGhpcy5pc0hvdmVyaW5nID0gZmFsc2U7XG4gICAgICAgIFxuICAgICAgICAvLyBBbGwgbW91c2UgaG9sZGluZyBpbmZvXG4gICAgICAgIHRoaXMuaG9sZCA9IHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcG9zaXRpb25zOiBbXSxcbiAgICAgICAgICAgIHRpbWVzOiBbXSxcbiAgICAgICAgICAgIFxuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLy8gTWFrZSBkYSBib2R5XG4gICAgICAgIHRoaXMuYm9keSA9IG5ldyBHYW1lLkJvZHkoe3g6eCwgeTp5fSwge3g6IDAsIHk6IDB9LCB0aGlzLm1hc3MsIEdhbWUuQm9keVR5cGVzLkNJUkNMRSk7XG4gICAgICAgIFxuICAgICAgICAvLyBTZXQgbWF4IHNwZWVkXG4gICAgICAgIHRoaXMuYm9keS5tYXhTcGVlZCA9IDIwO1xuICAgICAgICBcbiAgICAgICAgLy8gQ3JlYXRlIHRoZSBjaXJjbGUgZ2VvbWV0cnlcbiAgICAgICAgdGhpcy5ib2R5LmNyZWF0ZUdlb21ldHJ5KCdjaXJjbGUnLCB7cmFkaXVzOiAyMH0pO1xuICAgICAgICBcbiAgICAgICAgLy8gU2V0IHRoZSBjb2xsaXNpb24gZ3JvdXAgdG8gYmUgcGluc1xuICAgICAgICB0aGlzLmJvZHkuc2V0Q29sbGlzaW9uR3JvdXBzKFsncGlucycgLCdndXR0ZXJzJ10pO1xuICAgICAgICBcbiAgICAgICAgdGhpcy5ib2R5LmFuZ3VsYXJWZWwgPSAwLjA1O1xuICAgICAgICBcbiAgICAgICAgdGhpcy5ib2R5Lm9uQ29sbGlkZWQgPSB0aGlzLm9uQ29sbGlkZWQuYmluZCh0aGlzKTtcbiAgICAgICAgXG4gICAgICAgIC8vIEFkZCB0aGUgbWVtZWJlclxuICAgICAgICBHYW1lLnBoeXNpY3MuYWRkTWVtYmVyKHRoaXMpO1xuICAgICAgICBcbiAgICAgICAgLy8gQWRkIHRvIGJhbGxzIGdyb3VwXG4gICAgICAgIEdhbWUucGh5c2ljcy5hZGRUb0dyb3VwKCdiYWxscycsIHRoaXMpO1xuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIEdhbWUuaW5wdXQuYWRkQ2FsbGJhY2soJ29ubW91c2Vtb3ZlJywgKHBvcykgPT4ge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB0aGlzLm1vdmUocG9zKTtcbiAgICAgICAgICAgIFxuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIEdhbWUuaW5wdXQuYWRkQ2FsbGJhY2soJ29ubW91c2Vkb3duJywgKHBvcykgPT4ge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB0aGlzLmdyYWIocG9zKTtcbiAgICAgICAgICAgIC8vIHRoaXMucmVzZXQocG9zKTtcbiAgICAgICAgICAgIFxuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIEdhbWUuaW5wdXQuYWRkQ2FsbGJhY2soJ29ubW91c2V1cCcsIChwb3MpID0+IHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy5yZWxlYXNlKHBvcyk7XG4gICAgICAgICAgICBcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICBHYW1lLmlucHV0LmFkZENhbGxiYWNrKCdvbm1vdXNlbW92ZScsIChwb3MpID0+IHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy5ob3ZlckNoZWNrKHBvcyk7XG4gICAgICAgICAgICBcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgLy8gbG9hZCBpbWFnZSBmcm9tIGRhdGEgdXJsXG4gICAgICAgIHRoaXMuaW1hZ2UgPSBuZXcgSW1hZ2UoKTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuaW1hZ2Uuc3JjID0gJ2Fzc2V0cy9pbWFnZXMvYmFsbC5wbmcnO1xuICAgICAgICBcbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIFxuICAgIFxuICAgIG9uQ29sbGlkZWQobWVtYmVyKXtcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICBpZihtZW1iZXIudHlwZSA9PT0gJ2lubmVyJyl7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZihtZW1iZXIudHlwZSA9PT0gJ3JhaWwnKXtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy5ib2R5LnNldFZlbG9jaXR5KHt4OiAwLCB5OiB0aGlzLmJvZHkudmVsLnkgPCAtMC41ID8gdGhpcy5ib2R5LnZlbC55IDogLTF9KTtcbiAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgXG4gICAgdXBkYXRlKGRlbHRhKXtcbiAgICAgICAgXG4gICAgICAgIC8vIElmIHRoZSBib3dsaW5nIGJhbGwgaXMgcm9sbGluZyFcbiAgICAgICAgaWYodGhpcy5pc1JvbGxpbmcpe1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBNb3ZlIHRoZSBiYWxsXG4gICAgICAgICAgICB0aGlzLmJvZHkudXBkYXRlKGRlbHRhKTtcbiAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgICAgIFxuICAgIH1cbiAgICBcbiAgICBcbiAgICBkcmF3KGN0eCl7XG4gICAgICAgIFxuICAgICAgICAvLyBTZXQgdGhlIGNvbG9yIG9mIHRoZSBiYWxsXG4gICAgICAgIGN0eC5maWxsU3R5bGUgPSB0aGlzLmlzSG92ZXJpbmcgPyB0aGlzLmhvdmVyQ29sb3IgOiB0aGlzLmNvbG9yO1xuICAgICAgICBcbiAgICAgICAgLy8gU2F2ZSBjb250ZXh0XG4gICAgICAgIGN0eC5zYXZlKCk7XG4gICAgICAgIFxuICAgICAgICAvLyBUcmFuc2xhdGUgdGhlIGNvbnRleHQgYXJvdW5kIHJvdGF0aW9uIGNlbnRlclxuICAgICAgICBjdHgudHJhbnNsYXRlKHRoaXMuYm9keS5nZW9tZXRyeS54LCB0aGlzLmJvZHkuZ2VvbWV0cnkueSk7XG4gICAgICAgIFxuICAgICAgICAvLyBSb3RhdGUgdGhlIGNpcmNsZVxuICAgICAgICBjdHgucm90YXRlKHRoaXMuYm9keS5hbmdsZSk7XG4gICAgICAgIFxuICAgICAgICAvLyBUcmFuc2xhdGUgYmFjayB0byB3aGVyZSB3ZSB3ZXJlIGJlZm9yZVxuICAgICAgICBjdHgudHJhbnNsYXRlKC10aGlzLmJvZHkuZ2VvbWV0cnkueCwgLXRoaXMuYm9keS5nZW9tZXRyeS55KTtcbiAgICAgICAgXG4gICAgICAgIC8vIERyYXcgdGhlIGNpcmNsZVxuICAgICAgICB0aGlzLmJvZHkuZ2VvbWV0cnkuZHJhdyhjdHgsIHRoaXMuaW1hZ2UpO1xuICAgICAgICBcbiAgICAgICAgLy8gUmVzdG9yZSBjb250ZXh0XG4gICAgICAgIGN0eC5yZXN0b3JlKCk7XG4gICAgICAgIFxuICAgIH1cbiAgICBcbiAgICBcbiAgICByZWNvcmQocG9zKXtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuaG9sZC5wb3NpdGlvbnMucHVzaChwb3MpO1xuICAgICAgICB0aGlzLmhvbGQudGltZXMucHVzaChwZXJmb3JtYW5jZS5ub3coKSk7XG4gICAgICAgIFxuICAgICAgICBpZih0aGlzLmhvbGQucG9zaXRpb25zLmxlbmd0aCA+IDIwKXtcbiAgICAgICAgICAgIHRoaXMuaG9sZC5wb3NpdGlvbnMuc2hpZnQoKTtcbiAgICAgICAgICAgIHRoaXMuaG9sZC50aW1lcy5zaGlmdCgpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgIH1cbiAgICBcbiAgICBjYWxjdWxhdGVWZWxvY2l0eSgpIHtcbiAgICAgICAgXG4gICAgICAgIGxldCBwcyA9IHRoaXMuaG9sZC5wb3NpdGlvbnM7IC8vIGhvbGQgcG9zaXRpb25zXG4gICAgICAgIC8vIGxldCB0cyA9IHRoaXMuaG9sZC50aW1lczsgLy8gaG9sZCB0aW1lc1xuICAgICAgICBcbiAgICAgICAgbGV0IHN1bV94ID0gMDtcbiAgICAgICAgbGV0IHN1bV95ID0gMDtcbiAgICAgICAgXG4gICAgICAgIC8vIFRoZSBudW1iZXIgb2YgcG9pbnRzIHRvIGF2ZXJhZ2VcbiAgICAgICAgbGV0IG51bVBvaW50cyA9IDI7XG4gICAgICAgIFxuICAgICAgICBsZXQgbmV3X3BzID0gcHMuc3BsaWNlKHBzLmxlbmd0aCAtIDEgLSBudW1Qb2ludHMpO1xuICAgICAgICBmb3IodmFyIGkgPSAwOyBpIDwgbnVtUG9pbnRzOyBpKyspe1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBsZXQgbGFzdFBvc2l0aW9uID0gbmV3X3BzW2kgKyAxXTtcbiAgICAgICAgICAgIGxldCBzZWNvbmRMYXN0UG9zaXRpb24gPSBuZXdfcHNbaV07XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmKGxhc3RQb3NpdGlvbiA9PT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdUaGVyZSBpcyBubyBsYXN0IHBvc2l0aW9uLCBEaW5ndXMnLCBsYXN0UG9zaXRpb24pO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHJldHVybiB7eDogMCwgeTogMH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHN1bV94ICs9IChsYXN0UG9zaXRpb24ueCAtIHNlY29uZExhc3RQb3NpdGlvbi54KTtcbiAgICAgICAgICAgIHN1bV95ICs9IChsYXN0UG9zaXRpb24ueSAtIHNlY29uZExhc3RQb3NpdGlvbi55KTtcbiAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgbGV0IHZlbCA9IHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgeDogc3VtX3gvbnVtUG9pbnRzLFxuICAgICAgICAgICAgeTogc3VtX3kvbnVtUG9pbnRzXG4gICAgICAgICAgICBcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIGNvbnNvbGUubG9nKHZlbCk7XG4gICAgICAgIFxuICAgICAgICAvLyBUd28gcG9pbnQgZGlmZmVyZW5jZVxuICAgICAgICAvKiBsZXQgbGFzdFBvc2l0aW9uID0gcHNbcHMubGVuZ3RoIC0gMV07XG4gICAgICAgIGxldCBzZWNvbmRMYXN0UG9zaXRpb24gPSBwc1twcy5sZW5ndGggLSAyXTtcbiAgICAgICAgXG4gICAgICAgIHZlbCA9IHtcbiAgICAgICAgICAgIHg6IGxhc3RQb3NpdGlvbi54IC0gc2Vjb25kTGFzdFBvc2l0aW9uLngsXG4gICAgICAgICAgICB5OiBsYXN0UG9zaXRpb24ueSAtIHNlY29uZExhc3RQb3NpdGlvbi55XG4gICAgICAgIH07XG4gICAgICAgIGNvbnNvbGUubG9nKHZlbCk7Ki9cbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHZlbDtcbiAgICB9XG4gICAgXG4gICAgXG4gICAgZ3JhYihwb3Mpe1xuICAgIFxuICAgICAgICBpZih0aGlzLmJvZHkuZ2VvbWV0cnkuY29udGFpbnMocG9zKSl7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMuYm9keS5zZXRWZWxvY2l0eSh7eDowLCB5OjB9KTtcbiAgICAgICAgICAgIHRoaXMuaXNHcmFiYmVkID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuaG9sZC5zdGFydFRpbWUgPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgICAgICAgICAgIHRoaXMuaG9sZC5wb3NpdGlvbnMgPSBbXTtcbiAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgICAgIFxuICAgIH1cbiAgICBcbiAgICBcbiAgICBtb3ZlKHBvcyl7XG4gICAgICAgIFxuICAgICAgICBpZih0aGlzLmlzR3JhYmJlZClcbiAgICAgICAge1xuICAgICAgICAgICAgdGhpcy5yZWNvcmQocG9zKTtcbiAgICAgICAgICAgIHRoaXMuYm9keS5zZXRQb3NpdGlvbihwb3MpO1xuICAgICAgICAgICAgXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIFxuICAgIHJlbGVhc2UocG9zKXtcbiAgICAgICAgXG4gICAgICAgIGlmKHRoaXMuaXNHcmFiYmVkKXtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy5pc0dyYWJiZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuaXNSb2xsaW5nID0gdHJ1ZTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgbGV0IHYgPSB0aGlzLmNhbGN1bGF0ZVZlbG9jaXR5KCk7XG4gICAgICAgICAgICB0aGlzLmJvZHkuc2V0VmVsb2NpdHkodik7XG4gICAgICAgICAgICBcbiAgICAgICAgfVxuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgXG4gICAgaG92ZXJDaGVjayhwb3Mpe1xuICAgICAgICBcbiAgICAgICAgdGhpcy5pc0hvdmVyaW5nID0gZmFsc2U7XG4gICAgICAgIFxuICAgICAgICBpZih0aGlzLmJvZHkuZ2VvbWV0cnkuY29udGFpbnMocG9zKSl7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMuaXNIb3ZlcmluZyA9IHRydWU7XG4gICAgICAgICAgICBcbiAgICAgICAgfVxuICAgICAgICBcbiAgICB9XG4gICAgXG59IiwiLypnbG9iYWwgQmFsbCBQaW4gU2NvcmVCb2FyZCovXG5cbmxldCBHYW1lID0ge1xuICAgIFxuICAgIHN0YXJ0OiBudWxsLFxuICAgIGVuZDogbnVsbCxcbiAgICBcbiAgICBpbml0aWFsaXplOiBmdW5jdGlvbigpXG4gICAge1xuICAgICAgICAvLyBIYW5kbGVzIGlucHV0IGV2ZW50c1xuICAgICAgICB0aGlzLmlucHV0ID0gbmV3IEdhbWUuSW5wdXQoKTtcbiAgICAgICAgR2FtZS5waHlzaWNzID0gbmV3IEdhbWUuUGh5c2ljc01hbmFnZXIoKTtcbiAgICAgICAgXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIC8vIEdldCB0aGUgY2FudmFzIGFuZCBjb250ZXh0XG4gICAgICAgIHRoaXMuY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Jvd2xpbmcnKTtcbiAgICAgICAgdGhpcy5jdHggPSB0aGlzLmNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuXG4gICAgICAgIHRoaXMud2lkdGggPSA0MDA7XG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gODAwO1xuICAgICAgICBcbiAgICAgICAgLy8gQ2FudmFzIGhlaWdodCBhbmQgd2lkdGhcbiAgICAgICAgdGhpcy5jYW52YXMud2lkdGggPSB0aGlzLndpZHRoO1xuICAgICAgICB0aGlzLmNhbnZhcy5oZWlnaHQgPSB0aGlzLmhlaWdodDtcbiAgICAgICAgXG4gICAgICAgIC8vIEFycmF5IHRvIHN0b3JlIGFsbCB0aGUgcGluc1xuICAgICAgICB0aGlzLnBpbnMgPSBbXTtcbiAgICAgICAgXG4gICAgICAgIC8vIFdpZHRoIGFuZCBoZWlnaHQgb2YgcGluc1xuICAgICAgICB0aGlzLnBpbldpZHRoID0gMjA7XG4gICAgICAgIC8vIHRoaXMucGluSGVpZ2h0ID0gTWF0aC5QSSAqIHRoaXMucGluV2lkdGg7XG4gICAgICAgIHRoaXMucGluSGVpZ2h0ID0gNDY7XG4gICAgICAgIFxuICAgICAgICAvLyBCb3dsaW5nIGJhbGxcbiAgICAgICAgdGhpcy5iYWxsID0gbmV3IEJhbGwodGhpcy53aWR0aC8yLCB0aGlzLmhlaWdodCAtIDYwLCBcImJsYWNrXCIpO1xuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIHRoaXMuc2NvcmVib2FyZCA9IG5ldyBTY29yZUJvYXJkKCk7XG4gICAgICAgIFxuICAgICAgICB0aGlzLnNldFBpbnMoKTtcbiAgICAgICAgXG4gICAgICAgIFxuXG4gICAgICAgIFxuICAgICAgICB0aGlzLmxhbmUgPSBuZXcgR2FtZS5SZWN0YW5nbGUoMTEwLCAwLCAxODAsIDY1MCwgXCJyZ2JhKDE1MywgODUsIDQ1LCAxKVwiKTtcbiAgICAgICAgdGhpcy5sZWZ0R3V0dGVyID0gbmV3IEdhbWUuR3V0dGVyKDc1LCAwLCBcImxlZnRcIik7XG4gICAgICAgIHRoaXMucmlnaHRHdXR0ZXIgPSBuZXcgR2FtZS5HdXR0ZXIoMjkwLCAwLCBcInJpZ2h0XCIpO1xuICAgICAgICBcbiAgICAgICAgdGhpcy5yZXNldEJ1dHRvbiA9IG5ldyBHYW1lLlJlY3RhbmdsZSgwLCAwLCA2OCwgNTAsIFwicmdiYSgxNSwgODUsIDUsIDEpXCIpO1xuICAgICAgICB0aGlzLnJlc2V0QmFsbCA9IG5ldyBHYW1lLlJlY3RhbmdsZSgwLCA1MCwgNjgsIDUwLCBcInJnYmEoMSwgODUsIDE3NSwgMSlcIik7XG4gICAgICAgIFxuXG4gICAgICAvLyAgdGhpcy5pbnB1dC5saXN0ZW4odGhpcy5jYW52YXMpO1xuICAgICAgXG4gICAgICBcbiAgICAgIFxuICAgICAgICAvLyB0aGlzLmlucHV0LmFkZENhbGxiYWNrKCdvbm1vdXNlZG93bicsIChwb3MpID0+IHtcbiAgICAgICAgICAgIFxuICAgICAgICAvLyAgICAgLy8gY29uc29sZS5sb2coJ01vdXNlIHBvc2l0aW9uJywgcG9zKTtcbiAgICAgICAgLy8gICAgIHRoaXMucmVzZXQocG9zKTtcbiAgICAgICAgICAgIFxuICAgICAgICAvLyB9KTtcbiAgICAgICAgXG5cbiAgICB9LFxuICAgIFxuICAgIFxuICAgIHVwZGF0ZTogZnVuY3Rpb24gKGRlbHRhKVxuICAgIHtcbiAgICAgICAgLy8gTW92ZSB0aGUgYmFsbFxuICAgICAgICB0aGlzLmJhbGwudXBkYXRlKGRlbHRhKTtcbiAgICAgICAgXG4gICAgICAgIGZvcihsZXQgcCA9IDA7IHAgPCB0aGlzLnBpbnMubGVuZ3RoOyBwKyspXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRoaXMucGluc1twXS51cGRhdGUoZGVsdGEpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgR2FtZS5waHlzaWNzLnVwZGF0ZShkZWx0YSk7XG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgLy8gSGFuZGxlIHJlc2V0IGxvZ2ljXG4gICAgICAgIGlmKEdhbWUuYmFsbC5ib2R5LnBvcy55IDwgMClcbiAgICAgICAge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBHYW1lLnNjb3JlYm9hcmQuYWRkU2NvcmUoR2FtZS5waW5zLmZpbHRlcigocCkgPT4ge3JldHVybiAhcC5pc1N0YW5kaW5nOyB9KS5sZW5ndGgpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZihHYW1lLnNjb3JlYm9hcmQuZ29Ub05leHRGcmFtZSl7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgdGhpcy5yZXNldEZyYW1lKCk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgR2FtZS5zY29yZWJvYXJkLmdvVG9OZXh0RnJhbWUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2V7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgdGhpcy5yZXNldEJvd2woKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIFxuICAgIH0sXG4gICAgXG4gICAgXG4gICAgXG4gICAgZHJhdzogZnVuY3Rpb24gKClcbiAgICB7XG4gICAgICAgIFxuICAgICAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSAnbGlnaHRibHVlJztcbiAgICAgICAgdGhpcy5jdHguZmlsbFJlY3QoMCwgMCwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIHRoaXMubGFuZS5kcmF3KHRoaXMuY3R4KTtcbiAgICAgICAgdGhpcy5sZWZ0R3V0dGVyLmRyYXcodGhpcy5jdHgpO1xuICAgICAgICB0aGlzLnJpZ2h0R3V0dGVyLmRyYXcodGhpcy5jdHgpO1xuXG4gICAgICAgIHRoaXMucmVzZXRCdXR0b24uZHJhdyh0aGlzLmN0eCk7XG4gICAgICAgIHRoaXMucmVzZXRCYWxsLmRyYXcodGhpcy5jdHgpO1xuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICB0aGlzLmN0eC5mb250ID0gXCIyMHB4IEFyaWFsXCI7XG4gICAgICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9IFwieWVsbG93XCI7XG4gICAgICAgIHRoaXMuY3R4LmZpbGxUZXh0KFwiUkVTRVRcIiwgMCwgMzApO1xuICAgICAgICB0aGlzLmN0eC5maWxsVGV4dChcIkJBTExcIiwgMCwgNzUpXG4gICAgICAgIFxuICAgICAgICBmb3IodmFyIGkgPSB0aGlzLnBpbnMubGVuZ3RoIC0gMTsgaSA+IC0xOyBpLS0pe1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB0aGlzLnBpbnNbaV0uZHJhdyh0aGlzLmN0eCk7XG4gICAgICAgICAgICBcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgdGhpcy5iYWxsLmRyYXcodGhpcy5jdHgpO1xuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIHRoaXMuc2NvcmVib2FyZC5kcmF3KDAsIDEyMCwgdGhpcy5jdHgpO1xuICAgICAgICBcbiAgICB9LFxuICAgIFxuICAgIFxuICAgIGdhbWVMb29wOiBmdW5jdGlvbiAodGltZXN0YW1wKVxuICAgIHtcbiAgICAgICAgXG4gICAgICAgIC8vIFN0YXJ0aW5nIHRpbWVzdGFtcFxuICAgICAgICB0aGlzLnN0YXJ0ID0gdGltZXN0YW1wO1xuICAgICAgICBcbiAgICAgICAgLy8gRGV0ZXJtaW5lIHRoZSBkZWx0YSB0aW1lXG4gICAgICAgIGxldCBkZWx0YVRpbWUgPSB0aGlzLnN0YXJ0IC0gdGhpcy5lbmQ7XG4gICAgXHQgICAgXG4gICAgXHQgICAgXG4gICAgICAgIHRoaXMudXBkYXRlKGRlbHRhVGltZSk7XG4gICAgICAgIHRoaXMuZHJhdygpO1xuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIC8vIEVuZGluZyB0aW1lc3RhbXBcbiAgICBcdHRoaXMuZW5kID0gdGltZXN0YW1wO1xuICAgICAgICBcbiAgICAgICAgLypcbiAgICBcdCAqIFRoZSBnYW1lTG9vcCgpIGZ1bmN0aW9uIGlzIG5vdyBnZXR0aW5nIGV4ZWN1dGVkIGFnYWluIGFuZCBhZ2FpbiB3aXRoaW4gYSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKSBsb29wLCBcbiAgICBcdCAqIHdoZXJlIHdlIGFyZSBnaXZpbmcgY29udHJvbCBvZiB0aGUgZnJhbWVyYXRlIGJhY2sgdG8gdGhlIGJyb3dzZXIuIFxuICAgIFx0ICogSXQgd2lsbCBzeW5jIHRoZSBmcmFtZXJhdGUgYWNjb3JkaW5nbHkgYW5kIHJlbmRlciB0aGUgc2hhcGVzIG9ubHkgd2hlbiBuZWVkZWQuIFxuICAgIFx0ICogVGhpcyBwcm9kdWNlcyBhIG1vcmUgZWZmaWNpZW50LCBzbW9vdGhlciBhbmltYXRpb24gbG9vcCB0aGFuIHRoZSBvbGRlciBzZXRJbnRlcnZhbCgpIG1ldGhvZC5cbiAgICBcdCovXG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLmdhbWVMb29wLmJpbmQodGhpcykpO1xuICAgIH0sXG4gICAgXG4gICAgXG4gICAgcmVzZXRCb3dsOiBmdW5jdGlvbigpe1xuICAgICAgICBcbiAgICAgICAgR2FtZS5iYWxsLmJvZHkuc2V0VmVsb2NpdHkoe3g6IDAsIHk6IDB9KTtcbiAgICAgICAgR2FtZS5iYWxsLmJvZHkuc2V0UG9zaXRpb24oe3g6IEdhbWUud2lkdGgvMiwgeTogR2FtZS5oZWlnaHQgLSA2MH0pO1xuICAgICAgICAvLyBHYW1lLnNjb3JlYm9hcmQuYWRkU2NvcmUoR2FtZS5waW5zLmZpbHRlcigocCkgPT4ge3JldHVybiAhcC5pc1N0YW5kaW5nOyB9KS5sZW5ndGgpO1xuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIEdhbWUucGlucy5mb3JFYWNoKChwaW4pID0+IHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYoIXBpbi5pc1N0YW5kaW5nKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHBpbi5pc0FjdGl2ZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHBpbi5ib2R5LmlzQm91bmN5Q29sbGlkeSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICB9LFxuICAgIFxuICAgIHJlc2V0RnJhbWU6IGZ1bmN0aW9uKCl7XG4gICAgICAgIFxuICAgICAgICBHYW1lLmJhbGwuYm9keS5zZXRWZWxvY2l0eSh7eDogMCwgeTogMH0pO1xuICAgICAgICBHYW1lLmJhbGwuYm9keS5zZXRQb3NpdGlvbih7eDogR2FtZS53aWR0aC8yLCB5OiBHYW1lLmhlaWdodCAtIDYwfSk7XG5cbiAgICAgICAgdGhpcy5yZXNldFBpbnMoKTtcbiAgICAgICAgXG4gICAgfSxcbiAgICBcbiAgICBcbiAgICByZXNldDogZnVuY3Rpb24ocG9zKVxuICAgIHtcbiAgICAgICAgXG4gICAgICAgIC8qXG4gICAgICAgIC8vIElmIG1vdXNlIGlzIG9uIHJlc2V0IGJ1dHRvblxuICAgICAgICBpZihHYW1lLnJlc2V0QnV0dG9uLmNvbnRhaW5zKHBvcykpXG4gICAgICAgIHtcbiAgICAgICAgICAgIC8vIFJlc2V0IGJhbGwgdmVsb2NpdHkgYW5kIHBvc2l0aW9uXG4gICAgICAgICAgICBHYW1lLmJhbGwuYm9keS5zZXRWZWxvY2l0eSh7eDogMCwgeTogMH0pO1xuICAgICAgICAgICAgR2FtZS5iYWxsLmJvZHkuc2V0UG9zaXRpb24oe3g6IEdhbWUud2lkdGgvMiwgeTogR2FtZS5oZWlnaHQgLSA2MH0pO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgR2FtZS5yZXNldFBpbnMoKTtcbiAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZihHYW1lLnJlc2V0QmFsbC5jb250YWlucyhwb3MpKVxuICAgICAgICB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIFJlc2V0IGJhbGwgdmVsb2NpdHkgYW5kIHBvc2l0aW9uXG4gICAgICAgICAgICBHYW1lLmJhbGwuYm9keS5zZXRWZWxvY2l0eSh7eDogMCwgeTogMH0pO1xuICAgICAgICAgICAgR2FtZS5iYWxsLmJvZHkuc2V0UG9zaXRpb24oe3g6IEdhbWUud2lkdGgvMiwgeTogR2FtZS5oZWlnaHQgLSA2MH0pO1xuICAgICAgICAgICAgR2FtZS5zY29yZWJvYXJkLmFkZFNjb3JlKEdhbWUucGlucy5maWx0ZXIoKHApID0+IHtyZXR1cm4gIXAuaXNTdGFuZGluZzsgfSkubGVuZ3RoKTtcbiAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgICAgICovXG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgXG4gICAgfSxcbiAgICBcbiAgICBzZXRQaW5zOiBmdW5jdGlvbigpXG4gICAge1xuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIHZhciBwaW5JblJvdyA9IC0xO1xuICAgICAgICAvLyBMb29wIHRocm91Z2ggMTAgcGluc1xuICAgICAgICBmb3IobGV0IHAgPSAxMCwgeSA9IDM7IHAgPiAwOyBwLS0pXG4gICAgICAgIHtcbiAgICAgICAgICAgIGlmKHAgPT0gNCB8fCBwID09IDcgfHwgcCA9PSA5KVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHBpbkluUm93ID0gLTE7XG4gICAgICAgICAgICAgICAgeS0tO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBwaW5JblJvdyArKztcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgbGV0IGR4ID0gNDA7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIFB1c2ggZGF0IHBpblxuICAgICAgICAgICAgdGhpcy5waW5zLnB1c2gobmV3IFBpbih0aGlzLndpZHRoLzIgLSB0aGlzLnBpbldpZHRoLzIgKyAoKHkgLSAzKSAqIDIwICsgKHBpbkluUm93ICogZHgpKSwgXG4gICAgICAgICAgICAgICAgKDIwMCkgKyAoeSAtIDMpICogNTAsIFxuICAgICAgICAgICAgICAgIHRoaXMucGluV2lkdGgsIHRoaXMucGluSGVpZ2h0KSk7XG4gICAgICAgICAgICBcbiAgICAgICAgfVxuICAgICAgICBcbiAgICB9LFxuICAgIFxuICAgIFxuICAgIHJlc2V0UGluczogZnVuY3Rpb24oKVxuICAgIHtcbiAgICAgICAgXG4gICAgICAgIGZvcihsZXQgcCBpbiBHYW1lLnBpbnMpe1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBHYW1lLnBpbnNbcF0ucmVzZXQoKTtcbiAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgICAgIFxuICAgIH1cblxuXG59O1xuXG5cbi8qXG5cbi8vIERyYXcgcmVjdCBvdXRsaW5lXG5jdHguYmVnaW5QYXRoKCk7XG5jdHgucmVjdCh4LCB5LCB3aWR0aCwgaGVpZ2h0KTtcbmN0eC5zdHJva2VTdHlsZSA9IFwicmdiYSgyLCAxOCwgOCwgMSlcIjtcbmN0eC5zdHJva2UoKTtcbmN0eC5jbG9zZVBhdGgoKTtcblxuLy8gRHJhdyB0ZXh0XG5jdHguZm9udCA9IFwiMjBweCBBcmlhbFwiO1xuY3R4LmZpbGxTdHlsZSA9IFwiYmxhY2tcIjtcbmN0eC5maWxsVGV4dChcIlRleHQgZ29lcyBoZXJlXCIsIHgsIHkpOyovIiwiLypnbG9iYWwgR2FtZSovXG5cbi8qXG4gKiBSYWlsIGlzIHRoZSBlZGdlIG9mIHRoZSBndXR0ZXIsIGlubmVyIGlzIHRoZSBndXR0ZXIgaXRzZWxmLlxuICpcbiAqL1xuR2FtZS5HdXR0ZXIgPSBjbGFzcyBHdXR0ZXJ7XG4gICAgXG4gICAgY29uc3RydWN0b3IoeCwgeSwgc2lkZSlcbiAgICB7XG5cbiAgICAgICAgLy8gSW5maW5pdGUgbWFzc1xuICAgICAgICB0aGlzLm1hc3MgPSBOdW1iZXIuTkVHQVRJVkVfSU5GSU5JVFkgKiAtMTtcbiAgICAgICAgXG4gICAgICAgIC8vIFdpZHRoIG9mIGd1dHRlclxuICAgICAgICB0aGlzLmlubmVyV2lkdGggPSA0MDtcbiAgICAgICAgXG4gICAgICAgIC8vIFdpZHRoIG9mIGVkZ2VcbiAgICAgICAgdGhpcy5yYWlsV2lkdGggPSA0O1xuICAgICAgICBcbiAgICAgICAgLy8gSGVpZ2h0IG9mIGxhbmVcbiAgICAgICAgdGhpcy5oZWlnaHQgPSA2NTA7XG4gICAgICAgIFxuICAgICAgICAvLyBDb2xvcnNcbiAgICAgICAgdGhpcy5pbm5lckNvbG9yID0gXCJyZ2JhKDE1NSwgMTU1LCAxNTUsIDEpXCI7XG4gICAgICAgIHRoaXMucmFpbENvbG9yID0gXCJyZ2JhKDEwMCwgMTAwLCAxMDAsIDEpXCI7XG4gICAgICAgIFxuICAgICAgICAvLyBJZiBsZWZ0IHNpZGVcbiAgICAgICAgaWYoc2lkZSA9PT0gJ2xlZnQnKXtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gTWFrZSB0aGUgcmVjdHNcbiAgICAgICAgICAgIHRoaXMuaW5uZXIgPSBuZXcgR2FtZS5SZWN0YW5nbGUoeCwgeSwgdGhpcy5pbm5lcldpZHRoLCB0aGlzLmhlaWdodCwgdGhpcy5pbm5lckNvbG9yKTtcbiAgICAgICAgICAgIHRoaXMucmFpbCA9IG5ldyBHYW1lLlJlY3RhbmdsZSh4LCB5LCB0aGlzLnJhaWxXaWR0aCwgdGhpcy5oZWlnaHQsIHRoaXMucmFpbENvbG9yKTtcbiAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgICAgIC8vIEVsc2UgcmlnaHQgc2lkZVxuICAgICAgICBlbHNle1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBNYWtlIHRoZSByZWN0c1xuICAgICAgICAgICAgdGhpcy5pbm5lciA9IG5ldyBHYW1lLlJlY3RhbmdsZSh4LCB5LCB0aGlzLmlubmVyV2lkdGgsIHRoaXMuaGVpZ2h0LCB0aGlzLmlubmVyQ29sb3IpO1xuICAgICAgICAgICAgdGhpcy5yYWlsID0gbmV3IEdhbWUuUmVjdGFuZ2xlKHggKyB0aGlzLmlubmVyV2lkdGggLSB0aGlzLnJhaWxXaWR0aCwgeSwgdGhpcy5yYWlsV2lkdGgsIHRoaXMuaGVpZ2h0LCB0aGlzLnJhaWxDb2xvcik7XG4gICAgICAgICAgICBcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgdGhpcy5pbm5lci50eXBlID0gJ2lubmVyJztcbiAgICAgICAgdGhpcy5yYWlsLnR5cGUgPSAncmFpbCc7XG4gICAgICAgIFxuICAgICAgICAvLyBNYWtlIGEgYm9keSBmb3IgdGhlIHJhaWxcbiAgICAgICAgdGhpcy5yYWlsLmJvZHkgPSBuZXcgR2FtZS5Cb2R5KHt4OiB0aGlzLnJhaWwueCwgeTogdGhpcy5yYWlsLnl9LCB7eDogMCwgeTogMH0sIHRoaXMubWFzcywgR2FtZS5Cb2R5VHlwZXMuUkVDVEFOR0xFKTtcbiAgICAgICAgXG4gICAgICAgIC8vIFNldCBpdCB0byBiZSBmaXhlZFxuICAgICAgICB0aGlzLnJhaWwuYm9keS5maXhlZCA9IHRydWU7XG4gICAgICAgIFxuICAgICAgICAvLyBTZXQgYm9keSBnZW9tZXRyeSB0eXBlXG4gICAgICAgIHRoaXMucmFpbC5ib2R5LmNyZWF0ZUdlb21ldHJ5KCdyZWN0YW5nbGUnLCB7d2lkdGg6IHRoaXMucmFpbC53aWR0aCwgaGVpZ2h0OiB0aGlzLnJhaWwuaGVpZ2h0fSk7XG4gICAgICAgIFxuICAgICAgICAvLyBDb2xsaWRlIHdpdGggcGlucyBhbmQgYmFsbHNcbiAgICAgICAgdGhpcy5yYWlsLmJvZHkuc2V0Q29sbGlzaW9uR3JvdXBzKFsnYmFsbHMnLCAncGlucyddKTtcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICAvLyBNYWtlIGd1dHRlciBib2R5XG4gICAgICAgIHRoaXMuaW5uZXIuYm9keSA9IG5ldyBHYW1lLkJvZHkoe3g6IHRoaXMuaW5uZXIueCwgeTogdGhpcy5pbm5lci55fSwge3g6IDAsIHk6IDB9LCAxMCwgR2FtZS5Cb2R5VHlwZXMuUkVDVEFOR0xFKTtcbiAgICAgICAgdGhpcy5pbm5lci5ib2R5LmNyZWF0ZUdlb21ldHJ5KCdyZWN0YW5nbGUnLCB7d2lkdGg6IHRoaXMuaW5uZXIud2lkdGggKiAyLzMsIGhlaWdodDogdGhpcy5pbm5lci5oZWlnaHR9KTtcbiAgICAgICAgdGhpcy5pbm5lci5ib2R5LmlzQm91bmN5Q29sbGlkeSA9IGZhbHNlO1xuICAgICAgICB0aGlzLmlubmVyLmJvZHkuc2V0Q29sbGlzaW9uR3JvdXBzKFsnYmFsbHMnLCAncGlucyddKTtcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICAvLyBNYWtlIGd1dHRlciBhIG1lbWJlciBvZiBndXR0ZXIgZ3JvdXBcbiAgICAgICAgR2FtZS5waHlzaWNzLmFkZFRvR3JvdXAoJ2d1dHRlcnMnLCB0aGlzLmlubmVyKTtcbiAgICAgICAgR2FtZS5waHlzaWNzLmFkZFRvR3JvdXAoJ2d1dHRlcnMnLCB0aGlzLnJhaWwpO1xuICAgICAgICBcbiAgICAgICAgLy8gQWRkIHRoZSBtZW1iZXJcbiAgICAgICAgR2FtZS5waHlzaWNzLmFkZE1lbWJlcih0aGlzLnJhaWwpO1xuICAgICAgICBHYW1lLnBoeXNpY3MuYWRkTWVtYmVyKHRoaXMuaW5uZXIpO1xuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgXG4gICAgXG4gICAgXG4gICAgZHJhdyhjdHgpXG4gICAge1xuICAgICAgICB0aGlzLmlubmVyLmRyYXcoY3R4KTtcbiAgICAgICAgdGhpcy5yYWlsLmRyYXcoY3R4KTtcbiAgICB9XG4gICAgXG59OyIsIi8qZ2xvYmFsIEdhbWUgSW1hZ2UqL1xuY2xhc3MgUGlue1xuICAgIFxuICAgIGNvbnN0cnVjdG9yKHgsIHksIHdpZHRoLCBoZWlnaHQpe1xuICAgICAgICBcbiAgICAgICAgLy8gUG9zaXRpb24gb2YgcGluXG4gICAgICAgIC8vIHRoaXMucG9zID0ge3g6eCwgeTp5fTtcbiAgICAgICAgLy8gdGhpcy5yb3RhdGlvbiA9IDA7XG5cbiAgICAgICAgdGhpcy5tYXNzID0gMS41ICogMTtcblxuICAgICAgICAvLyBXaWR0aCBvZiBwaW5cbiAgICAgICAgdGhpcy53aWR0aCA9IHdpZHRoO1xuICAgICAgICBcbiAgICAgICAgLy8gSGVpZ2h0IG9mIHBpblxuICAgICAgICB0aGlzLmhlaWdodCA9IGhlaWdodDtcbiAgICAgICAgXG4gICAgICAgIC8vIENvbGxpc2lvbiByYWRpdXNcbiAgICAgICAgdGhpcy5jb2xsaXNpb25SYWRpdXMgPSAxMDtcbiAgICAgICAgXG4gICAgICAgIC8vIENvbG9yIG9mIHBpblxuICAgICAgICB0aGlzLmNvbG9yID0gXCJyZ2JhKDI1NSwgMjU1LCAyNTUsIDEpXCI7XG4gICAgICAgIFxuICAgICAgICAvLyBCb29sZWFuIGZvciBjb2xsaXNpb24gcmVjdGFuZ2xlIHNpemVcbiAgICAgICAgdGhpcy5pc1N0YW5kaW5nID0gdHJ1ZTtcbiAgICAgICAgXG4gICAgICAgIC8vIEJvb2xlYW4gZm9yIGNvbGxpc2lvbiBhbmQgZHJhd2luZyBvZiBwaW5cbiAgICAgICAgdGhpcy5pc0FjdGl2ZSA9IHRydWU7XG4gICAgICAgIFxuICAgICAgICB0aGlzLmluaXRpYWxQb3NpdGlvbiA9IHtcbiAgICAgICAgICAgIHg6IHggKyB0aGlzLndpZHRoLzIsXG4gICAgICAgICAgICB5OiB5ICsgdGhpcy5oZWlnaHQgLSB0aGlzLmNvbGxpc2lvblJhZGl1cyxcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICAvLyBNYWtlIGRhIGJvZHlcbiAgICAgICAgdGhpcy5ib2R5ID0gbmV3IEdhbWUuQm9keSh7eDogeCArIHRoaXMud2lkdGgvMiwgeTogeSArIHRoaXMuaGVpZ2h0IC0gdGhpcy5jb2xsaXNpb25SYWRpdXN9LCB7eDogMCwgeTogMH0sIHRoaXMubWFzcywgR2FtZS5Cb2R5VHlwZXMuQ0lSQ0xFKTtcbiAgICAgICAgXG4gICAgICAgIC8vIFNldCB0aGUgbWF4IHNwZWRcbiAgICAgICAgdGhpcy5ib2R5Lm1heFNwZWVkID0gMjA7XG4gICAgICAgIFxuICAgICAgICAvLyBDcmVhdGUgdGhlIGNpcmNsZSBnZW9tZXRyeSBmb3Igd2hlbiBwaW4gaXMgc3RhbmRpbmdcbiAgICAgICAgdGhpcy5ib2R5LmNyZWF0ZUdlb21ldHJ5KCdjaXJjbGUnLCB7cmFkaXVzOiB0aGlzLmNvbGxpc2lvblJhZGl1c30pO1xuICAgICAgICBcbiAgICAgICAgLy8gU2V0IHRoZSBjb2xsbGlzaW9uIHRvIGJlIHdpdGggdGhlIGJhbGwgYW5kIHBpbnNcbiAgICAgICAgdGhpcy5ib2R5LnNldENvbGxpc2lvbkdyb3VwcyhbJ2JhbGxzJywgJ3BpbnMnLCAnZ3V0dGVycyddKTtcbiAgICAgICAgXG4gICAgICAgIC8vIEFkZCB0aGUgbWVtYmVyXG4gICAgICAgIEdhbWUucGh5c2ljcy5hZGRNZW1iZXIodGhpcyk7XG4gICAgICAgIFxuICAgICAgICAvLyBBZGQgdG8gcGlucyBncm91cFxuICAgICAgICBHYW1lLnBoeXNpY3MuYWRkVG9Hcm91cCgncGlucycsIHRoaXMpO1xuICAgICAgICBcbiAgICAgICAgdGhpcy5ib2R5LmFuZ3VsYXJWZWwgPSAwO1xuICAgICBcbiAgICAgICAgLy8gbG9hZCBpbWFnZSBmcm9tIGRhdGEgdXJsXG4gICAgICAgIHRoaXMuaW1hZ2UgPSBuZXcgSW1hZ2UoKTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuaW1hZ2Uuc3JjID0gJ2Fzc2V0cy9pbWFnZXMvcGluLnBuZyc7XG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgdGhpcy5ib2R5Lm9uQ29sbGlkZWQgPSB0aGlzLm9uQ29sbGlkZWQuYmluZCh0aGlzKTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuYm9keS5yb3RhdGlvbmFsRGFtcGluZyA9IDAuMDAxO1xuICAgICAgICB0aGlzLmJvZHkuaW5pdGlhbEZyaWN0aW9uID0gMC4wMztcbiAgICAgICAgdGhpcy5ib2R5LmZyaWN0aW9uID0gdGhpcy5ib2R5LmluaXRpYWxGcmljdGlvbjtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuaW5pdGlhbEFuZ3VsYXJWZWxvY2l0eSA9IDAuMjg7XG4gICAgICAgIFxuICAgICAgICB0aGlzLmlzSW5HdXR0ZXIgPSBmYWxzZTtcbiAgICAgICAgXG4gICAgIFxuICAgIH1cbiAgICBcbiAgICBcbiAgICB1cGRhdGUoZGVsdGEpe1xuICAgICAgICBcbiAgICAgICAgdGhpcy5ib2R5LnVwZGF0ZShkZWx0YSk7XG5cbiAgICB9XG4gICAgXG4gICAgXG4gICAgXG4gICAgb25Db2xsaWRlZChtZW1iZXIpe1xuICAgICAgICBcbiAgICAgICAgdGhpcy5ib2R5LmZyaWN0aW9uID0gdGhpcy5ib2R5LmluaXRpYWxGcmljdGlvbjtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuaXNTdGFuZGluZyA9IGZhbHNlO1xuXG4gICAgICAgIGlmKG1lbWJlci50eXBlID09PSAnaW5uZXInKXtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYoIXRoaXMuaXNJbkd1dHRlcilcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0aGlzLmJvZHkuZnJpY3Rpb24gPSAuMjtcbiAgICAgICAgICAgICAgICB0aGlzLmJvZHkucm90YXRpb25hbERhbXBpbmcgPSAuMDAxO1xuICAgICAgICAgICAgIC8vICAgdGhpcy5ib2R5LmFuZ3VsYXJWZWwgPSB0aGlzLmJvZHkuYW5ndWxhclZlbCA8IDAgPyAtMC4wMiA6IDAuMDI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMuaXNJbkd1dHRlciA9IHRydWU7XG5cbiAgICAgICAgICAgIGxldCBwaVNpemUgPSBNYXRoLlBJIC8gODsgLy8gMjIuNSBkZWdyZWVzXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBBbmdsZSBpcyBhcm91bmQgMGRlZ1xuICAgICAgICAgICAgaWYodGhpcy5ib2R5LmFuZ2xlID4gLXBpU2l6ZSAmJiB0aGlzLmJvZHkuYW5nbGUgPCBwaVNpemUpe1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHRoaXMuYm9keS5hbmd1bGFyVmVsID0gMDtcbiAgICAgICAgICAgICAgICB0aGlzLmJvZHkuYW5nbGUgPSAwO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gQW5nbGUgaXMgYXJvdW5kIDE4MGRlZ1xuICAgICAgICAgICAgZWxzZSBpZih0aGlzLmJvZHkuYW5nbGUgPiBNYXRoLlBJIC0gcGlTaXplICYmIHRoaXMuYm9keS5hbmdsZSA8IE1hdGguUEkgKyBwaVNpemUpe1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHRoaXMuYm9keS5hbmd1bGFyVmVsID0gMDtcbiAgICAgICAgICAgICAgICB0aGlzLmJvZHkuYW5nbGUgPSBNYXRoLlBJO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gaWYodGhpcy5ib2R5LmFuZ2xlID4gTWF0aC5QSS8yICYmIHRoaXMuYm9keS5hbmdsZSA8IE1hdGguUEkpe1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gICAgIHRoaXMuYm9keS5hbmd1bGFyVmVsID0gLTE7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyB9XG4gICAgICAgICAgICAvLyBlbHNlXG4gICAgICAgICAgICAvLyB7XG4gICAgICAgICAgICAvLyAgICAgdGhpcy5ib2R5LmFuZ3VsYXJWZWwgPSAxO1xuICAgICAgICAgICAgLy8gfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyB0aGlzLmJvZHkucm90YXRpb25hbERhbXBpbmcgPSAuMDI7XG4gICAgICAgICAgICBcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmKG1lbWJlci5ib2R5LmlzQm91bmN5Q29sbGlkeSAmJiAhdGhpcy5pc0luR3V0dGVyKXtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy5zZXRSb3RhdGlvbigpO1xuICAgICAgICAgICAgXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmKG1lbWJlci50eXBlID09PSAncmFpbCcpe1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB0aGlzLmJvZHkuZnJpY3Rpb24gPSAyMDtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY29uc29sZS5sb2coJ1BFRUVFTk5OT09PU1NTU1MnKTtcbiAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgICAgIFxuICAgIH1cbiAgICBcbiAgICBcbiAgICBzZXRSb3RhdGlvbihtZW1iZXIpe1xuICAgICAgICBcbiAgICAgICAgaWYodGhpcy5ib2R5LmFuZ3VsYXJWZWwgPj0gMCl7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMuYm9keS5hbmd1bGFyVmVsID0gLXRoaXMuaW5pdGlhbEFuZ3VsYXJWZWxvY2l0eTtcbiAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgICAgIGVsc2V7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMuYm9keS5hbmd1bGFyVmVsID0gdGhpcy5pbml0aWFsQW5ndWxhclZlbG9jaXR5O1xuICAgICAgICAgICAgXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgfVxuICAgIFxuXG4gICAgZHJhdyhjdHgpe1xuICAgICAgICBcbiAgICAgICAvLyBjb25zb2xlLmxvZygnUGluIEFjdGl2ZScsIHRoaXMuYm9keS5wb3MpO1xuICAgICAgICBpZih0aGlzLmlzQWN0aXZlKXtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgbGV0IGRyYXdYID0gdGhpcy5ib2R5LnBvcy54IC0gdGhpcy53aWR0aC8yO1xuICAgICAgICAgICAgbGV0IGRyYXdZID0gdGhpcy5ib2R5LnBvcy55IC0gdGhpcy5oZWlnaHQgKyB0aGlzLmNvbGxpc2lvblJhZGl1cztcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBTZXQgdGhlIGNvbG9yIG9mIHRoZSBiYWxsXG4gICAgICAgICAgICBjdHguZmlsbFN0eWxlID0gdGhpcy5pc0hvdmVyaW5nID8gdGhpcy5ob3ZlckNvbG9yIDogdGhpcy5jb2xvcjtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gU2F2ZSBjb250ZXh0XG4gICAgICAgICAgICBjdHguc2F2ZSgpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBUcmFuc2xhdGUgdGhlIGNvbnRleHQgYXJvdW5kIHJvdGF0aW9uIGNlbnRlclxuICAgICAgICAgICAgY3R4LnRyYW5zbGF0ZSh0aGlzLmJvZHkuZ2VvbWV0cnkueCwgdGhpcy5ib2R5Lmdlb21ldHJ5LnkpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBSb3RhdGUgdGhlIGNpcmNsZVxuICAgICAgICAgICAgY3R4LnJvdGF0ZSh0aGlzLmJvZHkuYW5nbGUpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBUcmFuc2xhdGUgYmFjayB0byB3aGVyZSB3ZSB3ZXJlIGJlZm9yZVxuICAgICAgICAgICAgY3R4LnRyYW5zbGF0ZSgtdGhpcy5ib2R5Lmdlb21ldHJ5LngsIC10aGlzLmJvZHkuZ2VvbWV0cnkueSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIHRoaXMuYm9keS5nZW9tZXRyeS5kcmF3KGN0eCwgdGhpcy5pbWFnZSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIERyYXcgdGhlIGNpcmNsZVxuICAgICAgICAgICAgY3R4LmRyYXdJbWFnZSh0aGlzLmltYWdlLCBkcmF3WCwgZHJhd1kpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBSZXN0b3JlIGNvbnRleHRcbiAgICAgICAgICAgIGN0eC5yZXN0b3JlKCk7XG5cbiAgICAgICAgfVxuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgXG4gICAgcmVzZXQoKXtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgdGhpcy5ib2R5LnNldFZlbG9jaXR5KHtcbiAgICAgICAgICAgIHg6IDAsXG4gICAgICAgICAgICB5OiAwLFxuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuYm9keS5zZXRQb3NpdGlvbihKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHRoaXMuaW5pdGlhbFBvc2l0aW9uKSkpO1xuICAgICAgICB0aGlzLmJvZHkuYW5ndWxhclZlbCA9IDA7XG4gICAgICAgIHRoaXMuYm9keS5hbmdsZSA9IDA7XG4gICAgICAgIHRoaXMuaXNJbkd1dHRlciA9IGZhbHNlO1xuICAgICAgICB0aGlzLmlzU3RhbmRpbmcgPSB0cnVlO1xuICAgICAgICB0aGlzLmlzQWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5ib2R5LmlzQm91bmN5Q29sbGlkeSA9IHRydWU7XG4gICAgfVxuICAgIFxuICAgIFxuICAgIFxufSIsIi8qZ2xvYmFsIEdhbWUqL1xuY2xhc3MgU2NvcmVCb2FyZCB7XG5cblx0Lypcblx0ICBXZSBuZWVkIGFycmF5IGZvciBhY3R1YWwgc2NvcmUsIGFuZCBhbiBhcnJheSBmb3Igd2hhdCBzY29yZSB0byBkaXNwbGF5IFt0b3RhbCBmb3IgZnJhbWUsIHNwYXJlcygvKSBhbmQgc3RyaWtlcyhYKV0uXG5cdCAqL1xuXG5cdGNvbnN0cnVjdG9yKCkge1xuXG5cdFx0Ly8gU3RvcmUgZnJhbWVzXG5cdFx0dGhpcy5mcmFtZXMgPSBbXTtcblxuXHRcdC8vIEN1cnJlbnQgZnJhbWVcblx0XHR0aGlzLmN1cnJlbnRGcmFtZSA9IDA7XG5cdFx0dGhpcy5zY29yZSA9IDA7XG5cdFx0XG5cdFx0Ly8gQm9vbGVhbiBmb3Igd2hlbiB0byBjaGFuZ2UgZnJhbWUgaW4gR2FtZS5qcyBmb3IgcmVzZXRpbmcgbG9naWNcblx0XHR0aGlzLmdvVG9OZXh0RnJhbWUgPSBmYWxzZTtcblxuXG5cdFx0Ly8gRmlyc3QgOSBmcmFtZXNcblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IDk7IGkrKykge1xuXHRcdFx0Ly8gUHVzaCBlbXB0eSBhcnJheSBpbiBmcmFtZXNcblx0XHRcdHRoaXMuZnJhbWVzLnB1c2goe1xuXHRcdFx0XHRvbmU6IG51bGwsXG5cdFx0XHRcdHR3bzogbnVsbCxcblx0XHRcdFx0c2NvcmU6IG51bGwsXG5cdFx0XHRcdGlzRmluYWw6IGZhbHNlLFxuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0Ly8gTGFzdCBmcmFtZVxuXHRcdHRoaXMuZnJhbWVzLnB1c2goe1xuXHRcdFx0b25lOiBudWxsLFxuXHRcdFx0dHdvOiBudWxsLFxuXHRcdFx0dGhyZWU6IG51bGwsXG5cdFx0XHRzY29yZTogbnVsbCxcblx0XHRcdGlzRmluYWw6IGZhbHNlLFxuXHRcdH0pO1xuXG5cdH1cblxuXG5cdGFkZFNjb3JlKG51bVBpbnMpIHtcblxuXHRcdC8vIERvbid0IGxldCBhbiBpbnZhbGlkIGluZGV4IGJlIHVzZWQuXG5cdFx0aWYgKHRoaXMuY3VycmVudEZyYW1lID49IHRoaXMuZnJhbWVzLmxlbmd0aCkgcmV0dXJuO1xuXG5cdFx0bGV0IGZyYW1lID0gdGhpcy5mcmFtZXNbdGhpcy5jdXJyZW50RnJhbWVdO1xuXG5cblx0XHRpZiAodGhpcy5jdXJyZW50RnJhbWUgPT09IDkpIHtcblx0XHRcdHRoaXMudGVudGhGcmFtZUxvZ2ljKG51bVBpbnMpO1xuXHRcdH1cblx0XHRlbHNlIGlmIChmcmFtZS5vbmUgPT09IG51bGwpIHtcblx0XHRcdGZyYW1lLm9uZSA9IG51bVBpbnM7XG5cdFx0fVxuXHRcdGVsc2UgaWYgKGZyYW1lLnR3byA9PT0gbnVsbCkge1xuXHRcdFx0ZnJhbWUudHdvID0gbnVtUGlucyAtIGZyYW1lLm9uZTtcblx0XHR9XG5cblx0XHR0aGlzLmNhbGN1bGF0ZVNjb3JlcygpO1xuXG5cdFx0Ly8gSWYgdXNlciBoYXMgc2NvcmVkIGEgc3RyaWtlIG9yIGVuZCBvZiBmcmFtZVxuXHRcdGlmIChudW1QaW5zID09PSAxMCB8fCAoZnJhbWUub25lICE9PSBudWxsICYmIGZyYW1lLnR3byAhPT0gbnVsbCkpIHtcblx0XHRcdFxuXHRcdFx0aWYgKHRoaXMuY3VycmVudEZyYW1lICE9PSA5KSB7XG5cdFx0XHRcdC8vIEluY3JlbWVudCBmcmFtZVxuXHRcdFx0XHR0aGlzLmdvVG9OZXh0RnJhbWUgPSB0cnVlO1xuXHRcdFx0XHR0aGlzLmN1cnJlbnRGcmFtZSsrO1xuXHRcdFx0XHRjb25zb2xlLmxvZygnZ28gdG8gbmV4dCBmcmFtZSwgYml0Y2gnKTtcblx0XHRcdH1cblxuXHRcdH1cblxuXHR9XG5cblx0Y2FsY3VsYXRlU2NvcmVzKCkge1xuXG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPD0gdGhpcy5jdXJyZW50RnJhbWU7IGkrKykge1xuXG5cdFx0XHRsZXQgZnJhbWUgPSB0aGlzLmZyYW1lc1tpXTtcblx0XHRcdGxldCBuZXh0RnJhbWUgPSB0aGlzLmZyYW1lc1tpICsgMV07XG5cdFx0XHRsZXQgbmV4dE5leHRGcmFtZSA9IHRoaXMuZnJhbWVzW2kgKyAyXTtcblx0XHRcdGNvbnNvbGUubG9nKHRoaXMuY3VycmVudEZyYW1lKTtcblxuXHRcdFx0XG5cdFx0Ly9cdGlmKGkgPT09IDkpXG5cdFx0Ly9cdHtcblx0XHRcdFx0ZnJhbWUuaXNGaW5hbCA9IHRydWU7XG5cdFx0Ly9cdH1cblxuXG5cdFx0XHQvLyBHZXQgYSBub24gbWFyayAoIylcblx0XHRcdGlmIChmcmFtZS5vbmUgIT09IDEwICYmIChmcmFtZS5vbmUgKyBmcmFtZS50d28pICE9PSAxMCkge1xuXG5cdFx0XHRcdC8vIEFkZCB0aGUgc2NvcmVzIHRvIHRoZSB0b3RhbCBzY29yZVxuXHRcdFx0XHRmcmFtZS5zY29yZSA9IGZyYW1lLm9uZSArIGZyYW1lLnR3bztcblxuXHRcdFx0XHRpZiAoZnJhbWUudHdvICE9PSBudWxsKVxuXHRcdFx0XHRcdGZyYW1lLmlzRmluYWwgPSB0cnVlO1xuXG5cdFx0XHR9XG5cdFx0XHQvLyBHZXQgYSBzdHJpa2Vcblx0XHRcdGVsc2UgaWYgKGZyYW1lLm9uZSA9PT0gMTApIHtcblxuXHRcdFx0XHQvLyBJZiBvbiB0aGUgMTB0aCBmcmFtZVxuXHRcdFx0XHRpZihpID09PSA5KVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Ly8gQWRkIGFsbCAzIHNjb3JlcyBzaW5jZSBmaXJzdCBib3dsIHdhcyBhIHN0cmlrZVx0XG5cdFx0XHRcdFx0ZnJhbWUuc2NvcmUgPSBmcmFtZS5vbmUgKyBmcmFtZS50d28gKyBmcmFtZS50aHJlZTtcblx0XHRcdFx0fVxuXHRcdFx0XHQvLyBJZiBvbiBmcmFtZSA5dGggZnJhbWVcblx0XHRcdFx0ZWxzZSBpZihpID09PSA4KVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0Ly8gSWYgbmV4dCBmcmFtZSB3YXMgYSBzdHJpa2Vcblx0XHRcdFx0XHRpZiAobmV4dEZyYW1lLm9uZSA9PT0gMTApIHtcblxuXHRcdFx0XHRcdFx0Ly8gSWYgeW91J3ZlIHRocm93biB0aGUgYmFsbCB0d2ljZSBtb3JlIGFmdGVyIHRoZSBjdXJyZW50IHRocm93XG5cdFx0XHRcdFx0XHRpZiAobmV4dEZyYW1lLm9uZSAhPT0gbnVsbCkgZnJhbWUuaXNGaW5hbCA9IHRydWU7XG5cblx0XHRcdFx0XHRcdC8vIEFkZCBzY29yZSBvZiBmcmFtZS5vbmUoc3RyaWtlIHNvIDEwKSBhbmQgdGhlIG5leHQgZnJhbWVzIHRvdGFsXG5cdFx0XHRcdFx0XHRmcmFtZS5zY29yZSA9IGZyYW1lLm9uZSArIG5leHRGcmFtZS5vbmUgKyBuZXh0RnJhbWUudHdvO1xuXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2Uge1xuXG5cdFx0XHRcdFx0XHQvLyBJZiB5b3UndmUgZmluaXNoZWQgYm93bGluZyBpbiB0aGUgZW50aXJlIGZyYW1lIGFoZWFkIG9mIGlcblx0XHRcdFx0XHRcdGlmIChuZXh0RnJhbWUub25lICE9PSBudWxsICYmIG5leHRGcmFtZS50d28gIT09IG51bGwpIGZyYW1lLmlzRmluYWwgPSB0cnVlO1xuXG5cdFx0XHRcdFx0XHQvLyBBZGQgc2NvcmUgb2YgZnJhbWUub25lKHN0cmlrZSBzbyAxMCkgYW5kIHRoZSBuZXh0IGZyYW1lcyB0b3RhbFxuXHRcdFx0XHRcdFx0ZnJhbWUuc2NvcmUgPSBmcmFtZS5vbmUgKyBuZXh0RnJhbWUub25lICsgbmV4dEZyYW1lLnR3bztcblxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcblx0XHRcdFx0fVxuXHRcdFx0XHQvLyBJZiBvbiBmcmFtZXMgMS04dGhcblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Ly8gSWYgbmV4dCBmcmFtZSB3YXMgYSBzdHJpa2Vcblx0XHRcdFx0XHRpZiAobmV4dEZyYW1lLm9uZSA9PT0gMTApIHtcblxuXHRcdFx0XHRcdFx0Ly8gSWYgeW91J3ZlIHRocm93biB0aGUgYmFsbCB0d2ljZSBtb3JlIGFmdGVyIHRoZSBjdXJyZW50IHRocm93XG5cdFx0XHRcdFx0XHRpZiAobmV4dE5leHRGcmFtZS5vbmUgIT09IG51bGwpIGZyYW1lLmlzRmluYWwgPSB0cnVlO1xuXG5cdFx0XHRcdFx0XHQvLyBBZGQgdG90YWwgc2NvcmUgb2YgdGhlIGZyYW1lIGFuZCB0aGUgbmV4dCBuZXh0IGZyYW1lcyBmaXJzdCBib3dsXG5cdFx0XHRcdFx0XHRmcmFtZS5zY29yZSA9IGZyYW1lLm9uZSArIG5leHRGcmFtZS5vbmUgKyBuZXh0RnJhbWUudHdvICsgbmV4dE5leHRGcmFtZS5vbmU7XG5cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZSB7XG5cblx0XHRcdFx0XHRcdC8vIElmIHlvdSd2ZSBmaW5pc2hlZCBib3dsaW5nIGluIHRoZSBlbnRpcmUgZnJhbWUgYWhlYWQgb2YgaVxuXHRcdFx0XHRcdFx0aWYgKG5leHRGcmFtZS5vbmUgIT09IG51bGwgJiYgbmV4dEZyYW1lLnR3byAhPT0gbnVsbCkgZnJhbWUuaXNGaW5hbCA9IHRydWU7XG5cblx0XHRcdFx0XHRcdC8vIEFkZCB0b3RhbCBzY29yZSBvZiB0aGUgbmV4dCBmcmFtZVxuXHRcdFx0XHRcdFx0ZnJhbWUuc2NvcmUgPSBmcmFtZS5vbmUgKyBuZXh0RnJhbWUub25lICsgbmV4dEZyYW1lLnR3bztcblxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRcblx0XHRcdH1cblx0XHRcdC8vIEdldCBhIHNwYXJlXG5cdFx0XHRlbHNlIGlmICgoZnJhbWUub25lICsgZnJhbWUudHdvKSA9PT0gMTApIHtcblx0XHRcdFx0XG5cdFx0XHRcdC8vIElmIG9uIHRoZSAxMHRoIGZyYW1lXG5cdFx0XHRcdGlmKGkgPT09IDkpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHQvLyBTcGFyZSBmcm9tIGZpcnN0IDIgYm93bHMgKyBsYXN0IGJvd2xcblx0XHRcdFx0XHRmcmFtZS5zY29yZSA9IDEwICsgZnJhbWUudGhyZWU7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHR7XG5cblx0XHRcdFx0XHQvLyBBZGQgdGhlIGZpcnN0IGJvd2wgb2YgdGhlIGZyYW1lXG5cdFx0XHRcdFx0ZnJhbWUuc2NvcmUgPSBmcmFtZS5vbmUgKyBmcmFtZS50d28gKyBuZXh0RnJhbWUub25lO1xuXG5cblx0XHRcdFx0XHRpZiAobmV4dEZyYW1lLm9uZSAhPT0gbnVsbCkgZnJhbWUuaXNGaW5hbCA9IHRydWU7XG5cdFx0XHRcdFx0XG5cdFx0XHRcdH1cblx0XHRcdFx0XG5cblx0XHRcdH1cblxuXG5cdFx0XHQvLyBBZGQgdGhlIHByZXZpb3VzIGZyYW1lIHNjb3JlIGlmIG5vdCB0aGUgZmlyc3QgZnJhbWVcblx0XHRcdGZyYW1lLnNjb3JlICs9IGkgPiAwID8gdGhpcy5mcmFtZXNbaSAtIDFdLnNjb3JlIDogMDtcblx0XHRcdFxuXHRcdFx0XG5cblx0XHRcdFxuXHRcdH1cblxuXG5cdH1cblxuXG5cdHRlbnRoRnJhbWVMb2dpYyhudW1QaW5zKSB7XG5cdFx0Ly8gWFhYLCAjL1gsICMvIywgWFgjLCBYIyMsIFgjL1xuXG5cdFx0bGV0IGZyYW1lID0gdGhpcy5mcmFtZXNbdGhpcy5jdXJyZW50RnJhbWVdO1xuXHRcdFxuXHRcdFxuXG5cdFx0aWYgKGZyYW1lLm9uZSA9PT0gbnVsbCkge1xuXHRcdFx0ZnJhbWUub25lID0gbnVtUGlucztcblx0XHR9XG5cdFx0ZWxzZSBpZiAoZnJhbWUudHdvID09PSBudWxsKSB7XG5cdFx0XHRpZiAoZnJhbWUub25lID09PSAxMCkge1xuXHRcdFx0XHRmcmFtZS50d28gPSBudW1QaW5zO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdGZyYW1lLnR3byA9IG51bVBpbnMgLSBmcmFtZS5vbmU7XG5cdFx0XHR9XG5cblx0XHR9XG5cdFx0ZWxzZSBpZiAoZnJhbWUudGhyZWUgPT09IG51bGwpIHtcblx0XHRcdGlmIChmcmFtZS50d28gPT09IDEwKSB7XG5cdFx0XHRcdGZyYW1lLnRocmVlID0gbnVtUGlucztcblx0XHRcdH1cblx0XHRcdGVsc2V7XG5cdFx0XHRcdGZyYW1lLnRocmVlID0gbnVtUGlucztcblx0XHRcdH1cblxuXHRcdH1cblx0XHRcblx0XHQvLyBkZWJ1Z2dlcjtcblx0XHRpZiAoZnJhbWUub25lID09PSAxMCAmJiBmcmFtZS50d28gPT09IG51bGwpIHtcblx0XHRcdGNvbnNvbGUubG9nKCdzdHJpa2UgZmlyc3QgZnJhbWUnKTtcblx0XHRcdHRoaXMuZ29Ub05leHRGcmFtZSA9IHRydWU7XG5cdFx0fVxuXHRcdGVsc2UgaWYgKChmcmFtZS5vbmUgKyBmcmFtZS50d28pID09PSAxMCAmJiBmcmFtZS5vbmUgIT09IDEwKSB7XG5cdFx0XHRjb25zb2xlLmxvZygnc3BhcmUgZmlyc3QgZnJhbWUnKTtcblx0XHRcdHRoaXMuZ29Ub05leHRGcmFtZSA9IHRydWU7XG5cdFx0fVxuXHRcdGVsc2UgaWYgKGZyYW1lLm9uZSA9PT0gMTAgJiYgZnJhbWUudHdvID09PSAxMCkge1xuXHRcdFx0Y29uc29sZS5sb2coJ2RvdWJsZSBzdHJpa2UnKTtcblx0XHRcdHRoaXMuZ29Ub05leHRGcmFtZSA9IHRydWU7XG5cdFx0fVxuXG5cdH1cblxuXG5cdGRyYXcobGVmdCwgdG9wLCBjdHgpIHtcblxuXHRcdGxldCBjZWxsU2l6ZSA9IHtcblx0XHRcdHc6IDQ1LFxuXHRcdFx0aDogNDVcblx0XHR9O1xuXG5cdFx0Ly8gQmFja2dyb3VuZFxuXHRcdC8vIGN0eC5maWxsU3R5bGUgPSAnbGlnaHRncmV5Jztcblx0XHQvLyBjdHguZmlsbFJlY3QobGVmdCwgdG9wLCBjZWxsU2l6ZS53LCBjZWxsU2l6ZS5oICogMTApO1xuXG5cblx0XHRmb3IgKGxldCBpIGluIHRoaXMuZnJhbWVzKSB7XG5cblx0XHRcdGxldCBmcmFtZSA9IHRoaXMuZnJhbWVzW2ldO1xuXHRcdFx0bGV0IGNlbGxUb3AgPSB0b3AgKyBjZWxsU2l6ZS5oICogaTtcblx0XHRcdGxldCBsaXR0bGVMZWZ0ID0gbGVmdCArIGNlbGxTaXplLncgLSAxNTtcblxuXG5cblx0XHRcdC8vIERyYXcgdGhlIGJpZyBjZWxsXG5cdFx0XHRjdHguYmVnaW5QYXRoKCk7XG5cblx0XHRcdGN0eC5zdHJva2VTdHlsZSA9IFwiYmxhY2tcIjtcblx0XHRcdGN0eC5yZWN0KGxlZnQsIGNlbGxUb3AsIGNlbGxTaXplLncsIGNlbGxTaXplLmgpO1xuXHRcdFx0Y3R4LnN0cm9rZSgpO1xuXG5cdFx0XHRjdHguY2xvc2VQYXRoKCk7XG5cblxuXG5cdFx0XHQvLyBEcmF3IHRoZSBsaXR0bGUgY2VsbCBpbiB0b3AgcmlnaHQgY29ybmVyXG5cdFx0XHRjdHguYmVnaW5QYXRoKCk7XG5cblx0XHRcdGN0eC5zdHJva2VTdHlsZSA9IFwiYmx1ZVwiO1xuXHRcdFx0Y3R4LnJlY3QobGl0dGxlTGVmdCwgY2VsbFRvcCwgMTUsIDE1KTtcblx0XHRcdGN0eC5zdHJva2UoKTtcblxuXHRcdFx0Y3R4LmNsb3NlUGF0aCgpO1xuXG5cblx0XHRcdC8vIERyYXcgYWRkaXRpb25hbCBsaXR0bGUgY2VsbHMgZm9yIGxhc3QgZnJhbWVcblx0XHRcdGlmIChpID09IHRoaXMuZnJhbWVzLmxlbmd0aCAtIDEpIHtcblx0XHRcdFx0Y3R4LmJlZ2luUGF0aCgpO1xuXG5cdFx0XHRcdGN0eC5zdHJva2VTdHlsZSA9IFwiYmx1ZVwiO1xuXHRcdFx0XHRjdHgucmVjdChsZWZ0LCBjZWxsVG9wLCAxNSwgMTUpO1xuXHRcdFx0XHRjdHgucmVjdChsZWZ0ICsgMTUsIGNlbGxUb3AsIDE1LCAxNSk7XG5cdFx0XHRcdGN0eC5zdHJva2UoKTtcblxuXHRcdFx0XHRjdHguY2xvc2VQYXRoKCk7XG5cdFx0XHR9XG5cblxuXG5cblx0XHRcdGZ1bmN0aW9uIGRyYXdMaXR0bGVDZWxsKHZhbCwgbGVmdFZhbCkge1xuXHRcdFx0XHRpZiAodmFsID09PSBudWxsKSByZXR1cm47XG5cdFx0XHRcdGN0eC5maWxsU3R5bGUgPSAnYmxhY2snO1xuXHRcdFx0XHRjdHguZm9udCA9IFwiMTZweCBBcmlhbFwiO1xuXHRcdFx0XHRjdHguZmlsbFRleHQodmFsLCBsZWZ0ICsgbGVmdFZhbCwgY2VsbFRvcCArIDEyKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gRHJhdyB0aGUgU0NPUkVTXG5cdFx0XHRjdHguZmlsbFN0eWxlID0gJ2JsYWNrJztcblx0XHRcdGN0eC5mb250ID0gXCIxNnB4IEFyaWFsXCI7XG5cblx0XHRcdC8vIERyYXcgdGhlIDEwdGggZnJhbWVcblx0XHRcdGlmIChpID09IHRoaXMuZnJhbWVzLmxlbmd0aCAtIDEpIHtcblxuXHRcdFx0XHRpZiAoZnJhbWUub25lID09PSBudWxsKSBjb250aW51ZTtcblxuXHRcdFx0XHRpZiAoZnJhbWUub25lID09PSAxMCkge1xuXHRcdFx0XHRcdGRyYXdMaXR0bGVDZWxsKCdYJywgMik7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZSBpZiAoZnJhbWUub25lID09PSAwKSB7XG5cdFx0XHRcdFx0ZHJhd0xpdHRsZUNlbGwoJy0nLCAyKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHRkcmF3TGl0dGxlQ2VsbChmcmFtZS5vbmUsIDIpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKGZyYW1lLnR3byA9PT0gbnVsbCkgY29udGludWU7XG5cdFx0XHRcdGlmIChmcmFtZS50d28gPT09IDEwKSB7XG5cdFx0XHRcdFx0ZHJhd0xpdHRsZUNlbGwoJ1gnLCAxNSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZSBpZiAoZnJhbWUudHdvICsgZnJhbWUub25lID09PSAxMCkge1xuXHRcdFx0XHRcdGRyYXdMaXR0bGVDZWxsKCcvJywgMTUpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2Uge1xuXHRcdFx0XHRcdGRyYXdMaXR0bGVDZWxsKGZyYW1lLnR3bywgMTUpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKGZyYW1lLnRocmVlID09PSBudWxsKSBjb250aW51ZTtcblx0XHRcdFx0aWYgKGZyYW1lLnRocmVlID09PSAxMCkge1xuXHRcdFx0XHRcdGRyYXdMaXR0bGVDZWxsKCdYJywgMzApO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2UgaWYgKGZyYW1lLnRocmVlICsgZnJhbWUudHdvID09PSAxMCkge1xuXHRcdFx0XHRcdGRyYXdMaXR0bGVDZWxsKCcvJywgMzApO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2Uge1xuXHRcdFx0XHRcdGRyYXdMaXR0bGVDZWxsKGZyYW1lLnRocmVlLCAzMCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGVsc2Uge1xuXHRcdFx0XHRpZiAoZnJhbWUub25lICE9IG51bGwpIHtcblxuXHRcdFx0XHRcdGlmIChmcmFtZS5vbmUgPT09IDEwKSB7XG5cblx0XHRcdFx0XHRcdGN0eC5maWxsVGV4dCgnWCcsIGxpdHRsZUxlZnQgKyAyLCBjZWxsVG9wICsgMTIpO1xuXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2UgaWYgKGZyYW1lLm9uZSA9PT0gMCkge1xuXG5cdFx0XHRcdFx0XHRjdHguZmlsbFRleHQoJy0nLCBsZWZ0ICsgNSwgY2VsbFRvcCArIDE2KTtcblxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbHNlIHtcblxuXHRcdFx0XHRcdFx0Y3R4LmZpbGxUZXh0KGZyYW1lLm9uZS50b1N0cmluZygpLCBsZWZ0ICsgNSwgY2VsbFRvcCArIDE2KTtcblxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKGZyYW1lLnR3byAhPSBudWxsKSB7XG5cblx0XHRcdFx0XHQvLyBEcmF3IHRoZSBsaXR0bGUgc2NvcmUgb24gdGhlIHJpZ2h0IG9yIC8gb3IgWFxuXHRcdFx0XHRcdGN0eC5mb250ID0gXCIxNHB4IEFyaWFsXCI7XG5cdFx0XHRcdFx0aWYgKGZyYW1lLm9uZSArIGZyYW1lLnR3byA9PT0gMTApIHtcblx0XHRcdFx0XHRcdGN0eC5maWxsVGV4dCgnLycsIGxpdHRsZUxlZnQgKyAyLCBjZWxsVG9wICsgMTIpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbHNlIGlmIChmcmFtZS50d28gPT09IDApIHtcblx0XHRcdFx0XHRcdGN0eC5maWxsVGV4dCgnLScsIGxpdHRsZUxlZnQgKyAyLCBjZWxsVG9wICsgMTIpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbHNlIHtcblxuXHRcdFx0XHRcdFx0Y3R4LmZpbGxUZXh0KGZyYW1lLnR3by50b1N0cmluZygpLCBsaXR0bGVMZWZ0ICsgMiwgY2VsbFRvcCArIDEyKTtcblxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cblxuXHRcdFx0Ly8gRHJhdyB0aGUgdG90YWwgc2NvcmUgc28gZmFyXG5cdFx0XHRjdHguZm9udCA9IFwiMTZweCBBcmlhbFwiO1xuXHRcdFx0Ly9cdGlmKGZyYW1lLnNjb3JlKSB7XG5cdFx0XHRpZiAoZnJhbWUuaXNGaW5hbCkge1xuXG5cdFx0XHRcdGN0eC5maWxsVGV4dChmcmFtZS5zY29yZS50b1N0cmluZygpLCBsZWZ0ICsgNSwgY2VsbFRvcCArIDMyKTtcblx0XHRcdH1cblxuXHRcdH1cblxuXG5cdH1cblxufVxuIiwiLypnbG9iYWwgR2FtZSovXG5HYW1lLlRlc3RDaXJjbGUgPSBjbGFzcyBUZXN0Q2lyY2xle1xuICAgIFxuICAgIGNvbnN0cnVjdG9yKGNfeCwgY195LCByYWRpdXMpe1xuICAgICAgICBcbiAgICAgICAgdGhpcy5yYWRpdXMgPSByYWRpdXM7XG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgdGhpcy5jb2xvciA9IFwieWVsbG93XCI7XG4gICAgICAgIFxuICAgICAgICB0aGlzLmJvZHkgPSBuZXcgR2FtZS5Cb2R5KHt4OiBjX3gsIHk6IGNfeX0sIHt4OiAwLCB5OiAwfSwgMTUwKTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuYm9keS5jcmVhdGVHZW9tZXRyeSgnY2lyY2xlJywge3JhZGl1czogdGhpcy5yYWRpdXN9KTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuYm9keS5zZXRDb2xsaXNpb25Hcm91cHMoWydiYWxscyddKTtcbiAgICAgICAgXG4gICAgICAgIEdhbWUucGh5c2ljcy5hZGRNZW1iZXIodGhpcyk7XG4gICAgICAgIFxuICAgICAgICBHYW1lLnBoeXNpY3MuYWRkVG9Hcm91cCgnYmFsbHMnLCB0aGlzKTtcbiAgICAgICAgXG4gICAgICAgIFxuICAgIH1cbiAgICBcbiAgICBcblxuICAgIHVwZGF0ZShkZWx0YSl7XG4gICAgICAgIFxuICAgICAgICB0aGlzLmJvZHkudXBkYXRlKGRlbHRhKTtcbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIFxuICAgIGRyYXcoY3R4KXtcbiAgICAgICAgXG4gICAgICAgIC8vIERyYXcgdGhlIGNpcmNsZVxuICAgICAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgICAgIGN0eC5hcmModGhpcy5ib2R5LnBvcy54LCB0aGlzLmJvZHkucG9zLnksIHRoaXMucmFkaXVzLCAwLCBNYXRoLlBJKjIpO1xuICAgICAgICBjdHguZmlsbFN0eWxlID0gdGhpcy5jb2xvcjtcbiAgICAgICAgY3R4LmZpbGwoKTtcbiAgICAgICAgY3R4LmNsb3NlUGF0aCgpO1xuICAgICAgICBcbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIFxufSIsIlwidXNlIHN0cmljdFwiO1xuY2xhc3MgQW5pbWF0aW9ue1xuICAgIFxuICAgIGNvbnN0cnVjdG9yKHNwcml0ZXNoZWV0LCBmcmFtZXMsIGFuaW1hdGlvblRpbWUpe1xuICAgICAgICBcbiAgICAgICAgdGhpcy5jdXJyZW50SW5kZXggPSAwO1xuICAgICAgICB0aGlzLmZyYW1lVGltZSA9IGFuaW1hdGlvblRpbWUgLyBmcmFtZXMubGVuZ3RoO1xuICAgICAgICB0aGlzLmZyYW1lcyA9IGZyYW1lcztcbiAgICAgICAgdGhpcy5zcHJpdGVzaGVldCA9IHNwcml0ZXNoZWV0O1xuICAgICAgICB0aGlzLndpZHRoID0gc3ByaXRlc2hlZXQudGlsZVdpZHRoO1xuICAgICAgICB0aGlzLmhlaWdodCA9IHNwcml0ZXNoZWV0LnRpbGVIZWlnaHQ7XG4gICAgICAgIHRoaXMudGltZVNpbmNlTGFzdEZyYW1lQ2hhbmdlID0gMDtcblxuICAgICAgICBjb25zb2xlLmxvZygnQW5pbWF0aW9uIGZyYW1lIHRpbWUnLCB0aGlzLmZyYW1lVGltZSk7XG4gICAgICAgIFxuICAgIH1cbiAgICBcbiAgICB1cGRhdGUoZGVsdGEpe1xuICAgICAgICBcbiAgICAgICAgdGhpcy50aW1lU2luY2VMYXN0RnJhbWVDaGFuZ2UgKz0gZGVsdGE7XG5cbiAgICAgICAgaWYodGhpcy50aW1lU2luY2VMYXN0RnJhbWVDaGFuZ2UgPj0gdGhpcy5mcmFtZVRpbWUpe1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZih0aGlzLmN1cnJlbnRJbmRleCA9PT0gdGhpcy5mcmFtZXMubGVuZ3RoIC0gMSl7XG4gICAgICAgICAgICAgICAgLy8gV2UgYXJlIG9uIHRoZSBsYXN0IGZyYW1lIHNvIGdvIHRvIDAgaW5kZXhcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRJbmRleCA9IDA7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNle1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudEluZGV4ICsrO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBSZXNldCB0aGUgZnJhbWUgdGltZXIgdG8gMFxuICAgICAgICAgICAgdGhpcy50aW1lU2luY2VMYXN0RnJhbWVDaGFuZ2UgPSAwO1xuICAgICAgICAgICAgXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgXG4gICAgfVxuICAgIFxuICAgIHJlbmRlcihjdHgsIHgsIHkpe1xuICAgICAgICBcbiAgICAgICAgdGhpcy5zcHJpdGVzaGVldC5yZW5kZXIoY3R4LCB4LCB5LCB0aGlzLmZyYW1lc1t0aGlzLmN1cnJlbnRJbmRleF0pO1xuICAgICAgICBcbiAgICB9XG4gICAgXG59OyIsIi8qZ2xvYmFsIEdhbWUqL1xuR2FtZS5Cb2R5ID0gY2xhc3MgQm9keSB7XG5cbiAgICBjb25zdHJ1Y3Rvcihwb3MsIHZlbCwgbWFzcywgdHlwZSkge1xuXG4gICAgICAgIHRoaXMucG9zID0gcG9zO1xuICAgICAgICB0aGlzLnZlbCA9IHZlbDtcbiAgICAgICAgdGhpcy5hY2MgPSB7XG4gICAgICAgICAgICB4OiAwLFxuICAgICAgICAgICAgeTogMFxuICAgICAgICB9O1xuXG4gICAgICAgIFxuICAgICAgICB0aGlzLmFuZ3VsYXJWZWwgPSAwO1xuICAgICAgICB0aGlzLmFuZ3VsYXJBY2MgPSAwO1xuXG4gICAgICAgIHRoaXMuYW5nbGUgPSAwO1xuICAgICAgICB0aGlzLm1hc3MgPSBtYXNzO1xuXG4gICAgICAgIHRoaXMubWF4U3BlZWQgPSBudWxsO1xuXG4gICAgICAgIHRoaXMudHlwZSA9IHR5cGU7XG5cbiAgICAgICAgdGhpcy5yb3RhdGlvbmFsRGFtcGluZyA9IDA7XG5cbiAgICAgICAgdGhpcy5mcmljdGlvbiA9IDA7XG4gICAgICAgIFxuICAgICAgICAvLyBCb2R5IHR5cGUgZmxhZ3NcbiAgICAgICAgdGhpcy5maXhlZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLmlzQm91bmN5Q29sbGlkeSA9IHRydWU7XG5cblxuICAgICAgICAvLyBKdXN0IHRvIGF2b2lkIGVycm9ycyB3aGVuIG5vdCBhc3MtaWduZWRcbiAgICAgICAgdGhpcy5vbkNvbGxpZGVkID0gKCkgPT4ge307XG4gICAgfVxuXG5cbiAgICAvLyBDcmVhdGUgdGhlIGdlb21ldHJ5XG4gICAgY3JlYXRlR2VvbWV0cnkodHlwZSwgY29uZmlnKSB7XG5cbiAgICAgICAgLy8gSWYgb2YgdHlwZSBjaXJjbGVcbiAgICAgICAgaWYgKHR5cGUudG9Mb3dlckNhc2UoKSA9PT0gJ2NpcmNsZScpIHtcblxuICAgICAgICAgICAgdGhpcy5nZW9tZXRyeSA9IG5ldyBHYW1lLkNpcmNsZSh0aGlzLnBvcy54LCB0aGlzLnBvcy55LCBjb25maWcucmFkaXVzKTtcblxuICAgICAgICB9XG4gICAgICAgIC8vIEVsc2UgaWYgb2YgdHlwZSByZWN0YW5nbGVcbiAgICAgICAgZWxzZSBpZiAodHlwZS50b0xvd2VyQ2FzZSgpID09PSAncmVjdGFuZ2xlJykge1xuXG4gICAgICAgICAgICB0aGlzLmdlb21ldHJ5ID0gbmV3IEdhbWUuUmVjdGFuZ2xlKHRoaXMucG9zLngsIHRoaXMucG9zLnksIGNvbmZpZy53aWR0aCwgY29uZmlnLmhlaWdodCwgY29uZmlnLmNvbG9yKTtcblxuXG4gICAgICAgIH1cblxuICAgIH1cblxuXG4gICAgLy8gQ2hlY2sgaWYgdGhlIGJvZHkgaW50ZXJzZWN0cyBhbm90aGVyIGJvZHkoc28gaGF3dClcbiAgICBpbnRlcnNlY3RzKGJvZHkpIHtcblxuICAgICAgICByZXR1cm4gR2FtZS5Db2xsaXNpb24uaW50ZXJzZWN0cyh0aGlzLmdlb21ldHJ5LCBib2R5Lmdlb21ldHJ5KTtcblxuICAgIH1cblxuXG4gICAgLy8gU2V0IHRoZSBjb2xsaXNpb24gZ3JvdXBcbiAgICBzZXRDb2xsaXNpb25Hcm91cHMoZ3JvdXBzKSB7XG5cbiAgICAgICAgdGhpcy5jb2xsaWRlc1dpdGggPSBncm91cHM7XG5cbiAgICB9XG5cblxuICAgIC8vIFVwZGF0ZXMgdGhlIHBvc2l0aW9uL3ZlbG9jaXR5IGlmIGFjY2VsZXJhdGlvblxuICAgIHVwZGF0ZShkZWx0YSkge1xuXG4gICAgICAgIC8vIEFjY2VsZXJhdGUgdGhlIGJvZHkncyByb3RhdGlvblxuICAgICAgICB0aGlzLmFuZ3VsYXJWZWwgKz0gdGhpcy5hbmd1bGFyQWNjO1xuXG4gICAgICAgIC8vIFJvdGF0ZSB0aGUgYm9keVxuICAgICAgICB0aGlzLmFuZ2xlICs9IHRoaXMuYW5ndWxhclZlbDtcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICBpZih0aGlzLmFuZ2xlID49IE1hdGguUEkgKiAyKVxuICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLmFuZ2xlID0gdGhpcy5hbmdsZSAtIE1hdGguUEkgKiAyO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYodGhpcy5hbmdsZSA8PSAwKVxuICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLmFuZ2xlID0gdGhpcy5hbmdsZSArIE1hdGguUEkgKiAyO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgLy8gQWNjZWxlcmF0ZSB0aGUgYm9keVxuICAgICAgICB0aGlzLnZlbC54ICs9IHRoaXMuYWNjLng7XG4gICAgICAgIHRoaXMudmVsLnkgKz0gdGhpcy5hY2MueTtcblxuICAgICAgICAvLyBjb25zb2xlLmxvZygnQm9keSB1cGRhdGUnLCB0aGlzLnZlbCk7XG4gICAgICAgIHRoaXMucG9zLnggKz0gdGhpcy52ZWwueDtcbiAgICAgICAgdGhpcy5wb3MueSArPSB0aGlzLnZlbC55O1xuXG4gICAgICAgIHRoaXMuZ2VvbWV0cnkuc2V0UG9zaXRpb24odGhpcy5wb3MpO1xuICAgICAgICBcbiAgICAgICAgdGhpcy5kYW1waW5nKCk7XG4gICAgICAgIHRoaXMuYWNjb3VudEZvckZyaWN0aW9uKCk7XG5cbiAgICB9XG4gICAgXG4gICAgXG4gICAgXG4gICAgYWNjb3VudEZvckZyaWN0aW9uKCl7XG4gICAgICAgIFxuICAgICAgICBpZih0aGlzLnZlbC54IDwgMCl7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMudmVsLnggKz0gdGhpcy5mcmljdGlvbjtcbiAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgICAgIGVsc2V7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMudmVsLnggLT0gdGhpcy5mcmljdGlvbjtcbiAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZih0aGlzLnZlbC55IDwgMCl7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMudmVsLnkgKz0gdGhpcy5mcmljdGlvbjtcbiAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgICAgIGVsc2V7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMudmVsLnkgLT0gdGhpcy5mcmljdGlvbjtcbiAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgaWYodGhpcy52ZWwueCA+PSAtdGhpcy5mcmljdGlvbiAmJiB0aGlzLnZlbC54IDw9IHRoaXMuZnJpY3Rpb24pe1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB0aGlzLnZlbC54ID0gMDtcbiAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZih0aGlzLnZlbC55ID49IC10aGlzLmZyaWN0aW9uICYmIHRoaXMudmVsLnkgPD0gdGhpcy5mcmljdGlvbil7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMudmVsLnkgPSAwO1xuICAgICAgICAgICAgXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgfVxuXG4gICAgXG4gICAgZGFtcGluZygpIHtcbiAgICAgICAgXG4gICAgICAgIC8vIERlY3JlYXNlIGFuZ3VsYXIgdmVsb2NpdHkgYmFzZWQgb24gZGlyZWN0aW9uXG4gICAgICAgIGlmKHRoaXMuYW5ndWxhclZlbCA8IDApe1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB0aGlzLmFuZ3VsYXJWZWwgKz0gdGhpcy5yb3RhdGlvbmFsRGFtcGluZztcbiAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgICAgIGVsc2V7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMuYW5ndWxhclZlbCAtPSB0aGlzLnJvdGF0aW9uYWxEYW1waW5nO1xuICAgICAgICAgICAgXG4gICAgICAgIH1cbiAgICAgICAgLy8gY29uc29sZS5sb2codGhpcy5hbmd1bGFyVmVsKTtcbiAgICAgICAgXG4gICAgICAgIC8vIEFjY291bnQgZm9yIHZhbHVlcyBjbG9zZSB0byB6ZXJvXG4gICAgICAgIGlmKHRoaXMuYW5ndWxhclZlbCA+PSAtdGhpcy5yb3RhdGlvbmFsRGFtcGluZyAmJiB0aGlzLmFuZ3VsYXJWZWwgPD0gdGhpcy5yb3RhdGlvbmFsRGFtcGluZyl7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdBbG1vc3QgemVybycpO1xuICAgICAgICAgICAgdGhpcy5hbmd1bGFyVmVsID0gMDtcbiAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gU2V0IHBvc2l0aW9uXG4gICAgc2V0UG9zaXRpb24ocG9zKSB7XG5cbiAgICAgICAgdGhpcy5wb3MgPSBwb3M7XG4gICAgICAgIHRoaXMuZ2VvbWV0cnkuc2V0UG9zaXRpb24ocG9zKTtcblxuICAgIH1cblxuICAgIC8vIFNldCB0aGUgYm9keSB2ZWxvY2l0eVxuICAgIHNldFZlbG9jaXR5KHZlbCkge1xuXG4gICAgICAgIGlmICh0aGlzLm1heFNwZWVkICE9PSBudWxsKSB7XG5cbiAgICAgICAgICAgIC8vIE1hZ25pdHVkZSBzcXVhcmVkXG4gICAgICAgICAgICBsZXQgbWFnbml0dWRlU3F1YXJlZCA9ICh2ZWwueCAqIHZlbC54ICsgdmVsLnkgKiB2ZWwueSk7XG5cbiAgICAgICAgICAgIGlmIChtYWduaXR1ZGVTcXVhcmVkID4gdGhpcy5tYXhTcGVlZCAqIHRoaXMubWF4U3BlZWQpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIlZlbG9jaXR5IE1BWCBQT1dFUlwiKTtcblxuICAgICAgICAgICAgICAgIC8vIE5vcm1hbGl6ZSB2ZWN0b3JcbiAgICAgICAgICAgICAgICB2ZWwgPSBHYW1lLk1hdGhlbWF0aWNzLm5vcm1hbGl6ZVZlY3Rvcih2ZWwpO1xuXG4gICAgICAgICAgICAgICAgLy8gU2V0IG5ldyB2ZWxvY2l0eVxuICAgICAgICAgICAgICAgIHZlbC54ID0gdGhpcy5tYXhTcGVlZCAqIHZlbC54O1xuICAgICAgICAgICAgICAgIHZlbC55ID0gdGhpcy5tYXhTcGVlZCAqIHZlbC55O1xuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMudmVsID0gdmVsO1xuXG4gICAgfVxuXG5cbiAgICAvLyBEYXQgbWFzc1xuICAgIHNldE1hc3MobWFzcykge1xuICAgICAgICB0aGlzLm1hc3MgPSBtYXNzO1xuICAgIH1cbn07IiwiLypnbG9iYWwgR2FtZSovXG5HYW1lLkJvZHlUeXBlcyA9IHtcbiAgICBDSVJDTEU6IDAsXG4gICAgUkVDVEFOR0xFOiAxLFxufTsiLCIvKmdsb2JhbCBHYW1lKi9cbkdhbWUuQ2lyY2xlID0gY2xhc3MgQ2lyY2xle1xuICAgIFxuICAgIGNvbnN0cnVjdG9yKGNfeCwgY195LCByYWRpdXMpe1xuICAgICAgICBcbiAgICAgICAgdGhpcy54ID0gY194O1xuICAgICAgICB0aGlzLnkgPSBjX3k7XG4gICAgICAgIHRoaXMucmFkaXVzID0gcmFkaXVzO1xuICAgICAgICB0aGlzLnR5cGUgPSBHYW1lLkJvZHlUeXBlcy5DSVJDTEU7XG4gICAgICAgIFxuICAgIH1cbiAgICBcbiAgICBcbiAgICBzZXRQb3NpdGlvbihwb3Mpe1xuICAgICAgICBcbiAgICAgICAgdGhpcy54ID0gcG9zLng7XG4gICAgICAgIHRoaXMueSA9IHBvcy55O1xuICAgIH1cbiAgICBcbiAgICBcbiAgICBkcmF3KGN0eCwgaW1hZ2Upe1xuICAgICAgICBcbiAgICAgICAgaWYoaW1hZ2Upe1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBjdHguZHJhd0ltYWdlKGltYWdlLCB0aGlzLnggLSB0aGlzLnJhZGl1cywgdGhpcy55IC0gdGhpcy5yYWRpdXMpO1xuICAgICAgICAgICAgXG4gICAgICAgIH1cbiAgICAgICAgZWxzZXtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICAgICAgY3R4LmFyYyh0aGlzLngsIHRoaXMueSwgdGhpcy5yYWRpdXMsIDAsIE1hdGguUEkqMik7XG4gICAgICAgICAgICBjdHguZmlsbCgpO1xuICAgICAgICAgICAgY3R4LmNsb3NlUGF0aCgpO1xuICAgICAgICAgICAgXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIFxuICAgIGNvbnRhaW5zKHBvaW50KXtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBHYW1lLkNvbGxpc2lvbi5jb250YWluc0NpcmNsZSh0aGlzLCBwb2ludCk7XG4gICAgICAgIFxuICAgIH1cbiAgICBcbiAgICBcbiAgICBpbnRlcnNlY3RzKG9iail7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gR2FtZS5Db2xsaXNpb24uaW50ZXJzZWN0cyhvYmosIHRoaXMpO1xuXG4gICAgfVxuICAgIFxufTsiLCIvKmdsb2JhbCBHYW1lKi9cblxuR2FtZS5Db2xsaXNpb24gPSBjbGFzcyBDb2xsaXNpb25cbntcbiAgICBcbiAgICBzdGF0aWMgaW50ZXJzZWN0cyhvYmoxLCBvYmoyKXtcbiAgICAgICAgXG4gICAgICAvLyAgY29uc29sZS5sb2coJ0NoZWNraW5nIGludGVyc2VjdCcsIG9iajEsIG9iajIpO1xuICAgICAgICBcbiAgICAgICAgaWYob2JqMS50eXBlID09PSBHYW1lLkJvZHlUeXBlcy5DSVJDTEUpe1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZihvYmoyLnR5cGUgPT09IEdhbWUuQm9keVR5cGVzLkNJUkNMRSl7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgcmV0dXJuIEdhbWUuQ29sbGlzaW9uLmludGVyc2VjdENpcmNsZXMob2JqMSwgb2JqMik7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmKG9iajIudHlwZSA9PT0gR2FtZS5Cb2R5VHlwZXMuUkVDVEFOR0xFKXtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICByZXR1cm4gR2FtZS5Db2xsaXNpb24uaW50ZXJzZWN0UmVjdEFuZENpcmNsZShvYmoyLCBvYmoxKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2V7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2codHlwZW9mKG9iajEpLCAnaW50ZXJzZWN0aW5nJywgdHlwZW9mKG9iajIpLCAnaXMgbm90IHN1cHBvcnRlZCcpO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcblxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZihvYmoyLnR5cGUgPT09IEdhbWUuQm9keVR5cGVzLkNJUkNMRSl7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmKG9iajEudHlwZSA9PT0gR2FtZS5Cb2R5VHlwZXMuUkVDVEFOR0xFKXtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICByZXR1cm4gR2FtZS5Db2xsaXNpb24uaW50ZXJzZWN0UmVjdEFuZENpcmNsZShvYmoxLCBvYmoyKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2V7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2codHlwZW9mKG9iajEpLCAnaW50ZXJzZWN0aW5nJywgdHlwZW9mKG9iajIpLCAnaXMgbm90IHN1cHBvcnRlZCcpO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgICAgIGVsc2V7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHR5cGVvZihvYmoxKSwgJ2ludGVyc2VjdGluZycsIHR5cGVvZihvYmoyKSwgJ2lzIG5vdCBzdXBwb3J0ZWQnKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgICAgIFxuICAgIH1cbiAgICBcbiAgICBcbiAgICBzdGF0aWMgaW50ZXJzZWN0UmVjdHMocmVjdDEsIHJlY3QyKVxuICAgIHtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiByZWN0MS5sZWZ0IDw9IHJlY3QyLnJpZ2h0ICYmXG4gICAgICAgICAgICByZWN0Mi5sZWZ0IDw9IHJlY3QxLnJpZ2h0ICYmXG4gICAgICAgICAgICByZWN0MS50b3AgPD0gcmVjdDIuYm90dG9tICYmXG4gICAgICAgICAgICByZWN0Mi50b3AgPD0gcmVjdDEuYm90dG9tO1xuICAgICAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIHN0YXRpYyBpbnRlcnNlY3RDaXJjbGVzKGNhLCBjYilcbiAgICB7XG4gICAgICAgLy8gY29uc29sZS5sb2coY2EsIGNiKTtcbiAgICAgICAgIC8vIFRoZSB4IGRpc3RhbmNlIGJldHdlZW4gdGhlIDIgcG9pbnRzXG4gICAgICAgIHZhciBkeCA9IGNhLnggLSBjYi54O1xuICAgICAgICBcbiAgICAgICAgLy8gVGhlIHkgZGlzdGFuY2UgYmV0d2VlbiB0aGUgMiBwb2ludHNcbiAgICAgICAgdmFyIGR5ID0gY2EueSAtIGNiLnk7XG4gICAgICAgIFxuICAgICAgICAvLyBUaGUgc3VtIG9mIHRoZSBjaXJjbGUgcmFkaWlcbiAgICAgICAgdmFyIGRyID0gY2EucmFkaXVzICsgY2IucmFkaXVzO1xuICAgICAgICBcbiAgICAgICAgLy8gQ29tcGFyZSB0aGUgdHdvIGRpc3RhbmNlcy4gSWYgdGhlIGRpc3RhbmNlIGJldHdlZW4gdGhlIHR3byBwb2ludHMgXG4gICAgICAgIC8vIGlzIGxlc3MgdGhhbiB0aGUgc3VtIG9mIHRoZSByYWRpaSB0aGVuIHRoZSBjaXJjbGVzIG11c3QgaW50ZXJzZWN0LlxuICAgICAgICByZXR1cm4gZHgqZHggKyBkeSpkeSA8PSBkcipkcjtcbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIFxuICAgIHN0YXRpYyBpbnRlcnNlY3RSZWN0QW5kQ2lyY2xlKHJlY3QsIGNpcmNsZSlcbiAgICB7XG4gICAgICAgIC8vIEhvcml6b250YWwgZGlzdGFuY2UgYmV0d2VlbiB0aGUgY2lyY2xlIGNlbnRlciBhbmQgcmVjdCBjZW50ZXJcbiAgICAgICAgbGV0IGRpc3RhbmNlWCA9IE1hdGguYWJzKGNpcmNsZS54IC0gcmVjdC54IC0gKHJlY3Qud2lkdGgvMikpO1xuICAgICAgICBcbiAgICAgICAgLy8gVmVydGljYWwgZGlzdGFuY2UgYmV0d2VlbiB0aGUgY2lyY2xlIGNlbnRlciBhbmQgcmVjdCBjZW50ZXJcbiAgICAgICAgbGV0IGRpc3RhbmNlWSA9IE1hdGguYWJzKGNpcmNsZS55IC0gcmVjdC55IC0gKHJlY3QuaGVpZ2h0LzIpKTtcbiAgICBcbiAgICBcbiAgICAgICAgLy8gSWYgdGhlIGRpc3RhbmNlIGlzIGdyZWF0ZXIgdGhhbiBoYWxmIGNpcmNsZSBcbiAgICAgICAgLy8gKyBoYWxmIHRoZSB3aWR0aCBvZiBoYWxmIHJlY3QsIFxuICAgICAgICAvLyB0aGVuIHRoZXkgYXJlIHRvbyBmYXIgYXBhcnQgdG8gYmUgY29sbGlkaW5nXG4gICAgICAgIGlmIChkaXN0YW5jZVggPiAoKHJlY3Qud2lkdGgpLzIgKyBjaXJjbGUucmFkaXVzKSkgXG4gICAgICAgIHsgXG4gICAgICAgICAgICAvLyBSZXR1cm4gZmFsc2VcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8gSWYgdGhlIGRpc3RhbmNlIGlzIGdyZWF0ZXIgdGhhbiBhbmNob3JzIGhhbGYgY2lyY2xlXG4gICAgICAgIC8vICsgaGFsZiB0aGUgaGVpZ2h0IG9mIGhhbGYgcmVjdCwgXG4gICAgICAgIC8vIHRoZW4gdGhleSBhcmUgdG9vIGZhciBhcGFydCB0byBiZSBjb2xsaWRpbmdcbiAgICAgICAgaWYgKGRpc3RhbmNlWSA+ICgocmVjdC5oZWlnaHQpLzIgKyBjaXJjbGUucmFkaXVzKSkgXG4gICAgICAgIHsgXG4gICAgICAgICAgICAvLyBSZXR1cm4gZmFsc2VcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTsgXG4gICAgICAgICAgICBcbiAgICAgICAgfVxuICAgIFxuICAgICAgICAvLyBJZiB0aGUgaG9yaXpvbnRhbCBkaXN0YW5jZSBpcyBsZXNzIHRoYW4gb3IgZXF1YWwgdG8gaGFsZlxuICAgICAgICAvLyB0aGUgd2lkdGggb2YgaGFsZiByZWN0IHRoZW4gdGhleSBhcmUgY29sbGlkaW5nIFxuICAgICAgICBpZiAoZGlzdGFuY2VYIDw9ICgocmVjdC53aWR0aCkvMikpIFxuICAgICAgICB7IFxuICAgICAgICAgICAgLy8gUmV0dXJuIHRydWVcbiAgICAgICAgICAgIHJldHVybiB0cnVlOyBcbiAgICAgICAgfSBcbiAgICAgICAgXG4gICAgICAgIC8vIElmIHRoZSB2ZXJ0aWNhbCBkaXN0YW5jZSBpcyBsZXNzIHRoYW4gb3IgZXF1YWwgdG8gaGFsZlxuICAgICAgICAvLyB0aGUgaGVpZ2h0IG9mIGhhbGYgcmVjdCB0aGVuIHRoZXkgYXJlIGNvbGxpZGluZyBcbiAgICAgICAgaWYgKGRpc3RhbmNlWSA8PSAoKHJlY3QuaGVpZ2h0KS8yKSkgXG4gICAgICAgIHsgXG4gICAgICAgICAgICAvLyBSZXR1cm4gdHJ1ZVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7IFxuICAgICAgICB9XG4gICAgXG4gICAgXG4gICAgXG4gICAgICAgIC8qIFRoaXMgaXMgZm9yIHRlc3RpbmcgdGhlIGNvbGxpc2lvbiBhdCB0aGUgaW1hZ2UocmVjdCkgY29ybmVycyAqL1xuICAgICAgICBcbiAgICAgICAgLy8gVGhpbmsgb2YgYSBsaW5lIGZyb20gdGhlIHJlY3QgY2VudGVyIHRvIGFueSByZWN0IGNvcm5lci5cbiAgICAgICAgLy8gTm93IGV4dGVuZCB0aGF0IGxpbmUgYnkgdGhlIHJhZGl1cyBvZiB0aGUgY2lyY2xlLlxuICAgICAgICAvLyBJZiB0aGUgY2lyY2xlIGNlbnRlciBpcyBvbiB0aGF0IGxpbmUgdGhlblxuICAgICAgICAvLyB0aGV5IGFyZSBjb2xsaWRpbmcgYXQgZXhhY3RseSB0aGF0IHJlY3QgY29ybmVyLlxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIC8vIFRoZSBob3Jpem9udGFsIGRpc3RhbmNlIGJldHdlZW4gdGhlIGNpcmNsZSBhbmQgcmVjdFxuICAgICAgICAvLyBtaW51cyBoYWxmIHRoZSB3aWR0aCBvZiB0aGUgcmVjdFxuICAgICAgICBsZXQgZHggPSBkaXN0YW5jZVggLSAocmVjdC53aWR0aCkvMjtcbiAgICAgICAgXG4gICAgICAgIC8vIFRoZSB2ZXJ0aWNhbCBkaXN0YW5jZSBiZXR3ZWVuIHRoZSBjaXJjbGUgYW5kIHJlY3RcbiAgICAgICAgLy8gbWludXMgaGFsZiB0aGUgaGVpZ2h0IG9mIHRoZSByZWN0XG4gICAgICAgIGxldCBkeSA9IGRpc3RhbmNlWSAtIChyZWN0LmhlaWdodCkvMjtcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICAvLyBVc2UgUHl0aGFnb3JhcyBmb3JtdWxhIHRvIGNvbXBhcmUgdGhlIGRpc3RhbmNlIGJldHdlZW4gY2lyY2xlIGFuZCByZWN0IGNlbnRlcnMuXG4gICAgICAgIHJldHVybiAoZHggKiBkeCArIGR5ICogZHkgPD0gKGNpcmNsZS5yYWRpdXMgKiBjaXJjbGUucmFkaXVzKSk7XG4gICAgICAgIFxuICAgIH1cbiAgICBcbiAgICBcbiAgICBzdGF0aWMgY29udGFpbnNSZWN0KHJlY3QsIHBvaW50KVxuICAgIHtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiAocG9pbnQueCA8PSByZWN0LnJpZ2h0ICYmIFxuICAgICAgICAgICAgICAgIHBvaW50LnggPj0gcmVjdC54ICYmXG4gICAgICAgICAgICAgICAgcG9pbnQueSA+PSByZWN0LnkgJiYgXG4gICAgICAgICAgICAgICAgcG9pbnQueSA8PSByZWN0LmJvdHRvbSk7XG4gICAgICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgXG4gICAgc3RhdGljIGNvbnRhaW5zQ2lyY2xlKGNpcmNsZSwgcG9pbnQpXG4gICAge1xuICAgICAgICBcbiAgICAgICAgbGV0IGR4ID0gY2lyY2xlLnggLSBwb2ludC54O1xuICAgICAgICBsZXQgZHkgPSBjaXJjbGUueSAtIHBvaW50Lnk7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gZHggKiBkeCArIGR5ICogZHkgPD0gY2lyY2xlLnJhZGl1cyAqIGNpcmNsZS5yYWRpdXM7XG4gICAgICAgIFxuICAgIH1cbiAgICBcbn07IiwiLypnbG9iYWwgR2FtZSovXG5HYW1lLklucHV0ID0gY2xhc3MgSW5wdXR7XG4gICAgXG4gICAgY29uc3RydWN0b3IoKXtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuY2FsbGJhY2tzID0ge307XG4gICAgfVxuICAgIFxuICAgIC8qXG4gICAgICogRnVuY3Rpb24gdGhhdCByZXR1cm5zIHRoZSBtb3VzZXMgcG9zaXRpb24uXG4gICAgICogSXQgdGFrZXMgaW50byBhY2NvdW50IHRoZSBzaXplL3Bvc2l0aW9uIG9mIHRoZSBjYW52YXMgYW5kIHRoZSBzY2FsZSh6b29tIGluL291dCkuXG4gICAgICovXG4gICAgX21vdXNlUG9zaXRpb24oZXZlbnQpXG4gICAge1xuICAgICAgICAvLyBVc2VkIHRvIGdldCB0aGUgYWJzb2x1dGUgc2l6ZVxuICAgICAgICBsZXQgcmVjdCA9IHRoaXMucGFyZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICBcbiAgICAgICAgLyogcmVsYXRpb25zaGlwIGJpdG1hcCB2cyBlbGVtZW50IGZvciBYL1kgKi9cbiAgICAgICAgXG4gICAgICAgIC8vIEdldHMgdGhlIHggc2NhbGVcbiAgICAgICAgbGV0IHNjYWxlWCA9IHRoaXMucGFyZW50LndpZHRoIC8gcmVjdC53aWR0aDtcbiAgICAgICAgXG4gICAgICAgIC8vIEdldHMgdGhlIHkgc2NhbGVcbiAgICAgICAgbGV0IHNjYWxlWSA9IHRoaXMucGFyZW50LmhlaWdodCAvIHJlY3QuaGVpZ2h0O1xuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIC8vIFJldHVybnMgdHdvIHBvc3NpYmxlIHZhbHVlc1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgLy8gTW91c2UgeCBwb3NpdGlvbiBhZnRlciB0YWtpbmcgaW50byBhY2NvdW50IHRoZSBzaXplL3Bvc2l0aW9uIG9mIGNhbnZhcyBhbmQgc2NhbGVcbiAgICAgICAgICAgIHg6IChldmVudC5jbGllbnRYIC0gcmVjdC5sZWZ0KSAqIHNjYWxlWCxcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gTW91c2UgeSBwb3NpdGlvbiBhZnRlciB0YWtpbmcgaW50byBhY2NvdW50IHRoZSBzaXplL3Bvc2l0aW9uIG9mIGNhbnZhcyBhbmQgc2NhbGVcbiAgICAgICAgICAgIHk6IChldmVudC5jbGllbnRZIC0gcmVjdC50b3ApICogc2NhbGVZXG4gICAgICAgICAgICBcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIFxuICAgIGFkZENhbGxiYWNrKHR5cGUsIGNiKXtcbiAgICAgICAgXG4gICAgICAgIGlmKCF0aGlzLmNhbGxiYWNrc1t0eXBlXSkgdGhpcy5jYWxsYmFja3NbdHlwZV0gPSBbXTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuY2FsbGJhY2tzW3R5cGVdLnB1c2goY2IpO1xuXG4gICAgfVxuICAgIFxuICAgIFxuICAgIF9yZWFjdCh0eXBlLCBldmVudCl7XG4gICAgICAgIFxuICAgICAgICB2YXIgcG9zID0gdGhpcy5fbW91c2VQb3NpdGlvbihldmVudCk7XG4gICAgICAgIFxuICAgICAgICBmb3IodmFyIGkgaW4gdGhpcy5jYWxsYmFja3NbdHlwZV0pe1xuXG4gICAgICAgICAgICB0aGlzLmNhbGxiYWNrc1t0eXBlXVtpXShwb3MpO1xuICAgICAgICAgICAgXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIGxpc3RlbihwYXJlbnQpe1xuICAgICAgICBcbiAgICAgICAgdGhpcy5wYXJlbnQgPSBwYXJlbnQ7XG4gICAgICAgIFxuICAgICAgICBmb3IodmFyIHR5cGUgaW4gdGhpcy5jYWxsYmFja3Mpe1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZih0aGlzLmNhbGxiYWNrc1t0eXBlXS5sZW5ndGggPiAwKXtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudFt0eXBlXSA9IGZ1bmN0aW9uKHR5cGUpe1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGV2ZW50KXtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fcmVhY3QodHlwZSwgZXZlbnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIH0odHlwZSkuYmluZCh0aGlzKTtcblxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIFxuICAgIGNsZWFyKCl7XG4gICAgICAgIFxuICAgICAgICBmb3IobGV0IHR5cGUgaW4gdGhpcy5jYWxsYmFja3Mpe1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB0aGlzLnBhcmVudFt0eXBlXSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgICAgIFxuICAgIH1cbiAgICBcbn07IiwiLypnbG9iYWwgR2FtZSovXG5HYW1lLk1hdGhlbWF0aWNzID0gY2xhc3MgTWF0aGVtYXRpY3Mge1xuICAgIFxuICAgIHN0YXRpYyBub3JtYWxpemVWZWN0b3IodmVjdG9yKVxuICAgIHtcbiAgICAgICAgLy8gQXJjIHRhbiB3aWxsIGdpdmUgeW91IHRoZSBhbmdsZVxuICAgICAgICBsZXQgYW5nbGUgPSBNYXRoLmF0YW4yKHZlY3Rvci55LCB2ZWN0b3IueCk7XG4gICAgICAgIFxuICAgICAgICAvLyBXaWxsIGdpdmUgbnVtYmVyIGZvcm0gMCB0byAxXG4gICAgICAgIGxldCB4ID0gTWF0aC5jb3MoYW5nbGUpO1xuICAgICAgICBsZXQgeSA9IE1hdGguc2luKGFuZ2xlKTtcbiAgICAgICAgXG4gICAgICAgIC8vIFNldCB0aGUgbmV3IHZlY3RvclxuICAgICAgICB2ZWN0b3IueCA9IHg7XG4gICAgICAgIHZlY3Rvci55ID0geTtcbiAgICAgICAgXG4gICAgICAgIC8vIFJldHVybiB0aGUgdmVjdG9yXG4gICAgICAgIHJldHVybiB2ZWN0b3I7XG4gICAgfVxuICAgIFxuICAgIFxuICAgIC8qXG4gICAgICogIFJldHVybiB0aGUgZG90IHByb2R1Y3QgZm9yIDJkIGFuZCAzZCB2ZWN0b3JzXG4gICAgICovXG4gICAgc3RhdGljIGRvdCh2ZWN0b3JBLCB2ZWN0b3JCKXtcblxuICAgIFx0aWYoIXZlY3RvckEueikgdmVjdG9yQS56ID0gMDtcbiAgICBcdGlmKCF2ZWN0b3JCLnopIHZlY3RvckIueiA9IDA7XG4gICAgICAgIFxuICAgICAgICBsZXQgc3VtID0gMDtcbiAgICAgICAgXG4gICAgICAgIHN1bSArPSB2ZWN0b3JBLnggKiB2ZWN0b3JCLng7XG4gICAgICAgIHN1bSArPSB2ZWN0b3JBLnkgKiB2ZWN0b3JCLnk7XG4gICAgICAgIHN1bSArPSB2ZWN0b3JBLnogKiB2ZWN0b3JCLno7XG4gICAgXHRcbiAgICBcdHJldHVybiBzdW07XG4gICAgICAgIFxuICAgIH1cbiAgICBcbiAgICBcbiAgICAvKlxuICAgICAqICBWZWN0b3Igc3VtXG4gICAgICovXG4gICAgc3RhdGljIHZlY3RvclN1bShBLCBCKXtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB4OiBBLnggKyBCLngsXG4gICAgICAgICAgICB5OiBBLnkgKyBCLnlcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIFxuICAgIC8qXG4gICAgICogIFJldHVybiB2ZWN0b3IgcGVycGVuZGljdWxhclxuICAgICAqL1xuICAgIHN0YXRpYyBwZXJwZW5kaWN1bGFyVmVjdG9yKHZlY3Rvcil7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgeDogLXZlY3Rvci55LFxuICAgICAgICAgICAgeTogdmVjdG9yLnhcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIFxuICAgIC8qXG4gICAgICogIFNjYWxhciBWZWN0b3IgbXVsdGlwbGljYXRpb25cbiAgICAgKi9cbiAgICBzdGF0aWMgc2NhbGFyVmVjdG9yTXVsdGkoc2NhbGFyLCB2ZWN0b3IpXG4gICAge1xuICAgICAgICByZXR1cm4ge3g6IHNjYWxhciAqIHZlY3Rvci54LCB5OiBzY2FsYXIgKiB2ZWN0b3IueX07XG4gICAgfVxuICAgIFxuICAgIFxuICAgIFxuICAgIFxuICAgIC8qXG4gICAgICogIFJldHVybnMgYSByYW5kb20gaW50ZWdlciB3aXRoaW4gW21pbiwgbWF4KVxuICAgICAqL1xuICAgIHN0YXRpYyByYW5kb21JbnQobWluLCBtYXgpe1xuICAgICAgICBcbiAgICAgICAgbWluID0gTWF0aC5jZWlsKG1pbik7XG4gICAgICAgIG1heCA9IE1hdGguZmxvb3IobWF4KTtcbiAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4pKSArIG1pbjtcbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIFxuICAgIFxuICAgIFxuICAgIC8qXG4gICAgICogIFJldHVybnMgYSByYW5kb20gaW50ZWdlciB3aXRoaW4gW21pbiwgbWF4XVxuICAgICAqL1xuICAgIHN0YXRpYyByYW5kb21JbnRJbmMobWluLCBtYXgpe1xuICAgICAgICBcbiAgICAgICAgbWluID0gTWF0aC5jZWlsKG1pbik7XG4gICAgICAgIG1heCA9IE1hdGguZmxvb3IobWF4KTtcbiAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4gKyAxKSkgKyBtaW47XG4gICAgICAgIFxuICAgIH1cbiAgICBcbiAgICBcbiAgICBcbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGFuIGFycmF5IG9mIGludGVnZXJzIGZyb20gdGhlIG1pbiB2YWwgdG8gbWF4IC0gMVxuICAgICAqL1xuICAgIHN0YXRpYyByYW5nZShtaW4sIG1heCl7XG4gICAgICAgIFxuICAgICAgICBsZXQgbCA9IFtdO1xuICAgICAgICBmb3IobGV0IGk9bWluOyBpIDwgbWF4OyBpKyspIGwucHVzaChpKTtcbiAgICAgICAgcmV0dXJuIGw7XG4gICAgICAgIFxuICAgIH1cbiAgICBcbn07IiwiLypnbG9iYWwgR2FtZSovXG5HYW1lLlBoeXNpY3MgPSBjbGFzcyBQaHlzaWNzIHtcbiAgICAvKipcbiAgICAgKiBUaGUgc2V2ZW4gc3RlcHMgdG8gMmQgZWxhc3RpYyBjb2xsaXNpb24gdXNpbmcgdmVjdG9yIG1hdGggY2FuIGJlIGZvdW5kIFxuICAgICAqIGhlcmUgLT4gaHR0cDovL3d3dy5pbWFkYS5zZHUuZGsvfnJvbGYvRWR1L0RNODE1L0UxMC8yZGNvbGxpc2lvbnMucGRmXG4gICAgICogXG4gICAgICogVGhpcyBjYXNlIGlzIGZvciBjaXJjbGVzIHNwZWNpZmljYWxseSwgYnV0IGJ5IGNoYW5naW5nIHRoZSBzdGVwIDEgZm9yIFxuICAgICAqIGRpZmZlcmVudCBnZW9tZXRyaWVzIHNob3VsZCBtYWtlIHRoaXMgbWV0aG9kIHdvcmsgZm9yIGFueXRoaW5nIDJELlxuICAgICAqIFxuICAgICAqL1xuICAgIFxuICAgIFxuICAgIFxuICAgIFxuICAgIC8qXG4gICAgICogIENhbGN1bGF0ZXMgZmluYWwgdmVsb2NpdGllcyBmb3IgMUQgZWxhc3RpYyBwYXJ0aWNsZSBjb2xsaXNpb25cbiAgICAgKi9cbiAgICBzdGF0aWMgZWxhc3RpY1BhcnRpY2xlQ29sbGlzaW9uMUQodl8xLCBtXzEsIHZfMiwgbV8yKXtcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICBsZXQgdl8xX2YgPSB2XzEgKiAoKG1fMSAtIG1fMikgLyAobV8xICsgbV8yKSkgKyBcbiAgICAgICAgICAgICAgICAgICAgdl8yICogKCgyICogbV8yICkgLyAobV8xICsgbV8yKSk7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBcbiAgICAgICAgbGV0IHZfMl9mID0gdl8xICogKCgyICogbV8xKSAvIChtXzEgKyBtXzIpKSArXG4gICAgICAgICAgICAgICAgICAgIHZfMiAqICgobV8yIC0gbV8xKSAvIChtXzEgKyBtXzIpKTtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHYxIDogdl8xX2YsXG4gICAgICAgICAgICB2MiA6IHZfMl9mLFxuICAgICAgICAgICAgXG4gICAgICAgIH07XG4gICAgICAgIFxuICAgIH1cbiAgICBcbiAgICBcbiAgICAvKlxuICAgICAqICBSZXR1cm5zIHRoZSBmaW5hbCB2ZWxvY2l0aWVzIGZvciB0d28gcGFydGljbGVzIFNMQU1NSU5HXG4gICAgICovXG4gICAgc3RhdGljIGVsYXN0aWNQYXJ0aWNsZUNvbGxpc2lvbjJEKHZfMSwgbV8xLCB2XzIsIG1fMil7XG4gICAgICAgIFxuICAgICAgICBsZXQgdl9mX3ggPSBHYW1lLlBoeXNpY3MuZWxhc3RpY1BhcnRpY2xlQ29sbGlzaW9uMUQodl8xLngsIG1fMSwgdl8yLngsIG1fMik7XG5cbiAgICAgICAgbGV0IHZfZl95ID0gR2FtZS5QaHlzaWNzLmVsYXN0aWNQYXJ0aWNsZUNvbGxpc2lvbjFEKHZfMS55LCBtXzEsIHZfMi55LCBtXzIpO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdjEgOiB7XG4gICAgICAgICAgICAgICAgeDogdl9mX3gudl8xLFxuICAgICAgICAgICAgICAgIHk6IHZfZl95LnZfMSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHYyIDoge1xuICAgICAgICAgICAgICAgIHg6IHZfZl94LnZfMixcbiAgICAgICAgICAgICAgICB5OiB2X2ZfeS52XzIsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXG4gICAgICAgIH07XG4gICAgICAgIFxuICAgIH1cbiAgICBcbiAgICBcbiAgICBcbiAgICBzdGF0aWMgdW5pdE5vcm1hbFZlY3RvckNpcmNsZShjZW50ZXIxLCBjZW50ZXIyKVxuICAgIHtcbiAgICAgICAgaWYoY2VudGVyMS54ID09PSB1bmRlZmluZWQgfHwgY2VudGVyMi54ID09PSB1bmRlZmluZWQgfHwgY2VudGVyMS55ID09PSB1bmRlZmluZWQgfHwgY2VudGVyMi55ID09PSB1bmRlZmluZWQpXG4gICAgICAgIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhyb3cgRXJyb3IoXCJGQUlMRUQ6IGNlbnRlci54IG9yIGNlbnRlci55IHVuZGVmaW5lZFwiKTtcbiAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBsZXQgZHggPSBjZW50ZXIxLnggLSBjZW50ZXIyLng7XG4gICAgICAgIGxldCBkeSA9IGNlbnRlcjEueSAtIGNlbnRlcjIueTtcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIEdhbWUuTWF0aGVtYXRpY3Mubm9ybWFsaXplVmVjdG9yKHt4OiBkeCwgeTogZHl9KTtcbiAgICB9XG5cbiAgICBcbiAgICBcbiAgICBcbiAgICBzdGF0aWMgQ2lyY2xlc0NvbGxpc2lvbih2MSwgYzEsIG0xLCB2MiwgYzIsIG0yKXtcbiAgICAgICAgXG4gICAgICAgIC8vIEdldCB1bml0IG5vcm1hbCB2ZWN0b3IgYmV0d2VlbiAyIGNpcmNsZXNcbiAgICAgICAgbGV0IHVuaXROb3JtYWwgPSBHYW1lLlBoeXNpY3MudW5pdE5vcm1hbFZlY3RvckNpcmNsZShjMSwgYzIpO1xuICAgICAgICBsZXQgdW5pdFRhbmdlbnQgPSBHYW1lLk1hdGhlbWF0aWNzLnBlcnBlbmRpY3VsYXJWZWN0b3IodW5pdE5vcm1hbCk7XG4gICAgICAgIFxuICAgICAgICBsZXQgdjFuID0gR2FtZS5NYXRoZW1hdGljcy5kb3QodW5pdE5vcm1hbCwgdjEpO1xuICAgICAgICBsZXQgdjF0ID0gR2FtZS5NYXRoZW1hdGljcy5kb3QodW5pdFRhbmdlbnQsIHYxKTtcbiAgICAgICAgXG4gICAgICAgIGxldCB2Mm4gPSBHYW1lLk1hdGhlbWF0aWNzLmRvdCh1bml0Tm9ybWFsLCB2Mik7XG4gICAgICAgIGxldCB2MnQgPSBHYW1lLk1hdGhlbWF0aWNzLmRvdCh1bml0VGFuZ2VudCwgdjIpO1xuICAgICAgICBcbiAgICAgICAgbGV0IHZmbiA9IEdhbWUuUGh5c2ljcy5lbGFzdGljUGFydGljbGVDb2xsaXNpb24xRCh2MW4sIG0xLCB2Mm4sIG0yKTtcbiAgICAgICAgXG4gICAgICAgIGxldCB2ZjFuID0gR2FtZS5NYXRoZW1hdGljcy5zY2FsYXJWZWN0b3JNdWx0aSh2Zm4udjEsIHVuaXROb3JtYWwpO1xuICAgICAgICBsZXQgdmYybiA9IEdhbWUuTWF0aGVtYXRpY3Muc2NhbGFyVmVjdG9yTXVsdGkodmZuLnYyLCB1bml0Tm9ybWFsKTtcbiAgICAgICAgbGV0IHZmMXQgPSBHYW1lLk1hdGhlbWF0aWNzLnNjYWxhclZlY3Rvck11bHRpKHYxdCwgdW5pdFRhbmdlbnQpO1xuICAgICAgICBsZXQgdmYydCA9IEdhbWUuTWF0aGVtYXRpY3Muc2NhbGFyVmVjdG9yTXVsdGkodjJ0LCB1bml0VGFuZ2VudCk7XG4gICAgICAgIFxuICAgICAgICBsZXQgdmYxID0gR2FtZS5NYXRoZW1hdGljcy52ZWN0b3JTdW0odmYxbiwgdmYxdCk7XG4gICAgICAgIGxldCB2ZjIgPSBHYW1lLk1hdGhlbWF0aWNzLnZlY3RvclN1bSh2ZjJuLCB2ZjJ0KTtcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHYxOiB2ZjEsXG4gICAgICAgICAgICB2MjogdmYyLFxuICAgICAgICB9O1xuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgXG4gICAgXG4gICAgc3RhdGljIENpcmNsZVJlY3RDb2xsaXNpb24oYywgcil7XG4gICAgICAgIFxuICAgICAgICAvLyBEbyB0aGluZ3NcbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIFxuICAgIFxuICAgIHN0YXRpYyBDb2xsaXNpb24oQSwgQil7XG4gICAgICAgIFxuICAgICAgICBpZihBLmJvZHkudHlwZSA9PT0gR2FtZS5Cb2R5VHlwZXMuQ0lSQ0xFICYmIEIuYm9keS50eXBlID09PSBHYW1lLkJvZHlUeXBlcy5DSVJDTEUpe1xuICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4gR2FtZS5QaHlzaWNzLkNpcmNsZXNDb2xsaXNpb24oQS5ib2R5LnZlbCwgQS5ib2R5LnBvcywgQS5ib2R5Lm1hc3MsIEIuYm9keS52ZWwsIEIuYm9keS5wb3MsIEIuYm9keS5tYXNzKTtcbiAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYoQS5ib2R5LnR5cGUgPT09IEdhbWUuQm9keVR5cGVzLlJFQ1RBTkdMRSAmJiBCLmJvZHkudHlwZSA9PT0gR2FtZS5Cb2R5VHlwZXMuUkVDVEFOR0xFKXtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY29uc29sZS5sb2coJ1JlY3QgdG8gUmVjdCwgbW9mbycpO1xuXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGVsc2UgaWYoQS5ib2R5LnR5cGUgPT09IEdhbWUuQm9keVR5cGVzLlJFQ1RBTkdMRSAmJiBCLmJvZHkudHlwZSA9PT0gR2FtZS5Cb2R5VHlwZXMuQ0lSQ0xFKXtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY29uc29sZS5sb2coJ1JlY3QgdG8gQ2lyY2xlLCBtb2ZvJyk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdjE6IHtcblxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdjI6IHtcbiAgICAgICAgICAgICAgICAgICAgeDogLUIuYm9keS52ZWwueCxcbiAgICAgICAgICAgICAgICAgICAgeTogQi5ib2R5LnZlbC55XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYoQS5ib2R5LnR5cGUgPT09IEdhbWUuQm9keVR5cGVzLkNJUkNMRSAmJiBCLmJvZHkudHlwZSA9PT0gR2FtZS5Cb2R5VHlwZXMuUkVDVEFOR0xFKXtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY29uc29sZS5sb2coJ0NpcmNsZSB0byBSZWN0LCBtb2ZvJyk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdjE6IHtcbiAgICAgICAgICAgICAgICAgICAgeDogLUEuYm9keS52ZWwueCxcbiAgICAgICAgICAgICAgICAgICAgeTogQS5ib2R5LnZlbC55XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB2Mjoge1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgXG4gICAgfVxuICAgIFxufTsiLCIvKmdsb2JhbCBHYW1lKi9cbkdhbWUuUGh5c2ljc01hbmFnZXIgPSBjbGFzcyBQaHlzaWNzTWFuYWdlciB7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcblxuICAgICAgICB0aGlzLm1lbWJlcnMgPSBbXG4gICAgICAgICAgICAvLyB7XG4gICAgICAgICAgICAvLyAgICAgY29sbGlkZXNXaXRoOiBbJ2JhbGxzJywgJ3BpbnMnXSxcbiAgICAgICAgICAgIC8vIH0gICAgXG4gICAgICAgIF07XG5cbiAgICAgICAgdGhpcy5jb2xsaXNpb25Hcm91cHMgPSB7XG5cbiAgICAgICAgfTtcblxuICAgIH1cblxuXG4gICAgYWRkVG9Hcm91cChncm91cE5hbWUsIG1lbWJlcikge1xuXG4gICAgICAgIC8vIENyZWF0ZSB0aGUgZ3JvdXAgaWYgaXQgZG9lc24ndCBleGlzdFxuICAgICAgICBpZiAoIXRoaXMuY29sbGlzaW9uR3JvdXBzW2dyb3VwTmFtZV0pIHRoaXMuY29sbGlzaW9uR3JvdXBzW2dyb3VwTmFtZV0gPSBbXTtcblxuICAgICAgICB0aGlzLmNvbGxpc2lvbkdyb3Vwc1tncm91cE5hbWVdLnB1c2gobWVtYmVyKTtcblxuICAgICAgICBjb25zb2xlLmxvZyhncm91cE5hbWUpO1xuXG4gICAgfVxuXG5cblxuXG4gICAgYWRkTWVtYmVyKG1lbWJlcikge1xuXG4gICAgICAgIG1lbWJlci5jb2xsaXNpb25JbmRleCA9IHRoaXMubWVtYmVycy5sZW5ndGg7XG5cbiAgICAgICAgdGhpcy5tZW1iZXJzLnB1c2gobWVtYmVyKTtcblxuICAgICAgICBjb25zb2xlLmxvZyhcIkFkZGVkIG1lbWJlclwiKTtcbiAgICAgICAgY29uc29sZS5sb2cobWVtYmVyKTtcbiAgICB9XG5cblxuXG4gICAgdXBkYXRlKGRlbHRhKSB7XG5cbiAgICAgICAgdGhpcy5hbHJlYWR5Q29sbGlkZWQgPSB7fTtcblxuICAgICAgICAvLyBMb29wIHRocm91Z2ggZGVtIG1lbWJlcnNcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLm1lbWJlcnMubGVuZ3RoOyBpKyspIHtcblxuICAgICAgICAgICAgLy8gQ3VycmVudCBtZW1iZXIgYXQgaW5kZXggaVxuICAgICAgICAgICAgbGV0IG1lbWJlciA9IHRoaXMubWVtYmVyc1tpXTtcblxuICAgICAgICAgICAgLy8gTG9vcCB0aHJvdWdoIHRoZSBncm91cHMgdGhhdCB0aGUgbWVtYmVyIGNvbGxpZGVzIHdpdGhcbiAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgbWVtYmVyLmJvZHkuY29sbGlkZXNXaXRoLmxlbmd0aDsgaisrKSB7XG5cbiAgICAgICAgICAgICAgICAvLyBBcnJheSBvZiBtZW1iZXJzIG9mIHRoZSBncm91cFxuICAgICAgICAgICAgICAgIGxldCBncm91cCA9IHRoaXMuY29sbGlzaW9uR3JvdXBzW21lbWJlci5ib2R5LmNvbGxpZGVzV2l0aFtqXV07XG5cbiAgICAgICAgICAgICAgICAvLyBSZXR1cm4gdGhlIGluZGV4IHRoYXQgdGhlIG1lbWJlciBjb2xsaWRlcyB3aXRoLlxuICAgICAgICAgICAgICAgIGxldCBjb2xsaXNpb25JbmRleCA9IC0xO1xuXG5cbiAgICAgICAgICAgICAgICAvLyBDaGVjayBpZiBhbnkgbWVtYmVyIG9mIHRoZSBncm91cCBpbnRlcnNlY3RzIHRoZSBjdXJyZW50IG1lbWViZXJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBrID0gMDsgayA8IGdyb3VwLmxlbmd0aDsgaysrKSB7XG5cblxuICAgICAgICAgICAgICAgICAgICAvLyBIYXMgdGhpcyBtZW1iZXIgYWxyZWFkeSBjb2xsaWRlZCB3aXRoIHRoZSBvdGhlciBvYmplY3Q/XG4gICAgICAgICAgICAgICAgICAgIGxldCBoYXNBbHJlYWR5Q29sbGlkZWQgPSB0aGlzLmFscmVhZHlDb2xsaWRlZFttZW1iZXIuY29sbGlzaW9uSW5kZXhdICE9PSB1bmRlZmluZWQ7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gSXMgaXQgY29sbGlkaW5nIHdpdGggaXRzZWxmP1xuICAgICAgICAgICAgICAgICAgICBsZXQgaXNDb2xsaWRpbmdXaXRoU2VsZiA9IGdyb3VwW2tdLmJvZHkgPT09IG1lbWJlci5ib2R5O1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIENoZWNrIGZvciBjb2xsaXNpb24gaWYgaXQncyBub3QgdGhlIHNhbWUgbWVtYmVyIHdlJ3JlIGNoZWNraW5nXG4gICAgICAgICAgICAgICAgICAgIGlmICghaGFzQWxyZWFkeUNvbGxpZGVkICYmICFpc0NvbGxpZGluZ1dpdGhTZWxmICYmIEdhbWUuQ29sbGlzaW9uLmludGVyc2VjdHMoZ3JvdXBba10uYm9keS5nZW9tZXRyeSwgbWVtYmVyLmJvZHkuZ2VvbWV0cnkpKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdDb2xsaXNpb24nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbGxpc2lvbkluZGV4ID0gaztcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gU3RvcmUgdGhlIGluZGV4IG9mIHRoZSBjb2xsaWRlZCBtZW1iZXJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYWxyZWFkeUNvbGxpZGVkW2dyb3VwW2tdLmNvbGxpc2lvbkluZGV4XSA9IG1lbWJlci5jb2xsaXNpb25JbmRleDtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gQnJlYWsgZGFuY2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIH1cblxuXG4gICAgICAgICAgICAgICAgaWYgKGNvbGxpc2lvbkluZGV4ID4gLTEpIHtcblxuICAgICAgICAgICAgICAgICAgICAvLyBUaGUgY29sbGlzaW9uIG1lbWJlciBib2R5XG4gICAgICAgICAgICAgICAgICAgIGxldCBjbWIgPSBncm91cFtjb2xsaXNpb25JbmRleF0uYm9keTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBUaGUgbWVtYmVyIGJvZHlcbiAgICAgICAgICAgICAgICAgICAgbGV0IG1iID0gbWVtYmVyLmJvZHk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ0NvbGxpc2lvbiB3aXRoJywgbWVtYmVyLmJvZHkuY29sbGlkZXNXaXRoW2pdKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBHZXQgdGhlIGZpbmFsIHZlbG9jaXR5IGJldHdlZW4gdGhlIGNvbGxpZGluZyBjaXJjbGVzXG4gICAgICAgICAgICAgICAgICAgIGlmKG1iLmlzQm91bmN5Q29sbGlkeSAmJiBjbWIuaXNCb3VuY3lDb2xsaWR5KXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBmaW5hbFZlbG9jaXRpZXMgPSBHYW1lLlBoeXNpY3MuQ29sbGlzaW9uKG1lbWJlciwgZ3JvdXBbY29sbGlzaW9uSW5kZXhdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gU2V0IHRoZSB2ZWxvY2l0aWVzIG9mIHRoZSB0d28gb2JqZWN0c1xuICAgICAgICAgICAgICAgICAgICAgICAgbWIuc2V0VmVsb2NpdHkoZmluYWxWZWxvY2l0aWVzLnYxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNtYi5zZXRWZWxvY2l0eShmaW5hbFZlbG9jaXRpZXMudjIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUZW1wb3JhcnkgZmluYWwgdmVsb2NpdHkgZml4XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobWIuZml4ZWQpIG1iLnNldFZlbG9jaXR5KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB4OiAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHk6IDBcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNtYi5maXhlZCkgY21iLnNldFZlbG9jaXR5KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB4OiAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHk6IDBcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2V7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdDb2xsaXNpb24gd2l0aCBpbm5lciBndXR0ZXInLCBtYiwgY21iKTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgXG5cblxuXG4gICAgICAgICAgICAgICAgICAgIC8vIExldCB0aGUgZXZlbnQgbGlzdGVuZXJzIGtub3cgdGhhdCBhIGNvbGxpc2lvbiBoYXBwZW5lZFxuICAgICAgICAgICAgICAgICAgICBtYi5vbkNvbGxpZGVkKGdyb3VwW2NvbGxpc2lvbkluZGV4XSk7XG4gICAgICAgICAgICAgICAgICAgIGNtYi5vbkNvbGxpZGVkKG1lbWJlcik7XG5cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG5cbiAgICB9XG5cbn07IiwiLypnbG9iYWwgR2FtZSovXG5HYW1lLlJlY3RhbmdsZSA9IGNsYXNzIFJlY3RhbmdsZXtcbiAgICBcbiAgICBjb25zdHJ1Y3Rvcih4LCB5LCB3aWR0aCwgaGVpZ2h0LCBjb2xvcil7XG4gICAgICAgIFxuICAgICAgICB0aGlzLnggPSB4O1xuICAgICAgICB0aGlzLnkgPSB5O1xuICAgICAgICB0aGlzLndpZHRoID0gd2lkdGg7XG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgICAgICBcbiAgICAgICAgdGhpcy5sZWZ0ID0geDtcbiAgICAgICAgdGhpcy5yaWdodCA9IHggKyB3aWR0aDtcbiAgICAgICAgdGhpcy50b3AgPSB5O1xuICAgICAgICB0aGlzLmJvdHRvbSA9IHkgKyBoZWlnaHQ7XG4gICAgICAgIFxuICAgICAgICB0aGlzLmNvbG9yID0gY29sb3I7XG4gICAgICAgIHRoaXMudHlwZSA9IEdhbWUuQm9keVR5cGVzLlJFQ1RBTkdMRTtcbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIGNvbnRhaW5zKHBvaW50KXtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBHYW1lLkNvbGxpc2lvbi5jb250YWluc1JlY3QodGhpcywgcG9pbnQpO1xuICAgICAgICAgICAgICAgIFxuICAgIH1cbiAgICBcbiAgICBcbiAgICBpbnRlcnNlY3RzKG9iail7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gR2FtZS5Db2xsaXNpb24uaW50ZXJzZWN0cyhvYmosIHRoaXMpO1xuICAgIH1cbiAgICBcbiAgICBcbiAgICBkcmF3KGN0eCwgaW1hZ2Upe1xuICAgICAgICBcbiAgICAgICAgLy8gRHJhdyB0aGUgcmVjdFxuICAgICAgICBpZihpbWFnZSl7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGN0eC5kcmF3SW1hZ2UoaW1hZ2UsIHRoaXMueCAtIHRoaXMucmFkaXVzLCB0aGlzLnkgLSB0aGlzLnJhZGl1cyk7XG4gICAgICAgICAgICBcbiAgICAgICAgfVxuICAgICAgICBlbHNle1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgICAgICAgICBjdHgucmVjdCh0aGlzLngsIHRoaXMueSwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xuICAgICAgICAgICAgY3R4LmZpbGxTdHlsZSA9IHRoaXMuY29sb3I7XG4gICAgICAgICAgICBjdHguZmlsbCgpO1xuICAgICAgICAgICAgY3R4LmNsb3NlUGF0aCgpO1xuICAgICAgICAgICAgXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgfVxuICAgIFxufTsiLCIvKmdsb2JhbCBHYW1lKi9cbmNsYXNzIFNwcml0ZXNoZWV0e1xuICAgIFxuICAgIGNvbnN0cnVjdG9yKHRleHR1cmUsIHRpbGVXaWR0aCwgdGlsZUhlaWdodCwgdGlsZVBhZGRpbmcpe1xuICAgICAgICBcbiAgICAgICAgdGhpcy50ZXh0dXJlID0gdGV4dHVyZTtcbiAgICAgICAgdGhpcy5zcHJpdGVQb3NpdGlvbnMgPSBbXTtcbiAgICAgICAgdGhpcy50aWxlV2lkdGggPSB0aWxlV2lkdGg7XG4gICAgICAgIHRoaXMudGlsZUhlaWdodCA9IHRpbGVIZWlnaHQ7XG4gICAgICAgIHRoaXMudGlsZVBhZGRpbmcgPSB0aWxlUGFkZGluZztcbiAgICAgICAgXG4gICAgICAgIHRoaXMuY2FsY3VsYXRlUG9zaXRpb25zKCk7XG4gICAgICAgIFxuICAgIH1cbiAgICBcbiAgICBcbiAgICAvKipcbiAgICAgKiBDYWxjdWxhdGUgdGhlIHggYW5kIHkgcG9zaXRpb25zIG9mIGVhY2ggb2YgdGhlIHRpbGVzIGluIHRoZSBzcHJpdGVzaGVldC5cbiAgICAgKi9cbiAgICBjYWxjdWxhdGVQb3NpdGlvbnMoKXtcbiAgICAgICAgXG4gICAgICAgIGxldCBudW1YID0gTWF0aC5mbG9vcih0aGlzLnRleHR1cmUud2lkdGggLyB0aGlzLnRpbGVXaWR0aCk7XG4gICAgICAgIGxldCBudW1ZID0gTWF0aC5mbG9vcih0aGlzLnRleHR1cmUuaGVpZ2h0IC8gdGhpcy50aWxlSGVpZ2h0KTtcblxuICAgICAgICBmb3IobGV0IHk9MDsgeTxudW1ZOyB5Kyspe1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBmb3IobGV0IHg9MDsgeDxudW1YOyB4Kyspe1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHRoaXMuc3ByaXRlUG9zaXRpb25zLnB1c2goW3ggKiB0aGlzLnRpbGVXaWR0aCwgeSAqIHRoaXMudGlsZUhlaWdodF0pO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgIH1cblxuICAgIH1cbiAgICBcbiAgICBcbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYW4gYW5pbWF0aW9uIGZyb20gdGhlIHN1cHBsaWVkIHNwcml0ZXNoZWV0IHRleHR1cmVcbiAgICAgKi9cbiAgICBtYWtlQW5pbWF0aW9uKG1pbiwgbWF4LCBhbmltYXRpb25UaW1lLCBiYWNrQW5kRm9ydGgpe1xuICAgICAgICBcbiAgICAgICAgLy8gR2V0IHRoZSBhcnJheSBvZiBmcmFtZXMgYmV0d2VlbiBtaW4gYW5kIG1heFxuICAgICAgICBsZXQgaW5kZXhlcyA9IEdhbWUuTWF0aGVtYXRpY3MucmFuZ2UobWluLCBtYXgpO1xuICAgICAgICBcbiAgICAgICAgLy8gQWRkIHRoZSByZXZlcnNlZCBhcnJheSBtaW51cyBzdGFydCBhbmQgZW5kIHRvIHRoZSBhcnJheSBvZiBmcmFtZXNcbiAgICAgICAgaWYoYmFja0FuZEZvcnRoKSBpbmRleGVzID0gaW5kZXhlcy5jb25jYXQoR2FtZS5NYXRoZW1hdGljcy5yYW5nZShtaW4gKyAxLCBtYXggLSAxKS5yZXZlcnNlKCkpO1xuICAgICAgICBcbiAgICAgICAgLy8gUmV0dXJuIGFuIGFuaW1hdGlvbiBvYmplY3RcbiAgICAgICAgcmV0dXJuIG5ldyBBbmltYXRpb24odGhpcywgaW5kZXhlcywgYW5pbWF0aW9uVGltZSk7XG4gICAgICAgIFxuICAgIH1cbiAgICBcbiAgICBcbiAgICBcbiAgICAvKipcbiAgICAgKiBSZW5kZXIgZnJhbWVcbiAgICAgKi9cbiAgICByZW5kZXIoY3R4LCB4LCB5LCBpbmRleCl7XG4gICAgICAgIFxuICAgICAgICBjdHguZmlsbFN0eWxlID0gXCJibGFja1wiO1xuICAgICAgICBjdHguZmlsbFRleHQoaW5kZXgudG9TdHJpbmcoKSwgeCArIHRoaXMudGlsZVdpZHRoLzIsIHkgKyB0aGlzLnRpbGVIZWlnaHQgKyAxMCk7XG4gICAgICAgIGxldCBjbGlwcGVkUG9zID0gdGhpcy5zcHJpdGVQb3NpdGlvbnNbaW5kZXhdO1xuICAgICAgICBcbiAgICAgICAgY3R4LmRyYXdJbWFnZSh0aGlzLnRleHR1cmUsIGNsaXBwZWRQb3NbMF0sIGNsaXBwZWRQb3NbMV0sIHRoaXMudGlsZVdpZHRoLCB0aGlzLnRpbGVIZWlnaHQsIHgsIHksIHRoaXMudGlsZVdpZHRoLCB0aGlzLnRpbGVIZWlnaHQpO1xuICAgICAgICBcbiAgICB9XG4gICAgXG59OyJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
