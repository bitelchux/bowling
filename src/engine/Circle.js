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