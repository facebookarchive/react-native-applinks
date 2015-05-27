# React Native App Links
React Native App Links is a JavaScript library for [React Native](https://facebook.github.io/react-native/) that implements [App Links protocol](http://www.applinks.org), helping you link to content in other apps and handle incoming deep-links.

App Links protocol documentation is available at applinks.org: [app links navigation protocol](http://applinks.org/documentation/#applinknavigationprotocol)

## Examples
### Handle incoming deeplink
```javascript
var React = require('react-native');
var { LinkingIOS } = React;
var AppLinkURL = require('react-native-applinks').AppLinkURL;

var MyApp = React.createClass({
  componentDidMount: function() {
    LinkingIOS.addEventListener('url', this._handleOpenURL);
    var url = LinkingIOS.popInitialURL();
    if (url) { this._handleOpenURL({url: url}); }
  },
  componentWillUnmount: function() {
    LinkingIOS.removeEventListener('url', this._handleOpenURL);
  },
  _handleOpenURL: function(event) {
    var alUrl = new AppLinkURL(event.url)
    // work with alUrl.appLinkData. For example render back link to referer app.
    var backLink = null;
    var refererAL = alUrl.appLink.referer_app_link;

    // if referer app link was provided we can construct back button with text
    if (refererAL) {
      backLink = {
        url: refererAL.url,
        text: 'Back' + refererAL.app_name ? ' to ' + refererAL.app_name : ''
      };
    }
  }
}
```
### Handle outgoing link
For fetching app link data from web url you need to use AppLinkNavigation and AppLinkResolver classes.
React Native App Links library provides two implementations of AppLinkResolver:
* **IndexAPIAppLinkResolver** - gets app link data by querying Facebook's Index API. Read more at [Finding App Link Data with the Index API](https://developers.facebook.com/docs/applinks/index-api).
* **NativeAppLinkResolver** - downloads and parses html content for given web url. Scans for 'al:' meta tags and creates app links object.

```javascript
var React = require('react-native');
var { LinkingIOS } = React;
var AppLinks = require('react-native-applinks');
var { AppLinkNavigation, IndexAPIAppLinkResolver, NativeAppLinkResolver } = AppLinks;

var MyApp = React.createClass({
  _openOutgoingWebUrl(weburl) {
    var fbResolver = new IndexAPIAppLinkResolver('your_app_facebook_token');
    // var nativeResolver = new NativeAppLinkResolver();
    var alNavigation = new AppLinkNavigation(
      fbResolver, // nativeResolver,
      { target_url: 'http://myapp.com', url: 'myapp://home', app_name: 'My App' },
      'iphone'
    );
    // fetch best possible deeplink from web url's app link data and open using LinkingIOS
    alNavigation.fetchUrlFromWebUrl(weburl, LinkingIOS.openURL, (err) => { /* handle error */ });
  }
```
## Requirements
React Native App Links requires or works with
* React Native

## Installing React Native App Links
**npm install react-native-applinks**

## License
React Native App Links is BSD-licensed. We also provide an additional patent grant.
