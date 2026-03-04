import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { split, HttpLink } from "@apollo/client";
import { getMainDefinition } from "@apollo/client/utilities";
import { WebSocketLink } from "@apollo/client/link/ws";
import { Provider } from "react-redux";
import store from "../src/utils/store";
import { ThemeProvider, createTheme } from "@mui/material/styles";

// const wsLink = new WebSocketLink({
//   uri: process.env.NODE_ENV === 'production'
//     ? 'wss://young-hollows-20691.herokuapp.com/graphql'
//     : 'ws://localhost:3001/graphql',
//   options: {
//     reconnect: true
//   }
// });

// const httpLink = new HttpLink({
//   uri: process.env.NODE_ENV === 'production'
//     ? 'https://young-hollows-20691.herokuapp.com/graphql'
//     : 'http://localhost:3001/graphql',
// });

// GraphQL API: env vars in CI (GitHub Actions), Render in production, localhost in dev
const graphqlHttp =
  process.env.REACT_APP_GRAPHQL_URI ||
  (process.env.NODE_ENV === "production"
    ? "https://comic-space-api.onrender.com/graphql"
    : "http://localhost:3001/graphql");
const graphqlWs =
  process.env.REACT_APP_GRAPHQL_WS_URI ||
  (process.env.NODE_ENV === "production"
    ? "wss://comic-space-api.onrender.com/graphql"
    : "ws://localhost:3001/graphql");

const wsLink = new WebSocketLink({
  uri: graphqlWs,
  options: { reconnect: true },
});

const httpLink = new HttpLink({
  uri: graphqlHttp,
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem("id_token");
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  authLink.concat(httpLink)
);

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#E50914" },
    secondary: { main: "#B81D24" },
    background: {
      default: "#141414",
      paper: "#181818",
    },
  },
});

ReactDOM.render(
  <>
    <ApolloProvider client={client}>
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <App />
        </ThemeProvider>
      </Provider>
    </ApolloProvider>
  </>,
  document.getElementById("root")
);

reportWebVitals();
