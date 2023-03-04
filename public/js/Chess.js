const PIECE_ROW = Object.freeze([Rook, Knight, Bishop, Queen, King, Bishop, Knight, Rook]);
const ROW_INDEXES = Object.freeze(["1", "2", "3", "4", "5", "6", "7", "8"]);
const COL_INDEXES = Object.freeze(["A", "B", "C", "D", "E", "F", "G", "H"]);
const TEAM = Object.freeze({ WHITE: 1, BLACK: -1})
class ChessModel{
    chessboard;

    constructor(){
        this.chessboard = new Array(64).fill(null);

        for(let i = 0; i < PIECE_ROW.length; i++){
            let MyPiece = PIECE_ROW[i];
            let wid = i;
            let bid = this.chessboard.length - i - 1;
            
            this.chessboard[wid] = new MyPiece(TEAM.WHITE, wid);
            this.chessboard[wid + 8] = new Pawn(TEAM.WHITE, wid + 8);
            this.chessboard[bid] = new MyPiece(TEAM.BLACK, bid);
            this.chessboard[bid - 8] = new Pawn(TEAM.BLACK, bid - 8);
        }
    }

    insufficientMaterial(){
        return false;
    }

    isCheck(turn){
        return Piece.isCheck(this.chessboard, turn, -turn);
    }

    isStall(turn){
        for(let p of this.chessboard){
            if(p === null) continue;
            if(p.owner === turn) continue;
            
            if(p.getValidMoves(this.chessboard).length > 0)
                return false;
        }
        return true;
    }

    isCheckMate(turn){
        return this.isCheck(turn) && this.isStall(turn);
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
        let castle = null;

        if(piece.castle_moves){
            for(let move of piece.castle_moves){
                if(move.move === dst){
                    castle = move;
                }
            }
        }

        let en_passant = null;
        if(piece.en_passant){
            let en_passant_move = piece.en_passant.current_position + piece.owner*MOVES[DIRECTIONS.UP]
            if(en_passant_move === dst){
                en_passant = piece.en_passant;
                captured_piece = en_passant;
            }
            piece.en_passant = null;
        }
        piece.move(this.chessboard, dst);

        return [true, captured_piece, castle, en_passant];
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
    src = null;

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

    remove(position){
        let cell = document.getElementById(position);

        cell.removeChild(cell.firstChild)
            .appendChild(document.createElement("span"))
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
    turn;

    constructor(){
        this.model = new ChessModel();
        this.view = new ChessView({
            model: this.model,
            onPointerDown: this.onPointerDown.bind(this),
            onPointerUp: this.onPointerUp.bind(this),
            onPointerEnter: this.onPointerEnter.bind(this),
            onPointerLeave: this.onPointerLeave.bind(this)
        });

        this.turn = TEAM.WHITE;

        delete this.constructor;
    }

    onDraw(reason){
        console.log("Draw by", reason);
    }

    onWin(turn){
        let player = turn === TEAM.WHITE? "White" : "Black";

        console.log(player, "wins")
    }

    isTheirTurn(pos){
        if (this.model.chessboard[pos] === null) return false;
        return this.turn === this.model.chessboard[pos].owner;
    }

    onPointerDown(e){
        let id = parseInt(e.target.id);
        if(!this.model.chessboard[id]) return;
        if(!this.isTheirTurn(id)) return;
        this.view.src = id;
        this.view.chessboard.children.item(this.view.src).classList.add("grey");
        // segnala mosse valide
        this.model.chessboard[this.view.src].getValidMoves(this.model.chessboard)
            .map( i => this.view.chessboard.children.item(i).classList.add("valid"))
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

        if(this.view.src === null) return

        // rimuovi mosse valide
        this.model.chessboard[this.view.src].getValidMoves(this.model.chessboard)
            .map( i => this.view.chessboard.children.item(i).classList.remove("valid"))

        this.move(this.view.src, dst);
        this.view.chessboard.children.item(this.view.src).classList.remove("grey");
        this.view.chessboard.children.item(dst).classList.remove("hover");
        this.view.src = null;

        
    }

    move(src, dst){
        if(src == dst) return;

        let [moved, captured_piece, castle, en_passant] = this.model.move(src, dst);

        if(captured_piece) this.view.capture(captured_piece);
        
        if(moved) {
            this.view.move(src, dst);

            if(en_passant){
                this.model.chessboard[en_passant.current_position] = null;
                this.view.remove(en_passant.current_position)
            }
            if(castle){
                this.view.move(castle.rook.current_position, castle.castle)
                castle.rook.move(this.model.chessboard, castle.castle);
            }
            
            if(this.model.insufficientMaterial()){
                this.onDraw("INSUFFICIENT MATERIAL");
            }

            // check checkmate
            if(this.model.isCheckMate(this.turn)){
                this.onWin(this.turn);
                return;
            }

            // check stall
            if(this.model.isStall(this.turn)){
                this.onDraw("STALL");
                return;
            }

            this.turn *= -1;
        }
    }

    toString(){
        return this.model.toString();
    }
}