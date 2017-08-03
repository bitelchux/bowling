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