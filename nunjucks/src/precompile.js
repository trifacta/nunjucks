'use strict';

const path = require('path');
const {_prettifyError} = require('./lib');
const compiler = require('./compiler');
const {Environment} = require('./environment');
const precompileGlobal = require('./precompile-global');

function match(filename, patterns) {
  if (!Array.isArray(patterns)) {
    return false;
  }
  return patterns.some((pattern) => filename.match(pattern));
}

function precompileString(str, opts) {
  opts = opts || {};
  opts.isString = true;
  const env = opts.env || new Environment([]);
  const wrapper = opts.wrapper || precompileGlobal;

  if (!opts.name) {
    throw new Error('the "name" option is required when compiling a string');
  }
  return wrapper([_precompile(str, opts.name, env)], opts);
}

function precompile(input, opts) {
  throw new Error
}

function _precompile(str, name, env) {
  env = env || new Environment([]);

  const asyncFilters = env.asyncFilters;
  const extensions = env.extensionsList;
  let template;

  name = name.replace(/\\/g, '/');

  try {
    template = compiler.compile(str,
      asyncFilters,
      extensions,
      name,
      env.opts);
  } catch (err) {
    throw _prettifyError(name, false, err);
  }

  return {
    name: name,
    template: template
  };
}

module.exports = {
  precompile: precompile,
  precompileString: precompileString
};
