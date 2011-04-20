#ifndef PROBCUT_H_
#define PROBCUT_H_

#define PROBCUT_MIN_HEIGHT 3
#define PROBCUT_MAX_HEIGHT 10
#define PROBCUT_MAX_TURN 24

struct ProbCut {
    int depth;
    double a, b, sigma;
};

const ProbCut probcut_table[PROBCUT_MAX_TURN+1][PROBCUT_MAX_HEIGHT] = {
#include "probcut.tab.c"
};

inline const ProbCut* probcut_entry(int turn, int depth)
{
    if (depth < PROBCUT_MIN_HEIGHT || depth > PROBCUT_MAX_HEIGHT ||
	turn > PROBCUT_MAX_TURN)
	return NULL;
    const ProbCut* pc = &probcut_table[turn][depth - PROBCUT_MIN_HEIGHT];
    if (pc->depth == 0)
	return NULL;
    return pc;
}

#endif // PROBCUT_H_
