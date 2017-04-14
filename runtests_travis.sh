#!/bin/bash

cp app/local_settings_example.py app/local_settings.py

py.test -s tests/
