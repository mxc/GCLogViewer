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



function getDataStoreObject(dbName, version, schema) {

    var dbCon = createIndexedDBConnection(dbName, version, schema);
    return new DataStore(dbCon);

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

    function createIndexedDBConnection(dbName, version, schema) {
        var db = null;
        var schema = schema;
        var DBConnection = {
            dbName: dbName,
            version: version,
            init: function () {
                try {
                    var request = window.indexedDB.open(dbName, version);
                } catch (e) {
                    request = indexedDB.open(dbName, version);
                }
                request.onsuccess = function (e) {
                    db = request.result;
                    console.log("datastore already uptodate");
                    console.log("successfully connected to datastore");
                };
                request.onerror = function (e) {
                    console.log("There was an error " + e.message);
                    throw e;
                };
                request.onupgradeneeded = function (e) {
                    db = e.target.result;
                    var to = schema.length - 1 > version ? version : schema.length - 1;
                    for (var i = 0; i <= to; i++) {
                        var obj = schema[i];
                        var objectStores = Object.getOwnPropertyNames(obj);
                        objectStores.forEach(function (objStoreName, index, array) {
                            //if the params property is defined assume this is a new
                            //object store and attempt to create it.
                            if (obj[objStoreName].params !== undefined) {
                                try {
                                    var store = db.createObjectStore(objStoreName, obj[objStoreName].params);
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
            getObjectStoreFromTransaction: function (objectStore, mode, onComplete, onError) {
                var trans = db.transaction(objectStore, mode);
                trans.onComplete = onComplete;
                trans.onError = onError;
                return trans.objectStore(objectStore);
            },
            close: function () {
                db.close();
            },
            dropDataStore: function () {
                window.indexedDB.deleteDatabase(dbName);
                console.log("datastore dropped");
            },
            createDataStore: function () {
                this.init();
                console.log("datastore created");
            },
            convertToObjectStore: function (cursorProvider) {
                if (typeof cursorProvider === 'string') {
                    return this.getObjectStoreFromTransaction(cursorProvider, "readonly",
                            function (event) {
                                console.log("worked");
                            }, function (event) {
                        console.log(event.message)
                    });
                } else {
                    return cursorProvider;
                }
            }

        };
        DBConnection.init();
        return DBConnection;
    }
    ;
}

//=====================================================
/*
 * 
 *  DataStore is the main entry point to the db.js
 *  api. It wraps the lower level DBConnection object
 *  returned from the createIndexDBConnection function.
 *  
 */


function DataStore(dbCon) {
    this.dbCon = dbCon;
}

DataStore.prototype.getObjectStoreFromTransaction = function (objStore, mode, success, failure) {
    var objStore = this.dbCon.getObjectStoreFromTransaction(objStore, mode,
            function (e) {
                console.log("success");
            },
            function (e) {
                console.log("failed");
            });
    return objStore;
};

DataStore.prototype.dropDataStore = function () {
    this.dbCon.close();
    this.dbCon.dropDataStore();
};

DataStore.prototype.createDataStore = function () {
    this.dbCon.createDataStore();
};

DataStore.prototype.insertObjectArray = function (objStore, objs) {
    var value = objs.shift();
    var self = this;
    if (value !== undefined && value !== null) {
        var request = objStore.add(value);
        request.onsuccess = function (e) {
            console.log("sucess");
            self.insertObjectArray(objStore, objs);
        };
        request.onerror = function (e) {
            console.log(e);
        };
    }
};
/**
 *  Add a new object to the object store 
 * 
 * @param {type} objStore
 * @param {type} obj
 * @returns {undefined}
 * 
 */
DataStore.prototype.insertObject = function (objStore, obj) {
    if (obj !== undefined && obj !== null) {
        var request = objStore.add(obj);
        request.onsuccess = function (e) {
            console.log("sucess");
        };
        request.onerror = function (e) {
            console.log(e);
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
        console.log("opening cursor");
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
    }, function(result,array){ callback(array); });
};

/**
 *  Iterate over the items in an object store and execute the callback in resultObj
 *  for each item. This does not require the whole object store to be loaded into an
 *  array and therefore into memroy. It iterates over each object and then discards it
 *  
 *  @param cursorProvider is either a string for the object store name or an actual
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
DataStore.prototype.processObjects = function (cursorProvider, onEachFunc, resultObj) {
    cursorProvider = this.dbCon.convertToObjectStore(cursorProvider);
    var request = cursorProvider.openCursor();
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

DataStore.prototype.sum = function (objStore, property, resultObj) {
    var tmpResult = {};
    tmpResult[property] = 0;
    var func = function (event) {
        tmpResult.result = event[property] + tmpResult[property];
        resultObj.result = tmpResult;
    };
    this.processObjects(objStore, func, resultObj);
};



