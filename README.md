## json2csv2json
Convert to and from json / csv

# Example

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
 
# Configuration CSV2JSON


```csv
Name, lastName, Active, Charge
Eduardo, Soto, true, Developer
Edward, Alvarado, true, CTO
```

Headers (or user) generate an internal configuration in the c2j object, objectPat = headerName by default:
 ```javascript
 
 
c2j.printConfig();
/*
{ 
  separator: ',',
  hasHeader: true,
  rows: [
    {
      rowID: 0,
      read: true,
      type: 'String',
      headerName: 'Name',
      objectPath: 'Name'
    },
    {
      rowID: 1,
      read: true,
      type: 'String',
      headerName: 'lastName',
      objectPath: 'lastName'
    },
    {
      rowID: 2,
      read: true,
      type: 'String',
      headerName: 'Active',
      objectPath: 'Active'
    },
    {
      rowID: 3,
      read: true,
      type: 'String',
      headerName: 'Charge',
      objectPath: 'Charge'
    }
  ]
}
*/
```


This configuration generates the following internal object structure by default:


```javascript
{
  Name: 'Value',
  lastName: 'Value',
  Active: 'Value',
  Charge: 'Value'
}

```
Modifying the config like this:

 ```javascript
 
c2j.rows[0].objectPath = 'Name{First}';
c2j.rows[1].objectPath = 'Name{Last}';
c2j.rows[2].type = 'Boolean';

c2j.printConfig();

/*
{ 
  separator: ',',
  hasHeader: true,
  rows: [
    {
      rowID: 0,
      read: true,
      type: 'String',
      headerName: 'Name',
      objectPath: 'Name{First}'
    },
    {
      rowID: 1,
      read: true,
      type: 'String',
      headerName: 'lastName',
      objectPath: 'Name{Last}'
    },
    {
      rowID: 2,
      read: true,
      type: 'Boolean',
      headerName: 'Active',
      objectPath: 'Active'
    },
    {
      rowID: 3,
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
 
 ```javascript
 const CSV2JSON = require('j2c2j').CSV2JSON;
 const fs = require('fs')
 
 const csvPath = 'path/to/csvFile.csv'
 const c2j = CSV2JSON(csvPath);
 ```
 That last line reads the headers of the .csv file and generates the initial config.
 Also you could insert the header as a string.
 
 ```javascript
  const c2j = CSV2JSON('Name, lastName, Active, Charge', headerAsString = true);
 ```
 Or if you need to input the properties (for example in cases where the .csv file has no headers), just call the constructor and then modify c2j's properties:
 
```javascript
  const c2j = CSV2JSON();
  c2j.rows.push({
      rowID: 0,
      read: true,
      type: 'String',
      headerName: 'Name',
      objectPath: 'Name{First}'
    });
```
Or you can input your configurations if you have them in a JSON file with parse or manually:
 
```javascript
  const c2j = CSV2JSON(config = {rows:[
    {
      rowID: 0,
      read: true,
      type: 'String',
      headerName: 'Name',
      objectPath: 'Name{First}'
    },
    {
      rowID: 1,
      read: true,
      type: 'String',
      headerName: 'lastName',
      objectPath: 'Name{Last}'
    },
    {
      rowID: 2,
      read: true,
      type: 'Boolean',
      headerName: 'Active',
      objectPath: 'Active'
    },
    {
      rowID: 3,
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
  c2j.printSchema();
  
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
  console.log(data);
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

 # Usage json2csv
 
 ```javascript
const jsonPath = 'path/to/file' 

const JSON2CSV = require('j2c2j').JSONtoCSV

const j2c = JSON2CSV();

const fs = require('fs');

fs.createReadStream(jsonPath)
.pipe(j2c())
.on('data', (data) => {
  console.log(JSON.stringify(data, null, 2));
})
.on('error', (err) => {
  console.log(err);
});
```

