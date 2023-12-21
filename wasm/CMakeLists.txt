project(blokusduo-wasm)
cmake_minimum_required(VERSION 3.15...3.27)

set(CMAKE_CXX_STANDARD 17)

add_subdirectory(blokusduo)

add_executable(hm5move hm5move.cpp)
target_link_libraries(hm5move blokusduo)

target_link_options(hm5move PRIVATE
    "SHELL:-s ENVIRONMENT=worker"
    "SHELL:-s EXPORTED_FUNCTIONS=_hm5move,_getVisitedNodes"
    "SHELL:-s EXPORTED_RUNTIME_METHODS=cwrap"
    --post-js=${CMAKE_CURRENT_SOURCE_DIR}/hm5move_post.js)
