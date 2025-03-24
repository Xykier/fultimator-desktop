# Fultimator (Desktop Version)

![Fultimator Logo](https://github.com/fultimator/fultimator-desktop/blob/main/public/fultimatorlogo.webp)

## Introduction

Fultimator is a desktop application designed to enhance and streamline the management of your **Fabula Ultima** games. It provides a variety of tools to simplify gameplay for both players and GMs, including:

- **Character Creation**: Easily build and manage your characters.
- **Adversary Creation**: Quickly design NPCs for your adventures.
- **Combat Tracker**: Track ongoing battles and combat scenarios in real time.
- **Other Tools**: Design weapons, armor, and accessories, create new Arcana, and manage Projects and Rituals.

## Info and License

Fultimator Desktop is based on an offline-only Electron version of the Fultimator WebApp:
- **Fultimator Web Application**: [Website](https://fabula-ultima-helper.web.app/) | [GitHub Repository](https://github.com/fultimator/fultimator)

Fultimator is an independent project by the [Fultimator Dev Team](https://github.com/fultimator), and is **not affiliated** with Need Games or Rooster Games. The game rules in the system compendium are published under the [Fabula Ultima Third Party Tabletop License 1.0](https://need.games/wp-content/uploads/2024/06/Fabula-Ultima-Third-Party-Tabletop-License-1.0.pdf).

To fully utilize the system, you will need the [Fabula Ultima Core Rulebook](https://www.needgames.it/fabula-ultima-en/).

The source code is licensed under the [MIT License](https://github.com/fultimator/fultimator-desktop/blob/main/LICENSE.md).

---

## Download

Get the latest release from the [Releases Page](https://github.com/fultimator/fultimator-desktop/releases).

---

## Community & Support

- **Discord (Development & Feedback)**: [Fultimator Server](https://discord.gg/9yYc6R93Cd) (`#development` channel)
- **General Discussion**: [Rooster Games Discord](https://discord.gg/G9qGbn2) (`#bot-and-tool-discussion` channel)

---

## Localization

Fultimator is available in **English, Italian, German, French, Portuguese, Spanish, Polish, and Russian**.  

Want to help improve translations or add new ones? Join our [Discord Server](https://discord.gg/9yYc6R93Cd) and contribute to the localization effort!  

---

## Reporting Issues

Encounter a bug or have a feature request? Submit an issue on [GitHub Issues](https://github.com/fultimator/fultimator-desktop/issues).

### Guidelines for Reporting Bugs
- Ensure the issue is **not caused by your local environment**.
- Provide **clear reproduction steps** and describe **expected vs. actual behavior**.

---

## Tooling and Setup

### Branches
- **main** – Stable branch for releases.
- **dev** – Active development branch.

Ensure all pull requests target the correct branch.

### Development Prerequisites
Before getting started, install the following:

- [Git](https://git-scm.com/)
- [Node.js v18+ (LTS)](https://nodejs.org/)
- Recommended Code Editor: [VS Code](https://code.visualstudio.com/)

---

## Development Setup

Clone the repository:

```bash
git clone https://github.com/fultimator/fultimator-desktop.git
cd fultimator-desktop
```

Install dependencies:

```bash
npm ci
```

Update configuration files:

1. Rename **.envInfo** to **.env**  
2. Add your personal keys.


To fetch the latest translations, run:  

```bash
npm run translate
```

---

## Running the Application

### Development Mode

To start the app in development mode with Vite and Electron:

```bash
npm run dev
```

To preview a production build outside Electron:

```bash
npm run preview
```

---

## Building and Packaging

To package the desktop application:

```bash
npm run build
```

For more details, refer to the [Electron Documentation](https://www.electronjs.org/docs).

---

## Project Contributors

Special thanks to the following contributors:

- **Triex** ([matteosuppo](https://github.com/matteosuppo)) - Original creator of the web app. [Fultimator Web](https://github.com/codeclysm/fultimator).  
- **Alyx** ([greg-argulla](https://github.com/greg-argulla)) - Extended functionality with localization and adversary compendium.  
- **spyrella** ([spyrella](https://github.com/spyrella)) - Ongoing system updates and maintenance.  
- **acinoroc** ([acinoroc](https://github.com/acinoroc)) - Lead developer of the **Character Designer**, **Combat Simulator**, and main developer of the **Desktop Version**.  
- **The Fultimator Localization Team** – A huge thank you to all the community members from our [Discord Server](https://discord.gg/9yYc6R93Cd) who contribute translations, making the app accessible in multiple languages!  

See the full list of contributors [here](https://github.com/fultimator/fultimator-desktop/graphs/contributors).
