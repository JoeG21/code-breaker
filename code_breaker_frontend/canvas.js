//canvas//
let ctx = null;
let holdNum = null;
let gameMap = [
	2, 10, 10, 10, 2, 2, 10, 10, 10, 2,
	10, 10, 10, 10, 10, 10, 10, 10, 10, 10,
	10, 10, 10, 10, 10, 10, 10, 10, 10, 10,
	10, 10, 10, 10, 10, 10, 10, 10, 10, 10,
	10, 10, 10, 10, 10, 10, 10, 10, 10, 10,
	0, 1, 2, 3, 4, 5, 6, 7, 8, 9
];
let tileW = 80, tileH = 80;
let mapW = 10, mapH = 6;
let currentSecond = 0, frameCount = 0, framesLastSecond = 0, lastFrameTime = 0;
let tileset = null, tilesetURL = "tileset3.png", tilesetLoaded = false;

let keysDown = {
	37 : false, 38 : false, 39 : false,
	40 : false, 87 : false, 83 : false,
	65 : false, 68 : false, 32 : false
};

let floorTypes = {
	num0	: 0, num1	: 1, num2	: 2,
	num3	: 3, num4	: 4, num5	: 5,
	num6	: 6, num7	: 7, num8	: 8,
	num1	: 9, path	: 10, dropoff	: 11,
	reset	: 12, submit  : 13
};

let tileTypes = {
	0 : { sprite:[{x:0,y:0,w:40,h:40}]	},
	1 : { sprite:[{x:40,y:0,w:40,h:40}]	},
	2 : { sprite:[{x:80,y:0,w:40,h:40}]	},
	3 : { sprite:[{x:120,y:0,w:40,h:40}] },
	4 : { sprite:[{x:160,y:0,w:40,h:40}] },
	5 : { sprite:[{x:200,y:0,w:40,h:40}] },
	6 : { sprite:[{x:0,y:40,w:40,h:40}] },
	7 : { sprite:[{x:40,y:40,w:40,h:40}] },
	8 : { sprite:[{x:80,y:40,w:40,h:40}] },
	9 : { sprite:[{x:120,y:40,w:40,h:40}] },
	10 : { sprite:[{x:160,y:40,w:40,h:40}] },
	11 : { sprite:[{x:200,y:40,w:40,h:40}] },
	12 : { sprite:[{x:160,y:40,w:40,h:40}] },
	13 : { sprite:[{x:160,y:40,w:40,h:40}] },
};

let directions = {
	up		: 0,
	right	: 1,
	down	: 2,
	left	: 3
};

let player = new Character();
// let player2 = new Character();

function Character()
{
	this.tileFrom	= [1,1];
	this.tileTo		= [1,1];
	this.timeMoved	= 0;
	this.dimensions	= [60,60];
	this.position	= [45,45];
	this.delayMove	= 100;
	this.direction	= directions.up;
	this.sprites = {};
	this.sprites[directions.up]		= [{x:0,y:120,w:30,h:30}];
	this.sprites[directions.right]	= [{x:0,y:150,w:30,h:30}];
	this.sprites[directions.down]	= [{x:0,y:180,w:30,h:30}];
	this.sprites[directions.left]	= [{x:0,y:210,w:30,h:30}];
}
Character.prototype.placeAt = function(x, y)
{
	this.tileFrom	= [x,y];
	this.tileTo		= [x,y];
	this.position	= [((tileW*x)+((tileW-this.dimensions[0])/2)),
		((tileH*y)+((tileH-this.dimensions[1])/2))];
		//Sets the character position within each grid square//
};
Character.prototype.processMovement = function(t)
{
	if(this.tileFrom[0]==this.tileTo[0] && this.tileFrom[1]==this.tileTo[1]) { return false; }

	if((t-this.timeMoved)>=this.delayMove)
	{
		this.placeAt(this.tileTo[0], this.tileTo[1]);
	}
	else
	{
		this.position[0] = (this.tileFrom[0] * tileW) + ((tileW-this.dimensions[0])/2);
		this.position[1] = (this.tileFrom[1] * tileH) + ((tileH-this.dimensions[1])/2);

		if(this.tileTo[0] != this.tileFrom[0])
		{
			let diff = (tileW / this.delayMove) * (t-this.timeMoved);
			this.position[0]+= (this.tileTo[0]<this.tileFrom[0] ? 0 - diff : diff);
		}
		if(this.tileTo[1] != this.tileFrom[1])
		{
			let diff = (tileH / this.delayMove) * (t-this.timeMoved);
			this.position[1]+= (this.tileTo[1]<this.tileFrom[1] ? 0 - diff : diff);
		}

		this.position[0] = Math.round(this.position[0]);
		this.position[1] = Math.round(this.position[1]);
	}

	return true;
}

let toIndex = (x, y)=>{
	return((y * mapW) + x);
}

window.addEventListener("DOMContentLoaded", () => {
	ctx = document.getElementById('game').getContext("2d");
	requestAnimationFrame(drawGame);
	ctx.font = "bold 10pt sans-serif";
	questionGen();
	progress(600, 600, $('#progressBar'));
	player.placeAt(3,2);
	// player2.placeAt(6,2);

	window.addEventListener("keydown", (e) => {
		e.preventDefault();
		if(
			e.keyCode>=37 && e.keyCode<=40 ||
			e.keyCode==32 || 
			e.keyCode==87 || 
			e.keyCode==83 || 
			e.keyCode==65 || 
			e.keyCode==68) { keysDown[e.keyCode] = true; }
		if(e.keyCode==9) {questionGen();}
		if(e.keyCode==37){player.direction = directions.left}
		if(e.keyCode==38){player.direction = directions.up}
		if(e.keyCode==39){player.direction = directions.right}
		if(e.keyCode==40){player.direction = directions.down}

	});
	window.addEventListener("keyup", (e) => {
		e.preventDefault();
		if(
			e.keyCode>=37 && e.keyCode<=40 ||
			e.keyCode==32 || 
			e.keyCode==87 || 
			e.keyCode==83 || 
			e.keyCode==65 || 
			e.keyCode==68) { keysDown[e.keyCode] = false; }
	});

	tileset = new Image();
	tileset.onerror = function()
	{
		ctx = null;
		alert("Failed loading tileset.");
	};
	tileset.onload = function() { tilesetLoaded = true; };
	tileset.src = tilesetURL;
});

let drawGame = ()=> {
	if(ctx==null) { return; }
	if(!tilesetLoaded) { requestAnimationFrame(drawGame); return; }

	let currentFrameTime = Date.now();
	let timeElapsed = currentFrameTime - lastFrameTime;

	let sec = Math.floor(Date.now()/1000);
	if(sec!=currentSecond)
	{
		currentSecond = sec;
		framesLastSecond = frameCount;
		frameCount = 1;
	}
	else { frameCount++; }

	if(!player.processMovement(currentFrameTime))
	{
		if(keysDown[38] && player.tileFrom[1]>0) { player.tileTo[1]-= 1; }
		else if(keysDown[40] && player.tileFrom[1]<(mapH-1)) { player.tileTo[1]+= 1; }
		else if(keysDown[37] && player.tileFrom[0]>0 ) { player.tileTo[0]-= 1; }
		else if(keysDown[39] && player.tileFrom[0]<(mapW-1)) { player.tileTo[0]+= 1; }

		if(player.tileFrom[0]!=player.tileTo[0] || player.tileFrom[1]!=player.tileTo[1])
		{ player.timeMoved = currentFrameTime; } //timeMoved is the exact time the player started moving//
	}

	// if(!player2.processMovement(currentFrameTime))
	// {
	// 	if(keysDown[87] && player2.tileFrom[1]>0 && gameMap[toIndex(player2.tileFrom[0], player2.tileFrom[1]-1)]==1) { player2.tileTo[1]-= 1; }
	// 	else if(keysDown[83] && player2.tileFrom[1]<(mapH-1) && gameMap[toIndex(player2.tileFrom[0], player2.tileFrom[1]+1)]==1) { player2.tileTo[1]+= 1; }
	// 	else if(keysDown[65] && player2.tileFrom[0]>0 && gameMap[toIndex(player2.tileFrom[0]-1, player2.tileFrom[1])]==1) { player2.tileTo[0]-= 1; }
	// 	else if(keysDown[68] && player2.tileFrom[0]<(mapW-1) && gameMap[toIndex(player2.tileFrom[0]+1, player2.tileFrom[1])]==1) { player2.tileTo[0]+= 1; }

	// 	if(player2.tileFrom[0]!=player2.tileTo[0] || player2.tileFrom[1]!=player2.tileTo[1])
	// 	{ player2.timeMoved = currentFrameTime; } //timeMoved is the exact time the player started moving//
	// }

	for(let y = 0; y < mapH; ++y)
	{
		for(let x = 0; x < mapW; ++x)
		{
			var tile = tileTypes[gameMap[toIndex(x,y)]];
			ctx.drawImage(tileset,
				tile.sprite[0].x, tile.sprite[0].y,
				tile.sprite[0].w, tile.sprite[0].h,
				(x*tileW),(y*tileH),tileW, tileH
			);
		}
	}

	let sprite = player.sprites[player.direction];
	ctx.drawImage(tileset,
		sprite[0].x, sprite[0].y, sprite[0].w, sprite[0].h,
		player.position[0],player.position[1],
		player.dimensions[0], player.dimensions[1]
	);
	// ctx.fillStyle = "#0000ff";
	// ctx.fillRect(player.position[0], player.position[1],
	// 	player.dimensions[0], player.dimensions[1]);
	// ctx.fillStyle = "#DF22F9 ";
	// ctx.fillRect(player2.position[0], player2.position[1],
	// 	player2.dimensions[0], player2.dimensions[1]);

	// ctx.fillStyle = "#ff0000";
	ctx.fillText("FPS: " + framesLastSecond, 10, 20);


	lastFrameTime = currentFrameTime;
	requestAnimationFrame(drawGame);

	if (keysDown[32]){
		const position = player.position.toString();
		switch(position)
		{
			case "10,410": holdNum = 0; console.log(0); break;
			case "90,410": holdNum = 1; console.log(1); break;
			case "170,410": holdNum = 2; console.log(2); break;
			case "250,410": holdNum = 3; console.log(3); break;
			case "330,410": holdNum = 4; console.log(4); break;
			case "410,410": holdNum = 5; console.log(5); break;
			case "490,410": holdNum = 6; console.log(6); break;
			case "570,410": holdNum = 7; console.log(7); break;
			case "650,410": holdNum = 8; console.log(8); break;
			case "730,410": holdNum = 9; console.log(9); break;
			case "10,10": ansReset(); console.log("RESET"); break;
			case "330,10": if(holdNum != null){answerBox.innerText += holdNum;} holdNum = null; break;
			case "410,10": if(holdNum != null){answerBox.innerText += holdNum;} holdNum = null; break;
			case "730,10": checkAns();
			default: break;
		}
	}
}