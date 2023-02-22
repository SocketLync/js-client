import Channel from './Channel';

class PrivateChannel extends Channel {
	async subscribe() {
		this.socketLync.subscribe(this.name, true);
	}

	whisper() {
		// TODO implement

		console.warn('This method is not yet implemented.');
		return this;
	}
}

export default PrivateChannel;