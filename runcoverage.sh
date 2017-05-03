#!/bin/bash

echo '========================================= running py tests =========================================='
py.test -s --cov-report term-missing --cov-config tests/.coveragerc --cov app tests/

echo '========================================= running ui tests =========================================='
karma start --singleRun true

echo '========================================= finished ui tests =========================================='

echo 'Trying to open coverage file. See "ui_test_coverage" for coverage-related files.'

coverageIndexFile="$(find ui_test_coverage -maxdepth 2 -name "index.html" -type f)"
if [[ `uname -s` == 'Linux' ]]; then
    if [ -x "$(command -v google-chrome)" ]; then
        google-chrome "$coverageIndexFile" > /dev/null &
    fi
elif [[ `uname -s` == 'Darwin' ]]; then # probably a mac
    open "$coverageIndexFile" > /dev/null &
fi

echo '========================================= finished running coverage  =========================================='
