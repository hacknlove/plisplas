import express from 'express'
import { ApolloServerPluginLandingPageGraphQLPlayground, ApolloServerPluginLandingPageDisabled } from 'apollo-server-core';
import merge from 'deepmerge'
import { readFile } from 'fs/promises';

import routes from './routes.js';
import resolvers from './resolvers.js';

const defaultConfig = {
  express: {
    ip: '0.0.0.0',
    port: 5000,
    use: [
      express.json(),
    ],
    routes,
  },
  apollo: {
    csrfPrevention: true,
    resolvers,
    plugins: [
      process.env.NODE_ENV === 'production'
      ? ApolloServerPluginLandingPageDisabled()
      : ApolloServerPluginLandingPageGraphQLPlayground(),
    ],
  }
}

const customConfig = import(`../plisplas.config.js`).catch(err => ({}));
const schemaPromise = readFile(`${__dirname}/schema.graphql`, 'utf8').catch(() => '');

export default async function getConfig() {
  defaultConfig.apollo.typeDefs = await schemaPromise;
  const config = await customConfig;

  if (typeof config === 'function') {
    return config(defaultConfig);
  }
 
  return merge(defaultConfig, config);; 
}