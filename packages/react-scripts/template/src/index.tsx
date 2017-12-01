import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';

import App from './App';
import './index.css';

const render = (Component: typeof App) => {
	ReactDOM.render(
		<AppContainer>
			<Component />
		</AppContainer>,
		document.getElementById('root') as HTMLElement
	);
};

render(App);

if (module.hot) {
	module.hot.accept('./App', () => {
		const NextApp = require('./App').default;
		render(NextApp);
	});
}
