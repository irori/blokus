#include <stdlib.h>
#include "board.h"
#include "search.h"
#include "opening.h"
#include "ppapi/cpp/instance.h"
#include "ppapi/cpp/module.h"
#include "ppapi/cpp/var.h"
#include "ppapi/cpp/var_dictionary.h"

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

class PpapiInstance : public pp::Instance {
 public:
  explicit PpapiInstance(PP_Instance instance) : pp::Instance(instance)
  {}
  virtual ~PpapiInstance() {}

  virtual void HandleMessage(const pp::Var& var_message) {
    if (!var_message.is_dictionary())
      return;
    pp::VarDictionary dict(var_message);
    pp::Var path = dict.Get("path");
    if (!path.is_string())
      return;
    pp::Var timeout = dict.Get("timeout");
    if (!timeout.is_number())
      return;

    pp::VarDictionary reply;
    reply.Set("move", hm5move(path.AsString().c_str(), timeout.AsInt()));
    reply.Set("visited_nodes", visited_nodes);
    PostMessage(reply);
  }
};

class PpapiModule : public pp::Module {
 public:
  PpapiModule() : pp::Module() {}
  virtual ~PpapiModule() {}

  virtual pp::Instance* CreateInstance(PP_Instance instance) {
    return new PpapiInstance(instance);
  }
};

namespace pp {
Module* CreateModule() {
  return new PpapiModule();
}
}  // namespace pp
