#!/bin/bash

#directory="../../repository"
directory="..\..\repository"

#find $directory -type f -name "*.js"
dir  /s /b *.js | findstr /e .js