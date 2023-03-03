const PIECE_ROW = Object.freeze([Rook, Knight, Bishop, Queen, King, Bishop, Knight, Rook]);
const ROW_INDEXES = Object.freeze(["1", "2", "3", "4", "5", "6", "7", "8"]);
const COL_INDEXES = Object.freeze(["A", "B", "C", "D", "E", "F", "G", "H"]);

class ChessModel{
    chessboard;

    constructor(){
        this.chessboard = new Array(64).fill(null);

        for(let i = 0; i < PIECE_ROW.length; i++){
            let MyPiece = PIECE_ROW[i];
            let wid = i;
            let bid = this.chessboard.length - i - 1;
            
            this.chessboard[wid] = new MyPiece(1, wid);
            this.chessboard[wid + 8] = new Pawn(1, wid + 8);
            this.chessboard[bid] = new MyPiece(-1, bid);
            this.chessboard[bid - 8] = new Pawn(-1, bid - 8);
        }
    }

    static getCol(pos){
        return pos % 8;
    }

    static getRow(pos){
        return parseInt(pos / 8);
    }

    static getCanonicalPosition(pos){
        let col = ChessModel.getCol(pos);
        let row = ChessModel.getRow(pos);

        return `${COL_INDEXES[col]}${ROW_INDEXES[row]}`;
    }

    move(src, dst){
        let piece = this.chessboard[src];
        
        if(!piece) return [false, null];

        if(!piece.getValidMoves(this.chessboard).includes(dst)) return [false, null];

        let captured_piece = this.chessboard[dst]
        
        piece.move(this.chessboard, dst);

        return [true, captured_piece];
    }

    getPieceName(pos){
        let p = this.chessboard[pos];
        return p? p.toString() : "";
    }

    toString(){
        let str = "";
        for(let pos in this.chessboard){
            str += ChessModel.getCanonicalPosition(pos)+": "+this.getPieceName(pos)+"\n";
        }

        return str;
    }
}

class ChessView{
    black;
    model;
    onPointerDown;
    onPointerUp;
    onPointerEnter;
    onPointerLeave;
    chessboard;
    src;

    constructor({model, black = false, onPointerDown, onPointerUp, onPointerEnter, onPointerLeave}){
        this.model = model;
        this.black = black;
        this.onPointerDown = onPointerDown;
        this.onPointerUp = onPointerUp;
        this.onPointerEnter = onPointerEnter;
        this.onPointerLeave = onPointerLeave;

        this.chessboard = document.getElementById("chessboard");
        
        if(!this.black)
            this.chessboard.classList.add("rotate");

        for(let pos = 0; pos <= 63; pos++){
            this.initCell(pos);
        }

        delete this.constructor;
    }

    move(src, dst){
        let src_cell = document.getElementById(src);
        let dst_cell = document.getElementById(dst);

        dst_cell.removeChild(dst_cell.firstChild);
        dst_cell.appendChild(src_cell.firstChild);
        src_cell.appendChild(document.createElement("span"));
    }

    capture(){}

    initCell(pos){        
        let cell = document.createElement("div");
        cell.id = pos;

        cell.appendChild(document.createElement("span"));
        cell.firstChild.innerText = this.model.getPieceName(pos);

        let even_col = ChessModel.getCol(pos) % 2 == 0;
        let even_row = ChessModel.getRow(pos) % 2 == 0;
        let black_or_white = even_col != even_row ? "black" : "white"
        
        cell.classList.add("cell", black_or_white);
        if(!this.black) cell.classList.add("rotate");
        
        cell.addEventListener("pointerdown", this.onPointerDown);
        cell.addEventListener("pointerup", this.onPointerUp);
        cell.addEventListener("pointerenter", this.onPointerEnter);
        cell.addEventListener("pointerleave", this.onPointerLeave);

        this.chessboard.appendChild(cell);
    }
}


class Chess{
    model;
    view;
    constructor(){
        this.model = new ChessModel();
        this.view = new ChessView({
            model: this.model,
            onPointerDown: this.onPointerDown.bind(this),
            onPointerUp: this.onPointerUp.bind(this),
            onPointerEnter: this.onPointerEnter.bind(this),
            onPointerLeave: this.onPointerLeave.bind(this)
        });
        delete this.constructor;
    }

    onPointerDown(e){
        let id = parseInt(e.target.id);
        if(!this.model.chessboard[id]) return;
        this.view.src = id;
        this.view.chessboard.children.item(this.view.src).classList.add("grey");
        // segnala mosse valide
    }

    onPointerEnter(e){
        if(!this.view.src) return;
        if(this.view.src == e.target.id) return;

        this.view.chessboard.children.item(e.target.id).classList.add("hover");
    }

    onPointerLeave(e){
        if(!this.view.src) return;

        this.view.chessboard.children.item(e.target.id).classList.remove("hover");
    }

    onPointerUp(e){
        let dst = parseInt(e.target.id);
        this.move(this.view.src, dst);
        this.view.chessboard.children.item(this.view.src).classList.remove("grey");
        this.view.chessboard.children.item(dst).classList.remove("hover");
        this.view.src = null;
    }

    move(src, dst){
        if(src == dst) return;

        let [moved, captured_piece] = this.model.move(src, dst);

        if(captured_piece) this.view.capture(captured_piece);
        
        if(moved) this.view.move(src, dst);
    }

    toString(){
        return this.model.toString();
    }
}