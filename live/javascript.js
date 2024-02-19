
/////////////////////////////////////////////////////// Allow scroll when neither lock nor press is active?
                   /////////////////////////////////////// Catch the on-zoom event and only chnage grid size instead
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
		let gbtn = this;
        let grid = document.getElementById("grid-container");
        this.offsetx = x;
        this.offsety = y;
		this.innerHTML = "0";
	    this.clicks = 0;
	    this.maxClicks = 1;
	    this.locked = false;
	    this.walls = "";
        this.cycles = "";
		this.facing = Facing;
        this.factor = 1;
        this.affectedButtons = [];    // stores which buttons this button will affect when pressed
        this.counterparts = [];       // stores which cycle buttons this button connects with
		this.btnWall = "images/Wall.png";
		
		let svgBase = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
		svgBase.style.position = "absolute";
		svgBase.style.transform = "translate(" + x + "px," + y + "px)";
		svgBase.classList.add("svg");
		this.svgBase = svgBase;
		
		let background = document.createElementNS("http://www.w3.org/2000/svg", 'polygon');
		background.classList.add("background");
        background.onmousedown = function(){BtnClick(gbtn)};
		background.onmouseenter = function(){BtnMouseEnter(gbtn)};
        background.onmouseleave = function(){BtnMouseLeave(gbtn)};
		background.ontouchstart = function(){BtnTouch(gbtn)};
//		background.ontouchmove = function(){TouchMove(btn)};
//		background.ontouchcancel = function(){TouchCancel(btn)};
		this.background = background;
		this.createHitbox(svgBase, background);

		let svgL = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
		svgL.setAttribute("viewBox", "-25 -25 150 150");
		this.svgL = svgL;

		let lockVis = document.createElementNS("http://www.w3.org/2000/svg", 'polygon');
		lockVis.classList = "lock-vis";
        this.lockVis = lockVis;
		this.createHitbox(svgL, lockVis);

		let svgM = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
		this.svgM = svgM;

		let svgWall = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
		svgWall.classList.add("wall");
		this.svgWall = svgWall;

		let modifier = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
		modifier.classList = "modifier";
        this.modifier = modifier;
		this.createModifier(modifier);

		let svgV = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
		this.svgV = svgV;
		
		let value = document.createElementNS("http://www.w3.org/2000/svg", 'text');
		value.classList = "btn";
		value.innerHTML = "0";
		this.createText(value);
        this.value = value;
		
		svgBase.setAttribute("viewBox", (-x) + " " + (-y) + " 100 100");
		svgBase.setAttribute("width", 100-200/(size+2) + "px");
		svgBase.setAttribute("height", 100-200/(size+2) + "px");
		grid.appendChild(svgBase);
		svgBase.appendChild(background);
		svgBase.appendChild(svgL);
		svgL.appendChild(lockVis);
		svgBase.appendChild(svgM);
		svgBase.appendChild(svgWall);
		svgM.appendChild(modifier);
		svgBase.appendChild(svgV);
		svgV.appendChild(value);
	}

    createHitbox(svg, hitbox) {
		AddSVGPoint(svg, hitbox, 1, 1);
		AddSVGPoint(svg, hitbox, 99, 1);
		AddSVGPoint(svg, hitbox, 99, 99);
		AddSVGPoint(svg, hitbox, 1, 99);
	}

    createModifier(modifier) {
        modifier.setAttribute("r","25px");
        modifier.setAttribute("cx","50px");
        modifier.setAttribute("cy","50px");		
	}

    createText(value) {
        value.setAttribute("x","50%");
        value.setAttribute("y","60%");
		value.setAttribute("font-size", "32px");
	}

    defineArea() {
	    let midBtn = this;
        let n = 105;
        let e = 105;
        let s = 105;
        let w = 105;
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
		    let btn = GameButtons[i];
		    if (btn.offsetx < midBtn.offsetx + e &&
		        btn.offsetx > midBtn.offsetx - w &&
			    btn.offsety < midBtn.offsety + s &&
			    btn.offsety > midBtn.offsety - n) {
              midBtn.affectedButtons.push(btn);
		    }
		  }
		for (let c = 0; c < CycleButtons.length; c++) {
			let cbtn = CycleButtons[c];
		    if (cbtn.offsetx < midBtn.offsetx + e &&
		        cbtn.offsetx > midBtn.offsetx - w &&
			    cbtn.offsety < midBtn.offsety + s &&
			    cbtn.offsety > midBtn.offsety - n) {
              midBtn.affectedButtons.push(cbtn.counterpart);
		    }		
	    }		
	}
	  
    changeFactor(Factor) {
    	let btn = this;
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

    createWall(svg, Type) {
		let rect1 = document.createElementNS("http://www.w3.org/2000/svg", 'polygon');
        if (Type == "south") {
	        AddSVGPoint(svg, rect1, 1, 99);
	        AddSVGPoint(svg, rect1, 30, 99);
	        AddSVGPoint(svg, rect1, 30, 85);
	        AddSVGPoint(svg, rect1, 1, 85);	
		} else if (Type == "west") {
	        AddSVGPoint(svg, rect1, 1, 1);
	        AddSVGPoint(svg, rect1, 15, 1);
	        AddSVGPoint(svg, rect1, 15, 30);
	        AddSVGPoint(svg, rect1, 1, 30);					
		} else if (Type == "east") {
	        AddSVGPoint(svg, rect1, 99, 1);
	        AddSVGPoint(svg, rect1, 99, 30);
	        AddSVGPoint(svg, rect1, 85, 30);
	        AddSVGPoint(svg, rect1, 85, 1);					
		} else {
	        AddSVGPoint(svg, rect1, 1, 1);
	        AddSVGPoint(svg, rect1, 30, 1);
	        AddSVGPoint(svg, rect1, 30, 15);
	        AddSVGPoint(svg, rect1, 1, 15);			
		}
		svg.appendChild(rect1);	
		let rect2 = document.createElementNS("http://www.w3.org/2000/svg", 'polygon');		
        if (Type == "south") {
	        AddSVGPoint(svg, rect2, 99, 99);
	        AddSVGPoint(svg, rect2, 70, 99);
	        AddSVGPoint(svg, rect2, 70, 85);
	        AddSVGPoint(svg, rect2, 99, 85);	
		} else if (Type == "west") {
	        AddSVGPoint(svg, rect2, 1, 99);
	        AddSVGPoint(svg, rect2, 1, 70);
	        AddSVGPoint(svg, rect2, 15, 70);
	        AddSVGPoint(svg, rect2, 15, 99);				
		} else if (Type == "east") {
	        AddSVGPoint(svg, rect2, 99, 99);
	        AddSVGPoint(svg, rect2, 99, 70);
	        AddSVGPoint(svg, rect2, 85, 70);
	        AddSVGPoint(svg, rect2, 85, 99);
		} else {
	        AddSVGPoint(svg, rect2, 99, 1);
	        AddSVGPoint(svg, rect2, 70, 1);
	        AddSVGPoint(svg, rect2, 70, 15);
	        AddSVGPoint(svg, rect2, 99, 15);			
		}
        svg.appendChild(rect2);	
        this.svgWall.appendChild(svg);	
	}

    addWall (String) {
    	let btn = this;
      if (String.includes("n") == true) {
        if (btn.walls.includes("n") == false) {
          let nWall = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
		  btn.createWall(nWall, "north");
          btn.walls = btn.walls + "n";
        }
      }
      if (String.includes("s") == true) {
        if (btn.walls.includes("s") == false) {
          let sWall = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
		  btn.createWall(sWall, "south");
          btn.walls = btn.walls + "s";
    	}	
      }
      if (String.includes("w") == true) {
        if (btn.walls.includes("w") == false) {
          let wWall = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
		  btn.createWall(wWall, "west");
          btn.walls = btn.walls + "w";
        }
      }
      if (String.includes("e") == true) {
        if (btn.walls.includes("e") == false) {
          let eWall = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
		  btn.createWall(eWall, "east");
    	  btn.eWall = eWall;
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
		  let btn = this;
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
		    let nCycle = new GameButton(btn.offsetx, btn.offsety - 100);
		    nCycle.background.classList.add("cycle");
			nCycle.svgBase.classList.add("cycle");
			nCycle.counterpart = GameButtons[idNum + size*size - size];               // used to store which regular button a cycle button connects with      
			GameButtons[idNum + size*size - size].counterparts.push(nCycle);          // used to store which cycle buttons a regular button connects with
			nCycle.svgBase.setAttribute("viewBox", (nCycle.offsetx*(-1.5) - 25) + " " + (nCycle.offsety*(-1.5) - 25) + " 150 150");
			nCycle.svgL.setAttribute("viewBox", "0 0 150 150");
			nCycle.svgV.setAttribute("viewBox", "16 16 100 100");
			nCycle.svgM.setAttribute("viewBox", "16 16 100 100");
			CycleButtons.push(nCycle);
		    btn.cycles = btn.cycles + "n";
		}	   
	    if (String.includes("s") == true &&
		    btn.cycles.includes("s") == false) {
			let sCycle = new GameButton(btn.offsetx, btn.offsety - 100*(-1));
			sCycle.background.classList.add("cycle");
			sCycle.svgBase.classList.add("cycle");
            sCycle.counterpart = GameButtons[idNum - size*size + size];
			GameButtons[idNum - size*size + size].counterparts.push(sCycle);
			sCycle.svgBase.setAttribute("viewBox", (sCycle.offsetx*(-1.5) - 25) + " " + (sCycle.offsety*(-1.5) - 25) + " 150 150");
			sCycle.svgL.setAttribute("viewBox", "0 0 150 150");
			sCycle.svgV.setAttribute("viewBox", "16 16 100 100");
			sCycle.svgM.setAttribute("viewBox", "16 16 100 100");
			CycleButtons.push(sCycle);
			btn.cycles = btn.cycles + "s";
		}	
	    if (String.includes("w") == true &&
		    btn.cycles.includes("w") == false ) {
			let wCycle = new GameButton(btn.offsetx - 100, btn.offsety);
			wCycle.background.classList.add("cycle");
			wCycle.svgBase.classList.add("cycle");
            wCycle.counterpart = GameButtons[idNum + size - 1];
			GameButtons[idNum + size - 1].counterparts.push(wCycle);
			wCycle.svgBase.setAttribute("viewBox", (wCycle.offsetx*(-1.5) - 25) + " " + (wCycle.offsety*(-1.5) - 25) + " 150 150");
			wCycle.svgL.setAttribute("viewBox", "0 0 150 150");
			wCycle.svgV.setAttribute("viewBox", "16 16 100 100");
			wCycle.svgM.setAttribute("viewBox", "16 16 100 100");
			CycleButtons.push(wCycle);
			btn.cycles = btn.cycles + "w";
		}	
	    if (String.includes("e") == true &&
		    btn.cycles.includes("e") == false) {
			let eCycle = new GameButton(btn.offsetx - 100*(-1), btn.offsety);
			eCycle.background.classList.add("cycle");
			eCycle.svgBase.classList.add("cycle");
            eCycle.counterpart = GameButtons[idNum - size + 1];
			GameButtons[idNum - size + 1].counterparts.push(eCycle);
			eCycle.svgBase.setAttribute("viewBox", (eCycle.offsetx*(-1.5) - 25) + " " + (eCycle.offsety*(-1.5) - 25) + " 150 150");
			eCycle.svgL.setAttribute("viewBox", "0 0 150 150");
			eCycle.svgV.setAttribute("viewBox", "16 16 100 100");
			eCycle.svgM.setAttribute("viewBox", "16 16 100 100");
			CycleButtons.push(eCycle);
			btn.cycles = btn.cycles + "e";			  
		}		
	    if (btn.cycles.includes("n") == true &&
		    btn.cycles.includes("w") == true) {
		    if (str.includes("n") == false ||
		        str.includes("w") == false) {
			    let nwCycle = new GameButton(btn.offsetx - 100, btn.offsety - 100);
			    nwCycle.background.classList.add("cycle");
			    nwCycle.svgBase.classList.add("cycle");
                nwCycle.counterpart = GameButtons[size*size - 1];
			    GameButtons[size*size - 1].counterparts.push(nwCycle);
			    nwCycle.svgBase.setAttribute("viewBox", (nwCycle.offsetx*(-1.5) - 25) + " " + (nwCycle.offsety*(-1.5) - 25) + " 150 150");
			    nwCycle.svgL.setAttribute("viewBox", "0 0 150 150");
			    nwCycle.svgV.setAttribute("viewBox", "16 16 100 100");
			    nwCycle.svgM.setAttribute("viewBox", "16 16 100 100");
			    CycleButtons.push(nwCycle);	
		    }
		}
	    if (btn.cycles.includes("n") == true &&
		    btn.cycles.includes("e") == true) {
		    if (str.includes("n") == false ||
		        str.includes("e") == false) {
			    let neCycle = new GameButton(btn.offsetx - 100*(-1), btn.offsety - 100);
			    neCycle.background.classList.add("cycle");
			    neCycle.svgBase.classList.add("cycle");
                neCycle.counterpart = GameButtons[size*size - size];
			    GameButtons[size*size - size].counterparts.push(neCycle);
			    neCycle.svgBase.setAttribute("viewBox", (neCycle.offsetx*(-1.5) - 25) + " " + (neCycle.offsety*(-1.5) - 25) + " 150 150");
			    neCycle.svgL.setAttribute("viewBox", "0 0 150 150");
			    neCycle.svgV.setAttribute("viewBox", "16 16 100 100");
			    neCycle.svgM.setAttribute("viewBox", "16 16 100 100");
			    CycleButtons.push(neCycle);	
		    }
		}
	    if (btn.cycles.includes("s") == true &&
		    btn.cycles.includes("w") == true) {
		    if (str.includes("s") == false ||
		        str.includes("w") == false) {
			    let swCycle = new GameButton(btn.offsetx - 100, btn.offsety - 100*(-1));
			    swCycle.background.classList.add("cycle");
			    swCycle.svgBase.classList.add("cycle");
                swCycle.counterpart = GameButtons[size - 1];
			    GameButtons[size - 1].counterparts.push(swCycle);
			    swCycle.svgBase.setAttribute("viewBox", (swCycle.offsetx*(-1.5) - 25) + " " + (swCycle.offsety*(-1.5) - 25) + " 150 150");
			    swCycle.svgL.setAttribute("viewBox", "0 0 150 150");
			    swCycle.svgV.setAttribute("viewBox", "16 16 100 100");
			    swCycle.svgM.setAttribute("viewBox", "16 16 100 100");
			    CycleButtons.push(swCycle);	
		    }
		}
	    if (btn.cycles.includes("s") == true &&
		    btn.cycles.includes("e") == true) {
		    if (str.includes("s") == false ||
		        str.includes("e") == false) {
			    let seCycle = new GameButton(btn.offsetx - 100*(-1), btn.offsety - 100*(-1));
			    seCycle.background.classList.add("cycle");
			    seCycle.svgBase.classList.add("cycle");
                seCycle.counterpart = GameButtons[0];
			    GameButtons[0].counterparts.push(seCycle);
			    seCycle.svgBase.setAttribute("viewBox", (seCycle.offsetx*(-1.5) - 25) + " " + (seCycle.offsety*(-1.5) - 25) + " 150 150");
			    seCycle.svgL.setAttribute("viewBox", "0 0 150 150");
			    seCycle.svgV.setAttribute("viewBox", "16 16 100 100");
			    seCycle.svgM.setAttribute("viewBox", "16 16 100 100");
			    CycleButtons.push(seCycle);	
		    }
		}
	  }	  
	
}

function AddSVGPoint(svg, rect, x, y) {
	let point = svg.createSVGPoint();	
	point.x = x;
	point.y = y;
	rect.points.appendItem(point);	
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
    if (GameButtons[i].value.innerHTML != 0) {
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
  btn.value.innerHTML = parseInt(btn.value.innerHTML) + Amount;
  if (btn.value.innerHTML == 0){
    btn.value.style.fill = textColorZero;
  }
  if (parseInt(btn.value.innerHTML) > 0) {
    btn.value.style.fill = textColorPositive;
  }
  if (parseInt(btn.value.innerHTML) < 0){
    btn.value.style.fill = textColorNegative;
  } 
  for (let i = 0; i < btn.counterparts.length; i++) {
    let cbtn = btn.counterparts[i];
    cbtn.value.innerHTML = btn.value.innerHTML;
    cbtn.background.style.fill = btn.background.style.fill;
	cbtn.lockVis.style.fill = btn.lockVis.style.fill;
	cbtn.value.style.fill = btn.value.style.fill;
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
		 // if (PressSelected == true ||
		      //LockSelected == true){
		          event.preventDefault();				  
			  //}
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
			btn.counterparts[i].lockVis.style.fill = btn.lockVis.style.fill;
		    btn.counterparts[i].background.style.fill = btn.background.style.fill;
		}		
      }

function BtnMouseEnter(btn)  {
	btn.background.classList.add("background-selected");
	if (LMDown == true) {
		BtnLeftClick(btn);
	} else if (RMDown == true) {
		BtnRightClick(btn);
	}
	for (let i = 0; i < btn.affectedButtons.length; i++) {
		btn.affectedButtons[i].value.classList.add("btn-group");
	}
}

function BtnMouseLeave(btn)  {
	btn.background.classList.remove("background-selected");
	for (let i = 0; i < btn.affectedButtons.length; i++) {
		btn.affectedButtons[i].value.classList.remove("btn-group");
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
		  btn = GameButtons[Math.floor(Math.random() * GameButtons.length)];
	      if (btn.clicks < btn.maxClicks &&
		      btn.locked == false) {
            ModifyButtonGroup (btn, 1);
            btn.clicks = btn.clicks + 1;  
		    clicks--;
          }		  
        }
	    for (let i = 0; i < GameButtons.length; i++){
	      GameButtons[i].clicks = 0;
		  GameButtons[i].locked = false;
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
			  if (GameButtons[rand - 1].clicks < GameButtons[rand - 1].maxClicks &&
			      GameButtons[rand - 1].locked == false) {
			    for (let j = 0; j < size; j++){
				  if(j%3 != 2){
				    GameButtons[j*size + rand - 1].locked = true;
				  }
				  if (j%3 == 0) {
				    ModifyButtonGroup(GameButtons[j*size + rand - 1], 1);
					GameButtons[j*size + rand - 1].clicks = GameButtons[j*size + rand - 1].clicks + 1;
					clicks++				    
				  }
				}
			    i++;
			  }
			}
			else{
			  if (GameButtons[rand*size - 1].clicks < GameButtons[rand*size - 1].maxClicks &&
			      GameButtons[rand*size - 1].locked == false) {
			    for (let j = 0; j < size; j++){
				  if(j%3 != 2){
				    GameButtons[rand*size - j - 1].locked = true;
				  }
				  if(j%3 == 0) {
				    ModifyButtonGroup(GameButtons[rand*size - j - 1], 1);
					GameButtons[rand*size - j - 1].clicks = GameButtons[rand*size - j - 1].clicks + 1;
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
			  if (GameButtons[rand - 1].clicks < GameButtons[rand - 1].maxClicks &&
			      GameButtons[rand - 1].locked == false) {
			    for (let j = 0; j < size; j++){
				  if(j%3 != 2){
				    GameButtons[j*size + rand - 1].locked = true;
				  }
				  if (j%3 == 0) {
				    ModifyButtonGroup(GameButtons[j*size + rand - 1], 1);
					GameButtons[j*size + rand - 1].clicks = GameButtons[j*size + rand - 1].clicks + 1;
					rand2 = 1;
					clicks++				    
				  }
				}
			    i++;
			  }
			}
			else{
			  if (GameButtons[rand*size - 1].clicks < GameButtons[rand*size - 1].maxClicks &&
			      GameButtons[rand*size - 1].locked == false) {
			    for (let j = 0; j < size; j++){
				  if(j%3 != 2){
				    GameButtons[rand*size - j - 1].locked = true;
				  }
				  if(j%3 == 0) {
				    ModifyButtonGroup(GameButtons[rand*size - j - 1], 1);
					GameButtons[rand*size - j - 1].clicks = GameButtons[rand*size - j - 1].clicks + 1;
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
		let xOffset = 0;
		let yOffset = 0;
		let skew = false;
        DestroyGrid();
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
		let grid = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
		grid.setAttribute("viewBox", "0 0 " + size*100 + " " + size*100);
		grid.style.width = "100%";
		grid.style.height = "auto";
		grid.id = "grid-container";
		document.getElementById("demo").appendChild(grid);
	    for (let y = 0; y < size; y++) {
          if (skew == true && y%2 == 0 ) {  /////////////////////////////////////////////////////// adds a skew to the grid if skew is true
		    xOffset = 50;
		  } else {
    	    xOffset = 0;
		  }
          for (let x = 0; x < size; x++){  
			GameButtons.push(new GameButton(100*x + xOffset + 100, y*100 + yOffset + 100));
	      }  
	      x = 0;
        }		
		GenerateLevelNum (document.getElementById("level-number").value);
		for (i = 0; i < CycleButtons.length; i++) {
		  let cbtn = CycleButtons[i];
		  cbtn.changeFactor(cbtn.counterpart.factor);
          cbtn.addWall(cbtn.counterpart.walls);
		}
      }

	  function ResetClick () {
	    for (let IdNum = 0; IdNum < GameButtons.length; IdNum++) {
			let btn = GameButtons[IdNum];
			btn.locked = false;
		  if (btn.clicks > 0){
	  	  ModifyButtonGroup(btn, btn.clicks);
	  	  }	  
	    btn.clicks = 0;
		btn.background.style.fill = normalColor;
		btn.lockVis.style.fill = normalColor;
	    }
		for (let i = 0; i < CycleButtons.length; i++) {
		  CycleButtons[i].background.fill = CycleButtons[i].counterpart.background.fill;
		}
	    
	  }

