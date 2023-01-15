# XRCSuite

The XRCSuite is a backend, frontend, and Discord bot built and maintained by [XR Club](https://xr.umd.edu) members at the University of Maryland: College Park to help run the club's services. Simply put, it allows us to deliver a *very* cool "high-tech" club experience!

## Development Commands

We use the [yarn dependency manager](https://classic.yarnpkg.com/en/) for this project. The following are a list of scripts that can be run by using the command `yarn run <name>`:

- `dev`: Uses `nodemon` and `ts-node` to run the XRCSuite during development and automatically restart it whenever any code changes are made.
- `types`: Generates TypeScript types for the current configuration of Payload collections and globals. You should run this whenever you modify the schema of any Payload type.
- `build`: Builds all of the XRCSuite code and assets into the `dist/` and `build/` directories.
- `serve`: Runs the XRCSuite using the **built** XRCSuite code (meaning you have to run the `build` script beforehand).

## Technologies Used

In our humble opinion, the beautiful thing about this codebase is that all the backend, frontend, and Discord bot are all contained with a single codebase. This makes it much easier to ensure that these components are always up to date and work together seamlessly!

- [TypeScript](https://www.typescriptlang.org/) as the language of choice for nearly the entire codebase, it powers both the backend, frontend, and Discord bot!

- [Payload CMS](https://payloadcms.com/) for managing all of the data stored by this software. It super powerful and automatically builds all the admin UI you need to manage your data, we highly recommend that you check it out yourself!

- [React](https://reactjs.org/) for building all of our frontend and admin user interfaces.

- [discord.js](https://discord.js.org/#/) for serving our Discord bot and enabling all of its interactions.

## Student Contributors

Here are a list of the super-awesome students who have helped to build and maintain the XRCSuite!

(TODO: add super cool student contributors)
