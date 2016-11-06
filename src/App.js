import React, { Component } from 'react';
import './App.css';
import xhr from 'xhr';

class App extends Component {
  state = {
    boards: []
  };
  
  fetchData = (evt) => {
    evt.preventDefault();
	
	xhr({
	  // valuemargin boards:
      url: 'http://boards.fool.co.uk/high-yield-hyp-practical-51676.aspx?mid=11105157&sort=username'
      //url: 'http://boards.fool.co.uk/high-yield-share-strategies-51166.aspx?mid=10237021&sort=username'
    }, function (err, data) {
      /* …save the data here */
	  //console.log([...data.body.querySelectorAll('a')].filter(x => x.href.includes('boards.fool.co.uk/Messages.asp')));
	  
	  // Messages in this table: tblMessagesAsp
	  var element = document.createElement('div');
	  element.insertAdjacentHTML('beforeend', data.body);
	  var tableOfPosts = element.querySelector('#tblMessagesAsp');
	  var nextLink = element.querySelector('.nextLink');
	  
	  // Show table of posts
	  var thing = document.querySelector('#contents');
	  thing.insertAdjacentElement('beforeend', tableOfPosts);
	  thing.insertAdjacentElement('beforeend', nextLink);
	  
	  // Get list of post links
	  var postLinks = [...document.querySelectorAll('a')].filter(x => x.href.includes('Message.aspx')).map(h => h.href);
	  console.log(postLinks);
	  
    });
	
    this.setState({
      boards: ['http://boards.fool.co.uk/a-fool-and-his-money-51365.aspx?mid=6808140&sort=username']
    });	
  };
	
  render() {
    return (
      <div>
		<div>
		<h1>Motley Fool Downloader</h1>
			<form onSubmit={this.fetchData}>
			  <label>I want to get the posts from this board
				<input placeholder={"link to board"} type="text" />
			  </label>
			  <label>for this user
				<input placeholder={"user name"} type="text" />
			  </label>
			  <button>Get data</button>
			</form>		
		</div>
		<div id="contents"></div>
      </div>
    );
  }
}

export default App;
