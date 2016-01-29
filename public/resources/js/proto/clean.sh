#!/bin/bash

# Delete non proto files
find message -not -name "*.proto" -type f -delete

# Delete empty directories
find message -type d -empty -delete 
