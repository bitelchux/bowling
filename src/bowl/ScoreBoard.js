/*global Game*/
class ScoreBoard {

    /*
      We need array for actual score, and an array for what score to display [total for frame, spares(/) and strikes(X)].
     */

    constructor() {

        // Store frames
        this.frames = [];

        // Current frame
        this.currentFrame = 0;
        this.score = 0;


        // First 9 frames
        for (let i = 0; i < 9; i++) {
            // Push empty array in frames
            this.frames.push({
                one: null,
                two: null,
                score: null,
            });
        }

        // Last frame
        this.frames.push({
            one: null,
            two: null,
            three: null,
            score: null
        });

    }


    addScore(numPins) {

        // Don't let an invalid index be used.
        if (this.currentFrame >= this.frames.length) return;

        let frame = this.frames[this.currentFrame];



        if (this.currentFrame === 9) {
            this.tenthFrameLogic(numPins);
        }
        else if (frame.one === null) {
            frame.one = numPins;
        }
        else if (frame.two === null) {
            frame.two = numPins - frame.one;
        }
        // If user has scored a strike or end of frame
        else if (numPins === 10 || (frame.one !== null && frame.two !== null)) {

            // Increment frame
            this.currentFrame++;

        }

        
        frame.score = this.calculateScore();

    }

    calculateScore() {

        let sum = 0;

        for (let i in this.frames) {
            let f = this.frames[i];
            sum += f.one || 0;
            sum += f.two || 0;
            sum += f.three || 0;
        }

        return sum;

    }

    
    tenthFrameLogic(numPins) {
        // XXX, #/X, #/#, XX#, X##, X#/
        
        let frame = this.frames[this.currentFrame];
        
        if(frame.one === null)
        {
            frame.one = numPins;
        }
        else if(frame.two === null)
        {
            frame.two = numPins;
        }
        else if(frame.three === null)
        {
            if(frame.one === 10)
            {
                
            }
            if(frame.one + frame.two >= 10)
            {
                frame.three = numPins;
            }
        }
        
        
        // Bowl strike first bowl
        if(frame.one === 10){
            
            // Bowl strike second bowl
            if(frame.two === 10){
                
                
                
            }
            
            // Don't bowl strike second bowl
            else{
                
                
                
            }
                
        }
        // Bowl spare in first 2 bowls
        else if(frame.one + frame.two >= 10)
        {
            // Frame.three logic
            
        }
        

    }


    draw(left, top, ctx) {

        let cellSize = {
            w: 45,
            h: 45
        };

        // Background
        // ctx.fillStyle = 'lightgrey';
        // ctx.fillRect(left, top, cellSize.w, cellSize.h * 10);


        for (let i in this.frames) {

            let frame = this.frames[i];
            let cellTop = top + cellSize.h * i;
            let littleLeft = left + cellSize.w - 15;



            // Draw the big cell
            ctx.beginPath();

            ctx.strokeStyle = "black";
            ctx.rect(left, cellTop, cellSize.w, cellSize.h);
            ctx.stroke();

            ctx.closePath();



            // Draw the little cell in top right corner
            ctx.beginPath();

            ctx.strokeStyle = "blue";
            ctx.rect(littleLeft, cellTop, 15, 15);
            ctx.stroke();

            ctx.closePath();


            // Draw additional little cells for last frame
            if (i == this.frames.length - 1) {
                ctx.beginPath();

                ctx.strokeStyle = "blue";
                ctx.rect(left, cellTop, 15, 15);
                ctx.rect(left + 15, cellTop, 15, 15);
                ctx.stroke();

                ctx.closePath();
            }







            // Draw the SCORES
            ctx.fillStyle = 'black';
            ctx.font = "16px Arial";

            if (frame.one != null) {

                if (frame.one === 10) {

                    ctx.fillText('X', littleLeft + 2, cellTop + 12);

                }
                else if (frame.one === 0) {

                    ctx.fillText('-', left + 5, cellTop + 16);

                }
                else {

                    ctx.fillText(frame.one.toString(), left + 5, cellTop + 16);

                }

            }

            if (frame.two != null) {

                // Draw the little score on the right or / or X
                ctx.font = "14px Arial";
                if (frame.one + frame.two === 10) {

                    ctx.fillText('/', littleLeft + 2, cellTop + 12);

                }
                else if (frame.two === 0) {

                    ctx.fillText('-', littleLeft + 2, cellTop + 12);

                }
                else {

                    ctx.fillText(frame.two.toString(), littleLeft + 2, cellTop + 12);

                }

            }



            // Draw the total score so far
            ctx.font = "16px Arial";
            if (frame.score) {

                ctx.fillText(frame.score.toString(), left + 5, cellTop + 32);

            }

        }


    }

}