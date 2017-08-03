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
		
		// Boolean for when to change frame in Game.js for reseting logic
		this.goToNextFrame = false;


		// First 9 frames
		for (let i = 0; i < 9; i++) {
			// Push empty array in frames
			this.frames.push({
				one: null,
				two: null,
				score: null,
				isFinal: false,
			});
		}

		// Last frame
		this.frames.push({
			one: null,
			two: null,
			three: null,
			score: null,
			isFinal: false,
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

		this.calculateScores();

		// If user has scored a strike or end of frame
		if (numPins === 10 || (frame.one !== null && frame.two !== null)) {
			
			if (this.currentFrame !== 9) {
				// Increment frame
				this.goToNextFrame = true;
				this.currentFrame++;
				console.log('go to next frame, bitch');
			}

		}

	}

	calculateScores() {

		for (let i = 0; i <= this.currentFrame; i++) {

			let frame = this.frames[i];
			let nextFrame = this.frames[i + 1];
			let nextNextFrame = this.frames[i + 2];
			console.log(this.currentFrame);

			
		//	if(i === 9)
		//	{
				frame.isFinal = true;
		//	}


			// Get a non mark (#)
			if (frame.one !== 10 && (frame.one + frame.two) !== 10) {

				// Add the scores to the total score
				frame.score = frame.one + frame.two;

				if (frame.two !== null)
					frame.isFinal = true;

			}
			// Get a strike
			else if (frame.one === 10) {

				// If on the 10th frame
				if(i === 9)
				{
					// Add all 3 scores since first bowl was a strike	
					frame.score = frame.one + frame.two + frame.three;
				}
				// If on frame 9th frame
				else if(i === 8)
				{
					
					// If next frame was a strike
					if (nextFrame.one === 10) {

						// If you've thrown the ball twice more after the current throw
						if (nextFrame.one !== null) frame.isFinal = true;

						// Add score of frame.one(strike so 10) and the next frames total
						frame.score = frame.one + nextFrame.one + nextFrame.two;

					}
					else {

						// If you've finished bowling in the entire frame ahead of i
						if (nextFrame.one !== null && nextFrame.two !== null) frame.isFinal = true;

						// Add score of frame.one(strike so 10) and the next frames total
						frame.score = frame.one + nextFrame.one + nextFrame.two;

					}
					
				}
				// If on frames 1-8th
				else
				{
					// If next frame was a strike
					if (nextFrame.one === 10) {

						// If you've thrown the ball twice more after the current throw
						if (nextNextFrame.one !== null) frame.isFinal = true;

						// Add total score of the frame and the next next frames first bowl
						frame.score = frame.one + nextFrame.one + nextFrame.two + nextNextFrame.one;

					}
					else {

						// If you've finished bowling in the entire frame ahead of i
						if (nextFrame.one !== null && nextFrame.two !== null) frame.isFinal = true;

						// Add total score of the next frame
						frame.score = frame.one + nextFrame.one + nextFrame.two;

					}
				}
				
			}
			// Get a spare
			else if ((frame.one + frame.two) === 10) {
				
				// If on the 10th frame
				if(i === 9)
				{
					// Spare from first 2 bowls + last bowl
					frame.score = 10 + frame.three;
				}
				else
				{

					// Add the first bowl of the frame
					frame.score = frame.one + frame.two + nextFrame.one;


					if (nextFrame.one !== null) frame.isFinal = true;
					
				}
				

			}


			// Add the previous frame score if not the first frame
			frame.score += i > 0 ? this.frames[i - 1].score : 0;
			
			

			
		}


	}


	tenthFrameLogic(numPins) {
		// XXX, #/X, #/#, XX#, X##, X#/

		let frame = this.frames[this.currentFrame];
		
		

		if (frame.one === null) {
			frame.one = numPins;
		}
		else if (frame.two === null) {
			if (frame.one === 10) {
				frame.two = numPins;
			}
			else {
				frame.two = numPins - frame.one;
			}

		}
		else if (frame.three === null) {
			if (frame.two === 10) {
				frame.three = numPins;
			}
			else{
				frame.three = numPins;
			}

		}
		
		// debugger;
		if (frame.one === 10 && frame.two === null) {
			console.log('strike first frame');
			this.goToNextFrame = true;
		}
		else if ((frame.one + frame.two) === 10 && frame.one !== 10) {
			console.log('spare first frame');
			this.goToNextFrame = true;
		}
		else if (frame.one === 10 && frame.two === 10) {
			console.log('double strike');
			this.goToNextFrame = true;
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




			function drawLittleCell(val, leftVal) {
				if (val === null) return;
				ctx.fillStyle = 'black';
				ctx.font = "16px Arial";
				ctx.fillText(val, left + leftVal, cellTop + 12);
			}

			// Draw the SCORES
			ctx.fillStyle = 'black';
			ctx.font = "16px Arial";

			// Draw the 10th frame
			if (i == this.frames.length - 1) {

				if (frame.one === null) continue;

				if (frame.one === 10) {
					drawLittleCell('X', 2);
				}
				else if (frame.one === 0) {
					drawLittleCell('-', 2);
				}
				else {
					drawLittleCell(frame.one, 2);
				}

				if (frame.two === null) continue;
				if (frame.two === 10) {
					drawLittleCell('X', 15);
				}
				else if (frame.two + frame.one === 10) {
					drawLittleCell('/', 15);
				}
				else {
					drawLittleCell(frame.two, 15);
				}

				if (frame.three === null) continue;
				if (frame.three === 10) {
					drawLittleCell('X', 30);
				}
				else if (frame.three + frame.two === 10) {
					drawLittleCell('/', 30);
				}
				else {
					drawLittleCell(frame.three, 30);
				}
			}
			else {
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
			}



			// Draw the total score so far
			ctx.font = "16px Arial";
			//	if(frame.score) {
			if (frame.isFinal) {

				ctx.fillText(frame.score.toString(), left + 5, cellTop + 32);
			}

		}


	}

}
