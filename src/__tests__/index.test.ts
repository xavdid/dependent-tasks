import { Datastore, Task } from '..'

// helper to initialize a test db
const generateTasks = (
  numTasks: number = 5
): { db: Datastore; tasks: Task[] } => {
  const db = new Datastore()
  return {
    tasks: Array(numTasks)
      .fill(null)
      .map((_, i) => db.createTask(String.fromCharCode(i + 65))),
    db
  }
}

test('linear', () => {
  const {
    db,
    tasks: [a, b, c]
  } = generateTasks(3)

  expect(db.addBlocker(b.id, a.id)).toBeTruthy()
  expect(db.addBlocker(c.id, b.id)).toBeTruthy()

  expect(db.availableTasks()).toHaveLength(1)
  expect(db.availableTasks()[0].id).toEqual(c.id)

  db.completeTask(c.id)
  expect(db.availableTasks()).toHaveLength(1)
  expect(db.availableTasks()[0].id).toEqual(b.id)
})

test('block circular', () => {
  const {
    db,
    tasks: [a, b, c]
  } = generateTasks(3)

  expect(db.addBlocker(b.id, a.id)).toBeTruthy()
  expect(db.addBlocker(c.id, b.id)).toBeTruthy()
  expect(db.addBlocker(a.id, c.id)).toBeFalsy()
})

test('parallel', () => {
  const {
    db,
    tasks: [a, b, c, d, e, f]
  } = generateTasks(6)

  expect(db.addBlocker(a.id, b.id)).toBeTruthy()
  expect(db.addBlocker(b.id, c.id)).toBeTruthy()
  expect(db.addBlocker(c.id, f.id)).toBeTruthy()
  expect(db.addBlocker(a.id, f.id)).toBeTruthy()

  expect(db.addBlocker(a.id, d.id)).toBeTruthy()
  expect(db.addBlocker(d.id, e.id)).toBeTruthy()
  expect(db.addBlocker(e.id, f.id)).toBeTruthy()

  expect(db.addBlocker(f.id, a.id)).toBeFalsy()

  expect(new Set(db.availableTasks().map(t => t.id))).toEqual(new Set([a.id]))

  db.completeTask(a.id)
  expect(new Set(db.availableTasks().map(t => t.id))).toEqual(
    new Set([b.id, d.id])
  )

  db.completeTask(b.id)
  expect(new Set(db.availableTasks().map(t => t.id))).toEqual(
    new Set([c.id, d.id])
  )

  db.completeTask(c.id)
  expect(new Set(db.availableTasks().map(t => t.id))).toEqual(new Set([d.id]))

  db.completeTask(d.id)
  expect(new Set(db.availableTasks().map(t => t.id))).toEqual(new Set([e.id]))

  db.completeTask(e.id)
  expect(new Set(db.availableTasks().map(t => t.id))).toEqual(new Set([f.id]))
})

test('fan', () => {
  const {
    db,
    tasks: [a, b, c, d]
  } = generateTasks(4)

  expect(db.addBlocker(b.id, a.id)).toBeTruthy()
  expect(db.addBlocker(c.id, a.id)).toBeTruthy()
  expect(db.addBlocker(d.id, a.id)).toBeTruthy()
  expect(db.availableTasks()).toHaveLength(3)

  expect(new Set(db.availableTasks().map(t => t.id))).toEqual(
    new Set([b.id, c.id, d.id])
  )

  const e = db.createTask('E')

  expect(db.addBlocker(e.id, b.id)).toBeTruthy()
  expect(db.addBlocker(e.id, c.id)).toBeTruthy()
  expect(db.addBlocker(e.id, d.id)).toBeTruthy()
  expect(db.availableTasks()).toHaveLength(1)

  // creates circular dep
  expect(db.addBlocker(a.id, e.id)).toBeFalsy()

  expect(new Set(db.availableTasks().map(t => t.id))).toEqual(new Set([e.id]))

  expect(() => db.completeTask(b.id)).toThrow()

  db.completeTask(e.id)

  expect(db.availableTasks()).toHaveLength(3)
  expect(new Set(db.availableTasks().map(t => t.id))).toEqual(
    new Set([b.id, c.id, d.id])
  )

  db.completeTask(b.id)

  expect(db.availableTasks()).toHaveLength(2)
  expect(new Set(db.availableTasks().map(t => t.id))).toEqual(
    new Set([c.id, d.id])
  )

  db.completeTask(c.id)

  expect(db.availableTasks()).toHaveLength(1)
  expect(new Set(db.availableTasks().map(t => t.id))).toEqual(new Set([d.id]))

  db.completeTask(d.id)

  expect(db.availableTasks()).toHaveLength(1)
  expect(new Set(db.availableTasks().map(t => t.id))).toEqual(new Set([a.id]))
})
