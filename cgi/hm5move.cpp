#include <stdlib.h>
#include "board.h"
#include "search.h"
#include "opening.h"

extern "C" const char* hm5move(const char* pathstr, int time_limit);
extern "C" int getVisitedNodes();

Move com_move(Board* b, int time_ms)
{
    Move move;
    int score = 100;
    quiet = true;

    move = opening_move(b);
    if (move == INVALID_MOVE) {
	SearchResult r;
	if (b->turn() < 25)
	    r = search_negascout(b, 10, time_ms / 2, time_ms);
	else if (b->turn() < 27)
	    r = wld(b, 1000);
	else
	    r = perfect(b);
	move = r.first;
	score = r.second;
    }

    return move;
}

const char* hm5move(const char* path, int time_limit)
{
    Board b;
    while (*path) {
	Move m(path);
	path += 4;
	if (*path == '/')
	    path++;
	if (m == INVALID_MOVE || !b.is_valid_move(m))
	    return "XXXX invalid move ";
	b.do_move(m);
    }
    visited_nodes = 0;
    Move m = com_move(&b, time_limit);
    return m.fourcc();
}

int getVisitedNodes()
{
    return visited_nodes;
}
