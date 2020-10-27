import { Database } from './data'

const db = new Database()

// const prereq = db.createTask('Open Chambers', [
//   db.createTask('Relicanth + Wailord')
// ])

// db.createTask('Regigigas', [
//   db.createTask('Regirock', [prereq]),
//   db.createTask('Registeel', [prereq]),
//   db.createTask('Regice', [prereq])
// ])
// console.log(db)
// console.log('is it valid?', db.isValid())

// db.createTask('A', [
//   db.createTask('B', [
//     db.createTask('C', [db.createTask('D', [db.createTask('E')])])
//   ])
// ])

// a single blocking task
// db.createTask('A', [db.createTask('B')])
// db.completeTasks(1)

// a single completed blocking task
db.createTask('A', [db.createTask('B')])
db.addBlocker('2', '1') // bad line

// db.addBlocker(1, 5)
// console.log(db.toString())
console.log(db.availableTasks())

console.log()
