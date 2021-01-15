/* eslint-disable no-console */

'use strict';

const path = require('path');
const Loader = require('./loader');
const {PrecompiledLoader} = require('./precompiled-loader.js');
let chokidar;

class FileSystemLoader extends Loader {
  constructor(searchPaths, opts) {
    super();
    if (typeof opts === 'boolean') {
      console.log(
        '[nunjucks] Warning: you passed a boolean as the second ' +
        'argument to FileSystemLoader, but it now takes an options ' +
        'object. See http://mozilla.github.io/nunjucks/api.html#filesystemloader'
      );
    }

    opts = opts || {};
    this.pathsToNames = {};
    this.noCache = !!opts.noCache;

    if (searchPaths) {
      searchPaths = Array.isArray(searchPaths) ? searchPaths : [searchPaths];
      // For windows, convert to forward slashes
      this.searchPaths = searchPaths.map(path.normalize);
    } else {
      this.searchPaths = ['.'];
    }

    if (opts.watch) {
      throw new Error('Filesystem operations are not supported.');
    }
  }

  getSource(name) {
    throw new Error('Filesystem operations are not supported.');
  }
}

class NodeResolveLoader extends Loader {
  constructor(opts) {
    super();
    opts = opts || {};
    this.pathsToNames = {};
    this.noCache = !!opts.noCache;

    if (opts.watch) {
      try {
        chokidar = require('chokidar'); // eslint-disable-line global-require
      } catch (e) {
        throw new Error('watch requires chokidar to be installed');
      }
      this.watcher = chokidar.watch();

      this.watcher.on('change', (fullname) => {
        this.emit('update', this.pathsToNames[fullname], fullname);
      });
      this.watcher.on('error', (error) => {
        console.log('Watcher error: ' + error);
      });

      this.on('load', (name, source) => {
        this.watcher.add(source.path);
      });
    }
  }

  getSource(name) {
    throw new Error('Filesystem operations are not supported.');
  }
}

module.exports = {
  FileSystemLoader: FileSystemLoader,
  PrecompiledLoader: PrecompiledLoader,
  NodeResolveLoader: NodeResolveLoader,
};
