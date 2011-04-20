#ifndef STR_H_
#define STR_H_

//#define STR_ASCII

#ifdef STR_ASCII

#define STR_COLOR_SELECT "1:Human vs COM 2:COM vs Human 3:Human vs Human 4:COM vs COM [1-4] "
#define STR_VIOLET_BLOCK "#"
#define STR_ORANGE_BLOCK "&"
#define STR_BLANK " "
#define STR_EDGE "*"
#define STR_EFFECT "."
#define STR_BOARD_HEADER " 123456789ABCDE 123456789ABCDE"
#define STR_FRAME_TOP "+--------------+--------------+"
#define STR_FRAME_BOTTOM "+--------------+--------------+"
#define STR_FRAME_SIDE "|"

#else // STR_ASCII

#define STR_COLOR_SELECT "1:先手 2:後手 3:人間vs人間 4:COMvsCOM [1-4] "
#define STR_VIOLET_BLOCK "■"
#define STR_ORANGE_BLOCK "□"
#define STR_BLANK "  "
#define STR_EDGE "☆"
#define STR_EFFECT "・"
#define STR_BOARD_HEADER "  1 2 3 4 5 6 7 8 9 A B C D E   1 2 3 4 5 6 7 8 9 A B C D E"
#define STR_FRAME_TOP "┏━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━┓"
#define STR_FRAME_BOTTOM "┗━━━━━━━━━━━━━━┻━━━━━━━━━━━━━━┛"
#define STR_FRAME_SIDE "┃"

#endif // STR_ASCII

#endif // STR_H_
