# Redis GUI

A modern, elegant macOS Redis GUI client built with Electron, Next.js, and Tailwind CSS.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Platform](https://img.shields.io/badge/platform-macOS-lightgrey.svg)

## Features

- **Modern Interface** - Clean and elegant UI design with dark/light mode support
- **Multiple Connection Modes** - Support for both standalone and cluster modes
- **Full Data Type Support** - String, Hash, List, Set, ZSet
- **Key Management** - Browse, search, create, rename, and delete keys
- **TTL Support** - Set and view key expiration times
- **Connection Management** - Save and manage multiple Redis connection configurations
- **Cluster Support** - Full Redis cluster compatibility

## Screenshots

<img width="1200" height="800" alt="image" src="https://github.com/user-attachments/assets/98a5f26d-a1a2-45dc-a6d8-30eb88e23a6b" />


## Installation

### Requirements

- Node.js 18+
- npm or pnpm

### Development Mode

```bash
# Clone the repository
git clone https://github.com/yourusername/redis-gui.git
cd redis-gui

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build

```bash
# Build macOS application
npm run build
```

The built application will be located in the `dist` directory.

## Usage

### Adding a Connection

1. Click the **+** button in the sidebar
2. Select **Standalone** or **Cluster** mode
3. Enter connection details:
   - Name (optional)
   - Host and Port
   - Password (if required)
   - Database number (standalone mode only)
4. Click **Test Connection** to verify
5. Click **Save** to add the connection

### Browsing Keys

- Click a connection to connect to Redis
- Keys are displayed in a tree structure, organized by separator (`:`)
- Use the search box to filter keys
- Click a key to view its value

### Editing Values

- **String**: Edit directly in the text box
- **Hash**: Add, edit, or delete fields
- **List**: Add, edit, or delete elements
- **Set**: Add or delete members (displayed as cards)
- **ZSet**: Add, edit, or delete members with scores

### Key Operations

- **Add Key**: Click the + button in the key panel
- **Rename**: Right-click menu or use the rename button
- **Delete**: Right-click menu or use the delete button
- **Set TTL**: Configure expiration when creating or editing a key

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Desktop**: Electron 34
- **Styling**: Tailwind CSS 4, shadcn/ui
- **State Management**: Zustand
- **Redis Client**: ioredis

## Project Structure

```
redis-gui/
├── main/                 # Electron main process
├── src/
│   ├── app/              # Next.js app router
│   ├── components/       # React components
│   │   ├── editors/      # Data type editors
│   │   └── ui/           # UI components (shadcn)
│   ├── lib/              # Utility functions
│   ├── services/         # Redis service layer
│   ├── stores/           # Zustand stores
│   └── types/            # TypeScript type definitions
├── public/               # Static assets
└── package.json
```

## Development Commands

```bash
npm run dev          # Start development server
npm run build        # Build production version
npm run lint         # Run ESLint
npm run type-check   # TypeScript type check
```

## Contributing

Contributions are welcome! Feel free to submit a Pull Request.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Submit a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI component library
- [ioredis](https://github.com/luin/ioredis) - Powerful Redis client
- [Lucide](https://lucide.dev/) - Elegant icon library
