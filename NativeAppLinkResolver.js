/**
 * Copyright (c) 2004-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule NativeAppLinkResolver
 * @flow
 */
'use strict';

var AppLinkResolver = require('./AppLinkResolver');

var parse5 = require('parse5');
var AppLink = require('./AppLink');

class NativeAppLinkResolver extends AppLinkResolver {
  resolve(web_url: string) {
    var webUrl = super.normalizeUrl(web_url);

    return fetch(webUrl, {method: 'get', headers: {'Prefer-Html-Meta-Tags': 'al'}})
      .then(res => res.text())
      .then((body) => {
        var appLinkHost = NativeAppLinkResolver.parseHTML(body);
        return new AppLink(webUrl, appLinkHost);
      });
  }

  /**
   * This method is parsing html and scans for 'al:' meta tags.
   * Learn App Links meta tags schema at http://applinks.org/
   */
  static parseHTML(html_str: String) {
    var dom = parse5.parse(html_str);
    var html = dom.childNodes.filter(n => n.tagName === 'html')[0];
    var head = html.childNodes.filter(n => n.tagName === 'head')[0];
    var metaTags = head.childNodes.filter(t => t.tagName === 'meta');

    var alDataTags = [];

    // filter only 'al:' tags and make them lowercase
    // For example '<meta property="al:ios:url" content="applinks://docs" />'
    metaTags.forEach((metaTag) => {
      if (metaTag.attrs) {
        var propertyAttributes = metaTag.attrs
          .filter(a => a.name === 'property'
          && a.value.toLowerCase().indexOf('al:') === 0);

        var contentAttributes = metaTag.attrs.filter(a => a.name === 'content');

        if (propertyAttributes.length > 0) {
          var alTag = propertyAttributes[0].value;
          var alContent = '';
          if (contentAttributes.length > 0) {
            alContent = contentAttributes[0].value || '';
          }

          alDataTags.push({
            property: alTag.toLowerCase(),
            content: alContent
          });
        }
      }
    });

    var result = {};
    alDataTags.forEach((tag) => {
      var [al, platform, attribute] = tag.property.split(':');
      var content = tag.content;
      if (al !== 'al' || platform === undefined) {
        // just 'al:' is not valid and should be skipped
        return;
      }

      // Initialize the result
      if (!result[platform]) {
        result[platform] = [];
      }

      if (attribute !== undefined) {
        var lastItem = result[platform].pop() || {};
        lastItem[attribute] = content;
        result[platform].push(lastItem);
      } else {
        var lastItem = result[platform].pop();
        // keep last item if it exists
        if (lastItem) {
          result[platform].push(lastItem);
        }
        result[platform].push({});
      }
    });

    // Handle web separately as it should be just single object, not array
    if (result.web && result.web.length > 0) {
      result.web = result.web[0];
      // should fallback can only be boolean
      if (result.web.should_fallback) {
        var parsedValue;
        try {
          parsedValue = JSON.parse(result.web.should_fallback);
        } catch (ex) {}

        if (parsedValue && typeof parsedValue === 'boolean') {
          result.web.should_fallback = parsedValue;
        } else {
          delete result.web.should_fallback;
        }
      }
    }
    return result;
  }
}

module.exports = NativeAppLinkResolver;
