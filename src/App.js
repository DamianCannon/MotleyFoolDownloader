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
	  var postLinks = [...document.querySelectorAll('a')].filter(x => x.href.includes('Message.aspx')).map(h => h.href.replace('localhost:3000', 'boards.fool.co.uk'));
	  console.log(postLinks);
	  
	  // Get contents of first post
	  xhr({
		// valuemargin boards:
		// Use heroku app to get around CORS redirect restriction when TMF redirects this url
		// https://github.com/Rob--W/cors-anywhere/
		url: 'https://cors-anywhere.herokuapp.com/' + postLinks[0],
		dataType: 'jsonp'
		}, function (err, data) {
			var post = document.createElement('div');
			post.insertAdjacentHTML('beforeend', data.body);

			// metadata for post: document.querySelectorAll('.messageMeta .pbnav')
			// author: document.querySelectorAll('.messageMeta .pbnav')[0].innerText
			// title: document.querySelectorAll('.messageMeta .pbnav')[2].innerText
			// date: document.querySelectorAll('.messageMeta .pbnav')[3].innerText
			// content: document.querySelectorAll('#tableMsg .pbmsg')[0].innerText
			var metaData = post.querySelectorAll('.messageMeta .pbnav');
			document.querySelector('#author').innerText = metaData[0].innerText;
			document.querySelector('#title').innerText = metaData[2].innerText;
			document.querySelector('#date').innerText = metaData[3].innerText;
			
			var content = post.querySelectorAll('#tableMsg .pbmsg');
			document.querySelector('#content').innerText = content[0].innerText;
		
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
				<input placeholder={"link to board"} type="text" />
			  </label>
			  <label>for this user
				<input placeholder={"user name"} type="text" />
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
