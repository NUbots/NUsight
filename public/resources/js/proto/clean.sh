#!/bin/bash

# Delete non proto files
find messages ! -name "*.proto" -type f -delete

# Delete empty directories
find messages -type d -empty -delete 
