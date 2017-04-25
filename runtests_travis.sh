#!/bin/bash

source activate

cp app/local_settings_example.py app/local_settings.py

nashenv/bin/py.test -s tests/

karma start --singleRun true
