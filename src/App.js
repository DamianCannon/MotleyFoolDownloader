import React, { Component } from 'react';
import './App.css';

class App extends Component {
  render() {
    return (
      <div>
		<h1>Motley Fool Downloader</h1>
        <form onSubmit={this.fetchData}>
			<button>Get boards for user</button>
        </form>
      </div>
    );
  }
}

export default App;
