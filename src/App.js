import React, { Component } from 'react';
import './App.css';

class App extends Component {
  state = {
    boards: []
  };
  
  fetchData = (evt) => {
    evt.preventDefault();
	
    this.setState({
      boards: ['http://boards.fool.co.uk/a-fool-and-his-money-51365.aspx?mid=6808140&sort=username']
    });	
  };
	
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
