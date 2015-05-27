/**
 * Copyright (c) 2004-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule AppLink
 * @flow
 */
'use strict';

class AppLink {
  _url: string;
  _targets: Object;

  constructor(url: string, targets: Array) {
    this._url = url;
    this._targets = targets || {};
  }

  getURL(): string {
    return this._url;
  }

  getTargets(platform: string): Object {
    // there is just one web target and it is trated specially
    var defaultValue = platform === 'web' ? {} : [];

    return this._targets[platform] || defaultValue;
  }

  /*
   * The web URL. Defaults to the URL for the content that contains this tag.
   */
  getWebUrl(): string {
    var webTargets = this.getTargets('web');
    if ('url' in webTargets) {
      return webTargets.url;
    }
    return this._url;
  }

  /*
   * Indicates if the web URL should be used as a fallback. Defaults to true.
   */
  getWebShouldFallback(): boolean {
    var webTargets = this.getTargets('web');
    if ('should_fallback' in webTargets) {
      return webTargets.should_fallback;
    }
    return true;
  }
}

module.exports = AppLink;
