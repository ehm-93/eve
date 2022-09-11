#!/usr/bin/env bash

#
# This script contains a collection of helpful aliases used for development.
#
# Usage:
#   source ./hack/alias.sh
#

alias openapi-generator-cli='docker run  -v ( pwd )":/local" openapitools/openapi-generator-cli:latest-release'

alias build='yarn run build'
alias clean='yarn run clean'
alias lint='yarn run lint'
alias format='yarn run format'
