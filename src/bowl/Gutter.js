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