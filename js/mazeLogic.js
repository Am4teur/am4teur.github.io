let canvas;
let ctx;

/* Customized variables */
let cellSize = 50;
let mazeHeight = 20;
let mazeWidth = 20;
/* ____________________ */
let x1 = cellSize/10;
let y1 = cellSize/10;
let x2 = cellSize - (cellSize/10)*2;
let y2 = cellSize - (cellSize/10)*2;

let oppx = {"N": 0, "E": 1, "S": 0, "W": -1};
let oppy = {"N": -1, "E": 0, "S": 1, "W": 0};
let opp = {"N": "S", "E": "W", "S": "N", "W": "E"};
/* using the x,y major order (or Column major order) != from memory and C (Row major order) */
let positions = [...Array(mazeWidth)].map(e => Array(mazeHeight).fill(0));
let set = [...Array(mazeWidth)].map(e => Array(mazeHeight).fill(0));
let edges = new Array();

let maze; //do not like this
let icon; //do not like this



document.addEventListener("DOMContentLoaded", SetupCanvas);
document.addEventListener("keydown", keyHandler);

function SetupCanvas() { //main
    canvas = document.getElementById("myCanvas");
    ctx = canvas.getContext("2d");
    canvas.height = cellSize * mazeHeight;
    canvas.width = cellSize * mazeWidth;

    /*
    maze = new Maze(mazeHeight, mazeWidth);
    maze.init();
    icon = new Icon();
    icon.init();
    */

    initPos();
    initSet();
    initEdges();

    maze = new Maze(mazeHeight, mazeWidth);
    maze.generate();
    icon = new Icon();
    icon.drawIcon();
}

/*_____________________ Classes _______________________*/
class Maze {
    constructor(height, width) {
        this.height = height;
        this.width = width;
        
        /* TODO */
        this.positionsx;
        this.setx;
        this.edgesx;
    }

    generate() {
        this.kruskalAlgorithm();
        for(let i = 0; i < positions.length; ++i) {
            for(let j = 0; j < positions[i].length; ++j) {
                if(positions[i][j]["N"] == 0) {
                    this.drawWall(i, j, "N");
                }
                if(positions[i][j]["E"] == 0) {
                    this.drawWall(i, j, "E");
                }
                if(positions[i][j]["S"] == 0) {
                    this.drawWall(i, j, "S");
                }
                if(positions[i][j]["W"] == 0) {
                    this.drawWall(i, j, "W");
                }
            }
        }
    }

    clean() {
        for(let i = 0; i < this.height; ++i) {

        }
        for(let i = 0; i < this.width; ++i) {

        }
    }

    drawWall(x, y, side) {
        ctx.beginPath();
        ctx.strokeStyle = "black";
        ctx.lineWidth = "3";
        switch(side) {
            case "N":
                ctx.moveTo(cellSize*x -1, cellSize*y);
                ctx.lineTo(cellSize*(x+1), cellSize*y);
                break;
            case "E":
                ctx.moveTo(cellSize*(x+1), cellSize*y-1);
                ctx.lineTo(cellSize*(x+1), cellSize*(y+1));
                break;
            case "S":
                ctx.moveTo(cellSize*x, cellSize*(y+1));
                ctx.lineTo(cellSize*(x+1) +1, cellSize*(y+1));
                break;
            case "W":
                ctx.moveTo(cellSize*x, cellSize*y);
                ctx.lineTo(cellSize*x, cellSize*(y+1) +1);
                break;
            default:
                console.log("HOW?")
                break;
        }
        ctx.stroke();
    }

    kruskalAlgorithm() {
        let x, y, ox, oy, set1, set2;
        for(let i = 0; i < edges.length; ++i) {
            x = edges[i].x;
            y = edges[i].y;
            ox = edges[i].x + oppx[edges[i].dir];
            oy = edges[i].y + oppy[edges[i].dir];
    
            set1 = set[x][y];
            set2 = set[ox][oy];
            if(!(set1.connected(set2))) {
                set1.connect(set2);
                positions[x][y][edges[i].dir] = 1;
                positions[ox][oy][opp[edges[i].dir]] = 1;
            }
        }
    }

    checkWinner() {
        if(icon.x == maze.width-1 && icon.y == maze.height-1) {
            document.getElementById("win").innerHTML = "Winner";
            // pop up message: "winner"
            // delay
            // automatically closes
            /* reset */
            SetupCanvas();
        }
        else
            document.getElementById("win").innerHTML = "";
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
    constructor() {
        this.x = 0;
        this.y = 0;
    }

    moveIcon() {
        ctx.fillStyle = "black";
        ctx.fillRect(x1, y1, x2, y2);
    }

    drawIcon() {
        ctx.fillStyle = "black";
        ctx.fillRect(x1+cellSize*this.x, y1+cellSize*this.y, x2, y2);

        ctx.fillStyle = "blue";
        ctx.fillRect(x1, y1+cellSize, x2, y2);
    }

    deleteIcon() {
        ctx.fillStyle = "white";
        ctx.fillRect(x1+cellSize*this.x, y1+cellSize*this.y, x2, y2);
    }

    move(dir){
        if(positions[this.x][this.y][dir]) {
            this.deleteIcon();
            this.x += oppx[dir];
            this.y += oppy[dir];
            this.drawIcon();
            maze.checkWinner();
        }
    }
}

/*_____________________ Functions _______________________*/
function initPos() {
    for(var i = 0; i < positions.length; ++i) {
        for(var j = 0; j < positions[i].length; ++j) {
            positions[i][j] = {"N": 0, "E": 0, "S": 0, "W": 0};
        }
    }
}

function initSet() {
    for(var i = 0; i < set.length; ++i) {
        for(var j = 0; j < set[i].length; ++j) {
            set[i][j] = new Tree;
        }
    }
}

function initEdges() {
    for(var i = 0; i < positions.length; ++i) {
        for(let j = 0; j < positions[i].length; ++j) {
            if(j>0) {
                edges.push(new Edge(i, j, "N"));
            }
            if(i>0) {
                edges.push(new Edge(i, j, "W"));
            }
        }
    }
    edges.shuffle();
}

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
        case 37:
            //icon.moveLeft();
            icon.move("W");
            break;
        case 38:
            //icon.moveUp();
            icon.move("N");
            break;
        case 39:
            //icon.moveRight();
            icon.move("E");
            break;
        case 40:
            //icon.moveDown();
            icon.move("S");
            break;
        default:
            console.log("No function for that key");
            break;
    }
};