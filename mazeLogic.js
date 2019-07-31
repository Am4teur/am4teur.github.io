let canvas;
let ctx;

let cellSize = 50;
let mazeHeight = 20;
let mazeWidth = 20;
let x1 = 0 + cellSize/10;
let y1 = 0 + cellSize/10;
let x2 = cellSize - (cellSize/10)*2;
let y2 = cellSize - (cellSize/10)*2;

let oppx = {"N": 0, "E": 1, "S": 0, "W": -1};
let oppy = {"N": -1, "E": 0, "S": 1, "W": 0};
let opp = {"N": "S", "E": "W", "S": "N", "W": "E"};
let positions = [...Array(mazeHeight)].map(e => Array(mazeWidth).fill(0));
let set = [...Array(mazeHeight)].map(e => Array(mazeWidth).fill(0));
let edges = new Array();

let maze; //do not like this
let icon; //do not like this



document.addEventListener("DOMContentLoaded", SetupCanvas);

function SetupCanvas() { //main
    canvas = document.getElementById("myCanvas");
    ctx = canvas.getContext("2d");
    canvas.height = cellSize * mazeHeight;
    canvas.width = cellSize * mazeWidth;

    initPos();
    initSet();
    initEdges();

    maze = new Maze(mazeHeight, mazeWidth);
    icon = new Icon();

    kruskalAlgorithm();
    maze.generate();

    debugFunc();

    console.log("gg");
}

/*_____________________ Classes _______________________*/
class Maze {
    constructor(height, width) {
        this.height = height;
        this.width = width;

        //this.clearWall(0, 0, 2);
        // generate walls
            //
        // draw walls
            // go to each position
            // draw the walls for that position
    }

    generate() {
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

    drawWall(x, y, side) {
        ctx.beginPath();
        ctx.strokeStyle = 'black';
        ctx.lineWidth = '3';
        switch (side) {
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
                //throw exception
                break;
        }
        ctx.stroke();
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

function kruskalAlgorithm() {
    let x, y, ox, oy;
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
            //maze.clearWall(x, y, edges[i].dir);
        }
    }
}

class Edge {
    constructor(x, y, dir) {
        this.x = x;
        this.y = y;
        this.dir = dir;
    }
}


class Node {
    constructor() {
        this.edges = new Array(2);
    }
}


class Icon {
    constructor() {
        this.x = 0;
        this.y = 0;

        this.drawIcon();
    }

    drawIcon() {
        ctx.fillStyle = 'black';
        ctx.fillRect(x1, y1, x2, y2);
        //ctx.fillRect(x1+this.x*55, y1+this.y*55, x2+this.x*55, y2+this.y*55);

        ctx.fillStyle = 'blue';
        ctx.fillRect(x1, y1+cellSize, x2, y2);
    }

    moveIcon() {
        ctx.fillStyle = 'black';
        ctx.fillRect(x1, y1, x2, y2);
    }

    deleteIcon() {
        ctx.fillStyle = 'white';
        ctx.fillRect(x1, y1, x2, y2);
    }

    moveUp() {
        if(this.y!=0 && positions[this.x][this.y]["N"]) {
            --this.y;
            this.deleteIcon();
            y1 -= cellSize;
            this.moveIcon();
        }
    }

    moveRight() {
        if(this.x == mazeHeight - 2 && this.y == mazeWidth - 1) {
            document.getElementById("win").innerHTML = "Winner";
            console.log("Winner");
        }
        if(this.x!=mazeWidth-1 && positions[this.x][this.y]["E"]) {
            ++this.x;
            this.deleteIcon();
            x1 += cellSize;
            this.moveIcon();
        }
    }

    moveDown() {
        if(this.x == mazeHeight - 1 && this.y == mazeWidth - 2) {
            document.getElementById("win").innerHTML = "Winner";
            console.log("Winner");
        }
        if(this.y!=mazeHeight-1 && positions[this.x][this.y]["S"]) {
            ++this.y;
            this.deleteIcon();
            y1 += cellSize;
            this.moveIcon();
        }
    }

    moveLeft() {
        if(this.x!=0 && positions[this.x][this.y]["W"]) {
            --this.x;
            this.deleteIcon();
            x1 -= cellSize;
            this.moveIcon();
        }
    }
    //moveLeft, moveUp, moveRight, moveDown   needs to be refactored later...
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
            if(j>0){
                edges.push(new Edge(i, j, "N"));
            }
            if(i>0)
                edges.push(new Edge(i, j, "W"));
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

function drawGrid() {
    ctx.beginPath();
    ctx.strokeStyle = 'black';
    ctx.lineWidth = '2';
    for(let i = 1; i < mazeHeight; ++i) {
        ctx.moveTo(i*cellSize, 0);
        ctx.lineTo(i*cellSize, cellSize*mazeHeight);
    }
    for(let i = 1; i < mazeWidth; ++i) {
        ctx.moveTo(0, i*cellSize);
        ctx.lineTo(cellSize*mazeWidth, i*cellSize);
    }
    ctx.stroke();
}


function debugFunc() {

}


document.addEventListener('keydown', keyHandler);

function keyHandler(e) {
    switch (e.keyCode) {
        case 37:
            icon.moveLeft();
            break;
        case 38:
            icon.moveUp();
            break;
        case 39:
            icon.moveRight();
            break;
        case 40:
            icon.moveDown();
            break;
        default:
            console.log("No function for that key");
            break;
    }
};