
const ApolloServer = require('apollo-server').ApolloServer
const ApolloServerLambda = require('apollo-server-lambda').ApolloServer
const { gql } = require('apollo-server-lambda');
const db = require('./_db');

const typeDefs = gql`
  type Game {
        id: ID!
        title: String,
        platform: [String!]!
        reviews: [Review!]
    }

    type Review {
        id:ID!
        rating: Int!
        content: String!
        game: Game!
        author: Author!
    }

    type Author {
        id:ID!
        name:String!
        verified:Boolean!
        reviews: [Review!]
    }

    type Query {
    games: [Game]
    game(id:ID!): Game
    reviews: [Review]
    review(id:ID!): Review
    authors: [Author]
    author(id:ID!):Author
}

type Mutation {
    addGame(game: AddGameInput!): Game
    deleteGame(id: ID!): [Game]
    updateGame(id:ID!,edits: EditGameInput!): Game
}

input AddGameInput {
    title: String!,
    platform: [String!]!
}

input EditGameInput {
    title: String,
    platform: [String!]
}
`;

const resolvers = {
 Query: {
        games() {
            return db.games;
        },
        game(_, args) {
            return db.games.find((game) => game.id === args.id);
        },
        authors() {
            return db.authors;
        },
        author(_, args) {
            return db.authors.find((author) => author.id === args.id);
        },
        reviews() {
            return db.reviews;
        },
        review(_, args) {
            return db.reviews.find((review) => review.id === args.id);
        },
    },
    Game: {
        reviews(parent) {
            return db.reviews.filter((r) => r.game_id === parent.id);
        },
    },
    Author: {
        reviews(parent) {
            return db.reviews.filter((r) => r.author_id === parent.id);
        },
    },
    Review: {
        author(parent) {
            return db.authors.find((a) => a.id === parent.author_id);
        },
        game(parent) {
            return db.games.find((g) => g.id === parent.game_id);
        },
    },
    Mutation: {
        deleteGame(_, args) {
            db.games = db.games.filter((g) => g.id !== args.id);
            return db.games;
        },
        addGame(_, args) {
            let game = {
                ...args.game,
                id: Math.floor(Math.random() * 10000).toString(),
            };

            db.games.push(game);
            return game;
        },
        updateGame(_, args) {
            db.games = db.games.map((g) => {
                if (g.id === args.id) {
                    return { ...g, ...args.edits };
                }
                return g;
            });
            return db.games.find((g) => g.id === args.id);
        },
    },
};

function createLambdaServer () {
  return new ApolloServerLambda({
    typeDefs,
    resolvers,
    introspection: true,
    playground: true,
  });
}

function createLocalServer () {
  return new ApolloServer({
    typeDefs,
    resolvers,
    introspection: true,
    playground: true,
  });
}

module.exports = { createLambdaServer, createLocalServer }
