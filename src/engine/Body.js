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