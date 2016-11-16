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