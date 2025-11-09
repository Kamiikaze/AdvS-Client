<div align="center">

![GitHub Release](https://img.shields.io/github/v/release/Kamiikaze/advs-client)
![GitHub Release Date](https://img.shields.io/github/release-date/kamiikaze/advs-client)
![GitHub Downloads (all assets, all releases)](https://img.shields.io/github/downloads/Kamiikaze/advs-client/total)
![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/Kamiikaze/advs-client/release.yml)
[![CodeFactor](https://www.codefactor.io/repository/github/kamiikaze/advs-client/badge)](https://www.codefactor.io/repository/github/kamiikaze/advs-client)

![GitHub License](https://img.shields.io/github/license/kamiikaze/advs-client)
![GitHub Created At](https://img.shields.io/badge/created%20at-28.April%202025-red)
</div>

---

# AdvS-Client

A modern desktop streaming client built with Electron and Vue.js, designed to provide a seamless video streaming experience with advanced features and customization options.

## 🎯 Why AdvS-Client?

AdvS-Client was created to offer users a dedicated desktop application for streaming content with enhanced privacy, performance, and user experience features. The application provides a native desktop experience with integrated ad-blocking, history tracking, and an intuitive interface built on modern web technologies.

## ✨ Features

### 🎬 **Video Streaming**
Advanced video player powered by Vidstack with support for multiple streaming formats. Watch your favorite shows with a smooth, responsive playback experience.

### 📚 **Show Library Management**
Browse and manage your show library with an organized dashboard. The application maintains an up-to-date list of available content with automatic updates.

### 📖 **Watch History**
Track your viewing progress automatically. Resume watching from where you left off with built-in watch history functionality.

### 🛡️ **Ad-Blocking**
Integrated ad-blocking using Ghostery's Electron ad-blocker. Enjoy uninterrupted streaming with built-in protection against ads and trackers.

### 🖥️ **System Tray Integration**
Minimize to system tray for quick access. Control playback and access features directly from your taskbar.

### 🔄 **Auto-Updates**
Automatic update checking ensures you always have the latest features and security improvements.

### 🎨 **Modern UI**
Beautiful, responsive interface built with Vuetify 3. Enjoy a clean, material design experience with dark mode support.

### ⚡ **High Performance**
Built on Electron with optimized rendering and resource management for smooth performance even during intensive streaming.

### 🔗 **Deep Linking**
Support for `advs://` protocol for seamless integration with external applications and web browsers.

### 🖼️ **Desktop Shortcuts**
Create desktop shortcuts for quick access to your favorite shows.

## 🛠️ Tech Stack

### Frontend
- **Vue 3** - Progressive JavaScript framework
- **Vuetify 3** - Material Design component framework
- **Pinia** - State management
- **Vue Router** - Routing and navigation
- **Vidstack** - Advanced video player
- **Vite** - Next-generation build tool
- **TypeScript** - Type-safe development

### Backend (Electron)
- **Electron** - Cross-platform desktop framework
- **GrandLineX** - Modular kernel architecture
- **SQLite** - Local database
- **Ghostery Ad-Blocker** - Ad and tracker blocking
- **TypeScript** - Type-safe development

## 📋 Requirements

- Node.js 22.x or higher
- npm, yarn, pnpm, or bun package manager

## 🚀 Installation

### Development Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/advs-client.git
cd advs-client
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
```

3. Install electron dependencies:
```bash
cd ../electron
npm install
```

### Running in Development Mode

**Start Frontend Development Server:**
```bash
cd frontend
npm run dev
```

**Start Electron Development:**
```bash
cd electron
npm run startDev
```

### Building for Production

**Build the Application:**
```bash
cd electron
npm run make
```

This will create distributable packages in the `electron/out` directory.

## 📦 Project Structure

```
advs-client/
├── electron/            # Electron main process
│   ├── res/             # Resources (icons, preload, etc.)
│   └── src/
│   │   ├── modules/     # Application modules
│   │   ├── window/      # Window management
│   │   └── util/        # Utilities
│
├── frontend/            # Vue.js frontend application
│   ├── public/          # Static assets
│   └── src/
│       ├── components/  # Vue components
│       ├── pages/       # Application pages
│       ├── store/       # Pinia stores
│       └── plugins/     # Vue plugins
└── LICENSE.md
└── README.md
```

## 🔧 Configuration

The application stores its configuration in the following locations:
- **Windows:** `%APPDATA%/advs-client`

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. By contributing to this project, you agree that your contributions will be licensed under the GNU AGPL-3.0 License.

### How to Contribute
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the GNU Affero General Public License v3.0 (AGPL-3.0) - see the [LICENSE.md](LICENSE.md) file for details.

### What does this mean?
- ✅ You can use, modify, and distribute this software
- ✅ You can contribute to this project
- ✅ Any modifications must be open-sourced under the same license
- ❌ **Commercial use requires open-sourcing all modifications**
- ❌ You cannot use this software in proprietary/closed-source products

## ⚠️ Important Notice

**This project does NOT host, store, or distribute any copyrighted content.** AdvS-Client is a streaming client interface that connects to external streaming providers. All content is streamed from third-party sources.

**This project is NOT intended for commercial use.** It is provided as-is for personal, educational, and non-commercial purposes only. Any commercial use must comply with the AGPL-3.0 license terms, requiring all modifications to be open-sourced.

The developers of AdvS-Client are not responsible for how users choose to utilize this software or for any content accessed through it. Users are responsible for ensuring their use complies with applicable laws and regulations in their jurisdiction.

---

Made with ❤️ using Vue.js and Electron
