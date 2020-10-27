import { Database, Task } from '../data'

// helper to initialize a test db
const generateTasks = (
  numTasks: number = 5
): { db: Database; tasks: Task[] } => {
  const db = new Database()
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

  db.completeTasks(c.id)
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

  expect(() => db.completeTasks(b.id)).toThrow()

  db.completeTasks(e.id)

  expect(db.availableTasks()).toHaveLength(3)
  expect(new Set(db.availableTasks().map(t => t.id))).toEqual(
    new Set([b.id, c.id, d.id])
  )

  db.completeTasks(b.id)

  expect(db.availableTasks()).toHaveLength(2)
  expect(new Set(db.availableTasks().map(t => t.id))).toEqual(
    new Set([c.id, d.id])
  )

  db.completeTasks(c.id)

  expect(db.availableTasks()).toHaveLength(1)
  expect(new Set(db.availableTasks().map(t => t.id))).toEqual(new Set([d.id]))

  db.completeTasks(d.id)

  expect(db.availableTasks()).toHaveLength(1)
  expect(new Set(db.availableTasks().map(t => t.id))).toEqual(new Set([a.id]))
})
