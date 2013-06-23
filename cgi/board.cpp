#include <stdio.h>
#include <string.h>
#include <ctype.h>
#include "board.h"
#include "opening.h"
#include "str.h"

#define VIOLET_MASK 0x07
#define ORANGE_MASK 0x70
#define VIOLET_EDGE 0x01
#define ORANGE_EDGE 0x10
#define VIOLET_SIDE 0x02
#define ORANGE_SIDE 0x20
#define VIOLET_BLOCK 0x04
#define ORANGE_BLOCK 0x40
#define EFFECT 0x08

struct Edge {
    int x, y, direction;
};

Move::Move(const char* fourcc)
{
    if (fourcc[0] == '-')
	m_ = 0xffff;
    else {
	int xy;
	sscanf(fourcc, "%2X", &xy);
	m_ = xy - 0x11 |
	    (('u' - tolower(fourcc[2])) & 0x1f) << 11 |
	    (fourcc[3] - '0') << 8;
    }
}

const char* Move::fourcc() const
{
    static char buf[5];
    if (is_pass())
	strcpy(buf, "----");
    else
	sprintf(buf, "%2X%c%d",
		(m_ & 0xff) + 0x11, 'u' - block_id(), direction());
    return buf;
}

Move Move::mirror() const
{
    if (is_pass())
	return PASS;
    int d = (direction() + (direction() & 1 ? 5 : 3)) & 7;
    Rotation* rot = &block_set[block_id()]->rotations[d];
    int new_x = y() + rot->offset_x;
    int new_y = x() + rot->offset_y;
    return Move(new_x, new_y, rot->piece->id);
}

Board::Board()
{
    memset(square, 0, sizeof(square));
    at(START1X, START1Y) = VIOLET_EDGE;
    at(START2X, START2Y) = ORANGE_EDGE;

    turn_ = 0;
    memset(block_info, 0, sizeof(block_info));
}

bool Board::is_valid_move(Move move)
{
    if (move.is_pass())
	return true;

    if (blocks()[move.block_id()])
	return false;

    Rotation* rot = &block_set[move.block_id()]->rotations[move.direction()];
    int px = move.x() + rot->offset_x;
    int py = move.y() + rot->offset_y;
    Piece *piece = rot->piece;

    if (px + piece->minx < 0 || px + piece->maxx >= XSIZE ||
	py + piece->miny < 0 || py + piece->maxy >= YSIZE ||
	!is_movable(px, py, piece))
	return false;

    for (int i = 0; i < piece->size; i++) {
	int x = px + piece->coords[i].x;
	int y = py + piece->coords[i].y;
	if (at(x, y) & (is_violet() ? VIOLET_EDGE : ORANGE_EDGE))
	    return true;
    }
    return false;
}

void Board::do_move(Move move)
{
    if (move.is_pass()) {
	do_pass();
	return;
    }

    Rotation* rot = &block_set[move.block_id()]->rotations[move.direction()];
    int px = move.x() + rot->offset_x;
    int py = move.y() + rot->offset_y;
    Piece *piece = rot->piece;

    unsigned char block = is_violet() ? VIOLET_BLOCK : ORANGE_BLOCK;
    unsigned char side_bit = is_violet() ? VIOLET_SIDE : ORANGE_SIDE;
    unsigned char edge_bit = is_violet() ? VIOLET_EDGE : ORANGE_EDGE;

    for (int i = 0; i < piece->size; i++) {
	int x = px + piece->coords[i].x;
	int y = py + piece->coords[i].y;
	at(x, y) |= block;
	if (in_bounds(x-1, y)) at(x-1, y) |= side_bit;
	if (in_bounds(x, y-1)) at(x, y-1) |= side_bit;
	if (in_bounds(x+1, y)) at(x+1, y) |= side_bit;
	if (in_bounds(x, y+1)) at(x, y+1) |= side_bit;
	if (in_bounds(x-1,y-1)) at(x-1,y-1) |= edge_bit;
	if (in_bounds(x+1,y-1)) at(x+1,y-1) |= edge_bit;
	if (in_bounds(x-1,y+1)) at(x-1,y+1) |= edge_bit;
	if (in_bounds(x+1,y+1)) at(x+1,y+1) |= edge_bit;
    }

    int blk = is_violet() ? move.block_id() : move.block_id() + NBLOCK;
    block_info[blk] = move.xy() + 0x11;
    block_info[NBLOCK*2 + move.block_id()] |=
	is_violet() ? move.direction() : move.direction() << 4;

    turn_++;
}

inline bool Board::move_filter(const Piece *piece)
{
    if (turn() < 8 && piece->size < 5)
	return false;
    else
	return true;
}

bool Board::is_movable(int px, int py, const Piece *piece)
{
    unsigned char mask = is_violet() ? VIOLET_BLOCK|VIOLET_SIDE|ORANGE_BLOCK
				     : ORANGE_BLOCK|ORANGE_SIDE|VIOLET_BLOCK;

    for (int i = 0; i < piece->size; i++) {
	int x = px + piece->coords[i].x;
	int y = py + piece->coords[i].y;
	if (at(x, y) & mask)
	    return false;
    }
    return true;
}

class MoveCollector : public MovableVisitor {
public:
    MoveCollector(Move* a) : movables(a), nmove(0) {}
    virtual bool visit_move(Move m) {
	movables[nmove++] = m;
	return true;
    }
    Move* movables;
    int nmove;
};

int Board::movables(Move* movables)
{
    MoveCollector collector(movables);
    each_movable(&collector);
    return collector.nmove;
}

bool Board::each_movable(MovableVisitor* visitor)
{
    if (turn() < 2) {
	const unsigned short *move = (turn() == 0) ?
	    violet_first_moves : orange_first_moves;
	for (; *move; move++) {
	    Move m(*move);
	    if (move_filter(block_set[m.block_id()]->
			    rotations[m.direction()].piece))
	    {
		if (!visitor->visit_move(m))
		    return false;
	    }
	}
	return true;
    }

    Edge edges[100], *pedge;
    {
	unsigned char edge_mask = is_violet()
	    ? VIOLET_MASK | ORANGE_BLOCK
	    : ORANGE_MASK | VIOLET_BLOCK;
	unsigned char edge_bit = is_violet() ? VIOLET_EDGE : ORANGE_EDGE;
	unsigned char side_bit = is_violet() ? VIOLET_SIDE : ORANGE_SIDE;

	pedge = edges;
	for (int ey = 0; ey < YSIZE; ey++) {
	    for (int ex = 0; ex < XSIZE; ex++) {
		if ((at(ex, ey) & edge_mask) == edge_bit) {
		    pedge->x = ex;
		    pedge->y = ey;
		    pedge->direction = (ey > 0 && at(ex, ey-1) & side_bit)
			? (ex > 0 && (at(ex-1, ey) & side_bit) ? 0 : 1)
			: (ex > 0 && (at(ex-1, ey) & side_bit) ? 2 : 3);
		    pedge++;
		}
	    }
	}
	pedge->x = -1;
    }

    int nmove = 0;
    for (int blk = 0; blk < NBLOCK; blk++) {
	if (blocks()[blk])
	    continue;
	Block* block = block_set[blk];
	for (Piece **variation = block->variations; *variation; variation++) {
	    if (!move_filter(*variation))
		continue;
	    short checked[YSIZE];
	    memset(checked, 0, sizeof(checked));
	    for (pedge = edges; pedge->x >= 0; pedge++) {
		for (int i = 0; i < (*variation)->nedge[pedge->direction]; i++) {
		    int x = pedge->x - (*variation)->edges[pedge->direction][i].x;
		    int y = pedge->y - (*variation)->edges[pedge->direction][i].y;
		    if (y + (*variation)->miny < 0 ||
			y + (*variation)->maxy >= YSIZE ||
			x + (*variation)->minx < 0 ||
			x + (*variation)->maxx >= XSIZE ||
			(checked[y] & 1 << x))
			continue;
		    checked[y] |= 1 << x;
		    if (is_movable(x, y, *variation)) {
			if (!visitor->visit_move(Move(x, y, (*variation)->id)))
			    return false;
			nmove++;
		    }
		}
	    }
	}
    }
    if (nmove == 0)
	return visitor->visit_move(PASS);

    return true;
}

int Board::calc_score(unsigned char* blks_vec)
{
    int score = 0;

    for (int i = 0; i < NBLOCK; i++) {
	if (blks_vec[i])
	    score += block_set[i]->size;
    }
    return score;
}

int Board::eval_blocks()
{
    const int table[NBLOCK] = {
	16,16,16,16,16,16,16,16,16,16,16,16, 10,10,10,10,10, 6,6, 4, 2
    };
    int score = 0;

    for (int i = 0; i < NBLOCK; i++) {
	if (block_info[i] == 0)
	    score -= table[i];
	if (block_info[NBLOCK + i] == 0)
	    score += table[i];
    }
    return score;
}

int Board::eval_effect()
{
    unsigned char b[16*15];
    unsigned char *edges[2][YSIZE*XSIZE], **pedge, **pnew_edge;
    int score = 0;

    for (int x = 0; x <= XSIZE; x++)
	b[x] = VIOLET_BLOCK|ORANGE_BLOCK;
    for (int y = 0; y <= YSIZE; y++)
	b[y*15+XSIZE] = VIOLET_BLOCK|ORANGE_BLOCK;
    for (int x = 0; x <= XSIZE; x++)
	b[225+x] = VIOLET_BLOCK|ORANGE_BLOCK;

    for (int player = 0; player < 2; player++) {
	const unsigned char mask[2] = { VIOLET_MASK|ORANGE_BLOCK,
					ORANGE_MASK|VIOLET_BLOCK };
	const unsigned char edge[2] = { VIOLET_EDGE, ORANGE_EDGE };

	pedge = edges[0];
	for (int y = 0; y < YSIZE; y++) {
	    for (int x = 0; x < XSIZE; x++) {
		b[(y+1)*15+x] = at(x,y) & mask[player];
		if (b[(y+1)*15+x] == edge[player]) {
		    *pedge++ = &b[(y+1)*15+x];
		    score++;
		}
	    }
	}
	*pedge = NULL;

	pedge     = edges[0];
	pnew_edge = edges[1];
	while (*pedge) {
	    unsigned char* pos = *pedge++;
	    if (pos[-15] == 0) {
		pos[-15] = 1;
		*pnew_edge++ = pos-15;
		score++;
	    }
	    if (pos[-1] == 0) {
		pos[-1] = 1;
		*pnew_edge++ = pos-1;
		score++;
	    }
	    if (pos[1] == 0) {
		pos[1] = 1;
		*pnew_edge++ = pos+1;
		score++;
	    }
	    if (pos[15] == 0) {
		pos[15] = 1;
		*pnew_edge++ = pos+15;
		score++;
	    }
	}
	*pnew_edge = NULL;

	pedge     = edges[1];
	pnew_edge = edges[0];
	while (*pedge) {
	    unsigned char* pos = *pedge++;
	    if (pos[-15] == 0) {
		pos[-15] = 1;
		*pnew_edge++ = pos-15;
		score++;
	    }
	    if (pos[-1] == 0) {
		pos[-1] = 1;
		*pnew_edge++ = pos-1;
		score++;
	    }
	    if (pos[1] == 0) {
		pos[1] = 1;
		*pnew_edge++ = pos+1;
		score++;
	    }
	    if (pos[15] == 0) {
		pos[15] = 1;
		*pnew_edge++ = pos+15;
		score++;
	    }
	}
	*pnew_edge = NULL;

	pedge = edges[0];
	while (*pedge) {
	    unsigned char* pos = *pedge++;
	    if (pos[-15] == 0) {
		pos[-15] = 1;
		score++;
	    }
	    if (pos[-1] == 0) {
		pos[-1] = 1;
		score++;
	    }
	    if (pos[1] == 0) {
		pos[1] = 1;
		score++;
	    }
	    if (pos[15] == 0) {
		pos[15] = 1;
		score++;
	    }
	}

	score = -score;
    }
    return score;
}

void Board::show()
{
    unsigned char b[2][YSIZE+2][XSIZE+1];
    int edges1[YSIZE*XSIZE], *pedge;
    int edges2[YSIZE*XSIZE], *pnew_edge;

    for (int player = 0; player < 2; player++) {
	for (int x = 0; x <= XSIZE; x++)
	    b[player][0][x] = VIOLET_BLOCK|ORANGE_BLOCK;
	for (int y = 0; y <= YSIZE; y++)
	    b[player][y][XSIZE] = VIOLET_BLOCK|ORANGE_BLOCK;
	for (int x = 0; x <= XSIZE; x++)
	    b[player][YSIZE+1][x] = VIOLET_BLOCK|ORANGE_BLOCK;

	unsigned char mask = player == 0 ? (VIOLET_MASK|ORANGE_BLOCK)
					 : (ORANGE_MASK|VIOLET_BLOCK);
	unsigned char edge = player == 0 ? VIOLET_EDGE : ORANGE_EDGE;

	pedge = edges1;
	for (int y = 0; y < YSIZE; y++) {
	    for (int x = 0; x < XSIZE; x++) {
		b[player][y+1][x] = at(x,y) & mask;
		if (b[player][y+1][x] == edge) {
		    *pedge++ = x;
		    *pedge++ = y+1;
		}
	    }
	}
	*pedge = -1;

	for (int iterate = 0; iterate < 3; iterate++) {
	    pnew_edge = (iterate % 2) ? edges1 : edges2;
	    pedge     = (iterate % 2) ? edges2 : edges1;
	    while (*pedge >= 0) {
		int x = *pedge++;
		int y = *pedge++;
		if (b[player][y-1][x] == 0) {
		    b[player][y-1][x] = EFFECT;
		    *pnew_edge++ = x;
		    *pnew_edge++ = y-1;
		}
		if (b[player][y][x-1] == 0) {
		    b[player][y][x-1] = EFFECT;
		    *pnew_edge++ = x-1;
		    *pnew_edge++ = y;
		}
		if (b[player][y][x+1] == 0) {
		    b[player][y][x+1] = EFFECT;
		    *pnew_edge++ = x+1;
		    *pnew_edge++ = y;
		}
		if (b[player][y+1][x] == 0) {
		    b[player][y+1][x] = EFFECT;
		    *pnew_edge++ = x;
		    *pnew_edge++ = y+1;
		}
	    }
	    *pnew_edge = -1;
	}
    }
    puts("  " STR_BOARD_HEADER);
    puts("  " STR_FRAME_TOP);
    for (int y = 0; y < YSIZE; y++) {
	printf(" %X", y+1);
	for (int color = 0; color <= 1; color++) {
	    printf(STR_FRAME_SIDE);
	    for (int x = 0; x < XSIZE; x++) {
		unsigned char c = at(x, y);
		if (c & (color ? ORANGE_BLOCK : VIOLET_BLOCK))
		    printf(STR_VIOLET_BLOCK);
		else if (c & (color ? VIOLET_BLOCK : ORANGE_BLOCK))
		    printf(STR_ORANGE_BLOCK);
		else if (c & (color ? ORANGE_SIDE : VIOLET_SIDE))
		    printf(STR_BLANK);
		else if (c & (color ? ORANGE_EDGE : VIOLET_EDGE))
		    printf(STR_EDGE);
		else if (b[color][y+1][x] == EFFECT)
		    printf(STR_EFFECT);
		else
		    printf(STR_BLANK);
	    }
	}
	printf(STR_FRAME_SIDE "\n");
    }
    puts("  " STR_FRAME_BOTTOM);

    printf(" violet:");
    for (int b = NBLOCK-1; b >= 0; b--) {
	if (block_info[b] == 0)
	    printf(" %c", block_set[b]->name());
    }
    printf(" (%d)\n", violet_score());
    printf(" orange:");
    for (int b = NBLOCK-1; b >= 0; b--) {
	if (block_info[b + NBLOCK] == 0)
	    printf(" %c", block_set[b]->name());
    }
    printf(" (%d)\n", orange_score());
}
