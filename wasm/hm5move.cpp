#include <emscripten.h>
#include <stdlib.h>
#include <time.h>

#include <string_view>

#include "blokusduo.h"
using namespace blokusduo;

EM_JS(unsigned, clock_ms, (), { return performance.now(); });

Move com_move(const Board& b, int max_depth, int limit_ms) {
  Move move = search::opening_move(b);
  if (move.is_valid()) return move;

  unsigned start_ms = clock_ms();
  search::SearchResult r;
  if (b.turn() < 25) {
    r = search::negascout(
        b, max_depth, [start_ms, limit_ms](int depth, search::SearchResult r) {
          unsigned now = clock_ms();
          printf("%d> %s %d nodes %d ms\n", depth, r.first.code().c_str(),
                 search::visited_nodes, now - start_ms);
          return now < start_ms + limit_ms;
        });
  } else if (b.turn() < 27) {
    r = search::wld(b);
  } else {
    r = search::perfect(b);
  }
  return r.first;
}

extern "C"
const char* hm5move(const char* path, int max_depth, int limit_ms) {
  static std::string fourcc;
  static bool initialized = false;
  if (!initialized) {
    srand(time(nullptr));
    initialized = true;
  }

  Board b;
  while (*path) {
    Move m(std::string_view(path, 4));
    path += 4;
    if (*path == '/') path++;
    if (!m.is_valid() || !b.is_valid_move(m)) return "XXXX invalid move ";
    b.play_move(m);
  }
  search::visited_nodes = 0;
  Move m = com_move(b, max_depth, limit_ms);
  fourcc = m.code();
  return fourcc.c_str();
}

extern "C"
int getVisitedNodes() { return search::visited_nodes; }
