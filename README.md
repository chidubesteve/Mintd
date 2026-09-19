# Sample Hardhat 3 Beta Project (`mocha` and `ethers`)

This project showcases a Hardhat 3 Beta project using `mocha` for tests and the `ethers` library for Ethereum interactions.

To learn more about the Hardhat 3 Beta, please visit the [Getting Started guide](https://hardhat.org/docs/getting-started#getting-started-with-hardhat-3). To share your feedback, join our [Hardhat 3 Beta](https://hardhat.org/hardhat3-beta-telegram-group) Telegram group or [open an issue](https://github.com/NomicFoundation/hardhat/issues/new) in our GitHub issue tracker.

## Project Overview

This example project includes:

- A simple Hardhat configuration file.
- Foundry-compatible Solidity unit tests.
- TypeScript integration tests using `mocha` and ethers.js
- Examples demonstrating how to connect to different types of networks, including locally simulating OP mainnet.

## Usage
Note to self: the next course of action or the next thing to do would be to investigate why the hot store is empty during a refresh. We've seen that the verification flow and whatnot works, but after you finish them and once you verify your email, you're sent back to the login page. Once you have your email by inputting the OTP, you're sent back to the login page.
I noticed two notifications or, to what do we call this thing again? Two sonnar notifications:
1. One saying "Email successfully verified."
2. One saying "Session expired. Please log in again."
Obviously that is coming from the mutations file, or how do we look into that?
When you log in, the header component is rendered to indicate that the user is logged in. You see your profile, you see the authenticated view, but once the page refreshes, it goes back to the unauthenticated view as if the user wasn't logged in. We need to look into why we are losing the auth data on page refresh.
### Running Tests

To run all the tests in the project, execute the following command:

```shell
npx hardhat test
```

You can also selectively run the Solidity or `mocha` tests:

```shell
npx hardhat test solidity
npx hardhat test mocha
```

### Make a deployment to Sepolia

This project includes an example Ignition module to deploy the contract. You can deploy this module to a locally simulated chain or to Sepolia.

To run the deployment to a local chain:

```shell
npx hardhat ignition deploy ignition/modules/Counter.ts
```

To run the deployment to Sepolia, you need an account with funds to send the transaction. The provided Hardhat configuration includes a Configuration Variable called `SEPOLIA_PRIVATE_KEY`, which you can use to set the private key of the account you want to use.

You can set the `SEPOLIA_PRIVATE_KEY` variable using the `hardhat-keystore` plugin or by setting it as an environment variable.

To set the `SEPOLIA_PRIVATE_KEY` config variable using `hardhat-keystore`:

```shell
npx hardhat keystore set SEPOLIA_PRIVATE_KEY
```

After setting the variable, you can run the deployment with the Sepolia network:

```shell
npx hardhat ignition deploy --network sepolia ignition/modules/Counter.ts
```

## Known/accepted `npm audit` findings

Running `npm audit` at the repo root will still report vulnerabilities in two
dependency chains that are deliberately left unfixed. Both were reviewed and
accepted rather than force-upgraded, because the suggested fixes are breaking
changes to dev-only tooling in `packages/contracts`, not to any code that
runs in production:

- **`diff` / `serialize-javascript`** (via `mocha@^11.7.5`, a direct
  devDependency of `packages/contracts`, also required by
  `@nomicfoundation/hardhat-toolbox-mocha-ethers@^3.0.2` which pins
  `mocha: ^11.0.0`). The audit's suggested fix is `mocha@12.0.1`, which
  breaks that peer range. Neither vulnerable package is imported by any
  source file in this repo — they're mocha's own internal diff-rendering and
  result-serialization for failed test assertions, never exposed to
  untrusted input. **Revisit** once `hardhat-toolbox-mocha-ethers` ships a
  major version supporting `mocha@12`.
- **`elliptic`** (via `ethers@^6.16.0`, a direct devDependency of
  `packages/contracts` used only for local Hardhat deploy/test scripts —
  not a production signing path). The advisory itself states **no fix is
  available upstream**. **Revisit** on the next `ethers` major bump, or if
  an upstream patch for `elliptic` is released.

The one production-facing finding with a fix (a critical Next.js CVE, plus
the `sharp`/`postcss` copies bundled inside it) was addressed by bumping
`next`/`eslint-config-next` in `apps/web` to `16.3.5` — no `--force` needed.
