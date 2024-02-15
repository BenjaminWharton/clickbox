

var LMDown = false;
var RMDown = false;
var size = 5;
var GameButtons = [];
var CycleButtons = [];
var LastTouchedButton = null;
var PressSelected = false;
var LockSelected = false;
const normalColor = "#CFD7D7";
const lockedColor = "#A0A5A5";
const clickedColor = "#22c976";
const doubledColor = "#00FFFF";
const tripledColor = "#FF00FF";
const modifierColor0 = "#FFFF40";
const modifierColor1 = "#0000";
const modifierColor2 = "#FF8040";
const modifierColorN1 = "#80A0FF";
const textColorPositive = "#404040";
const textColorZero = "#0000";
const textColorNegative = "#A80000";
class GameButton {
	constructor(x, y, Facing = "") {
        let grid = document.getElementById("grid-container");
		let btn = document.createElement("button");
		this.btn = btn;
        this.btn.offsetx = x;
        this.btn.offsety = y;
		this.btn.innerHTML = "0";
		this.btn.classList.add("btn");
   	    this.btn.style.position = "absolute";
        this.btn.style.transform = "translate(" + x + "px,"+ y + "px)";
	    this.btn.clicks = 0;
	    this.btn.maxClicks = 1;
	    this.btn.locked = false;
	    this.btn.walls = "";
        this.btn.cycles = "";
		this.btn.facing = Facing;
        this.btn.factor = 1;
        this.btn.affectedButtons = [];    // stores which buttons this button will affect when pressed
        this.btn.counterparts = [];       // stores which cycle buttons this button connects with
        this.btn.style.color = textColorZero;
		this.btn.btnWall = "images/Wall.png";
		
		let svgBg = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
   	    svgBg.style.position = "absolute";
		svgBg.style.transform = "translate(" + x + "px," + y + "px)";
		svgBg.classList.add("svg");
		this.btn.svgBg = svgBg;
		
		let background = document.createElementNS("http://www.w3.org/2000/svg", 'polygon');
		background.classList.add("background");
        background.onmousedown = function(){BtnClick(btn)};
		background.onmouseenter = function(){BtnMouseEnter(btn)};
        background.onmouseleave = function(){BtnMouseLeave(btn)};
		background.ontouchstart = function(){BtnTouch(btn)};
//		background.ontouchmove = function(){TouchMove(btn)};
//		background.ontouchcancel = function(){TouchCancel(btn)};
		this.btn.background = background;
		this.createHitbox(svgBg, background);

		let svgL = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
   	    svgL.style.position = "absolute";
        svgL.style.transform = "translate(" + x + "px," + y + "px)";
		svgL.classList.add("svg");
		svgL.setAttribute("viewBox", "-15 -15 90 90");
		this.btn.svgL = svgL;

		let lockVis = document.createElementNS("http://www.w3.org/2000/svg", 'polygon');
		lockVis.classList = "lock-vis";
        this.btn.lockVis = lockVis;
		this.createHitbox(svgL, lockVis);

		let svgM = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
   	    svgM.style.position = "absolute";
        svgM.style.transform = "translate(" + x + "px," + y + "px)";
		svgM.classList.add("svg");
		this.btn.svgM = svgM;

		let modifier = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
		modifier.classList = "modifier";
        this.btn.modifier = modifier;
		this.createModifier(modifier);
		

		grid.appendChild(svgBg);
		grid.appendChild(svgL);
		svgBg.appendChild(background);
		svgL.appendChild(lockVis);
		grid.appendChild(svgM);
		svgM.appendChild(modifier);
		grid.appendChild(this.btn);
	}

    createHitbox(svg, hitbox) {
	    let point = svg.createSVGPoint();
	    point.x = 1;
	    point.y = 1;
	    hitbox.points.appendItem(point);
	    point = svg.createSVGPoint();
	    point.x = 59;
	    point.y = 1;
	    hitbox.points.appendItem(point);
	    point = svg.createSVGPoint();
	    point.x = 59;
	    point.y = 59;
	    hitbox.points.appendItem(point);
	    point = svg.createSVGPoint();
	    point.x = 1;
	    point.y = 59;
	    hitbox.points.appendItem(point);
	    point = svg.createSVGPoint();				
	}

    createModifier(modifier) {
        modifier.setAttribute("r","15px");
        modifier.setAttribute("cx","30px");
        modifier.setAttribute("cy","30px");		
	}

    defineArea() {
	    let midBtn = this.btn
        let n = 65;
        let e = 65;
        let s = 65;
        let w = 65;
		if (midBtn.walls.includes("n")) { // the presence of a wall will limit the area on that side
		    n = 5;
		}
		if (midBtn.walls.includes("e")) {
		    e = 5;
		}
		if (midBtn.walls.includes("s")) {
		    s = 5;
		}
		if (midBtn.walls.includes("w")) {
		    w = 5;
		}
	    for (let i = 0; i < GameButtons.length; i++) {
		    let btn = GameButtons[i].btn;
		    if (btn.offsetx < midBtn.offsetx + e &&
		        btn.offsetx > midBtn.offsetx - w &&
			    btn.offsety < midBtn.offsety + s &&
			    btn.offsety > midBtn.offsety - n) {
              midBtn.affectedButtons.push(btn);
		    }
		  }
		for (let c = 0; c < CycleButtons.length; c++) {
			let cbtn = CycleButtons[c].btn;
		    if (cbtn.offsetx < midBtn.offsetx + e &&
		        cbtn.offsetx > midBtn.offsetx - w &&
			    cbtn.offsety < midBtn.offsety + s &&
			    cbtn.offsety > midBtn.offsety - n) {
              midBtn.affectedButtons.push(cbtn.counterpart.btn);
		    }		
	    }		
	}
	  
    changeFactor(Factor) {
    	let btn = this.btn;
      if (Factor == -1) {
        btn.factor = -1;
        btn.modifier.style.fill = modifierColorN1;
      } else if (Factor == 0) {
        btn.factor = 0;
        btn.modifier.style.fill = modifierColor0;
      } else if (Factor == 2) {
        btn.factor = 2;
        btn.modifier.style.fill = modifierColor2;
      } else {
        btn.factor = 1;
        btn.modifier.style.fill = modifierColor1;
      }
    }

    addWall (String) {
    	let btn = this.btn;
      if (String.includes("n") == true) {
        if (btn.walls.includes("n") == false) {
          let nWall = document.createElement('img');
    	  btn.nWall = nWall;
          nWall.classList.add("wall");
          document.getElementById("grid-container").appendChild(nWall);
          nWall.style.position = "absolute"
          nWall.style.transform = "translate(" + btn.offsetx + "px,"+ btn.offsety + "px)";
    	  nWall.src = btn.btnWall;
          btn.walls = btn.walls + "n";
        }
      }
      if (String.includes("s") == true) {
        if (btn.walls.includes("s") == false) {
          let sWall = document.createElement('img');
    	  btn.sWall = sWall;
          sWall.classList.add("wall");
          document.getElementById("grid-container").appendChild(sWall);
          sWall.style.position = "absolute"
          sWall.style.transform = "translate(" + btn.offsetx + "px,"+ btn.offsety + "px)" + "rotate(180deg)";
    	  sWall.src = btn.btnWall;
          btn.walls = btn.walls + "s";
    	}	
      }
      if (String.includes("w") == true) {
        if (btn.walls.includes("w") == false) {
          let wWall = document.createElement('img');
    	  btn.wWall = wWall;
          wWall.classList.add("wall");
          document.getElementById("grid-container").appendChild(wWall);
          wWall.style.position = "absolute"
          wWall.style.transform = "translate(" + btn.offsetx + "px,"+ btn.offsety + "px)" + "rotate(270deg)";
    	  wWall.src = btn.btnWall;
          btn.walls = btn.walls + "w";
        }
      }
      if (String.includes("e") == true) {
        if (btn.walls.includes("e") == false) {
          let eWall = document.createElement('img');
    	  btn.eWall = eWall;
          eWall.classList.add("wall");
          document.getElementById("grid-container").appendChild(eWall);
          eWall.style.position = "absolute"
          eWall.style.transform = "translate(" + btn.offsetx + "px,"+ btn.offsety + "px)" + "rotate(90deg)";
    	  eWall.src = btn.btnWall;
          btn.walls = btn.walls + "e";
        }
      }
    }

      randomWall(none = false) {
	      if (none == false) {
		      let rand = Math.trunc(Math.random()*4);		  
		  } else {
		      let rand = Math.trunc(Math.random()*5);			  
		  }

		  if (rand == 0) {
		    return "n";
		  } else if (rand == 1) {
		    return "e";
		  } else if (rand == 2) {
		    return "s";
		  } else if (rand == 3) {
		    return "w";
		  } else {
		    return "";
		  }
	  }	 

      addCycle (String) {
		  let btn = this.btn
		  let str = btn.cycles;
		  let idNum = null;
		  for (let i = 0; i < GameButtons.length; i++) {
			  if (GameButtons[i] === this) {
				  idNum = i;
				  break;
			  }
		  }
	    if (String.includes("n") == true &&
		    btn.cycles.includes("n") == false) {
		    let nCycle = new GameButton(btn.offsetx, btn.offsety - 60);
		    nCycle.btn.background.classList.add("cycle");
            //nCycle.btn.modifier.classList.add("cycle");
			nCycle.btn.svgBg.classList.add("cycle");
			nCycle.btn.counterpart = GameButtons[idNum + size*size - size];               // used to store which regular button a cycle button connects with      
			GameButtons[idNum + size*size - size].btn.counterparts.push(nCycle);          // used to store which cycle buttons a regular button connects with
			CycleButtons.push(nCycle);
		    btn.cycles = btn.cycles + "n";
		}	   
	    if (String.includes("s") == true &&
		    btn.cycles.includes("s") == false) {
			let sCycle = new GameButton(btn.offsetx, btn.offsety - 60*(-1));
			sCycle.btn.background.classList.add("cycle");
            //sCycle.btn.modifier.classList.add("cycle");
			sCycle.btn.svgBg.classList.add("cycle");
            sCycle.btn.counterpart = GameButtons[idNum - size*size + size];
			GameButtons[idNum - size*size + size].btn.counterparts.push(sCycle);
			CycleButtons.push(sCycle);
			btn.cycles = btn.cycles + "s";
		}	
	    if (String.includes("w") == true &&
		    btn.cycles.includes("w") == false ) {
			let wCycle = new GameButton(btn.offsetx - 60, btn.offsety);
			wCycle.btn.background.classList.add("cycle");
            //wCycle.btn.modifier.classList.add("cycle");
			wCycle.btn.svgBg.classList.add("cycle");
            wCycle.btn.counterpart = GameButtons[idNum + size - 1];
			GameButtons[idNum + size - 1].btn.counterparts.push(wCycle);
			CycleButtons.push(wCycle);
			btn.cycles = btn.cycles + "w";
		}	
	    if (String.includes("e") == true &&
		    btn.cycles.includes("e") == false) {
			let eCycle = new GameButton(btn.offsetx - 60*(-1), btn.offsety);
			eCycle.btn.background.classList.add("cycle");
            //eCycle.btn.modifier.classList.add("cycle");
			eCycle.btn.svgBg.classList.add("cycle");
            eCycle.btn.counterpart = GameButtons[idNum - size + 1];
			GameButtons[idNum - size + 1].btn.counterparts.push(eCycle);
			CycleButtons.push(eCycle);
			btn.cycles = btn.cycles + "e";			  
		}		
	    if (btn.cycles.includes("n") == true &&
		    btn.cycles.includes("w") == true) {
		    if (str.includes("n") == false ||
		        str.includes("w") == false) {
			    let nwCycle = new GameButton(btn.offsetx - 60, btn.offsety - 60);
			    nwCycle.btn.background.classList.add("cycle");
                //nwCycle.btn.modifier.classList.add("cycle");
			    nwCycle.btn.svgBg.classList.add("cycle");
                nwCycle.btn.counterpart = GameButtons[size*size - 1];
			    GameButtons[size*size - 1].btn.counterparts.push(nwCycle);
			    CycleButtons.push(nwCycle);	
		    }
		}
	    if (btn.cycles.includes("n") == true &&
		    btn.cycles.includes("e") == true) {
		    if (str.includes("n") == false ||
		        str.includes("e") == false) {
			    let neCycle = new GameButton(btn.offsetx - 60*(-1), btn.offsety - 60);
			    neCycle.btn.background.classList.add("cycle");
                //neCycle.btn.modifier.classList.add("cycle");
			    neCycle.btn.svgBg.classList.add("cycle");
                neCycle.btn.counterpart = GameButtons[size*size - size];
			    GameButtons[size*size - size].btn.counterparts.push(neCycle);
			    CycleButtons.push(neCycle);	
		    }
		}
	    if (btn.cycles.includes("s") == true &&
		    btn.cycles.includes("w") == true) {
		    if (str.includes("s") == false ||
		        str.includes("w") == false) {
			    let swCycle = new GameButton(btn.offsetx - 60, btn.offsety - 60*(-1));
			    swCycle.btn.background.classList.add("cycle");
                //swCycle.btn.modifier.classList.add("cycle");
			    swCycle.btn.svgBg.classList.add("cycle");
                swCycle.btn.counterpart = GameButtons[size - 1];
			    GameButtons[size - 1].btn.counterparts.push(swCycle);
			    CycleButtons.push(swCycle);	
		    }
		}
	    if (btn.cycles.includes("s") == true &&
		    btn.cycles.includes("e") == true) {
		    if (str.includes("s") == false ||
		        str.includes("e") == false) {
			    let seCycle = new GameButton(btn.offsetx - 60*(-1), btn.offsety - 60*(-1));
			    seCycle.btn.background.classList.add("cycle");
                //seCycle.btn.modifier.classList.add("cycle");
			    seCycle.btn.svgBg.classList.add("cycle");
                seCycle.btn.counterpart = GameButtons[0];
			    GameButtons[0].btn.counterparts.push(seCycle);
			    CycleButtons.push(seCycle);	
		    }
		}
	  }	  
	
}

    
function MouseDown(){
  if (event.button == 0) {
    LMDown = true;
  }
  if (event.button == 2) {
    RMDown= true;
  }
}
	  
function MouseUp(){
  if (event.button == 0) {
    LMDown = false;
  }
  if (event.button == 2) {
    RMDown= false;
  }
}
	  
function MouseExit(){
  LMDown = false;
  RMDown= false;
}
	
function DestroyGrid (){
  if (document.body.contains(document.getElementById("grid-container")) == true){
    document.getElementById("grid-container").remove();
  }
  GameButtons = [];
  CycleButtons = [];
}		    	

function VictoryCheck() {
  let victory = true;
  for (i = 0; i < GameButtons.length; i++) {
    if (GameButtons[i].btn.innerHTML != 0) {
      victory = false;
    }
  }
  if (victory == true) {
    document.getElementById("new-level").innerHTML = "Victory!";
  }
}

	  
function CycleEdges (String) {
  if (String.includes("n") == true) {
    for (let i = 0; i < size; i++) {	  
      GameButtons[i].addCycle("n");                                               // north
    }
  }
  if (String.includes("s") == true) {
    for (let i = size*size - size; i < size*size; i++) {
      GameButtons[i].addCycle("s");                                              // south
    }  
  }
  if (String.includes("w") == true) {
    for (let i = 0; i < size*size; i = i + size) {
      GameButtons[i].addCycle("w");                                               // west
    } 
  }
  if (String.includes("e") == true) {
    for (let i = size - 1; i < size*size; i = i + size) {
      GameButtons[i].addCycle("e");                                              // east
    }	  
  }
}

function ModifyButton(btn,Amount){
  btn.innerHTML = parseInt(btn.innerHTML) + Amount;
  if (btn.innerHTML == 0){
    btn.style.color = textColorZero;
  }
  if (parseInt(btn.innerHTML) > 0) {
    btn.style.color = textColorPositive;
  }
  if (parseInt(btn.innerHTML) < 0){
    btn.style.color = textColorNegative;
  } 
  for (let i = 0; i < btn.counterparts.length; i++) {
    let cbtn = btn.counterparts[i];
    cbtn.btn.innerHTML = btn.innerHTML;
    cbtn.btn.background.style.fill = btn.background.style.fill;
	cbtn.btn.lockVis.style.fill = btn.lockVis.style.fill;
	cbtn.btn.style.color = btn.style.color;
  }
}


function InitializeButtonGroups()  {
    for (let i = 0; i < GameButtons.length; i++) {
        GameButtons[i].defineArea();
	}
}


	  function ModifyButtonGroup (btn, Amount)  {
        for (let i = 0; i < btn.affectedButtons.length; i++) {
		  if (btn.affectedButtons[i] == btn) {
		    ModifyButton (btn.affectedButtons[i], Amount*btn.factor);
		  } else {
		    ModifyButton (btn.affectedButtons[i], Amount);
		  }
		}
	  }

      function BtnClick(clickID) {
	    if (event.button == 0){
          BtnLeftClick(clickID);
		} else if (event.button == 2){
		  BtnRightClick(clickID);
		}
      }

      function BtnTouch(btn) {
		  event.preventDefault();
		  let wasSelected = false;
		  if (btn.background.classList.contains("selected")) {
			  wasSelected = true;
		  }
		  if (LastTouchedButton != null) {
              BtnMouseLeave(LastTouchedButton);	
              LastTouchedButton.background.classList.remove("selected");
		  }
		  BtnMouseEnter(btn);
		  if (PressSelected == true) {
              BtnLeftClick(btn);
              btn.background.classList.add("selected");			  
		  } else if (LockSelected == true) {
			  BtnRightClick(btn);
			  btn.background.classList.add("selected");
		  }  else if (wasSelected == false) {
			  btn.background.classList.add("selected");
		  } else {
			  btn.background.classList.remove("selected");
			  BtnMouseLeave(btn);
		  }
		  LastTouchedButton = btn;			  
      }
	  
	  function TouchMove(btn) {
		  event.preventDefault();
//		  console.log(btn);
//		  TouchCancel(btn);
//		  btn.background.classList.add("disable-touch");
		  
	  }
	  
	  function TouchEnd() {
//		  
///////////////////////////////////////////////////////////////////////////////////////////  
	  }
	 
	  function TouchCancel(btn) {
//		  console.log(1);
///////////////////////////////////////////////////////////////////////////////////////////
	  }

function PressTouch(btn) {
//	event.preventDefault();
    LockSelected = false;
	document.getElementById("lock").classList.remove("bottom-selected");
	if (PressSelected == false) {
	  PressSelected = true;
	  btn.classList.add("bottom-selected");
	} else {
		PressSelected = false;
	    btn.classList.remove("bottom-selected");
	}	
}

function LockTouch(btn) {
//	event.preventDefault();
    PressSelected = false;
	document.getElementById("press").classList.remove("bottom-selected");
	if (LockSelected == false) {
	  LockSelected = true;
	  btn.classList.add("bottom-selected");
	} else {
		LockSelected = false;
	    btn.classList.remove("bottom-selected");
	}	
}

      function BtnLeftClick(btn)  {
		  let value = 0;
		if (btn.locked == false) {
		  btn.clicks = btn.clicks + 1;
		  if (btn.clicks > btn.maxClicks) {
		    value = btn.clicks - 1;
			btn.clicks = 0;		
		  } else {
			  value = -1;
		  }
		  if (btn.clicks == 0) {
			  btn.background.style.fill = normalColor;
			  btn.lockVis.style.fill = normalColor;
		  } else if (btn.clicks == 1) {
			  btn.background.style.fill = clickedColor;
			  btn.lockVis.style.fill = clickedColor;
		  } else if (btn.clicks == 2) {
			  btn.background.style.fill = doubledColor;
			  btn.lockVis.style.fill = doubledColor;
		  } else if (btn.clicks >= 3) {
			  btn.background.style.fill = tripledColor;
			  btn.lockVis.style.fill = tripledColor;
		  }
          ModifyButtonGroup(btn, value);
		}  
		VictoryCheck();
	  }


	  function BtnRightClick(btn) {
	    let img = normalColor;
		
		if (btn.locked == false) {
		    btn.locked = true;
			img = lockedColor;
		} else {
			btn.locked = false;
		}		

	    if (btn.clicks >= btn.maxClicks) {
			ModifyButtonGroup(btn, btn.clicks)
			btn.clicks = 0;
		} else if (btn.clicks > 0 &&
		           btn.locked == false) {
			img = btn.background.style.fill;
		}	

        if (btn.clicks == 0 &&
		    btn.locked == true) {
		    btn.background.style.fill = lockedColor;
		} else if (btn.clicks == 0 &&
		           btn.locked == false) {
			btn.background.style.fill = normalColor;
		}
		btn.lockVis.style.fill = img;

		for (let i = 0; i < btn.counterparts.length; i++) {
			btn.counterparts[i].btn.lockVis.style.fill = btn.lockVis.style.fill;
		    btn.counterparts[i].btn.background.style.fill = btn.background.style.fill;
		}		
      }


function BtnMouseEnter(btn)  {
	btn.background.classList.add("background-selected");
	btn.modifier.classList.add("background-selected");
	if (LMDown == true) {
		BtnLeftClick(btn);
	} else if (RMDown == true) {
		BtnRightClick(btn);
	}
	for (let i = 0; i < btn.affectedButtons.length; i++) {
		btn.affectedButtons[i].classList.add("btn-group");
	}
}

function BtnMouseLeave(btn)  {
	btn.background.classList.remove("background-selected");
	btn.modifier.classList.remove("background-selected");
	for (let i = 0; i < btn.affectedButtons.length; i++) {
		btn.affectedButtons[i].classList.remove("btn-group");
	}	  
}

function RandomButtonFactor() {
    let rand = Math.trunc(Math.random()*3);
    if (rand == 0) {
        return 0;
    } else if (rand == 1) {
        return 2;
    } else if (rand == 2) {
        return -1;
    } else {
        return 1
    }
}

      function GenerateRandomClicks(Clicks) {
	    let clicks = Clicks;
        while (clicks > 0){
		  btn = GameButtons[Math.floor(Math.random() * GameButtons.length)].btn;
	      if (btn.clicks < btn.maxClicks &&
		      btn.locked == false) {
            ModifyButtonGroup (btn, 1);
            btn.clicks = btn.clicks + 1;  
		    clicks--;
          }		  
        }
	    for (let i = 0; i < GameButtons.length; i++){
	      GameButtons[i].btn.clicks = 0;
		  GameButtons[i].btn.locked = false;
        }
		for (let i = 0; i < CycleButtons.length; i++) {
		  CycleButtons[i].clicks = 0;
		  CycleButtons[i].locked = false;
		}
	  }


      function GenerateLevel(Clicks) {
	    InitializeButtonGroups();
        GenerateRandomClicks(Clicks);
	  }

	  function GenerateMediumLevel (Clicks) {
	    let clicks = 0;
		let i = 0;
		let rand = 0;
		let rand2 = 0;
	    InitializeButtonGroups();
		if (size%3 == 2){
		  rand2 = Math.trunc(Math.random()*2);
		  while (i < size/3 - 1){
		    rand = parseInt(Math.trunc(Math.random()*size) + 1);
			if (rand2 == 0){
			  if (GameButtons[rand - 1].btn.clicks < GameButtons[rand - 1].btn.maxClicks &&
			      GameButtons[rand - 1].btn.locked == false) {
			    for (let j = 0; j < size; j++){
				  if(j%3 != 2){
				    GameButtons[j*size + rand - 1].btn.locked = true;
				  }
				  if (j%3 == 0) {
				    ModifyButtonGroup(GameButtons[j*size + rand - 1].btn, 1);
					GameButtons[j*size + rand - 1].btn.clicks = GameButtons[j*size + rand - 1].btn.clicks + 1;
					clicks++				    
				  }
				}
			    i++;
			  }
			}
			else{
			  if (GameButtons[rand*size - 1].btn.clicks < GameButtons[rand*size - 1].btn.maxClicks &&
			      GameButtons[rand*size - 1].btn.locked == false) {
			    for (let j = 0; j < size; j++){
				  if(j%3 != 2){
				    GameButtons[rand*size - j - 1].btn.locked = true;
				  }
				  if(j%3 == 0) {
				    ModifyButtonGroup(GameButtons[rand*size - j - 1].btn, 1);
					GameButtons[rand*size - j - 1].btn.clicks = GameButtons[rand*size - j - 1].btn.clicks + 1;
					clicks++
				  }
				}
			    i++;
			  }						
			}
		  }
		}
        GenerateRandomClicks (Clicks - clicks);
	  }
	  

	  function GenerateHardLevel (Clicks) {
	    let clicks = 0;
		let i = 0;
		let rand = 0;
		let rand2 = 0;
	    InitializeButtonGroups();
		if (size%3 == 2){
		  rand2 = Math.trunc(Math.random()*2);
		  while (i < size/2 - 1){
		    rand = parseInt(Math.trunc(Math.random()*size) + 1);
			if (rand2 == 0){
			  if (GameButtons[rand - 1].btn.clicks < GameButtons[rand - 1].btn.maxClicks &&
			      GameButtons[rand - 1].btn.locked == false) {
			    for (let j = 0; j < size; j++){
				  if(j%3 != 2){
				    GameButtons[j*size + rand - 1].btn.locked = true;
				  }
				  if (j%3 == 0) {
				    ModifyButtonGroup(GameButtons[j*size + rand - 1].btn, 1);
					GameButtons[j*size + rand - 1].btn.clicks = GameButtons[j*size + rand - 1].btn.clicks + 1;
					rand2 = 1;
					clicks++				    
				  }
				}
			    i++;
			  }
			}
			else{
			  if (GameButtons[rand*size - 1].btn.clicks < GameButtons[rand*size - 1].btn.maxClicks &&
			      GameButtons[rand*size - 1].btn.locked == false) {
			    for (let j = 0; j < size; j++){
				  if(j%3 != 2){
				    GameButtons[rand*size - j - 1].btn.locked = true;
				  }
				  if(j%3 == 0) {
				    ModifyButtonGroup(GameButtons[rand*size - j - 1].btn, 1);
					GameButtons[rand*size - j - 1].btn.clicks = GameButtons[rand*size - j - 1].btn.clicks + 1;
					rand2 = 0;
					clicks++
				  }
				}
			    i++;
			  }						
			}
		  }
		}
        GenerateRandomClicks (Clicks - clicks);
	  }
	  

      function GenerateLevelNum (Level) {
	    if (Level < 0) {
		  Level = Level *(-1)
		}
	    if (Level == 1) {                              //////////////////////////////////////////////////////////// Level 1
		  GenerateLevel (size*size/5);             //////////////////////////////////////////////////////////// Level 1
		} else if (Level == 2) {                       //////////////////////////////////////////////////////////// Level 2
		  GenerateMediumLevel (size*size/3);           //////////////////////////////////////////////////////////// Level 2
		} else if (Level == 3) {                       //////////////////////////////////////////////////////////// Level 3
		  GenerateHardLevel (size*size/2);             //////////////////////////////////////////////////////////// Level 3
		} else if (Level == 4) {                       //////////////////////////////////////////////////////////// Level 4
		    let type = RandomButtonFactor();
            for (let i = 0; i < size; i++) {                                         // top
		      GameButtons[i].changeFactor(type);
		    }
            for (let i = 0; i < size*size; i = i + size) {                           // left
		      GameButtons[i].changeFactor(type);
            }   
            for (let i = size*size - size; i < size*size; i++) {                    // bottom
		      GameButtons[i].changeFactor(type);
		    }
            for (let i = size - 1; i < size*size; i = i + size) {                    // right
		      GameButtons[i].changeFactor(type);
			}
		    GenerateLevel (size*size/2);		////////////////////////////////////////////////////////////// Level 4	
		} else if (Level == 5) {   		            ////////////////////////////////////////////////////////////// Level 5
		  let type = RandomButtonFactor();
		  for (let x = 0; x < parseInt(size/2 - 1); x = x + 3) {
            for (let y = size*(x+2); y < size*(x+3); y++) {                              // top
		      GameButtons[y].changeFactor(type);
		    }
	  	  }
		  for (let x = 0; x < parseInt(size/2 - 1); x = x + 3) {
            for (let y = 2 + x; y < size*size; y = y + size) {                            // left
		      GameButtons[y].changeFactor(type);
            }
		  }
		  for (let x = 0; x < parseInt(size/2 - 1); x = x + 3) {
            for (let y = size*size - size*(x+3); y < size*size - size*(x+2); y++) {       // bottom
		      GameButtons[y].changeFactor(type);
		    }
		  }
		  for (let x = 0; x < parseInt(size/2) - 1; x = x + 3) {
            for (let y = size - x - 3; y < size*size; y = y + size) {                      // right
		      GameButtons[y].changeFactor(type);
		    }
		  }
		  GenerateHardLevel (size*size/2);		  
	    } else if (Level == 6)   {              /////////////////////////////////////////////////////////////////// Level 5
		  let type = RandomButtonFactor();      /////////////////////////////////////////////////////////////////// Level 6
		  for (let i = 0; i < GameButtons.length; i++) {
		    GameButtons[i].changeFactor(type);		  
		  }
		  GenerateLevel(size*size/2);       //////////////////////////////////////////////////////////////////// Level 6
		} else if (Level == 7) {                 /////////////////////////////////////////////////////////////////// Level 7
		  let type = RandomButtonFactor();
		  for (let x = 0; x < size; x = x + 2) {
            for (let y = size*x; y < size*(x+1); y++) {
		      GameButtons[y].changeFactor(type);
		    }
	  	  }	
          GenerateLevel (size*size/2);		/////////////////////////////////////////////////////////////////// Level 7
		} else if (Level == 8) {                /////////////////////////////////////////////////////////////////// Level 8
		  let type = RandomButtonFactor();
		  let bool = 1;
		  for (let x = 0; x < size; x++) {
		    for (let y = 0; y < size; y++) {
		      if (size%2 == 1){
		        if ((x+y*size)%2 == 1) {
		          GameButtons[x + y*size].changeFactor(type);
			    }
			  } else {
			    if (y%2 == 0) {
		          if (x%2 == 1) {
		            GameButtons[x + y*size].changeFactor(type);			  
			      }			
				} else {
		          if (x%2 == 0) {
		            GameButtons[x + y*size].changeFactor(type);			  
			      }					  
				}
			  }			
			}
			y = 0;
		  }          
		  GenerateLevel(size*size/2);	 ///////////////////////////////////////////////////////////////////// Level 8	  
		} else if (Level == 9) {             ///////////////////////////////////////////////////////////////////// Level 9
		  for (let i = 0; i < GameButtons.length; i++) {
		    let type = RandomButtonFactor();
			let rand = Math.trunc(Math.random()*5);
			if (rand == 4) {
			  type = 1;
			}
		    GameButtons[i].changeFactor(type);		  
		  }          		
		  GenerateLevel(size*size/2);	 ///////////////////////////////////////////////////////////////////// Level 9
		} else if (Level == 10) {             ///////////////////////////////////////////////////////////////////// Level 10   		
		  for (let x = 1; x < parseInt(size/2); x = x + 3) {
            for (let y = size*(x+1); y < size*(x+2); y++) {                             // top
			  GameButtons[y].addWall("s");
		    }
	  	  }		
		  for (let x = 1; x < parseInt(size/2); x = x + 3) {
            for (let y = 1 + x; y <= size*size; y = y + size) {                            // left
			  GameButtons[y].addWall("e");
            }
		  }	
		  for (let x = 1; x < parseInt(size/2); x = x + 3) {
            for (let y = size*size - size*(x+2); y < size*size - size*(x+1); y++) {     // bottom
			  GameButtons[y].addWall("n");
		    }
		  }	
		  for (let x = 1; x < parseInt(size/2); x = x + 3) {
            for (let y = size - (x+2); y <= size*size; y = y + size) {                      // right
			  GameButtons[y].addWall("w");
		    }
		  }			  
		  GenerateHardLevel(size*size/2);	 ///////////////////////////////////////////////////////////////////// Level 10	
		} else if (Level == 11) {             ///////////////////////////////////////////////////////////////////// Level 11 		
		  let i = Math.trunc(Math.random()*4);
		  for (let x = 0; x < GameButtons.length; x++) {
            i++
			if (i == 1){
			  GameButtons[x].addWall("n");
			} else if (i == 2) {
			  GameButtons[x].addWall("e");
			} else if (i == 3) {
			  GameButtons[x].addWall("s");
			} else {
			  GameButtons[x].addWall("w");
              i = 0;			  
			}
	  	  }			  
		  GenerateLevel(size*size/2);	 ///////////////////////////////////////////////////////////////////// Level 11
		} else if (Level == 12) {             ///////////////////////////////////////////////////////////////////// Level 12
		  for (let i = 0; i < GameButtons.length; i++) {
		    let type = RandomButtonFactor();
			let rand = Math.trunc(Math.random()*5);
			if (rand == 4) {
			  type = 1;
			}
		    GameButtons[i].changeFactor(type);
		  }
		  for (let i = 0; i < GameButtons.length; i++) {
            let rand = Math.trunc(Math.random()*5);
			if (rand == 1){
			  GameButtons[i].addWall("n");
			} else if (rand == 2) {
			  GameButtons[i].addWall("e");
			} else if (rand == 3) {
			  GameButtons[i].addWall("s");
			} else if (rand == 4) {
			  GameButtons[i].addWall("w");			  
			}
	  	  }			  
		  GenerateLevel(size*size/2);	 ///////////////////////////////////////////////////////////////////// Level 12
		} else if (Level == 13) {             //////////////////////////////////////////////////////////////////// Level 13
          CycleEdges ("nsew");
		  for (let i = Math.trunc(size/2) - 1; i < size*size; i = i + size) {
		    GameButtons[i].addWall("e");
			GameButtons[i + 1].addWall("w");
		  }
		  for (let i = Math.trunc(size/2) * size - size; i < Math.trunc(size/2)*size; i++) {
		    GameButtons[i].addWall("s");
			GameButtons[i + size].addWall("n");
		  }
		  GenerateLevel(size*size/2);	 ///////////////////////////////////////////////////////////////////// Level 13
		} else if (Level == 14) {             //////////////////////////////////////////////////////////////////// Level 14
          let rand = Math.trunc(Math.random()*2);		  
		    if (rand == 1){
              CycleEdges ("ns");			
			} else {
              CycleEdges ("ew");			
			}
		  GenerateLevel(size*size/2);	 ///////////////////////////////////////////////////////////////////// Level 14
		} else if (Level == 15) {             //////////////////////////////////////////////////////////////////// Level 15
          let rand = Math.trunc(Math.random()*4);
		    if (rand == 1){
              CycleEdges ("nw");			
			} else if (rand == 2) {
              CycleEdges ("ne");			
			} else if (rand == 3) {
              CycleEdges ("sw");			
			} else {
              CycleEdges ("se");
			}
		  GenerateLevel(size*size/2);	 ///////////////////////////////////////////////////////////////////// Level 15
		} else if (Level == 16) {             //////////////////////////////////////////////////////////////////// Level 16
          CycleEdges ("nsew");
		  GenerateLevel(size*size/2);	 ///////////////////////////////////////////////////////////////////// Level 16
		} else if (Level == 17) {             //////////////////////////////////////////////////////////////////// Level 17
		  let type = RandomButtonFactor();
		  for (let x = 1; x < parseInt(size/2); x = x + 3) {
            for (let y = 0 + size*(x+1); y < size*(x+2); y++) {                           // top
		      GameButtons[y].changeFactor(type);
		    }
	  	  }
		  for (let x = 1; x < parseInt(size/2); x = x + 3) {
            for (let y = 1 + x; y < size*size; y = y + size) {                            // left
		      GameButtons[y].changeFactor(type);
            }
		  }
		  for (let x = 1; x < parseInt(size/2); x = x + 3) {
            for (let y = size*size - size*(x+2); y < size*size - size*(x+1); y++) {     // bottom
		      GameButtons[y].changeFactor(type);
		    }
		  }
		  for (let x = 1; x < parseInt(size/2); x = x + 3) {
            for (let y = size - (x+2); y < size*size; y = y + size) {                      // right
		      GameButtons[y].changeFactor(type);
		    }
		  }	
          CycleEdges ("nsew");
		  GenerateLevel(size*size/2);	 ///////////////////////////////////////////////////////////////////// Level 17
		} else if (Level == 18) {             //////////////////////////////////////////////////////////////////// Level 18
		  let type = RandomButtonFactor();
		  for (let i = 0; i < size*size; i++) {
		    GameButtons[i].changeFactor(type);
		  }
          CycleEdges ("nsew");
		  GenerateLevel(size*size/2);	 ///////////////////////////////////////////////////////////////////// Level 18
		} else {
		  InitializeButtonGroups();
		}	  
	  }
	  
	  function NewLevel(){
	    let i = 0;
		let xOffset = 0;
		let yOffset = 0;
		let skew = false;
        DestroyGrid();
		let grid = document.createElement ('div');
		grid.id = "grid-container";
		document.getElementById("demo").appendChild(grid);
		document.getElementById("new-level").innerHTML = "New Level";
		if (parseInt(document.getElementById("level-number").value) < 0){
		  skew = true;
		}
		if (parseInt(document.getElementById("level-size").value) < 3){
		  document.getElementById("level-size").value = 3;
		}
		if (parseInt(document.getElementById("level-size").value) > 30){
		  document.getElementById("level-size").value = 30;
		}
	  	size = parseInt(document.getElementById("level-size").value);
	    for (let y = 0; y < size; y++) {
          if (skew == true && y%2 == 0 ) {  /////////////////////////////////////////////////////// adds a skew to the grid if skew is true
		    xOffset = 25;
		  } else {
    	    xOffset = 0;
		  }
          for (let x = 0; x < size; x++){
            i++;	  
			GameButtons.push(new GameButton(-30*size + 60*x + xOffset, y*60 + yOffset));
	      }  
	      x = 0;
        }		
		GenerateLevelNum (document.getElementById("level-number").value);
		for (i = 0; i < CycleButtons.length; i++) {
		  let cbtn = CycleButtons[i];
		  cbtn.changeFactor(cbtn.btn.counterpart.btn.factor);
          cbtn.addWall(cbtn.btn.counterpart.btn.walls);
		  if (cbtn.btn.walls.includes("n")) {
		    cbtn.btn.nWall.classList.add("wall-cycle");
		  }
		  if (cbtn.btn.walls.includes("e")) {
		    cbtn.btn.eWall.classList.add("wall-cycle");
		  }
		  if (cbtn.btn.walls.includes("s")) {
		    cbtn.btn.sWall.classList.add("wall-cycle");
		  }
		  if (cbtn.btn.walls.includes("w")) {
		    cbtn.btn.wWall.classList.add("wall-cycle");
		  }
		}
		document.getElementById("dummy").style.height = size*60 + "px";
      }

	  function ResetClick () {
	    for (let IdNum = 0; IdNum < GameButtons.length; IdNum++) {
			let btn = GameButtons[IdNum].btn;
			btn.locked = false;
		  if (btn.clicks > 0){
	  	  ModifyButtonGroup(btn, btn.clicks);
	  	  }	  
	    btn.clicks = 0;
		btn.background.src = btn.bg;
	    }
		for (let i = 0; i < CycleButtons.length; i++) {
		  CycleButtons[i].btn.background.fill = CycleButtons[i].btn.counterpart.btn.background.fill;
		}
	  }
	  

