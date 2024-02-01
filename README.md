![ibc.fun](https://github.com/skip-mev/ibc-dot-fun/blob/staging/public/social.png?raw=true)

# ibc.fun

Interchain transfers and swaps on any Cosmos chain. This is the repository for [ibc.fun](https://ibc.fun) website.

## Prerequisites

- [Node.js](https://nodejs.org)
- [npm](https://npmjs.com)

## Clone and setup

```bash
git clone https://github.com/skip-mev/ibc-dot-fun
cd ibc-dot-fun
npm install
cp .env.example .env
```

## Environment variables

Make sure to set the following environment variables in `.env` file:

```bash
NEXT_PUBLIC_API_URL="https://api.skip.money"
NEXT_PUBLIC_CLIENT_ID=    # optional
POLKACHU_USER=            # required
POLKACHU_PASSWORD=        # required
NEXT_PUBLIC_EDGE_CONFIG=  # required
```

To retrieve `NEXT_PUBLIC_EDGE_CONFIG`, visit the [edge config token setup page](https://link.skip.money/ibc-fun-edge-config-token).

Read more on all available environment variables in [`.env.example`](.env.example) file.

## Script commands

- run development server: `npm run dev`
- format sources: `npm run format`
- lint sources: `npm run lint`
- build production bundle: `npm run build`
- run production server: `npm run start` (must run `build` first)

## Contributing

Feel free to open an issue or submit a pull request for any bugs and/or improvements.

## Contact

Reach out to our [support email](mailto:support@skip.money), or join our [Discord](https://skip.money/discord) server.
