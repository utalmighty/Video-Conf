constraints = {
    //audio: {echoCancellation: true},
    video: {
        width:{
            min: 320,
            ideal: 640,
            max: 1280
        },
        height:{
            min: 240,
            ideal: 480,
            max: 720
        },
        frameRate:{min: 2, ideal:10, max:15}
    }
};

whom='';
quality=4; // lower is better
fpstosend = 10;
socket=io.connect();//default domain
privatedomain = location.protocol+'//'+document.domain+':'+location.port+'/private';
videodomain = location.protocol+'//'+document.domain+':'+location.port+'/video';
flashdomain = location.protocol+'//'+document.domain+':'+location.port+'/flash';
socket_private = io(privatedomain);
socket_video = io(videodomain);
socket_flash = io(flashdomain);
getConnectedDevices('videoinput', cameras => console.log('Cameras found', cameras)); //Promise
webcam();


// Refer WebRTC
function getConnectedDevices(type, callback) { /// to check for media Devices
    navigator.mediaDevices.enumerateDevices()
        .then(devices => {
            const filtered = devices.filter(device => device.kind === type);
            callback(filtered);
        });
}

socket_flash.on('flashing', function(mess){
    setTimeout(alert(mess['message']), 3000);
})

function webcam(){
    if(navigator.mediaDevices.getUserMedia){ // checks up for supported browser
        navigator.mediaDevices.getUserMedia(constraints) // accessing user webcam, mic.
        .then(function (stream){ // if user gives the permission
                drawincanvas(stream)
            })
        .catch(error => {
            console.error('Something not right.', error)
        });
    }
}

socket_private.on('Credentials', function(who){
    whom = who;
})


function sendcred(){
    username = document.getElementById('usernameid').value;
    password = document.getElementById('passwordid').value;
    socket_private.emit('Credentials', {'creator':true, 'username': username, 'password':password});
}

function sendjoin(){
    username = document.getElementById('joinusernameid').value;
    password = document.getElementById('joinpasswordid').value;
    socket_private.emit('Credentials', {'creator':false, 'username': username, 'password':password});
}

function drawincanvas(stream){
    const video = document.getElementById('webcam');
    video.srcObject = stream;
    const canvas = document.getElementById('canvasid');
    canvasWidth = canvas.width;
    canvasHeight = canvas.height;
    context = canvas.getContext('2d');
    (function loop(){
        context.drawImage(video, 0, 0, canvasWidth, canvasHeight);
        if (whom != ''){
        socket_video.emit('videofromjs' , {'to': whom, 'img':canvas.toDataURL('image/jpeg',quality)});
        // gone to another line.
        }
        setTimeout(loop, 1000/fpstosend);
    })();

}
const othercan = document.getElementById('otherperson');
socket_video.on('videofromflask', function(imgg){
    const ima = document.getElementById('image');
    ima.src = imgg;
    oh = ima.height;
    ow = ima.width;
    var ctx2 = othercan.getContext('2d');
    ctx2.drawImage(ima,0,0,ow, oh);
});