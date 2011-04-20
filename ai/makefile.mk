CXXFLAGS = -O3 -Wall
#CXXFLAGS = -g -Wall
#CXXFLAGS = -pg -O -g -Wall

hmmm: hmmm.o search.o board.o opening.o piece.o
	$(CXX) $(CXXFLAGS) -o hmmm hmmm.o search.o board.o opening.o piece.o

all: hmmm player probstat guest match

player: player.o search.o board.o opening.o piece.o
	$(CXX) $(CXXFLAGS) -o player player.o search.o board.o opening.o piece.o

probstat: probstat.o search.o board.o opening.o piece.o
	$(CXX) $(CXXFLAGS) -o probstat probstat.o search.o board.o opening.o piece.o

guest: guest.o search.o board.o opening.o piece.o
	$(CXX) $(CXXFLAGS) -o guest guest.o search.o board.o opening.o piece.o

search: search.o board.o opening.o piece.o
	$(CXX) $(CXXFLAGS) -o search search.o board.o opening.o piece.o

piece.cpp: piece.rb
	ruby piece.rb >piece.cpp

guest.o: guest.cpp board.h search.h
hmmm.o: hmmm.cpp board.h search.h opening.h str.h
player.o: player.cpp board.h search.h
probstat.o: probstat.cpp board.h search.h
search.o: search.cpp board.h search.h probcut.h probcut.tab.c
board.o: board.cpp piece.h opening.h board.h str.h
opening.o: opening.cpp opening.h
piece.o: piece.cpp piece.h

clean:
	rm -f *.o hmmm player probstat guest match search
