/*global Game*/
Game.Physics = class Physics {
    /**
     * The seven steps to 2d elastic collision using vector math can be found 
     * here -> http://www.imada.sdu.dk/~rolf/Edu/DM815/E10/2dcollisions.pdf
     * 
     * This case is for circles specifically, but by changing the step 1 for 
     * different geometries should make this method work for anything 2D.
     * 
     */
    
    
    
    
    /*
     *  Calculates final velocities for 1D elastic particle collision
     */
    static elasticParticleCollision1D(v_1, m_1, v_2, m_2){
        
        
        let v_1_f = v_1 * ((m_1 - m_2) / (m_1 + m_2)) + 
                    v_2 * ((2 * m_2 ) / (m_1 + m_2));
                    
        
        let v_2_f = v_1 * ((2 * m_1) / (m_1 + m_2)) +
                    v_2 * ((m_2 - m_1) / (m_1 + m_2));
        
        return {
            
            v1 : v_1_f,
            v2 : v_2_f,
            
        };
        
    }
    
    
    /*
     *  Returns the final velocities for two particles SLAMMING
     */
    static elasticParticleCollision2D(v_1, m_1, v_2, m_2){
        
        let v_f_x = Game.Physics.elasticParticleCollision1D(v_1.x, m_1, v_2.x, m_2);

        let v_f_y = Game.Physics.elasticParticleCollision1D(v_1.y, m_1, v_2.y, m_2);
        
        return {
            
            v1 : {
                x: v_f_x.v_1,
                y: v_f_y.v_1,
            },
            
            v2 : {
                x: v_f_x.v_2,
                y: v_f_y.v_2,
            },
            
        };
        
    }
    
    
    
    static unitNormalVectorCircle(center1, center2)
    {
        if(center1.x === undefined || center2.x === undefined || center1.y === undefined || center2.y === undefined)
        {
            
            throw Error("FAILED: center.x or center.y undefined");
            
        }
        
        let dx = center1.x - center2.x;
        let dy = center1.y - center2.y;
        
        
        
        return Game.Mathematics.normalizeVector({x: dx, y: dy});
    }

    
    
    
    static CirclesCollision(v1, c1, m1, v2, c2, m2){
        
        // Get unit normal vector between 2 circles
        let unitNormal = Game.Physics.unitNormalVectorCircle(c1, c2);
        let unitTangent = Game.Mathematics.perpendicularVector(unitNormal);
        
        let v1n = Game.Mathematics.dot(unitNormal, v1);
        let v1t = Game.Mathematics.dot(unitTangent, v1);
        
        let v2n = Game.Mathematics.dot(unitNormal, v2);
        let v2t = Game.Mathematics.dot(unitTangent, v2);
        
        let vfn = Game.Physics.elasticParticleCollision1D(v1n, m1, v2n, m2);
        
        let vf1n = Game.Mathematics.scalarVectorMulti(vfn.v1, unitNormal);
        let vf2n = Game.Mathematics.scalarVectorMulti(vfn.v2, unitNormal);
        let vf1t = Game.Mathematics.scalarVectorMulti(v1t, unitTangent);
        let vf2t = Game.Mathematics.scalarVectorMulti(v2t, unitTangent);
        
        let vf1 = Game.Mathematics.vectorSum(vf1n, vf1t);
        let vf2 = Game.Mathematics.vectorSum(vf2n, vf2t);
        
        
        
        return {
            v1: vf1,
            v2: vf2,
        };
        
    }
    
    
    
    static CircleRectCollision(c, r){
        
        // Do things
        
    }
    
    
    
    static Collision(A, B){
        
        if(A.body.type === Game.BodyTypes.CIRCLE && B.body.type === Game.BodyTypes.CIRCLE){
            
            return Game.Physics.CirclesCollision(A.body.vel, A.body.pos, A.body.mass, B.body.vel, B.body.pos, B.body.mass);
            
        }
        else if(A.body.type === Game.BodyTypes.RECTANGLE && B.body.type === Game.BodyTypes.RECTANGLE){
            
            console.log('Rect to Rect, mofo');

        }
        
        else if(A.body.type === Game.BodyTypes.RECTANGLE && B.body.type === Game.BodyTypes.CIRCLE){
            
            console.log('Rect to Circle, mofo');
            
            return {
                v1: {

                },
                v2: {
                    x: -B.body.vel.x,
                    y: B.body.vel.y
                }
            };
            
        }
        else if(A.body.type === Game.BodyTypes.CIRCLE && B.body.type === Game.BodyTypes.RECTANGLE){
            
            console.log('Circle to Rect, mofo');
            
            return {
                v1: {
                    x: -A.body.vel.x,
                    y: A.body.vel.y
                },
                v2: {
                    
                }
            };
            
        }
        
        
        
        
    }
    
};