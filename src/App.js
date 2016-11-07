import React, { Component } from 'react';
import './App.css';
import xhr from 'xhr';
import file from 'file-saver';

class App extends Component {
    state = {
		boardName: '',
		userName: '',
		boardStartLocation: '',
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
			  var postLinks = [...document.querySelectorAll('a')].filter(x => x.href.includes('Message.aspx')).map(h => h.href.replace('damiancannon.github.io', 'boards.fool.co.uk'));
			  
			  // Get contents of all posts on this page
			  postLinks.map(x => self.displayAndSavePostContent(boardName, x));
				
			  // Now load the next page of links and download after a 5 second delay to allow the file saving to catch up
			  setTimeout(() => {
				content.innerHTML = '';
				document.querySelector('#author').innerText = '';
				document.querySelector('#title').innerText = '';
				document.querySelector('#date').innerText = '';
				document.querySelector('#content').innerText = '';
				self.getListOfPostsAndDownload(nextLink.href.replace('damiancannon.github.io', 'boards.fool.co.uk'));
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
		var postTitle = metaData[2].innerText.trim().replace(/\t/g, '').replace('\n', '').replace('–', '_');
		var postDate = metaData[3].innerText.trim().replace(/\t/g, '').replace('\n', '').replace('\n', ' ');

		// Download post content if it's from the author we're looking for
		if (authorName.replace('Author: ', '') === self.state.userName) {
			// Display details
			document.querySelector('#author').innerText = authorName;
			document.querySelector('#title').innerText = postTitle;
			document.querySelector('#date').innerText = postDate;

			// Display post content
			var content = post.querySelectorAll('#tableMsg .pbmsg')[0].innerText.trim();
			document.querySelector('#content').innerText = content;

			// Save file to downloads folder with an informative name
			var blob = new Blob([authorName, '\n', postTitle, '\n', postDate, '\n\n', content], {type: "text/plain;charset=utf-8"});
			file.saveAs(blob, `${boardName}_${authorName}_${postTitle}_${postDate}.txt`);
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
	if (this.state.boardStartLocation.startsWith('https://boards.fool.co.uk/') === false) {
		window.alert('Link for board must start with "https://boards.fool.co.uk/"');
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

	// Clear post fields
	document.querySelector('#contents').innerHTML = '';
	document.querySelector('#author').innerText = '';
	document.querySelector('#title').innerText = '';
	document.querySelector('#date').innerText = '';
	document.querySelector('#content').innerText = '';
	
	// Load posts and start the download process
	this.getListOfPostsAndDownload(this.state.boardStartLocation);

    // this.setState({
      // boards: ['http://boards.fool.co.uk/a-fool-and-his-money-51365.aspx?mid=6808140&sort=username']
    // });	
  }
  
  render() {
    return (
      <div className="page-wrap">
		<div className="input-fields">
			<h1>Motley Fool Post Downloader</h1>
			<h4>This tool is designed to provide a way for registered users of the <a href="http://www.fool.co.uk/">Motley Fool UK</a> website to download and archive posts that they have made to the <a href="http://boards.fool.co.uk/index.aspx">discussion boards</a>. In order to use the tool you need to provide a link to the board that you're interested in with posts ordered by username. If the author name provided is found in this list then the tool will download posts from this author and continue until reaching the next author. The ways to do this from easiest to hardest are:</h4>
			<h4>1 - Add the author as a Favourite Fool (see <a href="https://boards.fool.co.uk/FavoriteFools.asp">http://boards.fool.co.uk/FavoriteFools.asp</a>) and then select the board that you're interested in >> the link you've just selected is then your starting point</h4>
			<h4>2 - Open the board that you're interested in and locate a post by the author. Then click on the board name to open the posts view, click on "Author" to sort by author name and click "Prev" until you get to the first page which includes a post by the author >> the current link is then your starting point</h4>
			<h4>3 - Open the board that you're interested in and locate a post by someone with a name similar to the author that you want. Then click on the board name to open the posts view, click on "Author" to sort by author name and click "Prev" until you get to the first page which includes a post by the author >> the current link is then your starting point</h4>
			<form onSubmit={this.fetchData}>
				<table>
					<tr>
						<td>
						I want to get posts 
						</td>
						<td>
						</td>
						<td>
						</td>
					</tr>
					<tr>
						<td>
							starting with this link:
						</td>
						<td>
							<input 
								placeholder={"enter https link to board here"} 
								type="text" 
								size="100"
								value={this.state.boardStartLocation}
								onChange={this.changeStartLocation}
							/>
						</td>
						<td>
							(e.g. https://boards.fool.co.uk/financial-software-50080.aspx?mid=13107564&sort=username)
						</td>
					</tr>
					<tr>
						<td>
						  for this author:
						</td>
						<td>
							<input 
								placeholder={"enter author name here"} 
								type="text" 
								size="100"
								value={this.state.userName}
								onChange={this.changeUserName}
							/>
						</td>
						<td>
							(e.g. RandomAmbler)
						</td>
					</tr>
					<tr>
						<td>
						</td>
						<td>
							<button onClick={this.handleClick.bind(this)}>Click here to download posts</button>
						</td>
						<td>
						</td>
					</tr>
				</table>
			</form>		
		</div>
		<div className="content-wrap">
			<div className="posts-table" id="contents"></div>
			<div className="post-data" id="post">
				<div className="post-label">
					<label id="author"></label>
				</div>
				<div className="post-label">
					<label id="title"></label>
				</div>
				<div className="post-label">
					<label id="date"></label>
				</div>
				<div className="post-label post-content">
					<label id="content"></label>
				</div>
			</div>
		</div>
      </div>
    );
  }
}

export default App;
