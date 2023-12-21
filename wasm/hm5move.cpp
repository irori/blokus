#include <stdlib.h>
#include <time.h>

#include "blokusduo.h"
using namespace blokusduo;

extern "C" const char* hm5move(const char* pathstr, int max_depth,
                               int time_limit);
extern "C" int getVisitedNodes();

Move com_move(const Board& b, int max_depth, int time_ms) {
  Move move;
  int score = 100;

  move = search::opening_move(b);
  if (move == Move::invalid()) {
    search::SearchResult r;
    if (b.turn() < 25)
      r = search::negascout(b, max_depth, time_ms / 2, time_ms);
    else if (b.turn() < 27)
      r = search::wld(b, 1000);
    else
      r = search::perfect(b);
    move = r.first;
    score = r.second;
  }

  return move;
}

const char* hm5move(const char* path, int max_depth, int time_limit) {
  static std::string fourcc;
  static bool initialized = false;
  if (!initialized) {
    srand(time(nullptr));
    initialized = true;
  }

  Board b;
  while (*path) {
    Move m(path);
    path += 4;
    if (*path == '/') path++;
    if (m == Move::invalid() || !b.is_valid_move(m))
      return "XXXX invalid move ";
    b.play_move(m);
  }
  search::visited_nodes = 0;
  Move m = com_move(b, max_depth, time_limit);
  fourcc = m.fourcc();
  return fourcc.c_str();
}

int getVisitedNodes() { return search::visited_nodes; }
