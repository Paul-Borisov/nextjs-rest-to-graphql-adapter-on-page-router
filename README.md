# REST to GraphQL Adapter web app with dynamic plug-and-play data sources and GraphQL Playground for testing queries

Developers have been using REST API for years to work with backend data. However, GraphQL becomes more popular in diverse headless CMS engines because of more convenient data query options.

This adapter web app allows you to transform your existing REST API endpoints to GraphQL entities automatically and expose them for GraphQL queries with filters, selections of fields, dynamic variables and free text search.

# Screenshots

![Default Homepage in light system theme](docs/images/1_default-homepage.png "Default Homepage in light system theme")

![Default Homepage in dark system theme](docs/images/1_default-homepage-dark-mode.png "Default Homepage in dark system theme")

![GraphQL playground with dynamic schema](docs/images/2_graphql-playground-with-dynamic-schema.png "GraphQL playground with dynamic schema")

![GraphQL playground with schema Docs](docs/images/3_graphql-playground-with-schema-docs.png "GraphQL playground with schema Docs")

![Right-hand panel with default entries](docs/images/4_right-hand-panel-with-default-entities.png "Right-hand panel with default entries")

![Right-hand panel with default entries in dark system theme](docs/images/4_right-hand-panel-with-default-entities-dark-mode.png "Right-hand panel with default entries in dark system theme")

![Testing other RESP API endpoints](docs/images/5_test-other-rest-endpoints.png "Testing other RESP API endpoints")

![Testing other RESP API endpoints, error handling](docs/images/6_test-other-rest-endpoints-error-handling.png "Testing other RESP API endpoints, error handling")

![GraphQL queries presented as stable links ("permalinks")](docs/images/7_stable-links-permalinks.png 'GraphQL queries presented as stable links ("permalinks")')

# Typical use cases

Let's put that you have typical REST API endpoints that produce JSON content in formats like https://jsonplaceholder.typicode.com/users or https://dummyjson.com/users

- For instance, array of objects or root object with array of objects. The JSON format transformer can be adjusted with ease in the codebase.

So, you have sets of complex nested JSON objects that may look as shown below

## Source JSON that came from REST API endpoints

```json
{
    "id": 9,
    "name": "Glenna Reichert",
    "username": "Delphine",
    "email": "Chaim_McDermott@dana.io",
    "address": {
      "street": "Dayna Park",
      "suite": "Suite 449",
      "city": "Bartholomebury",
      "zipcode": "76495-3109",
      "geo": {
        "lat": "24.6463",
        "lng": "-168.8889"
      }
    },
    "phone": "(775)976-6794 x41206",
    "website": "conrad.com",
    "company": {
      "name": "Yost and Sons",
      "catchPhrase": "Switchable contextually-based project",
      "bs": "aggregate real-time technologies"
    }
  },
```

```json
    {
      "id": 9,
      "firstName": "Ethan",
      "lastName": "Martinez",
      "maidenName": "",
      "age": 33,
      "gender": "male",
      "email": "ethan.martinez@x.dummyjson.com",
      "phone": "+92 933-608-5081",
      "username": "ethanm",
      "password": "ethanmpass",
      "birthDate": "1991-2-12",
      "image": "https://dummyjson.com/icon/ethanm/128",
      "bloodGroup": "AB+",
      "height": 159.19,
      "weight": 68.81,
      "eyeColor": "Hazel",
      "hair": {
        "color": "Purple",
        "type": "Curly"
      },
      "ip": "63.191.127.71",
      "address": {
        "address": "466 Pine Street",
        "city": "San Antonio",
        "state": "Louisiana",
        "stateCode": "LA",
        "postalCode": "72360",
        "coordinates": {
          "lat": 74.074918,
          "lng": -25.312703
        },
        "country": "United States"
      },
      "macAddress": "59:e:9e:e3:29:da",
      "university": "Syracuse University",
      "bank": {
        "cardExpire": "02/25",
        "cardNumber": "7183482484317509",
        "cardType": "Visa",
        "currency": "CAD",
        "iban": "CW5U5KS23U7JYD22TVQL7SIH"
      },
      "company": {
        "department": "Support",
        "name": "Gorczany - Gottlieb",
        "title": "Legal Counsel",
        "address": {
          "address": "1597 Oak Street",
          "city": "Chicago",
          "state": "Florida",
          "stateCode": "FL",
          "postalCode": "28100",
          "coordinates": {
            "lat": -67.45208,
            "lng": -23.209886
          },
          "country": "United States"
        }
      },
      "ein": "790-434",
      "ssn": "569-650-348",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36",
      "crypto": {
        "coin": "Bitcoin",
        "wallet": "0xb9fc2fe63b2a6c003f1c324c3bfa53259162181a",
        "network": "Ethereum (ERC20)"
      },
      "role": "moderator"
    },
```

## Provided formats of GraphQL queries

The adapter takes a few objects from each endpoint as samples, parses their structure and generates GraphQL schema and resolvers that allow
you to query any object properties using GraphQL syntax.

- For instance, you can test them in the convenient playground http://localhost:3000/api/graphql or in the right-side panel on the homepage
  available by clicking on **Details** button.
- The app has eight preconfigured dynamic REST API endpoint URLs by default and you can add more. They can be added to .env file.

```bash
  # Default endpoint, which is provided by the locally starting json-server after you execute the command "npm run dev"
  # - The project uses concurrently to start both http://localhost:3000 and http://localhost:4000
  http://localhost:4000/employees?\_sort=displayName&\_order=asc

  https://jsonplaceholder.typicode.com/posts

  https://jsonplaceholder.typicode.com/comments

  https://jsonplaceholder.typicode.com/albums

  https://jsonplaceholder.typicode.com/photos

  https://jsonplaceholder.typicode.com/todos

  https://jsonplaceholder.typicode.com/users

  https://dummyjson.com/users # This endpoint demonstrates name and schema conflict resilutions for two /users endpoints
```

```bash
# The original object https://jsonplaceholder.typicode.com/users/9
# Add the following object to Query Variables below:
# {"userId": [5,8,7],"anyText": ["Keebler","Deckow"]}
# You can use any fields in the following GraphQL queries
query Users($userId: [ID], $anyText: [String]) {
  # Supported formats: findUsersById(id: 5), findUsersById(id: [5,8,7])
  findUsersById(id: $userId) {
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

  # Supported formats: findUsersByText(text: "Deck"), findUsersByText(text: ["Keebler","Deckow"])
  findUsersByText(text: $anyText) {
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

  # Supported formats: users(), users(skip: 5), users(skip: 5, top: 3), , users(top: 3)
  users {
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
```

```bash
# The original object https://dummyjson.com/users/9
# Add the following object to Query Variables below:
# {"userId": [7,30,21],"anyText": ["Wisconsin","Ethereum","Connecticut"]}
# You can use any fields in the following GraphQL queries
query UsersDummyjson($userId: [ID], $anyText: [String]) {
  # # Supported formats: findUsersById(id: 21), findUsersById(id: [7,30,21])
  findUsersDummyjsonById(id: $userId) {
    id
    firstName
    lastName
    maidenName
    age
    gender
    email
    phone
    username
    password
    birthDate
    image
    bloodGroup
    height
    weight
    eyeColor
    hair {
        color
        type
    }
    ip
    address {
        address
        city
        state
        stateCode
        postalCode
        coordinates {
            lat
            lng
        }
        country
    }
    macAddress
    university
    bank {
        cardExpire
        cardNumber
        cardType
        currency
        iban
    }
    company {
        department
        name
        title
        address {
            address
            city
            state
            stateCode
            postalCode
            coordinates {
                lat
                lng
            }
            country
        }
    }
    ein
    ssn
    userAgent
    crypto {
        coin
        wallet
        network
    }
    role
  }

  # Supported formats: findUsersByText(text: "consin") and findUsersByText(text: ["Wisconsin","Ethereum", "Connecticut"])
  findUsersDummyjsonByText(text: $anyText) {
    id
    firstName
    lastName
    maidenName
    age
    gender
    email
    phone
    username
    password
    birthDate
    image
    bloodGroup
    height
    weight
    eyeColor
    hair {
        color
        type
    }
    ip
    address {
        address
        city
        state
        stateCode
        postalCode
        coordinates {
            lat
            lng
        }
        country
    }
    macAddress
    university
    bank {
        cardExpire
        cardNumber
        cardType
        currency
        iban
    }
    company {
        department
        name
        title
        address {
            address
            city
            state
            stateCode
            postalCode
            coordinates {
                lat
                lng
            }
            country
        }
    }
    ein
    ssn
    userAgent
    crypto {
        coin
        wallet
        network
    }
    role
  }

  # Supported formats: users(), users(skip: 5), users(skip: 5, top: 3), , users(top: 3)
  usersDummyjson {
    id
    firstName
    lastName
    maidenName
    age
    gender
    email
    phone
    username
    password
    birthDate
    image
    bloodGroup
    height
    weight
    eyeColor
    hair {
        color
        type
    }
    ip
    address {
        address
        city
        state
        stateCode
        postalCode
        coordinates {
            lat
            lng
        }
        country
    }
    macAddress
    university
    bank {
        cardExpire
        cardNumber
        cardType
        currency
        iban
    }
    company {
        department
        name
        title
        address {
            address
            city
            state
            stateCode
            postalCode
            coordinates {
                lat
                lng
            }
            country
        }
    }
    ein
    ssn
    userAgent
    crypto {
        coin
        wallet
        network
    }
    role
  }
}
```

# Overview

- Technical stack: Next.js 15, React 19, TypeScript, GraphQL with Apollo Server and Client, Apollo RestLink, public REST API endpoints,
  Tailwind, Radix UI, local **json-server**, which starts with **concurrently** module and provides a local REST API endpoint
  (made from a locallly stored JSON file **public/employees.json**).

- I used Page Router in Next.js because Apollo Server does have full support for Next.js App Router yet (the state on Oct 14, 2024).

- After you open the Homepage at http://localhost:3000, the adapter connects to all REST API URLs found in **.env**, retrieves and parses data samples.

- Next, it generates GraphQL schema with typeDefs and resolvers for dynamic GraphQL endpoint, which becomes available
  at http://localhost:3000/api/graphql

- After that, Homepage gets and shows data of the first endpoint using a GraphQL query with regular server **fetch** from the GraphQL API (/api/graphql) like shown below.

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
            extensionAttribute7
            extensionAttribute9
            extensionAttribute10
            extensionAttribute11
            extensionAttribute12
            extensionAttribute5
            extensionAttribute8
        }
        manager
        managerUpn
      }
    }`,
};
const data = await fetch("http://localhost:3000/api/graphql", {
  method: "POST",
  headers: {
    "content-type": "application/json",
    Authorization: "Bearer <apiKey, for instance from .env>",
  },
  body: JSON.stringify(query),
}).then((r) => r.json());
```

## Options available out of the box in this **Rest to GraphQL adapter** web app

- GraphQL playground with familiar UI.

- Dynamic evaluations of queries and results on the Homepage. The bitton **Details** opens the right-hand panel with more compact playground UI.

- GraphQL queries for eight preconfigured endpoints are performed using the built In-Memory GraphQL schema.

- GraphQL queries for other dynamic REST API endpoints (not included into default set) are done using Apollo RestLink component.

- The adapter evaluates a few objects from the REST API, generates dynamic schema and executes the query.
- The panel has two buttons, **Test** and **Submit**.

  - **Test** provides quick evaluations of REST API endpoints. Clicking on the button generates GraphQL schema to the text area, executes GraphQL query and shows results in the main content pane. In case of errors, it shows the error message with details. This option makes it easy to test your own endpoints, for instance, https://dummyjson.com/products

  - **Submit** generates stable URL for the currently open query (permalink) and redirects to it.
    The URL can be reused in the same environment, for instance, after restarting the server.
    The logic of redirects uses dynamic routes of Next.js (/url/[[...slug]].tsx) like /url/[encoded REST API URL]/[encoded GraphQL Query].
