#run all test
if [ "$1" = "all" ]; then
    #npm run test
    npx vitest run --mode test
    exit

elif [ "$1" = "coverage" ]; then
    npm run test:coverage
    exit

elif [ "$1" = "-t" ]; then
    npm run test -- -t "$2"
    exit

else
    
    #npm run test     -- -t   'send good data to server'  # 'change checkout to is pay' #   'images tests'
    #npm run test   -- -t   'save new menu - display error and clear msg after change menu name'
    #npm run test   -- -t     'display good message and click add menu button'

    #npm run test ./src/App.spec.js # -- -t  'prevent redirect to login page when user is auth'  #   'click sign out link'


    #npm run test   ./src/App.spec.js  -- -t     "in nav bar cache enable by click input toggle cache"

    #npm run test ./src/pages/UserEditPage.spec.js #-- -t 'load client data'

    #npm run test ./src/pages/UsersPage.spec.js 
    #npm run test ./src/pages/ProductsPage.spec.js -- -t "show data in table"

    #npm run test  ./src/pages/MenuPagesPage.spec.js  -- -t  'delete many images success' 
    #npm run test  ./src/pages/MenuPagesPage.spec.js  -- -t  'click icon delete many images without check any item' 
    #npm run test  ./src/pages/MenuPagesPage.spec.js  -- -t  'click icon delete many images' 


    ######npm run test  ./src/pages/MenuPagesPage.spec.js  -- -t   'image position down success'
    #npm run test  ./src/pages/MenuPagesPage.spec.js  -- -t    'pages images tests'
    #npm run test  ./src/pages/MenuPagesPage.spec.js  -- -t  'image delete success'



    #npm run test  ./src/pages/MenuPagesPageLangs.spec.js 

    #npm run test    ./src/pages/LoginPage.spec.js -- -t "send good data to server" 
    npm run test    ./src/pages/LoginPage.spec.js 

    #npm run test   ./src/helpers/functions.spec.js 

    #npm run test  ./src/pages/ProductEditPage.spec.js 
    #npm run test  ./src/pages/ProductEditPage.spec.js -- -t "add product with errors"
    #npm run test  ./src/pages/ProductEditPage.spec.js -- -t "Products images tests"
    #npm run test  ./src/pages/ProductEditPage.spec.js -- -t "delete many images success"

    #npm run test  ./src/pages/ProductEditPage.spec.js -- -t "add product by click"


    ######npm run test  ./src/pages/ProductEditPageImage.spec.js 

    #npm run test  ./src/pages/ContactsPage.spec.js 

    #npm run test   ./src/pages/SettingsPage.spec.js 

    #npm run test  ./src/pages/CheckoutsPage.spec.js -- -t "change checkout to is pay" 

    #npm run test  ./src/pages/MenuPagesPageDemo.spec.js 


    #npm run test   ./src/pages/ProductEditPageImageDemo.spec.js

   #npm run test   ./src/pages/SettingsPageError.spec.js 

fi
