/* 
 * Copyright 2014 mark.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

app.factory('db', function () {


//======================================================

//      Schema is an array where the index is the db version number-1, with
//      the value being an object with propoerties for each objectstore which
//      in turn are objects listing params for objectstore creation and any
//      indexes that should be created.
//      
//      Later this will be used to keep track of db changes and apply them
//      to older versions of the database
//                      
//      var schema = [{
//                    gvEvent:{
//                        params: {autoIncrement:true},
//                        //indexs: [{'host','hostname',{unique=false}},....],
//                    }
//            }];

    function createIndexedDBConnection(dbName, version, schema, callback) {
        var indexeddb = null;
        var dbConnection = {
            dbName: dbName,
            version: version,
            init: function () {
                try {
                    var request = window.indexedDB.open(dbName, version);
                } catch (e) {
                    request = indexedDB.open(dbName, version);
                }
                request.onblocked = function (e) {
                    console.log("blocked");
                };
                request.onsuccess = function (e) {
                    indexeddb = request.result;
                    console.log("datastore already uptodate");
                    console.log("successfully connected to datastore");
                    if (callback)
                        callback();
                };
                request.onerror = function (e) {
                    console.log("There was an error " + e.message);
                    throw e;
                };
                request.onupgradeneeded = function (e) {
                    indexeddb = e.target.result;
                    var to = schema.length - 1 > version ? version : schema.length - 1;
                    //var oldVersion = e.oldVersion===0? 0: e.oldVersion - 1;
                    for (var i = e.oldVersion; i <= to; i++) {
                        var obj = schema[i];
                        var objectStores = Object.getOwnPropertyNames(obj);
                        objectStores.forEach(function (objStoreName, index, array) {
                            //if the params property is defined assume this is a new
                            //object store and attempt to create it.
                            if (obj[objStoreName].params !== undefined) {
                                try {
                                    var store = indexeddb.createObjectStore(objStoreName, obj[objStoreName].params);
                                } catch (e) {
                                    console.log(e.message);
                                }
                            }
                            var indices = obj[objStoreName].indices;
                            if (indices !== undefined) {
                                indices.forEach(function (data, index, array) {
                                    try {
                                        if (store === undefined) {
                                            store = e.currentTarget.transaction.objectStore(objStoreName);
                                        }
                                        store.createIndex(data[0], data[1], data[2]);
                                    } catch (e) {
                                        console.log(e.message);
                                    }
                                });
                            }
                        });
                    }
                    ;
                    console.log("updating database to latest verison");
                };
            },
            getObjectStoreFromTransaction: function (objectStore, mode, oncomplete, onerror) {
                var trans = indexeddb.transaction(objectStore, mode);
                trans.onerror = function (e) {
                    if (onerror !== undefined) {
                        onerror(e);
                    }
                    console.log("transaction error");
                };
                trans.oncomplete = function (e) {
                    if (oncomplete !== undefined) {
                        oncomplete(e);
                    }
                    console.log("Transaction committed");
                };
                return trans.objectStore(objectStore);
            },
            close: function () {
                if (indexeddb !== undefined && indexeddb !== null) {
                    indexeddb.close();
                }
            },
            dropDataStore: function () {
                this.close();
                window.setTimeout(function () {
                    var request = window.indexedDB.deleteDatabase(dbName);
                    request.onsuccess = function (e) {
                        console.log("database deleted");
                        indexeddb = null;
                    };
                    request.onerror = function (e) {
                        console.log("error deleting database " + e.message);
                    };
                }, 1000);
            },
            convertToObjectStore: function (objectStore) {
                if (typeof objectStore === 'string') {
                    return this.getObjectStoreFromTransaction(objectStore, "readonly",
                            function (event) {
                                console.log("convert string to object store name " + objectStore);
                            }, function (event) {
                        console.log(event.message)
                    });
                } else {
                    return objectStore;
                }
            },
            getStatus: function () {
                if (indexeddb === null || indexeddb === undefined) {
                    return "closed";
                } else {
                    return "open";
                }
            }
        };
        dbConnection.init();
        return dbConnection;
    }
    ;

//=====================================================
    /*
     * 
     *  DataStore is the main entry point to the db.js
     *  api. It wraps the lower level DBConnection object
     *  returned from the createIndexDBConnection function.
     *  
     */


    function DataStore() {

    }

    DataStore.prototype.init = function (dbName, version, schema) {
        this.dbName = dbName;
        this.version = version;
        this.schema = schema;
    };

    DataStore.prototype.newConnection = function (callback) {
        this.dbCon = createIndexedDBConnection(this.dbName, this.version, this.schema, callback);
        console.log("connection established");
    };

    DataStore.prototype.getObjectStoreFromTransaction = function (objStore, mode, success, failure) {
        var objStore = this.dbCon.getObjectStoreFromTransaction(objStore, mode,
                failure, success);
        return objStore;
    };

    DataStore.prototype.dropDataStore = function () {
        this.dbCon.dropDataStore();
    };

    DataStore.prototype.createDataStore = function () {
        this.dbCon = this.createIndexedDBConnection(this.dbName, this.version, this.schema);
    };

    DataStore.prototype.insertObjectArray = function (objectStore, objs, success, error) {
        var value = objs.shift();
        var self = this;
        if (value !== undefined && value !== null) {
            var request = objectStore.add(value);
            request.onsuccess = function (e) {
                if (success === undefined || success === null) {
                    console.log("object inserted");
                } else {
                    success(e);
                }
                self.insertObjectArray(objectStore, objs);
            };
            request.onerror = function (e) {
                if (error === undefined || error === null) {
                    console.log(e);
                } else {
                    error(e);
                }
                objectStore.abort();
            };
        }
    };
    /**
     *  Add a new object to the object store 
     * 
     * @param {type} objStore
     * @param {type} obj
     * @param {type} success
     * @param {type} error
     * @returns {undefined}
     */    DataStore.prototype.insertObject = function (objStore, obj, success, error) {
        if (obj !== undefined && obj !== null) {
            var request = objStore.add(obj);
            request.onsuccess = function (e) {
                if (success === undefined) {
                    console.log("sucess");
                } else {
                    success(e);
                }
            };
            request.onerror = function (e) {
                if (error === undefined) {
                    console.log(e);
                } else {
                    error(e);
                }
            };
        }
    };
    /**
     *  This method creates an array of all the objects in the object store and then
     *  call teh onEachFunc for each item in the array after the cursor has been
     *  completely iterated over. After the cursor has been exhausted the entire
     *  object store will be loaded into the array in memory.
     *
     *  @returns {undefined}
     * 
     *  @param cursorProvider is either a string for the object store name or an actual
     *  object store object. 
     *  
     *  @param onEachFunc is the functions to call on each item in the collection
     *     
     *  @param callback takes two parameters the return value of the onEachFun and
     *  the array of objects iterated over
     *              
     */
    DataStore.prototype.processObjectArray = function (cursorProvider, onEachFunc, callback) {
        var array = [];
        var onSuccess = function (event) {
            var cursor = event.target.result;
            if (cursor) {
                array.push(cursor.value);
                cursor.continue();
            } else {
                var result = onEachFunc(array);
                callback(result, array);
            }
        };
        var onError = function (e) {
            console.log(e.message);
        };
        cursorProvider = this.dbCon.convertToObjectStore(cursorProvider);
        var request = cursorProvider.openCursor();
        request.onsuccess = onSuccess;
        request.onerror = onError;
    };
    /**
     * 
     * @param {type} objStore
     * @param {type} callback
     * @returns {undefined}
     */
    DataStore.prototype.getObjectArray = function (objStore, callback) {
        cursorProvider = this.dbCon.convertToObjectStore(objStore);
        this.processObjectArray(cursorProvider, function () {
        }, function (result, array) {
            callback(array);
        });
    };
    /**
     *  Iterate over the items in an object store and execute the callback in resultObj
     *  for each item. This does not require the whole object store to be loaded into an
     *  array and therefore into memroy. It iterates over each object and then discards it
     *  
     *  @param objectStore is either a string for the object store name or an actual
     *  object store object. 
     *  
     *  @param onEachFunc is the functions to call on each item in the collection.
     *  Interim results can be stored in the resultObj object between function calls.
     *     
     *  @param resultObj is an object with a property "result" which will hold the result
     *  of the onEachFunc called for each object and have a property "callback" which
     *  holds the function to call once the entire collection has been iterated over
     *  resultObj = {
     *                  result:0,
     *                  callback: function(){....}
     *              }
     *  This allows values to be passed downt o subsequent invocations of the onEachFunc
     *  function
     *  
     */
    DataStore.prototype.processObjects = function (objectStore, onEachFunc, resultObj) {
        objectStore = this.dbCon.convertToObjectStore(objectStore);
        var request = objectStore.openCursor();
        request.onsuccess = function (event) {
            var cursor = event.target.result;
            if (cursor) {
                onEachFunc(cursor.value);
                cursor.continue();
            } else {
                resultObj.callback();
            }
        };
        request.onerror = function (e) {
            console.log(e.message);
        };
    };

    /*
     * Wrapper around processObjects to find the max value of a property
     */
    DataStore.prototype.findMax = function (objStore, property, resultObj) {
        var tmpResult = {};
        tmpResult[property] = 0;
        var func = function (event) {
            tmpResult = event[property] > tmpResult[property] ? event : tmpResult;
            resultObj.result = tmpResult;
        };
        this.processObjects(objStore, func, resultObj);
    };
    /*
     * Wrapper around processObjects to find the max value of a property
     */
    DataStore.prototype.findMin = function (objStore, property, resultObj) {
        var tmpResult = {};
        tmpResult[property] = 999999999999999999;
        var func = function (event) {
            tmpResult = event[property] < tmpResult[property] ? event : tmpResult;
            resultObj.result = tmpResult;
        };
        this.processObjects(objStore, func, resultObj);
    };

    /**
     * 
     * @param {type} objStore
     * @param {type} property
     * @param {type} resultObj
     * @returns {undefined}
     */
    DataStore.prototype.sum = function (objStore, property, resultObj) {
        var tmpResult = {};
        tmpResult[property] = 0;
        var func = function (event) {
            tmpResult.result = event[property] + tmpResult[property];
            resultObj.result = tmpResult;
        };
        this.processObjects(objStore, func, resultObj);
    };

    DataStore.prototype.find = function (objectStore, index, key, onsuccessfunc, onerrorfunc) {
        objectStore = this.dbCon.convertToObjectStore(objectStore);
        index = objectStore.index(index);
        var request = index.get(key);
        if (onsuccessfunc) {
            request.onsuccess = onsuccessfunc;
        } else {
            request.onsuccess = function () {
                console.log(key + " found");
            };
        }
        if (onerrorfunc) {
            request.onerror = onerrorfunc;
        } else {
            request.onerror = function (e) {
                console.log(e.message);
            };
        }
        return request;
    };

    DataStore.prototype.findAll = function (objectStore, index, onsuccessfunc, onerrorfunc) {
        objectStore = this.dbCon.convertToObjectStore(objectStore);
        index = objectStore.index(index);
        var array = [];
        var request = index.openCursor();
        request.onsuccess = function (event) {
            var cursor = event.target.result;
            if (cursor) {
                array.push(cursor.value);
                cursor.continue();
            } else {
                if (onsuccessfunc) {
                    onsuccessfunc(array);
                } else {
                    console.log(array.length + " entries found for key " + key);
                };
            }
        };
        if (onerrorfunc) {
            request.onerror = onerrorfunc;
        } else {
            request.onerror = function (e) {
                console.log(e.message);
            };        
        }
        return request;
    };


    DataStore.prototype.findAllByMatch = function (objectStore, index, key, onsuccessfunc, onerrorfunc) {
        objectStore = this.dbCon.convertToObjectStore(objectStore);
        var keys = IDBKeyRange.only(key);
        index = objectStore.index(index);
        var array = [];
        var request = index.openCursor(keys);
        request.onsuccess = function (event) {
            var cursor = event.target.result;
            if (cursor) {
                array.push(cursor.value);
                cursor.continue();
            } else {
                if (onsuccessfunc) {
                    onsuccessfunc(array);
                } else {
                    console.log(array.length + " entries found for key " + key);
                }
                ;
            }
        };
        if (onerrorfunc) {
            request.onerror = onerrorfunc;
        } else {
            request.onerror = function (e) {
                console.log(e.message);
            };
        }
        return request;
    };


    DataStore.prototype.getStatus = function () {
        return this.dbCon.getStatus();
    };

    var datastore = new DataStore();
    return datastore;
});