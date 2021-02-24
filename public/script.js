const socket = io('/');
const videoGrid = document.getElementById('video-grid');
var myStream;
const myPeer = new Peer(undefined,{
    host:'/',
    port:'3001'
})
var myId;

const myVideo = document.createElement('video');
myVideo.muted = true;
const peers = {}
const videos = []



socket.on('user-connected',userId=>{
    connectToNewUser(userId,myStream);
})

socket.on('user-disconnected',userId=>{
    console.log(`user ${userId} disconnected`);
   if(peers[userId]) {
    window.location.reload();   
    peers[userId].close()}
})

myPeer.on('call',call=>{
    call.answer(myStream);
    call.on('stream',remoteStream=>{
        console.log("stream has been sent from og")
        const video = document.createElement('video');
        addVideoStream(video,remoteStream);
    })
    console.log(`og id = ${call.metadata.id}`)
    peers[call.metadata.id] = call;
    

})


myPeer.on('connection',conn=>{
    console.log("conneciton established");
    
})
myPeer.on('open',async(id)=>{
    await openCamera();
    myId = id;
    socket.emit('join-room',ROOM_ID,id)
})

async function openCamera(){
    const stream =  await navigator.mediaDevices.getUserMedia({
        video:true,
        audio:true,
    });
    addVideoStream(myVideo,stream);
    myStream = stream;

}

function connectToNewUser(userId,stream){
    
    console.log("call user");
    console.log(userId);
    
    var conn = myPeer.connect(userId,);
    const call = myPeer.call(userId,stream,{
        metadata:{
            'id':myId
        }
    });
    
    
    const video = document.createElement('video');
    call.on('stream',userVideoStream=>{
        console.log("call was answered with stream")
        addVideoStream(video,userVideoStream);
    })
    call.on('close',()=>{
        video.remove();
    })
    if(!peers[userId])peers[userId] = call;
    
}

function addVideoStream(video,stream){
    video.srcObject = stream;
    video.addEventListener('loadedmetadata',()=>{
        video.play()
    });
    console.log(`a video has been added ${stream.id}`)
    if(!videos.includes(stream.id)) {
        videos.push(stream.id);
        videoGrid.append(video);}
}