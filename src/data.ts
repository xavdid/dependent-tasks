// let _sentinel = 0

// class SafeRecurser {
//   protected shieldRecursion(): void {
//     if (++_sentinel > 20) {
//       throw new Error('stopping recursion')
//     }
//   }
// }

export class Task {
  completed = false
  // startDate?: Date
  // dueDate?: Date
  constructor(
    public title: string,
    public id: string,
    public blockedBy: string[] = []
  ) {}

  // get available(): boolean {
  //   this.shieldRecursion()

  //   return (
  //     !this.completed && !db.getTasks(this.blockedBy).some(t => t.available)
  //   )
  // }
}

export class Database {
  private db: { [id: string]: Task } = {}
  nextId = 1

  // needs to be a fat arrow, because `this` is lost otherwise
  // there's a bug here now because if a task is not available, it doesn't correctly block later tasks

  /**
   * ex: C blocks B blocks A
   * is each available?
   * * C is incomplete and unblocked -> true
   * * B is incomplete and blocked -> false
   * * A is incomplete and sole blocker is unavailable, so this shows as unblocked
   */
  isTaskAvailable = (taskId: string): boolean => {
    const t = this.db[taskId]
    const hasIncompleteBlockers = t.blockedBy.some(
      maybeBlockerId => !this.db[maybeBlockerId].completed
    )
    const res = !t.completed && !hasIncompleteBlockers

    return res
  }

  availableTasks(): Task[] {
    return Object.values(this.db)
      .map(task => (this.isTaskAvailable(task.id) ? task : null))
      .filter(Boolean) as Task[]
  }

  // nice cause it's nested
  createTask(title: string, blockedByTasks: Task[] = []): Task {
    const blockedByIds = blockedByTasks.map(t => t.id)
    const t = new Task(title, String(this.nextId++), blockedByIds)
    this.db[t.id] = t
    return t
  }

  completeTasks(...taskIds: string[]): void {
    taskIds.forEach(t => {
      if (!this.isTaskAvailable(t)) {
        throw new Error('unable to complete task')
      }
      this.db[t].completed = true
    })
  }

  addBlocker(thisTask: string, blocksThisOne: string): boolean {
    // check for circular logic
    const t = this.db[blocksThisOne]
    // we only need to do this check because sets don't have .any or other methods
    if (t.blockedBy.includes(thisTask)) {
      console.log(
        `skipping duplicate blocker (${thisTask} blocks ${blocksThisOne})`
      )
      return false
    } else if (this.hasCircularDep(thisTask, blocksThisOne)) {
      console.log('skipping circular dep')
      return false
    } else {
      t.blockedBy.push(thisTask)
      return true
    }
  }

  hasCircularDep(thisTask: string, blocksThisOne: string): boolean {
    // console.log('does', thisTask, 'already block', blocksThisOne, '?')

    if (this.db[thisTask].blockedBy.length === 0) {
      // console.log('no blockers, all good')
      return false
    }

    if (this.db[thisTask].blockedBy.includes(blocksThisOne)) {
      // console.log('yes, break')
      return true
    }

    return this.db[thisTask].blockedBy.some(blockerId =>
      this.hasCircularDep(blockerId, blocksThisOne)
    )
  }

  toString(): string {
    return JSON.stringify(this.db, null, 2)
  }

  getTasks(taskIds: string[]): Task[] {
    if (taskIds.length === 0) {
      return []
    }
    return Object.values(this.db).filter(t => taskIds.includes(t.id))
  }

  print(): void {
    console.log(String(this))
  }
}
