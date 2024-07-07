![ibc.fun](https://github.com/skip-mev/ibc-dot-fun/blob/staging/public/social.png?raw=true)

# Skip Go App

The Skip Go App is your one stop shop for all interchain transferring, bridging, and swapping needs across Cosmos, Solana, Ethereum mainnet/L2s, and more! This is the repository for [go.skip.build](https://go.skip.build).

## Prerequisites

- [Node.js](https://nodejs.org)
- [npm](https://npmjs.com)

## Clone and setup

```bash
git clone https://github.com/skip-mev/skip-go-app
cd skip-go-app
npm install
cp .env.example .env
```

## Environment variables

Make sure to set the following environment variables in `.env` file:S

```bash
NEXT_PUBLIC_API_URL="https://api.skip.build"
POLKACHU_USER=            # required
POLKACHU_PASSWORD=        # required
NEXT_PUBLIC_EDGE_CONFIG=  # required
```

To retrieve `NEXT_PUBLIC_EDGE_CONFIG`, visit the [edge config token setup page](https://link.skip.build/skip-go-app-edge-config-token).

Read more on all available environment variables in [`.env.example`](.env.example) file.

## Script commands

- run development server: `npm run dev`
- format sources: `npm run format`
- lint sources: `npm run lint`
- build production bundle: `npm run build`
- run production server: `npm run start` (must run `build` first)

## Testing

`npm run test` will run the unit tests.
`npm run test:e2e` will run the automated end-to-end tests. Make sure you have `WORD_PHRASE_KEY=""`(12 word phrase key) in your `.env` file. This will be used to importing the wallet and perform the tests.

## Contributing

Feel free to open an issue or submit a pull request for any bugs and/or improvements.

## Contact

Reach out by joining our [Discord](https://skip.build/discord) server.
