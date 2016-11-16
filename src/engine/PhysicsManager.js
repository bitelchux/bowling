/*global Game*/
Game.PhysicsManager = class PhysicsManager {

    constructor() {

        this.members = [
            // {
            //     collidesWith: ['balls', 'pins'],
            // }    
        ];

        this.collisionGroups = {

        };

    }


    addToGroup(groupName, member) {

        // Create the group if it doesn't exist
        if (!this.collisionGroups[groupName]) this.collisionGroups[groupName] = [];

        this.collisionGroups[groupName].push(member);

        console.log(groupName);

    }




    addMember(member) {

        member.collisionIndex = this.members.length;

        this.members.push(member);

        console.log("Added member");
        console.log(member);
    }



    update(delta) {

        this.alreadyCollided = {};

        // Loop through dem members
        for (let i = 0; i < this.members.length; i++) {

            // Current member at index i
            let member = this.members[i];

            // Loop through the groups that the member collides with
            for (let j = 0; j < member.body.collidesWith.length; j++) {

                // Array of members of the group
                let group = this.collisionGroups[member.body.collidesWith[j]];

                // Return the index that the member collides with.
                let collisionIndex = -1;


                // Check if any member of the group intersects the current memeber
                for (let k = 0; k < group.length; k++) {


                    // Has this member already collided with the other object?
                    let hasAlreadyCollided = this.alreadyCollided[member.collisionIndex] !== undefined;

                    // Is it colliding with itself?
                    let isCollidingWithSelf = group[k].body === member.body;

                    // Check for collision if it's not the same member we're checking
                    if (!hasAlreadyCollided && !isCollidingWithSelf && Game.Collision.intersects(group[k].body.geometry, member.body.geometry)) {

                        // console.log('Collision');
                        collisionIndex = k;

                        // Store the index of the collided member
                        this.alreadyCollided[group[k].collisionIndex] = member.collisionIndex;

                        // Break dance
                        break;

                    }

                }


                if (collisionIndex > -1) {

                    // The collision member body
                    let cmb = group[collisionIndex].body;

                    // The member body
                    let mb = member.body;

                    // console.log('Collision with', member.body.collidesWith[j]);

                    // Get the final velocity between the colliding circles
                    if(mb.isBouncyCollidy && cmb.isBouncyCollidy){
                        let finalVelocities = Game.Physics.Collision(member, group[collisionIndex]);
                        
                        // Set the velocities of the two objects
                        mb.setVelocity(finalVelocities.v1);
                        cmb.setVelocity(finalVelocities.v2);
                        
                        // Temporary final velocity fix
                        if (mb.fixed) mb.setVelocity({
                            x: 0,
                            y: 0
                        });
                        if (cmb.fixed) cmb.setVelocity({
                            x: 0,
                            y: 0
                        });
                    }
                    else{
                        
                        // console.log('Collision with inner gutter', mb, cmb);
                    
                    }
                    



                    // Let the event listeners know that a collision happened
                    mb.onCollided(group[collisionIndex]);
                    cmb.onCollided(member);

                }

            }

        }

    }

};