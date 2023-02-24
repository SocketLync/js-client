import Channel from './Channel';

class PrivateChannel extends Channel {
	async subscribe() {
		this.socketLync.subscribe(this.name, true);
	}

	whisper(event, data = {}) {
		this.socketLync.socket.emit('push:message', {
			channel: this.name,
			event: `client-${event}`,
			data,
		});

		return this;
	}

	listenForWhisper(event, callback) {
		this.on(`event:client-${event}`, callback);

		return this;
	}
}

export default PrivateChannel;