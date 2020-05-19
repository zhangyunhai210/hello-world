export type IIndexDb = {
  dbName: string
  version: number
  tables: DbTable[]
}
export type DbTable = {
  tableName: string
  option?: IDBObjectStoreParameters
  indexs: DbIndex[]
}
export type DbIndex = {
  key: string
  option?: IDBIndexParameters
}
export interface DbOperate<T> {
  tableName: string
  key: string,
  data: T | T[]
  value: string | number
  condition(data: T): boolean
  success(res: T[] | T): void
  handle(res: T): void
}

export class TsIndexDb {
  private dbName: string = ''
  private version: number = 1
  private tableList: DbTable[] = []
  private db: IDBDatabase | null = null
  constructor({ dbName, version, tables }: IIndexDb) {
    this.dbName = dbName
    this.version = version
    this.tableList = tables
  }

  private static _instance: TsIndexDb | null = null
  public static getInstance(dbOptions?: IIndexDb): TsIndexDb | null {
    if (TsIndexDb._instance === null && dbOptions) {
      TsIndexDb._instance = new TsIndexDb(dbOptions)
    }
    return TsIndexDb._instance
  }

  /**
    * @method 游标开启成功,遍历游标
    * @param {Function} 条件
    * @param {Function} 满足条件的处理方式 @arg {Object} @property cursor游标 @property currentValue当前值
    * @param {Function} 游标遍历完执行的方法
    * @return {Null}
    * */
  cursor_success(e: any, { condition, handler, success }: any) {
    const cursor: IDBCursorWithValue = e.target.result;
    if (cursor) {
      const currentValue = cursor.value;
      if (condition(currentValue)) {
        handler({ cursor, currentValue });
      }
      cursor.continue();
    } else {
      success();
    }
  }
  /**
 * 提交Db请求
 * @param tableName  表名
 * @param commit 提交具体函数
 * @param mode 事物方式
 * @param backF 游标方法
 */
  private commitDb<T>(tableName: string,
    commit?: (transaction: IDBObjectStore) => IDBRequest<any>,
    mode: IDBTransactionMode = 'readwrite',
    backF?: (request: any, resolve: any, store: IDBObjectStore) => void
    ) {
    return new Promise<T>((resolve, reject) => {
      try {
        if (this.db) {
          let store = this.db.transaction(tableName, mode).objectStore(tableName);
          if (!commit) {
            backF!(null, resolve, store)
            return
          }
          let res = commit(store)
          res!.onsuccess = (e: any) => {
            if (backF) {
              backF(e, resolve, store)
            } else {
              resolve(e)
            }
          }
          res!.onerror = (event) => {
            reject(event)
          }

        } else {
          reject(new Error('请开启数据库'))
        }
      } catch (error) {
        reject(error)
      }

    })
  } 
  /**
   * @method 查询某张表的所有数据(返回具体数组)
   * @param {Object}
   * @property {String} tableName 表名
   */
  queryAll<T>({ tableName }: Pick<DbOperate<T>, 'tableName'>) {
    let res: T[] = []
    return this.commitDb<T[]>(tableName, (transaction: IDBObjectStore) => transaction.openCursor(), 'readonly', (e: any, resolve: (data: T[]) => void) => {
      this.cursor_success(e, {
        condition: () => true,
        handler: ({ currentValue }: any) => res.push(currentValue),
        success: () => resolve(res)
      })
    })
  }
  /**
   * @method 查询(返回具体数组)
   * @param {Object}
   *   @property {String} tableName 表名
   *   @property {Function} condition 查询的条件
   * */
  query<T>({ tableName, condition }: Pick<DbOperate<T>, 'condition' | 'tableName'>) {
    let res: T[] = []
    return this.commitDb<T[]>(tableName, (transaction: IDBObjectStore) => transaction.openCursor(), 'readonly', (e:any, resolve: (data: T[]) => void) =>{
      this.cursor_success(e, {
        condition,
        handler: ({currentValue}: any) => res.push(currentValue),
        success: () => resolve(res)
      })
    })
  }
  /**
   * @method 查询数据（主键值）
   * @param {Object}
   *   @property {String} tableName 表名
   *   @property {Number|String} value 主键值
   *
   * */
  query_by_primaryKey<T>({tableName, value}: Pick<DbOperate<T>, 'tableName' | 'value'>) {
    return this.commitDb<T>(tableName, (transaction: IDBObjectStore) => transaction.get(value), 'readonly', (e:any, resolve: (data:T)=> void) => {
      resolve(e.target.result||null)
    })
  }
  /**
   * @method 修改数据(返回修改的数组)
   * @param {Object}
   *   @property {String} tableName 表名
   *   @property {Function} condition 查询的条件，遍历，与filter类似
   *      @arg {Object} 每个元素
   *      @return 条件
   *   @property {Function} handle 处理函数，接收本条数据的引用，对其修改
   * */
  updata<T>({tableName, condition, handle}:Pick<DbOperate<T>, 'tableName' | 'condition' | 'handle'>) {
    let res: T[] = []
    return this.commitDb<T>(tableName, (transaction: IDBObjectStore) => transaction.openCursor(), 'readwrite', (e:any, resolve:(data: T[]) => void) => {
      this.cursor_success(e, {
        condition,
        handler: ({currentValue, cursor}: any) => {
          handle(currentValue)
          res.push(currentValue)
          cursor.updata(currentValue)
        },
        success: () => {
          resolve(res)
        }
      })
    })
  }
  /**
  * @method 修改某条数据(主键)返回修改的对象
  * @param {Object}
  *   @property {String} tableName 表名
  *   @property {String\|Number} value 目标主键值
  *   @property {Function} handle 处理函数，接收本条数据的引用，对其修改
  * */
  updata_by_primaryKey<T>({tableName, value, handle}: Pick<DbOperate<T>, 'tableName' | 'value' | 'handle'>) {
    return this.commitDb<T>(tableName, (transaction: IDBObjectStore) => transaction.get(value), 'readwrite', (e:any, resolve: (data: T | null) => void, store: IDBObjectStore) => {
      const currentValue = e.target.result
      if(!currentValue) {
        resolve(null)
        return false
      }
      handle(currentValue)
      store.put(currentValue)
      resolve(currentValue)
    })
  }

  insert<T>({tableName, data }: Pick<DbOperate<T>, 'tableName' | 'data'>) {
    return this.commitDb<T>(tableName, undefined, 'readwrite', 
    (_: any, resolve: () => void, store: IDBObjectStore) => {
      data instanceof Array? data.forEach( v => store.put(v)) : store.put(data)
      resolve()
    })
  }
  

}
