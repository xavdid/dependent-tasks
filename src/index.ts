export class Task {
  completed = false
  // startDate?: Date
  // dueDate?: Date
  constructor(
    public title: string,
    public id: number,
    public blockedBy: number[] = []
  ) {}
}

export class Datastore {
  private readonly db = new Map<number, Task>()
  private nextId = 1

  // there's a bug here now because if a task is not available, it doesn't correctly block later tasks

  getTask = (taskId: number): Task => {
    const task = this.db.get(taskId)
    if (task === undefined) {
      throw new Error(`no task with id ${taskId}`)
    }
    return task
  }

  /**
   * ex: C blocks B blocks A
   * is each available?
   * * C is incomplete and unblocked -> true
   * * B is incomplete and blocked -> false
   * * A is incomplete and sole blocker is unavailable, so this shows as unblocked
   */
  isTaskAvailable = (taskId: number): boolean => {
    const task = this.getTask(taskId)

    const hasIncompleteBlockers = task.blockedBy.some(
      maybeBlockerId => !this.getTask(maybeBlockerId).completed
    )

    return !task.completed && !hasIncompleteBlockers
  }

  availableTasks(): Task[] {
    return Array.from(this.db, ([, task]) => task).filter(task =>
      this.isTaskAvailable(task.id)
    )
  }

  createTask(title: string, blockedByTasks: Task[] = []): Task {
    const blockedByIds = blockedByTasks.map(t => t.id)
    const t = new Task(title, this.nextId++, blockedByIds)
    this.db.set(t.id, t)
    return t
  }

  completeTask = (taskId: number): void => {
    if (!this.isTaskAvailable(taskId)) {
      throw new Error(
        `unable to complete task ID: ${taskId}, it's either already complete or unavailable`
      )
    }
    this.getTask(taskId).completed = true
  }

  completeTasks = (...taskIds: number[]): void => {
    taskIds.forEach(this.completeTask)
  }

  addBlocker(thisTask: number, blocksThisOne: number): boolean {
    // check for circular logic
    const task = this.getTask(blocksThisOne)
    // we only need to do this check because sets don't have .any or other methods
    if (task.blockedBy.includes(thisTask)) {
      // console.log(
      //   `skipping duplicate blocker (${thisTask} blocks ${blocksThisOne})`
      // )
      return false
    } else if (this.hasCircularDep(thisTask, blocksThisOne)) {
      // console.log('skipping circular dep')
      return false
    } else {
      task.blockedBy.push(thisTask)
      return true
    }
  }

  hasCircularDep(thisTask: number, blocksThisOne: number): boolean {
    const task = this.getTask(thisTask)

    if (task.blockedBy.length === 0) {
      // console.log('no blockers, all good')
      return false
    }

    if (task.blockedBy.includes(blocksThisOne)) {
      // console.log('yes, break')
      return true
    }

    return task.blockedBy.some(blockerId =>
      this.hasCircularDep(blockerId, blocksThisOne)
    )
  }

  getTasks(taskIds: number[]): Task[] {
    if (taskIds.length === 0) {
      return []
    }
    return Object.values(this.db).filter(t => taskIds.includes(t.id))
  }

  toString(): string {
    return JSON.stringify([...this.db], null, 2)
  }

  print(): void {
    console.log(String(this))
  }
}
