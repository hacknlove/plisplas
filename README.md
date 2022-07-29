# plisplas

Light and simple DDD framework for making modules, GraphQL, REST that does not get in your way, and just help you wire up your exports, resolvers and controllers.

## Introduction.

It is a pain to have to set everything up and to maintain huge domainless files that look like monoliths, where you need to import all the resolvers, controllers, etc.

It would be nice to have a bit of convention over configuration, so you can drop your controllers and resolvers files with obvious names in obvious directories, and to have a build tool taking care of the rest.

This is what plisplas is about.

## Quick start
```sh
npm init plisplas your-project-name
cd your-project-name
npm run dev
```

## Peer Dependencies
If you want to use HTTP endpoints, you need to install the following dependencies
```
npm i cors deepmerge express
``` 

If you intend to use GraphQL endpoints, you have to install all the following dependencies
```
npm i apollo cors deepmerge express graphql
```

### npm scripts

#### `npm run dev`
It watches changes on the source, build  it, and start a server (if needed).

#### `npm run build`
It builds the human-readable source code version of plisplas at `./plisplas` and then it transpile all the source code to `./dist` 

It also updates your `package.json` to set the `exports` if needed`

#### `npm start`
It starts the server.


## domains directory

This is the only directory plisplas will look for exports, REST endpoints, and GraphQL schemas, types, fields, queries and mutations.

Suit yourself, organizing your files however you want.

You just need to follow some suffix conventions to allow plisplas to do the tedious and boring stuff for you.

    `.get.js` HTTP GET  endpoint
    `.post.js` HTTP POST endpoint
    `.delete.js` HTTP DELETE endpoint
    `.put.js` HTTP PUT endpoint
    `.path.js` HTTP PATCH endpoint
    `.all.js` catch all method for HTTP endpoint
    `.query.js` GraphQL Query
    `.mutation.js` GraphQL Mutation
    `.type.js` GraphQL Type
    `.field.js` GraphQL field for a type
    `.export.js` JavaScript module export


## Module exports
 Any file inside the `domain` that matches `\.export\.m?[tj]s` will be transpiled and exported.

The path of the file will determine the path of the export.
* *the file `/domains/foo/bar/baz.export.js` will be exported like `[package-name]/foo/bar/baz`*
* *the file `/domains/foo/index.export.js` will be exported like `[package-name]/foo*

And all then will also be exported in a combined object as `[package-name]` so the importer can do introspection.

### Import examples
```js
import baz from '[package-name]/foo/bar/baz'

const foo = require('[package-name]/foo')

import packageName from 'package-name`
//  packageName.foo.bar.baz
 ```

## REST endpoints
Any file that matches `/(get|post|put|patch|all).m?[tj]s$/i` will be handling a REST endpoint.

### Path-to-route rules:
#### Basic routing:
The route of the endpoint will be determined by the file path of the file inside domains.

*The file `/domains/foo/bar/baz.get.js` will be handling the `GET` requests to the route `/foo/bar/baz`*

#### index files
The filename of the index files will not be considered for the route.

*The file `/domains/foo/bar/index.get.js` will be handling the `GET` requests to the route `/foo/bar`*

#### Root:
if the path includes `_root_` this will be taken as the root of the route.

*The file `/domains/foo/_root_/bar/baz.post.js` will be handling the `POST` requests to the route `/bar/baz`*

#### Route parameters:

if any path segment is surrounded by brackets, it will be a named route parameter.

*The file `/domains/foo/[bar]/baz.PUT.ts` will be handling the `PUT` requests to the express route `/foo/bar/baz`*

### express configuration

 To modify the middlewares, that are added to the express app before the routes, you can add more items to the `config.express.use` array; or override the default ones,

You can change the port, IP

You can add more items to `config.express.routes` array, or override the default ones, to modify the routes.

## GraphQL

The files matching `/(query|mutation|type|field)\.m?[tj]s$/i` will be handled as resolvers.
The files matching `/\graphql` will be handled as schema definition.

### path to resolver rules:

There are no specific rules for the `.graphql` files.

Those files are just appended together in a single `schema.graphql` file.

#### Query, Mutation and Type naming.

The name of the type, query or mutation, will be determined by the filename, unless the filename is an index, in which case the name will be the parent directory name.

#### field naming

The name of the field will be determined by the filename, and the name of the type it belongs to will be determined by the directory name.

If the field’s file is an index file, the name of the field will be `index`.

#### configuration

`configuration.apollo` will be passed as the parameter to the Apollo Server constructor, so you can do whatever you want.


## configuration

A plisplas service can be configured with a `plisplas.config.js` file.at the root of the project.

This file is transpiled by tsc, so any syntax it supports can be used.

It can default-export a configuration object, or a function that accepts the default configuration object and returns the desired configuration object, or its promise.

In the case of exporting an object, it will be merged with the default configuration object.

### default configuration

```js
export default {
  express: {
    ip: '0.0.0.0',
    port: 5000,
    use: [
      express.json(),
    ],
    routes // array with the parsed routes,
  },
  apollo: {
    csrfPrevention: true,
    resolvers // object with the parsed resolvers,
    typeDefs // string with the parsed typeDefs,
    plugins: [
      process.env.NODE_ENV === 'production'
      ? ApolloServerPluginLandingPageDisabled()
      : ApolloServerPluginLandingPageGraphQLPlayground(),
    ],
  }
}
```

## Custom server

If you need further customizations, you can create your own custom server.

You might want to use the files `plisplas/routes.js` and maybe `plisplas/useRouters.js` to  add the routes to your express application.

You might want to use the files `plisplas/schema.graphql` and `plisplas/resolvers.js` to add the schema to your Apollo Server

and you will need to change your `package.json/scripts/start` to point to your custom server entry point.
