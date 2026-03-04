// // const express = require('express');
// // const path = require('path');
// // const { ApolloServer } = require('apollo-server-express');
// // const db = require('./config/connection');
// // const { typeDefs, resolvers } = require('./schemas');
// // const { authMiddleware } = require('./utils/auth');
// import express from 'express';
// import path from 'path';
// import { ApolloServer } from 'apollo-server-express';
// import db from './config/connection.js';
// import typeDefs from './typeDefs/schema.js';
// import resolvers from './resolvers/index.js';
// import auth from './utils/auth.js';
// import { makeExecutableSchema } from '@graphql-tools/schema';
// import { execute, subscribe } from 'graphql';
// import { PubSub } from 'graphql-subscriptions';
// export const pubsub = new PubSub();
// import { SubscriptionServer } from 'subscriptions-transport-ws';
// import { createServer } from 'http';

// const app = express();
// app.use(express.urlencoded({ extended: true }));
// app.use(express.json());
// const PORT = process.env.PORT || 3001;

// const schema = makeExecutableSchema({
//     typeDefs: typeDefs,
//     resolvers: resolvers,
// });

// const httpServer = createServer(app);
// const server = new ApolloServer({
//     schema,
//     context: auth.authMiddleware
// });

// const startApolloServer = async () => {
//     await server.start();
//     return server.applyMiddleware({ app });
// };

// startApolloServer();
// // const server = new ApolloServer({
// //     typeDefs,
// //     resolvers,
// //     context: auth.authMiddleware,
// // });

// // server.applyMiddleware({ app });

// const subscriptionServer = SubscriptionServer.create(
//     {
//         // This is the `schema` we just created.
//         schema,
//         // These are imported from `graphql`.
//         execute,
//         subscribe,
//         onConnect(connectionParams, webSocket, context) {
//             console.log('Connected!');
//         },
//         onDisconnect(webSocket, context) {
//             console.log('Disconnected!');
//         },
//     },
//     {
//         // This is the `httpServer` we created in a previous step.
//         server: httpServer,
//         // This `server` is the instance returned from `new ApolloServer`.
//         path: server.graphqlPath,
//     }
// );

// // if we're in production, serve client/build as static assets
// // if (process.env.NODE_ENV === 'production') {
// //     app.use(express.static(path.join(__dirname, '../client/build')));
// // }

// // app.get('*', (req, res) => {
// //     res.sendFile(path.join(__dirname, '../client/build/index.html'));
// // });

// // db.once('open', () => {
// //     app.listen(PORT, () => {
// //         console.log(`API server running on port ${PORT}!`);
// //         // log where we can go to test our GQL API
// //         console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
// //     });
// // });
// if (process.env.NODE_ENV === 'production') {
//     console.log('YOU ARE IN THE PRODUCTION ENV');
//     const __dirname = path.dirname(new URL(import.meta.url).pathname);
//     app.use(
//         '/static',
//         express.static(path.join(__dirname, '../client/build/static'))
//     );
//     app.get('/', (req, res) => {
//         res.sendFile(path.join(__dirname, '../client/build/'));
//     });
// }

// ['SIGINT', 'SIGTERM'].forEach((signal) => {
//     process.on(signal, () => subscriptionServer.close());
// });

// db.once('open', () => {
//     httpServer.listen(PORT, () => {
//         if (process.env.NODE_ENV === 'production') {
//             console.log('Production server started!');
//         } else {
//             console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
//         }
//     })
// });
import express from "express";
import path from "path";
import cors from "cors";
import { ApolloServer } from "apollo-server-express";
import db from "./config/connection.js";
import typeDefs from "./typeDefs/schema.js";
import resolvers from "./resolvers/index.js";
import auth from "./utils/auth.js";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { execute, subscribe } from "graphql";
import { SubscriptionServer } from "subscriptions-transport-ws";
import { createServer } from "http";
import { fileURLToPath } from "url";
import { dirname } from "path";
import pubsub from "./utils/pubsub.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Allow GitHub Pages and same-origin (Render) so login/GraphQL work from the deployed frontend
const allowedOrigins = [
  "https://qabas-al-ani.github.io",
  "http://localhost:3000",
  /^https:\/\/comic-space-api\.onrender\.com$/,
];
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.some((o) => (typeof o === "string" ? o === origin : o.test(origin)))) return cb(null, true);
      cb(null, false);
    },
    credentials: true,
  })
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Superhero API (free, no key) – https://akabab.github.io/superhero-api/api/
const SUPERHERO_ALL_URL = "https://akabab.github.io/superhero-api/api/all.json";
let superheroCache = null;
let superheroCacheTime = 0;
const CACHE_MS = 1000 * 60 * 60; // 1 hour

async function getAllSuperheroes() {
  if (superheroCache && Date.now() - superheroCacheTime < CACHE_MS) {
    return superheroCache;
  }
  const res = await fetch(SUPERHERO_ALL_URL);
  const data = await res.json();
  superheroCache = Array.isArray(data) ? data : [];
  superheroCacheTime = Date.now();
  return superheroCache;
}

function toComicShape(char) {
  const img = char.images?.md || char.images?.lg || char.images?.sm || "";
  const lastDot = img ? img.lastIndexOf(".") : -1;
  const path = lastDot > 0 ? img.slice(0, lastDot) : img;
  const ext = lastDot > 0 ? img.slice(lastDot + 1) : "jpg";
  return {
    id: char.id,
    title: char.name || "Unknown",
    description: char.biography?.firstAppearance || char.biography?.fullName || "No description",
    thumbnail: { path, extension: ext },
  };
}

app.get("/api/superhero/suggest", async (req, res) => {
  try {
    const q = (req.query.q || req.query.nameStartsWith || "").trim().toLowerCase();
    const all = await getAllSuperheroes();
    const matches = q.length >= 2
      ? all.filter((c) => (c.name || "").toLowerCase().includes(q)).slice(0, 10)
      : [];
    res.json({ data: { results: matches.map((c) => ({ id: c.id, name: c.name })) } });
  } catch (err) {
    console.error("Superhero suggest error:", err);
    res.status(500).json({ error: "Suggest failed" });
  }
});

app.get("/api/superhero/search", async (req, res) => {
  try {
    const q = (req.query.q || "").trim().toLowerCase();
    const offset = Math.max(0, parseInt(req.query.offset, 10) || 0);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const all = await getAllSuperheroes();
    const matches = q.length >= 1
      ? all.filter((c) => (c.name || "").toLowerCase().includes(q))
      : [];
    const total = matches.length;
    const page = matches.slice(offset, offset + limit).map(toComicShape);
    res.json({ data: { results: page, total } });
  } catch (err) {
    console.error("Superhero search error:", err);
    res.status(500).json({ error: "Search failed" });
  }
});

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

const httpServer = createServer(app);

const server = new ApolloServer({
  schema,
  context: auth.authMiddleware,
});

const startApolloServer = async () => {
  await server.start();
  server.applyMiddleware({ app });

  if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../client/build")));

    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "../client/build/index.html"));
    });

    console.log("Production mode: serving static files...");
  }

  db.once("open", () => {
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`GraphQL path: ${server.graphqlPath}`);
    });

    const subscriptionServer = SubscriptionServer.create(
      {
        schema,
        execute,
        subscribe,
        onConnect: () => {
          console.log("🔌 Subscription client connected");
        },
        onDisconnect: () => {
          console.log("❌ Subscription client disconnected");
        },
      },
      {
        server: httpServer,
        path: server.graphqlPath,
      }
    );

    ["SIGINT", "SIGTERM"].forEach(signal => {
      process.on(signal, () => {
        console.log(`Received ${signal}, shutting down subscriptions`);
        subscriptionServer.close();
      });
    });
  });
};

startApolloServer();
