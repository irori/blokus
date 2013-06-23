#include <vector>
#include <map>
#include <algorithm>
#include <math.h>
#include <limits.h>
#include <stdio.h>
#include <time.h>
#include <assert.h>
#include "board.h"
#include "search.h"
using namespace std;

#define USE_PROBCUT
#undef PROBSTAT

#ifdef USE_PROBCUT
#include "probcut.h"
#endif

#define CHECKPOINT_INTERVAL 10000

int visited_nodes;
static int check_point;
static clock_t expire_clock;
bool quiet = false;

typedef map<BoardMapKey, pair<int, int> > Hash;

struct Child {
    Child(Board& b, Move m, Hash* hash);
    bool operator<(const Child& rhs) const {
	return score < rhs.score;
    }
    Board board;
    int score;
    Move move;
};

Child::Child(Board& b, Move m, Hash* hash) :
    board(b.child(m)), move(m)
{
    Hash::iterator i = hash->find(BoardMapKey(board));
    if (i != hash->end()) {
	int a = i->second.first;
	int b = i->second.second;
	if (a > -INT_MAX && b < INT_MAX)
	    score = (a + b) / 2 - 1000;
	else
	    score = board.nega_eval();
    }
    else
	score = board.nega_eval();
}

class AlphaBetaVisitor : public MovableVisitor {
public:
    AlphaBetaVisitor(Board* n, int a, int b)
	: node(n), alpha(a), beta(b) {}
    virtual bool visit_move(Move move);

    Board* node;
    int alpha;
    int beta;
};

bool AlphaBetaVisitor::visit_move(Move m)
{
    visited_nodes++;
    int v = -node->child(m).nega_eval();
    if (v > alpha) {
	alpha = v;
	if (alpha >= beta)
	    return false;
    }
    return true;
}

inline double round_(double num)
{
    if (num < 0.0)
	return ceil(num - 0.5);
    else
	return floor(num + 0.5);
}

int negascout(Board* node, int depth, int alpha, int beta,
	      Move *best_move, Hash* hash, Hash* prev_hash, int hash_depth)
{
    assert(alpha <= beta);

    if (++visited_nodes >= check_point) {
	if ((int)(expire_clock - clock()) < 0)
	    throw Timeout();
	check_point += CHECKPOINT_INTERVAL;
    }

    if (depth <= 1) {
	AlphaBetaVisitor visitor(node, alpha, beta);
	if (node->each_movable(&visitor))
	    return visitor.alpha;
	else
	    return visitor.beta;
    }

    pair<int, int>* hash_entry = NULL;
    if (hash_depth > 0) {
	pair<Hash::iterator, bool> found =
	    hash->insert(make_pair(BoardMapKey(*node),
				   make_pair(-INT_MAX, INT_MAX)));
	hash_entry = &found.first->second;
	if (!found.second) {
	    int ha = hash_entry->first;
	    int hb = hash_entry->second;
	    if (hb <= alpha) return hb;
	    if (ha >= beta) return ha;
	    if (ha == hb) return ha;
	    alpha = max(alpha, ha);
	    beta = min(beta, hb);
	}
    }

#ifdef USE_PROBCUT

    /* ProbCut */
    const ProbCut* pc = probcut_entry(node->turn(), depth);

    if (pc) {
	double thresh;
	if (node->turn() >= 15)
	    thresh = 2.0;
	else
	    thresh = 1.6;

	if (beta < INT_MAX) {
	    int bound = (int)round_((thresh * pc->sigma + beta - pc->b)
				    / pc->a);
	    if (negascout(node, pc->depth, bound-1, bound,
			  NULL, hash, prev_hash, 0) >= bound)
	    {
		if (hash_entry)
		    hash_entry->first = max(hash_entry->first, beta);
		return beta;
	    }
	}
	if (alpha > -INT_MAX) {
	    int bound = (int)round_((-thresh * pc->sigma + alpha - pc->b)
				    / pc->a);
	    if (negascout(node, pc->depth, bound, bound+1,
			  NULL, hash, prev_hash, 0) <= bound)
	    {
		if (hash_entry)
		    hash_entry->second = min(hash_entry->second, alpha);
		return alpha;
	    }
	}
    }

#endif // USE_PROBCUT

    vector<Child> children;
    {
	Move movables[1500];
	int nmove = node->movables(movables);
	for (Move* move = movables; move < movables + nmove; move++)
	    children.push_back(Child(*node, *move, prev_hash+1));

	sort(children.begin(), children.end());
    }

    bool found_pv = false;
    int score_max = -INT_MAX;
    int a = alpha;

    for (vector<Child>::iterator i = children.begin();
	 i != children.end(); ++i)
    {
	int score;
	if (found_pv) {
	    score = -negascout(&i->board, depth-1, -a-1, -a, NULL,
			       hash+1, prev_hash+1, hash_depth-1);
	    if (score > a && score < beta)
		score = -negascout(&i->board, depth-1, -beta, -score,
				   NULL, hash+1, prev_hash+1, hash_depth-1);
	}
	else
	    score = -negascout(&i->board, depth-1, -beta, -a,
			       NULL, hash+1, prev_hash+1, hash_depth-1);

	if (score >= beta) {
	    if (hash_entry)
		hash_entry->first = max(hash_entry->first, score);
	    return score;
	}

	if (score > score_max) {
	    if (score > a)
		a = score;
	    if (score > alpha) {
		found_pv = true;
		if (best_move)
		    *best_move = i->move;
	    }
	    score_max = score;
	}
    }
    if (hash_entry) {
	if (score_max > alpha)
	    hash_entry->first = hash_entry->second = score_max;
	else
	    hash_entry->second = min(hash_entry->second, score_max);
    }
    return score_max;
}

SearchResult search_negascout(Board* node, int max_depth,
			      int stop_ms, int timeout_ms)
{
    Move best_move;
    int score;

    clock_t start = clock();
    expire_clock = start + timeout_ms * (CLOCKS_PER_SEC / 1000);
    check_point = visited_nodes + CHECKPOINT_INTERVAL;

#ifdef PROBSTAT
    score = negascout(node, 1, -INT_MAX, INT_MAX, NULL, NULL, NULL, 0);
    printf("1> ? ???? (%d)\n", score);
#endif

    Hash *prev_hash, *hash;
    try {
	prev_hash = new Hash[max_depth];
	for (int i = 2; i <= max_depth; i++) {
	    hash = new Hash[max_depth];
	    Move move;
	    score = negascout(node, i, -INT_MAX, INT_MAX, &move,
			      hash, prev_hash, 8);
	    double sec = (double)(clock() - start) / CLOCKS_PER_SEC;
	    if (!quiet) {
		printf("%d> %.3f %s (%d)\n",
		       i, sec, move.fourcc(), score);
	    }
	    delete[] prev_hash;
	    prev_hash = hash;
	    best_move = move;
	    if (sec * 1000 > stop_ms)
		break;
	}
	delete[] prev_hash;
    }
    catch (Timeout& e) {
	delete[] prev_hash;
	delete[] hash;
    }
    return SearchResult(best_move, score);
}

typedef map<BoardMapKey, int> WldHash;

int wld_rec(Board* node, int alpha, int beta, WldHash* hash)
{
    BoardMapKey key(*node);
    WldHash::iterator i = hash->find(key);
    if (i != hash->end())
	return node->is_violet() ? i->second : -i->second;

    if (++visited_nodes >= check_point) {
	if ((int)(expire_clock - clock()) < 0)
	    throw Timeout();
	check_point += CHECKPOINT_INTERVAL;
    }

    Move movables[1000];
    int nmove = node->movables(movables);
    if (movables[0].is_pass()) {
	int score = node->nega_score();
	if (score < 0)
	    return score;
	else if (score == 0) {
	    nmove = node->child(movables[0]).movables(movables);
	    if (movables[0].is_pass())
		return 0;
	    else
		return -block_set[movables[0].block_id()]->size;
	}
    }

    for (Move* move = movables; move < movables + nmove; move++) {
	Board child = node->child(*move);
	int v = -wld_rec(&child, -beta, -alpha, hash+1);
	if (v > alpha) {
	    alpha = v;
	    if (alpha > 0 || alpha >= beta)
		break;
	}
    }
    (*hash)[key] = node->is_violet() ? alpha : -alpha;
    return alpha;
}

SearchResult wld(Board* node, int timeout_sec)
{
    expire_clock = clock() + timeout_sec * CLOCKS_PER_SEC;
    check_point = visited_nodes + CHECKPOINT_INTERVAL;

    WldHash hash[42];
    visited_nodes++;

    int alpha = -INT_MAX, beta = INT_MAX;
    Move movables[1000];
    int nmove = node->movables(movables);
    Move wld_move;

    for (Move* move = movables; move < movables + nmove; move++) {
	Board child = node->child(*move);
	int v = -wld_rec(&child, -beta, -alpha, hash);
	if (v > alpha) {
	    alpha = v;
	    wld_move = *move;
	    if (alpha > 0 || alpha >= beta)
		break;
	}
    }
    return SearchResult(wld_move, alpha);
}

int perfect_rec(Board* node, int npass, int alpha, int beta, WldHash* hash)
{
    BoardMapKey key(*node);
    WldHash::iterator i = hash->find(key);
    if (i != hash->end())
	return node->is_violet() ? i->second : -i->second;

    visited_nodes++;

    Move movables[1000];
    int nmove = node->movables(movables);
    if (movables[0].is_pass()) {
	if (++npass >= 2)
	    return node->nega_score();
    }
    else
	npass = 0;

    for (Move* move = movables; move < movables + nmove; move++) {
	Board child = node->child(*move);
	int v = -perfect_rec(&child, npass, -beta, -alpha, hash+1);
	if (v > alpha) {
	    alpha = v;
	    if (alpha >= beta) {
		(*hash)[key] = node->is_violet() ? beta : -beta;
		return beta;
	    }
	}
    }
    (*hash)[key] = node->is_violet() ? alpha : -alpha;
    return alpha;
}

SearchResult perfect(Board* node)
{
    WldHash* hash = new WldHash[44 - node->turn()];

    visited_nodes++;

    int alpha = -INT_MAX, beta = INT_MAX;
    Move movables[1000];
    int nmove = node->movables(movables);
    int npass = movables[0].is_pass() ? 1 : 0;

    Move perfect_move;
    for (Move* move = movables; move < movables + nmove; move++) {
	Board child = node->child(*move);
	int v = -perfect_rec(&child, npass, -beta, -alpha, hash);
	if (v > alpha) {
	    alpha = v;
	    perfect_move = *move;
	}
    }
    delete[] hash;
    return SearchResult(perfect_move, alpha);
}

#if 0
void wld_test()
{
    const char *moves[] = {
	"56t2","9Ao2","39n2","6Dq0","69s2","B8u0","96l7","B5r0","84m3",
	"85m7","D7p3","44l7","43k7","17k4","C4r0","EAn0","1Co5","3Ej2",
	"12g0","72p4","99c2","A1i1","E1q3","3Bt0","CAu0", NULL
    };
    Board b;
    for (int i = 0; moves[i]; i++)
	b.do_move(Move(moves[i]));

    b.show();

    try {
	for (int npass = 0; npass < 2;) {
	    clock_t start = clock();
	    visited_nodes = 0;

	    SearchResult result = wld(&b, 5);
	    Move m = result.first;

	    double sec = (double)(clock() - start) / CLOCKS_PER_SEC;
	    printf("time(%d): %d nodes / %.3f sec (%d nps)\n",
		   b.turn(), visited_nodes, sec, (int)(visited_nodes / sec));
	    printf("\n%s (%d)\n", m.fourcc(), result.second);

	    npass = m.is_pass() ? npass+1 : 0;
	    b.do_move(m);
	    b.show();
	}
    }
    catch (Timeout& e) {
	printf("timeout\n");
    }
}

void perfect_test()
{
    const char *moves[] = {
	"46k4","9Ao7","86o7","5Cn1","A8n1","CAt6","5Am3","77m6","7Bq2",
	"8Cq2","D9r0","3Dk1","2At2","CEl2","CCp3","B8a0","D6s0","D7b2",
	"A4u0","B6d1","C3l1","----","16j0","----","AEg6","----","81i0",
	"----", NULL
    };
    Board b;
    for (int i = 0; moves[i]; i++)
	b.do_move(Move(moves[i]));

    b.show();

    for (int npass = 0; npass < 2;) {
	clock_t start = clock();
	visited_nodes = 0;

	SearchResult result = perfect(&b);
	Move m = result.first;

	double sec = (double)(clock() - start) / CLOCKS_PER_SEC;
	printf("time(%d): %d nodes / %.3f sec (%d nps)\n",
	       b.turn(), visited_nodes, sec, (int)(visited_nodes / sec));
	printf("\n%s (%d)\n", m.fourcc(), result.second);

	npass = m.is_pass() ? npass+1 : 0;
	b.do_move(m);
	b.show();
    }
}

int main()
{
    wld_test();
    return 0;
}
#endif
