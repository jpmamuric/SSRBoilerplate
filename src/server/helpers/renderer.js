import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { renderRoutes } from 'react-router-config';
import { Provider } from 'react-redux';
import { Helmet } from 'react-helmet';
import serialize from 'serialize-javascript';
import Router from '../../client/router';

export default (expressRequest, reduxStore, buildAssets, routerContext = {}) => {
  const injectAssets = (assets) => {
    const assetNameWeights = {
      manifest: 1,
      vendor: 2,
      bundle: 3,
    };

    return Object.entries(assets)
      .sort((firstElement, secondElement) => {
        if (assetNameWeights[firstElement[0]] < assetNameWeights[secondElement[0]]) return -1;
        else if (assetNameWeights[firstElement[0]] === assetNameWeights[secondElement[0]]) return 0;
        return 1;
      })
      .reduce((accumulatorString, currentElement) => {
        /* eslint-disable */
        accumulatorString += `<script src='${currentElement[1].js}'></script>`;
        /* eslint-enable */

        return accumulatorString;
      }, '');
  };

  /* eslint-disable */
  const content = renderToString(
    <Provider store={reduxStore}>
      <StaticRouter location={expressRequest.path} context={routerContext}>
        <div>{renderRoutes(Router)}</div>
      </StaticRouter>
    </Provider>,
  );
  /* eslint-enable */

  const helmetInstance = Helmet.renderStatic();

  /* eslint-disable */
  const html = `
    <html>
      <head>
        ${helmetInstance.title.toString()}
        ${helmetInstance.meta.toString()}
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/materialize/0.100.2/css/materialize.min.css">
      </head>
      <body>
        <div id="app">${content}</div>
        <script>window.INITIAL_STATE= ${serialize(reduxStore.getState())}</script>
        ${injectAssets(buildAssets)}
      </body>
    </html>
  `;
  /* eslint-enable */

  return html;
};
