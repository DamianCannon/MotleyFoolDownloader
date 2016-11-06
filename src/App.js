import React, { Component } from 'react';
import './App.css';
import xhr from 'xhr';
import file from 'file-saver';

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
	  var postLinks = [...document.querySelectorAll('a')].filter(x => x.href.includes('Message.aspx')).map(h => h.href.replace('localhost:3000', 'boards.fool.co.uk'));
	  
	  // Get contents of all posts on this page
	  // postLinks.map(x => console.log(x));
	  
	  // Get contents of first post
	  xhr({
		// valuemargin boards:
		// Use heroku app to get around CORS redirect restriction when TMF redirects this url
		// https://github.com/Rob--W/cors-anywhere/
		url: 'https://cors-anywhere.herokuapp.com/' + postLinks[0]
		}, function (err, data) {
			var post = document.createElement('div');
			post.insertAdjacentHTML('beforeend', data.body);

			// metadata for post: document.querySelectorAll('.messageMeta .pbnav')
			// author: document.querySelectorAll('.messageMeta .pbnav')[0].innerText
			// title: document.querySelectorAll('.messageMeta .pbnav')[2].innerText
			// date: document.querySelectorAll('.messageMeta .pbnav')[3].innerText
			// content: document.querySelectorAll('#tableMsg .pbmsg')[0].innerText
			var metaData = post.querySelectorAll('.messageMeta .pbnav');
			var authorName = metaData[0].innerText.trim().replace(/\t/g, '').replace('\n', '');
			var postTitle = metaData[2].innerText.trim().replace(/\t/g, '').replace('\n', '');
			var postDate = metaData[3].innerText.trim().replace(/\t/g, '').replace('\n', '').replace('\n', ' ');
			
			document.querySelector('#author').innerText = authorName;
			document.querySelector('#title').innerText = postTitle;
			document.querySelector('#date').innerText = postDate;
			
			var content = post.querySelectorAll('#tableMsg .pbmsg')[0].innerText.trim();
			document.querySelector('#content').innerText = content;
		
			var blob = new Blob([authorName, '\n', postTitle, '\n', postDate, '\n\n', content], {type: "text/plain;charset=utf-8"});
			file.saveAs(blob, `${authorName}-${postTitle}-${postDate}.txt`);
		});
		
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
				<input placeholder={"board name"} type="text" />
			  </label>
			  <label>for this user
				<input placeholder={"user name"} type="text" />
			  </label>
			  <label>starting with this link
				<input placeholder={"link to board"} type="text" />
			  </label>
			  <button>Get data</button>
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
