/**
 * Copyright (c) 2004-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule AppLinkURL
 * @flow
 */
'use strict';

var URL = require('url');

class AppLinkURL {
  url: URL;
  appLinkData: Object;

  constructor(originAppLinkURL: string) {
    this.url = URL.parse(originAppLinkURL || '', true);
    if (this.url.query && this.url.query.al_applink_data) {
      // restoring applink data json from url query parameter
      try {
        this.appLinkData =
          JSON.parse(decodeURIComponent(this.url.query.al_applink_data));
      } catch(ex) { /* ignore corrupted al_applink_data */ }
    }
  }

  getURLString(): string {
    if (this.appLinkData && this.url.query) {
      this.url.query.al_applink_data = JSON.stringify(this.appLinkData);
    }
    // triggering url object to use updated query object during format() call
    var {search, ...url} = this.url;
    return URL.format(url);
  }
}

module.exports = AppLinkURL;
