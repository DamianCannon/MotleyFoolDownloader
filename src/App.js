import React, { Component } from 'react';
import './App.css';
import xhr from 'xhr';
import file from 'file-saver';

class App extends Component {
    state = {
		boardName: '',
		userName: 'valuemargin',
		boardStartLocation: 'http://boards.fool.co.uk/high-yield-hyp-practical-51676.aspx?mid=11105157&sort=username',
		boards: []
   };
  
	saySomething(something) {
		console.log(something);
	}

	handleClick(e) {
		this.saySomething("element clicked");
	}
	
  displayAndSavePostContent = (url) => {
	xhr({
	// Use heroku app to get around CORS redirect restriction when TMF redirects this url
	// https://github.com/Rob--W/cors-anywhere/
	url: 'https://cors-anywhere.herokuapp.com/' + url
	}, function (err, data) {
		// Get post html in a queryable state
		var post = document.createElement('div');
		post.insertAdjacentHTML('beforeend', data.body);

		// Display details of author, title and date for post
		var metaData = post.querySelectorAll('.messageMeta .pbnav');
		var authorName = metaData[0].innerText.trim().replace(/\t/g, '').replace('\n', '');
		var postTitle = metaData[2].innerText.trim().replace(/\t/g, '').replace('\n', '');
		var postDate = metaData[3].innerText.trim().replace(/\t/g, '').replace('\n', '').replace('\n', ' ');
		document.querySelector('#author').innerText = authorName;
		document.querySelector('#title').innerText = postTitle;
		document.querySelector('#date').innerText = postDate;
		
		// Display post content
		var content = post.querySelectorAll('#tableMsg .pbmsg')[0].innerText.trim();
		document.querySelector('#content').innerText = content;

		// Save file to downloads folder with an informative name
		var blob = new Blob([authorName, '\n', postTitle, '\n', postDate, '\n\n', content], {type: "text/plain;charset=utf-8"});
		file.saveAs(blob, `${authorName}-${postTitle}-${postDate}.txt`);
	});  
  }
 
 changeBoardName = (evt) => {
    this.setState({
      boardName: evt.target.value
    });
  };
  
  changeUserName = (evt) => {
    this.setState({
      userName: evt.target.value
    });
  };

  changeStartLocation = (evt) => {
    this.setState({
      boardStartLocation: evt.target.value
    });
  };
  
  fetchData = (evt) => {
    evt.preventDefault();
	
	var self = this;
	
	// Get board and user names together with a starting point url for the download
	if (this.state.boardStartLocation === '') return;
	
	xhr({
	  // valuemargin boards:
      url:  this.state.boardStartLocation
    }, function (err, data) {
	  // Messages in this table: tblMessagesAsp
	  var element = document.createElement('div');
	  element.insertAdjacentHTML('beforeend', data.body);
	  var tableOfPosts = element.querySelector('#tblMessagesAsp');
	  var nextLink = element.querySelector('.nextLink');
	  
	  // Show table of posts
	  var content = document.querySelector('#contents');
	  content.insertAdjacentElement('beforeend', tableOfPosts);
	  content.insertAdjacentElement('beforeend', nextLink);

	  // Get the posts if the requested author is in the list of posts
	  if (tableOfPosts.innerText.includes(self.state.userName)) {
		  // Get list of post links
		  var postLinks = [...document.querySelectorAll('a')].filter(x => x.href.includes('Message.aspx')).map(h => h.href.replace('localhost:3000', 'boards.fool.co.uk'));
		  
		  // Get contents of all posts on this page
		  postLinks.map(x => self.displayAndSavePostContent(x));
	  }
	
	});
	
    this.setState({
      boards: ['http://boards.fool.co.uk/a-fool-and-his-money-51365.aspx?mid=6808140&sort=username']
    });	
	
  }

  
  render() {
    return (
      <div>
		<div>
		<h1>Motley Fool Downloader</h1>
			<form onSubmit={this.fetchData}>
			  <label>I want to get the posts from this board
				<input 
					placeholder={"board name"} 
					type="text" 
					value={this.state.boardName}
					onChange={this.changeBoardName}
				/>
			  </label>
			  <label>for this user
				<input 
					placeholder={"user name"} 
					type="text" 
					value={this.state.userName}
					onChange={this.changeUserName}
				/>
			  </label>
			  <label>starting with this link
				<input 
					placeholder={"link to board"} 
					type="text" 
					value={this.state.boardStartLocation}
					onChange={this.changeStartLocation}
				/>
			  </label>
			  <button onClick={this.handleClick.bind(this)}>Get data</button>
			</form>		
		</div>
		<div id="contents"></div>
		<div id="post">
			<label id="author"></label>
			<label id="title"></label>
			<label id="date"></label>
			<label id="content"></label>
		</div>
      </div>
    );
  }
}

export default App;
