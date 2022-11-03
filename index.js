const { graphqlHandler, graphqlError } = require('graphql-serverless')
const { makeExecutableSchema } = require('graphql-tools') // this dependency is automatically included in 'graphql-serverless'
const { app } = require('webfunc')

// STEP 1. Mock some data for this demo. You can connect this template to read and write to database, instead of the Mock data
const itemMocks = [
  { id: 1, name: 'Knock Bits', quantity: 88, price: 12.67, supplier_id: 1 }, 
  { id: 2, name: 'Widgets', quantity: 10, price: 35.50, supplier_id: 3 }]

// STEP 2. Creating a basic GraphQl Schema.
const schema = `
  type Item {
    id: ID!
    name: String!
    quantity: Int
    price: Float
    supplier_id: Int
  }


  type Query {
      ItemsById(id: Int): [Item]
      ItemsByName(name: String): [Item]
  }

  type Mutation{
	Items(name: String, quantity: Int, price: Float, supplier_id: Int): Int
  }

  schema {
    query: Query
    mutation: Mutation
  }`

const itemResolver = {
  Query: {
      ItemsById(root, { id }, context) {
		const results = id ? itemMocks.filter(p => p.id == id) : itemMocks
		      if (results.length > 0)
			return results
		      else
			throw graphqlError(404, `Item with id ${id} does not exist.`)
      },
      ItemsByName(root, { name }, context) {
      		const results = name ? itemMocks.filter(p => p.name == name) : itemMocks
      			if (results.length > 0)
       			   return results
      			else
        		   throw graphqlError(404, `Product with Item ${name} does not exist.`)
    }
  },
  Mutation: {
   Items(root, {name, quantity, price, supplier_id}, context){
	tmp_id = itemMocks.length + 1
	tmp_item = {id:tmp_id, name:name, quantity: quantity, price: price, supplier_id: supplier_id}
   	itemMocks.push(tmp_item)
	return tmp_id;
   }
  }
}

const executableSchema = makeExecutableSchema({
  typeDefs: schema,
  resolvers: itemResolver
})

// STEP 3. Creating a GraphQL and a GraphiQl endpoint
const graphqlOptions = {
  schema: executableSchema,
  graphiql: { // If you do not want to host any GraphiQl web interface, leave this property undefined.
    endpoint: '/graphiql' 
  },
  context: {
  	someVar: 'This variable is passed in the "context" object in each resolver.'
  }
}

// Host a GraphQl API on 2 endpoints: '/' and '/graphiql'. '/graphiql' is used to host the GraphiQL web interface.
// If you're not interested in the GraphiQl web interface, leave the above 'graphqlOptions.graphiql' undefined and 
// replace the path following ['/', '/graphiql'] with '/'.
app.all(['/', '/graphiql'], graphqlHandler(graphqlOptions))

// STEP 4. Starting the server 
eval(app.listen('app', 4000))
