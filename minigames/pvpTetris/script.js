const SERVER = "https://tetris.worker.akanedev.au";

let pc, dc, lobbyCode;

// =========================
// P2P LAYER
// =========================

function createPeer() {
    pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    });

    pc.ondatachannel = (e) => {
        dc = e.channel;
        setupDC();
    };

    dc = pc.createDataChannel("game");
    setupDC();
}

function setupDC() {
    dc.onopen = () => setStatus("Connected (P2P)");
    dc.onmessage = (e) => handleRemote(JSON.parse(e.data));
}

function send(data) {
    if (dc && dc.readyState === "open") {
        dc.send(JSON.stringify(data));
    }
}

// =========================
// LOBBY (UNCHANGED LOGIC)
// =========================

function setStatus(msg) {
    document.getElementById("status").innerText = msg;
}

function showGame() {
    document.getElementById("menu").style.display = "none";
    document.getElementById("game").style.display = "flex";
}

// createLobby / joinLobby / pollAnswer
// (same as your previous working version)
// ----------------------------
// KEEP YOUR EXISTING FUNCTIONS
// ----------------------------


// =========================
// TETRIS CORE (YOUR ENGINE INTEGRATED)
// =========================

const COLS = 10, ROWS = 20;
let BLOCK = 30;

let grid, current, nextPiece, hold;
let canHold = true;

let score = 0;
let level = 1;
let lines = 0;

let dropInterval = 800;
let dropCounter = 0;
let lastTime = 0;
let paused = false;

const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");

const SHAPES = {
    I:[[1,1,1,1]],
    J:[[1,0,0],[1,1,1]],
    L:[[0,0,1],[1,1,1]],
    O:[[1,1],[1,1]],
    S:[[0,1,1],[1,1,0]],
    T:[[0,1,0],[1,1,1]],
    Z:[[1,1,0],[0,1,1]]
};

const COLORS = {
    I:"#6600ff", J:"#3366cc", L:"#ff9933",
    O:"#ffcc00", S:"#2bfa8a", T:"#b76cff", Z:"#ff5c8a"
};

function makeGrid() {
    return Array.from({length: ROWS}, () => Array(COLS).fill(null));
}

function clone(m) {
    return m.map(r => [...r]);
}

function makePiece() {
    const types = Object.keys(SHAPES);
    const type = types[Math.random()*types.length|0];

    return {
        type,
        shape: clone(SHAPES[type]),
        x: 3,
        y: 0
    };
}

function rotate(mat) {
    return mat[0].map((_,i)=>mat.map(r=>r[i]).reverse());
}

function collides(p) {
    for (let y=0;y<p.shape.length;y++) {
        for (let x=0;x<p.shape[y].length;x++) {
            if (!p.shape[y][x]) continue;

            let nx = p.x + x;
            let ny = p.y + y;

            if (nx < 0 || nx >= COLS || ny >= ROWS) return true;
            if (ny >= 0 && grid[ny][nx]) return true;
        }
    }
    return false;
}

function merge(p) {
    for (let y=0;y<p.shape.length;y++) {
        for (let x=0;x<p.shape[y].length;x++) {
            if (p.shape[y][x]) {
                grid[p.y+y][p.x+x] = p.type;
            }
        }
    }
}

function clearLines() {
    let cleared = 0;

    for (let y=ROWS-1;y>=0;y--) {
        if (grid[y].every(v=>v)) {
            grid.splice(y,1);
            grid.unshift(Array(COLS).fill(null));
            cleared++;
            y++;
        }
    }

    if (cleared) {
        lines += cleared;
        score += cleared * 100;

        send({
            type: "clear",
            lines: cleared
        });
    }
}

function spawn() {
    if (!nextPiece) nextPiece = makePiece();
    current = nextPiece;
    nextPiece = makePiece();
    canHold = true;

    if (collides(current)) restart();
}

// =========================
// INPUT + SYNC
// =========================

function move(dx) {
    current.x += dx;
    if (collides(current)) current.x -= dx;

    send({ type:"move", x:current.x });
}

function rotatePiece() {
    const old = clone(current.shape);
    current.shape = rotate(current.shape);
    if (collides(current)) current.shape = old;

    send({ type:"rotate" });
}

function softDrop() {
    current.y++;
    if (collides(current)) {
        current.y--;
        lock();
    }
}

function hardDrop() {
    while (!collides(current)) current.y++;
    current.y--;
    lock();
}

function lock() {
    merge(current);
    clearLines();
    spawn();

    send({ type:"lock" });
}

// =========================
// REMOTE HANDLING
// =========================

function handleRemote(data) {
    if (!data) return;

    if (data.type === "move") {
        // optional: ghost sync or opponent indicator
    }

    if (data.type === "rotate") {}

    if (data.type === "lock") {
        // opponent placed piece → can be used for garbage system later
    }

    if (data.type === "clear") {
        // ATTACK SYSTEM (future upgrade)
        addGarbage(data.lines);
    }
}

function addGarbage(lines) {
    for (let i=0;i<lines;i++) {
        grid.pop();
        grid.unshift(Array(COLS).fill("G"));
    }
}

// =========================
// RENDER
// =========================

function draw() {
    ctx.fillStyle = "#071025";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    for (let y=0;y<ROWS;y++) {
        for (let x=0;x<COLS;x++) {
            if (grid[y][x]) {
                ctx.fillStyle = COLORS[grid[y][x]] || "#444";
                ctx.fillRect(x*BLOCK,y*BLOCK,BLOCK-1,BLOCK-1);
            }
        }
    }

    if (current) {
        ctx.fillStyle = COLORS[current.type];

        for (let y=0;y<current.shape.length;y++) {
            for (let x=0;x<current.shape[y].length;x++) {
                if (current.shape[y][x]) {
                    ctx.fillRect(
                        (current.x+x)*BLOCK,
                        (current.y+y)*BLOCK,
                        BLOCK-1,BLOCK-1
                    );
                }
            }
        }
    }
}

// =========================
// LOOP
// =========================

function update(t=0) {
    if (!lastTime) lastTime = t;
    const delta = t - lastTime;
    lastTime = t;

    if (!paused) {
        dropCounter += delta;

        if (dropCounter > dropInterval) {
            current.y++;
            if (collides(current)) {
                current.y--;
                lock();
            }
            dropCounter = 0;
        }
    }

    draw();
    requestAnimationFrame(update);
}

// =========================
// START
// =========================

function startGame() {
    grid = makeGrid();
    nextPiece = makePiece();
    spawn();
    update();
}

window.addEventListener("keydown", e => {
    if (!current) return;

    if (e.code === "ArrowLeft") move(-1);
    if (e.code === "ArrowRight") move(1);
    if (e.code === "ArrowUp") rotatePiece();
    if (e.code === "ArrowDown") softDrop();
    if (e.code === "Space") hardDrop();
});