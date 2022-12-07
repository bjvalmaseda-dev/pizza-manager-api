import { config } from 'dotenv'
import { ApolloServer } from '@apollo/server'

import express from 'express'
import { expressMiddleware } from '@apollo/server/express4'
import cors from 'cors'
import bodyParser from 'body-parser'
import http from 'http'

// websocket
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer'
import { makeExecutableSchema } from '@graphql-tools/schema'
import { WebSocketServer } from 'ws'
import { useServer } from 'graphql-ws/lib/use/ws'
import { PubSub } from 'graphql-subscriptions'

import { v4 as uuidv4 } from 'uuid'
import axios from 'axios'

//import { GraphQLError } from 'graphql'
config()
const pubsub = new PubSub()

const SUBSCRIPTION_EVENT = {
  ORDER_ADDED: 'ORDER_ADDED',
}

const pizzas = [
  {
    id: '55',
    name: 'Pizza 1',
    price: 50,
  },
  {
    id: '23',
    name: 'Pizza 2',
    price: 25,
  },
  {
    id: '27',
    name: 'Pizza 2',
    price: 25,
  },
]

const typeDefs = `
    enum Status{
      ACCEPTED
      DELIVERED
      PENDING
    }

    input PizzaInput {
      size: String!
      price: Float!
      totalPrice: Float!
      toppings: [ToppingInput]
    }
    
    input ToppingInput{
      name:String!
      price: Float!
    }

    type Order{
        name: String!
        address: String!
        phone: String!
        email: String!
        status: Status!
        date: String!
        products: [Pizza]!
        total: Float!
        id: ID!
    }

    type Pizza{
      size: String!
      price: Float!
      totalPrice: Float!
      toppings: [Topping]
    }

    type Topping {
      name:String!
      price: Float!
    }
    
    type Query{
        allOrders: [Order]
    }

    type Mutation{
      addOrder(
        name: String!
        address: String!
        phone: String!
        email: String!
        products: [PizzaInput]!
        ): Order
    }
    type Subscription{
      orderAdded: Order!
    }
`

const resolvers = {
  Query: {
    allOrders: async () => {
      const { data: orders } = await axios.get('http://localhost:3004/orders')
      return orders
    },
  },

  Mutation: {
    addOrder: async (root, args) => {
      const newOrder = {
        ...args,
        date: new Date().toJSON(),
        status: 'PENDING',
        id: uuidv4(),
      }

      await axios.post('http://localhost:3004/orders/', newOrder)
      pubsub.publish(SUBSCRIPTION_EVENT.ORDER_ADDED, { orderAdded: newOrder })
      return newOrder
    },
  },

  Subscription: {
    orderAdded: {
      subscribe: () => pubsub.asyncIterator(SUBSCRIPTION_EVENT.ORDER_ADDED),
    },
  },
}

const schema = makeExecutableSchema({ typeDefs, resolvers })

const app = express()
const httpServer = http.createServer(app)

const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/',
})

const serverCleanup = useServer({ schema }, wsServer)

const server = new ApolloServer({
  schema,
  plugins: [
    // Proper shutdown for the HTTP server.
    ApolloServerPluginDrainHttpServer({ httpServer }),

    // Proper shutdown for the WebSocket server.
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose()
          },
        }
      },
    },
  ],
})

await server.start()

app.use('/', cors(), bodyParser.json(), expressMiddleware(server))

const PORT = process.env.PORT | 4001
httpServer.listen(PORT, () => {
  console.log(`🚀  Server ready at http://localhost:${PORT}/`)
})
