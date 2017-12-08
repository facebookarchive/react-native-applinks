/**
 * Copyright (c) 2004-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */
'use strict';

var AppLink = require('../AppLink');
var NativeAppLinkResolver = require('../NativeAppLinkResolver');
var AppLinkURL = require('../AppLinkURL');

describe('AppLinks', function() {
  it('Basic AppLinkTest', function() {
   var TEST_URL = 'http://example.com';
   var al = new AppLink(TEST_URL, null);
   expect(al.getURL()).toBe(TEST_URL);
   expect(al.getWebUrl()).toBe(TEST_URL);
  });

  it('Basic AppLinkTest', function() {
   var TEST_URL = 'http://example.com';
   var al = new AppLink(TEST_URL, null);
   expect(al.getURL()).toBe(TEST_URL);
  });

  it('Parse Incoming AppLink Link Test', function() {
    var TEST_INLINK = 'bolts://main?al_applink_data=%7B%20%20%0A%20%20%20%22target_url%22%3A%22http%3A%2F%2Fexample.com%2Fdocs%22%2C%0A%20%20%20%22extras%22%3A%7B%20%20%0A%20%20%20%20%20%20%22myapp_token%22%3A%22t0kEn%22%0A%20%20%20%7D%2C%0A%20%20%20%22user_agent%22%3A%22Bolts%20iOS%201.1%22%2C%0A%20%20%20%22version%22%3A%221.0%22%2C%0A%20%20%20%22referer_app_link%22%3A%7B%20%20%0A%20%20%20%20%20%20%22target_url%22%3A%22http%3A%2F%2Freferer.com%2Fhomepage%3Fsource%3Dapp_link_backlink%22%2C%0A%20%20%20%20%20%20%22url%22%3A%22refererapp%3A%2F%2Fhome%22%2C%0A%20%20%20%20%20%20%22app_name%22%3A%22Referer%20App%22%0A%20%20%20%7D%0A%7D';
    var alURL = new AppLinkURL(TEST_INLINK);

    expect(alURL.appLinkData).toEqual({
      target_url: 'http://example.com/docs',
      referer_app_link: {
        target_url: 'http://referer.com/homepage?source=app_link_backlink',
        app_name: 'Referer App',
        url: 'refererapp://home'
      },
      user_agent: 'Bolts iOS 1.1',
      version: '1.0',
      extras: {
        myapp_token: 't0kEn'
      }
    });

    expect(alURL.url.href).toBe(TEST_INLINK);

    var TEST_UPDATED_TARGET_URL = 'http://example.com/new_url?param=value';
    var updatedAppLinkData = { target_url: TEST_UPDATED_TARGET_URL };
    alURL.appLinkData = updatedAppLinkData;

    expect(alURL.getURLString())
      .toContain(encodeURIComponent(TEST_UPDATED_TARGET_URL));
  });

  it('HTML "al:" Tags Parsing Test', function() {
    var TEST_HTML = `
      <!DOCTYPE html>
      <html>
        <head>
            <meta property="al:ios:url" content="applinks_v2://docs" />
            <meta property="al:ios:app_name" content="App Links" />
            <meta property="al:ios" />
            <meta property="al:ios:url" content="applinks_v1://browse" />
            <meta property="al:ios:app_name" content="App Links Classic" />
            <meta property="al:ios:app_store_id" content="12345" />
            <meta property="al:android:url" content="applinks://docs" />
            <meta property="al:android:app_name" content="App Links" />
            <meta property="al:android:package" content="org.applinks" />
            <meta property="al:web:url" content="http://applinks.org/documentation" />
            <meta property="al:web:should_fallback" content="true" />
        </head>
        <body>
          Hello, world!
        </body>
      </html>
      `;

    var al = NativeAppLinkResolver.parseHTML(TEST_HTML);

    expect(al).toEqual({
      ios: [{
        url: 'applinks_v2://docs',
        app_name: 'App Links'
      }, {
        url: 'applinks_v1://browse',
        app_name: 'App Links Classic',
        app_store_id: '12345'
      }],
      android: [{
        url: 'applinks://docs',
        app_name: 'App Links',
        package: 'org.applinks'
      }],
      web: {
        url: 'http://applinks.org/documentation',
        should_fallback: true
      }
    });
  });

  it('Incomplete HTML Document Parsing Test', function() {
    var TEST_HTML = `
      <!DOCTYPE html>
      <html>
        <head>
            <meta property="al:ios" />
            <meta property="al:ios:url" content="sample://app" />
            <meta property="al:web:should_fallback" content="not a bool" />
            <me
      `;

    var al = NativeAppLinkResolver.parseHTML(TEST_HTML);

    // expect data to still be parsed
    expect(al).toEqual({
      ios: [{url: 'sample://app'}],
      web: {}
    });
  });

  it('Missing al tags HTML Document Parsing Test', function() {
    var TEST_HTML = `
      <!DOCTYPE html>
      <html>
        <head>
            <meta property="something" />
            <meta property="no_al_tags_here" />
        </head>
        <body>
          I have no al tags..
        </body>
      </html>
      `;

    var al = NativeAppLinkResolver.parseHTML(TEST_HTML);

    // expect empty object
    expect(al).toEqual({});
  });

  it('Not html Parsing Test', function() {
    var TEST_HTML = `
      Not html document
      `;

    var al = NativeAppLinkResolver.parseHTML(TEST_HTML);

    // expect empty object
    expect(al).toEqual({});
  });

  it('Bad Applink test', function() {
    var badurl =
      'example://home?al_applink_data=' + encodeURIComponent('{broken{json}');
    var al = new AppLinkURL(badurl);
    console.log(JSON.stringify(al, null, 2));
    expect(al.appLinkData).toEqual(undefined);
  })
});
