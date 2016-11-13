import React, { Component } from 'react';
import './App.css';
import xhr from 'xhr';
import file from 'file-saver';
import JSZip from 'jszip';
import sanitize from 'sanitize-filename';

class App extends Component {
    state = {
		boardName: '',
		userName: '',
		boardStartLocation: '',
		boards: []
   };
	
	getListOfPostsAndDownload = (url, zip) => {
		const self = this;
		const deployLocation = 'localhost:3000'; // Local testing
		//const deployLocation = 'damiancannon.github.io'; // Production deployment
		
		document.querySelector('#contents').innerHTML = '<b>Loading list of posts...</b>';
		
		xhr({
		  url: url
		}, function (err, data) {
		  // Messages in this table: tblMessagesAsp
		  var element = document.createElement('div');
		  element.insertAdjacentHTML('beforeend', data.body);
		  var tableOfPosts = element.querySelector('#tblMessagesAsp');
		  var nextLink = element.querySelector('.nextLink');
		  var boardName = element.querySelector('#breadcrumbWords2').innerText.replace('/', '').replace(/\u00a0/g, '').trim().replace(/ +/g, ' ');
		  
		  // Get the posts if the requested author is in the list of posts
		  const content = document.querySelector('#contents');
		  if (tableOfPosts.innerText.includes(self.state.userName)) {
			  // Show table of posts
			  content.innerHTML = '';
			  content.insertAdjacentElement('beforeend', tableOfPosts);

			  // Get list of post links
			  var postLinks = [...document.querySelectorAll('a')].filter(x => x.href.includes('Message.aspx')).map(h => h.href.replace(deployLocation, 'boards.fool.co.uk'));
			  
			  // Get contents of all posts on this page
			  let isLastPostOnPage = false;
			  for (let i=0; i<postLinks.length; i++) {
				setTimeout(() => {
					console.log('doing item ' + i + ': ' + postLinks[i]);
					isLastPostOnPage = i === postLinks.length-1;
					self.displayAndSavePostContent(boardName, zip, postLinks[i], isLastPostOnPage);
					
					if (isLastPostOnPage === true) {
						setTimeout(() => {
						  // Now load the next page of links
						  content.innerHTML = '';
						  self.getListOfPostsAndDownload(nextLink.href.replace(deployLocation, 'boards.fool.co.uk'), zip);
						}, i*500 );				
					}
				}, i*500 );	
			  }
		  } else {
			  if (document.querySelector('#author').innerText.length === 0) {
				content.innerHTML = `<b>Author name ${self.state.userName} not found!</b>`;
			  }
		  }
		});
	}
	
  displayAndSavePostContent = (boardName, zip, url, isLastPostOnPage) => {
	const self = this;
	let stillProcessing = true;

	xhr({
		// Use heroku app to get around CORS redirect restriction when TMF redirects this url - https://github.com/Rob--W/cors-anywhere/
		url: 'https://cors-anywhere.herokuapp.com/' + url
	}, function (err, data) {
		// Get post html in a queryable state
		const post = document.createElement('div');
		post.insertAdjacentHTML('beforeend', data.body);

		// Display details of author, title and date for post
		const metaData = post.querySelectorAll('.messageMeta .pbnav');
		if (metaData.length > 0) {
			const authorName = metaData[0].innerText.trim().replace(/\t/g, '').replace('\n', '');
			const postNumber = metaData[1].querySelector('.tcforms').value;
			const postTitle = metaData[2].innerText.trim().replace(/\t/g, '').replace('\n', '').replace('–', '_');
			const postDate = metaData[3].innerText.trim().replace(/\t/g, '').replace('\n', '').replace('\n', ' ');
		
			// Download post content if it's from the author we're looking for
			if (authorName.replace('Author: ', '') === self.state.userName) {
				// Display details
				document.querySelector('#author').innerText = authorName;
				document.querySelector('#title').innerText = postTitle;
				document.querySelector('#date').innerText = postDate;

				// Display post content
				var content = post.querySelectorAll('#tableMsg .pbmsg')[0].innerText.trim();
				document.querySelector('#content').innerText = content;

				// Add post to zip archive
				const postContent = `${authorName}\n${postTitle}\n${postDate}\n\n${content}`;
				const fileName = sanitize(`${postNumber} ${postTitle.replace('Subject: ', '')} ${postDate.replace('Date: ', '')}.txt`);
				zip.file(fileName, postContent);
			} else {
				document.querySelector('#author').innerHTML = `<b>Last post reached for ${self.state.userName}</b>`;
				document.querySelector('#title').innerText = '';
				document.querySelector('#date').innerText = '';
				document.querySelector('#content').innerText = '';
				stillProcessing = false;
			}		
		}

		// Save zip archive locally if there are no more posts to download
		if (isLastPostOnPage === true && stillProcessing === false) {
			zip.generateAsync({type:"blob"})
			.then(function (blob) {
				const zipName = sanitize(`${boardName} ${self.state.userName}.zip`);
				file.saveAs(blob, zipName);
				
				document.querySelector('#contents').innerHTML = '<b>Download completed</b>';
			});
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
  
  polyfillsForIE = () => {
	if (!String.prototype.startsWith) {
	  String.prototype.startsWith = function(searchString, position) {
		position = position || 0;
		return this.indexOf(searchString, position) === position;
	  };
	}
	
	if (!String.prototype.includes) {
		String.prototype.includes = function() {
			return String.prototype.indexOf.apply(this, arguments) !== -1;
		};
	}	
	
	if (!String.prototype.endsWith) {
		String.prototype.endsWith = function(pattern) {
		  var d = this.length - pattern.length;
		  return d >= 0 && this.lastIndexOf(pattern) === d;
		};
	}
	
	if (!Array.from) {
	  Array.from = (function () {
		var toStr = Object.prototype.toString;
		var isCallable = function (fn) {
		  return typeof fn === 'function' || toStr.call(fn) === '[object Function]';
		};
		var toInteger = function (value) {
		  var number = Number(value);
		  if (isNaN(number)) { return 0; }
		  if (number === 0 || !isFinite(number)) { return number; }
		  return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
		};
		var maxSafeInteger = Math.pow(2, 53) - 1;
		var toLength = function (value) {
		  var len = toInteger(value);
		  return Math.min(Math.max(len, 0), maxSafeInteger);
		};

		// The length property of the from method is 1.
		return function from(arrayLike/*, mapFn, thisArg */) {
		  // 1. Let C be the this value.
		  var C = this;

		  // 2. Let items be ToObject(arrayLike).
		  var items = Object(arrayLike);

		  // 3. ReturnIfAbrupt(items).
		  if (arrayLike == null) {
			throw new TypeError("Array.from requires an array-like object - not null or undefined");
		  }

		  // 4. If mapfn is undefined, then let mapping be false.
		  var mapFn = arguments.length > 1 ? arguments[1] : void undefined;
		  var T;
		  if (typeof mapFn !== 'undefined') {
			// 5. else
			// 5. a If IsCallable(mapfn) is false, throw a TypeError exception.
			if (!isCallable(mapFn)) {
			  throw new TypeError('Array.from: when provided, the second argument must be a function');
			}

			// 5. b. If thisArg was supplied, let T be thisArg; else let T be undefined.
			if (arguments.length > 2) {
			  T = arguments[2];
			}
		  }

		  // 10. Let lenValue be Get(items, "length").
		  // 11. Let len be ToLength(lenValue).
		  var len = toLength(items.length);

		  // 13. If IsConstructor(C) is true, then
		  // 13. a. Let A be the result of calling the [[Construct]] internal method of C with an argument list containing the single item len.
		  // 14. a. Else, Let A be ArrayCreate(len).
		  var A = isCallable(C) ? Object(new C(len)) : new Array(len);

		  // 16. Let k be 0.
		  var k = 0;
		  // 17. Repeat, while k < len… (also steps a - h)
		  var kValue;
		  while (k < len) {
			kValue = items[k];
			if (mapFn) {
			  A[k] = typeof T === 'undefined' ? mapFn(kValue, k) : mapFn.call(T, kValue, k);
			} else {
			  A[k] = kValue;
			}
			k += 1;
		  }
		  // 18. Let putStatus be Put(A, "length", len, true).
		  A.length = len;
		  // 20. Return A.
		  return A;
		};
	  }());
	}	
  }
  
  fetchData = (evt) => {
    evt.preventDefault();
	this.polyfillsForIE();
	
	// Get user name and a starting point url for the download
	if (this.state.boardStartLocation === '') return;
	if (this.state.userName === '') return;

	// Use secure protocol so that proxy redirect works properly
	if (this.state.boardStartLocation.startsWith('http://boards.fool.co.uk/') === true) {
		const httpsLocation = this.state.boardStartLocation.replace('http://', 'https://');
		this.setState({
		  boardStartLocation: httpsLocation
		});
	}
	
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

	// Create a zip archive for the posts
	const zip = new JSZip();
	
	// Load posts and start the download process
	this.getListOfPostsAndDownload(this.state.boardStartLocation, zip);
	
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
			<h4>1 - Add the author as a Favourite Fool (see <a href="http://boards.fool.co.uk/FavoriteFools.asp">http://boards.fool.co.uk/FavoriteFools.asp</a>) and then select the board that you're interested in >> the link you've just selected is then your starting point</h4>
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
								placeholder={"enter link to board here"} 
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
							<button>Click here to download posts</button>
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
