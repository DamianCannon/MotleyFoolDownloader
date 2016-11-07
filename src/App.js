import React, { Component } from 'react';
import './App.css';
import xhr from 'xhr';
import file from 'file-saver';

class App extends Component {
    state = {
		boardName: '',
		// userName: 'valuemargin',
		userName: 'tjh290633',
		//boardStartLocation: 'http://boards.fool.co.uk/high-yield-hyp-practical-51676.aspx?mid=11105157&sort=username', //valuemargin: lots of posts
		// boardStartLocation: 'http://boards.fool.co.uk/value-shares-50094.aspx?mid=10315139&sort=username', //valuemargin: less than one page of posts
		boardStartLocation: 'http://boards.fool.co.uk/bg-group-plc-bg-50206.aspx?mid=6396502&sort=username', //tjh290633: two pages of posts 
		boards: []
   };
  
	saySomething(something) {
		console.log(something);
	}

	handleClick(e) {
		this.saySomething("element clicked");
	}
	
	getListOfPostsAndDownload = (url) => {
		var self = this;
		
		xhr({
		  // valuemargin boards:
		  url: url
		}, function (err, data) {
		  // Messages in this table: tblMessagesAsp
		  var element = document.createElement('div');
		  element.insertAdjacentHTML('beforeend', data.body);
		  var tableOfPosts = element.querySelector('#tblMessagesAsp');
		  var nextLink = element.querySelector('.nextLink');
		  var boardName = element.querySelector('#breadcrumbWords2').innerText.replace('/', '').replace(/\u00a0/g, '');
		  
		  // Get the posts if the requested author is in the list of posts
		  if (tableOfPosts.innerText.includes(self.state.userName)) {
			  // Show table of posts
			  var content = document.querySelector('#contents');
			  content.insertAdjacentElement('beforeend', tableOfPosts);

			  // Get list of post links
			  var postLinks = [...document.querySelectorAll('a')].filter(x => x.href.includes('Message.aspx')).map(h => h.href.replace('localhost:3000', 'boards.fool.co.uk'));
			  
			  // Get contents of all posts on this page
			  postLinks.map(x => self.displayAndSavePostContent(boardName, x));
				
			  // Now load the next page of links and download after a 5 second delay to allow the file saving to catch up
			  setTimeout(() => {
				content.innerHTML = '';
				document.querySelector('#author').innerText = '';
				document.querySelector('#title').innerText = '';
				document.querySelector('#date').innerText = '';
				document.querySelector('#content').innerText = '';
				self.getListOfPostsAndDownload(nextLink.href.replace('localhost:3000', 'boards.fool.co.uk'));
			  }, 5000);
		  } else {
			content.innerHTML = '<h2>Finished downloading!</h2>';
		  }
		});
	}
	
  displayAndSavePostContent = (boardName, url) => {
	var self = this;

	xhr({
		// Use heroku app to get around CORS redirect restriction when TMF redirects this url - https://github.com/Rob--W/cors-anywhere/
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

		// Download post content if it's from the author we're looking for
		if (authorName.replace('Author: ', '') === self.state.userName) {
			// Display post content
			var content = post.querySelectorAll('#tableMsg .pbmsg')[0].innerText.trim();
			document.querySelector('#content').innerText = content;

			// Save file to downloads folder with an informative name
			var blob = new Blob([authorName, '\n', postTitle, '\n', postDate, '\n\n', content], {type: "text/plain;charset=utf-8"});
			file.saveAs(blob, `${boardName}-${authorName}-${postTitle}-${postDate}.txt`);
			
			// Clear fields
			// document.querySelector('#author').innerText = '';
			// document.querySelector('#title').innerText = '';
			// document.querySelector('#date').innerText = '';
			// document.querySelector('#content').innerText = '';
		}
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
	
	// Get user name and a starting point url for the download
	if (this.state.boardStartLocation === '') return;
	if (this.state.userName === '') return;
	
	// Validate that the starting point url is valid
	if (this.state.boardStartLocation.startsWith('http://boards.fool.co.uk/') === false) {
		window.alert('Link for board must start with "http://boards.fool.co.uk/"');
		return;
	}
	
	if (this.state.boardStartLocation.includes('mid=') === false) {
		window.alert('Link for board must contain a message ID');
		return;
	}

	if (this.state.boardStartLocation.endsWith('&sort=username') === false) {
		window.alert('Link for board must sort posts by username');
		return;
	}

	// Load posts and start the download process
	this.getListOfPostsAndDownload(this.state.boardStartLocation);

    // this.setState({
      // boards: ['http://boards.fool.co.uk/a-fool-and-his-money-51365.aspx?mid=6808140&sort=username']
    // });	
  }
  
  render() {
    return (
      <div>
		<div>
		<h1>Motley Fool Downloader</h1>
			<form onSubmit={this.fetchData}>
			  <label>I want to get the posts starting with this link
				<input 
					placeholder={"link to board"} 
					type="text" 
					size="75"
					value={this.state.boardStartLocation}
					onChange={this.changeStartLocation}
				/>
			  </label>
			  <label>for this user
				<input 
					placeholder={"user name"} 
					type="text" 
					size="30"
					value={this.state.userName}
					onChange={this.changeUserName}
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
