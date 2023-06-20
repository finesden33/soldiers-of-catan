//code for the game created by Ethan S. Fine. Game concept and rules by Ethan S. Fine
const types = [["Crops",4],["Cattle",4],["Trees",4],["Metal",3],["Bricks",3]];//desert not included
const typeNames = ["Crops","Cattle","Trees","Metal","Bricks"];
const typeColours = ["rgb(241 226 56)","rgb(154 230 70)","rgb(32 144 18)","rgb(181 193 199)","rgb(185 120 60)","rgb(226 214 153)"];
const numbers = [2, 3, 3, 4, 4, 5, 5, 6, 6, 8, 8, 9, 9, 10, 10, 11, 11, 12];
const plyrCols = ["red","black","blue","orange","lime","white","aqua","brown","purple","pink","olive"];
const turnPhases = ["","Defending | ","Trading | ","Rolling | ","Producing | ","Battling | ","Building | ","Moving | "];
const gamePhases = ["ordering","setup","playing","finished"];
const peopleNames = ["Exber","Yankiv","Brex","Elmur","Yoko","Brander","Lookoo","Frayfray McSlider","Jango","Long","Jonguth","Faito","Erfat","Tastytemple","Templetaster","Sajon","Master Oogway","Woops","Yaeger","Shiffer","Chez","Chex Mix","Stoner","Sgt. Dude","Aha","Yoda","Zarthon","Skunkwad","The Chief","Shifu","Oohoo","Yambern","Sgt. Mud","Snorest Flump","Wawa","Yomby","Zakric","Klupmoss","Lumpy","Delabeenoo","Meeno","Rara","Antegwar","Richathy","Robium","Uranium Zane","Willert","Timard","Hexa","Rasputin","Gex","Primpadoompus","Warbler","Wester","Primal","Wobb","Labromper","Futoozi","Shintz","Bowow","Cpt. Sprok","Flattev","Argo Flabwomper","Cpt. Spar","Ragnar","Wimpus","Shino","Bloo","Chester","Bester","Harthker","Arthur","Zaphod","Da","Barnack","Gus","Slomby","Barnacle","Pem","Nexus","Lander","Iguana","Sadist","Quarius","Quizzard","Ticklish Tom","Shnikey","Your Mom","Shtree","Tombert","Viaviel","Vestik","Wampee","Xero","Zombeeb","Nooko","The Well","Arna","Iffy Iffelton","Kjelychschtwegn","Spamton","Jagnag","Swoowa","Abdominator","baddy","Myb","Ryvern","Yoknoy","The Zert","Dr. Oof","Samethor","Thomp","Rumpus Crumplus","Sgt. Aaaarg","Speeward Jr.","Squidward","Nonono","Rex","Xanther","Hateez","Sploof","Thiccarith","Weetha","Elrabo","McSnoop","O'Rangly","Jo Bombaum","Rarrr","Mental","Wild","Nature","Fart","Sploopy","Dingus","Rempatwar","Ploompa","Tunasnake","Neckwallet","Joshiweeny","Archduke Harnold","Yamper","Grunhilda","Farten","Triple X","Mac 'Quack' Elbowsmack","Elbowgrease","Jamington"];
const tileNames = ["Farm","Ranch","Forest","Mines","Factory","Desert"];

var size = Math.min(window.innerHeight, window.innerWidth/2 - window.innerWidth/8);
var game = {
	panel: 1,
	panelName: "DEFAULT PANEL",
	phase: gamePhases[0],
	turnNum: 0,//which player's turn it is. players[game.turnNum] will give you the current player object
	snakeTurn: 0,//index in snake order array of turns (for setup phase)
	turnRoll: 0,//the number that was rolled that turn
	playerCount: 4,//number of players (including bots)
	bots: 0,//number of players that are bots
	tileClicked: "none",//if a tile was clicked, this will store the tile object of the tile that was clicked. This is how it's used: code turns tilesClickable to true to allow player to select a tile; code waits for tileClicked to not be "none" anymore; once player clicks a tile, this will turn in an object, the code will see that it's no longer "none", and will immediately set tilesClickable to falsel; then it will extract necessary data from the object; once it's done extracting data, it will revert this property's value to "none"
	tilesClickable: false,//if currently the tiles are clickable
	battleTile: "none",
	battleSpoils: [0,0],//attacker, defender
	battleRolls: [0,0],//attacker, defender
	defender: 0,
	buildables: [],
	buildTile: "none",//also used as destination tile in move
	pntsToUse: 0,
	buffet: [],
	tradeType: "none",
	showLights: false,
	showList: [],
	originTile: "none",
	destTile: "none",
	foundMove: false,
	unchosen: [0,1,2,3]//list of player slots not yet chosen by real players
}

var players = [];
function createPlayer(num) {
	let player = {
			name: "Player " + (num + 1),
			colour: plyrCols[num],
			isBot: true,
			turnPhase: 0,
			defending: false,
			totalPnts: 0,
			totalArmies: 0,
			totalRegions: 0,
			tokens: 0,
			resources: [0,0,0,0,0],
			wonAbattle: false
			
	}
	players.push(player);
}

for (var i = 0; i < 4; i++) {
	createPlayer(i);
}

var board = [];
{//create tile objects for board array
	let unusedTypes = types.slice(0);//so that the types array itself doesn't get affected
	let unusedNums = numbers.slice(0);//"
	for (var i = 0; i < 19; i++) {//19 is the number of tiles on the board, including the centre desert tile
	
		let type = "desert";//placeholder
		let num = 0;//placeholder
		if (i != 9) {//if it isn't the desert tile. Otherwise, it will keep the placeholders which are the desert tile's actual properties
		
			//pick a type
			let chosenType = random(0, unusedTypes.length -1);
			type = unusedTypes[chosenType][0];
			unusedTypes[chosenType][1]--;
			if (unusedTypes[chosenType][1] <= 0) {
				unusedTypes.splice(chosenType, 1);//remove the empty array from the array
			}
			
			//pick a number
			let chosenNum = random(0, unusedNums.length -1);
			num = unusedNums[chosenNum];
			unusedNums.splice(chosenNum, 1);
			
		}
		
		//create the tile
		let tile = {
			type: type,
			num: num,
			pnts: [],
			battled: [],//players battled on the tile on one turn (gets reset every turn)
			name: "no name",
			x: 0,
			y: 0,
			coords: [0,0],
			adjCoords: [],
			clicked: false,
			hovered: false
		}
		tile.name = nameTile(tile);
		board.push(tile);
	}
	
	//restructure the board array to give each tile a unique coordinate in the hexagonal gridpoint system, which allows for checking what the adjascent tiles are
	board = [board.slice(0,3),board.slice(3,7),board.slice(7,12),board.slice(12,16),board.slice(16,19)];
	
}

function adjs(a,b) {//input target tile coordinates in parameter (as it would reference in the board array), returns array of all tile coordinates adjascent to it (in board reference form)
	if (a >= 3) {//if it's the 3rd or 4th array, in which case the second dimension of those coordinates will start later. This new form is what we don't call board reference form
		b += (a-2);//so that it will be (3,1),(3,2),(3,3),(3,4) and (4,2),(4,3),(4,4) instead of (3,0),(3,1),(3,2),(3,3) and (4,0),(4,1),(4,2)
	}
	let adjascents = [];
	for (var i = 0; i < 6; i++) {//there can be up to 6 adjascent tiles
		let adjTemp = [a,b];
		switch (i) {//order is irrelevant. We just need each thing to occur once
			case 0:
				adjTemp = [a,b-1];
				break;
			case 1:
				adjTemp = [a-1,b-1];
				break;
			case 2:
				adjTemp = [a-1,b];
				break;
			case 3:
				adjTemp = [a,b+1];
				break;
			case 4:
				adjTemp = [a+1,b+1];
				break;
			case 5:
				adjTemp = [a+1,b];
				break;
			
		}
		if (adjTemp[0] >= 3) {
			adjTemp = [adjTemp[0],adjTemp[1] - (adjTemp[0]-2)];//undo the change to make it board referencable
		}
		if ((adjTemp[0] >= 0 && adjTemp[0] <= 4) && (adjTemp[1] >= 0) && ((adjTemp[0]== 0 && adjTemp[1] <= 2) || (adjTemp[0]== 1 && adjTemp[1] <= 3) || (adjTemp[0]== 2 && adjTemp[1] <= 4) || (adjTemp[0]== 3 && adjTemp[1] <= 3) || (adjTemp[0]== 4 && adjTemp[1] <= 2)) ) {//this creates a semi 2 dimensional range to only add it if it's a real tile that exists within the boundries of the board
			adjascents.push(adjTemp);
		}
	}
	return adjascents;
}

function random(min, max) {
	return Math.floor(Math.random()*(max - min + 1)) + min;
}

//create canvas and draw board
var canv = document.createElement('canvas');
let boardSection = document.getElementById("board");
boardSection.appendChild(canv);
canv.height = size + Math.floor(size/200) + "";
canv.width = size + Math.floor(size/200) + "";

let c = canv.getContext("2d");
c.fillStyle = "grey"
c.fillRect(0,0,canv.width,canv.height);

function drawBoard(highlights = []) {//this also sets some important values to the properties of each tile object
	for (var i = 0; i < board.length; i++) {
		for (var j = 0; j < board[i].length; j++) {
			let x = Math.floor(size/400) + (size/10 + (2*j + (5 - board[i].length))*size/10);
			let y = Math.floor(size/400) + (size*((5-2*Math.sqrt(3))/10) + i*(Math.sqrt(3)/10)*size);
			
			//initialization stuff (only matters and only should have a changing affect on things on the first time drawBoard() is called
			board[i][j].coords = [i,j];//store the array coords in the tile itself
			board[i][j].adjCoords = adjs(i,j);//stores the coordinates of every adjascent tile for that tile
			if (board[i][j].pnts.length === 0) {//if it's empty, load it up with necessary amount of 0 pointers
				for (var k = 0; k < game.playerCount; k++) {
					board[i][j].pnts.push(0);//instead of 0, do random(0,7) for test games
				}
			}
			
			let tile = board[i][j];
			
			tile.x = x;
			tile.y = y;
			
			//choose hexagon COLOUR filling
			let colour = "";
			if (tile.type != "desert") {
				colour = typeColours[typeNames.indexOf(tile.type)];
			} else {
				colour = "rgb(226 214 153)";
			}
			
			let a = size/10;//length of altitude of hexagon side length that intersects with circumcentre
			let b = size*(Math.sqrt(3)/30);//half of side length of hexagon (and half of radius)
			
			//draw hexagon
			fillHex(a,b,x,y,colour,"none",0);
			
			//inner line for if the tile is hovered or clicked on
			if (game.tilesClickable) {
				if (tile.clicked) {
					fillHex(a*0.95,b*0.95,x,y,"none",players[game.turnNum].colour,Math.floor(size/175));
				} else if (tile.hovered) {
					fillHex(a*0.97,b*0.97,x,y,"none","white",Math.floor(size/200));
				}
			} else {
				//update these values just incase
				board[i][j].clicked = false;
				board[i][j].hovered = false;
			}
			
			fillHex(a,b,x,y,"none","black",Math.floor(size/300));//hexagon tile outline
			
			//draw tile NUMBERS
			if (tile.type != "desert") {//there isn't a num on desert tile
				let nxt = canv.getContext("2d");
				nxt.beginPath();
				nxt.moveTo(x,y);
				
				let value = 1/Math.abs(tile.num - 7);//so 6 and 8 will be 1, and 2 and 12 will be 1/5, etc
				let fontSize = Math.floor(b/3) + Math.floor(b/3)*value;//size of number based on how close it is to seven
				let redness = 215*Math.sqrt(value)*value;
				let fontColour = "rgb(" + redness + ",0,0)";
				
				nxt.ellipse(x,y,b/2,b/2,0,0,360);
				nxt.strokeStyle = "black";
				nxt.lineWidth = Math.floor(size/400);
				nxt.stroke();
				nxt.fillStyle = "rgb(226 214 153)";//some kind of pale sandy colour
				nxt.fill();//the ellipse
				
				nxt.lineWidth = fontSize/15;
				nxt.strokeStyle = fontColour;
				nxt.fillStyle = fontColour;
				nxt.font = fontSize + "px times_new_roman";
				nxt.textAlign = 'center';
				nxt.strokeText(tile.num,x,y + fontSize/3);
				nxt.fillText(tile.num,x,y + fontSize/3);
				
				nxt.closePath();
			}
			
			//draw player point numbers
			let positions = [];
			let mult = 0.6;
			switch (game.playerCount) {
				case 2:
					positions = [[x-a*mult,y],[x+a*mult,y]];
					break;
				case 3:
					positions = [[x-a*mult,y-b*mult],[x+a*mult,y-b*mult],[x,y+a*mult]];
					break;
				case 4:
					positions = [[x,y-a*mult],[x+a*mult,y],[x,y+a*mult],[x-a*mult,y]];
					break;
				default:
					positions = [];
					break;
			}
			
			let nxt1 = canv.getContext("2d");
			
			let fontSize = Math.floor(b*0.4);
			nxt1.lineWidth = fontSize/15;
			nxt1.font = fontSize + "px times_new_roman";
			nxt1.textAlign = 'center';
			for (var m = 0; m < positions.length; m++) {
				let col = players[m].colour;
				let txt = board[i][j].pnts[m];
				let posX = positions[m][0];
				let posY = positions[m][1];
				nxt1.strokeStyle = col;
				nxt1.fillStyle = col;
				
				if (txt == 0) {//no points
					txt = "";
				}
				if (txt != "") {//army
					nxt1.moveTo(posX,posY);
					
					if (txt >= 7) {
						nxt1.beginPath();
						nxt1.lineWidth = fontSize/8;
						nxt1.strokeStyle = col;
						nxt1.ellipse(posX,posY,b/2.2,b/2.2,0,0,360);
						nxt1.stroke();
						nxt1.closePath();
						
						nxt1.beginPath();
						nxt1.ellipse(posX,posY,b/3,b/3,0,0,360);
						nxt1.fillStyle = col;
						nxt1.fill();
						
					} else if (txt >= 3) {
						nxt1.beginPath();
						fillHex(b/3,b/5.15,posX,posY,col,col,fontSize/8);
						
					} else {
						nxt1.beginPath();
						nxt1.ellipse(posX,posY,b/4.2,b/4.2,0,0,360);
					}
					nxt1.fillStyle = col;
					nxt1.fill();
					nxt1.stroke();
					nxt1.closePath();
					
					if (col == ("orange" || "lime" || "white" || "aqua" || "pink")) {
						nxt1.fillStyle = "black";
						nxt1.strokeStyle = "black";
					} else {
						nxt1.fillStyle = "white";
						nxt1.strokeStyle = "white";
					}
					nxt1.lineWidth = fontSize/20;
					nxt1.strokeText(txt,posX,posY + fontSize/3);
					nxt1.fillText(txt,posX,posY + fontSize/3);
					
					//battle marker to show that you battled them that turn already
					if (players[game.turnNum].turnPhase == 5) {//during battle
						if (m != game.turnNum && tile.battled.includes(m)) {//make sure it's someone you have battled, and also not yourself
							col = players[game.turnNum].colour;
							posX = positions[m][0] - b/5;
							posY = positions[m][1] - b/5;
							nxt1.strokeStyle = col;
							nxt1.fillStyle = col;
							
							nxt1.beginPath();
							nxt1.moveTo(posX,posY);
							nxt1.ellipse(posX,posY,b/10,b/10,0,0,360);
							nxt1.fillStyle = col;
							nxt1.fill();
							nxt1.closePath();
						}
					}
				}
			}
			
			//draw hexagon highlight if it's a higlighted tile
			let highlightCoords = highlights.map(x => x.toString());
			let showListCoords = game.showList.map(x => x.toString());
			let tileCoord = board[i][j].coords.toString();
			if (highlightCoords.length > 0) {
				let n = 50;
				if (highlightCoords.includes(tileCoord) || highlightCoords == tileCoord) {//we had to convert the array into an array of strings because the .include doesn't work for looking for an array in an array
					for (let m = 1; m < n; m++) {//create gradient effect by making many hexagons
						fillHex(a*(m/n),b*(m/n),x,y,"rgba(255,255,255,0.02)","none",0);
					}
				} else {
					fillHex(a,b,x,y,"rgba(0,0,0,0.65)","none",0);
				}
			}
			
			//show help lights to show which tiles are battleable/buildable/moveable
			if (game.showLights && game.showList.length > 0) {
				if (showListCoords.includes(tileCoord) || game.showList == tileCoord) {
					fillHex(a,b,x,y,"rgba(255,255,255,0.5)","none",0);
				} else {
					fillHex(a,b,x,y,"rgba(0,0,0,0.75)","none",0);
				}
			}
			
			//make an arrow between destination and origin tiles when confirming move
			if (game.foundMove && game.destTile != "none" && (game.tileClicked != "none" || game.originTile != "none")) {
				//arrow will point from origin to destination on the centre of the line made (not actually displayed) from coords of origin to destination
				let x2 = game.destTile.x;
				let y2 = game.destTile.y;
				if (game.originTile != "none") {
					var x1 = game.originTile.x;
					var y1 = game.originTile.y;
				} else {
					var x1 = game.tileClicked.x;
					var y1 = game.tileClicked.y;
				}
				
				let mag = size/30;
				
				let midX = Math.min(x1,x2) + Math.abs(x2 - x1)/2;
				let midY = Math.min(y1,y2) + Math.abs(y2 - y1)/2;
				let length = Math.sqrt(Math.abs(x2 - x1)**2 + Math.abs(y2 - y1)**2);
				
				let xDir = (x1 > x2 ? -1 : 1);//is origin to the right of destination? i.e. should we point leftwards?
				if (x1 == x2) {
					xDir = 0;
				}
				let yDir = (y1 > y2 ? -1 : 1);//is origin below destination? i.e. should we point upwards?
				if (y1 == y2) {
					yDir = 0;
				}
				
				//it's in radians...
				let angle = Math.acos(Math.abs(x2 - x1)/length);//this angle will get affected based on what quadrant it's in
				let absAngle = angle;
				switch (xDir) {
					case 1://point right
						switch (yDir) {
							case 1://point down
								angle = angle;
								break;
							case -1://point up
								angle = -angle;
								break;
							case 0://directly right
								angle = 0;
								break;
							default:
								break;
						}
						break;
					case -1://point left
						switch (yDir) {
							case 1://point down
								angle = Math.PI - angle;
								break;
							case -1://point up
								angle = Math.PI + angle;
								break;
							case 0://directly left
								angle = Math.PI;
								break;
							default:
								break;
						}
						break;
					case 0://directly up or down
						switch (yDir) {
							case 1://down
								angle = Math.PI*0.5;
								break;
							case -1://up
								angle = Math.PI*1.5;
								break;
							default:
								break;
						}
						break;
					default:
						break;
				}
				
				let arw = canv.getContext("2d");
				arw.lineWidth = mag/10;
				
				arw.beginPath();
				
				let destX = midX;
				let destY = midY;
				
				//line
				let xOffset = (b/2) * Math.cos(absAngle);
				let yOffset = (b/2) * Math.sin(absAngle);
				
				let beginX;
				let endX;
				if (x1 > x2) {
					beginX = x2 + xOffset;
					endX = x1 - xOffset;
				} else {
					beginX = x1 + xOffset;
					endX = x2 - xOffset;
				}
				let beginY;
				let endY;
				if (y1 < y2) {
					if (x1 > x2) {
						beginY = y2 - yOffset;
						endY = y1 + yOffset;
					} else {
						beginY = y1 + yOffset;
						endY = y2 - yOffset;
					}
				} else {
					if (x1 > x2) {
						beginY = y2 + yOffset;
						endY = y1 - yOffset;
					} else {
						beginY = y1 - yOffset;
						endY = y2 + yOffset;
					}
				}
				
				arw.beginPath();
				// let xDist = Math.abs(endX-beginX);
				// let yDist = Math.abs(endY-beginY);
				// let dottedness = 10;
				
				arw.moveTo(beginX,beginY);
				arw.lineTo(endX,endY);
				arw.strokeStyle = players[game.turnNum].colour;
				arw.stroke();
				
				arw.closePath();
				
				//circles
				arw.beginPath();
				arw.moveTo(x1+b/2,y1);
				arw.ellipse(x1,y1,b/2,b/2,0,0,360);
				arw.moveTo(x2+b/2,y2)
				arw.ellipse(x2,y2,b/2,b/2,0,0,360);
				
				arw.strokeStyle = players[game.turnNum].colour;
				arw.stroke();
				
				arw.closePath();
				
				//triangle
				arw.beginPath();
				arw.translate(destX,destY);
				arw.rotate(angle);
				
				arw.moveTo(mag/2,0);
				arw.lineTo(-mag/2,-mag);
				arw.lineTo(-mag/2,mag);
				arw.lineTo(mag/2,0);
				
				arw.strokeStyle = "white";
				arw.stroke();
				
				arw.fillStyle = players[game.turnNum].colour;
				arw.fill();
				
				arw.rotate(-angle);
				arw.translate(-destX,-destY);
				arw.closePath();
			}
		}
	}
}
drawBoard();

function fillHex(a,b,x,y,fillCol,strokeCol,lineWidth) {//altitude, half of radius, centre x, centre y, fillcolour
	let ctx = canv.getContext("2d");
	ctx.beginPath();
	
	y -= b*2
	ctx.moveTo(x,y);//1 (first vertex in hexagon)
	x += a;
	y += b;
	ctx.lineTo(x,y);//2
	y += b*2;
	ctx.lineTo(x,y);//3
	x -= a;
	y += b;
	ctx.lineTo(x,y);//4
	x -= a;
	y -= b;
	ctx.lineTo(x,y);//5
	y -= b*2;
	ctx.lineTo(x,y);//6
	x += a;
	y -= b;
	ctx.lineTo(x,y);//7 (should return it to the same place as it was at 1
	
	if (fillCol != "none") {
		ctx.fillStyle = fillCol;
		ctx.fill();//fill in the hexagon lines with the colour
	}
	
	ctx.lineWidth = lineWidth;
	if (strokeCol != "none") {
		ctx.strokeStyle = strokeCol
		ctx.stroke();
		ctx.closePath();
	}
}

function roll(dice) {
	let rollInfo = {
		rolls: [],
		sum: 0,
		highest: 0
	}
	
	for (var i = 0; i < dice; i++) {
		let thisRoll = random(1,6);
		rollInfo.rolls.push(thisRoll);
		rollInfo.sum += thisRoll;
		rollInfo.highest = Math.max(thisRoll, rollInfo.highest);
	}
	return rollInfo;
}

function rename(playerNum) {
	let oldName = players[playerNum].name;
	let newName = prompt("Please enter a new name for "+ oldName);
	if (newName == null || newName == "") {
		newName = oldName;
	}
	for (var i = 0; i < game.playerCount; i++) {
		if (newName == players[i].name) {
			newName = oldName;
		}
	}
	players[playerNum].name = newName;
	updatePlayers();
}

function makePlayerBar(playerNum) {
	
	let player = players[playerNum];
	let bars = document.getElementById("bars");
	
	var barHolder = document.createElement('article');
	bars.appendChild(barHolder);
	barHolder.style.margin = size/80 + "px";
	barHolder.id = "player " + playerNum;
	barHolder.style.borderRadius = size/160 + "px";
	barHolder.style.backgroundColor = "grey";
	barHolder.style.padding = size/80 + "px";
	barHolder.height = size/7;
	barHolder.width = size;
	
	var bar = document.createElement('canvas');
	barHolder.appendChild(bar);
	
	bar.height = size/8;
	bar.width = size/2;
	bar.style.padding = size/80 + "px";
	bar.id = "player " + playerNum + " canvas";
	if (game.turnNum == playerNum) {//if it's the player's turn
		bar.style.background = "white";
	}
	bar.setAttribute("onclick","rename("+playerNum+")");
	
	//player stats canvas
	var ctx = bar.getContext("2d");
	let w = bar.width;
	let h = bar.height;
	let lineWidth = size/100;
	ctx.strokeStyle = player.colour;
	ctx.fillStyle = player.colour;
	ctx.lineWidth = lineWidth;
	
	//border
	ctx.beginPath();
	ctx.lineTo(0,h/6);
	ctx.lineTo(w/4,h/6);
	ctx.lineTo(w/4 + w/16,0);
	ctx.lineTo(0,0);
	ctx.closePath();
	ctx.fill();
	ctx.rect(0,0,bar.width,bar.height);
	ctx.stroke();
	
	//name
	if (player.colour == ("orange" || "lime" || "white" || "aqua" || "pink")) {
		ctx.fillStyle = "black";
	} else {
		ctx.fillStyle = "white";
	}
	ctx.font = h/8 + "px arial";
	ctx.textAlign = 'left';
	let pName = player.name;
	if (player.isBot) {
		pName += " - CPU";
	}
	if (pName.length > 16) {//make sure name isn't too long
		pName = pName.slice(0,16);
	}
	ctx.fillText(pName,lineWidth,h/7);
	
	//info box
	let txt = turnPhases[player.turnPhase] + player.totalArmies + " Armies | " + player.totalPnts + "pnts.";
	ctx.beginPath();
	let offset = w/4 + w/8;
	let length = txt.length * h/20;
	ctx.moveTo(offset,0);
	ctx.lineTo(offset-w/16,h/6);
	ctx.lineTo(offset + length,h/6);
	ctx.lineTo(offset + length + w/16,0);
	ctx.lineTo(offset,0);
	ctx.closePath();
	ctx.strokeStyle = player.colour;
	ctx.fillStyle = player.colour;
	ctx.fill();
	ctx.stroke();
	
	//info - Turn phase, total armies, total points
	if (player.colour == ("orange" || "lime" || "white" || "aqua" || "pink")) {
		ctx.fillStyle = "black";
	} else {
		ctx.fillStyle = "white";
	}
	ctx.font = h/10 + "px arial";
	ctx.textAlign = 'left';
	ctx.fillText(txt,lineWidth + offset - w/64,h/7);
	
	//cards
	let cardSize = h/2;
	for (var i = 0; i < 6; i++) {
		let x = lineWidth + cardSize/5 + i*(cardSize + cardSize/4);
		let y = h/6 + cardSize/3;
		
		//colour
		ctx.fillStyle = player.colour;
		ctx.fillRect(x- lineWidth/2,y- lineWidth/2,cardSize+lineWidth,cardSize+lineWidth);
		if (i == 5) {
			ctx.fillStyle = "white";
			ctx.fillRect(x- lineWidth/4,y- lineWidth/4,cardSize+lineWidth/2,cardSize+lineWidth/2);
			ctx.fillStyle = typeColours[i];
		} else {
			ctx.fillStyle = typeColours[i];
		}
		ctx.fillRect(x,y,cardSize,cardSize);
		
		//text
		let type = "Tokens";
		let num = player.tokens;
		if (i != 5) {//if it is 6, it keeps those initial values that were declared in the previous line
			type = types[i][0];
			num = player.resources[i];//the order is: crops, cattle, trees, metal, bricks
		}
		ctx.fillStyle = "black";
		ctx.textAlign = 'center';
		ctx.font = h/10 + "px arial";
		ctx.fillText(type,x+cardSize/2,y + cardSize/3.7);
		ctx.font = h/3.5 + "px arial";
		ctx.fillText(num,x+cardSize/2,y+cardSize/1.23);
	}
	
}

for (var i = 0; i < game.playerCount; i++) {
	makePlayerBar(i);
}

function updatePlayers(newCount = game.playerCount) {
	for (var i = 0; i < game.playerCount; i++) {//remove player bars
		document.getElementById("player " + i).remove();
	}
	let oldCount = game.playerCount;
	//update player count
	game.playerCount = newCount;
	
	if (newCount < oldCount) {
		players = players.slice(0,newCount);
	} else if (newCount > oldCount) {
		for (var i = 0; i < newCount - oldCount; i++) {
			createPlayer(oldCount + i);
		}
	}
	//update player points and army count
	for (var h = 0; h < game.playerCount; h++) {
		let armies = 0;
		let points = 0;
		let regions = 0;
		for (var i = 0; i < board.length; i++) {
			for (var j = 0; j < board[i].length; j++) {
				let pntsOnTile = board[i][j].pnts[h];
				
				points += pntsOnTile;
				if (pntsOnTile > 0) {
					regions++;
				}
				if (pntsOnTile >= 3) {
					armies++;
				}
			}
		}
		players[h].totalArmies = armies;
		players[h].totalPnts = points;
		players[h].totalRegions = regions;
	}
	
	//draw bars
	for (var i = 0; i < game.playerCount; i++) {
		makePlayerBar(i);
	}
}

var box = document.getElementById("turnBox");
var infoArea = document.getElementById("info");
var buttonArea = document.getElementById("buttons");
box.style.outlineWidth = size/100 + "px";
var fontSize = size/42 + "px";
infoArea.style.fontSize = fontSize;

const panels = ["DEFAULT PANEL","playerCount select","botCount select","turnOrder roll","yourOrder ok","beginSetup ok","setupPrompt tiler","confirmSetupBuild ok","cantSetupThere ok","youSetupBuiltX ok","beginGame ok","itsYourTurn ok","playerStart roll","rollResults ok","youProduced ok","battlePrompt yesno","battlePrompt tiler","cantBattleThere ok","whenMultiOnTile select","battlePanel rollselect","battleEndReason ok","battleSpoils ok","buildPrompt yesno","buildPrompt tiler","cantBuildThere ok","builtPointCount select","desertBuilder select","youBuiltX ok","movePrompt yesno","moveDestinationPrompt tiler","cantMoveTo ok","moveOriginPrompt tiler","cantMoveFrom ok","movePointCount select","desertMover select","youMovedX ok","resTrade select","3for1 select","chooseResource select","5forToken yesno","5forToken select","endTurn yesno","youWon"];

//FOR TESTING PURPOSES:-------------------------------------------
let skipIt = 0;
if (skipIt) {
	game.panel = panels.indexOf("movePrompt yesno");//p27
	makePanel("Move points?",[["Yes",true],["No",false],["Trade",45882]]);
	game.phase = gamePhases[2];
	game.turnNum = 1;
	players[game.turnNum].turnPhase = 7;
	box.style.outlineColor = players[game.turnNum].colour;
	
	let testPnts = [[
			[0,2,0,3],[1,3,1,0],[1,0,3,5]],
		[[2,0,0,0],[3,1,0,0],[0,1,0,3],[0,8,0,2]],
	[[0,2,0,0],[0,3,0,0],[0,4,0,1],[4,0,0,1],[7,1,0,1]],
		[[0,2,0,0],[1,3,0,0],[0,3,0,3],[2,0,0,1]],
			[[1,0,0,0],[0,1,0,0],[0,3,0,0]]
	];
	for (var i = 0; i < board.length; i++) {
		for (var j = 0; j < board[i].length; j++) {
			board[i][j].pnts = testPnts[i][j];
		}
	}
	drawBoard();
} else {
	makePanel("How many players?",[[2,2],[3,3],[4,4]]);//not the test
}
//----------------------------------------------------------------

//this function is called when the user does something (like click a button on turnbox or click on tile on board) that would affect the turnbox panel configuration
function switchPanel(inputData,currentPanel = panels[game.panel]) {//current panel is always game.panel unless otherwise specified (like in tilemousechecking function), which will then get changed after utilizing the input data. The inputdata are/is the value(s) that resulted from your selection on current panel (as well as from selecting tiles on board). This combo will determine the destination panel
	let boxCol = "grey";
	
	//trader panel setup
	if (inputData == 45882) {
		game.panel = panels.indexOf("resTrade select");//go to resource trade panel
		game.buffet = [0,0,0,0,0];
		makePanel("Select the type of trade you'd like to make",[["3~same for 1~any",1],["~Cancel~",0],["1~token for 2~any",2]]);
	} else {
		//panels
		switch (currentPanel) {//could've just used game.panel as switch condition and then refer to cases by panel number, but this way, we can see what the cases actually mean, since we reference their names
			
//PLAYER COUNT PHASE
			case "playerCount select"://p-----------------------------------------------1
				//effects
				updatePlayers(inputData);
				game.unchosen = [];
				for (var i = 0; i < game.playerCount; i++) {//update how many player slots are available for randomly getting. see p3
					game.unchosen.push(i);
				}
				drawBoard();
				
				//set up next panel
				let buttonArray = [];
				for (var i = 0; i < game.playerCount; i++) {//will make buttons to select how many real people are playing
					buttonArray.push([i+1,i+1]);
				}
				game.panel = panels.indexOf("botCount select");//we could've said game.panel = 2, but we don't like using numbers here lol
				makePanel("How many actual people?",buttonArray);
				
				break;
			case "botCount select"://p-----------------------------------------------2
				//effects
				game.bots = game.playerCount - inputData;//subtract number of actual people from total players to see how many bots are playing
				
				//set up next panel
				game.panel = panels.indexOf("turnOrder roll");//p3
				makePanel("Click to see which player you'll be",[["Roll",0]]);
				
				break;
			case "turnOrder roll"://p-----------------------------------------------3
				//effects
				let value = random(0,game.unchosen.length-1)
				let num = game.unchosen[value];
				game.unchosen.splice(value,1);//remove that candidate from the list of unchosen
				players[num].isBot = false;//now we know this player won't be a bot
				
				//set up next panel
				game.panel = panels.indexOf("yourOrder ok");//p4
				makePanel("You are player " + (num+1),[["Ok",num]]);
				
				break;
			case "yourOrder ok"://p-----------------------------------------------4
				//effects
				let num1 = inputData;
				players[num1].name = prompt("Please enter your name");
				if (players[num1].name == "" || (players[0].name == null)) {//if no name was entered, revert to default
					players[num1].name = "player " + (num1+1);
				}
				updatePlayers(game.playerCount);//keep the same amount of players. we just want to update drawing. Hmm, maybe I should set the default value for the parameter to be game to be game.playerCount
				
				//set up next panel (the next panel can be 1 of 2 things in this case - it depends on what players have chosen so far) either go back to p3 or go to p5
				if (game.unchosen.length <= game.bots) {//once if all real players have been sorted out and named (once the amount of unchosen players is the same as bots)
					game.panel = panels.indexOf("beginSetup ok");//p5
					makePanel("Beginning the setup phase",[["Ok",0]]);//when second item value of an item (of a button) in the buttonArray is 0, it means the button only does one thing, as there is no variable data
					
				} else {//go back and sort out the next real player, but make sure they can't become the player num that was just chosen, or any that were already chosen. We can do this via limiting the randomizor
					game.panel = panels.indexOf("turnOrder roll");//p3
					makePanel("Click to see which player you'll be",[["Roll",0]]);//input data is array of already chosen player numbers
				}
				break;
				
//SETUP PHASE
			case "beginSetup ok"://p-----------------------------------------------5
				//effects
				game.phase = gamePhases[1];
				
				game.panel = panels.indexOf("setupPrompt tiler");//p6
				makePanel(players[game.turnNum].name + ", please select a region to build a starter army.",0);
				game.tilesClickable = true;
				box.style.outlineColor = players[game.turnNum].colour;
				break;
			case "setupPrompt tiler"://p-----------------------------------------------6
				//instead of making a button to activate this case, we let the tilechecker function do that
				if (arrayHasOnly(inputData.pnts,0)) {//check if there are any points there
					game.panel = panels.indexOf("confirmSetupBuild ok");//p7
					makePanel("Build in that region?",[["Confirm",0]]);
				} else {
					game.panel = panels.indexOf("cantSetupThere ok");//p8
					makePanel("You can't build there right now, as there is already an army there.",[["Pick a different tile",0]]);
				}
				break;
			case "confirmSetupBuild ok"://p-----------------------------------------------7
				//effects
				let chosenTile = game.tileClicked;
				game.tilesClickable = false;
				game.tileClicked = "none";
				
				//affect points for that player
				board[chosenTile.coords[0]][chosenTile.coords[1]].pnts[game.turnNum] += 3;
				board[chosenTile.coords[0]][chosenTile.coords[1]].clicked = false;
				board[chosenTile.coords[0]][chosenTile.coords[1]].hovered = false;
				
				//pick up a card for that place
				if (board[chosenTile.coords[0]][chosenTile.coords[1]].type != "desert") {
					pickup("turn",0,game.turnNum);
				} else {
					players[game.turnNum].tokens++;//desert tiles get a token bonus
				}
				
				drawBoard();
				chosenTile.name = nameTile(chosenTile);
				game.panel = panels.indexOf("youSetupBuiltX ok");//p9
				makePanel("You have built a starter army",[["Ok",0]]);
				break;
			case "cantSetupThere ok"://p-----------------------------------------------8
				game.panel = panels.indexOf("setupPrompt tiler");//p6
				makePanel(players[game.turnNum].name + ", please select a region to build a starter army.",0);
				break;
			case "youSetupBuiltX ok"://p-----------------------------------------------9
				nextTurn(false);
				
				if (game.snakeTurn < game.playerCount * 2) {//if not everyone has setup their first two armies yet
					game.panel = panels.indexOf("beginSetup ok");//p5
					makePanel("Continuing the setup phase",[["Ok",0]]);
				} else {
					game.panel = panels.indexOf("beginGame ok");//p10
					makePanel("Setup phase completed. Beginning the game.",[["Ok",0]]);
				}
				box.style.outlineColor = boxCol;
				break;
				
//PLAYING PHASE - rolling/producing
			case "beginGame ok"://p-----------------------------------------------10
				game.phase = gamePhases[2];
				game.turnNum = 0;
				players[game.turnNum].turnPhase = 3;
				
				game.panel = panels.indexOf("itsYourTurn ok");//p11
				makePanel(players[game.turnNum].name + ", it's your turn!",[["Ok",0]]);
				box.style.outlineColor = players[game.turnNum].colour;
				break;
			case "itsYourTurn ok"://p-----------------------------------------------11
				game.panel = panels.indexOf("playerStart roll");//p12
				makePanel("Roll the dice",[["Roll",0]]);
				break;
			case "playerStart roll"://p-----------------------------------------------12
				game.turnRoll = roll(2);
				let producers = pickup("roll",game.turnRoll.sum,game.turnNum);
				
				drawBoard(producers.highlights)
				
				game.panel = panels.indexOf("rollResults ok");//p13
				if (game.turnRoll.sum == 7) {
					makePanel("You rolled a 7 and recieved a token!",[["Produce resources",0]]);
				} else {
					makePanel("You rolled a " + game.turnRoll.sum + "<br> Everyone with armies on tiles numbered " + game.turnRoll.sum + " picked up resources accordingly.",[["Produce resources",0]]);
				}
				break;
			case "rollResults ok"://p-----------------------------------------------13
				players[game.turnNum].turnPhase = 4;
				let gains = pickup("turn",0,game.turnNum);
				let gainSummary = [];
				for (var g = 0; g < gains.profits.length; g++) {
					if (gains.profits[g] > 0) {
						gainSummary.push(types[g][0] + ": " + gains.profits[g]);
					}
				};
				drawBoard(gains.highlights);
				
				game.panel = panels.indexOf("youProduced ok");//p14
				makePanel("On this turn, you produced: " + gainSummary.join(", "),[["Ok",0]]);
				break;
			case "youProduced ok"://p-----------------------------------------------14
				drawBoard();
				
				players[game.turnNum].turnPhase = 5;
				game.panel = panels.indexOf("battlePrompt yesno");//p15
				makePanel("Battle?",[["Yes",true],["No",false]]);
				break;
				
//PLAYING PHASE - battling
			case "battlePrompt yesno"://p-----------------------------------------------15
				
				if (inputData && (players[game.turnNum].totalArmies > 1 || (players[game.turnNum].totalArmies == 1 && players[game.turnNum].totalRegions > 1))) {//true - continue battling, false - skip to building
					game.panel = panels.indexOf("battlePrompt tiler");//p16
					makePanel("Please select a region to battle on.",[["Cancel",0]]);
					game.tilesClickable = true;
				} else {
					players[game.turnNum].turnPhase = 6;
					game.panel = panels.indexOf("buildPrompt yesno");//p22
					if (players[game.turnNum].totalArmies <= 1) {
						makePanel("Build? <br>(You couldn't battle due to your scarce amount of armies left.)",[["Yes",true],["No",false],["Trade",45882]]);
					} else {
						makePanel("Build?",[["Yes",true],["No",false],["Trade",45882]]);
					}
					//get list of buildable tiles
					game.buildables = [];
					for (var i = 0; i < board.length; i++) {
						for (var j = 0; j < board[i].length; j++) {
							let tile = board[i][j];
							if (tile.pnts[game.turnNum] >= 1) {
								if (!game.buildables.map(x => x.toString()).includes(tile.coords.toString())) {
									game.buildables.push(tile.coords);
								}
								if (tile.pnts[game.turnNum] >= 3) {
									for (var k = 0; k < tile.adjCoords.length; k++) {
										if (!game.buildables.map(x => x.toString()).includes(tile.adjCoords[k].toString())) {
											game.buildables.push(tile.adjCoords[k]);
										}
									}
								}
							}
						}
					}
					
				}
				break;
			case "battlePrompt tiler"://p-----------------------------------------------16
			
				if (inputData == 0) {
					game.panel = panels.indexOf("battlePrompt yesno");//p15
					makePanel("Battle?",[["Yes",true],["No",false]]);
					game.tilesClickable = false;
					game.tileClicked = "none";
					drawBoard();
				} else {
					if (inputData == "battle") {//confirm a battle
						let buttonArray = [];
						for (var q = 0; q < game.playerCount; q++) {
							if (game.tileClicked.pnts[q] > 0 && q != game.turnNum && !game.tileClicked.battled.includes(q) && (players[q].totalArmies > 1 || (players[q].totalArmies == 1 && game.tileClicked.pnts[q] < 3 && players[q].totalRegions > 1))) {
								buttonArray.push([players[q].name,q,players[q].colour]);
							}
						}
						game.panel = panels.indexOf("whenMultiOnTile select");//p18
						makePanel("Select the victim of your attack",buttonArray);
						game.tilesClickable = false;
						game.battleTile = game.tileClicked;//game.tileClicked will get reset in the drawBoard func (remember that tileClicked and battleTile are the entire tile object)
						//another extremely important piece of information is that even if we don't reference the object as a member of the board array, since game.tileClicked is an object linked to the board array and now battleTile is extending that link, whatever we do to game.battleTile will have a direct and automatic affect on that object in the board array. pretty cool, right?
						//since we did ([0][1] is for example) game.tileClicked = board[0][1], then we did game.battleTile = game.tileClicked, and now even though game.tileClicked is no longer equal to board[0][1] because we immediately reset it after setting game.battleTile, and therefore, game.battleTile is now linked to board[0][1]. so if we then do for example (tried to change the amount of points player 1 has in the tile to 5) we do: game.battleTile.pnts[0] = 5, and now board[0][1].pnts[0] is 5. We didn't need to to do board[game.battleTile.coords[0]][game.battleTile.coords[1]].pnts[0] = 5, which would be the way to do it manually, i.e. without using the special auto linking
						drawBoard(game.tileClicked.coords);
					} else {
						if (inputData == "'ready'") {//when selected a tile, make the confirm button appear
							makePanel("Please select a region to battle on.",[["Cancel",0],["Battle there?","'battle'"]]);//change this current panel
						} else {
							game.panel = panels.indexOf("cantBattleThere ok");//p17
							makePanel(inputData,[["Ok",0]]);
						}
					}
				}
				break;
			case "cantBattleThere ok"://p-----------------------------------------------17
				game.panel = panels.indexOf("battlePrompt tiler");//p16
				makePanel("Please select a region to battle on.",[["Cancel",0]]);
				break;
				
			case "whenMultiOnTile select"://p-----------------------------------------------18
				game.defender = inputData;
				players[game.defender].turnPhase = 1;//make them a defender
				
				let txt = "Battle in play on " + game.battleTile.name + "<br>" + players[game.turnNum].name + " vs " + players[game.defender].name + "<br>Attacker's points: " + game.battleTile.pnts[game.turnNum] + " | Defender's points: " + game.battleTile.pnts[game.defender] + "<br>Attacker's spoils: " + game.battleSpoils[0] + " " + (game.battleTile.type == "desert" ? "Random" : game.battleTile.type) + " | Defender's spoils: " + game.battleSpoils[1] + " " + (game.battleTile.type == "desert" ? "Random" : game.battleTile.type);
				
				game.panel = panels.indexOf("battlePanel rollselect");//p19
				makePanel(txt ,[["Attacker:<br>End Battle",1,players[game.turnNum].colour],["Attacker:<br>roll",2,players[game.turnNum].colour],[""],["Defender:<br>roll",3,players[game.defender].colour],["Defender:<br>End Battle<br>(Costs 1 token)",4,players[game.defender].colour]]);
				break;
			case "battlePanel rollselect"://p-----------------------------------------------19
			
				if (game.battleRolls[0] != 0 && game.battleRolls[1] != 0 && (inputData != 1 && inputData != 4)) {//if both rolls have been made
					
					//determine winner
					function getWinner(att, def) {
						if (att > def) {
							return game.turnNum;
						} else {//if def is equal or greater, def wins
							return game.defender;
						}
					}
					let winner = getWinner(game.battleRolls[0].highest,game.battleRolls[1].highest);
					let loser = game.turnNum;
					if (winner == game.turnNum) {
						loser = game.defender;
					}
					
					//middle button
					if (inputData == 'defeat') {//after both rolled and one was defeated
						game.panel = panels.indexOf("battleEndReason ok");//p20
						if (winner == game.turnNum) {
							let tokenGot = "";
							if (!players[game.turnNum].wonAbattle) {
								players[game.turnNum].tokens++;
								tokenGot = "<br>You also recieved 1 token.";
							}
							makePanel("You have defeated " + players[loser].name + " and claimed victory! " + tokenGot,[["Ok",0]]);//0 will mean winner gets all spoils
							//reset stuff
							players[game.turnNum].wonAbattle = true;
							
						} else {
							makePanel("You have been defeated by " + players[winner].name + ". Better luck next time!",[["Ok",0]]);
						}
						
					} else if (inputData == 'simpleWin') {//if both are still standing
						game.battleRolls = [0,0];//reset rolls
						//reset buttons
						document.getElementById("button2").innerHTML = "";
						document.getElementById("button2").setAttribute("onclick","huh()");//huh?
						document.getElementById("button2").style.outline = "0px";
						document.getElementById("button1").innerHTML = "Attacker:<br>roll";
						document.getElementById("button1").setAttribute("onclick","switchPanel(2)");
						document.getElementById("button3").innerHTML = "Defender:<br>roll";
						document.getElementById("button3").setAttribute("onclick","switchPanel(3)");
						
					} else {//we don't want this stuff to happen again when the middle button is clicked
						//data effects
						game.battleTile.pnts[loser]--;
						if (loser == game.turnNum) {//loser gets a resource card
							game.battleSpoils[0]++;
						} else {
							game.battleSpoils[1]++;
						}
					}
					
					if (inputData != 'defeat') {//we don't want this stuff to happen if the panel is being changed.
						//update battle stats
						infoArea.innerHTML = "Battle in play on " + game.battleTile.name + "<br>" + players[game.turnNum].name + " vs " + players[game.defender].name + "<br>Attacker's points: " + game.battleTile.pnts[game.turnNum] + " | Defender's points: " + game.battleTile.pnts[game.defender] + "<br>Attacker's spoils: " + game.battleSpoils[0] + " " + (game.battleTile.type == "desert" ? "Random" : game.battleTile.type) + " | Defender's spoils: " + game.battleSpoils[1] + " " + (game.battleTile.type == "desert" ? "Random" : game.battleTile.type);
						
						if (inputData != 'simpleWin') {
							//text effects
							if (game.battleTile.pnts[loser] > 0) {//if the loser still has points on the tile after that devastating loss it hath procured
								
								document.getElementById("button2").innerHTML = players[winner].name + " won! <br>~Click to continue~";
								document.getElementById("button2").setAttribute("onclick","switchPanel('simpleWin')");
								document.getElementById("button2").style.outline = "3px solid " + players[winner].colour;
							} else {
								
								document.getElementById("button2").innerHTML = players[loser].name + "<br> has been defeated! <br>~Click to continue~";
								document.getElementById("button2").setAttribute("onclick","switchPanel('defeat')");
								document.getElementById("button2").style.outline = "3px solid " + players[winner].colour;
							}
						}
						
					}
					drawBoard(game.battleTile.coords);
					
				} else if (inputData == 2 || inputData == 3) {//if both rolls haven't been made yet
					let btnTxt = "";
					if (inputData == 2) {
						if (game.battleTile.pnts[game.turnNum] > game.battleTile.pnts[game.defender]) {
							game.battleRolls[0] = roll(2);
							btnTxt = "<br>(Best of 2 Rolls)";
						} else {
							game.battleRolls[0] = roll(1);
						}
						document.getElementById("button1").innerHTML = game.battleRolls[0].highest + btnTxt;
						document.getElementById("button1").setAttribute("onclick","huh()");//huh?
					} else if (inputData == 3) {
						if (game.battleTile.pnts[game.defender] > game.battleTile.pnts[game.turnNum]) {
							game.battleRolls[1] = roll(2);
							btnTxt = "<br>(Best of 2 Rolls)";
						} else {
							game.battleRolls[1] = roll(1);
						}
						document.getElementById("button3").innerHTML = game.battleRolls[1].highest + btnTxt;
						document.getElementById("button3").setAttribute("onclick","huh()");//huh?
					}
					if (game.battleRolls[0] != 0 && game.battleRolls[1] != 0) {
						switchPanel(0);
					}
				} else if ((inputData == 1 || inputData == 4) && (game.battleTile.pnts[game.turnNum] > 0 && game.battleTile.pnts[game.defender] > 0)) {//manual enders - and make sure that they don't do anything when a defeat has occured
					if (inputData == 1) {//when player whose turn it is ends it
						game.panel = panels.indexOf("battleEndReason ok");//p20
						makePanel("You called a ceasefire and ended the battle.",[["Ok",1]]);//1 means spoils are split accordingly
						
					} else if (inputData == 4 && players[game.defender].tokens > 0) {//when defender ends it (and they have enough tokens to afford it
						game.panel = panels.indexOf("battleEndReason ok");//p20
						makePanel("The defender stopped your attack<br> and used up one of their tokens",[["Ok",1]]);//1 means spoils are split accordingly
						players[game.defender].tokens--;
					}
					
				}
				
				break;
			case "battleEndReason ok"://p-----------------------------------------------20
				game.panel = panels.indexOf("battleSpoils ok");//p20
				
				let txt1 = "";
				if (inputData == 1) {
					//record that there was a battle with so and so that didn't end in a defeat, so that you can't re-fight them on your turn. If they were defeated, this is useless, since they don't exist anyway
					game.battleTile.battled.push(game.defender);
					
					//get resources
					if (game.battleTile.type != "desert") {
						players[game.turnNum].resources[typeNames.indexOf(game.battleTile.type)] += game.battleSpoils[0];
						players[game.defender].resources[typeNames.indexOf(game.battleTile.type)] += game.battleSpoils[1];
						
						txt1 = players[game.turnNum].name + " recieved " + game.battleSpoils[0] + " " + game.battleTile.type + "<br>" + players[game.defender].name + " recieved " + game.battleSpoils[1] + " " + game.battleTile.type;
						
					} else {//desert randomness
						//attacker
						let attSpoils = [0,0,0,0,0];
						for (let f = 0; f < game.battleSpoils[0]; f++) {//get resource amounts
							let res = random(0,4);
							players[game.turnNum].resources[res]++;//affect players resources
							attSpoils[res]++;
						}
						let attstuff = [];
						for (let f = 0; f < 5; f++) {//name resources for text
							if (attSpoils[f] > 0) {
								attstuff.push(typeNames[f] + ": " + attSpoils[f]);
							}
						};
						
						//defender
						let defSpoils = [0,0,0,0,0];
						for (let g = 0; g < game.battleSpoils[1]; g++) {//get resource amounts
							let res = random(0,4);
							players[game.defender].resources[res]++;//affect players resources
							defSpoils[res]++;	
						}
						let defstuff = [];
						for (let g = 0; g < 5; g++) {//name resources for text
							if (defSpoils[g] > 0) {
								defstuff.push(typeNames[g] + ": " + defSpoils[g]);
							}
						};
						
						txt1 = players[game.turnNum].name + " recieved " + attstuff.join(", ") + "<br>" + players[game.defender].name + " recieved " + defstuff.join(", ");
					}
				} else {//if battle was a defeat
					let winner = game.turnNum;//yeah it might be the attacker who won...
					let spoilValue = game.battleSpoils[0] + game.battleSpoils[1];
					if (game.battleTile.pnts[game.turnNum] == 0) {//oh wait.. shoot, did the attacker lose? bruh.
						winner = game.defender;//I guess the defender won. It do be like that sometimes.
					}
					if (game.battleTile.type != "desert") {
						players[winner].resources[typeNames.indexOf(game.battleTile.type)] += spoilValue;
						txt1 = players[winner].name + " recieved " + spoilValue + " " + game.battleTile.type;
					
					} else {//desert madness (that means you get a random splash of resources lol)
						let spoils = [0,0,0,0,0];
						for (let g = 0; g < spoilValue; g++) {
							let res = random(0,4);
							players[winner].resources[res]++;//affect players resources
							spoils[res]++;
						}
						let stuff = [];
						for (let g = 0; g < 5; g++) {
							if (spoils[g] > 0) {
								stuff.push(typeNames[g] + ": " + spoils[g]);
							}
						};
						
						txt1 = players[winner].name + " recieved " + stuff.join(", ");
					}
					
				}
				makePanel(txt1,[["End Battle",0]]);
				
				break;
			case "battleSpoils ok"://p-----------------------------------------------21
				
				//reset battle info
				players[game.defender].turnPhase = 0;
				game.defender = 0;
				game.battleRolls = [0,0];
				game.battleSpoils = [0,0];
				game.battleTile = "none";
				
				game.panel = panels.indexOf("battlePrompt yesno");//p15
				makePanel("Continue battling?",[["Yes",true],["No",false]]);
				drawBoard();
				break;
				
				
//PLAYING PHASE - building
			case "buildPrompt yesno"://p-----------------------------------------------22
				
				if (inputData) {//true - continue building, false - skip to moving
					game.panel = panels.indexOf("buildPrompt tiler");//p23
					makePanel("Please select a region to build on.",[["Highlight spots",33],["Cancel",0]]);
					game.tilesClickable = true;
					
				} else {
					players[game.turnNum].turnPhase = 7;
					game.panel = panels.indexOf("movePrompt yesno");//p27
					makePanel("Move points?",[["Yes",true],["No",false],["Trade",45882]]);
				}
				break;
			case "buildPrompt tiler"://p-----------------------------------------------23
				if (inputData == 33) {//toggle highlighter
					let canList = [];
					let res1 = players[game.turnNum].resources;
					for (let w = 0; w < game.buildables.length; w++) {
						let tile = board[game.buildables[w][0]][game.buildables[w][1]];
						if (res1[typeNames.indexOf(tile.type)] >= 2 || (tile.type == "desert" && itemSum(res1) >= 2)) {//if you have 2 or more resources for that 
							canList.push(game.buildables[w]);
						}
					}
					showLightsToggle(true,canList);
					
				} else if (inputData === 0) {
					game.panel = panels.indexOf("buildPrompt yesno");//p22
					makePanel("Build?",[["Yes",true],["No",false],["Trade",45882]]);
					game.tilesClickable = false;
					game.tileClicked = "none";
					showLightsToggle(false);
					drawBoard();
				} else {
					if (inputData == "build") {//confirm a build
						game.pntsToUse = 1;
						game.tilesClickable = false;
						game.buildTile = game.tileClicked;
						
						//get budget
						let res1 = players[game.turnNum].resources;
						let budget = res1[typeNames.indexOf(game.buildTile.type)];
						if (game.buildTile.type == "desert") {
							budget = itemSum(res1);
						}
						
						let buttonArray = [["<",-1],[game.pntsToUse + "<br>~Click to confirm~",0],[">",1]];
						if (Math.floor(budget/2) == 1) {
							buttonArray = [[game.pntsToUse + "<br>~Click to confirm~",0]];
						}
						showLightsToggle(false);
						game.panel = panels.indexOf("builtPointCount select");//p25
						makePanel("Select how many points to add to the region. <br>(Each point costs " + (game.buildTile.type == "desert" ? ("2 resources (any combo)") : ("2 " + game.buildTile.type)) + ")",buttonArray);
						
						drawBoard(game.buildTile.coords);
						
					} else {
						if (inputData == "'ready'") {//when selected a tile, make the confirm button appear
							makePanel("Please select a region to build on.",[["Highlight spots",33],["Cancel",0],["Build there?","'build'"]]);//change this current panel
						} else {
							game.panel = panels.indexOf("cantBuildThere ok");//p24
							makePanel(inputData,[["Ok",0]]);
						}
					}
				}
				
				break;
				
			case "cantBuildThere ok"://p-----------------------------------------------24
				game.panel = panels.indexOf("buildPrompt tiler");//p23
				makePanel("Please select a region to build on.",[["Highlight spots",33],["Cancel",0]]);
				break;
			case "builtPointCount select"://p-----------------------------------------------25
				let res1 = players[game.turnNum].resources;
				if (inputData == 0) {//confirm amount
					if (game.buildTile.type != "desert") {
						players[game.turnNum].resources[typeNames.indexOf(game.buildTile.type)] -= game.pntsToUse*2;
						game.buildTile.pnts[game.turnNum]+=game.pntsToUse;
						drawBoard(game.buildTile.coords);
						game.panel = panels.indexOf("youBuiltX ok");//p26
						makePanel("You have built " + game.pntsToUse + " point"+ (game.pntsToUse > 1 ? "s" : "") +" on " + game.buildTile.name + "<br> And spent " + game.pntsToUse*2 + " " + game.buildTile.type,[["Ok",0]]);
						
					} else {
						game.panel = panels.indexOf("desertBuilder select");//p25.5
						let buttonArray1 = [["Reset budget",20]];
						for (let y = 0; y < 5; y++) {
							if (res1[y] > 0) {
								buttonArray1.push([res1[y] + "<br>" + typeNames[y],y,typeColours[y]]);
							}
						}
						game.buffet = [0,0,0,0,0];
						makePanel("Select any "+ game.pntsToUse*2 + " resources to build " + game.pntsToUse + " point"+(game.pntsToUse > 1 ? "s" : "")+" on the desert",buttonArray1);
					}
					
				} else {//amount selectors (won't appear if budget is 1)
					let budget = res1[typeNames.indexOf(game.buildTile.type)];
					if (game.buildTile.type == "desert") {
						budget = itemSum(res1);
					}
					let maxPnts = Math.floor(budget/2);
					game.pntsToUse = Math.min(Math.max(1,game.pntsToUse + inputData),maxPnts);//the arrow buttons will increase or decrease amount
					document.getElementById("button1").innerHTML = game.pntsToUse + "<br>~Click to confirm~";
				}
				break;
			case "desertBuilder select"://p-----------------------------------------------25.5
				
				let buffetTxt = [];
				let buffTot = 0;
				for (let u = 0; u < 5; u++) {
					if (game.buffet[u] > 0) {
						buffetTxt.push(game.buffet[u]+ " " + typeNames[u]);
						buffTot+=game.buffet[u];
					}
				}
				buffetTxt.join(", ");//get rid of the comma and space at the end
				
				//button effects
				if (inputData == 20) {//the reset budget button
					game.buffet = [0,0,0,0,0];
				} else if (inputData == 30) {//confirm selection
					//take expense from the player's actual resources
					for (let r = 0; r < 5; r++) {
						players[game.turnNum].resources[r] -= game.buffet[r];
					}
					game.buffet = [0,0,0,0,0];
					//confirm build
					game.buildTile.pnts[game.turnNum]+=game.pntsToUse;;
					drawBoard(game.buildTile.coords);
					game.panel = panels.indexOf("youBuiltX ok");//p26
					makePanel("You have built " + game.pntsToUse + " point"+ (game.pntsToUse > 1 ? "s" : "") +" on " + game.buildTile.name + "<br> And spent " + buffetTxt,[["Ok",0]]);
					
				} else if (buffTot < game.pntsToUse*2) {//you can't pull out more resources once you reach the quota. your only choice is to confirm or reste the buffet
					game.buffet[inputData] = Math.min(game.buffet[inputData] + 1, players[game.turnNum].resources[inputData]);
				}
				
				if (inputData != 30) {
					//make button array (the one we just experienced)
					let buttonArray2 = [["Reset budget",20]];
					for (let y = 0; y < 5; y++) {
						if (players[game.turnNum].resources[y] > 0) {
							buttonArray2.push([players[game.turnNum].resources[y] - game.buffet[y] + "<br>" + typeNames[y],y,typeColours[y]]);
						}
					}
					
					//must repeat this for next part of code
					buffetTxt = [];
					buffTot = 0;
					for (let u = 0; u < 5; u++) {
						if (game.buffet[u] > 0) {
							buffetTxt.push(game.buffet[u]+ " " + typeNames[u]);
							buffTot+=game.buffet[u];
						}
					}
					buffetTxt.join(", ");//get rid of the comma and space at the end
					
					if (arrayHasOnly(game.buffet,0)) {
						makePanel("Select any "+ game.pntsToUse*2 + " resources to build " + game.pntsToUse + " point"+(game.pntsToUse > 1 ? "s" : "")+" on the desert",buttonArray2);
					} else {
						
						if (game.pntsToUse*2 - buffTot > 0) {
							makePanel("Select "+ (game.pntsToUse*2 - buffTot) + " more resources to build " + game.pntsToUse + " point"+(game.pntsToUse > 1 ? "s" : "")+" on the desert" + "<br>Budget: "+buffetTxt,buttonArray2);
						} else {
							makePanel("You have selected enough resources to build " + game.pntsToUse + " point"+(game.pntsToUse > 1 ? "s" : "")+" on the desert" + "<br>Budget: "+buffetTxt,[["Reset budget",20],["Build",30]]);
						}
					}
				}
				
				break;
				
			case "youBuiltX ok"://p-----------------------------------------------26
				game.panel = panels.indexOf("buildPrompt yesno");//p22
				makePanel("Continue building?",[["Yes",true],["No",false],["Trade",45882]]);
				game.tilesClickable = false;
				game.tileClicked = "none";
				game.buildTile = "none";
				drawBoard();
				break;
				
				
//PLAYING PHASE - moving
			case "movePrompt yesno"://p-----------------------------------------------27
				
				if (inputData) {//true - continue moving, false - skip to end
					game.panel = panels.indexOf("moveDestinationPrompt tiler");//p28
					makePanel("Please select a region to move points to (destination)",[["Highlight spots",33],["Cancel",0]]);
					game.tilesClickable = true;
					
					//get list of valid destination tiles
					game.buildables = [];
					for (var i = 0; i < board.length; i++) {
						for (var j = 0; j < board[i].length; j++) {
							let tile = board[i][j];
							if (tile.pnts[game.turnNum] >= 1) {
								if (!game.buildables.map(x => x.toString()).includes(tile.coords.toString())) {
									game.buildables.push(tile.coords);
								}
							}
						}
					}
				} else {
					players[game.turnNum].turnPhase = 2;
				if (itemSum(players[game.turnNum].resources) >= 5) {
						game.panel = panels.indexOf("5forToken yesno");
						makePanel("Trade any 5 resources for 1 token before you end your turn?",[["Yes",true],["No",false]]);
					} else {
						players[game.turnNum].turnPhase = 0;
						game.panel = panels.indexOf("endTurn yesno");//p34
						makePanel("Your turn is over.",[["Ok",0]]);
					}
				}
				break;
			case "moveDestinationPrompt tiler"://p-----------------------------------------------28
				
				if (inputData == 33) {//toggle highlighter
					let canList1 = [];
					let res1 = players[game.turnNum].resources;
					for (let w = 0; w < game.buildables.length; w++) {
						let tile = board[game.buildables[w][0]][game.buildables[w][1]];
						if (res1[typeNames.indexOf(tile.type)] >= 1 || (tile.type == "desert" && itemSum(res1) >= 1)) {//if you have 2 or more resources for that 
							canList1.push(game.buildables[w]);
						}
					}
					showLightsToggle(true,canList1);
					
				} else if (inputData === 0) {
					game.panel = panels.indexOf("movePrompt yesno");//p27
					makePanel("Move points?",[["Yes",true],["No",false],["Trade",45882]]);
					game.tilesClickable = false;
					game.tileClicked = "none";
					showLightsToggle(false);
					
					game.tileClicked = "none";
					drawBoard();
				} else {
					if (inputData == "dest") {//confirm a destination
						game.pntsToUse = 1;
						game.destTile = game.tileClicked;
						game.panel = panels.indexOf("moveOriginPrompt tiler");//p25
						makePanel("Please select a region to take points from (origin)",[["Highlight spots",33],["Cancel",0]]);
						showLightsToggle(false);
						drawBoard();
						//get list of valid origin tiles
						game.buildables = [];
						for (var i = 0; i < board.length; i++) {
							for (var j = 0; j < board[i].length; j++) {
								let tile = board[i][j];
								if (tile.pnts[game.turnNum] >= 1 && isConnected(game.destTile,tile,"points",game.turnNum)) {
									if (!game.buildables.map(x => x.toString()).includes(tile.coords.toString())) {
										game.buildables.push(tile.coords);
									}
								}
							}
						}
						
					} else {
						if (inputData == "'ready'") {//when selected a tile, make the confirm button appear
							makePanel("Please select a region to move points to (destination)",[["Highlight spots",33],["Cancel",0],["Confirm destination","'dest'"]]);
						} else {
							game.panel = panels.indexOf("cantMoveTo ok");//p29
							makePanel(inputData,[["Ok",0]]);
						}
					}
				}
				break;
			case "cantMoveTo ok"://p-----------------------------------------------29
				game.panel = panels.indexOf("moveDestinationPrompt tiler");//p28
				makePanel("Please select a region to move points to (destination)",[["Highlight spots",33],["Cancel",0]]);
				break;
				
			case "moveOriginPrompt tiler"://p-----------------------------------------------30
				if (inputData == 33) {//toggle highlighter
					showLightsToggle(true,game.buildables);
					
				} else if (inputData === 0) {
					game.destTile = "none";
					game.panel = panels.indexOf("moveDestinationPrompt tiler");//p28
					makePanel("Please select a region to move points to (destination)",[["Highlight spots",33],["Cancel",0]]);
					showLightsToggle(false);
					game.tileClicked.clicked = false;
					game.tileClicked = "none";
					//get list of valid destination tiles
					game.buildables = [];
					for (var i = 0; i < board.length; i++) {
						for (var j = 0; j < board[i].length; j++) {
							let tile = board[i][j];
							if (tile.pnts[game.turnNum] >= 1) {
								if (!game.buildables.map(x => x.toString()).includes(tile.coords.toString())) {
									game.buildables.push(tile.coords);
								}
							}
						}
					}
					game.foundMove = false;
					drawBoard();
					
				} else {
					if (inputData == "origin") {//confirm a destination
						game.originTile = game.tileClicked;
						game.tilesClickable = false;
						game.tileClicked = "none";
						game.panel = panels.indexOf("movePointCount select");//32
						
						//get total possible points
						game.pntsToUse = 1;
						let res1 = players[game.turnNum].resources;
						let budget1 = Math.min(game.originTile.pnts[game.turnNum],res1[typeNames.indexOf(game.destTile.type)]);
						if (game.destTile.type == "desert") {
							budget1 = Math.min(game.originTile.pnts[game.turnNum],itemSum(res1));
						}
						
						let buttonArray3 = [["<",-1],[game.pntsToUse + "<br>~Click to confirm~",0],[">",1]];
						if (budget1 == 1) {
							buttonArray3 = [[game.pntsToUse + "<br>~Click to confirm~",0]];
						}
						makePanel("Select how many points to move to the region. <br>(Each point costs " + (game.destTile.type == "desert" ? ("1 of any resource") : ("1 " + game.destTile.type)) + ")",buttonArray3);
						
						showLightsToggle(false);
						drawBoard([game.destTile.coords,game.originTile.coords]);
						
					} else {
						if (inputData == "'ready'") {//when selected a tile, make the confirm button appear
							makePanel("Please select a region to take points from (origin)",[["Highlight spots",33],["Cancel",0],["Confirm origin","'origin'"]]);
							game.foundMove = true;
						} else {
							game.panel = panels.indexOf("cantMoveFrom ok");//p29
							makePanel(inputData,[["Ok",0]]);
							game.foundMove = false;
						}
					}
					
				}
				break;
				
			case "cantMoveFrom ok"://p-----------------------------------------------31
				game.panel = panels.indexOf("moveOriginPrompt tiler");//p28
				makePanel("Please select a region to move points from (origin)",[["Highlight spots",33],["Cancel",0]]);
				break;
				
			case "movePointCount select"://p-----------------------------------------------32
				let res2 = players[game.turnNum].resources;
				if (inputData == 0) {//confirm amount
					if (game.destTile.type != "desert") {//normal resource depletion, since we know what resource to deplete
						players[game.turnNum].resources[typeNames.indexOf(game.destTile.type)] -= game.pntsToUse;//take resources to pay for destination
						game.originTile.pnts[game.turnNum] -= game.pntsToUse;//deplete points from origin tile
						game.destTile.pnts[game.turnNum] += game.pntsToUse;//add points to destination tile
						
						drawBoard([game.destTile.coords,game.originTile.coords]);
						
						game.panel = panels.indexOf("youMovedX ok");//p26
						makePanel("You have moved " + game.pntsToUse + " point"+ (game.pntsToUse > 1 ? "s" : "") + " from " + game.originTile.name + " to " + game.destTile.name + "<br> And spent " + game.pntsToUse + " " + game.destTile.type,[["Ok",0]]);
						
					} else {//desert selector (since resource to deplete is unspecified by player yet
						game.panel = panels.indexOf("desertMover select");//p32.5
						let buttonArray1 = [["Reset budget",20]];
						for (let y = 0; y < 5; y++) {
							if (res2[y] > 0) {
								buttonArray1.push([res2[y] + "<br>" + typeNames[y],y,typeColours[y]]);
							}
						}
						game.buffet = [0,0,0,0,0];
						makePanel("Select any "+ game.pntsToUse + " resource"+(game.pntsToUse > 1 ? "s" : "")+" to move " + game.pntsToUse + " point"+(game.pntsToUse > 1 ? "s" : "")+" from " + game.originTile.name + " to the desert",buttonArray1);
					}
					
				} else {//amount selectors (won't appear if budget is 1)
					let budget = Math.min(game.originTile.pnts[game.turnNum],res2[typeNames.indexOf(game.destTile.type)]);
					if (game.destTile.type == "desert") {
						budget = Math.min(game.originTile.pnts[game.turnNum],itemSum(res2));
					}
					game.pntsToUse = Math.min(Math.max(1,game.pntsToUse + inputData),budget);//the arrow buttons will increase or decrease amount
					document.getElementById("button1").innerHTML = game.pntsToUse + "<br>~Click to confirm~";
				}
				break;
				
				
			case "desertMover select": //p-----------------------------------------------32.5
				let buffetTxt1 = [];
				let buffTot1 = 0;
				for (let u = 0; u < 5; u++) {
					if (game.buffet[u] > 0) {
						buffetTxt1.push(game.buffet[u]+ " " + typeNames[u]);
						buffTot1+=game.buffet[u];
					}
				}
				buffetTxt1.join(", ");//get rid of the comma and space at the end
				
				//button effects
				if (inputData == 20) {//the reset budget button
					game.buffet = [0,0,0,0,0];
				} else if (inputData == 30) {//confirm selection
					//take expense from the player's actual resources
					for (let r = 0; r < 5; r++) {
						players[game.turnNum].resources[r] -= game.buffet[r];
					}
					game.buffet = [0,0,0,0,0];
					//confirm build
					game.originTile.pnts[game.turnNum] -= game.pntsToUse;//deplete points from origin tile
					game.destTile.pnts[game.turnNum] += game.pntsToUse;//add points to destination tile
					drawBoard([game.destTile.coords,game.originTile.coords]);
					game.panel = panels.indexOf("youMovedX ok");//p26
					makePanel("You have moved " + game.pntsToUse + " point"+ (game.pntsToUse > 1 ? "s" : "") + " from " + game.originTile.name + " to " + game.destTile.name + "<br> And spent " + buffetTxt1,[["Ok",0]]);
					
				} else if (buffTot1 < game.pntsToUse) {//you can't pull out more resources once you reach the quota. your only choice is to confirm or reste the buffet
					game.buffet[inputData] = Math.min(game.buffet[inputData] + 1, players[game.turnNum].resources[inputData]);
				}
				
				if (inputData != 30) {
					//make button array (the one we just experienced)
					let buttonArray2 = [["Reset budget",20]];
					for (let y = 0; y < 5; y++) {
						if (players[game.turnNum].resources[y] > 0) {
							buttonArray2.push([players[game.turnNum].resources[y] - game.buffet[y] + "<br>" + typeNames[y],y,typeColours[y]]);
						}
					}
					
					//must repeat this for next part of code
					buffetTxt1 = [];
					buffTot1 = 0;
					for (let u = 0; u < 5; u++) {
						if (game.buffet[u] > 0) {
							buffetTxt1.push(game.buffet[u]+ " " + typeNames[u]);
							buffTot1+=game.buffet[u];
						}
					}
					buffetTxt1.join(", ");//get rid of the comma and space at the end
					
					if (arrayHasOnly(game.buffet,0)) {
						makePanel("Select any "+ game.pntsToUse + " resource"+(game.pntsToUse > 1 ? "s" : "")+" to move " + game.pntsToUse + " point"+(game.pntsToUse > 1 ? "s" : "")+" from " + game.originTile.name + " to the desert",buttonArray2);
					} else {
						
						if (game.pntsToUse - buffTot1 > 0) {
							makePanel("Select "+ (game.pntsToUse - buffTot1) + " more resource"+(game.pntsToUse - buffTot1 > 1 ? "s" : "")+" to move " + game.pntsToUse + " point"+(game.pntsToUse > 1 ? "s" : "")+" from " + game.originTile.name + " to the desert" + "<br>Budget: "+buffetTxt1,buttonArray2);
						} else {
							makePanel("You have selected enough resources to move " + game.pntsToUse + " point"+(game.pntsToUse > 1 ? "s" : "")+" from " + game.originTile.name + " to the desert" + "<br>Budget: "+buffetTxt1,[["Reset budget",20],["Build",30]]);
						}
					}
				}
				break;
			
			case "youMovedX ok"://p-----------------------------------------------33
				game.panel = panels.indexOf("movePrompt yesno");//p27
				makePanel("Move points?",[["Yes",true],["No",false],["Trade",45882]]);
				game.tilesClickable = false;
				game.tileClicked = "none";
				game.destTile = "none";
				game.originTile = "none";
				game.foundMove = false;
				showLightsToggle(false);
				drawBoard();
				break;
				
//TRADES
			case "resTrade select":
				if (inputData == 0) {//cancellation
					game.tradeType = "none";
					if (players[game.turnNum].turnPhase == 6) {
						game.panel = panels.indexOf("buildPrompt yesno");//p22
						makePanel("Build?",[["Yes",true],["No",false],["Trade",45882]]);
					} else {
						game.panel = panels.indexOf("movePrompt yesno");//p27
						makePanel("Move points?",[["Yes",true],["No",false],["Trade",45882]]);
					}
				} else if (inputData == 1) {//3:1 trade
					let res = players[game.turnNum].resources;
					let buttonArray3 = [];
					for (let g = 0; g < 5; g++) {
						if (res[g] >= 3) {
							buttonArray3.push([res[g] + "<br>" + typeNames[g],g,typeColours[g]]);
						}
					}
					if (buttonArray3.length > 0) {
						game.tradeType = "3:1";
						game.panel = panels.indexOf("3for1 select");
						makePanel("Select a resource type to trade in 3 of <br>in return for 1 of any resource",buttonArray3);
					} else {
						makePanel("You can't afford to make this trade",[["Ok",3]]);//3 resets the panel back to initialization
					}
				} else if (inputData == 2) {//token:2 trade
					if (players[game.turnNum].tokens > 0) {
						game.tradeType = "token:2";
						players[game.turnNum].tokens--;
						game.panel = panels.indexOf("chooseResource select");
						makePanel("Choose any 2 resources",[["Crops",10,typeColours[0]],["Cattle",20,typeColours[1]],["Trees",30,typeColours[2]],["Metal",40,typeColours[3]],["Bricks",50,typeColours[4]],["Reset choices",0]]);
						game.buffet = [0,0,0,0,0];
					} else {
						makePanel("You can't afford to make this trade",[["Ok",3]]);//3 resets the panel back to initialization
					}
					
				} else if (inputData == 3) {
					makePanel("Select the type of trade you'd like to make",[["3~same for 1~any",1],["~Cancel~",0],["1~token for 2~any",2]]);
				}
				
				break;
			case "3for1 select":
				players[game.turnNum].resources[inputData] -= 3;
				game.panel = panels.indexOf("chooseResource select");
				makePanel("Choose 1 resource",[["Crops",10,typeColours[0]],["Cattle",20,typeColours[1]],["Trees",30,typeColours[2]],["Metal",40,typeColours[3]],["Bricks",50,typeColours[4]]]);
				game.buffet = [0,0,0,0,0];
				break;
				
			case "chooseResource select":
				let resIdx = inputData/10 - 1;
				let maxedOut = false;
				let resChosen = itemSum(game.buffet);
				if (inputData == 1) {//confirm trade
					for (let o = 0; o < 5; o++) {
						players[game.turnNum].resources[o] += game.buffet[o];
					}
					game.buffet = [0,0,0,0,0];
					resChosen = 0;
					makePanel("Select the type of trade you'd like to make",[["3~same for 1~any",1],["~Cancel~",0],["1~token for 2~any",2]]);
					game.panel = panels.indexOf("resTrade select");
					break;
				} else if (inputData != 0) {
					if ((game.tradeType == "token:2" && resChosen < 2) || (game.tradeType == "3:1" && resChosen < 1)) {
						game.buffet[resIdx]++;
						resChosen = itemSum(game.buffet);
						if ((game.tradeType == "token:2" && resChosen >= 2) || (game.tradeType == "3:1" && resChosen >= 1)) {
							maxedOut = true;
						}
					}
					
				} else {
					game.buffet = [0,0,0,0,0];
					resChosen = 0;
				}
				let bufTxt = []
				for (let u = 0; u < 5; u++) {
					if (game.buffet[u] > 0) {
						bufTxt.push(game.buffet[u]+ " " + typeNames[u]);
					}
				}
				bufTxt.join(", ");//get rid of the comma and space at the end
				
				if (maxedOut) {
					makePanel("Is this what you want?" + "<br>" + bufTxt,[["Yes",1],["No",0]]);
					
				} else {
					if (game.tradeType == "token:2") {
						makePanel("Choose 2 resources" +  "<br>" + bufTxt,[["Crops",10,typeColours[0]],["Cattle",20,typeColours[1]],["Trees",30,typeColours[2]],["Metal",40,typeColours[3]],["Bricks",50,typeColours[4]],["Reset choices",0]]);
					} else if (game.tradeType == "3:1") {
						makePanel("Choose 1 resource" +  "<br>" + bufTxt,[["Crops",10,typeColours[0]],["Cattle",20,typeColours[1]],["Trees",30,typeColours[2]],["Metal",40,typeColours[3]],["Bricks",50,typeColours[4]]]);
					}
					
				}
				break;
			case "5forToken yesno":
				if (inputData) {
					game.buffet = [0,0,0,0,0];
					let buttonArray4 = [["Reset choices",0]];
					for (let y = 0; y < 5; y++) {
						if (players[game.turnNum].resources[y] > 0) {
							buttonArray4.push([players[game.turnNum].resources[y] - game.buffet[y] + "<br>" + typeNames[y],(y + 1)*10,typeColours[y]]);
						}
					}
					game.panel = panels.indexOf("5forToken select");//p34
					makePanel("Choose any 5 resources",buttonArray4);
				} else {
					players[game.turnNum].turnPhase = 0;
					game.panel = panels.indexOf("endTurn yesno");//p34
					makePanel("Your turn is over",[["Ok",0]]);
				}
				
				break;
				
			case "5forToken select":
				let resIdx1 = inputData/10 - 1;
				let maxedOut1 = false;
				let resChosen1 = itemSum(game.buffet);
				if (inputData == 1) {//confirm trade
					for (let o = 0; o < 5; o++) {
						players[game.turnNum].resources[o] -= game.buffet[o];
					}
					players[game.turnNum].tokens++;
					game.buffet = [0,0,0,0,0];
					resChosen1 = 0;
					players[game.turnNum].turnPhase = 0;
					game.panel = panels.indexOf("endTurn yesno");//p34
					makePanel("Your turn is over",[["Ok",0]]);
					break;
				} else if (inputData != 0) {//clicked a resource button
					if (resChosen1 < 5 && players[game.turnNum].resources[resIdx1] - game.buffet[resIdx1] > 0) {
						game.buffet[resIdx1]++;
						resChosen1 = itemSum(game.buffet);
						if (resChosen1 >= 5) {
							maxedOut1 = true;
						}
					}
					
				} else {
					game.buffet = [0,0,0,0,0];
					resChosen1 = 0;
				}
				
				let buttonArray3 = [["Reset choices",0]];
				for (let y = 0; y < 5; y++) {
					if (players[game.turnNum].resources[y] > 0) {
						buttonArray3.push([players[game.turnNum].resources[y] - game.buffet[y] + "<br>" + typeNames[y],(y + 1)*10,typeColours[y]]);
					}
				}
				
				//must repeat this for next part of code
				let bufTxt2 = [];
				let bufTot2 = 0;
				for (let u = 0; u < 5; u++) {
					if (game.buffet[u] > 0) {
						bufTxt2.push(game.buffet[u]+ " " + typeNames[u]);
						bufTot2+=game.buffet[u];
					}
				}
				bufTxt2.join(", ");//get rid of the comma and space at the end
				
				if (maxedOut1) {
					makePanel("Is this what you want to spend?" + "<br>" + bufTxt2,[["Yes",1],["No",0]]);
					
				} else {
					makePanel("Choose any 5 resources" + "<br>" + bufTxt2,buttonArray3);
				}
				break;
//END
			case "endTurn yesno"://p-----------------------------------------------34
				//reset player info relevant to turn
				players[game.turnNum].wonAbattle = false;
				for (let w = 0; w < board.length; w++) {
					for (let z = 0; z < board[w].length; z++) {
						board[w][z].battled = [];//reset battle record of who was fought etc
					}
				}
				game.buildables = [];
				
				if (players[game.turnNum].totalArmies >= 10) {
					game.panel = panels.indexOf("youWon");
					makePanel("Congratulations! <br>" + players[game.turnNum].name + ", you won the game! <br>(by having 10 or more armies)",[["Ok",0]]);
				} else {
					//next turn
					nextTurn();
					players[game.turnNum].turnPhase = 3;
					
					game.panel = panels.indexOf("itsYourTurn ok");//p11
					makePanel(players[game.turnNum].name + ", it's your turn!",[["Ok",0]]);
					box.style.outlineColor = players[game.turnNum].colour;
				}
				drawBoard();
				break;
				
			case "youWon":
				console.log("The game has been won.");
				break;
			default:
				makePanel("could not find that panel",[["Ok",0]]);
				game.panel = 0;
				break;
		}
	}
	
	game.panelName = panels[game.panel];
	updatePlayers();
}

function showLightsToggle(toggle,list = []) {
	if (toggle) {
		game.showLights = !game.showLights;//toggle
		if (game.showLights) {
			game.showList = list;
			drawBoard();
		} else {
			game.showList = [];
			if (game.originTile != "none") {
				drawBoard([game.destTile.coords,game.originTile.coords]);
			} else {
				drawBoard();
			}
		}
		
	} else {//reset showLights
		game.showLights = false;
		game.showList = [];
		
		if (game.originTile != "none") {
			drawBoard([game.destTile.coords,game.originTile.coords]);
		} else {
			drawBoard();
		}
	}
}

function huh() {
	console.log("This button does not do anything");
}

function makePanel(info,buttonArray) {//info should be a string, buttonArray should be a 2d array where each item is [text,data], where text is what will show up on the button, and data is the input data that will be used when calling the switchPanel function
	infoArea.innerHTML = info;//rewrite info text
	let oldBtnCnt = buttonArea.childElementCount;
	for (var i = 0; i < oldBtnCnt; i++) {//get rid of all old buttons
		document.getElementById("button"+i).remove();
	}
	if (buttonArray != 0) {
		for (var i = 0; i < buttonArray.length; i++) {//make all the new buttons
			let btn = document.createElement("button");
			buttonArea.appendChild(btn);
			btn.innerHTML = buttonArray[i][0];
			btn.id = "button"+i;
			btn.setAttribute("onclick","switchPanel(" + buttonArray[i][1] + ")");
			btn.style.margin = size/100 + "px";
			if (buttonArray[i].length >= 3) {//if it has a third item, that means it has a specified border colour
				btn.style.outline = Math.floor(size/250) + "px solid " + buttonArray[i][2];
			}
			btn.style.fontSize = fontSize;
		}
	}
}

function getMousePos(canvas,evt) {//returns the mouse coordinate on the board canvas
	var rect = canvas.getBoundingClientRect();
	return {//clientX and clientY are the user's mouse position on the page window
		x: Math.floor(evt.clientX - rect.left),
		y: Math.floor(evt.clientY - rect.top)
	};
}

function tileMouseChecker(evt,clicked) {//goes through every tile to check if mouse is on it and if mouse clicked it
	if (game.tilesClickable) {//if the tiles aren't clickable, we don't want the game to recognize the tile that was clicked
		let foundTile = false;
		for (var i = 0; i < board.length; i++) {
			for (var j = 0; j < board[i].length; j++) {
				let tile = board[i][j];//instead we could've used one for loop and used each tiles coord properties instead of using i,j
				
				let deltaX = Math.abs(getMousePos(canv,evt).x - tile.x);
				let deltaY = Math.abs(getMousePos(canv,evt).y - tile.y);
				let dist = Math.sqrt(deltaX**2 + deltaY**2);
				
				if (dist < size/10) {//if distance between mouse and centre of the hexagon in question is smaller than the altitude of the hexagon (distance from halfway through a side to the centre at a right angle)
					canv.style="cursor:pointer";
					
					if (clicked) {//if the tile has been clicked
						game.tileClicked = board[i][j];
						board[i][j].clicked = true;
						
						if (game.phase == "setup") {//because there are different panels when this tileMouseChecker will be useful. But only once per pre game phase/and then at least once each turn phases - battling, building, moving and then moving 2
							switchPanel(board[i][j],"setupPrompt tiler");//for the first click it would be on that panel anyways, but when it gets clicked again we don't want it to use the next panel data
						}
						if (game.phase == "playing") {
							switch (players[game.turnNum].turnPhase) {
								case 5://battling
									let verdict = 0;
									for (var q = 0; q < game.playerCount; q++) {
										if (tile.pnts[q] > 0 && q != game.turnNum && !tile.battled.includes(q) && (players[q].totalArmies > 1 || (players[q].totalArmies == 1 && tile.pnts[q] < 3 && players[q].totalRegions > 1))) {//if there are points on it and that point isn't from the player whose turn it is and the point isn't from a player who you've already battled. and it can't be the person's last army but if that person only has one army left, if it's on a tile where it has less than 3 point, i.e. not the tile of their last army, then it's ok
											verdict++;
										}
									}
									if (tile.pnts[game.turnNum] > 0 && (players[game.turnNum].totalArmies > 1 || (players[game.turnNum].totalArmies == 1 && tile.pnts[game.turnNum] < 3 && players[game.turnNum].totalRegions > 1)) && verdict > 0) {
										switchPanel("'ready'","battlePrompt tiler");
										game.panel = panels.indexOf("battlePrompt tiler");
									} else {
										switchPanel("Can't battle there.","battlePrompt tiler");
									}
									break;
								case 6://building
									
									if (game.buildables.map(x => x.toString()).includes(tile.coords.toString())) {
										let res1 = players[game.turnNum].resources;
										if (res1[typeNames.indexOf(tile.type)] >= 2 || (tile.type == "desert" && itemSum(res1) >= 2)) {//if you have 2 or more resources for that region (i.e. you can afford it)
											switchPanel("'ready'","buildPrompt tiler");
											game.panel = panels.indexOf("buildPrompt tiler");
										} else {
											switchPanel("Can't afford to build there.","buildPrompt tiler");
										}
									} else {
										switchPanel("Can't build there.","buildPrompt tiler");
									}
									break;
									
								case 7://moving
									if (game.destTile == "none") {//haven't chosen the dest tile yet
										if (game.buildables.map(x => x.toString()).includes(tile.coords.toString())) {
											let res1 = players[game.turnNum].resources;
											if (res1[typeNames.indexOf(tile.type)] >= 1 || (tile.type == "desert" && itemSum(res1) >= 1)) {//if you have 2 or more resources for that region (i.e. you can afford it)
												switchPanel("'ready'","moveDestinationPrompt tiler");
												game.panel = panels.indexOf("moveDestinationPrompt tiler");
											} else {
												switchPanel("Can't afford to transfer points to there.","moveDestinationPrompt tiler");
											}
										} else {
											switchPanel("That region is an invalid destination","moveDestinationPrompt tiler");
										}
									} else {//origin tile
										//let isConnected = false;
										//code to determine if two tiles are connected via same player points
										//(better to use a function... this might come in handy for bots looking for tiles with similar tile types adjascent)
										if (tile.pnts[game.turnNum] >= 1 && game.tileClicked != game.destTile) {
											if (isConnected(game.destTile,game.tileClicked,"points",game.turnNum)) {
												switchPanel("'ready'","moveOriginPrompt tiler");
												game.panel = panels.indexOf("moveOriginPrompt tiler");
											} else {
												switchPanel("That region isn't connected","moveOriginPrompt tiler");
											}
										} else {
											switchPanel("That region is an invalid origin","moveOriginPrompt tiler");
										}
									}
									
									break;
									
								default:
									break;
							}
						}
						
					}
					foundTile = true;//yes, we found a tile that your mouse is over!
					board[i][j].hovered = true;
					
				} else {
					if (clicked) {//if clicked on a different hexagon
						board[i][j].clicked = false;
					}
					board[i][j].hovered = false;
				}
				if (!foundTile) {
					canv.style="cursor:normal";
					board[i][j].hovered = false;
				}
			}
		}
		
		drawBoard();//update board drawing
		
	} else {
		canv.style="cursor:normal";
	}
}

//this was the most difficult function to code in this program (as of now, which is before I started the bot player code, which I don't even know if I'll end up doing)
function isConnected(dest,origin,connectWith = "points",player = game.turnNum) {//dest and origin should be the tile object of the destination and origin tile. connectWith is what we want to see in common to consider two tiles connected, player number
	let connects = false;//will determine if the return value of isConnected() is true or false. It can only become true in the pointPath function
	let checkedCoords = [];//list of coordinates we already checked (this is important so that we don't go in a eternal recursion loop. Now we can look out for paths we already took). Essentially, if a tile ('s coords) is put in the list, it means it either is having its adjascent tiles checked, or it means it's a tile with no points (respective to player in question)
	if (connectWith == "points") {//the point connector version of looking for connections, as opposed to tile types (hasn't been implemented yet)
		
		checkedCoords.push(origin.coords);//add the starting tile to the list.
		//the following function is a recursive function that keeps on looking through all the tiles on the board until it finds the destination tile. It starts from the origin tile and only spreads around the board via other tiles with points. It can't spread through a tile without points. It also records a list of tiles it already checked so that it doesn't loop back to previously checked tiles, which would cause an endless recursion loop
		function pointPath(end,start) {//loops through all the tile in question's (start) adjascent tiles. If it finds that it has no adjascent tiles that have points and haven't been checked yet, this function does nothing. This "does nothing" is important, so that when function calls itself at a "deadend", it forgets that tile and moves on to the next tile in previous father loop
			
			function hasPathableAdj(thisTile) {//this function returns false if the tile has no valid adjascent tiles to check, aka, a dead end
				for (let i = 0; i < thisTile.adjCoords.length; i++) {
					let curTile = thisTile.adjCoords[i];
					if (tileRef(curTile).pnts[player] > 0 && !checkedCoords.map(x => x.toString()).includes(curTile.toString()) && curTile.toString() != checkedCoords.toString()) {//if we find at least one tile in the list of the tile's adjascents that has player's points, wasn't checked
						return true;
					}
				}
				return false;
			}
			
			if (hasPathableAdj(start)) {//if it has tiles worth checking
				for (let i = 0; i < start.adjCoords.length; i++) {//for each of the adjascent tiles
					let tempTile = start.adjCoords[i];
					
					if (tileRef(tempTile).pnts[player] > 0 && !checkedCoords.map(x => x.toString()).includes(tempTile.toString()) && tempTile.toString() != checkedCoords.toString()) {//if the tile is a tile that we can make a path off of, or it's the destination tile
						if (tempTile.toString() == end.coords.toString()) {//if we found the destination tile
							checkedCoords.push(tempTile);
							connects = true;
							break;
						} else {
							checkedCoords.push(tempTile);
							pointPath(end,tileRef(tempTile));//check this tile's adjascents, in a hope to find the destination tile in its adjascents
						}
					} else {
						if (!checkedCoords.map(x => x.toString()).includes(tempTile.toString()) && tempTile.toString() != checkedCoords.toString()) {
							checkedCoords.push(tempTile);
						}
					}
					
				}
			}
			
		}
	}
	
	pointPath(dest,origin);
	return connects;
}

function tileRef(coords) {
	tile = board[coords[0]][coords[1]];
	return tile;
}

canv.addEventListener(//mouse moving on the board
	"mousemove",
	function(evt){
		tileMouseChecker(evt,false);
	},
	false
);
canv.addEventListener(//mouse clicking on the board
	"click",
	function(evt){
		tileMouseChecker(evt,true);
	},
	false
);

function arrayHasOnly(array,value) {//checks if the array is clean (i.e. all it's items are equal to the specified value)
	for (var i = 0; i < array.length; i++) {
		if (array[i] != value) {
			return false;
		}
	}
	return true;
}

function itemSum(array) {//returns sum of all array items
	let sum = 0;
	for (let i = 0; i < array.length; i++) {
		if (typeof(array[i]) == "number") {
			sum += array[i];
		}
	}
	return sum;
}

function nextTurn(normal = true) {
	if (normal) {
		game.turnNum++;
		if (game.turnNum > game.playerCount-1) {
			game.turnNum = 0;
		}
	} else {//snake order (for setup phase)
		let turns = [];
		for (var i = 0; i < game.playerCount; i++) {
			turns.push(i);
		}//forwards
		for (var i = 0; i < game.playerCount; i++) {
			turns.push(game.playerCount - 1 - i);
		}//backwards
		game.snakeTurn++;
		if (game.snakeTurn > game.playerCount * 2) {
			game.snakeTurn = 0;
		}
		game.turnNum = turns[game.snakeTurn];
		
	}
}

function nameTile(tile) {//this function gets called when player doesn't manually give the tile a name
	let name = "";
	name += peopleNames[random(0,peopleNames.length-1)];
	let tileName = "";
	if (tile.type != "desert") {
		tileName = tileNames[typeNames.indexOf(tile.type)];
	} else {
		tileName = "desert";
	}
	name += "'s " + tileName;
	return name;
}

function pickup(type = "roll", rollNum = game.turnRoll.sum, roller = game.turnNum) {//two types of pickup: "roll" and "turn" (string) ,game.turnRoll (object), the player whose turn it is (number)
	let returnValue = {
		highlights: [],
		profits: [0,0,0,0,0]
	};
	if (type == "roll" && rollNum == 7) {
		players[game.turnNum].tokens++;
	} else {
		for (var i = 0; i < board.length; i++) {
			for (var j = 0; j < board[i].length; j++) {
				if (type == "roll") {
					if (board[i][j].num == rollNum && board[i][j].type != "desert") {
						returnValue.highlights.push(board[i][j].coords);//add this tile to list of productive tiles
						for (var k = 0; k < game.playerCount; k++) {
							let playerPnts = board[i][j].pnts[k];//the amount of player points on the current tile in the loop
							let resIdx = typeNames.indexOf(board[i][j].type);//gets resource index
							if (playerPnts >= 3) {
								players[k].resources[resIdx]++;
								if (playerPnts >= 7) {
									players[k].resources[resIdx]++;
								}
							}
						}
					}
				} else if (type == "turn") {
					if (board[i][j].type != "desert") {
						let playerPnts = board[i][j].pnts[roller];//the amount of player points on the current tile in the loop
						let resIdx = typeNames.indexOf(board[i][j].type);//gets resource index
						let profit = 0;
						if (playerPnts >= 3) {
							profit = 1;
							if (playerPnts >= 7) {
								profit = 2;
							}
						}
						players[roller].resources[resIdx] += profit;
						if (profit > 0) {
							returnValue.highlights.push(board[i][j].coords);
							returnValue.profits[resIdx] += profit;
						}
					}
				}
			}
		}
	}
	return returnValue;//if type is turn, returns list of resource gains, if type is roll, returns list of tile coords that had their num rolled
}

//save and load
document.addEventListener("keydown",function(evt){
	if (evt.shiftKey && evt.keyCode == 83) {//shift S keybind to save
		saveGame();
	}
},false);

document.addEventListener("keydown",function(evt){
	if (evt.shiftKey && evt.keyCode == 76) {//shift L keybind to load
		
		var input = document.createElement('input');//create input field
		input.type = 'file';//the type of input we are looking for is a file

		input.onchange = e => {//when the element recieves a change, i.e. you select a file from the computer
			var file = e.target.files[0];//the event's target (the file you chose) list of various properties 
		   
			var reader = new FileReader();
			reader.readAsText(file,'UTF-8');//tell the reader (instance of FileReader) to read the file you chose

			//when the reader is done reading
			reader.onload = readerEvent => {
				var content = readerEvent.target.result;//this is the read info, i.e. the content
				loadGame(content);//loadgame with the json text that should've been found on the file (otherwise, if the file isn't formatted like it should be, the code will throw an error, as only save files made by saveGame() would make a file that is fully compatible with how loadGame() deals with it
			}
		}

		input.click();
	}
},false);

function download(filename, txt) {//name of file and text value (it'll be JSON format), i.e. the saveInfo
  var e = document.createElement('a');
  e.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(txt));
  e.setAttribute('download', filename);//this makes it so the element is able to download something when clicked or click() is simulated

  e.style.display = 'none';//make it invisible
  document.body.appendChild(e);

  e.click();//simulate the element being clicked to cause it to act

  document.body.removeChild(e);
}

var saveObj = {};
function saveGame() {
	let buttonList = document.getElementById("buttons").children;
	let list = [];
	for (var i = 0; i < buttonList.length; i++) {//make all the new buttons
		let btn = buttonList[i];
		list.push([
			buttonList[i].innerHTML,
			JSON.parse(buttonList[i].onclick.toString().slice(38,buttonList[i].onclick.toString().length-3)),
			buttonList[i].style.outlineColor
		]);
	}
		
	saveObj = {
		game: game,
		players: players,
		board: board,
		info: document.getElementById("info").innerHTML,
		box: document.getElementById("turnBox").style.outlineColor,
		buttons: list
	}
	
	let saveData = JSON.stringify(saveObj);
	let name = prompt("Name the save file?");
	if (name !== null) {
		if (name == "") {
			name = "catanSave " + Date().slice(0,24);
		}
		download(name + ".saveFile",saveData);
	}
	console.log("Saved game");
}

function loadGame(file) {
	let saveInfo = JSON.parse(file);
	
	let oldCount = game.playerCount;
	game = saveInfo.game;
	let newCount = game.playerCount;
	game.playerCount = oldCount;
	
	players = saveInfo.players;
	board = saveInfo.board;
	document.getElementById("turnBox").style.outlineColor = saveInfo.box;
	
	infoArea.innerHTML = saveInfo.info;//rewrite info text
	let buttonList = saveInfo.buttons;
	let oldBtnCnt = buttonArea.childElementCount;
	for (var i = 0; i < oldBtnCnt; i++) {//get rid of all old buttons
		document.getElementById("button"+i).remove();
	}
	
	for (var i = 0; i < buttonList.length; i++) {//make all the new buttons
		let btn = document.createElement("button");
		buttonArea.appendChild(btn);
		btn.innerHTML = saveInfo.buttons[i][0]
		btn.id = "button"+i;
		btn.setAttribute("onclick","switchPanel(" + saveInfo.buttons[i][1] + ")");
		btn.style.margin = size/100 + "px";
		if (saveInfo.buttons[i].length >= 3) {//if it has a third item, that means it has a specified border colour
			btn.style.outline = Math.floor(size/250) + "px solid " + saveInfo.buttons[i][2];
			btn.style.outlineColor = saveInfo.buttons[i][2];
		}
		btn.style.fontSize = fontSize;
	}
	
	drawBoard();
	updatePlayers(newCount);
	
	console.log("Loaded game");
}
