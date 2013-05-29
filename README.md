Facebook Graph API Wrapper
====================

A Graph API wrapper written in Coffeescript (uses the Javascript SDK)

## Compilation

1. Install Coffeescript if you don't have it `sudo npm install coffee-script`.
2. Change to the FB-Graph-API-Wrapper directory.
3. `coffee -o build/ -cb src/`
4. Note: It is important to combile with the `--bare` option 

## Usage

Your HTML should have the requisite `fb-root` div with an extra attribute, `data-app-id` whose value is your app id. See the example for reference.

Initialize the Facebook SDK

```javascript
Graph.init('A comma delimited list of permissions');
```