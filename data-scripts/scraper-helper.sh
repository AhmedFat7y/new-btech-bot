#!/usr/bin/env bash

lock_file=$HOME/bot/source/data-scripts/.lock
resources_dir=$HOME/bot/source/data-scripts/resources-new
[ -e  "$lock_file" ] && rm -v "$lock_file"
[ -e  "$resources_dir" ] && rm -vr "$resources_dir"
