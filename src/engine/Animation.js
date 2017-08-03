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