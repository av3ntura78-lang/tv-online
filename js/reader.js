	var xmlepg=new XMLEPG();
	var overlay=document.getElementById('overlay');
	var videoContainer=document.getElementById('video-container');
	var epgContainer=document.getElementById('epg-container');
	hideOverlayTimeout=null;
	overlay.addEventListener('mouseenter',()=>{
		if(hideOverlayTimeout){
		clearTimeout(hideOverlayTimeout)
		}
	overlay.style.display='flex';videoContainer.style.display='none'});
	overlay.addEventListener('mouseleave',()=>{overlay.style.display='none';
	videoContainer.style.display='flex'});
	document.addEventListener('DOMContentLoaded',()=>{const videoElement=document.getElementById('video');
	const videoList=document.getElementById('video-list');
	const searchInput=document.getElementById('search-input');
	const urlInput=document.getElementById('url-input');
	const fetchButton=document.getElementById('fetch-button');
	const fileInput=document.getElementById('file-input');
	const uploadButton=document.getElementById('upload-button');
	let selectedFileContent=null;
	var player=new shaka.Player(videoElement);
	var channels;
	var lastActiveChannel;
	shaka.polyfill.installAll();
	var extracted=extractAppendedURL();
	if(extracted){document.getElementById('upload-button').remove();
	document.getElementById('url-input').remove();
	document.getElementById('fetch-button').remove();
	setPlaylistFromUrl(extracted)}
	fetchButton.addEventListener('click',async()=>{const url=urlInput.value;
	if(selectedFileContent){setPlaylistFromFile(selectedFileContent)
	}else 
	if(url){setPlaylistFromUrl(url)}});
	fileInput.addEventListener('change',(event)=>{const file=event.target.files[0];
	if(file){urlInput.value=file.name;
	const reader=new FileReader();
	reader.onload=(e)=>{selectedFileContent=e.target.result};
	reader.readAsText(file)}});
	async function setPlaylistFromUrl(url){try{const response=await fetch(url);
	if(response.ok){const text=await response.text();
	parseAndSetPlaylist(text)}
	else
	{console.error('Failed to fetch M3U8 playlist.')}}
	catch(error){console.error('Error fetching M3U8 playlist:',error)}}
async function setPlaylistFromFile(content){parseAndSetPlaylist(content)}
async function parseAndSetPlaylist(content){const m3u8Interpreter=new M3U8Interpreter(content);m3u8Interpreter.parse();channels=m3u8Interpreter.getChannels();const urls=m3u8Interpreter.getUrlTvg();xmlepg.setPlaylistChannels(channels);xmlepg.load(urls).then(()=>{xmlepg.displayAllPrograms('epg-container','xmlepg')});if(urls!=null&&urls.length!==0){document.getElementById('epg-button').style.display='block'}
updatePlaylist(channels);document.getElementById('search-input').style.display='block'}
function extractAppendedURL(){const params=new URLSearchParams(window.location.search);return params.get('file')}
window.loadVideo=function(manifestUrl,licenseKey){if(licenseKey!=null&&!Array.isArray(licenseKey)){licenseKey=JSON.parse(decodeURIComponent(licenseKey))}
if(licenseKey){licenseKey.forEach(pair=>{player.configure({drm:{clearKeys:{[pair.keyId]:pair.key}}})})}
player.load(manifestUrl);videoElement.play()}
function updatePlaylist(channels){videoList.innerHTML='';channels.forEach(channel=>{const listItem=document.createElement('li');listItem.innerHTML=`
										<img src="${channel.tvgLogo}" alt="${channel.channelName} logo">${channel.channelName}
										</span>`;const imgElement=listItem.querySelector('img');imgElement.onmouseenter=()=>{xmlepg.displayPrograms('overlay',channel.tvgId);overlay.style.display='flex';videoContainer.style.display='none';if(hideOverlayTimeout){clearTimeout(hideOverlayTimeout)}};imgElement.onmouseleave=()=>{hideOverlayTimeout=setTimeout(()=>{overlay.style.display='none';videoContainer.style.display='flex'},100)};listItem.onclick=()=>{loadVideo(channel.manifestUrl,channel.licenseKey);const parent=listItem.parentElement;const children=parent.getElementsByTagName('li');for(let i=0;i<children.length;i++){children[i].classList.remove('active')}
listItem.classList.add('active');lastActiveChannel=listItem.innerHTML}
videoList.appendChild(listItem)})}
function filterPlaylist(searchTerm){const filteredChannels=channels.filter(channel=>channel.channelName.toLowerCase().includes(searchTerm.toLowerCase()));updatePlaylist(filteredChannels)}
searchInput.addEventListener('input',(event)=>{const searchTerm=event.target.value;filterPlaylist(searchTerm)})});function openEPG(){epgContainer.style.display='block';xmlepg.timelineNeedleRender()}
function showToast(message){const style=document.createElement('style');style.innerHTML=`
.toast-container{position:absolute;top:20px;right:20px;z-index:9999}.toast{background-color:#333;color:#fff;padding:10px 20px;border-radius:5px;margin-bottom:10px;font-size:16px;box-shadow:0 4px 6px rgb(0 0 0 / .1);opacity:0;animation:fadeIn 0.5s forwards,fadeOut 3s forwards 2s}@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes fadeOut{from{opacity:1}to{opacity:0}}
		  `;document.head.appendChild(style);const toast=document.createElement('div');toast.classList.add('toast');toast.textContent=message;const toastContainer=document.querySelector('.toast-container');if(!toastContainer){const newContainer=document.createElement('div');newContainer.classList.add('toast-container');document.body.appendChild(newContainer)}
document.querySelector('.toast-container').appendChild(toast);setTimeout(()=>{toast.remove()},4000)
	}
	
	function copyToClipboard(text,name){
		text=decodeURIComponent(text);
		navigator.clipboard.writeText(text.replace(/x123x/g,"'")).then(()=>{
		showToast(name+' command successfully copied to clipboard')}).catch(err=>
	{
		showToast('Failed to copy '+name+' download command: ',err)
	}
	)
	}
