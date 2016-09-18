/**
 * Copyright (c) 2004-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule AppLinkNavigation
 * @flow
 */
'use strict';

var React = require('react');
var { Linking, Platform } = require('react-native');
var AppLinkURL = require('./AppLinkURL');

var USER_AGENT = 'react-native-applinks 0.0.1';
var VERSION = '1.0';

class AppLinkNavigation {
  _appLinkResolver: AppLinkResolver;
  _refererAppLink: AppLink;
  _platform: string;

  constructor(
    app_link_resolver: AppLinkResolver,
    referer_app_link: AppLink,
    platform: string
  ) {
    this._appLinkResolver = app_link_resolver;
    this._refererAppLink = referer_app_link;
    this._platform = platform || Platform.OS;
    switch (this._platform) {
      case 'iphone':
      case 'ipad':
      case 'ios':
      case 'android':
        break;
      default:
        throw 'Unexpected platform: ' + platform;
    }
  }

  fetchUrlFromWebUrl(web_url: string): Promise<any> {
    return this._appLinkResolver.resolve(web_url)
      .then((al) => this.fetchUrlFromAppLink(al));
  }

  fetchUrlFromAppLink(al: AppLink): Promise<any> {
    if (!al) {
      return Promise.reject(new Error('Empty applink object.'));
    }

    var targets;

    if (this._platform === 'iphone') {
      targets = al.getTargets('ios');
      targets = al.getTargets('iphone').concat(targets);
    } else if (this._platform === 'ipad') {
      targets = al.getTargets('ios');
      targets = al.getTargets('ipad').concat(targets);
    } else {
      targets = al.getTargets(this._platform);
    }

    return this._findBestTarget(targets, 0)
      .then((target) => {
        if (target) {
          return this._addApplinkDataToUrl(target.url, al.getURL());
        } else {
          return this._addApplinkDataToUrl(al.getWebUrl(), al.getURL());
        }
      });
  }

  /**
   * Iterating through the collection of app link targets.
   * Selecting first one that can be opened.
   */
  _findBestTarget(targets: Array, index: number): Promise<any> {
    if (index >= targets.length) {
      return Promise.resolve(false);
    } else {
      return Linking.canOpenURL(targets[index].url)
        .then((supported) => {
          if (supported) {
            return targets[index];
          } else {
            return this._findBestTarget(targets, ++index);
          }
        });
    }
  }

  _addApplinkDataToUrl(url: string, originalTargetURL: string) {
    var referer = this._refererAppLink || {};
    var alData = {
      target_url: originalTargetURL,
      referer_app_link: referer,
      version: VERSION,
      user_agent: USER_AGENT
    };

    var alURL = new AppLinkURL(url);
    alURL.appLinkData = alData;
    return alURL.getURLString();
  }
}

module.exports = AppLinkNavigation;
