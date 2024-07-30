![alt text](https://github.com/acinoroc/fultimator-desktop/blob/main/public/fultimatorlogo.webp)

# Fultimator (Desktop Version)

## Introduction

Fultimator is a desktop application designed to manage your Fabula Ultima games. 

- **Fabula Ultima**: [Official Website](https://www.needgames.it/fabula-ultima-en/)
- **Fultimator**: [Web Application](https://fabula-ultima-helper.web.app/)

The application provides various tools to help you manage and enhance your Fabula Ultima gameplay experience.

Fultimator is an independent production by the [Fultimator Dev Team](https://github.com/fultimator) and is not affiliated with Need Games or Rooster Games. The game rules in the system compendium are published under the [Fabula Ultima Third Party Tabletop License 1.0](https://need.games/wp-content/uploads/2024/06/Fabula-Ultima-Third-Party-Tabletop-License-1.0.pdf). To fully utilize this system, you will need the [Fabula Ultima Core Rulebook](https://www.needgames.it/fabula-ultima-en/).

The source code of this project is licensed under the [MIT License](https://github.com/acinoroc/fultimator-desktop/blob/main/LICENSE.md). For more details, please refer to the [LICENSE](https://github.com/acinoroc/fultimator-desktop/blob/main/LICENSE.md) file in this repository.

## Download

You can download the latest release of the Fultimator desktop application from our [Releases Page](https://github.com/acinoroc/fultimator-desktop/releases).


## Communication Channels

For questions or concerns, you can reach out through the following channels:

- **Developer Discord**: [Fultimator](https://discord.gg/9yYc6R93Cd) - `#development` channel 
- **Discord**: [Rooster Games](https://discord.gg/G9qGbn2) - `#bot-and-tool-discussion` channel

## Submitting Issues

Please report issues on [GitHub](https://github.com/acinoroc/fultimator-desktop/issues). Ensure that you follow these guidelines:

### Bugs

Before submitting a bug report:

- Verify that the bug is reproducible and not caused by your desktop environment or third-party extensions.
- Provide clear reproduction steps and describe the expected versus actual behavior.

## Tooling and Setup

### Branches

- **main**: The main branch intended for deployment.
- **dev**: The primary development branch for feature updates and changes.

When submitting pull requests (PRs), ensure they target the appropriate branch.

### Prerequisite Software

- [Git](https://git-scm.com/)
- [Node.js v16.16.0 (LTS)](https://nodejs.org/en/blog/release/v16.16.0)
- Code editor (recommended: [Visual Studio Code](https://code.visualstudio.com/))
- [Electron](https://www.electronjs.org/) (for building and running the desktop app)

## Setup

Clone the repository using:

```bash
git clone https://github.com/acinoroc/fultimator-desktop.git
```

Navigate to the project folder and install dependencies:

```bash
npm ci
```
## Building and Running
To start the application locally, use:

```bash
npm run start
```

To start the application locally with electron, use:

```bash
npm run build
npm run electron
```
This command creates an optimized production build.

## Deployment
To package and distribute the desktop application, ensure you have Electron and the necessary permissions. For more information, refer to Electron Documentation.

```bash
npm run build
npm run dist
```
This command packages the app for distribution.

## Project Contributors

Major thanks to the following contributors:

- Triex ([matteosuppo](https://github.com/matteosuppo)) - The original creator of the fultimator webapp. The repository can be found here: [Fultimator](https://github.com/codeclysm/fultimator)
- [Alyx](https://github.com/greg-argulla) - For prolonging the project, providing useful features such as localization, adversary compendium and improving overall functionality of the webapp. 
- [spyrella](https://github.com/spyrella) - For ongoing updates to the system and maintainence of the project.
- [acinoroc](https://github.com/acinoroc) - Another active maintainer, lead developer of the Character Designer and main developer of the Desktop Version.

Special thanks to the following contributors found here: [Contributors Link](https://github.com/acinoroc/fultimator-desktop/graphs/contributors)