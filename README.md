## json2csv2json
Convert to and from object and csv. This is made using the Node.js Transform stream class. Also uses a special syntax that provides object nesting.

# Example
In the simplest form, the first row of a .csv like this:
```csv
Name, lastName, Active, Charge
Eduardo, Soto, true, Developer
Edward, Alvarado, true, CTO
```
Maps Initialy to JSONs like this
 ```javascript
{
  Name: Eduardo,
  lastName: Soto,
  Active: true,
  Charge: Developer
}
 ```
The useful feature of this library is the fact that you can nest the row values depending on the header name or on the preprocessing configuration with the use of '{}' to represent objects and '[]' to represent arrays. For example, if I have a column like this:

```csv
ocean{reef}[2]{fish}[1]{name}
Nemo
Dory
Marlin
```
it maps to (or in) an object like this:
 ```javascript
{
  ocean: {
    reef: [
      null,
      null,
      {
        fish: [
          null,
          {
            name: 'Nemo'
          }
        ]
      }
    ]
  }
}
 ```
 In the same manner a stream of objects with that atribute would produce a column with a header name of 'ocean{reef}[2]{fish}[1]{name}'. That header name can be edited and the object attribute can be chosen to be ignored.
 You can also map a given header giving the pre-stream configuration the nesting path in the object using the special notation.

# Configuration CSV2JSON

Headers (or user) generate an internal configuration in the c2j object, which is represented by an object with the attributes of the separator of the .csv (by default is ','), a boolean describing if the file or stream provided has a header row in the first row and an array of objects, each of one representing a specific column of the .csv provided. You can also provide your own configuration object when declaring an instance of the CSV2JSON class.
This object has the following attributes:
  * columnNum: This is not implemented in this class, but it represents the order of the columns in the csv, it's used in the JSON2CSV mode.
  * read: A boolean that if true the column will be read and if false it'll be ignored by the parser, alternatetively you can ignore a set of values in a column if you don't provide their column config object, and just provide the ones that you want to read, given that this value is true in those provided.
  * type: Represents the data type that the row value will be parsed when mapped to an object (for now only implemented for 'boolean', 'float', 'string', 'integer' and 'number').
  * headerName: The header name in the provided .csv. It's of utmost importance that this parameter is provided correctly because the mapping in the .csv is made searching for the column marked by this value.
  * objectPath: A string representing the path the value in the column will take once mapped into the object. By default objectPath is equal to headerName but you can edit this changing it in this config. Examples:
    * If you'd like to represent the path of 'Value' (nested in another object) in the object { Attribute: { Subattribute: Value } }, the path is described by the string 'Attribute{Subattribute}'.
    * If you'd like to represent the path of 'Value' (now nested in an array) in the object {Attribute: ['Walue', 'Value']}, the path string is 'Attribute[1]'.
    * In the same manner you can nest indefinetely objects and arrays in this way i.e 'Attribute{Subattribute}[1]{Alias}[2]'.
    * **Hint** The default value of objectPath being equal to the headerName has the advantage that you can edit the headers in the same .csv file so you can skip this part of the config. 

Let's say our csv looks like this. If we provide the headers, the config it's autogenerated for every column, but you can provide your own config if you provide the config object. 

Also you can obtain the config object using the following command:
 ```javascript
const c2j = new CSV2JSON('Name,lastName,Active,Charge');
c2j.getConfig();
/*
{ 
  separator: ',',
  hasHeader: true,
  rows: [
    {
      columnNum: 0,
      read: true,
      type: 'String',
      headerName: 'Name',
      objectPath: 'Name'
    },
    {
      columnNum: 1,
      read: true,
      type: 'String',
      headerName: 'lastName',
      objectPath: 'lastName'
    },
    {
      columnNum: 2,
      read: true,
      type: 'String',
      headerName: 'Active',
      objectPath: 'Active'
    },
    {
      columnNum: 3,
      read: true,
      type: 'String',
      headerName: 'Charge',
      objectPath: 'Charge'
    }
  ]
}
*/
```
This last configuration generates the following internal object structure by default:

```javascript
{
  Name: 'Value',
  lastName: 'Value',
  Active: 'Value',
  Charge: 'Value'
}

```
Modifying the config, using the nesting notaition in the objectPaths like this:

 ```javascript
 
c2j.rows[0].objectPath = 'Name{First}';
c2j.rows[1].objectPath = 'Name{Last}';
c2j.rows[2].type = 'Boolean';

console.log(c2j.getConfig());

/*
{ 
  separator: ',',
  header: true,
  rows: [
    {
      columnNum: 0,
      read: true,
      type: 'String',
      headerName: 'Name',
      objectPath: 'Name{First}'
    },
    {
      columnNum: 1,
      read: true,
      type: 'String',
      headerName: 'lastName',
      objectPath: 'Name{Last}'
    },
    {
      columnNum: 2,
      read: true,
      type: 'Boolean',
      headerName: 'Active',
      objectPath: 'Active'
    },
    {
      columnNum: 3,
      read: true,
      type: 'String',
      headerName: 'Charge',
      objectPath: 'Charge'
    }
  ]
}*/

```
Reprocess the JSON output structure like this:

 ```javascript
{
  Name: {
    First: 'Value'
    Last: 'Value'
  },
  Active: 'Value',
  Charge: 'Value'
}
 ```
 # Usage csv2json
 
 You can initialize a new instance of the CSV2JSON class providing a string containing **all** the headers in the .csv.
 #**Important: for now you MUST provide in some manner the complete header row regardless if your file has headers or not, if not provided the first row will be utilized as header values to initialize the config**.

 ```javascript
 const CSV2JSON = require('json2csv2json').CSV2JSON;
 const fs = require('fs')
 
 const csvPath = 'path/to/csvFile.csv'
 const c2j = CSV2JSON('Name, lastName, Active, Charge');
 ```
 In this last situation you can start editing the autogenerated config object which is a property of the c2j instance.
 If you just wish to parse and config and provided that your .csv file **has** a first row of headers, you can initialize in blank, just call the constructor and then modify c2j's properties:
 
```javascript
  const c2j = new CSV2JSON();
  c2j.rows.push({
      columnNum: 0,
      read: true,
      type: 'String',
      headerName: 'Name',
      objectPath: 'Name{First}'
    });
```
Or you can input your configurations if you have them in a JSON file with parse or manually:
 
```javascript
  const c2j = new CSV2JSON(undefined, { rows:[
    {
      columnNum: 0,
      read: true,
      type: 'String',
      headerName: 'Name',
      objectPath: 'Name{First}'
    },
    {
      columnNum: 1,
      read: true,
      type: 'String',
      headerName: 'lastName',
      objectPath: 'Name{Last}'
    },
    {
      columnNum: 2,
      read: true,
      type: 'Boolean',
      headerName: 'Active',
      objectPath: 'Active'
    },
    {
      columnNum: 3,
      read: true,
      type: 'String',
      headerName: 'Charge',
      objectPath: 'Charge'
    }
  ] 
  });
```
If you'd like to check the resulting object structure or schema from the c2j config:

  ```javascript
  JSON.stringify(c2j.getSchema(), null, 2);
  
  /*
  {
  Name: {
    First: 'Value'
    Last: 'Value'
  },
  Active: 'Value',
  Charge: 'Value'
  }
  
  */
 ```
Once you are sure about that previous step you can start piping the input stream so it can be processed.

```javascript
fs.createReadstream(csvPath)
.pipe(c2j())
.on('data', (data) => {
  console.log(JSON.stringify(data, null, 2));
})
.on('error', (err) => {
  console.log(err);
});


/*
{
  Name: {
    First: 'Eduardo',
    Last: 'Soto'
  },
  Active: true,
  Charge: 'Developer'
}

{
  Name: {
    First: 'Edward',
    Last: 'Alvarado'
  },
  Active: true,
  Charge: 'CTO'
}

*/

```

# Configuration JSON2CSV

The configuration depends on the way the JSON2CSV class is constructed.

```javascript

const JSON2CSV = require('json2csv2json').JSON2CSV;
const j2c = new JSON2CSV(objectSchema, configObj)
```

This class receives an stream of objects which can have multiple forms and attributes. That's why it needs a reference object for it to create a config object and know in advance how many columns the csv output will have. You can pass it any object as a schema and the library will treat the following collection of objects as that first reference. If you don't pass an object sample in the constructor, the JSON2CSV object will read the first object passed to it in the stream and will take it as a reference.

Passing an object schema to the constructor is recommended in the case that the first object that will be passed in the stream is not representative of the collection, also, passing it in the constructor without a config object will generate a default configuration inside the j2c object. You can obtain the config object by calling:

```javascript
const objectSchema = {
  Name: {
    First: 'Value',
    Last: 'Value'
  }
  Active: true,
  Charge: 'Value'
};
const j2c = new JSON2CSV(objectSchema);
let confg = j2c.getConfigk();
console.log(JSON.stringify(confg, null, 2));
/*
{
  hasHeader: true,
  separator: ',',
  errorOnNull: false,
  columns: [
    {
      columnNum: 0,
      read: true,
      type: 'String',
      headerName: 'Name{First}',
      objectPath: 'Name{First}'
    },
    {
      columnNum: 1,
      read: true,
      type: 'String',
      headerName: 'Name{Last}',
      objectPath: 'Name{Last}'
    },
    {
      columnNum: 2,
      read: true,
      type: 'Boolean',
      headerName: 'Active',
      objectPath: 'Active'
    },
    {
      columnNum: 3,
      read: true,
      type: 'String',
      headerName: 'Charge',
      objectPath: 'Charge'
    }
  ]
}
*/
```
The description of the configuration elements is the following:

  * hasHeader: A boolean describing if the generated .csv will have a header row.
  * separator: the char or string that will be used to separate the values of the same row, by default is the comma (',') 
  * errorOnNull: If true, when a value present in the reference object (passed in the constructor or the first object in the stream) is null in a following object in the stream, then it will throw an error. By default is false, and it'll be a null value in the .csv.
  * columns: An array of column objects that describe each column of the csv geenerated and have the following properties:
    * columnNum: Describes the order of the columns from left to right in the gerenerated .csv, it will be applied by sorting the elements.
    * read: A boolean that tells the parser if it reads or ignores that value, and therefore, the column will be generated or not. If you wish to ignore a value, you can also delete the  respective column object and that value will be ignored.
    * type: The type of the values in the object. All will be parsed to string to the csv so in this sense it's not implemented in this way (See CSV2JSON).
    * headerName: The name that the column generated will have as a header, by default is the same as thye objectPath.
    * objectPath: A string describing with a special syntax (see CSV2JSON) the nesting of the value in the object. **Don't modify this**, otherwise, that value won't be read.

You can modify this object and then passed to the j2c object with the 'passConfig(confg)' method. You can parse a JSON object so you can save your own config in this manner.
```javascript
passConfig(confg);
```

# Usage json2csv
 
If you are satisfied with the configuration you can pipe to the j2c object from an object read Stream.
```javascript
const fs = require('fs');
const Stream = require('stream');
const readable = new Stream.Readable({objectMode: true})

readable.pipe(j2c)
.on('data', data => console.log(data));

for (let fileNum = 0; fileNum < 100; fileNum++) {
  readable.push(require(`document${fileNum}.json`));
}
```
A good way of generating object streams from mongoDB is using the mongoose [Cursor](https://mongoosejs.com/docs/api.html#query_Query-cursor).