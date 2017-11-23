import * as React from 'react';
import logo from './logo.svg';

import './App.css';

class App extends React.Component {
	render() {
		return (
			<div styleName="App">
				<div styleName="App-header">
					<svg viewBox={logo.viewBox} styleName="App-logo">
						<use xlinkHref={`#${logo.id}`} />
					</svg>
					<h2>Welcome</h2>
				</div>
				<p styleName="App-intro">
					To get started, edit <code>App.tsx</code> and save to
					reload.
				</p>
			</div>
		);
	}
}

export default App;
