# Create React App [![Build Status](https://travis-ci.org/facebookincubator/create-react-app.svg?branch=master)](https://travis-ci.org/facebookincubator/create-react-app)

### Configuration options

All environmental variables should be placed in `.env` file and start with  `REACT_APP_`

#### Styling
- ```REACT_APP_SASS=true``` - enable SASS support
- ```REACT_APP_CSS_MODULES=true``` - enable CSS modules support
- ```REACT_APP_SVG_SPRITE=true``` - enable SVG sprite support (+ svgo)
- ```REACT_APP_GRAPHQL='webpack-graphql-loader' | 'graphql-tag/loader'``` - enable GraphQl loader (loader is specified as string here)
- ```REACT_APP_GRAPHQL_SERVER_URL='http://graphql-server.net'``` - URL for GraphQl types codegeneration
- ```REACT_APP_PNG_SPRITE=true``` - enable PNG sprite support (generates sprite from png images from `src/assets/sprite` directory into `src/assets/sprite.png` and styles to `src/styles/sprite.scss`)
