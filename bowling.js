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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJvd2wvQmFsbC5qcyIsImJvd2wvR2FtZS5qcyIsImJvd2wvR3V0dGVyLmpzIiwiYm93bC9QaW4uanMiLCJib3dsL1Njb3JlQm9hcmQuanMiLCJib3dsL1Rlc3RDaXJjbGUuanMiLCJlbmdpbmUvQW5pbWF0aW9uLmpzIiwiZW5naW5lL0JvZHkuanMiLCJlbmdpbmUvQm9keVR5cGVzLmpzIiwiZW5naW5lL0NpcmNsZS5qcyIsImVuZ2luZS9Db2xsaXNpb24uanMiLCJlbmdpbmUvSW5wdXQuanMiLCJlbmdpbmUvTWF0aGVtYXRpY3MuanMiLCJlbmdpbmUvUGh5c2ljcy5qcyIsImVuZ2luZS9QaHlzaWNzTWFuYWdlci5qcyIsImVuZ2luZS9SZWN0YW5nbGUuanMiLCJlbmdpbmUvU3ByaXRlc2hlZXQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVRQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM5U0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzdOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDblpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNyTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDN0tBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQy9GQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbkhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDOUtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNyREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImJvd2xpbmcuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKmdsb2JhbCBHYW1lKi9cblxuY2xhc3MgQmFsbHtcbiAgICBcbiAgICBjb25zdHJ1Y3Rvcih4LCB5LCBjb2xvcil7XG4gICAgICAgIFxuICAgICAgICAvLyBDb2xvciBvZiBiYWxsXG4gICAgICAgIHRoaXMuY29sb3IgPSBjb2xvcjtcbiAgICAgICAgXG4gICAgICAgIC8vIE1hc3Mgb2YgdGhlIGJhbGxcbiAgICAgICAgdGhpcy5tYXNzID0gNy4yNSAqIDE7XG4gICAgICAgIFxuICAgICAgICAvLyBDb2xvciB3aGVuIG1vdXNlIGlzIGhvdmVyaW5nXG4gICAgICAgIHRoaXMuaG92ZXJDb2xvciA9IFwiIzE3MjAyQVwiO1xuICAgICAgICBcbiAgICAgICAgLy8gQm9vbGVhbiB0byBzZWUgaWYgdGhlIGJhbGwgaXMgcm9sbGluZ1xuICAgICAgICB0aGlzLmlzUm9sbGluZyA9IHRydWU7XG4gICAgICAgIFxuICAgICAgICAvLyBDaGVjayBpZiB0aGUgYmFsbCBpcyBoZWxkIGJ5IHRoZSBtb3VzZVxuICAgICAgICB0aGlzLmlzR3JhYmJlZCA9IGZhbHNlO1xuICAgICAgICBcbiAgICAgICAgLy8gQm9vbGVhbiBmb3Igd2hlbiB0aGUgYmFsbCBpcyBiZWluZyBob3ZlcmVkIG92ZXJcbiAgICAgICAgdGhpcy5pc0hvdmVyaW5nID0gZmFsc2U7XG4gICAgICAgIFxuICAgICAgICAvLyBBbGwgbW91c2UgaG9sZGluZyBpbmZvXG4gICAgICAgIHRoaXMuaG9sZCA9IHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcG9zaXRpb25zOiBbXSxcbiAgICAgICAgICAgIHRpbWVzOiBbXSxcbiAgICAgICAgICAgIFxuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLy8gTWFrZSBkYSBib2R5XG4gICAgICAgIHRoaXMuYm9keSA9IG5ldyBHYW1lLkJvZHkoe3g6eCwgeTp5fSwge3g6IDAsIHk6IDB9LCB0aGlzLm1hc3MsIEdhbWUuQm9keVR5cGVzLkNJUkNMRSk7XG4gICAgICAgIFxuICAgICAgICAvLyBTZXQgbWF4IHNwZWVkXG4gICAgICAgIHRoaXMuYm9keS5tYXhTcGVlZCA9IDIwO1xuICAgICAgICBcbiAgICAgICAgLy8gQ3JlYXRlIHRoZSBjaXJjbGUgZ2VvbWV0cnlcbiAgICAgICAgdGhpcy5ib2R5LmNyZWF0ZUdlb21ldHJ5KCdjaXJjbGUnLCB7cmFkaXVzOiAyMH0pO1xuICAgICAgICBcbiAgICAgICAgLy8gU2V0IHRoZSBjb2xsaXNpb24gZ3JvdXAgdG8gYmUgcGluc1xuICAgICAgICB0aGlzLmJvZHkuc2V0Q29sbGlzaW9uR3JvdXBzKFsncGlucycgLCdndXR0ZXJzJ10pO1xuICAgICAgICBcbiAgICAgICAgdGhpcy5ib2R5LmFuZ3VsYXJWZWwgPSAwLjA1O1xuICAgICAgICBcbiAgICAgICAgdGhpcy5ib2R5Lm9uQ29sbGlkZWQgPSB0aGlzLm9uQ29sbGlkZWQuYmluZCh0aGlzKTtcbiAgICAgICAgXG4gICAgICAgIC8vIEFkZCB0aGUgbWVtZWJlclxuICAgICAgICBHYW1lLnBoeXNpY3MuYWRkTWVtYmVyKHRoaXMpO1xuICAgICAgICBcbiAgICAgICAgLy8gQWRkIHRvIGJhbGxzIGdyb3VwXG4gICAgICAgIEdhbWUucGh5c2ljcy5hZGRUb0dyb3VwKCdiYWxscycsIHRoaXMpO1xuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIEdhbWUuaW5wdXQuYWRkQ2FsbGJhY2soJ29ubW91c2Vtb3ZlJywgKHBvcykgPT4ge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB0aGlzLm1vdmUocG9zKTtcbiAgICAgICAgICAgIFxuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIEdhbWUuaW5wdXQuYWRkQ2FsbGJhY2soJ29ubW91c2Vkb3duJywgKHBvcykgPT4ge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB0aGlzLmdyYWIocG9zKTtcbiAgICAgICAgICAgIC8vIHRoaXMucmVzZXQocG9zKTtcbiAgICAgICAgICAgIFxuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIEdhbWUuaW5wdXQuYWRkQ2FsbGJhY2soJ29ubW91c2V1cCcsIChwb3MpID0+IHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy5yZWxlYXNlKHBvcyk7XG4gICAgICAgICAgICBcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICBHYW1lLmlucHV0LmFkZENhbGxiYWNrKCdvbm1vdXNlbW92ZScsIChwb3MpID0+IHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy5ob3ZlckNoZWNrKHBvcyk7XG4gICAgICAgICAgICBcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgLy8gbG9hZCBpbWFnZSBmcm9tIGRhdGEgdXJsXG4gICAgICAgIHRoaXMuaW1hZ2UgPSBuZXcgSW1hZ2UoKTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuaW1hZ2Uuc3JjID0gJ2Fzc2V0cy9pbWFnZXMvYmFsbC5wbmcnO1xuICAgICAgICBcbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIFxuICAgIFxuICAgIG9uQ29sbGlkZWQobWVtYmVyKXtcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICBpZihtZW1iZXIudHlwZSA9PT0gJ2lubmVyJyl7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZihtZW1iZXIudHlwZSA9PT0gJ3JhaWwnKXtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy5ib2R5LnNldFZlbG9jaXR5KHt4OiAwLCB5OiB0aGlzLmJvZHkudmVsLnkgPCAtMC41ID8gdGhpcy5ib2R5LnZlbC55IDogLTF9KTtcbiAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgXG4gICAgdXBkYXRlKGRlbHRhKXtcbiAgICAgICAgXG4gICAgICAgIC8vIElmIHRoZSBib3dsaW5nIGJhbGwgaXMgcm9sbGluZyFcbiAgICAgICAgaWYodGhpcy5pc1JvbGxpbmcpe1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBNb3ZlIHRoZSBiYWxsXG4gICAgICAgICAgICB0aGlzLmJvZHkudXBkYXRlKGRlbHRhKTtcbiAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgICAgIFxuICAgIH1cbiAgICBcbiAgICBcbiAgICBkcmF3KGN0eCl7XG4gICAgICAgIFxuICAgICAgICAvLyBTZXQgdGhlIGNvbG9yIG9mIHRoZSBiYWxsXG4gICAgICAgIGN0eC5maWxsU3R5bGUgPSB0aGlzLmlzSG92ZXJpbmcgPyB0aGlzLmhvdmVyQ29sb3IgOiB0aGlzLmNvbG9yO1xuICAgICAgICBcbiAgICAgICAgLy8gU2F2ZSBjb250ZXh0XG4gICAgICAgIGN0eC5zYXZlKCk7XG4gICAgICAgIFxuICAgICAgICAvLyBUcmFuc2xhdGUgdGhlIGNvbnRleHQgYXJvdW5kIHJvdGF0aW9uIGNlbnRlclxuICAgICAgICBjdHgudHJhbnNsYXRlKHRoaXMuYm9keS5nZW9tZXRyeS54LCB0aGlzLmJvZHkuZ2VvbWV0cnkueSk7XG4gICAgICAgIFxuICAgICAgICAvLyBSb3RhdGUgdGhlIGNpcmNsZVxuICAgICAgICBjdHgucm90YXRlKHRoaXMuYm9keS5hbmdsZSk7XG4gICAgICAgIFxuICAgICAgICAvLyBUcmFuc2xhdGUgYmFjayB0byB3aGVyZSB3ZSB3ZXJlIGJlZm9yZVxuICAgICAgICBjdHgudHJhbnNsYXRlKC10aGlzLmJvZHkuZ2VvbWV0cnkueCwgLXRoaXMuYm9keS5nZW9tZXRyeS55KTtcbiAgICAgICAgXG4gICAgICAgIC8vIERyYXcgdGhlIGNpcmNsZVxuICAgICAgICB0aGlzLmJvZHkuZ2VvbWV0cnkuZHJhdyhjdHgsIHRoaXMuaW1hZ2UpO1xuICAgICAgICBcbiAgICAgICAgLy8gUmVzdG9yZSBjb250ZXh0XG4gICAgICAgIGN0eC5yZXN0b3JlKCk7XG4gICAgICAgIFxuICAgIH1cbiAgICBcbiAgICBcbiAgICByZWNvcmQocG9zKXtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuaG9sZC5wb3NpdGlvbnMucHVzaChwb3MpO1xuICAgICAgICB0aGlzLmhvbGQudGltZXMucHVzaChwZXJmb3JtYW5jZS5ub3coKSk7XG4gICAgICAgIFxuICAgICAgICBpZih0aGlzLmhvbGQucG9zaXRpb25zLmxlbmd0aCA+IDIwKXtcbiAgICAgICAgICAgIHRoaXMuaG9sZC5wb3NpdGlvbnMuc2hpZnQoKTtcbiAgICAgICAgICAgIHRoaXMuaG9sZC50aW1lcy5zaGlmdCgpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgIH1cbiAgICBcbiAgICBjYWxjdWxhdGVWZWxvY2l0eSgpIHtcbiAgICAgICAgXG4gICAgICAgIGxldCBwcyA9IHRoaXMuaG9sZC5wb3NpdGlvbnM7IC8vIGhvbGQgcG9zaXRpb25zXG4gICAgICAgIC8vIGxldCB0cyA9IHRoaXMuaG9sZC50aW1lczsgLy8gaG9sZCB0aW1lc1xuICAgICAgICBcbiAgICAgICAgbGV0IHN1bV94ID0gMDtcbiAgICAgICAgbGV0IHN1bV95ID0gMDtcbiAgICAgICAgXG4gICAgICAgIC8vIFRoZSBudW1iZXIgb2YgcG9pbnRzIHRvIGF2ZXJhZ2VcbiAgICAgICAgbGV0IG51bVBvaW50cyA9IDI7XG4gICAgICAgIFxuICAgICAgICBsZXQgbmV3X3BzID0gcHMuc3BsaWNlKHBzLmxlbmd0aCAtIDEgLSBudW1Qb2ludHMpO1xuICAgICAgICBmb3IodmFyIGkgPSAwOyBpIDwgbnVtUG9pbnRzOyBpKyspe1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBsZXQgbGFzdFBvc2l0aW9uID0gbmV3X3BzW2kgKyAxXTtcbiAgICAgICAgICAgIGxldCBzZWNvbmRMYXN0UG9zaXRpb24gPSBuZXdfcHNbaV07XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmKGxhc3RQb3NpdGlvbiA9PT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdUaGVyZSBpcyBubyBsYXN0IHBvc2l0aW9uLCBEaW5ndXMnLCBsYXN0UG9zaXRpb24pO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHJldHVybiB7eDogMCwgeTogMH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHN1bV94ICs9IChsYXN0UG9zaXRpb24ueCAtIHNlY29uZExhc3RQb3NpdGlvbi54KTtcbiAgICAgICAgICAgIHN1bV95ICs9IChsYXN0UG9zaXRpb24ueSAtIHNlY29uZExhc3RQb3NpdGlvbi55KTtcbiAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgbGV0IHZlbCA9IHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgeDogc3VtX3gvbnVtUG9pbnRzLFxuICAgICAgICAgICAgeTogc3VtX3kvbnVtUG9pbnRzXG4gICAgICAgICAgICBcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIGNvbnNvbGUubG9nKHZlbCk7XG4gICAgICAgIFxuICAgICAgICAvLyBUd28gcG9pbnQgZGlmZmVyZW5jZVxuICAgICAgICAvKiBsZXQgbGFzdFBvc2l0aW9uID0gcHNbcHMubGVuZ3RoIC0gMV07XG4gICAgICAgIGxldCBzZWNvbmRMYXN0UG9zaXRpb24gPSBwc1twcy5sZW5ndGggLSAyXTtcbiAgICAgICAgXG4gICAgICAgIHZlbCA9IHtcbiAgICAgICAgICAgIHg6IGxhc3RQb3NpdGlvbi54IC0gc2Vjb25kTGFzdFBvc2l0aW9uLngsXG4gICAgICAgICAgICB5OiBsYXN0UG9zaXRpb24ueSAtIHNlY29uZExhc3RQb3NpdGlvbi55XG4gICAgICAgIH07XG4gICAgICAgIGNvbnNvbGUubG9nKHZlbCk7Ki9cbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHZlbDtcbiAgICB9XG4gICAgXG4gICAgXG4gICAgZ3JhYihwb3Mpe1xuICAgIFxuICAgICAgICBpZih0aGlzLmJvZHkuZ2VvbWV0cnkuY29udGFpbnMocG9zKSl7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMuYm9keS5zZXRWZWxvY2l0eSh7eDowLCB5OjB9KTtcbiAgICAgICAgICAgIHRoaXMuaXNHcmFiYmVkID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuaG9sZC5zdGFydFRpbWUgPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgICAgICAgICAgIHRoaXMuaG9sZC5wb3NpdGlvbnMgPSBbXTtcbiAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgICAgIFxuICAgIH1cbiAgICBcbiAgICBcbiAgICBtb3ZlKHBvcyl7XG4gICAgICAgIFxuICAgICAgICBpZih0aGlzLmlzR3JhYmJlZClcbiAgICAgICAge1xuICAgICAgICAgICAgdGhpcy5yZWNvcmQocG9zKTtcbiAgICAgICAgICAgIHRoaXMuYm9keS5zZXRQb3NpdGlvbihwb3MpO1xuICAgICAgICAgICAgXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIFxuICAgIHJlbGVhc2UocG9zKXtcbiAgICAgICAgXG4gICAgICAgIGlmKHRoaXMuaXNHcmFiYmVkKXtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy5pc0dyYWJiZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuaXNSb2xsaW5nID0gdHJ1ZTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgbGV0IHYgPSB0aGlzLmNhbGN1bGF0ZVZlbG9jaXR5KCk7XG4gICAgICAgICAgICB0aGlzLmJvZHkuc2V0VmVsb2NpdHkodik7XG4gICAgICAgICAgICBcbiAgICAgICAgfVxuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgXG4gICAgaG92ZXJDaGVjayhwb3Mpe1xuICAgICAgICBcbiAgICAgICAgdGhpcy5pc0hvdmVyaW5nID0gZmFsc2U7XG4gICAgICAgIFxuICAgICAgICBpZih0aGlzLmJvZHkuZ2VvbWV0cnkuY29udGFpbnMocG9zKSl7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMuaXNIb3ZlcmluZyA9IHRydWU7XG4gICAgICAgICAgICBcbiAgICAgICAgfVxuICAgICAgICBcbiAgICB9XG4gICAgXG59IiwiLypnbG9iYWwgQmFsbCBQaW4gU2NvcmVCb2FyZCovXG5cbmxldCBHYW1lID0ge1xuICAgIFxuICAgIHN0YXJ0OiBudWxsLFxuICAgIGVuZDogbnVsbCxcbiAgICBcbiAgICBpbml0aWFsaXplOiBmdW5jdGlvbigpXG4gICAge1xuICAgICAgICAvLyBIYW5kbGVzIGlucHV0IGV2ZW50c1xuICAgICAgICB0aGlzLmlucHV0ID0gbmV3IEdhbWUuSW5wdXQoKTtcbiAgICAgICAgR2FtZS5waHlzaWNzID0gbmV3IEdhbWUuUGh5c2ljc01hbmFnZXIoKTtcbiAgICAgICAgXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIC8vIEdldCB0aGUgY2FudmFzIGFuZCBjb250ZXh0XG4gICAgICAgIHRoaXMuY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Jvd2xpbmcnKTtcbiAgICAgICAgdGhpcy5jdHggPSB0aGlzLmNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuXG4gICAgICAgIHRoaXMud2lkdGggPSA0MDA7XG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gODAwO1xuICAgICAgICBcbiAgICAgICAgLy8gQ2FudmFzIGhlaWdodCBhbmQgd2lkdGhcbiAgICAgICAgdGhpcy5jYW52YXMud2lkdGggPSB0aGlzLndpZHRoO1xuICAgICAgICB0aGlzLmNhbnZhcy5oZWlnaHQgPSB0aGlzLmhlaWdodDtcbiAgICAgICAgXG4gICAgICAgIC8vIEFycmF5IHRvIHN0b3JlIGFsbCB0aGUgcGluc1xuICAgICAgICB0aGlzLnBpbnMgPSBbXTtcbiAgICAgICAgXG4gICAgICAgIC8vIFdpZHRoIGFuZCBoZWlnaHQgb2YgcGluc1xuICAgICAgICB0aGlzLnBpbldpZHRoID0gMjA7XG4gICAgICAgIC8vIHRoaXMucGluSGVpZ2h0ID0gTWF0aC5QSSAqIHRoaXMucGluV2lkdGg7XG4gICAgICAgIHRoaXMucGluSGVpZ2h0ID0gNDY7XG4gICAgICAgIFxuICAgICAgICAvLyBCb3dsaW5nIGJhbGxcbiAgICAgICAgdGhpcy5iYWxsID0gbmV3IEJhbGwodGhpcy53aWR0aC8yLCB0aGlzLmhlaWdodCAtIDYwLCBcImJsYWNrXCIpO1xuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIHRoaXMuc2NvcmVib2FyZCA9IG5ldyBTY29yZUJvYXJkKCk7XG4gICAgICAgIFxuICAgICAgICB0aGlzLnNldFBpbnMoKTtcbiAgICAgICAgXG4gICAgICAgIFxuXG4gICAgICAgIFxuICAgICAgICB0aGlzLmxhbmUgPSBuZXcgR2FtZS5SZWN0YW5nbGUoMTEwLCAwLCAxODAsIDY1MCwgXCJyZ2JhKDE1MywgODUsIDQ1LCAxKVwiKTtcbiAgICAgICAgdGhpcy5sZWZ0R3V0dGVyID0gbmV3IEdhbWUuR3V0dGVyKDc1LCAwLCBcImxlZnRcIik7XG4gICAgICAgIHRoaXMucmlnaHRHdXR0ZXIgPSBuZXcgR2FtZS5HdXR0ZXIoMjkwLCAwLCBcInJpZ2h0XCIpO1xuICAgICAgICBcbiAgICAgICAgdGhpcy5yZXNldEJ1dHRvbiA9IG5ldyBHYW1lLlJlY3RhbmdsZSgwLCAwLCA2OCwgNTAsIFwicmdiYSgxNSwgODUsIDUsIDEpXCIpO1xuICAgICAgICB0aGlzLnJlc2V0QmFsbCA9IG5ldyBHYW1lLlJlY3RhbmdsZSgwLCA1MCwgNjgsIDUwLCBcInJnYmEoMSwgODUsIDE3NSwgMSlcIik7XG4gICAgICAgIFxuXG4gICAgICAgIHRoaXMuaW5wdXQubGlzdGVuKHRoaXMuY2FudmFzKTtcbiAgICAgIFxuICAgICAgXG4gICAgICBcbiAgICAgICAgdGhpcy5pbnB1dC5hZGRDYWxsYmFjaygnb25tb3VzZWRvd24nLCB0aGlzLmNiT25Db250YWlucyh0aGlzLnJlc2V0QnV0dG9uLCB0aGlzLnJlc2V0KSk7XG4gICAgICAgIHRoaXMuaW5wdXQuYWRkQ2FsbGJhY2soJ29ubW91c2Vkb3duJywgdGhpcy5jYk9uQ29udGFpbnModGhpcy5yZXNldEJhbGwsIHBvcyA9PiB7XG4gICAgICAgICAgICAvLyBSZXNldCBiYWxsIHZlbG9jaXR5IGFuZCBwb3NpdGlvblxuICAgICAgICAgICAgR2FtZS5iYWxsLmJvZHkuc2V0VmVsb2NpdHkoe3g6IDAsIHk6IDB9KTtcbiAgICAgICAgICAgIEdhbWUuYmFsbC5ib2R5LnNldFBvc2l0aW9uKHt4OiBHYW1lLndpZHRoLzIsIHk6IEdhbWUuaGVpZ2h0IC0gNjB9KTtcbiAgICAgICAgICAgIEdhbWUuc2NvcmVib2FyZC5hZGRTY29yZShHYW1lLnBpbnMuZmlsdGVyKChwKSA9PiB7cmV0dXJuICFwLmlzU3RhbmRpbmc7IH0pLmxlbmd0aCk7XG4gICAgICAgIH0pKTtcbiAgICAgICAgXG5cbiAgICB9LFxuICAgIFxuICAgIFxuICAgIFxuICAgIC8qKlxuICAgICAqIENoZWNrIGZvciBjb250YWlubWVudCBvbiByZWN0YW5nbGUgYW5kIGNhbGwgY2IgaWYgdHJ1ZS5cbiAgICAgKiBAcmV0dXJucyB7ZnVuY3Rpb259IGV2ZW50SGFuZGxlciAtIEV2ZW50IGhhbmRsZXIgZm9yIGRldGVybWluaW5nIGNvbGxpc2lvbi5cbiAgICAgKi9cbiAgICBjYk9uQ29udGFpbnMocmVjdCwgY2Ipe1xuICAgICAgICByZXR1cm4gKHBvcykgPT4ge1xuICAgICAgICAgICAgaWYocmVjdC5jb250YWlucyhwb3MpKXtcbiAgICAgICAgICAgICAgICBjYihwb3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH0sXG4gICAgXG4gICAgXG4gICAgdXBkYXRlOiBmdW5jdGlvbiAoZGVsdGEpXG4gICAge1xuICAgICAgICAvLyBNb3ZlIHRoZSBiYWxsXG4gICAgICAgIHRoaXMuYmFsbC51cGRhdGUoZGVsdGEpO1xuICAgICAgICBcbiAgICAgICAgZm9yKGxldCBwID0gMDsgcCA8IHRoaXMucGlucy5sZW5ndGg7IHArKylcbiAgICAgICAge1xuICAgICAgICAgICAgdGhpcy5waW5zW3BdLnVwZGF0ZShkZWx0YSk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICBHYW1lLnBoeXNpY3MudXBkYXRlKGRlbHRhKTtcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICAvLyBIYW5kbGUgcmVzZXQgbG9naWNcbiAgICAgICAgaWYoR2FtZS5iYWxsLmJvZHkucG9zLnkgPCAwKVxuICAgICAgICB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIEdhbWUuc2NvcmVib2FyZC5hZGRTY29yZShHYW1lLnBpbnMuZmlsdGVyKChwKSA9PiB7cmV0dXJuICFwLmlzU3RhbmRpbmc7IH0pLmxlbmd0aCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmKEdhbWUuc2NvcmVib2FyZC5nb1RvTmV4dEZyYW1lKXtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB0aGlzLnJlc2V0RnJhbWUoKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBHYW1lLnNjb3JlYm9hcmQuZ29Ub05leHRGcmFtZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZXtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB0aGlzLnJlc2V0Qm93bCgpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgXG4gICAgfSxcbiAgICBcbiAgICBcbiAgICBcbiAgICBkcmF3OiBmdW5jdGlvbiAoKVxuICAgIHtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9ICdsaWdodGJsdWUnO1xuICAgICAgICB0aGlzLmN0eC5maWxsUmVjdCgwLCAwLCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgdGhpcy5sYW5lLmRyYXcodGhpcy5jdHgpO1xuICAgICAgICB0aGlzLmxlZnRHdXR0ZXIuZHJhdyh0aGlzLmN0eCk7XG4gICAgICAgIHRoaXMucmlnaHRHdXR0ZXIuZHJhdyh0aGlzLmN0eCk7XG5cbiAgICAgICAgdGhpcy5yZXNldEJ1dHRvbi5kcmF3KHRoaXMuY3R4KTtcbiAgICAgICAgdGhpcy5yZXNldEJhbGwuZHJhdyh0aGlzLmN0eCk7XG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIHRoaXMuY3R4LmZvbnQgPSBcIjIwcHggQXJpYWxcIjtcbiAgICAgICAgdGhpcy5jdHguZmlsbFN0eWxlID0gXCJ5ZWxsb3dcIjtcbiAgICAgICAgdGhpcy5jdHguZmlsbFRleHQoXCJSRVNFVFwiLCAwLCAzMCk7XG4gICAgICAgIHRoaXMuY3R4LmZpbGxUZXh0KFwiQkFMTFwiLCAwLCA3NSlcbiAgICAgICAgXG4gICAgICAgIGZvcih2YXIgaSA9IHRoaXMucGlucy5sZW5ndGggLSAxOyBpID4gLTE7IGktLSl7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMucGluc1tpXS5kcmF3KHRoaXMuY3R4KTtcbiAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICB0aGlzLmJhbGwuZHJhdyh0aGlzLmN0eCk7XG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgdGhpcy5zY29yZWJvYXJkLmRyYXcoMCwgMTIwLCB0aGlzLmN0eCk7XG4gICAgICAgIFxuICAgIH0sXG4gICAgXG4gICAgXG4gICAgZ2FtZUxvb3A6IGZ1bmN0aW9uICh0aW1lc3RhbXApXG4gICAge1xuICAgICAgICBcbiAgICAgICAgLy8gU3RhcnRpbmcgdGltZXN0YW1wXG4gICAgICAgIHRoaXMuc3RhcnQgPSB0aW1lc3RhbXA7XG4gICAgICAgIFxuICAgICAgICAvLyBEZXRlcm1pbmUgdGhlIGRlbHRhIHRpbWVcbiAgICAgICAgbGV0IGRlbHRhVGltZSA9IHRoaXMuc3RhcnQgLSB0aGlzLmVuZDtcbiAgICBcdCAgICBcbiAgICBcdCAgICBcbiAgICAgICAgdGhpcy51cGRhdGUoZGVsdGFUaW1lKTtcbiAgICAgICAgdGhpcy5kcmF3KCk7XG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgLy8gRW5kaW5nIHRpbWVzdGFtcFxuICAgIFx0dGhpcy5lbmQgPSB0aW1lc3RhbXA7XG4gICAgICAgIFxuICAgICAgICAvKlxuICAgIFx0ICogVGhlIGdhbWVMb29wKCkgZnVuY3Rpb24gaXMgbm93IGdldHRpbmcgZXhlY3V0ZWQgYWdhaW4gYW5kIGFnYWluIHdpdGhpbiBhIHJlcXVlc3RBbmltYXRpb25GcmFtZSgpIGxvb3AsIFxuICAgIFx0ICogd2hlcmUgd2UgYXJlIGdpdmluZyBjb250cm9sIG9mIHRoZSBmcmFtZXJhdGUgYmFjayB0byB0aGUgYnJvd3Nlci4gXG4gICAgXHQgKiBJdCB3aWxsIHN5bmMgdGhlIGZyYW1lcmF0ZSBhY2NvcmRpbmdseSBhbmQgcmVuZGVyIHRoZSBzaGFwZXMgb25seSB3aGVuIG5lZWRlZC4gXG4gICAgXHQgKiBUaGlzIHByb2R1Y2VzIGEgbW9yZSBlZmZpY2llbnQsIHNtb290aGVyIGFuaW1hdGlvbiBsb29wIHRoYW4gdGhlIG9sZGVyIHNldEludGVydmFsKCkgbWV0aG9kLlxuICAgIFx0Ki9cbiAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMuZ2FtZUxvb3AuYmluZCh0aGlzKSk7XG4gICAgfSxcbiAgICBcbiAgICBcbiAgICByZXNldEJvd2w6IGZ1bmN0aW9uKCl7XG4gICAgICAgIFxuICAgICAgICBHYW1lLmJhbGwuYm9keS5zZXRWZWxvY2l0eSh7eDogMCwgeTogMH0pO1xuICAgICAgICBHYW1lLmJhbGwuYm9keS5zZXRQb3NpdGlvbih7eDogR2FtZS53aWR0aC8yLCB5OiBHYW1lLmhlaWdodCAtIDYwfSk7XG4gICAgICAgIC8vIEdhbWUuc2NvcmVib2FyZC5hZGRTY29yZShHYW1lLnBpbnMuZmlsdGVyKChwKSA9PiB7cmV0dXJuICFwLmlzU3RhbmRpbmc7IH0pLmxlbmd0aCk7XG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgR2FtZS5waW5zLmZvckVhY2goKHBpbikgPT4ge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZighcGluLmlzU3RhbmRpbmcpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcGluLmlzQWN0aXZlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgcGluLmJvZHkuaXNCb3VuY3lDb2xsaWR5ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgIH0sXG4gICAgXG4gICAgcmVzZXRGcmFtZTogZnVuY3Rpb24oKXtcbiAgICAgICAgXG4gICAgICAgIEdhbWUuYmFsbC5ib2R5LnNldFZlbG9jaXR5KHt4OiAwLCB5OiAwfSk7XG4gICAgICAgIEdhbWUuYmFsbC5ib2R5LnNldFBvc2l0aW9uKHt4OiBHYW1lLndpZHRoLzIsIHk6IEdhbWUuaGVpZ2h0IC0gNjB9KTtcblxuICAgICAgICB0aGlzLnJlc2V0UGlucygpO1xuICAgICAgICBcbiAgICB9LFxuICAgIFxuICAgIFxuICAgIHJlc2V0OiBmdW5jdGlvbihwb3MpXG4gICAge1xuICAgICAgICBcbiAgICAgICAgLypcbiAgICAgICAgLy8gSWYgbW91c2UgaXMgb24gcmVzZXQgYnV0dG9uXG4gICAgICAgIGlmKEdhbWUucmVzZXRCdXR0b24uY29udGFpbnMocG9zKSlcbiAgICAgICAge1xuICAgICAgICAgICAgLy8gUmVzZXQgYmFsbCB2ZWxvY2l0eSBhbmQgcG9zaXRpb25cbiAgICAgICAgICAgIEdhbWUuYmFsbC5ib2R5LnNldFZlbG9jaXR5KHt4OiAwLCB5OiAwfSk7XG4gICAgICAgICAgICBHYW1lLmJhbGwuYm9keS5zZXRQb3NpdGlvbih7eDogR2FtZS53aWR0aC8yLCB5OiBHYW1lLmhlaWdodCAtIDYwfSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBHYW1lLnJlc2V0UGlucygpO1xuICAgICAgICAgICAgXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmKEdhbWUucmVzZXRCYWxsLmNvbnRhaW5zKHBvcykpXG4gICAgICAgIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gUmVzZXQgYmFsbCB2ZWxvY2l0eSBhbmQgcG9zaXRpb25cbiAgICAgICAgICAgIEdhbWUuYmFsbC5ib2R5LnNldFZlbG9jaXR5KHt4OiAwLCB5OiAwfSk7XG4gICAgICAgICAgICBHYW1lLmJhbGwuYm9keS5zZXRQb3NpdGlvbih7eDogR2FtZS53aWR0aC8yLCB5OiBHYW1lLmhlaWdodCAtIDYwfSk7XG4gICAgICAgICAgICBHYW1lLnNjb3JlYm9hcmQuYWRkU2NvcmUoR2FtZS5waW5zLmZpbHRlcigocCkgPT4ge3JldHVybiAhcC5pc1N0YW5kaW5nOyB9KS5sZW5ndGgpO1xuICAgICAgICAgICAgXG4gICAgICAgIH1cbiAgICAgICAgKi9cbiAgICAgICAgd2luZG93LmxvY2F0aW9uLnJlbG9hZChmYWxzZSk7XG4gICAgICAgIFxuICAgICAgICBcbiAgICB9LFxuICAgIFxuICAgIHNldFBpbnM6IGZ1bmN0aW9uKClcbiAgICB7XG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgdmFyIHBpbkluUm93ID0gLTE7XG4gICAgICAgIC8vIExvb3AgdGhyb3VnaCAxMCBwaW5zXG4gICAgICAgIGZvcihsZXQgcCA9IDEwLCB5ID0gMzsgcCA+IDA7IHAtLSlcbiAgICAgICAge1xuICAgICAgICAgICAgaWYocCA9PSA0IHx8IHAgPT0gNyB8fCBwID09IDkpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcGluSW5Sb3cgPSAtMTtcbiAgICAgICAgICAgICAgICB5LS07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHBpbkluUm93ICsrO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBsZXQgZHggPSA0MDtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gUHVzaCBkYXQgcGluXG4gICAgICAgICAgICB0aGlzLnBpbnMucHVzaChuZXcgUGluKHRoaXMud2lkdGgvMiAtIHRoaXMucGluV2lkdGgvMiArICgoeSAtIDMpICogMjAgKyAocGluSW5Sb3cgKiBkeCkpLCBcbiAgICAgICAgICAgICAgICAoMjAwKSArICh5IC0gMykgKiA1MCwgXG4gICAgICAgICAgICAgICAgdGhpcy5waW5XaWR0aCwgdGhpcy5waW5IZWlnaHQpKTtcbiAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgICAgIFxuICAgIH0sXG4gICAgXG4gICAgXG4gICAgcmVzZXRQaW5zOiBmdW5jdGlvbigpXG4gICAge1xuICAgICAgICBcbiAgICAgICAgZm9yKGxldCBwIGluIEdhbWUucGlucyl7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIEdhbWUucGluc1twXS5yZXNldCgpO1xuICAgICAgICAgICAgXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgfVxuXG5cbn07XG5cblxuLypcblxuLy8gRHJhdyByZWN0IG91dGxpbmVcbmN0eC5iZWdpblBhdGgoKTtcbmN0eC5yZWN0KHgsIHksIHdpZHRoLCBoZWlnaHQpO1xuY3R4LnN0cm9rZVN0eWxlID0gXCJyZ2JhKDIsIDE4LCA4LCAxKVwiO1xuY3R4LnN0cm9rZSgpO1xuY3R4LmNsb3NlUGF0aCgpO1xuXG4vLyBEcmF3IHRleHRcbmN0eC5mb250ID0gXCIyMHB4IEFyaWFsXCI7XG5jdHguZmlsbFN0eWxlID0gXCJibGFja1wiO1xuY3R4LmZpbGxUZXh0KFwiVGV4dCBnb2VzIGhlcmVcIiwgeCwgeSk7Ki8iLCIvKmdsb2JhbCBHYW1lKi9cblxuLypcbiAqIFJhaWwgaXMgdGhlIGVkZ2Ugb2YgdGhlIGd1dHRlciwgaW5uZXIgaXMgdGhlIGd1dHRlciBpdHNlbGYuXG4gKlxuICovXG5HYW1lLkd1dHRlciA9IGNsYXNzIEd1dHRlcntcbiAgICBcbiAgICBjb25zdHJ1Y3Rvcih4LCB5LCBzaWRlKVxuICAgIHtcblxuICAgICAgICAvLyBJbmZpbml0ZSBtYXNzXG4gICAgICAgIHRoaXMubWFzcyA9IE51bWJlci5ORUdBVElWRV9JTkZJTklUWSAqIC0xO1xuICAgICAgICBcbiAgICAgICAgLy8gV2lkdGggb2YgZ3V0dGVyXG4gICAgICAgIHRoaXMuaW5uZXJXaWR0aCA9IDQwO1xuICAgICAgICBcbiAgICAgICAgLy8gV2lkdGggb2YgZWRnZVxuICAgICAgICB0aGlzLnJhaWxXaWR0aCA9IDQ7XG4gICAgICAgIFxuICAgICAgICAvLyBIZWlnaHQgb2YgbGFuZVxuICAgICAgICB0aGlzLmhlaWdodCA9IDY1MDtcbiAgICAgICAgXG4gICAgICAgIC8vIENvbG9yc1xuICAgICAgICB0aGlzLmlubmVyQ29sb3IgPSBcInJnYmEoMTU1LCAxNTUsIDE1NSwgMSlcIjtcbiAgICAgICAgdGhpcy5yYWlsQ29sb3IgPSBcInJnYmEoMTAwLCAxMDAsIDEwMCwgMSlcIjtcbiAgICAgICAgXG4gICAgICAgIC8vIElmIGxlZnQgc2lkZVxuICAgICAgICBpZihzaWRlID09PSAnbGVmdCcpe1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBNYWtlIHRoZSByZWN0c1xuICAgICAgICAgICAgdGhpcy5pbm5lciA9IG5ldyBHYW1lLlJlY3RhbmdsZSh4LCB5LCB0aGlzLmlubmVyV2lkdGgsIHRoaXMuaGVpZ2h0LCB0aGlzLmlubmVyQ29sb3IpO1xuICAgICAgICAgICAgdGhpcy5yYWlsID0gbmV3IEdhbWUuUmVjdGFuZ2xlKHgsIHksIHRoaXMucmFpbFdpZHRoLCB0aGlzLmhlaWdodCwgdGhpcy5yYWlsQ29sb3IpO1xuICAgICAgICAgICAgXG4gICAgICAgIH1cbiAgICAgICAgLy8gRWxzZSByaWdodCBzaWRlXG4gICAgICAgIGVsc2V7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIE1ha2UgdGhlIHJlY3RzXG4gICAgICAgICAgICB0aGlzLmlubmVyID0gbmV3IEdhbWUuUmVjdGFuZ2xlKHgsIHksIHRoaXMuaW5uZXJXaWR0aCwgdGhpcy5oZWlnaHQsIHRoaXMuaW5uZXJDb2xvcik7XG4gICAgICAgICAgICB0aGlzLnJhaWwgPSBuZXcgR2FtZS5SZWN0YW5nbGUoeCArIHRoaXMuaW5uZXJXaWR0aCAtIHRoaXMucmFpbFdpZHRoLCB5LCB0aGlzLnJhaWxXaWR0aCwgdGhpcy5oZWlnaHQsIHRoaXMucmFpbENvbG9yKTtcbiAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICB0aGlzLmlubmVyLnR5cGUgPSAnaW5uZXInO1xuICAgICAgICB0aGlzLnJhaWwudHlwZSA9ICdyYWlsJztcbiAgICAgICAgXG4gICAgICAgIC8vIE1ha2UgYSBib2R5IGZvciB0aGUgcmFpbFxuICAgICAgICB0aGlzLnJhaWwuYm9keSA9IG5ldyBHYW1lLkJvZHkoe3g6IHRoaXMucmFpbC54LCB5OiB0aGlzLnJhaWwueX0sIHt4OiAwLCB5OiAwfSwgdGhpcy5tYXNzLCBHYW1lLkJvZHlUeXBlcy5SRUNUQU5HTEUpO1xuICAgICAgICBcbiAgICAgICAgLy8gU2V0IGl0IHRvIGJlIGZpeGVkXG4gICAgICAgIHRoaXMucmFpbC5ib2R5LmZpeGVkID0gdHJ1ZTtcbiAgICAgICAgXG4gICAgICAgIC8vIFNldCBib2R5IGdlb21ldHJ5IHR5cGVcbiAgICAgICAgdGhpcy5yYWlsLmJvZHkuY3JlYXRlR2VvbWV0cnkoJ3JlY3RhbmdsZScsIHt3aWR0aDogdGhpcy5yYWlsLndpZHRoLCBoZWlnaHQ6IHRoaXMucmFpbC5oZWlnaHR9KTtcbiAgICAgICAgXG4gICAgICAgIC8vIENvbGxpZGUgd2l0aCBwaW5zIGFuZCBiYWxsc1xuICAgICAgICB0aGlzLnJhaWwuYm9keS5zZXRDb2xsaXNpb25Hcm91cHMoWydiYWxscycsICdwaW5zJ10pO1xuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIC8vIE1ha2UgZ3V0dGVyIGJvZHlcbiAgICAgICAgdGhpcy5pbm5lci5ib2R5ID0gbmV3IEdhbWUuQm9keSh7eDogdGhpcy5pbm5lci54LCB5OiB0aGlzLmlubmVyLnl9LCB7eDogMCwgeTogMH0sIDEwLCBHYW1lLkJvZHlUeXBlcy5SRUNUQU5HTEUpO1xuICAgICAgICB0aGlzLmlubmVyLmJvZHkuY3JlYXRlR2VvbWV0cnkoJ3JlY3RhbmdsZScsIHt3aWR0aDogdGhpcy5pbm5lci53aWR0aCAqIDIvMywgaGVpZ2h0OiB0aGlzLmlubmVyLmhlaWdodH0pO1xuICAgICAgICB0aGlzLmlubmVyLmJvZHkuaXNCb3VuY3lDb2xsaWR5ID0gZmFsc2U7XG4gICAgICAgIHRoaXMuaW5uZXIuYm9keS5zZXRDb2xsaXNpb25Hcm91cHMoWydiYWxscycsICdwaW5zJ10pO1xuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIC8vIE1ha2UgZ3V0dGVyIGEgbWVtYmVyIG9mIGd1dHRlciBncm91cFxuICAgICAgICBHYW1lLnBoeXNpY3MuYWRkVG9Hcm91cCgnZ3V0dGVycycsIHRoaXMuaW5uZXIpO1xuICAgICAgICBHYW1lLnBoeXNpY3MuYWRkVG9Hcm91cCgnZ3V0dGVycycsIHRoaXMucmFpbCk7XG4gICAgICAgIFxuICAgICAgICAvLyBBZGQgdGhlIG1lbWJlclxuICAgICAgICBHYW1lLnBoeXNpY3MuYWRkTWVtYmVyKHRoaXMucmFpbCk7XG4gICAgICAgIEdhbWUucGh5c2ljcy5hZGRNZW1iZXIodGhpcy5pbm5lcik7XG4gICAgICAgIFxuICAgIH1cbiAgICBcbiAgICBcbiAgICBcbiAgICBcbiAgICBkcmF3KGN0eClcbiAgICB7XG4gICAgICAgIHRoaXMuaW5uZXIuZHJhdyhjdHgpO1xuICAgICAgICB0aGlzLnJhaWwuZHJhdyhjdHgpO1xuICAgIH1cbiAgICBcbn07IiwiLypnbG9iYWwgR2FtZSBJbWFnZSovXG5jbGFzcyBQaW57XG4gICAgXG4gICAgY29uc3RydWN0b3IoeCwgeSwgd2lkdGgsIGhlaWdodCl7XG4gICAgICAgIFxuICAgICAgICAvLyBQb3NpdGlvbiBvZiBwaW5cbiAgICAgICAgLy8gdGhpcy5wb3MgPSB7eDp4LCB5Onl9O1xuICAgICAgICAvLyB0aGlzLnJvdGF0aW9uID0gMDtcblxuICAgICAgICB0aGlzLm1hc3MgPSAxLjUgKiAxO1xuXG4gICAgICAgIC8vIFdpZHRoIG9mIHBpblxuICAgICAgICB0aGlzLndpZHRoID0gd2lkdGg7XG4gICAgICAgIFxuICAgICAgICAvLyBIZWlnaHQgb2YgcGluXG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgICAgICBcbiAgICAgICAgLy8gQ29sbGlzaW9uIHJhZGl1c1xuICAgICAgICB0aGlzLmNvbGxpc2lvblJhZGl1cyA9IDEwO1xuICAgICAgICBcbiAgICAgICAgLy8gQ29sb3Igb2YgcGluXG4gICAgICAgIHRoaXMuY29sb3IgPSBcInJnYmEoMjU1LCAyNTUsIDI1NSwgMSlcIjtcbiAgICAgICAgXG4gICAgICAgIC8vIEJvb2xlYW4gZm9yIGNvbGxpc2lvbiByZWN0YW5nbGUgc2l6ZVxuICAgICAgICB0aGlzLmlzU3RhbmRpbmcgPSB0cnVlO1xuICAgICAgICBcbiAgICAgICAgLy8gQm9vbGVhbiBmb3IgY29sbGlzaW9uIGFuZCBkcmF3aW5nIG9mIHBpblxuICAgICAgICB0aGlzLmlzQWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuaW5pdGlhbFBvc2l0aW9uID0ge1xuICAgICAgICAgICAgeDogeCArIHRoaXMud2lkdGgvMixcbiAgICAgICAgICAgIHk6IHkgKyB0aGlzLmhlaWdodCAtIHRoaXMuY29sbGlzaW9uUmFkaXVzLFxuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIC8vIE1ha2UgZGEgYm9keVxuICAgICAgICB0aGlzLmJvZHkgPSBuZXcgR2FtZS5Cb2R5KHt4OiB4ICsgdGhpcy53aWR0aC8yLCB5OiB5ICsgdGhpcy5oZWlnaHQgLSB0aGlzLmNvbGxpc2lvblJhZGl1c30sIHt4OiAwLCB5OiAwfSwgdGhpcy5tYXNzLCBHYW1lLkJvZHlUeXBlcy5DSVJDTEUpO1xuICAgICAgICBcbiAgICAgICAgLy8gU2V0IHRoZSBtYXggc3BlZFxuICAgICAgICB0aGlzLmJvZHkubWF4U3BlZWQgPSAyMDtcbiAgICAgICAgXG4gICAgICAgIC8vIENyZWF0ZSB0aGUgY2lyY2xlIGdlb21ldHJ5IGZvciB3aGVuIHBpbiBpcyBzdGFuZGluZ1xuICAgICAgICB0aGlzLmJvZHkuY3JlYXRlR2VvbWV0cnkoJ2NpcmNsZScsIHtyYWRpdXM6IHRoaXMuY29sbGlzaW9uUmFkaXVzfSk7XG4gICAgICAgIFxuICAgICAgICAvLyBTZXQgdGhlIGNvbGxsaXNpb24gdG8gYmUgd2l0aCB0aGUgYmFsbCBhbmQgcGluc1xuICAgICAgICB0aGlzLmJvZHkuc2V0Q29sbGlzaW9uR3JvdXBzKFsnYmFsbHMnLCAncGlucycsICdndXR0ZXJzJ10pO1xuICAgICAgICBcbiAgICAgICAgLy8gQWRkIHRoZSBtZW1iZXJcbiAgICAgICAgR2FtZS5waHlzaWNzLmFkZE1lbWJlcih0aGlzKTtcbiAgICAgICAgXG4gICAgICAgIC8vIEFkZCB0byBwaW5zIGdyb3VwXG4gICAgICAgIEdhbWUucGh5c2ljcy5hZGRUb0dyb3VwKCdwaW5zJywgdGhpcyk7XG4gICAgICAgIFxuICAgICAgICB0aGlzLmJvZHkuYW5ndWxhclZlbCA9IDA7XG4gICAgIFxuICAgICAgICAvLyBsb2FkIGltYWdlIGZyb20gZGF0YSB1cmxcbiAgICAgICAgdGhpcy5pbWFnZSA9IG5ldyBJbWFnZSgpO1xuICAgICAgICBcbiAgICAgICAgdGhpcy5pbWFnZS5zcmMgPSAnYXNzZXRzL2ltYWdlcy9waW4ucG5nJztcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICB0aGlzLmJvZHkub25Db2xsaWRlZCA9IHRoaXMub25Db2xsaWRlZC5iaW5kKHRoaXMpO1xuICAgICAgICBcbiAgICAgICAgdGhpcy5ib2R5LnJvdGF0aW9uYWxEYW1waW5nID0gMC4wMDE7XG4gICAgICAgIHRoaXMuYm9keS5pbml0aWFsRnJpY3Rpb24gPSAwLjAzO1xuICAgICAgICB0aGlzLmJvZHkuZnJpY3Rpb24gPSB0aGlzLmJvZHkuaW5pdGlhbEZyaWN0aW9uO1xuICAgICAgICBcbiAgICAgICAgdGhpcy5pbml0aWFsQW5ndWxhclZlbG9jaXR5ID0gMC4yODtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuaXNJbkd1dHRlciA9IGZhbHNlO1xuICAgICAgICBcbiAgICAgXG4gICAgfVxuICAgIFxuICAgIFxuICAgIHVwZGF0ZShkZWx0YSl7XG4gICAgICAgIFxuICAgICAgICB0aGlzLmJvZHkudXBkYXRlKGRlbHRhKTtcblxuICAgIH1cbiAgICBcbiAgICBcbiAgICBcbiAgICBvbkNvbGxpZGVkKG1lbWJlcil7XG4gICAgICAgIFxuICAgICAgICB0aGlzLmJvZHkuZnJpY3Rpb24gPSB0aGlzLmJvZHkuaW5pdGlhbEZyaWN0aW9uO1xuICAgICAgICBcbiAgICAgICAgdGhpcy5pc1N0YW5kaW5nID0gZmFsc2U7XG5cbiAgICAgICAgaWYobWVtYmVyLnR5cGUgPT09ICdpbm5lcicpe1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZighdGhpcy5pc0luR3V0dGVyKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRoaXMuYm9keS5mcmljdGlvbiA9IC4yO1xuICAgICAgICAgICAgICAgIHRoaXMuYm9keS5yb3RhdGlvbmFsRGFtcGluZyA9IC4wMDE7XG4gICAgICAgICAgICAgLy8gICB0aGlzLmJvZHkuYW5ndWxhclZlbCA9IHRoaXMuYm9keS5hbmd1bGFyVmVsIDwgMCA/IC0wLjAyIDogMC4wMjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy5pc0luR3V0dGVyID0gdHJ1ZTtcblxuICAgICAgICAgICAgbGV0IHBpU2l6ZSA9IE1hdGguUEkgLyA4OyAvLyAyMi41IGRlZ3JlZXNcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIEFuZ2xlIGlzIGFyb3VuZCAwZGVnXG4gICAgICAgICAgICBpZih0aGlzLmJvZHkuYW5nbGUgPiAtcGlTaXplICYmIHRoaXMuYm9keS5hbmdsZSA8IHBpU2l6ZSl7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgdGhpcy5ib2R5LmFuZ3VsYXJWZWwgPSAwO1xuICAgICAgICAgICAgICAgIHRoaXMuYm9keS5hbmdsZSA9IDA7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBBbmdsZSBpcyBhcm91bmQgMTgwZGVnXG4gICAgICAgICAgICBlbHNlIGlmKHRoaXMuYm9keS5hbmdsZSA+IE1hdGguUEkgLSBwaVNpemUgJiYgdGhpcy5ib2R5LmFuZ2xlIDwgTWF0aC5QSSArIHBpU2l6ZSl7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgdGhpcy5ib2R5LmFuZ3VsYXJWZWwgPSAwO1xuICAgICAgICAgICAgICAgIHRoaXMuYm9keS5hbmdsZSA9IE1hdGguUEk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBpZih0aGlzLmJvZHkuYW5nbGUgPiBNYXRoLlBJLzIgJiYgdGhpcy5ib2R5LmFuZ2xlIDwgTWF0aC5QSSl7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyAgICAgdGhpcy5ib2R5LmFuZ3VsYXJWZWwgPSAtMTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIH1cbiAgICAgICAgICAgIC8vIGVsc2VcbiAgICAgICAgICAgIC8vIHtcbiAgICAgICAgICAgIC8vICAgICB0aGlzLmJvZHkuYW5ndWxhclZlbCA9IDE7XG4gICAgICAgICAgICAvLyB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIHRoaXMuYm9keS5yb3RhdGlvbmFsRGFtcGluZyA9IC4wMjtcbiAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYobWVtYmVyLmJvZHkuaXNCb3VuY3lDb2xsaWR5ICYmICF0aGlzLmlzSW5HdXR0ZXIpe1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB0aGlzLnNldFJvdGF0aW9uKCk7XG4gICAgICAgICAgICBcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYobWVtYmVyLnR5cGUgPT09ICdyYWlsJyl7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMuYm9keS5mcmljdGlvbiA9IDIwO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnUEVFRUVOTk5PT09TU1NTUycpO1xuICAgICAgICAgICAgXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIFxuICAgIHNldFJvdGF0aW9uKG1lbWJlcil7XG4gICAgICAgIFxuICAgICAgICBpZih0aGlzLmJvZHkuYW5ndWxhclZlbCA+PSAwKXtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy5ib2R5LmFuZ3VsYXJWZWwgPSAtdGhpcy5pbml0aWFsQW5ndWxhclZlbG9jaXR5O1xuICAgICAgICAgICAgXG4gICAgICAgIH1cbiAgICAgICAgZWxzZXtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy5ib2R5LmFuZ3VsYXJWZWwgPSB0aGlzLmluaXRpYWxBbmd1bGFyVmVsb2NpdHk7XG4gICAgICAgICAgICBcbiAgICAgICAgfVxuICAgICAgICBcbiAgICB9XG4gICAgXG5cbiAgICBkcmF3KGN0eCl7XG4gICAgICAgIFxuICAgICAgIC8vIGNvbnNvbGUubG9nKCdQaW4gQWN0aXZlJywgdGhpcy5ib2R5LnBvcyk7XG4gICAgICAgIGlmKHRoaXMuaXNBY3RpdmUpe1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBsZXQgZHJhd1ggPSB0aGlzLmJvZHkucG9zLnggLSB0aGlzLndpZHRoLzI7XG4gICAgICAgICAgICBsZXQgZHJhd1kgPSB0aGlzLmJvZHkucG9zLnkgLSB0aGlzLmhlaWdodCArIHRoaXMuY29sbGlzaW9uUmFkaXVzO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIFNldCB0aGUgY29sb3Igb2YgdGhlIGJhbGxcbiAgICAgICAgICAgIGN0eC5maWxsU3R5bGUgPSB0aGlzLmlzSG92ZXJpbmcgPyB0aGlzLmhvdmVyQ29sb3IgOiB0aGlzLmNvbG9yO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBTYXZlIGNvbnRleHRcbiAgICAgICAgICAgIGN0eC5zYXZlKCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIFRyYW5zbGF0ZSB0aGUgY29udGV4dCBhcm91bmQgcm90YXRpb24gY2VudGVyXG4gICAgICAgICAgICBjdHgudHJhbnNsYXRlKHRoaXMuYm9keS5nZW9tZXRyeS54LCB0aGlzLmJvZHkuZ2VvbWV0cnkueSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIFJvdGF0ZSB0aGUgY2lyY2xlXG4gICAgICAgICAgICBjdHgucm90YXRlKHRoaXMuYm9keS5hbmdsZSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIFRyYW5zbGF0ZSBiYWNrIHRvIHdoZXJlIHdlIHdlcmUgYmVmb3JlXG4gICAgICAgICAgICBjdHgudHJhbnNsYXRlKC10aGlzLmJvZHkuZ2VvbWV0cnkueCwgLXRoaXMuYm9keS5nZW9tZXRyeS55KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gdGhpcy5ib2R5Lmdlb21ldHJ5LmRyYXcoY3R4LCB0aGlzLmltYWdlKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gRHJhdyB0aGUgY2lyY2xlXG4gICAgICAgICAgICBjdHguZHJhd0ltYWdlKHRoaXMuaW1hZ2UsIGRyYXdYLCBkcmF3WSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIFJlc3RvcmUgY29udGV4dFxuICAgICAgICAgICAgY3R4LnJlc3RvcmUoKTtcblxuICAgICAgICB9XG4gICAgICAgIFxuICAgIH1cbiAgICBcbiAgICBcbiAgICByZXNldCgpe1xuICAgICAgICAgICAgICAgIFxuICAgICAgICB0aGlzLmJvZHkuc2V0VmVsb2NpdHkoe1xuICAgICAgICAgICAgeDogMCxcbiAgICAgICAgICAgIHk6IDAsXG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgdGhpcy5ib2R5LnNldFBvc2l0aW9uKEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGhpcy5pbml0aWFsUG9zaXRpb24pKSk7XG4gICAgICAgIHRoaXMuYm9keS5hbmd1bGFyVmVsID0gMDtcbiAgICAgICAgdGhpcy5ib2R5LmFuZ2xlID0gMDtcbiAgICAgICAgdGhpcy5pc0luR3V0dGVyID0gZmFsc2U7XG4gICAgICAgIHRoaXMuaXNTdGFuZGluZyA9IHRydWU7XG4gICAgICAgIHRoaXMuaXNBY3RpdmUgPSB0cnVlO1xuICAgICAgICB0aGlzLmJvZHkuaXNCb3VuY3lDb2xsaWR5ID0gdHJ1ZTtcbiAgICB9XG4gICAgXG4gICAgXG4gICAgXG59IiwiLypnbG9iYWwgR2FtZSovXG5jbGFzcyBTY29yZUJvYXJkIHtcblxuXHQvKlxuXHQgIFdlIG5lZWQgYXJyYXkgZm9yIGFjdHVhbCBzY29yZSwgYW5kIGFuIGFycmF5IGZvciB3aGF0IHNjb3JlIHRvIGRpc3BsYXkgW3RvdGFsIGZvciBmcmFtZSwgc3BhcmVzKC8pIGFuZCBzdHJpa2VzKFgpXS5cblx0ICovXG5cblx0Y29uc3RydWN0b3IoKSB7XG5cblx0XHQvLyBTdG9yZSBmcmFtZXNcblx0XHR0aGlzLmZyYW1lcyA9IFtdO1xuXG5cdFx0Ly8gQ3VycmVudCBmcmFtZVxuXHRcdHRoaXMuY3VycmVudEZyYW1lID0gMDtcblx0XHR0aGlzLnNjb3JlID0gMDtcblx0XHRcblx0XHQvLyBCb29sZWFuIGZvciB3aGVuIHRvIGNoYW5nZSBmcmFtZSBpbiBHYW1lLmpzIGZvciByZXNldGluZyBsb2dpY1xuXHRcdHRoaXMuZ29Ub05leHRGcmFtZSA9IGZhbHNlO1xuXG5cblx0XHQvLyBGaXJzdCA5IGZyYW1lc1xuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgOTsgaSsrKSB7XG5cdFx0XHQvLyBQdXNoIGVtcHR5IGFycmF5IGluIGZyYW1lc1xuXHRcdFx0dGhpcy5mcmFtZXMucHVzaCh7XG5cdFx0XHRcdG9uZTogbnVsbCxcblx0XHRcdFx0dHdvOiBudWxsLFxuXHRcdFx0XHRzY29yZTogbnVsbCxcblx0XHRcdFx0aXNGaW5hbDogZmFsc2UsXG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHQvLyBMYXN0IGZyYW1lXG5cdFx0dGhpcy5mcmFtZXMucHVzaCh7XG5cdFx0XHRvbmU6IG51bGwsXG5cdFx0XHR0d286IG51bGwsXG5cdFx0XHR0aHJlZTogbnVsbCxcblx0XHRcdHNjb3JlOiBudWxsLFxuXHRcdFx0aXNGaW5hbDogZmFsc2UsXG5cdFx0fSk7XG5cblx0fVxuXG5cblx0YWRkU2NvcmUobnVtUGlucykge1xuXG5cdFx0Ly8gRG9uJ3QgbGV0IGFuIGludmFsaWQgaW5kZXggYmUgdXNlZC5cblx0XHRpZiAodGhpcy5jdXJyZW50RnJhbWUgPj0gdGhpcy5mcmFtZXMubGVuZ3RoKSByZXR1cm47XG5cblx0XHRsZXQgZnJhbWUgPSB0aGlzLmZyYW1lc1t0aGlzLmN1cnJlbnRGcmFtZV07XG5cblxuXHRcdGlmICh0aGlzLmN1cnJlbnRGcmFtZSA9PT0gOSkge1xuXHRcdFx0dGhpcy50ZW50aEZyYW1lTG9naWMobnVtUGlucyk7XG5cdFx0fVxuXHRcdGVsc2UgaWYgKGZyYW1lLm9uZSA9PT0gbnVsbCkge1xuXHRcdFx0ZnJhbWUub25lID0gbnVtUGlucztcblx0XHR9XG5cdFx0ZWxzZSBpZiAoZnJhbWUudHdvID09PSBudWxsKSB7XG5cdFx0XHRmcmFtZS50d28gPSBudW1QaW5zIC0gZnJhbWUub25lO1xuXHRcdH1cblxuXHRcdHRoaXMuY2FsY3VsYXRlU2NvcmVzKCk7XG5cblx0XHQvLyBJZiB1c2VyIGhhcyBzY29yZWQgYSBzdHJpa2Ugb3IgZW5kIG9mIGZyYW1lXG5cdFx0aWYgKG51bVBpbnMgPT09IDEwIHx8IChmcmFtZS5vbmUgIT09IG51bGwgJiYgZnJhbWUudHdvICE9PSBudWxsKSkge1xuXHRcdFx0XG5cdFx0XHRpZiAodGhpcy5jdXJyZW50RnJhbWUgIT09IDkpIHtcblx0XHRcdFx0Ly8gSW5jcmVtZW50IGZyYW1lXG5cdFx0XHRcdHRoaXMuZ29Ub05leHRGcmFtZSA9IHRydWU7XG5cdFx0XHRcdHRoaXMuY3VycmVudEZyYW1lKys7XG5cdFx0XHRcdGNvbnNvbGUubG9nKCdnbyB0byBuZXh0IGZyYW1lLCBiaXRjaCcpO1xuXHRcdFx0fVxuXG5cdFx0fVxuXG5cdH1cblxuXHRjYWxjdWxhdGVTY29yZXMoKSB7XG5cblx0XHRmb3IgKGxldCBpID0gMDsgaSA8PSB0aGlzLmN1cnJlbnRGcmFtZTsgaSsrKSB7XG5cblx0XHRcdGxldCBmcmFtZSA9IHRoaXMuZnJhbWVzW2ldO1xuXHRcdFx0bGV0IG5leHRGcmFtZSA9IHRoaXMuZnJhbWVzW2kgKyAxXTtcblx0XHRcdGxldCBuZXh0TmV4dEZyYW1lID0gdGhpcy5mcmFtZXNbaSArIDJdO1xuXHRcdFx0Y29uc29sZS5sb2codGhpcy5jdXJyZW50RnJhbWUpO1xuXG5cdFx0XHRcblx0XHQvL1x0aWYoaSA9PT0gOSlcblx0XHQvL1x0e1xuXHRcdFx0XHRmcmFtZS5pc0ZpbmFsID0gdHJ1ZTtcblx0XHQvL1x0fVxuXG5cblx0XHRcdC8vIEdldCBhIG5vbiBtYXJrICgjKVxuXHRcdFx0aWYgKGZyYW1lLm9uZSAhPT0gMTAgJiYgKGZyYW1lLm9uZSArIGZyYW1lLnR3bykgIT09IDEwKSB7XG5cblx0XHRcdFx0Ly8gQWRkIHRoZSBzY29yZXMgdG8gdGhlIHRvdGFsIHNjb3JlXG5cdFx0XHRcdGZyYW1lLnNjb3JlID0gZnJhbWUub25lICsgZnJhbWUudHdvO1xuXG5cdFx0XHRcdGlmIChmcmFtZS50d28gIT09IG51bGwpXG5cdFx0XHRcdFx0ZnJhbWUuaXNGaW5hbCA9IHRydWU7XG5cblx0XHRcdH1cblx0XHRcdC8vIEdldCBhIHN0cmlrZVxuXHRcdFx0ZWxzZSBpZiAoZnJhbWUub25lID09PSAxMCkge1xuXG5cdFx0XHRcdC8vIElmIG9uIHRoZSAxMHRoIGZyYW1lXG5cdFx0XHRcdGlmKGkgPT09IDkpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHQvLyBBZGQgYWxsIDMgc2NvcmVzIHNpbmNlIGZpcnN0IGJvd2wgd2FzIGEgc3RyaWtlXHRcblx0XHRcdFx0XHRmcmFtZS5zY29yZSA9IGZyYW1lLm9uZSArIGZyYW1lLnR3byArIGZyYW1lLnRocmVlO1xuXHRcdFx0XHR9XG5cdFx0XHRcdC8vIElmIG9uIGZyYW1lIDl0aCBmcmFtZVxuXHRcdFx0XHRlbHNlIGlmKGkgPT09IDgpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRcblx0XHRcdFx0XHQvLyBJZiBuZXh0IGZyYW1lIHdhcyBhIHN0cmlrZVxuXHRcdFx0XHRcdGlmIChuZXh0RnJhbWUub25lID09PSAxMCkge1xuXG5cdFx0XHRcdFx0XHQvLyBJZiB5b3UndmUgdGhyb3duIHRoZSBiYWxsIHR3aWNlIG1vcmUgYWZ0ZXIgdGhlIGN1cnJlbnQgdGhyb3dcblx0XHRcdFx0XHRcdGlmIChuZXh0RnJhbWUub25lICE9PSBudWxsKSBmcmFtZS5pc0ZpbmFsID0gdHJ1ZTtcblxuXHRcdFx0XHRcdFx0Ly8gQWRkIHNjb3JlIG9mIGZyYW1lLm9uZShzdHJpa2Ugc28gMTApIGFuZCB0aGUgbmV4dCBmcmFtZXMgdG90YWxcblx0XHRcdFx0XHRcdGZyYW1lLnNjb3JlID0gZnJhbWUub25lICsgbmV4dEZyYW1lLm9uZSArIG5leHRGcmFtZS50d287XG5cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZSB7XG5cblx0XHRcdFx0XHRcdC8vIElmIHlvdSd2ZSBmaW5pc2hlZCBib3dsaW5nIGluIHRoZSBlbnRpcmUgZnJhbWUgYWhlYWQgb2YgaVxuXHRcdFx0XHRcdFx0aWYgKG5leHRGcmFtZS5vbmUgIT09IG51bGwgJiYgbmV4dEZyYW1lLnR3byAhPT0gbnVsbCkgZnJhbWUuaXNGaW5hbCA9IHRydWU7XG5cblx0XHRcdFx0XHRcdC8vIEFkZCBzY29yZSBvZiBmcmFtZS5vbmUoc3RyaWtlIHNvIDEwKSBhbmQgdGhlIG5leHQgZnJhbWVzIHRvdGFsXG5cdFx0XHRcdFx0XHRmcmFtZS5zY29yZSA9IGZyYW1lLm9uZSArIG5leHRGcmFtZS5vbmUgKyBuZXh0RnJhbWUudHdvO1xuXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFxuXHRcdFx0XHR9XG5cdFx0XHRcdC8vIElmIG9uIGZyYW1lcyAxLTh0aFxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdHtcblx0XHRcdFx0XHQvLyBJZiBuZXh0IGZyYW1lIHdhcyBhIHN0cmlrZVxuXHRcdFx0XHRcdGlmIChuZXh0RnJhbWUub25lID09PSAxMCkge1xuXG5cdFx0XHRcdFx0XHQvLyBJZiB5b3UndmUgdGhyb3duIHRoZSBiYWxsIHR3aWNlIG1vcmUgYWZ0ZXIgdGhlIGN1cnJlbnQgdGhyb3dcblx0XHRcdFx0XHRcdGlmIChuZXh0TmV4dEZyYW1lLm9uZSAhPT0gbnVsbCkgZnJhbWUuaXNGaW5hbCA9IHRydWU7XG5cblx0XHRcdFx0XHRcdC8vIEFkZCB0b3RhbCBzY29yZSBvZiB0aGUgZnJhbWUgYW5kIHRoZSBuZXh0IG5leHQgZnJhbWVzIGZpcnN0IGJvd2xcblx0XHRcdFx0XHRcdGZyYW1lLnNjb3JlID0gZnJhbWUub25lICsgbmV4dEZyYW1lLm9uZSArIG5leHRGcmFtZS50d28gKyBuZXh0TmV4dEZyYW1lLm9uZTtcblxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbHNlIHtcblxuXHRcdFx0XHRcdFx0Ly8gSWYgeW91J3ZlIGZpbmlzaGVkIGJvd2xpbmcgaW4gdGhlIGVudGlyZSBmcmFtZSBhaGVhZCBvZiBpXG5cdFx0XHRcdFx0XHRpZiAobmV4dEZyYW1lLm9uZSAhPT0gbnVsbCAmJiBuZXh0RnJhbWUudHdvICE9PSBudWxsKSBmcmFtZS5pc0ZpbmFsID0gdHJ1ZTtcblxuXHRcdFx0XHRcdFx0Ly8gQWRkIHRvdGFsIHNjb3JlIG9mIHRoZSBuZXh0IGZyYW1lXG5cdFx0XHRcdFx0XHRmcmFtZS5zY29yZSA9IGZyYW1lLm9uZSArIG5leHRGcmFtZS5vbmUgKyBuZXh0RnJhbWUudHdvO1xuXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdFxuXHRcdFx0fVxuXHRcdFx0Ly8gR2V0IGEgc3BhcmVcblx0XHRcdGVsc2UgaWYgKChmcmFtZS5vbmUgKyBmcmFtZS50d28pID09PSAxMCkge1xuXHRcdFx0XHRcblx0XHRcdFx0Ly8gSWYgb24gdGhlIDEwdGggZnJhbWVcblx0XHRcdFx0aWYoaSA9PT0gOSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdC8vIFNwYXJlIGZyb20gZmlyc3QgMiBib3dscyArIGxhc3QgYm93bFxuXHRcdFx0XHRcdGZyYW1lLnNjb3JlID0gMTAgKyBmcmFtZS50aHJlZTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdHtcblxuXHRcdFx0XHRcdC8vIEFkZCB0aGUgZmlyc3QgYm93bCBvZiB0aGUgZnJhbWVcblx0XHRcdFx0XHRmcmFtZS5zY29yZSA9IGZyYW1lLm9uZSArIGZyYW1lLnR3byArIG5leHRGcmFtZS5vbmU7XG5cblxuXHRcdFx0XHRcdGlmIChuZXh0RnJhbWUub25lICE9PSBudWxsKSBmcmFtZS5pc0ZpbmFsID0gdHJ1ZTtcblx0XHRcdFx0XHRcblx0XHRcdFx0fVxuXHRcdFx0XHRcblxuXHRcdFx0fVxuXG5cblx0XHRcdC8vIEFkZCB0aGUgcHJldmlvdXMgZnJhbWUgc2NvcmUgaWYgbm90IHRoZSBmaXJzdCBmcmFtZVxuXHRcdFx0ZnJhbWUuc2NvcmUgKz0gaSA+IDAgPyB0aGlzLmZyYW1lc1tpIC0gMV0uc2NvcmUgOiAwO1xuXHRcdFx0XG5cdFx0XHRcblxuXHRcdFx0XG5cdFx0fVxuXG5cblx0fVxuXG5cblx0dGVudGhGcmFtZUxvZ2ljKG51bVBpbnMpIHtcblx0XHQvLyBYWFgsICMvWCwgIy8jLCBYWCMsIFgjIywgWCMvXG5cblx0XHRsZXQgZnJhbWUgPSB0aGlzLmZyYW1lc1t0aGlzLmN1cnJlbnRGcmFtZV07XG5cdFx0XG5cdFx0XG5cblx0XHRpZiAoZnJhbWUub25lID09PSBudWxsKSB7XG5cdFx0XHRmcmFtZS5vbmUgPSBudW1QaW5zO1xuXHRcdH1cblx0XHRlbHNlIGlmIChmcmFtZS50d28gPT09IG51bGwpIHtcblx0XHRcdGlmIChmcmFtZS5vbmUgPT09IDEwKSB7XG5cdFx0XHRcdGZyYW1lLnR3byA9IG51bVBpbnM7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0ZnJhbWUudHdvID0gbnVtUGlucyAtIGZyYW1lLm9uZTtcblx0XHRcdH1cblxuXHRcdH1cblx0XHRlbHNlIGlmIChmcmFtZS50aHJlZSA9PT0gbnVsbCkge1xuXHRcdFx0aWYgKGZyYW1lLnR3byA9PT0gMTApIHtcblx0XHRcdFx0ZnJhbWUudGhyZWUgPSBudW1QaW5zO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZXtcblx0XHRcdFx0ZnJhbWUudGhyZWUgPSBudW1QaW5zO1xuXHRcdFx0fVxuXG5cdFx0fVxuXHRcdFxuXHRcdC8vIGRlYnVnZ2VyO1xuXHRcdGlmIChmcmFtZS5vbmUgPT09IDEwICYmIGZyYW1lLnR3byA9PT0gbnVsbCkge1xuXHRcdFx0Y29uc29sZS5sb2coJ3N0cmlrZSBmaXJzdCBmcmFtZScpO1xuXHRcdFx0dGhpcy5nb1RvTmV4dEZyYW1lID0gdHJ1ZTtcblx0XHR9XG5cdFx0ZWxzZSBpZiAoKGZyYW1lLm9uZSArIGZyYW1lLnR3bykgPT09IDEwICYmIGZyYW1lLm9uZSAhPT0gMTApIHtcblx0XHRcdGNvbnNvbGUubG9nKCdzcGFyZSBmaXJzdCBmcmFtZScpO1xuXHRcdFx0dGhpcy5nb1RvTmV4dEZyYW1lID0gdHJ1ZTtcblx0XHR9XG5cdFx0ZWxzZSBpZiAoZnJhbWUub25lID09PSAxMCAmJiBmcmFtZS50d28gPT09IDEwKSB7XG5cdFx0XHRjb25zb2xlLmxvZygnZG91YmxlIHN0cmlrZScpO1xuXHRcdFx0dGhpcy5nb1RvTmV4dEZyYW1lID0gdHJ1ZTtcblx0XHR9XG5cblx0fVxuXG5cblx0ZHJhdyhsZWZ0LCB0b3AsIGN0eCkge1xuXG5cdFx0bGV0IGNlbGxTaXplID0ge1xuXHRcdFx0dzogNDUsXG5cdFx0XHRoOiA0NVxuXHRcdH07XG5cblx0XHQvLyBCYWNrZ3JvdW5kXG5cdFx0Ly8gY3R4LmZpbGxTdHlsZSA9ICdsaWdodGdyZXknO1xuXHRcdC8vIGN0eC5maWxsUmVjdChsZWZ0LCB0b3AsIGNlbGxTaXplLncsIGNlbGxTaXplLmggKiAxMCk7XG5cblxuXHRcdGZvciAobGV0IGkgaW4gdGhpcy5mcmFtZXMpIHtcblxuXHRcdFx0bGV0IGZyYW1lID0gdGhpcy5mcmFtZXNbaV07XG5cdFx0XHRsZXQgY2VsbFRvcCA9IHRvcCArIGNlbGxTaXplLmggKiBpO1xuXHRcdFx0bGV0IGxpdHRsZUxlZnQgPSBsZWZ0ICsgY2VsbFNpemUudyAtIDE1O1xuXG5cblxuXHRcdFx0Ly8gRHJhdyB0aGUgYmlnIGNlbGxcblx0XHRcdGN0eC5iZWdpblBhdGgoKTtcblxuXHRcdFx0Y3R4LnN0cm9rZVN0eWxlID0gXCJibGFja1wiO1xuXHRcdFx0Y3R4LnJlY3QobGVmdCwgY2VsbFRvcCwgY2VsbFNpemUudywgY2VsbFNpemUuaCk7XG5cdFx0XHRjdHguc3Ryb2tlKCk7XG5cblx0XHRcdGN0eC5jbG9zZVBhdGgoKTtcblxuXG5cblx0XHRcdC8vIERyYXcgdGhlIGxpdHRsZSBjZWxsIGluIHRvcCByaWdodCBjb3JuZXJcblx0XHRcdGN0eC5iZWdpblBhdGgoKTtcblxuXHRcdFx0Y3R4LnN0cm9rZVN0eWxlID0gXCJibHVlXCI7XG5cdFx0XHRjdHgucmVjdChsaXR0bGVMZWZ0LCBjZWxsVG9wLCAxNSwgMTUpO1xuXHRcdFx0Y3R4LnN0cm9rZSgpO1xuXG5cdFx0XHRjdHguY2xvc2VQYXRoKCk7XG5cblxuXHRcdFx0Ly8gRHJhdyBhZGRpdGlvbmFsIGxpdHRsZSBjZWxscyBmb3IgbGFzdCBmcmFtZVxuXHRcdFx0aWYgKGkgPT0gdGhpcy5mcmFtZXMubGVuZ3RoIC0gMSkge1xuXHRcdFx0XHRjdHguYmVnaW5QYXRoKCk7XG5cblx0XHRcdFx0Y3R4LnN0cm9rZVN0eWxlID0gXCJibHVlXCI7XG5cdFx0XHRcdGN0eC5yZWN0KGxlZnQsIGNlbGxUb3AsIDE1LCAxNSk7XG5cdFx0XHRcdGN0eC5yZWN0KGxlZnQgKyAxNSwgY2VsbFRvcCwgMTUsIDE1KTtcblx0XHRcdFx0Y3R4LnN0cm9rZSgpO1xuXG5cdFx0XHRcdGN0eC5jbG9zZVBhdGgoKTtcblx0XHRcdH1cblxuXG5cblxuXHRcdFx0ZnVuY3Rpb24gZHJhd0xpdHRsZUNlbGwodmFsLCBsZWZ0VmFsKSB7XG5cdFx0XHRcdGlmICh2YWwgPT09IG51bGwpIHJldHVybjtcblx0XHRcdFx0Y3R4LmZpbGxTdHlsZSA9ICdibGFjayc7XG5cdFx0XHRcdGN0eC5mb250ID0gXCIxNnB4IEFyaWFsXCI7XG5cdFx0XHRcdGN0eC5maWxsVGV4dCh2YWwsIGxlZnQgKyBsZWZ0VmFsLCBjZWxsVG9wICsgMTIpO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBEcmF3IHRoZSBTQ09SRVNcblx0XHRcdGN0eC5maWxsU3R5bGUgPSAnYmxhY2snO1xuXHRcdFx0Y3R4LmZvbnQgPSBcIjE2cHggQXJpYWxcIjtcblxuXHRcdFx0Ly8gRHJhdyB0aGUgMTB0aCBmcmFtZVxuXHRcdFx0aWYgKGkgPT0gdGhpcy5mcmFtZXMubGVuZ3RoIC0gMSkge1xuXG5cdFx0XHRcdGlmIChmcmFtZS5vbmUgPT09IG51bGwpIGNvbnRpbnVlO1xuXG5cdFx0XHRcdGlmIChmcmFtZS5vbmUgPT09IDEwKSB7XG5cdFx0XHRcdFx0ZHJhd0xpdHRsZUNlbGwoJ1gnLCAyKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIGlmIChmcmFtZS5vbmUgPT09IDApIHtcblx0XHRcdFx0XHRkcmF3TGl0dGxlQ2VsbCgnLScsIDIpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2Uge1xuXHRcdFx0XHRcdGRyYXdMaXR0bGVDZWxsKGZyYW1lLm9uZSwgMik7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoZnJhbWUudHdvID09PSBudWxsKSBjb250aW51ZTtcblx0XHRcdFx0aWYgKGZyYW1lLnR3byA9PT0gMTApIHtcblx0XHRcdFx0XHRkcmF3TGl0dGxlQ2VsbCgnWCcsIDE1KTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIGlmIChmcmFtZS50d28gKyBmcmFtZS5vbmUgPT09IDEwKSB7XG5cdFx0XHRcdFx0ZHJhd0xpdHRsZUNlbGwoJy8nLCAxNSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0ZHJhd0xpdHRsZUNlbGwoZnJhbWUudHdvLCAxNSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoZnJhbWUudGhyZWUgPT09IG51bGwpIGNvbnRpbnVlO1xuXHRcdFx0XHRpZiAoZnJhbWUudGhyZWUgPT09IDEwKSB7XG5cdFx0XHRcdFx0ZHJhd0xpdHRsZUNlbGwoJ1gnLCAzMCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZSBpZiAoZnJhbWUudGhyZWUgKyBmcmFtZS50d28gPT09IDEwKSB7XG5cdFx0XHRcdFx0ZHJhd0xpdHRsZUNlbGwoJy8nLCAzMCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0ZHJhd0xpdHRsZUNlbGwoZnJhbWUudGhyZWUsIDMwKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdGlmIChmcmFtZS5vbmUgIT0gbnVsbCkge1xuXG5cdFx0XHRcdFx0aWYgKGZyYW1lLm9uZSA9PT0gMTApIHtcblxuXHRcdFx0XHRcdFx0Y3R4LmZpbGxUZXh0KCdYJywgbGl0dGxlTGVmdCArIDIsIGNlbGxUb3AgKyAxMik7XG5cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZSBpZiAoZnJhbWUub25lID09PSAwKSB7XG5cblx0XHRcdFx0XHRcdGN0eC5maWxsVGV4dCgnLScsIGxlZnQgKyA1LCBjZWxsVG9wICsgMTYpO1xuXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2Uge1xuXG5cdFx0XHRcdFx0XHRjdHguZmlsbFRleHQoZnJhbWUub25lLnRvU3RyaW5nKCksIGxlZnQgKyA1LCBjZWxsVG9wICsgMTYpO1xuXG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoZnJhbWUudHdvICE9IG51bGwpIHtcblxuXHRcdFx0XHRcdC8vIERyYXcgdGhlIGxpdHRsZSBzY29yZSBvbiB0aGUgcmlnaHQgb3IgLyBvciBYXG5cdFx0XHRcdFx0Y3R4LmZvbnQgPSBcIjE0cHggQXJpYWxcIjtcblx0XHRcdFx0XHRpZiAoZnJhbWUub25lICsgZnJhbWUudHdvID09PSAxMCkge1xuXHRcdFx0XHRcdFx0Y3R4LmZpbGxUZXh0KCcvJywgbGl0dGxlTGVmdCArIDIsIGNlbGxUb3AgKyAxMik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2UgaWYgKGZyYW1lLnR3byA9PT0gMCkge1xuXHRcdFx0XHRcdFx0Y3R4LmZpbGxUZXh0KCctJywgbGl0dGxlTGVmdCArIDIsIGNlbGxUb3AgKyAxMik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2Uge1xuXG5cdFx0XHRcdFx0XHRjdHguZmlsbFRleHQoZnJhbWUudHdvLnRvU3RyaW5nKCksIGxpdHRsZUxlZnQgKyAyLCBjZWxsVG9wICsgMTIpO1xuXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblxuXG5cdFx0XHQvLyBEcmF3IHRoZSB0b3RhbCBzY29yZSBzbyBmYXJcblx0XHRcdGN0eC5mb250ID0gXCIxNnB4IEFyaWFsXCI7XG5cdFx0XHQvL1x0aWYoZnJhbWUuc2NvcmUpIHtcblx0XHRcdGlmIChmcmFtZS5pc0ZpbmFsKSB7XG5cblx0XHRcdFx0Y3R4LmZpbGxUZXh0KGZyYW1lLnNjb3JlLnRvU3RyaW5nKCksIGxlZnQgKyA1LCBjZWxsVG9wICsgMzIpO1xuXHRcdFx0fVxuXG5cdFx0fVxuXG5cblx0fVxuXG59XG4iLCIvKmdsb2JhbCBHYW1lKi9cbkdhbWUuVGVzdENpcmNsZSA9IGNsYXNzIFRlc3RDaXJjbGV7XG4gICAgXG4gICAgY29uc3RydWN0b3IoY194LCBjX3ksIHJhZGl1cyl7XG4gICAgICAgIFxuICAgICAgICB0aGlzLnJhZGl1cyA9IHJhZGl1cztcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICB0aGlzLmNvbG9yID0gXCJ5ZWxsb3dcIjtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuYm9keSA9IG5ldyBHYW1lLkJvZHkoe3g6IGNfeCwgeTogY195fSwge3g6IDAsIHk6IDB9LCAxNTApO1xuICAgICAgICBcbiAgICAgICAgdGhpcy5ib2R5LmNyZWF0ZUdlb21ldHJ5KCdjaXJjbGUnLCB7cmFkaXVzOiB0aGlzLnJhZGl1c30pO1xuICAgICAgICBcbiAgICAgICAgdGhpcy5ib2R5LnNldENvbGxpc2lvbkdyb3VwcyhbJ2JhbGxzJ10pO1xuICAgICAgICBcbiAgICAgICAgR2FtZS5waHlzaWNzLmFkZE1lbWJlcih0aGlzKTtcbiAgICAgICAgXG4gICAgICAgIEdhbWUucGh5c2ljcy5hZGRUb0dyb3VwKCdiYWxscycsIHRoaXMpO1xuICAgICAgICBcbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIFxuXG4gICAgdXBkYXRlKGRlbHRhKXtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuYm9keS51cGRhdGUoZGVsdGEpO1xuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgXG4gICAgZHJhdyhjdHgpe1xuICAgICAgICBcbiAgICAgICAgLy8gRHJhdyB0aGUgY2lyY2xlXG4gICAgICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICAgICAgY3R4LmFyYyh0aGlzLmJvZHkucG9zLngsIHRoaXMuYm9keS5wb3MueSwgdGhpcy5yYWRpdXMsIDAsIE1hdGguUEkqMik7XG4gICAgICAgIGN0eC5maWxsU3R5bGUgPSB0aGlzLmNvbG9yO1xuICAgICAgICBjdHguZmlsbCgpO1xuICAgICAgICBjdHguY2xvc2VQYXRoKCk7XG4gICAgICAgIFxuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgXG59IiwiXCJ1c2Ugc3RyaWN0XCI7XG5jbGFzcyBBbmltYXRpb257XG4gICAgXG4gICAgY29uc3RydWN0b3Ioc3ByaXRlc2hlZXQsIGZyYW1lcywgYW5pbWF0aW9uVGltZSl7XG4gICAgICAgIFxuICAgICAgICB0aGlzLmN1cnJlbnRJbmRleCA9IDA7XG4gICAgICAgIHRoaXMuZnJhbWVUaW1lID0gYW5pbWF0aW9uVGltZSAvIGZyYW1lcy5sZW5ndGg7XG4gICAgICAgIHRoaXMuZnJhbWVzID0gZnJhbWVzO1xuICAgICAgICB0aGlzLnNwcml0ZXNoZWV0ID0gc3ByaXRlc2hlZXQ7XG4gICAgICAgIHRoaXMud2lkdGggPSBzcHJpdGVzaGVldC50aWxlV2lkdGg7XG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gc3ByaXRlc2hlZXQudGlsZUhlaWdodDtcbiAgICAgICAgdGhpcy50aW1lU2luY2VMYXN0RnJhbWVDaGFuZ2UgPSAwO1xuXG4gICAgICAgIGNvbnNvbGUubG9nKCdBbmltYXRpb24gZnJhbWUgdGltZScsIHRoaXMuZnJhbWVUaW1lKTtcbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIHVwZGF0ZShkZWx0YSl7XG4gICAgICAgIFxuICAgICAgICB0aGlzLnRpbWVTaW5jZUxhc3RGcmFtZUNoYW5nZSArPSBkZWx0YTtcblxuICAgICAgICBpZih0aGlzLnRpbWVTaW5jZUxhc3RGcmFtZUNoYW5nZSA+PSB0aGlzLmZyYW1lVGltZSl7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmKHRoaXMuY3VycmVudEluZGV4ID09PSB0aGlzLmZyYW1lcy5sZW5ndGggLSAxKXtcbiAgICAgICAgICAgICAgICAvLyBXZSBhcmUgb24gdGhlIGxhc3QgZnJhbWUgc28gZ28gdG8gMCBpbmRleFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudEluZGV4ID0gMDtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2V7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50SW5kZXggKys7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIFJlc2V0IHRoZSBmcmFtZSB0aW1lciB0byAwXG4gICAgICAgICAgICB0aGlzLnRpbWVTaW5jZUxhc3RGcmFtZUNoYW5nZSA9IDA7XG4gICAgICAgICAgICBcbiAgICAgICAgfVxuICAgICAgICBcbiAgICBcbiAgICB9XG4gICAgXG4gICAgcmVuZGVyKGN0eCwgeCwgeSl7XG4gICAgICAgIFxuICAgICAgICB0aGlzLnNwcml0ZXNoZWV0LnJlbmRlcihjdHgsIHgsIHksIHRoaXMuZnJhbWVzW3RoaXMuY3VycmVudEluZGV4XSk7XG4gICAgICAgIFxuICAgIH1cbiAgICBcbn07IiwiLypnbG9iYWwgR2FtZSovXG5HYW1lLkJvZHkgPSBjbGFzcyBCb2R5IHtcblxuICAgIGNvbnN0cnVjdG9yKHBvcywgdmVsLCBtYXNzLCB0eXBlKSB7XG5cbiAgICAgICAgdGhpcy5wb3MgPSBwb3M7XG4gICAgICAgIHRoaXMudmVsID0gdmVsO1xuICAgICAgICB0aGlzLmFjYyA9IHtcbiAgICAgICAgICAgIHg6IDAsXG4gICAgICAgICAgICB5OiAwXG4gICAgICAgIH07XG5cbiAgICAgICAgXG4gICAgICAgIHRoaXMuYW5ndWxhclZlbCA9IDA7XG4gICAgICAgIHRoaXMuYW5ndWxhckFjYyA9IDA7XG5cbiAgICAgICAgdGhpcy5hbmdsZSA9IDA7XG4gICAgICAgIHRoaXMubWFzcyA9IG1hc3M7XG5cbiAgICAgICAgdGhpcy5tYXhTcGVlZCA9IG51bGw7XG5cbiAgICAgICAgdGhpcy50eXBlID0gdHlwZTtcblxuICAgICAgICB0aGlzLnJvdGF0aW9uYWxEYW1waW5nID0gMDtcblxuICAgICAgICB0aGlzLmZyaWN0aW9uID0gMDtcbiAgICAgICAgXG4gICAgICAgIC8vIEJvZHkgdHlwZSBmbGFnc1xuICAgICAgICB0aGlzLmZpeGVkID0gZmFsc2U7XG4gICAgICAgIHRoaXMuaXNCb3VuY3lDb2xsaWR5ID0gdHJ1ZTtcblxuXG4gICAgICAgIC8vIEp1c3QgdG8gYXZvaWQgZXJyb3JzIHdoZW4gbm90IGFzcy1pZ25lZFxuICAgICAgICB0aGlzLm9uQ29sbGlkZWQgPSAoKSA9PiB7fTtcbiAgICB9XG5cblxuICAgIC8vIENyZWF0ZSB0aGUgZ2VvbWV0cnlcbiAgICBjcmVhdGVHZW9tZXRyeSh0eXBlLCBjb25maWcpIHtcblxuICAgICAgICAvLyBJZiBvZiB0eXBlIGNpcmNsZVxuICAgICAgICBpZiAodHlwZS50b0xvd2VyQ2FzZSgpID09PSAnY2lyY2xlJykge1xuXG4gICAgICAgICAgICB0aGlzLmdlb21ldHJ5ID0gbmV3IEdhbWUuQ2lyY2xlKHRoaXMucG9zLngsIHRoaXMucG9zLnksIGNvbmZpZy5yYWRpdXMpO1xuXG4gICAgICAgIH1cbiAgICAgICAgLy8gRWxzZSBpZiBvZiB0eXBlIHJlY3RhbmdsZVxuICAgICAgICBlbHNlIGlmICh0eXBlLnRvTG93ZXJDYXNlKCkgPT09ICdyZWN0YW5nbGUnKSB7XG5cbiAgICAgICAgICAgIHRoaXMuZ2VvbWV0cnkgPSBuZXcgR2FtZS5SZWN0YW5nbGUodGhpcy5wb3MueCwgdGhpcy5wb3MueSwgY29uZmlnLndpZHRoLCBjb25maWcuaGVpZ2h0LCBjb25maWcuY29sb3IpO1xuXG5cbiAgICAgICAgfVxuXG4gICAgfVxuXG5cbiAgICAvLyBDaGVjayBpZiB0aGUgYm9keSBpbnRlcnNlY3RzIGFub3RoZXIgYm9keShzbyBoYXd0KVxuICAgIGludGVyc2VjdHMoYm9keSkge1xuXG4gICAgICAgIHJldHVybiBHYW1lLkNvbGxpc2lvbi5pbnRlcnNlY3RzKHRoaXMuZ2VvbWV0cnksIGJvZHkuZ2VvbWV0cnkpO1xuXG4gICAgfVxuXG5cbiAgICAvLyBTZXQgdGhlIGNvbGxpc2lvbiBncm91cFxuICAgIHNldENvbGxpc2lvbkdyb3Vwcyhncm91cHMpIHtcblxuICAgICAgICB0aGlzLmNvbGxpZGVzV2l0aCA9IGdyb3VwcztcblxuICAgIH1cblxuXG4gICAgLy8gVXBkYXRlcyB0aGUgcG9zaXRpb24vdmVsb2NpdHkgaWYgYWNjZWxlcmF0aW9uXG4gICAgdXBkYXRlKGRlbHRhKSB7XG5cbiAgICAgICAgLy8gQWNjZWxlcmF0ZSB0aGUgYm9keSdzIHJvdGF0aW9uXG4gICAgICAgIHRoaXMuYW5ndWxhclZlbCArPSB0aGlzLmFuZ3VsYXJBY2M7XG5cbiAgICAgICAgLy8gUm90YXRlIHRoZSBib2R5XG4gICAgICAgIHRoaXMuYW5nbGUgKz0gdGhpcy5hbmd1bGFyVmVsO1xuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIGlmKHRoaXMuYW5nbGUgPj0gTWF0aC5QSSAqIDIpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRoaXMuYW5nbGUgPSB0aGlzLmFuZ2xlIC0gTWF0aC5QSSAqIDI7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZih0aGlzLmFuZ2xlIDw9IDApXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRoaXMuYW5nbGUgPSB0aGlzLmFuZ2xlICsgTWF0aC5QSSAqIDI7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICAvLyBBY2NlbGVyYXRlIHRoZSBib2R5XG4gICAgICAgIHRoaXMudmVsLnggKz0gdGhpcy5hY2MueDtcbiAgICAgICAgdGhpcy52ZWwueSArPSB0aGlzLmFjYy55O1xuXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCdCb2R5IHVwZGF0ZScsIHRoaXMudmVsKTtcbiAgICAgICAgdGhpcy5wb3MueCArPSB0aGlzLnZlbC54O1xuICAgICAgICB0aGlzLnBvcy55ICs9IHRoaXMudmVsLnk7XG5cbiAgICAgICAgdGhpcy5nZW9tZXRyeS5zZXRQb3NpdGlvbih0aGlzLnBvcyk7XG4gICAgICAgIFxuICAgICAgICB0aGlzLmRhbXBpbmcoKTtcbiAgICAgICAgdGhpcy5hY2NvdW50Rm9yRnJpY3Rpb24oKTtcblxuICAgIH1cbiAgICBcbiAgICBcbiAgICBcbiAgICBhY2NvdW50Rm9yRnJpY3Rpb24oKXtcbiAgICAgICAgXG4gICAgICAgIGlmKHRoaXMudmVsLnggPCAwKXtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy52ZWwueCArPSB0aGlzLmZyaWN0aW9uO1xuICAgICAgICAgICAgXG4gICAgICAgIH1cbiAgICAgICAgZWxzZXtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy52ZWwueCAtPSB0aGlzLmZyaWN0aW9uO1xuICAgICAgICAgICAgXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmKHRoaXMudmVsLnkgPCAwKXtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy52ZWwueSArPSB0aGlzLmZyaWN0aW9uO1xuICAgICAgICAgICAgXG4gICAgICAgIH1cbiAgICAgICAgZWxzZXtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy52ZWwueSAtPSB0aGlzLmZyaWN0aW9uO1xuICAgICAgICAgICAgXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICBpZih0aGlzLnZlbC54ID49IC10aGlzLmZyaWN0aW9uICYmIHRoaXMudmVsLnggPD0gdGhpcy5mcmljdGlvbil7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMudmVsLnggPSAwO1xuICAgICAgICAgICAgXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmKHRoaXMudmVsLnkgPj0gLXRoaXMuZnJpY3Rpb24gJiYgdGhpcy52ZWwueSA8PSB0aGlzLmZyaWN0aW9uKXtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy52ZWwueSA9IDA7XG4gICAgICAgICAgICBcbiAgICAgICAgfVxuICAgICAgICBcbiAgICB9XG5cbiAgICBcbiAgICBkYW1waW5nKCkge1xuICAgICAgICBcbiAgICAgICAgLy8gRGVjcmVhc2UgYW5ndWxhciB2ZWxvY2l0eSBiYXNlZCBvbiBkaXJlY3Rpb25cbiAgICAgICAgaWYodGhpcy5hbmd1bGFyVmVsIDwgMCl7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMuYW5ndWxhclZlbCArPSB0aGlzLnJvdGF0aW9uYWxEYW1waW5nO1xuICAgICAgICAgICAgXG4gICAgICAgIH1cbiAgICAgICAgZWxzZXtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy5hbmd1bGFyVmVsIC09IHRoaXMucm90YXRpb25hbERhbXBpbmc7XG4gICAgICAgICAgICBcbiAgICAgICAgfVxuICAgICAgICAvLyBjb25zb2xlLmxvZyh0aGlzLmFuZ3VsYXJWZWwpO1xuICAgICAgICBcbiAgICAgICAgLy8gQWNjb3VudCBmb3IgdmFsdWVzIGNsb3NlIHRvIHplcm9cbiAgICAgICAgaWYodGhpcy5hbmd1bGFyVmVsID49IC10aGlzLnJvdGF0aW9uYWxEYW1waW5nICYmIHRoaXMuYW5ndWxhclZlbCA8PSB0aGlzLnJvdGF0aW9uYWxEYW1waW5nKXtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ0FsbW9zdCB6ZXJvJyk7XG4gICAgICAgICAgICB0aGlzLmFuZ3VsYXJWZWwgPSAwO1xuICAgICAgICAgICAgXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBTZXQgcG9zaXRpb25cbiAgICBzZXRQb3NpdGlvbihwb3MpIHtcblxuICAgICAgICB0aGlzLnBvcyA9IHBvcztcbiAgICAgICAgdGhpcy5nZW9tZXRyeS5zZXRQb3NpdGlvbihwb3MpO1xuXG4gICAgfVxuXG4gICAgLy8gU2V0IHRoZSBib2R5IHZlbG9jaXR5XG4gICAgc2V0VmVsb2NpdHkodmVsKSB7XG5cbiAgICAgICAgaWYgKHRoaXMubWF4U3BlZWQgIT09IG51bGwpIHtcblxuICAgICAgICAgICAgLy8gTWFnbml0dWRlIHNxdWFyZWRcbiAgICAgICAgICAgIGxldCBtYWduaXR1ZGVTcXVhcmVkID0gKHZlbC54ICogdmVsLnggKyB2ZWwueSAqIHZlbC55KTtcblxuICAgICAgICAgICAgaWYgKG1hZ25pdHVkZVNxdWFyZWQgPiB0aGlzLm1heFNwZWVkICogdGhpcy5tYXhTcGVlZCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiVmVsb2NpdHkgTUFYIFBPV0VSXCIpO1xuXG4gICAgICAgICAgICAgICAgLy8gTm9ybWFsaXplIHZlY3RvclxuICAgICAgICAgICAgICAgIHZlbCA9IEdhbWUuTWF0aGVtYXRpY3Mubm9ybWFsaXplVmVjdG9yKHZlbCk7XG5cbiAgICAgICAgICAgICAgICAvLyBTZXQgbmV3IHZlbG9jaXR5XG4gICAgICAgICAgICAgICAgdmVsLnggPSB0aGlzLm1heFNwZWVkICogdmVsLng7XG4gICAgICAgICAgICAgICAgdmVsLnkgPSB0aGlzLm1heFNwZWVkICogdmVsLnk7XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy52ZWwgPSB2ZWw7XG5cbiAgICB9XG5cblxuICAgIC8vIERhdCBtYXNzXG4gICAgc2V0TWFzcyhtYXNzKSB7XG4gICAgICAgIHRoaXMubWFzcyA9IG1hc3M7XG4gICAgfVxufTsiLCIvKmdsb2JhbCBHYW1lKi9cbkdhbWUuQm9keVR5cGVzID0ge1xuICAgIENJUkNMRTogMCxcbiAgICBSRUNUQU5HTEU6IDEsXG59OyIsIi8qZ2xvYmFsIEdhbWUqL1xuR2FtZS5DaXJjbGUgPSBjbGFzcyBDaXJjbGV7XG4gICAgXG4gICAgY29uc3RydWN0b3IoY194LCBjX3ksIHJhZGl1cyl7XG4gICAgICAgIFxuICAgICAgICB0aGlzLnggPSBjX3g7XG4gICAgICAgIHRoaXMueSA9IGNfeTtcbiAgICAgICAgdGhpcy5yYWRpdXMgPSByYWRpdXM7XG4gICAgICAgIHRoaXMudHlwZSA9IEdhbWUuQm9keVR5cGVzLkNJUkNMRTtcbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIFxuICAgIHNldFBvc2l0aW9uKHBvcyl7XG4gICAgICAgIFxuICAgICAgICB0aGlzLnggPSBwb3MueDtcbiAgICAgICAgdGhpcy55ID0gcG9zLnk7XG4gICAgfVxuICAgIFxuICAgIFxuICAgIGRyYXcoY3R4LCBpbWFnZSl7XG4gICAgICAgIFxuICAgICAgICBpZihpbWFnZSl7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGN0eC5kcmF3SW1hZ2UoaW1hZ2UsIHRoaXMueCAtIHRoaXMucmFkaXVzLCB0aGlzLnkgLSB0aGlzLnJhZGl1cyk7XG4gICAgICAgICAgICBcbiAgICAgICAgfVxuICAgICAgICBlbHNle1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgICAgICAgICBjdHguYXJjKHRoaXMueCwgdGhpcy55LCB0aGlzLnJhZGl1cywgMCwgTWF0aC5QSSoyKTtcbiAgICAgICAgICAgIGN0eC5maWxsKCk7XG4gICAgICAgICAgICBjdHguY2xvc2VQYXRoKCk7XG4gICAgICAgICAgICBcbiAgICAgICAgfVxuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgXG4gICAgY29udGFpbnMocG9pbnQpe1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIEdhbWUuQ29sbGlzaW9uLmNvbnRhaW5zQ2lyY2xlKHRoaXMsIHBvaW50KTtcbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIFxuICAgIGludGVyc2VjdHMob2JqKXtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBHYW1lLkNvbGxpc2lvbi5pbnRlcnNlY3RzKG9iaiwgdGhpcyk7XG5cbiAgICB9XG4gICAgXG59OyIsIi8qZ2xvYmFsIEdhbWUqL1xuXG5HYW1lLkNvbGxpc2lvbiA9IGNsYXNzIENvbGxpc2lvblxue1xuICAgIFxuICAgIHN0YXRpYyBpbnRlcnNlY3RzKG9iajEsIG9iajIpe1xuICAgICAgICBcbiAgICAgIC8vICBjb25zb2xlLmxvZygnQ2hlY2tpbmcgaW50ZXJzZWN0Jywgb2JqMSwgb2JqMik7XG4gICAgICAgIFxuICAgICAgICBpZihvYmoxLnR5cGUgPT09IEdhbWUuQm9keVR5cGVzLkNJUkNMRSl7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmKG9iajIudHlwZSA9PT0gR2FtZS5Cb2R5VHlwZXMuQ0lSQ0xFKXtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICByZXR1cm4gR2FtZS5Db2xsaXNpb24uaW50ZXJzZWN0Q2lyY2xlcyhvYmoxLCBvYmoyKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYob2JqMi50eXBlID09PSBHYW1lLkJvZHlUeXBlcy5SRUNUQU5HTEUpe1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHJldHVybiBHYW1lLkNvbGxpc2lvbi5pbnRlcnNlY3RSZWN0QW5kQ2lyY2xlKG9iajIsIG9iajEpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZXtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh0eXBlb2Yob2JqMSksICdpbnRlcnNlY3RpbmcnLCB0eXBlb2Yob2JqMiksICdpcyBub3Qgc3VwcG9ydGVkJyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmKG9iajIudHlwZSA9PT0gR2FtZS5Cb2R5VHlwZXMuQ0lSQ0xFKXtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYob2JqMS50eXBlID09PSBHYW1lLkJvZHlUeXBlcy5SRUNUQU5HTEUpe1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHJldHVybiBHYW1lLkNvbGxpc2lvbi5pbnRlcnNlY3RSZWN0QW5kQ2lyY2xlKG9iajEsIG9iajIpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZXtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh0eXBlb2Yob2JqMSksICdpbnRlcnNlY3RpbmcnLCB0eXBlb2Yob2JqMiksICdpcyBub3Qgc3VwcG9ydGVkJyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgIH1cbiAgICAgICAgZWxzZXtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY29uc29sZS5sb2codHlwZW9mKG9iajEpLCAnaW50ZXJzZWN0aW5nJywgdHlwZW9mKG9iajIpLCAnaXMgbm90IHN1cHBvcnRlZCcpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIFxuICAgIHN0YXRpYyBpbnRlcnNlY3RSZWN0cyhyZWN0MSwgcmVjdDIpXG4gICAge1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHJlY3QxLmxlZnQgPD0gcmVjdDIucmlnaHQgJiZcbiAgICAgICAgICAgIHJlY3QyLmxlZnQgPD0gcmVjdDEucmlnaHQgJiZcbiAgICAgICAgICAgIHJlY3QxLnRvcCA8PSByZWN0Mi5ib3R0b20gJiZcbiAgICAgICAgICAgIHJlY3QyLnRvcCA8PSByZWN0MS5ib3R0b207XG4gICAgICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgc3RhdGljIGludGVyc2VjdENpcmNsZXMoY2EsIGNiKVxuICAgIHtcbiAgICAgICAvLyBjb25zb2xlLmxvZyhjYSwgY2IpO1xuICAgICAgICAgLy8gVGhlIHggZGlzdGFuY2UgYmV0d2VlbiB0aGUgMiBwb2ludHNcbiAgICAgICAgdmFyIGR4ID0gY2EueCAtIGNiLng7XG4gICAgICAgIFxuICAgICAgICAvLyBUaGUgeSBkaXN0YW5jZSBiZXR3ZWVuIHRoZSAyIHBvaW50c1xuICAgICAgICB2YXIgZHkgPSBjYS55IC0gY2IueTtcbiAgICAgICAgXG4gICAgICAgIC8vIFRoZSBzdW0gb2YgdGhlIGNpcmNsZSByYWRpaVxuICAgICAgICB2YXIgZHIgPSBjYS5yYWRpdXMgKyBjYi5yYWRpdXM7XG4gICAgICAgIFxuICAgICAgICAvLyBDb21wYXJlIHRoZSB0d28gZGlzdGFuY2VzLiBJZiB0aGUgZGlzdGFuY2UgYmV0d2VlbiB0aGUgdHdvIHBvaW50cyBcbiAgICAgICAgLy8gaXMgbGVzcyB0aGFuIHRoZSBzdW0gb2YgdGhlIHJhZGlpIHRoZW4gdGhlIGNpcmNsZXMgbXVzdCBpbnRlcnNlY3QuXG4gICAgICAgIHJldHVybiBkeCpkeCArIGR5KmR5IDw9IGRyKmRyO1xuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgXG4gICAgc3RhdGljIGludGVyc2VjdFJlY3RBbmRDaXJjbGUocmVjdCwgY2lyY2xlKVxuICAgIHtcbiAgICAgICAgLy8gSG9yaXpvbnRhbCBkaXN0YW5jZSBiZXR3ZWVuIHRoZSBjaXJjbGUgY2VudGVyIGFuZCByZWN0IGNlbnRlclxuICAgICAgICBsZXQgZGlzdGFuY2VYID0gTWF0aC5hYnMoY2lyY2xlLnggLSByZWN0LnggLSAocmVjdC53aWR0aC8yKSk7XG4gICAgICAgIFxuICAgICAgICAvLyBWZXJ0aWNhbCBkaXN0YW5jZSBiZXR3ZWVuIHRoZSBjaXJjbGUgY2VudGVyIGFuZCByZWN0IGNlbnRlclxuICAgICAgICBsZXQgZGlzdGFuY2VZID0gTWF0aC5hYnMoY2lyY2xlLnkgLSByZWN0LnkgLSAocmVjdC5oZWlnaHQvMikpO1xuICAgIFxuICAgIFxuICAgICAgICAvLyBJZiB0aGUgZGlzdGFuY2UgaXMgZ3JlYXRlciB0aGFuIGhhbGYgY2lyY2xlIFxuICAgICAgICAvLyArIGhhbGYgdGhlIHdpZHRoIG9mIGhhbGYgcmVjdCwgXG4gICAgICAgIC8vIHRoZW4gdGhleSBhcmUgdG9vIGZhciBhcGFydCB0byBiZSBjb2xsaWRpbmdcbiAgICAgICAgaWYgKGRpc3RhbmNlWCA+ICgocmVjdC53aWR0aCkvMiArIGNpcmNsZS5yYWRpdXMpKSBcbiAgICAgICAgeyBcbiAgICAgICAgICAgIC8vIFJldHVybiBmYWxzZVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyBJZiB0aGUgZGlzdGFuY2UgaXMgZ3JlYXRlciB0aGFuIGFuY2hvcnMgaGFsZiBjaXJjbGVcbiAgICAgICAgLy8gKyBoYWxmIHRoZSBoZWlnaHQgb2YgaGFsZiByZWN0LCBcbiAgICAgICAgLy8gdGhlbiB0aGV5IGFyZSB0b28gZmFyIGFwYXJ0IHRvIGJlIGNvbGxpZGluZ1xuICAgICAgICBpZiAoZGlzdGFuY2VZID4gKChyZWN0LmhlaWdodCkvMiArIGNpcmNsZS5yYWRpdXMpKSBcbiAgICAgICAgeyBcbiAgICAgICAgICAgIC8vIFJldHVybiBmYWxzZVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlOyBcbiAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgXG4gICAgICAgIC8vIElmIHRoZSBob3Jpem9udGFsIGRpc3RhbmNlIGlzIGxlc3MgdGhhbiBvciBlcXVhbCB0byBoYWxmXG4gICAgICAgIC8vIHRoZSB3aWR0aCBvZiBoYWxmIHJlY3QgdGhlbiB0aGV5IGFyZSBjb2xsaWRpbmcgXG4gICAgICAgIGlmIChkaXN0YW5jZVggPD0gKChyZWN0LndpZHRoKS8yKSkgXG4gICAgICAgIHsgXG4gICAgICAgICAgICAvLyBSZXR1cm4gdHJ1ZVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7IFxuICAgICAgICB9IFxuICAgICAgICBcbiAgICAgICAgLy8gSWYgdGhlIHZlcnRpY2FsIGRpc3RhbmNlIGlzIGxlc3MgdGhhbiBvciBlcXVhbCB0byBoYWxmXG4gICAgICAgIC8vIHRoZSBoZWlnaHQgb2YgaGFsZiByZWN0IHRoZW4gdGhleSBhcmUgY29sbGlkaW5nIFxuICAgICAgICBpZiAoZGlzdGFuY2VZIDw9ICgocmVjdC5oZWlnaHQpLzIpKSBcbiAgICAgICAgeyBcbiAgICAgICAgICAgIC8vIFJldHVybiB0cnVlXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTsgXG4gICAgICAgIH1cbiAgICBcbiAgICBcbiAgICBcbiAgICAgICAgLyogVGhpcyBpcyBmb3IgdGVzdGluZyB0aGUgY29sbGlzaW9uIGF0IHRoZSBpbWFnZShyZWN0KSBjb3JuZXJzICovXG4gICAgICAgIFxuICAgICAgICAvLyBUaGluayBvZiBhIGxpbmUgZnJvbSB0aGUgcmVjdCBjZW50ZXIgdG8gYW55IHJlY3QgY29ybmVyLlxuICAgICAgICAvLyBOb3cgZXh0ZW5kIHRoYXQgbGluZSBieSB0aGUgcmFkaXVzIG9mIHRoZSBjaXJjbGUuXG4gICAgICAgIC8vIElmIHRoZSBjaXJjbGUgY2VudGVyIGlzIG9uIHRoYXQgbGluZSB0aGVuXG4gICAgICAgIC8vIHRoZXkgYXJlIGNvbGxpZGluZyBhdCBleGFjdGx5IHRoYXQgcmVjdCBjb3JuZXIuXG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgLy8gVGhlIGhvcml6b250YWwgZGlzdGFuY2UgYmV0d2VlbiB0aGUgY2lyY2xlIGFuZCByZWN0XG4gICAgICAgIC8vIG1pbnVzIGhhbGYgdGhlIHdpZHRoIG9mIHRoZSByZWN0XG4gICAgICAgIGxldCBkeCA9IGRpc3RhbmNlWCAtIChyZWN0LndpZHRoKS8yO1xuICAgICAgICBcbiAgICAgICAgLy8gVGhlIHZlcnRpY2FsIGRpc3RhbmNlIGJldHdlZW4gdGhlIGNpcmNsZSBhbmQgcmVjdFxuICAgICAgICAvLyBtaW51cyBoYWxmIHRoZSBoZWlnaHQgb2YgdGhlIHJlY3RcbiAgICAgICAgbGV0IGR5ID0gZGlzdGFuY2VZIC0gKHJlY3QuaGVpZ2h0KS8yO1xuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIC8vIFVzZSBQeXRoYWdvcmFzIGZvcm11bGEgdG8gY29tcGFyZSB0aGUgZGlzdGFuY2UgYmV0d2VlbiBjaXJjbGUgYW5kIHJlY3QgY2VudGVycy5cbiAgICAgICAgcmV0dXJuIChkeCAqIGR4ICsgZHkgKiBkeSA8PSAoY2lyY2xlLnJhZGl1cyAqIGNpcmNsZS5yYWRpdXMpKTtcbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIFxuICAgIHN0YXRpYyBjb250YWluc1JlY3QocmVjdCwgcG9pbnQpXG4gICAge1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIChwb2ludC54IDw9IHJlY3QucmlnaHQgJiYgXG4gICAgICAgICAgICAgICAgcG9pbnQueCA+PSByZWN0LnggJiZcbiAgICAgICAgICAgICAgICBwb2ludC55ID49IHJlY3QueSAmJiBcbiAgICAgICAgICAgICAgICBwb2ludC55IDw9IHJlY3QuYm90dG9tKTtcbiAgICAgICAgICAgIFxuICAgIH1cbiAgICBcbiAgICBcbiAgICBzdGF0aWMgY29udGFpbnNDaXJjbGUoY2lyY2xlLCBwb2ludClcbiAgICB7XG4gICAgICAgIFxuICAgICAgICBsZXQgZHggPSBjaXJjbGUueCAtIHBvaW50Lng7XG4gICAgICAgIGxldCBkeSA9IGNpcmNsZS55IC0gcG9pbnQueTtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBkeCAqIGR4ICsgZHkgKiBkeSA8PSBjaXJjbGUucmFkaXVzICogY2lyY2xlLnJhZGl1cztcbiAgICAgICAgXG4gICAgfVxuICAgIFxufTsiLCIvKmdsb2JhbCBHYW1lKi9cbkdhbWUuSW5wdXQgPSBjbGFzcyBJbnB1dHtcbiAgICBcbiAgICBjb25zdHJ1Y3Rvcigpe1xuICAgICAgICBcbiAgICAgICAgdGhpcy5jYWxsYmFja3MgPSB7fTtcbiAgICB9XG4gICAgXG4gICAgLypcbiAgICAgKiBGdW5jdGlvbiB0aGF0IHJldHVybnMgdGhlIG1vdXNlcyBwb3NpdGlvbi5cbiAgICAgKiBJdCB0YWtlcyBpbnRvIGFjY291bnQgdGhlIHNpemUvcG9zaXRpb24gb2YgdGhlIGNhbnZhcyBhbmQgdGhlIHNjYWxlKHpvb20gaW4vb3V0KS5cbiAgICAgKi9cbiAgICBfbW91c2VQb3NpdGlvbihldmVudClcbiAgICB7XG4gICAgICAgIC8vIFVzZWQgdG8gZ2V0IHRoZSBhYnNvbHV0ZSBzaXplXG4gICAgICAgIGxldCByZWN0ID0gdGhpcy5wYXJlbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIFxuICAgICAgICAvKiByZWxhdGlvbnNoaXAgYml0bWFwIHZzIGVsZW1lbnQgZm9yIFgvWSAqL1xuICAgICAgICBcbiAgICAgICAgLy8gR2V0cyB0aGUgeCBzY2FsZVxuICAgICAgICBsZXQgc2NhbGVYID0gdGhpcy5wYXJlbnQud2lkdGggLyByZWN0LndpZHRoO1xuICAgICAgICBcbiAgICAgICAgLy8gR2V0cyB0aGUgeSBzY2FsZVxuICAgICAgICBsZXQgc2NhbGVZID0gdGhpcy5wYXJlbnQuaGVpZ2h0IC8gcmVjdC5oZWlnaHQ7XG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgLy8gUmV0dXJucyB0d28gcG9zc2libGUgdmFsdWVzXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAvLyBNb3VzZSB4IHBvc2l0aW9uIGFmdGVyIHRha2luZyBpbnRvIGFjY291bnQgdGhlIHNpemUvcG9zaXRpb24gb2YgY2FudmFzIGFuZCBzY2FsZVxuICAgICAgICAgICAgeDogKGV2ZW50LmNsaWVudFggLSByZWN0LmxlZnQpICogc2NhbGVYLFxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBNb3VzZSB5IHBvc2l0aW9uIGFmdGVyIHRha2luZyBpbnRvIGFjY291bnQgdGhlIHNpemUvcG9zaXRpb24gb2YgY2FudmFzIGFuZCBzY2FsZVxuICAgICAgICAgICAgeTogKGV2ZW50LmNsaWVudFkgLSByZWN0LnRvcCkgKiBzY2FsZVlcbiAgICAgICAgICAgIFxuICAgICAgICB9O1xuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgXG4gICAgYWRkQ2FsbGJhY2sodHlwZSwgY2Ipe1xuICAgICAgICBcbiAgICAgICAgaWYoIXRoaXMuY2FsbGJhY2tzW3R5cGVdKSB0aGlzLmNhbGxiYWNrc1t0eXBlXSA9IFtdO1xuICAgICAgICBcbiAgICAgICAgdGhpcy5jYWxsYmFja3NbdHlwZV0ucHVzaChjYik7XG5cbiAgICB9XG4gICAgXG4gICAgXG4gICAgX3JlYWN0KHR5cGUsIGV2ZW50KXtcbiAgICAgICAgXG4gICAgICAgIHZhciBwb3MgPSB0aGlzLl9tb3VzZVBvc2l0aW9uKGV2ZW50KTtcbiAgICAgICAgXG4gICAgICAgIGZvcih2YXIgaSBpbiB0aGlzLmNhbGxiYWNrc1t0eXBlXSl7XG5cbiAgICAgICAgICAgIHRoaXMuY2FsbGJhY2tzW3R5cGVdW2ldKHBvcyk7XG4gICAgICAgICAgICBcbiAgICAgICAgfVxuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgbGlzdGVuKHBhcmVudCl7XG4gICAgICAgIFxuICAgICAgICB0aGlzLnBhcmVudCA9IHBhcmVudDtcbiAgICAgICAgXG4gICAgICAgIGZvcih2YXIgdHlwZSBpbiB0aGlzLmNhbGxiYWNrcyl7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmKHRoaXMuY2FsbGJhY2tzW3R5cGVdLmxlbmd0aCA+IDApe1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50W3R5cGVdID0gZnVuY3Rpb24odHlwZSl7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oZXZlbnQpe1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9yZWFjdCh0eXBlLCBldmVudCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgfSh0eXBlKS5iaW5kKHRoaXMpO1xuXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgfVxuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgXG4gICAgY2xlYXIoKXtcbiAgICAgICAgXG4gICAgICAgIGZvcihsZXQgdHlwZSBpbiB0aGlzLmNhbGxiYWNrcyl7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMucGFyZW50W3R5cGVdID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgfVxuICAgIFxufTsiLCIvKmdsb2JhbCBHYW1lKi9cbkdhbWUuTWF0aGVtYXRpY3MgPSBjbGFzcyBNYXRoZW1hdGljcyB7XG4gICAgXG4gICAgc3RhdGljIG5vcm1hbGl6ZVZlY3Rvcih2ZWN0b3IpXG4gICAge1xuICAgICAgICAvLyBBcmMgdGFuIHdpbGwgZ2l2ZSB5b3UgdGhlIGFuZ2xlXG4gICAgICAgIGxldCBhbmdsZSA9IE1hdGguYXRhbjIodmVjdG9yLnksIHZlY3Rvci54KTtcbiAgICAgICAgXG4gICAgICAgIC8vIFdpbGwgZ2l2ZSBudW1iZXIgZm9ybSAwIHRvIDFcbiAgICAgICAgbGV0IHggPSBNYXRoLmNvcyhhbmdsZSk7XG4gICAgICAgIGxldCB5ID0gTWF0aC5zaW4oYW5nbGUpO1xuICAgICAgICBcbiAgICAgICAgLy8gU2V0IHRoZSBuZXcgdmVjdG9yXG4gICAgICAgIHZlY3Rvci54ID0geDtcbiAgICAgICAgdmVjdG9yLnkgPSB5O1xuICAgICAgICBcbiAgICAgICAgLy8gUmV0dXJuIHRoZSB2ZWN0b3JcbiAgICAgICAgcmV0dXJuIHZlY3RvcjtcbiAgICB9XG4gICAgXG4gICAgXG4gICAgLypcbiAgICAgKiAgUmV0dXJuIHRoZSBkb3QgcHJvZHVjdCBmb3IgMmQgYW5kIDNkIHZlY3RvcnNcbiAgICAgKi9cbiAgICBzdGF0aWMgZG90KHZlY3RvckEsIHZlY3RvckIpe1xuXG4gICAgXHRpZighdmVjdG9yQS56KSB2ZWN0b3JBLnogPSAwO1xuICAgIFx0aWYoIXZlY3RvckIueikgdmVjdG9yQi56ID0gMDtcbiAgICAgICAgXG4gICAgICAgIGxldCBzdW0gPSAwO1xuICAgICAgICBcbiAgICAgICAgc3VtICs9IHZlY3RvckEueCAqIHZlY3RvckIueDtcbiAgICAgICAgc3VtICs9IHZlY3RvckEueSAqIHZlY3RvckIueTtcbiAgICAgICAgc3VtICs9IHZlY3RvckEueiAqIHZlY3RvckIuejtcbiAgICBcdFxuICAgIFx0cmV0dXJuIHN1bTtcbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIFxuICAgIC8qXG4gICAgICogIFZlY3RvciBzdW1cbiAgICAgKi9cbiAgICBzdGF0aWMgdmVjdG9yU3VtKEEsIEIpe1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHg6IEEueCArIEIueCxcbiAgICAgICAgICAgIHk6IEEueSArIEIueVxuICAgICAgICB9O1xuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgXG4gICAgLypcbiAgICAgKiAgUmV0dXJuIHZlY3RvciBwZXJwZW5kaWN1bGFyXG4gICAgICovXG4gICAgc3RhdGljIHBlcnBlbmRpY3VsYXJWZWN0b3IodmVjdG9yKXtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB4OiAtdmVjdG9yLnksXG4gICAgICAgICAgICB5OiB2ZWN0b3IueFxuICAgICAgICB9O1xuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgXG4gICAgLypcbiAgICAgKiAgU2NhbGFyIFZlY3RvciBtdWx0aXBsaWNhdGlvblxuICAgICAqL1xuICAgIHN0YXRpYyBzY2FsYXJWZWN0b3JNdWx0aShzY2FsYXIsIHZlY3RvcilcbiAgICB7XG4gICAgICAgIHJldHVybiB7eDogc2NhbGFyICogdmVjdG9yLngsIHk6IHNjYWxhciAqIHZlY3Rvci55fTtcbiAgICB9XG4gICAgXG4gICAgXG4gICAgXG4gICAgXG4gICAgLypcbiAgICAgKiAgUmV0dXJucyBhIHJhbmRvbSBpbnRlZ2VyIHdpdGhpbiBbbWluLCBtYXgpXG4gICAgICovXG4gICAgc3RhdGljIHJhbmRvbUludChtaW4sIG1heCl7XG4gICAgICAgIFxuICAgICAgICBtaW4gPSBNYXRoLmNlaWwobWluKTtcbiAgICAgICAgbWF4ID0gTWF0aC5mbG9vcihtYXgpO1xuICAgICAgICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbikpICsgbWluO1xuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgXG4gICAgXG4gICAgXG4gICAgLypcbiAgICAgKiAgUmV0dXJucyBhIHJhbmRvbSBpbnRlZ2VyIHdpdGhpbiBbbWluLCBtYXhdXG4gICAgICovXG4gICAgc3RhdGljIHJhbmRvbUludEluYyhtaW4sIG1heCl7XG4gICAgICAgIFxuICAgICAgICBtaW4gPSBNYXRoLmNlaWwobWluKTtcbiAgICAgICAgbWF4ID0gTWF0aC5mbG9vcihtYXgpO1xuICAgICAgICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbiArIDEpKSArIG1pbjtcbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIFxuICAgIFxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYW4gYXJyYXkgb2YgaW50ZWdlcnMgZnJvbSB0aGUgbWluIHZhbCB0byBtYXggLSAxXG4gICAgICovXG4gICAgc3RhdGljIHJhbmdlKG1pbiwgbWF4KXtcbiAgICAgICAgXG4gICAgICAgIGxldCBsID0gW107XG4gICAgICAgIGZvcihsZXQgaT1taW47IGkgPCBtYXg7IGkrKykgbC5wdXNoKGkpO1xuICAgICAgICByZXR1cm4gbDtcbiAgICAgICAgXG4gICAgfVxuICAgIFxufTsiLCIvKmdsb2JhbCBHYW1lKi9cbkdhbWUuUGh5c2ljcyA9IGNsYXNzIFBoeXNpY3Mge1xuICAgIC8qKlxuICAgICAqIFRoZSBzZXZlbiBzdGVwcyB0byAyZCBlbGFzdGljIGNvbGxpc2lvbiB1c2luZyB2ZWN0b3IgbWF0aCBjYW4gYmUgZm91bmQgXG4gICAgICogaGVyZSAtPiBodHRwOi8vd3d3LmltYWRhLnNkdS5kay9+cm9sZi9FZHUvRE04MTUvRTEwLzJkY29sbGlzaW9ucy5wZGZcbiAgICAgKiBcbiAgICAgKiBUaGlzIGNhc2UgaXMgZm9yIGNpcmNsZXMgc3BlY2lmaWNhbGx5LCBidXQgYnkgY2hhbmdpbmcgdGhlIHN0ZXAgMSBmb3IgXG4gICAgICogZGlmZmVyZW50IGdlb21ldHJpZXMgc2hvdWxkIG1ha2UgdGhpcyBtZXRob2Qgd29yayBmb3IgYW55dGhpbmcgMkQuXG4gICAgICogXG4gICAgICovXG4gICAgXG4gICAgXG4gICAgXG4gICAgXG4gICAgLypcbiAgICAgKiAgQ2FsY3VsYXRlcyBmaW5hbCB2ZWxvY2l0aWVzIGZvciAxRCBlbGFzdGljIHBhcnRpY2xlIGNvbGxpc2lvblxuICAgICAqL1xuICAgIHN0YXRpYyBlbGFzdGljUGFydGljbGVDb2xsaXNpb24xRCh2XzEsIG1fMSwgdl8yLCBtXzIpe1xuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIGxldCB2XzFfZiA9IHZfMSAqICgobV8xIC0gbV8yKSAvIChtXzEgKyBtXzIpKSArIFxuICAgICAgICAgICAgICAgICAgICB2XzIgKiAoKDIgKiBtXzIgKSAvIChtXzEgKyBtXzIpKTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIFxuICAgICAgICBsZXQgdl8yX2YgPSB2XzEgKiAoKDIgKiBtXzEpIC8gKG1fMSArIG1fMikpICtcbiAgICAgICAgICAgICAgICAgICAgdl8yICogKChtXzIgLSBtXzEpIC8gKG1fMSArIG1fMikpO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdjEgOiB2XzFfZixcbiAgICAgICAgICAgIHYyIDogdl8yX2YsXG4gICAgICAgICAgICBcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIFxuICAgIC8qXG4gICAgICogIFJldHVybnMgdGhlIGZpbmFsIHZlbG9jaXRpZXMgZm9yIHR3byBwYXJ0aWNsZXMgU0xBTU1JTkdcbiAgICAgKi9cbiAgICBzdGF0aWMgZWxhc3RpY1BhcnRpY2xlQ29sbGlzaW9uMkQodl8xLCBtXzEsIHZfMiwgbV8yKXtcbiAgICAgICAgXG4gICAgICAgIGxldCB2X2ZfeCA9IEdhbWUuUGh5c2ljcy5lbGFzdGljUGFydGljbGVDb2xsaXNpb24xRCh2XzEueCwgbV8xLCB2XzIueCwgbV8yKTtcblxuICAgICAgICBsZXQgdl9mX3kgPSBHYW1lLlBoeXNpY3MuZWxhc3RpY1BhcnRpY2xlQ29sbGlzaW9uMUQodl8xLnksIG1fMSwgdl8yLnksIG1fMik7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB2MSA6IHtcbiAgICAgICAgICAgICAgICB4OiB2X2ZfeC52XzEsXG4gICAgICAgICAgICAgICAgeTogdl9mX3kudl8xLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdjIgOiB7XG4gICAgICAgICAgICAgICAgeDogdl9mX3gudl8yLFxuICAgICAgICAgICAgICAgIHk6IHZfZl95LnZfMixcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIFxuICAgIFxuICAgIHN0YXRpYyB1bml0Tm9ybWFsVmVjdG9yQ2lyY2xlKGNlbnRlcjEsIGNlbnRlcjIpXG4gICAge1xuICAgICAgICBpZihjZW50ZXIxLnggPT09IHVuZGVmaW5lZCB8fCBjZW50ZXIyLnggPT09IHVuZGVmaW5lZCB8fCBjZW50ZXIxLnkgPT09IHVuZGVmaW5lZCB8fCBjZW50ZXIyLnkgPT09IHVuZGVmaW5lZClcbiAgICAgICAge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB0aHJvdyBFcnJvcihcIkZBSUxFRDogY2VudGVyLnggb3IgY2VudGVyLnkgdW5kZWZpbmVkXCIpO1xuICAgICAgICAgICAgXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGxldCBkeCA9IGNlbnRlcjEueCAtIGNlbnRlcjIueDtcbiAgICAgICAgbGV0IGR5ID0gY2VudGVyMS55IC0gY2VudGVyMi55O1xuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gR2FtZS5NYXRoZW1hdGljcy5ub3JtYWxpemVWZWN0b3Ioe3g6IGR4LCB5OiBkeX0pO1xuICAgIH1cblxuICAgIFxuICAgIFxuICAgIFxuICAgIHN0YXRpYyBDaXJjbGVzQ29sbGlzaW9uKHYxLCBjMSwgbTEsIHYyLCBjMiwgbTIpe1xuICAgICAgICBcbiAgICAgICAgLy8gR2V0IHVuaXQgbm9ybWFsIHZlY3RvciBiZXR3ZWVuIDIgY2lyY2xlc1xuICAgICAgICBsZXQgdW5pdE5vcm1hbCA9IEdhbWUuUGh5c2ljcy51bml0Tm9ybWFsVmVjdG9yQ2lyY2xlKGMxLCBjMik7XG4gICAgICAgIGxldCB1bml0VGFuZ2VudCA9IEdhbWUuTWF0aGVtYXRpY3MucGVycGVuZGljdWxhclZlY3Rvcih1bml0Tm9ybWFsKTtcbiAgICAgICAgXG4gICAgICAgIGxldCB2MW4gPSBHYW1lLk1hdGhlbWF0aWNzLmRvdCh1bml0Tm9ybWFsLCB2MSk7XG4gICAgICAgIGxldCB2MXQgPSBHYW1lLk1hdGhlbWF0aWNzLmRvdCh1bml0VGFuZ2VudCwgdjEpO1xuICAgICAgICBcbiAgICAgICAgbGV0IHYybiA9IEdhbWUuTWF0aGVtYXRpY3MuZG90KHVuaXROb3JtYWwsIHYyKTtcbiAgICAgICAgbGV0IHYydCA9IEdhbWUuTWF0aGVtYXRpY3MuZG90KHVuaXRUYW5nZW50LCB2Mik7XG4gICAgICAgIFxuICAgICAgICBsZXQgdmZuID0gR2FtZS5QaHlzaWNzLmVsYXN0aWNQYXJ0aWNsZUNvbGxpc2lvbjFEKHYxbiwgbTEsIHYybiwgbTIpO1xuICAgICAgICBcbiAgICAgICAgbGV0IHZmMW4gPSBHYW1lLk1hdGhlbWF0aWNzLnNjYWxhclZlY3Rvck11bHRpKHZmbi52MSwgdW5pdE5vcm1hbCk7XG4gICAgICAgIGxldCB2ZjJuID0gR2FtZS5NYXRoZW1hdGljcy5zY2FsYXJWZWN0b3JNdWx0aSh2Zm4udjIsIHVuaXROb3JtYWwpO1xuICAgICAgICBsZXQgdmYxdCA9IEdhbWUuTWF0aGVtYXRpY3Muc2NhbGFyVmVjdG9yTXVsdGkodjF0LCB1bml0VGFuZ2VudCk7XG4gICAgICAgIGxldCB2ZjJ0ID0gR2FtZS5NYXRoZW1hdGljcy5zY2FsYXJWZWN0b3JNdWx0aSh2MnQsIHVuaXRUYW5nZW50KTtcbiAgICAgICAgXG4gICAgICAgIGxldCB2ZjEgPSBHYW1lLk1hdGhlbWF0aWNzLnZlY3RvclN1bSh2ZjFuLCB2ZjF0KTtcbiAgICAgICAgbGV0IHZmMiA9IEdhbWUuTWF0aGVtYXRpY3MudmVjdG9yU3VtKHZmMm4sIHZmMnQpO1xuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdjE6IHZmMSxcbiAgICAgICAgICAgIHYyOiB2ZjIsXG4gICAgICAgIH07XG4gICAgICAgIFxuICAgIH1cbiAgICBcbiAgICBcbiAgICBcbiAgICBzdGF0aWMgQ2lyY2xlUmVjdENvbGxpc2lvbihjLCByKXtcbiAgICAgICAgXG4gICAgICAgIC8vIERvIHRoaW5nc1xuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgXG4gICAgXG4gICAgc3RhdGljIENvbGxpc2lvbihBLCBCKXtcbiAgICAgICAgXG4gICAgICAgIGlmKEEuYm9keS50eXBlID09PSBHYW1lLkJvZHlUeXBlcy5DSVJDTEUgJiYgQi5ib2R5LnR5cGUgPT09IEdhbWUuQm9keVR5cGVzLkNJUkNMRSl7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHJldHVybiBHYW1lLlBoeXNpY3MuQ2lyY2xlc0NvbGxpc2lvbihBLmJvZHkudmVsLCBBLmJvZHkucG9zLCBBLmJvZHkubWFzcywgQi5ib2R5LnZlbCwgQi5ib2R5LnBvcywgQi5ib2R5Lm1hc3MpO1xuICAgICAgICAgICAgXG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZihBLmJvZHkudHlwZSA9PT0gR2FtZS5Cb2R5VHlwZXMuUkVDVEFOR0xFICYmIEIuYm9keS50eXBlID09PSBHYW1lLkJvZHlUeXBlcy5SRUNUQU5HTEUpe1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnUmVjdCB0byBSZWN0LCBtb2ZvJyk7XG5cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgZWxzZSBpZihBLmJvZHkudHlwZSA9PT0gR2FtZS5Cb2R5VHlwZXMuUkVDVEFOR0xFICYmIEIuYm9keS50eXBlID09PSBHYW1lLkJvZHlUeXBlcy5DSVJDTEUpe1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnUmVjdCB0byBDaXJjbGUsIG1vZm8nKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB2MToge1xuXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB2Mjoge1xuICAgICAgICAgICAgICAgICAgICB4OiAtQi5ib2R5LnZlbC54LFxuICAgICAgICAgICAgICAgICAgICB5OiBCLmJvZHkudmVsLnlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgXG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZihBLmJvZHkudHlwZSA9PT0gR2FtZS5Cb2R5VHlwZXMuQ0lSQ0xFICYmIEIuYm9keS50eXBlID09PSBHYW1lLkJvZHlUeXBlcy5SRUNUQU5HTEUpe1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnQ2lyY2xlIHRvIFJlY3QsIG1vZm8nKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB2MToge1xuICAgICAgICAgICAgICAgICAgICB4OiAtQS5ib2R5LnZlbC54LFxuICAgICAgICAgICAgICAgICAgICB5OiBBLmJvZHkudmVsLnlcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHYyOiB7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICBcbiAgICB9XG4gICAgXG59OyIsIi8qZ2xvYmFsIEdhbWUqL1xuR2FtZS5QaHlzaWNzTWFuYWdlciA9IGNsYXNzIFBoeXNpY3NNYW5hZ2VyIHtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuXG4gICAgICAgIHRoaXMubWVtYmVycyA9IFtcbiAgICAgICAgICAgIC8vIHtcbiAgICAgICAgICAgIC8vICAgICBjb2xsaWRlc1dpdGg6IFsnYmFsbHMnLCAncGlucyddLFxuICAgICAgICAgICAgLy8gfSAgICBcbiAgICAgICAgXTtcblxuICAgICAgICB0aGlzLmNvbGxpc2lvbkdyb3VwcyA9IHtcblxuICAgICAgICB9O1xuXG4gICAgfVxuXG5cbiAgICBhZGRUb0dyb3VwKGdyb3VwTmFtZSwgbWVtYmVyKSB7XG5cbiAgICAgICAgLy8gQ3JlYXRlIHRoZSBncm91cCBpZiBpdCBkb2Vzbid0IGV4aXN0XG4gICAgICAgIGlmICghdGhpcy5jb2xsaXNpb25Hcm91cHNbZ3JvdXBOYW1lXSkgdGhpcy5jb2xsaXNpb25Hcm91cHNbZ3JvdXBOYW1lXSA9IFtdO1xuXG4gICAgICAgIHRoaXMuY29sbGlzaW9uR3JvdXBzW2dyb3VwTmFtZV0ucHVzaChtZW1iZXIpO1xuXG4gICAgICAgIGNvbnNvbGUubG9nKGdyb3VwTmFtZSk7XG5cbiAgICB9XG5cblxuXG5cbiAgICBhZGRNZW1iZXIobWVtYmVyKSB7XG5cbiAgICAgICAgbWVtYmVyLmNvbGxpc2lvbkluZGV4ID0gdGhpcy5tZW1iZXJzLmxlbmd0aDtcblxuICAgICAgICB0aGlzLm1lbWJlcnMucHVzaChtZW1iZXIpO1xuXG4gICAgICAgIGNvbnNvbGUubG9nKFwiQWRkZWQgbWVtYmVyXCIpO1xuICAgICAgICBjb25zb2xlLmxvZyhtZW1iZXIpO1xuICAgIH1cblxuXG5cbiAgICB1cGRhdGUoZGVsdGEpIHtcblxuICAgICAgICB0aGlzLmFscmVhZHlDb2xsaWRlZCA9IHt9O1xuXG4gICAgICAgIC8vIExvb3AgdGhyb3VnaCBkZW0gbWVtYmVyc1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMubWVtYmVycy5sZW5ndGg7IGkrKykge1xuXG4gICAgICAgICAgICAvLyBDdXJyZW50IG1lbWJlciBhdCBpbmRleCBpXG4gICAgICAgICAgICBsZXQgbWVtYmVyID0gdGhpcy5tZW1iZXJzW2ldO1xuXG4gICAgICAgICAgICAvLyBMb29wIHRocm91Z2ggdGhlIGdyb3VwcyB0aGF0IHRoZSBtZW1iZXIgY29sbGlkZXMgd2l0aFxuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBtZW1iZXIuYm9keS5jb2xsaWRlc1dpdGgubGVuZ3RoOyBqKyspIHtcblxuICAgICAgICAgICAgICAgIC8vIEFycmF5IG9mIG1lbWJlcnMgb2YgdGhlIGdyb3VwXG4gICAgICAgICAgICAgICAgbGV0IGdyb3VwID0gdGhpcy5jb2xsaXNpb25Hcm91cHNbbWVtYmVyLmJvZHkuY29sbGlkZXNXaXRoW2pdXTtcblxuICAgICAgICAgICAgICAgIC8vIFJldHVybiB0aGUgaW5kZXggdGhhdCB0aGUgbWVtYmVyIGNvbGxpZGVzIHdpdGguXG4gICAgICAgICAgICAgICAgbGV0IGNvbGxpc2lvbkluZGV4ID0gLTE7XG5cblxuICAgICAgICAgICAgICAgIC8vIENoZWNrIGlmIGFueSBtZW1iZXIgb2YgdGhlIGdyb3VwIGludGVyc2VjdHMgdGhlIGN1cnJlbnQgbWVtZWJlclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGsgPSAwOyBrIDwgZ3JvdXAubGVuZ3RoOyBrKyspIHtcblxuXG4gICAgICAgICAgICAgICAgICAgIC8vIEhhcyB0aGlzIG1lbWJlciBhbHJlYWR5IGNvbGxpZGVkIHdpdGggdGhlIG90aGVyIG9iamVjdD9cbiAgICAgICAgICAgICAgICAgICAgbGV0IGhhc0FscmVhZHlDb2xsaWRlZCA9IHRoaXMuYWxyZWFkeUNvbGxpZGVkW21lbWJlci5jb2xsaXNpb25JbmRleF0gIT09IHVuZGVmaW5lZDtcblxuICAgICAgICAgICAgICAgICAgICAvLyBJcyBpdCBjb2xsaWRpbmcgd2l0aCBpdHNlbGY/XG4gICAgICAgICAgICAgICAgICAgIGxldCBpc0NvbGxpZGluZ1dpdGhTZWxmID0gZ3JvdXBba10uYm9keSA9PT0gbWVtYmVyLmJvZHk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gQ2hlY2sgZm9yIGNvbGxpc2lvbiBpZiBpdCdzIG5vdCB0aGUgc2FtZSBtZW1iZXIgd2UncmUgY2hlY2tpbmdcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFoYXNBbHJlYWR5Q29sbGlkZWQgJiYgIWlzQ29sbGlkaW5nV2l0aFNlbGYgJiYgR2FtZS5Db2xsaXNpb24uaW50ZXJzZWN0cyhncm91cFtrXS5ib2R5Lmdlb21ldHJ5LCBtZW1iZXIuYm9keS5nZW9tZXRyeSkpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ0NvbGxpc2lvbicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29sbGlzaW9uSW5kZXggPSBrO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBTdG9yZSB0aGUgaW5kZXggb2YgdGhlIGNvbGxpZGVkIG1lbWJlclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hbHJlYWR5Q29sbGlkZWRbZ3JvdXBba10uY29sbGlzaW9uSW5kZXhdID0gbWVtYmVyLmNvbGxpc2lvbkluZGV4O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBCcmVhayBkYW5jZVxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgfVxuXG5cbiAgICAgICAgICAgICAgICBpZiAoY29sbGlzaW9uSW5kZXggPiAtMSkge1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIFRoZSBjb2xsaXNpb24gbWVtYmVyIGJvZHlcbiAgICAgICAgICAgICAgICAgICAgbGV0IGNtYiA9IGdyb3VwW2NvbGxpc2lvbkluZGV4XS5ib2R5O1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIFRoZSBtZW1iZXIgYm9keVxuICAgICAgICAgICAgICAgICAgICBsZXQgbWIgPSBtZW1iZXIuYm9keTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZygnQ29sbGlzaW9uIHdpdGgnLCBtZW1iZXIuYm9keS5jb2xsaWRlc1dpdGhbal0pO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIEdldCB0aGUgZmluYWwgdmVsb2NpdHkgYmV0d2VlbiB0aGUgY29sbGlkaW5nIGNpcmNsZXNcbiAgICAgICAgICAgICAgICAgICAgaWYobWIuaXNCb3VuY3lDb2xsaWR5ICYmIGNtYi5pc0JvdW5jeUNvbGxpZHkpe1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGZpbmFsVmVsb2NpdGllcyA9IEdhbWUuUGh5c2ljcy5Db2xsaXNpb24obWVtYmVyLCBncm91cFtjb2xsaXNpb25JbmRleF0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBTZXQgdGhlIHZlbG9jaXRpZXMgb2YgdGhlIHR3byBvYmplY3RzXG4gICAgICAgICAgICAgICAgICAgICAgICBtYi5zZXRWZWxvY2l0eShmaW5hbFZlbG9jaXRpZXMudjEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY21iLnNldFZlbG9jaXR5KGZpbmFsVmVsb2NpdGllcy52Mik7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRlbXBvcmFyeSBmaW5hbCB2ZWxvY2l0eSBmaXhcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChtYi5maXhlZCkgbWIuc2V0VmVsb2NpdHkoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHg6IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeTogMFxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY21iLmZpeGVkKSBjbWIuc2V0VmVsb2NpdHkoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHg6IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeTogMFxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ0NvbGxpc2lvbiB3aXRoIGlubmVyIGd1dHRlcicsIG1iLCBjbWIpO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBcblxuXG5cbiAgICAgICAgICAgICAgICAgICAgLy8gTGV0IHRoZSBldmVudCBsaXN0ZW5lcnMga25vdyB0aGF0IGEgY29sbGlzaW9uIGhhcHBlbmVkXG4gICAgICAgICAgICAgICAgICAgIG1iLm9uQ29sbGlkZWQoZ3JvdXBbY29sbGlzaW9uSW5kZXhdKTtcbiAgICAgICAgICAgICAgICAgICAgY21iLm9uQ29sbGlkZWQobWVtYmVyKTtcblxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cblxuICAgIH1cblxufTsiLCIvKmdsb2JhbCBHYW1lKi9cbkdhbWUuUmVjdGFuZ2xlID0gY2xhc3MgUmVjdGFuZ2xle1xuICAgIFxuICAgIGNvbnN0cnVjdG9yKHgsIHksIHdpZHRoLCBoZWlnaHQsIGNvbG9yKXtcbiAgICAgICAgXG4gICAgICAgIHRoaXMueCA9IHg7XG4gICAgICAgIHRoaXMueSA9IHk7XG4gICAgICAgIHRoaXMud2lkdGggPSB3aWR0aDtcbiAgICAgICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgICAgIFxuICAgICAgICB0aGlzLmxlZnQgPSB4O1xuICAgICAgICB0aGlzLnJpZ2h0ID0geCArIHdpZHRoO1xuICAgICAgICB0aGlzLnRvcCA9IHk7XG4gICAgICAgIHRoaXMuYm90dG9tID0geSArIGhlaWdodDtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuY29sb3IgPSBjb2xvcjtcbiAgICAgICAgdGhpcy50eXBlID0gR2FtZS5Cb2R5VHlwZXMuUkVDVEFOR0xFO1xuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgY29udGFpbnMocG9pbnQpe1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIEdhbWUuQ29sbGlzaW9uLmNvbnRhaW5zUmVjdCh0aGlzLCBwb2ludCk7XG4gICAgICAgICAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIFxuICAgIGludGVyc2VjdHMob2JqKXtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBHYW1lLkNvbGxpc2lvbi5pbnRlcnNlY3RzKG9iaiwgdGhpcyk7XG4gICAgfVxuICAgIFxuICAgIFxuICAgIGRyYXcoY3R4LCBpbWFnZSl7XG4gICAgICAgIFxuICAgICAgICAvLyBEcmF3IHRoZSByZWN0XG4gICAgICAgIGlmKGltYWdlKXtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY3R4LmRyYXdJbWFnZShpbWFnZSwgdGhpcy54IC0gdGhpcy5yYWRpdXMsIHRoaXMueSAtIHRoaXMucmFkaXVzKTtcbiAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgICAgIGVsc2V7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICAgICAgICAgIGN0eC5yZWN0KHRoaXMueCwgdGhpcy55LCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XG4gICAgICAgICAgICBjdHguZmlsbFN0eWxlID0gdGhpcy5jb2xvcjtcbiAgICAgICAgICAgIGN0eC5maWxsKCk7XG4gICAgICAgICAgICBjdHguY2xvc2VQYXRoKCk7XG4gICAgICAgICAgICBcbiAgICAgICAgfVxuICAgICAgICBcbiAgICB9XG4gICAgXG59OyIsIi8qZ2xvYmFsIEdhbWUqL1xuY2xhc3MgU3ByaXRlc2hlZXR7XG4gICAgXG4gICAgY29uc3RydWN0b3IodGV4dHVyZSwgdGlsZVdpZHRoLCB0aWxlSGVpZ2h0LCB0aWxlUGFkZGluZyl7XG4gICAgICAgIFxuICAgICAgICB0aGlzLnRleHR1cmUgPSB0ZXh0dXJlO1xuICAgICAgICB0aGlzLnNwcml0ZVBvc2l0aW9ucyA9IFtdO1xuICAgICAgICB0aGlzLnRpbGVXaWR0aCA9IHRpbGVXaWR0aDtcbiAgICAgICAgdGhpcy50aWxlSGVpZ2h0ID0gdGlsZUhlaWdodDtcbiAgICAgICAgdGhpcy50aWxlUGFkZGluZyA9IHRpbGVQYWRkaW5nO1xuICAgICAgICBcbiAgICAgICAgdGhpcy5jYWxjdWxhdGVQb3NpdGlvbnMoKTtcbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIFxuICAgIC8qKlxuICAgICAqIENhbGN1bGF0ZSB0aGUgeCBhbmQgeSBwb3NpdGlvbnMgb2YgZWFjaCBvZiB0aGUgdGlsZXMgaW4gdGhlIHNwcml0ZXNoZWV0LlxuICAgICAqL1xuICAgIGNhbGN1bGF0ZVBvc2l0aW9ucygpe1xuICAgICAgICBcbiAgICAgICAgbGV0IG51bVggPSBNYXRoLmZsb29yKHRoaXMudGV4dHVyZS53aWR0aCAvIHRoaXMudGlsZVdpZHRoKTtcbiAgICAgICAgbGV0IG51bVkgPSBNYXRoLmZsb29yKHRoaXMudGV4dHVyZS5oZWlnaHQgLyB0aGlzLnRpbGVIZWlnaHQpO1xuXG4gICAgICAgIGZvcihsZXQgeT0wOyB5PG51bVk7IHkrKyl7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGZvcihsZXQgeD0wOyB4PG51bVg7IHgrKyl7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgdGhpcy5zcHJpdGVQb3NpdGlvbnMucHVzaChbeCAqIHRoaXMudGlsZVdpZHRoLCB5ICogdGhpcy50aWxlSGVpZ2h0XSk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgfVxuXG4gICAgfVxuICAgIFxuICAgIFxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBhbiBhbmltYXRpb24gZnJvbSB0aGUgc3VwcGxpZWQgc3ByaXRlc2hlZXQgdGV4dHVyZVxuICAgICAqL1xuICAgIG1ha2VBbmltYXRpb24obWluLCBtYXgsIGFuaW1hdGlvblRpbWUsIGJhY2tBbmRGb3J0aCl7XG4gICAgICAgIFxuICAgICAgICAvLyBHZXQgdGhlIGFycmF5IG9mIGZyYW1lcyBiZXR3ZWVuIG1pbiBhbmQgbWF4XG4gICAgICAgIGxldCBpbmRleGVzID0gR2FtZS5NYXRoZW1hdGljcy5yYW5nZShtaW4sIG1heCk7XG4gICAgICAgIFxuICAgICAgICAvLyBBZGQgdGhlIHJldmVyc2VkIGFycmF5IG1pbnVzIHN0YXJ0IGFuZCBlbmQgdG8gdGhlIGFycmF5IG9mIGZyYW1lc1xuICAgICAgICBpZihiYWNrQW5kRm9ydGgpIGluZGV4ZXMgPSBpbmRleGVzLmNvbmNhdChHYW1lLk1hdGhlbWF0aWNzLnJhbmdlKG1pbiArIDEsIG1heCAtIDEpLnJldmVyc2UoKSk7XG4gICAgICAgIFxuICAgICAgICAvLyBSZXR1cm4gYW4gYW5pbWF0aW9uIG9iamVjdFxuICAgICAgICByZXR1cm4gbmV3IEFuaW1hdGlvbih0aGlzLCBpbmRleGVzLCBhbmltYXRpb25UaW1lKTtcbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIFxuICAgIFxuICAgIC8qKlxuICAgICAqIFJlbmRlciBmcmFtZVxuICAgICAqL1xuICAgIHJlbmRlcihjdHgsIHgsIHksIGluZGV4KXtcbiAgICAgICAgXG4gICAgICAgIGN0eC5maWxsU3R5bGUgPSBcImJsYWNrXCI7XG4gICAgICAgIGN0eC5maWxsVGV4dChpbmRleC50b1N0cmluZygpLCB4ICsgdGhpcy50aWxlV2lkdGgvMiwgeSArIHRoaXMudGlsZUhlaWdodCArIDEwKTtcbiAgICAgICAgbGV0IGNsaXBwZWRQb3MgPSB0aGlzLnNwcml0ZVBvc2l0aW9uc1tpbmRleF07XG4gICAgICAgIFxuICAgICAgICBjdHguZHJhd0ltYWdlKHRoaXMudGV4dHVyZSwgY2xpcHBlZFBvc1swXSwgY2xpcHBlZFBvc1sxXSwgdGhpcy50aWxlV2lkdGgsIHRoaXMudGlsZUhlaWdodCwgeCwgeSwgdGhpcy50aWxlV2lkdGgsIHRoaXMudGlsZUhlaWdodCk7XG4gICAgICAgIFxuICAgIH1cbiAgICBcbn07Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
