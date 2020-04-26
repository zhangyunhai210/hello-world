interface List{
    id: Number,
    isFinish: Boolean,
    context: string,
}

interface Lists{
    id: Number,
    todoList: Array<List>
}

interface todoLists{
    lists: Array<Lists>
}

interface returnTodoLists<T>{
    code: Number,
    message: String,
    data: T,
}

const peopleRequest = indexedDB.open("peopleDatabase")
let transaction = null
let dataBasedb:IDBDatabase;
peopleRequest.onsuccess = (event) => {
    dataBasedb = peopleRequest.result;
}
peopleRequest.onerror = (event) => {
    console.error(event);
    alert('数据库打开失败')
}
peopleRequest.onupgradeneeded = (event) => {
    console.log(`onupgradeneeded running`);
    let db = event.target.result;
    let objectStore;
    if (!db.objectStoreNames.contains('TodoList')) {
        objectStore = db.createObjectStore('TodoList', {
            keyPath: 'id'
        });
    }
}

function getTodoLists():returnTodoLists<todoLists>{
    let returnData = null

    return returnData
}
function getLists(key:string):returnTodoLists<Lists>{
    let returnData = null

    return returnData
}
function getList(key?:string, dbName?:string):returnTodoLists<List>{
    let returnData = null


    return returnData
}

function setTodoList(){
    
}

function deleteTodoList(){

}

function addTodoList(){

}
export default transaction = {
    getAll: getTodoLists,
    getLists: getLists,
    getList: getList,
    set: setTodoList,
    delete: deleteTodoList,
    add: addTodoList
}

