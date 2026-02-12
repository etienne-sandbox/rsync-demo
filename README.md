# rsync-demo

A web-based demonstration of the rsync algorithm using the [librsync](https://librsync.org/) library. This project shows how efficient file synchronization works by transferring only the differences (deltas) between files rather than entire file contents.

https://www.andrew.cmu.edu/course/15-749/READINGS/required/cas/tridgell96.pdf

## Overview

This demo implements a client-server architecture where:

- **Client** (React + TypeScript): Displays a local file and can sync it with a remote server
- **Server** (Node.js + Hono): Stores a canonical file and generates patches for client synchronization

The synchronization process uses three key operations:

1. **Signature**: Client generates a checksum of its local file
2. **Diff**: Server compares the checksum against its file and generates a patch
3. **Apply**: Client applies the patch to update its local file

## How It Works

### The Rsync Algorithm

Rather than sending the entire file, rsync uses a signature-based approach:

1. Client computes a **signature** (checksum) of its current file
2. Client sends the signature to the server
3. Server reads its file and computes a **patch** based on the differences
4. Server sends only the patch (typically much smaller than the full file)
5. Client **applies** the patch to synchronize with the server's version

This approach is extremely efficient for large files with small changes, as demonstrated in the UI.

## Features

- **Real-time Synchronization**: Manual sync button and automatic sync mode
- **Live Metrics**: View the sizes of checksums, patches, and resulting files
- **File Preview**: See the file content update as it syncs
- **Sync History**: Log of all synchronization attempts
- **Responsive UI**: Built with Tailwind CSS and React

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS 4
- **Backend**: Node.js, Hono, TypeScript
- **Crypto/Algorithm**: [@dldc/librsync](https://jsr.io/@dldc/librsync) (JavaScript port of librsync)

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 10.29.3+

### Installation

```bash
# Install dependencies
pnpm install
```

### Running the Project

```bash
# Start both server and client
pnpm start
```

This command runs:

- **Server**: Starts on `http://localhost:3030`
- **Client**: Starts on `http://localhost:5173` (default Vite port)

Alternatively, run them separately:

```bash
# Terminal 1: Start the server
pnpm start:server

# Terminal 2: Start the client
pnpm start:client
```

## Development

### Scripts

- `pnpm start` - Start both client and server
- `pnpm start:server` - Start the backend server with hot reload
- `pnpm start:client` - Start the frontend dev server
- `pnpm typecheck` - Check TypeScript types
- `pnpm lint` - Lint with oxlint
- `pnpm lint:fix` - Fix linting issues
- `pnpm fmt` - Format code with oxfmt
- `pnpm fmt:check` - Check code formatting
