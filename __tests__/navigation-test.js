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
var AppLinkNavigation = require('../AppLinkNavigation');
var AppLinkResolver = require('../AppLinkResolver');
var Linking = require('Linking');

/**
 * Mocking Linking calls
 */
Linking.canOpenURL = jest.genMockFunction()
  .mockImplementation(function(url) {
    console.log('Mock call Linking.canOpenURL:' + url);
    var isSupported = url.indexOf('_v1') >= 0;
    return Promise.resolve(isSupported);
  });

describe('App Links Navigation', function() {
  it('Targets priorities test', function() {
    var resolver = new AppLinkResolver();
    var alNavigationIOS = new AppLinkNavigation(resolver, null, 'ios');
    var alNavigationIPhone = new AppLinkNavigation(resolver, null, 'iphone');
    var alNavigationIPad = new AppLinkNavigation(resolver, null, 'ipad');
    var alNavigationAndroid = new AppLinkNavigation(resolver, null, 'android');
    var alNavigationDefault = new AppLinkNavigation(resolver);

    var al = new AppLink(
      'http://example.com/home',
      {
        ios: [{url: 'ios_v2://home'}, {url: 'ios_v1://home'}],
        iphone: [{url: 'iphone_v2://home'}, {url: 'iphone_v1://home'}],
        ipad: [{url: 'ipad_v2://home'}, {url: 'ipad_v1://home'}],
        android: [{url: 'android_v2://home'}, {url: 'android_v1://home'}]
      }
    );

    alNavigationIOS.fetchUrlFromAppLink(al)
      .then((url) => { expect(url).toContain('ios_v1') });

    alNavigationIPhone.fetchUrlFromAppLink(al)
      .then((url) => { expect(url).toContain('iphone_v1') });

    alNavigationIPad.fetchUrlFromAppLink(al)
      .then((url) => { expect(url).toContain('ipad_v1') });

    alNavigationAndroid.fetchUrlFromAppLink(al)
      .then((url) => { expect(url).toContain('android_v1') });

    alNavigationDefault.fetchUrlFromAppLink(al)
      .then((url) => { expect(url).toContain('ios_v1') });
  });

  it('Wrong platform test', function() {
    var createNavigation = jest.genMockFunction().mockImplementation(function() {
      return new AppLinkNavigation(new AppLinkResolver(), null, 'wrong platform');
    });
    try { createNavigation(); }
    catch(ex) { console.log('Swallow exception: ' + ex); }

    expect(createNavigation).toThrow('Unexpected platform: wrong platform');
  });
});
