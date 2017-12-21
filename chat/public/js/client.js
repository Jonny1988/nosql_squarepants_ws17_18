$(function() {
	var $channels = $('#channels');
	var $textArea = $('.main-area .text-area');
	
	var socket = io('');
	var currentChannel = "";
	
	socket.on('connected', function(nothing) {
		console.log("connected");
		connectToChannel("Default");
		//connectToChannel("General");
		openChannel("Default");
		socket.on('channel', function(info) {
			console.log("incoming stuff", info.name);
			$channels[info.name].append('<div class="user-name">'+info.msg.user+'</div><div class="content">'+info.msg.message+'</div>');
		});
    });
	
	function connectToChannel(channelName) {
		socket.emit('listen', channelName);
		var $channel = $('<div>');
		$channels.append($channel);
		$channels[channelName] = $channel;
	}
	
	function openChannel(channelName) {
		$channels.append($textArea.children());
		$textArea.append($channels[channelName]);
		currentChannel = channelName;
	}
	
	socket.on('disconnect', function() {
		location.reload();
	});
	
	$('#sendMessage').click(function() {
		var msg = $('input[name="message"]').val();
		socket.emit("chat", { name: currentChannel, message : msg });
	});
});