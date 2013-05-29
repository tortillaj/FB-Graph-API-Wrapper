Facebook Graph API Wrapper
====================

A Graph API wrapper written in Coffeescript (uses the Javascript SDK)

== Compilation ==

# Install Coffeescript if you don't have it `sudo npm install coffee-script`.
# Change to the FB-Graph-API-Wrapper directory.
# `coffee -o build/ -cwb src/`

== Usage ==

Your HTML should have the requisite `fb-root` div with an extra attribute, `fb-app-id` whose value is your app id. See the example for reference.

Initialize the Facebook SDK

```javascript
Graph.init('A comma delimited list of permissions');
```