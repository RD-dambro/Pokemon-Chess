
const DIRECTIONS = Object.freeze({   
    UP_LEFT: 0,     UP: 1,      UP_RIGHT:2,
    LEFT: 3,                    RIGHT: 4,
    DOWN_LEFT: 5,   DOWN: 6,    DOWN_RIGHT: 7,
})

const MOVES = Object.freeze([7, 8, 9, -1, 1, -9, -8, -7]);
const OWNER = Object.freeze({ WHITE: 1, BLACK: -1});
class Piece{
    owner;
    current_position;
    being_visited;
    first_move;

    constructor(owner, pos, being_visited = false, first_move = true){
        this.owner = owner;
        this.current_position = pos;
        this.being_visited = being_visited;
        this.first_move = first_move;
    }

    static isCheck(board, attacker, defender){

        let king;

        // console.log(board)
        for(let p of board){
            if(p === undefined){
                debugger;
            }
            if(p === null) continue;
            if(p.owner === attacker) continue;

            if(p.isKing()){
                king = p;
            }
        }

        if(!king) return false;

        for(let p of board){
            if(p === undefined){
                debugger;
            }
            if(p === null) continue;
            if(p.owner === defender) continue;

            p.being_visited = true;

            if(p.getValidTakes(board).includes(king.current_position)){
                p.being_visited = false;
                return true;
            }
            p.being_visited = false;
        }

        return false;
    }

    filterCheck(board, pos){
        let deepCopy = board.map(p => p ? p.clone() : null);

        deepCopy[this.current_position].current_position = pos;
        deepCopy[pos] = deepCopy[this.current_position];
        deepCopy[this.current_position] = null;
        
        return !Piece.isCheck(deepCopy, -this.owner, this.owner);
    }

    clone(){
        let MyPiece = PIECES[this.toString()];
        return new MyPiece(this.owner, this.current_position, this.being_visited, this.first_move);
    }

    isKing(){
        return this.toString() == "King";
    }

    getValidMoves(board){}

    getValidTakes(board){
        return this.getValidMoves(board).filter(p => !this.isEmpty(board, p))
    }

    opponentCanTake(board, pos){
        let deepCopy = board.map(p => p ? p.clone() : null);

        deepCopy[this.current_position].current_position = pos;
        deepCopy[pos] = deepCopy[this.current_position];
        deepCopy[this.current_position] = null;

        for(let p of deepCopy){
            if(p === undefined){
                debugger;
            }
            if(p === null) continue;
            if(p.owner === this.owner) continue;
            
            p.being_visited = true;

            let valid_takes = p.getValidTakes(deepCopy);
            if(valid_takes.includes(pos)) {
                p.being_visited = false;
                return true;
            }

            p.being_visited = false;
        }

        return false;
    }

    isNotFriendly(board, pos){
        if(board[pos] === null) return true;

        return board[pos].owner != this.owner;
    }

    isInBoard(board, pos){
        return pos in board;
    }

    isEmpty(board, pos){
        return board[pos] === null;
    }

    getStraightMoves(board, direction, min, max){
        let pos = this.current_position + MOVES[direction];
        let moves = [];

        while(min <= pos && pos <= max){
            if(!this.isInBoard(board, pos)) break;
            if(this.isEmpty(board, pos)){
                moves.push(pos);
            }
            else{
                if(this.isNotFriendly(board, pos)){
                    moves.push(pos);
                }
                break;
            }

            pos += MOVES[direction];
        }

        return moves;
    }

    move(board, target_position){
        board[this.current_position] = null;

        this.current_position = target_position;

        board[target_position] = this; 
    }

    toString(){
        return `${this.constructor.name}`;
    }
}


class Rook extends Piece{
    getValidMoves(board){
        let max_up = 64 - 8 + (this.current_position % 8);
        let min_down = this.current_position % 8;
        let max_right = (parseInt(this.current_position / 8) + 1) * 8 - 1;
        let min_left = (parseInt(this.current_position / 8) + 1) * 8 - 8;

        const up_moves = this.getStraightMoves(board, DIRECTIONS.UP, this.current_position, max_up);
        const down_moves = this.getStraightMoves(board, DIRECTIONS.DOWN, min_down, this.current_position);
        const left_moves = this.getStraightMoves(board, DIRECTIONS.LEFT, min_left, this.current_position);
        const right_moves = this.getStraightMoves(board, DIRECTIONS.RIGHT, this.current_position, max_right);

        let moves = [...up_moves, ...down_moves, ...left_moves, ...right_moves];

        if(!this.being_visited)
            moves = moves.filter(pos => this.filterCheck(board, pos));

        return moves;
    }
    move(...args){
        super.move(...args);

        if(this.first_move){
            this.first_move = false;
        }
    }
}

class Knight extends Piece{
    getValidMoves(board){
        let row = parseInt(this.current_position / 8);
        let col = this.current_position % 8;
        let moves = [];
        
        // up moves
        if(row <= 5){
            if(col >= 1){
                moves.push(this.current_position + 2*MOVES[DIRECTIONS.UP] + MOVES[DIRECTIONS.LEFT])
            }
            if( col <= 6){
                moves.push(this.current_position + 2*MOVES[DIRECTIONS.UP] + MOVES[DIRECTIONS.RIGHT])
            }
        }

        // down moves
        if(row >= 2){
            if(col >= 1){
                moves.push(this.current_position + 2*MOVES[DIRECTIONS.DOWN] + MOVES[DIRECTIONS.LEFT])
            }
            if( col <= 6){
                moves.push(this.current_position + 2*MOVES[DIRECTIONS.DOWN] + MOVES[DIRECTIONS.RIGHT])
            }
        }

        // left moves
        if(col >= 2){
            if(row >= 1){
                moves.push(this.current_position + 2*MOVES[DIRECTIONS.LEFT] + MOVES[DIRECTIONS.DOWN])
            }
            if( row <= 6){
                moves.push(this.current_position + 2*MOVES[DIRECTIONS.LEFT] + MOVES[DIRECTIONS.UP])
            }
        }

        // right moves
        if(col <= 5){
            if(row >= 1){
                moves.push(this.current_position + 2*MOVES[DIRECTIONS.RIGHT] + MOVES[DIRECTIONS.DOWN])
            }
            if( row <= 6){
                moves.push(this.current_position + 2*MOVES[DIRECTIONS.RIGHT] + MOVES[DIRECTIONS.UP])
            }
        }

        moves = moves.filter(p => this.isInBoard(board, p))
            .filter(p => this.isNotFriendly(board, p));

        if(!this.being_visited)
            moves = moves.filter(pos => this.filterCheck(board, pos));

        return moves;
    }
}

class Bishop extends Piece{
    getValidMoves(board){
        let row = parseInt(this.current_position / 8)
        let col = this.current_position % 8;

        let min_dl = this.current_position 
            + Math.min(col, row)*MOVES[DIRECTIONS.DOWN_LEFT];
        let max_ur = this.current_position 
            + Math.min(8 - col - 1, 8 - row - 1)*MOVES[DIRECTIONS.UP_RIGHT];
        let min_dr = this.current_position 
            + Math.min(8 - col - 1, row)*MOVES[DIRECTIONS.DOWN_RIGHT];
        let max_ul = this.current_position 
            + Math.min(col, 8 - row - 1)*MOVES[DIRECTIONS.UP_LEFT];

        const dl_moves = this.getStraightMoves(board, DIRECTIONS.DOWN_LEFT, min_dl, this.current_position);
        const ur_moves = this.getStraightMoves(board, DIRECTIONS.UP_RIGHT, this.current_position, max_ur);
        const dr_moves = this.getStraightMoves(board, DIRECTIONS.DOWN_RIGHT, min_dr, this.current_position);
        const ul_moves = this.getStraightMoves(board, DIRECTIONS.UP_LEFT, this.current_position, max_ul);
        
        let moves = [...dl_moves, ...ur_moves, ...dr_moves, ...ul_moves];
        if(!this.being_visited)
            moves = moves.filter(pos => this.filterCheck(board, pos));

        return moves;
    }
}

class Queen extends Piece{
    getValidMoves(board){
        let max_up = 64 - 8 + (this.current_position % 8);
        let min_down = this.current_position % 8;
        let max_right = (parseInt(this.current_position / 8) + 1) * 8 - 1;
        let min_left = (parseInt(this.current_position / 8) + 1) * 8 - 8;

        let row = parseInt(this.current_position / 8)
        let col = this.current_position % 8;

        let min_dl = this.current_position 
            + Math.min(col, row)*MOVES[DIRECTIONS.DOWN_LEFT];

        let max_ur = this.current_position 
            + Math.min(8 - col - 1, 8 - row - 1)*MOVES[DIRECTIONS.UP_RIGHT];

        let min_dr = this.current_position 
            + Math.min(8 - col - 1, row)*MOVES[DIRECTIONS.DOWN_RIGHT];
            
        let max_ul = this.current_position 
            + Math.min(col, 8 - row - 1)*MOVES[DIRECTIONS.UP_LEFT];

        const dl_moves = this.getStraightMoves(board, DIRECTIONS.DOWN_LEFT, min_dl, this.current_position);
        const ur_moves = this.getStraightMoves(board, DIRECTIONS.UP_RIGHT, this.current_position, max_ur);
        const dr_moves = this.getStraightMoves(board, DIRECTIONS.DOWN_RIGHT, min_dr, this.current_position);
        const ul_moves = this.getStraightMoves(board, DIRECTIONS.UP_LEFT, this.current_position, max_ul);

        const up_moves = this.getStraightMoves(board, DIRECTIONS.UP, this.current_position, max_up);
        const down_moves = this.getStraightMoves(board, DIRECTIONS.DOWN, min_down, this.current_position);
        const left_moves = this.getStraightMoves(board, DIRECTIONS.LEFT, min_left, this.current_position);
        const right_moves = this.getStraightMoves(board, DIRECTIONS.RIGHT, this.current_position, max_right);

        let moves = [...up_moves, ...down_moves, ...left_moves, ...right_moves, ...dl_moves, ...ur_moves, ...dr_moves, ...ul_moves];

        if(!this.being_visited)
            moves = moves.filter(pos => this.filterCheck(board, pos));

        return moves;
    }
}

class King extends Piece{
    castle_moves = [];

    getValidMoves(board){

        let col = this.current_position % 8;

        let max_up = this.current_position + MOVES[DIRECTIONS.UP];
        let min_down = this.current_position + MOVES[DIRECTIONS.DOWN];
        let max_right = this.current_position + MOVES[DIRECTIONS.RIGHT]*Math.min(1, 7 - col);
        let min_left = this.current_position + MOVES[DIRECTIONS.LEFT]*Math.min(1, col);

        let min_dl = this.current_position + MOVES[DIRECTIONS.DOWN_LEFT]*Math.min(1, col);
        let max_ur = this.current_position + MOVES[DIRECTIONS.UP_RIGHT]*Math.min(1, 7-col);
        let min_dr = this.current_position + MOVES[DIRECTIONS.DOWN_RIGHT]*Math.min(1, 7-col);
        let max_ul = this.current_position + MOVES[DIRECTIONS.UP_LEFT]*Math.min(1, col);

        const dl_moves = this.getStraightMoves(board, DIRECTIONS.DOWN_LEFT, min_dl, this.current_position);
        const ur_moves = this.getStraightMoves(board, DIRECTIONS.UP_RIGHT, this.current_position, max_ur);
        const dr_moves = this.getStraightMoves(board, DIRECTIONS.DOWN_RIGHT, min_dr, this.current_position);
        const ul_moves = this.getStraightMoves(board, DIRECTIONS.UP_LEFT, this.current_position, max_ul);

        const up_moves = this.getStraightMoves(board, DIRECTIONS.UP, this.current_position, max_up);
        const down_moves = this.getStraightMoves(board, DIRECTIONS.DOWN, min_down, this.current_position);
        const left_moves = this.getStraightMoves(board, DIRECTIONS.LEFT, min_left, this.current_position);
        const right_moves = this.getStraightMoves(board, DIRECTIONS.RIGHT, this.current_position, max_right);
        
        let moves = [...up_moves, ...down_moves, ...left_moves, ...right_moves, ...dl_moves, ...ur_moves, ...dr_moves, ...ul_moves]
        
        if(!this.being_visited){
            
            moves = moves.filter(p => !this.opponentCanTake(board, p));
        
            const [check, m] = this.checkCastle(board)
            if(check){
                moves = [...moves, ...m.map(({move}) => move)];
                this.castle_moves = m;
            }
        }

        return moves;
    }

    move(board, pos){
        super.move(board, pos);

        if(this.first_move){
            this.first_move = false;
        }
    }

    checkCastle(board) {
        let moves = [];

        if(!this.first_move) return false, moves;

        // look left
        let next = this.current_position + MOVES[DIRECTIONS.LEFT];
        if(board[next] === null && this.filterCheck(board, next)){

            if(board[next + MOVES[DIRECTIONS.LEFT]] === null){
                next += MOVES[DIRECTIONS.LEFT];
                if(this.filterCheck(board, next)) {

                    // find rook
                    let rook = null;
                    let i = next;
                    while( i % 8 > 0){
                        if(board[--i] === null) continue;
                        
                        if(board[i].toString() === "Rook"){
                            rook = board[i];
                            break;
                        }
                    }

                    if(rook && rook.first_move){
                        moves.push({move: next, rook, castle: next - MOVES[DIRECTIONS.LEFT]});
                    }
                }
            }
        }


        // look right
        next = this.current_position + MOVES[DIRECTIONS.RIGHT];
        if(board[next] === null && this.filterCheck(board, next)) {

            if(board[next + MOVES[DIRECTIONS.RIGHT]] === null){
                next += MOVES[DIRECTIONS.RIGHT];
                if(this.filterCheck(board, next)) {
                    // find rook
                    let rook = null;
                    let i = next;
                    while( i % 8 < 7){
                        if(board[++i] === null) continue;

                        if(board[i].toString() === "Rook"){
                            rook = board[i];
                            break;
                        }
                    }

                    if(rook && rook.first_move){
                        moves.push({move: next, rook, castle: next - MOVES[DIRECTIONS.RIGHT]});
                    }
                }
            }
        }
        
        return [true, moves];
    }
}

class Pawn extends Piece{
    en_passant = null;

    getValidMoves(board){
        let moves_on_empty = [MOVES[DIRECTIONS.UP]];
        if(this.first_move) {
            if(board[8*this.owner+this.current_position] === null)
                moves_on_empty.push(MOVES[DIRECTIONS.UP]*2);
        }

        moves_on_empty = moves_on_empty.map(m => m*this.owner+this.current_position)
            .filter(pos => pos in board)
            .filter(pos => board[pos] === null);
        
        let moves_on_take = this.getValidTakes(board)
            .filter(pos => board[pos] !== null)
            .filter(pos => board[pos].owner != this.owner);
        
        
        let moves = [...moves_on_empty, ...moves_on_take];

        // todo en passant
        if(this.en_passant){
            moves.push(this.en_passant.current_position + this.owner*MOVES[DIRECTIONS.UP])
        }

        if(!this.being_visited)
            moves = moves.filter(pos => this.filterCheck(board, pos));

        return moves;
    }

    getValidTakes(board){
        let col = this.current_position % 8;
        
        let moves_on_take = [
            this.owner*MOVES[DIRECTIONS.UP_RIGHT]*Math.min(1, 7-col),
            this.owner*MOVES[DIRECTIONS.UP_LEFT]*Math.min(1, col)
        ];
        
        let moves = moves_on_take.filter(m => m !== 0)
            .map(pos => pos + this.current_position)
            .filter(pos => pos in board)

        if(!this.being_visited)
            moves = moves.filter(pos => this.filterCheck(board, pos));

        return moves;
    }
    move(board, target){
        super.move(board, target);

        if(this.first_move){
            this.first_move = false;

            // check left
            let left = board[target + MOVES[DIRECTIONS.LEFT]];
            if( left !== null && left.toString() === "Pawn" && left.owner != this.owner){
                left.en_passant = this;
            }
            
            // check right
            let right = board[target + MOVES[DIRECTIONS.RIGHT]];
            if( right !== null && right.toString() === "Pawn" && right.owner != this.owner){
                right.en_passant = this;
            }
        }
    }
}

const PIECES = Object.freeze({
    "Rook": Rook, 
    "Knight": Knight, 
    "Bishop": Bishop, 
    "Queen": Queen, 
    "King": King, 
    "Pawn": Pawn
});