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