<pre>
# GraphQL Playground
# Add the following object to Query Variables below: 
# {"userId": "9bb53600-30e3-4b59-82ff-26ce784b5d33","anyText": "Marius"}
query Employees($userId: [ID], $anyText: [String]) {
  findEmployeesById(id:$userId) {
    id
    userPrincipalName
    displayName
    jobTitle
    department
    city
    country
    companyName
    officeLocation
    onPremisesExtensionAttributes {
      extensionAttribute1
      extensionAttribute2
      extensionAttribute3
      extensionAttribute5
      extensionAttribute7
      extensionAttribute8
      extensionAttribute9
      extensionAttribute10
      extensionAttribute11
      extensionAttribute12
    }
    manager
    managerUpn
  }

  findEmployeesByText(text:$anyText) {
    id
    userPrincipalName
    displayName
    jobTitle
    department
    city
    country
    companyName
    officeLocation
    onPremisesExtensionAttributes {
      extensionAttribute1
      extensionAttribute2
      extensionAttribute3
      extensionAttribute5
      extensionAttribute7
      extensionAttribute8
      extensionAttribute9
      extensionAttribute10
      extensionAttribute11
      extensionAttribute12
    }
    manager
    managerUpn  
  }
  
  employees(skip:0,top:0) {
    id
    userPrincipalName
    displayName
    jobTitle
    department
    city
    country
    companyName
    officeLocation
    onPremisesExtensionAttributes {
      extensionAttribute1
      extensionAttribute2
      extensionAttribute3
      extensionAttribute5
      extensionAttribute7
      extensionAttribute8
      extensionAttribute9
      extensionAttribute10
      extensionAttribute11
      extensionAttribute12
    }
    manager
    managerUpn    
  }
}
</pre>

<pre>
# Add the following object to Query Variables below:
# {"userId": [4,5],"anyText": ["Keebler","Deckow"]}
query Users($userId: [ID], $anyText: [String]) {
  findUsersById(id:$userId) {
    id
    name
    username
    email
    address {
        street
        suite
        city
        zipcode
        geo {
            lat
            lng
        }
    }
    phone
    website
    company {
        name
        catchPhrase
        bs
    }
  }

  findUsersByText(text:$anyText) {
    id
    name
    username
    email
    address {
        street
        suite
        city
        zipcode
        geo {
            lat
            lng
        }
    }
    phone
    website
    company {
        name
        catchPhrase
        bs
    }
  }
  
  users(skip:0,top:0) {
    id
    name
    username
    email
    address {
        street
        suite
        city
        zipcode
        geo {
            lat
            lng
        }
    }
    phone
    website
    company {
        name
        catchPhrase
        bs
    }
  }
}
</pre>

<pre>
# Add the following object to Query Variables below:
# {"postId": [5,18],"anyText": "nmollitia"}
query Posts($postId: [ID], $anyText: [String]) {
  findPostsById(id:$postId) {
    userId
    id
    title
    body
  }

  findPostsByText(text:$anyText) {
    userId
    id
    title
    body
  }
  
  posts(skip:0,top:0) {
    userId
    id
    title
    body
  }
}
</pre>

Try this in browser's console:

```javascript
const query = {
  operationName: "Employees",
  variables: {},
  query: `
    query Employees {
      employees {
        id
        userPrincipalName
        displayName
      }
    }`,
};
console.log(
  await fetch("http://localhost:3000/api/graphql", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(query),
  }).then((r) => r.json())
);
```
