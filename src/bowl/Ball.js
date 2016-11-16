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