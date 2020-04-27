interface List {
    id: Number,
    isFinish: Boolean,
    context: string,
}

interface Lists {
    id: Number,
    todoList: Array<List>
}

interface todoLists {
    lists: Array<Lists>
}

interface returnTodoLists<T> {
    code: Number,
    message: String,
    data: T,
}
function openDb(dbName: string){
    console.log(`${new Date().toTimeString()} open ${dbName}-------`);
    let req = indexedDB.open(dbName)
    req.onerror = (e)=>{
        console.error(`${dbName} error: ${e.target.errorCode}`)
    }
    
}

function addTransaction(addAgr:string){

}

export {}

// function getTodoLists(): returnTodoLists<todoLists> {
//     let returnData = null

//     return returnData
// }
// function getLists(key: string): returnTodoLists<Lists> {
//     let returnData = null

//     return returnData
// }
// function getList(key?: string, dbName?: string): returnTodoLists<List> {
//     let returnData = null


//     return returnData
// }

// function setTodoList() {

// }

// function deleteTodoList() {

// }

// function addTodoList() {

// }
// export default transaction = {
//     getAll: getTodoLists,
//     getLists: getLists,
//     getList: getList,
//     set: setTodoList,
//     delete: deleteTodoList,
//     add: addTodoList
// }

