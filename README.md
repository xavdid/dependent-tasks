# dependent-tasks

A toy proof of concept for a dependent task system. I really wish a system like this would make it into a full-fledged todo app! I wrote all about the system [on my blog](https://xavd.id/blog/post/my-perfect-task-app/#dependent-tasks). 

## Goals

* Tasks can block other tasks
* It's easy to get a list of available tasks (those without incomplete blockers)
* The system won't add blockers that create cycles (`A` -> `B` -> `A` is invalid)

## Usage

This really isn't meant for produciton, it's just a proof of concept. To use it in a little repl, do the following:

1. Clone this repo
2. Install deps: `yarn`
3. Run the build script: `yarn build`
3. Start a repl: `node`
3. Do the following:

```js
const { Datastore } = require('./lib')

const db = new Datastore()

const a = db.createTask('A')
const b = db.createTask('B')

db.availableTasks() // [
//   Task { title: 'A', id: 1, blockedBy: [], completed: false },
//   Task { title: 'B', id: 2, blockedBy: [], completed: false }
// ]

// returns a boolean if adding was successful
db.addBlocker(a.id, b.id) // true

// B is blocked by A, so B isn't available
db.availableTasks() // [ Task { title: 'A', id: 1, blockedBy: [], completed: false } ]

// B already depends on A
db.hasCircularDep(b.id, a.id)
// true

// can't add blocker
db.addBlocker(b.id, a.id) // false

// completing tasks with blockers is an error
db.completeTask(b.id)
// Uncaught:
// Error: unable to complete task ID: 2, it's either already complete or unavailable
//     at Datastore.completeTask (/Users/david/projects/tasks/lib/index.js:41:23)

db.completeTask(a.id)

// A was completed, so now B is available
db.availableTasks()
// [ Task { title: 'B', id: 2, blockedBy: [ 1 ], completed: false } ]
```
