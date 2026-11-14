# Mintd MVP

The Mintd luxury-watch registration and digital-certificate MVP. This repository contains an npm-workspaces/Turborepo monorepo:

- `apps/web` — Next.js frontend
- `apps/server` — Express/Mongoose API
- `packages/contracts` — Solidity smart contracts and Hardhat tooling

**Start with [HANDOVER.md](./HANDOVER.md)** for the current implementation status, local setup, service-account configuration, outstanding integrations and contract deployment notes.

The application and smart contract are separate: the NFT contract has been built and tested, but NFT minting has **not** been wired into the web application. This repository is a project handover, not a claim that all originally planned product features were completed.
