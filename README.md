# yt2mp3

yt2mp3 is a tool that batch downloads videos from YouTube, converts them to mp3 files, and adds id3 tags.

Downloaded .mp3's will be saved to `yt2mp3/` in your OS's downloads folder.

Please refrain from downloading content you do not have permission to download.

<p>
  This tool was developed with Electron React Boilerplate and uses <a href="https://electron.atom.io/">Electron</a>, <a href="https://facebook.github.io/react/">React</a>, <a href="https://github.com/reactjs/redux">Redux</a>, <a href="https://github.com/reactjs/react-router">React Router</a>, <a href="https://webpack.github.io/docs/">Webpack</a> and <a href="https://github.com/gaearon/react-hot-loader">React Hot Loader</a> for rapid application development (HMR).
</p>

## Starting Development

Clone via git and then install dependencies with `yarn install`.

Start the app in the `dev` environment. This starts the renderer process in [**hot-module-replacement**](https://webpack.js.org/guides/hmr-react/) mode and starts a webpack dev server that sends hot updates to the renderer process:

```bash
yarn dev
```

## Packaging for Production

To package apps for the local platform:

```bash
yarn package
```

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details. This project was
based on the Electron React Boilerplate.

MIT © [Electron React Boilerplate](https://github.com/electron-react-boilerplate)
