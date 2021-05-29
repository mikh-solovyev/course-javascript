const HtmlPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin').CleanWebpackPlugin;
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const fs = require('fs');
const path = require('path');

const root = path.resolve('projects');
const projects = fs.readdirSync(root);
const entries = {};
const htmlPlugins = [];
const proxy = {};

for (const project of projects) {
  const projectPath = path.join(root, project);

  entries[project] = projectPath;
  htmlPlugins.push(
    new HtmlPlugin({
      title: project,
      template: path.resolve('./layout.html'),
      filename: `${project}/index.html`,
      chunks: [project],
    })
  );

  const settingsPath = path.join(projectPath, 'settings.json');

  if (fs.existsSync(settingsPath)) {
    const settings = require(settingsPath);
    Object.assign(proxy, settings.proxy);
  }
}

const http = require('http');
const { Server } = require('ws');

function readBody(req) {
  return new Promise((resolve, reject) => {
    let dataRaw = '';

    req.on('data', (chunk) => (dataRaw += chunk));
    req.on('error', reject);
    req.on('end', () => resolve(JSON.parse(dataRaw)));
  });
}

const server = http.createServer(async (req, res) => {
  try {
    if (/\/photos\/.+\.png/.test(req.url)) {
      const [, imageName] = req.url.match(/\/photos\/(.+\.png)/) || [];
      const fallBackPath = path.resolve(__dirname, './projects/chat/photos/no-photo.png');
      const filePath = path.resolve(__dirname, './projects/chat/photos', imageName);

      if (fs.existsSync(filePath)) {
        return fs.createReadStream(filePath).pipe(res);
      } else {
        return fs.createReadStream(fallBackPath).pipe(res);
      }
    } else if (req.url.endsWith('/upload-photo')) {
      const body = await readBody(req);
      const name = body.name.replace(/\.\.\/|\//, '');
      const [, content] = body.image.match(/data:image\/.+?;base64,(.+)/) || [];
      const filePath = path.resolve(__dirname, './projects/chat/photos', `${name}.png`);

      if (name && content) {
        fs.writeFileSync(filePath, content, 'base64');

        broadcast(connections, { action: 'photo-changed', data: { name } });
      } else {
        return res.end('fail');
      }
    }

    res.end('ok');
  } catch (e) {
    console.error(e);
    res.end('fail');
  }
});
const wss = new Server({ server });
const connections = new Map();

wss.on('connection', (socket) => {
  connections.set(socket, {});

  socket.on('message', (messageData) => {
    const message = JSON.parse(messageData);
    let excludeItself = false;

    if (message.action === 'enter') {
      excludeItself = true;
      connections.get(socket).userName = message.data.name;
      sendMessageTo(
        {
          action: 'users',
          data: [...connections.values()].map((item) => item.userName).filter(Boolean),
        },
        socket
      );
    }

    sendMessageFrom(connections, message, socket, excludeItself);
  });

  socket.on('close', () => {
    sendMessageFrom(connections, { action: 'exit' }, socket);
    connections.delete(socket);
  });
});

function sendMessageTo(message, to) {
  to.send(JSON.stringify(message));
}

function broadcast(connections, message) {
  for (const connection of connections.keys()) {
    connection.send(JSON.stringify(message));
  }
}

function sendMessageFrom(connections, message, from, excludeSelf) {
  const socketData = connections.get(from);

  if (!socketData) {
    return;
  }

  message.from = socketData.userName;

  for (const connection of connections.keys()) {
    if (connection === from && excludeSelf) {
      continue;
    }

    connection.send(JSON.stringify(message));
  }
}

server.listen(8282);

const mode = process.env.NODE_ENV === 'production' ? 'production' : 'development';

module.exports = {
  entry: entries,
  output: {
    filename: mode === 'production' ? 'name/[chunkhash].js' : '[name]/[name].js',
    path: path.resolve('dist'),
  },
  mode,
  devServer: {
    proxy,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: { cacheDirectory: true },
      },
      {
        test: /\.html/,
        include: [path.resolve(__dirname, 'projects')],
        use: [
          { loader: './scripts/html-inject-loader.js' },
          {
            loader: 'raw-loader',
          },
        ],
      },
      {
        test: /\.(jpe?g|png|gif|svg|eot|ttf|woff|woff2)$/i,
        loader: 'file-loader',
        options: {
          name: '[hash:8].[ext]',
          outputPath: 'reosurces',
        },
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css',
    }),
    ...htmlPlugins,
    new CleanWebpackPlugin(),
  ],
};
