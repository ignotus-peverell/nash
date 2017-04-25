#!/bin/bash

py.test -s tests/

# Run ui tests continuously and watch for file changes.
karma start

# Run ui tests once.
#karma start --singleRun true
