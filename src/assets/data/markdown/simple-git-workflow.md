# Reference: A Simple `git` Workflow

This workflow is a simple branch and merge workflow. This workflow assumes that `master` always contains only complete features / bugfixes / etc. All work is done in `feature/*` or `bugfix/*` branches and never in master. The general workflow is this:

1. pull the latest changes in `master`
1. create a branch from `master` (let's call it `feature/featureAddGitWorkflow` for this dicussion)
1. as changes are made in `feature/someNewFeature` they are periodically staged and committed
1. as development continues, periodcally rebase `feature/featureAddGitWorkflow` on `master` to bring in changes from other developers
1. eventually do an interactive rebase to squash changes to a single commit
1. push the `feature/featureAddGitWorkflow` branch and submit it for pull request

This workflow assumes that you have an `origin` remote _somewhere_ be that on GitHub, Bitbucket, or whatever.

## Useful Aliases

Over time, I have collected several useful `git` aliases. Feel free to add any of these to your own `.gitconfig` file:

```
[alias]
  bra = branch -ra
  sta = status -sb
  ls = log --pretty=format:"%C(green)%h\\ %C(yellow)[%ad]%Cred%d\\ %Creset%s%Cblue\\ [%cn]" --decorate --date=relative
  ll = log --pretty=format:"%C(yellow)%h%Cred%d\\ %Creset%s%Cblue\\ [%cn]" --decorate --numstat
  fl = log -u
  tree = log --graph --pretty=format:"%C(green)%h\\ %C(yellow)[%ad]%Cred%d\\ %Creset%s%Cblue\\ [%cn]" --decorate --date=relative
  co = checkout
  stg = stage --patch
  stag = stage --patch
  ci = commit
  amend = commit --amend -C HEAD
  aa = commit -a --amend -C HEAD
  rb = !git fetch origin master && git rebase origin/master
  squash = !git fetch origin master && git rebase -i origin/master
  ours = "!f() { git co --ours $@ && git add $@; }; f"
  theirs = "!f() { git co --theirs $@ && git add $@; }; f"
  rmb = branch -d
  rmbr = push origin --delete
  lsc = diff-tree --no-commit-id --name-only -r
  cdiff = diff-tree --patch -r
```

The ones the use the most are:

- `git bra` - list branches
- `git sta` - show current status in a nice format
- `git ls` - list changes to repo in a nice format
- `git co` - short for checkout
- `git ci` - short for commit (old CVS or SVN users will understand)
- `git aa` - amend the previous commit (NEVER do this in `master`)
- `git stg` - stage changes, giving you a chance to review each one
- `git rb` - fetch `master` from `origin`, rebase
- `git squash` - fetch `master` from `origin`, rebase interactively
- `git rmb` - remove local branch (safely)
- `git rmbr` - remove remote branch
- `git lsc` - show files in specified commit-ish

## Workflow

Many of these commands will use the aliases defined above. If you don't want to create the aliases in your `.gitconfig` you can always use the long form of the commands.

### Create the Branch

```bash
~/project (master): git co master
~/project (master): git pull
remote: Counting objects: 39, done.
remote: Compressing objects: 100% (25/25), done.
remote: Total 39 (delta 21), reused 31 (delta 14), pack-reused 0
Unpacking objects: 100% (39/39), done.
From github.com:ionic-team/framework-training-deck
   1c8e86e..aa0232c  master      -> origin/master
 * [new branch]      step2Review -> origin/step2Review
 * [new branch]      step3Review -> origin/step3Review
Updating 1c8e86e..aa0232c
Fast-forward
 slides/Ionic Pro Overview Ottawa 2018.key | Bin 0 -> 26496060 bytes
 1 file changed, 0 insertions(+), 0 deletions(-)
 create mode 100644 slides/Ionic Pro Overview Ottawa 2018.key
~/project (master) git co -b feature/addGitWorkflow
~/project (feature/addGitWorkflow):
```

### Periodically Commit Changes

When committing changes, I suggest you use `git add {full_path_to_file}` to add new files, and `git stg` (which is an alias for `git stage --patch`) to examine each change to existing files before staging it. This allows you to examine each change you just made before you commit. I cannot stress how many times this has saved me.

In a nutshell

1. `git add path-to-file` - each new file or folder if whole folder
1. `git stg` - review and stage change to existing files
1. `git ci` - launch `vi` to enter a commit message, then do the commit on exit

```bash
~/project (feature/addGitWorkflow *): git sta
## feature/addGitWorkflow
 M "slides/Framework Training.key"
?? src/assets/data/markdown/simple-git-workflow.md
~/project (feature/addGitWorkflow *): git stg
Only binary files changed.
~/project (feature/addGitWorkflow *): git stage slides/Framework\ Training.key
~/project (feature/addGitWorkflow *): git add  src/assets/data/markdown/simple-git-workflow.md
~/project (feature/addGitWorkflow *): git ci
```

**Notes**

1. the only change to an existing file was for a binary file so I had to stage the file explicitly
1. the other file was unknown to `git` so I explicitly added it
1. the `git ci` load `vi` with some comments about what will be in the commit, allowing me to comment on the commit
1. this is the first commit, so I used a message matching what I eventually want to be the message for the whole feature: `feat(training): add a git workflow page`

Here is example with just some modified files:

```bash
~/projects (feature/addGitWorkflow *): git sta
## feature/addGitWorkflow
 M src/assets/data/markdown/simple-git-workflow.md
 M src/assets/data/menu.json
~/project (feature/addGitWorkflow *): git stg

...

diff --git a/src/assets/data/menu.json b/src/assets/data/menu.json
index 5651afe..be68787 100644
--- a/src/assets/data/menu.json
+++ b/src/assets/data/menu.json
@@ -123,6 +123,14 @@
           "title": "Lab: Styling and Theming"
         }
       ]
+    },
+    {
+          "id": "simple-git-workflow",
+          "title": "A Simple git Workflow"
+    },
+    {
+          "id": "references",
+          "title": "References"
     }
   ]
 }
Stage this hunk [y,n,q,a,d,e,?]?

...

~/projects (feature/addGitWorkflow +): git ci
```

### Periodically Rebase

In `git` a rebase replays your changes on top of other a commit other than the commit you branched from. So, if you created your branch off of `master` three days ago, and developers have since added several commits, you can bring your branch up to date with master via:

1. `git fetch origin master`
1. `git rebase origin/master`

I do this so often that I have an alias that does both in one step: `git rb`

### Squash

A "squash" is just an interactive rebase that allows you to re-write history. The most common thing to do is roll all of you commits into a single commit, and perhaps re-word that commit.

1. `git fetch origin master`
1. `git rebase -i origin/master`

Since I do this so often, I also created an alias for this: `git squash`

This will launch `vi` with a document similar to the following.

```
pick 53fbd18 feat(training): add a git workflow page
pick 77acdb0 WIP - add more instructions
pick 6838066 WIP - add information about rebasing

# Rebase aa0232c..6838066 onto aa0232c (3 commands)
#
# Commands:
# p, pick <commit> = use commit
# r, reword <commit> = use commit, but edit the commit message
# e, edit <commit> = use commit, but stop for amending
# s, squash <commit> = use commit, but meld into previous commit
# f, fixup <commit> = like "squash", but discard this commit's log message
# x, exec <command> = run command (the rest of the line) using shell
# d, drop <commit> = remove commit
# l, label <label> = label current HEAD with a name
# t, reset <label> = reset HEAD to a label
# m, merge [-C <commit> | -c <commit>] <label> [# <oneline>]
# .       create a merge commit using the original merge commit's
# .       message (or the oneline, if no original merge commit was
# .       specified). Use -c <commit> to reword the commit message.
#
# These lines can be re-ordered; they are executed from top to bottom.
#
```

This will rebase your changes and roll them all into a single commit with the message "feat(training): add a git workflow page":

```
pick 53fbd18 feat(training): add a git workflow page
f 77acdb0 WIP - add more instructions
f 6838066 WIP - add information about rebasing
```

This will also rebase your changes and roll them all into a single commit but it will also launch another instance of `vi` allowing you to change the commit message from "feat(training): add a git workflow page" to something else:

```
r 53fbd18 feat(training): add a git workflow page
f 77acdb0 WIP - add more instructions
f 6838066 WIP - add information about rebasing
```

There are lots of other options, but these are far-and-away the combinations that I use the most.

### Pull Request (or Merge)

If this is a project with multiple developers, this is the point at which I push the change to `origin` and open a pull request.

If this is a change to one of my own projects, then I do this:

1. `git co master`
1. `git merge feature/addGitWorkflow`
1. `git push`
1. `git rmb feature/addGitWorkflow`
