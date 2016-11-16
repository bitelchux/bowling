/*global Game*/
Game.Mathematics = class Mathematics {
    
    static normalizeVector(vector)
    {
        // Arc tan will give you the angle
        let angle = Math.atan2(vector.y, vector.x);
        
        // Will give number form 0 to 1
        let x = Math.cos(angle);
        let y = Math.sin(angle);
        
        // Set the new vector
        vector.x = x;
        vector.y = y;
        
        // Return the vector
        return vector;
    }
    
    
    /*
     *  Return the dot product for 2d and 3d vectors
     */
    static dot(vectorA, vectorB){

    	if(!vectorA.z) vectorA.z = 0;
    	if(!vectorB.z) vectorB.z = 0;
        
        let sum = 0;
        
        sum += vectorA.x * vectorB.x;
        sum += vectorA.y * vectorB.y;
        sum += vectorA.z * vectorB.z;
    	
    	return sum;
        
    }
    
    
    /*
     *  Vector sum
     */
    static vectorSum(A, B){
        
        return {
            x: A.x + B.x,
            y: A.y + B.y
        };
        
    }
    
    
    /*
     *  Return vector perpendicular
     */
    static perpendicularVector(vector){
        
        return {
            x: -vector.y,
            y: vector.x
        };
        
    }
    
    
    /*
     *  Scalar Vector multiplication
     */
    static scalarVectorMulti(scalar, vector)
    {
        return {x: scalar * vector.x, y: scalar * vector.y};
    }
    
    
    
    
    /*
     *  Returns a random integer within [min, max)
     */
    static randomInt(min, max){
        
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
        
    }
    
    
    
    
    /*
     *  Returns a random integer within [min, max]
     */
    static randomIntInc(min, max){
        
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
        
    }
    
};