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