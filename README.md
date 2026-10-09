<p align="center">
    <img src="http://www.cmsrs.pl/images/cms/logo_cmsrs.png"><br/>
    Modern CMS for websites and galleries, and even stores, without the chaos.
</p>
</br>
<p align="center">
<a href="https://github.com/vuejs/"><img src="https://img.shields.io/badge/Vue.js-3-yellowgreen"></a>
<a href="https://www.cmsrs.pl/en/cms/cmsrs/coverage-test"><img src="https://img.shields.io/badge/coverage-90%25-yellowgreen"></a>
<a href="https://github.com/cmsrs/cmsrs-laravel/blob/master/LICENSE"><img src="https://img.shields.io/badge/license-MIT-green"></a>
</p>
</br>
</br>


# cmsrs-vuejs

### Prepare configuration

1. Copy the example configuration file:
    ```bash
    cp ./src/config.js.example ./src/config.js
    ```

2. Open `./src/config.js` and modify the following directives to suit your needs:

    ```javascript
    export const SERVER_URL = 'http://127.0.0.1:8000';

    // Must be the same as on the server side in the .env file
    export const API_SECRET = '';

    // Add an additional string to the admin area
    // If this directive === '', the URL will be /admin
    export const ADMIN_URL_SECRET = '';

    export const DEMO_STATUS = false;
    ```

    - `SERVER_URL`: The base URL of your server.
    - `API_SECRET`: Should match the API secret set in your server's `.env` file.
    - `ADMIN_URL_SECRET`: An additional string to secure the admin URL. If left empty, the admin URL will be `/admin`.
    - `DEMO_STATUS`: Set to `true` only if running in demo mode.

### Install 
```
npm install
```

### Run tests
```
./test.sh all
```
or
```
npm test a
```

### Start the development server
```
npm run dev
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Format code
```
npm run format
```

### Server code 
https://github.com/cmsrs/cmsrs-laravel
