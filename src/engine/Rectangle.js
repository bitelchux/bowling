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