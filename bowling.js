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
        
        this.image.src = 'assets/images/eyeball.png';
        
        
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
      
      
      
        this.input.addCallback('onmousedown', (pos) => {
            
            // console.log('Mouse position', pos);
            this.reset(pos);
            
        });
        

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
        
        
        
    },
    
    
    
    draw: function ()
    {
        
        this.ctx.fillStyle = 'lightblue';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        
        this.lane.draw(this.ctx);
        this.leftGutter.draw(this.ctx);
        this.rightGutter.draw(this.ctx);
        // this.outterLeftGutter.draw(this.ctx);
        // this.outterRightGutter.draw(this.ctx);
        
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
    
    
    reset: function(pos)
    {
        
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


        // First 9 frames
        for (let i = 0; i < 9; i++) {
            // Push empty array in frames
            this.frames.push({
                one: null,
                two: null,
                score: null,
            });
        }

        // Last frame
        this.frames.push({
            one: null,
            two: null,
            three: null,
            score: null
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
        // If user has scored a strike or end of frame
        else if (numPins === 10 || (frame.one !== null && frame.two !== null)) {

            // Increment frame
            this.currentFrame++;

        }

        
        frame.score = this.calculateScore();

    }

    calculateScore() {

        let sum = 0;

        for (let i in this.frames) {
            let f = this.frames[i];
            sum += f.one || 0;
            sum += f.two || 0;
            sum += f.three || 0;
        }

        return sum;

    }

    
    tenthFrameLogic(numPins) {
        // XXX, #/X, #/#, XX#, X##, X#/
        
        let frame = this.frames[this.currentFrame];
        
        if(frame.one === null)
        {
            frame.one = numPins;
        }
        else if(frame.two === null)
        {
            frame.two = numPins;
        }
        else if(frame.three === null)
        {
            if(frame.one === 10)
            {
                
            }
            if(frame.one + frame.two >= 10)
            {
                frame.three = numPins;
            }
        }
        
        
        // Bowl strike first bowl
        if(frame.one === 10){
            
            // Bowl strike second bowl
            if(frame.two === 10){
                
                
                
            }
            
            // Don't bowl strike second bowl
            else{
                
                
                
            }
                
        }
        // Bowl spare in first 2 bowls
        else if(frame.one + frame.two >= 10)
        {
            // Frame.three logic
            
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







            // Draw the SCORES
            ctx.fillStyle = 'black';
            ctx.font = "16px Arial";

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



            // Draw the total score so far
            ctx.font = "16px Arial";
            if (frame.score) {

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJvd2wvQmFsbC5qcyIsImJvd2wvR2FtZS5qcyIsImJvd2wvR3V0dGVyLmpzIiwiYm93bC9QaW4uanMiLCJib3dsL1Njb3JlQm9hcmQuanMiLCJib3dsL1Rlc3RDaXJjbGUuanMiLCJlbmdpbmUvQW5pbWF0aW9uLmpzIiwiZW5naW5lL0JvZHkuanMiLCJlbmdpbmUvQm9keVR5cGVzLmpzIiwiZW5naW5lL0NpcmNsZS5qcyIsImVuZ2luZS9Db2xsaXNpb24uanMiLCJlbmdpbmUvSW5wdXQuanMiLCJlbmdpbmUvTWF0aGVtYXRpY3MuanMiLCJlbmdpbmUvUGh5c2ljcy5qcyIsImVuZ2luZS9QaHlzaWNzTWFuYWdlci5qcyIsImVuZ2luZS9SZWN0YW5nbGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVRQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeE9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3RGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwUUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM3Q0E7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM3S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDL0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDOUtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiYm93bGluZy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qZ2xvYmFsIEdhbWUqL1xuXG5jbGFzcyBCYWxse1xuICAgIFxuICAgIGNvbnN0cnVjdG9yKHgsIHksIGNvbG9yKXtcbiAgICAgICAgXG4gICAgICAgIC8vIENvbG9yIG9mIGJhbGxcbiAgICAgICAgdGhpcy5jb2xvciA9IGNvbG9yO1xuICAgICAgICBcbiAgICAgICAgLy8gTWFzcyBvZiB0aGUgYmFsbFxuICAgICAgICB0aGlzLm1hc3MgPSA3LjI1ICogMTtcbiAgICAgICAgXG4gICAgICAgIC8vIENvbG9yIHdoZW4gbW91c2UgaXMgaG92ZXJpbmdcbiAgICAgICAgdGhpcy5ob3ZlckNvbG9yID0gXCIjMTcyMDJBXCI7XG4gICAgICAgIFxuICAgICAgICAvLyBCb29sZWFuIHRvIHNlZSBpZiB0aGUgYmFsbCBpcyByb2xsaW5nXG4gICAgICAgIHRoaXMuaXNSb2xsaW5nID0gdHJ1ZTtcbiAgICAgICAgXG4gICAgICAgIC8vIENoZWNrIGlmIHRoZSBiYWxsIGlzIGhlbGQgYnkgdGhlIG1vdXNlXG4gICAgICAgIHRoaXMuaXNHcmFiYmVkID0gZmFsc2U7XG4gICAgICAgIFxuICAgICAgICAvLyBCb29sZWFuIGZvciB3aGVuIHRoZSBiYWxsIGlzIGJlaW5nIGhvdmVyZWQgb3ZlclxuICAgICAgICB0aGlzLmlzSG92ZXJpbmcgPSBmYWxzZTtcbiAgICAgICAgXG4gICAgICAgIC8vIEFsbCBtb3VzZSBob2xkaW5nIGluZm9cbiAgICAgICAgdGhpcy5ob2xkID0ge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBwb3NpdGlvbnM6IFtdLFxuICAgICAgICAgICAgdGltZXM6IFtdLFxuICAgICAgICAgICAgXG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvLyBNYWtlIGRhIGJvZHlcbiAgICAgICAgdGhpcy5ib2R5ID0gbmV3IEdhbWUuQm9keSh7eDp4LCB5Onl9LCB7eDogMCwgeTogMH0sIHRoaXMubWFzcywgR2FtZS5Cb2R5VHlwZXMuQ0lSQ0xFKTtcbiAgICAgICAgXG4gICAgICAgIC8vIFNldCBtYXggc3BlZWRcbiAgICAgICAgdGhpcy5ib2R5Lm1heFNwZWVkID0gMjA7XG4gICAgICAgIFxuICAgICAgICAvLyBDcmVhdGUgdGhlIGNpcmNsZSBnZW9tZXRyeVxuICAgICAgICB0aGlzLmJvZHkuY3JlYXRlR2VvbWV0cnkoJ2NpcmNsZScsIHtyYWRpdXM6IDIwfSk7XG4gICAgICAgIFxuICAgICAgICAvLyBTZXQgdGhlIGNvbGxpc2lvbiBncm91cCB0byBiZSBwaW5zXG4gICAgICAgIHRoaXMuYm9keS5zZXRDb2xsaXNpb25Hcm91cHMoWydwaW5zJyAsJ2d1dHRlcnMnXSk7XG4gICAgICAgIFxuICAgICAgICB0aGlzLmJvZHkuYW5ndWxhclZlbCA9IDAuMDU7XG4gICAgICAgIFxuICAgICAgICB0aGlzLmJvZHkub25Db2xsaWRlZCA9IHRoaXMub25Db2xsaWRlZC5iaW5kKHRoaXMpO1xuICAgICAgICBcbiAgICAgICAgLy8gQWRkIHRoZSBtZW1lYmVyXG4gICAgICAgIEdhbWUucGh5c2ljcy5hZGRNZW1iZXIodGhpcyk7XG4gICAgICAgIFxuICAgICAgICAvLyBBZGQgdG8gYmFsbHMgZ3JvdXBcbiAgICAgICAgR2FtZS5waHlzaWNzLmFkZFRvR3JvdXAoJ2JhbGxzJywgdGhpcyk7XG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgR2FtZS5pbnB1dC5hZGRDYWxsYmFjaygnb25tb3VzZW1vdmUnLCAocG9zKSA9PiB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMubW92ZShwb3MpO1xuICAgICAgICAgICAgXG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgR2FtZS5pbnB1dC5hZGRDYWxsYmFjaygnb25tb3VzZWRvd24nLCAocG9zKSA9PiB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMuZ3JhYihwb3MpO1xuICAgICAgICAgICAgLy8gdGhpcy5yZXNldChwb3MpO1xuICAgICAgICAgICAgXG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgR2FtZS5pbnB1dC5hZGRDYWxsYmFjaygnb25tb3VzZXVwJywgKHBvcykgPT4ge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB0aGlzLnJlbGVhc2UocG9zKTtcbiAgICAgICAgICAgIFxuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIEdhbWUuaW5wdXQuYWRkQ2FsbGJhY2soJ29ubW91c2Vtb3ZlJywgKHBvcykgPT4ge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB0aGlzLmhvdmVyQ2hlY2socG9zKTtcbiAgICAgICAgICAgIFxuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICAvLyBsb2FkIGltYWdlIGZyb20gZGF0YSB1cmxcbiAgICAgICAgdGhpcy5pbWFnZSA9IG5ldyBJbWFnZSgpO1xuICAgICAgICBcbiAgICAgICAgdGhpcy5pbWFnZS5zcmMgPSAnYXNzZXRzL2ltYWdlcy9leWViYWxsLnBuZyc7XG4gICAgICAgIFxuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgXG4gICAgXG4gICAgb25Db2xsaWRlZChtZW1iZXIpe1xuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIGlmKG1lbWJlci50eXBlID09PSAnaW5uZXInKXtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmKG1lbWJlci50eXBlID09PSAncmFpbCcpe1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB0aGlzLmJvZHkuc2V0VmVsb2NpdHkoe3g6IDAsIHk6IHRoaXMuYm9keS52ZWwueSA8IC0wLjUgPyB0aGlzLmJvZHkudmVsLnkgOiAtMX0pO1xuICAgICAgICAgICAgXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIFxuICAgIH1cbiAgICBcbiAgICBcbiAgICB1cGRhdGUoZGVsdGEpe1xuICAgICAgICBcbiAgICAgICAgLy8gSWYgdGhlIGJvd2xpbmcgYmFsbCBpcyByb2xsaW5nIVxuICAgICAgICBpZih0aGlzLmlzUm9sbGluZyl7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIE1vdmUgdGhlIGJhbGxcbiAgICAgICAgICAgIHRoaXMuYm9keS51cGRhdGUoZGVsdGEpO1xuICAgICAgICAgICAgXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIFxuICAgIGRyYXcoY3R4KXtcbiAgICAgICAgXG4gICAgICAgIC8vIFNldCB0aGUgY29sb3Igb2YgdGhlIGJhbGxcbiAgICAgICAgY3R4LmZpbGxTdHlsZSA9IHRoaXMuaXNIb3ZlcmluZyA/IHRoaXMuaG92ZXJDb2xvciA6IHRoaXMuY29sb3I7XG4gICAgICAgIFxuICAgICAgICAvLyBTYXZlIGNvbnRleHRcbiAgICAgICAgY3R4LnNhdmUoKTtcbiAgICAgICAgXG4gICAgICAgIC8vIFRyYW5zbGF0ZSB0aGUgY29udGV4dCBhcm91bmQgcm90YXRpb24gY2VudGVyXG4gICAgICAgIGN0eC50cmFuc2xhdGUodGhpcy5ib2R5Lmdlb21ldHJ5LngsIHRoaXMuYm9keS5nZW9tZXRyeS55KTtcbiAgICAgICAgXG4gICAgICAgIC8vIFJvdGF0ZSB0aGUgY2lyY2xlXG4gICAgICAgIGN0eC5yb3RhdGUodGhpcy5ib2R5LmFuZ2xlKTtcbiAgICAgICAgXG4gICAgICAgIC8vIFRyYW5zbGF0ZSBiYWNrIHRvIHdoZXJlIHdlIHdlcmUgYmVmb3JlXG4gICAgICAgIGN0eC50cmFuc2xhdGUoLXRoaXMuYm9keS5nZW9tZXRyeS54LCAtdGhpcy5ib2R5Lmdlb21ldHJ5LnkpO1xuICAgICAgICBcbiAgICAgICAgLy8gRHJhdyB0aGUgY2lyY2xlXG4gICAgICAgIHRoaXMuYm9keS5nZW9tZXRyeS5kcmF3KGN0eCwgdGhpcy5pbWFnZSk7XG4gICAgICAgIFxuICAgICAgICAvLyBSZXN0b3JlIGNvbnRleHRcbiAgICAgICAgY3R4LnJlc3RvcmUoKTtcbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIFxuICAgIHJlY29yZChwb3Mpe1xuICAgICAgICBcbiAgICAgICAgdGhpcy5ob2xkLnBvc2l0aW9ucy5wdXNoKHBvcyk7XG4gICAgICAgIHRoaXMuaG9sZC50aW1lcy5wdXNoKHBlcmZvcm1hbmNlLm5vdygpKTtcbiAgICAgICAgXG4gICAgICAgIGlmKHRoaXMuaG9sZC5wb3NpdGlvbnMubGVuZ3RoID4gMjApe1xuICAgICAgICAgICAgdGhpcy5ob2xkLnBvc2l0aW9ucy5zaGlmdCgpO1xuICAgICAgICAgICAgdGhpcy5ob2xkLnRpbWVzLnNoaWZ0KCk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIGNhbGN1bGF0ZVZlbG9jaXR5KCkge1xuICAgICAgICBcbiAgICAgICAgbGV0IHBzID0gdGhpcy5ob2xkLnBvc2l0aW9uczsgLy8gaG9sZCBwb3NpdGlvbnNcbiAgICAgICAgLy8gbGV0IHRzID0gdGhpcy5ob2xkLnRpbWVzOyAvLyBob2xkIHRpbWVzXG4gICAgICAgIFxuICAgICAgICBsZXQgc3VtX3ggPSAwO1xuICAgICAgICBsZXQgc3VtX3kgPSAwO1xuICAgICAgICBcbiAgICAgICAgLy8gVGhlIG51bWJlciBvZiBwb2ludHMgdG8gYXZlcmFnZVxuICAgICAgICBsZXQgbnVtUG9pbnRzID0gMjtcbiAgICAgICAgXG4gICAgICAgIGxldCBuZXdfcHMgPSBwcy5zcGxpY2UocHMubGVuZ3RoIC0gMSAtIG51bVBvaW50cyk7XG4gICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCBudW1Qb2ludHM7IGkrKyl7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGxldCBsYXN0UG9zaXRpb24gPSBuZXdfcHNbaSArIDFdO1xuICAgICAgICAgICAgbGV0IHNlY29uZExhc3RQb3NpdGlvbiA9IG5ld19wc1tpXTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYobGFzdFBvc2l0aW9uID09PSB1bmRlZmluZWQpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1RoZXJlIGlzIG5vIGxhc3QgcG9zaXRpb24sIERpbmd1cycsIGxhc3RQb3NpdGlvbik7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgcmV0dXJuIHt4OiAwLCB5OiAwfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgc3VtX3ggKz0gKGxhc3RQb3NpdGlvbi54IC0gc2Vjb25kTGFzdFBvc2l0aW9uLngpO1xuICAgICAgICAgICAgc3VtX3kgKz0gKGxhc3RQb3NpdGlvbi55IC0gc2Vjb25kTGFzdFBvc2l0aW9uLnkpO1xuICAgICAgICAgICAgXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICBsZXQgdmVsID0ge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB4OiBzdW1feC9udW1Qb2ludHMsXG4gICAgICAgICAgICB5OiBzdW1feS9udW1Qb2ludHNcbiAgICAgICAgICAgIFxuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgY29uc29sZS5sb2codmVsKTtcbiAgICAgICAgXG4gICAgICAgIC8vIFR3byBwb2ludCBkaWZmZXJlbmNlXG4gICAgICAgIC8qIGxldCBsYXN0UG9zaXRpb24gPSBwc1twcy5sZW5ndGggLSAxXTtcbiAgICAgICAgbGV0IHNlY29uZExhc3RQb3NpdGlvbiA9IHBzW3BzLmxlbmd0aCAtIDJdO1xuICAgICAgICBcbiAgICAgICAgdmVsID0ge1xuICAgICAgICAgICAgeDogbGFzdFBvc2l0aW9uLnggLSBzZWNvbmRMYXN0UG9zaXRpb24ueCxcbiAgICAgICAgICAgIHk6IGxhc3RQb3NpdGlvbi55IC0gc2Vjb25kTGFzdFBvc2l0aW9uLnlcbiAgICAgICAgfTtcbiAgICAgICAgY29uc29sZS5sb2codmVsKTsqL1xuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gdmVsO1xuICAgIH1cbiAgICBcbiAgICBcbiAgICBncmFiKHBvcyl7XG4gICAgXG4gICAgICAgIGlmKHRoaXMuYm9keS5nZW9tZXRyeS5jb250YWlucyhwb3MpKXtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy5ib2R5LnNldFZlbG9jaXR5KHt4OjAsIHk6MH0pO1xuICAgICAgICAgICAgdGhpcy5pc0dyYWJiZWQgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5ob2xkLnN0YXJ0VGltZSA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICAgICAgICAgICAgdGhpcy5ob2xkLnBvc2l0aW9ucyA9IFtdO1xuICAgICAgICAgICAgXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIFxuICAgIG1vdmUocG9zKXtcbiAgICAgICAgXG4gICAgICAgIGlmKHRoaXMuaXNHcmFiYmVkKVxuICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLnJlY29yZChwb3MpO1xuICAgICAgICAgICAgdGhpcy5ib2R5LnNldFBvc2l0aW9uKHBvcyk7XG4gICAgICAgICAgICBcbiAgICAgICAgfVxuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgXG4gICAgcmVsZWFzZShwb3Mpe1xuICAgICAgICBcbiAgICAgICAgaWYodGhpcy5pc0dyYWJiZWQpe1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB0aGlzLmlzR3JhYmJlZCA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5pc1JvbGxpbmcgPSB0cnVlO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBsZXQgdiA9IHRoaXMuY2FsY3VsYXRlVmVsb2NpdHkoKTtcbiAgICAgICAgICAgIHRoaXMuYm9keS5zZXRWZWxvY2l0eSh2KTtcbiAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgICAgIFxuICAgIH1cbiAgICBcbiAgICBcbiAgICBob3ZlckNoZWNrKHBvcyl7XG4gICAgICAgIFxuICAgICAgICB0aGlzLmlzSG92ZXJpbmcgPSBmYWxzZTtcbiAgICAgICAgXG4gICAgICAgIGlmKHRoaXMuYm9keS5nZW9tZXRyeS5jb250YWlucyhwb3MpKXtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy5pc0hvdmVyaW5nID0gdHJ1ZTtcbiAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgICAgIFxuICAgIH1cbiAgICBcbn0iLCIvKmdsb2JhbCBCYWxsIFBpbiBTY29yZUJvYXJkKi9cblxubGV0IEdhbWUgPSB7XG4gICAgXG4gICAgc3RhcnQ6IG51bGwsXG4gICAgZW5kOiBudWxsLFxuICAgIFxuICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uKClcbiAgICB7XG4gICAgICAgIC8vIEhhbmRsZXMgaW5wdXQgZXZlbnRzXG4gICAgICAgIHRoaXMuaW5wdXQgPSBuZXcgR2FtZS5JbnB1dCgpO1xuICAgICAgICBHYW1lLnBoeXNpY3MgPSBuZXcgR2FtZS5QaHlzaWNzTWFuYWdlcigpO1xuICAgICAgICBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgLy8gR2V0IHRoZSBjYW52YXMgYW5kIGNvbnRleHRcbiAgICAgICAgdGhpcy5jYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYm93bGluZycpO1xuICAgICAgICB0aGlzLmN0eCA9IHRoaXMuY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG5cbiAgICAgICAgdGhpcy53aWR0aCA9IDQwMDtcbiAgICAgICAgdGhpcy5oZWlnaHQgPSA4MDA7XG4gICAgICAgIFxuICAgICAgICAvLyBDYW52YXMgaGVpZ2h0IGFuZCB3aWR0aFxuICAgICAgICB0aGlzLmNhbnZhcy53aWR0aCA9IHRoaXMud2lkdGg7XG4gICAgICAgIHRoaXMuY2FudmFzLmhlaWdodCA9IHRoaXMuaGVpZ2h0O1xuICAgICAgICBcbiAgICAgICAgLy8gQXJyYXkgdG8gc3RvcmUgYWxsIHRoZSBwaW5zXG4gICAgICAgIHRoaXMucGlucyA9IFtdO1xuICAgICAgICBcbiAgICAgICAgLy8gV2lkdGggYW5kIGhlaWdodCBvZiBwaW5zXG4gICAgICAgIHRoaXMucGluV2lkdGggPSAyMDtcbiAgICAgICAgLy8gdGhpcy5waW5IZWlnaHQgPSBNYXRoLlBJICogdGhpcy5waW5XaWR0aDtcbiAgICAgICAgdGhpcy5waW5IZWlnaHQgPSA0NjtcbiAgICAgICAgXG4gICAgICAgIC8vIEJvd2xpbmcgYmFsbFxuICAgICAgICB0aGlzLmJhbGwgPSBuZXcgQmFsbCh0aGlzLndpZHRoLzIsIHRoaXMuaGVpZ2h0IC0gNjAsIFwiYmxhY2tcIik7XG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgdGhpcy5zY29yZWJvYXJkID0gbmV3IFNjb3JlQm9hcmQoKTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuc2V0UGlucygpO1xuICAgICAgICBcbiAgICAgICAgXG5cbiAgICAgICAgXG4gICAgICAgIHRoaXMubGFuZSA9IG5ldyBHYW1lLlJlY3RhbmdsZSgxMTAsIDAsIDE4MCwgNjUwLCBcInJnYmEoMTUzLCA4NSwgNDUsIDEpXCIpO1xuICAgICAgICB0aGlzLmxlZnRHdXR0ZXIgPSBuZXcgR2FtZS5HdXR0ZXIoNzUsIDAsIFwibGVmdFwiKTtcbiAgICAgICAgdGhpcy5yaWdodEd1dHRlciA9IG5ldyBHYW1lLkd1dHRlcigyOTAsIDAsIFwicmlnaHRcIik7XG4gICAgICAgIFxuICAgICAgICB0aGlzLnJlc2V0QnV0dG9uID0gbmV3IEdhbWUuUmVjdGFuZ2xlKDAsIDAsIDY4LCA1MCwgXCJyZ2JhKDE1LCA4NSwgNSwgMSlcIik7XG4gICAgICAgIHRoaXMucmVzZXRCYWxsID0gbmV3IEdhbWUuUmVjdGFuZ2xlKDAsIDUwLCA2OCwgNTAsIFwicmdiYSgxLCA4NSwgMTc1LCAxKVwiKTtcbiAgICAgICAgXG5cbiAgICAgIC8vICB0aGlzLmlucHV0Lmxpc3Rlbih0aGlzLmNhbnZhcyk7XG4gICAgICBcbiAgICAgIFxuICAgICAgXG4gICAgICAgIHRoaXMuaW5wdXQuYWRkQ2FsbGJhY2soJ29ubW91c2Vkb3duJywgKHBvcykgPT4ge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZygnTW91c2UgcG9zaXRpb24nLCBwb3MpO1xuICAgICAgICAgICAgdGhpcy5yZXNldChwb3MpO1xuICAgICAgICAgICAgXG4gICAgICAgIH0pO1xuICAgICAgICBcblxuICAgIH0sXG4gICAgXG4gICAgXG4gICAgdXBkYXRlOiBmdW5jdGlvbiAoZGVsdGEpXG4gICAge1xuICAgICAgICAvLyBNb3ZlIHRoZSBiYWxsXG4gICAgICAgIHRoaXMuYmFsbC51cGRhdGUoZGVsdGEpO1xuICAgICAgICBcbiAgICAgICAgZm9yKGxldCBwID0gMDsgcCA8IHRoaXMucGlucy5sZW5ndGg7IHArKylcbiAgICAgICAge1xuICAgICAgICAgICAgdGhpcy5waW5zW3BdLnVwZGF0ZShkZWx0YSk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICBHYW1lLnBoeXNpY3MudXBkYXRlKGRlbHRhKTtcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICBcbiAgICB9LFxuICAgIFxuICAgIFxuICAgIFxuICAgIGRyYXc6IGZ1bmN0aW9uICgpXG4gICAge1xuICAgICAgICBcbiAgICAgICAgdGhpcy5jdHguZmlsbFN0eWxlID0gJ2xpZ2h0Ymx1ZSc7XG4gICAgICAgIHRoaXMuY3R4LmZpbGxSZWN0KDAsIDAsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICB0aGlzLmxhbmUuZHJhdyh0aGlzLmN0eCk7XG4gICAgICAgIHRoaXMubGVmdEd1dHRlci5kcmF3KHRoaXMuY3R4KTtcbiAgICAgICAgdGhpcy5yaWdodEd1dHRlci5kcmF3KHRoaXMuY3R4KTtcbiAgICAgICAgLy8gdGhpcy5vdXR0ZXJMZWZ0R3V0dGVyLmRyYXcodGhpcy5jdHgpO1xuICAgICAgICAvLyB0aGlzLm91dHRlclJpZ2h0R3V0dGVyLmRyYXcodGhpcy5jdHgpO1xuICAgICAgICBcbiAgICAgICAgdGhpcy5yZXNldEJ1dHRvbi5kcmF3KHRoaXMuY3R4KTtcbiAgICAgICAgdGhpcy5yZXNldEJhbGwuZHJhdyh0aGlzLmN0eCk7XG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIHRoaXMuY3R4LmZvbnQgPSBcIjIwcHggQXJpYWxcIjtcbiAgICAgICAgdGhpcy5jdHguZmlsbFN0eWxlID0gXCJ5ZWxsb3dcIjtcbiAgICAgICAgdGhpcy5jdHguZmlsbFRleHQoXCJSRVNFVFwiLCAwLCAzMCk7XG4gICAgICAgIHRoaXMuY3R4LmZpbGxUZXh0KFwiQkFMTFwiLCAwLCA3NSlcbiAgICAgICAgXG4gICAgICAgIGZvcih2YXIgaSA9IHRoaXMucGlucy5sZW5ndGggLSAxOyBpID4gLTE7IGktLSl7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMucGluc1tpXS5kcmF3KHRoaXMuY3R4KTtcbiAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICB0aGlzLmJhbGwuZHJhdyh0aGlzLmN0eCk7XG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgdGhpcy5zY29yZWJvYXJkLmRyYXcoMCwgMTIwLCB0aGlzLmN0eCk7XG4gICAgICAgIFxuICAgIH0sXG4gICAgXG4gICAgXG4gICAgZ2FtZUxvb3A6IGZ1bmN0aW9uICh0aW1lc3RhbXApXG4gICAge1xuICAgICAgICBcbiAgICAgICAgLy8gU3RhcnRpbmcgdGltZXN0YW1wXG4gICAgICAgIHRoaXMuc3RhcnQgPSB0aW1lc3RhbXA7XG4gICAgICAgIFxuICAgICAgICAvLyBEZXRlcm1pbmUgdGhlIGRlbHRhIHRpbWVcbiAgICAgICAgbGV0IGRlbHRhVGltZSA9IHRoaXMuc3RhcnQgLSB0aGlzLmVuZDtcbiAgICBcdCAgICBcbiAgICBcdCAgICBcbiAgICAgICAgdGhpcy51cGRhdGUoZGVsdGFUaW1lKTtcbiAgICAgICAgdGhpcy5kcmF3KCk7XG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgLy8gRW5kaW5nIHRpbWVzdGFtcFxuICAgIFx0dGhpcy5lbmQgPSB0aW1lc3RhbXA7XG4gICAgICAgIFxuICAgICAgICAvKlxuICAgIFx0ICogVGhlIGdhbWVMb29wKCkgZnVuY3Rpb24gaXMgbm93IGdldHRpbmcgZXhlY3V0ZWQgYWdhaW4gYW5kIGFnYWluIHdpdGhpbiBhIHJlcXVlc3RBbmltYXRpb25GcmFtZSgpIGxvb3AsIFxuICAgIFx0ICogd2hlcmUgd2UgYXJlIGdpdmluZyBjb250cm9sIG9mIHRoZSBmcmFtZXJhdGUgYmFjayB0byB0aGUgYnJvd3Nlci4gXG4gICAgXHQgKiBJdCB3aWxsIHN5bmMgdGhlIGZyYW1lcmF0ZSBhY2NvcmRpbmdseSBhbmQgcmVuZGVyIHRoZSBzaGFwZXMgb25seSB3aGVuIG5lZWRlZC4gXG4gICAgXHQgKiBUaGlzIHByb2R1Y2VzIGEgbW9yZSBlZmZpY2llbnQsIHNtb290aGVyIGFuaW1hdGlvbiBsb29wIHRoYW4gdGhlIG9sZGVyIHNldEludGVydmFsKCkgbWV0aG9kLlxuICAgIFx0Ki9cbiAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMuZ2FtZUxvb3AuYmluZCh0aGlzKSk7XG4gICAgfSxcbiAgICBcbiAgICBcbiAgICByZXNldDogZnVuY3Rpb24ocG9zKVxuICAgIHtcbiAgICAgICAgXG4gICAgICAgIC8vIElmIG1vdXNlIGlzIG9uIHJlc2V0IGJ1dHRvblxuICAgICAgICBpZihHYW1lLnJlc2V0QnV0dG9uLmNvbnRhaW5zKHBvcykpXG4gICAgICAgIHtcbiAgICAgICAgICAgIC8vIFJlc2V0IGJhbGwgdmVsb2NpdHkgYW5kIHBvc2l0aW9uXG4gICAgICAgICAgICBHYW1lLmJhbGwuYm9keS5zZXRWZWxvY2l0eSh7eDogMCwgeTogMH0pO1xuICAgICAgICAgICAgR2FtZS5iYWxsLmJvZHkuc2V0UG9zaXRpb24oe3g6IEdhbWUud2lkdGgvMiwgeTogR2FtZS5oZWlnaHQgLSA2MH0pO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgR2FtZS5yZXNldFBpbnMoKTtcbiAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZihHYW1lLnJlc2V0QmFsbC5jb250YWlucyhwb3MpKVxuICAgICAgICB7XG4gICAgICAgICAgICAvLyBSZXNldCBiYWxsIHZlbG9jaXR5IGFuZCBwb3NpdGlvblxuICAgICAgICAgICAgR2FtZS5iYWxsLmJvZHkuc2V0VmVsb2NpdHkoe3g6IDAsIHk6IDB9KTtcbiAgICAgICAgICAgIEdhbWUuYmFsbC5ib2R5LnNldFBvc2l0aW9uKHt4OiBHYW1lLndpZHRoLzIsIHk6IEdhbWUuaGVpZ2h0IC0gNjB9KTtcbiAgICAgICAgICAgIEdhbWUuc2NvcmVib2FyZC5hZGRTY29yZShHYW1lLnBpbnMuZmlsdGVyKChwKSA9PiB7cmV0dXJuICFwLmlzU3RhbmRpbmc7IH0pLmxlbmd0aCk7XG4gICAgICAgICAgICBcbiAgICAgICAgfVxuICAgICAgICBcbiAgICB9LFxuICAgIFxuICAgIHNldFBpbnM6IGZ1bmN0aW9uKClcbiAgICB7XG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgdmFyIHBpbkluUm93ID0gLTE7XG4gICAgICAgIC8vIExvb3AgdGhyb3VnaCAxMCBwaW5zXG4gICAgICAgIGZvcihsZXQgcCA9IDEwLCB5ID0gMzsgcCA+IDA7IHAtLSlcbiAgICAgICAge1xuICAgICAgICAgICAgaWYocCA9PSA0IHx8IHAgPT0gNyB8fCBwID09IDkpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcGluSW5Sb3cgPSAtMTtcbiAgICAgICAgICAgICAgICB5LS07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHBpbkluUm93ICsrO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBsZXQgZHggPSA0MDtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gUHVzaCBkYXQgcGluXG4gICAgICAgICAgICB0aGlzLnBpbnMucHVzaChuZXcgUGluKHRoaXMud2lkdGgvMiAtIHRoaXMucGluV2lkdGgvMiArICgoeSAtIDMpICogMjAgKyAocGluSW5Sb3cgKiBkeCkpLCBcbiAgICAgICAgICAgICAgICAoMjAwKSArICh5IC0gMykgKiA1MCwgXG4gICAgICAgICAgICAgICAgdGhpcy5waW5XaWR0aCwgdGhpcy5waW5IZWlnaHQpKTtcbiAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgICAgIFxuICAgIH0sXG4gICAgXG4gICAgXG4gICAgcmVzZXRQaW5zOiBmdW5jdGlvbigpXG4gICAge1xuICAgICAgICBcbiAgICAgICAgZm9yKGxldCBwIGluIEdhbWUucGlucyl7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIEdhbWUucGluc1twXS5yZXNldCgpO1xuICAgICAgICAgICAgXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgfVxuXG5cbn07XG5cblxuLypcblxuLy8gRHJhdyByZWN0IG91dGxpbmVcbmN0eC5iZWdpblBhdGgoKTtcbmN0eC5yZWN0KHgsIHksIHdpZHRoLCBoZWlnaHQpO1xuY3R4LnN0cm9rZVN0eWxlID0gXCJyZ2JhKDIsIDE4LCA4LCAxKVwiO1xuY3R4LnN0cm9rZSgpO1xuY3R4LmNsb3NlUGF0aCgpO1xuXG4vLyBEcmF3IHRleHRcbmN0eC5mb250ID0gXCIyMHB4IEFyaWFsXCI7XG5jdHguZmlsbFN0eWxlID0gXCJibGFja1wiO1xuY3R4LmZpbGxUZXh0KFwiVGV4dCBnb2VzIGhlcmVcIiwgeCwgeSk7Ki8iLCIvKmdsb2JhbCBHYW1lKi9cblxuLypcbiAqIFJhaWwgaXMgdGhlIGVkZ2Ugb2YgdGhlIGd1dHRlciwgaW5uZXIgaXMgdGhlIGd1dHRlciBpdHNlbGYuXG4gKlxuICovXG5HYW1lLkd1dHRlciA9IGNsYXNzIEd1dHRlcntcbiAgICBcbiAgICBjb25zdHJ1Y3Rvcih4LCB5LCBzaWRlKVxuICAgIHtcblxuICAgICAgICAvLyBJbmZpbml0ZSBtYXNzXG4gICAgICAgIHRoaXMubWFzcyA9IE51bWJlci5ORUdBVElWRV9JTkZJTklUWSAqIC0xO1xuICAgICAgICBcbiAgICAgICAgLy8gV2lkdGggb2YgZ3V0dGVyXG4gICAgICAgIHRoaXMuaW5uZXJXaWR0aCA9IDQwO1xuICAgICAgICBcbiAgICAgICAgLy8gV2lkdGggb2YgZWRnZVxuICAgICAgICB0aGlzLnJhaWxXaWR0aCA9IDQ7XG4gICAgICAgIFxuICAgICAgICAvLyBIZWlnaHQgb2YgbGFuZVxuICAgICAgICB0aGlzLmhlaWdodCA9IDY1MDtcbiAgICAgICAgXG4gICAgICAgIC8vIENvbG9yc1xuICAgICAgICB0aGlzLmlubmVyQ29sb3IgPSBcInJnYmEoMTU1LCAxNTUsIDE1NSwgMSlcIjtcbiAgICAgICAgdGhpcy5yYWlsQ29sb3IgPSBcInJnYmEoMTAwLCAxMDAsIDEwMCwgMSlcIjtcbiAgICAgICAgXG4gICAgICAgIC8vIElmIGxlZnQgc2lkZVxuICAgICAgICBpZihzaWRlID09PSAnbGVmdCcpe1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBNYWtlIHRoZSByZWN0c1xuICAgICAgICAgICAgdGhpcy5pbm5lciA9IG5ldyBHYW1lLlJlY3RhbmdsZSh4LCB5LCB0aGlzLmlubmVyV2lkdGgsIHRoaXMuaGVpZ2h0LCB0aGlzLmlubmVyQ29sb3IpO1xuICAgICAgICAgICAgdGhpcy5yYWlsID0gbmV3IEdhbWUuUmVjdGFuZ2xlKHgsIHksIHRoaXMucmFpbFdpZHRoLCB0aGlzLmhlaWdodCwgdGhpcy5yYWlsQ29sb3IpO1xuICAgICAgICAgICAgXG4gICAgICAgIH1cbiAgICAgICAgLy8gRWxzZSByaWdodCBzaWRlXG4gICAgICAgIGVsc2V7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIE1ha2UgdGhlIHJlY3RzXG4gICAgICAgICAgICB0aGlzLmlubmVyID0gbmV3IEdhbWUuUmVjdGFuZ2xlKHgsIHksIHRoaXMuaW5uZXJXaWR0aCwgdGhpcy5oZWlnaHQsIHRoaXMuaW5uZXJDb2xvcik7XG4gICAgICAgICAgICB0aGlzLnJhaWwgPSBuZXcgR2FtZS5SZWN0YW5nbGUoeCArIHRoaXMuaW5uZXJXaWR0aCAtIHRoaXMucmFpbFdpZHRoLCB5LCB0aGlzLnJhaWxXaWR0aCwgdGhpcy5oZWlnaHQsIHRoaXMucmFpbENvbG9yKTtcbiAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICB0aGlzLmlubmVyLnR5cGUgPSAnaW5uZXInO1xuICAgICAgICB0aGlzLnJhaWwudHlwZSA9ICdyYWlsJztcbiAgICAgICAgXG4gICAgICAgIC8vIE1ha2UgYSBib2R5IGZvciB0aGUgcmFpbFxuICAgICAgICB0aGlzLnJhaWwuYm9keSA9IG5ldyBHYW1lLkJvZHkoe3g6IHRoaXMucmFpbC54LCB5OiB0aGlzLnJhaWwueX0sIHt4OiAwLCB5OiAwfSwgdGhpcy5tYXNzLCBHYW1lLkJvZHlUeXBlcy5SRUNUQU5HTEUpO1xuICAgICAgICBcbiAgICAgICAgLy8gU2V0IGl0IHRvIGJlIGZpeGVkXG4gICAgICAgIHRoaXMucmFpbC5ib2R5LmZpeGVkID0gdHJ1ZTtcbiAgICAgICAgXG4gICAgICAgIC8vIFNldCBib2R5IGdlb21ldHJ5IHR5cGVcbiAgICAgICAgdGhpcy5yYWlsLmJvZHkuY3JlYXRlR2VvbWV0cnkoJ3JlY3RhbmdsZScsIHt3aWR0aDogdGhpcy5yYWlsLndpZHRoLCBoZWlnaHQ6IHRoaXMucmFpbC5oZWlnaHR9KTtcbiAgICAgICAgXG4gICAgICAgIC8vIENvbGxpZGUgd2l0aCBwaW5zIGFuZCBiYWxsc1xuICAgICAgICB0aGlzLnJhaWwuYm9keS5zZXRDb2xsaXNpb25Hcm91cHMoWydiYWxscycsICdwaW5zJ10pO1xuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIC8vIE1ha2UgZ3V0dGVyIGJvZHlcbiAgICAgICAgdGhpcy5pbm5lci5ib2R5ID0gbmV3IEdhbWUuQm9keSh7eDogdGhpcy5pbm5lci54LCB5OiB0aGlzLmlubmVyLnl9LCB7eDogMCwgeTogMH0sIDEwLCBHYW1lLkJvZHlUeXBlcy5SRUNUQU5HTEUpO1xuICAgICAgICB0aGlzLmlubmVyLmJvZHkuY3JlYXRlR2VvbWV0cnkoJ3JlY3RhbmdsZScsIHt3aWR0aDogdGhpcy5pbm5lci53aWR0aCAqIDIvMywgaGVpZ2h0OiB0aGlzLmlubmVyLmhlaWdodH0pO1xuICAgICAgICB0aGlzLmlubmVyLmJvZHkuaXNCb3VuY3lDb2xsaWR5ID0gZmFsc2U7XG4gICAgICAgIHRoaXMuaW5uZXIuYm9keS5zZXRDb2xsaXNpb25Hcm91cHMoWydiYWxscycsICdwaW5zJ10pO1xuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIC8vIE1ha2UgZ3V0dGVyIGEgbWVtYmVyIG9mIGd1dHRlciBncm91cFxuICAgICAgICBHYW1lLnBoeXNpY3MuYWRkVG9Hcm91cCgnZ3V0dGVycycsIHRoaXMuaW5uZXIpO1xuICAgICAgICBHYW1lLnBoeXNpY3MuYWRkVG9Hcm91cCgnZ3V0dGVycycsIHRoaXMucmFpbCk7XG4gICAgICAgIFxuICAgICAgICAvLyBBZGQgdGhlIG1lbWJlclxuICAgICAgICBHYW1lLnBoeXNpY3MuYWRkTWVtYmVyKHRoaXMucmFpbCk7XG4gICAgICAgIEdhbWUucGh5c2ljcy5hZGRNZW1iZXIodGhpcy5pbm5lcik7XG4gICAgICAgIFxuICAgIH1cbiAgICBcbiAgICBcbiAgICBcbiAgICBcbiAgICBkcmF3KGN0eClcbiAgICB7XG4gICAgICAgIHRoaXMuaW5uZXIuZHJhdyhjdHgpO1xuICAgICAgICB0aGlzLnJhaWwuZHJhdyhjdHgpO1xuICAgIH1cbiAgICBcbn07IiwiLypnbG9iYWwgR2FtZSBJbWFnZSovXG5jbGFzcyBQaW57XG4gICAgXG4gICAgY29uc3RydWN0b3IoeCwgeSwgd2lkdGgsIGhlaWdodCl7XG4gICAgICAgIFxuICAgICAgICAvLyBQb3NpdGlvbiBvZiBwaW5cbiAgICAgICAgLy8gdGhpcy5wb3MgPSB7eDp4LCB5Onl9O1xuICAgICAgICAvLyB0aGlzLnJvdGF0aW9uID0gMDtcblxuICAgICAgICB0aGlzLm1hc3MgPSAxLjUgKiAxO1xuXG4gICAgICAgIC8vIFdpZHRoIG9mIHBpblxuICAgICAgICB0aGlzLndpZHRoID0gd2lkdGg7XG4gICAgICAgIFxuICAgICAgICAvLyBIZWlnaHQgb2YgcGluXG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgICAgICBcbiAgICAgICAgLy8gQ29sbGlzaW9uIHJhZGl1c1xuICAgICAgICB0aGlzLmNvbGxpc2lvblJhZGl1cyA9IDEwO1xuICAgICAgICBcbiAgICAgICAgLy8gQ29sb3Igb2YgcGluXG4gICAgICAgIHRoaXMuY29sb3IgPSBcInJnYmEoMjU1LCAyNTUsIDI1NSwgMSlcIjtcbiAgICAgICAgXG4gICAgICAgIC8vIEJvb2xlYW4gZm9yIGNvbGxpc2lvbiByZWN0YW5nbGUgc2l6ZVxuICAgICAgICB0aGlzLmlzU3RhbmRpbmcgPSB0cnVlO1xuICAgICAgICBcbiAgICAgICAgLy8gQm9vbGVhbiBmb3IgY29sbGlzaW9uIGFuZCBkcmF3aW5nIG9mIHBpblxuICAgICAgICB0aGlzLmlzQWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuaW5pdGlhbFBvc2l0aW9uID0ge1xuICAgICAgICAgICAgeDogeCArIHRoaXMud2lkdGgvMixcbiAgICAgICAgICAgIHk6IHkgKyB0aGlzLmhlaWdodCAtIHRoaXMuY29sbGlzaW9uUmFkaXVzLFxuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIC8vIE1ha2UgZGEgYm9keVxuICAgICAgICB0aGlzLmJvZHkgPSBuZXcgR2FtZS5Cb2R5KHt4OiB4ICsgdGhpcy53aWR0aC8yLCB5OiB5ICsgdGhpcy5oZWlnaHQgLSB0aGlzLmNvbGxpc2lvblJhZGl1c30sIHt4OiAwLCB5OiAwfSwgdGhpcy5tYXNzLCBHYW1lLkJvZHlUeXBlcy5DSVJDTEUpO1xuICAgICAgICBcbiAgICAgICAgLy8gU2V0IHRoZSBtYXggc3BlZFxuICAgICAgICB0aGlzLmJvZHkubWF4U3BlZWQgPSAyMDtcbiAgICAgICAgXG4gICAgICAgIC8vIENyZWF0ZSB0aGUgY2lyY2xlIGdlb21ldHJ5IGZvciB3aGVuIHBpbiBpcyBzdGFuZGluZ1xuICAgICAgICB0aGlzLmJvZHkuY3JlYXRlR2VvbWV0cnkoJ2NpcmNsZScsIHtyYWRpdXM6IHRoaXMuY29sbGlzaW9uUmFkaXVzfSk7XG4gICAgICAgIFxuICAgICAgICAvLyBTZXQgdGhlIGNvbGxsaXNpb24gdG8gYmUgd2l0aCB0aGUgYmFsbCBhbmQgcGluc1xuICAgICAgICB0aGlzLmJvZHkuc2V0Q29sbGlzaW9uR3JvdXBzKFsnYmFsbHMnLCAncGlucycsICdndXR0ZXJzJ10pO1xuICAgICAgICBcbiAgICAgICAgLy8gQWRkIHRoZSBtZW1iZXJcbiAgICAgICAgR2FtZS5waHlzaWNzLmFkZE1lbWJlcih0aGlzKTtcbiAgICAgICAgXG4gICAgICAgIC8vIEFkZCB0byBwaW5zIGdyb3VwXG4gICAgICAgIEdhbWUucGh5c2ljcy5hZGRUb0dyb3VwKCdwaW5zJywgdGhpcyk7XG4gICAgICAgIFxuICAgICAgICB0aGlzLmJvZHkuYW5ndWxhclZlbCA9IDA7XG4gICAgIFxuICAgICAgICAvLyBsb2FkIGltYWdlIGZyb20gZGF0YSB1cmxcbiAgICAgICAgdGhpcy5pbWFnZSA9IG5ldyBJbWFnZSgpO1xuICAgICAgICBcbiAgICAgICAgdGhpcy5pbWFnZS5zcmMgPSAnYXNzZXRzL2ltYWdlcy9waW4ucG5nJztcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICB0aGlzLmJvZHkub25Db2xsaWRlZCA9IHRoaXMub25Db2xsaWRlZC5iaW5kKHRoaXMpO1xuICAgICAgICBcbiAgICAgICAgdGhpcy5ib2R5LnJvdGF0aW9uYWxEYW1waW5nID0gMC4wMDE7XG4gICAgICAgIHRoaXMuYm9keS5pbml0aWFsRnJpY3Rpb24gPSAwLjAzO1xuICAgICAgICB0aGlzLmJvZHkuZnJpY3Rpb24gPSB0aGlzLmJvZHkuaW5pdGlhbEZyaWN0aW9uO1xuICAgICAgICBcbiAgICAgICAgdGhpcy5pbml0aWFsQW5ndWxhclZlbG9jaXR5ID0gMC4yODtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuaXNJbkd1dHRlciA9IGZhbHNlO1xuICAgICAgICBcbiAgICAgXG4gICAgfVxuICAgIFxuICAgIFxuICAgIHVwZGF0ZShkZWx0YSl7XG4gICAgICAgIFxuICAgICAgICB0aGlzLmJvZHkudXBkYXRlKGRlbHRhKTtcblxuICAgIH1cbiAgICBcbiAgICBcbiAgICBcbiAgICBvbkNvbGxpZGVkKG1lbWJlcil7XG4gICAgICAgIFxuICAgICAgICB0aGlzLmJvZHkuZnJpY3Rpb24gPSB0aGlzLmJvZHkuaW5pdGlhbEZyaWN0aW9uO1xuICAgICAgICBcbiAgICAgICAgdGhpcy5pc1N0YW5kaW5nID0gZmFsc2U7XG5cbiAgICAgICAgaWYobWVtYmVyLnR5cGUgPT09ICdpbm5lcicpe1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZighdGhpcy5pc0luR3V0dGVyKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRoaXMuYm9keS5mcmljdGlvbiA9IC4yO1xuICAgICAgICAgICAgICAgIHRoaXMuYm9keS5yb3RhdGlvbmFsRGFtcGluZyA9IC4wMDE7XG4gICAgICAgICAgICAgLy8gICB0aGlzLmJvZHkuYW5ndWxhclZlbCA9IHRoaXMuYm9keS5hbmd1bGFyVmVsIDwgMCA/IC0wLjAyIDogMC4wMjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy5pc0luR3V0dGVyID0gdHJ1ZTtcblxuICAgICAgICAgICAgbGV0IHBpU2l6ZSA9IE1hdGguUEkgLyA4OyAvLyAyMi41IGRlZ3JlZXNcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIEFuZ2xlIGlzIGFyb3VuZCAwZGVnXG4gICAgICAgICAgICBpZih0aGlzLmJvZHkuYW5nbGUgPiAtcGlTaXplICYmIHRoaXMuYm9keS5hbmdsZSA8IHBpU2l6ZSl7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgdGhpcy5ib2R5LmFuZ3VsYXJWZWwgPSAwO1xuICAgICAgICAgICAgICAgIHRoaXMuYm9keS5hbmdsZSA9IDA7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBBbmdsZSBpcyBhcm91bmQgMTgwZGVnXG4gICAgICAgICAgICBlbHNlIGlmKHRoaXMuYm9keS5hbmdsZSA+IE1hdGguUEkgLSBwaVNpemUgJiYgdGhpcy5ib2R5LmFuZ2xlIDwgTWF0aC5QSSArIHBpU2l6ZSl7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgdGhpcy5ib2R5LmFuZ3VsYXJWZWwgPSAwO1xuICAgICAgICAgICAgICAgIHRoaXMuYm9keS5hbmdsZSA9IE1hdGguUEk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBpZih0aGlzLmJvZHkuYW5nbGUgPiBNYXRoLlBJLzIgJiYgdGhpcy5ib2R5LmFuZ2xlIDwgTWF0aC5QSSl7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyAgICAgdGhpcy5ib2R5LmFuZ3VsYXJWZWwgPSAtMTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIH1cbiAgICAgICAgICAgIC8vIGVsc2VcbiAgICAgICAgICAgIC8vIHtcbiAgICAgICAgICAgIC8vICAgICB0aGlzLmJvZHkuYW5ndWxhclZlbCA9IDE7XG4gICAgICAgICAgICAvLyB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIHRoaXMuYm9keS5yb3RhdGlvbmFsRGFtcGluZyA9IC4wMjtcbiAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYobWVtYmVyLmJvZHkuaXNCb3VuY3lDb2xsaWR5ICYmICF0aGlzLmlzSW5HdXR0ZXIpe1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB0aGlzLnNldFJvdGF0aW9uKCk7XG4gICAgICAgICAgICBcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYobWVtYmVyLnR5cGUgPT09ICdyYWlsJyl7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMuYm9keS5mcmljdGlvbiA9IDIwO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnUEVFRUVOTk5PT09TU1NTUycpO1xuICAgICAgICAgICAgXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIFxuICAgIHNldFJvdGF0aW9uKG1lbWJlcil7XG4gICAgICAgIFxuICAgICAgICBpZih0aGlzLmJvZHkuYW5ndWxhclZlbCA+PSAwKXtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy5ib2R5LmFuZ3VsYXJWZWwgPSAtdGhpcy5pbml0aWFsQW5ndWxhclZlbG9jaXR5O1xuICAgICAgICAgICAgXG4gICAgICAgIH1cbiAgICAgICAgZWxzZXtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy5ib2R5LmFuZ3VsYXJWZWwgPSB0aGlzLmluaXRpYWxBbmd1bGFyVmVsb2NpdHk7XG4gICAgICAgICAgICBcbiAgICAgICAgfVxuICAgICAgICBcbiAgICB9XG4gICAgXG5cbiAgICBkcmF3KGN0eCl7XG4gICAgICAgIFxuICAgICAgIC8vIGNvbnNvbGUubG9nKCdQaW4gQWN0aXZlJywgdGhpcy5ib2R5LnBvcyk7XG4gICAgICAgIGlmKHRoaXMuaXNBY3RpdmUpe1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBsZXQgZHJhd1ggPSB0aGlzLmJvZHkucG9zLnggLSB0aGlzLndpZHRoLzI7XG4gICAgICAgICAgICBsZXQgZHJhd1kgPSB0aGlzLmJvZHkucG9zLnkgLSB0aGlzLmhlaWdodCArIHRoaXMuY29sbGlzaW9uUmFkaXVzO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIFNldCB0aGUgY29sb3Igb2YgdGhlIGJhbGxcbiAgICAgICAgICAgIGN0eC5maWxsU3R5bGUgPSB0aGlzLmlzSG92ZXJpbmcgPyB0aGlzLmhvdmVyQ29sb3IgOiB0aGlzLmNvbG9yO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBTYXZlIGNvbnRleHRcbiAgICAgICAgICAgIGN0eC5zYXZlKCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIFRyYW5zbGF0ZSB0aGUgY29udGV4dCBhcm91bmQgcm90YXRpb24gY2VudGVyXG4gICAgICAgICAgICBjdHgudHJhbnNsYXRlKHRoaXMuYm9keS5nZW9tZXRyeS54LCB0aGlzLmJvZHkuZ2VvbWV0cnkueSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIFJvdGF0ZSB0aGUgY2lyY2xlXG4gICAgICAgICAgICBjdHgucm90YXRlKHRoaXMuYm9keS5hbmdsZSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIFRyYW5zbGF0ZSBiYWNrIHRvIHdoZXJlIHdlIHdlcmUgYmVmb3JlXG4gICAgICAgICAgICBjdHgudHJhbnNsYXRlKC10aGlzLmJvZHkuZ2VvbWV0cnkueCwgLXRoaXMuYm9keS5nZW9tZXRyeS55KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gdGhpcy5ib2R5Lmdlb21ldHJ5LmRyYXcoY3R4LCB0aGlzLmltYWdlKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gRHJhdyB0aGUgY2lyY2xlXG4gICAgICAgICAgICBjdHguZHJhd0ltYWdlKHRoaXMuaW1hZ2UsIGRyYXdYLCBkcmF3WSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIFJlc3RvcmUgY29udGV4dFxuICAgICAgICAgICAgY3R4LnJlc3RvcmUoKTtcblxuICAgICAgICB9XG4gICAgICAgIFxuICAgIH1cbiAgICBcbiAgICBcbiAgICByZXNldCgpe1xuICAgICAgICAgICAgICAgIFxuICAgICAgICB0aGlzLmJvZHkuc2V0VmVsb2NpdHkoe1xuICAgICAgICAgICAgeDogMCxcbiAgICAgICAgICAgIHk6IDAsXG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgdGhpcy5ib2R5LnNldFBvc2l0aW9uKEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGhpcy5pbml0aWFsUG9zaXRpb24pKSk7XG4gICAgICAgIHRoaXMuYm9keS5hbmd1bGFyVmVsID0gMDtcbiAgICAgICAgdGhpcy5ib2R5LmFuZ2xlID0gMDtcbiAgICAgICAgdGhpcy5pc0luR3V0dGVyID0gZmFsc2U7XG4gICAgICAgIHRoaXMuaXNTdGFuZGluZyA9IHRydWU7XG4gICAgfVxuICAgIFxuICAgIFxuICAgIFxufSIsIi8qZ2xvYmFsIEdhbWUqL1xuY2xhc3MgU2NvcmVCb2FyZCB7XG5cbiAgICAvKlxuICAgICAgV2UgbmVlZCBhcnJheSBmb3IgYWN0dWFsIHNjb3JlLCBhbmQgYW4gYXJyYXkgZm9yIHdoYXQgc2NvcmUgdG8gZGlzcGxheSBbdG90YWwgZm9yIGZyYW1lLCBzcGFyZXMoLykgYW5kIHN0cmlrZXMoWCldLlxuICAgICAqL1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG5cbiAgICAgICAgLy8gU3RvcmUgZnJhbWVzXG4gICAgICAgIHRoaXMuZnJhbWVzID0gW107XG5cbiAgICAgICAgLy8gQ3VycmVudCBmcmFtZVxuICAgICAgICB0aGlzLmN1cnJlbnRGcmFtZSA9IDA7XG4gICAgICAgIHRoaXMuc2NvcmUgPSAwO1xuXG5cbiAgICAgICAgLy8gRmlyc3QgOSBmcmFtZXNcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCA5OyBpKyspIHtcbiAgICAgICAgICAgIC8vIFB1c2ggZW1wdHkgYXJyYXkgaW4gZnJhbWVzXG4gICAgICAgICAgICB0aGlzLmZyYW1lcy5wdXNoKHtcbiAgICAgICAgICAgICAgICBvbmU6IG51bGwsXG4gICAgICAgICAgICAgICAgdHdvOiBudWxsLFxuICAgICAgICAgICAgICAgIHNjb3JlOiBudWxsLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBMYXN0IGZyYW1lXG4gICAgICAgIHRoaXMuZnJhbWVzLnB1c2goe1xuICAgICAgICAgICAgb25lOiBudWxsLFxuICAgICAgICAgICAgdHdvOiBudWxsLFxuICAgICAgICAgICAgdGhyZWU6IG51bGwsXG4gICAgICAgICAgICBzY29yZTogbnVsbFxuICAgICAgICB9KTtcblxuICAgIH1cblxuXG4gICAgYWRkU2NvcmUobnVtUGlucykge1xuXG4gICAgICAgIC8vIERvbid0IGxldCBhbiBpbnZhbGlkIGluZGV4IGJlIHVzZWQuXG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRGcmFtZSA+PSB0aGlzLmZyYW1lcy5sZW5ndGgpIHJldHVybjtcblxuICAgICAgICBsZXQgZnJhbWUgPSB0aGlzLmZyYW1lc1t0aGlzLmN1cnJlbnRGcmFtZV07XG5cblxuXG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRGcmFtZSA9PT0gOSkge1xuICAgICAgICAgICAgdGhpcy50ZW50aEZyYW1lTG9naWMobnVtUGlucyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoZnJhbWUub25lID09PSBudWxsKSB7XG4gICAgICAgICAgICBmcmFtZS5vbmUgPSBudW1QaW5zO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGZyYW1lLnR3byA9PT0gbnVsbCkge1xuICAgICAgICAgICAgZnJhbWUudHdvID0gbnVtUGlucyAtIGZyYW1lLm9uZTtcbiAgICAgICAgfVxuICAgICAgICAvLyBJZiB1c2VyIGhhcyBzY29yZWQgYSBzdHJpa2Ugb3IgZW5kIG9mIGZyYW1lXG4gICAgICAgIGVsc2UgaWYgKG51bVBpbnMgPT09IDEwIHx8IChmcmFtZS5vbmUgIT09IG51bGwgJiYgZnJhbWUudHdvICE9PSBudWxsKSkge1xuXG4gICAgICAgICAgICAvLyBJbmNyZW1lbnQgZnJhbWVcbiAgICAgICAgICAgIHRoaXMuY3VycmVudEZyYW1lKys7XG5cbiAgICAgICAgfVxuXG4gICAgICAgIFxuICAgICAgICBmcmFtZS5zY29yZSA9IHRoaXMuY2FsY3VsYXRlU2NvcmUoKTtcblxuICAgIH1cblxuICAgIGNhbGN1bGF0ZVNjb3JlKCkge1xuXG4gICAgICAgIGxldCBzdW0gPSAwO1xuXG4gICAgICAgIGZvciAobGV0IGkgaW4gdGhpcy5mcmFtZXMpIHtcbiAgICAgICAgICAgIGxldCBmID0gdGhpcy5mcmFtZXNbaV07XG4gICAgICAgICAgICBzdW0gKz0gZi5vbmUgfHwgMDtcbiAgICAgICAgICAgIHN1bSArPSBmLnR3byB8fCAwO1xuICAgICAgICAgICAgc3VtICs9IGYudGhyZWUgfHwgMDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBzdW07XG5cbiAgICB9XG5cbiAgICBcbiAgICB0ZW50aEZyYW1lTG9naWMobnVtUGlucykge1xuICAgICAgICAvLyBYWFgsICMvWCwgIy8jLCBYWCMsIFgjIywgWCMvXG4gICAgICAgIFxuICAgICAgICBsZXQgZnJhbWUgPSB0aGlzLmZyYW1lc1t0aGlzLmN1cnJlbnRGcmFtZV07XG4gICAgICAgIFxuICAgICAgICBpZihmcmFtZS5vbmUgPT09IG51bGwpXG4gICAgICAgIHtcbiAgICAgICAgICAgIGZyYW1lLm9uZSA9IG51bVBpbnM7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZihmcmFtZS50d28gPT09IG51bGwpXG4gICAgICAgIHtcbiAgICAgICAgICAgIGZyYW1lLnR3byA9IG51bVBpbnM7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZihmcmFtZS50aHJlZSA9PT0gbnVsbClcbiAgICAgICAge1xuICAgICAgICAgICAgaWYoZnJhbWUub25lID09PSAxMClcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmKGZyYW1lLm9uZSArIGZyYW1lLnR3byA+PSAxMClcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBmcmFtZS50aHJlZSA9IG51bVBpbnM7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICAvLyBCb3dsIHN0cmlrZSBmaXJzdCBib3dsXG4gICAgICAgIGlmKGZyYW1lLm9uZSA9PT0gMTApe1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBCb3dsIHN0cmlrZSBzZWNvbmQgYm93bFxuICAgICAgICAgICAgaWYoZnJhbWUudHdvID09PSAxMCl7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIERvbid0IGJvd2wgc3RyaWtlIHNlY29uZCBib3dsXG4gICAgICAgICAgICBlbHNle1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgICAgIC8vIEJvd2wgc3BhcmUgaW4gZmlyc3QgMiBib3dsc1xuICAgICAgICBlbHNlIGlmKGZyYW1lLm9uZSArIGZyYW1lLnR3byA+PSAxMClcbiAgICAgICAge1xuICAgICAgICAgICAgLy8gRnJhbWUudGhyZWUgbG9naWNcbiAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgICAgIFxuXG4gICAgfVxuXG5cbiAgICBkcmF3KGxlZnQsIHRvcCwgY3R4KSB7XG5cbiAgICAgICAgbGV0IGNlbGxTaXplID0ge1xuICAgICAgICAgICAgdzogNDUsXG4gICAgICAgICAgICBoOiA0NVxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIEJhY2tncm91bmRcbiAgICAgICAgLy8gY3R4LmZpbGxTdHlsZSA9ICdsaWdodGdyZXknO1xuICAgICAgICAvLyBjdHguZmlsbFJlY3QobGVmdCwgdG9wLCBjZWxsU2l6ZS53LCBjZWxsU2l6ZS5oICogMTApO1xuXG5cbiAgICAgICAgZm9yIChsZXQgaSBpbiB0aGlzLmZyYW1lcykge1xuXG4gICAgICAgICAgICBsZXQgZnJhbWUgPSB0aGlzLmZyYW1lc1tpXTtcbiAgICAgICAgICAgIGxldCBjZWxsVG9wID0gdG9wICsgY2VsbFNpemUuaCAqIGk7XG4gICAgICAgICAgICBsZXQgbGl0dGxlTGVmdCA9IGxlZnQgKyBjZWxsU2l6ZS53IC0gMTU7XG5cblxuXG4gICAgICAgICAgICAvLyBEcmF3IHRoZSBiaWcgY2VsbFxuICAgICAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xuXG4gICAgICAgICAgICBjdHguc3Ryb2tlU3R5bGUgPSBcImJsYWNrXCI7XG4gICAgICAgICAgICBjdHgucmVjdChsZWZ0LCBjZWxsVG9wLCBjZWxsU2l6ZS53LCBjZWxsU2l6ZS5oKTtcbiAgICAgICAgICAgIGN0eC5zdHJva2UoKTtcblxuICAgICAgICAgICAgY3R4LmNsb3NlUGF0aCgpO1xuXG5cblxuICAgICAgICAgICAgLy8gRHJhdyB0aGUgbGl0dGxlIGNlbGwgaW4gdG9wIHJpZ2h0IGNvcm5lclxuICAgICAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xuXG4gICAgICAgICAgICBjdHguc3Ryb2tlU3R5bGUgPSBcImJsdWVcIjtcbiAgICAgICAgICAgIGN0eC5yZWN0KGxpdHRsZUxlZnQsIGNlbGxUb3AsIDE1LCAxNSk7XG4gICAgICAgICAgICBjdHguc3Ryb2tlKCk7XG5cbiAgICAgICAgICAgIGN0eC5jbG9zZVBhdGgoKTtcblxuXG4gICAgICAgICAgICAvLyBEcmF3IGFkZGl0aW9uYWwgbGl0dGxlIGNlbGxzIGZvciBsYXN0IGZyYW1lXG4gICAgICAgICAgICBpZiAoaSA9PSB0aGlzLmZyYW1lcy5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xuXG4gICAgICAgICAgICAgICAgY3R4LnN0cm9rZVN0eWxlID0gXCJibHVlXCI7XG4gICAgICAgICAgICAgICAgY3R4LnJlY3QobGVmdCwgY2VsbFRvcCwgMTUsIDE1KTtcbiAgICAgICAgICAgICAgICBjdHgucmVjdChsZWZ0ICsgMTUsIGNlbGxUb3AsIDE1LCAxNSk7XG4gICAgICAgICAgICAgICAgY3R4LnN0cm9rZSgpO1xuXG4gICAgICAgICAgICAgICAgY3R4LmNsb3NlUGF0aCgpO1xuICAgICAgICAgICAgfVxuXG5cblxuXG5cblxuXG4gICAgICAgICAgICAvLyBEcmF3IHRoZSBTQ09SRVNcbiAgICAgICAgICAgIGN0eC5maWxsU3R5bGUgPSAnYmxhY2snO1xuICAgICAgICAgICAgY3R4LmZvbnQgPSBcIjE2cHggQXJpYWxcIjtcblxuICAgICAgICAgICAgaWYgKGZyYW1lLm9uZSAhPSBudWxsKSB7XG5cbiAgICAgICAgICAgICAgICBpZiAoZnJhbWUub25lID09PSAxMCkge1xuXG4gICAgICAgICAgICAgICAgICAgIGN0eC5maWxsVGV4dCgnWCcsIGxpdHRsZUxlZnQgKyAyLCBjZWxsVG9wICsgMTIpO1xuXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGZyYW1lLm9uZSA9PT0gMCkge1xuXG4gICAgICAgICAgICAgICAgICAgIGN0eC5maWxsVGV4dCgnLScsIGxlZnQgKyA1LCBjZWxsVG9wICsgMTYpO1xuXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgICAgIGN0eC5maWxsVGV4dChmcmFtZS5vbmUudG9TdHJpbmcoKSwgbGVmdCArIDUsIGNlbGxUb3AgKyAxNik7XG5cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGZyYW1lLnR3byAhPSBudWxsKSB7XG5cbiAgICAgICAgICAgICAgICAvLyBEcmF3IHRoZSBsaXR0bGUgc2NvcmUgb24gdGhlIHJpZ2h0IG9yIC8gb3IgWFxuICAgICAgICAgICAgICAgIGN0eC5mb250ID0gXCIxNHB4IEFyaWFsXCI7XG4gICAgICAgICAgICAgICAgaWYgKGZyYW1lLm9uZSArIGZyYW1lLnR3byA9PT0gMTApIHtcblxuICAgICAgICAgICAgICAgICAgICBjdHguZmlsbFRleHQoJy8nLCBsaXR0bGVMZWZ0ICsgMiwgY2VsbFRvcCArIDEyKTtcblxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChmcmFtZS50d28gPT09IDApIHtcblxuICAgICAgICAgICAgICAgICAgICBjdHguZmlsbFRleHQoJy0nLCBsaXR0bGVMZWZ0ICsgMiwgY2VsbFRvcCArIDEyKTtcblxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcblxuICAgICAgICAgICAgICAgICAgICBjdHguZmlsbFRleHQoZnJhbWUudHdvLnRvU3RyaW5nKCksIGxpdHRsZUxlZnQgKyAyLCBjZWxsVG9wICsgMTIpO1xuXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9XG5cblxuXG4gICAgICAgICAgICAvLyBEcmF3IHRoZSB0b3RhbCBzY29yZSBzbyBmYXJcbiAgICAgICAgICAgIGN0eC5mb250ID0gXCIxNnB4IEFyaWFsXCI7XG4gICAgICAgICAgICBpZiAoZnJhbWUuc2NvcmUpIHtcblxuICAgICAgICAgICAgICAgIGN0eC5maWxsVGV4dChmcmFtZS5zY29yZS50b1N0cmluZygpLCBsZWZ0ICsgNSwgY2VsbFRvcCArIDMyKTtcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cblxuXG4gICAgfVxuXG59IiwiLypnbG9iYWwgR2FtZSovXG5HYW1lLlRlc3RDaXJjbGUgPSBjbGFzcyBUZXN0Q2lyY2xle1xuICAgIFxuICAgIGNvbnN0cnVjdG9yKGNfeCwgY195LCByYWRpdXMpe1xuICAgICAgICBcbiAgICAgICAgdGhpcy5yYWRpdXMgPSByYWRpdXM7XG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgdGhpcy5jb2xvciA9IFwieWVsbG93XCI7XG4gICAgICAgIFxuICAgICAgICB0aGlzLmJvZHkgPSBuZXcgR2FtZS5Cb2R5KHt4OiBjX3gsIHk6IGNfeX0sIHt4OiAwLCB5OiAwfSwgMTUwKTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuYm9keS5jcmVhdGVHZW9tZXRyeSgnY2lyY2xlJywge3JhZGl1czogdGhpcy5yYWRpdXN9KTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuYm9keS5zZXRDb2xsaXNpb25Hcm91cHMoWydiYWxscyddKTtcbiAgICAgICAgXG4gICAgICAgIEdhbWUucGh5c2ljcy5hZGRNZW1iZXIodGhpcyk7XG4gICAgICAgIFxuICAgICAgICBHYW1lLnBoeXNpY3MuYWRkVG9Hcm91cCgnYmFsbHMnLCB0aGlzKTtcbiAgICAgICAgXG4gICAgICAgIFxuICAgIH1cbiAgICBcbiAgICBcblxuICAgIHVwZGF0ZShkZWx0YSl7XG4gICAgICAgIFxuICAgICAgICB0aGlzLmJvZHkudXBkYXRlKGRlbHRhKTtcbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIFxuICAgIGRyYXcoY3R4KXtcbiAgICAgICAgXG4gICAgICAgIC8vIERyYXcgdGhlIGNpcmNsZVxuICAgICAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgICAgIGN0eC5hcmModGhpcy5ib2R5LnBvcy54LCB0aGlzLmJvZHkucG9zLnksIHRoaXMucmFkaXVzLCAwLCBNYXRoLlBJKjIpO1xuICAgICAgICBjdHguZmlsbFN0eWxlID0gdGhpcy5jb2xvcjtcbiAgICAgICAgY3R4LmZpbGwoKTtcbiAgICAgICAgY3R4LmNsb3NlUGF0aCgpO1xuICAgICAgICBcbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIFxufSIsIiIsIi8qZ2xvYmFsIEdhbWUqL1xuR2FtZS5Cb2R5ID0gY2xhc3MgQm9keSB7XG5cbiAgICBjb25zdHJ1Y3Rvcihwb3MsIHZlbCwgbWFzcywgdHlwZSkge1xuXG4gICAgICAgIHRoaXMucG9zID0gcG9zO1xuICAgICAgICB0aGlzLnZlbCA9IHZlbDtcbiAgICAgICAgdGhpcy5hY2MgPSB7XG4gICAgICAgICAgICB4OiAwLFxuICAgICAgICAgICAgeTogMFxuICAgICAgICB9O1xuXG4gICAgICAgIFxuICAgICAgICB0aGlzLmFuZ3VsYXJWZWwgPSAwO1xuICAgICAgICB0aGlzLmFuZ3VsYXJBY2MgPSAwO1xuXG4gICAgICAgIHRoaXMuYW5nbGUgPSAwO1xuICAgICAgICB0aGlzLm1hc3MgPSBtYXNzO1xuXG4gICAgICAgIHRoaXMubWF4U3BlZWQgPSBudWxsO1xuXG4gICAgICAgIHRoaXMudHlwZSA9IHR5cGU7XG5cbiAgICAgICAgdGhpcy5yb3RhdGlvbmFsRGFtcGluZyA9IDA7XG5cbiAgICAgICAgdGhpcy5mcmljdGlvbiA9IDA7XG4gICAgICAgIFxuICAgICAgICAvLyBCb2R5IHR5cGUgZmxhZ3NcbiAgICAgICAgdGhpcy5maXhlZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLmlzQm91bmN5Q29sbGlkeSA9IHRydWU7XG5cblxuICAgICAgICAvLyBKdXN0IHRvIGF2b2lkIGVycm9ycyB3aGVuIG5vdCBhc3MtaWduZWRcbiAgICAgICAgdGhpcy5vbkNvbGxpZGVkID0gKCkgPT4ge307XG4gICAgfVxuXG5cbiAgICAvLyBDcmVhdGUgdGhlIGdlb21ldHJ5XG4gICAgY3JlYXRlR2VvbWV0cnkodHlwZSwgY29uZmlnKSB7XG5cbiAgICAgICAgLy8gSWYgb2YgdHlwZSBjaXJjbGVcbiAgICAgICAgaWYgKHR5cGUudG9Mb3dlckNhc2UoKSA9PT0gJ2NpcmNsZScpIHtcblxuICAgICAgICAgICAgdGhpcy5nZW9tZXRyeSA9IG5ldyBHYW1lLkNpcmNsZSh0aGlzLnBvcy54LCB0aGlzLnBvcy55LCBjb25maWcucmFkaXVzKTtcblxuICAgICAgICB9XG4gICAgICAgIC8vIEVsc2UgaWYgb2YgdHlwZSByZWN0YW5nbGVcbiAgICAgICAgZWxzZSBpZiAodHlwZS50b0xvd2VyQ2FzZSgpID09PSAncmVjdGFuZ2xlJykge1xuXG4gICAgICAgICAgICB0aGlzLmdlb21ldHJ5ID0gbmV3IEdhbWUuUmVjdGFuZ2xlKHRoaXMucG9zLngsIHRoaXMucG9zLnksIGNvbmZpZy53aWR0aCwgY29uZmlnLmhlaWdodCwgY29uZmlnLmNvbG9yKTtcblxuXG4gICAgICAgIH1cblxuICAgIH1cblxuXG4gICAgLy8gQ2hlY2sgaWYgdGhlIGJvZHkgaW50ZXJzZWN0cyBhbm90aGVyIGJvZHkoc28gaGF3dClcbiAgICBpbnRlcnNlY3RzKGJvZHkpIHtcblxuICAgICAgICByZXR1cm4gR2FtZS5Db2xsaXNpb24uaW50ZXJzZWN0cyh0aGlzLmdlb21ldHJ5LCBib2R5Lmdlb21ldHJ5KTtcblxuICAgIH1cblxuXG4gICAgLy8gU2V0IHRoZSBjb2xsaXNpb24gZ3JvdXBcbiAgICBzZXRDb2xsaXNpb25Hcm91cHMoZ3JvdXBzKSB7XG5cbiAgICAgICAgdGhpcy5jb2xsaWRlc1dpdGggPSBncm91cHM7XG5cbiAgICB9XG5cblxuICAgIC8vIFVwZGF0ZXMgdGhlIHBvc2l0aW9uL3ZlbG9jaXR5IGlmIGFjY2VsZXJhdGlvblxuICAgIHVwZGF0ZShkZWx0YSkge1xuXG4gICAgICAgIC8vIEFjY2VsZXJhdGUgdGhlIGJvZHkncyByb3RhdGlvblxuICAgICAgICB0aGlzLmFuZ3VsYXJWZWwgKz0gdGhpcy5hbmd1bGFyQWNjO1xuXG4gICAgICAgIC8vIFJvdGF0ZSB0aGUgYm9keVxuICAgICAgICB0aGlzLmFuZ2xlICs9IHRoaXMuYW5ndWxhclZlbDtcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICBpZih0aGlzLmFuZ2xlID49IE1hdGguUEkgKiAyKVxuICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLmFuZ2xlID0gdGhpcy5hbmdsZSAtIE1hdGguUEkgKiAyO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYodGhpcy5hbmdsZSA8PSAwKVxuICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLmFuZ2xlID0gdGhpcy5hbmdsZSArIE1hdGguUEkgKiAyO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgLy8gQWNjZWxlcmF0ZSB0aGUgYm9keVxuICAgICAgICB0aGlzLnZlbC54ICs9IHRoaXMuYWNjLng7XG4gICAgICAgIHRoaXMudmVsLnkgKz0gdGhpcy5hY2MueTtcblxuICAgICAgICAvLyBjb25zb2xlLmxvZygnQm9keSB1cGRhdGUnLCB0aGlzLnZlbCk7XG4gICAgICAgIHRoaXMucG9zLnggKz0gdGhpcy52ZWwueDtcbiAgICAgICAgdGhpcy5wb3MueSArPSB0aGlzLnZlbC55O1xuXG4gICAgICAgIHRoaXMuZ2VvbWV0cnkuc2V0UG9zaXRpb24odGhpcy5wb3MpO1xuICAgICAgICBcbiAgICAgICAgdGhpcy5kYW1waW5nKCk7XG4gICAgICAgIHRoaXMuYWNjb3VudEZvckZyaWN0aW9uKCk7XG5cbiAgICB9XG4gICAgXG4gICAgXG4gICAgXG4gICAgYWNjb3VudEZvckZyaWN0aW9uKCl7XG4gICAgICAgIFxuICAgICAgICBpZih0aGlzLnZlbC54IDwgMCl7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMudmVsLnggKz0gdGhpcy5mcmljdGlvbjtcbiAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgICAgIGVsc2V7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMudmVsLnggLT0gdGhpcy5mcmljdGlvbjtcbiAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZih0aGlzLnZlbC55IDwgMCl7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMudmVsLnkgKz0gdGhpcy5mcmljdGlvbjtcbiAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgICAgIGVsc2V7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMudmVsLnkgLT0gdGhpcy5mcmljdGlvbjtcbiAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgaWYodGhpcy52ZWwueCA+PSAtdGhpcy5mcmljdGlvbiAmJiB0aGlzLnZlbC54IDw9IHRoaXMuZnJpY3Rpb24pe1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB0aGlzLnZlbC54ID0gMDtcbiAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZih0aGlzLnZlbC55ID49IC10aGlzLmZyaWN0aW9uICYmIHRoaXMudmVsLnkgPD0gdGhpcy5mcmljdGlvbil7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMudmVsLnkgPSAwO1xuICAgICAgICAgICAgXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgfVxuXG4gICAgXG4gICAgZGFtcGluZygpIHtcbiAgICAgICAgXG4gICAgICAgIC8vIERlY3JlYXNlIGFuZ3VsYXIgdmVsb2NpdHkgYmFzZWQgb24gZGlyZWN0aW9uXG4gICAgICAgIGlmKHRoaXMuYW5ndWxhclZlbCA8IDApe1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB0aGlzLmFuZ3VsYXJWZWwgKz0gdGhpcy5yb3RhdGlvbmFsRGFtcGluZztcbiAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgICAgIGVsc2V7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMuYW5ndWxhclZlbCAtPSB0aGlzLnJvdGF0aW9uYWxEYW1waW5nO1xuICAgICAgICAgICAgXG4gICAgICAgIH1cbiAgICAgICAgLy8gY29uc29sZS5sb2codGhpcy5hbmd1bGFyVmVsKTtcbiAgICAgICAgXG4gICAgICAgIC8vIEFjY291bnQgZm9yIHZhbHVlcyBjbG9zZSB0byB6ZXJvXG4gICAgICAgIGlmKHRoaXMuYW5ndWxhclZlbCA+PSAtdGhpcy5yb3RhdGlvbmFsRGFtcGluZyAmJiB0aGlzLmFuZ3VsYXJWZWwgPD0gdGhpcy5yb3RhdGlvbmFsRGFtcGluZyl7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdBbG1vc3QgemVybycpO1xuICAgICAgICAgICAgdGhpcy5hbmd1bGFyVmVsID0gMDtcbiAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gU2V0IHBvc2l0aW9uXG4gICAgc2V0UG9zaXRpb24ocG9zKSB7XG5cbiAgICAgICAgdGhpcy5wb3MgPSBwb3M7XG4gICAgICAgIHRoaXMuZ2VvbWV0cnkuc2V0UG9zaXRpb24ocG9zKTtcblxuICAgIH1cblxuICAgIC8vIFNldCB0aGUgYm9keSB2ZWxvY2l0eVxuICAgIHNldFZlbG9jaXR5KHZlbCkge1xuXG4gICAgICAgIGlmICh0aGlzLm1heFNwZWVkICE9PSBudWxsKSB7XG5cbiAgICAgICAgICAgIC8vIE1hZ25pdHVkZSBzcXVhcmVkXG4gICAgICAgICAgICBsZXQgbWFnbml0dWRlU3F1YXJlZCA9ICh2ZWwueCAqIHZlbC54ICsgdmVsLnkgKiB2ZWwueSk7XG5cbiAgICAgICAgICAgIGlmIChtYWduaXR1ZGVTcXVhcmVkID4gdGhpcy5tYXhTcGVlZCAqIHRoaXMubWF4U3BlZWQpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIlZlbG9jaXR5IE1BWCBQT1dFUlwiKTtcblxuICAgICAgICAgICAgICAgIC8vIE5vcm1hbGl6ZSB2ZWN0b3JcbiAgICAgICAgICAgICAgICB2ZWwgPSBHYW1lLk1hdGhlbWF0aWNzLm5vcm1hbGl6ZVZlY3Rvcih2ZWwpO1xuXG4gICAgICAgICAgICAgICAgLy8gU2V0IG5ldyB2ZWxvY2l0eVxuICAgICAgICAgICAgICAgIHZlbC54ID0gdGhpcy5tYXhTcGVlZCAqIHZlbC54O1xuICAgICAgICAgICAgICAgIHZlbC55ID0gdGhpcy5tYXhTcGVlZCAqIHZlbC55O1xuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMudmVsID0gdmVsO1xuXG4gICAgfVxuXG5cbiAgICAvLyBEYXQgbWFzc1xuICAgIHNldE1hc3MobWFzcykge1xuICAgICAgICB0aGlzLm1hc3MgPSBtYXNzO1xuICAgIH1cbn07IiwiLypnbG9iYWwgR2FtZSovXG5HYW1lLkJvZHlUeXBlcyA9IHtcbiAgICBDSVJDTEU6IDAsXG4gICAgUkVDVEFOR0xFOiAxLFxufTsiLCIvKmdsb2JhbCBHYW1lKi9cbkdhbWUuQ2lyY2xlID0gY2xhc3MgQ2lyY2xle1xuICAgIFxuICAgIGNvbnN0cnVjdG9yKGNfeCwgY195LCByYWRpdXMpe1xuICAgICAgICBcbiAgICAgICAgdGhpcy54ID0gY194O1xuICAgICAgICB0aGlzLnkgPSBjX3k7XG4gICAgICAgIHRoaXMucmFkaXVzID0gcmFkaXVzO1xuICAgICAgICB0aGlzLnR5cGUgPSBHYW1lLkJvZHlUeXBlcy5DSVJDTEU7XG4gICAgICAgIFxuICAgIH1cbiAgICBcbiAgICBcbiAgICBzZXRQb3NpdGlvbihwb3Mpe1xuICAgICAgICBcbiAgICAgICAgdGhpcy54ID0gcG9zLng7XG4gICAgICAgIHRoaXMueSA9IHBvcy55O1xuICAgIH1cbiAgICBcbiAgICBcbiAgICBkcmF3KGN0eCwgaW1hZ2Upe1xuICAgICAgICBcbiAgICAgICAgaWYoaW1hZ2Upe1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBjdHguZHJhd0ltYWdlKGltYWdlLCB0aGlzLnggLSB0aGlzLnJhZGl1cywgdGhpcy55IC0gdGhpcy5yYWRpdXMpO1xuICAgICAgICAgICAgXG4gICAgICAgIH1cbiAgICAgICAgZWxzZXtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICAgICAgY3R4LmFyYyh0aGlzLngsIHRoaXMueSwgdGhpcy5yYWRpdXMsIDAsIE1hdGguUEkqMik7XG4gICAgICAgICAgICBjdHguZmlsbCgpO1xuICAgICAgICAgICAgY3R4LmNsb3NlUGF0aCgpO1xuICAgICAgICAgICAgXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIFxuICAgIGNvbnRhaW5zKHBvaW50KXtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBHYW1lLkNvbGxpc2lvbi5jb250YWluc0NpcmNsZSh0aGlzLCBwb2ludCk7XG4gICAgICAgIFxuICAgIH1cbiAgICBcbiAgICBcbiAgICBpbnRlcnNlY3RzKG9iail7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gR2FtZS5Db2xsaXNpb24uaW50ZXJzZWN0cyhvYmosIHRoaXMpO1xuXG4gICAgfVxuICAgIFxufTsiLCIvKmdsb2JhbCBHYW1lKi9cblxuR2FtZS5Db2xsaXNpb24gPSBjbGFzcyBDb2xsaXNpb25cbntcbiAgICBcbiAgICBzdGF0aWMgaW50ZXJzZWN0cyhvYmoxLCBvYmoyKXtcbiAgICAgICAgXG4gICAgICAvLyAgY29uc29sZS5sb2coJ0NoZWNraW5nIGludGVyc2VjdCcsIG9iajEsIG9iajIpO1xuICAgICAgICBcbiAgICAgICAgaWYob2JqMS50eXBlID09PSBHYW1lLkJvZHlUeXBlcy5DSVJDTEUpe1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZihvYmoyLnR5cGUgPT09IEdhbWUuQm9keVR5cGVzLkNJUkNMRSl7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgcmV0dXJuIEdhbWUuQ29sbGlzaW9uLmludGVyc2VjdENpcmNsZXMob2JqMSwgb2JqMik7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmKG9iajIudHlwZSA9PT0gR2FtZS5Cb2R5VHlwZXMuUkVDVEFOR0xFKXtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICByZXR1cm4gR2FtZS5Db2xsaXNpb24uaW50ZXJzZWN0UmVjdEFuZENpcmNsZShvYmoyLCBvYmoxKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2V7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2codHlwZW9mKG9iajEpLCAnaW50ZXJzZWN0aW5nJywgdHlwZW9mKG9iajIpLCAnaXMgbm90IHN1cHBvcnRlZCcpO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcblxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZihvYmoyLnR5cGUgPT09IEdhbWUuQm9keVR5cGVzLkNJUkNMRSl7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmKG9iajEudHlwZSA9PT0gR2FtZS5Cb2R5VHlwZXMuUkVDVEFOR0xFKXtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICByZXR1cm4gR2FtZS5Db2xsaXNpb24uaW50ZXJzZWN0UmVjdEFuZENpcmNsZShvYmoxLCBvYmoyKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2V7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2codHlwZW9mKG9iajEpLCAnaW50ZXJzZWN0aW5nJywgdHlwZW9mKG9iajIpLCAnaXMgbm90IHN1cHBvcnRlZCcpO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgICAgIGVsc2V7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHR5cGVvZihvYmoxKSwgJ2ludGVyc2VjdGluZycsIHR5cGVvZihvYmoyKSwgJ2lzIG5vdCBzdXBwb3J0ZWQnKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgICAgIFxuICAgIH1cbiAgICBcbiAgICBcbiAgICBzdGF0aWMgaW50ZXJzZWN0UmVjdHMocmVjdDEsIHJlY3QyKVxuICAgIHtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiByZWN0MS5sZWZ0IDw9IHJlY3QyLnJpZ2h0ICYmXG4gICAgICAgICAgICByZWN0Mi5sZWZ0IDw9IHJlY3QxLnJpZ2h0ICYmXG4gICAgICAgICAgICByZWN0MS50b3AgPD0gcmVjdDIuYm90dG9tICYmXG4gICAgICAgICAgICByZWN0Mi50b3AgPD0gcmVjdDEuYm90dG9tO1xuICAgICAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIHN0YXRpYyBpbnRlcnNlY3RDaXJjbGVzKGNhLCBjYilcbiAgICB7XG4gICAgICAgLy8gY29uc29sZS5sb2coY2EsIGNiKTtcbiAgICAgICAgIC8vIFRoZSB4IGRpc3RhbmNlIGJldHdlZW4gdGhlIDIgcG9pbnRzXG4gICAgICAgIHZhciBkeCA9IGNhLnggLSBjYi54O1xuICAgICAgICBcbiAgICAgICAgLy8gVGhlIHkgZGlzdGFuY2UgYmV0d2VlbiB0aGUgMiBwb2ludHNcbiAgICAgICAgdmFyIGR5ID0gY2EueSAtIGNiLnk7XG4gICAgICAgIFxuICAgICAgICAvLyBUaGUgc3VtIG9mIHRoZSBjaXJjbGUgcmFkaWlcbiAgICAgICAgdmFyIGRyID0gY2EucmFkaXVzICsgY2IucmFkaXVzO1xuICAgICAgICBcbiAgICAgICAgLy8gQ29tcGFyZSB0aGUgdHdvIGRpc3RhbmNlcy4gSWYgdGhlIGRpc3RhbmNlIGJldHdlZW4gdGhlIHR3byBwb2ludHMgXG4gICAgICAgIC8vIGlzIGxlc3MgdGhhbiB0aGUgc3VtIG9mIHRoZSByYWRpaSB0aGVuIHRoZSBjaXJjbGVzIG11c3QgaW50ZXJzZWN0LlxuICAgICAgICByZXR1cm4gZHgqZHggKyBkeSpkeSA8PSBkcipkcjtcbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIFxuICAgIHN0YXRpYyBpbnRlcnNlY3RSZWN0QW5kQ2lyY2xlKHJlY3QsIGNpcmNsZSlcbiAgICB7XG4gICAgICAgIC8vIEhvcml6b250YWwgZGlzdGFuY2UgYmV0d2VlbiB0aGUgY2lyY2xlIGNlbnRlciBhbmQgcmVjdCBjZW50ZXJcbiAgICAgICAgbGV0IGRpc3RhbmNlWCA9IE1hdGguYWJzKGNpcmNsZS54IC0gcmVjdC54IC0gKHJlY3Qud2lkdGgvMikpO1xuICAgICAgICBcbiAgICAgICAgLy8gVmVydGljYWwgZGlzdGFuY2UgYmV0d2VlbiB0aGUgY2lyY2xlIGNlbnRlciBhbmQgcmVjdCBjZW50ZXJcbiAgICAgICAgbGV0IGRpc3RhbmNlWSA9IE1hdGguYWJzKGNpcmNsZS55IC0gcmVjdC55IC0gKHJlY3QuaGVpZ2h0LzIpKTtcbiAgICBcbiAgICBcbiAgICAgICAgLy8gSWYgdGhlIGRpc3RhbmNlIGlzIGdyZWF0ZXIgdGhhbiBoYWxmIGNpcmNsZSBcbiAgICAgICAgLy8gKyBoYWxmIHRoZSB3aWR0aCBvZiBoYWxmIHJlY3QsIFxuICAgICAgICAvLyB0aGVuIHRoZXkgYXJlIHRvbyBmYXIgYXBhcnQgdG8gYmUgY29sbGlkaW5nXG4gICAgICAgIGlmIChkaXN0YW5jZVggPiAoKHJlY3Qud2lkdGgpLzIgKyBjaXJjbGUucmFkaXVzKSkgXG4gICAgICAgIHsgXG4gICAgICAgICAgICAvLyBSZXR1cm4gZmFsc2VcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8gSWYgdGhlIGRpc3RhbmNlIGlzIGdyZWF0ZXIgdGhhbiBhbmNob3JzIGhhbGYgY2lyY2xlXG4gICAgICAgIC8vICsgaGFsZiB0aGUgaGVpZ2h0IG9mIGhhbGYgcmVjdCwgXG4gICAgICAgIC8vIHRoZW4gdGhleSBhcmUgdG9vIGZhciBhcGFydCB0byBiZSBjb2xsaWRpbmdcbiAgICAgICAgaWYgKGRpc3RhbmNlWSA+ICgocmVjdC5oZWlnaHQpLzIgKyBjaXJjbGUucmFkaXVzKSkgXG4gICAgICAgIHsgXG4gICAgICAgICAgICAvLyBSZXR1cm4gZmFsc2VcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTsgXG4gICAgICAgICAgICBcbiAgICAgICAgfVxuICAgIFxuICAgICAgICAvLyBJZiB0aGUgaG9yaXpvbnRhbCBkaXN0YW5jZSBpcyBsZXNzIHRoYW4gb3IgZXF1YWwgdG8gaGFsZlxuICAgICAgICAvLyB0aGUgd2lkdGggb2YgaGFsZiByZWN0IHRoZW4gdGhleSBhcmUgY29sbGlkaW5nIFxuICAgICAgICBpZiAoZGlzdGFuY2VYIDw9ICgocmVjdC53aWR0aCkvMikpIFxuICAgICAgICB7IFxuICAgICAgICAgICAgLy8gUmV0dXJuIHRydWVcbiAgICAgICAgICAgIHJldHVybiB0cnVlOyBcbiAgICAgICAgfSBcbiAgICAgICAgXG4gICAgICAgIC8vIElmIHRoZSB2ZXJ0aWNhbCBkaXN0YW5jZSBpcyBsZXNzIHRoYW4gb3IgZXF1YWwgdG8gaGFsZlxuICAgICAgICAvLyB0aGUgaGVpZ2h0IG9mIGhhbGYgcmVjdCB0aGVuIHRoZXkgYXJlIGNvbGxpZGluZyBcbiAgICAgICAgaWYgKGRpc3RhbmNlWSA8PSAoKHJlY3QuaGVpZ2h0KS8yKSkgXG4gICAgICAgIHsgXG4gICAgICAgICAgICAvLyBSZXR1cm4gdHJ1ZVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7IFxuICAgICAgICB9XG4gICAgXG4gICAgXG4gICAgXG4gICAgICAgIC8qIFRoaXMgaXMgZm9yIHRlc3RpbmcgdGhlIGNvbGxpc2lvbiBhdCB0aGUgaW1hZ2UocmVjdCkgY29ybmVycyAqL1xuICAgICAgICBcbiAgICAgICAgLy8gVGhpbmsgb2YgYSBsaW5lIGZyb20gdGhlIHJlY3QgY2VudGVyIHRvIGFueSByZWN0IGNvcm5lci5cbiAgICAgICAgLy8gTm93IGV4dGVuZCB0aGF0IGxpbmUgYnkgdGhlIHJhZGl1cyBvZiB0aGUgY2lyY2xlLlxuICAgICAgICAvLyBJZiB0aGUgY2lyY2xlIGNlbnRlciBpcyBvbiB0aGF0IGxpbmUgdGhlblxuICAgICAgICAvLyB0aGV5IGFyZSBjb2xsaWRpbmcgYXQgZXhhY3RseSB0aGF0IHJlY3QgY29ybmVyLlxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIC8vIFRoZSBob3Jpem9udGFsIGRpc3RhbmNlIGJldHdlZW4gdGhlIGNpcmNsZSBhbmQgcmVjdFxuICAgICAgICAvLyBtaW51cyBoYWxmIHRoZSB3aWR0aCBvZiB0aGUgcmVjdFxuICAgICAgICBsZXQgZHggPSBkaXN0YW5jZVggLSAocmVjdC53aWR0aCkvMjtcbiAgICAgICAgXG4gICAgICAgIC8vIFRoZSB2ZXJ0aWNhbCBkaXN0YW5jZSBiZXR3ZWVuIHRoZSBjaXJjbGUgYW5kIHJlY3RcbiAgICAgICAgLy8gbWludXMgaGFsZiB0aGUgaGVpZ2h0IG9mIHRoZSByZWN0XG4gICAgICAgIGxldCBkeSA9IGRpc3RhbmNlWSAtIChyZWN0LmhlaWdodCkvMjtcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICAvLyBVc2UgUHl0aGFnb3JhcyBmb3JtdWxhIHRvIGNvbXBhcmUgdGhlIGRpc3RhbmNlIGJldHdlZW4gY2lyY2xlIGFuZCByZWN0IGNlbnRlcnMuXG4gICAgICAgIHJldHVybiAoZHggKiBkeCArIGR5ICogZHkgPD0gKGNpcmNsZS5yYWRpdXMgKiBjaXJjbGUucmFkaXVzKSk7XG4gICAgICAgIFxuICAgIH1cbiAgICBcbiAgICBcbiAgICBzdGF0aWMgY29udGFpbnNSZWN0KHJlY3QsIHBvaW50KVxuICAgIHtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiAocG9pbnQueCA8PSByZWN0LnJpZ2h0ICYmIFxuICAgICAgICAgICAgICAgIHBvaW50LnggPj0gcmVjdC54ICYmXG4gICAgICAgICAgICAgICAgcG9pbnQueSA+PSByZWN0LnkgJiYgXG4gICAgICAgICAgICAgICAgcG9pbnQueSA8PSByZWN0LmJvdHRvbSk7XG4gICAgICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgXG4gICAgc3RhdGljIGNvbnRhaW5zQ2lyY2xlKGNpcmNsZSwgcG9pbnQpXG4gICAge1xuICAgICAgICBcbiAgICAgICAgbGV0IGR4ID0gY2lyY2xlLnggLSBwb2ludC54O1xuICAgICAgICBsZXQgZHkgPSBjaXJjbGUueSAtIHBvaW50Lnk7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gZHggKiBkeCArIGR5ICogZHkgPD0gY2lyY2xlLnJhZGl1cyAqIGNpcmNsZS5yYWRpdXM7XG4gICAgICAgIFxuICAgIH1cbiAgICBcbn07IiwiLypnbG9iYWwgR2FtZSovXG5HYW1lLklucHV0ID0gY2xhc3MgSW5wdXR7XG4gICAgXG4gICAgY29uc3RydWN0b3IoKXtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuY2FsbGJhY2tzID0ge307XG4gICAgfVxuICAgIFxuICAgIC8qXG4gICAgICogRnVuY3Rpb24gdGhhdCByZXR1cm5zIHRoZSBtb3VzZXMgcG9zaXRpb24uXG4gICAgICogSXQgdGFrZXMgaW50byBhY2NvdW50IHRoZSBzaXplL3Bvc2l0aW9uIG9mIHRoZSBjYW52YXMgYW5kIHRoZSBzY2FsZSh6b29tIGluL291dCkuXG4gICAgICovXG4gICAgX21vdXNlUG9zaXRpb24oZXZlbnQpXG4gICAge1xuICAgICAgICAvLyBVc2VkIHRvIGdldCB0aGUgYWJzb2x1dGUgc2l6ZVxuICAgICAgICBsZXQgcmVjdCA9IHRoaXMucGFyZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICBcbiAgICAgICAgLyogcmVsYXRpb25zaGlwIGJpdG1hcCB2cyBlbGVtZW50IGZvciBYL1kgKi9cbiAgICAgICAgXG4gICAgICAgIC8vIEdldHMgdGhlIHggc2NhbGVcbiAgICAgICAgbGV0IHNjYWxlWCA9IHRoaXMucGFyZW50LndpZHRoIC8gcmVjdC53aWR0aDtcbiAgICAgICAgXG4gICAgICAgIC8vIEdldHMgdGhlIHkgc2NhbGVcbiAgICAgICAgbGV0IHNjYWxlWSA9IHRoaXMucGFyZW50LmhlaWdodCAvIHJlY3QuaGVpZ2h0O1xuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIC8vIFJldHVybnMgdHdvIHBvc3NpYmxlIHZhbHVlc1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgLy8gTW91c2UgeCBwb3NpdGlvbiBhZnRlciB0YWtpbmcgaW50byBhY2NvdW50IHRoZSBzaXplL3Bvc2l0aW9uIG9mIGNhbnZhcyBhbmQgc2NhbGVcbiAgICAgICAgICAgIHg6IChldmVudC5jbGllbnRYIC0gcmVjdC5sZWZ0KSAqIHNjYWxlWCxcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gTW91c2UgeSBwb3NpdGlvbiBhZnRlciB0YWtpbmcgaW50byBhY2NvdW50IHRoZSBzaXplL3Bvc2l0aW9uIG9mIGNhbnZhcyBhbmQgc2NhbGVcbiAgICAgICAgICAgIHk6IChldmVudC5jbGllbnRZIC0gcmVjdC50b3ApICogc2NhbGVZXG4gICAgICAgICAgICBcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIFxuICAgIGFkZENhbGxiYWNrKHR5cGUsIGNiKXtcbiAgICAgICAgXG4gICAgICAgIGlmKCF0aGlzLmNhbGxiYWNrc1t0eXBlXSkgdGhpcy5jYWxsYmFja3NbdHlwZV0gPSBbXTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuY2FsbGJhY2tzW3R5cGVdLnB1c2goY2IpO1xuXG4gICAgfVxuICAgIFxuICAgIFxuICAgIF9yZWFjdCh0eXBlLCBldmVudCl7XG4gICAgICAgIFxuICAgICAgICB2YXIgcG9zID0gdGhpcy5fbW91c2VQb3NpdGlvbihldmVudCk7XG4gICAgICAgIFxuICAgICAgICBmb3IodmFyIGkgaW4gdGhpcy5jYWxsYmFja3NbdHlwZV0pe1xuXG4gICAgICAgICAgICB0aGlzLmNhbGxiYWNrc1t0eXBlXVtpXShwb3MpO1xuICAgICAgICAgICAgXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIGxpc3RlbihwYXJlbnQpe1xuICAgICAgICBcbiAgICAgICAgdGhpcy5wYXJlbnQgPSBwYXJlbnQ7XG4gICAgICAgIFxuICAgICAgICBmb3IodmFyIHR5cGUgaW4gdGhpcy5jYWxsYmFja3Mpe1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZih0aGlzLmNhbGxiYWNrc1t0eXBlXS5sZW5ndGggPiAwKXtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudFt0eXBlXSA9IGZ1bmN0aW9uKHR5cGUpe1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGV2ZW50KXtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fcmVhY3QodHlwZSwgZXZlbnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIH0odHlwZSkuYmluZCh0aGlzKTtcblxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIFxuICAgIGNsZWFyKCl7XG4gICAgICAgIFxuICAgICAgICBmb3IobGV0IHR5cGUgaW4gdGhpcy5jYWxsYmFja3Mpe1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB0aGlzLnBhcmVudFt0eXBlXSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgICAgIFxuICAgIH1cbiAgICBcbn07IiwiLypnbG9iYWwgR2FtZSovXG5HYW1lLk1hdGhlbWF0aWNzID0gY2xhc3MgTWF0aGVtYXRpY3Mge1xuICAgIFxuICAgIHN0YXRpYyBub3JtYWxpemVWZWN0b3IodmVjdG9yKVxuICAgIHtcbiAgICAgICAgLy8gQXJjIHRhbiB3aWxsIGdpdmUgeW91IHRoZSBhbmdsZVxuICAgICAgICBsZXQgYW5nbGUgPSBNYXRoLmF0YW4yKHZlY3Rvci55LCB2ZWN0b3IueCk7XG4gICAgICAgIFxuICAgICAgICAvLyBXaWxsIGdpdmUgbnVtYmVyIGZvcm0gMCB0byAxXG4gICAgICAgIGxldCB4ID0gTWF0aC5jb3MoYW5nbGUpO1xuICAgICAgICBsZXQgeSA9IE1hdGguc2luKGFuZ2xlKTtcbiAgICAgICAgXG4gICAgICAgIC8vIFNldCB0aGUgbmV3IHZlY3RvclxuICAgICAgICB2ZWN0b3IueCA9IHg7XG4gICAgICAgIHZlY3Rvci55ID0geTtcbiAgICAgICAgXG4gICAgICAgIC8vIFJldHVybiB0aGUgdmVjdG9yXG4gICAgICAgIHJldHVybiB2ZWN0b3I7XG4gICAgfVxuICAgIFxuICAgIFxuICAgIC8qXG4gICAgICogIFJldHVybiB0aGUgZG90IHByb2R1Y3QgZm9yIDJkIGFuZCAzZCB2ZWN0b3JzXG4gICAgICovXG4gICAgc3RhdGljIGRvdCh2ZWN0b3JBLCB2ZWN0b3JCKXtcblxuICAgIFx0aWYoIXZlY3RvckEueikgdmVjdG9yQS56ID0gMDtcbiAgICBcdGlmKCF2ZWN0b3JCLnopIHZlY3RvckIueiA9IDA7XG4gICAgICAgIFxuICAgICAgICBsZXQgc3VtID0gMDtcbiAgICAgICAgXG4gICAgICAgIHN1bSArPSB2ZWN0b3JBLnggKiB2ZWN0b3JCLng7XG4gICAgICAgIHN1bSArPSB2ZWN0b3JBLnkgKiB2ZWN0b3JCLnk7XG4gICAgICAgIHN1bSArPSB2ZWN0b3JBLnogKiB2ZWN0b3JCLno7XG4gICAgXHRcbiAgICBcdHJldHVybiBzdW07XG4gICAgICAgIFxuICAgIH1cbiAgICBcbiAgICBcbiAgICAvKlxuICAgICAqICBWZWN0b3Igc3VtXG4gICAgICovXG4gICAgc3RhdGljIHZlY3RvclN1bShBLCBCKXtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB4OiBBLnggKyBCLngsXG4gICAgICAgICAgICB5OiBBLnkgKyBCLnlcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIFxuICAgIC8qXG4gICAgICogIFJldHVybiB2ZWN0b3IgcGVycGVuZGljdWxhclxuICAgICAqL1xuICAgIHN0YXRpYyBwZXJwZW5kaWN1bGFyVmVjdG9yKHZlY3Rvcil7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgeDogLXZlY3Rvci55LFxuICAgICAgICAgICAgeTogdmVjdG9yLnhcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIFxuICAgIC8qXG4gICAgICogIFNjYWxhciBWZWN0b3IgbXVsdGlwbGljYXRpb25cbiAgICAgKi9cbiAgICBzdGF0aWMgc2NhbGFyVmVjdG9yTXVsdGkoc2NhbGFyLCB2ZWN0b3IpXG4gICAge1xuICAgICAgICByZXR1cm4ge3g6IHNjYWxhciAqIHZlY3Rvci54LCB5OiBzY2FsYXIgKiB2ZWN0b3IueX07XG4gICAgfVxuICAgIFxuICAgIFxuICAgIFxuICAgIFxuICAgIC8qXG4gICAgICogIFJldHVybnMgYSByYW5kb20gaW50ZWdlciB3aXRoaW4gW21pbiwgbWF4KVxuICAgICAqL1xuICAgIHN0YXRpYyByYW5kb21JbnQobWluLCBtYXgpe1xuICAgICAgICBcbiAgICAgICAgbWluID0gTWF0aC5jZWlsKG1pbik7XG4gICAgICAgIG1heCA9IE1hdGguZmxvb3IobWF4KTtcbiAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4pKSArIG1pbjtcbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIFxuICAgIFxuICAgIFxuICAgIC8qXG4gICAgICogIFJldHVybnMgYSByYW5kb20gaW50ZWdlciB3aXRoaW4gW21pbiwgbWF4XVxuICAgICAqL1xuICAgIHN0YXRpYyByYW5kb21JbnRJbmMobWluLCBtYXgpe1xuICAgICAgICBcbiAgICAgICAgbWluID0gTWF0aC5jZWlsKG1pbik7XG4gICAgICAgIG1heCA9IE1hdGguZmxvb3IobWF4KTtcbiAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4gKyAxKSkgKyBtaW47XG4gICAgICAgIFxuICAgIH1cbiAgICBcbn07IiwiLypnbG9iYWwgR2FtZSovXG5HYW1lLlBoeXNpY3MgPSBjbGFzcyBQaHlzaWNzIHtcbiAgICAvKipcbiAgICAgKiBUaGUgc2V2ZW4gc3RlcHMgdG8gMmQgZWxhc3RpYyBjb2xsaXNpb24gdXNpbmcgdmVjdG9yIG1hdGggY2FuIGJlIGZvdW5kIFxuICAgICAqIGhlcmUgLT4gaHR0cDovL3d3dy5pbWFkYS5zZHUuZGsvfnJvbGYvRWR1L0RNODE1L0UxMC8yZGNvbGxpc2lvbnMucGRmXG4gICAgICogXG4gICAgICogVGhpcyBjYXNlIGlzIGZvciBjaXJjbGVzIHNwZWNpZmljYWxseSwgYnV0IGJ5IGNoYW5naW5nIHRoZSBzdGVwIDEgZm9yIFxuICAgICAqIGRpZmZlcmVudCBnZW9tZXRyaWVzIHNob3VsZCBtYWtlIHRoaXMgbWV0aG9kIHdvcmsgZm9yIGFueXRoaW5nIDJELlxuICAgICAqIFxuICAgICAqL1xuICAgIFxuICAgIFxuICAgIFxuICAgIFxuICAgIC8qXG4gICAgICogIENhbGN1bGF0ZXMgZmluYWwgdmVsb2NpdGllcyBmb3IgMUQgZWxhc3RpYyBwYXJ0aWNsZSBjb2xsaXNpb25cbiAgICAgKi9cbiAgICBzdGF0aWMgZWxhc3RpY1BhcnRpY2xlQ29sbGlzaW9uMUQodl8xLCBtXzEsIHZfMiwgbV8yKXtcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICBsZXQgdl8xX2YgPSB2XzEgKiAoKG1fMSAtIG1fMikgLyAobV8xICsgbV8yKSkgKyBcbiAgICAgICAgICAgICAgICAgICAgdl8yICogKCgyICogbV8yICkgLyAobV8xICsgbV8yKSk7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBcbiAgICAgICAgbGV0IHZfMl9mID0gdl8xICogKCgyICogbV8xKSAvIChtXzEgKyBtXzIpKSArXG4gICAgICAgICAgICAgICAgICAgIHZfMiAqICgobV8yIC0gbV8xKSAvIChtXzEgKyBtXzIpKTtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHYxIDogdl8xX2YsXG4gICAgICAgICAgICB2MiA6IHZfMl9mLFxuICAgICAgICAgICAgXG4gICAgICAgIH07XG4gICAgICAgIFxuICAgIH1cbiAgICBcbiAgICBcbiAgICAvKlxuICAgICAqICBSZXR1cm5zIHRoZSBmaW5hbCB2ZWxvY2l0aWVzIGZvciB0d28gcGFydGljbGVzIFNMQU1NSU5HXG4gICAgICovXG4gICAgc3RhdGljIGVsYXN0aWNQYXJ0aWNsZUNvbGxpc2lvbjJEKHZfMSwgbV8xLCB2XzIsIG1fMil7XG4gICAgICAgIFxuICAgICAgICBsZXQgdl9mX3ggPSBHYW1lLlBoeXNpY3MuZWxhc3RpY1BhcnRpY2xlQ29sbGlzaW9uMUQodl8xLngsIG1fMSwgdl8yLngsIG1fMik7XG5cbiAgICAgICAgbGV0IHZfZl95ID0gR2FtZS5QaHlzaWNzLmVsYXN0aWNQYXJ0aWNsZUNvbGxpc2lvbjFEKHZfMS55LCBtXzEsIHZfMi55LCBtXzIpO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdjEgOiB7XG4gICAgICAgICAgICAgICAgeDogdl9mX3gudl8xLFxuICAgICAgICAgICAgICAgIHk6IHZfZl95LnZfMSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHYyIDoge1xuICAgICAgICAgICAgICAgIHg6IHZfZl94LnZfMixcbiAgICAgICAgICAgICAgICB5OiB2X2ZfeS52XzIsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXG4gICAgICAgIH07XG4gICAgICAgIFxuICAgIH1cbiAgICBcbiAgICBcbiAgICBcbiAgICBzdGF0aWMgdW5pdE5vcm1hbFZlY3RvckNpcmNsZShjZW50ZXIxLCBjZW50ZXIyKVxuICAgIHtcbiAgICAgICAgaWYoY2VudGVyMS54ID09PSB1bmRlZmluZWQgfHwgY2VudGVyMi54ID09PSB1bmRlZmluZWQgfHwgY2VudGVyMS55ID09PSB1bmRlZmluZWQgfHwgY2VudGVyMi55ID09PSB1bmRlZmluZWQpXG4gICAgICAgIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhyb3cgRXJyb3IoXCJGQUlMRUQ6IGNlbnRlci54IG9yIGNlbnRlci55IHVuZGVmaW5lZFwiKTtcbiAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBsZXQgZHggPSBjZW50ZXIxLnggLSBjZW50ZXIyLng7XG4gICAgICAgIGxldCBkeSA9IGNlbnRlcjEueSAtIGNlbnRlcjIueTtcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIEdhbWUuTWF0aGVtYXRpY3Mubm9ybWFsaXplVmVjdG9yKHt4OiBkeCwgeTogZHl9KTtcbiAgICB9XG5cbiAgICBcbiAgICBcbiAgICBcbiAgICBzdGF0aWMgQ2lyY2xlc0NvbGxpc2lvbih2MSwgYzEsIG0xLCB2MiwgYzIsIG0yKXtcbiAgICAgICAgXG4gICAgICAgIC8vIEdldCB1bml0IG5vcm1hbCB2ZWN0b3IgYmV0d2VlbiAyIGNpcmNsZXNcbiAgICAgICAgbGV0IHVuaXROb3JtYWwgPSBHYW1lLlBoeXNpY3MudW5pdE5vcm1hbFZlY3RvckNpcmNsZShjMSwgYzIpO1xuICAgICAgICBsZXQgdW5pdFRhbmdlbnQgPSBHYW1lLk1hdGhlbWF0aWNzLnBlcnBlbmRpY3VsYXJWZWN0b3IodW5pdE5vcm1hbCk7XG4gICAgICAgIFxuICAgICAgICBsZXQgdjFuID0gR2FtZS5NYXRoZW1hdGljcy5kb3QodW5pdE5vcm1hbCwgdjEpO1xuICAgICAgICBsZXQgdjF0ID0gR2FtZS5NYXRoZW1hdGljcy5kb3QodW5pdFRhbmdlbnQsIHYxKTtcbiAgICAgICAgXG4gICAgICAgIGxldCB2Mm4gPSBHYW1lLk1hdGhlbWF0aWNzLmRvdCh1bml0Tm9ybWFsLCB2Mik7XG4gICAgICAgIGxldCB2MnQgPSBHYW1lLk1hdGhlbWF0aWNzLmRvdCh1bml0VGFuZ2VudCwgdjIpO1xuICAgICAgICBcbiAgICAgICAgbGV0IHZmbiA9IEdhbWUuUGh5c2ljcy5lbGFzdGljUGFydGljbGVDb2xsaXNpb24xRCh2MW4sIG0xLCB2Mm4sIG0yKTtcbiAgICAgICAgXG4gICAgICAgIGxldCB2ZjFuID0gR2FtZS5NYXRoZW1hdGljcy5zY2FsYXJWZWN0b3JNdWx0aSh2Zm4udjEsIHVuaXROb3JtYWwpO1xuICAgICAgICBsZXQgdmYybiA9IEdhbWUuTWF0aGVtYXRpY3Muc2NhbGFyVmVjdG9yTXVsdGkodmZuLnYyLCB1bml0Tm9ybWFsKTtcbiAgICAgICAgbGV0IHZmMXQgPSBHYW1lLk1hdGhlbWF0aWNzLnNjYWxhclZlY3Rvck11bHRpKHYxdCwgdW5pdFRhbmdlbnQpO1xuICAgICAgICBsZXQgdmYydCA9IEdhbWUuTWF0aGVtYXRpY3Muc2NhbGFyVmVjdG9yTXVsdGkodjJ0LCB1bml0VGFuZ2VudCk7XG4gICAgICAgIFxuICAgICAgICBsZXQgdmYxID0gR2FtZS5NYXRoZW1hdGljcy52ZWN0b3JTdW0odmYxbiwgdmYxdCk7XG4gICAgICAgIGxldCB2ZjIgPSBHYW1lLk1hdGhlbWF0aWNzLnZlY3RvclN1bSh2ZjJuLCB2ZjJ0KTtcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHYxOiB2ZjEsXG4gICAgICAgICAgICB2MjogdmYyLFxuICAgICAgICB9O1xuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgXG4gICAgXG4gICAgc3RhdGljIENpcmNsZVJlY3RDb2xsaXNpb24oYywgcil7XG4gICAgICAgIFxuICAgICAgICAvLyBEbyB0aGluZ3NcbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIFxuICAgIFxuICAgIHN0YXRpYyBDb2xsaXNpb24oQSwgQil7XG4gICAgICAgIFxuICAgICAgICBpZihBLmJvZHkudHlwZSA9PT0gR2FtZS5Cb2R5VHlwZXMuQ0lSQ0xFICYmIEIuYm9keS50eXBlID09PSBHYW1lLkJvZHlUeXBlcy5DSVJDTEUpe1xuICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4gR2FtZS5QaHlzaWNzLkNpcmNsZXNDb2xsaXNpb24oQS5ib2R5LnZlbCwgQS5ib2R5LnBvcywgQS5ib2R5Lm1hc3MsIEIuYm9keS52ZWwsIEIuYm9keS5wb3MsIEIuYm9keS5tYXNzKTtcbiAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYoQS5ib2R5LnR5cGUgPT09IEdhbWUuQm9keVR5cGVzLlJFQ1RBTkdMRSAmJiBCLmJvZHkudHlwZSA9PT0gR2FtZS5Cb2R5VHlwZXMuUkVDVEFOR0xFKXtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY29uc29sZS5sb2coJ1JlY3QgdG8gUmVjdCwgbW9mbycpO1xuXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGVsc2UgaWYoQS5ib2R5LnR5cGUgPT09IEdhbWUuQm9keVR5cGVzLlJFQ1RBTkdMRSAmJiBCLmJvZHkudHlwZSA9PT0gR2FtZS5Cb2R5VHlwZXMuQ0lSQ0xFKXtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY29uc29sZS5sb2coJ1JlY3QgdG8gQ2lyY2xlLCBtb2ZvJyk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdjE6IHtcblxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdjI6IHtcbiAgICAgICAgICAgICAgICAgICAgeDogLUIuYm9keS52ZWwueCxcbiAgICAgICAgICAgICAgICAgICAgeTogQi5ib2R5LnZlbC55XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYoQS5ib2R5LnR5cGUgPT09IEdhbWUuQm9keVR5cGVzLkNJUkNMRSAmJiBCLmJvZHkudHlwZSA9PT0gR2FtZS5Cb2R5VHlwZXMuUkVDVEFOR0xFKXtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY29uc29sZS5sb2coJ0NpcmNsZSB0byBSZWN0LCBtb2ZvJyk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdjE6IHtcbiAgICAgICAgICAgICAgICAgICAgeDogLUEuYm9keS52ZWwueCxcbiAgICAgICAgICAgICAgICAgICAgeTogQS5ib2R5LnZlbC55XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB2Mjoge1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgXG4gICAgfVxuICAgIFxufTsiLCIvKmdsb2JhbCBHYW1lKi9cbkdhbWUuUGh5c2ljc01hbmFnZXIgPSBjbGFzcyBQaHlzaWNzTWFuYWdlciB7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcblxuICAgICAgICB0aGlzLm1lbWJlcnMgPSBbXG4gICAgICAgICAgICAvLyB7XG4gICAgICAgICAgICAvLyAgICAgY29sbGlkZXNXaXRoOiBbJ2JhbGxzJywgJ3BpbnMnXSxcbiAgICAgICAgICAgIC8vIH0gICAgXG4gICAgICAgIF07XG5cbiAgICAgICAgdGhpcy5jb2xsaXNpb25Hcm91cHMgPSB7XG5cbiAgICAgICAgfTtcblxuICAgIH1cblxuXG4gICAgYWRkVG9Hcm91cChncm91cE5hbWUsIG1lbWJlcikge1xuXG4gICAgICAgIC8vIENyZWF0ZSB0aGUgZ3JvdXAgaWYgaXQgZG9lc24ndCBleGlzdFxuICAgICAgICBpZiAoIXRoaXMuY29sbGlzaW9uR3JvdXBzW2dyb3VwTmFtZV0pIHRoaXMuY29sbGlzaW9uR3JvdXBzW2dyb3VwTmFtZV0gPSBbXTtcblxuICAgICAgICB0aGlzLmNvbGxpc2lvbkdyb3Vwc1tncm91cE5hbWVdLnB1c2gobWVtYmVyKTtcblxuICAgICAgICBjb25zb2xlLmxvZyhncm91cE5hbWUpO1xuXG4gICAgfVxuXG5cblxuXG4gICAgYWRkTWVtYmVyKG1lbWJlcikge1xuXG4gICAgICAgIG1lbWJlci5jb2xsaXNpb25JbmRleCA9IHRoaXMubWVtYmVycy5sZW5ndGg7XG5cbiAgICAgICAgdGhpcy5tZW1iZXJzLnB1c2gobWVtYmVyKTtcblxuICAgICAgICBjb25zb2xlLmxvZyhcIkFkZGVkIG1lbWJlclwiKTtcbiAgICAgICAgY29uc29sZS5sb2cobWVtYmVyKTtcbiAgICB9XG5cblxuXG4gICAgdXBkYXRlKGRlbHRhKSB7XG5cbiAgICAgICAgdGhpcy5hbHJlYWR5Q29sbGlkZWQgPSB7fTtcblxuICAgICAgICAvLyBMb29wIHRocm91Z2ggZGVtIG1lbWJlcnNcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLm1lbWJlcnMubGVuZ3RoOyBpKyspIHtcblxuICAgICAgICAgICAgLy8gQ3VycmVudCBtZW1iZXIgYXQgaW5kZXggaVxuICAgICAgICAgICAgbGV0IG1lbWJlciA9IHRoaXMubWVtYmVyc1tpXTtcblxuICAgICAgICAgICAgLy8gTG9vcCB0aHJvdWdoIHRoZSBncm91cHMgdGhhdCB0aGUgbWVtYmVyIGNvbGxpZGVzIHdpdGhcbiAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgbWVtYmVyLmJvZHkuY29sbGlkZXNXaXRoLmxlbmd0aDsgaisrKSB7XG5cbiAgICAgICAgICAgICAgICAvLyBBcnJheSBvZiBtZW1iZXJzIG9mIHRoZSBncm91cFxuICAgICAgICAgICAgICAgIGxldCBncm91cCA9IHRoaXMuY29sbGlzaW9uR3JvdXBzW21lbWJlci5ib2R5LmNvbGxpZGVzV2l0aFtqXV07XG5cbiAgICAgICAgICAgICAgICAvLyBSZXR1cm4gdGhlIGluZGV4IHRoYXQgdGhlIG1lbWJlciBjb2xsaWRlcyB3aXRoLlxuICAgICAgICAgICAgICAgIGxldCBjb2xsaXNpb25JbmRleCA9IC0xO1xuXG5cbiAgICAgICAgICAgICAgICAvLyBDaGVjayBpZiBhbnkgbWVtYmVyIG9mIHRoZSBncm91cCBpbnRlcnNlY3RzIHRoZSBjdXJyZW50IG1lbWViZXJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBrID0gMDsgayA8IGdyb3VwLmxlbmd0aDsgaysrKSB7XG5cblxuICAgICAgICAgICAgICAgICAgICAvLyBIYXMgdGhpcyBtZW1iZXIgYWxyZWFkeSBjb2xsaWRlZCB3aXRoIHRoZSBvdGhlciBvYmplY3Q/XG4gICAgICAgICAgICAgICAgICAgIGxldCBoYXNBbHJlYWR5Q29sbGlkZWQgPSB0aGlzLmFscmVhZHlDb2xsaWRlZFttZW1iZXIuY29sbGlzaW9uSW5kZXhdICE9PSB1bmRlZmluZWQ7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gSXMgaXQgY29sbGlkaW5nIHdpdGggaXRzZWxmP1xuICAgICAgICAgICAgICAgICAgICBsZXQgaXNDb2xsaWRpbmdXaXRoU2VsZiA9IGdyb3VwW2tdLmJvZHkgPT09IG1lbWJlci5ib2R5O1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIENoZWNrIGZvciBjb2xsaXNpb24gaWYgaXQncyBub3QgdGhlIHNhbWUgbWVtYmVyIHdlJ3JlIGNoZWNraW5nXG4gICAgICAgICAgICAgICAgICAgIGlmICghaGFzQWxyZWFkeUNvbGxpZGVkICYmICFpc0NvbGxpZGluZ1dpdGhTZWxmICYmIEdhbWUuQ29sbGlzaW9uLmludGVyc2VjdHMoZ3JvdXBba10uYm9keS5nZW9tZXRyeSwgbWVtYmVyLmJvZHkuZ2VvbWV0cnkpKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdDb2xsaXNpb24nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbGxpc2lvbkluZGV4ID0gaztcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gU3RvcmUgdGhlIGluZGV4IG9mIHRoZSBjb2xsaWRlZCBtZW1iZXJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYWxyZWFkeUNvbGxpZGVkW2dyb3VwW2tdLmNvbGxpc2lvbkluZGV4XSA9IG1lbWJlci5jb2xsaXNpb25JbmRleDtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gQnJlYWsgZGFuY2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIH1cblxuXG4gICAgICAgICAgICAgICAgaWYgKGNvbGxpc2lvbkluZGV4ID4gLTEpIHtcblxuICAgICAgICAgICAgICAgICAgICAvLyBUaGUgY29sbGlzaW9uIG1lbWJlciBib2R5XG4gICAgICAgICAgICAgICAgICAgIGxldCBjbWIgPSBncm91cFtjb2xsaXNpb25JbmRleF0uYm9keTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBUaGUgbWVtYmVyIGJvZHlcbiAgICAgICAgICAgICAgICAgICAgbGV0IG1iID0gbWVtYmVyLmJvZHk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ0NvbGxpc2lvbiB3aXRoJywgbWVtYmVyLmJvZHkuY29sbGlkZXNXaXRoW2pdKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBHZXQgdGhlIGZpbmFsIHZlbG9jaXR5IGJldHdlZW4gdGhlIGNvbGxpZGluZyBjaXJjbGVzXG4gICAgICAgICAgICAgICAgICAgIGlmKG1iLmlzQm91bmN5Q29sbGlkeSAmJiBjbWIuaXNCb3VuY3lDb2xsaWR5KXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBmaW5hbFZlbG9jaXRpZXMgPSBHYW1lLlBoeXNpY3MuQ29sbGlzaW9uKG1lbWJlciwgZ3JvdXBbY29sbGlzaW9uSW5kZXhdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gU2V0IHRoZSB2ZWxvY2l0aWVzIG9mIHRoZSB0d28gb2JqZWN0c1xuICAgICAgICAgICAgICAgICAgICAgICAgbWIuc2V0VmVsb2NpdHkoZmluYWxWZWxvY2l0aWVzLnYxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNtYi5zZXRWZWxvY2l0eShmaW5hbFZlbG9jaXRpZXMudjIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUZW1wb3JhcnkgZmluYWwgdmVsb2NpdHkgZml4XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobWIuZml4ZWQpIG1iLnNldFZlbG9jaXR5KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB4OiAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHk6IDBcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNtYi5maXhlZCkgY21iLnNldFZlbG9jaXR5KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB4OiAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHk6IDBcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2V7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdDb2xsaXNpb24gd2l0aCBpbm5lciBndXR0ZXInLCBtYiwgY21iKTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgXG5cblxuXG4gICAgICAgICAgICAgICAgICAgIC8vIExldCB0aGUgZXZlbnQgbGlzdGVuZXJzIGtub3cgdGhhdCBhIGNvbGxpc2lvbiBoYXBwZW5lZFxuICAgICAgICAgICAgICAgICAgICBtYi5vbkNvbGxpZGVkKGdyb3VwW2NvbGxpc2lvbkluZGV4XSk7XG4gICAgICAgICAgICAgICAgICAgIGNtYi5vbkNvbGxpZGVkKG1lbWJlcik7XG5cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG5cbiAgICB9XG5cbn07IiwiLypnbG9iYWwgR2FtZSovXG5HYW1lLlJlY3RhbmdsZSA9IGNsYXNzIFJlY3RhbmdsZXtcbiAgICBcbiAgICBjb25zdHJ1Y3Rvcih4LCB5LCB3aWR0aCwgaGVpZ2h0LCBjb2xvcil7XG4gICAgICAgIFxuICAgICAgICB0aGlzLnggPSB4O1xuICAgICAgICB0aGlzLnkgPSB5O1xuICAgICAgICB0aGlzLndpZHRoID0gd2lkdGg7XG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgICAgICBcbiAgICAgICAgdGhpcy5sZWZ0ID0geDtcbiAgICAgICAgdGhpcy5yaWdodCA9IHggKyB3aWR0aDtcbiAgICAgICAgdGhpcy50b3AgPSB5O1xuICAgICAgICB0aGlzLmJvdHRvbSA9IHkgKyBoZWlnaHQ7XG4gICAgICAgIFxuICAgICAgICB0aGlzLmNvbG9yID0gY29sb3I7XG4gICAgICAgIHRoaXMudHlwZSA9IEdhbWUuQm9keVR5cGVzLlJFQ1RBTkdMRTtcbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIGNvbnRhaW5zKHBvaW50KXtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBHYW1lLkNvbGxpc2lvbi5jb250YWluc1JlY3QodGhpcywgcG9pbnQpO1xuICAgICAgICAgICAgICAgIFxuICAgIH1cbiAgICBcbiAgICBcbiAgICBpbnRlcnNlY3RzKG9iail7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gR2FtZS5Db2xsaXNpb24uaW50ZXJzZWN0cyhvYmosIHRoaXMpO1xuICAgIH1cbiAgICBcbiAgICBcbiAgICBkcmF3KGN0eCwgaW1hZ2Upe1xuICAgICAgICBcbiAgICAgICAgLy8gRHJhdyB0aGUgcmVjdFxuICAgICAgICBpZihpbWFnZSl7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGN0eC5kcmF3SW1hZ2UoaW1hZ2UsIHRoaXMueCAtIHRoaXMucmFkaXVzLCB0aGlzLnkgLSB0aGlzLnJhZGl1cyk7XG4gICAgICAgICAgICBcbiAgICAgICAgfVxuICAgICAgICBlbHNle1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgICAgICAgICBjdHgucmVjdCh0aGlzLngsIHRoaXMueSwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xuICAgICAgICAgICAgY3R4LmZpbGxTdHlsZSA9IHRoaXMuY29sb3I7XG4gICAgICAgICAgICBjdHguZmlsbCgpO1xuICAgICAgICAgICAgY3R4LmNsb3NlUGF0aCgpO1xuICAgICAgICAgICAgXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgfVxuICAgIFxufTsiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
