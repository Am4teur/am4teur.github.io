let canvas;
let ctx;

/* Customized variables */
let cellSize = 20;
let mazeHeight = 8;
let mazeWidth = 8;

let setpTime = 100;
/* ____________________ */
let oppx = {"N": 0, "E": 1, "S": 0, "W": -1};
let oppy = {"N": -1, "E": 0, "S": 1, "W": 0};
let opp = {"N": "S", "E": "W", "S": "N", "W": "E"};

let maze; //do not like this
let icon; //do not like this


let buttonPressed = false;
let finished = false;
let isFirstLoop = true;
let nextTime;
let vec = new Array();
let count = 0;


function Timer(time){

    if(!finished) {
        requestAnimationFrame(Timer);
    }

    if(isFirstLoop){
        isFirstLoop=false;
        nextTime = time;
    }
    
    let elapsedTime = time - nextTime;
    if(elapsedTime > setpTime) {
        nextTime = time;
        maze.delWall(vec[count][0], vec[count][1], vec[count][2]);
        count++;
        if(count >= vec.length) {
            finished = true;
            count = 0;
        }
    }
}


function stepByStep() {
    buttonPressed = !buttonPressed;
    finished = false;
    count = 0;
    SetupCanvas();
}

function redraw() {
    finished = false;
    count = 0;
    SetupCanvas();
}





document.addEventListener("DOMContentLoaded", SetupCanvas);
document.addEventListener("keydown", keyHandler);

function SetupCanvas() { //main
    canvas = document.getElementById("myCanvas");
    ctx = canvas.getContext("2d");
    canvas.height = cellSize * mazeHeight;
    canvas.width = cellSize * mazeWidth;

    maze = new Maze(mazeHeight, mazeWidth);
    maze.init();
    icon = new Icon(maze);
    icon.init();
}

/*_____________________ Classes _______________________*/
class Maze {
    constructor(height, width) {
        this.maze_height = height;
        this.maze_width = width;
        
        /* init var positions */
        /* using the x,y major order (or Column major order) != from memory and C (Row major order) */
        this.positions = [...Array(this.maze_width)].map(e => Array(this.maze_height));
        this.initPositions();

        /* init var set */
        /* put this variable set inside of kruskal algorithm method because thats the only place that this variable is used */
        this.set = [...Array(mazeWidth)].map(e => Array(mazeHeight));
        this.initSet();

        /* init var edges */
        this.edges = new Array();
        this.initEdges();
    }

    init() {
        vec = [];
        this.drawGrid();
        this.kruskalAlgorithm();
        if(buttonPressed) {
            console.log("xxx")
            requestAnimationFrame(Timer);
        }
        else {
            this.drawMaze();
        }

    }

    drawGrid() { //recheckar bem as coordenadas, deu bem logo a primeira, estranho...
        ctx.fillStyle = "black";
        for(let i = 0; i < this.positions.length+1; ++i) {
            ctx.fillRect(cellSize*i  -2, 0, 4, cellSize*this.positions.length);
        }
        for(let i = 0; i < this.positions[0].length+1; ++i) {
            ctx.fillRect(0, cellSize*i -2, cellSize*this.positions[0].length, 4);
        }
    }

    drawMaze(){
        for(let i = 0; i < vec.length ; ++i) {
            maze.delWall(vec[i][0], vec[i][1], vec[i][2]);
        }
    }

    delWall(x, y, side) {
        ctx.fillStyle = "white";
        switch(side) { // +2 and -2 is just adjusts, nothing to do with the grid
            case "N":
                ctx.fillRect(cellSize*x  +2, cellSize*y  -2, cellSize  -4, 4);
                break;
            case "E":
                ctx.fillRect(cellSize*(x+1)  -2, cellSize*y  +2, 4, cellSize  -4);
                break;
            case "S":
                ctx.fillRect(cellSize*x  +2, cellSize*(y+1)  -2, cellSize  -4, 4);
                break;
            case "W":
                ctx.fillRect(cellSize*x  -2, cellSize*y  +2, 4, cellSize  -4);
                break;
            default:
                console.log("HOW!?");
                break;
        }
    }

    kruskalAlgorithm() {
        let x, y, ox, oy, set1, set2;
        for(let i = 0; i < this.edges.length; ++i) {
            x = this.edges[i].x;
            y = this.edges[i].y;
            ox = this.edges[i].x + oppx[this.edges[i].dir];
            oy = this.edges[i].y + oppy[this.edges[i].dir];
    
            set1 = this.set[x][y];
            set2 = this.set[ox][oy];
            if(!(set1.connected(set2))) {
                set1.connect(set2);
                this.positions[x][y][this.edges[i].dir] = 1;
                this.positions[ox][oy][opp[this.edges[i].dir]] = 1;

                vec.push([x, y, this.edges[i].dir]);
            }
        }
    }

    async checkWinner() {
        if(icon.x == this.positions.length-1 && icon.y == this.positions[0].length-1) {
            document.getElementById("win").innerHTML = "🎉 Congratulations Mazer, you Won! 🎉";
            await new Promise(r => setTimeout(r, 3000)); // sleep for 3s => 3000ms
            document.getElementById("win").innerHTML = "";
            // pop up message: "winner"
            // delay
            // automatically closes
            /* reset */
            SetupCanvas();
        }
    }

    initPositions() {
        for(let i = 0; i < this.positions.length; ++i) {
            for(let j = 0; j < this.positions[i].length; ++j) {
                this.positions[i][j] = {"N": 0, "E": 0, "S": 0, "W": 0};
            }
        }
    }

    initSet() {
        for(var i = 0; i < this.set.length; ++i) {
            for(var j = 0; j < this.set[i].length; ++j) {
                this.set[i][j] = new Tree;
            }
        }
    }

    initEdges() {
        for(var i = 0; i < this.positions.length; ++i) {
            for(let j = 0; j < this.positions[i].length; ++j) {
                if(j>0) {
                    this.edges.push(new Edge(i, j, "N"));
                }
                if(i>0) {
                    this.edges.push(new Edge(i, j, "W"));
                }
            }
        }
        this.edges.shuffle();
    }
}


class Tree {
    constructor() {
        this.parent = null;
        this.rootV = null;
    }

    root() { //this recursion could be improved with "memory" of the root
        if(this.parent == null) {
            return this;
        }
        else
            return this.parent.root();
    }

    connected(tree) {
        return this.root() == tree.root();
    }

    connect(tree) {
        tree.root().parent = this.root();
    }
}


class Edge {
    constructor(x, y, dir) {
        this.x = x;
        this.y = y;
        this.dir = dir;
    }
}


class Icon {
    constructor(myMaze) {
        this.x = 0;
        this.y = 0;
        this.myMaze = myMaze;

        this.x1 = cellSize/10;
        this.y1 = cellSize/10;
        this.x2 = cellSize - (cellSize/10)*2;
        this.y2 = cellSize - (cellSize/10)*2;
    }

    init() {
        ctx.fillStyle = "blue";
        ctx.fillRect(this.x1+cellSize*this.x, this.y1+cellSize*this.y, this.x2, this.y2);

        ctx.fillStyle = "red";
        ctx.fillRect(this.x1, this.y1+cellSize, this.x2, this.y2);
    }

    moveIcon() {
        ctx.fillStyle = "blue";
        ctx.fillRect(this.x1, this.y1, this.x2, this.y2);
    }

    deleteIcon() {
        ctx.fillStyle = "white";
        ctx.fillRect(this.x1+cellSize*this.x, this.y1+cellSize*this.y, this.x2, this.y2);
    }

    move(dir){
        if(this.myMaze.positions[this.x][this.y][dir]) {
            this.deleteIcon();
            this.x += oppx[dir];
            this.y += oppy[dir];
            this.init(); //check this
            this.myMaze.checkWinner();
            finished = false;
        }
    }
}

/*_____________________ Functions _______________________*/
Array.prototype.shuffle = function() {
    let m = this.length;
    let i;
    while(m) {
      i = (Math.random() * m--) >>> 0;
      [this[m], this[i]] = [this[i], this[m]]
    }
    return this;
}


function keyHandler(e) {
    switch (e.keyCode) {
        case 37: //left
            icon.move("W");
            break;
        case 38: //up
            icon.move("N");
            break;
        case 39: //right
            icon.move("E");
            break;
        case 40: //down
            icon.move("S");
            break;
        default:
            //console.log("No function for that key");
            break;
    }
};