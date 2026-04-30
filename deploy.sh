#!/usr/bin/env sh

set -e

npm run build

cd docs/.vuepress/dist

touch .nojekyll

git init
git add -A
git commit -m 'deploy'

git push -f "https://${access_token}@github.com/devdiv/ai-test-school.git" main:gh-pages

cd -
