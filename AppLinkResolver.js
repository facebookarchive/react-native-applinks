/**
 * Copyright (c) 2004-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule AppLinkResolver
 * @flow
 */
'use strict';

var URL = require('url');

class AppLinkResolver {
  resolve(web_url: String, success, error) {
    throw 'Not implemented';
  }

  normalizeUrl(url: String): String {
    return URL.parse(url).href;
  }
}

module.exports = AppLinkResolver;
