/**
 * Copyright (c) 2004-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule IndexAPIAppLinkResolver
 * @flow
 */
'use strict';

var AppLinkResolver = require('./AppLinkResolver');
var AppLink = require('./AppLink');

class IndexAPIAppLinkResolver extends AppLinkResolver {
  constructor(facebook_token: String) {
    super();
    this._facebookToken = facebook_token;
  }

  resolve(web_url, success, error) {
    var webUrl = super.normalizeUrl(web_url);

    if (!this._facebookToken) {
      error('Facebook token was not configured.');
      return;
    }

    var indexAPIEndpoint =
      'https://graph.facebook.com/?ids='
      + encodeURIComponent(webUrl)
      + '&fields=app_links&access_token='
      + encodeURIComponent(this._facebookToken);
    indexAPIEndpoint = super.normalizeUrl(indexAPIEndpoint);

    fetch(indexAPIEndpoint)
      .then(res => res.json())
      .then((json) => {
        success(new AppLink(webUrl, json[webUrl].app_links));
      })
      .catch(function(err) {
        error(err);
      });
  }
}

module.exports = IndexAPIAppLinkResolver;
