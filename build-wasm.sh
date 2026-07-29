#!/bin/sh
set -e

if [ ! -d build ]; then
  emcmake cmake \
    -DCMAKE_BUILD_TYPE=Release \
    -DBLOKUSDUO_ENABLE_WASM_SIMD=ON \
    -S wasm -B build
fi
cmake --build build
cp build/hm5move.js build/hm5move.wasm dist/
