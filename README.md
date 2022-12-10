<!-- PROJECT LOGO -->
<br />
<div align="center"> 
  <h3 align="center">Pizza manager sample GraphQL API</h3>

  <p align="center">
    An example API to implements some functionalities in the Frontend Developer technical test.  
  </p>
</div>



<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

This is an API to support the application created for the Frontend Developer technical test. This API is only to development use: 

* Created a Order
* Change Order status
* Subscribe via WS to receive orders changes

### Built With

* [![Node.js][node]][node-url]
* [![Express][express]][express-url]
* [![Apollo GraphQL][apollographql]][apollographql-url]



<!-- GETTING STARTED -->
## Getting Started

You can run this project on locally for testing

### Prerequisites

To run this API you need to hace installed:
* node and yarn

### Installation

1. Clone the repo
   ```sh
   $ git clone https://github.com/bjvalmaseda-dev/pizza-manager-api
   ```

2. Copy `.env.example` to `.env`
    ```sh
    $ cp .env.example .env
    ```
3. Edit `.env` and define your environments variables  

    `BASE_API_URL`: URL for Restful API (in this case use json-server module (http://localhost:3004))
    
    `PORT`: Port number to server listen (default 3000)

4. Start the API to development in local. This will run concurrently a json-server whit a Restful API and a GraphQL server to wrapper all the Restful API calls 
   ```sh
   $ yarn start:dev
   ```

*Now you can use http://localhost:3000 as `BASE_API_URL` in the frontend app [Pizza Manager App][pizza-manager-app-url]*



## Usage

To use the API you should visit the Apollo Server Play Ground in http://localhost:3000 

### API Reference

##### Get all Orders

```js
query{
  allOrders {
    id
    name
    phone
    address
    status
    products {
      size
      price
      totalPrice
      toppings {
        name
        price
      }
    }
  }
}
```

##### Create Order

```js
mutation($name: String!, $address: String!, $phone: String!, $email: String!, $products: [PizzaInput]!, $total: Float!){
  addOrder(name: $name, address: $address, phone: $phone, email: $email, products: $products, total: $total) {
    id
    name
    phone
    address
    status
    products {
      size
      price
      totalPrice
      toppings {
        name
        price
      }
    }
  }
}
```

##### Update task

```js

mutation($changeOrderStatusId: ID!, $status: Status!){
  changeOrderStatus(id: $changeOrderStatusId, status: $status) {
     id
    name
    phone
    address
    status
    products {
      size
      price
      totalPrice
      toppings {
        name
        price
      }
    }
  }
}
```


<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE.txt` for more information.


<!-- CONTACT -->
## Contact

Bárbaro Javier Valmaseda - [@bjvalmaseda](https://twitter.com/bjvalmaseda)

[Project Link][project-link]



<!-- MARKDOWN LINKS & IMAGES -->

<!-- BADGES -->
[express]: https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white
[node]: https://img.shields.io/badge/Node%20JS-339933?style=for-the-badge&logo=nodedotjs&logoColor=white
[apollographql]: https://img.shields.io/badge/Apollo_GraphQL-1B2240?style=for-the-badge&logo=apollographql&logoColor=311C87
<!-- IMAGES -->
[logo]: docs/ce_logo.png

<!-- LINKS -->
[docker-url]: https://www.docker.com/
[express-url]: https://expressjs.com/
[node-url]: https://nodejs.org/
[apollographql-url]:https://www.apollographql.com/
[project-link]:https://github.com/bjvalmaseda-dev/pizza-manager-api
[pizza-manager-app-url]:https://github.com/bjvalmaseda-dev/pizza-manager-app
