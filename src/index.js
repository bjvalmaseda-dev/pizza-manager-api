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
const BASE_API_URL = process.env.BASE_API_URL || 'http://localhost:3004'
const SUBSCRIPTION_EVENT = {
  ORDER_ADDED: 'ORDER_ADDED',
  ORDER_UPDATED: 'ORDER_UPDATED',
}

const typeDefs = `
    enum Status{
      ACCEPTED
      COMPLETED
      PENDING
      CANCELLED
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
        total: Float
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
        total: Float!
        ): Order
      changeOrderStatus (id: ID!, status: Status!):Order
    }
    type Subscription{
      orderAdded: Order!
      orderUpdated: Order!
    }
`

const resolvers = {
  Query: {
    allOrders: async () => {
      const { data: orders } = await axios.get(`${BASE_API_URL}/orders`)
      return orders
    },
  },

  Mutation: {
    addOrder: async (_, args) => {
      const newOrder = {
        ...args,
        date: new Date().toJSON(),
        status: 'PENDING',
        id: uuidv4(),
      }

      await axios.post(`${BASE_API_URL}/orders`, newOrder)
      pubsub.publish(SUBSCRIPTION_EVENT.ORDER_ADDED, { orderAdded: newOrder })
      return newOrder
    },
    changeOrderStatus: async (_, { id, status }) => {
      const { data: order } = await axios.get(`${BASE_API_URL}/orders/${id}`)

      const updatedOrder = { ...order, status }
      await axios.put(`${BASE_API_URL}/orders/${id}`, updatedOrder)
      pubsub.publish(SUBSCRIPTION_EVENT.ORDER_UPDATED, {
        orderUpdated: updatedOrder,
      })
      return updatedOrder
    },
  },

  Subscription: {
    orderAdded: {
      subscribe: () => pubsub.asyncIterator(SUBSCRIPTION_EVENT.ORDER_ADDED),
    },
    orderUpdated: {
      subscribe: () => pubsub.asyncIterator(SUBSCRIPTION_EVENT.ORDER_UPDATED),
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

const PORT = process.env.PORT || 4001
httpServer.listen(PORT, () => {
  console.log(`🚀  Server ready at port: ${PORT}`)
})
