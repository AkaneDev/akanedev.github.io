const SERVER = "https://tetris.worker.akanedev.au";

let pc;
let dc;
let lobbyCode;

const W = 10;
const H = 20;
const CELL = 20;

// --- simple boards ---
let board = Array.from({ length: H }, () => Array(W).fill(0));
let enemyBoard = Array.from({ length: H }, () => Array(W).fill(0));

// --- piece ---
let piece = { x: 4, y: 0 };

// ---------------- UI ----------------

function setStatus(msg) {
    document.getElementById("status").innerText = msg;
}

function showGame() {
    document.getElementById("menu").style.display = "none";
    document.getElementById("game").style.display = "flex";
}

// ---------------- WEBRTC ----------------

function createPeer() {
    pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    });

    pc.ondatachannel = (event) => {
        dc = event.channel;
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

// ---------------- LOBBY ----------------

async function createLobby() {
    setStatus("Creating lobby...");
    createPeer();

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    const res = await fetch(`${SERVER}/create`, { method: "POST" });
    const { code } = await res.json();

    lobbyCode = code;
    document.getElementById("codeDisplay").innerText = `Code: ${code}`;

    await fetch(`${SERVER}/offer/${code}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offer })
    });

    pollAnswer(code);
    setStatus("Waiting for opponent...");
}

async function joinLobby() {
    const code = document.getElementById("joinCode").value;
    lobbyCode = code;

    setStatus("Joining...");
    createPeer();

    const offerRes = await fetch(`${SERVER}/offer/${code}`);
    const { offer } = await offerRes.json();

    await pc.setRemoteDescription(offer);

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    await fetch(`${SERVER}/answer/${code}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer })
    });

    setStatus("Connected setup complete");
    showGame();
    startGame();
}

async function pollAnswer(code) {
    const i = setInterval(async () => {
        const res = await fetch(`${SERVER}/answer/${code}`);
        const data = await res.json();

        if (data.answer) {
            clearInterval(i);
            await pc.setRemoteDescription(data.answer);
            setStatus("Connected setup complete");
            showGame();
            startGame();
        }
    }, 1000);
}

// ---------------- GAME ----------------

const canvas = () => document.getElementById("board");
const ctx = () => canvas().getContext("2d");

function drawBoard(b, context) {
    context.clearRect(0, 0, 200, 400);

    for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
            if (b[y][x]) {
                context.fillStyle = "cyan";
                context.fillRect(x * CELL, y * CELL, CELL, CELL);
            }
        }
    }
}

function tick() {
    piece.y++;

    if (piece.y >= H - 1) {
        piece.y = 0;
        piece.x = Math.floor(Math.random() * 8);

        board[H - 1][piece.x] = 1;

        send({
            type: "drop",
            x: piece.x
        });

        clearLines();
    }

    render();
}

function clearLines() {
    for (let y = 0; y < H; y++) {
        if (board[y].every(v => v === 1)) {
            board.splice(y, 1);
            board.unshift(Array(W).fill(0));

            send({
                type: "clear",
                row: y
            });
        }
    }
}

function render() {
    drawBoard(board, ctx());
    drawBoard(enemyBoard, document.getElementById("enemyBoard").getContext("2d"));
}

function startGame() {
    setInterval(tick, 500);
}

// ---------------- SYNC ----------------

function handleRemote(data) {
    if (data.type === "drop") {
        enemyBoard[H - 1][data.x] = 1;
    }

    if (data.type === "clear") {
        enemyBoard.splice(data.row, 1);
        enemyBoard.unshift(Array(W).fill(0));
    }
}

// expose
window.createLobby = createLobby;
window.joinLobby = joinLobby;