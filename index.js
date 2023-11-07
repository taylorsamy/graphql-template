const { graphqlHandler, graphqlError } = require('graphql-serverless')
const { makeExecutableSchema } = require('graphql-tools') 
const { app } = require('webfunc')

const itemMocks = [
  { id: 1, name: 'Knock Bits', quantity: 88, price: 12.67, supplier_id: 1 }, 
  { id: 2, name: 'Widgets', quantity: 10, price: 35.50, supplier_id: 3 }]

const supplierMocks = [
  { id: 1, name: 'Acme', address: '123 Main St', phone: '555-1212' },
  { id: 2, name: 'ABC', address: '456 Main St', phone: '555-1212' },
  { id: 3, name: 'XYZ', address: '789 Main St', phone: '555-1212' },
  { id: 4, name: '123', address: '123 Main St', phone: '555-1212' },
  { id: 5, name: '456', address: '456 Main St', phone: '555-1212' },
  { id: 6, name: '789', address: '789 Main St', phone: '555-1212' },
  { id: 7, name: 'ABC', address: '123 Main St', phone: '555-1212' }]

const schema = `
  type Item {
    id: ID!
    name: String!
    quantity: Int
    price: Float
    supplier_id: Int
  }

  type Supplier {
    id: ID!
    name: String!
    address: String
    phone: String
  }
 
  type Query {
      itemsById(id: Int): Item
      items: [Item]
      itemsByName(name: String): [Item]
      suppliersById(id: Int): Supplier
  }

  type Mutation {
    addItem(name: String!, quantity: Int, price: Float, supplier_id: Int): Item
  }
  `
 
const itemResolver = {
  Query: {
      itemsById(root, { id }, context) {
		const results = id ? itemMocks.filter(p => p.id == id) : itemMocks
		      if (results.length > 0)
			return results.pop()
		      else
			throw graphqlError(404, `Item with id ${id} does not exist.`)
      },
      items(root, {}, context) {
        return itemMocks
      },
      itemsByName(root, { name }, context) {
        return itemMocks.filter(p => p.name == name)
      },
      suppliersById(root, { id }, context) {
        const results = id ? supplierMocks.filter(p => p.id == id) : supplierMocks
        if (results.length > 0)
          return results.pop()
        else
          throw graphqlError(404, `Supplier with id ${id} does not exist.`)
      }
   },
  Mutation: {
    addItem(root, { name, quantity, price, supplier_id }, context) {
      const item = { id: itemMocks.length + 1, name, quantity, price, supplier_id }
      itemMocks.push(item)
      return item
    }
  }

}

const executableSchema = makeExecutableSchema({
  typeDefs: schema,
  resolvers: itemResolver
})

const graphqlOptions = {
  schema: executableSchema,
  graphiql: { 
    endpoint: '/graphiql' 
  },
  context: {
  	someVar: 'This variable is passed in the "context" object in each resolver.'
  }
}

app.all(['/','/graphiql'], graphqlHandler(graphqlOptions))

eval(app.listen('app', 4000))
