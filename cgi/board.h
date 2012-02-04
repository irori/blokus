#ifndef BOARD_H_
#define BOARD_H_

#include <string>
#include <string.h>
#include "piece.h"
using std::string;

class Move {
public:
    Move() {}
    Move(unsigned short m) : m_(m) {};
    Move(const char* fourcc);
    Move(int x, int y, int piece_id) : m_(x << 4 | y | piece_id << 8) {}
    int x() const { return m_ >>4 & 0xf; }
    int y() const { return m_ & 0xf; }
    int piece_id() const { return m_ >> 8; }
    int block_id() const { return m_ >> 11; }
    int direction() const { return m_ >> 8 & 0x7; }
    bool is_pass() const { return m_ == 0xffff; }
    string fourcc() const;
    bool operator<(const Move& rhs) const { return m_ < rhs.m_; }
    bool operator==(const Move& rhs) const { return m_ == rhs.m_; }
    unsigned char xy() const { return m_ & 0xff; }
    unsigned short to_i() const { return m_; }
    Move mirror() const;
private:
    unsigned short m_;
};

static Move INVALID_MOVE(0xfffe);
static Move PASS(0xffff);

class MovableVisitor {
public:
    virtual ~MovableVisitor() {}
    virtual bool visit_move(Move m) = 0;
};

class Board {
public:
    static const int NBLOCK = 21;
    static const int XSIZE = 14;
    static const int YSIZE = 14;
    static const int START1X = 4;
    static const int START1Y = 4;
    static const int START2X = 9;
    static const int START2Y = 9;
    static const int KEY_SIZE = NBLOCK*2 + NBLOCK;
    static bool in_bounds(int x, int y) {
	return (x >= 0 && y >= 0 && x < XSIZE && y < YSIZE);
    }
    Board();
    unsigned char& at(int x, int y) { return square[y][x]; }
    int turn() { return turn_; }
    bool is_violet() { return (turn_ & 1) == 0; }
    bool is_valid_move(Move move);
    void do_move(Move move);
    void do_pass() { turn_++; }
    int movables(Move* movables);
    bool each_movable(MovableVisitor* visitor);
    Board child(Move move) {
	Board c(*this);
	c.do_move(move);
	return c;
    }
    int evaluate() { return eval_blocks() + eval_effect(); }
    int nega_eval() { return is_violet() ? evaluate() : -evaluate(); }
    int violet_score() { return calc_score(block_info); }
    int orange_score() { return calc_score(block_info + NBLOCK); }
    int nega_score() {
	int b = violet_score(), w = orange_score();
	return is_violet() ? b - w : w - b;
    }
    void key(char* buf) { memcpy(buf, block_info, KEY_SIZE); }
    void show();
protected:
    unsigned char square[YSIZE][XSIZE];
    int turn_;
    unsigned char block_info[KEY_SIZE];

    const unsigned char* blocks() {
	return is_violet() ? block_info : block_info + NBLOCK;
    }
    bool move_filter(const Piece *piece);
    bool is_movable(int px, int py, const Piece *piece);
    int calc_score(unsigned char* blks_vec);
    int eval_blocks();
    int eval_effect();
};

class BoardMapKey {
public:
    BoardMapKey(Board& b) { b.key(b_); }
    bool operator<(const BoardMapKey& rhs) const {
	return memcmp(b_, rhs.b_, sizeof(b_)) < 0;
    }
private:
    char b_[Board::KEY_SIZE];
};

#endif // BOARD_H_
